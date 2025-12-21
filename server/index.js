
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { YoutubeTranscript } from 'youtube-transcript';
import multer from 'multer';
import fs from 'fs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Garantir que a pasta de uploads existe
if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use(express.static(DIST_DIR));
app.use('/uploads', express.static(UPLOADS_DIR));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Configuração do Multer para Uploads
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
    return transcriptItems
        .filter(item => {
            const itemStart = item.offset / 1000;
            const itemEnd = (item.offset + item.duration) / 1000;
            return (itemStart >= startTime && itemStart <= endTime) || 
                   (itemEnd >= startTime && itemEnd <= endTime);
        })
        .flatMap(item => {
            const words = item.text.split(/\s+/).filter(w => w.length > 0);
            const durationPerWord = (item.duration / 1000) / words.length;
            const offsetSec = item.offset / 1000;
            return words.map((word, index) => ({
                word: word.trim(),
                start: offsetSec + (index * durationPerWord),
                end: offsetSec + ((index + 1) * durationPerWord)
            }));
        });
};

/**
 * Endpoint para Download Forçado (Local)
 */
app.get('/api/download-local/:filename', (req, res) => {
    const filePath = path.join(UPLOADS_DIR, req.params.filename);
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ error: "Arquivo não encontrado." });
    }
});

app.post('/api/upload', upload.single('video'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

    try {
        const prompt = `Analise este arquivo de vídeo: ${req.file.originalname}. Identifique 3 trechos virais de 30-60 segundos. Retorne JSON: Array<{title: string, viralScore: number, startTime: number, endTime: number}>`;
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            viralScore: { type: Type.NUMBER },
                            startTime: { type: Type.NUMBER },
                            endTime: { type: Type.NUMBER }
                        },
                        required: ["title", "viralScore", "startTime", "endTime"]
                    }
                }
            }
        });

        const timeSlots = JSON.parse(response.text || "[]");
        const clips = timeSlots.map(slot => ({
            ...slot,
            videoId: "local",
            videoUrl: `/uploads/${req.file.filename}`,
            isLocal: true,
            transcriptSnippet: "Vídeo enviado via upload local."
        }));

        res.json(clips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/process-video', async (req, res) => {
    const { url } = req.body;
    const videoId = getYoutubeId(url);
    if (!videoId) return res.status(400).json({ error: 'URL do YouTube inválida.' });

    try {
        let transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' })
            .catch(() => YoutubeTranscript.fetchTranscript(videoId));

        const fullTranscriptText = transcript.map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analise os tempos para cortes virais: ${fullTranscriptText.substring(0, 15000)}. Retorne JSON: Array<{title: string, viralScore: number, startTime: number, endTime: number}>`,
            config: { responseMimeType: "application/json" }
        });

        const timeSlots = JSON.parse(response.text || "[]");
        const enrichedClips = timeSlots.map(slot => {
            const literalCaptions = getLiteralCaptions(transcript, slot.startTime, slot.endTime);
            return {
                ...slot,
                videoId: videoId,
                transcriptSnippet: literalCaptions.map(c => c.word).join(' '),
                captions: literalCaptions
            };
        });

        res.json(enrichedClips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Corte+ Server na porta ${PORT}`));
