
import React, { useState, useEffect, useMemo } from 'react';
import { GeneratedClip, CutStyle, CaptionWord } from '../types';
import { IconPlay, IconDownload } from './Icons';

interface VideoPlayerProps {
  clip: GeneratedClip;
  onClose: () => void;
  onUpdateClip?: (updatedClip: GeneratedClip) => void;
}

const OpusCaptions = ({ captions, currentAbsoluteTime }: { captions: CaptionWord[], currentAbsoluteTime: number }) => {
    // Busca a palavra ativa. Aumentamos o buffer para 0.5s para evitar que a legenda suma rápido demais.
    const currentWord = captions.find(w => currentAbsoluteTime >= (w.start - 0.1) && currentAbsoluteTime <= (w.end + 0.4));

    if (!currentWord) return null;

    const isHighlight = (word: string) => {
        const clean = word.toUpperCase().replace(/[^A-Z]/g, '');
        return ["NÃO", "CHATA", "ERRO", "MUITO", "VOCÊ", "AGORA", "DINHEIRO", "PORQUE"].includes(clean);
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[110] pointer-events-none pb-32 px-4">
            <div 
                className={`
                    text-5xl md:text-7xl font-black uppercase text-center leading-none tracking-tighter
                    drop-shadow-[0_8px_8px_rgba(0,0,0,1)]
                    ${isHighlight(currentWord.word) ? 'text-yellow-400 scale-110' : 'text-white'}
                    animate-in zoom-in-90 duration-75
                `}
                style={{ 
                    WebkitTextStroke: '3px black',
                    fontFamily: '"Outfit", sans-serif',
                    transform: `rotate(${currentWord.word.length % 2 === 0 ? '-1.5deg' : '1.5deg'})`
                }}
            >
                {currentWord.word}
            </div>
        </div>
    );
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ clip, onClose, onUpdateClip }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); 

  // Memoiza o vídeo satisfatório para nunca recarregar durante o play
  const satisfyingId = useMemo(() => {
    const IDS = ["swrM1Slc2OI", "X47V_T_8W68", "7cbsvH61LXM", "u7kdVe8q5zs"];
    return IDS[Math.floor(Math.random() * IDS.length)];
  }, []);

  const start = clip.startTime || 0;
  const end = clip.endTime || (start + 30);
  const duration = Math.max(1, end - start);

  useEffect(() => {
      let interval: any;
      if (isPlaying) {
          interval = setInterval(() => {
              setProgress(prev => (prev >= duration ? 0 : prev + 0.1));
          }, 100);
      }
      return () => clearInterval(interval);
  }, [isPlaying, duration]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clip.isLocal) {
        window.location.href = `/api/download-local/${clip.videoUrl.split('/').pop()}`;
    } else {
        // Redireciona para download MP4 real
        window.open(`/api/download-youtube?v=${clip.videoId}&title=${encodeURIComponent(clip.title)}`, '_blank');
    }
  };

  const currentAbsoluteTime = start + progress;
  const isHookActive = progress < 0.6; // Reduzido para não atrasar as legendas

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl p-0 md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full h-full md:h-[85vh] md:max-w-[420px] bg-black border border-white/10 shadow-2xl overflow-hidden md:rounded-[3rem] flex flex-col group">
        
        {/* Top Control Bar */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 via-black/40 to-transparent z-[120] flex items-center justify-between px-6">
           <button onClick={onClose} className="bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md hover:bg-white/20">✕</button>
           <button 
             onClick={handleDownload}
             className="bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-white hover:text-indigo-600 transition-all shadow-xl"
           >
             Baixar MP4 Real
           </button>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 z-[105] flex items-center justify-center cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
            {!isPlaying && <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 animate-in zoom-in"><IconPlay className="w-10 h-10 text-white ml-1" /></div>}
        </div>

        {/* Legendas Dinâmicas (Sincronizadas por tempo absoluto) */}
        {!isHookActive && clip.captions && clip.captions.length > 0 && (
            <OpusCaptions captions={clip.captions} currentAbsoluteTime={currentAbsoluteTime} />
        )}

        {/* Hook Overlay (Apenas no início) */}
        {isHookActive && (
            <div className="absolute inset-0 z-[130] flex flex-col items-center justify-center pointer-events-none bg-black/60 backdrop-blur-[4px] animate-in fade-in duration-200 text-center px-8">
                <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-3 animate-pulse">Momento Viral Detectado</span>
                <h1 className="text-4xl font-black text-white uppercase leading-tight drop-shadow-2xl">
                    {clip.title}
                </h1>
            </div>
        )}

        <div className="w-full h-full flex flex-col relative bg-black">
          {/* Main Content Area */}
          <div className={`w-full relative overflow-hidden bg-black ${clip.style === CutStyle.SPLIT_SATISFYING ? 'h-[50%]' : 'h-full'}`}>
             {clip.isLocal ? (
                 <video src={clip.videoUrl} className="w-full h-full object-cover" autoPlay muted={false} loop playsInline />
             ) : (
                 <iframe 
                    className="w-full h-full object-cover pointer-events-none absolute top-1/2 left-1/2"
                    src={`https://www.youtube.com/embed/${clip.videoId}?start=${Math.floor(start)}&end=${Math.ceil(end)}&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=0&loop=1&playlist=${clip.videoId}&playsinline=1`}
                    style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%) scale(3.2)', width: '100%', height: '100%' }}
                    allow="autoplay; fullscreen"
                ></iframe>
             )}
          </div>

          {/* Satisfying Area (Estável e sem recargas) */}
          {clip.style === CutStyle.SPLIT_SATISFYING && (
            <div className="w-full h-[50%] relative overflow-hidden bg-zinc-950 border-t-2 border-white/10">
               <iframe 
                    src={`https://www.youtube.com/embed/${satisfyingId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${satisfyingId}&playsinline=1`}
                    className="w-full h-full object-cover pointer-events-none scale-150"
                    allow="autoplay; fullscreen"
               />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
          )}
        </div>
        
        {/* Navigation Bar */}
        <div className="absolute bottom-0 left-0 h-2 bg-white/10 w-full z-[120]">
             <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] transition-all duration-100 linear" style={{ width: `${(progress / duration) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
