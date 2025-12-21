
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
 * EXTRAÇÃO LITERAL ESTRITA: 
 * Filtra os blocos originais do YouTube sem alterar nenhuma letra.
 */
const getLiteralCaptions = (transcriptItems, startTime, endTime) => {
    if (!transcriptItems || transcriptItems.length === 0) return [];
    
    return transcriptItems
        .filter(item => {
            const itemStart = item.offset / 1000;
            const itemEnd = (item.offset + item.duration) / 1000;
            // Pega blocos que se sobrepõem ao intervalo do corte
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

app.post('/api/process-video', async (req, res) => {
    const { url } = req.body;
    const videoId = getYoutubeId(url);

    if (!videoId) {
        return res.status(400).json({ error: 'URL do YouTube inválida.' });
    }

    try {
        console.log(`[Backend] Buscando transcrição oficial para: ${videoId}`);
        
        let transcript;
        try {
            // Tenta Português, se falhar tenta a padrão
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' })
                .catch(() => YoutubeTranscript.fetchTranscript(videoId));
        } catch (e) {
            return res.status(422).json({ error: "Este vídeo não possui transcrição disponível no YouTube." });
        }

        const fullTranscriptText = transcript
            .map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`)
            .join(' ')
            .substring(0, 30000);

        const prompt = `
            Você é um localizador de tempos para cortes virais.
            Sua única tarefa é ler a TRANSCRIÇÃO e identificar 3 intervalos (30-60s) com alto potencial de retenção.
            
            TRANSCRIÇÃO:
            ${fullTranscriptText}

            REGRAS CRÍTICAS:
            1. NÃO resuma o texto.
            2. NÃO crie novos títulos baseados em interpretação, use frases do vídeo.
            3. Retorne APENAS os tempos de início e fim baseados nos marcadores [xs].

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

        const enrichedClips = timeSlots.map(slot => {
            const literalCaptions = getLiteralCaptions(transcript, slot.startTime, slot.endTime);
            const fullText = literalCaptions.map(c => c.word).join(' ');

            return {
                ...slot,
                videoId: videoId,
                transcriptSnippet: fullText, // Texto 100% original
                captions: literalCaptions    // Tempos 100% originais
            };
        });

        res.json(enrichedClips);

    } catch (error) {
        console.error("[Backend Error]", error);
        res.status(500).json({ error: "Erro crítico: " + error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Servidor de Alta Fidelidade na porta ${PORT}`));
