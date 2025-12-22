
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

const getLiteralCaptions = (transcriptItems, startTime, endTime) => {
    if (!transcriptItems || transcriptItems.length === 0) return [];
    
    const isMS = transcriptItems.some(i => i.offset > 1500);
    const divider = isMS ? 1000 : 1;

    return transcriptItems
        .filter(item => {
            const s = item.offset / divider;
            const e = (item.offset + item.duration) / divider;
            return (s <= endTime + 0.5 && e >= startTime - 0.5);
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
                if (wordEnd >= startTime && wordStart <= endTime) {
                    return { word: word.trim(), start: wordStart, end: wordEnd };
                }
                return null;
            }).filter(w => w !== null);
        });
};

/**
 * DOWNLOAD MP4 CORRETO
 * Força o cabeçalho de download antes de iniciar o pipe do stream
 */
app.get('/api/download-youtube', async (req, res) => {
    const { v, title } = req.query;
    if (!v) return res.status(400).send('ID do vídeo ausente');
    
    const videoTitle = title ? String(title) : 'corte_viral';
    const filename = `${videoTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp4`;

    try {
        // Importante: Definir cabeçalhos ANTES do pipe para o navegador saber que é um arquivo
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'video/mp4');

        const stream = ytdl(`https://www.youtube.com/watch?v=${v}`, {
            quality: 'highestvideo',
            filter: 'audioandvideo'
        });

        stream.on('error', (err) => {
            console.error('Stream Error:', err);
            if (!res.headersSent) res.status(500).send('Erro ao baixar vídeo do YouTube.');
        });

        stream.pipe(res);
    } catch (err) {
        console.error('Download Route Error:', err);
        if (!res.headersSent) res.status(500).send("Erro interno no processador de download.");
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
            return res.status(422).json({ error: "Legendas não disponíveis para este vídeo." });
        }

        const transcriptText = transcript.map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analise para 3 cortes virais (30-60s) baseando-se RIGOROSAMENTE nos tempos da transcrição. JSON Array: {title, viralScore, startTime, endTime}. Transcrição: ${transcriptText.substring(0, 15000)}`,
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
                videoId, 
                captions, 
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
