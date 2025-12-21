
import React, { useState, useEffect, useRef } from 'react';
import { IconTerminal } from './Icons';

const MESSAGES = [
  "Conectando à Neural Net v4.2...",
  "Otimizando núcleos de GPU...",
  "Sincronizando com API do YouTube...",
  "Calibrando algoritmos de retenção...",
  "Monitorando tendências do TikTok em tempo real...",
  "Buscando novos padrões virais...",
  "Sistema Corte+ Online.",
  "Verificando integridade de memória...",
  "Carregando modelos de voz ElevenLabs...",
  "Aguardando input do operador..."
];

const SystemLog: React.FC = () => {
  const [logs, setLogs] = useState<string[]>(["Inicializando sistema..."]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
      setLogs(prev => [...prev.slice(-4), `> ${msg}`]);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-8 bg-grafite-950 border-t border-giz-500 z-[60] flex items-center px-4 font-mono text-[10px] text-gelo-300 overflow-hidden shadow-lg">
      <div className="flex items-center gap-2 mr-4 text-white shrink-0">
        <IconTerminal className="w-3 h-3" />
        <span className="font-bold tracking-wider">CORTE+_CORE</span>
      </div>
      <div className="flex-1 overflow-hidden relative h-full flex items-center">
         <div className="animate-pulse w-1.5 h-3 bg-white mr-2"></div>
         <span className="text-gelo-300">{logs[logs.length - 1]}</span>
      </div>
      <div className="hidden md:flex gap-4 shrink-0 opacity-50 text-white/50">
        <span>CPU: 12%</span>
        <span>MEM: 4.2GB</span>
        <span>NET: 1Gbps</span>
      </div>
    </div>
  );
};

export default SystemLog;
