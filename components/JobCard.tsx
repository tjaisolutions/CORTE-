import React from 'react';
import { Job, ProcessingStatus } from '../types';

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const isProcessing = job.status === ProcessingStatus.ANALYZING || job.status === ProcessingStatus.GENERATING;

  const getStatusLabel = (s: ProcessingStatus) => {
    switch(s) {
      case ProcessingStatus.COMPLETED: return 'Concluído';
      case ProcessingStatus.FAILED: return 'Falha';
      case ProcessingStatus.ANALYZING: return 'Analisando';
      case ProcessingStatus.GENERATING: return 'Renderizando';
      default: return 'Fila';
    }
  };

  return (
    <div className="bg-white/5 rounded-lg p-5 flex items-center gap-6 group border border-white/5 backdrop-blur-md hover:border-white/20 transition-all">
      
      {/* Thumbnail */}
      <div className="w-20 h-14 bg-black/50 rounded overflow-hidden shrink-0 border border-white/10 relative shadow-inner">
        <img src={job.source.thumbnail} alt={job.source.title} className="w-full h-full object-cover grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
         <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold text-base text-white truncate pr-4">{job.source.title}</h4>
            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border border-white/5 ${
                job.status === ProcessingStatus.COMPLETED ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-black/30'
            }`}>
               {getStatusLabel(job.status)}
            </span>
         </div>
         
         {isProcessing ? (
           <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-white transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${job.progress}%` }}></div>
           </div>
         ) : (
           <div className="text-xs text-slate-400 flex gap-4 font-medium">
             <span className="text-white bg-white/10 px-2 py-0.5 rounded border border-white/5">{job.generatedClips.length} cortes gerados</span>
             <span className="opacity-50 flex items-center">{new Date(job.source.addedAt).toLocaleTimeString()}</span>
           </div>
         )}
      </div>
    </div>
  );
};

export default JobCard;