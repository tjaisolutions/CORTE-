
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { YoutubeTranscript } from 'youtube-transcript';
import fs from 'fs';
import ytdl from '@distube/ytdl-core';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

dotenv.config();
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '../dist');
const TEMP_DIR = path.join(__dirname, '../temp');

if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

app.use(cors());
app.use(express.json());
app.use(express.static(DIST_DIR));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Auxiliar para converter segundos em formato SRT (HH:MM:SS,mmm)
const toSrtTime = (seconds) => {
    const s = Math.max(0, seconds);
    const hours = Math.floor(s / 3600);
    const minutes = Math.floor((s % 3600) / 60);
    const secs = Math.floor(s % 60);
    const ms = Math.floor((s % 1) * 1000);
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
};

/**
 * ROTA DE RENDERIZAÇÃO REAL
 * Queima legendas no vídeo e entrega MP4 final
 */
app.post('/api/render-clip', async (req, res) => {
    const { videoId, startTime, endTime, captions, title } = req.body;
    const requestId = Date.now();
    const srtPath = path.join(TEMP_DIR, `subs_${requestId}.srt`);
    const outputPath = path.join(TEMP_DIR, `render_${requestId}.mp4`);

    try {
        // 1. Gerar arquivo SRT temporário (tempos relativos ao início do corte)
        const srtContent = captions.map((c, i) => {
            const startRel = c.start - startTime;
            const endRel = c.end - startTime;
            return `${i + 1}\n${toSrtTime(startRel)} --> ${toSrtTime(endRel)}\n${c.word}\n`;
        }).join('\n');
        
        fs.writeFileSync(srtPath, srtContent);

        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        
        // 2. Iniciar FFmpeg com Stream direto do YouTube
        // Usamos scale=-2:720 para manter proporção e economizar CPU/RAM
        ffmpeg()
            .input(ytdl(videoUrl, { 
                quality: 'highestvideo',
                filter: format => format.container === 'mp4',
                begin: `${Math.floor(startTime)}s` // Otimização de download range
            }))
            .inputOptions([`-ss 0`, `-t ${endTime - startTime}`])
            .videoFilters([
                `scale=-2:720`,
                {
                    filter: 'subtitles',
                    options: {
                        filename: srtPath,
                        force_style: 'Alignment=10,Outline=1,OutlineColour=&H000000,FontSize=24,PrimaryColour=&H00FFFF,Bold=1'
                    }
                }
            ])
            .outputOptions([
                '-preset ultrafast',
                '-c:v libx264',
                '-crf 28',
                '-movflags +faststart',
                '-pix_fmt yuv420p'
            ])
            .on('start', (cmd) => console.log('FFmpeg iniciado:', cmd))
            .on('error', (err) => {
                console.error('Erro FFmpeg:', err);
                if (!res.headersSent) res.status(500).send('Erro na renderização.');
                cleanup();
            })
            .on('end', () => {
                console.log('Renderização concluída.');
                res.download(outputPath, `${title}.mp4`, (err) => {
                    if (err) console.error('Erro no download:', err);
                    cleanup();
                });
            })
            .save(outputPath);

    } catch (error) {
        console.error('Erro na rota render:', error);
        res.status(500).json({ error: error.message });
        cleanup();
    }

    function cleanup() {
        try {
            if (fs.existsSync(srtPath)) fs.unlinkSync(srtPath);
            // O arquivo de vídeo é deletado após o download ou erro
            setTimeout(() => {
                if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            }, 60000); // 1 minuto de margem para o download completar
        } catch (e) { console.error('Limpeza falhou:', e); }
    }
});

// Mantém as outras rotas existentes (process-video, etc)
app.post('/api/process-video', async (req, res) => {
    const { url } = req.body;
    const videoId = url.includes('v=') ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
    
    try {
        const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'pt' }).catch(() => YoutubeTranscript.fetchTranscript(videoId));
        const transcriptText = transcript.map(t => `[${(t.offset / 1000).toFixed(1)}s] ${t.text}`).join(' ');

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Analise para 3 cortes virais (30-60s) baseando-se nos tempos. JSON Array: {title, viralScore, startTime, endTime}. Transcrição: ${transcriptText.substring(0, 15000)}`,
            config: { responseMimeType: "application/json" }
        });

        const timeSlots = JSON.parse(response.text || "[]");
        const clips = timeSlots.map(slot => {
            let s = slot.startTime;
            let e = slot.endTime;
            
            // Extração de legendas literal para o clipe
            const captions = transcript
                .filter(t => (t.offset/1000) >= s && (t.offset/1000) <= e)
                .flatMap(t => {
                    const words = t.text.split(' ');
                    const dur = (t.duration / 1000) / words.length;
                    return words.map((w, i) => ({
                        word: w,
                        start: (t.offset/1000) + (i * dur),
                        end: (t.offset/1000) + ((i + 1) * dur)
                    }));
                });

            return { ...slot, videoId, captions, videoUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` };
        });

        res.json(clips);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('*', (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));
