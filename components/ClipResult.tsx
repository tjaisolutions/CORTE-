import React from 'react';
import { GeneratedClip } from '../types';
import { IconEye, IconEdit, IconShare, IconRefresh } from './Icons';

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
    clip, onPlay, onEdit, onPublish, selectionMode, isSelected, onToggleSelection, onRegenerate 
}) => {
  return (
    <div 
        className={`group relative bg-white/5 rounded-lg overflow-hidden border backdrop-blur-sm transition-all ${
            isSelected 
            ? 'border-indigo-500 shadow-[0_0_0_2px_rgba(99,102,241,0.5)]' 
            : 'border-white/5 hover:border-white/20 hover:shadow-2xl hover:shadow-black/50'
        }`}
        onClick={() => selectionMode && onToggleSelection && onToggleSelection()}
    >
      
      {/* Thumbnail */}
      <div className="aspect-[9/16] bg-black/50 relative cursor-pointer" onClick={() => !selectionMode && onPlay(clip)}>
         <img src={clip.videoUrl} alt={clip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100" />
         
         {/* Checkbox Overlay (Selection Mode) */}
         {selectionMode && (
             <div className="absolute inset-0 bg-black/40 flex items-start justify-end p-2">
                 <div className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'bg-black/50 border-white/50'}`}>
                     {isSelected && <div className="w-4 h-4 bg-white rounded-sm"></div>}
                 </div>
             </div>
         )}

         {/* Hover Actions (Not Selection Mode) */}
         {!selectionMode && (
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                <button 
                onClick={(e) => { e.stopPropagation(); onPlay(clip); }}
                className="p-4 bg-white text-grafite-950 rounded-full hover:scale-110 transition-transform shadow-lg"
                title="Visualizar"
                >
                <IconEye className="w-6 h-6" />
                </button>
                <button 
                onClick={(e) => { e.stopPropagation(); onEdit && onEdit(clip); }}
                className="p-4 bg-white/10 text-white rounded-full hover:scale-110 transition-transform shadow-lg border border-white/20 backdrop-blur-md"
                title="Editar"
                >
                <IconEdit className="w-6 h-6" />
                </button>
                <button 
                onClick={(e) => { e.stopPropagation(); onPublish && onPublish(clip); }}
                className="p-4 bg-white/10 text-white rounded-full hover:scale-110 transition-transform shadow-lg border border-white/20 backdrop-blur-md"
                title="Publicar"
                >
                <IconShare className="w-6 h-6" />
                </button>
            </div>
         )}

         {/* Badges */}
         <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <div className={`text-xs font-bold px-3 py-1 rounded shadow-sm border border-white/10 backdrop-blur-md ${
                clip.viralScore >= 90 ? 'bg-white text-grafite-950' : 'bg-black/50 text-white'
            }`}>
                {clip.viralScore}
            </div>
         </div>
      </div>

      {/* Meta */}
      <div className="p-5 bg-white/5 border-t border-white/5">
         <h3 className="text-sm font-semibold text-white line-clamp-2 mb-3 leading-relaxed h-10">{clip.manualEdits?.customTitle || clip.title}</h3>
         <div className="text-xs text-slate-400 flex justify-between items-center font-medium">
            <span className="font-mono bg-black/30 px-2 py-1 rounded border border-white/10">{clip.endTime - clip.startTime}s</span>
            <span>{(clip.views || 0) > 0 ? `${(clip.views!/1000).toFixed(1)}k views` : 'Novo'}</span>
         </div>
         
         {/* Variant Actions */}
         {clip.abVariant && (
             <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                 <span className="text-[10px] bg-white/10 text-white px-2 py-1 rounded uppercase font-bold tracking-wider">Var {clip.abVariant}</span>
                 {onRegenerate && (
                     <button onClick={(e) => { e.stopPropagation(); onRegenerate(); }} className="text-xs text-white hover:text-indigo-400 flex items-center gap-1 font-medium transition-colors">
                         <IconRefresh className="w-3.5 h-3.5" /> Pivotar
                     </button>
                 )}
             </div>
         )}
      </div>
    </div>
  );
};

export default ClipResult;