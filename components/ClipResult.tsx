
import React from 'react';
import { GeneratedClip } from '../types';
import { IconEye, IconEdit, IconDownload, IconCheckCircle, IconWand, IconShare, IconRefresh } from './Icons';

interface ClipResultProps {
  clip: GeneratedClip;
  onPlay: (clip: GeneratedClip) => void;
  onEdit?: (clip: GeneratedClip) => void;
  // Fix: Added missing props to match PlatformApp.tsx usage
  onAudit?: (clip: GeneratedClip) => void;
  onPublish?: (clip: GeneratedClip) => void;
  onRegenerate?: (clip: GeneratedClip) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
}

const ClipResult: React.FC<ClipResultProps> = ({ 
    clip, onPlay, onEdit, onAudit, onPublish, onRegenerate, selectionMode, isSelected, onToggleSelection 
}) => {

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clip.isLocal || clip.videoId === 'local') {
        const filename = clip.videoUrl.split('/').pop();
        window.location.href = `/api/download-local/${filename}`;
    } else {
        const script = `yt-dlp --download-sections "*${clip.startTime}-${clip.endTime}" -f "bestvideo+bestaudio" -o "${clip.title.replace(/\s+/g, '_')}.mp4" "https://www.youtube.com/watch?v=${clip.videoId}"`;
        navigator.clipboard.writeText(script);
        alert("Comando de download copiado para o terminal!");
    }
  };

  return (
    <div 
        className={`group relative bg-white/5 rounded-xl overflow-hidden border backdrop-blur-sm transition-all ${
            isSelected 
            ? 'border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
            : 'border-white/5 hover:border-white/20'
        }`}
        onClick={() => selectionMode && onToggleSelection && onToggleSelection()}
    >
      
      <div className="aspect-[9/16] bg-black/50 relative cursor-pointer" onClick={() => !selectionMode && onPlay(clip)}>
         <img src={clip.videoUrl} alt={clip.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
         
         {selectionMode && (
             <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-2">
                 <div className={`w-6 h-6 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-black/50 border-white/50'}`}>
                     {isSelected && <IconCheckCircle className="w-4 h-4 text-white" />}
                 </div>
             </div>
         )}

         {!selectionMode && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3">
                <button 
                    onClick={(e) => { e.stopPropagation(); onPlay(clip); }}
                    className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                >
                    <IconEye className="w-6 h-6" />
                </button>
                <div className="flex flex-wrap justify-center gap-2 px-2">
                    <button 
                        onClick={handleDownload}
                        className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/20 backdrop-blur-md"
                        title="Baixar MP4"
                    >
                        <IconDownload className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(clip); }}
                        className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/20 backdrop-blur-md"
                        title="Editar"
                    >
                        <IconEdit className="w-4 h-4" />
                    </button>
                    {/* Fix: Added buttons to trigger onAudit, onPublish, and onRegenerate actions */}
                    {onAudit && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAudit(clip); }}
                            className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/20 backdrop-blur-md"
                            title="Auditar Viral"
                        >
                            <IconWand className="w-4 h-4" />
                        </button>
                    )}
                    {onPublish && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onPublish(clip); }}
                            className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/20 backdrop-blur-md"
                            title="Publicar"
                        >
                            <IconShare className="w-4 h-4" />
                        </button>
                    )}
                    {onRegenerate && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onRegenerate(clip); }}
                            className="w-8 h-8 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/20 backdrop-blur-md"
                            title="Regenerar Variante"
                        >
                            <IconRefresh className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
         )}

         <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <div className={`text-[10px] font-bold px-2 py-1 rounded bg-black/60 text-white border border-white/10 backdrop-blur-md`}>
                SCORE: {clip.viralScore}
            </div>
            {clip.isLocal && (
                <div className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">UPLOAD</div>
            )}
         </div>
      </div>

      <div className="p-3 bg-white/5">
         <h3 className="text-xs font-bold text-white line-clamp-2 mb-2 leading-tight h-8">{clip.title}</h3>
         <div className="flex justify-between items-center">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{clip.endTime - clip.startTime}s</span>
            <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">Pronto</span>
         </div>
      </div>
    </div>
  );
};

export default ClipResult;
