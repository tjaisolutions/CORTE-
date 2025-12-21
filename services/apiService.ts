
import { GeneratedClip, CutStyle } from '../types';
import { analyzeVideoForClips as fallbackGeminiAnalysis } from './geminiService';

export const apiService = {
  processVideo: async (url: string, styles: CutStyle[]): Promise<Partial<GeneratedClip>[]> => {
    try {
        const response = await fetch('/api/process-video', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url })
        });

        if (!response.ok) throw new Error("Erro no servidor");
        const data = await response.json();
        
        return data.map((clip: any) => ({
            ...clip,
            style: styles[0],
            captions: clip.captions || []
        }));
    } catch (error) {
        return await fallbackGeminiAnalysis(url, styles);
    }
  },

  uploadVideo: async (file: File, styles: CutStyle[]): Promise<Partial<GeneratedClip>[]> => {
      const formData = new FormData();
      formData.append('video', file);

      const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
      });

      if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error || "Erro no upload");
      }

      const data = await response.json();
      return data.map((clip: any) => ({
          ...clip,
          style: styles[0],
          captions: []
      }));
  }
};
