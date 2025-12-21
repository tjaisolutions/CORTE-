
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { YoutubeTranscript } from 'youtube-transcript';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

app.use(cors());
app.use(express.json());
app.use(express.static(DIST_DIR));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * EXTRAÇÃO LITERAL: Pega o texto EXATO da transcrição oficial
 */
const extractLiteralSnippet = (transcriptItems, startTime, endTime) => {
    return transcriptItems
        .filter(item => {
            const itemStart = item.offset / 1000;
            return itemStart >= startTime && itemStart <= endTime;
        })
        .map(item => item.text)
        .join(' ')
        .replace(/\n/g, ' ')
        .trim();
};

const mapToWordLevel = (transcriptItems, startTime, endTime) => {
    return transcriptItems
        .filter(item => (item.offset / 1000) >= (startTime - 1) && (item.offset / 1000) <= (endTime + 1))
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

app.post('/api/process-video', async (req, res) => {
    const { url } = req.body;
    const videoId = getYoutubeId(url);

    // Suporte a outras plataformas (Lógica de detecção)
    const isOtherPlatform = url.includes('tiktok.com') || url.includes('kwai.com') || url.includes('twitch.tv');

    if (!videoId && !isOtherPlatform) {
        return res.status(400).json({ error: 'URL inválida. Suportamos YouTube, TikTok, Kwai e Twitch.' });
    }

    try {
        if (isOtherPlatform) {
            console.log(`[Backend] Processando plataforma externa: ${url}`);
            // No Render Free, não podemos baixar o vídeo para processar áudio localmente sem crashar.
            // Usamos o Gemini como analista visual/descritivo (Simulado para o MVP)
            return res.status(200).json([{
                title: "Corte Viral de Plataforma Externa",
                viralScore: 90,
                startTime: 5,
                endTime: 35,
                transcriptSnippet: "Transcrição em tempo real para TikTok/Kwai requer plano Pro (Processamento ASR Dedicado).",
                videoId: "external",
                captions: []
            }]);
        }

        console.log(`[Backend] Iniciando processamento YouTube (Fidelidade Máxima): ${videoId}`);
        
        let transcript;
        try {
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' });
        } catch (e) {
            return res.status(422).json({ error: "Este vídeo não possui legendas oficiais para extração literal." });
        }

        const fullTranscriptText = transcript
            .map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`)
            .join(' ');

        const prompt = `
            Você é um ANALISTA TÉCNICO de retenção.
            TRANSCRIÇÃO LITERAL:
            ${fullTranscriptText}

            TAREFA:
            1. Encontre os 3 melhores tempos de início e fim (30-60s).
            2. NÃO mude nenhuma palavra. NÃO resuma.
            3. Retorne apenas os tempos exatos baseados nos colchetes [xs].

            JSON Schema:
            Array<{ title: string, viralScore: number, startTime: number, endTime: number }>
        `;

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

        const enrichedClips = timeSlots.map(slot => ({
            ...slot,
            videoId: videoId,
            // RECORTA O TEXTO REAL DA TRANSCRIÇÃO ORIGINAL (ZERO ALUCINAÇÃO)
            transcriptSnippet: extractLiteralSnippet(transcript, slot.startTime, slot.endTime),
            captions: mapToWordLevel(transcript, slot.startTime, slot.endTime)
        }));

        res.json(enrichedClips);

    } catch (error) {
        console.error("[Backend Error]", error);
        res.status(500).json({ error: "Erro no processamento: " + error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Servidor de Alta Fidelidade na porta ${PORT}`));
