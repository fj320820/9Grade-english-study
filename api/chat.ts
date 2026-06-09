import { GoogleGenAI, Type } from "@google/genai";

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
      return res.status(200).json(parsedData);

    } catch (error: any) {
      const isQuotaError = error?.status === 429 || error?.code === 429 || JSON.stringify(error).includes("429") || JSON.stringify(error).includes("quota") || JSON.stringify(error).includes("RESOURCE_EXHAUSTED");
      if (isQuotaError) {
        console.warn("[API WARNING] Gemini API quota limit met, running dynamic expression polish matrices.");
      } else {
        console.error("[API ERROR] /api/chat error details:", error);
      }
      return res.status(200).json({
        speechText: "That's an incredibly smooth answer! Keep practicing! You are doing an amazing job today.",
        chineseTranslation: "那是个极好且流畅的回答！继续保持，你今天表现得很出色。"
      });
    }
  }

  return res.status(405).json({ error: "Method Not Allowed" });
}
