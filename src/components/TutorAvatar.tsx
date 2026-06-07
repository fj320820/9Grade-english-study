import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, MessageCircle, Mic, HelpCircle } from 'lucide-react';
import davidAvatar from '../assets/images/david_avatar_1780806776632.png';

interface TutorAvatarProps {
  status: 'idle' | 'speaking' | 'listening' | 'reflecting';
  speakingRate?: number;
  coachId?: string;
}

const COACH_INFO = {
  david: {
    name: 'David',
    title: 'Native British Coach',
    accent: 'British Accent',
    flag: '🇬🇧'
  },
  emma: {
    name: 'Emma',
    title: 'Friendly Native Tutor',
    accent: 'British Accent',
    flag: '🇬🇧'
  },
  jack: {
    name: 'Jack',
    title: 'American Spoken Coach',
    accent: 'American Accent',
    flag: '🇺🇸'
  },
  lucy: {
    name: 'Lucy',
    title: 'Academic Exam Expert',
    accent: 'American Accent',
    flag: '🇺🇸'
  }
};

export default function TutorAvatar({ status, speakingRate = 0.9, coachId = 'david' }: TutorAvatarProps) {
  const coach = COACH_INFO[coachId as keyof typeof COACH_INFO] || COACH_INFO.david;

  // Glow background or border style based on state
  const getStatusColor = () => {
    switch (status) {
      case 'speaking':
        return 'ring-4 ring-blue-400 border-indigo-500 shadow-blue-300';
      case 'listening':
        return 'ring-4 ring-green-400 border-emerald-500 shadow-green-300 animate-pulse';
      case 'reflecting':
        return 'ring-4 ring-amber-400 border-amber-500 shadow-amber-200';
      default:
        return 'ring-2 ring-gray-100 border-gray-200 shadow-gray-100';
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'speaking':
        return `${coach.name} is speaking...`;
      case 'listening':
        return 'Tap mic & reply in English!';
      case 'reflecting':
        return `${coach.name} is listening closely...`;
      default:
        return `${coach.name} is ready`;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'speaking':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 animate-bounce">
            <MessageCircle size={13} className="animate-pulse" />
            Speaking (正在说话...)
          </span>
        );
      case 'listening':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
            <Mic size={13} className="animate-ping" />
            Listening (等你想说...)
          </span>
        );
      case 'reflecting':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
            <Sparkles size={13} className="animate-spin" />
            Reflecting ({coach.name}思考中...)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
            <HelpCircle size={13} />
            Idle (准备就绪)
          </span>
        );
    }
  };

  // Render the coach's customized high-fidelity avatar representation
  const renderCoachAvatar = () => {
    if (coachId === 'david') {
      return (
        <img 
          src={davidAvatar} 
          alt="David Coach Avatar" 
          className="w-full h-full object-cover pointer-events-none"
          referrerPolicy="no-referrer"
        />
      );
    }

    if (coachId === 'emma') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none">
          <defs>
            <linearGradient id="emmaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FECDD3" />
              <stop offset="100%" stopColor="#EDA8FF" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#emmaGrad)" />
          <circle cx="50" cy="22" r="14" fill="#EAB308" />
          <path d="M 50 42 L 50 56 Z" stroke="#FDBA74" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="40" r="17" fill="#FED7AA" />
          <path d="M 33 40 C 33 26 67 26 67 40 C 67 25 33 25 33 40 Z" fill="#EAB308" />
          <circle cx="44" cy="38" r="1.8" fill="#1E293B" />
          <circle cx="56" cy="38" r="1.8" fill="#1E293B" />
          <circle cx="44" cy="38" r="4.5" fill="none" stroke="#EF4444" strokeWidth="1.2" />
          <circle cx="56" cy="38" r="4.5" fill="none" stroke="#EF4444" strokeWidth="1.2" />
          <line x1="48.5" y1="38" x2="51.5" y2="38" stroke="#EF4444" strokeWidth="1.2" />
          <path d="M 45 46 Q 50 49 55 46" fill="none" stroke="#E11D48" strokeWidth="2" strokeLinecap="round" />
          <path d="M 30 68 C 30 56 70 56 70 68 Z" fill="#3B82F6" />
          <path d="M 50 56 L 43 68 L 57 68 Z" fill="#FFFFFF" />
          <text x="74" y="80" fontSize="16">🇬🇧</text>
        </svg>
      );
    }

    if (coachId === 'jack') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none">
          <defs>
            <linearGradient id="jackGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="100%" stopColor="#065F46" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#jackGrad)" />
          <path d="M 50 44 L 50 56 Z" stroke="#FDBA74" strokeWidth="7" strokeLinecap="round" />
          <circle cx="50" cy="38" r="17" fill="#FDBA74" />
          <path d="M 32 35 Q 50 18 68 35" stroke="#78350F" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M 32 30 C 32 18 68 18 68 30 Z" fill="#1E40AF" />
          <path d="M 26 30 L 46 26 Z" stroke="#1E40AF" strokeWidth="4" strokeLinecap="round" />
          <circle cx="43" cy="38" r="2" fill="#1E293B" />
          <circle cx="57" cy="38" r="2" fill="#1E293B" />
          <path d="M 44 47 Q 50 50 56 47" fill="none" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 28 72 C 28 58 72 58 72 72 Z" fill="#F59E0B" />
          <text x="74" y="80" fontSize="16">🇺🇸</text>
        </svg>
      );
    }

    if (coachId === 'lucy') {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full select-none">
          <defs>
            <linearGradient id="lucyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="50" fill="url(#lucyGrad)" />
          <circle cx="34" cy="46" r="10" fill="#451A03" />
          <circle cx="66" cy="46" r="10" fill="#451A03" />
          <path d="M 50 44 L 50 56 Z" stroke="#FED7AA" strokeWidth="6" strokeLinecap="round" />
          <circle cx="50" cy="39" r="16.5" fill="#FED7AA" />
          <path d="M 33 39 C 33 24 67 24 67 39 C 67 22 33 22 33 39 Z" fill="#451A03" />
          <rect x="36" y="28" width="6" height="2" fill="#3B82F6" rx="0.5" />
          <rect x="58" y="28" width="6" height="2" fill="#10B981" rx="0.5" />
          <circle cx="43" cy="38" r="1.8" fill="#1E293B" />
          <circle cx="57" cy="38" r="1.8" fill="#1E293B" />
          <path d="M 44 46 Q 50 49 56 46" fill="none" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 28 72 C 28 58 72 58 72 72 Z" fill="#EC4899" />
          <circle cx="50" cy="62" r="3" fill="#FFFFFF" />
          <text x="74" y="80" fontSize="16">🇺🇸</text>
        </svg>
      );
    }
    
    return null;
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Container with dynamic surrounding wave rings */}
      <div className="relative flex items-center justify-center p-3">
        {status === 'speaking' && (
          <>
            <span className="absolute inline-flex h-28 w-28 rounded-full bg-blue-400 opacity-20 animate-ping"></span>
            <span className="absolute inline-flex h-36 w-36 rounded-full bg-indigo-300 opacity-10 animate-pulse"></span>
          </>
        )}
        {status === 'listening' && (
          <>
            <span className="absolute inline-flex h-28 w-28 rounded-full bg-emerald-400 opacity-25 animate-ping"></span>
            <span className="absolute inline-flex h-36 w-36 rounded-full bg-green-300 opacity-15 animate-pulse"></span>
          </>
        )}

        {/* Coach Portrait card */}
        <motion.div 
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-white border-2 transition-all duration-300 shadow-lg ${getStatusColor()}`}
          whileHover={{ scale: 1.05 }}
          layout
        >
          {renderCoachAvatar()}
        </motion.div>

        {/* Decorative elements */}
        {status === 'speaking' && (
          <motion.div 
            className="absolute top-1 right-2 z-20 bg-blue-500 text-white rounded-full p-1.5 shadow-md"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <span className="text-[10px] font-mono">🔊</span>
          </motion.div>
        )}
      </div>

      <div className="mt-2 text-center w-fullpx-4">
        <h3 className="font-bold text-gray-800 text-base sm:text-lg flex items-center justify-center gap-1">
          <span>Coach {coach.name}</span>
          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full whitespace-nowrap">
            {coach.flag} {coach.title}
          </span>
        </h3>
        <p className="text-[11px] text-gray-500 mt-0.5 font-medium italic">{getStatusTitle()}</p>
        <div className="mt-2 flex justify-center">
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
}
