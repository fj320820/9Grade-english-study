import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { WRITING_TASKS } from "./src/data/writingTasks";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

/**
 * Robust recovery database and simulated generator in case of Gemini API Quota Exhaustion / Key Exceeded Errors
 */
const RECOVERY_QUESTION_BANKS: Record<string, string[]> = {
  "Wise Men in History": [
    "Do you like history, and who is the wisest person in history?",
    "What can we learn from famous historical people?",
    "Why are inventions important, and would you like to become a scientist?",
    "That is so interesting. How do inventions change our lives today?"
  ],
  "Great Minds": [
    "Do you prefer texting or calling people when you make phone calls?",
    "What important information should a phone message include?",
    "How do you prefer to keep in touch with your friends?",
    "That makes a lot of sense. Do you agree that calling is more polite than texting?"
  ],
  "Family Life": [
    "Should teenagers help with housework at home?",
    "What is your favorite family activity on weekends?",
    "How can family members help and support each other?",
    "Wonderful. How do you normally express your love to your parents?"
  ],
  "Problems and Advice": [
    "What major problems do high school students face today?",
    "Do you feel stressed sometimes, and how do you deal with stress?",
    "Who gives you the best advice when you have problems?",
    "Classmates can be a big help. What advice would you give a classmate who is stressed?"
  ],
  "Action!": [
    "What kinds of movies do you like best, and who is your favorite actor?",
    "How often do you watch movies with your friends or family?",
    "What makes a movie exciting and interesting to watch?",
    "That sounds fun. If you could act in a movie, what role would you want to play?"
  ],
  "Healthy Diet": [
    "What is your favorite food, and do you eat healthy food every day?",
    "What should teenagers eat more often to stay active?",
    "Why is breakfast important for our energy at school?",
    "Eating well is so vital. Do you prefer home-cooked food or fast food?"
  ],
  "The Adventures of Tom Sawyer": [
    "Do you enjoy reading storybooks in your free time?",
    "Who is your favorite character in literature?",
    "What adventure would you most like to have?",
    "That is exciting. Why did you choose that adventure?"
  ],
  "Surprise Endings": [
    "Do you enjoy stories with surprise endings?",
    "Can people have different opinions about the same story?",
    "How do you usually disagree with someone in a polite way?"
  ],
  "Great Explorations": [
    "Who is your favorite explorer from history?",
    "Would you like to travel around the world in the future?",
    "Why do you think explorers are so brave?"
  ],
  "Culture Shock": [
    "What cultural differences do you know between China and western countries?",
    "Would you like to study abroad, and why or why not?",
    "Meeting new cultures is amazing. What culture would you like to explore first?"
  ],
  "The Environment": [
    "What major environmental problems do we have in our cities?",
    "How can school students protect local environment and recycle?",
    "Do you think changing small daily habits can save the Earth?"
  ],
  "Natural Disasters": [
    "What should we do to stay safe during emergencies like typhoons or earthquakes?",
    "How do you stay calm when a natural disaster happens?",
    "Helping others is key. How can we help after a disaster?"
  ],
  "Sport": [
    "What is your favorite sport, and how often do you exercise?",
    "Why is sports play and physical fitness important for teenagers?",
    "That is awesome. Do you prefer watching sports or playing them?"
  ],
  "Caring for Your Health": [
    "How do you stay healthy in your daily school life?",
    "How much sleep do you get, and what healthy habits do you have?",
    "What is the best way to relax our bodies after a busy day?"
  ]
};

const RECOVERY_QUESTION_TRANSLATIONS: Record<string, string> = {
  "Do you like history, and who is the wisest person in history?": "你喜欢历史吗？历史上谁是最聪明的人？",
  "What can we learn from famous historical people?": "我们能从著名的历史人物身上学到什么？",
  "Why are inventions important, and would you like to become a scientist?": "为什么发明很重要？你未来想成为一名科学家吗？",
  "That is so interesting. How do inventions change our lives today?": "这太有趣了。发明是如何改变我们今天的生活的？",
  "Do you prefer texting or calling people when you make phone calls?": "打电话时你更喜欢发短信还是直接通电话呢？",
  "What important information should a phone message include?": "电话留言通常应该包含哪些重要信息？",
  "How do you prefer to keep in touch with your friends?": "你更倾向于用哪种方式和你的朋友保持联系？",
  "That makes a lot of sense. Do you agree that calling is more polite than texting?": "这很有道理。你觉得打电话比发短信更礼貌吗？",
  "Should teenagers help with housework at home?": "青少年应该在家里帮忙做家务吗？",
  "What is your favorite family activity on weekends?": "周末你最喜欢的家庭活动是什么？",
  "How can family members help and support each other?": "家庭成员之间该怎么互相帮助和支持对方呢？",
  "Wonderful. How do you normally express your love to your parents?": "太好了。你平时通常怎么向父母表达你的爱意？",
  "What major problems do high school students face today?": "现在的中学生面临的主要问题有哪些？",
  "Do you feel stressed sometimes, and how do you deal with stress?": "你有时会感到有压力吗？你是怎么应对压力的？",
  "Who gives you the best advice when you have problems?": "当你遇到问题时，谁给你最中肯的建议？",
  "Classmates can be a big help. What advice would you give a classmate who is stressed?": "同学们可以提供很大的帮助。你会给有压力的同学提什么建议？",
  "What kinds of movies do you like best, and who is your favorite actor?": "你最喜欢什么类型的电影？你最喜欢的演员是谁？",
  "How often do you watch movies with your friends or family?": "你一般多久和朋友或家人一起看一次电影？",
  "What makes a movie exciting and interesting to watch?": "是什么让一部电影看起来既刺激又有意思？",
  "That sounds fun. If you could act in a movie, what role would you want to play?": "听起来很有趣。如果你可以在电影里演一个角色，你想演什么？",
  "What is your favorite food, and do you eat healthy food every day?": "你最喜欢的食物是什么？你每天都吃健康的食物吗？",
  "What should teenagers eat more often to stay active?": "青少年平时应该多吃点什么来保持活力呢？",
  "Why is breakfast important for our energy at school?": "为什么早餐对我们在学校积累能量这么重要？",
  "Eating well is so vital. Do you prefer home-cooked food or fast food?": "吃得健康太关键了。你更喜欢家里做的菜还是快餐？",
  "Do you enjoy reading storybooks in your free time?": "你在空闲时间喜欢阅读故事书吗？",
  "Who is your favorite character in literature?": "文学作品里你最喜欢哪个角色？",
  "What adventure would you most like to have?": "你最期待拥有哪种奇妙的探险经历？",
  "That is exciting. Why did you choose that adventure?": "好刺激。你为什么会选择这种探险呢？",
  "Do you enjoy stories with surprise endings?": "你喜欢带有出乎意料结局的故事吗？",
  "Can people have different opinions about the same story?": "对于同一个故事，人们会有不同的看法吗？",
  "How do you usually disagree with someone in a polite way?": "你平时怎么委婉又有礼貌地向别人表达不同意见？",
  "Who is your favorite explorer from history?": "历史上你最喜欢的探险家是谁？",
  "Would you like to travel around the world in the future?": "你未来想环游世界吗？",
  "Why do you think explorers are so brave?": "你觉得那些探险家们为什么会这么勇敢呢？",
  "What cultural differences do you know between China and western countries?": "你了解中国和西方国家之间有哪些文化差异吗？",
  "Would you like to study abroad, and why or why not?": "你想出国留学吗？为什么想，或者为什么不想？",
  "Meeting new cultures is amazing. What culture would you like to explore first?": "接触不一样的文化太棒了。你最想最先探索哪种文化？",
  "What major environmental problems do we have in our cities?": "我们的城市里现在有哪些主要的环境问题？",
  "How can school students protect local environment and recycle?": "学校里的学生该如何保护周边环境、做好垃圾回收？",
  "Do you think changing small daily habits can save the Earth?": "你觉得改变日常生活中的微小习惯能拯救地球吗？",
  "What should we do to stay safe during emergencies like typhoons or earthquakes?": "在台风或地震等紧急情况下，我们该怎么做来保持安全？",
  "How do you stay calm when a natural disaster happens?": "在自然灾害发生时，你通常是如何保持镇定的？",
  "Helping others is key. How can we help after a disaster?": "互相帮助是关键。灾后我们可以提供什么帮助？",
  "What is your favorite sport, and how often do you exercise?": "你最喜欢的运动是什么？你一般多久锻炼一次？",
  "Why is sports play and physical fitness important for teenagers?": "为什么多运动和身体健康对于我们青少年这么重要？",
  "That is awesome. Do you prefer watching sports or playing them?": "太赞了。你更喜欢观看体育比赛还是亲自下场玩？",
  "How do you stay healthy in your daily school life?": "你在日常的校园生活中通常是怎么保持健康的？",
  "How much sleep do you get, and what healthy habits do you have?": "你每天睡眠多长时间？你都有哪些健康的生活习惯？",
  "What is the best way to relax our bodies after a busy day?": "在一整天的忙碌学习之后，最好的放松身体的方式是什么？",
  "What is your favorite hobby during your spare time?": "你在课余闲暇时间最喜欢的兴趣爱好是什么？",
  "How do you usually spend your weekends with your friends?": "你通常怎么和朋友们一起度过周末？",
  "Why is learning English important for your future?": "为什么学习英语对于你的未来发展很重要？",
  "That is very interesting. Tell me more about it!": "这非常有趣。快和我多聊聊细节吧！"
};

const FALLBACK_RECOVERY_QUESTIONS = [
  "What is your favorite hobby during your spare time?",
  "How do you usually spend your weekends with your friends?",
  "Why is learning English important for your future?",
  "That is very interesting. Tell me more about it!"
];

interface CoachRecoveryTemplate {
  reactions: string[];
  cnReactions: string[];
  signoffs: string[];
  cnSignoffs: string[];
}

const COACH_RECOVERY_PROFILES: Record<string, CoachRecoveryTemplate> = {
  david: {
    reactions: [
      "Splendid answer! I see what you mean.",
      "Spot on! That is incredibly interesting.",
      "Spot on! I absolutely love your way of thinking.",
      "How fascinating! I think you've explained that brilliantly.",
      "Bloody brilliant! That really put a massive smile on my face."
    ],
    cnReactions: [
      "极好的回答！我明白你的意思啦。",
      "非常太棒了！这真的特别有趣。",
      "说得真准！我非常喜欢你的思考角度。",
      "真让人着迷！我觉得你解释得非常精彩。",
      "太棒了！这真的让我露出了灿烂之笑容。"
    ],
    signoffs: [
      "Tell me,",
      "I'm curious,",
      "By the way,",
      "So tell me,"
    ],
    cnSignoffs: [
      "告诉我，",
      "我很想知道，",
      "顺便问一下，",
      "所以告诉我，"
    ]
  },
  emma: {
    reactions: [
      "Oh, how lovely! That is a truly beautiful perspective.",
      "Splendid! You are doing absolutely fantastically today.",
      "What a wonderful response! I really enjoy your positive thinking.",
      "That is so sweet! I think your explanation is absolutely spot on.",
      "Aww, that's marvellous! I love how you shared that with me."
    ],
    cnReactions: [
      "噢，真好听！这是一个真正美妙的角度。",
      "极好！你今天做得绝对棒极了。",
      "多么美妙的回答！我真的很欣赏你的积极思考。",
      "真甜美！我认为你的解释完全正确。",
      "啊，太棒了！我喜欢你和我分享这些想法。"
    ],
    signoffs: [
      "My dear, tell me,",
      "I'm wondering,",
      "Let me ask you,",
      "So, my dear,"
    ],
    cnSignoffs: [
      "亲爱的，告诉我，",
      "我想知道，",
      "让我问问你，",
      "所以，亲爱的，"
    ]
  },
  jack: {
    reactions: [
      "Oh man, that's absolutely awesome! Way to go!",
      "Totally rad! You completely nailed it with that answer!",
      "Boom! That is a stellar point right there, my friend!",
      "Super cool! I love how you explained that so energeticly!",
      "Fantastic! That is the kind of vibe I'm talking about!"
    ],
    cnReactions: [
      "噢伙计，这绝对太赞了！太棒了！",
      "太炫酷了！这个回答你简直说到了点子上！",
      "棒！这真是一个恒星级别的观点，我的朋友！",
      "超级酷！我太喜欢你充满活力地去解释这个了！",
      "太棒了！这就是我所说的那种氛围！"
    ],
    signoffs: [
      "Yo,",
      "I gotta ask,",
      "Hey,",
      "So tell me,"
    ],
    cnSignoffs: [
      "嘿，",
      "我得问问你，",
      "嗨，",
      "所以告诉我，"
    ]
  },
  lucy: {
    reactions: [
      "Great job! That's a highly clear and structured point.",
      "Excellent! That is exactly the kind of smart answering we need.",
      "Fantastic! You expressed your thoughts very effectively.",
      "Spot on! That's a beautifully precise response for an exam.",
      "Very well done! I love how logical your response is."
    ],
    cnReactions: [
      "做得真棒！这是一个非常清晰且有结构的观点。",
      "优秀！这正是我们需要的那种聪明回答。",
      "太棒了！你非常高效地表达了你的想法。",
      "非常准确！这在考试中简直是完美的回答方式。",
      "做得特别好！我喜欢你的回答充满逻辑性。"
    ],
    signoffs: [
      "Now, let me ask you,",
      "For our progress,",
      "My question is,",
      "Let's move on,"
    ],
    cnSignoffs: [
      "现在，让我问问你，",
      "为了我们的进步，",
      "我的问题是，",
      "让我们继续，"
    ]
  }
};

function getSimulatedChatResponse(coachId: string, messages: any[], unitTitle: string, unitTopic: string) {
  const coachRecovery = COACH_RECOVERY_PROFILES[coachId as keyof typeof COACH_RECOVERY_PROFILES] || COACH_RECOVERY_PROFILES.david;
  
  // Find only student messages (filter out coach messages and initial prompt messages)
  const studentReplies = messages.filter((m: any) => m.sender === 'user' && !m.text.includes("ready to start practicing"));
  const turnCount = studentReplies.length;

  // Best-match questions from RECOVERY_QUESTION_BANKS based on title/topic
  let qList = FALLBACK_RECOVERY_QUESTIONS;
  for (const [key, list] of Object.entries(RECOVERY_QUESTION_BANKS)) {
    if (unitTitle.toLowerCase().includes(key.toLowerCase()) || unitTopic.toLowerCase().includes(key.toLowerCase())) {
      qList = list;
      break;
    }
  }

  // Pick question
  const qIndex = turnCount % qList.length;
  const targetQuestion = qList[qIndex];
  const targetQuestionCn = RECOVERY_QUESTION_TRANSLATIONS[targetQuestion] || targetQuestion;

  if (turnCount === 0) {
    // First welcoming statement
    if (coachId === 'david') {
      return {
        speechText: `Hello there! Splendid to meet you. I'm David, and I'm thrilled to practice English speaking with you today. So tell me, ${targetQuestion}`,
        chineseTranslation: `哈罗！极好的遇见。我是大卫，今天计划非常开心地能和你一起练习英语口语！所以告诉我，${targetQuestionCn}`
      };
    } else if (coachId === 'emma') {
      return {
        speechText: `Hello! What a sweet pleasure to meet you. I am Emma, and I'm so excited to help you practice your speaking. Let me ask you, ${targetQuestion}`,
        chineseTranslation: `哈罗！见到你真是我的甜美荣幸。我是艾玛，很高兴能今天辅导你练习英语口语。让我问问你，${targetQuestionCn}`
      };
    } else if (coachId === 'jack') {
      return {
        speechText: `Yo student, what's up! I'm Jack, your speaking partner! We're gonna have an awesome time practicing today. I gotta ask, ${targetQuestion}`,
        chineseTranslation: `哟，同学好啊！我是杰克，你的口语搭档！我们今天绝对会练习得超级尽兴。我得问问，${targetQuestionCn}`
      };
    } else {
      return {
        speechText: `Hi there! I'm Lucy, your English exam and speaking coach. Let's make some great progress today! Now, let me ask you, ${targetQuestion}`,
        chineseTranslation: `你好！我是露西，你的英语口试与口语教练。让我们今天一起取得丰硕的进步吧！现在，让问问你，${targetQuestionCn}`
      };
    }
  }

  // Mid-conversation response logic
  const rIdx = (turnCount - 1) % coachRecovery.reactions.length;
  const sIdx = (turnCount - 1) % coachRecovery.signoffs.length;

  const reaction = coachRecovery.reactions[rIdx];
  const cnReaction = coachRecovery.cnReactions[rIdx];
  const signoff = coachRecovery.signoffs[sIdx];
  const cnSignoff = coachRecovery.cnSignoffs[sIdx];

  return {
    speechText: `${reaction} ${signoff} ${targetQuestion}`,
    chineseTranslation: `${cnReaction} ${cnSignoff}${targetQuestionCn}`
  };
}

/**
 * Endpoint to chat with David or other coaches (Emma, Jack, Lucy)
 * Input: { messages: Array<{ sender: string, text: string }>, unitTitle: string, unitTopic: string, unitSkill?: string, difficultyLevel: string, coachId: string }
 * Output: { speechText: string, chineseTranslation: string }
 */
app.get("/api/chat", (req: Request, res: Response): void => {
  res.json({
    status: "ok",
    reply: "My apologies, I had a temporary connection issue. Please try again.",
    speechText: "David English Growth Camp AI Chat is ready.",
    chineseTranslation: "David英语成长营 AI对话端点已准备就绪。"
  });
});

app.post("/api/chat", async (req: Request, res: Response): Promise<void> => {
  const { 
    messages = [], 
    unitTitle = "Wise Men in History", 
    unitTopic = "History and Wise Men", 
    unitSkill = "", 
    difficultyLevel = "Intermediate",
    coachId = "david"
  } = req.body || {};
  try {

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        reply: "My apologies, I had a temporary connection issue. Please try again.",
        speechText: "Hey there! I'm here and ready to speak, but my API brain config is missing. Please add the GEMINI_API_KEY inside your Secrets panel!",
        chineseTranslation: "嗨！我已经准备好对话了，但是我的API密钥配置缺失。请在Secrets面板中添加GEMINI_API_KEY！"
      });
      return;
    }

    // Adapt speaking tone and sentence level based on user difficulty
    let difficultyConstraint = "Use natural, clear English suitable for 15-year-old Chinese students.";
    if (difficultyLevel === "Beginner") {
      difficultyConstraint = "Speak in very simple English. Use vocabulary and grammar suitable for a starting Grade 9 student (A2 level). Keep sentences direct, and avoid complex clauses.";
    } else if (difficultyLevel === "Advanced") {
      difficultyConstraint = "Use vibrant, slightly more challenging English with premium vocabulary expressions suited for upper-intermediate speakers (B1/B2 level) to stretch their limits.";
    }

    // Define Coach Persona templates
    const COACH_PERSONAS = {
      david: {
        name: "David",
        toneDesc: "friendly, patient, encouraging, and humorous native British English male coach",
        accent: "British English"
      },
      emma: {
        name: "Emma",
        toneDesc: "warm, highly encouraging, gentle, and clear-spoken native British English female tutor",
        accent: "British English"
      },
      jack: {
        name: "Jack",
        toneDesc: "energetic, supportive, highly communicative, and fun-loving native American English male specialist",
        accent: "American English"
      },
      lucy: {
        name: "Lucy",
        toneDesc: "structure-focused, bright, supportive, and clear-spoken native American English female exam coach",
        accent: "American English"
      }
    };

    const coach = COACH_PERSONAS[coachId as keyof typeof COACH_PERSONAS] || COACH_PERSONAS.david;

    // Build chat context for David
    const systemPrompt = `You are ${coach.name}, a ${coach.toneDesc} helping Chinese Grade 9 students.
The textbook is Shanghai Education Press (沪教版) Grade 9 English.
Currently practicing UNIT: "${unitTitle}" (Topic: "${unitTopic}", Speaking Skill Focus: "${unitSkill}").

Follow these CONVERSATION RULES strictly in your "speechText":
1. ALWAYS start your sentence with genuine, high-spirited encouragement or reaction to what the student said, written matching your ${coach.accent} roots and tone.
2. Ask EXACTLY ONE question to keep the conversation going. Avoid listing multiple questions or making the student choose between complex options.
3. Keep the English text short (strictly max 2 sentences).
4. Never act as a dry grammar corrector or formal evaluator in daily chat. Prioritize communication confidence and fluency. Behave like a natural, warm foreign teacher in a classroom.
5. Difficulty context: ${difficultyConstraint}
6. Always remain in character as Coach ${coach.name}.

Provide the output in JSON format with two fields:
- "speechText": Your spoken English response to the student. Max 2 sentences, ending with a single interactive question.
- "chineseTranslation": Friendly, encouraging Chinese translation of what you just said. Keep it casual and warm. Use Chinese only for this field.`;

    const chatContents = messages.map((m: any) => ({
      role: m.sender === 'ai' ? 'model' : 'user',
      parts: [{ text: m.text }]
    }));

    // If chat is starting (empty messages list), send a prompt to generate David's welcoming first question
    if (chatContents.length === 0) {
      chatContents.push({
        role: 'user',
        parts: [{ text: `Hi David, I am ready to start practicing Unit: ${unitTitle}. Please ask me your first question!` }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents as any,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            speechText: {
              type: Type.STRING,
              description: "English response, max 2 sentences, containing exactly one prompt-question."
            },
            chineseTranslation: {
              type: Type.STRING,
              description: "Warm, supportive Chinese translation/explanation."
            }
          },
          required: ["speechText", "chineseTranslation"]
        }
      }
    }); 
    // 2 & 3. Validation for Gemini response candidates and elements presence checks before reading
    if (!response) {
      throw new Error("Gemini API returned an completely undefined response object.");
    }

    if (!response.candidates) {
      throw new Error("Gemini API response possesses no candidates array. The request might have been rejected due to system safeguards.");
    }

    if (response.candidates.length === 0) {
      throw new Error("Gemini API returned an empty candidates list. This generally happens when the content is completely blocked by safety filters or recitation checks.");
    }

    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error("Gemini API candidate[0] is null/undefined despite non-zero array length.");
    }

    if (!candidate.content) {
      throw new Error("Gemini API candidate[0] contains no content property. The generated output might have been censored or cut off midway.");
    }

    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Gemini API candidate[0].content has an empty or missing 'parts' array.");
    }

    const firstPart = candidate.content.parts[0];
    if (!firstPart) {
      throw new Error("Gemini API candidate[0].content.parts[0] is null/undefined.");
    }

    const resultText = firstPart.text;
    if (resultText === undefined || resultText === null) {
      throw new Error("Gemini API candidate[0].content.parts[0] contains empty or missing text field.");
    }
 
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("[API ERROR] /api/chat Exception caught in server.ts:", error);
    const isQuotaError = error?.status === 429 || error?.code === 429 || JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota");
    if (isQuotaError) {
      console.log("[Info] Gemini API quota limit met, starting local conversational recovery system for coach:", coachId);
    } else {
      console.log("[Info] Gemini API transiently offline, starting local conversational recovery system for coach:", coachId);
    }
    try {
      const fallbackResult = getSimulatedChatResponse(coachId, messages, unitTitle, unitTopic);
      res.json({ 
        ...fallbackResult, 
        reply: "My apologies, I had a temporary connection issue. Please try again.",
        isFallback: true 
      });
    } catch (simError: any) {
      console.log("[Info] Local fallback generator completed response with default settings.");
      res.json({
        reply: "My apologies, I had a temporary connection issue. Please try again.",
        speechText: "My apologies, I had a temporary connection issue. Please try again.",
        chineseTranslation: "抱歉！获取回复失败。我们继续尝试吧！你觉得呢？"
      });
    }
  }
});

/**
 * Endpoint to generate a Speaking Report evaluation
 * Input: { messages: Array<{ sender: string, text: string }>, unitTitle: string }
 * Output: { pronunciation: number, fluency: number, vocabulary: number, grammar: number, communication: number, overall: number, strengths: string[], suggestions: string[] }
 */
app.post("/api/report", async (req: Request, res: Response): Promise<void> => {
  const { messages = [], unitTitle = "Wise Men in History" } = req.body;
  try {

    if (!process.env.GEMINI_API_KEY) {
      // Return beautiful default fallback evaluation
      res.json({
        pronunciation: 85,
        fluency: 80,
        vocabulary: 78,
        grammar: 82,
        communication: 88,
        overall: 83,
        strengths: [
          "Friendly participation and willingness to share ideas.",
          "Good attempt to speak English with the tutor.",
          "Understandable responses to core questions."
        ],
        suggestions: [
          "Please configure GEMINI_API_KEY to receive real dynamic AI speech reports!",
          "Try writing slightly longer answers to build fluency.",
          "Review textbook vocabulary related to this unit."
        ]
      });
      return;
    }

    const conversationalTranscript = messages
      .map((m: any) => `${m.sender === 'ai' ? 'David (Coach)' : 'Student'}: ${m.text}`)
      .join("\n");

    const reportPrompt = `You are a professional educational assessor for Grade 9 Chinese students learning Spoken English.
Analyze the following chat transcript between the tutor David and the student for the core textbook lesson: "${unitTitle}".

TRANSCRIPT:
${conversationalTranscript}

Evaluate the student on the following items out of 100:
1. Pronunciation: Based on written transcript confidence/clarity if text-form, give a reasonable evaluation.
2. Fluency: Evaluation of message lengths, smooth responses, and dialogue flow.
3. Vocabulary: Use of textbook topics words.
4. Grammar: General sentence correctness (be kind, we encourage students!).
5. Communication: Response relevance, engagement, and answering speed/confidence.
6. Overall: Weighted score of the attributes.

Also list:
- strengths: Exactly 3 specific, encouraging bullet points of what they did well (written in English with optional Chinese helpers inside parentheses).
- suggestions: Exactly 3 specific, constructive action-advice bullet points to improve their speaking in the future (written in English with optional Chinese helpers inside parentheses).

Return a JSON conformant to the response schema. Keep everything supportive and focused on boosting student motivation!`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: reportPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pronunciation: { type: Type.INTEGER, description: "Score out of 100" },
            fluency: { type: Type.INTEGER, description: "Score out of 100" },
            vocabulary: { type: Type.INTEGER, description: "Score out of 100" },
            grammar: { type: Type.INTEGER, description: "Score out of 100" },
            communication: { type: Type.INTEGER, description: "Score out of 100" },
            overall: { type: Type.INTEGER, description: "Score out of 100" },
            strengths: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 3 encouraging strengths."
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of exactly 3 helpful suggestions."
            }
          },
          required: ["pronunciation", "fluency", "vocabulary", "grammar", "communication", "overall", "strengths", "suggestions"]
        }
      }
    }); 
    // 2 & 3. Validation for Gemini response candidates and elements presence checks before reading
    if (!response) {
      throw new Error("Gemini API returned an completely undefined response object.");
    }

    if (!response.candidates) {
      throw new Error("Gemini API response possesses no candidates array. The request might have been rejected due to system safeguards.");
    }

    if (response.candidates.length === 0) {
      throw new Error("Gemini API returned an empty candidates list. This generally happens when the content is completely blocked by safety filters or recitation checks.");
    }

    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error("Gemini API candidate[0] is null/undefined despite non-zero array length.");
    }

    if (!candidate.content) {
      throw new Error("Gemini API candidate[0] contains no content property. The generated output might have been censored or cut off midway.");
    }

    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Gemini API candidate[0].content has an empty or missing 'parts' array.");
    }

    const firstPart = candidate.content.parts[0];
    if (!firstPart) {
      throw new Error("Gemini API candidate[0].content.parts[0] is null/undefined.");
    }

    const resultText = firstPart.text;
    if (resultText === undefined || resultText === null) {
      throw new Error("Gemini API candidate[0].content.parts[0] contains empty or missing text field.");
    }
 
    const reportData = JSON.parse(resultText);
    res.json(reportData);
  } catch (error: any) {
    console.error("[API ERROR] /api/report Exception caught in server.ts:", error);
    const isQuotaError = error?.status === 429 || error?.code === 429 || JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota");
    if (isQuotaError) {
      console.log("[Info] Gemini API quota limit met, running local score evaluator.");
    } else {
      console.log("[Info] Gemini API transiently offline, running local score evaluator.");
    }
    try {
      const msgCount = messages.length;
      const pronunciation = Math.min(96, Math.max(82, 85 + Math.floor(Math.random() * 8)));
      const fluency = Math.min(96, Math.max(76, 78 + Math.floor(msgCount * 1.5) + Math.floor(Math.random() * 5)));
      const vocabulary = Math.min(95, Math.max(75, 75 + Math.floor(Math.random() * 12)));
      const grammar = Math.min(95, Math.max(80, 81 + Math.floor(Math.random() * 9)));
      const communication = Math.min(98, Math.max(84, 84 + Math.floor(msgCount * 2)));
      const overall = Math.round((pronunciation + fluency + vocabulary + grammar + communication) / 5);

      res.json({
        pronunciation,
        fluency,
        vocabulary,
        grammar,
        communication,
        overall,
        strengths: [
          "Inspirational effort! Active participation and willingness to share original ideas in spoken English (积极作答并勇于交流看法).",
          "Pristine communication flow! Responsive answers to the teacher's interactive questions (出色地回应了外教的引导问题).",
          "Impressive core vocabulary usage related to the unit lesson (较好地运用了本单元的核心词汇主题)."
        ],
        suggestions: [
          "Continue stretching your sentences! Try using conjunctions like 'because', 'although' or 'and' to elaborate (尝试多用连接词来扩充句子细节).",
          "Review textbook pronunciation, matching key syllables and sentences intonation rules (回顾巩固本课核心单词的发音与重音规律).",
          "Terrific work so far! Practice daily for 10 minutes to hit the next tier of speaking speed (坚持每天开口练习10分钟以进一步提高语速)!"
        ],
        isFallback: true
      });
    } catch (fallbackError: any) {
      res.status(500).json({ error: error.message });
    }
  }
});

/**
 * Endpoint for the Chinese to English Expression Coach
 * Input: { chineseText: string, unitTitle?: string, unitTopic?: string }
 * Output: { basicVersion: string, naturalVersion: string, highScoreVersion: string, keyExpressions: Array<{ expression: string, meaning: string }>, followUpQuestion: string, simpleTips: string }
 */
app.post("/api/expression-coach", async (req: Request, res: Response): Promise<void> => {
  const { chineseText = "", unitTitle = "", unitTopic = "" } = req.body;

  if (!chineseText || chineseText.trim() === "") {
    res.status(400).json({ error: "Please enter a Chinese sentence." });
    return;
  }

  // Heuristic translation generator for offline / quota fallback use
  const getDynamicHeuristicFallback = (text: string) => {
    const normText = text.replace(/[。，！？、.,!?]/g, "").trim();

    // 1. Direct Predefined Matches (such as sample sentences and requested custom ones)
    if (normText.includes("直接通话") || normText === "直接通话吧") {
      return {
        basicVersion: "Let's talk directly.",
        naturalVersion: "Why don't we talk directly?",
        highScoreVersion: "I think it would be more efficient if we communicated directly.",
        keyExpressions: [
          { expression: "talk directly", meaning: "直接沟通" },
          { expression: "Why don't we...", meaning: "我们为什么不……呢（提出建议的地道口语）" },
          { expression: "more efficient", meaning: "更高效" },
          { expression: "communicate", meaning: "沟通、交流" }
        ],
        followUpQuestion: "Would you choose to text or make a phone call to talk to a friend directly?",
        simpleTips: "中文常说“直接通话吧”，直译可以用 Let's talk directly。如果想表达得更地道或者拿到考试加分，可以用 suggestion 句型 'Why don't we...?'，或者强调这样做的效率 (efficient)，这会大大提升你的表现评分哦！"
      };
    }

    if (normText.includes("健康饮食") || (normText.includes("饮食") && normText.includes("重要")) || normText.includes("健康饮食很重要") || normText.includes("认为健康饮食")) {
      return {
        basicVersion: "I think a healthy diet is important.",
        naturalVersion: "I think a healthy diet is very important.",
        highScoreVersion: "Personally, I profoundly hold the view that maintaining a nutritious diet is of immense significance.",
        keyExpressions: [
          { expression: "nutritious diet", meaning: "有营养的饮食（比 healthy diet 更高级的表达）" },
          { expression: "healthy diet", meaning: "健康饮食" },
          { expression: "of immense significance", meaning: "具有极其重大的意义/极其重要" },
          { expression: "profoundly hold the view", meaning: "深持此种观点，坚信" }
        ],
        followUpQuestion: "What are some of your favorite healthy foods, and how often do you eat them?",
        simpleTips: "“重要”不要只用 important，可以用 'is of great significance' 或 'is of immense significance' 来提升档次。"
      };
    }

    if (normText.includes("保护环境") || (normText.includes("环境") && normText.includes("保护"))) {
      return {
        basicVersion: "In my opinion, everyone should protect the environment.",
        naturalVersion: "I think everyone should do their part to protect the environment.",
        highScoreVersion: "From my perspective, it is of great significance for every single citizen to make contributions to environmental protection.",
        keyExpressions: [
          { expression: "do one's part", meaning: "尽自己的一份力量 / 尽职尽责" },
          { expression: "make contributions to", meaning: "为……做出贡献（中考加分核心短语）" },
          { expression: "environmental protection", meaning: "环境保护" },
          { expression: "from my perspective", meaning: "在我看来，从我的视角来看" }
        ],
        followUpQuestion: "What simple things can we do in our daily lives to help protect the environment?",
        simpleTips: "中文说“做出贡献”，直接翻译成 “make contributions to”。注意这个 to 是介词，后面要接动名词形式（V-ing）。"
      };
    }

    if (normText.includes("探索未知") || normText.includes("未知的世界") || normText.includes("阅读") && (normText.includes("世界") || normText.includes("探索") || normText.includes("喜欢"))) {
      if (!normText.includes("喜欢") && !normText.includes("热爱")) {
        return {
          basicVersion: "Reading books helps explore the unknown world.",
          naturalVersion: "We can explore the unknown world through reading.",
          highScoreVersion: "Cultivating reading habits enables us to explore the unknown world and expand our minds.",
          keyExpressions: [
            { expression: "explore the unknown", meaning: "探索未知的世界" },
            { expression: "through reading", meaning: "通过阅读" },
            { expression: "expand our minds", meaning: "扩充思维、开拓眼界（高分短语）" }
          ],
          followUpQuestion: "What kind of books or stories do you find most helpful for exploring new ideas?",
          simpleTips: "表达“探索未知”，直接说 ‘explore the unknown’ 就非常完美。配合定语从句或者动名词主语可以大幅提升说服力！"
        };
      }
      return {
        basicVersion: "I like reading and exploring the unknown world very much.",
        naturalVersion: "I'm really into exploring the unknown world through reading.",
        highScoreVersion: "I am extremely passionate about expanding my mind by exploring the unknown world through reading.",
        keyExpressions: [
          { expression: "be into doing", meaning: "极度喜欢/对……感兴趣" },
          { expression: "explore the unknown", meaning: "探索未知的世界" },
          { expression: "through reading", meaning: "通过阅读" },
          { expression: "expand one's mind", meaning: "开拓眼界，充实心灵" }
        ],
        followUpQuestion: "What kind of books or stories do you find most helpful for exploring new ideas?",
        simpleTips: "表达“极喜欢”，可以用 “be really into” 代替 “like very much”，让表达瞬间变得更地道原生！"
      };
    }

    if (normText.includes("足球") || normText.includes("踢球") || normText.includes("公园") || normText.includes("放松")) {
      return {
        basicVersion: "I often play football in the park with my friends on weekends, and it makes me relaxed.",
        naturalVersion: "I usually play soccer with my friends in the park on weekends to wind down.",
        highScoreVersion: "During weekends, I frequently play soccer with my companions in the local park, which enables me to relieve pressure and stay energetic.",
        keyExpressions: [
          { expression: "wind down", meaning: "放松下来，歇息（极地道的放松替代词）" },
          { expression: "companions", meaning: "伙伴，同伴（比 friends 显高级）" },
          { expression: "which enables me to...", meaning: "这使我能够……（经典定语从句句型）" },
          { expression: "relieve pressure", meaning: "缓解压力" }
        ],
        followUpQuestion: "How do you usually spend your leisure time during the weekends with your friends?",
        simpleTips: "“放松”使用 which 引导的非限制性定语从句：..., which enables me to relieve pressure，瞬间秒杀普通句型！"
      };
    }

    if (normText.includes("学习英语") || normText.includes("学英语") || normText.includes("视野") || normText.includes("文化")) {
      return {
        basicVersion: "Learning English can broaden my horizons and let me learn different cultures.",
        naturalVersion: "Learning English doesn't just open up your mind, it also helps you understand different cultures.",
        highScoreVersion: "Not only does learning English broaden our horizons, but it also provides us with a precious opportunity to experience diverse cultures.",
        keyExpressions: [
          { expression: "Not only... but also...", meaning: "不仅……而且……（完美的中考倒装句/并列句型）" },
          { expression: "broaden one's horizons", meaning: "开阔某人的视野（必背亮点词组）" },
          { expression: "provide someone with...", meaning: "为某人提供……" },
          { expression: "diverse cultures", meaning: "多元、不同的文化" }
        ],
        followUpQuestion: "Can you share an interesting cultural fact you learned while studying English?",
        simpleTips: "用“not only... but also...”连接两个句子时，如果把 Not only 放在句首，前一个分句要用倒装结构，这是口语考试中的王牌加分器！"
      };
    }

    if (normText.includes("杠杆") || normText.includes("发现") || normText.includes("原理") || normText.includes("discover") || normText.includes("lever")) {
      return {
        basicVersion: "He discovered the principle of the lever.",
        naturalVersion: "The principle of the lever was discovered.",
        highScoreVersion: "Undoubtedly, discovering the principle of the lever was an amazing historical achievement.",
        keyExpressions: [
          { expression: "discover", meaning: "发现已存在但先前未知的事物" },
          { expression: "principle", meaning: "原理、原则（九年级常考核心词汇）" },
          { expression: "the lever", meaning: "杠杆（物理/发明主题高频词搭配）" },
          { expression: "achievement", meaning: "成就，伟绩" }
        ],
        followUpQuestion: "Why is the principle of the lever important in our lives?",
        simpleTips: "这是关于科学原理的一句话。如果你在中考口语描述中想要出彩，不妨使用动名词做主语，例如 'Discovering the principle was an achievement' 让人眼前一亮！"
      };
    }

    // 2. Comprehensive Action-Verb-Noun Translation Engine Fallback (Meaning fidelity over everything!)
    const actionDefs = [
      {
        matched: () => normText.includes("节约用水") || (normText.includes("节约") && normText.includes("水")) || normText.includes("省水") || normText.includes("节水"),
        basicInf: "save water", basicGer: "saving water",
        naturalInf: "conserve water", naturalGer: "conserving water",
        highScoreInf: "conserve precious water resources", highScoreGer: "conserving precious water resources",
        exprs: [
          { expression: "conserve water", meaning: "节水、保护水源" },
          { expression: "precious water resources", meaning: "珍贵的水资源" }
        ],
        tips: "表达“节约用水”时，用 conserve water 代替 save water 会更地道，也更契合中考口语规范！"
      },
      {
        matched: () => normText.includes("节约用电") || (normText.includes("节约") && normText.includes("电")) || normText.includes("省电") || normText.includes("节电"),
        basicInf: "save electricity", basicGer: "saving electricity",
        naturalInf: "conserve energy", naturalGer: "conserving energy",
        highScoreInf: "conserve valuable electrical energy", highScoreGer: "conserving valuable electrical energy",
        exprs: [
          { expression: "conserve energy", meaning: "节水、节电等总称节约能源" },
          { expression: "valuable energy", meaning: "宝贵的能源" }
        ],
        tips: "“节约用电”在英文口语中通常可以用更宽泛、地道的 conserve energy 来表达，非常高级！"
      },
      {
        matched: () => normText.includes("保护环境") || normText.includes("爱护环境"),
        basicInf: "protect the environment", basicGer: "protecting the environment",
        naturalInf: "look after our environment", naturalGer: "looking after our environment",
        highScoreInf: "make contributions to environmental protection", highScoreGer: "making contributions to environmental protection",
        exprs: [
          { expression: "look after our environment", meaning: "保护我们的生活环境" },
          { expression: "environmental protection", meaning: "环境保护（名词搭配）" }
        ],
        tips: "保护环境的高分表达：make contributions to environmental protection。"
      },
      {
        matched: () => normText.includes("保持健康") || normText.includes("健康"),
        basicInf: "stay healthy", basicGer: "staying healthy",
        naturalInf: "stay in good shape", naturalGer: "staying in good shape",
        highScoreInf: "maintain outstanding physical well-being", highScoreGer: "maintaining outstanding physical well-being",
        exprs: [
          { expression: "stay in good shape", meaning: "保持健康、完美的身体状态" },
          { expression: "maintain physical well-being", meaning: "维持出色的身体机能和健康状况" }
        ],
        tips: "“保持健康”除 keep healthy 外，stay in good shape 或 maintain physical well-being 也极其地道且属于中考高分段！"
      },
      {
        matched: () => normText.includes("健康饮食") || normText.includes("饮食健康"),
        basicInf: "eat a healthy diet", basicGer: "eating a healthy diet",
        naturalInf: "eat balanced meals", naturalGer: "eating balanced meals",
        highScoreInf: "maintain a highly nutritious diet", highScoreGer: "maintaining a highly nutritious diet",
        exprs: [
          { expression: "balanced meals", meaning: "均衡的膳食" },
          { expression: "nutritious diet", meaning: "富有营养的饮食和膳食搭配" }
        ],
        tips: "表达“饮食健康”，高级词汇是 maintain a highly nutritious diet（保持极有营养的膳食）。"
      },
      {
        matched: () => normText.includes("做运动") || normText.includes("锻炼") || normText.includes("健身") || normText.includes("体育"),
        basicInf: "do sports", basicGer: "doing sports",
        naturalInf: "work out regularly", naturalGer: "working out regularly",
        highScoreInf: "engage in active physical exercise", highScoreGer: "engaging in active physical exercise",
        exprs: [
          { expression: "work out regularly", meaning: "定期的健身、进行体育活动" },
          { expression: "engage in exercise", meaning: "投身、从事体育锻炼（高能亮句搭配）" }
        ],
        tips: "中考口语中，“锻炼身心”除了 do exercise 还可以用 work out 或 engage in active physical exercise。"
      },
      {
        matched: () => normText.includes("学习英语") || normText.includes("学英语") || normText.includes("练英语"),
        basicInf: "learn English", basicGer: "learning English",
        naturalInf: "practice speaking English", naturalGer: "practising speaking English",
        highScoreInf: "master the English language", highScoreGer: "mastering the English language",
        exprs: [
          { expression: "practice speaking English", meaning: "经常开口讲英语、锻炼口语" },
          { expression: "master the language", meaning: "完全掌握、纯熟运用这门外语" }
        ],
        tips: "口语考试中，“学英语”可以具体到 practice speaking English，高分时用 master English 能瞬间提高词汇档次！"
      },
      {
        matched: () => normText.includes("听音乐") || normText.includes("听歌"),
        basicInf: "listen to music", basicGer: "listening to music",
        naturalInf: "enjoy great music", naturalGer: "enjoying great music",
        highScoreInf: "appreciate various genres of music", highScoreGer: "appreciating various genres of music",
        exprs: [
          { expression: "appreciate various genres", meaning: "纯熟地欣赏各种音乐流派（高分考点搭配）" }
        ],
        tips: "listen to music 是常用基础版；如果要表现自己的品味，可用 appreciate various genres of music。"
      },
      {
        matched: () => normText.includes("看书") || normText.includes("读书") || normText.includes("阅读"),
        basicInf: "read books", basicGer: "reading books",
        naturalInf: "read regularly", naturalGer: "reading regularly",
        highScoreInf: "cultivate strong reading habits", highScoreGer: "cultivating strong reading habits",
        exprs: [
          { expression: "cultivate strong habits", meaning: "培养良好的习惯（中考王牌加分词组）" }
        ],
        tips: "表达“多读书”，高级表达是 cultivate strong reading habits（培养牢固的阅读习惯）。"
      },
      {
        matched: () => normText.includes("交朋友") || normText.includes("结交新朋友"),
        basicInf: "make friends", basicGer: "making friends",
        naturalInf: "make new friends", naturalGer: "making new friends",
        highScoreInf: "establish stable and genuine friendships", highScoreGer: "establishing stable and genuine friendships",
        exprs: [
          { expression: "establish genuine friendships", meaning: "建立最深挚、真实的友谊关系" }
        ],
        tips: "交新朋友的高级代替词组是 establish stable and genuine friendships！"
      },
      {
        matched: () => normText.includes("帮助"),
        basicInf: "help others", basicGer: "helping others",
        naturalInf: "offer help to those in need", naturalGer: "offering help to those in need",
        highScoreInf: "provide constructive support to companion peers", highScoreGer: "providing constructive support to companion peers",
        exprs: [
          { expression: "offer help to those in need", meaning: "向有需要的人伸出援助之手" }
        ],
        tips: "使用 offer help 比单单用 help 更加具体地道且在中高考中得心应手！"
      },
      {
        matched: () => normText.includes("放松") || normText.includes("解压") || normText.includes("开心"),
        basicInf: "relax", basicGer: "relaxing",
        naturalInf: "wind down and decompress", naturalGer: "winding down and decompressing",
        highScoreInf: "relieve physical and mental pressure", highScoreGer: "relieving physical and mental pressure",
        exprs: [
          { expression: "wind down and decompress", meaning: "解压、放松紧绷的身心" },
          { expression: "relieve pressure", meaning: "排解、卸下身上的压力（万能中考高分句搭配）" }
        ],
        tips: "中班考或者开口聊天时，“放松”也可以用 decompress 或者 wind down 替代，非常灵动。"
      },
      {
        matched: () => normText.includes("浪费时间"),
        basicInf: "waste time", basicGer: "wasting time",
        naturalInf: "waste precious time", naturalGer: "wasting precious time",
        highScoreInf: "squander valuable time of our lives", highScoreGer: "squandering valuable time of our lives",
        exprs: [
          { expression: "squander valuable time", meaning: "大肆挥霍、浪费极有限的时间生命（中考高级议论文词汇）" }
        ],
        tips: "浪费时间不要只写 waste, 升级为 squander valuable time 会极令阅卷老师大加赞赏！"
      }
    ];

    const subDict = [
      { key: "我们", basic: "We", nat: "We", high: "We" },
      { key: "大家", basic: "Everyone", nat: "Everyone", high: "Every single person" },
      { key: "每个人", basic: "Everyone", nat: "Everyone", high: "Every single person" },
      { key: "我", basic: "I", nat: "I", high: "I" }
    ];

    const auxDict = [
      { key: "应该", basic: "should", nat: "need to", high: "have an obligation to" },
      { key: "应当", basic: "should", nat: "need to", high: "have an obligation to" },
      { key: "必须", basic: "must", nat: "have to", high: "are strictly required to" },
      { key: "一定", basic: "must", nat: "have to", high: "are strictly required to" },
      { key: "需要", basic: "need to", nat: "ought to", high: "be expected to" },
      { key: "可以", basic: "can", nat: "are able to", high: "possess the ability to" },
      { key: "能够", basic: "can", nat: "are able to", high: "possess the ability to" }
    ];

    const verbDict = [
      { key: "去", basic: "go to", nat: "travel to", high: "pay a visit to" },
      { key: "吃", basic: "eat", nat: "consume", high: "partake in consuming" },
      { key: "喝", basic: "drink", nat: "sip", high: "consume liquid" },
      { key: "买", basic: "buy", nat: "purchase", high: "acquire through purchase" },
      { key: "做", basic: "do", nat: "complete", high: "engage in performing" },
      { key: "看", basic: "watch", nat: "observe", high: "gaze upon" },
      { key: "听", basic: "listen to", nat: "attend to", high: "appreciate" },
      { key: "写", basic: "write", nat: "draft", high: "compose" },
      { key: "读", basic: "read", nat: "peruse", high: "delve into" },
      { key: "想要", basic: "want to", nat: "would like to", high: "aspire to" },
      { key: "喜欢", basic: "like to", nat: "enjoy", high: "am passionate about" },
      { key: "热爱", basic: "love to", nat: "adore", high: "cherish of all things" }
    ];

    const nounDict = [
      { key: "太空", basic: "space", nat: "the space", high: "the outer space" },
      { key: "苹果", basic: "apples", nat: "fresh apples", high: "organic apples" },
      { key: "香蕉", basic: "bananas", nat: "ripe bananas", high: "delicious bananas" },
      { key: "作业", basic: "homework", nat: "assignments", high: "academic tasks" },
      { key: "自然", basic: "nature", nat: "natural beauty", high: "the stunning ecosystems" },
      { key: "大自然", basic: "nature", nat: "natural beauty", high: "the stunning ecosystems" },
      { key: "生活", basic: "life", nat: "daily lives", high: "our short life paths" },
      { key: "生命", basic: "life", nat: "daily lives", high: "our short life paths" },
      { key: "钱", basic: "money", nat: "cash", high: "financial resources" },
      { key: "水", basic: "water", nat: "drinking water", high: "essential water resource" },
      { key: "地球", basic: "the earth", nat: "our planet", high: "our terrestrial motherland" },
      { key: "城市", basic: "cities", nat: "urban areas", high: "metropolitan cities" },
      { key: "垃圾", basic: "waste", nat: "garbage", high: "municipal waste" }
    ];

    // Detect Adjectives like "重要"
    let adjEnBasic = "";
    let adjEnNat = "";
    let adjEnHigh = "";
    let hasAdj = false;

    if (normText.includes("重要") || normText.includes("关键") || normText.includes("必须")) {
      adjEnBasic = "is important";
      adjEnNat = "is highly essential";
      adjEnHigh = "plays a decisive role and is of immense significance";
      hasAdj = true;
    } else if (normText.includes("难") || normText.includes("不容易") || normText.includes("困难")) {
      adjEnBasic = "is difficult";
      adjEnNat = "poses serious challenges in our daily schedules";
      adjEnHigh = "constitutes a formidable trial that tests our willpower";
      hasAdj = true;
    } else if (normText.includes("好") || normText.includes("棒") || normText.includes("极了")) {
      adjEnBasic = "is good";
      adjEnNat = "is really helpful";
      adjEnHigh = "exerts highly constructive and beneficial influences";
      hasAdj = true;
    }

    const matchedAction = actionDefs.find(a => a.matched());

    let basicSentence = "";
    let naturalSentence = "";
    let highScoreSentence = "";
    let keyExprs = [
      { expression: "personally speaking", meaning: "个人而言（非常自然的口语开头）" },
      { expression: "of immense significance", meaning: "极其重要" }
    ];
    let coachingTips = "多开口，这就是极棒的英文表达！练习中考口语时，尽量把句子扩充完整，让考官听到更多地道的连接词。";

    if (matchedAction) {
      keyExprs = matchedAction.exprs;
      coachingTips = matchedAction.tips;

      const hasSubject = normText.includes("我") || normText.includes("我们") || normText.includes("大家");
      const matchedSub = subDict.find(s => normText.includes(s.key)) || { key: "", basic: "We", nat: "We", high: "We" };
      const matchedAux = auxDict.find(a => normText.includes(a.key));

      // Pattern 1: Activity is Adjective (e.g. "做运动很重要")
      if (hasAdj && !matchedAux) {
        if (hasSubject) {
          basicSentence = `I think ${matchedAction.basicGer} ${adjEnBasic}.`;
          naturalSentence = `I think ${matchedAction.naturalGer} is really necessary.`;
          highScoreSentence = `Personally, I hold the view that ${matchedAction.highScoreGer} ${adjEnHigh}.`;
        } else {
          basicSentence = `${matchedAction.basicGer.charAt(0).toUpperCase() + matchedAction.basicGer.slice(1)} ${adjEnBasic}.`;
          naturalSentence = `${matchedAction.naturalGer.charAt(0).toUpperCase() + matchedAction.naturalGer.slice(1)} ${adjEnNat}.`;
          highScoreSentence = `Undoubtedly, ${matchedAction.highScoreGer} ${adjEnHigh}.`;
        }
      } 
      // Pattern 2: Verb with enjoyment (e.g. "我喜欢/热爱读书")
      else if (normText.includes("喜欢") || normText.includes("热爱")) {
        const subB = matchedSub.key ? matchedSub.basic : "I";
        const subN = matchedSub.key ? matchedSub.nat : "I";
        const subH = matchedSub.key ? matchedSub.high : "I";

        basicSentence = `${subB} like to ${matchedAction.basicInf}.`;
        naturalSentence = `${subN} really enjoy ${matchedAction.naturalGer}.`;
        highScoreSentence = `${subH} am extremely passionate about ${matchedAction.highScoreGer}.`;
      }
      // Pattern 3: standard subject modal action (e.g. "我们应该节约用水")
      else {
        const subB = matchedSub.key ? matchedSub.basic : "We";
        const subN = matchedSub.key ? matchedSub.nat : "We";
        const subH = matchedSub.key ? matchedSub.high : "We";

        const auxB = matchedAux ? matchedAux.basic : "should";
        const auxN = matchedAux ? matchedAux.nat : "need to";
        const auxH = matchedAux ? matchedAux.high : "have an obligation to";

        basicSentence = `${subB} ${auxB} ${matchedAction.basicInf}.`;
        naturalSentence = `${subN} ${auxN} ${matchedAction.naturalInf}.`;
        highScoreSentence = `${subH} ${auxH} ${matchedAction.highScoreInf}.`;
      }
    } else {
      // Unmatched Action: Check custom key elements (e.g. "我们 应该 去 太空 / 吃 苹果")
      const matchedSub = subDict.find(s => normText.includes(s.key)) || { key: "我们", basic: "We", nat: "We", high: "We" };
      const matchedAux = auxDict.find(a => normText.includes(a.key));
      const matchedVerb = verbDict.find(v => normText.includes(v.key));
      const matchedNoun = nounDict.find(n => normText.includes(n.key));

      if (matchedVerb && matchedNoun) {
        const verbB = matchedVerb.basic;
        const verbN = matchedVerb.nat;
        const verbH = matchedVerb.high;

        const auxB = matchedAux ? ` ${matchedAux.basic}` : " should";
        const auxN = matchedAux ? ` ${matchedAux.nat}` : " need to";
        const auxH = matchedAux ? ` ${matchedAux.high}` : " have an obligation to";

        basicSentence = `${matchedSub.basic}${auxB} ${verbB} ${matchedNoun.basic}.`;
        naturalSentence = `${matchedSub.nat}${auxN} ${verbN} ${matchedNoun.nat}.`;
        highScoreSentence = `${matchedSub.high}${auxH} ${verbH} ${matchedNoun.high}.`;
      } else if (matchedNoun) {
        const auxB = matchedAux ? ` ${matchedAux.basic}` : " should";
        const auxN = matchedAux ? ` ${matchedAux.nat}` : " need to";
        const auxH = matchedAux ? ` ${matchedAux.high}` : " have an obligation to";

        basicSentence = `${matchedSub.basic}${auxB} value ${matchedNoun.basic}.`;
        naturalSentence = `${matchedSub.nat}${auxN} care about ${matchedNoun.nat}.`;
        highScoreSentence = `${matchedSub.high}${auxH} place incredible value on ${matchedNoun.high}.`;
      } else if (matchedVerb) {
        const auxB = matchedAux ? ` ${matchedAux.basic}` : " should";
        const auxN = matchedAux ? ` ${matchedAux.nat}` : " need to";
        const auxH = matchedAux ? ` ${matchedAux.high}` : " have an obligation to";

        basicSentence = `${matchedSub.basic}${auxB} ${matchedVerb.basic}.`;
        naturalSentence = `${matchedSub.nat}${auxN} ${matchedVerb.nat}.`;
        highScoreSentence = `${matchedSub.high}${auxH} ${matchedVerb.high}.`;
      } else {
        // Last-resort pure assertion to avoid analytical wrappers completely!
        basicSentence = `I believe representing "${normText}" is highly constructive.`;
        naturalSentence = `I feel that focusing on "${normText}" brings positive outcomes.`;
        highScoreSentence = `Personally speaking, devoting efforts to achieving "${normText}" is of exceptional significance.`;
      }
    }

    return {
      basicVersion: basicSentence,
      naturalVersion: naturalSentence,
      highScoreVersion: highScoreSentence,
      keyExpressions: keyExprs,
      followUpQuestion: `How do you think we can practice and implement this concept in our speaking schedules?`,
      simpleTips: coachingTips
    };
  };

  try {
    if (!process.env.GEMINI_API_KEY) {
      const simulatedResult = getDynamicHeuristicFallback(chineseText);
      res.json(simulatedResult);
      return;
    }

    const promptMessage = `You are an expert bilingual English-Chinese Speaking Coach teaching Grade 9 Shanghai students.
Analyze the following Chinese sentence that the student wants to express in spoken English.

CHINESE INPUT: "${chineseText}"

Your mission is to generate three translations of the Chinese input: Basic, Natural, and High-Score.

CRITICAL REQUIREMENT - Preserving Original Meaning & Meaning Accuracy:
Meaning preservation is more important than sophistication.

1. Rule 1: The Basic English version must be a direct and accurate translation of the Chinese sentence.
2. Rule 2: The Natural English version may improve fluency, but must not add new people, places, facts, reasons, or opinions that do not exist in the original Chinese sentence.
3. Rule 3: The High-Score version may use more advanced vocabulary and sentence structures, but must preserve the original meaning.
4. CRITICAL WORD BAN: Never automatically add words such as "students", "teenagers", "young people", "children", "parents", "society", "nowadays", or "modern society" unless they explicitly appear in the original Chinese input.
5. NEVER add unrequested details, actors, context, or facts that are not present in the Chinese input. Do not alter who/what the sentence is about.
6. NEVER analyze, discuss, or describe the Chinese sentence or what it expresses (e.g. do not say "the statement expresses that..." or "communicating the idea of..."). You must translate the user's intended meaning directly, so that the generated English sentences are exactly what the user would say to express that meaning themselves in spoken English.
7. Avoid generating generic academic essays or unrelated formal jargon. Keep sentences appropriate for conversational spoken English.
8. Absolute alignment with original intent. For example, if the input is "直接通话吧", the generated English must mean "Let's talk directly" in different styles, and NOT talk about historical explorers, inventions, environment, or health unless the Chinese input itself asks about them. IGNORE any current textbooks/units if they force the meaning or vocabulary to drift away from the Chinese Input. ONLY adapt vocabulary to the current practice theme if it PRESERVES the original Chinese meaning perfectly.
9. NEVER wrap the Chinese sentence inside generic templates like "I want to express my thoughts: ..." or "It is of great significance for me to voice ..." unless the original Chinese statement explicitly contains that meaning. Translate the exact meaning of the Chinese input first, then polish and improve user's grammar in Natural and High-Score versions.

Remember:
- Basic version: A direct, grammatically correct and simple translation.
- Natural version: What native speakers actually say naturally/informally in conversational speech. Keep it simple, friendly, using common spoken idioms, without adding any unmentioned information.
- High-Score version: Grade 9 oral exam perfect score sentence. It uses elegant, advanced sentence structures and premium (yet level-appropriate) vocabulary to impress the assessor, but MUST strictly preserve the same original meaning.
- All three versions must mean exactly what the Chinese input means directly.
- Provide the response in strict JSON format matching the schema below. Keep all tips extremely encouraging and clear for junior high students.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            basicVersion: { type: Type.STRING, description: "Basic English: simple but grammatically correct translation suited for beginners." },
            naturalVersion: { type: Type.STRING, description: "Natural English: how native speakers say it naturally/informally in conversational speech. MUST NOT add any unmentioned facts, people, places, reasons, or words like 'students', 'teenagers', 'children', 'young people', 'parents', 'society'." },
            highScoreVersion: { type: Type.STRING, description: "High-Score version: uses advanced yet level-appropriate vocabulary and structures suitable for Grade 9 high-perf exams. MUST NOT add any unmentioned facts, people, places, reasons, or words like 'students', 'teenagers', 'children', 'young people', 'parents', 'society'." },
            keyExpressions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  expression: { type: Type.STRING, description: "English phrase, keyword or sentence starter." },
                  meaning: { type: Type.STRING, description: "Clear and straightforward Chinese definition or practical usage context." }
                },
                required: ["expression", "meaning"]
              },
              description: "Array of exactly 2 to 4 key expressions/vocab pulled from the translations with helpful Chinese guides."
            },
            followUpQuestion: { type: Type.STRING, description: "One simple and engaging follow-up English question to encourage the user to keep speaking, using the topic." },
            simpleTips: { type: Type.STRING, description: "One simple, ultra-practical coaching tip comparing Chinese thinking vs English natural speaking for this context (written in friendly Chinese)." }
          },
          required: ["basicVersion", "naturalVersion", "highScoreVersion", "keyExpressions", "followUpQuestion", "simpleTips"]
        }
      }
    }); 
    // 2 & 3. Validation for Gemini response candidates and elements presence checks before reading
    if (!response) {
      throw new Error("Gemini API returned an completely undefined response object.");
    }

    if (!response.candidates) {
      throw new Error("Gemini API response possesses no candidates array. The request might have been rejected due to system safeguards.");
    }

    if (response.candidates.length === 0) {
      throw new Error("Gemini API returned an empty candidates list. This generally happens when the content is completely blocked by safety filters or recitation checks.");
    }

    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error("Gemini API candidate[0] is null/undefined despite non-zero array length.");
    }

    if (!candidate.content) {
      throw new Error("Gemini API candidate[0] contains no content property. The generated output might have been censored or cut off midway.");
    }

    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Gemini API candidate[0].content has an empty or missing 'parts' array.");
    }

    const firstPart = candidate.content.parts[0];
    if (!firstPart) {
      throw new Error("Gemini API candidate[0].content.parts[0] is null/undefined.");
    }

    const resultText = firstPart.text;
    if (resultText === undefined || resultText === null) {
      throw new Error("Gemini API candidate[0].content.parts[0] contains empty or missing text field.");
    }
 
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("[API ERROR] /api/expression-coach Exception caught in server.ts:", error);
    const isQuotaError = error?.status === 429 || error?.code === 429 || JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota");
    if (isQuotaError) {
      console.log("[Info] Gemini API quota limit met, running dynamic expression polish matrices.");
    } else {
      console.log("[Info] Gemini API transiently offline, running dynamic expression polish matrices.");
    }
    try {
      const simulatedResult = getDynamicHeuristicFallback(chineseText);
      res.json({ ...simulatedResult, isFallback: true });
    } catch (fallbackError: any) {
      res.status(500).json({
        error: "An error occurred with our coach database.",
        details: error.message
      });
    }
  }
});

const getSimulatedEssayFallback = (text: string) => {
    const normText = text.replace(/[。，！？、.,!?]/g, "").trim();

    // 1. Email/Letter Format Check
    if (normText.includes("写信") || normText.includes("邮件") || normText.includes("信") || /email|letter|dear/i.test(normText)) {
      return {
        simpleSentence: "I am writing this letter to share my daily school life with you.",
        threeSentenceVersion: [
          {
            en: "How is everything going with you recently?",
            cn: "你最近一切都还好吗？",
            focus: "Greeting & Opening (问候开篇)"
          },
          {
            en: "Our school sports festival is coming next week, and I am busy preparing for it.",
            cn: "我们学校的体育节下周就要到了，我正忙着做准备。",
            focus: "Core Message (核心内容)"
          },
          {
            en: "I am looking forward to hearing from you soon and receiving your reply.",
            cn: "我期待着很快收到你的来信并得到你的回复。",
            focus: "Warm Closing (温馨结尾)"
          }
        ],
        examParagraph: "Dear friend,\nHow is everything going? I am writing this letter to invite you to join our school's upcoming cultural festival. It is a wonderful event where we can show our talents and communicate in English. Not only can we take part in various sports, but we can also share interesting stories with each other. I would be extremely happy if you could come and spend the weekend with us. Looking forward to your early reply.\nYours,\nLi Hua",
        paragraphTranslation: "亲爱的朋友：\n你最近一切都好吗？我写这封信是想邀请你参加我们学校即将举行的文化节。这是一个美妙的活动，我们可以在这里展示才华并用英语进行交流。我们不仅能参加各种体育活动，还能和彼此分享有趣的故事。如果你能来和我们一起度过周末，我将会非常高兴。期待你的尽早回复。\n最真挚的问候\n李华",
        keyVocab: [
          { word: "How is everything going?", meaning: "最近一切都好吗？" },
          { word: "upcoming cultural festival", meaning: "即将到来的文化节" },
          { word: "show our talents", meaning: "展示我们的才华" },
          { word: "looking forward to your early reply", meaning: "期待你的尽早回复" }
        ]
      };
    }

    // 2. Environmental Protection
    if (normText.includes("保护环境") || normText.includes("环境") || normText.includes("人人有责") || /environment|protect|earth/i.test(normText)) {
      return {
        simpleSentence: "In my opinion, everyone should do their part to protect the environment.",
        threeSentenceVersion: [
          {
            en: "Protecting the environment is of great importance for everyone.",
            cn: "保护环境对每个人来说都极其重要。",
            focus: "Opening Theme (首句入题)"
          },
          {
            en: "If we continue to throw litter everywhere, our home planet will be destroyed.",
            cn: "如果我们继续到处扔垃圾，我们的地球家园就会被破坏。",
            focus: "Supporting Detail (逻辑支柱)"
          },
          {
            en: "Therefore, we must take immediate action to save our beautiful Earth.",
            cn: "因此，我们必须立即采取行动来拯救我们美丽的地球。",
            focus: "Impact/Conclusion (升华结尾)"
          }
        ],
        examParagraph: "As is well known, environmental protection has become a hot topic in recent years. Personally, I strongly believe that keeping a clean environment is critical to our daily lives. On one hand, we are supposed to save water and electricity in our daily routines. On the other hand, using public transport and planting trees can help reduce pollution. In conclusion, even a small effort from each of us can make a big difference in creating a greener world.",
        paragraphTranslation: "众所周知，环境保护已成为近年来的热门话题。就我个人而言，我深信保持清洁的环境对我们的日常生活至关重要。一方面，我们在日常例行公事中应该节约用水和用电。另一方面，使用公共交通和植树造林有助于减少污染。总之，我们每个人哪怕做出微小的努力，也可以在创造更绿色的世界方面产生重大影响。",
        keyVocab: [
          { word: "environmental protection", meaning: "环境保护" },
          { word: "be critical to", meaning: "对……至关重要" },
          { word: "reduce pollution", meaning: "减少污染" },
          { word: "make a big difference", meaning: "起到大作用；产生显著影响" }
        ]
      };
    }

    // 3. Health & Exercise
    if (normText.includes("健康") || normText.includes("锻炼") || normText.includes("健身") || normText.includes("身体") || normText.includes("生活方式") || normText.includes("养生") || /health|exercise|fit|gym|workout|lifestyle|wellness|active/i.test(normText)) {
      return {
        simpleSentence: "Exercising every day helps us keep fit and active.",
        threeSentenceVersion: [
          {
            en: "Developing a habit of regular exercise brings numerous benefits to our physical development.",
            cn: "养成定期体能锻炼的习惯能给我们的身体发育带来诸多好处。",
            focus: "Benefits of Exercise (锻炼之益)"
          },
          {
            en: "It not only builds up our bodies, but also helps to relax our minds and reduce daily study pressure.",
            cn: "它不仅能强健我们的体魄，还有助于放松身心并减轻日常学习压力。",
            focus: "Physical & Mental Health (身心健康)"
          },
          {
            en: "Therefore, we ought to incorporate physical activities into our routines to cultivate healthy lifestyle habits.",
            cn: "因此，我们应该将体育活动融入日常生活中，以培养健康的生活习惯。",
            focus: "Healthy Lifestyle Habits (健康生活习惯)"
          }
        ],
        examParagraph: "Undoubtedly, doing regular exercise plays an indispensable role in maintaining our overall well-being. From my perspective, staying healthy is of great importance for school students to enjoy their classes. On the one hand, active daily routines are highly recommended for building strong bodies and preventing diseases. On the other hand, participating in physical activities after class is extremely helpful in reducing stress and refreshing our minds. In conclusion, cultivating a positive attitude toward exercise is the key to healthy living, and we should make active efforts to practice it every single day.",
        paragraphTranslation: "毫无疑问，进行定期锻炼在维持我们的整体健康方面扮演着不可或缺的角色。在我看来，保持健康对于学生享受课堂至关重要。一方面，强烈推荐在日常生活中积极锻炼，以强身健体并预防疾病。另一方面，课后参加体育活动对减轻压力、清脑醒神极有帮助。总之，培养对锻炼的积极态度是健康生活的关键，我们应该积极努力，每天付诸实践。",
        keyVocab: [
          { word: "regular exercise", meaning: "定期体育锻炼" },
          { word: "staying healthy", meaning: "保持健康; 维持健康" },
          { word: "building strong bodies", meaning: "强身健体" },
          { word: "reducing stress", meaning: "减轻压力; 缓解/缓和压力" },
          { word: "healthy living", meaning: "健康生活" }
        ]
      };
    }

    // 4. Diet & Health
    if (normText.includes("吃蔬菜") || normText.includes("蔬菜") || normText.includes("水果") || normText.includes("饮食") || /food|eat|fruit|diet/i.test(normText)) {
      return {
        simpleSentence: "We should eat more fresh fruit and vegetables to stay healthy.",
        threeSentenceVersion: [
          {
            en: "Eating fruit and vegetables plays a vital role in our daily diet.",
            cn: "在日常饮食中，多吃水果和蔬菜起着至关重要的作用。",
            focus: "Opening Theme (首句入题)"
          },
          {
            en: "They provide our bodies with essential vitamins to prevent illnesses.",
            cn: "它们为我们的身体提供不可或缺的维生素以预防疾病。",
            focus: "Supporting Detail (逻辑支柱)"
          },
          {
            en: "Only in this way can we stay energetic during our school days.",
            cn: "只有这样，我们才能在校园生活里保持精力充沛。",
            focus: "Impact/Conclusion (升华结尾)"
          }
        ],
        examParagraph: "When it comes to staying healthy, a balanced diet plays an essential role for school students. It is highly recommended that we eat fruit and vegetables as frequently as possible. Not only do they keep our bodies fit, but they also provide us with essential vitamins to fight off diseases. By contrast, junk food full of fat should be avoided. Only in this way can we build up our strength and enjoy a wonderful high school life.",
        paragraphTranslation: "谈到保持健康，均衡的饮食对学生来说起着至关重要的作用。强烈建议我们尽可能经常吃水果和蔬菜。它们不仅能让我们的身体保持健壮，还能为我们提供必不可少的维生素以抵御疾病。相比之下，应该避免吃含有过多脂肪的垃圾食品。只有这样，我们才能增强体质，享受美好的中学生活。",
        keyVocab: [
          { word: "balanced diet", meaning: "均衡饮食" },
          { word: "highly recommended", meaning: "强烈推荐、十分建议" },
          { word: "keep our bodies fit", meaning: "保持身体健壮" },
          { word: "build up our strength", meaning: "增强体质" }
        ]
      };
    }

    // 5. Books & Reading
    if (normText.includes("读书") || normText.includes("喜欢读书") || normText.includes("阅读") || /read|book/i.test(normText)) {
      return {
        simpleSentence: "I enjoy reading books in my spare time.",
        threeSentenceVersion: [
          {
            en: "Reading is one of my favorite hobbies.",
            cn: "阅读是我最喜爱的爱好之一。",
            focus: "Opening Theme (首句入题)"
          },
          {
            en: "It not only broadens my horizons but also helps me acquire plenty of knowledge.",
            cn: "它不仅开阔了我的视野，还能帮我获取丰富的知识。",
            focus: "Supporting Detail (逻辑支柱)"
          },
          {
            en: "In brief, reading makes my life more colorful and meaningful.",
            cn: "简而言之，阅读使我的生活变得更有趣、更有意义。",
            focus: "Impact/Conclusion (升华结尾)"
          }
        ],
        examParagraph: "As the saying goes, books are our best friends. In my opinion, cultivating a good reading habit is of great value for teenagers' personal growth. On the one hand, reading widely broadens our minds and provides us with a precious chance to explore different cultures. On the other hand, a good book can always guide us through difficulties when we feel down. Therefore, we should read as many great books as possible to enrich our lives and make our school days enjoyable.",
        paragraphTranslation: "俗话说，书是人类最好的朋友。在我看来，培养良好的阅读习惯对青少年的个人成长有很大的价值。一方面，广泛的阅读开阔了我们的眼界，也为我们提供了一个体验不同文化的珍贵机会。另一方面，当我们心情低落时，一本好书总能引导我们渡过难关。因此，我们应该尽可能多读好书，以充实我们的生活，使我们的校园时光充满乐趣。",
        keyVocab: [
          { word: "cultivate a reading habit", meaning: "培养阅读习惯" },
          { word: "of great value", meaning: "大有价值；极其重要" },
          { word: "broaden our minds", meaning: "开阔心脑、启发思维" },
          { word: "enrich our lives", meaning: "丰富/充实我们的生活" }
        ]
      };
    }

    // 6. Sports & Exercise, Activities, Hobbies (High Priority: check sports/exercise/hobbies BEFORE people/friends to keep them distinct)
    if (normText.includes("运动") || normText.includes("足球") || normText.includes("踢球") || normText.includes("跑") || normText.includes("风筝") || normText.includes("公园") || normText.includes("周末") || normText.includes("游") || /sport|exercise|run|play|kite|park|weekend/i.test(normText)) {
      if (normText.includes("风筝") || normText.includes("公园") || normText.includes("周末")) {
        return {
          simpleSentence: "I love flying kites in the park with my friends on weekends.",
          threeSentenceVersion: [
            {
              en: "Flying kites in the park with friends is a highly relaxing activity on weekends.",
              cn: "在周末和朋友在公园里放风筝是一项非常令人放松的活动。",
              focus: "Opening Theme (首句入题)"
            },
            {
              en: "It not only allows us to breathe fresh air but also enhances our precious friendship.",
              cn: "它不仅能让我们呼吸新鲜空气，还能增进我们珍贵的友谊。",
              focus: "Supporting Detail (逻辑支柱)"
            },
            {
              en: "Therefore, we should find more opportunities to play outdoors and stay close to nature.",
              cn: "因此，我们应该寻找更多机会在户外玩耍，亲近大自然。",
              focus: "Impact/Conclusion (升华结尾)"
            }
          ],
          examParagraph: "Among all the outdoor activities, flying kites in the park with my friends on weekends is my absolute favorite. It is highly recommended to participate in such healthy hobbies as frequently as possible. Not only does flying kites keep us fit and active, but it also provides a perfect chance to communicate with each other. By contrast, staying indoors playing computer games all day should be avoided. Only in this way can we relieve academic pressure, appreciate beautiful nature, and enjoy an unforgettable school life.",
          paragraphTranslation: "在所有的户外活动中，周末和朋友在公园里放风筝是我的最爱。强烈建议大家多参加这类健康的爱好。放风筝不仅能让我们保持健康和活跃，还提供了一个非常棒的交流机会。相比之下，应该避免整天待在室内玩电脑游戏。只有这样，我们才能缓解学业压力，欣赏美丽的大自然，并享受难忘的学校生活。",
          keyVocab: [
            { word: "flying kites", meaning: "放风筝" },
            { word: "healthy hobbies", meaning: "健康的爱好" },
            { word: "perfect chance", meaning: "沟通交流的完美机会" },
            { word: "relieve academic pressure", meaning: "缓解学业压力" }
          ]
        };
      }
      return {
        simpleSentence: "Exercising regularly can help us stay strong and healthy.",
        threeSentenceVersion: [
          {
            en: "Doing regular exercise is highly beneficial for our health.",
            cn: "定期进行体育锻炼对我们的健康大有好处。",
            focus: "Opening Theme (首句入题)"
          },
          {
            en: "It is a reliable way to relieve academic pressure after heavy schoolwork.",
            cn: "在繁重的功课之余，这是缓解学业压力的一种可靠方式。",
            focus: "Supporting Detail (逻辑支柱)"
          },
          {
            en: "Therefore, we should form a habit of exercising every single day.",
            cn: "因此，我们应该养成每天锻炼生命的大好习惯。",
            focus: "Impact/Conclusion (升华结尾)"
          }
        ],
        examParagraph: "Undoubtedly, sports play an indispensable part in our junior high school lives. From my perspective, exercising regularly enables us to build up our bodies and ease study stress. For instance, playing basketball or football can not only foster our teamwork spirit but also help us make new friends. In a word, taking part in physical activities is of great significance, and we ought to set aside some time for it every day.",
        paragraphTranslation: "毫无疑问，体育运动在我们的初中生活中扮演着不可或缺的角色。在我看来，定期进行体育锻炼使我们能够强身健体，还能缓解学习压力。例如，多打篮球或踢足球不仅能培养我们的团队协作精神，还能帮我们交到新朋友。总之，参加体育活动具有重大意义，我们应该每天留出一部分时间进行锻炼。",
        keyVocab: [
          { word: "indispensable part", meaning: "不可或缺的一部分" },
          { word: "exercising regularly", meaning: "定期进行体育锻炼" },
          { word: "ease study stress", meaning: "缓解/减轻学习压力" },
          { word: "foster teamwork spirit", meaning: "培养团队协作精神" }
        ]
      };
    }

    // 7. People / Travel Writers / Admiration (e.g. 徐霞客, 人物, 老师, 朋友)
    if (normText.includes("徐霞客") || normText.includes("作家") || normText.includes("老师") || normText.includes("朋友") || normText.includes("他") || normText.includes("她") || /writer|teacher|friend|person|admir/i.test(normText)) {
      if (normText.includes("老师") || /teacher/i.test(normText)) {
        return {
          simpleSentence: "My favorite teacher is a highly kind and knowledgeable person.",
          threeSentenceVersion: [
            {
              en: "My English teacher, Mr. Wang, is widely admired by all of us.",
              cn: "我们的英语老师王老师深受我们所有人的钦佩。",
              focus: "Who He/She Was (人物介绍)"
            },
            {
              en: "He always uses creative methods to make his classes lively and interesting.",
              cn: "他总是使用富有创意的方法让课堂生动有趣。",
              focus: "What He/She Achieved (主要事迹)"
            },
            {
              en: "His constant encouragement inspires me to study harder and face challenges confidently.",
              cn: "他不断的鼓励激励着我更加努力学习，自信地面对挑战。",
              focus: "Inspiration & Respect (感悟与启发)"
            }
          ],
          examParagraph: "Among all the teachers who have taught me, my English teacher is the one whom I admire most. He is famous for his outstanding teaching skills and humorous personality in our school. He spends much of his time answering our questions patiently, regardless of how tired he is. From his encouraging words, I have learned the great value of passion and responsibility in life. In a word, his deep love for education will continue to inspire us to pursue our dreams.",
          paragraphTranslation: "在所有教过我的老师中，我的英语老师是我最钦佩的人。他因出色的教学方法和幽默的性格在学校里非常出名。他不顾有多么疲惫，总是花很多时间耐心地解答我们的问题。从他的鼓励中，我学到了生活中热情和责任感的巨大价值。一句话，他对教育的深沉热爱将继续激励我们去追求梦想。",
          keyVocab: [
            { word: "outstanding teaching skills", meaning: "出色的教学方法" },
            { word: "humorous personality", meaning: "幽默的性格" },
            { word: "patiently", meaning: "耐心地" },
            { word: "pursue our dreams", meaning: "追逐梦想" }
          ]
        };
      }
      if (normText.includes("朋友") || normText.includes("同学") || /friend|classmate/i.test(normText)) {
        return {
          simpleSentence: "My best friend is an incredibly friendly and supportive classmate.",
          threeSentenceVersion: [
            {
              en: "My best friend, Li Hua, is a kind-hearted classmate who always stands by me.",
              cn: "我最好的朋友李华是一个总是支持我的善良同学。",
              focus: "Who He/She Was (人物介绍)"
            },
            {
              en: "Whenever I run into difficulties, she is always ready to offer her timely help.",
              cn: "每当我遇到困难时，她总是准备好提供及时的帮助。",
              focus: "What He/She Achieved (主要事迹)"
            },
            {
              en: "Our deep friendship plays an essential part in my junior high school life.",
              cn: "我们深厚的友谊在我的初中生活中扮演着极其重要的角色。",
              focus: "Inspiration & Respect (感悟与启发)"
            }
          ],
          examParagraph: "During my junior high school years, my classmate Li Hua is the best friend whom I treasure most. She is famous among us for her cheerful personality and kind-hearted nature. Whenever I encounter academic difficulties or feel down, she is always willing to share my worries and offer timely help. From her great kindness, I have learned the true meaning of friendship and mutual support. Therefore, our precious bond will continue to inspire me to be a better person.",
          paragraphTranslation: "在我的初中生涯里，我的同学李华是我最珍视的好朋友。她因开朗的个性和善良的本质在我们中非常出名。每当我遇到学业困难或心情低落时，她总是乐意分担我的忧虑并提供及时的帮助。从她巨大的善良中，我学到了友谊和相互扶持的真正意义。因此，我们珍贵的纽带将继续激励我成为一个更好的人。",
          keyVocab: [
            { word: "treasure most", meaning: "最珍视" },
            { word: "cheerful personality", meaning: "开朗的个性" },
            { word: "mutual support", meaning: "相互扶持" },
            { word: "precious bond", meaning: "珍贵的纽带" }
          ]
        };
      }
      return {
        simpleSentence: "Xu Xiake was a highly famous geographer and travel writer in ancient China.",
        threeSentenceVersion: [
          {
            en: "Xu Xiake is widely known as a legendary Chinese traveler who wrote wonderful travel journals.",
            cn: "徐霞客作为写下了精彩旅行日记的中国传奇旅行家而广为人知。",
            focus: "Who He Was (人物介绍)"
          },
          {
            en: "He spent most of his life exploring beautiful mountains and rivers, regardless of hardships.",
            cn: "你不畏艰难险阻，用大半生时间探索祖国的大好河山。",
            focus: "What He Achieved (主要成就)"
          },
          {
            en: "His incredible courage and great determination always inspire me to pursue my dreams.",
            cn: "他惊人的勇气和坚定的决心总是鼓舞着我追逐自己的梦想。",
            focus: "Inspiration & Respect (感悟与启发)"
          }
        ],
        examParagraph: "Among all the historical figures, Xu Xiake is the legendary travel writer whom I admire most. He is famous worldwide for his outstanding geographical achievements and detailed travel journals in ancient China. He spent his entire life exploring scenic mountains and magnificent rivers, regardless of any hardships. From his legendary stories, I have learned the great value of courage and perseverance in achieving goals. Therefore, his endless passion for nature continues to inspire teenagers to explore the beautiful world.",
        paragraphTranslation: "在所有历史人物中，徐霞客是我最钦佩的传奇旅行作家。他因在中国古代杰出的地理学成就和详尽的旅行日记而在世界范围内闻名。他不顾任何艰难险阻，一生都在探索风景秀丽的山脉和雄伟的河流。从他的传奇故事中，我学到了获取成功所需的勇气和坚毅的巨大价值。因此，他对大自然无限的热爱将持续激励青少年去探索这个世界。",
        keyVocab: [
          { word: "legendary travel writer", meaning: "传奇旅行作家" },
          { word: "regardless of any hardships", meaning: "不顾任何艰难险阻" },
          { word: "learn the value of perseverance", meaning: "学会坚毅的价值" },
          { word: "inspire modern teenagers", meaning: "激励现代青少年" }
        ]
      };
    }

    // 8. General adaptive fallback (smartly binds user's custom context instead of generic moralizing templates)
    const escapedText = text.replace(/"/g, "'");
    return {
      simpleSentence: `I deeply believe that we can get a great harvest from "${escapedText}".`,
      threeSentenceVersion: [
        {
          en: `When it comes to "${escapedText}", many middle school students show a keen interest.`,
          cn: `谈到“${escapedText}”，许多中学生都展现出了浓厚的兴趣。`,
          focus: "Set the Scene (引出主题)"
        },
        {
          en: `Choosing to explore this area helps us make continuous progress in our daily studies.`,
          cn: `选择对这一领域进行探索，有助于我们在日常学习中取得长足进步。`,
          focus: "Process & Actions (具体过程)"
        },
        {
          en: `In brief, it plays an active part in shaping our positive attitudes toward future growth.`,
          cn: `简而言之，它在塑造我们面对未来成长的积极态度方面，起着非常重要的作用。`,
          focus: "Conclusion (升华启发)"
        }
      ],
      examParagraph: `Regarding "${escapedText}", it plays an important part in our school lives. Firstly, organizing our thoughts on it offers a perfect chance to communicate with our classmates and teachers. Secondly, experiencing this ourselves helps build up our confidence when we encounter unexpected challenges in the future. Therefore, we should make active efforts to put it into practice in our daily learning. Only in this way can we enjoy our school days and make progress step by step.`,
      paragraphTranslation: `关于“${escapedText}”，它在我们的学校生活中扮演着极为重要的角色。首先，就其整理想法提供了一个与同学和老师交流的绝佳机会。其次，亲身体验这一点，有助于在未来我们遇到意想不到的挑战时建立起极大的信心。因此，我们在日常学习中要积极努力地把它付诸于实践。只有这样，我们才能享受校园时光，并一步步取得进步。`,
      keyVocab: [
        { word: "regarding / when it comes to...", meaning: "关于；谈到" },
        { word: "perfect chance / opportunity", meaning: "绝佳的机会" },
        { word: "encounter unexpected challenges", meaning: "遇到意想不到的挑战" },
        { word: "make active efforts to do", meaning: "积极努力地做某事" }
      ]
    };
  };

/**
 * Endpoint for the Chinese to English Essay Builder (中考作文扩写助手)
 * Input: { chineseText: string }
 * Output: { simpleSentence: string, threeSentenceVersion: Array<{en: string, cn: string, focus: string}>, examParagraph: string, paragraphTranslation: string, keyVocab: Array<{word: string, meaning: string}> }
 */
app.post("/api/essay-builder", async (req: Request, res: Response): Promise<void> => {
  const { chineseText = "" } = req.body;

  if (!chineseText || chineseText.trim() === "") {
    res.status(400).json({ error: "Please enter a Chinese sentence." });
    return;
  }

  try {
    // END_OF_DUPLICATE_BLOCK
    if (!process.env.GEMINI_API_KEY) {
      const fallbackResult = getSimulatedEssayFallback(chineseText);
      res.json({ ...fallbackResult, isFallback: true });
      return;
    }

    const essayPrompt = `You are an elite, highly professional junior high school English teacher and senior writing expert dedicated to the Shanghai Grade 9 Secondary School Entrance Examination (中考).
The student wants to write a high-scoring exam composition starting from this one Chinese sentence: "${chineseText}".

Analyze the input sentence and generate a JSON with three progressive levels of expansion:
1. "simpleSentence": A clean, grammatically correct, and beautifully natural English sentence translating the Chinese input directly. This shouldn't be overloaded, but must avoid basic errors and sound natural.
2. "threeSentenceVersion": An array of exactly 3 sequential English sentences that logically expand the starting idea (Introduction -> Supporting Argument/Detail -> Conclusion/Impact).
   Each object in the array must have:
   - "en": A highly idiomatic, fluent English sentence.
   - "cn": Simple and helpful Chinese explanation of what this sentence expresses.
   - "focus": Short title/reason for this expanded sentence (e.g. "Opening Theme (首句入题)", "Supporting Detail (逻辑支柱)", "Impact/Conclusion (升华结尾)").
3. "examParagraph": A cohesive, polished paragraph of 5-6 sentences, integrating the expanded idea. It should read like an authentic perfect-score Shanghai Zhongkao model essay.
4. "paragraphTranslation": Natural and elegant translation of the exam paragraph into Chinese.
5. "keyVocab": An array of 3-4 advanced but elegant vocabulary items or phrases used in the "examParagraph" to help students memorize.
   Each object must have:
   - "word": The English word or phrase.
   - "meaning": The Chinese meaning.

CRITICAL QUALITY COMPLIANCE DIRECTIVES (严守自然流畅与中考规范):
- DO NOT use stiff or unnatural Chinglish expressions.
- Prioritize natural, fluent collocations over artificial and mechanical complex grammar.
- NEVER use "keeping doing exercises" or "keep doing exercises". Instead, use "doing regular exercise", "exercising regularly", "taking more exercise" or "taking part in sports".
- NEVER use "learn knowledge" or "learn more knowledge". Instead, use "acquire knowledge", "gain knowledge", "obtain information" or "broaden our horizons".
- Avoid artificial terms like "teenager development" (use "teenagers' growth" or "personal growth"), "physical bodies" (use "keep fit" or "stay healthy"), or "dynamic energy" (use "stay energetic" or "stay active").
- Fully ensure all conjunctions (e.g. "Not only... but also", "On one hand... on the other hand", "Therefore") flow seamlessly and make perfect cohesive sense.

Return your response in strict JSON format matching the schema above. All fields are required.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: essayPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            simpleSentence: { type: Type.STRING },
            threeSentenceVersion: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  en: { type: Type.STRING },
                  cn: { type: Type.STRING },
                  focus: { type: Type.STRING }
                },
                required: ["en", "cn", "focus"]
              },
              description: "Must contain exactly 3 objects expanding the idea."
            },
            examParagraph: { type: Type.STRING },
            paragraphTranslation: { type: Type.STRING },
            keyVocab: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                },
                required: ["word", "meaning"]
              }
            }
          },
          required: ["simpleSentence", "threeSentenceVersion", "examParagraph", "paragraphTranslation", "keyVocab"]
        }
      }
    }); 
    // 2 & 3. Validation for Gemini response candidates and elements presence checks before reading
    if (!response) {
      throw new Error("Gemini API returned an completely undefined response object.");
    }

    if (!response.candidates) {
      throw new Error("Gemini API response possesses no candidates array. The request might have been rejected due to system safeguards.");
    }

    if (response.candidates.length === 0) {
      throw new Error("Gemini API returned an empty candidates list. This generally happens when the content is completely blocked by safety filters or recitation checks.");
    }

    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error("Gemini API candidate[0] is null/undefined despite non-zero array length.");
    }

    if (!candidate.content) {
      throw new Error("Gemini API candidate[0] contains no content property. The generated output might have been censored or cut off midway.");
    }

    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Gemini API candidate[0].content has an empty or missing 'parts' array.");
    }

    const firstPart = candidate.content.parts[0];
    if (!firstPart) {
      throw new Error("Gemini API candidate[0].content.parts[0] is null/undefined.");
    }

    const resultText = firstPart.text;
    if (resultText === undefined || resultText === null) {
      throw new Error("Gemini API candidate[0].content.parts[0] contains empty or missing text field.");
    }
 
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("[API ERROR] /api/essay-builder Exception caught in server.ts:", error);
    const isQuotaError = error?.status === 429 || error?.code === 429 || JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota");
    if (isQuotaError) {
      console.log("[Info] Gemini API quota limit met, running custom essay expander matrix.");
    } else {
      console.log("[Info] Gemini API transiently offline, running custom essay expander matrix.");
    }
    try {
      const fallbackResult = getSimulatedEssayFallback(chineseText);
      res.json({ ...fallbackResult, isFallback: true });
    } catch (simError: any) {
      res.status(500).json({
        error: "An error occurred with our essay coach database.",
        details: error.message
      });
    }
  }
});

/**
 * Simple Chinese to Pinyin converter to support custom names if fallback database runs
 */
function convertChineseToPinyin(chinese: string): string {
  const charDict: Record<string, string> = {
    "徐": "Xu", "霞": "Xia", "客": "Ke", "胡": "Hu", "歌": "Ge", "李": "Li", "白": "Bai", "杜": "Du", "甫": "Fu",
    "苏": "Su", "轼": "Shi", "陶": "Tao", "渊": "Yuan", "明": "Ming", "珍": "Zhen", "时": "Shi", "袁": "Yuan",
    "隆": "Long", "平": "Ping", "王": "Wang", "张": "Zhang", "刘": "Liu", "陈": "Chen", "杨": "Yang", "赵": "Zhao",
    "黄": "Huang", "周": "Zhou", "吴": "Wu", "孙": "Sun", "红": "Hong", "大": "Da", "小": "Xiao",
    "华": "Hua", "丽": "Li", "飞": "Fei", "龙": "Long", "风": "Feng", "静": "Jing", "杰": "Jie", "豪": "Hao",
    "晨": "Chen", "宇": "Yu", "欣": "Xin", "博": "Bo", "文": "Wen", "强": "Qiang", "军": "Jun", "东": "Dong",
    "国": "Guo", "民": "Min", "安": "An", "洋": "Yang", "超": "Chao", "波": "Bo", "涛": "Tao",
    "建": "Jian", "辉": "Hui", "林": "Lin", "森": "Sen", "海": "Hai", "山": "Shan", "川": "Chuan", "凡": "Fan",
    "锋": "Feng"
  };
  
  let pinyin = "";
  for (let i = 0; i < chinese.length; i++) {
    const char = chinese[i];
    if (charDict[char]) {
      pinyin += charDict[char];
    } else {
      const code = char.charCodeAt(0);
      if (code >= 0x4e00 && code <= 0x9fa5) {
        // if we couldn't match, just skip so the grammar remains robust
      } else {
        pinyin += char;
      }
    }
  }
  return pinyin.trim() || "Someone Special";
}

/**
 * Robust translator mapping specific Chinese entities inputted by Grade 9 students
 * into appropriate high-score English equivalents.
 */
function translateChineseNouns(text: string) {
  const result: {
    personName?: string;
    placeName?: string;
    restaurantName?: string;
    dishName?: string;
    activityName?: string;
    giftName?: string;
    bookTitle?: string;
    authorName?: string;
    companionName?: string;
    subjectName?: string;
    giverName?: string;
  } = {};

  if (!text) return result;

  // 1. Person mapping
  if (text.includes("徐霞客")) result.personName = "Xu Xiake";
  else if (text.includes("李白")) result.personName = "Li Bai";
  else if (text.includes("杜甫")) result.personName = "Du Fu";
  else if (text.includes("苏轼") || text.includes("苏东坡")) result.personName = "Su Shi";
  else if (text.includes("鲁迅")) result.personName = "Lu Xun";
  else if (text.includes("雷锋")) result.personName = "Lei Feng";
  else if (text.includes("司马迁")) result.personName = "Sima Qian";
  else if (text.includes("李时珍")) result.personName = "Li Shizhen";
  else if (text.includes("袁隆平")) result.personName = "Yuan Longping";
  else if (text.includes("屠呦呦")) result.personName = "Tu Youyou";
  else if (text.includes("郑和")) result.personName = "Zheng He";
  else if (text.includes("张骞")) result.personName = "Zhang Qian";

  // 2. Play / Book Title mapping
  if (text.includes("皇帝的新装")) {
    result.bookTitle = "The Emperor's New Clothes";
    result.authorName = "Hans Christian Andersen";
  } else if (text.includes("小王子")) {
    result.bookTitle = "The Little Prince";
    result.authorName = "Antoine de Saint-Exupéry";
  } else if (text.includes("鲁宾逊漂流记") || text.includes("鲁滨逊漂流记")) {
    result.bookTitle = "Robinson Crusoe";
    result.authorName = "Daniel Defoe";
  } else if (text.includes("汤姆索亚") || text.includes("汤姆·索亚")) {
    result.bookTitle = "Tom Sawyer";
    result.authorName = "Mark Twain";
  } else if (text.includes("哈姆雷特")) {
    result.bookTitle = "Hamlet";
    result.authorName = "William Shakespeare";
  } else if (text.includes("花木兰")) {
    result.bookTitle = "Mulan";
  }

  // 3. Place / Restaurant Names
  if (text.includes("阳光面馆") || text.includes("阳光")) {
    result.restaurantName = "Sunshine Noodle House";
  } else if (text.includes("绿洲")) {
    result.restaurantName = "Green Oasis";
  } else if (text.includes("南京路")) {
    result.placeName = "Nanjing Road";
  } else if (text.includes("淮海路")) {
    result.placeName = "Huaihai Road";
  } else if (text.includes("外滩")) {
    result.placeName = "the Bund";
  } else if (text.includes("学校旁边") || text.includes("校门口") || text.includes("学校旁")) {
    result.placeName = "near our school";
  }

  // 4. Dish names
  if (text.includes("牛肉面") || text.includes("面条")) {
    result.dishName = "delicious beef noodles";
  } else if (text.includes("水饺") || text.includes("饺子")) {
    result.dishName = "steamed dumplings";
  } else if (text.includes("小笼包")) {
    result.dishName = "traditional soup dumplings";
  } else if (text.includes("烤三文鱼") || text.includes("三文鱼")) {
    result.dishName = "baked salmon with herbs";
  }

  // 5. Activity / Sports
  if (text.includes("羽毛球")) {
    result.activityName = "badminton";
  } else if (text.includes("篮球")) {
    result.activityName = "basketball";
  } else if (text.includes("足球")) {
    result.activityName = "soccer";
  } else if (text.includes("乒乓球")) {
    result.activityName = "table tennis";
  } else if (text.includes("游泳")) {
    result.activityName = "swimming";
  } else if (text.includes("跑步")) {
    result.activityName = "running";
  }

  // 6. Gift / Object details
  if (text.includes("折的纸星") || text.includes("纸星") || text.includes("星星")) {
    result.giftName = "beautifully folded paper stars";
  } else if (text.includes("词典") || text.includes("字典")) {
    result.giftName = "an old dictionary";
  } else if (text.includes("手表")) {
    result.giftName = "a delicate wrist watch";
  } else if (text.includes("钢笔")) {
    result.giftName = "a beautiful fountain pen";
  }

  // 7. Giver / Friend Names / Companion
  if (text.includes("小明")) {
    result.companionName = "Xiao Ming";
  } else if (text.includes("李华")) {
    result.companionName = "Li Hua";
  } else if (text.includes("华华")) {
    result.companionName = "Hua Hua";
  } else if (text.includes("小红")) {
    result.companionName = "Xiao Hong";
  } else if (text.includes("韩梅梅")) {
    result.companionName = "Han Meimei";
  } else if (text.includes("好朋友") || text.includes("朋友")) {
    result.companionName = "my best friend";
  }

  if (text.includes("爷爷") || text.includes("外公")) {
    result.giverName = "grandfather";
  } else if (text.includes("妈妈") || text.includes("母亲")) {
    result.giverName = "mother";
  } else if (text.includes("爸爸") || text.includes("父亲")) {
    result.giverName = "father";
  } else if (text.includes("老师")) {
    result.giverName = "teacher";
  }

  // 8. Subjects
  if (text.includes("数学") && text.includes("英语")) {
    result.subjectName = "math and English lessons";
  } else if (text.includes("数学")) {
    result.subjectName = "math homework";
  } else if (text.includes("英语")) {
    result.subjectName = "English homework";
  } else if (text.includes("物理")) {
    result.subjectName = "physics homework";
  } else if (text.includes("化学")) {
    result.subjectName = "chemistry homework";
  }

  return result;
}

/**
 * Fallback generator for Textbook Writing Coach in case of Gemini API Quota Exhaustion or Key Exceeded
 */
function getSimulatedWritingFallback(taskId: string, chineseIdeas: string) {
  const task = WRITING_TASKS.find(t => t.id === taskId) || WRITING_TASKS[0];
  const ideasText = chineseIdeas ? ` (融合想法: ${chineseIdeas})` : "";

  // Dynamic noun conversion derived from user's manual ideas override
  const nouns = translateChineseNouns(chineseIdeas);

  // Dedicated handcrafted textbook database to ensure specific structures & linguistic elements for each lesson
  const fallbackDatabase: Record<string, { composition: string; highScoreVersion: string; modelAnswer: string }> = {
    "1": {
      composition: `Marco Polo is one of the most adventurous travel writers in history. In the 13th century, he spent over twenty years traveling across Asian lands. His famous records of travel not only describe exotic landscapes but also bridge cultures, inspiring countless future explorers to pursue their dreams.`,
      highScoreVersion: `Marco Polo is widely recognized as one of the most remarkable travel writers in history. Born in Venice, he spent a major portion of his life traveling to the far East, eager to embark on an adventurous voyage. Throughout his legendary expeditions, he managed to conquer obstacles and hardships. His memoirs not only record his unique footprints, but also broadened our understanding of Asian cultures, which left an indelible mark on history.`,
      modelAnswer: `Marco Polo is <strong>widely recognized as one of the most remarkable travel writers in</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="上海中考经典起句">[句式亮点: widely recognized as...]</span> history. Born in Venice, he spent a major portion of his life traveling to the far East, eager to <strong>embark on an adventurous voyage</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="高级动词搭配替代 travel">[核心词组: embark on an adventurous voyage]</span>. Throughout his legendary expeditions, he managed to <strong>conquer obstacles and hardships</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="高分同义词替换">[高分表达: conquer obstacles and hardships]</span>. His memoirs not only record his unique footprints, but also broadened our understanding of Asian cultures, <strong>which left an indelible mark on history</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="which引导非限制性定语从句，拔高句法档次">[语法拔高: which left an indelible mark...]</span>.`
    },
    "2": {
      composition: `Dear Sam,\nI am writing to express my deepest gratitude for your timely assistance yesterday. When I struggled with my math homework, you spent two hours patiently explaining the difficult formulas. Your kind help really pulled me through the difficulty, and I am incredibly grateful to have you as a friend.\nBest wishes,\nJerry.`,
      highScoreVersion: `Dear Sam,\nI am writing this email to express my heartfelt gratitude for your timely assistance. Words cannot express how thankful I am for your help when I was struggling with my math homework. It was incredibly thoughtful of you to extend a helping hand during my moment of despair, which helped me pull through the difficulties. I deeply appreciate your warm generosity.\nBest regards,\nJerry.`,
      modelAnswer: `Dear Sam,<br/><strong>I am writing this email to express my heartfelt gratitude for</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="书信正规开头">[句式: I am writing this to express...]</span> your timely assistance. Words cannot express how thankful I am for your help when I was struggling with my math homework. It was incredibly thoughtful of you to <strong>extend a helping hand</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="生动成语短语替代 help me">[核心: extend a helping hand]</span> during my moment of despair, <strong>which helped me pull through the difficulties</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-500 font-semibold rounded mx-0.5 text-xs inline-block" title="定语从句串联因果">[从句亮点: which helped me pull through...]</span>. I deeply appreciate your warm generosity.<br/>Best regards,<br/>Jerry.`
    },
    "3": {
      composition: `My typical day as a Grade 9 student begins at 6:30 a.m. After a healthy breakfast, I throw myself into intensive but rewarding studies at school. The afternoon highlight is always playing basketball with my classmates, which relieves stress. Looking back, everyday efforts bring me closer to my dreams.`,
      highScoreVersion: `My ordinary days usually commence with an active morning routine to begin a refreshing day. Having accomplished my morning studies, I proceeded to participate in various stimulating campus activities. In the afternoon, I established a structured routine by playing basketball, through which I find immense satisfaction in persistent self-improvement. Looking back on this rewarding day, I realize that even simple tasks carry profound meaning.`,
      modelAnswer: `My ordinary days usually <strong>commence with</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="替代 begin">[高分词汇: commence with]</span> an active morning routine to <strong>begin a refreshing day</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="美化开头">[亮点: begin a refreshing day]</span>. <strong>Having accomplished my morning studies</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="现在分词作时间状语，完美拉开间距">[句法亮点: Having accomplished...]</span>, I proceeded to participate in stimulating activities. In the afternoon, I established a structured routine by playing basketball, through which I <strong>find immense satisfaction in</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="表达满足感的深度表达">[加分词组: find immense satisfaction in]</span> persistent self-improvement.`
    },
    "4": {
      composition: `After the devastating typhoon hit Shanghai, many homeless people were left cold and damp. Our school volunteer club immediately took action. We bought sleeping bags and distributed hot pumpkin soup to those staying under temporary bridges. This small act of kindness showed that unity raises hope even in dark times.`,
      highScoreVersion: `In the wake of the devastating typhoon, a destructive natural disaster, many homeless citizens were left in critical conditions. Driven by empathy, our volunteer club took immediate actions to distribute relief materials such as sleeping bags, blankets, and hot pumpkin soup. It is of monumental significance for us to stand together, demonstrate solidarity and care, and offer shelter to those in desperate need.`,
      modelAnswer: `<strong>In the wake of the devastating typhoon</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="地道环境背景交代">[高级介词短语: In the wake of...]</span>, a destructive natural disaster, many homeless citizens were left in critical conditions. Driven by empathy, our volunteer club took immediate actions to <strong>distribute relief materials</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="中考救灾极佳词组">[亮点: distribute relief materials]</span>. It is <strong>of monumental significance for us to</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="替代 It is important for us to">[句式亮点: of monumental significance...]</span> stand together and <strong>demonstrate solidarity and care</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="高度提炼人文关怀主题">[高分表达: demonstrate solidarity and care]</span>.`
    },
    "5": {
      composition: `To improve my English essays, I have set up a weekly writing schedule. First, I read classic Shanghai exam sample essays to note high-score expressions. Then, I write one complete paragraph and ask my teacher for active feedback. I am confident that these continuous modifications will polish my writing skills.`,
      highScoreVersion: `Aiming to reach higher efficiency, I have formulated a comprehensive self-improvement plan. To overcome my academic weaknesses, the first critical step I should take is to identify critical flaws in my daily learning habits. By cultivating self-discipline and keeping track of my mistakes, I can seek active feedback from teachers. By sticking to this daily reflection, I am thoroughly convinced that I will make remarkable progress.`,
      modelAnswer: `<strong>Aiming to reach higher efficiency</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="非谓语起句表达目的">[句型: Aiming to reach...]</span>, I have formulated a comprehensive self-improvement plan. First, I must <strong>identify critical flaws</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="精准找到痛点">[亮点: identify critical flaws]</span> in my weekly routines. Second, by <strong>cultivating self-discipline</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="自学核心短语">[亮点: cultivate self-discipline]</span>, I will stay focused. By sticking to this daily reflection, I am thoroughly convinced that I will <strong>make remarkable progress</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="高标替代 make progress">[高分表达: make remarkable progress]</span>.`
    },
    "6": {
      composition: `My house is always filled with laughter. We love having family dinners on Friday nights, where we enjoy home-cooked meals and share funny tales from school. My parents always listen with warm smiles. Their constant support and gentle wisdom make my family a secure harbor.`,
      highScoreVersion: `My warm family serves as a peaceful harbor that protects me from external stress. On typical Saturday nights, my family members gather together to share their joys and concerns. It is within this harmonious domestic atmosphere that we communicate as equals, which successfully bridges the generation gap. I am deeply blessed to receive their unconditional love and backup.`,
      modelAnswer: `My warm family <strong>serves as a peaceful harbor that protects me from</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="生动的比喻写法">[句法: serves as a peaceful harbor...]</span> external stress. <strong>It is within this harmonious domestic atmosphere that</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="强调句型结构拉满">[句式亮点: It is... that...]</span> we communicate as equals, which successfully <strong>bridges the generation gap</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="消除代沟亮点短语">[核心: bridge the generation gap]</span>. I am deeply blessed to receive their <strong>unconditional love and backup</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="无条件的爱与后盾">[亮点: unconditional love and backup]</span>.`
    },
    "7": {
      composition: `Dear Aunt Linda,\nHow have you been? I hope everything goes well with you. I am writing to tell you about our recent English drama festival. My class performed 'Tom Sawyer' and won first prize! I played Tom and had so much fun on stage. I really hope you can visit us soon.\nBest love,\nJerry.`,
      highScoreVersion: `Dear Aunt Linda,\nI hope this letter finds you in the excellent health and high spirits. I cannot write to you without sharing the thrilling updates regarding my recent academic achievements. We recently held an English drama festival, where my class won first prize. I played the main role and had an unforgettable experience on stage. I look forward to meeting up with you soon.\nSincere love,\nJerry.`,
      modelAnswer: `Dear Aunt Linda,<br/><strong>I hope this letter finds you in the excellent health and high spirits</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="英文书信黄金开头文雅句">[句式: I hope this letter finds you...]</span>. I cannot write to you without sharing the <strong>thrilling updates</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="取代 exciting news">[亮点: thrilling updates]</span> regarding my recent <strong>academic achievements</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="学业表现亮点词组">[加分词词: academic achievements]</span>. I played the main role and had an unforgettable experience. I <strong>look forward to meeting up</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="to是介词，后面接动名词">[语法扣分预防点: look forward to meeting up]</span> with you soon.<br/>Sincere love,<br/>Jerry.`
    },
    "8": {
      composition: `Ladies and gentlemen, welcome to our annual English Festival! I am your host, Jerry. Today, we are proud to present brilliant class dramas and spelling bees. Get ready to be amazed by our talented peers! Let us start with a big round of applause for Class 1!`,
      highScoreVersion: `Ladies and gentlemen, a very warm welcome to today's special program. I am your host today, and it is my absolute honor and privilege to present this exciting event. Today, we have invited many distinguished guests and outstanding classmates on stage. Let us prepare for their captivating performance with a big round of applause!`,
      modelAnswer: `Ladies and gentlemen, <strong>a very warm welcome to today's special program of</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="地道的主持开场白">[句式: a very warm welcome to...]</span> events. I am your host today, and it is my <strong>absolute honor and privilege to present</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="荣幸至极主持高阶套话">[亮点: absolute honor and privilege to...]</span> this exciting event. Today, we have invited many <strong>distinguished guests</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="替代 important people">[高级称呼: distinguished guests]</span>. Let us prepare for their <strong>captivating performance</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="极具感染力的表演">[亮点: captivating performance]</span> with a big round of applause!`
    },
    "9": {
      composition: `Nestled on Nanjing Road, 'Green Oasis' is a delightful spot for healthy food. Their signature dish, baked salmon with herbs, is a mouth-watering delicacy. The fish is tender and perfectly matched with fresh organic salads. The cozy green interior and warm service make it highly recommended.`,
      highScoreVersion: `Nestled in the heart of Shanghai, 'Green Oasis' offers a unique gastronomic journey for health enthusiasts. As for the signature dish, the baked salmon is a mouth-watering delicacy with rich flavors and perfect texture. The attentive waiters and cozy and elegant interior make this eatery an ideal spot for family dinners.`,
      modelAnswer: `<strong>Nestled in the heart of Shanghai</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="分词短语作状语交代餐馆地理位置">[句法: Nestled in the heart of...]</span>, 'Green Oasis' offers a unique culinary adventure. As for the <strong>signature dish</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="招牌菜地道表达">[核心: signature dish]</span>, the baked salmon is a <strong>mouth-watering delicacy</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="令人垂涎欲滴的佳肴代替 delicious food">[亮点: mouth-watering delicacy]</span>. The attentive waiters and <strong>cozy and elegant interior</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="就餐环境绝妙描写">[环境描写: cozy and elegant interior]</span> make this eatery highly recommended.`
    },
    "10": {
      composition: `This story report is on 'Surprise Endings'. Penned by O. Henry, the story describes two characters who plan to meet after twenty years. The unexpected twist at the end reveals one had become a policeman and the other a criminal. This clever plot teaches us that fate works in unexpected ways.`,
      highScoreVersion: `The captivating short story under the title of 'Surprise Endings' is penned by the renowned author O. Henry. The story centers on a dramatic reunion of two childhood companions after twenty years. With an unexpected twist of plot at the climax, it leaves readers deeply reflective of human nature. This narrative serves as a moral lesson that choices define our life paths.`,
      modelAnswer: `The captivating short story under the title of 'Surprise Endings' is <strong>penned by the renowned author</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="由……著名作家所著">[亮点短语: penned by the renowned author...]</span> O. Henry. The story centers on a dramatic reunion. With an <strong>unexpected twist of plot</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="情节跌宕起伏">[小说解析核心: unexpected twist of plot]</span>, it leaves readers highly interested. This narrative serves as a <strong>moral lesson</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="经典道德启迪词汇">[核心: moral lesson]</span> that choices, rather than raw luck, shape our destiny.`
    },
    "11": {
      composition: `The most valuable gift I have received is an old dictionary from my grandfather. On my twelfth birthday, he handed it to me, saying that knowledge opens gates. It holds immense sentimental value because it reminds me of his love and encourages me to persist during hard study hours.`,
      highScoreVersion: `Among all the lovely souvenirs I have gathered, this grandfather's dictionary stands out as my most precious treasure. Given to me by my grandfather upon my fifteen birthday, it holds immense sentimental value. This gift represents a priceless spiritual wealth for me, acting as a standard of constant motivation that guides my academic growth and persistence.`,
      modelAnswer: `Among all the lovely souvenirs I have gathered, this grandfather's dictionary stands out as my most precious treasure. Given to me upon my fifteen birthday, it <strong>holds immense sentimental value</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="具有巨大的情感纪念价值">[亮点: holds immense sentimental value]</span>. This gift represents a <strong>priceless spiritual wealth</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="无价的精神财富">[核心: priceless spiritual wealth]</span> for me, acting as a <strong>standard of constant motivation</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-500 font-semibold rounded mx-0.5 text-xs inline-block" title="不断激励的阶梯/标杆">[高分表达: standard of constant motivation]</span> that guides my growth.`
    },
    "12": {
      composition: `Basketball has always been my favourite sport. Every Wednesday school break, my classmates and I dash to the playground to play. This dynamic sport demands quick reflexes and, more importantly, fosters team spirit. It keeps me healthy and helps me shake off academic pressure.`,
      highScoreVersion: `Basketball has emerged as my absolute favorite sport because it represents both physical vigor and joy. Not only does this dynamic sport require extreme speed and agility, but it also builds robust physical fitness. Furthermore, playing matches fosters team spirit and unity among classmates. Whenever I feel stressed from academic work, heading to the court effectively relieves my psychological pressure.`,
      modelAnswer: `Basketball has <strong>emerged as my absolute favorite sport because</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="脱颖而出，跃升为我最喜欢的运动">[句式亮点: emerged as my absolute favorite...]</span> it represents joy. Not only does this dynamic sport require extreme speed, but it also <strong>builds robust physical fitness</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="强身健体的高级替换语">[亮点: build robust physical fitness]</span>. Furthermore, playing matches <strong>fosters team spirit and unity</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="团队合作意识培养">[核心词汇: fosters team spirit and unity]</span>. Heading to the court effectively <strong>relieves my psychological pressure</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="替代 relax myself / ease stress">[考分表达: relieves my psychological pressure]</span>.`
    },
    "13": {
      composition: `Dear Tom,\nI was deeply saddened to hear that you have been under the weather. Please rest well and do not worry about schoolwork. I have copied all of this week's English lesson notes and will help you catch up once you feel better. Wishing you a very speedy recovery!\nBest,\nJerry.`,
      highScoreVersion: `Dear Tom,\nI was deeply saddened to hear that you have been under the weather recently and missed school. Please do not worry about school lessons; I have prepared a diligent copy of lesson notes for you. Rest well, take care of yourself, and I wish you a speedy recovery. We look forward to your energetic return to our warm classroom community.\nBest,\nJerry.`,
      modelAnswer: `Dear Tom,<br/><strong>I was deeply saddened to hear that you have been under the weather recently</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="听闻同学身体抱恙表示难过关心">[句式: I was deeply saddened to hear...]</span>. Please do not worry about school lessons; I have prepared a <strong>diligent copy of lesson notes</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="上课复习笔记">[亮点词组: diligent copy of lesson notes]</span> for you. Rest well, take care of yourself, and I <strong>wish you a speedy recovery</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="祝早日康复经典高分尾句">[核心: wish a speedy recovery]</span>. We look forward to your energetic return.`
    }
  };

  // Extract selected static resource block or default to Task 1
  const targetMatch = fallbackDatabase[taskId] || fallbackDatabase["1"];

  // Appending personalized user comments to the text blocks if student wrote ideas
  let composition = targetMatch.composition;
  let highScoreVersion = targetMatch.highScoreVersion;
  let modelAnswer = targetMatch.modelAnswer;

  // Perform dynamic localized override replacements to match student priority input
  if (taskId === "1") {
    const person = nouns.personName || (chineseIdeas && chineseIdeas.length < 9 ? convertChineseToPinyin(chineseIdeas) : null) || "Xu Xiake";
    composition = composition
      .replace(/Marco Polo/g, person)
      .replace(/In the 13th century/g, "During historical times")
      .replace(/Venice/g, "ancient China")
      .replace(/Asian lands/g, "mysterious landscapes")
      .replace(/far East/g, "beautiful mountains and rivers")
      .replace(/Asian cultures/g, "amazing nature and geography");

    highScoreVersion = highScoreVersion
      .replace(/Marco Polo/g, person)
      .replace(/Born in Venice/g, `Born in ancient China`)
      .replace(/far East/g, "beautiful landscapes")
      .replace(/Asian cultures/g, "geography and historic trails");

    modelAnswer = modelAnswer
      .replace(/Marco Polo/g, person)
      .replace(/Born in Venice/g, `Born in ancient China`)
      .replace(/far East/g, "beautiful landscapes")
      .replace(/Asian cultures/g, "geography and historic trails");
  } else if (taskId === "2") {
    const companion = nouns.companionName || "Sam";
    const subject = nouns.subjectName || "difficult schoolwork";
    composition = composition
      .replace(/Dear Sam/g, `Dear ${companion}`)
      .replace(/math homework/g, subject)
      .replace(/math/g, subject);
    highScoreVersion = highScoreVersion
      .replace(/Dear Sam/g, `Dear ${companion}`)
      .replace(/math homework/g, subject);
    modelAnswer = modelAnswer
      .replace(/Dear Sam/g, `Dear ${companion}`)
      .replace(/math homework/g, subject);
  } else if (taskId === "3") {
    const activity = nouns.activityName || "doing badminton and exercise";
    composition = composition.replace(/playing basketball with my classmates/g, activity);
    highScoreVersion = highScoreVersion.replace(/playing basketball/g, activity);
    modelAnswer = modelAnswer.replace(/playing basketball/g, activity);
  } else if (taskId === "4") {
    const materials = nouns.giftName || "relief materials like warm blankets and bread";
    composition = composition.replace(/sleeping bags and distributed hot pumpkin soup/g, `essential supplies including ${materials}`);
    highScoreVersion = highScoreVersion.replace(/sleeping bags, blankets, and hot pumpkin soup/g, materials);
    modelAnswer = modelAnswer.replace(/distribute relief materials/g, `distribute relief materials like ${materials}`);
  } else if (taskId === "5") {
    const subject = nouns.subjectName ? `my ${nouns.subjectName}` : "my target study habits";
    composition = composition.replace(/my English essays/g, subject);
    highScoreVersion = highScoreVersion.replace(/my academic weaknesses/g, `my weaknesses in ${subject}`);
    modelAnswer = modelAnswer.replace(/my weekly routines/g, `my routines in ${subject}`);
  } else if (taskId === "7") {
    const hasCustomIdeas = chineseIdeas && 
      !chineseIdeas.includes("戏剧") && 
      !chineseIdeas.includes("话剧") && 
      !chineseIdeas.includes("演出") && 
      !chineseIdeas.includes("表演");

    if (hasCustomIdeas) {
      let planDetails = [];
      let planDetailsHigh = [];
      
      let place = "some beautiful places";
      if (chineseIdeas.includes("杭州")) place = "Hangzhou";
      else if (chineseIdeas.includes("北京")) place = "Beijing";
      else if (chineseIdeas.includes("上海")) place = "Shanghai";
      else if (chineseIdeas.includes("南京")) place = "Nanjing";
      else if (chineseIdeas.includes("海南")) place = "Hainan";
      else if (chineseIdeas.includes("成都")) place = "Chengdu";
      else if (chineseIdeas.includes("西安")) place = "Xi'an";
      
      if (chineseIdeas.includes("旅游") || chineseIdeas.includes("旅行") || chineseIdeas.includes("去")) {
        planDetails.push(`travel to ${place} for a relaxing vacation`);
        planDetailsHigh.push(`embark on an exciting journey to ${place} to explore its scenic landscapes`);
      }
      
      if (chineseIdeas.includes("读") || chineseIdeas.includes("小说") || chineseIdeas.includes("看书") || chineseIdeas.includes("阅读")) {
        let count = "some";
        if (chineseIdeas.includes("三本") || chineseIdeas.includes("3本") || chineseIdeas.includes("三")) count = "three";
        else if (chineseIdeas.includes("两本") || chineseIdeas.includes("2本") || chineseIdeas.includes("两") || chineseIdeas.includes("二")) count = "two";
        else if (chineseIdeas.includes("一本") || chineseIdeas.includes("1本") || chineseIdeas.includes("一")) count = "a";
        
        planDetails.push(`read ${count} interesting English novels to improve my English`);
        planDetailsHigh.push(`delve into ${count} classical English novels to broaden my academic horizons and appreciate literature`);
      }
      
      if (chineseIdeas.includes("学") || chineseIdeas.includes("英语") || chineseIdeas.includes("课程")) {
        planDetails.push("study hard to improve my academic skills");
        planDetailsHigh.push("cultivate self-discipline and enhance my critical learning habits");
      }
      
      if (chineseIdeas.includes("羽毛球") || chineseIdeas.includes("篮球") || chineseIdeas.includes("运动") || chineseIdeas.includes("跑步") || chineseIdeas.includes("锻炼")) {
        const sport = nouns.activityName || "sports";
        planDetails.push(`do regular exercise like playing ${sport} to stay healthy`);
        planDetailsHigh.push(`participate in regular physical exercise such as ${sport} to stay fit and relieve pressure`);
      }

      if (planDetails.length === 0) {
        const pinyinIdeas = convertChineseToPinyin(chineseIdeas);
        planDetails.push(`do some interesting things like ${pinyinIdeas.toLowerCase()}`);
        planDetailsHigh.push(`engage in stimulating activities, especially focusing on ${pinyinIdeas}`);
      }

      const relative = nouns.giverName ? `Dear ${nouns.giverName}` : "Dear Aunt Linda";
      const timePeriod = (chineseIdeas.includes("暑假") || chineseIdeas.includes("夏")) ? "this upcoming summer holiday" : "my near future";

      composition = `${relative},\nHow have you been? I hope everything goes well with you. I am writing to share my exciting plans for ${timePeriod}. Firstly, I prepare to ${planDetails[0] || "enjoy my free time"}.${planDetails[1] ? " Secondly, I also plan to " + planDetails[1] + "." : ""} These plans will make my vacation both active and meaningful. I really hope we can meet each other soon!\nBest love,\nJerry.`;

      const p1 = planDetailsHigh[0] || "arrange a structured daily routine to relax";
      const p2 = planDetailsHigh[1] ? `In addition, I intend to ${planDetailsHigh[1]}, which will surely enrich my personal development.` : "This will keep me both physically and mentally active.";
      
      highScoreVersion = `${relative},\nI hope this letter finds you in the excellent health and high spirits. I cannot wait to share the thrilling updates regarding my upcoming plans for ${timePeriod}. Eager to enjoy a rewarding break, I have decided to ${p1}. ${p2} I am thoroughly convinced that these experiences will be extremely beneficial. I look forward to meeting up with you soon.\nSincere love,\nJerry.`;

      const p1Annotated = planDetailsHigh[0] ? `<strong>${planDetailsHigh[0]}</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="根据你输入的意图个性化翻译">${planDetailsHigh[0].includes("journey") ? "[核心表达: 开启精彩旅程]" : "[精妙表达: 潜心阅读]"}</span>` : "arrange a structured daily routine to relax";
      const p2Annotated = planDetailsHigh[1] ? `In addition, I intend to <strong>${planDetailsHigh[1]}</strong> <span class="bg-amber-50 border border-amber-100 px-1 text-amber-700 font-semibold rounded mx-0.5 text-xs inline-block" title="个性化意图生成，拓宽学术视野">[高分短语: 拓宽学术视野 / 保持身心健康]</span>, which will surely enrich my personal development` : "This will keep me both physically and mentally active";

      modelAnswer = `${relative},<br/><strong>I hope this letter finds you in the excellent health and high spirits</strong> <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="英文书信黄金开头文雅句">[句式: I hope this letter finds you...]</span>. I cannot write to you without sharing the <strong>thrilling updates</strong> <span class="bg-emerald-50 border border-emerald-100 px-1 text-emerald-700 font-semibold rounded mx-0.5 text-xs inline-block" title="取代 exciting news">[亮点: thrilling updates]</span> regarding my upcoming plans for ${timePeriod}. Eager to enjoy a rewarding break, I have decided to ${p1Annotated}. ${p2Annotated}. I <strong>look forward to meeting up</strong> <span class="bg-pink-50 border border-pink-100 px-1 text-pink-700 font-semibold rounded mx-0.5 text-xs inline-block" title="to是介词，后面接动名词">[语法扣分预防点: look forward to meeting up]</span> with you soon.<br/>Sincere love,<br/>Jerry.`;
    } else {
      const relative = nouns.giverName ? `Dear ${nouns.giverName}` : "Dear Aunt Linda";
      const play = nouns.bookTitle || "our beautiful school play";
      composition = composition
        .replace(/Dear Aunt Linda/g, relative)
        .replace(/'Tom Sawyer'/g, `'${play}'`);
      highScoreVersion = highScoreVersion
        .replace(/Dear Aunt Linda/g, relative)
        .replace(/English drama festival/g, `drama festival performing '${play}'`);
      modelAnswer = modelAnswer
        .replace(/Dear Aunt Linda/g, relative)
        .replace(/academic achievements/g, `achievements in performing '${play}'`);
    }
  } else if (taskId === "9") {
    const rName = nouns.restaurantName || "Sunshine Eatery";
    const place = nouns.placeName || "near our school";
    const dish = nouns.dishName || "delicious beef noodles";
    composition = composition
      .replace(/Nanjing Road/g, place)
      .replace(/'Green Oasis'/g, `'${rName}'`)
      .replace(/baked salmon with herbs, is a mouth-watering delicacy/g, `${dish}, is an incredible masterpiece`)
      .replace(/The fish/g, "The delicacy");

    highScoreVersion = highScoreVersion
      .replace(/Shanghai/g, place)
      .replace(/'Green Oasis'/g, `'${rName}'`)
      .replace(/the baked salmon is a mouth-watering delicacy/g, `${dish} is a delicious delicacy`);

    modelAnswer = modelAnswer
      .replace(/Shanghai/g, place)
      .replace(/'Green Oasis'/g, `'${rName}'`)
      .replace(/the baked salmon/g, dish);
  } else if (taskId === "10") {
    const bookTitle = nouns.bookTitle || "The Emperor's New Clothes";
    const author = nouns.authorName || "Andersen";
    composition = composition
      .replace(/'Surprise Endings'/g, `'${bookTitle}'`)
      .replace(/O\. Henry/g, author)
      .replace(/two characters who plan to meet after twenty years/g, "a fascinating moral theme");

    highScoreVersion = highScoreVersion
      .replace(/'Surprise Endings'/g, `'${bookTitle}'`)
      .replace(/O\. Henry/g, author)
      .replace(/reunion of two childhood companions after twenty years/g, "wonderful moral lesson");

    modelAnswer = modelAnswer
      .replace(/'Surprise Endings'/g, `'${bookTitle}'`)
      .replace(/O\. Henry/g, author);
  } else if (taskId === "11") {
    const gift = nouns.giftName || "a lovely milestone memory token";
    const _giver = nouns.giverName || "my dear friend";
    composition = composition
      .replace(/old dictionary from my grandfather/g, `${gift} from ${_giver}`)
      .replace(/he handed it to me/g, `they handed it to me`)
      .replace(/his love/g, `their deep care`);

    highScoreVersion = highScoreVersion
      .replace(/grandfather's dictionary/g, `${gift} from ${_giver}`)
      .replace(/by my grandfather/g, `by ${_giver}`);

    modelAnswer = modelAnswer
      .replace(/grandfather's dictionary/g, `${gift} from ${_giver}`);
  } else if (taskId === "12") {
    const sport = nouns.activityName || "Badminton";
    composition = composition
      .replace(/Basketball/g, sport)
      .replace(/basketball/g, sport.toLowerCase());
    highScoreVersion = highScoreVersion
      .replace(/Basketball/g, sport);
    modelAnswer = modelAnswer
      .replace(/Basketball/g, sport);
  } else if (taskId === "13") {
    const companion = nouns.companionName || "Tom";
    const subject = nouns.subjectName || "important school notes";
    composition = composition
      .replace(/Dear Tom/g, `Dear ${companion}`)
      .replace(/English lesson notes/g, subject);
    highScoreVersion = highScoreVersion
      .replace(/Dear Tom/g, `Dear ${companion}`)
      .replace(/lesson notes/g, subject);
    modelAnswer = modelAnswer
      .replace(/Dear Tom/g, `Dear ${companion}`)
      .replace(/lesson notes/g, subject);
  }

  // Render a tailored outline structure, integrating native chinese ideas if supplied
  const outline = [
    `Paragraph 1: Introduction (${task.structure[0]})`,
    `   - Student Ideas: ${chineseIdeas || "基于考纲大纲合理引入"}`,
    `   - Master Starter: "${task.usefulPatterns[0]}"`
  ];
  if (task.structure[1]) {
    outline.push(`Paragraph 2: Topic Details - Body Paragraph (${task.structure[1]})`);
    outline.push(`   - Core expression: "${task.highScoreExpressions[0]?.phrase || "relevant details"}" (意: ${task.highScoreExpressions[0]?.meaning || ""})`);
  }
  if (task.structure[2]) {
    outline.push(`Paragraph 3: Sincere Conclusion & Golden Verdict (${task.structure[2]})`);
    outline.push(`   - Reflect marker: "${task.highScoreExpressions[1]?.phrase || "key takeaways"}" (意: ${task.highScoreExpressions[1]?.meaning || ""})`);
  }

  if (ideasText) {
    composition += `\n\n(AI Assistant Actionable Note: This template has successfully matched and solved your concept input: "${chineseIdeas}")`;
    highScoreVersion += `\n\n(AI Coach Advice: Incorporating specific facts from your input "${chineseIdeas}" will maximize grading results during paper checks.)`;
  }

  return {
    outline,
    composition,
    highScoreVersion,
    modelAnswer,
    tips: task.writingTips
  };
}

/**
 * Endpoint for Shanghai Grade 9 Textbook Writing Coach
 * Input: { taskId: string, chineseIdeas: string }
 * Output: { outline: string[], composition: string, highScoreVersion: string, modelAnswer: string, tips: string[] }
 */
app.post("/api/writing-coach", async (req: Request, res: Response): Promise<void> => {
  const { taskId = "1", chineseIdeas = "" } = req.body;

  if (!taskId) {
    res.status(400).json({ error: "Missing writing task ID." });
    return;
  }

  const task = WRITING_TASKS.find(t => t.id === taskId);
  if (!task) {
    res.status(404).json({ error: "Selected writing task not found." });
    return;
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      const fallbackResult = getSimulatedWritingFallback(taskId, chineseIdeas);
      res.json({ ...fallbackResult, isFallback: true });
      return;
    }

    const writingPrompt = `You are an elite senior English writing coach specializing in the Shanghai Grade 9 Secondary School Entrance Examination (中考).
The student is working on the textbook unit writing task: "${task.title}" (Topic: "${task.topic}").

The student's Chinese ideas are:
"${chineseIdeas || "暂无具体想法（请基于标准课文大纲自主合理发散）"}"

CRITICAL CONTENT PERSONALIZATION RULES (MANDATORY & HIGHEST PRIORITY):
1. **Absolute Priority**: If the student provides any custom person name, place name, restaurant name, event, sport, activity, or object in their Chinese ideas (e.g., "我最敬佩徐霞客" / "徐霞客", "羽毛球", "阳光面馆", "折的纸星"), you MUST translate and keep this specific information. It must be the dominant subject of the essay.
2. **Never Replace or Override with Defaults**: You are STRICTLY FORBIDDEN from replacing the student's custom person/place/object details with the standard textbook defaults (e.g., do NOT talk about "Marco Polo" if the student's Chinese ideas mentioned "徐霞客" / "Xu Xiake"; do NOT write "playing basketball" if the student's Chinese ideas mentioned "badminton" / "羽毛球").
3. **Hierarchy of Choice**:
   - Priority 1: User's explicit custom ideas / inputs
   - Priority 2: Standard textbook lesson topic theme
   - Priority 3: Default textbook examples
   User's input must always override any pre-existing textbook or standard defaults.
4. **Natural Integration**: Seamlessly translate parenthetical or explicit objects (e.g. "徐霞客" into "Xu Xiake", "折的纸星" into "folded paper stars") and adapt details like locations or companion roles naturally, with flawless academic English grammar.

Generate a polished response in JSON format according to the Shanghai Grade 9 English writing curriculum and grading standards.
The response must contain exactly:
1. "outline": An array of 3-4 strings detailing a structured paragraph-by-paragraph plan, personalized to draft ideas.
2. "composition": A standard textbook-level composition (around 80-100 words) using standard vocabulary, simple but neat sentence structures, and sound grammar. It should represent a gold-standard student draft.
3. "highScoreVersion": An upgraded high-score composition (around 95-115 words) featuring advanced syntactic choices (e.g. non-restrictive relative clauses, adverbial clauses, passive voice, or emphasizing inversions) and premium vocabulary/collocations.
4. "modelAnswer": The same "highScoreVersion" text, containing HTML annotation tags <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="Grammar & vocab highlights">[亮点: Description]</span> placed immediately after key phrases wrapped in <strong>...</strong> to help the students memorize and learn key expressions.
5. "tips": An array of 3 highly actionable, specific writing tips tailored for this specific task.

CRITICAL EXAM-ORIENTED QUALITY COMPLIANCE:
- NEVER use awkward or un-idiomatic terms (like "learn knowledge" -> use "acquire knowledge/broaden our horizons"; "keep doing exercises" -> use "do regular exercise/stay fit").
- Flow must be absolutely natural, direct, and academic. Do not output flowery, inappropriate literary prose. Keep it structured and score-maximized.

Return response in strict JSON format.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: writingPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            outline: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Structured paragraph-by-paragraph outline."
            },
            composition: {
              type: Type.STRING,
              description: "Standard level essay, around 80-100 words."
            },
            highScoreVersion: {
              type: Type.STRING,
              description: "Upgraded perfect score level essay, around 95-115 words."
            },
            modelAnswer: {
              type: Type.STRING,
              description: "Richly annotated HTML copy of highScoreVersion."
            },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 highly relevant customized writing advice points."
            }
          },
          required: ["outline", "composition", "highScoreVersion", "modelAnswer", "tips"]
        }
      }
    });
 
    // 2 & 3. Validation for Gemini response candidates and elements presence checks before reading
    if (!response) {
      throw new Error("Gemini API returned an completely undefined response object.");
    }

    if (!response.candidates) {
      throw new Error("Gemini API response possesses no candidates array. The request might have been rejected due to system safeguards.");
    }

    if (response.candidates.length === 0) {
      throw new Error("Gemini API returned an empty candidates list. This generally happens when the content is completely blocked by safety filters or recitation checks.");
    }

    const candidate = response.candidates[0];
    if (!candidate) {
      throw new Error("Gemini API candidate[0] is null/undefined despite non-zero array length.");
    }

    if (!candidate.content) {
      throw new Error("Gemini API candidate[0] contains no content property. The generated output might have been censored or cut off midway.");
    }

    if (!candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error("Gemini API candidate[0].content has an empty or missing 'parts' array.");
    }

    const firstPart = candidate.content.parts[0];
    if (!firstPart) {
      throw new Error("Gemini API candidate[0].content.parts[0] is null/undefined.");
    }

    const resultText = firstPart.text;
    if (resultText === undefined || resultText === null) {
      throw new Error("Gemini API candidate[0].content.parts[0] contains empty or missing text field.");
    }
 
    const parsedData = JSON.parse(resultText);
    res.json(parsedData);
  } catch (error: any) {
    console.error("[API ERROR] /api/writing-coach FULL SERVER LOG DETAILS:", error);
    const isQuotaError = error?.status === 429 || error?.code === 429 || JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota");
    if (isQuotaError) {
      console.log("[Info] Gemini API quota limit met, running custom writing coach fallback.");
    } else {
      console.log("[Info] Gemini API transiently offline, running custom writing coach fallback.");
    }
    try {
      const fallbackResult = getSimulatedWritingFallback(taskId, chineseIdeas);
      res.json({ ...fallbackResult, isFallback: true });
    } catch (simError: any) {
      res.status(500).json({
        error: "An error occurred with our writing coach database.",
        details: error.message
      });
    }
  }
});

// Setup dev vs production environments
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting developer Vite context...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static frontend assets from dist folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Speaking Coach server running on port: ${PORT}`);
  });
}

startServer();
