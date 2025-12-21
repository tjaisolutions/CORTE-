
import React, { useState } from 'react';
import { GeneratedClip, AutoReplyConfig } from '../types';
import { IconBot, IconMessageCircle, IconZap } from './Icons';

interface AutoReplyModalProps {
  clip: GeneratedClip;
  onSave: (config: AutoReplyConfig) => void;
  onClose: () => void;
}

const AutoReplyModal: React.FC<AutoReplyModalProps> = ({ clip, onSave, onClose }) => {
  const [isActive, setIsActive] = useState(false);
  const [personality, setPersonality] = useState<'POLITE' | 'CONTROVERSIAL' | 'FUNNY'>('POLITE');

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-stark-950 border border-stark-border shadow-2xl rounded-xl overflow-hidden">
        
        <div className="bg-stark-900/50 p-5 border-b border-stark-border flex items-center gap-3">
           <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
             <IconBot className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-white font-semibold">Auto-Reply AI Agent</h3>
             <p className="text-xs text-slate-500">Engajamento automático pós-publicação</p>
           </div>
        </div>

        <div className="p-6 space-y-6">
           <div className="flex items-center justify-between p-4 bg-stark-900 rounded-lg border border-stark-border">
              <div>
                 <div className="font-medium text-white text-sm">Ativar Agente</div>
                 <div className="text-xs text-slate-500">Responderá os primeiros 20 comentários</div>
              </div>
              <button 
                onClick={() => setIsActive(!isActive)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${isActive ? 'bg-stark-accent' : 'bg-stark-700'}`}
              >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
           </div>

           {isActive && (
             <div className="animate-in fade-in slide-in-from-top-2">
                <label className="text-xs text-slate-400 uppercase font-bold mb-3 block">Personalidade do Bot</label>
                <div className="grid grid-cols-1 gap-2">
                   {[
                     { id: 'POLITE', label: 'Educado & Prestativo', desc: 'Agradece e tira dúvidas.' },
                     { id: 'FUNNY', label: 'Engraçado / Meme', desc: 'Usa gírias e emojis.' },
                     { id: 'CONTROVERSIAL', label: 'Polêmico (Bait)', desc: 'Gera debate para aumentar alcance.' }
                   ].map((p) => (
                     <button
                       key={p.id}
                       onClick={() => setPersonality(p.id as any)}
                       className={`text-left p-3 rounded-lg border transition-all ${personality === p.id ? 'bg-stark-800 border-stark-accent' : 'bg-stark-950 border-stark-border opacity-60'}`}
                     >
                        <div className={`text-sm font-bold ${personality === p.id ? 'text-white' : 'text-slate-400'}`}>{p.label}</div>
                        <div className="text-xs text-slate-600">{p.desc}</div>
                     </button>
                   ))}
                </div>

                <div className="mt-6 bg-stark-900 p-3 rounded border border-stark-border/50">
                   <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                      <IconMessageCircle className="w-3 h-3" /> Simulação de Resposta:
                   </div>
                   <div className="text-xs text-white italic">
                      "{personality === 'POLITE' ? 'Muito obrigado pelo comentário! Concordo totalmente 🙏' : personality === 'FUNNY' ? 'KKKKK eu na vida real 💀' : 'Discordo, você viu o vídeo até o final? 🤔'}"
                   </div>
                </div>
             </div>
           )}
        </div>

        <div className="p-4 bg-stark-900 border-t border-stark-border flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</button>
           <button onClick={() => { onSave({ isActive, personality, replyLimit: 20 }); onClose(); }} className="px-6 py-2 bg-stark-accent hover:bg-white hover:text-stark-950 text-white font-bold rounded-lg text-sm">Salvar Configuração</button>
        </div>
      </div>
    </div>
  );
};

export default AutoReplyModal;
