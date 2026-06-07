import React from 'react';
import { motion } from 'motion/react';
import { Award, BookOpen, RotateCcw, CheckCircle, Lightbulb, Star, Trophy } from 'lucide-react';
import { SpeakingReport, Unit } from '../types';

interface EvaluationReportProps {
  report: SpeakingReport;
  unit: Unit;
  xpEarned: number;
  badgesUnlocked: string[];
  onRetry: () => void;
  onBackToDashboard: () => void;
}

export default function EvaluationReport({
  report,
  unit,
  xpEarned,
  badgesUnlocked,
  onRetry,
  onBackToDashboard
}: EvaluationReportProps) {
  
  // Custom mapping of badge IDs to visual icons
  const getBadgeIcon = (id: string) => {
    switch(id) {
      case 'first_words': return '🗣️';
      case 'unit_explorer': return '🌟';
      case 'perfect_score': return '👑';
      case 'wise_thinker': return '🧠';
      case 'healthy_habits': return '🍎';
      case 'fluency_star': return '⚡';
      default: return '🎖️';
    }
  };

  const getBadgeName = (id: string) => {
    switch(id) {
      case 'first_words': return 'First Speak';
      case 'unit_explorer': return 'Book Cadet';
      case 'perfect_score': return 'Elite Communicator';
      case 'wise_thinker': return 'Wise Thinker';
      case 'healthy_habits': return 'Healthy Habits';
      case 'fluency_star': return 'Fluency Wizard';
      default: return 'Practice Star';
    }
  };

  const scoreMetrics = [
    { name: 'Overall (综合得分)', score: report.overall, color: 'bg-indigo-500 text-indigo-700 bg-indigo-50' },
    { name: 'Pronunciation (发音清晰度)', score: report.pronunciation, color: 'bg-emerald-500 text-emerald-700 bg-emerald-50' },
    { name: 'Fluency (表达流畅性)', score: report.fluency, scoreLabel: 'fluency', color: 'bg-blue-500 text-blue-700 bg-blue-50' },
    { name: 'Vocabulary (词汇丰富度)', score: report.vocabulary, color: 'bg-amber-500 text-amber-700 bg-amber-50' },
    { name: 'Grammar (语法规范性)', score: report.grammar, color: 'bg-purple-500 text-purple-700 bg-purple-50' },
    { name: 'Communication (通顺与交际)', score: report.communication, color: 'bg-pink-500 text-pink-700 bg-pink-50' },
  ];

  // Determine equivalent level letter (Grade system)
  const getGradeAward = (score: number) => {
    if (score >= 93) return { grade: 'A+', text: 'Outstanding! (出类拔萃)', bg: 'from-amber-400 to-yellow-500' };
    if (score >= 85) return { grade: 'A', text: 'Excellent! (优异卓越)', bg: 'from-indigo-400 to-blue-500' };
    if (score >= 78) return { grade: 'B', text: 'Good job! (表现良好)', bg: 'from-green-400 to-emerald-500' };
    return { grade: 'C', text: 'Keep practicing! (加油进步)', bg: 'from-gray-400 to-gray-500' };
  };

  const overallGrade = getGradeAward(report.overall);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6" id="speaking-report-container-root">
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
      >
        {/* Colorful top splash */}
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-600 text-white p-6 sm:p-8 text-center relative">
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
            {unit.book === 1 ? '九年级上册' : '九年级下册'} · Unit {unit.number}
          </div>
          <Award size={44} className="mx-auto mb-2 text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">AI Speaking Report</h1>
          <p className="text-indigo-100 mt-1 text-sm sm:text-base">
            Unit {unit.number}: {unit.title} 口语能力多维评估
          </p>

          <div className="mt-6 flex flex-wrap gap-4 items-center justify-center">
            {/* Massive overall score */}
            <div className="bg-white text-gray-900 rounded-2xl p-4 shadow-lg flex items-center gap-4 border border-white">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${overallGrade.bg} text-white flex items-center justify-center font-extrabold text-2xl shadow-inner`}>
                {overallGrade.grade}
              </div>
              <div className="text-left">
                <div className="text-xl font-bold text-gray-800">{report.overall} <span className="text-xs text-gray-400 font-normal">/100</span></div>
                <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">{overallGrade.text}</div>
              </div>
            </div>

            {/* Exp gained */}
            <div className="bg-white/10 backdrop-blur-md text-white rounded-2xl px-4 py-3 flex items-center gap-2">
              <Star size={20} className="text-yellow-300 fill-yellow-300" />
              <div className="text-left">
                <div className="text-base font-bold">+{xpEarned} XP</div>
                <div className="text-[10px] text-indigo-200">Speaking Score Reward</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Metric Breakdown */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
              <Trophy size={18} className="text-yellow-500" />
              Core Competency Dimensions (五维度量化评估)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {scoreMetrics.map((val) => (
                <div key={val.name} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-1 text-sm font-semibold text-gray-700">
                    <span>{val.name}</span>
                    <span className="font-bold font-mono text-gray-900">{val.score}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <motion.div 
                      className={`h-full rounded-full ${
                        val.score >= 90 ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 
                        val.score >= 80 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                        val.score >= 70 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                        'bg-red-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${val.score}%` }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Unlocked Badges (if any) */}
          {badgesUnlocked.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3">
                <Star size={18} className="text-amber-500 fill-amber-300" />
                Achievements Unlocked! (达成口语勋章)
              </h2>
              <div className="flex flex-wrap gap-3">
                {badgesUnlocked.map((bId) => (
                  <motion.div 
                    key={bId}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl"
                  >
                    <span className="text-xl">{getBadgeIcon(bId)}</span>
                    <div className="text-left">
                      <div className="text-xs font-bold text-amber-800">{getBadgeName(bId)}</div>
                      <div className="text-[9px] text-amber-600">Grade 9 Speaking Star</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths & Suggestions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            {/* Strengths */}
            <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100">
              <h3 className="text-emerald-800 font-bold flex items-center gap-2 mb-3">
                <CheckCircle size={18} className="text-emerald-600" />
                Key Strengths (你的口语优势)
              </h3>
              <ul className="space-y-3">
                {report.strengths.map((str, idx) => (
                  <li key={idx} className="flex gap-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <span className="text-emerald-500 font-bold select-none">✔</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggestions */}
            <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
              <h3 className="text-indigo-800 font-bold flex items-center gap-2 mb-3">
                <Lightbulb size={18} className="text-indigo-600" />
                Suggestions to Improve (进步提升建议)
              </h3>
              <ul className="space-y-3">
                {report.suggestions.map((sug, idx) => (
                  <li key={idx} className="flex gap-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
                    <span className="text-indigo-500 font-bold select-none">💡</span>
                    <span>{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              id="retry-practice-button"
              onClick={onRetry}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-200 text-gray-700 bg-white rounded-2xl hover:bg-gray-50 active:bg-gray-100 font-semibold transition"
            >
              <RotateCcw size={16} />
              Speak Again (重新练习)
            </button>
            <button 
              id="back-to-dashboard-button"
              onClick={onBackToDashboard}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-2xl hover:opacity-95 active:opacity-100 font-semibold shadow-md transition"
            >
              <BookOpen size={16} />
              Book Units Dashboard (回到单元目录)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
