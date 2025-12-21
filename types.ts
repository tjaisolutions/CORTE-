
export enum ProcessingStatus {
  QUEUED = 'QUEUED',
  ANALYZING = 'ANALYZING', // Gemini Analysis
  GENERATING = 'GENERATING', // Cutting/Rendering
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export type AppView = 'LANDING' | 'AUTH' | 'DASHBOARD';

export enum PlanTier {
  FREE = 'FREE',
  CREATOR = 'CREATOR', // $29/mo
  AGENCY = 'AGENCY'    // $99/mo
}

export interface UserSubscription {
  plan: PlanTier;
  status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE';
  renewsAt: Date;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  subscription: UserSubscription;
  usage: {
    minutesUsed: number;
    minutesLimit: number;
  }
}

// NOVOS ESTILOS RESTRITOS (Cartoon Removido)
export enum CutStyle {
  SPLIT_CONTEXT = 'SPLIT_CONTEXT',       // 1. Metade vídeo / Metade foto (Podcast)
  SPLIT_SATISFYING = 'SPLIT_SATISFYING', // 2. Vídeo / Satisfatório (YouTube Links)
  STANDARD_VERTICAL = 'STANDARD_VERTICAL', // 3. Padrão Vertical Cheio + Legenda
  MEME_MODE = 'MEME_MODE',               // 4. Meme (Gifs, overlays, engraçado)
}

export enum AudioMood {
  AI_AUTO_DETECT = 'AI_AUTO_DETECT', // IA Escolhe baseada no contexto
  VIRAL_PLATFORM = 'VIRAL_PLATFORM', // Novo: Usa uma track específica viral
  NONE = 'NONE',
  PHONK_VIRAL = 'PHONK_VIRAL',
  LOFI_CHILL = 'LOFI_CHILL',
  TENSION_BUILDUP = 'TENSION_BUILDUP',
  CORPORATE_UPLIFT = 'CORPORATE_UPLIFT'
}

export interface ViralTrack {
  id: string;
  title: string;
  artist: string;
  platform: SocialPlatform;
  trendingScore: number; // 0-100
  coverUrl: string;
  category: 'MUSIC' | 'MEME_SOUND' | 'SFX';
}

export enum BRollType {
  AI_AUTO_DETECT = 'AI_AUTO_DETECT', // IA Escolhe baseada no contexto
  NONE = 'NONE',
  SEMANTIC_AI = 'SEMANTIC_AI', // Palavras-chave gatilham imagens
  ABSTRACT_LOOPS = 'ABSTRACT_LOOPS' // Loops de fundo
}

export enum FaceTrackingMode {
  CENTER_CROP = 'CENTER_CROP',
  ACTIVE_SPEAKER_AI = 'ACTIVE_SPEAKER_AI' // IA detecta quem fala e move a camera
}

export interface EditingConfig {
  styles: CutStyle[];
  faceTracking: FaceTrackingMode;
  audioMastering: boolean; // Remover ruído + Equalizar
  audioMood: AudioMood;
  selectedViralTrackId?: string; // ID da track viral selecionada
  bRollType: BRollType;
  // Hyper-Editing Features
  sfxEnabled: boolean; // Sound Effects (Woosh, Pop, Risada)
  memeDensity: 'NONE' | 'LOW' | 'HIGH'; // Injeção de Memes
}

export interface VideoSource {
  id: string;
  url: string;
  title: string;
  thumbnail: string;
  channelName: string;
  duration: string;
  addedAt: Date;
}

export interface ViralAudit {
  score: number;
  verdict: 'VIRAL' | 'BOM' | 'MEDIO' | 'RUIM';
  hookRating: number; // 0-10
  retentionPrediction: string;
  suggestions: string[];
  reasoning: string;
}

export type SocialPlatform = 'TIKTOK' | 'INSTAGRAM' | 'YOUTUBE' | 'KWAI';

export interface SocialMetadata {
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
}

export interface BrandingConfig {
  logoUrl?: string;
  primaryColor: string;
  showWatermark: boolean;
}

export interface ManualEdits {
  customTitle?: string;
  customTranscript?: string;
  trimStart?: number;
  trimEnd?: number;
  branding?: BrandingConfig;
  isDubbed?: boolean; // Se foi aplicada dublagem IA
  isLipSynced?: boolean; // Se foi aplicado Lip-Sync Neural
  isOverdubbed?: boolean; // Se houve correção de voz pontual
  backgroundPrompt?: string; // Prompt personalizado para o VEO
  backgroundVideoUrl?: string; // URL do vídeo gerado (cache)
}

export interface PublishHistory {
    platform: SocialPlatform;
    status: 'PUBLISHED' | 'FAILED';
    publishedAt: Date;
    postUrl?: string;
}

export interface Project {
  id: string;
  name: string;
  clientName?: string;
  createdAt: Date;
  clipCount: number;
  color: string;
}

export interface AutoReplyConfig {
  isActive: boolean;
  personality: 'POLITE' | 'CONTROVERSIAL' | 'FUNNY';
  replyLimit: number; // Max replies per post
}

export interface CopyrightStatus {
  status: 'SAFE' | 'RISK' | 'CHECKING';
  details?: string;
}

// Estrutura para legendas dinâmicas palavra por palavra
export interface CaptionWord {
  word: string;
  start: number; // Offset em segundos relativo ao início do clipe
  end: number;
  highlight?: boolean; // Se deve ter destaque (cor diferente)
}

export interface GeneratedClip {
  id: string;
  sourceId: string;
  projectId?: string; // Pasta do projeto
  videoId: string; // YouTube ID real
  title: string;
  viralScore: number;
  style: CutStyle;
  videoUrl: string; // Thumbnail URL
  startTime: number; // Segundos
  endTime: number; // Segundos
  transcriptSnippet: string;
  captions?: CaptionWord[]; // Legendas dinâmicas
  hashtags: string[]; // Generic fallback
  socialMetadata?: SocialMetadata[]; // Platform specific content
  
  // Tech Badges (Qualidade)
  appliedTech?: {
    faceTracking: boolean;
    audioMood?: string;
    viralTrack?: ViralTrack; // Track especifica usada
    bRoll?: boolean;
    mastered?: boolean;
    sfx?: boolean;
    memes?: boolean;
  };

  // Edições Manuais (Studio)
  manualEdits?: ManualEdits;
  backgroundPrompt?: string; // Prompt do VEO
  backgroundVideoUrl?: string; // URL gerada pelo VEO (persiste entre sessões)

  // A/B Testing
  abTestGroup?: string; // ID do grupo de teste
  abVariant?: 'A' | 'B' | 'C'; // Identificador da variante

  // Analytics & Publishing
  views?: number;
  likes?: number;
  earnings?: number; // Em USD
  platforms?: SocialPlatform[]; // Onde já performou (Analytics mock)
  publishHistory?: PublishHistory[]; // Onde foi publicado pelo sistema
  autoReplyConfig?: AutoReplyConfig;
  
  audit?: ViralAudit; // Resultado da auditoria
  copyright?: CopyrightStatus;
}

export interface AgencyConfig {
  isEnabled: boolean;
  companyName: string;
  primaryColor: string; // Hex color override
  logoUrl?: string;
}

export interface Job {
  id: string;
  source: VideoSource;
  status: ProcessingStatus;
  progress: number;
  generatedClips: GeneratedClip[];
  config: EditingConfig; // Nova config completa
}

export interface ChannelMonitor {
  id: string;
  name: string;
  platform: 'YOUTUBE' | 'TWITCH' | 'TIKTOK';
  lastScan: Date;
  avatar: string;
}

export interface PlatformStats {
  platform: 'YouTube Shorts' | 'TikTok' | 'Instagram Reels';
  totalViews: number;
  totalEarnings: number;
  rpm: number; // Revenue per mille
  color: string;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalEarnings: number;
  activeChannels: number;
  topClips: GeneratedClip[];
  worstClips: GeneratedClip[];
  platformStats: PlatformStats[];
}

export interface ConnectedAccount {
    id: string; // Unique ID for multi-account support
    platform: SocialPlatform;
    username: string;
    isConnected: boolean;
    avatarUrl?: string;
    lastSync?: Date;
}
