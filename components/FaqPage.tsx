
import React, { useState } from 'react';
import { IconChevronDown, IconBook, IconSupport, IconGraduation, IconSearch, IconPlayCircle } from './Icons';

const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [category, setCategory] = useState<'geral' | 'tecnico' | 'financeiro'>('geral');

  const QUESTIONS = {
      geral: [
        { q: "O Corte+ funciona com vídeos em português?", a: "Sim! Nossa IA é treinada nativamente em Português (BR) e entende gírias, contextos culturais e memes brasileiros." },
        { q: "Preciso ter conhecimento em edição?", a: "Zero. O Corte+ foi feito para automatizar 100% do processo. Se você sabe colar um link, você sabe usar o Corte+." },
        { q: "Os vídeos tem direitos autorais?", a: "O sistema tem um detector de copyright integrado. Ele avisa se a música de fundo pode dar problemas, mas o conteúdo do vídeo original é de sua responsabilidade." }
      ],
      tecnico: [
        { q: "Qual a qualidade máxima de exportação?", a: "No plano Scale, suportamos até 4K 60fps. Nos planos menores, 1080p ou 720p." },
        { q: "Como funciona a renderização?", a: "Usamos tecnologia de nuvem híbrida para processar o vídeo rapidamente sem pesar no seu computador." },
        { q: "Posso conectar quantas contas?", a: "Depende do plano. No Growth são 3 contas. No Scale, é ilimitado." }
      ],
      financeiro: [
        { q: "Posso cancelar quando quiser?", a: "Sim, o cancelamento é feito com 1 clique no painel e o acesso continua até o fim do ciclo pago." },
        { q: "Tem reembolso?", a: "Garantia incondicional de 7 dias para novos assinantes." }
      ]
  };

  const TUTORIALS = [
      { title: "Como criar seu primeiro corte viral", duration: "5:20", thumb: "https://picsum.photos/300/180?r=10" },
      { title: "Estratégia Hormozi: Legendas Dinâmicas", duration: "8:15", thumb: "https://picsum.photos/300/180?r=11" },
      { title: "Monetização no TikTok: Guia Completo", duration: "12:00", thumb: "https://picsum.photos/300/180?r=12" },
      { title: "Usando o Modo Agência para Vender Serviços", duration: "6:45", thumb: "https://picsum.photos/300/180?r=13" }
  ];

  return (
    <div className="py-24 animate-fade-in">
       <div className="max-w-4xl mx-auto px-6">
           
           <div className="text-center mb-16">
               <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 block">Central de Recursos</span>
               <h1 className="text-4xl font-bold mb-6 text-white">Como podemos ajudar?</h1>
               
               {/* Search Bar Visual */}
               <div className="max-w-xl mx-auto relative group">
                   <div className="absolute inset-0 bg-indigo-500/20 blur-lg rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   <div className="relative bg-grafite-900 border border-white/10 rounded-xl flex items-center p-2 shadow-lg">
                       <IconSearch className="w-5 h-5 text-slate-500 ml-3" />
                       <input 
                          type="text" 
                          placeholder="Busque por 'marca d'água', 'faturamento'..." 
                          className="w-full bg-transparent border-none outline-none text-white px-4 py-3 placeholder-slate-600"
                       />
                   </div>
               </div>
           </div>

           {/* Quick Links */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
               <button className="bg-grafite-900/50 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-white/5 transition-all text-left group">
                   <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center mb-4 text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                       <IconBook className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-white mb-1">Guia Inicial</h3>
                   <p className="text-sm text-slate-500">Passo-a-passo para o primeiro corte.</p>
               </button>
               <button className="bg-grafite-900/50 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-white/5 transition-all text-left group">
                   <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-4 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                       <IconGraduation className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-white mb-1">Corte+ Academy</h3>
                   <p className="text-sm text-slate-500">Aprenda estratégias virais.</p>
               </button>
               <button className="bg-grafite-900/50 border border-white/10 p-6 rounded-2xl hover:border-indigo-500/50 hover:bg-white/5 transition-all text-left group">
                   <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center mb-4 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                       <IconSupport className="w-5 h-5" />
                   </div>
                   <h3 className="font-bold text-white mb-1">Suporte Humano</h3>
                   <p className="text-sm text-slate-500">Fale com nossos especialistas.</p>
               </button>
           </div>

           {/* Academy Preview (New Section) */}
           <div className="mb-20">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-bold text-white">Corte+ Academy</h2>
                 <button className="text-sm text-indigo-400 font-bold hover:text-white transition-colors">Ver todos os cursos →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {TUTORIALS.map((tut, i) => (
                    <div key={i} className="group relative rounded-xl overflow-hidden aspect-video border border-white/10 cursor-pointer">
                        <img src={tut.thumb} alt={tut.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60 group-hover:opacity-80" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <IconPlayCircle className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                            <h3 className="text-white font-bold text-sm mb-1">{tut.title}</h3>
                            <span className="text-xs text-slate-300 bg-black/50 px-2 py-0.5 rounded">{tut.duration}</span>
                        </div>
                    </div>
                 ))}
              </div>
           </div>

           {/* FAQ Categories */}
           <div className="flex justify-center gap-4 mb-8">
               {(['geral', 'tecnico', 'financeiro'] as const).map(cat => (
                   <button
                      key={cat}
                      onClick={() => { setCategory(cat); setOpenIndex(null); }}
                      className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${category === cat ? 'bg-white text-grafite-950' : 'bg-white/5 text-slate-400 hover:text-white'}`}
                   >
                       {cat}
                   </button>
               ))}
           </div>

           {/* FAQ List */}
           <div className="space-y-4 mb-20">
                {QUESTIONS[category].map((item, i) => (
                    <div key={i} className="border border-white/5 rounded-xl overflow-hidden bg-grafite-900 transition-all hover:border-white/20">
                        <button 
                            onClick={() => setOpenIndex(openIndex === i ? null : i)}
                            className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                        >
                            <span className="font-bold text-white text-base md:text-lg pr-4">{item.q}</span>
                            <IconChevronDown className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-300 ${openIndex === i ? 'rotate-180' : ''}`} />
                        </button>
                        {openIndex === i && (
                            <div className="p-6 pt-0 text-slate-400 leading-relaxed text-sm md:text-base animate-fade-in border-t border-white/5 mt-2">
                                {item.a}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-white/10 rounded-3xl p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-50"></div>
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-4">Fique por dentro das atualizações</h2>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">Receba dicas de viralização e novidades da plataforma direto no seu inbox.</p>
                    <div className="flex max-w-sm mx-auto gap-2">
                        <input type="email" placeholder="seu@email.com" className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 text-white text-sm" />
                        <button className="bg-white text-grafite-950 px-4 py-3 rounded-lg font-bold text-sm hover:bg-slate-200">Inscrever</button>
                    </div>
                </div>
            </div>
       </div>
    </div>
  );
};

export default FaqPage;
