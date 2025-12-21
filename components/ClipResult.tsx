
import React from 'react';
import { GeneratedClip } from '../types';
import { IconEye, IconEdit, IconShare, IconDownload, IconCheckCircle } from './Icons';

interface ClipResultProps {
  clip: GeneratedClip;
  onPlay: (clip: GeneratedClip) => void;
  onAudit?: (clip: GeneratedClip) => void;
  onEdit?: (clip: GeneratedClip) => void;
  onPublish?: (clip: GeneratedClip) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onRegenerate?: () => void;
}

const ClipResult: React.FC<ClipResultProps> = ({ 
    clip, onPlay, onEdit, onPublish, selectionMode, isSelected, onToggleSelection 
}) => {

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clip.videoId === 'local' || clip.isLocal) {
        // Download direto de arquivos locais através do endpoint de download
        const filename = clip.videoUrl.split('/').pop();
        window.location.href = `/api/download-local/${filename}`;
    } else {
        // YouTube: Copia o script yt-dlp
        const script = `yt-dlp --download-sections "*${clip.startTime}-${clip.endTime}" -f "bestvideo+bestaudio" -o "${clip.title.replace(/\s+/g, '_')}.mp4" "https://www.youtube.com/watch?v=${clip.videoId}"`;
        navigator.clipboard.writeText(script);
        alert("Comando de download copiado para vídeos do YouTube! Execute no seu terminal:\n\n" + script);
    }
  };

  return (
    <div 
        className={`group relative bg-white/5 rounded-xl overflow-hidden border backdrop-blur-sm transition-all ${
            isSelected 
            ? 'border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.5)]' 
            : 'border-white/5 hover:border-white/20'
        }`}
        onClick={() => selectionMode && onToggleSelection && onToggleSelection()}
    >
      
      {/* Thumbnail */}
      <div className="aspect-[9/16] bg-black/50 relative cursor-pointer" onClick={() => !selectionMode && onPlay(clip)}>
         <img src={clip.videoUrl} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
         
         {/* Checkbox Overlay (Selection Mode) */}
         {selectionMode && (
             <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-2">
                 <div className={`w-6 h-6 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-black/50 border-white/50'}`}>
                     {isSelected && <IconCheckCircle className="w-4 h-4 text-white" />}
                 </div>
             </div>
         )}

         {/* Hover Actions */}
         {!selectionMode && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 backdrop-blur-[2px]">
                <button 
                    onClick={(e) => { e.stopPropagation(); onPlay(clip); }}
                    className="w-12 h-12 bg-white text-grafite-950 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                >
                    <IconEye className="w-6 h-6" />
                </button>
                <div className="flex gap-2">
                    <button 
                        onClick={handleDownload}
                        className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/20 backdrop-blur-md"
                        title="Baixar MP4"
                    >
                        <IconDownload className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(clip); }}
                        className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:scale-110 transition-transform border border-white/20 backdrop-blur-md"
                        title="Editar"
                    >
                        <IconEdit className="w-5 h-5" />
                    </button>
                </div>
            </div>
         )}

         {/* Badges */}
         <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <div className={`text-xs font-bold px-3 py-1 rounded shadow-sm border border-white/10 backdrop-blur-md ${
                clip.viralScore >= 90 ? 'bg-indigo-500 text-white' : 'bg-black/50 text-white'
            }`}>
                {clip.viralScore}
            </div>
            {(clip.videoId === 'local' || clip.isLocal) && (
                <div className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">UPLOAD</div>
            )}
         </div>
      </div>

      {/* Meta */}
      <div className="p-4 bg-white/5 border-t border-white/5">
         <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 leading-tight h-10">{clip.manualEdits?.customTitle || clip.title}</h3>
         <div className="text-[10px] text-slate-500 flex justify-between items-center font-bold uppercase tracking-wider">
            <span className="bg-white/5 px-2 py-1 rounded">{clip.endTime - clip.startTime} segundos</span>
            <span className="text-emerald-400">Pronto</span>
         </div>
      </div>
    </div>
  );
};

export default ClipResult;
