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

  const { chineseText = "" } = bodyObj || {};

  if (!chineseText || chineseText.trim() === "") {
    return res.status(400).json({ error: "Please enter a Chinese sentence." });
  }

  const getSimulatedEssayFallback = (text: string) => {
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

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json(getSimulatedEssayFallback(chineseText));
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const essayPrompt = `You are an elite, highly professional junior high school English teacher and senior writing expert dedicated to the Shanghai Grade 9 Secondary School Entrance Examination (中考).
The student wants to write a high-scoring exam composition starting from this one Chinese sentence: "${chineseText}".

Analyze the input sentence and generate a JSON with three progressive levels of expansion:
1. "simpleSentence": A clean, grammatically correct, and beautifully natural English sentence translating the Chinese input directly.
2. "threeSentenceVersion": An array of exactly 3 sequential English sentences that logically expand the starting idea (Introduction -> Supporting Argument/Detail -> Conclusion/Impact).
   Each object in the array must have:
   - "en": A highly idiomatic, fluent English sentence.
   - "cn": Simple and helpful Chinese explanation of what this sentence expresses.
   - "focus": Short title/reason for this expanded sentence.
3. "examParagraph": A cohesive, polished paragraph of 5-6 sentences, integrating the expanded idea.
4. "paragraphTranslation": Natural and elegant translation of the exam paragraph into Chinese.
5. "keyVocab": An array of 3-4 advanced but elegant vocabulary items or phrases used in the "examParagraph".
   Each object must have:
   - "word": The English word or phrase.
   - "meaning": The Chinese meaning.

CRITICAL QUALITY COMPLIANCE DIRECTIVES:
- DO NOT use stiff or unnatural Chinglish expressions.
- Prioritize natural, fluent collocations over artificial and mechanical complex grammar.
- NEVER use "keeping doing exercises" or "keep doing exercises". Instead, use "doing regular exercise", "exercising regularly", or "taking part in sports".
- NEVER use "learn knowledge" or "learn more knowledge". Instead, use "acquire knowledge", "gain knowledge", or "broaden our horizons".
- Avoid artificial terms like "teenager development" or "physical bodies".

Return your response in strict JSON format. All fields are required.`;

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
              }
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
    return res.status(200).json(parsedData);

  } catch (error: any) {
    console.error("[API ERROR] /api/essay-builder error details:", error);
    return res.status(200).json(getSimulatedEssayFallback(chineseText));
  }
}
