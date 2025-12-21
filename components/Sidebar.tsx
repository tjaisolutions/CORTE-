
import React from 'react';
import { Project, AgencyConfig, User } from '../types';
import { 
  IconLogo, IconHome, IconGrid, IconList, IconImage, IconFolder, 
  IconSettings, IconLink, IconPlusCircle, IconLogOut, IconStar, IconArrowRight
} from './Icons';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: any) => void;
  projects: Project[];
  activeProjectId: string | null;
  onProjectSelect: (id: string | null) => void;
  onCreateProject: () => void;
  agencyConfig: AgencyConfig;
  onOpenAgencySettings: () => void;
  onOpenIntegrations: () => void;
  user: User;
  onUpgradeClick: () => void;
  onLogout: () => void;
  onNavigateToSite?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  onTabChange, 
  projects, 
  activeProjectId, 
  onProjectSelect, 
  onCreateProject,
  agencyConfig,
  onOpenAgencySettings,
  onOpenIntegrations,
  user,
  onUpgradeClick,
  onLogout,
  onNavigateToSite
}) => {
  
  const NAV_ITEMS = [
    { id: 'studio', label: 'Estúdio', icon: IconHome },
    { id: 'gallery', label: 'Biblioteca', icon: IconImage },
    { id: 'queue', label: 'Fila de Processamento', icon: IconList },
    { id: 'dashboard', label: 'Analytics', icon: IconGrid },
  ];

  return (
    <div className="w-72 h-screen bg-grafite-950/50 backdrop-blur-xl border-r border-white/5 flex flex-col shrink-0 z-20">
      
      {/* Brand Header */}
      <div className="h-24 flex items-center px-8 border-b border-white/5">
        <div className="flex items-center gap-4 text-white">
          {agencyConfig.isEnabled && agencyConfig.logoUrl ? (
             <img src={agencyConfig.logoUrl} alt="Logo" className="h-10 object-contain" />
          ) : (
            <>
              <div className="text-white">
                <IconLogo className="w-8 h-8" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-white leading-none">
                    {agencyConfig.isEnabled ? agencyConfig.companyName : 'Corte+'}
                </span>
                {!agencyConfig.isEnabled && <span className="text-[10px] text-slate-500 font-medium tracking-widest mt-1">PLATFORM</span>}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Navigation */}
      <div className="px-4 space-y-2 mt-8">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest px-4 mb-4">Menu Principal</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg text-[15px] font-medium transition-all duration-200 ${
              activeTab === item.id 
                ? 'bg-white text-grafite-950 shadow-lg shadow-white/5 font-bold' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-grafite-950' : 'text-slate-400'}`} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Projects */}
      <div className="px-4 mt-10 flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Projetos</div>
          <button onClick={onCreateProject} className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-white/5 rounded">
            <IconPlusCircle className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-2">
            <button
            onClick={() => onProjectSelect(null)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                activeProjectId === null 
                ? 'bg-white/5 text-white font-medium border border-white/5' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
            >
            <IconFolder className="w-5 h-5 opacity-70" />
            Todos os Cortes
            </button>

            {projects.map(p => (
            <button
                key={p.id}
                onClick={() => onProjectSelect(p.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all group ${
                activeProjectId === p.id 
                    ? 'bg-white/5 text-white font-medium border border-white/5' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
                <div className={`w-2.5 h-2.5 rounded-full ${p.color}`}></div>
                <span className="truncate text-[15px]">{p.name}</span>
            </button>
            ))}
        </div>
      </div>

      {/* Settings & User */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-grafite-950/30">
         
         {onNavigateToSite && (
            <button 
              onClick={onNavigateToSite}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-white hover:bg-white/5 transition-all mb-2"
            >
               <IconArrowRight className="w-4 h-4" />
               Voltar ao Site
            </button>
         )}

         <button 
           onClick={onOpenIntegrations}
           className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
         >
           <IconLink className="w-5 h-5" />
           Conexões
         </button>
         <button 
           onClick={onOpenAgencySettings}
           className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all"
         >
           <IconSettings className="w-5 h-5" />
           Ajustes
         </button>
         
         <div className="mt-4 pt-4 border-t border-white/5">
             <div className="flex items-center gap-3 px-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold border border-white/10">
                    {user.name.substring(0,2).toUpperCase()}
                </div>
                <div className="flex-1 overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">{user.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${user.subscription.plan === 'FREE' ? 'bg-slate-500' : 'bg-indigo-500'}`}></span>
                        {user.subscription.plan === 'FREE' ? 'Plano Grátis' : 'Plano Pro'}
                    </div>
                </div>
                <button onClick={onLogout} title="Sair" className="text-slate-500 hover:text-white">
                    <IconLogOut className="w-4 h-4" />
                </button>
             </div>
             
             {user.subscription.plan === 'FREE' && (
                 <button 
                    onClick={onUpgradeClick}
                    className="w-full bg-white text-grafite-950 text-xs font-bold py-2 rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-lg"
                 >
                    <IconStar className="w-3 h-3" /> Fazer Upgrade
                 </button>
             )}
         </div>
      </div>

    </div>
  );
};

export default Sidebar;
