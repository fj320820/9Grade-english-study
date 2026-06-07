// Custom Speech & Audio management for the Spoken English Coach

export interface VoiceOption {
  name: string;
  lang: string;
  voice: SpeechSynthesisVoice;
}

export interface CoachProfile {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  accent: 'British' | 'American';
  age: number;
  nationality: string;
  description: string;
  greeting: string;
}

export const COACH_PROFILES: CoachProfile[] = [
  {
    id: 'david',
    name: 'David',
    gender: 'Male',
    accent: 'British',
    age: 29,
    nationality: 'British',
    description: 'Friendly, patient and humorous native British ESL coach.',
    greeting: "Hello! I'm David. Let's practice English together today."
  },
  {
    id: 'emma',
    name: 'Emma',
    gender: 'Female',
    accent: 'British',
    age: 27,
    nationality: 'British',
    description: 'Warm, encouraging & clear spoken native British tutor.',
    greeting: "Hello, my friend! I'm Emma. I'm so excited to help you naturally express your thoughts in English."
  },
  {
    id: 'jack',
    name: 'Jack',
    gender: 'Male',
    accent: 'American',
    age: 28,
    nationality: 'American',
    description: 'Energetic, supportive and fun spoken American English specialist.',
    greeting: "Hey there! I'm Jack. Let's boost your English speaking speed and make it super fun!"
  },
  {
    id: 'lucy',
    name: 'Lucy',
    gender: 'Female',
    accent: 'American',
    age: 26,
    nationality: 'American',
    description: 'Structure-focused, bright, and helpful spoken coach for exams.',
    greeting: "Hi! I'm Lucy. Let's master the key exam structures and speak with absolute confidence."
  }
];

// Helper to intelligently estimate the gender of a device voice from its name
export function estimateGender(voiceName: string): 'Male' | 'Female' | 'Neutral' {
  const lower = voiceName.toLowerCase();
  
  // High-priority male lookups
  if (
    lower.includes('ryan') || 
    lower.includes('guy') || 
    lower.includes('david') || 
    lower.includes('george') || 
    lower.includes('ravi') || 
    lower.includes('richard') ||
    lower.includes('daniel') ||
    lower.includes('james') ||
    lower.includes('john') ||
    lower.includes('robert') ||
    lower.includes('michael') ||
    lower.includes('william') ||
    lower.includes('joseph') ||
    lower.includes('thomas') ||
    lower.includes('charles')
  ) {
    return 'Male';
  }

  // High-priority female lookups
  if (
    lower.includes('samantha') || 
    lower.includes('zira') || 
    lower.includes('hazel') || 
    lower.includes('susan') || 
    lower.includes('lisa') || 
    lower.includes('heera') || 
    lower.includes('emma') || 
    lower.includes('lucy') ||
    lower.includes('victoria') ||
    lower.includes('karen') ||
    lower.includes('moira') ||
    lower.includes('tessa') ||
    lower.includes('fiona') ||
    lower.includes('emily') ||
    lower.includes('anna') ||
    lower.includes('serena') ||
    lower.includes('sarah') ||
    lower.includes('elizabeth')
  ) {
    return 'Female';
  }

  if (lower.includes('male') && !lower.includes('female')) {
    return 'Male';
  }
  if (lower.includes('female')) {
    return 'Female';
  }

  // Fallback
  return 'Neutral';
}

// Logic to auto-match the best voice for David or other coaches from available hardware voice profiles
export function getAutoMatchedVoiceForCoach(coachId: string, voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const englishVoices = voices.filter(v => {
    const langLower = v.lang.toLowerCase();
    const nameLower = v.name.toLowerCase();
    const isEnglish = langLower.startsWith('en');
    const isChinese = langLower.includes('zh') || langLower.includes('cn') || 
                      nameLower.includes('chinese') || nameLower.includes('china') || 
                      /[\u4e00-\u9fa5]/.test(v.name);
    return isEnglish && !isChinese;
  });
  
  if (englishVoices.length === 0) return null;

  if (coachId === 'david') {
    // 1. Google UK English Male (GB)
    const googleUkMale = englishVoices.find(v => {
      const lower = v.name.toLowerCase();
      return lower.includes('google uk english male') || 
             (lower.includes('google') && lower.includes('uk') && lower.includes('english') && lower.includes('male'));
    });
    if (googleUkMale) return googleUkMale;

    // 2. Any Male English Voice (Must not be female or neutral)
    const maleVoices = englishVoices.filter(v => estimateGender(v.name) === 'Male');
    if (maleVoices.length > 0) {
      const priorityNames = [
        'microsoft ryan',
        'microsoft guy',
        'microsoft david',
        'google us english male'
      ];
      for (const name of priorityNames) {
        const found = maleVoices.find(v => v.name.toLowerCase().includes(name));
        if (found) return found;
      }
      return maleVoices[0];
    }

    // 3. Fallback (Do not stop application; use closest available English voice)
    const fallback = englishVoices.find(v => v.lang.toLowerCase() === 'en-gb' || v.lang.toLowerCase() === 'en-us') || englishVoices[0];
    return fallback || null;
  }

  if (coachId === 'jack') {
    // Jack is American Male
    const jackMale = englishVoices.find(v => {
      const lower = v.name.toLowerCase();
      return lower.includes('google us english male') || lower.includes('microsoft ryan') || lower.includes('microsoft guy') || lower.includes('microsoft david');
    });
    if (jackMale) return jackMale;

    const maleVoices = englishVoices.filter(v => estimateGender(v.name) === 'Male');
    if (maleVoices.length > 0) return maleVoices[0];

    const fallback = englishVoices.find(v => v.lang.toLowerCase() === 'en-us' || v.lang.toLowerCase() === 'en-gb') || englishVoices[0];
    return fallback || null;
  }

  // Emma or Lucy (Female Coaches)
  // Emma is British, Lucy is American
  const isLucy = coachId === 'lucy';
  const priorityFemaleKeys = isLucy 
    ? ['google us english female', 'samantha', 'lucy', 'fiona', 'karen']
    : ['google uk english female', 'emma', 'zira', 'hazel', 'samantha'];

  for (const key of priorityFemaleKeys) {
    const found = englishVoices.find(v => v.name.toLowerCase().includes(key));
    if (found) return found;
  }

  const femaleVoices = englishVoices.filter(v => estimateGender(v.name) === 'Female');
  if (femaleVoices.length > 0) return femaleVoices[0];

  const fallback = englishVoices.find(v => v.lang.toLowerCase() === (isLucy ? 'en-us' : 'en-gb')) || englishVoices[0];
  return fallback || null;
}

// Speak aloud using standard Web Speech API with advanced customizations
export function speakText(
  text: string, 
  rate: number = 0.9, 
  pitch: number = 1.0, 
  voiceName?: string
): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    // Cancel active speakers
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    const voices = window.speechSynthesis.getVoices();
    let preferredVoice: SpeechSynthesisVoice | null = null;

    if (voiceName) {
      preferredVoice = voices.find(v => v.name === voiceName) || null;
    }

    // If no specified voice was found, fall back to default logic
    if (!preferredVoice) {
      preferredVoice = voices.find(
        v => (v.lang === 'en-US' || v.lang === 'en-GB') && 
             (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Daniel'))
      ) || voices.find(v => v.lang.startsWith('en')) || null;
    }

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.rate = rate; 
    utterance.pitch = pitch;

    utterance.onend = () => {
      resolve();
    };

    utterance.onerror = () => {
      resolve();
    };

    window.speechSynthesis.speak(utterance);
  });
}

// Stop any speaking voices
export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Start browser-based speech recognition
export class SpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;

  constructor(
    private onResult: (text: string, isFinal: boolean) => void,
    private onError: (err: any) => void,
    private onEnd: () => void
  ) {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        // Return best guess
        if (finalTranscript) {
          this.onResult(finalTranscript, true);
        } else if (interimTranscript) {
          this.onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.onError(event);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.onEnd();
      };
    }
  }

  public isSupported(): boolean {
    return this.recognition !== null;
  }

  public start() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
      } catch (e) {
        console.error("Failed to start speech recognition:", e);
      }
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.error("Failed to stop speech recognition:", e);
      }
    }
  }
}
