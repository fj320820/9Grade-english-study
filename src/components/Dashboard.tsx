import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  BookOpen, Star, Flame, Award, ChevronRight, Play, Sparkles, 
  Settings, HelpCircle, Trophy, BookMarked, Smile, Crown, PenTool
} from 'lucide-react';
import { Unit, Badge, UserProgress } from '../types';
import { UNITS } from '../data/units';
import { INITIAL_BADGES } from '../data/badges';
import davidAvatar from '../assets/images/david_avatar_1780806776632.png';

interface DashboardProps {
  progress: UserProgress;
  badges: Badge[];
  onSelectUnit: (unit: Unit, difficulty: 'Beginner' | 'Intermediate' | 'Advanced') => void;
  onClearProgress: () => void;
  onOpenExpressionCoach: () => void;
  onOpenEssayBuilder: () => void;
  onOpenWritingCoach: () => void;
}

export default function Dashboard({
  progress,
  badges,
  onSelectUnit,
  onClearProgress,
  onOpenExpressionCoach,
  onOpenEssayBuilder,
  onOpenWritingCoach
}: DashboardProps) {
  const [selectedBook, setSelectedBook] = useState<1 | 2>(1); // 1 = 上册 (Book 1), 2 = 下册 (Book 2)
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeUnitDifficulty, setActiveUnitDifficulty] = useState<Record<string, 'Beginner' | 'Intermediate' | 'Advanced'>>({});

  // Help map colors & emojis to unit types beautifully (Sleek Interface Style)
  const getUnitTheme = (num: number) => {
    const schemes: Record<number, { bg: string; text: string; hoverBg: string; hoverText: string; emoji: string }> = {
      1: { bg: 'bg-blue-50', text: 'text-blue-500', hoverBg: 'group-hover:bg-[#4F7CFF]', hoverText: 'group-hover:text-white', emoji: '📜' },
      2: { bg: 'bg-purple-50', text: 'text-[#7A5CFF]', hoverBg: 'group-hover:bg-[#7A5CFF]', hoverText: 'group-hover:text-white', emoji: '🧠' },
      3: { bg: 'bg-amber-50', text: 'text-amber-500', hoverBg: 'group-hover:bg-[#FFB648]', hoverText: 'group-hover:text-white', emoji: '🏠' },
      4: { bg: 'bg-rose-50', text: 'text-rose-500', hoverBg: 'group-hover:bg-rose-500', hoverText: 'group-hover:text-white', emoji: '💡' },
      5: { bg: 'bg-yellow-50', text: 'text-amber-600', hoverBg: 'group-hover:bg-yellow-500', hoverText: 'group-hover:text-white', emoji: '🎬' },
      6: { bg: 'bg-emerald-50', text: 'text-emerald-500', hoverBg: 'group-hover:bg-emerald-500', hoverText: 'group-hover:text-white', emoji: '🍎' },
      7: { bg: 'bg-teal-50', text: 'text-teal-600', hoverBg: 'group-hover:bg-teal-500', hoverText: 'group-hover:text-white', emoji: '⛵' },
      8: { bg: 'bg-pink-50', text: 'text-pink-500', hoverBg: 'group-hover:bg-pink-500', hoverText: 'group-hover:text-white', emoji: '🎁' },
    };
    return schemes[num] || schemes[1];
  };

  // Get units list for the selected textbook book
  const filteredUnits = UNITS.filter(u => u.book === selectedBook);

  // Calculate completion percentage
  const totalUnitsInBook = UNITS.filter(u => u.book === selectedBook).length;
  const completedInBook = UNITS.filter(u => u.book === selectedBook && progress.completedUnits[u.id]).length;
  const completionPercent = totalUnitsInBook > 0 ? Math.round((completedInBook / totalUnitsInBook) * 100) : 0;

  // Handle unit difficulty choices
  const getUnitDifficulty = (unitId: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
    return activeUnitDifficulty[unitId] || 'Intermediate';
  };

  const setUnitDifficulty = (unitId: string, level: 'Beginner' | 'Intermediate' | 'Advanced') => {
    setActiveUnitDifficulty(prev => ({ ...prev, [unitId]: level }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8" id="dashboard-container-view">
      
      {/* Top Hero Banner Element */}
      <div className="bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] rounded-[32px] text-white p-6 sm:p-10 relative overflow-hidden shadow-xl shadow-blue-100 animate-fadeIn">
        {/* Background ambient accents */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:justify-between gap-6 relative z-10">
          
          <div className="text-center md:text-left space-y-3 max-w-xl">
            <span className="bg-white/20 text-[#FFF] font-black text-[10px] sm:text-xs uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
              🌟 David英语成长营 · David English Growth Camp
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
              欢迎来到 David英语成长营！
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm leading-relaxed font-bold">
              这里不仅是英语学习工具，更是一位陪伴成长的AI英语导师。
            </p>
            <div className="bg-white/10 p-4 rounded-2xl border border-white/15 text-left text-xs text-blue-50 space-y-2 mt-2">
              <p className="font-extrabold text-[#FFF]">💡 在这里，你可以：</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-base select-none">🗣️</span>
                  <span>练习真实英语表达</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-base select-none">✨</span>
                  <span>学习地道高级句型</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-base select-none">📝</span>
                  <span>完成教材同步写作任务</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="text-base select-none">🎯</span>
                  <span>提升中考英语综合能力</span>
                </div>
              </div>
              <p className="text-[11px] text-[#FFE7C4] font-bold italic pt-1 border-t border-white/5">
                🔥 每天坚持一点点，让英语成为你的优势学科。
              </p>
            </div>
          </div>

          {/* Coach David Greeting banner overlay */}
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-lg shrink-0">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-indigo-200 shadow-inner">
              <img src={davidAvatar} alt="Coach David" className="w-full h-full object-cover" />
            </div>
            <div className="text-left max-w-xs">
              <div className="text-xs text-[#FFB648] font-extrabold uppercase tracking-widest flex items-center gap-1">
                <Smile size={12} />
                Coach David
              </div>
              <p className="text-xs font-bold text-white leading-normal mt-0.5">"Ready to practice? Let's speak oral English together!"</p>
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full inline-block mr-1 mt-1 animate-pulse" />
              <span className="text-[10px] text-blue-100 inline-block">Online & Engaged</span>
            </div>
          </div>

        </div>
      </div>

      {/* Gamified stats panel block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Streak & XP achievements column */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Trophy size={15} className="text-[#FFB648]" />
            学习度量指标 · Metrics
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {/* Daily Streak */}
            <div 
              className="bg-[#FFF8EE] border border-[#FFE7C4] rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-help transition hover:scale-[1.02] duration-200"
              title="坚持学习，持续进步。"
            >
              <span className="text-3xl">🔥</span>
              <div className="text-lg font-black text-[#FFB648] mt-2 whitespace-nowrap">
                连续成长 {progress.dailyStreak} 天
              </div>
              <div className="text-[9px] font-black text-[#FFB648] uppercase tracking-wider mt-1">
                学习坚持度
              </div>
            </div>

            {/* Total XP Score */}
            <div 
              className="bg-[#F0F4FF] border border-blue-100 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-help transition hover:scale-[1.02] duration-200"
              title="通过完成口语练习、表达训练和写作任务获得成长值。"
            >
              <span className="text-3xl">🏆</span>
              <div className="text-lg font-black text-[#4F7CFF] mt-2 whitespace-nowrap">
                {progress.experiencePoints} XP
              </div>
              <div className="text-[9px] font-black text-blue-600 uppercase tracking-wider mt-1">
                成长值 XP
              </div>
            </div>
          </div>
        </div>

        {/* Badge unlock showcase */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100 space-y-4 md:col-span-2">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Award size={15} className="text-indigo-500" />
            Speaking Achievements ({badges.filter(b => b.unlocked).length} / {badges.length})
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto max-h-40 pr-1">
            {badges.map((badge) => (
              <div 
                key={badge.id}
                className={`p-3 rounded-2xl border transition-all duration-300 flex items-center gap-2.5 ${
                  badge.unlocked 
                    ? 'bg-amber-50/50 border-amber-200 shadow-xs' 
                    : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
                title={badge.description}
              >
                <span className={`text-2xl ${badge.unlocked ? 'grayscale-0' : 'grayscale'}`}>
                  {badge.unlocked ? badge.icon : '🔒'}
                </span>
                <div className="text-left min-w-0">
                  <div className={`text-xs font-bold leading-normal truncate ${badge.unlocked ? 'text-amber-900' : 'text-slate-400'}`}>
                    {badge.title}
                  </div>
                  <div className="text-[9px] text-slate-400 leading-normal truncate max-w-full">
                    {badge.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Chinese to English Expression Banner */}
      <div className="bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/20 border border-blue-100/60 rounded-[28px] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left shadow-xs transition-all hover:shadow-md">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <span className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wider bg-blue-50/80 px-2.5 py-0.5 rounded-full">New Feature: 表达升级 (Expression Coach)</span>
          </div>
          <h2 className="text-base font-extrabold text-[#1e293b]">Translate thoughts, not words! Perfect for Grade 9 Speaking Exams</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl font-medium">
            Type any Chinese phrase or sentence. David will instantly design three speaking equivalents (Basic, Natural, and high-score exam formulations) alongside core definitions and fun follow-up tests!
          </p>
        </div>
        <button
          onClick={onOpenExpressionCoach}
          className="shrink-0 w-full md:w-auto py-3 px-5 bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] hover:opacity-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-blue-100/80 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 cursor-pointer"
        >
          <span>Practice Now (开启表达训练)</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* ✍ Essay Builder (中考作文扩写助手) Banner */}
      <div className="bg-gradient-to-r from-purple-50/45 via-white to-pink-50/25 border border-purple-100/60 rounded-[28px] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left shadow-xs transition-all hover:shadow-md">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">📝</span>
            <span className="text-[10px] font-black text-[#7A5CFF] uppercase tracking-wider bg-purple-50/80 px-2.5 py-0.5 rounded-full">New Feature: 写作倍增器 (Essay Builder)</span>
          </div>
          <h2 className="text-base font-extrabold text-[#1e293b]">Turn one simple sentence into high-scoring exam paragraphs!</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl font-medium">
            Struggling with writing? Enter one Chinese sentence and David's writing template generator will expand it step-by-step through a Simple Sentence, Three-Sentence progressive logical expansion, and standard Perfect-Score Zhongkao Exam Paragraphs!
          </p>
        </div>
        <button
          onClick={onOpenEssayBuilder}
          className="shrink-0 w-full md:w-auto py-3 px-5 bg-gradient-to-r from-[#7A5CFF] to-[#5D6BFE] hover:opacity-[#95%] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-purple-100/80 hover:shadow-lg hover:shadow-purple-200 transition-all duration-300 cursor-pointer"
        >
          <span>Try Essay Builder (开启中考倍增扩写)</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* 📚 Textbook Writing Coach (课本同步写作教练) Banner */}
      <div className="bg-gradient-to-r from-blue-50/45 via-white to-emerald-50/25 border border-blue-100/50 rounded-[28px] p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-left shadow-xs transition-all hover:shadow-md">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wider bg-blue-50/90 px-2.5 py-0.5 rounded-full">New Release: 教材同步写作 (Textbook Writing Coach)</span>
          </div>
          <h2 className="text-base font-extrabold text-[#1e293b]">Master all 13 Shanghai Textbook Writing Tasks flawlessly!</h2>
          <p className="text-xs text-slate-500 leading-relaxed max-w-3xl font-medium">
            Struggling with syllabus essays? Pick any of your 13 units writing topics, explore its format structure, recommended patterns, and high-score phrases. Input primitive thoughts in Chinese to generate a full Outline, a Standard textbook draft, a High-Score upgrade, and interactive annotated exemplars with full vocal reciters!
          </p>
        </div>
        <button
          onClick={onOpenWritingCoach}
          className="shrink-0 w-full md:w-auto py-3 px-5 bg-gradient-to-r from-[#4F7CFF] to-[#10B981] hover:opacity-95 text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-blue-100/80 hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 cursor-pointer"
        >
          <span>Open Writing Coach (开启同步写作)</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Book Segmented controller and progress card container */}
      <div className="space-y-6" id="textbook-units-deck">
        
        {/* Textbook controls tab buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedBook(1)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedBook === 1 
                  ? 'bg-white text-[#4F7CFF] shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="select-book-1-tab"
            >
              <BookMarked size={15} />
              Term 1 (上册)
            </button>
            <button
              onClick={() => setSelectedBook(2)}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
                selectedBook === 2 
                  ? 'bg-white text-[#4F7CFF] shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              id="select-book-2-tab"
            >
              <BookOpen size={15} />
              Term 2 (下册)
            </button>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">
                Progress:
              </span>
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-mono">
                {completedInBook} / {totalUnitsInBook} Units ({completionPercent}%)
              </span>
            </div>

            {/* Clear progress setting */}
            <div className="relative">
              {showClearConfirm ? (
                <div className="absolute right-0 bottom-full mb-2 bg-white border border-slate-100 rounded-xl p-3 shadow-lg z-30 flex flex-col gap-2 min-w-56">
                  <span className="text-[10px] font-bold text-red-600 leading-normal">This will wipe scores, badges, and streaks! Are you absolutely sure?</span>
                  <div className="flex gap-2 mt-1">
                    <button 
                      onClick={() => { onClearProgress(); setShowClearConfirm(false); }}
                      className="flex-1 py-1.5 bg-red-500 text-white rounded-lg text-[10px] font-bold cursor-pointer"
                    >
                      Delete All
                    </button>
                    <button 
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
              <button
                onClick={() => setShowClearConfirm(!showClearConfirm)}
                className="text-[10px] text-slate-400 font-bold hover:text-red-500 underline uppercase cursor-pointer"
              >
                Reset Progress
              </button>
            </div>
          </div>
        </div>

        {/* Units card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnits.map((unit) => {
            const hasCompletedInfo = progress.completedUnits[unit.id];
            const currentSelectedDiff = getUnitDifficulty(unit.id);
            const theme = getUnitTheme(unit.number);
            
            return (
              <motion.div 
                key={unit.id}
                whileHover={{ y: -4, shadow: '0 12px 30px -10px rgba(79, 124, 255, 0.08)' }}
                className="bg-white rounded-[28px] p-5 border border-slate-100 flex flex-col justify-between shadow-xs relative overflow-hidden group transition-all duration-300"
              >
                {/* Visual completion accent */}
                {hasCompletedInfo && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-amber-400 to-transparent text-white flex items-start justify-end p-2 pointer-events-none">
                    <Crown size={16} className="text-white fill-amber-100 transform rotate-12" />
                  </div>
                )}

                <div className="space-y-4">
                  {/* Icon and Unit Number header */}
                  <div className="flex justify-between items-start">
                    <div className={`w-12 h-12 ${theme.bg} ${theme.text} ${theme.hoverBg} ${theme.hoverText} rounded-2xl flex items-center justify-center text-xl transition-all duration-300 shadow-sm`}>
                      {theme.emoji}
                    </div>
                    {hasCompletedInfo ? (
                      <div className="flex items-center gap-1 bg-[#FFF8EE] text-[#FFB648] px-2.5 py-1 rounded-full text-[10px] font-bold border border-[#FFE7C4]">
                        <Star size={11} className="fill-[#FFB648] text-[#FFB648]" />
                        <span>Score: {hasCompletedInfo.score}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        Not Practiced
                      </span>
                    )}
                  </div>

                  {/* Title & Topic details */}
                  <div className="text-left">
                    <p className={`text-[10px] font-black ${theme.text} uppercase tracking-tighter mb-0.5`}>Unit {unit.number}</p>
                    <h3 className="font-bold text-slate-800 text-base group-hover:text-[#4F7CFF] transition-colors truncate">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 truncate">
                      Topic: <span className="text-slate-500 font-medium">{unit.topic}</span>
                    </p>
                    {unit.speakingSkill && (
                      <p className="text-[10px] text-indigo-505 font-medium mt-1 leading-normal">
                        🎯 Skill: {unit.speakingSkill}
                      </p>
                    )}
                  </div>

                  <hr className="border-slate-50" />

                  {/* Syllabus Question Previews */}
                  <div className="text-left">
                    <span className="text-[9px] font-bold text-slate-405 uppercase tracking-widest block mb-1.5">
                      Key Syllabus Questions:
                    </span>
                    <ul className="space-y-1.5">
                      {unit.questionBank.slice(0, 2).map((q, qidx) => (
                        <li key={qidx} className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full ${theme.bg} block shrink-0`} />
                          <span className="truncate">{q}</span>
                        </li>
                      ))}
                      {unit.questionBank.length > 2 && (
                        <li className="text-[10px] text-slate-400 italic pl-3.5">
                          + {unit.questionBank.length - 2} more speaking topics...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Bottom interactive action triggers */}
                <div className="mt-5 pt-4 border-t border-slate-50 flex flex-col gap-3">
                  
                  {/* Select Speaking Level choice tabs */}
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] text-slate-400 font-bold uppercase whitespace-nowrap">Choose Speaking Level:</span>
                    <div id={`level-selector-${unit.id}`} className="flex bg-slate-50 p-1 rounded-lg border border-slate-100">
                      {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                        <button
                          key={lvl}
                          onClick={() => setUnitDifficulty(unit.id, lvl)}
                          className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition cursor-pointer ${
                            currentSelectedDiff === lvl
                              ? 'bg-white text-[#4F7CFF] shadow-xs'
                              : 'text-slate-440 hover:text-slate-600'
                          }`}
                        >
                          {lvl === 'Beginner' ? '初级' : lvl === 'Intermediate' ? '中级' : '高级'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Start speaking trigger - Sleek design: bg-[#4F7CFF] */}
                  <button
                    id={`start-unit-practice-${unit.id}`}
                    onClick={() => onSelectUnit(unit, currentSelectedDiff)}
                    className="w-full py-3 bg-[#4F7CFF] text-white rounded-2xl flex items-center justify-center gap-2 text-xs font-bold transition-all duration-300 relative group shadow-md shadow-blue-100 hover:bg-[#436be6] hover:shadow-lg hover:shadow-blue-200 cursor-pointer"
                  >
                    <Play size={12} className="fill-white text-white" />
                    Start Speaking Now
                    <ChevronRight size={13} className="absolute right-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" />
                  </button>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
