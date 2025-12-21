
import React from 'react';
import { IconZap, IconRocket, IconScissors, IconFaceId, IconMagic, IconCloud, IconCheckCircle } from './Icons';

interface FeaturesPageProps {
  onLoginClick: () => void;
}

const FeaturesPage: React.FC<FeaturesPageProps> = ({ onLoginClick }) => {
  return (
    <div className="py-24 animate-fade-in">
        <div className="max-w-7xl mx-auto px-6">
            
            <div className="text-center mb-24">
                <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 block">Plataforma</span>
                <h1 className="text-5xl font-bold mb-6 text-white">Tecnologia de Vídeo <br/> <span className="text-slate-400">Classe Mundial</span></h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    O Corte+ não é apenas um editor. É um ecossistema completo de inteligência artificial projetado para transformar uma peça de conteúdo em um império de mídia.
                </p>
            </div>

            {/* Feature 1 - Active Speaker */}
            <div className="flex flex-col md:flex-row items-center gap-16 mb-32">
                <div className="flex-1 w-full">
                    <div className="bg-gradient-to-br from-indigo-900/40 to-grafite-900 border border-white/10 rounded-3xl p-2 aspect-video flex items-center justify-center overflow-hidden shadow-2xl">
                        <div className="w-full h-full bg-grafite-950 rounded-2xl relative overflow-hidden flex items-center justify-center">
                             {/* Simulation of Face Tracking */}
                             <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 border-2 border-indigo-500 rounded-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse shadow-[0_0_20px_rgba(99,102,241,0.5)]"></div>
                                <IconFaceId className="w-20 h-20 text-indigo-500" />
                             </div>
                             <div className="absolute bottom-4 left-4 bg-black/60 px-3 py-1 rounded text-xs font-mono text-indigo-400 border border-indigo-500/30">
                                DETECT: SPEAKER_01 (99% CONFIDENCE)
                             </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 border border-indigo-500/20">
                        <IconFaceId className="w-6 h-6 text-indigo-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-white">Active Speaker AI</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        Para podcasts e entrevistas, o enquadramento é tudo. Nossa IA rastreia rostos em tempo real e alterna a câmera virtualmente, garantindo que o orador esteja sempre no foco, sem cortes manuais.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <IconCheckCircle className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-white text-sm">Auto-Reframe 9:16</h4>
                                <p className="text-sm text-slate-500">Converte vídeos horizontais para verticais sem perder o sujeito.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <IconCheckCircle className="w-6 h-6 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-white text-sm">Multi-Speaker Support</h4>
                                <p className="text-sm text-slate-500">Detecta até 5 pessoas e cria cortes dinâmicos.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Feature 2 - Semantic B-Roll */}
            <div className="flex flex-col md:flex-row-reverse items-center gap-16 mb-32">
                <div className="flex-1 w-full">
                    <div className="bg-gradient-to-bl from-emerald-900/40 to-grafite-900 border border-white/10 rounded-3xl p-2 aspect-video flex items-center justify-center overflow-hidden shadow-2xl">
                        <div className="w-full h-full bg-grafite-950 rounded-2xl relative overflow-hidden flex items-center justify-center">
                            <IconMagic className="w-32 h-32 text-emerald-500/50" />
                            <div className="absolute top-4 right-4 flex flex-col gap-2">
                                <div className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30">Keyword: "Money" → Stock_042.mp4</div>
                                <div className="bg-emerald-500/20 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/30">Keyword: "Travel" → Stock_015.mp4</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-6 border border-emerald-500/20">
                        <IconMagic className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h3 className="text-3xl font-bold mb-4 text-white">B-Roll Semântico</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                        A retenção cai quando a imagem é estática. O Corte+ "ouve" o vídeo e insere imagens e GIFs automaticamente quando palavras-chave são mencionadas, criando uma narrativa visual rica.
                    </p>
                    <ul className="space-y-4">
                        <li className="flex items-start gap-4">
                            <IconCheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-white text-sm">Banco de Imagens Premium</h4>
                                <p className="text-sm text-slate-500">Acesso a milhões de assets livres de royalties.</p>
                            </div>
                        </li>
                        <li className="flex items-start gap-4">
                            <IconCheckCircle className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-white text-sm">Sincronia Contextual</h4>
                                <p className="text-sm text-slate-500">Imagens aparecem exatamente no momento da palavra.</p>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Use Cases Grid */}
            <div className="mb-32">
                <h2 className="text-3xl font-bold text-center text-white mb-16">Construído para todos os criadores</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-grafite-900 border border-white/5 p-8 rounded-2xl hover:border-indigo-500/30 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-4">🎙️ Podcasters</h3>
                        <p className="text-slate-400 text-sm mb-6">Transforme 1 hora de conversa em 30 Reels virais sem esforço. Mantenha seu canal de cortes sempre cheio.</p>
                        <div className="text-indigo-400 text-xs font-bold uppercase tracking-wide">Benefício: Escala</div>
                    </div>
                    <div className="bg-grafite-900 border border-white/5 p-8 rounded-2xl hover:border-indigo-500/30 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-4">🏢 Agências</h3>
                        <p className="text-slate-400 text-sm mb-6">Atenda 10x mais clientes usando o Modo White Label. Entregue relatórios de ROI e aproveite a renderização em nuvem.</p>
                        <div className="text-indigo-400 text-xs font-bold uppercase tracking-wide">Benefício: Margem de Lucro</div>
                    </div>
                    <div className="bg-grafite-900 border border-white/5 p-8 rounded-2xl hover:border-indigo-500/30 transition-colors">
                        <h3 className="text-xl font-bold text-white mb-4">🎓 Infoprodutores</h3>
                        <p className="text-slate-400 text-sm mb-6">Extraia as melhores dicas das suas aulas e lives para atrair leads qualificados no orgânico.</p>
                        <div className="text-indigo-400 text-xs font-bold uppercase tracking-wide">Benefício: Vendas</div>
                    </div>
                </div>
            </div>

            {/* How it Works Timeline */}
            <div className="max-w-4xl mx-auto">
                 <h2 className="text-3xl font-bold text-center text-white mb-16">Como funciona</h2>
                 <div className="relative border-l border-white/10 ml-6 space-y-12">
                     <div className="relative pl-12">
                         <div className="absolute -left-3 top-0 w-6 h-6 bg-grafite-950 border-2 border-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-500">1</div>
                         <h3 className="text-xl font-bold text-white mb-2">Upload ou Link</h3>
                         <p className="text-slate-400">Cole um link do YouTube ou faça upload do seu arquivo. Suportamos vídeos de até 4 horas.</p>
                     </div>
                     <div className="relative pl-12">
                         <div className="absolute -left-3 top-0 w-6 h-6 bg-grafite-950 border-2 border-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-500">2</div>
                         <h3 className="text-xl font-bold text-white mb-2">Análise Neural</h3>
                         <p className="text-slate-400">Nossa IA transcreve, analisa o sentimento e identifica os momentos com maior potencial de retenção (ganchos).</p>
                     </div>
                     <div className="relative pl-12">
                         <div className="absolute -left-3 top-0 w-6 h-6 bg-grafite-950 border-2 border-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-500">3</div>
                         <h3 className="text-xl font-bold text-white mb-2">Edição Automática</h3>
                         <p className="text-slate-400">O sistema aplica cortes, legendas dinâmicas, B-rolls e emojis. Você pode ajustar tudo no editor manual se quiser.</p>
                     </div>
                     <div className="relative pl-12">
                         <div className="absolute -left-3 top-0 w-6 h-6 bg-grafite-950 border-2 border-indigo-500 rounded-full flex items-center justify-center text-[10px] font-bold text-indigo-500">4</div>
                         <h3 className="text-xl font-bold text-white mb-2">Publicação One-Click</h3>
                         <p className="text-slate-400">Envie diretamente para o TikTok, Instagram e YouTube Shorts. Nossa IA ainda responde aos comentários.</p>
                     </div>
                 </div>
            </div>

            {/* CTA */}
            <div className="mt-32 text-center">
                <button 
                    onClick={onLoginClick}
                    className="bg-white text-grafite-950 px-10 py-5 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] text-lg"
                >
                    Começar a usar agora
                </button>
                <p className="mt-4 text-slate-500 text-sm">Sem cartão de crédito necessário para testar.</p>
            </div>
        </div>
    </div>
  );
};

export default FeaturesPage;
