
import React, { useState } from 'react';
import { IconLogo, IconUser, IconLock, IconArrowRight, IconCheckCircle } from './Icons';

interface AuthScreenProps {
  onLogin: () => void;
  onGoBack: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onGoBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-grafite-950 flex font-sans">
      
      {/* Left Side - Visual */}
      <div className="hidden lg:flex w-1/2 bg-grafite-900 border-r border-giz-500 relative overflow-hidden items-center justify-center p-12">
         <div className="absolute inset-0 bg-noise opacity-20"></div>
         <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-indigo-900/20 to-transparent"></div>
         
         <div className="relative z-10 max-w-md">
            <div className="w-16 h-16 bg-white text-grafite-950 rounded-2xl flex items-center justify-center mb-8 shadow-2xl">
                <IconLogo className="w-8 h-8" />
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
               O sistema operacional da sua viralização.
            </h1>
            <ul className="space-y-4 text-lg text-slate-400">
               <li className="flex items-center gap-3">
                  <IconCheckCircle className="w-6 h-6 text-stark-accent" />
                  Cortes Automáticos com IA
               </li>
               <li className="flex items-center gap-3">
                  <IconCheckCircle className="w-6 h-6 text-stark-accent" />
                  Renderização 4K na Nuvem
               </li>
               <li className="flex items-center gap-3">
                  <IconCheckCircle className="w-6 h-6 text-stark-accent" />
                  Gestão de Múltiplas Contas
               </li>
            </ul>
         </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 relative">
         <button onClick={onGoBack} className="absolute top-8 right-8 text-sm text-slate-500 hover:text-white">
            Voltar ao site
         </button>

         <div className="w-full max-w-sm">
            <div className="text-center mb-10">
               <h2 className="text-3xl font-bold text-white mb-2">{isLogin ? 'Bem-vindo de volta' : 'Crie sua conta Corte+'}</h2>
               <p className="text-slate-400">Entre para acessar o Estúdio Enterprise.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Email Corporativo</label>
                  <div className="relative">
                     <IconUser className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                     <input 
                        type="email" 
                        required
                        className="w-full bg-grafite-900 border border-giz-500 rounded-lg py-3 pl-10 text-white focus:border-white focus:outline-none transition-colors"
                        placeholder="nome@empresa.com"
                        defaultValue="admin@corte.plus"
                     />
                  </div>
               </div>
               
               <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5 block">Senha</label>
                  <div className="relative">
                     <IconLock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                     <input 
                        type="password" 
                        required
                        className="w-full bg-grafite-900 border border-giz-500 rounded-lg py-3 pl-10 text-white focus:border-white focus:outline-none transition-colors"
                        placeholder="••••••••"
                        defaultValue="123456"
                     />
                  </div>
               </div>

               <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-grafite-950 font-bold py-3.5 rounded-lg hover:bg-slate-200 transition-all flex items-center justify-center gap-2 mt-4"
               >
                  {loading ? 'Processando...' : (
                      <>
                        {isLogin ? 'Entrar no Sistema' : 'Criar Conta Grátis'} 
                        <IconArrowRight className="w-4 h-4" />
                      </>
                  )}
               </button>
            </form>

            <div className="mt-8 text-center">
               <p className="text-sm text-slate-500">
                  {isLogin ? 'Ainda não tem conta?' : 'Já tem uma conta?'}
                  <button 
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-white font-bold hover:underline"
                  >
                     {isLogin ? 'Começar Agora' : 'Fazer Login'}
                  </button>
               </p>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AuthScreen;
