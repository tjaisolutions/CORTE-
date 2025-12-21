import React from 'react';
import { GeneratedClip } from '../types';
import { IconTerminal, IconDownload } from './Icons';

interface ExportModalProps {
  clips: GeneratedClip[];
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ clips, onClose }) => {
  
  // Gera um script Python para baixar os cortes reais usando yt-dlp
  const generateScript = () => {
    const clipsData = JSON.stringify(clips.map(c => ({
      url: `https://www.youtube.com/watch?v=${c.videoId}`,
      start: c.startTime,
      end: c.endTime,
      title: c.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_")
    })), null, 2);

    return `# SCRIPT DE GERAÇÃO DE CORTES - CORTE+ STARK OS
# Requer: pip install yt-dlp

import os
import json

# Dados dos cortes gerados pelo sistema
clips_data = ${clipsData}

print("⚡ INICIANDO PROTOCOLO DE CORTE STARK...")

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

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateScript());
    alert("Script copiado para a área de transferência! Cole em um arquivo .py e execute.");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl bg-[#0c0c0c] border border-stark-accent shadow-[0_0_50px_rgba(0,240,255,0.2)] rounded-lg overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header Terminal */}
        <div className="bg-stark-950 border-b border-stark-border/30 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconTerminal className="w-5 h-5 text-stark-accent" />
            <span className="text-sm font-mono text-white font-bold tracking-widest uppercase">
              Terminal de Exportação Real
            </span>
          </div>
          <button onClick={onClose} className="text-stark-accent/50 hover:text-white">✕</button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-auto bg-[#050505] font-mono text-xs md:text-sm text-green-500 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-green-500/20 animate-scan pointer-events-none"></div>
          
          <div className="mb-4 text-slate-400">
            <p className="mb-2"> // AVISO DO SISTEMA:</p>
            <p>Os navegadores bloqueiam downloads diretos do YouTube por segurança.</p>
            <p>Para gerar os arquivos <span className="text-white font-bold">.mp4 reais</span> no seu computador, execute o script abaixo:</p>
          </div>

          <div className="bg-black border border-stark-border/20 p-4 rounded text-stark-accent/90 whitespace-pre overflow-x-auto selection:bg-stark-accent selection:text-black">
            {generateScript()}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stark-950 border-t border-stark-border/30 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold uppercase tracking-widest text-stark-accent/50 hover:text-white transition-colors"
          >
            Cancelar
          </button>
          <button 
            onClick={copyToClipboard}
            className="px-6 py-2 bg-stark-accent text-stark-950 font-bold text-xs uppercase tracking-widest hover:bg-white transition-colors flex items-center gap-2"
          >
            <IconDownload className="w-4 h-4" />
            Copiar Script Python
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;