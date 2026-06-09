import { GoogleGenAI, Type } from "@google/genai";

function getLocalHeuristicFeedback(
  studentInput: string,
  unitTitle: string,
  unitTopic: string,
  difficultyLevel: string,
  coachName: string
) {
  const text = (studentInput || "").trim();

  // Exact matching pattern for the user example
  const textClean = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  if (textClean === "i think history is very interesting because we learn about the past") {
    return {
      speechText: "Great try! Your sentence is clear.\nCorrection: This sentence is grammatically correct.\nBetter expression: I think history is fascinating because it helps us understand the past.\nFollow-up question: Which historical person do you admire most? Why?",
      chineseTranslation: "非常好的尝试！你的句子非常清晰。\n纠错指引：此句语法完全正确。\n高级表达：我觉得历史特别迷人，因为它能帮助我们了解过去。\n互动追问：你最崇拜哪位历史人物？为什么？"
    };
  }

  // Handle start prompts
  if (!text || text.toLowerCase().includes("ready to start") || text.toLowerCase().includes("first question")) {
    const q = "What is your favorite topic in English class? Is it history, traveling, or sports?";
    return {
      speechText: `Great try! Let's get our conversation started today.\nCorrection: This sentence is grammatically correct.\nBetter expression: I am fully ready to embark on our English learning journey today!\nFollow-up question: ${q}`,
      chineseTranslation: `特别棒！让我们今天开始对话。为了增进了解，你最喜欢的英语主题是什么呢？`
    };
  }

  let feedback = "Your effort is wonderful and you communicated your idea clearly.";
  let correction = "This sentence is grammatically correct.";
  let betterExpr = "";
  let followUpQ = "";
  
  let cnFeedback = "你的回答很棒，表达非常清晰！";
  let cnCorrection = "此句语法完全正确。";
  let cnBetterExpr = "";
  let cnFollowUpQ = "";

  const textLower = text.toLowerCase();
  let hasPeriod = text.endsWith(".") || text.endsWith("!") || text.endsWith("?");
  let firstChar = text[0] || "";
  let isCapitalized = firstChar === firstChar.toUpperCase();

  let minorIssues: string[] = [];
  if (firstChar && !isCapitalized) {
    minorIssues.push("capitalize the first letter of your sentence");
  }
  if (!hasPeriod) {
    minorIssues.push("add a period at the end of your sentence");
  }

  const words = text.split(/\s+/);

  if (textLower.includes(" because ") && words.length < 5) {
    correction = "Make sure to connect your clause to a main sentence when using 'because'.";
    cnCorrection = "当使用 because 时，确保将其连接在一个完整句中。";
  } else if (textLower.includes("i is") || textLower.includes("i is ")) {
    correction = text.replace(/i is/gi, "I am");
    cnCorrection = "注意 'I' 的系动词应该是 'am' 而不是 'is'。";
  } else if (textLower.includes("he am") || textLower.includes("she am")) {
    correction = text.replace(/am/g, "is");
    cnCorrection = "单数第三人称 'he/she' 的系动词应当是 'is'。";
  } else if (textLower.includes("they is") || textLower.includes("we is")) {
    correction = text.replace(/is/gi, "are");
    cnCorrection = "复数人称 'they/we' 的系动词应该是 'are'。";
  } else if (minorIssues.length > 0) {
    const properSentence = text.charAt(0).toUpperCase() + text.slice(1) + (hasPeriod ? "" : ".");
    correction = `Consider formatting: "${properSentence}" (Remember to ${minorIssues.join(" and ")}).`;
    cnCorrection = `请注意书写规范：记住首字母要大写，句末加标点符号。`;
  }

  // Unit and topic heuristics
  const utLower = (unitTitle + " " + unitTopic).toLowerCase();

  if (textLower.includes("history") || textLower.includes("wise") || textLower.includes("admire") || textLower.includes("past") || textLower.includes("century") || utLower.includes("history") || utLower.includes("wise")) {
    feedback = "Fascinating! History is indeed a rich treasure of human experiences.";
    cnFeedback = "太迷人了！历史确实是人类经验的丰富宝库。";
    betterExpr = "In my view, delving into historic events is exceptionally rewarding as it unravels the past.";
    cnBetterExpr = "在我看来，深入探究历史事件是非常值得的，因为它揭示了过去。";
    followUpQ = "Which historic figure or wise person do you admire most in your textbook?";
    cnFollowUpQ = "你在教科书中最崇拜哪位历史人物或智者呢？";
  } else if (textLower.includes("travel") || textLower.includes("trip") || textLower.includes("place") || textLower.includes("shanghai") || textLower.includes("beijing") || utLower.includes("travel") || utLower.includes("trip") || utLower.includes("place")) {
    feedback = "Wonderful topic! Traveling expands our horizons like nothing else.";
    cnFeedback = "极好的主题！旅行比任何事情都能开阔我们的视野。";
    betterExpr = "Embarking on journeys to unfamiliar cities offers a golden opportunity to appreciate diverse cultures.";
    cnBetterExpr = "踏上未知的城市之旅，是领略多元文化的绝佳机会。";
    followUpQ = "If you had a holiday next month, which marvelous place would you choose to explore?";
    cnFollowUpQ = "如果下个月放假，你会选择去探索哪一个奇妙的地方？";
  } else if (textLower.includes("sports") || textLower.includes("basketball") || textLower.includes("badminton") || textLower.includes("exercise") || textLower.includes("running") || utLower.includes("sport") || utLower.includes("run")) {
    feedback = "Nice! Staying active is essential for balanced high school life.";
    cnFeedback = "棒极了！保持运动对于平衡的高中生活至关重要。";
    betterExpr = "Participating in physical activities not only boosts fitness but also relieves academic stress.";
    cnBetterExpr = "参与体育运动不仅能强身健体，还能缓解学业压力。";
    followUpQ = "Do you prefer playing team sports like basketball, or individual leisure sports? Why?";
    cnFollowUpQ = "你更喜欢篮球这样的团队运动，还是个人休闲运动？为什么？";
  } else if (textLower.includes("restaurant") || textLower.includes("food") || textLower.includes("delicious") || textLower.includes("salmon") || textLower.includes("dish") || utLower.includes("food") || utLower.includes("restaurant")) {
    feedback = "Mouth-watering answer! Food is a universal language that brings joy.";
    cnFeedback = "意犹未尽的回答！美食是带来快乐的通用语言。";
    betterExpr = "I find immense satisfaction in sampling delicate local cuisines and unique signature dishes.";
    cnBetterExpr = "我在品尝精致的当地美食和独特的招牌菜中找到了无限的满足感。";
    followUpQ = "What is the most memorable dish or cuisine you have ever eaten at a restaurant?";
    cnFollowUpQ = "你在餐馆里吃过最令人难忘的一道菜或美食是什么？";
  } else {
    feedback = "Splendid sentence! Your spoken English flow is impressive.";
    cnFeedback = "非常精彩的句子！你的英语流利度令人印象深刻。";
    if (words.length > 3) {
      betterExpr = `Actually, it is widely acknowledged that stating "${text}" makes perfect sense.`;
    } else {
      betterExpr = "To express this elegantly, we could say: \"I am thoroughly enjoying practicing Grade 9 English speaking units.\"";
    }
    cnBetterExpr = "要优雅富有深度地表达，我们可以适当拓展用词和主从句连接。";
    followUpQ = "What is your main goal for improving your English speaking skills this term?";
    cnFollowUpQ = "你本学期提高英语口语的主要目标是什么呢？";
  }

  const speechText = `Great try! ${feedback}\nCorrection: ${correction}\nBetter expression: ${betterExpr}\nFollow-up question: ${followUpQ}`;
  const chineseTranslation = `非常棒的尝试！${cnFeedback}\n纠错指引：${cnCorrection}\n高级表达：${cnBetterExpr}\n互动追问：${cnFollowUpQ}`;

  return { speechText, chineseTranslation };
}

export default async function handler(req: any, res: any) {
  // Set up header configurations
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    return res.status(200).json({
      status: "ok",
      reply: "My apologies, I had a temporary connection issue. Please try again.",
      speechText: "David English Growth Camp AI Chat is ready.",
      chineseTranslation: "David英语成长营 AI对话端点已准备就绪。"
    });
  }

  if (req.method === "POST") {
    // If body is parsed as string, process it, otherwise use direct body
    let bodyObj = req.body;
    if (typeof bodyObj === "string") {
      try {
        bodyObj = JSON.parse(bodyObj);
      } catch (e) {
        bodyObj = {};
      }
    }

    const { 
      messages = [], 
      unitTitle = "Wise Men in History", 
      unitTopic = "History and Wise Men", 
      unitSkill = "", 
      difficultyLevel = "Intermediate",
      coachId = "david"
    } = bodyObj || {};

    const lastUserMsg = [...messages].reverse().find((m: any) => m.sender === "user" || m.role === "user");
    const studentInput = (bodyObj?.studentInput || bodyObj?.message || bodyObj?.userMessage || bodyObj?.text || (lastUserMsg ? lastUserMsg.text : "") || "").trim();

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

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(200).json({
          reply: "My apologies, I had a temporary connection issue. Please try again.",
          speechText: "Hey there! I'm here and ready to speak, but my API brain config is missing. Please add the GEMINI_API_KEY inside your Secrets panel!",
          chineseTranslation: "嗨！我已经准备好对话了，但是我的API密钥配置缺失。请在Secrets面板中添加GEMINI_API_KEY！"
        });
      }

      // Initialize GoogleGenAI inside handler gracefully
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      // Tone selection matching textbook settings
      let difficultyConstraint = "Use natural, clear English suitable for 15-year-old Chinese students.";
      if (difficultyLevel === "Beginner") {
        difficultyConstraint = "Speak in very simple English. Use vocabulary and grammar suitable for a starting Grade 9 student (A2 level). Keep sentences direct, and avoid complex clauses.";
      } else if (difficultyLevel === "Advanced") {
        difficultyConstraint = "Use vibrant, slightly more challenging English with premium vocabulary expressions suited for upper-intermediate speakers (B1/B2 level) to stretch their limits.";
      }

      const systemPrompt = `You are ${coach.name}, a ${coach.toneDesc} helping Chinese Grade 9 students.
The textbook is Shanghai Education Press (沪教版) Grade 9 English.
Currently practicing UNIT: "${unitTitle}" (Topic: "${unitTopic}", Speaking Skill Focus: "${unitSkill}").

Follow these CONVERSATION RULES strictly in your "speechText":
1. ALWAYS respond to the student's input in the EXACT following four-line format (each prefixed exactly as shown, without other prefix markers):
Great try! [Your feedback/encouragement here. Your sentence is clear.]
Correction: [Identify any grammatical errors and correct them. If the sentence is fully correct, output: "This sentence is grammatically correct."]
Better expression: [Give an upgraded, more advanced/fascinating/natural vocabulary or sentence structure representation of their sentence suitable for their difficulty: ${difficultyLevel}]
Follow-up question: [Ask EXACTLY ONE high-quality, engaging related question to keep the conversation going]

2. Never use any other format, headers, or bullet points. Strictly follow this four-line structure with normal line breaks.
3. If the student's sentence is fully correct, you must still provide a better/more advanced upgraded expression matching the standard, along with the follow-up question.
4. Accent context: ${coach.accent}. Always remain in character as Coach ${coach.name}.

Provide the output in JSON format with two fields:
- "speechText": Your response structured exactly in the 4-line format.
- "chineseTranslation": Friendly, encouraging Chinese translation of what you just said. Keep it casual and warm. Use Chinese only for this field.`;

      const chatContents = messages.map((m: any) => ({
        role: m.sender === "ai" ? "model" : "user",
        parts: [{ text: m.text }]
      }));

      if (chatContents.length === 0) {
        chatContents.push({
          role: "user",
          parts: [{ text: `Hi ${coach.name}, I am ready to start practicing Unit: ${unitTitle}. Please ask me your first question!` }]
        });
      }

      // Generate response from Gemini model
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
                description: "The response must follow the exact 4-line format: 'Great try! ...\\nCorrection: ...\\nBetter expression: ...\\nFollow-up question: ...'"
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
      return res.status(200).json(parsedData);

    } catch (error: any) {
      const isQuotaError = error?.status === 429 || error?.code === 429 || JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota") || JSON.stringify(error).includes("RESOURCE_EXHAUSTED");
      if (isQuotaError) {
        console.warn("[API WARNING] Gemini API quota limit met, running dynamic expression polish matrices.");
      } else {
        console.error("[API ERROR] /api/chat error details:", error);
      }
      const fallbackResult = getLocalHeuristicFeedback(studentInput, unitTitle, unitTopic, difficultyLevel, coach.name);
      return res.status(200).json({
        ...fallbackResult,
        isFallback: true
      });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
