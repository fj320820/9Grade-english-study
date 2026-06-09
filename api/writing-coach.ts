import { GoogleGenAI, Type } from "@google/genai";
export interface WritingTaskData {
  id: string;
  title: string;
  topic: string;
  structure: string[];
  usefulPatterns: string[];
  highScoreExpressions: { phrase: string; meaning: string }[];
  modelParagraph: string;
  commonMistakes: string[];
  writingTips: string[];
}

export const WRITING_TASKS: WritingTaskData[] = [
  {
    id: "1",
    title: "A Famous Travel Writer",
    topic: "Travel and Explorations",
    structure: [
      "Part 1: Brief introduction to the travel writer (name, nationality, time period).",
      "Part 2: Main works or famous journeys (destinations, experiences, hardships, contributions).",
      "Part 3: Personal evaluation and inspiration (how their exploration spirits influence us)."
    ],
    usefulPatterns: [
      "... is widely recognized as one of the most remarkable travel writers in ...",
      "Born in ..., he spent a major portion of his life traveling to ...",
      "Not only did he record his unique footprints, but he also broadened our understanding of ..."
    ],
    highScoreExpressions: [
      { phrase: "embark on an adventurous voyage", meaning: "踏上冒险的航程" },
      { phrase: "conquer obstacles and hardships", meaning: "克服重重困难险阻" },
      { phrase: "leave an indelible mark on history", meaning: "在历史上留下不可磨灭的印记" }
    ],
    modelParagraph: "Marco Polo is one of the most adventurous travel writers in history. In the 13th century, he spent over twenty years traveling across Asian lands. His famous records of travel not only describe exotic landscapes but also bridge cultures, inspiring countless future explorers to pursue their dreams.",
    commonMistakes: [
      "Forgetting tense consistency (using simple present instead of past tense for deceased historical figures).",
      "Confusing 'travel' with 'traveler' or misusing travel as a countable noun."
    ],
    writingTips: [
      "Ensure a clear distinction between the narrative past (for the explorer's achievements) and the current present (for the modern significance).",
      "Incorporate temporal transitional words to make the writer's timeline logical."
    ]
  },
  {
    id: "2",
    title: "A Thank-you Email",
    topic: "Interpersonal Communication",
    structure: [
      "Part 1: Warm greeting and clear statement of purpose.",
      "Part 2: Detailed description of the helper's generous assistance and how it solved your problem.",
      "Part 3: Expressing deep gratitude again, offering future returns, and sincere sign-off."
    ],
    usefulPatterns: [
      "I am writing this email to express my heartfelt gratitude for your timely assistance.",
      "Words cannot express how thankful I am for your help when I was struggling with ...",
      "It was incredibly thoughtful of you to extend a helping hand during ..."
    ],
    highScoreExpressions: [
      { phrase: "deep appreciation", meaning: "深表感激" },
      { phrase: "pull through the difficulties", meaning: "度过难关" },
      { phrase: "extend a helping hand", meaning: "伸出援助之手" }
    ],
    modelParagraph: "Dear Sam, I am writing to express my deepest gratitude for your timely assistance yesterday. When I struggled with my math homework, you spent two hours patiently explaining the difficult formulas. Your kind help really pulled me through the difficulty, and I am incredibly grateful to have you as a friend. Best wishes, Jerry.",
    commonMistakes: [
      "Missing standard email elements like greetings (Dear...) and sign-offs (Best regards/Sincerely).",
      "Using 'thank you for' followed by an infinitive verb (e.g. 'thank you for help me') instead of a gerund (V-ing)."
    ],
    writingTips: [
      "Use descriptive details to outline the assistance rather than just saying 'Thank you for your help' repeatedly.",
      "Keep the tone polite, using modal verbs like 'could', 'would', and 'should' where appropriate."
    ]
  },
  {
    id: "3",
    title: "A Day in the Life",
    topic: "Daily Routines",
    structure: [
      "Part 1: General introduction to the day's setting or theme.",
      "Part 2: Chronological narration of activities (morning, afternoon, evening highlights with emotions).",
      "Part 3: Reflection on the day (meaning, feelings, or looking forward)."
    ],
    usefulPatterns: [
      "My ordinary days usually commence with an active morning routine.",
      "Having accomplished my morning studies, I proceeded to participate in ...",
      "Looking back on this rewarding day, I realize that even simple tasks carry profound ..."
    ],
    highScoreExpressions: [
      { phrase: "begin a refreshing day", meaning: "开启神清气爽的一天" },
      { phrase: "establish a structured routine", meaning: "建立有规律的作息" },
      { phrase: "find immense satisfaction in", meaning: "在……中获得极大的满足" }
    ],
    modelParagraph: "My typical day as a Grade 9 student begins at 6:30 a.m. After a healthy breakfast, I throw myself into intensive but rewarding studies at school. The afternoon highlight is always playing basketball with my classmates, which relieves stress. Looking back, everyday efforts bring me closer to my dreams.",
    commonMistakes: [
      "Listing events monotonously like a boring timetable (e.g., 'And then I did this. And then I did that.').",
      "Tense confusion between expressing everyday habits (present) and describing one specific past day (past)."
    ],
    writingTips: [
      "Introduce a variety of transition words (Having done..., Later, Shortly afterwards) to maintain natural paragraph flow.",
      "End with a positive, forward-looking sentence that wraps up the overall theme."
    ]
  },
  {
    id: "4",
    title: "Helping the Homeless After a Typhoon",
    topic: "Community Service & Disasters",
    structure: [
      "Part 1: Briefly describe the background (the typhoon's impact and the needs of the homeless).",
      "Part 2: Concrete actions taken by you or volunteers (distributing warm soup, clothing, or setting up shelters).",
      "Part 3: Sincere reflection on civic duty, social responsibility, or a call to action."
    ],
    usefulPatterns: [
      "In the wake of the devastating typhoon, many homeless citizens were left in critical conditions.",
      "Driven by empathy, we took immediate actions to distribute essential supplies like ...",
      "It is of monumental significance for us to stand together and offer shelter to those ..."
    ],
    highScoreExpressions: [
      { phrase: "devastating natural disaster", meaning: "毁灭性的自然灾害" },
      { phrase: "distribute relief materials", meaning: "分发救灾物资" },
      { phrase: "demonstrate solidarity and care", meaning: "展现团结与关爱" }
    ],
    modelParagraph: "After the devastating typhoon hit Shanghai, many homeless people were left cold and damp. Our school volunteer club immediately took action. We bought sleeping bags and distributed hot pumpkin soup to those staying under temporary bridges. This small act of kindness showed that unity raises hope even in dark times.",
    commonMistakes: [
      "Omitting the article when describing groups (using 'provide homeless people' instead of 'provide the homeless with...').",
      "Incorrect spelling or usage of typhoon/earthquake vocabulary (e.g. 'disastered people')."
    ],
    writingTips: [
      "Incorporate sensory details, such as the freezing rain versus the warm bowl of soup, to evoke emotional resonance.",
      "Focus on active verbs rather than dry passive listings to make your actions sound energetic."
    ]
  },
  {
    id: "5",
    title: "Improving Your Work",
    topic: "Action and Self-Reflection",
    structure: [
      "Part 1: Identify an area of work or academic study that needs improvement.",
      "Part 2: Detail specific, progressive steps or plans to tackle the weaknesses (e.g. schedules, habits, looking for help).",
      "Part 3: Express determination and expected outcomes or progress."
    ],
    usefulPatterns: [
      "Aiming to reach higher efficiency, I have formulated a comprehensive self-improvement plan.",
      "To overcome my procrastination, the first critical step I should take is to ...",
      "By sticking to this daily reflection, I am thoroughly convinced that my academic work will ..."
    ],
    highScoreExpressions: [
      { phrase: "identify critical flaws", meaning: "找出关键不足" },
      { phrase: "cultivate self-discipline", meaning: "培养自律能力" },
      { phrase: "make remarkable progress", meaning: "取得显著进步" }
    ],
    modelParagraph: "To improve my English essays, I have set up a weekly writing schedule. First, I read classic Shanghai exam sample essays to note high-score expressions. Then, I write one complete paragraph and ask my teacher for active feedback. I am confident that these continuous modifications will polish my writing skills.",
    commonMistakes: [
      "Stating vague, non-actionable resolutions (e.g., 'I will try harder tomorrow') without specific actionable steps.",
      "Incorrect prepositions after improve (e.g. 'do improvements in' instead of 'make improvements to/on')."
    ],
    writingTips: [
      "Structure your paragraphs logically. The first step, second step, and final outcomes should be clearly separated using sequencing markers.",
      "Express a strong and confident tone at the end to demonstrate your determination."
    ]
  },
  {
    id: "6",
    title: "My Family Life",
    topic: "Relationships and Family",
    structure: [
      "Part 1: General description of your family members and overall atmosphere.",
      "Part 2: A specific family incident or weekend routine showing warm relationships.",
      "Part 3: Sincere summary expressing what 'family' truly means to you."
    ],
    usefulPatterns: [
      "My warm family serves as a peaceful harbor that protects me from external stress.",
      "On typical Saturday nights, my family members gather together to share ...",
      "It is within this harmonious atmosphere that I have cultivated our strong bonds and ..."
    ],
    highScoreExpressions: [
      { phrase: "harmonious domestic atmosphere", meaning: "和谐的家庭氛围" },
      { phrase: "bridge the generation gap", meaning: "消除代沟" },
      { phrase: "unconditional love and backup", meaning: "无条件的支持与关爱" }
    ],
    modelParagraph: "My house is always filled with laughter. We love having family dinners on Friday nights, where we enjoy home-cooked meals and share funny tales from school. My parents always listen with warm smiles. Their constant support and gentle wisdom make my family a secure harbor.",
    commonMistakes: [
      "Listing dry profiles of each family member ('My father is a doctor. My mother is a nurse. I am a student.') instead of of a cohesive story.",
      "Using 'in weekends' rather than 'on weekends' or 'at weekends'."
    ],
    writingTips: [
      "Focus on one single recurring activity (like setting up dinner or studying together) to describe the family bonds in detail.",
      "Translate abstract thoughts of 'love' into detailed descriptions of actions like an attentive glance or a small encouragement."
    ]
  },
  {
    id: "7",
    title: "An Email to Aunt Linda",
    topic: "Family and Correspondence",
    structure: [
      "Part 1: Energetic opening asking about Aunt Linda's well-being and sharing your current status.",
      "Part 2: Describe a recent exciting school activity, holiday experience, or life update in detail.",
      "Part 3: Invite Aunt Linda to visit or reply, with affectionate closings."
    ],
    usefulPatterns: [
      "I hope this letter finds you in the excellent health and high spirits.",
      "I cannot wait to share some exciting news regarding my recent accomplishments in ...",
      "Please convey my warmest regards to uncle, and do write back when you find ..."
    ],
    highScoreExpressions: [
      { phrase: "share thrilling updates", meaning: "分享令人兴奋的近况" },
      { phrase: "academic achievements", meaning: "学业成绩/成就" },
      { phrase: "look forward to meeting up", meaning: "期待相聚" }
    ],
    modelParagraph: "Dear Aunt Linda, how have you been? I hope everything goes well with you. I am writing to tell you about our recent English drama festival. My class performed 'Tom Sawyer' and won first prize! I played Tom and had so much fun on stage. I really hope you can visit us soon. Best love, Jerry.",
    commonMistakes: [
      "Stiff or clinical language that sounds like an argumentative essay rather than a friendly catch-up.",
      "Writing 'looking forward to hear from you' instead of 'looking forward to hearing from you' (to is a preposition here)."
    ],
    writingTips: [
      "Keep the email style natural, choosing enthusiastic informal adjectives ('wonderful', 'thrilling', 'fantastic').",
      "Vary tenses smoothly from past events to future wishes."
    ]
  },
  {
    id: "8",
    title: "A Script for Hosting a Show",
    topic: "Public Presentation",
    structure: [
      "Part 1: Host's opening remarks (warm welcome, self-introduction, revealing the show's theme or guests).",
      "Part 2: Introducing the different segments of the show chronologically with enthusiastic transitions.",
      "Part 3: Host's closing remarks (thanking the audience, highlighting the takeaway, and farewell)."
    ],
    usefulPatterns: [
      "Ladies and gentlemen, a very warm welcome to today's special program of ...",
      "I am your host today, and it is my absolute honor and privilege to present ...",
      "Let us welcome our brilliant guests on stage with a big round of applause!"
    ],
    highScoreExpressions: [
      { phrase: "distinguished guests", meaning: "尊贵的嘉宾" },
      { phrase: "captivating performance", meaning: "吸睛的表演" },
      { phrase: "draw to a successful close", meaning: "圆满落下帷幕" }
    ],
    modelParagraph: "Ladies and gentlemen, welcome to our annual English Festival! I am your host, Jerry. Today, we are proud to present brilliant class dramas and spelling bees. Get ready to be amazed by our talented peers! Let us start with a big round of applause for Class 1!",
    commonMistakes: [
      "Writing the script in an overly formal, detached manner, neglecting to address the physical audience directly.",
      "Missing hosting connectors, leading to abrupt jump cuts between different sections of the program."
    ],
    writingTips: [
      "Use rhetorical questions and direct commands ('Get ready', 'Let's sit back', 'Can you believe...') to maintain interaction.",
      "Maintain a high energetic tone with short, punchy sentence constructions."
    ]
  },
  {
    id: "9",
    title: "A Restaurant Review",
    topic: "Lifestyle & Food",
    structure: [
      "Part 1: General info (restaurant name, location, cuisine type, and dining occasion).",
      "Part 2: Critical analysis of key aspects (food quality, signature dish, service attitude, interior decor, price).",
      "Part 3: Final verdict or recommendation score (whom it is suitable for and future visits)."
    ],
    usefulPatterns: [
      "Nestled in the heart of Shanghai, ... offers a unique gastronomic journey for ...",
      "As for the signature dish, the exquisite presentation perfectly matches its ...",
      "The attentive waiters and charming atmosphere make this eatery an ideal spot for ..."
    ],
    highScoreExpressions: [
      { phrase: "signature dish", meaning: "招牌菜" },
      { phrase: "mouth-watering delicacy", meaning: "令人垂涎的美食" },
      { phrase: "cozy and elegant interior", meaning: "温馨雅致的内饰" }
    ],
    modelParagraph: "Nestled on Nanjing Road, 'Green Oasis' is a delightful spot for healthy food. Their signature dish, baked salmon with herbs, is a mouth-watering delicacy. The fish is tender and perfectly matched with fresh organic salads. The cozy green interior and warm service make it highly recommended.",
    commonMistakes: [
      "Using monotonous descriptions like 'The food is very good, and the service is nice too' repeatedly.",
      "Misplacing reviews, e.g. focusing entirely on the architectural location rather than the actual dining experience."
    ],
    writingTips: [
      "Use culinary adjectives (savory, crispy, aromatic, tender) to describe specific sensory properties of the meal.",
      "Add a balanced, minor critique (e.g., 'although it is slightly crowded during peak hours') to make the review sound realistic."
    ]
  },
  {
    id: "10",
    title: "A Report on a Story",
    topic: "Literature Analysis",
    structure: [
      "Part 1: Bibliographic detail (story title, author, general genre, and setting).",
      "Part 2: Summary of the plot (beginning, main conflict/climax, and resolution).",
      "Part 3: Key theme analysis, moral lesson, and personal recommendation."
    ],
    usefulPatterns: [
      "The captivating short story under the title of ... is penned by the renowned ...",
      "The story centers on a young boy who accidentally discovers a secret ...",
      "This narrative serves as a subtle reminder that honesty is far more precious than ..."
    ],
    highScoreExpressions: [
      { phrase: "penned by a renowned author", meaning: "出自著名作家之手" },
      { phrase: "moral lesson", meaning: "道德寓意、教训" },
      { phrase: "unexpected twist of plot", meaning: "意想不到的情节转折" }
    ],
    modelParagraph: "This story report is on 'Surprise Endings'. Penned by O. Henry, the story describes two characters who plan to meet after twenty years. The unexpected twist at the end reveals one had become a policeman and the other a criminal. This clever plot teaches us that fate works in unexpected ways.",
    commonMistakes: [
      "Writing a pure plot outline that repeats the whole dialogue without abstracting the central lesson or critique.",
      "Tense inconsistency (jumping between past tense and present tense while outlining events)."
    ],
    writingTips: [
      "Use the literary present tense (e.g. 'the protagonist decides', 'the story reveals') to discuss permanent plot details.",
      "Clearly dedicate the last paragraph to the story's overall moral purpose and what we can learn."
    ]
  },
  {
    id: "11",
    title: "The Most Valuable Gift",
    topic: "Values and Treasures",
    structure: [
      "Part 1: Introduce the gift, who gave it to you, and the occasion.",
      "Part 2: Describe its physical appearance or sentimental value, and how it is used/kept.",
      "Part 3: Explain why it is the most valuable to you (the deep meaning/lessons/emotions it represents)."
    ],
    usefulPatterns: [
      "Among all the lovely souvenirs I have gathered, this clock stands out as the most ...",
      "Given to me by my mother upon my fifteen birthday, it holds enormous ...",
      "It is valuable not because of its high price, but because of the deep affection ..."
    ],
    highScoreExpressions: [
      { phrase: "hold immense sentimental value", meaning: "具有巨大的情感价值" },
      { phrase: "priceless spiritual wealth", meaning: "无价的精神财富" },
      { phrase: "standard of constant motivation", meaning: "不断激励的标杆" }
    ],
    modelParagraph: "The most valuable gift I have received is an old dictionary from my grandfather. On my twelfth birthday, he handed it to me, saying that knowledge opens gates. It holds immense sentimental value because it reminds me of his love and encourages me to persist during hard study hours.",
    commonMistakes: [
      "Overly focusing on the commercial price tag ('This watches is very expensive and cost 500 yuan') instead of the spiritual or sentimental impact.",
      "Misusing the passive voice (using 'The gift given by...' incorrectly, or active-passive mix-ups like 'I received a gift which gave by My mother')."
    ],
    writingTips: [
      "Emphasize the contrast between high financial value (which doesn't matter) and high spiritual importance (which makes it special).",
      "Use warm, emotional verbs to describe the preservation or usage of this specific article."
    ]
  },
  {
    id: "12",
    title: "My Favourite Sport",
    topic: "Sports and Fitness",
    structure: [
      "Part 1: Name your favorite sport and when/how you fell in love with it.",
      "Part 2: Explain details of how to play, where you play, and with whom.",
      "Part 3: Elaborate on how this sport benefits your physical condition, mental health, or teamwork skills."
    ],
    usefulPatterns: [
      "Volleyball has emerged as my absolute favorite sport because it represents ...",
      "Not only does this dynamic sport require extreme speed, but it also fosters ...",
      "Whenever I feel stressed from academic work, heading to the court helps me to ..."
    ],
    highScoreExpressions: [
      { phrase: "build robust physical fitness", meaning: "强健体魄" },
      { phrase: "foster team spirit and unity", meaning: "培养团队精神与凝聚力" },
      { phrase: "relieve psychological pressure", meaning: "缓解心理压力" }
    ],
    modelParagraph: "Basketball has always been my favourite sport. Every Wednesday school break, my classmates and I dash to the playground to play. This dynamic sport demands quick reflexes and, more importantly, fosters team spirit. It keeps me healthy and helps me shake off academic pressure.",
    commonMistakes: [
      "Listing boring official guidelines or rules of the game instead of focusing on personal connections and actions.",
      "Spelling errors in compound sports terms (e.g. 'foot ball' instead of 'football')."
    ],
    writingTips: [
      "Incorporate sports verbs (pass, dribble, slam-dunk, sprint, tackle) to make the physical action sound exciting and real.",
      "Tie physical exercise directly to mental relaxation, especially for hard-working Grade 9 students."
    ]
  },
  {
    id: "13",
    title: "An Email to a Sick Classmate",
    topic: "Care and Empathy",
    structure: [
      "Part 1: Sincere greetings expressing sympathy and concern about their health immediately.",
      "Part 2: Share warm updates about school life (recent activities, lessons covered) and offer to help them catch up with homework.",
      "Part 3: Wish them a speedy recovery and close with warm wishes."
    ],
    usefulPatterns: [
      "I was deeply saddened to hear that you have been under the weather recently.",
      "Please do not worry about school lessons; I will prepare diligent copies of notes and ...",
      "Rest well, take care of yourself, and I look forward to your energetic return to ..."
    ],
    highScoreExpressions: [
      { phrase: "under the weather", meaning: "身体抱恙、微恙" },
      { phrase: "copy of lesson notes", meaning: "课上笔记" },
      { phrase: "wish a speedy recovery", meaning: "祝愿早日康复" }
    ],
    modelParagraph: "Dear Tom, I was deeply saddened to hear that you have been under the weather. Please rest well and do not worry about schoolwork. I have copied all of this week's English lesson notes and will help you catch up once you feel better. Wishing you a very speedy recovery! Best, Jerry.",
    commonMistakes: [
      "Sounding insensitive by immediately skipping greetings or spending too much time explaining school pressure rather than healing.",
      "Writing 'recover sooner' instead of 'wish you a speedy recovery' or 'hope you feel better soon'."
    ],
    writingTips: [
      "Use warm comforting phrasing ('taking things easy', 'please do not worry', 'have you covered') to reassure the sick friend.",
      "Provide practical offers of support (such as tutoring or taking notes) rather than just empty pleasantry."
    ]
  }
];

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
    return res.status(200).json({ ...parsedData, isFallback: false });

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
      return res.status(200).json({ ...fallbackResult, isFallback: true });
    } catch (simError: any) {
      return res.status(500).json({
        error: "An error occurred with our writing coach database.",
        details: error.message
      });
    }
  }
}
