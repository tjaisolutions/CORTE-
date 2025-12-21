
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedClip, CutStyle, CaptionWord } from "../types";

/**
 * Utilitário para gerar legendas caso o backend forneça o texto mas não os tempos precisos.
 */
export const generateNaturalCaptions = (text: string, duration: number, startOffset: number): CaptionWord[] => {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return [];
    
    const wordDuration = duration / words.length;
    return words.map((word, i) => ({
        word,
        start: startOffset + (i * wordDuration),
        end: startOffset + ((i + 1) * wordDuration)
    }));
};

/**
 * Gerador de Background via Veo
 */
export const generateVeoBackground = async (customPrompt?: string): Promise<string | null> => {
    if (!process.env.API_KEY) return null;
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const promptToUse = customPrompt || "Cinematic visual background loop, 4k high quality";

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: promptToUse,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
        });

        let attempts = 0;
        while (!operation.done && attempts < 20) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
            attempts++;
        }
        return operation.response?.generatedVideos?.[0]?.video?.uri ? `${operation.response.generatedVideos[0].video.uri}&key=${process.env.API_KEY}` : null;
    } catch (e) { 
        console.error("[Veo Error]", e);
        return null; 
    }
};

export const searchPersonImage = async (context: string): Promise<string | null> => {
    const clean = context.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '+');
    return `https://tse2.mm.bing.net/th?q=${clean}+face+profile&w=800&h=800&c=7&rs=1&p=0`;
};

/**
 * Fallback de Segurança - POLÍTICA ZERO ALUCINAÇÃO
 */
export const analyzeVideoForClips = async (
  videoUrlOrTitle: string,
  styles: CutStyle[]
): Promise<Partial<GeneratedClip>[]> => {
  // Retornamos vazio imediatamente para que o usuário veja o erro real do backend
  // em vez de dados inventados.
  console.log("[Gemini Service] Fallback bloqueado para evitar alucinação de dados.");
  return [];
};
