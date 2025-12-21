
import React, { useState } from 'react';
import { IconCheckCircle, IconArrowRight, IconShield, IconLock, IconCloud } from './Icons';

interface PricingPageProps {
  onLoginClick: () => void;
}

const PricingPage: React.FC<PricingPageProps> = ({ onLoginClick }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const getPrice = (basePrice: number) => {
      if (basePrice === 0) return "Grátis";
      return billingCycle === 'monthly' ? `R$ ${basePrice}` : `R$ ${(basePrice * 0.8).toFixed(0)}`;
  };

  return (
    <div className="py-24 animate-fade-in">
       <div className="max-w-7xl mx-auto px-6">
           
           <div className="text-center mb-16">
               <span className="text-indigo-400 font-bold uppercase tracking-widest text-xs mb-4 block">Planos e Preços</span>
               <h1 className="text-5xl font-bold mb-6 text-white">Investimento simples, <br/> retorno exponencial.</h1>
               <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                   Escolha o plano ideal para o tamanho da sua ambição. Todos os planos incluem acesso ao Editor Neural.
               </p>
               
               {/* Toggle */}
               <div className="flex items-center justify-center mt-8 gap-4">
                   <span className={`text-sm font-bold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Mensal</span>
                   <button 
                      onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                      className="w-14 h-8 bg-grafite-800 rounded-full p-1 relative border border-white/10"
                   >
                       <div className={`w-6 h-6 bg-indigo-500 rounded-full shadow-lg transition-transform duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : ''}`}></div>
                   </button>
                   <span className={`text-sm font-bold ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
                       Anual <span className="text-emerald-400 text-xs ml-1">(20% OFF)</span>
                   </span>
               </div>
           </div>

           {/* Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
                {[
                    { name: "Starter", price: 0, desc: "Para testar a tecnologia.", features: ["5 Cortes/mês", "Renderização 720p", "Marca d'água Corte+", "1 Usuário", "Exportação Manual", "Modelos Básicos"] },
                    { name: "Growth", price: 99, popular: true, desc: "Para criadores profissionais.", features: ["50 Cortes/mês", "Renderização 1080p", "Sem Marca d'água", "Auto-Post (3 contas)", "Editor Manual", "Todos os Modelos Virais", "Suporte Prioritário"] },
                    { name: "Scale", price: 299, desc: "Para agências e empresas.", features: ["Cortes Ilimitados*", "Renderização 4K UHD", "White Label (Sua Marca)", "Contas Sociais Ilimitadas", "Gerente de Conta Dedicado", "Workspaces Colaborativos", "Contrato SLA"] }
                ].map((plan, i) => (
                    <div key={i} className={`bg-grafite-900/50 backdrop-blur-sm border p-8 rounded-3xl relative flex flex-col transition-all hover:-translate-y-2 ${plan.popular ? 'border-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.15)] z-10' : 'border-white/5 hover:border-white/20'}`}>
                        {plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">Melhor Custo-Benefício</div>}
                        
                        <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                        <div className="flex items-baseline gap-1 mb-4">
                            <span className="text-5xl font-bold text-white tracking-tight">{getPrice(plan.price)}</span>
                            {plan.price > 0 && <span className="text-slate-500 text-sm">/mês</span>}
                        </div>
                        <p className="text-slate-400 text-sm mb-8 border-b border-white/5 pb-8">{plan.desc}</p>
                        
                        <ul className="space-y-4 mb-8 flex-1">
                            {plan.features.map((f, j) => (
                                <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                                    <IconCheckCircle className={`w-5 h-5 ${plan.popular ? 'text-indigo-400' : 'text-slate-600'}`} />
                                    {f}
                                </li>
                            ))}
                        </ul>
                        
                        <button onClick={onLoginClick} className={`w-full py-4 rounded-xl font-bold transition-all text-sm uppercase tracking-wide ${plan.popular ? 'bg-white text-grafite-950 hover:bg-slate-200 shadow-lg' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                            {plan.popular ? 'Começar Agora' : 'Selecionar Plano'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Security Section */}
            <div className="mb-32 bg-grafite-900 border border-white/5 rounded-3xl p-12">
                <div className="flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 mb-6">
                            <IconShield className="w-3 h-3" /> Enterprise Grade Security
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-4">Seus dados estão blindados.</h2>
                        <p className="text-slate-400 mb-6 leading-relaxed">
                            Sabemos que seu conteúdo é sua propriedade intelectual. O Corte+ utiliza infraestrutura de nível bancário para garantir que seus vídeos nunca vazem antes do lançamento.
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <IconLock className="w-4 h-4 text-emerald-500"/> Criptografia AES-256
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <IconCloud className="w-4 h-4 text-emerald-500"/> Servidores Isolados
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <IconCheckCircle className="w-4 h-4 text-emerald-500"/> Conformidade LGPD
                            </li>
                            <li className="flex items-center gap-3 text-sm text-slate-300">
                                <IconCheckCircle className="w-4 h-4 text-emerald-500"/> Backup Automático
                            </li>
                        </ul>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="w-64 h-64 bg-emerald-500/5 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_50px_rgba(16,185,129,0.1)]">
                             <IconShield className="w-32 h-32 text-emerald-500/50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Comparison Table */}
            <div className="mb-32">
                <h3 className="text-2xl font-bold text-white mb-8 text-center">Comparativo Detalhado</h3>
                <div className="overflow-x-auto border border-white/10 rounded-2xl bg-grafite-900/50 backdrop-blur-sm">
                    <table className="w-full text-left text-sm text-slate-400">
                        <thead className="bg-white/5 text-white uppercase font-bold text-xs border-b border-white/10">
                            <tr>
                                <th className="p-6 w-1/4">Recurso</th>
                                <th className="p-6 w-1/4 text-center">Starter</th>
                                <th className="p-6 w-1/4 text-center text-indigo-400">Growth</th>
                                <th className="p-6 w-1/4 text-center">Scale</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            <tr><td className="p-6 font-medium text-white">Resolução de Vídeo</td><td className="p-6 text-center">720p HD</td><td className="p-6 text-center">1080p FHD</td><td className="p-6 text-center font-bold text-emerald-400">4K UHD</td></tr>
                            <tr><td className="p-6 font-medium text-white">Remoção de Marca d'água</td><td className="p-6 text-center">-</td><td className="p-6 text-center"><IconCheckCircle className="w-5 h-5 text-indigo-500 mx-auto"/></td><td className="p-6 text-center"><IconCheckCircle className="w-5 h-5 text-indigo-500 mx-auto"/></td></tr>
                            <tr><td className="p-6 font-medium text-white">IA Face Tracking</td><td className="p-6 text-center">Básico</td><td className="p-6 text-center">Avançado</td><td className="p-6 text-center">Avançado</td></tr>
                            <tr><td className="p-6 font-medium text-white">Auto-Legendas</td><td className="p-6 text-center">Limitado</td><td className="p-6 text-center">Ilimitado</td><td className="p-6 text-center">Ilimitado + Custom Fonts</td></tr>
                            <tr><td className="p-6 font-medium text-white">Dublagem IA (Minutos)</td><td className="p-6 text-center">-</td><td className="p-6 text-center">30 min/mês</td><td className="p-6 text-center">300 min/mês</td></tr>
                            <tr><td className="p-6 font-medium text-white">Modo White Label (Agência)</td><td className="p-6 text-center">-</td><td className="p-6 text-center">-</td><td className="p-6 text-center"><IconCheckCircle className="w-5 h-5 text-indigo-500 mx-auto"/></td></tr>
                            <tr><td className="p-6 font-medium text-white">B-Roll Semântico</td><td className="p-6 text-center">-</td><td className="p-6 text-center">Sim</td><td className="p-6 text-center">Sim</td></tr>
                            <tr><td className="p-6 font-medium text-white">Exportação em Lote</td><td className="p-6 text-center">-</td><td className="p-6 text-center">Sim</td><td className="p-6 text-center">Sim</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Enterprise CTA */}
            <div className="mt-20 p-12 bg-white text-grafite-950 rounded-3xl text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-slate-200 to-white opacity-50"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-4">Precisa de um plano customizado?</h2>
                    <p className="text-slate-600 mb-8 max-w-2xl mx-auto">Para grandes redes de mídia, oferecemos servidores dedicados, SLA de 99.9% e engenheiros de suporte dedicados.</p>
                    <button className="bg-grafite-950 text-white px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center gap-2 mx-auto">
                        Falar com Consultor Enterprise <IconArrowRight className="w-4 h-4"/>
                    </button>
                </div>
            </div>

       </div>
    </div>
  );
};

export default PricingPage;
