
import React, { useState, useEffect } from 'react';
import { 
  Job, ProcessingStatus, ChannelMonitor, GeneratedClip, EditingConfig,
  AudioMood, BRollType, ManualEdits, ConnectedAccount, SocialPlatform, Project, AutoReplyConfig, AgencyConfig,
  User, PlanTier, CutStyle, ViralTrack
} from '../types';
import { MOCK_CHANNELS, DEFAULT_CONFIG, MOCK_VIRAL_TRACKS } from '../constants';
import { apiService } from '../services/apiService'; // Importante: Usa o service atualizado

// Components
import Sidebar from './Sidebar';
import JobCard from './JobCard';
import StyleSelector from './StyleSelector';
import ClipResult from './ClipResult';
import VideoPlayer from './VideoPlayer';
import RendererModal from './RendererModal';
import AnalyticsDashboard from './AnalyticsDashboard';
import ViralAuditModal from './ViralAuditModal';
import EditorModal from './EditorModal';
import IntegrationsModal from './IntegrationsModal';
import PublishModal from './PublishModal';
import AgencySettingsModal from './AgencySettingsModal';
import AutoReplyModal from './AutoReplyModal';
import ProjectSidebar from './ProjectSidebar';
import PricingModal from './PricingModal';
import { IconSearch, IconBell, IconPlus, IconZap } from './Icons';

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

interface PlatformAppProps {
  user: User;
  onLogout: () => void;
  onNavigateToSite: () => void;
  onUpgradeUser: (plan: PlanTier) => void;
  initialUrl?: string;
}

const PlatformApp: React.FC<PlatformAppProps> = ({ user, onLogout, onNavigateToSite, onUpgradeUser, initialUrl }) => {
  const [activeTab, setActiveTab] = useState<'studio' | 'dashboard' | 'queue' | 'gallery'>('studio');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState(initialUrl || '');
  const [editingConfig, setEditingConfig] = useState<EditingConfig>(DEFAULT_CONFIG);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [channels, setChannels] = useState<ChannelMonitor[]>(MOCK_CHANNELS);
  
  const [projects, setProjects] = useState<Project[]>([
    { id: 'p1', name: 'Podcast Vilela', clientName: 'Vilela', createdAt: new Date(), clipCount: 12, color: 'bg-emerald-500' },
    { id: 'p2', name: 'Cortes Financeiros', clientName: 'Primo', createdAt: new Date(), clipCount: 5, color: 'bg-blue-500' }
  ]);

  const [playingClip, setPlayingClip] = useState<GeneratedClip | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [editingClip, setEditingClip] = useState<GeneratedClip | null>(null);
  const [auditClip, setAuditClip] = useState<GeneratedClip | null>(null);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [publishingClip, setPublishingClip] = useState<GeneratedClip | null>(null);
  const [showAgencySettings, setShowAgencySettings] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showAutoReplyModal, setShowAutoReplyModal] = useState<GeneratedClip | null>(null);
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [bulkPublishing, setBulkPublishing] = useState<GeneratedClip[] | null>(null);

  const [connectedAccounts, setConnectedAccounts] = useState<ConnectedAccount[]>([
    { id: 'acc_1', platform: 'TIKTOK', username: 'stark_cuts_official', isConnected: true, avatarUrl: 'https://picsum.photos/50/50?r=1' },
    { id: 'acc_2', platform: 'INSTAGRAM', username: 'stark.reels', isConnected: true, avatarUrl: 'https://picsum.photos/50/50?r=2' },
  ]);
  const [agencyConfig, setAgencyConfig] = useState<AgencyConfig>({
      isEnabled: false,
      companyName: 'Corte+ Authority',
      primaryColor: '#ffffff' 
  });

  useEffect(() => {
    if (agencyConfig.isEnabled) {
      document.documentElement.style.setProperty('--color-accent-500', agencyConfig.primaryColor);
    }
  }, [agencyConfig]);

  const checkFeatureAccess = (feature: 'AGENCY' | '4K_RENDER' | 'UNLIMITED_CLIPS') => {
      const plan = user.subscription.plan;
      if (feature === 'AGENCY' && plan !== PlanTier.AGENCY) {
          setShowPricingModal(true);
          return false;
      }
      if (feature === '4K_RENDER' && plan === PlanTier.FREE) {
          setShowPricingModal(true);
          return false;
      }
      return true;
  };

  const handleConnectAccount = (platform: SocialPlatform) => {
    const newAccount: ConnectedAccount = {
        id: `acc_${Date.now()}`,
        platform,
        username: `user_${platform.toLowerCase()}`,
        isConnected: true,
        avatarUrl: `https://picsum.photos/50/50?r=${Math.random()}`
    };
    setConnectedAccounts([...connectedAccounts, newAccount]);
  };

  const handleDisconnectAccount = (accountId: string) => {
      setConnectedAccounts(connectedAccounts.filter(a => a.id !== accountId));
  };

  const processSingleUrl = async (url: string) => {
    const videoId = getYoutubeId(url);
    if (!videoId) return;

    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      source: {
        id: videoId,
        url: url,
        title: `Processando ${videoId}...`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: 'YouTube Channel',
        duration: '...',
        addedAt: new Date()
      },
      status: ProcessingStatus.ANALYZING,
      progress: 0,
      generatedClips: [],
      config: editingConfig
    };

    setJobs(prev => [newJob, ...prev]);

    try {
        // CALL BACKEND OR FALLBACK
        const analysisResults = await apiService.processVideo(url, editingConfig.styles);
        
        let expandedClips: GeneratedClip[] = [];
        
        analysisResults.forEach((rawClip, index) => {
            editingConfig.styles.forEach((style) => {
                expandedClips.push({
                    ...rawClip,
                    id: Math.random().toString(36).substr(2, 9),
                    sourceId: newJob.source.id,
                    projectId: activeProjectId || undefined,
                    videoId: videoId, 
                    title: rawClip.title || `Corte Viral ${index + 1}`,
                    viralScore: rawClip.viralScore || 85,
                    style: style,
                    videoUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, 
                    startTime: rawClip.startTime || 60,
                    endTime: rawClip.endTime || 90,
                    transcriptSnippet: rawClip.transcriptSnippet || "Texto processado...",
                    hashtags: rawClip.hashtags || ["#viral"],
                    socialMetadata: rawClip.socialMetadata,
                    appliedTech: {
                        faceTracking: editingConfig.faceTracking === 'ACTIVE_SPEAKER_AI',
                        mastered: editingConfig.audioMastering
                    }
                } as GeneratedClip);
            });
        });

        // Update Job with Clips
        setJobs(prev => prev.map(j => j.id === newJob.id ? { 
            ...j, 
            status: ProcessingStatus.COMPLETED, 
            progress: 100,
            generatedClips: expandedClips,
            source: { ...j.source, title: expandedClips[0]?.title || "Vídeo Processado" }
        } : j));

    } catch (error) {
        console.error(error);
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: ProcessingStatus.FAILED } : j));
    }
  };

  const handleProcessVideo = async () => {
    if (!inputUrl) return;
    const urls = inputUrl.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0);
    
    if (urls.length === 0) {
      alert("Por favor, insira pelo menos um link válido do YouTube.");
      return;
    }

    setActiveTab('queue');
    setInputUrl('');

    urls.forEach((url, index) => {
        setTimeout(() => {
            processSingleUrl(url);
        }, index * 1000);
    });
  };

  const handleSimulation = () => {
    setInputUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    setTimeout(() => handleProcessVideo(), 100);
  };

  const handleSaveEdit = (clipId: string, edits: ManualEdits) => {
    setJobs(prevJobs => prevJobs.map(job => ({
        ...job,
        generatedClips: job.generatedClips.map(c => c.id === clipId ? { ...c, manualEdits: edits } : c)
    })));
  };

  // Função para salvar a URL gerada pelo VEO (VideoPlayer callback)
  const handleUpdateClip = (updatedClip: GeneratedClip) => {
      setJobs(prevJobs => prevJobs.map(job => ({
          ...job,
          generatedClips: job.generatedClips.map(c => c.id === updatedClip.id ? updatedClip : c)
      })));
      // Update playingClip so the player reflects changes immediately
      if (playingClip?.id === updatedClip.id) {
          setPlayingClip(updatedClip);
      }
  };

  const handleRegenerateVariant = (clip: GeneratedClip) => {
      const variant: GeneratedClip = {
          ...clip,
          id: Math.random().toString(),
          title: `${clip.title} (Pivot V2)`,
          viralScore: Math.min(100, clip.viralScore + 5),
          style: clip.style === CutStyle.STANDARD_VERTICAL ? CutStyle.SPLIT_SATISFYING : CutStyle.STANDARD_VERTICAL,
          abVariant: 'C',
          manualEdits: { ...clip.manualEdits, customTitle: `${clip.title} 🔥` }
      };
      
      setJobs(prev => prev.map(j => {
          if (j.generatedClips.find(c => c.id === clip.id)) {
              return { ...j, generatedClips: [variant, ...j.generatedClips] };
          }
          return j;
      }));
  };

  const handlePublish = (clipId: string, accountIds: string[]) => {
      setJobs(prev => prev.map(j => ({
          ...j,
          generatedClips: j.generatedClips.map(c => {
              if (c.id === clipId || (bulkPublishing && bulkPublishing.find(bc => bc.id === c.id))) {
                   return c; 
              }
              return c;
          })
      })));
      setPublishingClip(null);
      setBulkPublishing(null);
      setSelectionMode(false);
      setSelectedClipIds([]);
  };

  const handleCreateProject = (name: string, clientName: string) => {
      const newProject: Project = {
          id: Math.random().toString(),
          name,
          clientName,
          createdAt: new Date(),
          clipCount: 0,
          color: 'bg-indigo-500'
      };
      setProjects([...projects, newProject]);
      setActiveProjectId(newProject.id);
  };

  const toggleClipSelection = (clipId: string) => {
      if (selectedClipIds.includes(clipId)) {
          setSelectedClipIds(selectedClipIds.filter(id => id !== clipId));
      } else {
          setSelectedClipIds([...selectedClipIds, clipId]);
      }
  };

  const handleBulkPublishClick = () => {
      const clipsToPublish = jobs.flatMap(j => j.generatedClips).filter(c => selectedClipIds.includes(c.id));
      if (clipsToPublish.length > 0) {
          setBulkPublishing(clipsToPublish);
      }
  };

  const allClips = jobs.flatMap(j => j.generatedClips).filter(c => !activeProjectId || c.projectId === activeProjectId);
  const activeJobs = jobs.filter(j => j.status === ProcessingStatus.ANALYZING || j.status === ProcessingStatus.GENERATING);

  return (
    <div className="fixed inset-0 flex h-screen bg-grafite-950 text-white font-sans overflow-hidden relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none z-0"></div>

      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        projects={projects}
        activeProjectId={activeProjectId}
        onProjectSelect={setActiveProjectId}
        onCreateProject={() => setActiveTab('gallery')}
        agencyConfig={agencyConfig}
        onOpenAgencySettings={() => checkFeatureAccess('AGENCY') && setShowAgencySettings(true)}
        onOpenIntegrations={() => setShowIntegrations(true)}
        user={user}
        onUpgradeClick={() => setShowPricingModal(true)}
        onLogout={onLogout}
        onNavigateToSite={onNavigateToSite}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 border-b border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
           <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                 <IconSearch className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                 <input 
                   type="text" 
                   placeholder="Buscar na biblioteca..." 
                   className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:border-indigo-500/50 focus:bg-white/10 focus:outline-none transition-colors"
                 />
              </div>
           </div>
           <div className="flex items-center gap-4">
              <button className="p-2 text-slate-400 hover:text-white transition-colors relative">
                 <IconBell className="w-5 h-5" />
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></span>
              </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 scroll-smooth custom-scrollbar relative">
          
          {activeTab === 'studio' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                
                <div className="text-center py-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-medium text-indigo-300 mb-6 backdrop-blur-sm">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                        Corte+ Neural Engine v3.0
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight text-white">
                        Construa audiência com <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">escala industrial.</span>
                    </h1>
                    <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
                        Cole múltiplos URLs (um por linha) para processamento em lote com legendas sincronizadas.
                    </p>
                    
                    <div className="relative max-w-2xl mx-auto group">
                        <div className="absolute inset-0 bg-indigo-500/20 rounded-xl blur-xl group-hover:bg-indigo-500/30 transition-all duration-500 opacity-50"></div>
                        <div className="relative flex flex-col bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl transition-all group-hover:border-white/20">
                            <textarea 
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=...&#10;https://youtube.com/watch?v=...&#10;https://youtube.com/watch?v=..." 
                                className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-slate-600 text-sm min-h-[100px] resize-none scrollbar-thin"
                            />
                            <div className="flex justify-end p-2 border-t border-white/5">
                                <button 
                                    onClick={handleProcessVideo}
                                    className="bg-white text-grafite-950 px-8 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2 shadow-lg text-sm"
                                >
                                    <IconPlus className="w-4 h-4" />
                                    Processar Fila
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <button onClick={handleSimulation} className="mt-4 text-xs text-slate-500 hover:text-white underline">
                        Simular (Modo Demo)
                    </button>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-1 shadow-2xl backdrop-blur-md">
                    <div className="p-4 border-b border-white/5">
                        <h3 className="font-bold text-white flex items-center gap-2">
                           <IconZap className="w-4 h-4 text-indigo-400" />
                           Painel de Engenharia
                        </h3>
                    </div>
                    <div className="p-6">
                        <StyleSelector config={editingConfig} onChange={setEditingConfig} />
                    </div>
                </div>

                {activeJobs.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="font-bold text-slate-400 text-sm uppercase tracking-widest pl-2">Processando Agora ({activeJobs.length})</h3>
                        {activeJobs.map(job => (
                            <JobCard key={job.id} job={job} />
                        ))}
                    </div>
                )}
            </div>
          )}

          {activeTab === 'gallery' && (
             <div className="flex h-full gap-6">
                 <ProjectSidebar 
                    projects={projects}
                    activeProjectId={activeProjectId}
                    onSelectProject={setActiveProjectId}
                    onCreateProject={handleCreateProject}
                 />
                 
                 <div className="flex-1 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">
                           {activeProjectId ? projects.find(p => p.id === activeProjectId)?.name : 'Todos os Cortes'}
                           <span className="text-slate-500 text-lg font-normal ml-3">{allClips.length} vídeos</span>
                        </h2>
                        
                        <div className="flex gap-3">
                           <button 
                             onClick={() => {
                                 setSelectionMode(!selectionMode);
                                 setSelectedClipIds([]);
                             }}
                             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${selectionMode ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                           >
                             {selectionMode ? 'Cancelar Seleção' : 'Selecionar Vários'}
                           </button>
                           <button 
                              onClick={() => {
                                  if (!checkFeatureAccess('4K_RENDER')) return;
                                  setShowExportModal(true);
                              }}
                              className="bg-white text-grafite-950 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                           >
                              Exportar Real
                           </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {allClips.map(clip => (
                            <ClipResult 
                                key={clip.id} 
                                clip={clip} 
                                onPlay={setPlayingClip} 
                                onAudit={setAuditClip}
                                onEdit={setEditingClip}
                                onPublish={(c) => setPublishingClip(c)}
                                selectionMode={selectionMode}
                                isSelected={selectedClipIds.includes(clip.id)}
                                onToggleSelection={() => toggleClipSelection(clip.id)}
                                onRegenerate={() => handleRegenerateVariant(clip)}
                            />
                        ))}
                    </div>
                 </div>
             </div>
          )}

          {activeTab === 'queue' && (
             <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
                 <h2 className="text-2xl font-bold text-white mb-6">Fila de Processamento</h2>
                 {jobs.length === 0 ? (
                     <div className="text-center py-20 text-slate-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                         Nenhum trabalho na fila.
                     </div>
                 ) : (
                     jobs.map(job => <JobCard key={job.id} job={job} />)
                 )}
             </div>
          )}

          {activeTab === 'dashboard' && <AnalyticsDashboard />}

        </main>
        
        {selectionMode && selectedClipIds.length > 0 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-grafite-900/90 backdrop-blur-xl border border-white/10 shadow-2xl rounded-full px-8 py-4 flex items-center gap-8 animate-slide-up z-30">
                <span className="text-sm font-bold text-white">{selectedClipIds.length} selecionados</span>
                <div className="h-4 w-px bg-white/20"></div>
                <button 
                    onClick={handleBulkPublishClick}
                    className="text-sm font-bold text-indigo-400 hover:text-white transition-colors"
                >
                    🚀 Publicar em Massa
                </button>
                <button 
                    onClick={() => {
                         if (!checkFeatureAccess('4K_RENDER')) return;
                         setShowExportModal(true); 
                    }}
                    className="text-sm font-bold text-emerald-400 hover:text-white transition-colors"
                >
                    ⬇ Baixar (ZIP)
                </button>
            </div>
        )}

      </div>

      {playingClip && <VideoPlayer 
          clip={playingClip} 
          onClose={() => setPlayingClip(null)} 
          onUpdateClip={handleUpdateClip}
      />}
      
      {showExportModal && (
        <RendererModal 
            clips={selectionMode && selectedClipIds.length > 0 
                ? allClips.filter(c => selectedClipIds.includes(c.id))
                : allClips
            } 
            onClose={() => setShowExportModal(false)} 
        />
      )}
      
      {auditClip && (
        <ViralAuditModal 
            clip={auditClip} 
            audit={auditClip.audit || null} 
            isLoading={false} 
            onClose={() => setAuditClip(null)} 
        />
      )}
      
      {editingClip && (
        <EditorModal 
           clip={editingClip} 
           onSave={handleSaveEdit} 
           onClose={() => setEditingClip(null)}
           onCheckCopyright={(id) => alert(`Copyright Check started for ${id}`)}
        />
      )}
      
      {showIntegrations && (
        <IntegrationsModal 
           accounts={connectedAccounts} 
           onConnect={handleConnectAccount}
           onDisconnect={handleDisconnectAccount}
           onClose={() => setShowIntegrations(false)} 
        />
      )}

      {(publishingClip || bulkPublishing) && (
        <PublishModal 
           clip={publishingClip || bulkPublishing![0]} 
           accounts={connectedAccounts}
           onPublish={(id, accs) => {
               if (bulkPublishing) {
                   bulkPublishing.forEach(c => handlePublish(c.id, accs));
               } else {
                   handlePublish(id, accs);
               }
           }}
           onClose={() => { setPublishingClip(null); setBulkPublishing(null); }}
        />
      )}

      {showAgencySettings && (
          <AgencySettingsModal 
             config={agencyConfig}
             onSave={setAgencyConfig}
             onClose={() => setShowAgencySettings(false)}
          />
      )}

      {showPricingModal && (
          <PricingModal 
             currentPlan={user.subscription.plan}
             onUpgrade={onUpgradeUser}
             onClose={() => setShowPricingModal(false)}
          />
      )}
      
      {showAutoReplyModal && (
          <AutoReplyModal 
             clip={showAutoReplyModal}
             onSave={(conf) => setShowAutoReplyModal(null)}
             onClose={() => setShowAutoReplyModal(null)}
          />
      )}

    </div>
  );
};

export default PlatformApp;
