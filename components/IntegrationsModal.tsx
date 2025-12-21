
import React, { useState } from 'react';
import { ConnectedAccount, SocialPlatform } from '../types';
import { IconTikTok, IconInstagram, IconYoutube, IconKwai, IconCheckCircle, IconLink, IconPlus } from './Icons';

interface IntegrationsModalProps {
  accounts: ConnectedAccount[];
  onConnect: (platform: SocialPlatform) => void;
  onDisconnect: (accountId: string) => void;
  onClose: () => void;
}

const IntegrationsModal: React.FC<IntegrationsModalProps> = ({ accounts, onConnect, onDisconnect, onClose }) => {
  const [connecting, setConnecting] = useState<SocialPlatform | null>(null);

  const handleConnect = (platform: SocialPlatform) => {
    setConnecting(platform);
    // Simulate OAuth delay
    setTimeout(() => {
      onConnect(platform);
      setConnecting(null);
    }, 1500);
  };

  const PLATFORMS: { id: SocialPlatform; name: string; icon: any; color: string }[] = [
    { id: 'TIKTOK', name: 'TikTok', icon: IconTikTok, color: 'text-white bg-black' },
    { id: 'INSTAGRAM', name: 'Instagram', icon: IconInstagram, color: 'text-white bg-gradient-to-tr from-yellow-500 via-pink-600 to-purple-700' },
    { id: 'YOUTUBE', name: 'YouTube Shorts', icon: IconYoutube, color: 'text-white bg-red-600' },
    { id: 'KWAI', name: 'Kwai', icon: IconKwai, color: 'text-white bg-orange-500' },
  ];

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-4xl bg-stark-950 border border-stark-border shadow-2xl rounded-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-stark-900/50 p-6 border-b border-stark-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-stark-accent/10 text-stark-accent">
                    <IconLink className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-white font-bold text-lg">Hub de Múltiplas Contas</h3>
                    <p className="text-sm text-slate-500">Gerencie múltiplas contas para cada rede social</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors p-2">✕</button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6">
            {PLATFORMS.map(platform => {
                const platformAccounts = accounts.filter(a => a.platform === platform.id);
                const isProcessing = connecting === platform.id;

                return (
                    <div key={platform.id} className="bg-grafite-900 border border-giz-500 rounded-xl flex flex-col hover:border-white/20 transition-colors">
                        
                        {/* Platform Header */}
                        <div className="p-5 border-b border-giz-500/50 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${platform.color}`}>
                                    <platform.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-base">{platform.name}</h4>
                                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">{platformAccounts.length} Conectadas</span>
                                </div>
                             </div>
                             <button 
                                onClick={() => handleConnect(platform.id)}
                                disabled={isProcessing}
                                className="w-8 h-8 rounded-full bg-grafite-800 hover:bg-white hover:text-grafite-950 border border-giz-500 flex items-center justify-center transition-all disabled:opacity-50"
                                title="Adicionar nova conta"
                             >
                                {isProcessing ? <div className="w-4 h-4 border-2 border-slate-500 border-t-white rounded-full animate-spin"/> : <IconPlus className="w-4 h-4" />}
                             </button>
                        </div>

                        {/* Accounts List */}
                        <div className="p-2">
                            {platformAccounts.length > 0 ? (
                                <div className="space-y-1">
                                    {platformAccounts.map(acc => (
                                        <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-grafite-800/50 group transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-slate-700">
                                                    {acc.avatarUrl && <img src={acc.avatarUrl} alt="avatar" className="w-full h-full object-cover" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium text-white">@{acc.username}</span>
                                                    <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> Online
                                                    </span>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => onDisconnect(acc.id)}
                                                className="text-xs text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1"
                                            >
                                                Desconectar
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-slate-500">Nenhuma conta conectada.</p>
                                    <button onClick={() => handleConnect(platform.id)} className="text-xs text-stark-accent hover:underline mt-1">Conectar primeira conta</button>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stark-900 border-t border-stark-border text-center shrink-0">
             <p className="text-[10px] text-slate-600">
                 🔐 Suas credenciais são protegidas com criptografia de ponta a ponta. Gerencie múltiplas contas com facilidade.
             </p>
        </div>

      </div>
    </div>
  );
};

export default IntegrationsModal;