import React from 'react';
import { AnalyticsSummary, GeneratedClip, PlatformStats } from '../types';
import { MOCK_ANALYTICS } from '../constants';
import { IconChart, IconDollar, IconEye, IconTrendingUp, IconTrendingDown } from './Icons';

const MetricCard = ({ label, value, subtext, icon: Icon, trend }: any) => (
  <div className="bg-stark-900 border border-stark-border rounded-xl p-5 hover:border-stark-accent/30 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-stark-800 rounded-lg text-stark-accent">
        <Icon className="w-5 h-5" />
      </div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${trend === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
          {trend === 'up' ? <IconTrendingUp className="w-3 h-3" /> : <IconTrendingDown className="w-3 h-3" />}
          <span>12%</span>
        </div>
      )}
    </div>
    <div className="text-2xl md:text-3xl font-bold text-white mb-1 tracking-tight">{value}</div>
    <div className="text-sm text-slate-500">{label}</div>
    {subtext && <div className="text-xs text-slate-600 mt-2 font-mono">{subtext}</div>}
  </div>
);

interface PlatformBarProps {
  platform: PlatformStats;
  maxEarnings: number;
}

const PlatformBar: React.FC<PlatformBarProps> = ({ platform, maxEarnings }) => {
  const percentage = (platform.totalEarnings / maxEarnings) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end text-sm">
        <span className="font-medium text-slate-300">{platform.platform}</span>
        <div className="text-right">
          <div className="text-white font-bold">US$ {platform.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <div className="text-[10px] text-slate-500">{platform.totalViews.toLocaleString()} views</div>
        </div>
      </div>
      <div className="h-3 bg-stark-800 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${platform.color} opacity-80`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};

interface ClipRowProps {
  clip: GeneratedClip;
  rank: number;
  type: 'top' | 'worst';
}

const ClipRow: React.FC<ClipRowProps> = ({ clip, rank, type }) => (
  <div className="flex items-center gap-4 p-3 hover:bg-stark-800/50 rounded-lg transition-colors border-b border-stark-border/50 last:border-0">
    <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${type === 'top' ? 'bg-stark-accent/20 text-stark-accent' : 'bg-red-500/10 text-red-500'}`}>
      {rank}
    </div>
    <div className="w-10 h-10 bg-slate-800 rounded overflow-hidden shrink-0">
      <img src={clip.videoUrl} alt="thumb" className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-white truncate">{clip.title}</div>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <IconEye className="w-3 h-3" />
          {clip.views?.toLocaleString()}
        </span>
        <span className="flex items-center gap-1 text-emerald-500/80">
          <IconDollar className="w-3 h-3" />
          {clip.earnings?.toFixed(2)}
        </span>
      </div>
    </div>
    <div className={`text-xs font-bold px-2 py-1 rounded ${type === 'top' ? 'text-emerald-500' : 'text-red-500'}`}>
      {clip.viralScore}
    </div>
  </div>
);

export default function AnalyticsDashboard() {
  const data = MOCK_ANALYTICS;
  const maxPlatformEarnings = Math.max(...data.platformStats.map(p => p.totalEarnings));

  return (
    <div className="space-y-6 fade-in pb-12">
      
      <div className="flex justify-between items-end mb-4">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard de Monetização</h2>
           <p className="text-slate-400 text-sm">Visão geral de performance e receita acumulada.</p>
        </div>
        <div className="text-right">
           <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">RPM Médio</span>
           <div className="text-xl font-mono text-stark-accent">US$ 0.58</div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard 
          label="Receita Total Estimada" 
          value={`US$ ${data.totalEarnings.toLocaleString('pt-BR')}`}
          subtext="~ R$ 42.150,00 (Cotação Atual)"
          icon={IconDollar}
          trend="up"
        />
        <MetricCard 
          label="Visualizações Totais" 
          value={`${(data.totalViews / 1000000).toFixed(1)}M`}
          subtext="Todas as plataformas"
          icon={IconEye}
          trend="up"
        />
        <MetricCard 
          label="Cortes Publicados" 
          value="1,240"
          subtext="Média de 41 cortes/dia"
          icon={IconChart}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        
        {/* Revenue Breakdown */}
        <div className="bg-stark-900 border border-stark-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <IconChart className="w-5 h-5 text-slate-400" />
            Receita por Plataforma
          </h3>
          <div className="space-y-6">
            {data.platformStats.map((stat, i) => (
              <PlatformBar key={i} platform={stat} maxEarnings={maxPlatformEarnings} />
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-stark-950 rounded-lg border border-stark-border/50 text-xs text-slate-400">
            <p className="font-semibold text-white mb-1">Nota do Sistema:</p>
            O RPM (Receita por mil views) do Instagram Reels subiu 15% esta semana devido aos bônus de final de ano. TikTok mantém estabilidade.
          </div>
        </div>

        {/* Top Performing Clips */}
        <div className="bg-stark-900 border border-stark-border rounded-xl p-6 flex flex-col h-full">
           <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
             <IconTrendingUp className="w-5 h-5 text-emerald-500" />
             Top 5 Virais (Semana)
           </h3>
           <div className="flex-1">
             {data.topClips.map((clip, i) => (
               <ClipRow key={clip.id} clip={clip} rank={i + 1} type="top" />
             ))}
           </div>
           
           <h3 className="text-lg font-semibold text-white mt-8 mb-4 flex items-center gap-2">
             <IconTrendingDown className="w-5 h-5 text-red-500" />
             Menor Desempenho
           </h3>
           <div className="flex-1">
             {data.worstClips.slice(0, 3).map((clip, i) => (
               <ClipRow key={clip.id} clip={clip} rank={i + 1} type="worst" />
             ))}
           </div>
        </div>

      </div>
    </div>
  );
}