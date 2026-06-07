import React, { useState, useEffect } from 'react';
import { Unit, Badge, UserProgress, SpeakingReport } from './types';
import { INITIAL_BADGES } from './data/badges';
import Dashboard from './components/Dashboard';
import PracticeSession from './components/PracticeSession';
import EvaluationReport from './components/EvaluationReport';
import ExpressionCoach from './components/ExpressionCoach';
import EssayBuilder from './components/EssayBuilder';
import TextbookWritingCoach from './components/TextbookWritingCoach';
import { Sparkles, GraduationCap, Languages, BookMarked, BookOpen, PenTool } from 'lucide-react';

const LOCAL_STORAGE_PROGRESS_KEY = 'david_speaking_coach_progress_v1';
const LOCAL_STORAGE_BADGES_KEY = 'david_speaking_coach_badges_v1';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'practice' | 'evaluation' | 'coach' | 'essay' | 'writing'>('dashboard');
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [sessionDifficulty, setSessionDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [activeReport, setActiveReport] = useState<SpeakingReport | null>(null);

  // Gamification & Session State
  const [xpEarnedInCurrentSession, setXpEarnedInCurrentSession] = useState(0);
  const [unlockedBadgesInSession, setUnlockedBadgesInSession] = useState<string[]>([]);

  // Core Persistent State
  const [progress, setProgress] = useState<UserProgress>({
    completedUnits: {},
    unlockedBadges: [],
    dailyStreak: 0,
    experiencePoints: 0
  });

  const [badges, setBadges] = useState<Badge[]>(INITIAL_BADGES);

  // Synchronize localStorage on startup
  useEffect(() => {
    try {
      const storedProgress = localStorage.getItem(LOCAL_STORAGE_PROGRESS_KEY);
      const storedBadges = localStorage.getItem(LOCAL_STORAGE_BADGES_KEY);

      if (storedProgress) {
        setProgress(JSON.parse(storedProgress));
      } else {
        // Initialize daily streak base
        setProgress({
          completedUnits: {},
          unlockedBadges: [],
          dailyStreak: 1, // Start with a 1-day starting streak
          lastActiveDate: new Date().toDateString(),
          experiencePoints: 50 // starting reward
        });
      }

      if (storedBadges) {
        setBadges(JSON.parse(storedBadges));
      }
    } catch (e) {
      console.error("Local Storage parsing error:", e);
    }
  }, []);

  // Sync state helpers
  const saveProgressToLocal = (newProgress: UserProgress, newBadges: Badge[]) => {
    setProgress(newProgress);
    setBadges(newBadges);
    localStorage.setItem(LOCAL_STORAGE_PROGRESS_KEY, JSON.stringify(newProgress));
    localStorage.setItem(LOCAL_STORAGE_BADGES_KEY, JSON.stringify(newBadges));
  };

  const handleStartPractice = (unit: Unit, difficulty: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setSelectedUnit(unit);
    setSessionDifficulty(difficulty);
    setCurrentView('practice');
  };

  const handleCompleteSession = (report: SpeakingReport, finalChatCount: number) => {
    if (!selectedUnit) return;

    // 1. Calculate XP Gained
    const baseReward = report.overall * 2;
    const roundBonus = finalChatCount * 15;
    const totalXp = baseReward + roundBonus;

    // 2. Detect milestone Achievements/Badges
    const newlyUnlockedBadgeIds: string[] = [];
    const updatedBadges = badges.map(b => {
      if (b.unlocked) return b;

      let trigger = false;
      if (b.id === 'first_words') {
        trigger = true; // Complete any speaker practice
      }
      if (b.id === 'unit_explorer' && Object.keys(progress.completedUnits).length >= 0) {
        trigger = true; // Earned first report card
      }
      if (b.id === 'perfect_score' && report.overall >= 90) {
        trigger = true;
      }
      if (b.id === 'fluency_star' && report.fluency >= 92) {
        trigger = true;
      }
      if (b.id === 'wise_thinker' && (selectedUnit.id === '1-1' || selectedUnit.id === '1-2')) {
        trigger = true;
      }
      if (b.id === 'healthy_habits' && (selectedUnit.id === '1-6' || selectedUnit.id === '2-6')) {
        trigger = true;
      }

      if (trigger) {
        newlyUnlockedBadgeIds.push(b.id);
        return {
          ...b,
          unlocked: true,
          unlockedAt: new Date().toLocaleDateString()
        };
      }
      return b;
    });

    const activeBadgeList = updatedBadges.filter(b => b.unlocked).map(b => b.id);

    // 3. Dynamic Streak update
    let currentStreak = progress.dailyStreak || 1;
    const today = new Date().toDateString();
    if (progress.lastActiveDate && progress.lastActiveDate !== today) {
      const lastActive = new Date(progress.lastActiveDate);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      if (lastActive.toDateString() === yesterday.toDateString()) {
        currentStreak += 1;
      } else {
        currentStreak = 1; // reset streak if gap exists
      }
    }

    // 4. Update the Textbook Completion Units Info
    const existingUnitInfo = progress.completedUnits[selectedUnit.id];
    const bestStars = Math.max(
      existingUnitInfo ? existingUnitInfo.stars : 0,
      report.overall >= 90 ? 3 : report.overall >= 80 ? 2 : 1
    );
    const bestScore = Math.max(existingUnitInfo ? existingUnitInfo.score : 0, report.overall);

    const updatedCompletedUnits = {
      ...progress.completedUnits,
      [selectedUnit.id]: {
        stars: bestStars,
        score: bestScore,
        completedAt: new Date().toLocaleDateString()
      }
    };

    const newProgress: UserProgress = {
      completedUnits: updatedCompletedUnits,
      unlockedBadges: activeBadgeList,
      dailyStreak: currentStreak,
      lastActiveDate: today,
      experiencePoints: progress.experiencePoints + totalXp
    };

    // Store record stats to render on report screen
    setXpEarnedInCurrentSession(totalXp);
    setUnlockedBadgesInSession(newlyUnlockedBadgeIds);
    setActiveReport(report);

    // Persist standard values
    saveProgressToLocal(newProgress, updatedBadges);

    setCurrentView('evaluation');
  };

  const handleClearProgress = () => {
    // Fully clear and set default stats
    const defaultValue: UserProgress = {
      completedUnits: {},
      unlockedBadges: [],
      dailyStreak: 1,
      lastActiveDate: new Date().toDateString(),
      experiencePoints: 0
    };
    saveProgressToLocal(defaultValue, INITIAL_BADGES);
  };

  const handleRetrySession = () => {
    if (selectedUnit) {
      setCurrentView('practice');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-gray-800 flex flex-col transition-colors duration-300">
      
      {/* Top Application header */}
      <header className="bg-white border-b border-slate-100 py-3 px-4 sm:px-6 shadow-xs relative z-20 shrink-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:justify-between md:items-center gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FFB648] via-[#4F7CFF] to-[#7A5CFF] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-100/60 shrink-0">
              <span className="text-lg">🌟</span>
            </div>
            <div 
              className="text-left cursor-help group relative" 
              title="专为沪教版九年级学生打造的英语成长系统，融合口语陪练、表达升级、教材同步写作与中考能力训练。"
            >
              <h1 className="font-extrabold text-[#1e293b] text-base leading-tight tracking-tight flex items-center gap-1">
                David英语成长营
              </h1>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                沪教版九年级英语AI学习伙伴 <span className="font-medium text-slate-300 mx-1">|</span> <span className="font-mono text-[9px] text-[#4F7CFF]/90">Speaking · Expression · Writing · Growth</span>
              </span>
            </div>
          </div>

          {/* Navigation tab links */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-1 rounded-xl overflow-x-auto max-w-full">
            <button
              onClick={() => {
                setSelectedUnit(null);
                setCurrentView('dashboard');
              }}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black transition flex flex-col sm:flex-row items-center gap-1 cursor-pointer whitespace-nowrap leading-tight ${
                currentView === 'dashboard'
                  ? 'bg-white text-[#4F7CFF] shadow-xs ring-1 ring-slate-100/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📚</span>
              <span>课本同步 <span className="text-[8px] font-bold text-slate-400 block sm:inline">Textbook Units</span></span>
            </button>
            <button
              onClick={() => {
                setSelectedUnit(null);
                setCurrentView('dashboard');
                setTimeout(() => {
                  document.getElementById('textbook-units-deck')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black transition flex flex-col sm:flex-row items-center gap-1 cursor-pointer whitespace-nowrap leading-tight ${
                currentView === 'dashboard'
                  ? 'bg-white text-[#4F7CFF] shadow-xs ring-1 ring-slate-100/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🗣️</span>
              <span>口语陪练 <span className="text-[8px] font-bold text-slate-400 block sm:inline">Speaking Coach</span></span>
            </button>
            <button
              onClick={() => {
                setSelectedUnit(null);
                setCurrentView('coach');
              }}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black transition flex flex-col sm:flex-row items-center gap-1 cursor-pointer whitespace-nowrap leading-tight ${
                currentView === 'coach'
                  ? 'bg-white text-[#4F7CFF] shadow-xs ring-1 ring-slate-100/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>✨</span>
              <span>表达升级 <span className="text-[8px] font-bold text-slate-400 block sm:inline">Expression Coach</span></span>
            </button>
            <button
              onClick={() => {
                setSelectedUnit(null);
                setCurrentView('essay');
              }}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black transition flex flex-col sm:flex-row items-center gap-1 cursor-pointer whitespace-nowrap leading-tight ${
                currentView === 'essay'
                  ? 'bg-white text-[#4F7CFF] shadow-xs ring-1 ring-slate-100/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📝</span>
              <span>写作倍增器 <span className="text-[8px] font-bold text-slate-400 block sm:inline">Essay Builder</span></span>
            </button>
            <button
              onClick={() => {
                setSelectedUnit(null);
                setCurrentView('writing');
              }}
              className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-[11px] font-black transition flex flex-col sm:flex-row items-center gap-1 cursor-pointer whitespace-nowrap leading-tight ${
                currentView === 'writing'
                  ? 'bg-white text-[#4F7CFF] shadow-xs ring-1 ring-slate-100/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🎯</span>
              <span>教材同步写作 <span className="text-[8px] font-bold text-slate-400 block sm:inline">Writing Coach</span></span>
            </button>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
            {/* Streak indicator - Sleek Interface style */}
            <div 
              className="flex items-center gap-1.5 bg-[#FFF8EE] px-2.5 sm:px-3 py-1.5 rounded-full border border-[#FFE7C4] cursor-help"
              title="坚持学习，持续进步。"
            >
              <span className="text-[#FFB648] text-sm">🔥</span>
              <span className="text-[#FFB648] text-[10px] sm:text-xs font-bold whitespace-nowrap">连续成长 {progress.dailyStreak} 天</span>
            </div>

            {/* XP header badge link */}
            <div 
              className="flex items-center gap-1.5 bg-[#F0F4FF] px-2.5 sm:px-3 py-1.5 rounded-full text-[#4F7CFF] font-mono text-xs font-black ring-1 ring-blue-100 cursor-help"
              title="通过完成口语练习、表达训练和写作任务获得成长值。"
            >
              <span>🏆 成长值</span>
              <span className="bg-white/80 px-1.5 py-0.5 rounded-md text-[10px]">{progress.experiencePoints} XP</span>
            </div>

            <div 
              className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-500 font-bold bg-slate-50 border border-slate-100 rounded-full px-2.5 py-1.5 select-none cursor-help"
              title="正在为你的英语成长提供实时帮助。"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>AI成长导师在线</span>
              <span className="text-slate-300">|</span>
              <span className="text-[9px] text-slate-400 font-mono">AI Mentor Online</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main viewport scheduler */}
      <main className="flex-1 overflow-y-auto">
        {currentView === 'dashboard' && (
          <Dashboard 
            progress={progress}
            badges={badges}
            onSelectUnit={handleStartPractice}
            onClearProgress={handleClearProgress}
            onOpenExpressionCoach={() => setCurrentView('coach')}
            onOpenEssayBuilder={() => setCurrentView('essay')}
            onOpenWritingCoach={() => setCurrentView('writing')}
          />
        )}

        {currentView === 'practice' && selectedUnit && (
          <PracticeSession 
            unit={selectedUnit}
            difficulty={sessionDifficulty}
            onBack={() => setCurrentView('dashboard')}
            onFinishSession={handleCompleteSession}
          />
        )}

        {currentView === 'evaluation' && selectedUnit && activeReport && (
          <EvaluationReport 
            report={activeReport}
            unit={selectedUnit}
            xpEarned={xpEarnedInCurrentSession}
            badgesUnlocked={unlockedBadgesInSession}
            onRetry={handleRetrySession}
            onBackToDashboard={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'coach' && (
          <ExpressionCoach 
            onBack={() => setCurrentView('dashboard')}
            experiencePoints={progress.experiencePoints}
            onRewardXp={(amount) => {
              const newProgress = {
                ...progress,
                experiencePoints: progress.experiencePoints + amount
              };
              saveProgressToLocal(newProgress, badges);
            }}
          />
        )}

        {currentView === 'essay' && (
          <EssayBuilder 
            onBack={() => setCurrentView('dashboard')}
            onRewardXp={(amount) => {
              const newProgress = {
                ...progress,
                experiencePoints: progress.experiencePoints + amount
              };
              saveProgressToLocal(newProgress, badges);
            }}
          />
        )}

        {currentView === 'writing' && (
          <TextbookWritingCoach 
            onBack={() => setCurrentView('dashboard')}
            experiencePoints={progress.experiencePoints}
            onRewardXp={(amount) => {
              const newProgress = {
                ...progress,
                experiencePoints: progress.experiencePoints + amount
              };
              saveProgressToLocal(newProgress, badges);
            }}
          />
        )}
      </main>

      {/* Humble Footer */}
      <footer className="py-4 text-center text-[10px] text-slate-400 border-t border-slate-100 bg-white">
        <p>© 2026 David英语成长营 (David English Growth Camp). 沪教版九年级英语AI学习伙伴.</p>
      </footer>

    </div>
  );
}
