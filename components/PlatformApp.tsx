
import React, { useState, useEffect, useRef } from 'react';
import { 
  Job, ProcessingStatus, ChannelMonitor, GeneratedClip, EditingConfig,
  AudioMood, BRollType, ManualEdits, ConnectedAccount, SocialPlatform, Project, AutoReplyConfig, AgencyConfig,
  User, PlanTier, CutStyle, ViralTrack
} from '../types';
import { MOCK_CHANNELS, DEFAULT_CONFIG, MOCK_VIRAL_TRACKS } from '../constants';
import { apiService } from '../services/apiService';

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
import { IconSearch, IconBell, IconPlus, IconZap, IconCloud, IconVideo } from './Icons';

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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      setActiveTab('queue');

      const tempJob: Job = {
          id: `up-${Date.now()}`,
          source: {
              id: 'local',
              url: '',
              title: `Upload: ${file.name}`,
              thumbnail: 'https://via.placeholder.com/300x200?text=MP4+Upload',
              channelName: 'Local File',
              duration: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
              addedAt: new Date()
          },
          status: ProcessingStatus.ANALYZING,
          progress: 50,
          generatedClips: [],
          config: editingConfig
      };

      setJobs(prev => [tempJob, ...prev]);

      try {
          const results = await apiService.uploadVideo(file, editingConfig.styles);
          const expanded = results.map(r => ({
              ...r,
              id: Math.random().toString(36).substr(2, 9),
              sourceId: 'local',
              projectId: activeProjectId || undefined,
              videoUrl: r.videoUrl || 'https://via.placeholder.com/300/500?text=Clip',
              isLocal: true
          })) as GeneratedClip[];

          setJobs(prev => prev.map(j => j.id === tempJob.id ? { 
              ...j, 
              status: ProcessingStatus.COMPLETED, 
              progress: 100, 
              generatedClips: expanded 
          } : j));
      } catch (e) {
          alert("Erro no upload: " + e.message);
          setJobs(prev => prev.map(j => j.id === tempJob.id ? { ...j, status: ProcessingStatus.FAILED } : j));
      } finally {
          setIsUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
      }
  };

  const handleProcessVideo = async () => {
    if (!inputUrl) return;
    const urls = inputUrl.split(/[\n,]+/).map(u => u.trim()).filter(u => u.length > 0);
    setActiveTab('queue');
    setInputUrl('');
    urls.forEach(url => processSingleUrl(url));
  };

  const processSingleUrl = async (url: string) => {
    const videoId = getYoutubeId(url);
    if (!videoId) return;

    const newJob: Job = {
      id: Math.random().toString(36).substr(2, 9),
      source: {
        id: videoId,
        url: url,
        title: `YouTube: ${videoId}`,
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        channelName: 'YouTube',
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
        const analysisResults = await apiService.processVideo(url, editingConfig.styles);
        const expandedClips = analysisResults.map(rawClip => ({
            ...rawClip,
            id: Math.random().toString(36).substr(2, 9),
            sourceId: newJob.source.id,
            projectId: activeProjectId || undefined,
            videoId: videoId,
            videoUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        })) as GeneratedClip[];

        setJobs(prev => prev.map(j => j.id === newJob.id ? { 
            ...j, 
            status: ProcessingStatus.COMPLETED, 
            progress: 100,
            generatedClips: expandedClips
        } : j));
    } catch (error) {
        setJobs(prev => prev.map(j => j.id === newJob.id ? { ...j, status: ProcessingStatus.FAILED } : j));
    }
  };

  const handleUpdateClip = (updatedClip: GeneratedClip) => {
      setJobs(prevJobs => prevJobs.map(job => ({
          ...job,
          generatedClips: job.generatedClips.map(c => c.id === updatedClip.id ? updatedClip : c)
      })));
  };

  // Fix: Implemented handlePublish to mock the publishing process and update clip history.
  const handlePublish = (clipId: string, accountIds: string[]) => {
      setJobs(prevJobs => prevJobs.map(job => ({
          ...job,
          generatedClips: job.generatedClips.map(clip => {
              if (clip.id === clipId) {
                  const newHistory = accountIds.map(accId => {
                      const acc = connectedAccounts.find(a => a.id === accId);
                      return {
                          platform: acc?.platform || 'TIKTOK' as SocialPlatform,
                          status: 'PUBLISHED' as const,
                          publishedAt: new Date(),
                          postUrl: '#'
                      };
                  });
                  return {
                      ...clip,
                      publishHistory: [...(clip.publishHistory || []), ...newHistory]
                  };
              }
              return clip;
          })
      })));
      setPublishingClip(null);
  };

  const allClips = jobs.flatMap(j => j.generatedClips).filter(c => !activeProjectId || c.projectId === activeProjectId);
  const activeJobs = jobs.filter(j => j.status === ProcessingStatus.ANALYZING || j.status === ProcessingStatus.GENERATING);

  return (
    <div className="fixed inset-0 flex h-screen bg-grafite-950 text-white font-sans overflow-hidden relative">
      <Sidebar 
        activeTab={activeTab} onTabChange={setActiveTab} projects={projects}
        activeProjectId={activeProjectId} onProjectSelect={setActiveProjectId}
        onCreateProject={() => setActiveTab('gallery')} agencyConfig={agencyConfig}
        onOpenAgencySettings={() => setShowAgencySettings(true)}
        onOpenIntegrations={() => setShowIntegrations(true)} user={user}
        onUpgradeClick={() => setShowPricingModal(true)} onLogout={onLogout}
        onNavigateToSite={onNavigateToSite}
      />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 border-b border-white/5 bg-white/5 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-20">
           <div className="flex items-center gap-4 flex-1">
              <div className="relative w-full max-w-md">
                 <IconSearch className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                 <input type="text" placeholder="Buscar na biblioteca..." className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none" />
              </div>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 custom-scrollbar relative">
          {activeTab === 'studio' && (
            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-20">
                <div className="text-center py-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-white">Industrialize seu conteúdo.</h1>
                    <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">Insira links do YouTube ou faça upload de arquivos MP4 para começar.</p>
                    
                    <div className="max-w-2xl mx-auto space-y-4">
                        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-2 flex flex-col">
                            <textarea 
                                value={inputUrl} onChange={(e) => setInputUrl(e.target.value)}
                                placeholder="https://youtube.com/watch?v=..." 
                                className="bg-transparent border-none outline-none text-white px-4 py-3 placeholder-slate-600 text-sm min-h-[80px] resize-none"
                            />
                            <div className="flex justify-between items-center p-2 border-t border-white/5">
                                <input type="file" accept="video/mp4,video/x-m4v,video/*" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs text-slate-400 hover:text-white flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-all"
                                >
                                    <IconCloud className="w-4 h-4" /> Upload MP4
                                </button>
                                <button 
                                    onClick={handleProcessVideo}
                                    className="bg-white text-grafite-950 px-8 py-2 rounded-lg font-bold hover:bg-slate-200 transition-all flex items-center gap-2 text-sm"
                                >
                                    <IconZap className="w-4 h-4" /> Processar Link
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
                    <StyleSelector config={editingConfig} onChange={setEditingConfig} />
                </div>
            </div>
          )}

          {activeTab === 'gallery' && (
             <div className="flex h-full gap-6">
                 <ProjectSidebar projects={projects} activeProjectId={activeProjectId} onSelectProject={setActiveProjectId} onCreateProject={() => {}} />
                 <div className="flex-1 space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-white">Galeria de Ativos</h2>
                        <button onClick={() => setShowExportModal(true)} className="bg-white text-grafite-950 px-4 py-2 rounded-lg text-sm font-bold">Exportar Lote</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {allClips.map(clip => (
                            <ClipResult 
                                key={clip.id} clip={clip} onPlay={setPlayingClip} onEdit={setEditingClip}
                                onPublish={(c) => setPublishingClip(c)}
                                selectionMode={selectionMode} isSelected={selectedClipIds.includes(clip.id)}
                                onToggleSelection={() => {}}
                            />
                        ))}
                    </div>
                 </div>
             </div>
          )}

          {(activeTab === 'queue' || activeTab === 'studio') && activeJobs.length > 0 && (
              <div className="max-w-3xl mx-auto mt-8 space-y-4">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2">Monitor de Processamento</h3>
                  {activeJobs.map(job => <JobCard key={job.id} job={job} />)}
              </div>
          )}
        </main>
      </div>

      {playingClip && <VideoPlayer clip={playingClip} onClose={() => setPlayingClip(null)} onUpdateClip={handleUpdateClip} />}
      {showExportModal && <RendererModal clips={allClips} onClose={() => setShowExportModal(false)} />}
      {editingClip && <EditorModal clip={editingClip} onSave={() => {}} onClose={() => setEditingClip(null)} />}
      {showIntegrations && <IntegrationsModal accounts={connectedAccounts} onConnect={() => {}} onDisconnect={() => {}} onClose={() => setShowIntegrations(false)} />}
      {publishingClip && <PublishModal clip={publishingClip} accounts={connectedAccounts} onPublish={handlePublish} onClose={() => setPublishingClip(null)} />}
      {showAgencySettings && <AgencySettingsModal config={agencyConfig} onSave={setAgencyConfig} onClose={() => setShowAgencySettings(false)} />}
      {showPricingModal && <PricingModal currentPlan={user.subscription.plan} onUpgrade={onUpgradeUser} onClose={() => setShowPricingModal(false)} />}
    </div>
  );
};

export default PlatformApp;
