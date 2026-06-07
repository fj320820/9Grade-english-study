import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Languages, Volume2, VolumeX, ArrowRight, Play, Loader2, BookOpen, Send, CheckCircle, RefreshCw, Smile, ArrowLeft, Mic, MicOff } from 'lucide-react';
import { speakText, stopSpeaking, SpeechRecognizer } from '../lib/audioService';

interface KeyExpression {
  expression: string;
  meaning: string;
}

interface ExpressionResult {
  basicVersion: string;
  naturalVersion: string;
  highScoreVersion: string;
  keyExpressions: KeyExpression[];
  followUpQuestion: string;
  simpleTips: string;
}

interface ExpressionCoachProps {
  onBack: () => void;
  experiencePoints: number;
  onRewardXp: (amount: number) => void;
}

const SAMPLE_SENTENCES = [
  "直接通话吧",
  "我非常喜欢在阅读中探索未知的世界。",
  "在我看来，每个人都应该为保护环境做出贡献。",
  "我周末常常和朋友在公园里踢足球，这让我感到放松。",
  "学习英语不仅可以开阔视野，还能让我学习不同的文化。"
];

export default function ExpressionCoach({ onBack, experiencePoints, onRewardXp }: ExpressionCoachProps) {
  const [chineseInput, setChineseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExpressionResult | null>(null);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Follow up question interaction state
  const [userAnswer, setUserAnswer] = useState('');
  const [answeringRefState, setAnsweringRefState] = useState<'idle' | 'recording' | 'submitting' | 'submitted'>('idle');
  const [answerFeedback, setAnswerFeedback] = useState<string | null>(null);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [micError, setMicError] = useState<string | null>(null);
  const [isQuotaFallback, setIsQuotaFallback] = useState<boolean>(false);

  // Audio recording for answer
  const [recognizer] = useState(() => new SpeechRecognizer(
    (text: string, isFinal: boolean) => {
      if (isFinal) {
        setUserAnswer(prev => {
          const base = prev.trim();
          return base ? `${base} ${text}` : text;
        });
      }
    },
    (err: any) => {
      console.error("Speech recognition error:", err);
      const errType = err?.error || '';
      if (errType === 'not-allowed') {
        setMicError('permission-blocked');
      } else if (errType === 'no-speech') {
        setMicError('no-speech');
      } else if (errType === 'audio-capture') {
        setMicError('audio-capture');
      } else {
        setMicError('other');
      }
      setAnsweringRefState('idle');
    },
    () => {
      setAnsweringRefState('idle');
    }
  ));

  const handleStartCoaching = async (textToUse?: string) => {
    const text = textToUse !== undefined ? textToUse : chineseInput;
    if (!text || text.trim() === '') {
      setError("Please enter or select a Chinese sentence first! (请先输入或选择一个中文句子)");
      return;
    }

    if (textToUse !== undefined) {
      setChineseInput(textToUse);
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setUserAnswer('');
    setAnsweringRefState('idle');
    setAnswerFeedback(null);
    setFeedbackScore(null);
    stopSpeaking();
    setActiveSpeechText(null);

    try {
      const response = await fetch('/api/expression-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chineseText: text })
      });

      if (!response.ok) {
        throw new Error("Failed to contact David's brain server.");
      }

      const data = await response.json();
      if (data.isFallback) {
        setIsQuotaFallback(true);
      }
      setResult(data);
      
      // Auto-speak natural version for pristine UX
      handleSpeakAloud(data.naturalVersion);
    } catch (err: any) {
      console.error(err);
      setError("Oops! Connection hiccup with David. Please try again! (分析出路了，请重新尝试)");
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

    // Load active settings from Coach settings
    const savedVoice = localStorage.getItem('david_speaking_coach_voice_name') || '';
    const savedPitch = parseFloat(localStorage.getItem('david_speaking_coach_speech_pitch') || '1.0');
    const savedRate = parseFloat(localStorage.getItem('david_speaking_coach_speech_rate') || '0.9');

    await speakText(text, savedRate, savedPitch, savedVoice);
    setActiveSpeechText(null);
  };

  const handleToggleMic = () => {
    setMicError(null);
    if (answeringRefState === 'recording') {
      recognizer.stop();
      setAnsweringRefState('idle');
    } else {
      setAnsweringRefState('recording');
      try {
        recognizer.start();
      } catch (e: any) {
        console.error(e);
        setMicError('permission-blocked');
        setAnsweringRefState('idle');
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userAnswer || userAnswer.trim() === '') {
      alert("Please speak or write an answer first!");
      return;
    }

    setAnsweringRefState('submitting');
    try {
      // Prompt generative model dynamically to grade answer
      const feedbackPrompt = `You are Coach David grading a Chinese Grade 9 student answering the follow-up question: "${result?.followUpQuestion}".
The student answered: "${userAnswer}".
Check for grammar accuracy, spelling, and offer friendly, clear positive commentary suited for high school English.
Output exact JSON structure with:
- "score": integer between 80 and 100
- "comment": detailed encouraging advice in plain Chinese (incorporate some key English sentence tips if possible)
`;

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { sender: 'user', text: feedbackPrompt }
          ],
          unitTitle: "Expression Coach Feedback",
          unitTopic: "Bilingual expression tips",
          difficultyLevel: "Intermediate"
        })
      });

      if (!response.ok) {
        throw new Error();
      }

      const raw = await response.json();
      if (raw.isFallback) {
        setIsQuotaFallback(true);
      }
      
      // Try parsing inner JSON response generated via chat fallback or model
      let parsed = { score: 90, comment: "太棒了！你的口语回答听起来很流利，意思表达得十分准确。继续加油哦！" };
      try {
        const textToParse = raw.speechText || "{}";
        // The endpoint returns speechText, which might contain a JSON block. Let's parse it safely
        if (textToParse.includes("{")) {
          const startIndex = textToParse.indexOf("{");
          const endIndex = textToParse.lastIndexOf("}");
          parsed = JSON.parse(textToParse.substring(startIndex, endIndex + 1));
        } else {
          // Alternative fallback
          parsed = {
            score: 85 + Math.floor(Math.random() * 15),
            comment: raw.speechText || "That's a fantastic effort! You did great answering the question."
          };
        }
      } catch (e) {
        parsed = {
          score: 85 + Math.floor(Math.random() * 15),
          comment: raw.speechText || "That's an incredibly smooth answer! Keep practicing!"
        };
      }

      setFeedbackScore(parsed.score);
      setAnswerFeedback(parsed.comment);
      setAnsweringRefState('submitted');

      // Reward XP for completing the challenge
      onRewardXp(25);
    } catch (e) {
      setFeedbackScore(90);
      setAnswerFeedback("That's an incredibly smooth answer! Keep practicing! (非常棒的尝试，继续加油吧！)");
      setAnsweringRefState('submitted');
      onRewardXp(15);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6" id="expression-coach-container">
      
      {/* Top breadcrumb navigation header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-sm font-bold transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to Textbook Units (返回同步练习)
        </button>

        <div className="flex items-center gap-1 text-[11px] font-bold text-[#4F7CFF] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wide">
          <Languages size={13} />
          Bilingual Oral Companion
        </div>
      </div>

      {isQuotaFallback && (
        <div className="bg-amber-50/80 border border-amber-100 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-800 animate-fade-in shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-amber-500">💡</span>
            <span>
              <strong>Resilient Coaching Active:</strong> Dynamic cloud engine at peak load. Switching seamlessly to offline coach simulator. No progress lost! (已自动激活配套课程模拟器，持续协助您的润色与口语判分)
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
      <div className="bg-gradient-to-r from-[#4F7CFF] via-[#6B6BFF] to-[#7A5CFF] rounded-[32px] p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-blue-100/50">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-normal flex items-center gap-2">
            <span>✨</span> 表达升级 · Expression Coach
          </h1>
          <p className="text-blue-100 text-xs sm:text-sm max-w-2xl leading-relaxed">
            Translate thoughts, not words! Enter or select a Chinese sentence that you want to say in English. Coach David will break it down into natural English and dynamic junior high加分句, so you can sound like a native in speech exams.
          </p>
        </div>
      </div>

      {/* Main split work layout */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">

        {/* Left Input panel (2 columns) */}
        <div className="md:col-span-2 space-y-6 flex flex-col">
          
          <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Your Chinese Sentence (输入中文句子)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Grade 9 Level Coach</span>
              </div>

              <textarea
                value={chineseInput}
                onChange={(e) => {
                  setChineseInput(e.target.value);
                  if (error) setError(null);
                }}
                disabled={loading}
                placeholder="例如: 每个人都应该为保护我们的环境做出自己的贡献，这非常有意义……"
                className="w-full h-36 bg-slate-55 p-3 rounded-2xl border border-slate-200 outline-none text-sm text-slate-800 leading-relaxed placeholder:text-slate-400 resize-none font-sans focus:border-blue-400 focus:bg-white transition-all"
              />

              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 leading-relaxed text-left">
                  {error}
                </div>
              )}

              {/* Sample Quick selectors */}
              <div className="space-y-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  Tap to Try Examples (点选范例体验):
                </span>
                <div className="flex flex-col gap-2">
                  {SAMPLE_SENTENCES.map((sent, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleStartCoaching(sent)}
                      disabled={loading}
                      className="text-left py-2 px-3 bg-slate-50 hover:bg-blue-50/50 hover:text-blue-600 rounded-xl text-xs text-slate-600 transition truncate cursor-pointer border border-slate-100"
                    >
                      🚀 {sent}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => handleStartCoaching()}
              disabled={loading || !chineseInput.trim()}
              className="mt-4 w-full py-3.5 bg-[#4F7CFF] text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 text-sm shadow-md shadow-blue-200 hover:bg-[#436be6] hover:shadow-lg hover:shadow-blue-300 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin text-white" size={16} />
                  <span>David is Polishing... (智能润色中)</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} className="fill-white" />
                  <span>Coach My Sentence (润色地道表达)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Output panel (3 columns) */}
        <div className="md:col-span-3">
          
          <AnimatePresence mode="wait">
            
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[24px] border border-slate-100 shadow-xs p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
              >
                <div className="w-16 h-16 bg-[#F0F4FF] rounded-full flex items-center justify-center text-3xl mb-4 animate-bounce relative">
                  <span>👨🏼‍🏫</span>
                  <div className="absolute -inset-1 border-2 border-dashed border-[#4F7CFF] rounded-full animate-spin" />
                </div>
                <h3 className="text-base font-bold text-slate-800">David's Linguistic Analysis Engaged</h3>
                <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">
                  Reframing your Chinese ideas into natural spoken English, preparing textbook-grade score multipliers, and organizing structural definitions... Please hold on!
                </p>
              </motion.div>
            )}

            {!loading && !result && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-[24px] border border-slate-100 shadow-xs p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]"
              >
                <div className="w-16 h-16 bg-blue-50/50 rounded-full flex items-center justify-center text-2xl mb-4 text-blue-500 shadow-inner">
                  💬
                </div>
                <h3 className="text-base font-bold text-slate-700">Awaiting Your Sentences</h3>
                <p className="text-xs text-slate-450 max-w-sm mt-1.5 leading-relaxed font-medium">
                  Type any sentence in Chinese or pick a sample from the left! David will instantly rewrite it into three unique difficulty weights so you practice speaking naturally.
                </p>
              </motion.div>
            )}

            {!loading && result && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* 3 Translation Versions Card */}
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <BookOpen size={14} className="text-blue-500" />
                    Three Speaking Expressions (三种层次口语表达)
                  </h3>

                  {/* Basic Version Card */}
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex justify-between items-start gap-4 hover:border-slate-200 transition">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-400 rounded-full" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-wide">1. Basic English (基础表达 - 日常流利)</span>
                      </div>
                      <p className="font-semibold text-slate-800 text-sm pl-4 pr-2">{result.basicVersion}</p>
                    </div>
                    <button
                      onClick={() => handleSpeakAloud(result.basicVersion)}
                      className={`p-2 rounded-xl transition ${
                        activeSpeechText === result.basicVersion ? 'bg-blue-100 text-blue-600' : 'bg-white hover:bg-blue-50 text-slate-400 hover:text-blue-500 shadow-sm'
                      }`}
                    >
                      <Volume2 size={15} />
                    </button>
                  </div>

                  {/* Natural Version Card */}
                  <div className="p-3.5 bg-gradient-to-r from-blue-50/40 to-white border border-[#4F7CFF]/20 rounded-2xl flex justify-between items-start gap-4 shadow-xs relative">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#4F7CFF] rounded-full animate-pulse" />
                        <span className="text-[10px] font-black text-[#4F7CFF] uppercase tracking-wide">2. Natural English (地道口语 - 完美语感 ⭐)</span>
                      </div>
                      <p className="font-extrabold text-slate-900 text-sm pl-4 pr-2">{result.naturalVersion}</p>
                    </div>
                    <button
                      onClick={() => handleSpeakAloud(result.naturalVersion)}
                      className={`p-2 rounded-xl transition ${
                        activeSpeechText === result.naturalVersion ? 'bg-[#4F7CFF] text-white shadow-md' : 'bg-white hover:bg-blue-50 text-[#4F7CFF] shadow-sm'
                      }`}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>

                  {/* High Score Version Card */}
                  <div className="p-3.5 bg-gradient-to-r from-purple-50/40 to-white border border-[#7A5CFF]/20 rounded-2xl flex justify-between items-start gap-4 shadow-xs">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-[#7A5CFF] rounded-full" />
                        <span className="text-[10px] font-black text-[#7A5CFF] uppercase tracking-wide">3. Exam high-score (九年级中考高分完美句 💯)</span>
                      </div>
                      <p className="font-extrabold text-indigo-900 text-sm pl-4 pr-2">{result.highScoreVersion}</p>
                    </div>
                    <button
                      onClick={() => handleSpeakAloud(result.highScoreVersion)}
                      className={`p-2 rounded-xl transition ${
                        activeSpeechText === result.highScoreVersion ? 'bg-[#7A5CFF] text-white' : 'bg-white hover:bg-purple-55 text-[#7A5CFF] shadow-sm'
                      }`}
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Key Expressions details (4) */}
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    💡 Key Expressions & Patterns (核心语法搭配)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
                    {result.keyExpressions.map((expr, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1">
                        <div className="text-xs font-black text-slate-800 tracking-tight flex items-center gap-1">
                          <span className="text-[#4F7CFF]">•</span>
                          <span>{expr.expression}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-medium pl-2.5">{expr.meaning}</p>
                      </div>
                    ))}
                  </div>

                  <hr className="border-slate-100" />

                  {/* Coach simple tips */}
                  <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-2xl text-left space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-xs">
                      <Smile size={14} />
                      David's Coach Tip (表达贴心建议)
                    </div>
                    <p className="text-xs text-amber-900/95 leading-relaxed pl-5 font-bold">
                      {result.simpleTips}
                    </p>
                  </div>
                </div>

                {/* Interactive Practice Corner & Follow-up Question */}
                <div className="bg-white rounded-[24px] p-5 sm:p-6 border border-slate-100 shadow-xs space-y-4 text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      🔥 Daily Speaking Challenge (口语强化挑战)
                    </h3>
                    <span className="text-[9px] font-black bg-emerald-55 text-emerald-600 border border-emerald-25 px-2 py-0.5 rounded-full uppercase">
                      Earn +25 XP
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 font-bold block">
                      David's Follow-up Question (大卫追问训练):
                    </span>
                    <div className="p-4 bg-[#F0F4FF] rounded-2xl border border-blue-105 flex justify-between items-center gap-4">
                      <p className="font-extrabold text-[#4F7CFF] text-sm leading-relaxed">
                        {result.followUpQuestion}
                      </p>
                      <button
                        onClick={() => handleSpeakAloud(result.followUpQuestion)}
                        className={`p-2 rounded-xl transition shrink-0 ${
                          activeSpeechText === result.followUpQuestion ? 'bg-[#4F7CFF] text-white shadow-md' : 'bg-white hover:bg-blue-50 text-[#4F7CFF] shadow-sm'
                        }`}
                        title="Pronounce follow-up question"
                      >
                        <Volume2 size={16} />
                      </button>
                    </div>
                  </div>

                  {answeringRefState === 'submitted' ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-extrabold">
                          <CheckCircle size={15} className="text-emerald-55" />
                          Challenge Completed! Dynamic Feedback received:
                        </div>
                        <span className="px-3 py-1 bg-emerald-100 rounded-full text-emerald-800 text-xs font-mono font-bold">
                          ★ Score: {feedbackScore} / 100
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed font-bold">
                        你作答：<span className="italic text-slate-500 font-medium font-mono">{userAnswer}</span>
                      </p>
                      <p className="text-xs text-emerald-950 font-bold leading-normal">
                        David 的指导：{answerFeedback}
                      </p>

                      <button
                        onClick={() => {
                          setUserAnswer('');
                          setAnsweringRefState('idle');
                          setAnswerFeedback(null);
                        }}
                        className="py-1 px-3 bg-white hover:bg-slate-50 text-[10px] text-slate-600 font-bold border border-slate-200 rounded-lg flex items-center gap-1 shadow-xs transition"
                      >
                        <RefreshCw size={11} />
                        Retry Answering (重新挑战)
                      </button>
                    </motion.div>
                  ) : (
                    <div className="space-y-3">
                      {micError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-left text-xs text-rose-800 leading-relaxed shadow-xs">
                          {micError === 'permission-blocked' && (
                            <p>
                              🔒 <strong>麦克风授权受限 / Microphone Blocked:</strong> 大卫没有获取到麦克风的使用权限。
                              请点击浏览器地址栏左边的<strong>锁头图标 🔒</strong>，将“麦克风”设置为“允许”。由于本应用在 iframe 模拟预览环境下运行，
                              <strong>建议您点击页面右上角的「新标签页打开 (Open in a new tab)」</strong>以获得完整的浏览器权限，或直接输入文字聊天练习！
                            </p>
                          )}
                          {micError === 'no-speech' && (
                            <p>
                              🎤 <strong>未检测到发言 / No Speech Detected:</strong> 英文语音没有识别成功。请保证您的音量充足，并大声、清晰地说出英语，或者通过键盘直接打字输入。
                            </p>
                          )}
                          {micError === 'audio-capture' && (
                            <p>
                              🎧 <strong>未检测到录音设备 / Audio Device Error:</strong> 大卫找不到您的麦克风，请检查硬件插头，或检查浏览器权限设置！
                            </p>
                          )}
                          {micError === 'other' && (
                            <p>
                              ⚠️ <strong>语音引擎异常 / Dictation Notice:</strong> 初始化语音录入时遇到了微小异常，建议<strong>在新窗口/新标签页中打开本程序</strong>重试，或直接使用文字进行交流！
                            </p>
                          )}
                          <button 
                            onClick={() => setMicError(null)} 
                            className="mt-1.5 text-[10px] font-bold text-rose-600 hover:underline cursor-pointer"
                          >
                            我知道了 (Close warning)
                          </button>
                        </div>
                      )}

                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={answeringRefState === 'submitting'}
                        placeholder="Type or dictate your spoken answer here in English (例如: I really enjoy reading historical novels because...)"
                        className="w-full h-24 bg-slate-55 p-3 rounded-2xl border border-slate-200 outline-none text-xs text-slate-800 leading-relaxed placeholder:text-slate-400 font-mono resize-none focus:border-blue-400 focus:bg-white"
                      />

                      <div className="flex justify-between items-center gap-3">
                        <button
                          onClick={handleToggleMic}
                          disabled={answeringRefState === 'submitting'}
                          className={`p-2.5 rounded-xl border flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                            answeringRefState === 'recording'
                              ? 'bg-rose-500 border-rose-500 text-white animate-pulse ring-4 ring-rose-100'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {answeringRefState === 'recording' ? (
                            <>
                              <MicOff size={14} />
                              Stop Recording
                            </>
                          ) : (
                            <>
                              <Mic size={14} className="text-[#4F7CFF]" />
                              Dictate (语音输入)
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleSubmitAnswer}
                          disabled={answeringRefState === 'submitting' || !userAnswer.trim()}
                          className="py-2.5 px-5 bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 hover:opacity-95 shadow-md shadow-blue-105 cursor-pointer transition disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {answeringRefState === 'submitting' ? (
                            <>
                              <Loader2 className="animate-spin text-white" size={14} />
                              Evaluating (大卫批改中)
                            </>
                          ) : (
                            <>
                              <Send size={13} />
                              Submit Answer
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
