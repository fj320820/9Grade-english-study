import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Languages, Volume2, ArrowLeft, Loader2, BookOpen, 
  ChevronRight, Smile, CheckCircle, RefreshCw, PenTool, Lightbulb, GraduationCap
} from 'lucide-react';
import { speakText, stopSpeaking } from '../lib/audioService';

interface ThreeSentenceItem {
  en: string;
  cn: string;
  focus: string;
}

interface KeyVocabItem {
  word: string;
  meaning: string;
}

interface EssayResult {
  simpleSentence: string;
  threeSentenceVersion: ThreeSentenceItem[];
  examParagraph: string;
  paragraphTranslation: string;
  keyVocab: KeyVocabItem[];
  isFallback?: boolean;
}

interface EssayBuilderProps {
  onBack: () => void;
  onRewardXp: (amount: number) => void;
}

const SYSTEM_SAMPLE_SENTENCES = [
  "我喜欢读书。",
  "保护环境人人有责。",
  "我们应该多吃蔬菜和水果。",
  "运动能让我们保持健康。",
  "我喜欢在周末和朋友去公园放风筝。"
];

export default function EssayBuilder({ onBack, onRewardXp }: EssayBuilderProps) {
  const [chineseInput, setChineseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayResult | null>(null);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaFallback, setIsQuotaFallback] = useState(false);
  const [studyEarned, setStudyEarned] = useState(false);

  const handleStartExpansion = async (textToUse?: string) => {
    const text = textToUse !== undefined ? textToUse : chineseInput;
    if (!text || text.trim() === '') {
      setError("Please enter or select a Chinese sentence first! (请先输入或选择一个需要扩写的中文句子)");
      return;
    }

    if (textToUse !== undefined) {
      setChineseInput(textToUse);
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setIsQuotaFallback(false);
    setStudyEarned(false);
    stopSpeaking();
    setActiveSpeechText(null);

    try {
      const response = await fetch('/api/essay-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chineseText: text })
      });

      if (!response.ok) {
        throw new Error("Failed to contact the essay builder brain server.");
      }

      const data = await response.json();
      if (data.isFallback) {
        setIsQuotaFallback(true);
      }
      setResult(data);
    } catch (err: any) {
      console.error(err);
      setError("Oops! Connection issue with the writing assistant. Please try again! (写作分析线路过载，请重新尝试)");
    } finally {
      setLoading(false);
    }
  };

  const handleSpeakAloud = async (text: string) => {
    if (activeSpeechText === text) {
      stopSpeaking();
      setActiveSpeechText(null);
      return;
    }
    
    stopSpeaking();
    setActiveSpeechText(text);

    const savedVoice = localStorage.getItem('david_speaking_coach_voice_name') || '';
    const savedPitch = parseFloat(localStorage.getItem('david_speaking_coach_speech_pitch') || '1.0');
    const savedRate = parseFloat(localStorage.getItem('david_speaking_coach_speech_rate') || '0.9');

    await speakText(text, savedRate, savedPitch, savedVoice);
    setActiveSpeechText(null);
  };

  const handleClaimXp = () => {
    if (!studyEarned) {
      onRewardXp(25);
      setStudyEarned(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in" id="essay-builder-container">
      
      {/* Navigation Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Textbook Units (返回同步练习)
        </button>

        <div className="flex items-center gap-1 text-[11px] font-bold text-[#7A5CFF] bg-purple-50 px-3 py-1 rounded-full uppercase tracking-wide">
          <PenTool size={13} />
          Composition Expansion Companion
        </div>
      </div>

      {isQuotaFallback && (
        <div className="bg-amber-50/80 border border-amber-100 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">💡</span>
            <span>
              <strong>Resilient Builder Active:</strong> Switching seamlessly to local expert database. No writing templates lost! (已激活备用写作数据库，继续为您提供完美句型与扩写示范)
            </span>
          </div>
          <button 
            onClick={() => setIsQuotaFallback(false)} 
            className="hover:bg-amber-100 rounded px-1.5 py-0.5 transition cursor-pointer text-[10px] font-bold text-amber-600 shrink-0 select-none whitespace-nowrap"
          >
            Dismiss (忽略)
          </button>
        </div>
      )}

      {/* Main Title Hero Banner */}
      <div className="bg-gradient-to-r from-[#7A5CFF] via-[#5D6BFE] to-[#4F7CFF] rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="bg-white/20 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
            📝 写作倍增器 · Essay Builder
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight pt-1">
            Build High-Score Essays from Single Thoughts!
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Turn simple thoughts into premium paragraphs suitable for Shanghai Zhongkao exams. Just enter an initial Chinese sentence, and David's writing template generator will expand it step-by-step through 1. Simple Sentence, 2. Three-Sentence logical expansion, and 3. Perfect-Score Exam Paragraphs!
          </p>
        </div>
      </div>

      {/* Grid workspace */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Left Input area */}
        <div className="md:col-span-2 space-y-6 flex flex-col">
          
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                  Write Your Chinese Statement (写一句中文):
                </label>
                <span className="text-[10px] text-[#7A5CFF] font-black bg-purple-50 px-2 py-0.5 rounded-full">Zhongkao Multiplier</span>
              </div>

              <textarea
                value={chineseInput}
                onChange={(e) => {
                  setChineseInput(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                placeholder="例如：我喜欢读书。/ 保护野生动物人人有责……"
                className="w-full h-36 bg-slate-55 p-3 rounded-2xl border border-slate-200 outline-none text-sm text-slate-800 leading-relaxed placeholder:text-slate-400 resize-none font-sans focus:border-indigo-400 focus:bg-white transition-all"
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 leading-relaxed text-left">
                  {error}
                </div>
              )}

              {/* Quick try list */}
              <div className="space-y-2.5 pt-2">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">
                  Select a common topic to preview (快速点选历年考题话题):
                </span>
                <div className="flex flex-col gap-2">
                  {SYSTEM_SAMPLE_SENTENCES.map((sent, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStartExpansion(sent)}
                      disabled={loading}
                      className="text-left py-2 px-3 bg-slate-50 hover:bg-indigo-50/50 hover:text-indigo-600 rounded-xl text-xs text-slate-600 transition truncate cursor-pointer border border-slate-100 font-medium"
                    >
                      💡 {sent}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStartExpansion()}
              disabled={loading || !chineseInput.trim()}
              className="mt-4 w-full py-4 bg-gradient-to-r from-[#7A5CFF] to-[#4F7CFF] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-indigo-100 hover:opacity-95 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-white" size={16} />
                  <span>David is expanding details... (中考满分句型生成中)</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="fill-white" />
                  <span>Expand to Exam Essay (开启中考倍增扩写)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Output panels */}
        <div className="md:col-span-3">
          
          <AnimatePresence mode="wait">
            
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[24px] border border-slate-100 shadow-xs p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce relative">
                  <span>✍️</span>
                  <div className="absolute -inset-1 border-2 border-dashed border-[#7A5CFF] rounded-full animate-spin" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Dynamic Composition Analysis</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                  David is applying Shanghai Junior High Senior Writing rules... Generating introductory theme sentences, structuring the three-part logical bridge, and embedding premium connectors... Please hold on!
                </p>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[24px] border border-slate-100 shadow-xs p-10 flex flex-col items-center justify-center text-center h-full min-h-[400px]"
              >
                <div className="w-16 h-16 bg-indigo-50/50 rounded-full flex items-center justify-center text-2xl mb-4 text-indigo-505 shadow-inner">
                  ✏️
                </div>
                <h3 className="text-base font-bold text-slate-700">Ready for Writing Multiplication</h3>
                <p className="text-xs text-slate-450 max-w-sm mt-1.5 leading-relaxed font-semibold">
                  Input any simple Chinese sentence on the left! David will instantly translate it, expand it logically across three sentence types, and combine it into an flawless full-marks exam paragraph.
                </p>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6 text-left animate-fade-in"
              >
                
                {/* 1. Simple Sentence Part */}
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-blue-500" />
                      Level 1: Simple Sentence (基础直译句型)
                    </h3>
                    <span className="text-[9px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Pass Standard</span>
                  </div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center gap-4">
                    <p className="font-semibold text-slate-700 text-sm font-mono leading-relaxed pl-1">
                      {result.simpleSentence}
                    </p>
                    <button
                      onClick={() => handleSpeakAloud(result.simpleSentence)}
                      className={`p-2 rounded-xl transition ${
                        activeSpeechText === result.simpleSentence ? 'bg-blue-100 text-blue-600' : 'bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-500 shadow-sm'
                      }`}
                      title="Speak simple sentence"
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>
                </div>

                {/* 2. Three-Sentence logical Expansion */}
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Lightbulb size={14} className="text-[#FFB648]" />
                      Level 2: Three-Sentence Expansion (黄金三步递进法模板)
                    </h3>
                    <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">High-Score Strategy</span>
                  </div>

                  <div className="space-y-3.5">
                    {result.threeSentenceVersion.map((step, index) => (
                      <div key={index} className="p-3.5 bg-gradient-to-r from-indigo-50/20 to-white hover:from-indigo-50/40 border border-indigo-100/40 rounded-2xl flex justify-between items-start gap-4 transition duration-200">
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 bg-indigo-500 text-white rounded-full flex items-center justify-center font-mono font-bold text-[10px]">
                              {index + 1}
                            </span>
                            <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">
                              {step.focus}
                            </span>
                          </div>
                          <p className="font-extrabold text-slate-800 text-sm pl-6 leading-relaxed font-mono">
                            {step.en}
                          </p>
                          <p className="text-xs text-slate-500 pl-6 font-medium">
                            解释: {step.cn}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSpeakAloud(step.en)}
                          className={`p-2 rounded-xl transition mt-1 shrink-0 ${
                            activeSpeechText === step.en ? 'bg-indigo-100 text-indigo-600' : 'bg-white hover:bg-indigo-50 text-slate-400 hover:text-indigo-500 shadow-sm border border-slate-100'
                          }`}
                          title={`Speak sentence ${index + 1}`}
                        >
                          <Volume2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. Perfect Exam Paragraph */}
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={14} className="text-[#7A5CFF] fill-purple-100" />
                      Level 3: Full-Marks Zhongkao Paragraph (中考满分作文示范段)
                    </h3>
                    <span className="text-[9px] font-black text-purple-650 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      Perfect Full Marks 💯
                    </span>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-indigo-50/20 to-purple-50/30 rounded-2xl border border-indigo-100/40 relative">
                    <div className="absolute top-3 right-3 shrink-0">
                      <button
                        onClick={() => handleSpeakAloud(result.examParagraph)}
                        className={`p-2.5 rounded-xl transition ${
                          activeSpeechText === result.examParagraph ? 'bg-[#7A5CFF] text-white shadow-md' : 'bg-white hover:bg-purple-50 text-[#7A5CFF] shadow-sm border border-slate-150'
                        }`}
                        title="Speak full exam paragraph"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-4 pr-12">
                      <p className="font-extrabold text-[#111827] text-sm sm:text-base leading-relaxed tracking-normal font-sans text-justify">
                        {result.examParagraph}
                      </p>
                      
                      <hr className="border-indigo-100/50" />

                      <div className="space-y-1">
                        <span className="text-[10px] text-indigo-600 font-extrabold uppercase tracking-wide block">中文对照翻译:</span>
                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {result.paragraphTranslation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Vocabulary Highlight bar */}
                  <div className="space-y-2.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider block">✍️ Key Advanced Writing Vocabularies (写作亮点词汇):</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.keyVocab.map((vocab, vIdx) => (
                        <div key={vIdx} className="p-3 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center gap-2">
                          <div className="text-left font-sans">
                            <span className="text-xs font-bold text-slate-800 font-mono block">
                              {vocab.word}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {vocab.meaning}
                            </span>
                          </div>
                          <button
                            onClick={() => handleSpeakAloud(vocab.word)}
                            className="p-1.5 bg-white text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 border border-slate-100 transition shadow-sm"
                            title={`Speak ${vocab.word}`}
                          >
                            <Volume2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gamified Reward Button */}
                  <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl">🏆</span>
                      <span className="text-xs font-bold text-slate-650">Composed & Studied! Claim your workbook reward:</span>
                    </div>

                    {studyEarned ? (
                      <span className="flex items-center gap-1 text-xs text-emerald-600 font-extrabold bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                        <CheckCircle size={14} />
                        Claimed +25 XP
                      </span>
                    ) : (
                      <button
                        onClick={handleClaimXp}
                        className="py-1.5 px-4 bg-[#FFB648] hover:bg-amber-500 text-slate-900 font-black text-xs rounded-xl shadow-md shadow-amber-100 flex items-center gap-1 transition cursor-pointer"
                      >
                        <Sparkles size={13} className="fill-slate-900" />
                        Claim +25 XP
                      </button>
                    )}
                  </div>

                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
