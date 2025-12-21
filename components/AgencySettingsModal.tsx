
import React, { useState } from 'react';
import { AgencyConfig } from '../types';
import { IconBuilding, IconCheckCircle, IconPalette, IconCloud } from './Icons';

interface AgencySettingsModalProps {
  config: AgencyConfig;
  onSave: (config: AgencyConfig) => void;
  onClose: () => void;
}

const AgencySettingsModal: React.FC<AgencySettingsModalProps> = ({ config, onSave, onClose }) => {
  const [name, setName] = useState(config.companyName);
  const [isEnabled, setIsEnabled] = useState(config.isEnabled);
  const [color, setColor] = useState(config.primaryColor);
  const [logo, setLogo] = useState(config.logoUrl || '');

  const handleSave = () => {
    onSave({
      isEnabled,
      companyName: name,
      primaryColor: color,
      logoUrl: logo
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="absolute inset-0" onClick={onClose}></div>
      
      <div className="relative w-full max-w-lg bg-stark-950 border border-stark-border shadow-2xl rounded-xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-stark-900/50 p-5 border-b border-stark-border flex items-center gap-3">
           <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
             <IconBuilding className="w-5 h-5" />
           </div>
           <div>
             <h3 className="text-white font-semibold">Configuração da Agência (White Label)</h3>
             <p className="text-xs text-slate-500">Personalize a identidade da plataforma para seus clientes</p>
           </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
           
           {/* Enable Toggle */}
           <div className="flex items-center justify-between p-4 bg-stark-900 rounded-lg border border-stark-border">
              <div>
                 <div className="font-medium text-white text-sm">Ativar Modo Agência</div>
                 <div className="text-xs text-slate-500">Substitui a marca "Corte+ Stark OS" pela sua</div>
              </div>
              <button 
                onClick={() => setIsEnabled(!isEnabled)}
                className={`w-10 h-6 rounded-full p-1 transition-colors ${isEnabled ? 'bg-stark-accent' : 'bg-stark-700'}`}
              >
                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-4' : 'translate-x-0'}`}></div>
              </button>
           </div>

           <div className={`space-y-4 transition-opacity ${isEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              
              <div>
                 <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Nome da Empresa</label>
                 <input 
                   type="text" 
                   value={name}
                   onChange={(e) => setName(e.target.value)}
                   className="w-full bg-black border border-stark-border rounded p-3 text-white text-sm focus:border-stark-accent focus:outline-none"
                   placeholder="Ex: Viral Media Agency"
                 />
              </div>

              <div>
                 <label className="text-xs text-slate-400 uppercase font-bold mb-2 block flex items-center gap-2">
                    <IconPalette className="w-4 h-4" /> Cor Primária da Marca
                 </label>
                 <div className="flex gap-2">
                    {['#ff5f1f', '#3b82f6', '#10b981', '#a855f7', '#ec4899'].map(c => (
                        <button 
                          key={c}
                          onClick={() => setColor(c)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: c }}
                        />
                    ))}
                    <input 
                       type="color"
                       value={color}
                       onChange={(e) => setColor(e.target.value)}
                       className="w-8 h-8 bg-transparent cursor-pointer"
                    />
                 </div>
              </div>

              <div>
                 <label className="text-xs text-slate-400 uppercase font-bold mb-2 block">Logo da Agência (URL)</label>
                 <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-black rounded border border-stark-border flex items-center justify-center overflow-hidden">
                       {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <IconCloud className="text-slate-600" />}
                    </div>
                    <input 
                      type="text"
                      value={logo}
                      onChange={(e) => setLogo(e.target.value)}
                      placeholder="https://sua-empresa.com/logo.png"
                      className="flex-1 bg-black border border-stark-border rounded p-3 text-white text-sm focus:border-stark-accent focus:outline-none"
                    />
                 </div>
              </div>

           </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stark-900 border-t border-stark-border flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-white">Cancelar</button>
           <button onClick={handleSave} className="px-6 py-2 bg-stark-accent hover:bg-white hover:text-stark-950 text-white font-bold rounded-lg text-sm flex items-center gap-2">
              <IconCheckCircle className="w-4 h-4" />
              Aplicar Mudanças
           </button>
        </div>
      </div>
    </div>
  );
};

export default AgencySettingsModal;
