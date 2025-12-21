
import { ChannelMonitor, CutStyle, AnalyticsSummary, GeneratedClip, AudioMood, BRollType, FaceTrackingMode, EditingConfig, ViralTrack } from './types';

export const MOCK_CHANNELS: ChannelMonitor[] = [
  {
    id: 'c1',
    name: 'Flow Podcast',
    platform: 'YOUTUBE',
    lastScan: new Date(),
    avatar: 'https://picsum.photos/50/50?random=1'
  },
  {
    id: 'c2',
    name: 'Casimiro',
    platform: 'TWITCH',
    lastScan: new Date(Date.now() - 3600000),
    avatar: 'https://picsum.photos/50/50?random=2'
  },
  {
    id: 'c3',
    name: 'Podpah',
    platform: 'YOUTUBE',
    lastScan: new Date(Date.now() - 7200000),
    avatar: 'https://picsum.photos/50/50?random=3'
  }
];

export const MOCK_VIRAL_TRACKS: ViralTrack[] = [
  { id: 'vt1', title: 'Montagem PR Funk', artist: 'S3BZS', platform: 'TIKTOK', trendingScore: 99, category: 'MUSIC', coverUrl: 'https://picsum.photos/60/60?r=1' },
  { id: 'vt2', title: 'Sigma Phonk 2024', artist: 'Kordhell', platform: 'TIKTOK', trendingScore: 97, category: 'MUSIC', coverUrl: 'https://picsum.photos/60/60?r=2' },
  { id: 'vt3', title: 'Suspense Build-up', artist: 'Viral FX', platform: 'TIKTOK', trendingScore: 85, category: 'SFX', coverUrl: 'https://picsum.photos/60/60?r=3' },
  { id: 'vt4', title: 'Golden Hour', artist: 'JVKE', platform: 'INSTAGRAM', trendingScore: 94, category: 'MUSIC', coverUrl: 'https://picsum.photos/60/60?r=4' },
  { id: 'vt5', title: 'Motivational Piano', artist: 'Inspiration', platform: 'INSTAGRAM', trendingScore: 88, category: 'MUSIC', coverUrl: 'https://picsum.photos/60/60?r=5' },
  { id: 'vt6', title: 'Oh No', artist: 'Kreepa', platform: 'TIKTOK', trendingScore: 92, category: 'MEME_SOUND', coverUrl: 'https://picsum.photos/60/60?r=6' },
  { id: 'vt7', title: 'Lo-fi Beats', artist: 'Chillhop', platform: 'YOUTUBE', trendingScore: 90, category: 'MUSIC', coverUrl: 'https://picsum.photos/60/60?r=7' },
];

export const DEFAULT_CONFIG: EditingConfig = {
  styles: [CutStyle.SPLIT_SATISFYING], 
  faceTracking: FaceTrackingMode.ACTIVE_SPEAKER_AI,
  audioMastering: true,
  audioMood: AudioMood.AI_AUTO_DETECT, 
  bRollType: BRollType.AI_AUTO_DETECT,
  sfxEnabled: true,
  memeDensity: 'NONE'
};

export const RELAXING_VIDEO_URLS = [
  'https://picsum.photos/300/500?grayscale', 
  'https://picsum.photos/300/500?blur=2'
];

export const STYLE_LABELS: Record<CutStyle, string> = {
  [CutStyle.SPLIT_CONTEXT]: '1. Split: Vídeo + Foto Contexto',
  [CutStyle.SPLIT_SATISFYING]: '2. Split: Satisfatório Viral',
  [CutStyle.STANDARD_VERTICAL]: '3. Padrão Vertical (Full)',
  [CutStyle.MEME_MODE]: '4. Modo Meme (Engraçado)',
};

export const AUDIO_LABELS: Record<AudioMood, string> = {
  [AudioMood.AI_AUTO_DETECT]: '🤖 IA Decide (Auto-Mix)',
  [AudioMood.VIRAL_PLATFORM]: '🔥 Viral da Plataforma',
  [AudioMood.NONE]: 'Som Original',
  [AudioMood.PHONK_VIRAL]: 'Phonk (Agressivo)',
  [AudioMood.LOFI_CHILL]: 'Lofi (Relaxante)',
  [AudioMood.TENSION_BUILDUP]: 'Tensão (Storytelling)',
  [AudioMood.CORPORATE_UPLIFT]: 'Clean (Motivacional)'
};

export const BROLL_LABELS: Record<BRollType, string> = {
  [BRollType.AI_AUTO_DETECT]: '🤖 IA Decide (Contextual)',
  [BRollType.NONE]: 'Apenas Vídeo Original',
  [BRollType.SEMANTIC_AI]: 'Imagens Semânticas (IA)',
  [BRollType.ABSTRACT_LOOPS]: 'Backgrounds Abstratos'
};

const createMockClip = (title: string, views: number, earnings: number, score: number): GeneratedClip => ({
  id: Math.random().toString(),
  sourceId: 'mock',
  videoId: 'MOCK',
  title,
  viralScore: score,
  style: CutStyle.SPLIT_SATISFYING,
  videoUrl: `https://picsum.photos/300/500?random=${Math.random()}`,
  startTime: 0,
  endTime: 60,
  transcriptSnippet: "Corte de exemplo para analytics...",
  hashtags: ["#viral", "#fy"],
  views,
  earnings,
  appliedTech: { faceTracking: true, mastered: true }
});

export const MOCK_ANALYTICS: AnalyticsSummary = {
  totalViews: 14500000, // 14.5M
  totalEarnings: 8430.50, // $8.4k
  activeChannels: 12,
  platformStats: [
    { platform: 'YouTube Shorts', totalViews: 8200000, totalEarnings: 4100.20, rpm: 0.50, color: 'bg-red-500' },
    { platform: 'TikTok', totalViews: 5100000, totalEarnings: 1530.00, rpm: 0.30, color: 'bg-black' }, 
    { platform: 'Instagram Reels', totalViews: 1200000, totalEarnings: 2800.30, rpm: 2.33, color: 'bg-pink-600' }
  ],
  topClips: [
    createMockClip("A Verdade Sobre Marte", 2400000, 1200.00, 99),
    createMockClip("Cachorro Caramelo vs Gato", 1800000, 900.50, 98),
    createMockClip("Dica Milionária", 1200000, 600.00, 95),
    createMockClip("Erro na Matrix Gravado", 950000, 475.00, 94),
    createMockClip("Melhor Piada do Ano", 800000, 400.00, 92)
  ],
  worstClips: [
    createMockClip("Introdução Podcast #40", 1200, 0.05, 45),
    createMockClip("Teste de Microfone", 850, 0.02, 42),
    createMockClip("Pausa para Água", 500, 0.00, 30),
    createMockClip("Erro Técnico", 320, 0.00, 25),
    createMockClip("Final dos Créditos", 150, 0.00, 15)
  ]
};
