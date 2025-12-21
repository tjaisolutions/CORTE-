
import React, { useState } from 'react';
import { CutStyle, AudioMood, BRollType, FaceTrackingMode, EditingConfig, SocialPlatform } from '../types';
import { STYLE_LABELS, AUDIO_LABELS, MOCK_VIRAL_TRACKS } from '../constants';
import { IconLayers, IconMusic, IconFaceId, IconTikTok, IconInstagram, IconYoutube, IconPlay, IconPause, IconTrendingUp } from './Icons';

interface StyleSelectorProps {
  config: EditingConfig;
  onChange: (config: EditingConfig) => void;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ config, onChange }) => {
  const [activeTab, setActiveTab] = useState<'visual' | 'audio' | 'ai'>('visual');
  const [viralPlatformFilter, setViralPlatformFilter] = useState<SocialPlatform>('TIKTOK');
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

  const tabs = [
    { id: 'visual', label: 'Estilo Visual', icon: IconLayers },
    { id: 'audio', label: 'Áudio Viral', icon: IconMusic },
    { id: 'ai', label: 'Inteligência', icon: IconFaceId },
  ];

  const toggleStyle = (style: CutStyle) => {
    const current = config.styles;
    const next = current.includes(style) ? current.filter(s => s !== style) : [...current, style];
    if (next.length) onChange({ ...config, styles: next });
  };

  const togglePlayTrack = (trackId: string) => {
      if (playingTrackId === trackId) {
          setPlayingTrackId(null);
      } else {
          setPlayingTrackId(trackId);
          setTimeout(() => setPlayingTrackId(null), 5000);
      }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-giz-500 mb-8">
         {tabs.map(tab => (
            <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id as any)}
               className={`flex items-center gap-3 px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id 
                  ? 'border-white text-white bg-grafite-800' 
                  : 'border-transparent text-gelo-300 hover:text-white hover:bg-grafite-900'
               }`}
            >
               <tab.icon className="w-4 h-4" />
               {tab.label}
            </button>
         ))}
      </div>

      {/* Content */}
      <div className="min-h-[240px] animate-slide-up">
         {activeTab === 'visual' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
               {Object.values(CutStyle).map(style => {
                  const isActive = config.styles.includes(style);
                  
                  let description = "";
                  switch(style) {
                      case CutStyle.SPLIT_CONTEXT: description = "Vídeo em cima, foto estática do participante/contexto embaixo."; break;
                      case CutStyle.SPLIT_SATISFYING: description = "Vídeo em cima, vídeo satisfatório (Slime/GTA/Press) embaixo."; break;
                      case CutStyle.STANDARD_VERTICAL: description = "Vídeo vertical padrão (9:16) com legendas dinâmicas."; break;
                      case CutStyle.MEME_MODE: description = "Estilo engraçado com GIFs, overlays e música divertida."; break;
                  }

                  return (
                     <button
                        key={style}
                        onClick={() => toggleStyle(style)}
                        className={`p-6 rounded-xl border text-left transition-all relative flex flex-col justify-between h-40 ${
                           isActive 
                           ? 'bg-grafite-800 border-white text-white shadow-xl' 
                           : 'bg-grafite-900 border-giz-500 text-gelo-300 hover:border-white/30 hover:bg-grafite-800/50'
                        }`}
                     >
                        <div className="flex justify-between items-start">
                            <div className={`text-sm font-bold uppercase tracking-wider ${isActive ? 'text-white' : ''}`}>{STYLE_LABELS[style]}</div>
                            {isActive && <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>}
                        </div>
                        <div className={`text-xs leading-relaxed ${isActive ? 'text-gelo-100' : 'text-gelo-300/50'}`}>
                           {description}
                        </div>
                     </button>
                  );
               })}
            </div>
         )}
         
         {activeTab === 'audio' && (
            <div className="space-y-8">
               <div className="flex items-center justify-between p-6 bg-grafite-900 rounded-xl border border-giz-500">
                  <div>
                      <span className="text-base font-medium text-white block">Masterização de Voz (Noise Gate)</span>
                      <span className="text-xs text-gelo-300">Remove ruído de fundo e equaliza nível de broadcast</span>
                  </div>
                  <button 
                     onClick={() => onChange({...config, audioMastering: !config.audioMastering})}
                     className={`w-14 h-8 rounded-full p-1 transition-colors ${config.audioMastering ? 'bg-white' : 'bg-grafite-950 border border-giz-500'}`}
                  >
                     <div className={`w-6 h-6 rounded-full transition-transform ${config.audioMastering ? 'translate-x-6 bg-grafite-950' : 'bg-gelo-300'}`} />
                  </button>
               </div>
               
               {/* Audio Mode Toggle */}
               <div className="flex gap-4 border-b border-giz-500 pb-4">
                   <button 
                     onClick={() => onChange({...config, audioMood: AudioMood.AI_AUTO_DETECT})}
                     className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors ${config.audioMood !== AudioMood.VIRAL_PLATFORM ? 'bg-white text-grafite-950' : 'text-slate-500 hover:text-white'}`}
                   >
                     Humor Genérico
                   </button>
                   <button 
                     onClick={() => onChange({...config, audioMood: AudioMood.VIRAL_PLATFORM})}
                     className={`text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${config.audioMood === AudioMood.VIRAL_PLATFORM ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-white'}`}
                   >
                     <IconTrendingUp className="w-4 h-4" />
                     🔥 Tops Virais
                   </button>
               </div>
               
               {config.audioMood === AudioMood.VIRAL_PLATFORM ? (
                   // VIRAL TRACK SELECTOR
                   <div className="space-y-4 animate-fade-in">
                       {/* Platform Filter */}
                       <div className="flex gap-2">
                           {[
                               { id: 'TIKTOK', icon: IconTikTok, color: 'hover:text-pink-400' },
                               { id: 'INSTAGRAM', icon: IconInstagram, color: 'hover:text-purple-400' },
                               { id: 'YOUTUBE', icon: IconYoutube, color: 'hover:text-red-400' },
                           ].map(p => (
                               <button
                                   key={p.id}
                                   onClick={() => setViralPlatformFilter(p.id as SocialPlatform)}
                                   className={`flex items-center gap-2 px-4 py-2 rounded border transition-all ${viralPlatformFilter === p.id ? 'bg-grafite-800 border-white text-white' : 'bg-grafite-900 border-giz-500 text-slate-500 ' + p.color}`}
                               >
                                   <p.icon className="w-4 h-4" />
                                   <span className="text-xs font-bold">{p.id}</span>
                               </button>
                           ))}
                       </div>

                       {/* Track List */}
                       <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                           {MOCK_VIRAL_TRACKS.filter(t => t.platform === viralPlatformFilter).map(track => {
                               const isSelected = config.selectedViralTrackId === track.id;
                               const isPlaying = playingTrackId === track.id;

                               return (
                                   <div 
                                      key={track.id}
                                      className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${isSelected ? 'bg-indigo-500/10 border-indigo-500' : 'bg-grafite-900 border-giz-500 hover:bg-grafite-800'}`}
                                   >
                                       <div className="relative w-10 h-10 rounded overflow-hidden shrink-0 group">
                                           <img src={track.coverUrl} className="w-full h-full object-cover" alt="cover" />
                                           <button 
                                              onClick={(e) => { e.stopPropagation(); togglePlayTrack(track.id); }}
                                              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                           >
                                               {isPlaying ? <IconPause className="w-4 h-4 text-white" /> : <IconPlay className="w-4 h-4 text-white" />}
                                           </button>
                                       </div>
                                       
                                       <div className="flex-1 min-w-0">
                                           <div className="text-sm font-bold text-white truncate">{track.title}</div>
                                           <div className="text-xs text-slate-400 truncate">{track.artist}</div>
                                       </div>

                                       <div className="flex items-center gap-3">
                                            <div className="text-xs font-mono text-emerald-400">Score: {track.trendingScore}</div>
                                            <button 
                                                onClick={() => onChange({...config, selectedViralTrackId: track.id})}
                                                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-300 hover:bg-white hover:text-grafite-950'}`}
                                            >
                                                {isSelected ? 'Selecionado' : 'Usar'}
                                            </button>
                                       </div>
                                   </div>
                               );
                           })}
                       </div>
                   </div>
               ) : (
                   // GENERIC MOOD SELECTOR
                   <div className="grid grid-cols-2 gap-3 animate-fade-in">
                      {Object.keys(AUDIO_LABELS).filter(k => k !== 'VIRAL_PLATFORM').map(moodKey => {
                         const mood = moodKey as AudioMood;
                         return (
                             <button
                                key={mood}
                                onClick={() => onChange({...config, audioMood: mood})}
                                className={`p-4 text-sm rounded-lg border transition-all font-medium ${
                                   config.audioMood === mood 
                                   ? 'bg-grafite-800 text-white border-white' 
                                   : 'bg-grafite-900 text-gelo-300 border-giz-500 hover:border-white/30'
                                }`}
                             >
                                {AUDIO_LABELS[mood]}
                             </button>
                         );
                      })}
                   </div>
               )}
            </div>
         )}
         
         {activeTab === 'ai' && (
            <div className="grid grid-cols-1 gap-4">
                <button
                    onClick={() => onChange({...config, faceTracking: FaceTrackingMode.ACTIVE_SPEAKER_AI})}
                    className={`p-6 rounded-xl border text-left transition-colors flex items-start gap-4 ${config.faceTracking === FaceTrackingMode.ACTIVE_SPEAKER_AI ? 'bg-grafite-800 border-white text-white' : 'bg-grafite-900 border-giz-500 hover:border-white/30'}`}
                >
                    <div className="p-3 bg-grafite-950 rounded-lg border border-giz-500">
                        <IconFaceId className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-base font-bold mb-1">Rastreamento Facial Ativo</div>
                        <div className={`text-sm ${config.faceTracking === FaceTrackingMode.ACTIVE_SPEAKER_AI ? 'text-gelo-100' : 'text-gelo-300/50'}`}>IA detecta e centraliza quem está falando automaticamente, movendo a câmera virtual.</div>
                    </div>
                </button>
                <button
                    onClick={() => onChange({...config, bRollType: BRollType.AI_AUTO_DETECT})}
                    className={`p-6 rounded-xl border text-left transition-colors flex items-start gap-4 ${config.bRollType === BRollType.AI_AUTO_DETECT ? 'bg-grafite-800 border-white text-white' : 'bg-grafite-900 border-giz-500 hover:border-white/30'}`}
                >
                    <div className="p-3 bg-grafite-950 rounded-lg border border-giz-500">
                        <IconLayers className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-base font-bold mb-1">B-Roll Semântico</div>
                        <div className={`text-sm ${config.bRollType === BRollType.AI_AUTO_DETECT ? 'text-gelo-100' : 'text-gelo-300/50'}`}>Insere imagens de contexto automaticamente quando palavras-chave são detectadas.</div>
                    </div>
                </button>
            </div>
         )}
      </div>
    </div>
  );
};

export default StyleSelector;
