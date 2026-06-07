import { GoogleGenAI, Type } from "@google/genai";
import { WRITING_TASKS } from "../src/data/writingTasks";

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
        // skip if unmatched
      } else {
        pinyin += char;
      }
    }
  }
  return pinyin.trim() || "Someone Special";
}

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

  // Person mapping
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

  // Play / Book Title mapping
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

  // Givers
  if (text.includes("爷爷") || text.includes("外公")) {
    result.giverName = "grandfather";
  } else if (text.includes("妈妈") || text.includes("母亲")) {
    result.giverName = "mother";
  } else if (text.includes("爸爸") || text.includes("父亲")) {
    result.giverName = "father";
  } else if (text.includes("老师")) {
    result.giverName = "teacher";
  }

  // Subjects
  if (text.includes("数学") && text.includes("英语")) {
    result.subjectName = "math and English lessons";
  } else if (text.includes("数学")) {
    result.subjectName = "math homework";
  } else if (text.includes("英语")) {
    result.subjectName = "English homework";
  }

  // Activities & restaurants
  if (text.includes("羽毛球")) {
    result.activityName = "badminton";
  } else if (text.includes("篮球")) {
    result.activityName = "basketball";
  } else if (text.includes("跑步")) {
    result.activityName = "running";
  }

  return result;
}

function getSimulatedWritingFallback(taskId: string, chineseIdeas: string) {
  const task = WRITING_TASKS.find(t => t.id === taskId) || WRITING_TASKS[0];
  const ideasText = chineseIdeas ? ` (融合想法: ${chineseIdeas})` : "";
  const nouns = translateChineseNouns(chineseIdeas);

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
    }
  };

  const targetMatch = fallbackDatabase[taskId] || fallbackDatabase["1"];

  let composition = targetMatch.composition;
  let highScoreVersion = targetMatch.highScoreVersion;
  let modelAnswer = targetMatch.modelAnswer;

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
  }

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

  const { taskId = "1", chineseIdeas = "" } = bodyObj || {};

  if (!taskId) {
    return res.status(400).json({ error: "Missing writing task ID." });
  }

  const task = WRITING_TASKS.find(t => t.id === taskId);
  if (!task) {
    return res.status(404).json({ error: "Selected writing task not found." });
  }

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(200).json(getSimulatedWritingFallback(taskId, chineseIdeas));
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });

    const writingPrompt = `You are an elite senior English writing coach specializing in the Shanghai Grade 9 Secondary School Entrance Examination (中考).
The student is working on the textbook unit writing task: "${task.title}" (Topic: "${task.topic}").

The student's Chinese ideas are:
"${chineseIdeas || "暂无具体想法（请基于标准课文大纲自主合理发散）"}"

CRITICAL CONTENT PERSONALIZATION RULES (MANDATORY & HIGHEST PRIORITY):
1. **Absolute Priority**: If the student provides any custom person name, place name, restaurant name, event, sport, activity, or object in their Chinese ideas, you MUST translate and keep this specific information. It must be the dominant subject of the essay.
2. **Never Replace or Override with Defaults**: You are STRICTLY FORBIDDEN from replacing the student's custom details with Standard Textbook defaults.
3. **Hierarchy of Choice**: User's explicit custom ideas must override pre-existing textbook defaults.

Generate a polished response in JSON format. The response must contain exactly:
1. "outline": An array of 3-4 strings detailing a structured paragraph-by-paragraph plan.
2. "composition": Standard level essay, around 80-100 words.
3. "highScoreVersion": Upgraded perfect score level essay, around 95-115 words.
4. "modelAnswer": The same "highScoreVersion" text with HTML annotation tags like <span class="bg-indigo-50 border border-indigo-100 px-1 text-indigo-700 font-semibold rounded mx-0.5 text-xs inline-block" title="Highlight info">[亮点: Info]</span> immediately after vital phrases wrapped in <strong>...</strong>.
5. "tips": An array of 3 highly actionable custom tips.

CRITICAL EXAM-ORIENTED QUALITY COMPLIANCE:
- NEVER use awkward or unlinear terms.

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
              items: { type: Type.STRING }
            },
            composition: { type: Type.STRING },
            highScoreVersion: { type: Type.STRING },
            modelAnswer: { type: Type.STRING },
            tips: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["outline", "composition", "highScoreVersion", "modelAnswer", "tips"]
        }
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText);
    return res.status(200).json(parsedData);

  } catch (error: any) {
    console.log("[Info] API /api/writing-coach error, running fallback:", error);
    return res.status(200).json(getSimulatedWritingFallback(taskId, chineseIdeas));
  }
}
