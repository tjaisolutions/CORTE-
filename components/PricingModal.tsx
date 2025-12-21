
import React from 'react';
import { PlanTier } from '../types';
import { IconCheckCircle, IconStar, IconCreditCard } from './Icons';

interface PricingModalProps {
  currentPlan: PlanTier;
  onUpgrade: (plan: PlanTier) => void;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ currentPlan, onUpgrade, onClose }) => {
  
  const PLANS = [
    {
      id: PlanTier.FREE,
      name: 'Starter',
      price: 'Grátis',
      period: 'para sempre',
      features: ['5 Cortes/mês', 'Render 720p', 'Marca d\'água Corte+'],
      active: currentPlan === PlanTier.FREE,
      buttonText: 'Plano Atual'
    },
    {
      id: PlanTier.CREATOR,
      name: 'Growth',
      price: 'R$ 99',
      period: '/mês',
      features: ['50 Cortes/mês', 'Render 1080p', 'Sem Marca d\'água', 'Auto-Reply AI', 'Editor Manual'],
      active: currentPlan === PlanTier.CREATOR,
      popular: true,
      buttonText: 'Fazer Upgrade'
    },
    {
      id: PlanTier.AGENCY,
      name: 'Scale',
      price: 'R$ 299',
      period: '/mês',
      features: ['Cortes Ilimitados', 'Render 4K', 'Modo Agência (White Label)', 'Prioridade na Fila', 'Gestão de Times'],
      active: currentPlan === PlanTier.AGENCY,
      buttonText: 'Contatar Vendas'
    }
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl flex flex-col items-center">
        
        <div className="text-center mb-10">
           <h2 className="text-4xl font-bold text-white mb-4">Escolha o poder do seu Corte+</h2>
           <p className="text-slate-400 text-lg">Desbloqueie recursos de inteligência artificial avançada.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
           {PLANS.map(plan => (
              <div 
                key={plan.id}
                className={`relative bg-grafite-900 border rounded-2xl p-8 flex flex-col transition-all duration-300 ${
                    plan.active 
                    ? 'border-stark-accent shadow-[0_0_30px_rgba(255,255,255,0.1)] scale-100' 
                    : plan.popular 
                        ? 'border-stark-accent/50 scale-105 z-10 bg-grafite-800' 
                        : 'border-giz-500 opacity-80 hover:opacity-100 hover:scale-105'
                }`}
              >
                 {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stark-accent text-grafite-950 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg">
                        Recomendado
                    </div>
                 )}
                 
                 <div className="mb-6">
                    <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        <span className="text-sm text-slate-500">{plan.period}</span>
                    </div>
                 </div>

                 <ul className="space-y-4 mb-8 flex-1">
                    {plan.features.map((feat, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                            <IconCheckCircle className={`w-5 h-5 ${plan.active || plan.popular ? 'text-stark-accent' : 'text-slate-600'}`} />
                            {feat}
                        </li>
                    ))}
                 </ul>

                 <button
                    disabled={plan.active}
                    onClick={() => onUpgrade(plan.id)}
                    className={`w-full py-4 rounded-lg font-bold text-sm uppercase tracking-wide transition-all ${
                        plan.active 
                        ? 'bg-giz-500 text-slate-400 cursor-default' 
                        : plan.popular 
                            ? 'bg-stark-accent text-grafite-950 hover:bg-white hover:shadow-lg' 
                            : 'bg-white/10 text-white hover:bg-white hover:text-grafite-950'
                    }`}
                 >
                    {plan.buttonText}
                 </button>
              </div>
           ))}
        </div>
        
        <button onClick={onClose} className="mt-12 text-slate-500 hover:text-white underline text-sm">
            Continuar com o plano atual por enquanto
        </button>

      </div>
    </div>
  );
};

export default PricingModal;
