
import React from 'react';
import { GeneratedClip } from '../types';
import { IconEye, IconEdit, IconDownload, IconCheckCircle, IconWand, IconShare, IconRefresh } from './Icons';

interface ClipResultProps {
  clip: GeneratedClip;
  onPlay: (clip: GeneratedClip) => void;
  onEdit?: (clip: GeneratedClip) => void;
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
        // Redireciona para o download MP4 real pelo servidor
        const url = `/api/download-youtube?v=${clip.videoId}&title=${encodeURIComponent(clip.title)}`;
        window.open(url, '_blank');
        alert("Iniciando download MP4 real diretamente no seu navegador.");
    }
  };

  return (
    <div 
        className={`group relative bg-grafite-900 rounded-2xl overflow-hidden border backdrop-blur-sm transition-all duration-300 ${
            isSelected 
            ? 'border-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.4)] scale-[0.98]' 
            : 'border-white/5 hover:border-white/20 hover:-translate-y-1'
        }`}
        onClick={() => selectionMode && onToggleSelection && onToggleSelection()}
    >
      
      <div className="aspect-[9/16] bg-black/50 relative cursor-pointer" onClick={() => !selectionMode && onPlay(clip)}>
         <img src={clip.videoUrl} alt={clip.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
         
         {selectionMode && (
             <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-3">
                 <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500 shadow-lg' : 'bg-black/30 border-white/30'}`}>
                     {isSelected && <IconCheckCircle className="w-4 h-4 text-white" />}
                 </div>
             </div>
         )}

         {!selectionMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-4">
                <button 
                    onClick={(e) => { e.stopPropagation(); onPlay(clip); }}
                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl"
                >
                    <IconEye className="w-7 h-7" />
                </button>
                <div className="flex flex-wrap justify-center gap-2 px-3">
                    <button 
                        onClick={handleDownload}
                        className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-indigo-600 transition-all shadow-lg border border-white/10 backdrop-blur-md"
                        title="Baixar MP4 Real"
                    >
                        <IconDownload className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit && onEdit(clip); }}
                        className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 backdrop-blur-md"
                        title="Editar"
                    >
                        <IconEdit className="w-5 h-5" />
                    </button>
                    {onAudit && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onAudit(clip); }}
                            className="w-10 h-10 bg-white/10 text-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all border border-white/10 backdrop-blur-md"
                            title="Análise Viral"
                        >
                            <IconWand className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
         )}

         <div className="absolute top-3 left-3 flex flex-col items-start gap-1">
            <div className="bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] font-black text-indigo-400">
                SCORE: {clip.viralScore}
            </div>
         </div>
      </div>

      <div className="p-4 bg-grafite-900">
         <h3 className="text-sm font-bold text-white line-clamp-2 mb-3 leading-tight min-h-[2.5rem]">{clip.title}</h3>
         <div className="flex justify-between items-center pt-3 border-t border-white/5">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{Math.floor(clip.endTime - clip.startTime)}s</span>
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Ativo</span>
            </div>
         </div>
      </div>
    </div>
  );
};

export default ClipResult;
