import React from 'react';

interface StatsGridProps {
  channelsCount: number;
  activeJobsCount: number;
  clipsGenerated: number;
}

const StatItem = ({ label, value }: any) => (
  <div className="bg-white/5 border border-white/5 rounded-lg p-6 flex flex-col hover:border-white/20 hover:bg-white/10 transition-all duration-300 group backdrop-blur-md">
    <span className="text-xs text-slate-400 uppercase tracking-widest mb-3 font-bold opacity-70 group-hover:opacity-100 transition-opacity">{label}</span>
    <span className="text-5xl font-extralight text-white leading-none tracking-tight">{value}</span>
  </div>
);

const StatsGrid: React.FC<StatsGridProps> = ({ channelsCount, activeJobsCount, clipsGenerated }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
       <StatItem label="Ativos Gerados" value={clipsGenerated} />
       <StatItem label="Renderizando" value={activeJobsCount} />
       <StatItem label="Canais Monitorados" value={channelsCount} />
    </div>
  );
};

export default StatsGrid;