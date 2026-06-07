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
