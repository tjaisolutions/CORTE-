import React from 'react';
import { ViralAudit, GeneratedClip } from '../types';
import { IconWand, IconTrendingUp, IconTrendingDown, IconZap } from './Icons';

interface ViralAuditModalProps {
  clip: GeneratedClip;
  audit: ViralAudit | null;
  isLoading: boolean;
  onClose: () => void;
}

const ViralAuditModal: React.FC<ViralAuditModalProps> = ({ clip, audit, isLoading, onClose }) => {
  
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-stark-950 border border-stark-border shadow-2xl rounded-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-stark-900/50 p-5 border-b border-stark-border flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${isLoading ? 'bg-stark-accent/10 text-stark-accent' : 'bg-purple-500/10 text-purple-400'}`}>
                    <IconWand className={`w-5 h-5 ${isLoading ? 'animate-pulse' : ''}`} />
                </div>
                <div>
                    <h3 className="text-white font-semibold">Auditoria de Potencial Viral</h3>
                    <p className="text-xs text-slate-500">IA Preditiva de Algoritmo</p>
                </div>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="p-6">
            {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 border-4 border-stark-accent/30 border-t-stark-accent rounded-full animate-spin mb-6"></div>
                    <h4 className="text-white font-medium mb-2">Analisando Padrões de Retenção...</h4>
                    <p className="text-slate-500 text-sm max-w-xs">A IA está comparando seu corte com milhões de vídeos virais do TikTok e Reels.</p>
                </div>
            ) : audit ? (
                <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500">
                    
                    {/* Score Hero */}
                    <div className="flex items-center justify-between bg-stark-900 rounded-xl p-4 border border-stark-border">
                        <div>
                            <div className="text-sm text-slate-400 font-medium mb-1">Viral Score</div>
                            <div className={`text-4xl font-bold ${audit.score >= 80 ? 'text-emerald-400' : audit.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {audit.score}<span className="text-lg text-slate-600">/100</span>
                            </div>
                        </div>
                        <div className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            audit.verdict === 'VIRAL' ? 'bg-emerald-500/20 text-emerald-400' : 
                            audit.verdict === 'BOM' ? 'bg-blue-500/20 text-blue-400' : 
                            'bg-red-500/20 text-red-400'
                        }`}>
                            {audit.verdict}
                        </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-stark-900/50 p-4 rounded-lg border border-stark-border/50">
                            <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm font-medium">
                                <IconZap className="w-4 h-4 text-yellow-400" /> Hook (Início)
                            </div>
                            <div className="w-full h-2 bg-stark-800 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${audit.hookRating * 10}%` }}></div>
                            </div>
                            <div className="mt-1 text-right text-xs text-slate-500">{audit.hookRating}/10</div>
                        </div>
                        <div className="bg-stark-900/50 p-4 rounded-lg border border-stark-border/50">
                            <div className="flex items-center gap-2 mb-2 text-slate-300 text-sm font-medium">
                                <IconTrendingUp className="w-4 h-4 text-blue-400" /> Retenção Prevista
                            </div>
                            <div className="text-xs text-slate-400 leading-tight">
                                {audit.retentionPrediction}
                            </div>
                        </div>
                    </div>

                    {/* Reasoning */}
                    <div className="text-sm text-slate-300 bg-stark-800/30 p-4 rounded-lg border border-stark-border/50 italic">
                        "{audit.reasoning}"
                    </div>

                    {/* Suggestions */}
                    <div>
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sugestões de Otimização</h4>
                        <ul className="space-y-2">
                            {audit.suggestions.map((sug, i) => (
                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-stark-accent shrink-0"></span>
                                    {sug}
                                </li>
                            ))}
                        </ul>
                    </div>

                </div>
            ) : (
                <div className="text-red-500 text-center">Erro na análise. Tente novamente.</div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stark-900 border-t border-stark-border flex justify-end">
            <button 
                onClick={onClose}
                className="px-6 py-2 bg-white text-stark-950 font-bold text-sm rounded-lg hover:bg-slate-200 transition-colors"
            >
                Entendido
            </button>
        </div>

      </div>
    </div>
  );
};

export default ViralAuditModal;