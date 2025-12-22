
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedClip, CutStyle, CaptionWord } from '../types';
import { IconPlay, IconPause, IconDownload, IconCheckCircle } from './Icons';

interface VideoPlayerProps {
  clip: GeneratedClip;
  onClose: () => void;
  onUpdateClip?: (updatedClip: GeneratedClip) => void;
}

const OpusCaptions = ({ captions, currentAbsoluteTime }: { captions: CaptionWord[], currentAbsoluteTime: number }) => {
    // Busca a palavra ativa. Aumentamos o buffer para 0.3s para cobrir atrasos de renderização
    const currentWord = captions.find(w => currentAbsoluteTime >= (w.start - 0.1) && currentAbsoluteTime <= (w.end + 0.2));

    if (!currentWord) return null;

    const getWordStyle = (word: string) => {
        const clean = word.replace(/[^a-zA-Z]/g, '').toUpperCase();
        if (["DINHEIRO", "VOCÊ", "BRASIL", "AGORA", "HOJE", "IMPORTANTE", "SURPRESA", "META"].includes(clean)) return "text-yellow-400 scale-110";
        if (["NÃO", "NUNCA", "ERRO", "PERIGO", "PARE", "MORTE"].includes(clean)) return "text-red-500 scale-110";
        return "text-white";
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[90] pointer-events-none pb-28 px-4">
            <div className="flex flex-col items-center transition-all duration-75 text-center">
                <div 
                    className={`
                        text-5xl md:text-7xl font-black uppercase text-center leading-none tracking-tighter
                        drop-shadow-[0_4px_4px_rgba(0,0,0,1)]
                        ${getWordStyle(currentWord.word)}
                        animate-in zoom-in-95 duration-100
                    `}
                    style={{ 
                        WebkitTextStroke: '2px black',
                        textShadow: '4px 4px 0 #000',
                        fontFamily: '"Outfit", sans-serif',
                        transform: `rotate(${currentWord.word.length % 2 === 0 ? '-1.5deg' : '1.5deg'})`
                    }}
                >
                    {currentWord.word}
                </div>
            </div>
        </div>
    );
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ clip, onClose, onUpdateClip }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); 
  const [displayCaptions, setDisplayCaptions] = useState<CaptionWord[]>(clip.captions || []);

  const SAFE_LOOPS_IDS = ["swrM1Slc2OI", "X47V_T_8W68", "7cbsvH61LXM", "u7kdVe8q5zs"];
  const viralBg = SAFE_LOOPS_IDS[Math.floor(Math.random() * SAFE_LOOPS_IDS.length)];

  const start = clip.startTime || 0;
  const end = clip.endTime || (start + 30);
  const duration = end - start;
  const style = clip.style;

  useEffect(() => {
      if (clip.captions) setDisplayCaptions(clip.captions);
  }, [clip]);

  useEffect(() => {
      let interval: any;
      if (isPlaying) {
          interval = setInterval(() => {
              setProgress(prev => {
                  if (prev >= duration) return 0;
                  return prev + 0.05; 
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [duration, isPlaying]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clip.isLocal || clip.videoId === 'local') {
        const filename = clip.videoUrl.split('/').pop();
        window.location.href = `/api/download-local/${filename}`;
    } else {
        const script = `yt-dlp --download-sections "*${clip.startTime}-${clip.endTime}" -f "bestvideo+bestaudio" -o "${clip.title.replace(/\s+/g, '_')}.mp4" "https://www.youtube.com/watch?v=${clip.videoId}"`;
        navigator.clipboard.writeText(script);
        alert("Comando de download MP4 copiado!\n\nEste comando baixará o vídeo original com qualidade máxima diretamente do YouTube para o seu computador.");
    }
  };

  const currentAbsoluteTime = start + progress;
  // Reduzido o tempo de título inicial para mostrar as legendas do áudio mais rápido
  const showHookTitle = progress < 0.8;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full h-full md:h-[85vh] md:max-w-[400px] bg-black border border-white/10 shadow-2xl overflow-hidden md:rounded-3xl flex flex-col group">
        
        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 to-transparent z-[100] flex items-center justify-between px-4">
           <button onClick={onClose} className="bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors">✕</button>
           
           <button 
             onClick={handleDownload}
             className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-white hover:text-indigo-600 transition-all shadow-lg shadow-indigo-600/20"
           >
             <IconDownload className="w-4 h-4" /> Baixar MP4
           </button>
        </div>

        {/* Action Overlay */}
        <div className="absolute inset-0 z-[95] flex items-center justify-center cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
            {!isPlaying && <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"><IconPlay className="w-10 h-10 text-white ml-1" /></div>}
        </div>

        {/* Hook Overlay */}
        {showHookTitle && (
            <div className="absolute inset-0 z-[120] flex flex-col items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px] animate-in fade-in duration-200">
                <span className="text-indigo-400 font-bold uppercase tracking-widest text-[10px] mb-2 animate-pulse">Análise de áudio concluída</span>
                <h1 className="text-4xl font-black text-white text-center uppercase px-8 leading-tight drop-shadow-2xl">
                    {clip.title}
                </h1>
            </div>
        )}

        {/* Legendas Oficiais Sincronizadas */}
        {!showHookTitle && displayCaptions.length > 0 && (
            <OpusCaptions captions={displayCaptions} currentAbsoluteTime={currentAbsoluteTime} />
        )}
        
        {!showHookTitle && displayCaptions.length === 0 && (
            <div className="absolute bottom-32 left-0 right-0 z-[90] text-center px-6">
                <p className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Aguardando dados da transcrição...</p>
            </div>
        )}

        <div className="w-full h-full flex flex-col relative bg-black">
          {/* Main Video Area */}
          <div className={`w-full relative overflow-hidden bg-black ${style === CutStyle.SPLIT_SATISFYING ? 'h-[50%]' : 'h-full'}`}>
             {clip.isLocal ? (
                 <video src={clip.videoUrl} className="w-full h-full object-cover" autoPlay muted={false} loop playsInline />
             ) : (
                 <iframe 
                    className="w-full h-full object-cover pointer-events-none absolute top-1/2 left-1/2"
                    src={`https://www.youtube.com/embed/${clip.videoId}?start=${Math.floor(start)}&end=${Math.ceil(end)}&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=0&loop=1&playlist=${clip.videoId}&playsinline=1`}
                    style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%) scale(3.5)', width: '100%', height: '100%' }} 
                ></iframe>
             )}
          </div>

          {/* Satisfying Split */}
          {style === CutStyle.SPLIT_SATISFYING && (
            <div className="w-full h-[50%] relative overflow-hidden bg-zinc-900 border-t-2 border-white/10">
               <iframe 
                    src={`https://www.youtube.com/embed/${viralBg}?autoplay=1&mute=1&controls=0&loop=1&playlist=${viralBg}&playsinline=1`}
                    className="w-full h-full object-cover pointer-events-none scale-150"
               />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
          )}
        </div>
        
        {/* Progress Timeline */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/10 w-full z-[100]">
             <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] transition-all duration-50 linear" style={{ width: `${(progress / duration) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
