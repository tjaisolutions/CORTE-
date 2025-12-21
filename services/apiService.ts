
import { GeneratedClip, CutStyle } from '../types';
import { analyzeVideoForClips as fallbackGeminiAnalysis } from './geminiService';

export const apiService = {
  processVideo: async (url: string, styles: CutStyle[]): Promise<Partial<GeneratedClip>[]> => {
    try {
        console.log("[API Service] Enviando para Processamento de Texto (Anti-Bloqueio)...");
        
        const controller = new AbortController();
        // 5 minutos de timeout para segurança em transcrições densas
        const timeoutId = setTimeout(() => controller.abort(), 300000); 

        const response = await fetch('/api/process-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        return data.map((clip: any) => ({
            ...clip,
            style: styles[0],
            captions: clip.captions || []
        }));

    } catch (error) {
        if (error.name === 'AbortError') {
            console.error("[API Service] Timeout de 5 minutos atingido no processamento de transcrição.");
        }
        console.warn("[API Service] Falha ou Vídeo sem Legenda. Modo de Segurança Ativado.", error);
        // O fallbackGeminiAnalysis agora é seguro e não inventa conteúdo
        return await fallbackGeminiAnalysis(url, styles);
    }
  }
};
