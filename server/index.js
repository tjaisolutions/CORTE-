
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

// Configuração para resolver caminhos em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');

app.use(cors());
app.use(express.json());

// 1. SERVIR ARQUIVOS ESTÁTICOS (EVITA TELA BRANCA NO RENDER)
app.use(express.static(DIST_DIR));

// Instanciar Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Utilitário para extrair ID do YouTube
 */
const getYoutubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/**
 * Mapeia transcrição bruta para formato Word-Level
 */
const mapToWordLevel = (transcriptItems, startTime, endTime) => {
    return transcriptItems
        .filter(item => (item.offset / 1000) >= startTime && (item.offset / 1000) <= endTime)
        .flatMap(item => {
            const words = item.text.split(/\s+/);
            const durationPerWord = (item.duration / 1000) / words.length;
            const offsetSec = item.offset / 1000;
            return words.map((word, index) => ({
                word: word.trim(),
                start: offsetSec + (index * durationPerWord),
                end: offsetSec + ((index + 1) * durationPerWord)
            }));
        });
};

// 2. ROTA API - PROCESSAMENTO TEXT-ONLY
app.post('/api/process-video', async (req, res) => {
    const { url } = req.body;
    const videoId = getYoutubeId(url);

    if (!videoId) {
        return res.status(400).json({ error: 'URL do YouTube inválida' });
    }

    try {
        console.log(`[Backend] Iniciando processamento de texto: ${videoId}`);
        
        // Obter Legenda Oficial
        let transcript;
        try {
            transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' });
        } catch (e) {
            console.error(`[Error 422] Vídeo sem legendas acessíveis: ${videoId}`);
            return res.status(422).json({ 
                error: "Este vídeo não possui legendas oficiais acessíveis.",
                details: "O processamento rápido via texto requer que o vídeo tenha legendas ativadas no YouTube."
            });
        }

        const fullTranscriptText = transcript
            .map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`)
            .join(' ');

        // Analisar Viralidade via Gemini
        const prompt = `
            Atue como um Especialista em Viralização.
            TRANSCRIÇÃO DO VÍDEO:
            ${fullTranscriptText}

            TAREFA:
            Identifique os 3 segmentos mais impactantes (30-60 segundos cada) com alto potencial de retenção.
            Retorne um JSON Array de objetos com:
            {
                "title": "Título chamativo",
                "viralScore": 0-100,
                "startTime": número (segundos),
                "endTime": número (segundos),
                "transcriptSnippet": "texto do trecho"
            }
            Baseie os tempos EXATAMENTE nos offsets fornecidos [xs].
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
                            endTime: { type: Type.NUMBER },
                            transcriptSnippet: { type: Type.STRING }
                        },
                        required: ["title", "viralScore", "startTime", "endTime", "transcriptSnippet"]
                    }
                }
            }
        });

        const clips = JSON.parse(response.text || "[]");

        const enrichedClips = clips.map(clip => ({
            ...clip,
            captions: mapToWordLevel(transcript, clip.startTime, clip.endTime)
        }));

        res.json(enrichedClips);

    } catch (error) {
        console.error("[Backend Error]", error);
        res.status(500).json({ error: "Falha no motor neural: " + error.message });
    }
});

// 3. ROTA FALLBACK PARA SPA (REACT ROUTER) - CRÍTICO
app.get('*', (req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => console.log(`🚀 Servidor Híbrido Ativo na porta ${PORT}`));
