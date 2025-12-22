
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

const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * MOTOR DE LEGENDAS ULTRA-PRECISO
 * Normaliza tempos e distribui palavras proporcionalmente ao áudio
 */
const getLiteralCaptions = (transcriptItems, startTime, endTime) => {
    if (!transcriptItems || transcriptItems.length === 0) return [];
    
    // Detecta se o YouTube enviou em ms (12000) ou s (12.0)
    const isMS = transcriptItems.some(i => i.offset > 1000);
    const divider = isMS ? 1000 : 1;

    return transcriptItems
        .filter(item => {
            const s = item.offset / divider;
            const e = (item.offset + item.duration) / divider;
            // Captura blocos que intersectam o tempo do clipe (margem de 1s)
            return (s <= endTime + 1 && e >= startTime - 1);
        })
        .flatMap(item => {
            const cleanText = item.text
                .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
                .replace(/\[.*?\]/g, '').trim();

            const words = cleanText.split(/\s+/).filter(w => w.length > 0);
            if (words.length === 0) return [];
            
            const durationSec = item.duration / divider;
            const offsetSec = item.offset / divider;
            const durationPerWord = durationSec / words.length;
            
            return words.map((word, index) => {
                const wordStart = offsetSec + (index * durationPerWord);
                const wordEnd = offsetSec + ((index + 1) * durationPerWord);
                
                // Filtra apenas palavras que pertencem ao intervalo do corte
                if (wordEnd >= startTime && wordStart <= endTime) {
                    return { word: word.trim(), start: wordStart, end: wordEnd };
                }
                return null;
            }).filter(w => w !== null);
        });
};

/**
 * DOWNLOAD MP4 REAL (Sem scripts)
 */
app.get('/api/download-youtube', async (req, res) => {
    const { v, title } = req.query;
    if (!v) return res.status(400).send('Video ID missing');
    
    const filename = `${(title || 'corte_viral').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;
    res.header('Content-Disposition', `attachment; filename="${filename}"`);
    
    try {
        ytdl(`https://www.youtube.com/watch?v=${v}`, {
            quality: 'highestvideo',
            filter: 'audioandvideo'
        }).pipe(res);
    } catch (err) {
        console.error("Erro no download:", err);
        res.status(500).send("Erro ao processar download MP4.");
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
            return res.status(422).json({ error: "Este vídeo não possui legendas." });
        }

        const transcriptText = transcript.map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Aja como um editor de Shorts. Identifique 3 ganchos virais (30-60s) usando estritamente os tempos da transcrição. 
            Transcrição: ${transcriptText.substring(0, 20000)}
            Retorne JSON Array: {title: string, viralScore: number, startTime: number, endTime: number}`,
            config: { responseMimeType: "application/json" }
        });

        const timeSlots = JSON.parse(response.text || "[]");
        const clips = timeSlots.map(slot => {
            let s = Math.max(0, slot.startTime);
            let e = slot.endTime;
            if (s > e) [s, e] = [e, s];
            
            const captions = getLiteralCaptions(transcript, s, e);
            
            return {
                ...slot,
                startTime: s,
                endTime: e,
                videoId: videoId,
                transcriptSnippet: captions.map(c => c.word).join(' '),
                captions: captions,
                videoUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            };
        });

        res.json(clips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
app.listen(PORT, () => console.log(`🚀 Corte+ Server ativo na porta ${PORT}`));
