
import React, { useState } from 'react';
import { GeneratedClip, ManualEdits } from '../types';
import { IconScissors, IconText, IconPalette, IconCheck, IconSettings, IconMic, IconCloud, IconZap, IconShield, IconFaceId, IconImage } from './Icons';

interface EditorModalProps {
  clip: GeneratedClip;
  onSave: (clipId: string, edits: ManualEdits) => void;
  onClose: () => void;
  onCheckCopyright?: (clipId: string) => void;
}

const EditorModal: React.FC<EditorModalProps> = ({ clip, onSave, onClose, onCheckCopyright }) => {
  const [activeTab, setActiveTab] = useState<'trim' | 'caption' | 'brand' | 'dub' | 'bg'>('trim');
  
  // State for edits
  const [start, setStart] = useState(clip.manualEdits?.trimStart ?? clip.startTime);
  const [end, setEnd] = useState(clip.manualEdits?.trimEnd ?? clip.endTime);
  const [text, setText] = useState(clip.manualEdits?.customTranscript ?? clip.transcriptSnippet);
  const [title, setTitle] = useState(clip.manualEdits?.customTitle ?? clip.title);
  const [brandColor, setBrandColor] = useState(clip.manualEdits?.branding?.primaryColor ?? '#ffff00');
  const [isDubbed, setIsDubbed] = useState(clip.manualEdits?.isDubbed ?? false);
  const [isLipSynced, setIsLipSynced] = useState(clip.manualEdits?.isLipSynced ?? false);
  const [isOverdubbed, setIsOverdubbed] = useState(clip.manualEdits?.isOverdubbed ?? false);
  const [isProcessingOverdub, setIsProcessingOverdub] = useState(false);
  const [bgPrompt, setBgPrompt] = useState(clip.manualEdits?.backgroundPrompt ?? clip.backgroundPrompt ?? "Satisfying visual loop");

  const duration = end - start;

  const handleSave = () => {
    onSave(clip.id, {
      trimStart: start,
      trimEnd: end,
      customTranscript: text,
      customTitle: title,
      isDubbed: isDubbed,
      isLipSynced: isLipSynced,
      isOverdubbed: isOverdubbed,
      backgroundPrompt: bgPrompt,
      branding: {
        primaryColor: brandColor,
        showWatermark: true,
        logoUrl: ''
      }
    });
    onClose();
  };

  const handleOverdub = () => {
    setIsProcessingOverdub(true);
    setTimeout(() => {
        setIsOverdubbed(true);
        setIsProcessingOverdub(false);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl bg-stark-950 border border-stark-border shadow-2xl rounded-xl overflow-hidden flex flex-col md:flex-row h-[85vh]">
        
        {/* Left Side: Preview */}
        <div className="w-full md:w-1/3 bg-black flex items-center justify-center relative border-r border-stark-border">
          <div className="aspect-[9/16] h-full max-h-[600px] w-full relative">
            <img src={clip.videoUrl} className="w-full h-full object-cover opacity-60" alt="preview" />
            
            {/* Branding Overlay Sim */}
            <div className="absolute inset-0 flex flex-col items-center justify-end pb-20 px-6">
                <p className="text-center font-bold text-xl drop-shadow-md leading-tight" style={{ color: brandColor }}>
                    "{text}"
                </p>
            </div>
            
            {/* Badges */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                {isDubbed && (
                    <div className="bg-stark-accent text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                        PT-BR Dublado
                    </div>
                )}
                {isLipSynced && (
                    <div className="bg-emerald-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg">
                        Lip-Sync Natural
                    </div>
                )}
                {isOverdubbed && (
                    <div className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-bold shadow-lg flex items-center gap-1">
                        <IconZap className="w-3 h-3" /> Voice Cloned
                    </div>
                )}
            </div>
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="flex-1 flex flex-col bg-stark-900">
            
            {/* Header */}
            <div className="p-4 border-b border-stark-border flex justify-between items-center bg-stark-950">
                <div className="flex items-center gap-2">
                    <IconSettings className="w-5 h-5 text-stark-accent" />
                    <h3 className="font-semibold text-white">Corte+ Studio Editor</h3>
                    <span className="text-xs text-slate-500 ml-2">Modo Profissional</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => onCheckCopyright && onCheckCopyright(clip.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-900/30 text-red-400 text-xs rounded border border-red-900/50 hover:bg-red-900/50"
                  >
                     <IconShield className="w-3 h-3" /> Check Copyright
                  </button>
                  <button onClick={onClose} className="text-slate-500 hover:text-white">✕</button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-stark-border bg-stark-900 overflow-x-auto">
                {[
                    { id: 'trim', label: 'Corte', icon: IconScissors },
                    { id: 'caption', label: 'Legendas', icon: IconText },
                    { id: 'bg', label: 'Fundo IA', icon: IconImage },
                    { id: 'brand', label: 'Marca', icon: IconPalette },
                    { id: 'dub', label: 'Dublagem', icon: IconMic },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex-1 min-w-[80px] py-3 text-xs font-medium flex items-center justify-center gap-2 border-b-2 transition-colors ${activeTab === tab.id ? 'border-stark-accent text-white bg-stark-800/50' : 'border-transparent text-slate-400 hover:bg-stark-800/30'}`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                
                {activeTab === 'trim' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Título do Projeto</label>
                            <input 
                                type="text" 
                                value={title} 
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full mt-2 bg-stark-950 border border-stark-border rounded p-3 text-white focus:border-stark-accent focus:outline-none"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <label className="text-xs text-slate-400 uppercase font-bold">Timeline (Segundos)</label>
                                <span className="text-xs text-stark-accent font-mono">Duração: {duration}s</span>
                            </div>
                            <div className="bg-stark-950 p-6 rounded-lg border border-stark-border relative select-none">
                                {/* Visual Slider Simulation */}
                                <div className="h-12 bg-stark-800 rounded relative overflow-hidden mb-4">
                                    <div 
                                        className="absolute top-0 bottom-0 bg-stark-accent/20 border-l-2 border-r-2 border-stark-accent"
                                        style={{ left: '10%', right: '10%' }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-20">
                                        <div className="flex gap-1">
                                            {[...Array(20)].map((_, i) => <div key={i} className={`w-1 bg-white ${i % 3 === 0 ? 'h-8' : 'h-4'}`}></div>)}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] text-slate-500">Início</span>
                                        <input type="number" value={start} onChange={(e) => setStart(Number(e.target.value))} className="w-full bg-black border border-stark-border rounded p-2 text-white text-sm" />
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-500">Fim</span>
                                        <input type="number" value={end} onChange={(e) => setEnd(Number(e.target.value))} className="w-full bg-black border border-stark-border rounded p-2 text-white text-sm" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'caption' && (
                    <div className="space-y-4">
                        <label className="text-xs text-slate-400 uppercase font-bold">Editor de Transcrição</label>
                        <p className="text-xs text-slate-500">Corrija erros da IA. Use o Overdub para corrigir o áudio também.</p>
                        <textarea 
                            value={text} 
                            onChange={(e) => setText(e.target.value)}
                            className="w-full h-40 bg-stark-950 border border-stark-border rounded p-4 text-white focus:border-stark-accent focus:outline-none text-lg leading-relaxed"
                        />
                        
                        <div className="flex justify-end">
                            <button 
                                onClick={handleOverdub}
                                disabled={isProcessingOverdub || isOverdubbed}
                                className={`text-xs font-bold px-4 py-2 rounded flex items-center gap-2 ${isOverdubbed ? 'bg-purple-900/30 text-purple-400 cursor-default' : 'bg-stark-800 hover:bg-stark-700 text-white'}`}
                            >
                                {isProcessingOverdub ? (
                                    <>Sintetizando Voz...</>
                                ) : isOverdubbed ? (
                                    <><IconCheck className="w-3 h-3" /> Áudio Corrigido (Overdub)</>
                                ) : (
                                    <><IconZap className="w-3 h-3" /> Regenerar Áudio (Overdub)</>
                                )}
                            </button>
                        </div>
                    </div>
                )}
                
                {activeTab === 'bg' && (
                    <div className="space-y-6">
                        <div className="bg-indigo-500/10 border border-indigo-500/30 p-4 rounded-lg">
                            <h4 className="text-indigo-400 font-bold text-sm mb-2 flex items-center gap-2">
                                <IconZap className="w-4 h-4" /> Google Veo (Geração de Vídeo)
                            </h4>
                            <p className="text-xs text-slate-400">
                                Escreva um prompt detalhado para gerar um vídeo de fundo exclusivo.
                                O vídeo será gerado automaticamente na próxima vez que você abrir o player.
                            </p>
                        </div>
                        
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold">Prompt para o Modelo Veo</label>
                            <textarea 
                                value={bgPrompt} 
                                onChange={(e) => setBgPrompt(e.target.value)}
                                placeholder="Ex: Minecraft parkour gameplay, high speed, 4k"
                                className="w-full h-32 mt-2 bg-stark-950 border border-stark-border rounded p-4 text-white focus:border-stark-accent focus:outline-none text-sm leading-relaxed"
                            />
                        </div>
                        
                        <div className="flex gap-2">
                             <button onClick={() => setBgPrompt("Satisfying kinetic sand cutting with a knife, ASMR visual")} className="text-xs bg-stark-800 px-3 py-1 rounded text-slate-300 hover:text-white">Areia Cinética</button>
                             <button onClick={() => setBgPrompt("Minecraft parkour gameplay fast paced")} className="text-xs bg-stark-800 px-3 py-1 rounded text-slate-300 hover:text-white">Minecraft</button>
                             <button onClick={() => setBgPrompt("Subway surfers gameplay high score run")} className="text-xs bg-stark-800 px-3 py-1 rounded text-slate-300 hover:text-white">Subway Surfers</button>
                        </div>
                    </div>
                )}

                {activeTab === 'brand' && (
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold mb-3 block">Cor de Destaque (Legendas)</label>
                            <div className="flex gap-3">
                                {['#ffff00', '#00ff00', '#ff0000', '#00ffff', '#ffffff'].map(color => (
                                    <button 
                                        key={color}
                                        onClick={() => setBrandColor(color)}
                                        className={`w-10 h-10 rounded-full border-2 ${brandColor === color ? 'border-white' : 'border-transparent'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                                <input 
                                    type="color" 
                                    value={brandColor} 
                                    onChange={(e) => setBrandColor(e.target.value)}
                                    className="w-10 h-10 bg-transparent cursor-pointer"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-xs text-slate-400 uppercase font-bold mb-3 block">Logo / Marca D'água</label>
                            <div className="border border-dashed border-stark-border rounded-lg p-8 flex flex-col items-center justify-center text-slate-500 hover:border-stark-accent hover:text-stark-accent cursor-pointer transition-colors bg-stark-950">
                                <IconCloud className="w-8 h-8 mb-2" />
                                <span className="text-sm">Arraste sua logo aqui (PNG)</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'dub' && (
                    <div className="space-y-6 text-center py-4">
                        <div className="w-20 h-20 bg-stark-800 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                            <IconMic className="w-10 h-10 text-stark-accent" />
                            {isDubbed && <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-black text-xs font-bold">✓</div>}
                        </div>
                        <h4 className="text-white font-bold text-lg">Dublagem Neural Enterprise</h4>
                        <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">Traduza este corte para Português (BR) mantendo o tom de voz original do falante.</p>
                        
                        <div className="flex justify-center gap-4 mb-6">
                           <button 
                                onClick={() => setIsDubbed(!isDubbed)}
                                className={`px-6 py-3 rounded-lg font-bold text-sm transition-all ${isDubbed ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-stark-accent text-stark-950 hover:bg-white'}`}
                            >
                                {isDubbed ? 'Dublagem Ativa (Remover)' : 'Gerar Dublagem PT-BR'}
                            </button>
                        </div>
                        
                        {isDubbed && (
                           <div className="flex justify-center animate-in fade-in">
                               <button 
                                 onClick={() => setIsLipSynced(!isLipSynced)}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${isLipSynced ? 'bg-stark-accent/20 border-stark-accent text-stark-accent' : 'bg-black border-slate-700 text-slate-400'}`}
                               >
                                  <IconFaceId className="w-4 h-4" />
                                  Lip-Sync Neural (Sincronia Labial)
                                  {isLipSynced && <IconCheck className="w-4 h-4" />}
                               </button>
                           </div>
                        )}

                        <div className="text-[10px] text-slate-600 mt-6">
                            *Utiliza ElevenLabs Enterprise v2 + Wav2Lip Gan
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 bg-stark-900 border-t border-stark-border flex justify-end gap-3">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 bg-stark-accent hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                >
                    <IconCheck className="w-4 h-4" />
                    Salvar Alterações
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default EditorModal;
