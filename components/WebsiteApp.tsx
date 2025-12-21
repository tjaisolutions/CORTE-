
import React, { useState } from 'react';
import LandingPage from './LandingPage';
import FeaturesPage from './FeaturesPage';
import PricingPage from './PricingPage';
import FaqPage from './FaqPage';
import { IconLogo } from './Icons';

type Page = 'HOME' | 'FEATURES' | 'PRICING' | 'FAQ';

interface WebsiteAppProps {
  onLoginClick: () => void;
  onStartTrial: (url: string) => void;
}

const WebsiteApp: React.FC<WebsiteAppProps> = ({ onLoginClick, onStartTrial }) => {
  const [page, setPage] = useState<Page>('HOME');

  const renderPage = () => {
    switch(page) {
      case 'HOME': return <LandingPage onStartTrial={onStartTrial} onLoginClick={onLoginClick} />;
      case 'FEATURES': return <FeaturesPage onLoginClick={onLoginClick} />;
      case 'PRICING': return <PricingPage onLoginClick={onLoginClick} />;
      case 'FAQ': return <FaqPage />;
      default: return <LandingPage onStartTrial={onStartTrial} onLoginClick={onLoginClick} />;
    }
  };

  return (
    <div className="min-h-screen bg-grafite-950 font-sans text-white flex flex-col">
       
       {/* Navbar Persistente */}
       <nav className="border-b border-white/5 bg-grafite-950/80 backdrop-blur-md sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <button onClick={() => setPage('HOME')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
               <IconLogo className="w-8 h-8 text-indigo-500" />
               <span className="font-bold text-xl tracking-tight">Corte+</span>
            </button>
            <div className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
                <button onClick={() => setPage('FEATURES')} className={`${page === 'FEATURES' ? 'text-white' : 'hover:text-white'} transition-colors`}>Plataforma</button>
                <button onClick={() => setPage('PRICING')} className={`${page === 'PRICING' ? 'text-white' : 'hover:text-white'} transition-colors`}>Preços</button>
                <button onClick={() => setPage('FAQ')} className={`${page === 'FAQ' ? 'text-white' : 'hover:text-white'} transition-colors`}>Recursos</button>
            </div>
            <div className="flex gap-4">
               <button onClick={onLoginClick} className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2">
                  Entrar
               </button>
               <button onClick={onLoginClick} className="bg-white text-grafite-950 px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors">
                  Começar Grátis
               </button>
            </div>
         </div>
      </nav>

      {/* Conteúdo Dinâmico com Fade In */}
      <main className="flex-1 animate-fade-in">
         {renderPage()}
      </main>

      {/* Footer Persistente */}
      <footer className="py-12 border-t border-white/5 text-slate-500 text-sm bg-grafite-950">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
             <div>
                <div className="flex items-center gap-2 mb-4 text-white">
                    <IconLogo className="w-6 h-6 text-indigo-500" />
                    <span className="font-bold">Corte+</span>
                </div>
                <p className="mb-4">Infraestrutura de vídeo para o futuro da internet.</p>
             </div>
             <div>
                 <h4 className="font-bold text-white mb-4">Produto</h4>
                 <ul className="space-y-2">
                     <li><button onClick={() => setPage('FEATURES')} className="hover:text-white">Funcionalidades</button></li>
                     <li><button onClick={() => setPage('PRICING')} className="hover:text-white">Planos e Preços</button></li>
                     <li><button className="hover:text-white">Para Agências</button></li>
                 </ul>
             </div>
             <div>
                 <h4 className="font-bold text-white mb-4">Empresa</h4>
                 <ul className="space-y-2">
                     <li><button onClick={() => setPage('FAQ')} className="hover:text-white">Sobre Nós</button></li>
                     <li><button className="hover:text-white">Carreiras</button></li>
                     <li><button className="hover:text-white text-emerald-500 flex items-center gap-2">● Status</button></li>
                 </ul>
             </div>
             <div>
                 <h4 className="font-bold text-white mb-4">Legal</h4>
                 <ul className="space-y-2">
                     <li><button className="hover:text-white">Privacidade</button></li>
                     <li><button className="hover:text-white">Termos</button></li>
                 </ul>
             </div>
         </div>
         <div className="text-center pt-8 border-t border-white/5">
             <p>© 2024 Corte+ Inc. Todos os direitos reservados.</p>
         </div>
      </footer>
    </div>
  );
};

export default WebsiteApp;
