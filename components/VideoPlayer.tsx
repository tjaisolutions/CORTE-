
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GeneratedClip, CutStyle, CaptionWord } from '../types';
import { IconPlay, IconDownload, IconCheckCircle } from './Icons';
import { generateVeoBackground } from '../services/geminiService';

interface VideoPlayerProps {
  clip: GeneratedClip;
  onClose: () => void;
  // Added onUpdateClip to handle VEO background generation updates
  onUpdateClip?: (updatedClip: GeneratedClip) => void;
}

// Sub-componente estável para o vídeo satisfatório
const SatisfyingBackground = React.memo(({ videoId }: { videoId: string }) => {
    const src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${videoId}&playsinline=1`;
    return (
        <div className="w-full h-full relative overflow-hidden bg-zinc-950 border-t-2 border-white/10">
            <iframe 
                src={src}
                className="w-full h-full object-cover pointer-events-none scale-150"
                allow="autoplay; fullscreen"
            />
            <div className="absolute inset-0 bg-black/10"></div>
        </div>
    );
});

const VideoPlayer: React.FC<VideoPlayerProps> = ({ clip, onClose, onUpdateClip }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); 
  const playerRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const satisfyingId = useMemo(() => {
    const IDS = ["swrM1Slc2OI", "X47V_T_8W68", "7cbsvH61LXM", "u7kdVe8q5zs"];
    return IDS[Math.floor(Math.random() * IDS.length)];
  }, []);

  const start = clip.startTime || 0;
  const end = clip.endTime || (start + 30);
  const duration = end - start;

  // Effect to trigger VEO generation if a prompt is available but no background video exists yet
  useEffect(() => {
    const handleVeo = async () => {
      const prompt = clip.manualEdits?.backgroundPrompt || clip.backgroundPrompt;
      if (prompt && !clip.backgroundVideoUrl && onUpdateClip) {
        const url = await generateVeoBackground(prompt);
        if (url) {
          onUpdateClip({ ...clip, backgroundVideoUrl: url });
        }
      }
    };
    handleVeo();
  }, [clip.backgroundPrompt, clip.manualEdits?.backgroundPrompt, clip.backgroundVideoUrl, onUpdateClip]);

  // Inicializa o Player do YouTube para pegar o tempo real
  useEffect(() => {
    const initPlayer = () => {
        if (!(window as any).YT || !(window as any).YT.Player) {
            setTimeout(initPlayer, 200);
            return;
        }

        playerRef.current = new (window as any).YT.Player('main-video-player', {
            events: {
                onReady: (event: any) => {
                    event.target.playVideo();
                },
                onStateChange: (event: any) => {
                    if (event.data === (window as any).YT.PlayerState.PLAYING) setIsPlaying(true);
                    if (event.data === (window as any).YT.PlayerState.PAUSED) setIsPlaying(false);
                    // Loop manual se necessário
                    if (event.data === (window as any).YT.PlayerState.ENDED) {
                        event.target.seekTo(start);
                        event.target.playVideo();
                    }
                }
            }
        });
    };

    initPlayer();

    const timeUpdater = setInterval(() => {
        if (playerRef.current && playerRef.current.getCurrentTime) {
            const time = playerRef.current.getCurrentTime();
            setCurrentTime(time);
        }
    }, 100);

    return () => {
        clearInterval(timeUpdater);
        if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy();
    };
  }, [clip.videoId, start]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Força o download MP4 via servidor
    window.location.href = `/api/download-youtube?v=${clip.videoId}&title=${encodeURIComponent(clip.title)}`;
  };

  const currentWord = clip.captions?.find(w => currentTime >= w.start && currentTime <= w.end);
  const progress = Math.max(0, Math.min(100, ((currentTime - start) / duration) * 100));

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 backdrop-blur-2xl p-0 md:p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full h-full md:h-[85vh] md:max-w-[420px] bg-black border border-white/10 shadow-2xl overflow-hidden md:rounded-[2.5rem] flex flex-col group">
        
        {/* Navbar */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/90 to-transparent z-[150] flex items-center justify-between px-6">
           <button onClick={onClose} className="bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/20 transition-all">✕</button>
           <button 
             onClick={handleDownload}
             className="bg-indigo-600 text-white px-5 py-2 rounded-full text-xs font-bold hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all"
           >
             Baixar Corte MP4
           </button>
        </div>

        {/* Legendas Oficiais Sincronizadas */}
        {currentWord && (
            <div className="absolute inset-0 flex items-center justify-center z-[140] pointer-events-none pb-20 px-4">
                <div 
                    className="text-5xl md:text-6xl font-black uppercase text-center leading-none tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,1)] text-white animate-in zoom-in-95 duration-75"
                    style={{ WebkitTextStroke: '2.5px black', fontFamily: '"Outfit", sans-serif' }}
                >
                    {currentWord.word}
                </div>
            </div>
        )}

        {/* Video Containers */}
        <div className="w-full h-full flex flex-col relative bg-black">
          <div className={`w-full relative overflow-hidden bg-black ${clip.style === CutStyle.SPLIT_SATISFYING ? 'h-[50%]' : 'h-full'}`}>
             <div className="w-full h-full pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[3.5]">
                <iframe 
                    id="main-video-player"
                    src={`https://www.youtube.com/embed/${clip.videoId}?enablejsapi=1&start=${Math.floor(start)}&end=${Math.ceil(end)}&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=0&playsinline=1`}
                    className="w-full h-full"
                    allow="autoplay"
                />
             </div>
          </div>

          {clip.style === CutStyle.SPLIT_SATISFYING && (
            <div className="h-[50%] w-full">
                {clip.backgroundVideoUrl ? (
                    <video 
                        src={clip.backgroundVideoUrl} 
                        autoPlay 
                        loop 
                        muted 
                        playsInline 
                        className="w-full h-full object-cover border-t-2 border-white/10"
                    />
                ) : (
                    <SatisfyingBackground videoId={satisfyingId} />
                )}
            </div>
          )}
        </div>
        
        {/* Barra de Progresso Real */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/10 w-full z-[160]">
             <div className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,1)]" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;
