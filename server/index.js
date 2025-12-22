
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { YoutubeTranscript } from 'youtube-transcript';
import multer from 'multer';
import fs from 'fs';
import ytdl from '@distube/ytdl-core';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(DIST_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ 
    storage,
    limits: { fileSize: 100 * 1024 * 1024 } 
});

const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const getLiteralCaptions = (transcriptItems, startTime, endTime) => {
    if (!transcriptItems || transcriptItems.length === 0) return [];
    
    // Heurística de tempo: alguns vídeos retornam ms (ex: 12000), outros s (ex: 12.0)
    const isMS = transcriptItems[0].offset > 2000 || transcriptItems.some(i => i.duration > 100);
    const divider = isMS ? 1000 : 1;

    return transcriptItems
        .filter(item => {
            const itemStart = item.offset / divider;
            const itemEnd = (item.offset + item.duration) / divider;
            return (itemStart <= endTime + 1 && itemEnd >= startTime - 1);
        })
        .flatMap(item => {
            // Limpa entidades HTML como &#39; e &quot;
            const cleanText = item.text.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
            const words = cleanText.split(/\s+/).filter(w => w.length > 0);
            if (words.length === 0) return [];
            
            const durationSec = item.duration / divider;
            const offsetSec = item.offset / divider;
            const durationPerWord = durationSec / words.length;
            
            return words.map((word, index) => {
                const wordStart = offsetSec + (index * durationPerWord);
                const wordEnd = offsetSec + ((index + 1) * durationPerWord);
                
                if (wordStart >= startTime - 0.3 && wordStart <= endTime + 0.3) {
                    return {
                        word: word.trim(),
                        start: wordStart,
                        end: wordEnd
                    };
                }
                return null;
            }).filter(w => w !== null);
        });
};

app.get('/api/download-youtube', async (req, res) => {
    const { v, title } = req.query;
    if (!v) return res.status(400).send('Video ID missing');
    
    const videoUrl = `https://www.youtube.com/watch?v=${v}`;
    const filename = `${(title || 'video_corte').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    
    try {
        ytdl(videoUrl, {
            format: 'mp4',
            quality: 'highestvideo'
        }).pipe(res);
    } catch (err) {
        console.error("Erro no download:", err);
        res.status(500).send("Erro ao processar download.");
    }
});

app.get('/api/download-local/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: "Arquivo não encontrado." });
    }
});

app.post('/api/process-video', async (req, res) => {
    const { url } = req.body;
    const videoId = getYoutubeId(url);
    if (!videoId) return res.status(400).json({ error: 'URL inválida.' });

    try {
        let transcript;
        try {
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' })
                .catch(() => YoutubeTranscript.fetchTranscript(videoId));
        } catch (e) {
            return res.status(422).json({ error: "Este vídeo não possui legendas disponíveis." });
        }

        const transcriptText = transcript.map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Aja como um editor viral. Identifique 3 momentos de alto impacto (30-60s) baseando-se RIGOROSAMENTE nos tempos da transcrição abaixo.
            
            Transcrição: ${transcriptText.substring(0, 25000)}

            Retorne apenas um JSON Array: Array<{title: string, viralScore: number, startTime: number, endTime: number}>`,
            config: { responseMimeType: "application/json" }
        });

        const timeSlots = JSON.parse(response.text || "[]");
        const enrichedClips = timeSlots.map(slot => {
            let s = Math.max(0, slot.startTime);
            let e = slot.endTime;
            if (s > e) { [s, e] = [e, s]; }

            const literalCaptions = getLiteralCaptions(transcript, s, e);
            
            return {
                ...slot,
                startTime: s,
                endTime: e,
                videoId: videoId,
                transcriptSnippet: literalCaptions.map(c => c.word).join(' '),
                captions: literalCaptions,
                videoUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            };
        });

        res.json(enrichedClips);
    } catch (error) {
        console.error("[Backend Error]", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Corte+ Server ativo na porta ${PORT}`));
