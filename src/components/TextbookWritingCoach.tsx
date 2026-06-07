import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Languages, Volume2, ArrowLeft, Loader2, BookOpen, 
  ChevronRight, Smile, CheckCircle, RefreshCw, PenTool, Lightbulb, GraduationCap,
  Copy, Check, FileText, AlertTriangle, BookMarked, HelpCircle, Award, VolumeX
} from 'lucide-react';
import { WRITING_TASKS, WritingTaskData } from '../data/writingTasks';
import { speakText, stopSpeaking } from '../lib/audioService';

interface TextbookWritingCoachProps {
  onBack: () => void;
  onRewardXp: (amount: number) => void;
  experiencePoints: number;
}

export default function TextbookWritingCoach({ 
  onBack, 
  onRewardXp,
  experiencePoints 
}: TextbookWritingCoachProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('1');
  const [selectedBook, setSelectedBook] = useState<'upper' | 'lower'>('upper');
  const [chineseInput, setChineseInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    outline: string[];
    composition: string;
    highScoreVersion: string;
    modelAnswer: string;
    tips: string[];
    isFallback?: boolean;
  } | null>(null);
  const [activeSpeechText, setActiveSpeechText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isQuotaFallback, setIsQuotaFallback] = useState(false);
  const [studyRewardClaimed, setStudyRewardClaimed] = useState(false);
  const [activeTab, setActiveTab] = useState<'outline' | 'composition' | 'highScore' | 'annotated'>('outline');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Quick ideas templates for Grade 9 students to bypass writer's block
  const QUICK_IDEAS_TEMPLATES: Record<string, string[]> = {
    "1": ["我想写马可波罗，他是一个伟大的旅行家，13世纪来到中国，走了20多年，写了游记。他克服了很多荒野困难，留下了持久的影响。"],
    "2": ["我想写感谢我的英语老师王老师。在我学英语没有信心时，她课后耐心地帮助我纠正发音，还送我一本英语书，这让我非常感动。"],
    "3": ["我写我的课外日常。早上7点起床，早读并上课。下午放学后参加志愿社团，晚上回家写作业并阅读10分钟，感到充实。"],
    "4": ["台风过后，很多人无家可归，在桥洞下生火，又冷又饿。我们社团去给他们分发了热水、热汤、毛毯和面包，献出了爱心和关怀。"],
    "5": ["我想改进我的听力。目前我打算每天早起听15分钟官方口语录音。同时做笔记积累地道短语，我相信坚持一个月能很有进步。"],
    "6": ["写我的周末家庭晚餐。我爸爸常常做他拿手的红烧肉，妈妈准备果汁，我摆放碗筷。大家边吃边讲学校趣事，欢声笑语不断。"],
    "7": ["给我的海叔（Uncle Sean）写封信，分享我的中考备考状况，最近我们在学校排练了戏剧，我扮演配角很有意思，希望他一切都好。"],
    "8": ["写主持我们班英语才艺秀的稿子。欢迎大家的到来，首先介绍戏剧表演，接着是合唱，最后致谢并祝大家度过美好时光。"],
    "9": ["点评我们学校旁边的“阳光面馆”。他们的招牌牛肉面特别鲜美，价格实惠。虽然午餐时间有点拥挤，服务员态度依然很亲切。"],
    "10": ["写《皇帝的新装》故事报告。讲述两个骗子做了看不见的衣服，唯有一个诚实的孩子指出了真相。告诉我们诚实无比珍贵。"],
    "11": ["写我过生日时好朋友送的亲手折的纸星。它代表了我们深厚的友谊，每当我感到学习考试压力大时，看着它就倍受鼓舞。"],
    "12": ["我最爱羽毛球。每周末和爸爸在小区打，它不仅能锻炼体魄 and 手眼协调，更能舒缓功课压力。"],
    "13": ["写给生病的同桌小明，询问他的感冒有没有好一点，让他不用担心这周的数学和英语作业，我会把这两天的重要笔记借给他看。"]
  };

  const selectedTask = WRITING_TASKS.find(t => t.id === selectedTaskId) || WRITING_TASKS[0];

  const handleTaskChange = (taskId: string) => {
    setSelectedTaskId(taskId);
    setChineseInput(''); // clear input to refresh context
    setResult(null);
    setError(null);
    setIsQuotaFallback(false);
    setStudyRewardClaimed(false);
    stopSpeaking();
    setActiveSpeechText(null);
  };

  const handleBookChange = (book: 'upper' | 'lower') => {
    setSelectedBook(book);
    if (book === 'upper') {
      const firstUpper = WRITING_TASKS.find(t => parseInt(t.id) <= 8)?.id || '1';
      handleTaskChange(firstUpper);
    } else {
      const firstLower = WRITING_TASKS.find(t => parseInt(t.id) > 8)?.id || '9';
      handleTaskChange(firstLower);
    }
  };

  // Synchronize book switcher view whenever the selected task ID changes
  React.useEffect(() => {
    const idNum = parseInt(selectedTaskId);
    if (!isNaN(idNum)) {
      setSelectedBook(idNum <= 8 ? 'upper' : 'lower');
    }
  }, [selectedTaskId]);

  const handleGenerateCoach = async (textToUse?: string) => {
    const text = textToUse !== undefined ? textToUse : chineseInput;
    
    setLoading(true);
    setError(null);
    setResult(null);
    setIsQuotaFallback(false);
    setStudyRewardClaimed(false);
    stopSpeaking();
    setActiveSpeechText(null);

    try {
      const response = await fetch('/api/writing-coach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskId: selectedTaskId,
          chineseIdeas: text.trim() 
        })
      });

      if (!response.ok) {
        throw new Error("Server communication went array.");
      }

      const data = await response.json();
      if (data.isFallback) {
        setIsQuotaFallback(true);
      }
      setResult(data);
      setActiveTab('outline'); // Default to outline view
    } catch (err: any) {
      console.error(err);
      setError("AI Engine temporary overloaded. Initiating fallback standard guides inside. (AI引擎正在排队，您可以使用左侧的国家教纲标准进行本地查阅)");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleSpeakText = async (text: string) => {
    if (activeSpeechText === text) {
      stopSpeaking();
      setActiveSpeechText(null);
      return;
    }

    stopSpeaking();
    setActiveSpeechText(text);

    // Dynamic config overrides from client specs
    const voiceName = localStorage.getItem('david_speaking_coach_voice_name') || '';
    const pitch = parseFloat(localStorage.getItem('david_speaking_coach_speech_pitch') || '1.0');
    const rate = parseFloat(localStorage.getItem('david_speaking_coach_speech_rate') || '0.85'); // Slightly slower for training writing syntax

    await speakText(text, rate, pitch, voiceName);
    setActiveSpeechText(null);
  };

  const handleClaimXp = () => {
    if (!studyRewardClaimed) {
      onRewardXp(30); // Reward 30 XP
      setStudyRewardClaimed(true);
    }
  };

  // Label tags for Term books mapping
  const getTaskBookLabel = (taskId: string) => {
    const idNum = parseInt(taskId);
    if (idNum <= 8) {
      return { text: "上册 Term 1", color: "bg-blue-50 text-blue-600 border-blue-100" };
    } else {
      return { text: "下册 Term 2", color: "bg-purple-50 text-purple-600 border-purple-100" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6" id="textbook-writing-coach-view">
      
      {/* Navigation and Top Information Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl transition cursor-pointer text-slate-500 hover:text-slate-800"
            id="back-to-syllabus-btn"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <BookOpen className="text-[#4F7CFF]" size={22} />
              🎯 教材同步写作 · Textbook Writing Coach
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">
              上海中考满分作文标准 · Shanghai Education Curriculum Writing Matrix & High Score Synthesizer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#F0F4FF] border border-blue-100 px-3 py-1.5 rounded-full text-[#4F7CFF] font-mono text-xs font-black">
            <span>🏆 成长值: {experiencePoints} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Section selecting syllabus writing titles & textbook guide panels */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-5 space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest block">
              1. Choose a Writing Task (选择写作题目)
            </label>
            
            {/* Textbook Switcher Tabs */}
            <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-2xl border border-slate-150" id="textbook-switcher">
              <button
                type="button"
                onClick={() => handleBookChange('upper')}
                className={`py-2 px-3 rounded-xl text-center text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  selectedBook === 'upper'
                    ? 'bg-white text-blue-600 shadow-xs font-black border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="switcher-upper-btn"
              >
                <span>📘</span>
                <span>Upper Book (上册 1-8)</span>
              </button>
              <button
                type="button"
                onClick={() => handleBookChange('lower')}
                className={`py-2 px-3 rounded-xl text-center text-xs font-black cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  selectedBook === 'lower'
                    ? 'bg-white text-emerald-600 shadow-xs font-black border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                id="switcher-lower-btn"
              >
                <span>📗</span>
                <span>Lower Book (下册 9-13)</span>
              </button>
            </div>

            <div className="relative">
              <select
                value={selectedTaskId}
                onChange={(e) => handleTaskChange(e.target.value)}
                className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#4F7CFF] focus:border-transparent cursor-pointer appearance-none"
                id="writing-task-selector"
              >
                {WRITING_TASKS.filter(task => {
                  const idNum = parseInt(task.id);
                  return selectedBook === 'upper' ? idNum <= 8 : idNum > 8;
                }).map(task => {
                  const book = getTaskBookLabel(task.id);
                  return (
                    <option key={task.id} value={task.id} className="font-bold">
                      [{book.text.substring(0,2)}] Unit {task.id} · {task.title}
                    </option>
                  );
                })}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                ▼
              </div>
            </div>

            {/* Micro Badge info mapping the selection */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className={`px-2.5 py-0.5 text-[10px] font-black border rounded-full ${getTaskBookLabel(selectedTask.id).color}`}>
                {getTaskBookLabel(selectedTask.id).text}
              </span>
              <span className="bg-slate-50 border border-slate-100 text-slate-500 font-bold px-2.5 py-0.5 text-[10px] rounded-full uppercase">
                {selectedTask.topic}
              </span>
            </div>
          </div>

          {/* Standard Guidebook Board */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-100 px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="text-[#4F7CFF]" size={18} />
                <h2 className="text-xs font-black text-slate-900 tracking-wider uppercase">
                  Textbook Reference Sheet (中考考纲蓝皮书原案)
                </h2>
              </div>
              <span className="text-[9px] font-black tracking-widest text-[#4F7CFF] bg-blue-50 px-2 py-0.5 rounded-md uppercase">
                Official Standards
              </span>
            </div>

            <div className="p-5 space-y-5 max-h-[580px] overflow-y-auto custom-scrollbar">
              
              {/* Structure Section */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-dashed border-slate-150 pb-1.5 pt-0.5">
                  <span className="text-[#4F7CFF]">📌</span>
                  Writing Format Structure / 段落行文大纲
                </h3>
                <div className="space-y-2 pl-1">
                  {selectedTask.structure.map((step, i) => (
                    <div key={i} className="flex gap-2.5 text-xs text-slate-600 leading-relaxed font-semibold">
                      <span className="flex-shrink-0 w-5 h-5 bg-blue-50 text-[#4F7CFF] rounded-full flex items-center justify-center font-bold text-[10px]">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Useful Sentence Patterns */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-dashed border-slate-150 pb-1.5">
                  <span className="text-[#7A5CFF]">✨</span>
                  Useful Sentence Patterns / 推荐必背起承句式
                </h3>
                <div className="space-y-1.5 pl-1">
                  {selectedTask.usefulPatterns.map((pattern, i) => (
                    <div key={i} className="bg-slate-50/50 border-l-2 border-indigo-200 p-2 text-[11px] font-mono font-semibold text-slate-600 select-all leading-normal">
                      {pattern}
                    </div>
                  ))}
                </div>
              </div>

              {/* High-Score Expressions */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-dashed border-slate-150 pb-1.5">
                  <span className="text-[#FFB648]">🎯</span>
                  High-Score Word Piles / 提分高星考点词汇
                </h3>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {selectedTask.highScoreExpressions.map((item, i) => (
                    <div key={i} className="group relative bg-[#FFF9EE] border border-[#FFE8C4] hover:border-amber-400 px-2.5 py-1 rounded-xl text-[10px] font-bold text-amber-900 transition-all cursor-help flex items-center gap-1">
                      <span>{item.phrase}</span>
                      <span className="text-amber-500 font-normal">({item.meaning})</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Model Paragraph */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-dashed border-slate-150 pb-1.5">
                  <span className="text-emerald-500">📖</span>
                  Syllabus Model Essay Draft / 课内同步标准示范作
                </h3>
                <div className="relative bg-emerald-50/20 border border-emerald-100 rounded-2xl p-3 text-xs leading-relaxed font-semibold text-emerald-950">
                  <p className="select-all">{selectedTask.modelParagraph}</p>
                  
                  <div className="mt-2 text-right">
                    <button
                      onClick={() => handleSpeakText(selectedTask.modelParagraph)}
                      className="p-1 px-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-800 rounded-lg text-[9px] font-black inline-flex items-center gap-1 transition-all cursor-pointer"
                    >
                      {activeSpeechText === selectedTask.modelParagraph ? (
                        <>
                          <VolumeX size={10} className="animate-pulse" />
                          Stop
                        </>
                      ) : (
                        <>
                          <Volume2 size={10} />
                          Listen (同步音轨)
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Common Mistakes */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-dashed border-slate-150 pb-1.5">
                  <span className="text-rose-500">⚠️</span>
                  High-risk Common Mistakes / 中考丢分高频误区
                </h3>
                <div className="space-y-2 pl-1.5 text-[11px] font-semibold text-slate-500">
                  {selectedTask.commonMistakes.map((mistake, i) => (
                    <div key={i} className="flex gap-2 bg-rose-50/40 border border-rose-100 p-2.5 rounded-xl text-rose-900">
                      <AlertTriangle size={15} className="text-rose-500 flex-shrink-0" />
                      <span>{mistake}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Writing Tips */}
              <div className="space-y-2 pt-2">
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5 border-b border-dashed border-slate-150 pb-1.5">
                  <span className="text-teal-500">💡</span>
                  Writing Tips / 名师精选高分技巧
                </h3>
                <ul className="space-y-1.5 pl-1 text-[11px] font-semibold text-slate-600">
                  {selectedTask.writingTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#4F7CFF] mt-0.5">•</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: The Interactive Essay Generator with student Chinese thoughts */}
        <div className="lg:col-span-7 space-y-6">
          
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-xs p-6 space-y-5">
            <div>
              <h2 className="text-base font-extrabold text-[#1e293b] flex items-center gap-2">
                <span>⚡</span>
                AI Exam-Style Materials Generator / 沪教版专属AI智脑写作
              </h2>
              <p className="text-xs font-medium text-slate-450 mt-1 leading-relaxed">
                Enter your basic writing ideas in simple Chinese below. The AI English teacher will customize an exclusive outline, standard essay,提分升级版本 and annotated exam answers in seconds!
              </p>
            </div>

            {/* Quick Ideas Picker */}
            {QUICK_IDEAS_TEMPLATES[selectedTask.id] && (
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                  💡 Ideas Inspiration (灵感速选，点击直接导入)
                </span>
                <div className="flex flex-col gap-1.5">
                  {QUICK_IDEAS_TEMPLATES[selectedTask.id].map((quickIdea, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setChineseInput(quickIdea);
                        handleGenerateCoach(quickIdea);
                      }}
                      className="w-full text-left p-2.5 bg-slate-50 border border-slate-100 hover:bg-indigo-50/30 hover:border-indigo-200 rounded-xl text-[11px] text-slate-600 font-semibold cursor-pointer transition-all flex items-center justify-between gap-2"
                    >
                      <span className="truncate">{quickIdea}</span>
                      <ChevronRight size={12} className="text-[#4F7CFF] shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Manual user thought field */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                ✍️ Write ideas in Chinese / 键入你的中文草案想法
              </span>
              <textarea
                value={chineseInput}
                onChange={(e) => setChineseInput(e.target.value)}
                placeholder="例如：写关于马可波罗的导游。他是个非常有冒险精神的探险家..."
                className="w-full min-h-[100px] max-h-[180px] p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl text-xs font-bold leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#4F7CFF] focus:border-transparent focus:bg-white transition-all resize-y"
                id="student-chinese-ideas"
              />
            </div>

            <div className="flex justify-between items-center gap-4">
              <button
                onClick={() => handleGenerateCoach()}
                disabled={loading || !chineseInput.trim()}
                className={`py-3.5 px-6 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all duration-300 cursor-pointer ${
                  loading || !chineseInput.trim()
                    ? 'bg-slate-100 border border-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#4F7CFF] to-[#7A5CFF] hover:opacity-95 text-white shadow-blue-100 hover:shadow-lg hover:shadow-blue-200'
                }`}
                id="generate-materials-btn"
              >
                {loading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Analyzing & Polishing...</span>
                  </>
                ) : (
                  <>
                    <PenTool size={15} />
                    <span>Generate Outline & Standard + High-Score Materials (一键提炼中考满分作文)</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 px-4 py-3 rounded-2xl flex items-start gap-2.5 text-xs text-red-805" id="assist-error-msg">
                <AlertTriangle size={15} className="text-red-500 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">{error}</span>
              </div>
            )}
          </div>

          {/* GENERATION RESULTS BOX */}
          <AnimatePresence mode="wait">
            
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-xs p-8 flex flex-col items-center justify-center text-center space-y-4"
              >
                <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-[#4F7CFF] relative">
                  <Loader2 size={26} className="animate-spin" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h3 className="text-sm font-extrabold text-[#1e293b]">AI Writing Assistant is designing your templates...</h3>
                  <p className="text-[11px] text-slate-400 font-bold leading-normal mt-1">
                    Incorporating your thoughts into Shanghai Grade 9 curriculum standards. Polishing verb vocabulary, complex logic links, and annotated classroom notes.
                  </p>
                </div>
              </motion.div>
            )}

            {result && !loading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[32px] border border-slate-100 shadow-xs overflow-hidden space-y-0"
              >
                
                {/* Fallback Warning Flag */}
                {isQuotaFallback && (
                  <div className="bg-amber-50/80 border-b border-amber-100 px-5 py-3 flex items-center gap-3 text-xs text-amber-800" id="quota-fallback-alert">
                    <span>⚠️</span>
                    <span className="font-semibold">
                      Currently running in local backup mode due to high AI traffic. (AI大模型满载，已为您唤醒上海中考真题备用库，生成内容依然完全契合中考范畴)
                    </span>
                  </div>
                )}

                {/* Section tabs for Step Workflow of student */}
                <div className="bg-slate-50 border-b border-slate-100 p-2.5 flex flex-wrap gap-1">
                  <button
                    onClick={() => setActiveTab('outline')}
                    className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-center text-[10px] sm:text-xs font-black cursor-pointer transition-all ${
                      activeTab === 'outline'
                        ? 'bg-white text-[#4F7CFF] shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📋 Outline 提纲
                  </button>
                  <button
                    onClick={() => setActiveTab('composition')}
                    className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-center text-[10px] sm:text-xs font-black cursor-pointer transition-all ${
                      activeTab === 'composition'
                        ? 'bg-white text-[#4F7CFF] shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    📝 Standard 标准版
                  </button>
                  <button
                    onClick={() => setActiveTab('highScore')}
                    className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-center text-[10px] sm:text-xs font-black cursor-pointer transition-all ${
                      activeTab === 'highScore'
                        ? 'bg-white text-[#4F7CFF] shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🚀 High-Score 提分作
                  </button>
                  <button
                    onClick={() => setActiveTab('annotated')}
                    className={`flex-1 min-w-[90px] py-2 px-3 rounded-xl text-center text-[10px] sm:text-xs font-black cursor-pointer transition-all ${
                      activeTab === 'annotated'
                        ? 'bg-white text-[#4F7CFF] shadow-xs font-black'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    🏆 Annotated 点评版
                  </button>
                </div>

                {/* Tab content displays */}
                <div className="p-6 space-y-6">
                  
                  {activeTab === 'outline' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="bg-blue-50/30 border border-blue-100 rounded-2xl p-4 space-y-3.5">
                        <div className="flex items-center gap-1.5 text-xs text-blue-700 font-extrabold">
                          <span>📋</span>
                          <span>Textbook Style Structured Outline (定制提纲架构)</span>
                        </div>
                        <ul className="space-y-3 pl-1 text-xs text-slate-600 font-bold leading-normal">
                          {result.outline.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="w-5 h-5 bg-blue-100 text-[#4F7CFF] rounded-full flex items-center justify-center font-mono text-[9px] font-black shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="leading-relaxed font-semibold">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'composition' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          📝 Standard textbook-style Essay (80-100 Words)
                        </span>
                        
                        <div className="bg-slate-50 border border-slate-1.50 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-slate-755 whitespace-pre-wrap select-all">
                          {result.composition}
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2.5">
                        <button
                          onClick={() => handleSpeakText(result.composition)}
                          className="py-2 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[#4F7CFF] rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {activeSpeechText === result.composition ? (
                            <>
                              <VolumeX size={14} className="animate-pulse" />
                              Stop Speaking (静音)
                            </>
                          ) : (
                            <>
                              <Volume2 size={14} />
                              Listen Standard Vocals (听标准朗读)
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyToClipboard(result.composition, "comp")}
                          className="py-2 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedText === "comp" ? (
                            <>
                              <Check size={14} className="text-green-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Text (复制段落)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'highScore' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                            🚀 Score-Maximizing Enhanced Essay (95-115 Words)
                          </span>
                          <span className="text-[10px] bg-indigo-50 border border-indigo-150 text-indigo-750 px-2.5 py-0.5 rounded-full font-black">
                            Perfect Goal Marks (满分加分版)
                          </span>
                        </div>
                        
                        <div className="bg-indigo-50/10 border border-indigo-100 rounded-2xl p-4 text-xs font-semibold leading-relaxed text-slate-755 whitespace-pre-wrap select-all">
                          {result.highScoreVersion}
                        </div>
                      </div>

                      <div className="flex justify-between items-center gap-2.5">
                        <button
                          onClick={() => handleSpeakText(result.highScoreVersion)}
                          className="py-2 px-4 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {activeSpeechText === result.highScoreVersion ? (
                            <>
                              <VolumeX size={14} className="animate-pulse" />
                              Stop Speaking (静音)
                            </>
                          ) : (
                            <>
                              <Volume2 size={14} />
                              Listen Premium Speech (听纯正英音)
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => copyToClipboard(result.highScoreVersion, "hscore")}
                          className="py-2 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedText === "hscore" ? (
                            <>
                              <Check size={14} className="text-green-500" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Text (复制作文)</span>
                            </>
                          )}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'annotated' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="space-y-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                          🏆 Interactive Score Highlights & Explains (加分句式与语法高保点评)
                        </span>
                        
                        <div className="bg-slate-50/60 border border-slate-250 rounded-2xl p-4 text-xs font-semibold leading-loose text-slate-755 whitespace-pre-wrap selection:bg-indigo-100">
                          {/* Securely injecting HTML tags that render colored explains next to text */}
                          <div 
                            dangerouslySetInnerHTML={{ __html: result.modelAnswer }}
                            className="prose max-w-none text-slate-700 leading-relaxed font-semibold"
                          />
                        </div>
                      </div>

                      <div className="bg-amber-50/40 p-3 rounded-xl border border-amber-100 text-[10px] text-amber-700 font-bold leading-normal">
                        💡 名师提示：点击或阅览上方英文字段中的彩色标签（如“句式亮点”、“核心词组”、“高分表达”），可一目了然中考作文加分维度，帮助你加深逻辑记忆！
                      </div>
                    </motion.div>
                  )}

                  {/* Motivational Teacher Tips */}
                  {result.tips && result.tips.length > 0 && (
                    <div className="border-t border-slate-100 pt-5 space-y-2.5">
                      <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest block flex items-center gap-1">
                        <Lightbulb size={12} className="text-[#FFB648] fill-amber-200" />
                        AI Coach Writing Tips (本篇专属高分精讲)
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {result.tips.map((tip, idx) => (
                          <div key={idx} className="bg-slate-50/50 border border-slate-100/80 p-3 rounded-2xl text-[11px] font-bold text-slate-650 flex items-start gap-2">
                            <span className="text-amber-500 text-sm mt-0.5">•</span>
                            <span>{tip}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gamification claim bottom rewards panel */}
                  <div className="border-t border-slate-100 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-50 text-[#7A5CFF] rounded-xl flex items-center justify-center font-bold text-lg">
                        🏆
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-black text-slate-800">Complete Writing Session Academic Point</h4>
                        <p className="text-[10px] text-slate-400 font-bold">Earn +30 XP for analyzing structures and reading aloud.</p>
                      </div>
                    </div>

                    <button
                      onClick={handleClaimXp}
                      disabled={studyRewardClaimed}
                      className={`py-2 px-5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                        studyRewardClaimed
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-none cursor-default'
                          : 'bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 text-[#7A5CFF] shadow-xs'
                      }`}
                    >
                      {studyRewardClaimed ? (
                        <>
                          <CheckCircle size={14} className="text-emerald-500" />
                          <span>XP Claimed (+30 XP 成功发放)</span>
                        </>
                      ) : (
                        <>
                          <Award size={14} />
                          <span>Claim Rewards (+30 XP 领取积分)</span>
                        </>
                      )}
                    </button>
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
