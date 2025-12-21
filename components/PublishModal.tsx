
import React, { useState, useEffect } from 'react';
import { GeneratedClip, ConnectedAccount, SocialPlatform } from '../types';
import { IconShare, IconCheckCircle, IconTikTok, IconInstagram, IconYoutube, IconKwai, IconCloud } from './Icons';

interface PublishModalProps {
  clip: GeneratedClip;
  accounts: ConnectedAccount[];
  onPublish: (clipId: string, accountIds: string[]) => void;
  onClose: () => void;
}

const PublishModal: React.FC<PublishModalProps> = ({ clip, accounts, onPublish, onClose }) => {
  // Available connected accounts
  const availableAccounts = accounts.filter(a => a.isConnected);
  
  // State holds IDs of selected ACCOUNTS, not platforms
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(availableAccounts.map(a => a.id));
  const [step, setStep] = useState<'review' | 'uploading' | 'done'>('review');
  const [progress, setProgress] = useState<Record<string, number>>({});

  const toggleAccount = (id: string) => {
    if (selectedAccountIds.includes(id)) {
        setSelectedAccountIds(selectedAccountIds.filter(aid => aid !== id));
    } else {
        setSelectedAccountIds([...selectedAccountIds, id]);
    }
  };

  const handleStartPublish = () => {
    setStep('uploading');
    
    // Simulate progress for each selected account
    const interval = setInterval(() => {
        setProgress(prev => {
            const newProgress = { ...prev };
            let allDone = true;
            
            selectedAccountIds.forEach(id => {
                const current = newProgress[id] || 0;
                if (current < 100) {
                    newProgress[id] = current + Math.random() * 10;
                    allDone = false;
                } else {
                    newProgress[id] = 100;
                }
            });

            if (allDone) {
                clearInterval(interval);
                setTimeout(() => {
                    onPublish(clip.id, selectedAccountIds);
                    setStep('done');
                }, 500);
            }
            return newProgress;
        });
    }, 200);
  };

  const getIcon = (p: SocialPlatform) => {
    switch(p) {
        case 'TIKTOK': return IconTikTok;
        case 'INSTAGRAM': return IconInstagram;
        case 'YOUTUBE': return IconYoutube;
        case 'KWAI': return IconKwai;
        default: return IconShare;
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={step === 'done' ? onClose : undefined}></div>
      
      <div className="relative w-full max-w-lg bg-stark-950 border border-stark-border shadow-2xl rounded-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-stark-900/50 p-5 border-b border-stark-border">
             <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                    <IconShare className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-white font-semibold">One-Click Publishing</h3>
                    <p className="text-xs text-slate-500">Distribuição automática de conteúdo</p>
                </div>
            </div>
        </div>

        {/* Content */}
        <div className="p-6">
            
            {step === 'review' && (
                <div className="space-y-6">
                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold mb-3 block">Selecione as Contas de Destino</label>
                        <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                            {availableAccounts.length > 0 ? availableAccounts.map(acc => {
                                const Icon = getIcon(acc.platform);
                                const isSelected = selectedAccountIds.includes(acc.id);
                                return (
                                    <button 
                                        key={acc.id}
                                        onClick={() => toggleAccount(acc.id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all w-full text-left ${isSelected ? 'bg-stark-800 border-stark-accent' : 'bg-stark-900 border-stark-border opacity-60'}`}
                                    >
                                        <div className="bg-grafite-950 p-1.5 rounded">
                                            <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                                        </div>
                                        <div className="flex-1">
                                            <div className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-slate-500'}`}>{acc.platform}</div>
                                            <div className="text-xs text-slate-500">@{acc.username}</div>
                                        </div>
                                        {isSelected && <IconCheckCircle className="w-5 h-5 text-stark-accent ml-auto" />}
                                    </button>
                                );
                            }) : (
                                <div className="text-center text-sm text-slate-500 py-4 border border-dashed border-stark-border rounded">Nenhuma conta conectada.</div>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Caption (Legenda Padrão)</label>
                        <div className="bg-stark-900 border border-stark-border rounded p-3 text-xs text-slate-300 font-mono">
                            {clip.socialMetadata?.[0]?.caption || clip.title}
                            <br/><br/>
                            <span className="text-stark-accent/70">{clip.hashtags.join(' ')}</span>
                        </div>
                    </div>
                </div>
            )}

            {step === 'uploading' && (
                <div className="space-y-6 py-6">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-stark-800 rounded-full flex items-center justify-center relative">
                            <IconCloud className="w-10 h-10 text-stark-accent animate-pulse" />
                            <div className="absolute inset-0 border-4 border-stark-accent/20 rounded-full border-t-stark-accent animate-spin"></div>
                        </div>
                    </div>
                    
                    <div className="space-y-3">
                        {selectedAccountIds.map(id => {
                             const acc = accounts.find(a => a.id === id);
                             if (!acc) return null;
                             const Icon = getIcon(acc.platform);
                             const prog = Math.min(100, progress[id] || 0);
                             return (
                                <div key={id} className="bg-stark-900 p-3 rounded border border-stark-border">
                                    <div className="flex justify-between text-xs mb-1 text-slate-400">
                                        <span className="flex items-center gap-2">
                                            <Icon className="w-3 h-3"/> 
                                            <span className="truncate max-w-[150px]">Enviando para @{acc.username}...</span>
                                        </span>
                                        <span>{prog.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-stark-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-stark-accent transition-all duration-200" style={{ width: `${prog}%` }}></div>
                                    </div>
                                </div>
                             )
                        })}
                    </div>
                </div>
            )}

            {step === 'done' && (
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20">
                        <IconCheckCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Publicado com Sucesso!</h3>
                    <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">
                        Seu vídeo foi enviado para as filas de processamento das contas selecionadas.
                    </p>
                    <div className="bg-stark-900 rounded p-4 border border-stark-border text-xs text-left">
                        <div className="flex flex-col gap-2">
                            {selectedAccountIds.map(id => {
                                const acc = accounts.find(a => a.id === id);
                                if (!acc) return null;
                                return (
                                    <div key={id} className="flex justify-between text-slate-300">
                                        <span>@{acc.username}</span>
                                        <span className="text-emerald-500 font-bold">AGENDADO ✓</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stark-900 border-t border-stark-border flex justify-end gap-3">
            {step === 'review' && (
                <>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white">Cancelar</button>
                    <button 
                        onClick={handleStartPublish}
                        disabled={selectedAccountIds.length === 0}
                        className="px-6 py-2 bg-stark-accent hover:bg-blue-600 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <IconShare className="w-4 h-4" />
                        Publicar Agora
                    </button>
                </>
            )}
            {step === 'done' && (
                <button onClick={onClose} className="w-full px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-sm">
                    Fechar
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

export default PublishModal;