export interface Unit {
  id: string;
  book: 1 | 2; // 1 = Booklet 1 (上册), 2 = Booklet 2 (下册)
  number: number;
  title: string;
  topic: string;
  speakingSkill?: string;
  questionBank: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  translation?: string; // Optional helper translation
  audioUrl?: string; // If we generate tts on backend, or we can use browser TTS
  timestamp: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface SpeakingReport {
  pronunciation: number;
  fluency: number;
  vocabulary: number;
  grammar: number;
  communication: number;
  overall: number;
  strengths: string[];
  suggestions: string[];
}

export interface UserProgress {
  completedUnits: Record<string, {
    stars: number;
    score: number;
    completedAt: string;
  }>;
  unlockedBadges: string[];
  dailyStreak: number;
  lastActiveDate?: string;
  experiencePoints: number; // XP for gamification
}
