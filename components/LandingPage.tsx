
import React, { useState } from 'react';
import { 
  IconCheckCircle, IconPlay, IconArrowRight, IconLock, IconZap, IconRocket, IconScissors, IconTrendingUp, IconDollar, IconShield 
} from './Icons';

interface LandingPageProps {
  onStartTrial: (url: string) => void;
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartTrial, onLoginClick }) => {
  const [trialUrl, setTrialUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trialUrl) {
       onStartTrial(trialUrl);
    }
  };

  // Logos usando placeholders estáveis para evitar 404/403
  const TRUSTED_LOGOS = [
    "Google", "IBM", "Netflix", "Amazon", "Spotify"
  ];

  return (
    <div className="relative">
      
      {/* DEV MODE SHORTCUT */}
      <button 
        onClick={onLoginClick}
        className="fixed bottom-6 right-6 z-[100] bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-full font-bold shadow-[0_0_20px_rgba(79,70,229,0.5)] flex items-center gap-2 animate-bounce hover:animate-none transition-all"
      >
        <IconLock className="w-4 h-4" />
        Acessar Sistema (Dev)
      </button>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 overflow-hidden">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-indigo-500/20 blur-[120px] rounded-full pointer-events-none animate-blob"></div>
         
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-300 mb-8 animate-fade-in backdrop-blur-sm">
               <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
               Corte+ Enterprise AI Agora Disponível
            </div>
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight animate-slide-up">
               Escale sua produção de vídeos <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-500">com precisão industrial.</span>
            </h1>
            <p className="text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
               A plataforma definitiva para agências e criadores. Transforme conteúdos longos em centenas de ativos virais otimizados para ROI, usando a mesma tecnologia de grandes canais de mídia.
            </p>

            {/* Trial Input */}
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative group animate-slide-up" style={{ animationDelay: '0.2s' }}>
               <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
               <div className="relative bg-grafite-900 border border-white/10 rounded-xl p-2 flex items-center shadow-2xl">
                  <div className="pl-4 pr-2 text-slate-500">
                     <IconPlay className="w-5 h-5" />
                  </div>
                  <input 
                     type="text" 
                     placeholder="Cole um link do YouTube para gerar cortes..." 
                     className="flex-1 bg-transparent border-none outline-none text-white px-2 h-12 placeholder-slate-500"
                     value={trialUrl}
                     onChange={(e) => setTrialUrl(e.target.value)}
                  />
                  <button type="submit" className="bg-white text-grafite-950 px-6 h-12 rounded-lg font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2 whitespace-nowrap">
                     Gerar Cortes <IconArrowRight className="w-4 h-4" />
                  </button>
               </div>
               <p className="text-xs text-slate-500 mt-3 flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1"><IconCheckCircle className="w-3 h-3 text-emerald-500"/> Sem cartão de crédito</span>
                  <span className="flex items-center gap-1"><IconCheckCircle className="w-3 h-3 text-emerald-500"/> Processamento em Nuvem</span>
               </p>
            </form>
         </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 border-y border-white/5 bg-black/20">
         <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-8">A escolha de +10.000 equipes de marketing</p>
            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50">
                {TRUSTED_LOGOS.map((logo, i) => (
                    <span key={i} className="text-xl md:text-2xl font-black text-slate-600 uppercase tracking-widest hover:text-white transition-colors cursor-default">
                        {logo}
                    </span>
                ))}
            </div>
         </div>
      </section>

      {/* Viral Styles Showcase */}
      <section className="py-24 bg-grafite-950 relative overflow-hidden">
         <div className="absolute right-0 top-1/4 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
         <div className="max-w-7xl mx-auto px-6 relative z-10">
             <div className="text-center mb-16">
                 <h2 className="text-4xl font-bold text-white mb-4">Domine todos os formatos.</h2>
                 <p className="text-slate-400 max-w-2xl mx-auto">Nossa IA adapta seu conteúdo para os estilos de edição que estão em alta no algoritmo agora.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                 {/* Style 1: Hormozi */}
                 <div className="bg-grafite-900 border border-white/5 rounded-2xl p-4 group hover:border-yellow-500/50 transition-colors">
                     <div className="aspect-[9/16] bg-black rounded-lg mb-4 relative overflow-hidden">
                         <div className="absolute inset-0 flex items-center justify-center">
                             <div className="text-center">
                                 <span className="text-yellow-400 font-black text-2xl uppercase drop-shadow-md block -rotate-6">DINHEIRO</span>
                                 <span className="text-white font-bold text-xl uppercase drop-shadow-md">RÁPIDO</span>
                             </div>
                         </div>
                         <div className="absolute bottom-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
                             <div className="h-full bg-yellow-400 w-2/3"></div>
                         </div>
                     </div>
                     <h3 className="font-bold text-white">Estilo "Hormozi"</h3>
                     <p className="text-xs text-slate-500 mt-1">Legendas coloridas, cortes rápidos e zoom dinâmico. Ideal para Coaches e Info.</p>
                 </div>

                 {/* Style 2: Gaming Split */}
                 <div className="bg-grafite-900 border border-white/5 rounded-2xl p-4 group hover:border-indigo-500/50 transition-colors">
                     <div className="aspect-[9/16] bg-black rounded-lg mb-4 flex flex-col overflow-hidden">
                         <div className="h-1/2 bg-slate-800 flex items-center justify-center border-b border-black">
                             <span className="text-xs text-slate-500">Vídeo Original</span>
                         </div>
                         <div className="h-1/2 bg-indigo-900/20 flex items-center justify-center relative overflow-hidden">
                             {/* Abstract looping background instead of broken gif */}
                             <div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-purple-900 to-black opacity-50 animate-pulse"></div>
                             <span className="text-xs text-indigo-400 font-bold z-10">Gameplay Satisfatório</span>
                         </div>
                     </div>
                     <h3 className="font-bold text-white">Split Retention</h3>
                     <p className="text-xs text-slate-500 mt-1">Vídeo principal em cima, gameplay embaixo. Previne o "scroll" por tédio.</p>
                 </div>

                 {/* Style 3: Neon Dark */}
                 <div className="bg-grafite-900 border border-white/5 rounded-2xl p-4 group hover:border-purple-500/50 transition-colors">
                     <div className="aspect-[9/16] bg-black rounded-lg mb-4 relative overflow-hidden">
                         <div className="absolute inset-0 bg-black/80"></div>
                         <div className="absolute inset-0 flex items-center justify-center px-4">
                             <p className="text-white font-mono text-lg leading-relaxed text-center shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                                 "A disciplina é a ponte entre metas e realizações."
                             </p>
                         </div>
                     </div>
                     <h3 className="font-bold text-white">Neon Typewriter</h3>
                     <p className="text-xs text-slate-500 mt-1">Fundo escuro, texto neon progressivo. Perfeito para canais "Dark" e motivação.</p>
                 </div>

                 {/* Style 4: Cinematic */}
                 <div className="bg-grafite-900 border border-white/5 rounded-2xl p-4 group hover:border-emerald-500/50 transition-colors">
                     <div className="aspect-[9/16] bg-slate-900 rounded-lg mb-4 relative overflow-hidden">
                         <div className="absolute inset-0 bg-slate-800 blur-md scale-110"></div>
                         <div className="absolute inset-4 bg-black shadow-2xl rounded-lg flex items-center justify-center border border-white/10">
                             <span className="text-[10px] text-slate-500">16:9 Original</span>
                         </div>
                     </div>
                     <h3 className="font-bold text-white">Cinematic Blur</h3>
                     <p className="text-xs text-slate-500 mt-1">Fundo desfocado elegante para manter a proporção de cinema em telas verticais.</p>
                 </div>
             </div>
         </div>
      </section>

      {/* ROI & Automation */}
      <section className="py-24 bg-grafite-900 border-t border-white/5">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
             <div>
                 <h2 className="text-4xl font-bold mb-6 text-white">Substitua uma equipe inteira por um clique.</h2>
                 <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                     Contratar editores é caro e demorado. O Corte+ entrega volume com qualidade humana, permitindo que você foque na estratégia, não na renderização.
                 </p>
                 
                 <div className="space-y-6">
                     <div className="flex items-start gap-4">
                         <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                             <IconDollar className="w-6 h-6" />
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-1">Custo Manual</h4>
                             <p className="text-sm text-slate-500">R$ 50,00 por vídeo editado • 48h de prazo</p>
                         </div>
                     </div>
                     <div className="flex items-start gap-4">
                         <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                             <IconTrendingUp className="w-6 h-6" />
                         </div>
                         <div>
                             <h4 className="font-bold text-white mb-1">Custo Corte+</h4>
                             <p className="text-sm text-slate-500">R$ 0,50 por vídeo editado • 3 minutos de prazo</p>
                         </div>
                     </div>
                 </div>
             </div>
             
             <div className="relative">
                 <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
                 <div className="bg-grafite-950 border border-white/10 p-8 rounded-3xl relative shadow-2xl">
                     <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
                         <div>
                             <div className="text-xs text-slate-500 uppercase tracking-widest">Performance Semanal</div>
                             <div className="text-2xl font-bold text-white">2.4M Views</div>
                         </div>
                         <div className="text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                             <IconTrendingUp className="w-3 h-3" /> +124%
                         </div>
                     </div>
                     <div className="space-y-3">
                         <div className="h-2 bg-grafite-800 rounded-full overflow-hidden">
                             <div className="h-full bg-indigo-500 w-[85%]"></div>
                         </div>
                         <div className="flex justify-between text-xs text-slate-500">
                             <span>Meta Mensal</span>
                             <span>85% Concluído</span>
                         </div>
                     </div>
                     <div className="mt-8 grid grid-cols-3 gap-4">
                         <div className="text-center p-4 bg-white/5 rounded-xl">
                             <div className="text-lg font-bold text-white">142</div>
                             <div className="text-[10px] text-slate-500">Vídeos Gerados</div>
                         </div>
                         <div className="text-center p-4 bg-white/5 rounded-xl">
                             <div className="text-lg font-bold text-white">45h</div>
                             <div className="text-[10px] text-slate-500">Tempo Salvo</div>
                         </div>
                         <div className="text-center p-4 bg-white/5 rounded-xl">
                             <div className="text-lg font-bold text-white">R$ 5k</div>
                             <div className="text-[10px] text-slate-500">Economia</div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </section>

      {/* Core Features Grid */}
      <section className="py-24 bg-grafite-950">
         <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
               <h2 className="text-4xl font-bold mb-4 text-white">Um sistema operacional completo.</h2>
               <p className="text-slate-400 max-w-2xl mx-auto">Tudo o que você precisa para gerenciar uma operação de mídia em escala.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-grafite-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
                  <IconZap className="w-10 h-10 text-white mb-6" />
                  <h3 className="text-2xl font-bold mb-3 text-white">Edição Neural</h3>
                  <p className="text-slate-400 mb-6">Active Speaker Detection, B-Roll semântico e trilha sonora adaptativa para retenção máxima.</p>
               </div>
               <div className="bg-grafite-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
                  <IconRocket className="w-10 h-10 text-white mb-6" />
                  <h3 className="text-2xl font-bold mb-3 text-white">Multi-Channel</h3>
                  <p className="text-slate-400 mb-6">Distribuição simultânea para TikTok, Instagram Reels e YouTube Shorts com um clique.</p>
               </div>
               <div className="bg-grafite-900 border border-white/5 p-8 rounded-3xl relative overflow-hidden group hover:border-white/20 transition-all">
                  <IconScissors className="w-10 h-10 text-white mb-6" />
                  <h3 className="text-2xl font-bold mb-3 text-white">Curadoria Viral</h3>
                  <p className="text-slate-400 mb-6">Scoring automático de potencial viral (0-100) baseado em milhões de datapoints de retenção.</p>
               </div>
            </div>
         </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-indigo-900/20"></div>
          <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-5xl font-bold text-white mb-8">Pronto para viralizar?</h2>
              <p className="text-xl text-slate-300 mb-10">Junte-se a criadores que estão dominando o algoritmo.</p>
              <button 
                  onClick={onLoginClick}
                  className="bg-white text-grafite-950 px-12 py-6 rounded-xl font-bold hover:bg-slate-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] text-xl"
              >
                  Começar Teste Grátis
              </button>
          </div>
      </section>

    </div>
  );
};

export default LandingPage;
