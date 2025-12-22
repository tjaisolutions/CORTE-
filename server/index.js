
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

/**
 * EXTRAÇÃO DE LEGENDAS DE ALTA FIDELIDADE:
 * Agora com maior tolerância nos limites de tempo para evitar perda de palavras iniciais/finais.
 */
const getLiteralCaptions = (transcriptItems, startTime, endTime) => {
    if (!transcriptItems || transcriptItems.length === 0) return [];
    
    return transcriptItems
        .filter(item => {
            const itemStart = item.offset / 1000;
            const itemEnd = (item.offset + item.duration) / 1000;
            // Janela de segurança de 2 segundos para não perder contexto
            return (itemStart >= startTime - 2 && itemStart <= endTime + 2) || 
                   (itemEnd >= startTime - 2 && itemEnd <= endTime + 2);
        })
        .flatMap(item => {
            const words = item.text.split(/\s+/).filter(w => w.length > 0);
            if (words.length === 0) return [];
            
            const durationPerWord = (item.duration / 1000) / words.length;
            const offsetSec = item.offset / 1000;
            
            return words.map((word, index) => {
                const wordStart = offsetSec + (index * durationPerWord);
                const wordEnd = offsetSec + ((index + 1) * durationPerWord);
                
                // Inclui a palavra se ela estiver minimamente dentro do range
                // Adicionamos uma pequena folga de 0.2s para garantir sincronia
                if (wordStart >= startTime - 0.2 && wordStart <= endTime + 0.2) {
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
            config: { responseMimeType: "application/json" }
        });

        const timeSlots = JSON.parse(response.text || "[]");
        const clips = timeSlots.map(slot => ({
            ...slot,
            videoId: "local",
            videoUrl: `/uploads/${req.file.filename}`,
            isLocal: true,
            transcriptSnippet: "Vídeo enviado via upload local.",
            captions: [] 
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
        console.log(`[Backend] Buscando transcrição para: ${videoId}`);
        
        let transcript;
        try {
            // Tenta Português primeiro, depois cai para o padrão (Inglês ou original)
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' })
                .catch(() => YoutubeTranscript.fetchTranscript(videoId));
        } catch (e) {
            console.warn(`[Backend] Falha ao obter transcrição para ${videoId}:`, e.message);
            return res.status(422).json({ error: "Este vídeo não possui transcrição disponível." });
        }

        const transcriptText = transcript.map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Você é um editor viral profissional. Analise a transcrição abaixo e identifique os 3 momentos mais impactantes (30-60 segundos cada).
            
            IMPORTANTE: Respeite rigorosamente os marcadores de tempo da transcrição.
            
            Transcrição: ${transcriptText.substring(0, 25000)}

            Retorne APENAS um JSON Array:
            Array<{title: string, viralScore: number, startTime: number, endTime: number}>`,
            config: { responseMimeType: "application/json" }
        });

        const timeSlots = JSON.parse(response.text || "[]");
        const enrichedClips = timeSlots.map(slot => {
            const literalCaptions = getLiteralCaptions(transcript, slot.startTime, slot.endTime);
            return {
                ...slot,
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
