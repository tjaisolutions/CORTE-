
import React, { useState, useEffect, useRef } from 'react';
import { GeneratedClip, CutStyle, CaptionWord } from '../types';
import { generateVeoBackground, searchPersonImage, generateNaturalCaptions } from '../services/geminiService';
import { IconWand, IconRefresh, IconZap, IconPlay, IconPause } from './Icons';

interface VideoPlayerProps {
  clip: GeneratedClip;
  onClose: () => void;
  onUpdateClip?: (updatedClip: GeneratedClip) => void;
}

const OpusCaptions = ({ captions, currentAbsoluteTime }: { captions: CaptionWord[], currentAbsoluteTime: number }) => {
    // Procura a palavra correspondente ao tempo absoluto atual
    const currentWordIndex = captions.findIndex(w => currentAbsoluteTime >= w.start && currentAbsoluteTime <= (w.end + 0.2)); 
    const currentWord = captions[currentWordIndex];

    if (!currentWord) return null;

    const getWordStyle = (word: string) => {
        const clean = word.replace(/[^a-zA-Z]/g, '').toUpperCase();
        if (["DINHEIRO", "MORTE", "SEGREDO", "VOCÊ", "BRASIL", "MEDO", "DEUS", "AMOR", "AGORA"].includes(clean)) return "text-green-400 scale-110";
        if (["NÃO", "NUNCA", "JAMAIS", "ERRO", "PERIGO", "STOP", "PARE"].includes(clean)) return "text-red-500 scale-110";
        if (word.includes("?")) return "text-yellow-400";
        if (word.length > 7) return "text-yellow-300";
        return "text-white";
    };

    const nextWord = captions[currentWordIndex + 1];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-[90] pointer-events-none pb-20">
            <div className="flex flex-col items-center gap-2 transition-all duration-75 px-4 text-center">
                <div 
                    className={`
                        text-5xl md:text-7xl font-black uppercase text-center leading-none tracking-tighter
                        drop-shadow-[0_4px_4px_rgba(0,0,0,1)]
                        ${getWordStyle(currentWord.word)}
                        animate-in zoom-in-75 duration-100
                    `}
                    style={{ 
                        WebkitTextStroke: '2px black',
                        textShadow: '3px 3px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                        fontFamily: '"Outfit", sans-serif',
                        transform: `rotate(${currentWord.word.length % 2 === 0 ? '-2deg' : '2deg'})`
                    }}
                >
                    {currentWord.word}
                </div>
                {nextWord && (
                    <div className="text-2xl font-bold text-white/40 uppercase blur-[0.5px] mt-2">
                        {nextWord.word}
                    </div>
                )}
            </div>
        </div>
    );
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({ clip, onClose, onUpdateClip }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0); 
  
  // States para Auto-Repair (Correção de Imagem e Legenda)
  const [displayImage, setDisplayImage] = useState(clip.videoUrl);
  const [isSearchingImage, setIsSearchingImage] = useState(false);
  const [displayCaptions, setDisplayCaptions] = useState<CaptionWord[]>(clip.captions || []);

  const SAFE_LOOPS_IDS = [
      "swrM1Slc2OI", // GTA Ramp
      "X47V_T_8W68", // Minecraft Parkour
      "7cbsvH61LXM", // Hydraulic Press
      "u7kdVe8q5zs", // Slime/Sand
  ];

  const [viralBg, setViralBg] = useState(() => {
     if (clip.backgroundVideoUrl) return clip.backgroundVideoUrl;
     if (clip.manualEdits?.backgroundVideoUrl) return clip.manualEdits.backgroundVideoUrl;
     return SAFE_LOOPS_IDS[Math.floor(Math.random() * SAFE_LOOPS_IDS.length)];
  });

  const [isGeneratingVeo, setIsGeneratingVeo] = useState(false);
  
  const start = clip.startTime || 0;
  const end = clip.endTime || (start + 30);
  const duration = end - start;
  
  const style = clip.style;
  const isSatisfying = style === CutStyle.SPLIT_SATISFYING;
  const isContext = style === CutStyle.SPLIT_CONTEXT;
  const isMeme = style === CutStyle.MEME_MODE;

  // AUTO-REPAIR: Se as legendas estiverem vazias, gera na hora
  useEffect(() => {
      if (!displayCaptions || displayCaptions.length === 0) {
          console.log("⚠️ Legendas ausentes. Gerando legendas de emergência sincronizadas...");
          const emergencyText = clip.transcriptSnippet || clip.title + " assista até o final para entender o segredo.";
          // FIX: Passamos 'start' para garantir que os timestamps comecem no tempo certo do vídeo, não em 0
          const newCaptions = generateNaturalCaptions(emergencyText, duration, start);
          setDisplayCaptions(newCaptions);
      }
  }, [clip, duration, start]);

  const handleGenerateVeo = async () => {
      if (isGeneratingVeo) return;
      setIsGeneratingVeo(true);
      const prompt = clip.backgroundPrompt || clip.manualEdits?.backgroundPrompt;
      try {
          const videoUrl = await generateVeoBackground(prompt);
          if (videoUrl) {
              setViralBg(videoUrl);
              if (onUpdateClip) {
                  onUpdateClip({ ...clip, backgroundVideoUrl: videoUrl });
              }
          }
      } catch (e) { console.error("Veo Error", e); } finally { setIsGeneratingVeo(false); }
  };

  const handleImageError = async () => {
      // Se a imagem falhar e ainda não buscamos, vamos buscar a pessoa no Google
      if (!isSearchingImage) {
          setIsSearchingImage(true);
          console.log("⚠️ Imagem 404. Buscando participante no Google...");
          
          // Tenta primeiro o hqdefault (fallback básico)
          if (displayImage.includes('maxresdefault')) {
             setDisplayImage(displayImage.replace('maxresdefault', 'hqdefault'));
             // Se falhar de novo, aí sim busca no google (vai cair aqui de novo ou no próximo erro)
             // Para garantir, já disparamos a busca se o nome for genérico
          }
          
          const googleImage = await searchPersonImage(clip.title || "Person");
          if (googleImage) {
              setDisplayImage(googleImage);
              console.log("✅ Imagem encontrada:", googleImage);
          } else {
              // Fallback final genérico
              setDisplayImage(`https://ui-avatars.com/api/?name=${encodeURIComponent(clip.title)}&background=random&size=512`);
          }
          setIsSearchingImage(false);
      }
  };

  useEffect(() => {
      const interval = setInterval(() => {
          if (isPlaying) {
              setProgress(prev => {
                  if (prev >= duration) return 0;
                  return prev + 0.1;
              });
          }
      }, 100);
      return () => clearInterval(interval);
  }, [duration, isPlaying]);

  const currentAbsoluteTime = start + progress;
  const showHookTitle = progress < 3.0;

  const togglePlay = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsPlaying(!isPlaying);
  };

  const isYoutubeBg = viralBg && !viralBg.includes('/') && !viralBg.includes('.');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl p-0 md:p-4 animate-in fade-in duration-300">
      
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative w-full h-full md:h-[85vh] md:max-w-[400px] md:aspect-[9/16] bg-black border-2 border-indigo-500/30 shadow-[0_0_80px_rgba(79,70,229,0.2)] overflow-hidden rounded-none md:rounded-3xl flex flex-col group">
        
        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-black/80 to-transparent z-[100] flex justify-between items-start p-4 pointer-events-none">
           <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="pointer-events-auto bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-white hover:text-black backdrop-blur-md border border-white/10">✕</button>
           {isSatisfying && (
               <button onClick={(e) => { e.stopPropagation(); handleGenerateVeo(); }} disabled={isGeneratingVeo} className="pointer-events-auto px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 border bg-white/10 text-white border-white/20 backdrop-blur-md">
                 {isGeneratingVeo ? <><IconRefresh className="w-3 h-3 animate-spin"/> Criando...</> : <><IconWand className="w-3 h-3" /> Fundo IA</>}
               </button>
           )}
        </div>

        {/* Play Control */}
        <div className="absolute inset-0 z-[95] flex items-center justify-center cursor-pointer" onClick={togglePlay}>
            {!isPlaying && (
                <div className="w-20 h-20 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20">
                    <IconPlay className="w-10 h-10 text-white fill-white ml-1" />
                </div>
            )}
        </div>

        {/* --- TÍTULO GANCHO (CONTEXTUAL) --- */}
        {showHookTitle && (
            <div className="absolute inset-0 z-[120] flex items-center justify-center pointer-events-none bg-black/40 backdrop-blur-[2px] animate-in fade-in zoom-in duration-300 px-6">
                <h1 className="text-4xl md:text-5xl font-black text-yellow-400 text-center uppercase leading-tight" 
                    style={{ 
                        textShadow: '4px 4px 0 #000, -2px -2px 0 #000',
                        WebkitTextStroke: '2px black',
                        fontFamily: '"Outfit", sans-serif',
                        transform: 'rotate(-2deg)'
                    }}>
                    {clip.title}
                </h1>
            </div>
        )}

        {/* Legendas (Usando state displayCaptions que tem auto-repair) */}
        {!showHookTitle && displayCaptions.length > 0 && (
            <OpusCaptions captions={displayCaptions} currentAbsoluteTime={currentAbsoluteTime} />
        )}

        {/* --- MEME OVERLAY (Giphy Fix) --- */}
        {isMeme && (
            <div className="absolute inset-0 pointer-events-none z-[80] overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-20 bg-white flex items-center justify-center pt-8">
                    <p className="text-black font-black text-lg uppercase tracking-tighter">QUEM MAIS FAZ ISSO? 😂</p>
                </div>
                {(Math.floor(progress) % 6 === 0) && (
                    <div className="absolute top-1/4 right-4 w-28 h-28 animate-bounce">
                        <img src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExbXp1ZnJsY3g3Zm45cW02aW95Y2l6b2xpam15Y2l6b2xpam15Y2l6b2xpam15JmVwPXYxX2dpZnNfc2VhcmNoJmN0PWc/3o7bu3XilJ5BOiSGic/giphy.gif" alt="meme" className="w-full h-full object-contain drop-shadow-2xl" />
                    </div>
                )}
            </div>
        )}

        {/* --- VIDEO RENDERING --- */}
        <div className="w-full h-full flex flex-col relative bg-black">
          
          {/* VÍDEO PRINCIPAL */}
          <div className={`w-full relative overflow-hidden bg-black transition-all duration-300 ${(isSatisfying || isContext) ? 'h-[55%]' : 'h-full'}`}>
            <div className="w-full h-full relative overflow-hidden">
                <iframe 
                    className="w-full h-full object-cover pointer-events-none absolute top-1/2 left-1/2"
                    src={`https://www.youtube.com/embed/${clip.videoId}?start=${Math.floor(start)}&end=${Math.floor(end)}&autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&mute=0&loop=1&playlist=${clip.videoId}&playsinline=1&enablejsapi=1&origin=${window.location.origin}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    title="Main Content"
                    style={{ 
                        pointerEvents: 'none',
                        transform: 'translate(-50%, -50%) scale(3.2)', // Zoom centralizado
                        width: '100%',
                        height: '100%'
                    }} 
                ></iframe>
                <div className="absolute inset-0 z-10"></div>
            </div>
            {(isSatisfying || isContext) && <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black via-black/50 to-transparent z-20"></div>}
          </div>

          {/* PARTE DE BAIXO */}
          
          {/* SATISFYING LOOP */}
          {isSatisfying && (
            <div className="w-full h-[45%] relative overflow-hidden bg-zinc-900 z-0">
               {isYoutubeBg ? (
                   <iframe 
                        src={`https://www.youtube.com/embed/${viralBg}?autoplay=1&mute=1&controls=0&loop=1&playlist=${viralBg}&playsinline=1&showinfo=0&rel=0&iv_load_policy=3&fs=0`}
                        className="w-full h-full object-cover pointer-events-none absolute top-1/2 left-1/2"
                        allow="autoplay; encrypted-media"
                        title="Satisfying Background"
                        style={{ pointerEvents: 'none', transform: 'translate(-50%, -50%) scale(2.0)', width: '100%', height: '100%' }} 
                   />
               ) : (
                   <video 
                        src={viralBg} className="w-full h-full object-cover" autoPlay loop muted playsInline
                        style={{ filter: 'brightness(0.8) contrast(1.1)' }}
                        onError={() => setViralBg(SAFE_LOOPS_IDS[0])}
                   />
               )}
            </div>
          )}

          {/* CONTEXTO (THUMBNAIL REAL com BUSCA NO GOOGLE) */}
          {isContext && (
             <div className="w-full h-[45%] relative overflow-hidden bg-zinc-900 z-0 flex items-center justify-center">
                 <img 
                    src={displayImage} 
                    alt="Contexto" 
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-1000"
                    onError={handleImageError}
                 />
                 
                 {isSearchingImage && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                         <div className="flex flex-col items-center gap-2">
                             <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                             <span className="text-xs text-indigo-400 font-bold">Buscando foto...</span>
                         </div>
                     </div>
                 )}

                 <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80"></div>
                 <div className="absolute bottom-6 left-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-lg border border-white/10 flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs shadow-lg ring-2 ring-white/20">P+</div>
                     <div>
                         <div className="text-xs font-bold text-white uppercase tracking-wider">Assunto do Momento</div>
                         <div className="text-[10px] text-slate-300">Entrevista Exclusiva • Ao Vivo</div>
                     </div>
                 </div>
             </div>
          )}

        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 h-1.5 bg-white/20 w-full z-[100]">
             <div className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] transition-all duration-100 ease-linear" style={{ width: `${(progress / duration) * 100}%` }}></div>
        </div>

      </div>
    </div>
  );
};

export default VideoPlayer;
