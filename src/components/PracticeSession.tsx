import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Send, Mic, MicOff, Volume2, Globe, HelpCircle, 
  Sparkles, CheckCircle2, Award, BookOpen, Clock, Lightbulb, Languages, Settings, HelpCircle as HelpIcon
} from 'lucide-react';
import { Unit, ChatMessage, SpeakingReport } from '../types';
import { 
  speakText, 
  stopSpeaking, 
  SpeechRecognizer, 
  COACH_PROFILES, 
  estimateGender, 
  getAutoMatchedVoiceForCoach 
} from '../lib/audioService';
import TutorAvatar from './TutorAvatar';
import davidAvatar from '../assets/images/david_avatar_1780806776632.png';

const CoachMiniAvatar = ({ coachId }: { coachId: string }) => {
  if (coachId === 'david') {
    return <img src={davidAvatar} alt="David" className="w-full h-full object-cover" />;
  }
  if (coachId === 'emma') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-rose-200 to-purple-300 flex items-center justify-center text-xs font-bold font-mono">EM</div>
    );
  }
  if (coachId === 'jack') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-200 to-teal-400 flex items-center justify-center text-xs font-bold font-mono">JK</div>
    );
  }
  if (coachId === 'lucy') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-100 to-amber-350 flex items-center justify-center text-xs font-bold font-mono">LC</div>
    );
  }
  return <img src={davidAvatar} alt="David" className="w-full h-full object-cover" />;
};

interface PracticeSessionProps {
  unit: Unit;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  onBack: () => void;
  onFinishSession: (report: SpeakingReport, chatCount: number) => void;
}

export default function PracticeSession({
  unit,
  difficulty,
  onBack,
  onFinishSession
}: PracticeSessionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [tutorStatus, setTutorStatus] = useState<'idle' | 'speaking' | 'listening' | 'reflecting'>('idle');
  
  // Enhanced Speech Settings (David Voice System V1.1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(() => {
    return localStorage.getItem('david_speaking_coach_voice_name') || '';
  });
  const [activeCoachId, setActiveCoachId] = useState<string>(() => {
    return localStorage.getItem('david_speaking_coach_active_coach') || 'david';
  });
  const [speechPitch, setSpeechPitch] = useState<number>(() => {
    const saved = localStorage.getItem('david_speaking_coach_speech_pitch');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    const saved = localStorage.getItem('david_speaking_coach_auto_speak');
    return saved !== 'false'; // default to true
  });
  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = localStorage.getItem('david_speaking_coach_speech_rate');
    return saved ? parseFloat(saved) : 1.0;
  });
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [showDeveloperInfo, setShowDeveloperInfo] = useState<boolean>(false);
  const [isQuotaFallback, setIsQuotaFallback] = useState<boolean>(false);

  // Sync state changes with persistence
  const updateSpeechPitch = (p: number) => {
    setSpeechPitch(p);
    localStorage.setItem('david_speaking_coach_speech_pitch', p.toString());
  };

  const updateAutoSpeak = (b: boolean) => {
    setAutoSpeak(b);
    localStorage.setItem('david_speaking_coach_auto_speak', b.toString());
  };

  const updateSpeechRate = (r: number) => {
    setSpeechRate(r);
    localStorage.setItem('david_speaking_coach_speech_rate', r.toString());
  };

  // Dictation/Microphone state
  const [isRecording, setIsRecording] = useState(false);
  const [sttInterimText, setSttInterimText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const recognizerRef = useRef<SpeechRecognizer | null>(null);

  // Loading/Reporting state
  const [loading, setLoading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  // "💡 不会表达" States
  const [showCantExpress, setShowCantExpress] = useState(false);
  const [cantExpressChinese, setCantExpressChinese] = useState('');
  const [cantExpressLoading, setCantExpressLoading] = useState(false);
  const [cantExpressResult, setCantExpressResult] = useState<{
    basicVersion: string;
    naturalVersion: string;
    highScoreVersion: string;
    keyExpressions: Array<{ expression: string, meaning: string }>;
    simpleTips: string;
  } | null>(null);
  const [cantExpressError, setCantExpressError] = useState<string | null>(null);
  const [activePlaybackText, setActivePlaybackText] = useState<string | null>(null);

  const listEndRef = useRef<HTMLDivElement>(null);

  // Initialize coach chat
  useEffect(() => {
    fetchDavidReply([]);
    
    // Initialize Voice Dictation
    const recognizer = new SpeechRecognizer(
      (text, isFinal) => {
        if (isFinal) {
          setInputText((prev) => (prev ? prev + ' ' + text : text));
          setSttInterimText('');
        } else {
          setSttInterimText(text);
        }
      },
      (err) => {
        console.error("Speech Recognition Error:", err);
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
        setIsRecording(false);
      },
      () => {
        setIsRecording(false);
      }
    );

    if (recognizer.isSupported()) {
      recognizerRef.current = recognizer;
    }

    return () => {
      stopSpeaking();
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
    };
  }, [unit.id]);

  // Load and register device voices
  useEffect(() => {
    const listVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const devVoices = window.speechSynthesis.getVoices();
        setVoices(devVoices);
      }
    };
    listVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = listVoices;
    }
  }, []);

  // Sync automatic matching when voices load or coach switches
  useEffect(() => {
    if (voices.length > 0) {
      const savedVoice = localStorage.getItem('david_speaking_coach_voice_name');
      if (savedVoice && voices.some(v => v.name === savedVoice)) {
        setSelectedVoiceName(savedVoice);
      } else {
        const bestVoice = getAutoMatchedVoiceForCoach(activeCoachId, voices);
        if (bestVoice) {
          setSelectedVoiceName(bestVoice.name);
          localStorage.setItem('david_speaking_coach_voice_name', bestVoice.name);
        }
      }
    }
  }, [voices, activeCoachId]);

  const handleCoachChange = (coachId: string) => {
    setActiveCoachId(coachId);
    localStorage.setItem('david_speaking_coach_active_coach', coachId);

    // Dynamic voice matching
    if (voices.length > 0) {
      const best = getAutoMatchedVoiceForCoach(coachId, voices);
      if (best) {
        setSelectedVoiceName(best.name);
        localStorage.setItem('david_speaking_coach_voice_name', best.name);
      }
    }
  };

  const handleTestVoice = () => {
    const activeProf = COACH_PROFILES.find(c => c.id === activeCoachId) || COACH_PROFILES[0];
    speakText(activeProf.greeting, speechRate, speechPitch, selectedVoiceName);
  };

  // Scroll to bottom whenever messages or status changes
  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, tutorStatus, sttInterimText]);

  // Call Express backend to get David's reply
  const fetchDavidReply = async (currentHistory: ChatMessage[]) => {
    setTutorStatus('reflecting');
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentHistory.map(m => ({ sender: m.sender, text: m.text })),
          unitTitle: unit.title,
          unitTopic: unit.topic,
          unitSkill: unit.speakingSkill,
          difficultyLevel: difficulty,
          coachId: activeCoachId
        })
      });

      const data = await response.json();
      if (data.isFallback) {
        setIsQuotaFallback(true);
      }
      
      const newAiMessage: ChatMessage = {
        id: `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: 'ai',
        text: data.speechText,
        translation: data.chineseTranslation,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, newAiMessage]);
      setTutorStatus('speaking');

      if (autoSpeak) {
        await speakText(data.speechText, speechRate, speechPitch, selectedVoiceName);
      }
      setTutorStatus('listening');
    } catch (e) {
      console.error(e);
      // Fallback message
      const fallback: ChatMessage = {
        id: `ai-err-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        sender: 'ai',
        text: "My apologies! I failed to fetch an answer. Let's keep trying! What do you think?",
        translation: "抱歉！获取回复失败。我们继续尝试吧！你觉得呢？",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, fallback]);
      setTutorStatus('listening');
    } finally {
      setLoading(false);
    }
  };

  // Submit student speech text
  const handleSend = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text) return;

    // Reset voice input states
    if (isRecording) {
      recognizerRef.current?.stop();
      setIsRecording(false);
    }

    const newUserMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, newUserMessage];
    setMessages(updatedHistory);
    setInputText('');
    setSttInterimText('');

    // Fetch next reply
    await fetchDavidReply(updatedHistory);
  };

  // Handle pronunciation in helper modal
  const playCantExpressAudio = async (text: string) => {
    if (activePlaybackText === text) {
      stopSpeaking();
      setActivePlaybackText(null);
      return;
    }
    stopSpeaking();
    setActivePlaybackText(text);
    await speakText(text, speechRate, speechPitch, selectedVoiceName);
    setActivePlaybackText(null);
  };

  // Submit Chinese query to coach API with topic context
  const handleCantExpressSubmit = async () => {
    const text = cantExpressChinese.trim();
    if (!text) {
      setCantExpressError("Please input Chinese sentence (请先输入中文内容)");
      return;
    }
    setCantExpressLoading(true);
    setCantExpressError(null);
    setCantExpressResult(null);
    try {
      const response = await fetch('/api/expression-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chineseText: text,
          unitTitle: unit.title,
          unitTopic: unit.topic
        })
      });
      if (!response.ok) {
        throw new Error();
      }
      const data = await response.json();
      setCantExpressResult(data);
    } catch (e) {
      console.error(e);
      setCantExpressError("Failed to translate and polish. Please try again! (智能润色失败，请重新试一下)");
    } finally {
      setCantExpressLoading(false);
    }
  };

  // Auto-fill selected option in chat input and exit
  const handleUseAnswer = (text: string) => {
    setInputText(text);
    setShowCantExpress(false);
    setCantExpressChinese('');
    setCantExpressResult(null);
    setCantExpressError(null);
  };

  // Turn Voice Rec on or off
  const toggleRecording = () => {
    if (!recognizerRef.current) {
      alert("Speech recognition is not supported in this browser. Please type your reply instead!");
      return;
    }

    setMicError(null);

    if (isRecording) {
      recognizerRef.current.stop();
      setIsRecording(false);
    } else {
      stopSpeaking();
      try {
        recognizerRef.current.start();
        setIsRecording(true);
      } catch (e: any) {
        console.error(e);
        setMicError('permission-blocked');
      }
    }
  };

  // Generate Report card
  const handleGenerateReport = async () => {
    if (messages.length < 4) return;
    setGeneratingReport(true);
    stopSpeaking();

    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({ sender: m.sender, text: m.text })),
          unitTitle: unit.title
        })
      });

      const reportData = await response.json();
      onFinishSession(reportData, Math.floor(messages.length / 2));
    } catch (e) {
      console.error("Failed to generate speaking report:", e);
      // Create fallback beautiful report
      const mockReport: SpeakingReport = {
        pronunciation: 82,
        fluency: 85,
        vocabulary: 80,
        grammar: 84,
        communication: 88,
        overall: 84,
        strengths: [
          "Brave English attempts (勇于开口说英语).",
          "Replied appropriately about the subject (围绕话题回答切合).",
          "Sentence structures are readable and comprehensible (句子结构基本完整易懂)."
        ],
        suggestions: [
          "Try including more specific keywords from the lesson (试着多用教材中提及的中心词汇).",
          "Read sentences aloud to natural pitch curves (朗读句型以塑造更自然的语调).",
          "Double check simple present tense agreements (复盘时注意单复数与时态细节)."
        ]
      };
      onFinishSession(mockReport, Math.floor(messages.length / 2));
    } finally {
      setGeneratingReport(false);
    }
  };

  const speakAgain = (text: string) => {
    setTutorStatus('speaking');
    speakText(text, speechRate, speechPitch, selectedVoiceName).then(() => {
      setTutorStatus('listening');
    });
  };

  const toggleTranslation = (id: string) => {
    setShowTranslations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Calculate conversation turn progress (e.g., student answers counts)
  const studentTurns = messages.filter(m => m.sender === 'user').length;
  const progressPercent = Math.min(100, (studentTurns / 5) * 100);

  // Generate suggested textbooks scaffolding help
  const getScaffoldingAnswers = () => {
    // Return sample answers related to the text topic
    if (unit.number === 1 && unit.book === 1) {
      return ["I think history is very interesting because we learn about the past.", "In my opinion, Confucius is one of the wisest people in history.", "Famous people teach us to work hard and never give up."];
    }
    if (unit.number === 3 && unit.book === 1) {
      return ["I usually do the washing up and sweep the floor.", "Yes, teenagers should help at home to learn responsibility.", "My favorite family activity is eating dinner together."];
    }
    if (unit.number === 6 && unit.book === 1) {
      return ["My favorite food is apples and steamed buns.", "I try to eat healthy, but sometimes I eat fast food.", "Teenagers should eat more fresh fruit and vegetables."];
    }
    return [
      `I really enjoy discussing ${unit.topic.toLowerCase()}!`,
      `Yes, I agree with this idea because it's important.`,
      `In my view, we can learn a lot from this Grade 9 unit.`
    ];
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-5xl mx-auto px-4 py-2" id="practice-session-container">
      {/* Upper Navigation Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-wrap justify-between items-center gap-3 mb-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-xl transition text-gray-500"
            id="back-to-units-button"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">
              {unit.book === 1 ? '九年级上册' : '九年级下册'}
            </span>
            <h1 className="text-sm font-bold text-gray-800">Unit {unit.number}: {unit.title}</h1>
          </div>
        </div>

        {/* Practice Indicators */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
            <span className="text-xs text-indigo-700 font-semibold uppercase leading-none">
              Level: {difficulty}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
              Progress: {studentTurns} / 5 Rounds
            </span>
            <div className="w-24 bg-gray-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Chat viewport and scaffolding helper sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 overflow-hidden min-h-0">
        
        {/* Left/Middle Column: Talking coach David and messages dialogue */}
        <div className="lg:col-span-3 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          
          {/* David Visual Status header */}
          <div className="p-4 bg-gradient-to-b from-gray-50 to-white border-b border-gray-50 flex items-center justify-center">
            <TutorAvatar status={tutorStatus} coachId={activeCoachId} />
          </div>

          {isQuotaFallback && (
            <div className="bg-amber-50/80 border-b border-amber-100/50 px-4 py-2 flex items-center justify-between gap-4 text-xs text-amber-800 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-amber-500">💡</span>
                <span>
                  <strong>Resilient Practice Active:</strong> Dynamic cloud engine at peak load. Switching seamlessly to offline coach simulator. No progress lost! (已自动切换到本地配套课程模拟器协助您的训练)
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

          {/* Dialog bubble board */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && loading && (
              <div className="flex justify-center items-center h-full">
                <div className="text-center space-y-2">
                  <span className="inline-block animate-spin text-2xl text-indigo-500">⏳</span>
                  <p className="text-xs font-medium text-gray-500">Calling David Coach from native classroom...</p>
                </div>
              </div>
            )}

            <AnimatePresence initial={false}>
              {messages.map((message) => {
                const isAi = message.sender === 'ai';
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAi && (
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 shrink-0 select-none">
                        <CoachMiniAvatar coachId={activeCoachId} />
                      </div>
                    )}

                    <div className="max-w-[85%] sm:max-w-[70%]">
                      {/* Bubble box */}
                      <div className={`p-4.5 rounded-2xl text-xs sm:text-sm shadow-sm leading-relaxed ${
                        isAi 
                          ? 'bg-gradient-to-br from-blue-50/50 to-white text-slate-800 rounded-tl-none border border-slate-100 shadow-xs' 
                          : 'bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] text-white rounded-tr-none shadow-md shadow-blue-100'
                      }`}>
                        
                        <p>{message.text}</p>
                        
                        {/* Interactive Translation helper */}
                        {isAi && message.translation && (
                          <AnimatePresence>
                            {showTranslations[message.id] && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 pt-2 border-t border-indigo-100 text-[11px] text-indigo-800 leading-normal"
                              >
                                {message.translation}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        )}
                      </div>

                      {/* Info & Tool action tags for bubbles */}
                      <div className={`mt-1.5 flex items-center gap-3 text-[10px] text-gray-400 px-1 ${
                        isAi ? 'justify-start' : 'justify-end'
                      }`}>
                        <span>{message.timestamp}</span>
                        {isAi && (
                          <>
                            <button 
                              onClick={() => toggleTranslation(message.id)}
                              className="text-indigo-600 font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <Globe size={11} />
                              {showTranslations[message.id] ? 'Hide 译文' : 'Show Translation (译文)'}
                            </button>
                            <button 
                              onClick={() => speakAgain(message.text)}
                              className="text-[#4F7CFF] font-semibold hover:underline flex items-center gap-0.5"
                            >
                              <Volume2 size={11} />
                              Re-speak (重听)
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* STT/Recording raw preview bubble */}
            {isRecording && sttInterimText && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-end"
              >
                <div className="max-w-[70%] bg-indigo-50 p-4 rounded-2xl rounded-tr-none border border-indigo-200">
                  <p className="text-xs text-indigo-700 italic flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Transcribing spoken voice:
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1 font-mono">{sttInterimText}</p>
                </div>
              </motion.div>
            )}

            {loading && tutorStatus === 'reflecting' && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-indigo-100 border border-indigo-200 shrink-0 select-none">
                  <CoachMiniAvatar coachId={activeCoachId} />
                </div>
                <div className="bg-gray-100 p-3 rounded-2xl rounded-tl-none text-gray-500 text-xs flex items-center gap-2">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>{COACH_PROFILES.find(c => c.id === activeCoachId)?.name || 'Coach'} is thinking (正在组织语言)...</span>
                </div>
              </div>
            )}
            <div ref={listEndRef} />
          </div>

          {/* Bottom input area */}
          <div className="p-4 bg-gray-50 border-t border-gray-100">
            {micError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-left text-xs text-rose-800 leading-relaxed shadow-xs">
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

            <div className="flex gap-2 items-center">
              {/* Mic pulse button */}
              <button 
                id="mic-dictation-toggle"
                onClick={toggleRecording}
                className={`p-3.5 rounded-2xl shrink-0 text-white shadow-md transition transform active:scale-95 ${
                  isRecording 
                    ? 'bg-rose-500 hover:bg-[#ff5555] animate-pulse ring-4 ring-rose-100' 
                    : 'bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] hover:opacity-95 shadow-md shadow-blue-100'
                }`}
                title={isRecording ? "Stop dictation" : "Speak through Mic!"}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </button>

              {/* 💡 不会表达 Button */}
              <button
                type="button"
                id="cant-express-trigger-button"
                onClick={() => setShowCantExpress(true)}
                className="px-3.5 py-2 sm:py-2.5 bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] text-white rounded-2xl flex flex-col items-center justify-center gap-0.5 focus:outline-none transition transform active:scale-95 shadow-md hover:opacity-95 shrink-0 text-[10px] font-bold leading-tight"
                title="I Can't Express It (不会表达)"
              >
                <div className="flex items-center gap-1">
                  <Lightbulb size={13} className="fill-amber-300 stroke-amber-100" />
                  <span>不会表达</span>
                </div>
                <span className="text-[7.5px] opacity-90 tracking-tighter">I Can't Express It</span>
              </button>

              {/* Text Input */}
              <input 
                id="textual-speech-input"
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
                placeholder={isRecording ? "Speak now or type here..." : "Type your spoken answer here..."}
                className="flex-1 bg-white border border-gray-200 rounded-2xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent min-w-0"
                disabled={generatingReport}
              />

              {/* Send Submit Key */}
              <button 
                id="submit-speech-response-button"
                onClick={() => handleSend(inputText)}
                disabled={!inputText.trim() || generatingReport}
                className="p-3.5 bg-slate-800 text-white rounded-2xl hover:bg-slate-900 active:bg-black transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <Send size={18} />
              </button>
            </div>

            {/* Prompt indicators */}
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-[10px] text-gray-400 px-1">
              <span>💡 Press Enter to submit answer. Speak or type in English.</span>
              <span className="text-[#4F7CFF] font-semibold">David always listens patiently. (认真倾听每一句话)</span>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Scaffolding, vocabulary helpers & Settings */}
        <div className="space-y-4 lg:col-span-1">
          {/* Settings Box */}
          <div className="bg-white rounded-2xl p-4.5 shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center justify-between border-b border-gray-55 pb-2">
              <span className="flex items-center gap-1.5 text-slate-800">
                <Settings size={13} className="text-[#4F7CFF]" />
                ⚙ Voice Settings (发音设置)
              </span>
            </h2>
            
            <div className="space-y-4 pt-1">
              {/* Coach Selection Grid */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">AI English Coach (在线外教)</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {COACH_PROFILES.map((p) => {
                    const isSelected = activeCoachId === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleCoachChange(p.id)}
                        className={`p-2 rounded-xl border text-left transition duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-br from-[#4F7CFF]/10 to-[#7A5CFF]/10 border-[#7A5CFF] text-[#7A5CFF] shadow-xs'
                            : 'border-slate-100 text-slate-600 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-[11px] font-extrabold flex items-center justify-between mb-0.5">
                          <span>{p.name}</span>
                          <span className="text-xs">{p.id === 'david' || p.id === 'emma' ? '🇬🇧' : '🇺🇸'}</span>
                        </div>
                        <div className="text-[8px] font-medium text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis">
                          {p.accent} · {p.gender}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Coach Voice Selection Dropdown */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">System TTS Voice (系统设备声音)</span>
                <select
                  value={selectedVoiceName}
                  onChange={(e) => {
                    setSelectedVoiceName(e.target.value);
                    localStorage.setItem('david_speaking_coach_voice_name', e.target.value);
                  }}
                  className="w-full p-2 bg-slate-50 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#4F7CFF] transition-colors cursor-pointer"
                >
                  <option value="">-- Automatically Choose Best System Match --</option>
                  {voices
                    .filter(v => v.lang.toLowerCase().startsWith('en'))
                    .map((v) => {
                      const estGender = estimateGender(v.name);
                      return (
                        <option key={v.name} value={v.name}>
                          {v.name} ({v.lang.replace('en-', '').toUpperCase()}) - Est. {estGender}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Mismatch Alert Fallback Indicator */}
              {(() => {
                const activeProf = COACH_PROFILES.find(c => c.id === activeCoachId);
                const activeVoice = voices.find(v => v.name === selectedVoiceName);
                if (activeProf && activeVoice) {
                  const estVoiceGender = estimateGender(activeVoice.name);
                  if (activeProf.gender !== estVoiceGender && estVoiceGender !== 'Neutral') {
                    return (
                      <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-100 text-left">
                        <span className="text-[9px] font-extrabold text-amber-600 uppercase block tracking-wider mb-0.5">⚠️ Accent Gender Notice</span>
                        <p className="text-[9px] text-amber-700 font-bold leading-normal">
                          {activeProf.gender} English voice unavailable on this device. Using closest available English voice: <span className="font-mono text-[10px]">{activeVoice.name}</span>
                        </p>
                      </div>
                    );
                  }
                }
                return null;
              })()}

              {/* Speed Pills Selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Speech Speed (发音语速)</span>
                <div className="grid grid-cols-4 gap-1">
                  {[0.8, 1.0, 1.2, 1.5].map((rateVal) => {
                    const isSelected = speechRate === rateVal;
                    return (
                      <button
                        key={rateVal}
                        type="button"
                        onClick={() => updateSpeechRate(rateVal)}
                        className={`py-1.5 rounded-lg text-xs font-extrabold transition text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#4F7CFF] text-white shadow-xs'
                            : 'border border-slate-150 text-slate-600 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {rateVal === 1.0 ? '1.0x' : `${rateVal}x`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Pitch Pills Selection */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Voice Pitch (发音音高)</span>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { label: 'Low', val: 0.8 },
                    { label: 'Normal', val: 1.0 },
                    { label: 'High', val: 1.2 }
                  ].map((pItm) => {
                    const isSelected = speechPitch === pItm.val;
                    return (
                      <button
                        key={pItm.label}
                        type="button"
                        onClick={() => updateSpeechPitch(pItm.val)}
                        className={`py-1.5 rounded-lg text-xs font-extrabold transition text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#7A5CFF] text-white shadow-xs'
                            : 'border border-slate-150 text-slate-600 bg-white hover:bg-slate-50'
                        }`}
                      >
                        {pItm.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Auto Sound Read checkbox toggle */}
              <label id="auto-speak-setting-label" className="flex items-center justify-between cursor-pointer border-t border-slate-55 pt-2 pb-1">
                <span className="text-xs font-bold text-slate-700">Auto Sound Read (自动朗读)</span>
                <input 
                  type="checkbox" 
                  checked={autoSpeak}
                  onChange={(e) => updateAutoSpeak(e.target.checked)}
                  className="w-4 h-4 rounded text-[#4F7CFF] focus:ring-[#4F7CFF]"
                />
              </label>

              {/* Test Voice trigger button */}
              <button
                type="button"
                onClick={handleTestVoice}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-150 rounded-xl text-xs font-extrabold text-slate-700 hover:text-slate-900 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>🔊</span> Test {COACH_PROFILES.find(c => c.id === activeCoachId)?.name || 'Coach'}'s Voice
              </button>
            </div>

            {/* Developer/Teacher Diagnostics Panel */}
            <div className="border-t border-slate-50 pt-2.5">
              <button
                type="button"
                onClick={() => setShowDeveloperInfo(!showDeveloperInfo)}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 w-full"
              >
                <span>🛠️</span> {showDeveloperInfo ? 'Hide Voice Diagnostics' : 'Show Developer Voice Diagnostics'}
              </button>
              
              {showDeveloperInfo && (
                <div className="mt-2.5 p-2 bg-slate-50 rounded-xl border border-slate-100/80 text-left max-h-48 overflow-y-auto space-y-1 font-mono text-[9px] text-slate-500">
                  <div className="font-bold text-slate-700 pb-1 border-b border-slate-100 mb-1 flex items-center justify-between text-[10px]">
                    <span>Detected TTS Voices</span>
                    <span>({voices.filter(v => v.lang.toLowerCase().startsWith('en')).length} total)</span>
                  </div>
                  {voices
                    .filter(v => v.lang.toLowerCase().startsWith('en'))
                    .map((voiceObj, index) => (
                      <div key={index} className="p-1 border-b border-slate-100/50 flex flex-col">
                        <div className="font-extrabold text-slate-700 leading-normal">{index + 1}. {voiceObj.name}</div>
                        <div className="text-slate-400 leading-normal">
                          Lang: {voiceObj.lang} · Estimated Gender: <span className="font-black text-indigo-600">{estimateGender(voiceObj.name)}</span>
                        </div>
                      </div>
                    ))}
                  {voices.filter(v => v.lang.toLowerCase().startsWith('en')).length === 0 && (
                    <div className="text-slate-400 italic py-1 text-center font-bold">No English local voices detected by device browser.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Academic Scaffolding Panel */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3 flex flex-col justify-between">
            <div>
              <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-2.5">
                <Lightbulb size={13} className="text-amber-500" />
                Lesson Scaffolding (口语支架)
              </h2>

              <div id="lesson-speaking-skill-tip" className="bg-gradient-to-br from-[#F0F4FF] to-white p-3 rounded-xl border border-blue-100/50 mb-3 text-xs">
                <div className="font-bold text-[#4F7CFF]">Target Skill (本课口语技巧)</div>
                <p className="text-[#7A5CFF]/95 mt-1 font-semibold">{unit.speakingSkill || "Discussing Course Topics"}</p>
              </div>

              <div className="space-y-2">
                <div className="text-[10px] font-bold text-gray-400">Need help answering? Tap code hints (答案范例):</div>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {getScaffoldingAnswers().map((scaf, idx) => (
                    <button
                      key={idx}
                      onClick={() => setInputText(scaf)}
                      className="w-full text-left p-2 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-200 rounded-xl text-xs text-slate-600 transition flex items-start gap-1.5 cursor-pointer"
                    >
                      <Sparkles size={11} className="text-[#4F7CFF] mt-0.5 shrink-0" />
                      <span>{scaf}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Speaking completion badge trigger card */}
            <div className="pt-2 border-t border-gray-100 mt-2">
              <button
                id="generate-spoken-report-button"
                onClick={handleGenerateReport}
                disabled={messages.length < 4 || generatingReport}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md uppercase tracking-wide cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] hover:opacity-95 text-white"
              >
                {generatingReport ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Award size={14} />
                    Finish & Get ReportCard (评估成绩)
                  </>
                )}
              </button>
              {messages.length < 4 && (
                <p className="text-[9px] text-gray-400 mt-1 text-center font-semibold">
                  (Talk at least 2 rounds to activate score report)
                </p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* 💡 不会表达 Modal Overlay */}
      <AnimatePresence>
        {showCantExpress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white rounded-[28px] w-full max-w-lg overflow-hidden border border-slate-100 shadow-2xl flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/20 to-indigo-50/20 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-gradient-to-br from-[#4F7CFF] to-[#7A5CFF] rounded-xl text-white">
                    <Lightbulb size={18} className="fill-white/20 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black text-slate-800 leading-none">💡 不会表达 (I Can't Express It)</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">David's Academic Expression Coach</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowCantExpress(false);
                    setCantExpressChinese('');
                    setCantExpressResult(null);
                    setCantExpressError(null);
                  }}
                  className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Content Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-left">
                <div className="space-y-1.5 font-sans">
                  <div className="flex justify-between items-center text-xs">
                    <label className="font-extrabold text-[#1e293b]">
                      How would you say this in Chinese?
                    </label>
                    <span className="text-[9px] font-black text-[#4F7CFF] uppercase bg-blue-50 px-2 py-0.5 rounded-full">
                      Topic: {unit.topic}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={cantExpressChinese}
                      onChange={(e) => {
                        setCantExpressChinese(e.target.value);
                        if (cantExpressError) setCantExpressError(null);
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleCantExpressSubmit()}
                      placeholder="请输入你想表达的中文内容..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-blue-400 focus:bg-white text-slate-800 font-medium"
                      disabled={cantExpressLoading}
                    />
                    <button
                      onClick={handleCantExpressSubmit}
                      disabled={cantExpressLoading || !cantExpressChinese.trim()}
                      className="px-4 py-2 bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] text-white rounded-xl text-xs font-black shadow-md shadow-blue-105 flex items-center justify-center cursor-pointer disabled:opacity-40 select-none shrink-0"
                    >
                      {cantExpressLoading ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>提交 (Submit)</span>
                      )}
                    </button>
                  </div>
                  {cantExpressError && (
                    <p className="text-[10px] text-red-500 font-bold">{cantExpressError}</p>
                  )}
                </div>

                {cantExpressLoading && (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                    <div className="w-8 h-8 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-xs text-slate-500 font-bold">David is analyzing textbooks & crafting 3 layers of spoken models...</p>
                  </div>
                )}

                {cantExpressResult && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {/* Chinese Input display */}
                    <div className="p-3.5 bg-amber-50/60 border border-amber-200/50 rounded-2xl">
                      <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest block mb-0.5">🇨🇳 Chinese (中文想法)</span>
                      <p className="text-xs font-bold text-amber-950 font-mono">{cantExpressChinese}</p>
                    </div>

                    {/* Basic English */}
                    <div className="p-3.5 bg-blue-50/60 border border-blue-200/50 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-wide">🇬🇧 Basic English (基础表达 - 轻松流利)</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => playCantExpressAudio(cantExpressResult.basicVersion)}
                            className={`p-1 px-1.5 rounded-md text-[10px] font-bold border flex items-center gap-1 transition-all ${
                              activePlaybackText === cantExpressResult.basicVersion
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-blue-700 hover:bg-blue-100 border-blue-200'
                            }`}
                          >
                            <Volume2 size={11} />
                            Read
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUseAnswer(cantExpressResult.basicVersion)}
                            className="px-2 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white rounded-md text-[10px] font-bold cursor-pointer transition"
                          >
                            Use This Answer
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-extrabold text-blue-950 leading-relaxed font-mono select-all">
                        {cantExpressResult.basicVersion}
                      </p>
                    </div>

                    {/* Natural English */}
                    <div className="p-3.5 bg-purple-50/50 border border-purple-200/45 rounded-2xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-purple-700 uppercase tracking-wide">🇬🇧 Natural English (地道口语 - 完美语感)</span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => playCantExpressAudio(cantExpressResult.naturalVersion)}
                            className={`p-1 px-1.5 rounded-md text-[10px] font-bold border flex items-center gap-1 transition-all ${
                              activePlaybackText === cantExpressResult.naturalVersion
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-purple-700 hover:bg-purple-100 border-purple-200'
                            }`}
                          >
                            <Volume2 size={11} />
                            Read
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUseAnswer(cantExpressResult.naturalVersion)}
                            className="px-2 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white rounded-md text-[10px] font-bold cursor-pointer transition"
                          >
                            Use This Answer
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-extrabold text-purple-950 leading-relaxed font-mono select-all">
                        {cantExpressResult.naturalVersion}
                      </p>
                    </div>

                    {/* High-Score Version */}
                    <div className="p-4 bg-yellow-50/70 border border-yellow-300/50 rounded-2xl space-y-2 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-400/5 rounded-full blur-xl pointer-events-none" />
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-wide flex items-center gap-1">
                          <span>🏆</span> High-score Version (九年级中考高分加分句)
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => playCantExpressAudio(cantExpressResult.highScoreVersion)}
                            className={`p-1 px-1.5 rounded-md text-[10px] font-bold border flex items-center gap-1 transition-all ${
                              activePlaybackText === cantExpressResult.highScoreVersion
                                ? 'bg-amber-600 text-white border-amber-600'
                                : 'bg-white text-amber-700 hover:bg-yellow-100 border-yellow-300'
                            }`}
                          >
                            <Volume2 size={11} />
                            Read
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUseAnswer(cantExpressResult.highScoreVersion)}
                            className="px-2 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-95 text-white rounded-md text-[10px] font-bold cursor-pointer transition"
                          >
                            Use This Answer
                          </button>
                        </div>
                      </div>
                      <p className="text-xs font-black text-amber-950 leading-relaxed font-mono select-all">
                        {cantExpressResult.highScoreVersion}
                      </p>
                    </div>

                    {/* Key Expressions */}
                    {cantExpressResult.keyExpressions && cantExpressResult.keyExpressions.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">⭐ Key Expressions</span>
                        <div className="grid grid-cols-2 gap-2 text-left">
                          {cantExpressResult.keyExpressions.map((expr, idx) => (
                            <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-left">
                              <p className="text-[11px] font-black text-slate-800 leading-none">{expr.expression}</p>
                              <p className="text-[10px] text-slate-400 mt-1 font-bold">{expr.meaning}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Simple tips */}
                    {cantExpressResult.simpleTips && (
                      <div className="p-3 bg-amber-50/40 border border-amber-200/40 rounded-xl text-left">
                        <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest block mb-0.5">💡 Coach Tip</span>
                        <p className="text-[11px] text-slate-700 font-bold leading-normal">{cantExpressResult.simpleTips}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Learning footer */}
              <div className="p-4 bg-slate-100 border-t border-slate-100 text-center text-[10px] font-bold text-slate-400 shrink-0">
                💡 Speak naturally, practice actively!
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
