
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedClip, CutStyle, CaptionWord } from '../types';
import { generateVeoBackground, searchPersonImage } from '../services/geminiService';
import { IconWand, IconRefresh, IconZap, IconPlay, IconPause, IconDownload, IconTerminal } from './Icons';

interface VideoPlayerProps {
  clip: GeneratedClip;
  onClose: () => void;
  onUpdateClip?: (updatedClip: GeneratedClip) => void;
}

const OpusCaptions = ({ captions, currentAbsoluteTime }: { captions: CaptionWord[], currentAbsoluteTime: number }) => {
    const currentWordIndex = captions.findIndex(w => currentAbsoluteTime >= w.start && currentAbsoluteTime <= (w.end + 0.1)); 
    const currentWord = captions[currentWordIndex];

    if (!currentWord) return null;

    const getWordStyle = (word: string) => {
        const clean = word.replace(/[^a-zA-Z]/g, '').toUpperCase();
        if (["DINHEIRO", "VOCÊ", "BRASIL", "AGORA", "HOJE", "IMPORTANTE"].includes(clean)) return "text-yellow-400 scale-110";
        if (["NÃO", "NUNCA", "ERRO", "PERIGO"].includes(clean)) return "text-red-500 scale-110";
        return "text-white";
    };

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[90] pointer-events-none pb-20 px-4">
            <div className="flex flex-col items-center gap-2 transition-all duration-75 text-center">
                <div 
                    className={`
                        text-5xl md:text-7xl font-black uppercase text-center leading-none tracking-tighter
                        drop-shadow-[0_6px_6px_rgba(0,0,0,1)]
                        ${getWordStyle(currentWord.word)}
                        animate-in zoom-in-90 duration-75
                    `}
                    style={{ 
                        WebkitTextStroke: '2px black',
                        textShadow: '4px 4px 0 #000, -2px -2px 0 #000',
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
  const [viralBg, setViralBg] = useState(() => {
     if (clip.backgroundVideoUrl) return clip.backgroundVideoUrl;
     return SAFE_LOOPS_IDS[Math.floor(Math.random() * SAFE_LOOPS_IDS.length)];
  });

  const start = clip.startTime || 0;
  const end = clip.endTime || (start + 30);
  const duration = end - start;
  const style = clip.style;

  useEffect(() => {
      if (clip.captions && clip.captions.length > 0) {
          setDisplayCaptions(clip.captions);
      }
  }, [clip]);

  useEffect(() => {
      let interval: any;
      if (isPlaying) {
          interval = setInterval(() => {
              setProgress(prev => {
                  if (prev >= duration) return 0;
                  return prev + 0.1;
              });
          }, 100);
      }
      return () => clearInterval(interval);
  }, [duration, isPlaying]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (clip.videoId === 'local' || clip.isLocal) {
        // Download direto para uploads locais
        const filename = clip.videoUrl.split('/').pop();
        window.location.href = `/api/download-local/${filename}`;
    } else {
        // Script de download para YouTube
        const script = `yt-dlp --download-sections "*${clip.startTime}-${clip.endTime}" -f "bestvideo+bestaudio" -o "${clip.title.replace(/\s+/g, '_')}.mp4" "https://www.youtube.com/watch?v=${clip.videoId}"`;
        navigator.clipboard.writeText(script);
        alert("Comando de download copiado! Como é um vídeo do YouTube, use o yt-dlp no seu terminal:\n\n" + script);
    }
  };

  const currentAbsoluteTime = start + progress;
  const showHookTitle = progress < 2.0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-0 md:p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full h-full md:h-[85vh] md:max-w-[400px] bg-black border-2 border-white/10 shadow-2xl overflow-hidden md:rounded-3xl flex flex-col group">
        
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/80 to-transparent z-[100] flex justify-between p-4">
           <button onClick={onClose} className="bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-md hover:bg-white/20 transition-colors">✕</button>
           
           <button 
             onClick={handleDownload}
             className="bg-white text-black px-4 py-1 rounded-full text-xs font-bold flex items-center gap-2 hover:bg-indigo-500 hover:text-white transition-all shadow-lg"
           >
             <IconDownload className="w-4 h-4" /> Baixar MP4
           </button>
        </div>

        {/* Play/Pause Overlay */}
        <div className="absolute inset-0 z-[95] flex items-center justify-center cursor-pointer" onClick={() => setIsPlaying(!isPlaying)}>
            {!isPlaying && <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20"><IconPlay className="w-10 h-10 text-white ml-1" /></div>}
        </div>

        {/* Hook Title */}
        {showHookTitle && (
            <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-[4px] animate-in fade-in zoom-in duration-500 px-8">
                <h1 className="text-4xl md:text-5xl font-black text-white text-center uppercase leading-tight -rotate-1 tracking-tighter" style={{ textShadow: '0 0 20px rgba(255,255,255,0.5)' }}>
                    {clip.title}
                </h1>
            </div>
        )}

        {/* Official Captions */}
        {!showHookTitle && displayCaptions.length > 0 ? (
            <OpusCaptions captions={displayCaptions} currentAbsoluteTime={currentAbsoluteTime} />
        ) : !showHookTitle && (
            <div className="absolute bottom-32 left-0 right-0 z-[90] text-center px-6">
                <p className="text-xs text-white/30 uppercase font-bold tracking-widest">Sincronizando áudio...</p>
            </div>
        )}

        <div className="w-full h-full flex flex-col relative bg-black">
          {/* Main Video Section */}
          <div className={`w-full relative overflow-hidden bg-black ${(style === CutStyle.SPLIT_SATISFYING || style === CutStyle.SPLIT_CONTEXT) ? 'h-[50%]' : 'h-full'}`}>
            <div className="w-full h-full relative">
                {clip.isLocal ? (
                    <video 
                        className="w-full h-full object-cover"
                        src={clip.videoUrl}
                        autoPlay
                        muted={false}
                        loop
                        playsInline
                    />
                ) : (
                    <iframe 
                        className="w-full h-full object-cover pointer-events-none absolute top-1/2 left-1/2"
                        src={`https://www.youtube.com/embed/${clip.videoId}?start=${Math.floor(start)}&end=${Math.floor(end)}&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=0&loop=1&playlist=${clip.videoId}&playsinline=1&enablejsapi=1`}
                        style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%) scale(3.5)', width: '100%', height: '100%' }} 
                    ></iframe>
                )}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/20 via-transparent to-black/20"></div>
            </div>
          </div>

          {/* Satisfying Video Section */}
          {(style === CutStyle.SPLIT_SATISFYING || style === CutStyle.SPLIT_CONTEXT) && (
            <div className="w-full h-[50%] relative overflow-hidden bg-zinc-900 border-t-4 border-black">
               <iframe 
                    src={`https://www.youtube.com/embed/${viralBg}?autoplay=1&mute=1&controls=0&loop=1&playlist=${viralBg}&playsinline=1`}
                    className="w-full h-full object-cover pointer-events-none scale-150"
               />
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-2 bg-white/5 w-full z-[100]">
             <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.8)] transition-all duration-100 ease-linear" style={{ width: `${(progress / duration) * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
