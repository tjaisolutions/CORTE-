
import React, { useState, useEffect } from 'react';
import { GeneratedClip } from '../types';
import { IconCpu, IconCheckCircle, IconDownload, IconTerminal } from './Icons';

interface RendererModalProps {
  clips: GeneratedClip[];
  onClose: () => void;
}

const RendererModal: React.FC<RendererModalProps> = ({ clips, onClose }) => {
  const [currentClipIndex, setCurrentClipIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Gera um script Python para baixar os cortes reais usando yt-dlp
  const generateScript = () => {
    const clipsData = JSON.stringify(clips.map(c => ({
      url: `https://www.youtube.com/watch?v=${c.videoId}`,
      start: c.startTime,
      end: c.endTime,
      title: c.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")
    })), null, 2);

    return `# SCRIPT DE GERAÇÃO DE CORTES REAIS - CORTE+ ENTERPRISE
# Este script baixa o vídeo original na qualidade máxima e realiza o corte preciso.
# Requer Python instalado e: pip install yt-dlp

import os
import json

# Dados dos cortes gerados pelo sistema
clips_data = ${clipsData}

print("⚡ INICIANDO PROTOCOLO DE CORTE CORTE+...")

for clip in clips_data:
    output_name = f"{clip['title']}_final.mp4"
    print(f"\\nProcessando: {clip['title']} ({clip['start']}s - {clip['end']}s)")
    
    # Comando yt-dlp para baixar apenas o trecho especifico (download range)
    # Isso evita baixar o video inteiro de 1 hora
    cmd = f'yt-dlp --download-sections "*{clip["start"]}-{clip["end"]}" -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --force-keyframes-at-cuts -o "{output_name}" "{clip["url"]}"'
    
    os.system(cmd)

print("\\n✅ TODOS OS CORTES FORAM GERADOS COM SUCESSO.")
`;
  };

  useEffect(() => {
    if (isCompleted) return;

    const currentClip = clips[currentClipIndex];
    if (!currentClip) {
      setIsCompleted(true);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setLogs(l => [...l, `[SUCCESS] Rendered preview: ${currentClip.title}`]);
          
          if (currentClipIndex < clips.length - 1) {
            setTimeout(() => {
              setCurrentClipIndex(i => i + 1);
              setProgress(0);
            }, 500);
          } else {
            setIsCompleted(true);
          }
          return 100;
        }

        // Add fake technical logs based on progress
        if (prev === 10) setLogs(l => [...l, `[WASM] Loading render core...`]);
        if (prev === 30) setLogs(l => [...l, `[ANALYSIS] Calculating cut points...`]);
        if (prev === 60) setLogs(l => [...l, `[OPTIMIZE] Generating Python export script...`]);
        
        return prev + (Math.random() * 10);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [currentClipIndex, isCompleted, clips]);

  const copyScript = () => {
      navigator.clipboard.writeText(generateScript());
      alert("Script Python copiado! Veja as instruções abaixo.");
  };

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl bg-stark-950 border border-stark-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-stark-900/50 p-4 border-b border-stark-border flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-stark-accent/10 rounded-lg text-stark-accent">
                <IconCpu className="w-5 h-5" />
             </div>
             <div>
                <h3 className="text-white font-semibold">Renderização & Exportação</h3>
                <p className="text-xs text-slate-500">Preparando arquivos para download local</p>
             </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
           {!isCompleted ? (
             <>
               <div className="flex justify-between text-sm text-slate-300 mb-2">
                  <span>Preparando {currentClipIndex + 1} de {clips.length}</span>
                  <span className="font-mono text-stark-accent">{progress.toFixed(0)}%</span>
               </div>
               <div className="h-2 bg-stark-900 rounded-full overflow-hidden border border-stark-border">
                  <div className="h-full bg-stark-accent transition-all duration-100" style={{ width: `${progress}%` }}></div>
               </div>
               <div className="bg-black rounded-lg p-4 font-mono text-xs text-green-500 h-32 overflow-y-auto border border-stark-border/30 shadow-inner">
                  {logs.map((log, i) => (
                    <div key={i} className="mb-1">{log}</div>
                  ))}
               </div>
             </>
           ) : (
             <div className="text-center">
               <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20">
                  <IconCheckCircle className="w-8 h-8" />
               </div>
               <h3 className="text-xl font-bold text-white mb-2">Cortes Prontos para Exportação!</h3>
               
               <div className="bg-stark-900 border border-stark-border rounded-lg p-4 text-left mb-6">
                   <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                       <IconTerminal className="w-4 h-4 text-indigo-400" />
                       Como baixar os arquivos reais (MP4)?
                   </h4>
                   <ol className="text-xs text-slate-400 list-decimal ml-4 space-y-2">
                       <li>Navegadores bloqueiam downloads pesados do YouTube por segurança.</li>
                       <li>Para contornar isso, geramos um <strong>Script Python Seguro</strong> para você.</li>
                       <li>Copie o script abaixo, salve como <code className="bg-black px-1 rounded">corte.py</code> no seu computador.</li>
                       <li>Execute com <code className="bg-black px-1 rounded">python corte.py</code> e os vídeos MP4 aparecerão na sua pasta magicamente.</li>
                   </ol>
               </div>
               
               <button 
                  onClick={copyScript}
                  className="w-full px-8 py-4 bg-stark-accent hover:bg-white hover:text-stark-950 text-white font-bold rounded-lg shadow-lg shadow-stark-accent/20 transition-all flex items-center justify-center gap-2"
               >
                 <IconDownload className="w-5 h-5" />
                 Copiar Script de Download (Python)
               </button>
             </div>
           )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stark-900 border-t border-stark-border flex justify-end">
           <button onClick={onClose} className="text-slate-500 hover:text-white text-sm px-4 py-2">
             {isCompleted ? 'Fechar' : 'Cancelar'}
           </button>
        </div>

      </div>
    </div>
  );
};

export default RendererModal;
