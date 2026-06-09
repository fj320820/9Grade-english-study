import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let bodyObj = req.body;
  if (typeof bodyObj === "string") {
    try {
      bodyObj = JSON.parse(bodyObj);
    } catch (e) {
      bodyObj = {};
    }
  }

  const { messages = [], unitTitle = "Wise Men in History" } = bodyObj || {};

  const executeFallback = () => {
    const msgCount = messages.length;
    const pronunciation = Math.min(96, Math.max(82, 85 + Math.floor(Math.random() * 8)));
    const fluency = Math.min(96, Math.max(76, 78 + Math.floor(msgCount * 1.5) + Math.floor(Math.random() * 5)));
    const vocabulary = Math.min(95, Math.max(75, 75 + Math.floor(Math.random() * 12)));
    const grammar = Math.min(95, Math.max(80, 81 + Math.floor(Math.random() * 9)));
    const communication = Math.min(98, Math.max(84, 84 + Math.floor(msgCount * 2)));
    const overall = Math.round((pronunciation + fluency + vocabulary + grammar + communication) / 5);

    return {
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
    };
  };

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json(executeFallback());
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const conversationalTranscript = messages
      .map((m: any) => `${m.sender === "ai" ? "David (Coach)" : "Student"}: ${m.text}`)
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
    return res.status(200).json(reportData);

  } catch (error: any) {
    console.error("[API ERROR] /api/report error details:", error);
    return res.status(200).json(executeFallback());
  }
}
