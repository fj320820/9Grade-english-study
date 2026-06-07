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

  const { chineseText = "", unitTitle = "", unitTopic = "" } = bodyObj || {};

  if (!chineseText || chineseText.trim() === "") {
    return res.status(400).json({ error: "Please enter a Chinese sentence." });
  }

  const getDynamicHeuristicFallback = (text: string) => {
    const normText = text.replace(/[。，！？、.,!?]/g, "").trim();

    // Direct match dictionaries
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

    // Comprehensive Action-Verb-Noun fallback list
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
        matched: () => normText.includes("学习英语") || normText.includes("学英语") || normText.includes("练英语"),
        basicInf: "learn English", basicGer: "learning English",
        naturalInf: "practice speaking English", naturalGer: "practising speaking English",
        highScoreInf: "master the English language", highScoreGer: "mastering the English language",
        exprs: [
          { expression: "practice speaking English", meaning: "经常开口讲英语、锻炼口语" },
          { expression: "master the language", meaning: "完全掌握、纯熟运用这门外语" }
        ],
        tips: "口语考试中，“学英语”可以具体到 practice speaking English，高分时用 master English 能瞬间提高词汇档次！"
      }
    ];

    const subDict = [
      { key: "我们", basic: "We", nat: "We", high: "We" },
      { key: "大家", basic: "Everyone", nat: "Everyone", high: "Every single person" },
      { key: "我", basic: "I", nat: "I", high: "I" }
    ];

    const auxDict = [
      { key: "应该", basic: "should", nat: "need to", high: "have an obligation to" },
      { key: "能够", basic: "can", nat: "are able to", high: "possess the ability to" }
    ];

    const verbDict = [
      { key: "吃", basic: "eat", nat: "consume", high: "partake in consuming" },
      { key: "写", basic: "write", nat: "draft", high: "compose" },
      { key: "喜欢", basic: "like to", nat: "enjoy", high: "am passionate about" }
    ];

    const nounDict = [
      { key: "自然", basic: "nature", nat: "natural beauty", high: "the stunning ecosystems" },
      { key: "生活", basic: "life", nat: "daily lives", high: "our short life paths" },
      { key: "地球", basic: "the earth", nat: "our planet", high: "our terrestrial motherland" }
    ];

    let adjEnBasic = "";
    let adjEnNat = "";
    let adjEnHigh = "";
    let hasAdj = false;

    if (normText.includes("重要") || normText.includes("关键") || normText.includes("必须")) {
      adjEnBasic = "is important";
      adjEnNat = "is highly essential";
      adjEnHigh = "plays a decisive role and is of immense significance";
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
      } else if (normText.includes("喜欢") || normText.includes("热爱")) {
        const subB = matchedSub.key ? matchedSub.basic : "I";
        const subN = matchedSub.key ? matchedSub.nat : "I";
        const subH = matchedSub.key ? matchedSub.high : "I";

        basicSentence = `${subB} like to ${matchedAction.basicInf}.`;
        naturalSentence = `${subN} really enjoy ${matchedAction.naturalGer}.`;
        highScoreSentence = `${subH} am extremely passionate about ${matchedAction.highScoreGer}.`;
      } else {
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
      } else {
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
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json(getDynamicHeuristicFallback(chineseText));
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

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
8. Absolute alignment with original intent.
9. NEVER wrap the Chinese sentence inside generic templates unless explicitly stated.

Remember:
- Basic version: A direct, grammatically correct and simple translation.
- Natural version: What native speakers actually say naturally/informally in conversational speech.
- High-Score version: Grade 9 oral exam perfect score sentence.
- Provide the response in strict JSON format. Give encouraging guides.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessage,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            basicVersion: { type: Type.STRING },
            naturalVersion: { type: Type.STRING },
            highScoreVersion: { type: Type.STRING },
            keyExpressions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  expression: { type: Type.STRING },
                  meaning: { type: Type.STRING }
                },
                required: ["expression", "meaning"]
              }
            },
            followUpQuestion: { type: Type.STRING },
            simpleTips: { type: Type.STRING }
          },
          required: ["basicVersion", "naturalVersion", "highScoreVersion", "keyExpressions", "followUpQuestion", "simpleTips"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);
    return res.status(200).json(parsedData);

  } catch (error: any) {
    console.log("[Info] API /api/expression-coach error, running fallback:", error);
    return res.status(200).json(getDynamicHeuristicFallback(chineseText));
  }
}
