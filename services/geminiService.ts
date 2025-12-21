
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedClip, CutStyle, CaptionWord } from "../types";

// REMOVIDO: generateNaturalCaptions (Não queremos mais estimativas de texto)

export const generateVeoBackground = async (customPrompt?: string): Promise<string | null> => {
    if (!process.env.API_KEY) return null;
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const promptToUse = customPrompt || "Cinematic abstract visual loop, high quality, 4k, satisfying";

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: promptToUse,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '9:16' }
        });

        let attempts = 0;
        while (!operation.done && attempts < 15) {
            await new Promise(resolve => setTimeout(resolve, 8000));
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
 * ANALISE DE SEGURANÇA: Se o backend falhar, o sistema apenas sugere os tempos, 
 * mas sem legendas para evitar alucinação.
 */
export const analyzeVideoForClips = async (
  videoUrlOrTitle: string,
  styles: CutStyle[]
): Promise<Partial<GeneratedClip>[]> => {
  if (!process.env.API_KEY) return [];

  try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Analise os tempos para este vídeo: ${videoUrlOrTitle}. 
      Retorne APENAS os intervalos de tempo JSON: Array<{title: string, startTime: number, endTime: number, viralScore: number}>`;

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
                          startTime: { type: Type.NUMBER },
                          endTime: { type: Type.NUMBER },
                          viralScore: { type: Type.NUMBER }
                      },
                      required: ["title", "startTime", "endTime", "viralScore"]
                  }
              }
          }
      });

      const results = JSON.parse(response.text || "[]");
      return results.map((r: any) => ({
          ...r,
          videoId: videoUrlOrTitle.includes('v=') ? videoUrlOrTitle.split('v=')[1].split('&')[0] : "external",
          transcriptSnippet: "", // Deixa vazio para não alucinar
          captions: []           // Deixa vazio para não alucinar
      }));
  } catch (e) {
      console.error("[Fallback Error]", e);
      return [];
  }
};
