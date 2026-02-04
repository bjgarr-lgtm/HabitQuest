/* How to Avoid Addiction — V2 (no frameworks)
   Runs as a static site. Saves progress in localStorage (on this device).
   NOTE: app.js must contain ONLY JavaScript.
*/
"use strict";

/* =========================================================
   DOM HELPERS
========================================================= */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* =========================================================
   STORAGE + HELPERS
========================================================= */
const STORAGE_KEY = "htaa_v2_state";

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function isoDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function safeNum(x, fallback=0){
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}
function safeStr(x, fallback=""){
  if(typeof x !== "string") return fallback;
  const s = x.trim();
  return s.length ? s : fallback;
}
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}
// Deterministic “random” so a lesson keeps the same quiz each load.
function mulberry32(seed){
  let t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function uid(){
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

/* =========================================================
   CONTENT
========================================================= */
const TIPS = [
  "When you’re unsure, pause and ask: “Is this safe for my brain and body?”",
  "Pick a trusted adult now—so you know who to talk to later.",
  "Sleep + food + water make your brain stronger.",
  "Real friends respect your ‘no’.",
  "Stress is a signal, not a boss. You can handle it.",
  "If something feels risky, ask: “Will this help Future Me?”",
];

const GAME_SCENARIOS = [
  {
    prompt: "A friend says: “Try this, everyone’s doing it.” What’s the best response?",
    choices: [
      { text: "“No. I’m not into that. Let’s do something else.”", good: true,  why: "Clear no + switch." },
      { text: "“Maybe later, don’t tell anyone.”",                 good: false, why: "That keeps risk open." },
      { text: "“Okay, so you like me.”",                           good: false, why: "Pressure isn’t friendship." }
    ]
  },
  {
    prompt: "You’re stressed after school. What’s a healthy first move?",
    choices: [
      { text: "Take 4 deep breaths and drink water.", good: true,  why: "Calms your body fast." },
      { text: "Do something risky to forget it.",     good: false, why: "Risky escapes can cause bigger problems." },
      { text: "Hold it in forever.",                  good: false, why: "Talking helps." }
    ]
  },
  {
    prompt: "Someone jokes about you for saying no. Best move?",
    choices: [
      { text: "Stay calm, repeat ‘No’, and step away.", good: true,  why: "You protect yourself." },
      { text: "Prove yourself by saying yes.",          good: false, why: "That’s how pressure wins." },
      { text: "Start a fight.",                         good: false, why: "Fighting can make things worse." }
    ]
  }
];

const BADGES = [
  { id:"starter-star",    name:"Starter Star",    xpRequired: 50,    icon:"⭐" },
  { id:"calm-master",     name:"Calm Master",     xpRequired: 120,   icon:"🫧" },
  { id:"quiz-whiz",       name:"Quiz Whiz",       xpRequired: 200,   icon:"🧠" },
  { id:"streak-hero",     name:"Streak Hero",     xpRequired: 350,   icon:"🔥" },
  { id:"game-champ",      name:"Game Champ",      xpRequired: 500,   icon:"🏆" },
  { id:"daily-doer",      name:"Daily Doer",      xpRequired: 650,   icon:"📅" },
  { id:"focus-falcon",    name:"Focus Falcon",    xpRequired: 800,   icon:"🦅" },
  { id:"kind-mind",       name:"Kind Mind",       xpRequired: 950,   icon:"💛" },
  { id:"stress-tamer",    name:"Stress Tamer",    xpRequired: 1100,  icon:"🧯" },
  { id:"brave-voice",     name:"Brave Voice",     xpRequired: 1250,  icon:"🗣️" },
  { id:"steady-steps",    name:"Steady Steps",    xpRequired: 1400,  icon:"👟" },
  { id:"boundary-boss",   name:"Boundary Boss",   xpRequired: 1600,  icon:"🛡️" },
  { id:"help-seeker",     name:"Help Seeker",     xpRequired: 1800,  icon:"🤝" },
  { id:"sleep-guardian",  name:"Sleep Guardian",  xpRequired: 2000,  icon:"🌙" },
  { id:"hydration-hero",  name:"Hydration Hero",  xpRequired: 2200,  icon:"💧" },
  { id:"streak-7",        name:"7‑Day Streak",    xpRequired: 2400,  icon:"7️⃣" },
  { id:"streak-14",       name:"14‑Day Streak",   xpRequired: 2700,  icon:"1️⃣4️⃣" },
  { id:"streak-30",       name:"30‑Day Streak",   xpRequired: 3200,  icon:"3️⃣0️⃣" },
  { id:"lesson-10",       name:"10 Lessons",      xpRequired: 3500,  icon:"📘" },
  { id:"lesson-20",       name:"20 Lessons",      xpRequired: 4000,  icon:"📗" },
  { id:"lesson-30",       name:"30 Lessons",      xpRequired: 4600,  icon:"📙" },
  { id:"game-grinder",    name:"Game Grinder",    xpRequired: 5200,  icon:"🎮" },
  { id:"calm-pro",        name:"Calm Pro",        xpRequired: 6000,  icon:"🧘" },
  { id:"level-10",        name:"Level 10",        xpRequired: 6800,  icon:"🔟" },
  { id:"legend",          name:"Legend",          xpRequired: 8000,  icon:"👑" },
  { id:"gentle-giant",    name:"Gentle Giant",    xpRequired: 9000,  icon:"🐘" },
  { id:"super-helper",    name:"Super Helper",    xpRequired: 10000, icon:"🦸" },
  { id:"wise-owl",        name:"Wise Owl",        xpRequired: 12000, icon:"🦉" },
];

const AVATARS = ["🦊","🐼","🐸","🦁","🐨","🐯","🐧","🐙","🦄","🐲"];
const CUSTOM_AVATAR_PREFIX = "custom:";
function isCustomAvatarRef(v){
  return typeof v === "string" && v.startsWith(CUSTOM_AVATAR_PREFIX);
}

/* =========================================================
   TRACKS + LESSONS
========================================================= */
const TRACKS = {
  general:     { name:"General",                  desc:"Healthy choices, stress tools, confidence, asking for help." },
  nicotine:    { name:"Nicotine / Vaping",        desc:"Cravings, pressure, coping skills, and refusing offers." },
  alcohol:     { name:"Alcohol",                  desc:"Safer choices, boundaries, and handling social pressure." },
  gaming:      { name:"Gaming / Screen habits",   desc:"Balance, routines, and stopping when you planned to stop." },
  socialmedia: { name:"Social media / Scrolling", desc:"Dopamine loops, focus, and healthier habits." },
  caffeine:    { name:"Caffeine / Energy drinks", desc:"Sleep/energy basics and alternatives to overstimulation." },
};

const CURRICULUM = [
  { title:"Choices & Your Future",              goal:"Learn how small choices add up over time.",                track:"general" },
  { title:"Handling Stress Safely",             goal:"Build safe, healthy stress tools.",                        track:"general" },
  { title:"Saying No With Confidence",          goal:"Practice refusing pressure calmly.",                       track:"general" },
  { title:"Friend Pressure vs Real Friends",    goal:"Spot healthy friendships.",                                track:"general" },
  { title:"Boredom Without Risk",               goal:"Make a fun plan that’s safe.",                             track:"general" },
  { title:"Feelings Are Signals",               goal:"Name feelings and respond wisely.",                        track:"general" },
  { title:"Big Emotions Plan",                  goal:"Use a 3-step plan when emotions spike.",                   track:"general" },
  { title:"Asking for Help",                    goal:"Know who to talk to and how to ask.",                      track:"general" },
  { title:"Online Influence",                   goal:"Handle trends, dares, and social pressure.",               track:"socialmedia" },
  { title:"Confidence & Self-Respect",          goal:"Build self-respect so pressure loses power.",              track:"general" },
  { title:"Healthy Coping Tools",               goal:"Choose coping tools that help long-term.",                 track:"general" },
  { title:"Sleep, Food, Water = Brain Fuel",    goal:"Build habits that protect your brain.",                    track:"caffeine" },
  { title:"Stress + School",                    goal:"Use safe tools before stress stacks up.",                  track:"general" },
  { title:"Goals & Tiny Steps",                 goal:"Make goals and track small wins.",                         track:"general" },
  { title:"Mistakes & Comebacks",               goal:"Recover from mistakes without shame.",                     track:"general" },
  { title:"Problem Solving",                    goal:"Use a simple method to solve problems.",                   track:"general" },
  { title:"Positive Routines",                  goal:"Build routines that make life easier.",                    track:"gaming" },
  { title:"Boundaries",                         goal:"Protect your time, body, and mind.",                       track:"general" },
  { title:"Handling Conflict",                  goal:"Stay calm and communicate respectfully.",                  track:"general" },
  { title:"Trusted Adults",                     goal:"Build your support team.",                                 track:"general" },
  { title:"Cravings & Urges Plan",              goal:"Make a plan for urges so they pass safely.",               track:"nicotine" },
  { title:"Refusing Offers (Practice)",         goal:"Use a confident script and exit plan.",                    track:"nicotine" },
  { title:"Parties & Social Pressure",          goal:"Make choices when others are pushing you.",                track:"alcohol" },
  { title:"Helping a Friend",                   goal:"What to do if a friend is struggling.",                    track:"general" },
  { title:"Self-Talk",                          goal:"Use kinder thoughts to make better choices.",              track:"general" },
  { title:"Dealing With Anger",                 goal:"Cool down without hurting anyone.",                        track:"general" },
  { title:"Dealing With Anxiety",               goal:"Use grounding + breathing tools.",                         track:"general" },
  { title:"Building Confidence Skills",         goal:"Practice skills that grow confidence.",                    track:"general" },
  { title:"Being a Leader",                     goal:"Help others make safe choices too.",                       track:"general" },
  { title:"Review & Next Steps",                goal:"Lock in what you learned and keep going.",                 track:"general" },
];

function makeLessonContent(title, goal, day){
  const punchy = [
    `Today’s topic: ${title}.`,
    `Goal: ${goal}`,
    "Why it matters: your brain learns from repeats — small safe choices become automatic.",
    "Try it now (30 seconds): take 4 slow breaths and relax your shoulders.",
    "Real life win: if something feels risky or confusing, talk to a trusted adult."
  ];

  const upgrades = {
    2: [
      `Today’s topic: ${title}.`,
      `Goal: ${goal}`,
      "Stress is your body’s alarm — not a command.",
      "Fast reset: inhale 4, exhale 6, repeat 4 times.",
      "Next step: pick ONE helpful action (water, walk, talk, music, stretch)."
    ],
    3: [
      `Today’s topic: ${title}.`,
      `Goal: ${goal}`,
      "Script that works: **No + reason (optional) + switch + exit**.",
      "Example: “No thanks. I’m good. Let’s do something else.”",
      "Practice: say your script out loud one time."
    ],
    8: [
      `Today’s topic: ${title}.`,
      `Goal: ${goal}`,
      "Asking for help is a strength move, not a weakness move.",
      "Starter line: “Can I talk to you about something kinda stressful?”",
      "If one adult isn’t helpful, try a different trusted adult."
    ],
    12: [
      `Today’s topic: ${title}.`,
      `Goal: ${goal}`,
      "Brain fuel is the cheat code: sleep + food + water.",
      "If you feel weird, snack + water first before making decisions.",
      "Tiny step: drink water right now."
    ],
  };

  return upgrades[day] || punchy;
}


/* =========================================================
   QUIZZES — DETERMINISTIC
========================================================= */
const LESSON_FOCUS = {
  1:  { words:["future","choices","tiny steps","practice"], skill:"Future Me thinking" },
  2:  { words:["stress","calm","breathing","body"], skill:"Healthy stress tools" },
  3:  { words:["no","confidence","switch","exit"], skill:"Refusal skills" },
  4:  { words:["friends","pressure","respect","boundaries"], skill:"Friendship signals" },
  5:  { words:["boredom","plan","fun","safe"], skill:"Safe fun planning" },
  6:  { words:["feelings","signals","name it","choose"], skill:"Emotion naming" },
  7:  { words:["big emotions","3 steps","pause","plan"], skill:"Big feelings plan" },
  8:  { words:["help","trusted adult","talk","support"], skill:"Asking for help" },
  9:  { words:["online","trends","dare","influence"], skill:"Online choices" },
  10: { words:["confidence","self-respect","values","pride"], skill:"Self-respect" },
  11: { words:["coping tools","healthy","long-term","safe"], skill:"Coping tool picking" },
  12: { words:["sleep","food","water","brain fuel"], skill:"Brain fuel habits" },
  13: { words:["school","stress","stack up","reset"], skill:"School stress plan" },
  14: { words:["goals","tiny steps","track","wins"], skill:"Goal setting" },
  15: { words:["mistakes","comeback","learn","try again"], skill:"Recovering from mistakes" },
  16: { words:["problem solving","steps","options","choose"], skill:"Problem solving" },
  17: { words:["routine","balance","screen time","schedule"], skill:"Routines" },
  18: { words:["boundaries","time","body","mind"], skill:"Boundaries" },
  19: { words:["conflict","calm","respect","talk"], skill:"Conflict skills" },
  20: { words:["support team","trusted adults","check-in","help"], skill:"Support team" },
  21: { words:["cravings","urges","delay","distract"], skill:"Urge plan" },
  22: { words:["refuse offers","script","exit plan","practice"], skill:"Offer refusal" },
  23: { words:["party","pressure","safe choice","plan"], skill:"Social pressure plan" },
  24: { words:["help a friend","listen","adult help","support"], skill:"Helping friends" },
  25: { words:["self-talk","kind thoughts","coach voice","try"], skill:"Self-talk" },
  26: { words:["anger","cool down","space","safe"], skill:"Anger plan" },
  27: { words:["anxiety","grounding","breathing","present"], skill:"Anxiety tools" },
  28: { words:["confidence skills","practice","brave steps","build"], skill:"Confidence building" },
  29: { words:["leader","example","help others","kind"], skill:"Leadership" },
  30: { words:["review","next steps","keep going","plan"], skill:"Keep going" },
};

function difficultyForDay(day){
  if(day <= 5) return 1;
  if(day <= 12) return 2;
  if(day <= 20) return 3;
  return 4;
}

function shuffleInPlace(arr, rng){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Shuffles the options and updates the answer index accordingly
function shuffleQuestionOptions(item, rng){
  const opts = item.options.map((text, idx) => ({ text, idx }));
  shuffleInPlace(opts, rng);
  const newAnswer = opts.findIndex(o => o.idx === item.answer);
  return { ...item, options: opts.map(o => o.text), answer: newAnswer };
}


function makeQuizForLesson(day, title, goal, track){
  const diff = difficultyForDay(day);
  const rng = mulberry32(1000 + day * 97);
  const focus = LESSON_FOCUS[day] || { words:["choices","safe","plan","help"], skill:"Healthy choices" };
  const w = focus.words;

  // helper: shuffle array deterministically
  const shuffleInPlace = (arr) => {
    for(let i = arr.length - 1; i > 0; i--){
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // build question where we mark the correct option by value, then shuffle options
  const q = (question, correctOpt, wrongOpts) => {
    const options = [correctOpt, ...wrongOpts];
    shuffleInPlace(options);
    const answer = options.indexOf(correctOpt);
    return { q: question, options, answer };
  };

  const anchors = [
    q(
      `Today’s lesson (“${title}”) is mostly about…`,
      `${focus.skill}`,
      ["Hiding problems", "Taking bigger risks"]
    ),
    q(
      `A helpful question for “${w[0]}” moments is…`,
      "Will this help Future Me?",
      ["How do I keep this secret?", "What’s the riskiest option?"]
    ),
    q(
      `A strong “safe choice” is usually…`,
      "Safe and helpful long‑term",
      ["Risky but exciting", "Something you must hide"]
    ),
  ];

  const poolEasy = [
    q(
      `When you feel ${w[1] || "pressure"}, the best first step is…`,
      "Pause and think",
      ["Say yes fast", "Do it secretly"]
    ),
    q(
      `A trusted adult could be…`,
      "Parent/guardian/teacher/coach",
      ["Only strangers online", "Nobody"]
    ),
    q(
      `Good friends will…`,
      "Respect your boundaries",
      ["Force you to prove yourself", "Laugh when you’re uncomfortable"]
    ),
  ];

  const poolMed = [
    q(
      `Pick the best “switch” after saying no:`,
      "Let’s do something else.",
      ["You’re annoying.", "Fine, I’ll do it."]
    ),
    q(
      `If stress is high, a smart tool is…`,
      "Slow breathing + water",
      ["Start a fight", "Do something risky"]
    ),
    q(
      `A “tiny step” is…`,
      "Small and doable today",
      ["Huge and impossible", "Only for adults"]
    ),
  ];

  const poolHard = [
    q(
      `Scenario: You feel ${w[2] || "stressed"} and someone offers a risky escape. Best plan:`,
      "Delay + distract + talk to someone",
      ["Keep it secret", "Say yes to fit in"]
    ),
    q(
      `A good boundary sounds like…`,
      "No thanks. I’m heading out.",
      ["I guess… maybe…", "Stop talking forever."]
    ),
    q(
      `If you make a mistake, the best comeback is…`,
      "Learn + get support + try again",
      ["Give up forever", "Blame everyone"]
    ),
  ];

  const poolBoss = [
    q(
      `Boss moment: Your friend laughs at your “no.” Best move is…`,
      "Repeat no calmly and step away",
      ["Prove yourself by saying yes", "Start a fight"]
    ),
    q(
      `Which plan is safest AND realistic?`,
      "One you can do today + a trusted adult if needed",
      ["A secret plan nobody knows", "A plan that needs expensive stuff"]
    ),
    q(
      `When you feel a big urge, it helps to remember…`,
      "Urges rise and fall like waves",
      ["Urges never change", "You must obey urges"]
    ),
  ];

  let pool = [...poolEasy];
  if(diff >= 2) pool = pool.concat(poolMed);
  if(diff >= 3) pool = pool.concat(poolHard);
  if(diff >= 4) pool = pool.concat(poolBoss);

  // track-specific additions
  if(track === "socialmedia"){
    pool.push(
      q("Online dares are safest when you…", "Skip them and choose your own plan", ["Do them for likes", "Hide them from adults"]),
      q("A smart scroll rule is…", "Set a stop time and follow it", ["Scroll until 2AM", "Never stop"])
    );
  }
  if(track === "gaming"){
    pool.push(
      q("A healthy gaming habit is…", "Stop when you planned to stop", ["Play forever", "Skip sleep for one more level"]),
      q("Best first step when you feel stuck in a loop:", "Stand up + water + 2‑minute reset", ["Keep clicking", "Get mad at yourself"])
    );
  }
  if(track === "caffeine"){
    pool.push(
      q("Brain fuel usually starts with…", "Sleep + food + water", ["Only energy drinks", "Skipping meals"]),
      q("If you’re tired, a smart option is…", "Drink water and take a short break", ["Chug caffeine every time", "Give up"])
    );
  }
  if(track === "nicotine"){
    pool.push(
      q("A cravings plan often begins with…", "Delay and distract", ["Hide and panic", "Say yes fast"]),
      q("If someone offers you something risky, you can say…", "No thanks. I’m good.", ["Maybe later secretly.", "Okay to fit in."])
    );
  }
  if(track === "alcohol"){
    pool.push(
      q("At a party, a strong plan is…", "Have an exit plan + buddy/adult backup", ["Do whatever the crowd does", "Hide it"]),
      q("Pressure is not friendship. True or false?", "True", ["False"])
    );
  }

  // Shuffle pool, then pick UNIQUE questions
  shuffleInPlace(pool);

  const picked = [];
  const seen = new Set();

  const addUnique = (item) => {
    if(!item || !item.q) return false;
    if(seen.has(item.q)) return false;
    seen.add(item.q);
    picked.push(item);
    return true;
  };

  anchors.forEach(addUnique);
  pool.forEach(item => {
    if(picked.length < 12) addUnique(item);
  });

  // If still short (should be rare), add unique from combined pools
  const fallback = shuffleInPlace([...poolEasy, ...poolMed, ...poolHard, ...poolBoss]);
  for(const item of fallback){
    if(picked.length >= 12) break;
    addUnique(item);
  }

  // hard guarantee: trim to 12
  return picked.slice(0, 12);
}


const LESSONS = CURRICULUM.map((c, i) => ({
  day: i + 1,
  track: c.track || "general",
  title: c.title,
  goal: c.goal,
  content: makeLessonContent(c.title, c.goal, i + 1),
  quiz: makeQuizForLesson(i + 1, c.title, c.goal, c.track || "general"),
}));

/* =========================================================
   GAMES CATALOG (PHASE 3 pacing tweak)
========================================================= */
const GAMES = [
  { id:"choicequest", title:"Choice Quest",    desc:"Quick practice: pick the healthiest choice.",                 status:"ready", unlock:{ type:"free" } },
  { id:"breathing",   title:"Breathing Buddy", desc:"60‑second calm timer that earns XP.",                         status:"ready", unlock:{ type:"free" } },
  { id:"responsebuilder", title:"Response Builder", desc:"Build a strong ‘No + Switch’ sentence.", status:"ready", unlock:{ type:"free" } },
  { id:"pressuremeter", title:"Pressure Meter", desc:"Keep pressure low using healthy moves.", status:"ready", unlock:{ type:"lessons", lessons:3 } },

  // “Soon” stays soon, but unlock gates are a bit later so it feels paced.
  { id:"memory",          title:"Memory Match",        desc:"Match healthy coping tools.",                          status:"soon", unlock:{ type:"xp",     xp:250 } },
  { id:"coping-sort",     title:"Coping Sort",         desc:"Sort coping tools into helpful vs not helpful.",       status:"soon", unlock:{ type:"lessons",lessons:5 } },
  { id:"streak-run",      title:"Streak Run",          desc:"Quick reaction game to keep your streak alive.",       status:"soon", unlock:{ type:"level",  level:4 } },
  { id:"focus-dodge",     title:"Focus Dodge",         desc:"Avoid distractions; build focus.",                     status:"soon", unlock:{ type:"level",  level:5 } },
  { id:"goal-builder",    title:"Goal Builder",        desc:"Pick goals + tiny steps to reach them.",               status:"soon", unlock:{ type:"xp",     xp:600 } },
  { id:"friendship-quiz", title:"Friendship Signals",  desc:"Spot healthy vs unhealthy friend behaviors.",          status:"soon", unlock:{ type:"lessons",lessons:10 } },
  { id:"stress-lab",      title:"Stress Lab",          desc:"Try safe stress tools and see what works.",            status:"soon", unlock:{ type:"xp",     xp:900 } },
];

/* =========================================================
   STATE
========================================================= */
function blankSaveSlot(){
  return {
    savedISO: null,
    label: "",
    data: null, // { nodeId, hearts, wisdom, tokens, flags, visited, history, lastLessonDay }
  };
}

const DEFAULT_STATE = {
  currentLessonIndex: 0,
  completedDays: [],
  lastCompletedISO: null,
  streak: 0,
  highScore: 0,
  xp: 0,
  level: 1,
  profileName: "Player",
  avatar: AVATARS[0],
  customAvatars: [],
  ownedBadges: [],
  ratings: { total: 0, count: 0 },
  selectedTrack: "general",
  reflections: {
  // day -> { text, savedISO, rewarded: true/false }
  },
  lastLoginISO: null,


  // PHASE 3: store “struggles” to recommend next lesson
  quizAttempts: {
    // day -> { attempts, wrongTotal, lastISO }
  },

  // Habit Quest (branching)
  habitQuest: {
    nodeId: "hq_start",
    hearts: 3,
    wisdom: 0,
    tokens: 0,
    lastLessonDay: 0,
    flags: {},
    visited: {},
    history: [],
  },

  // PHASE 3: save slots (3)
  habitQuestSlots: [blankSaveSlot(), blankSaveSlot(), blankSaveSlot()],
};

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return { ...DEFAULT_STATE };
    return JSON.parse(raw);
  }catch{
    return { ...DEFAULT_STATE };
  }
}

function normalizeState(s){
  const safe = (s && typeof s === "object") ? s : {};
  const merged = {
    ...DEFAULT_STATE,
    ...safe,
    completedDays: Array.isArray(safe.completedDays) ? safe.completedDays : [],
    ownedBadges: Array.isArray(safe.ownedBadges) ? safe.ownedBadges : [],
    ratings: {
      ...DEFAULT_STATE.ratings,
      ...(safe.ratings && typeof safe.ratings === "object" ? safe.ratings : {})
    },
    quizAttempts: (safe.quizAttempts && typeof safe.quizAttempts === "object") ? safe.quizAttempts : {},
    reflections: (safe.reflections && typeof safe.reflections === "object") ? safe.reflections : {},

    habitQuest: {
      ...DEFAULT_STATE.habitQuest,
      ...(safe.habitQuest && typeof safe.habitQuest === "object" ? safe.habitQuest : {})
    },
    habitQuestSlots: Array.isArray(safe.habitQuestSlots) ? safe.habitQuestSlots : DEFAULT_STATE.habitQuestSlots,
  };

  merged.profileName = safeStr(merged.profileName, "Player").slice(0, 24);
  merged.selectedTrack = TRACKS[merged.selectedTrack] ? merged.selectedTrack : "general";
  merged.xp = safeNum(merged.xp, 0);
  merged.level = safeNum(merged.level, 1);
  merged.highScore = safeNum(merged.highScore, 0);
  merged.streak = safeNum(merged.streak, 0);
  merged.currentLessonIndex = safeNum(merged.currentLessonIndex, 0);

  // Normalize custom avatar list
  merged.customAvatars = Array.isArray(safe.customAvatars) ? safe.customAvatars : [];
  merged.customAvatars = merged.customAvatars
    .filter(a => a && typeof a.id === "string" && typeof a.dataURL === "string" && a.dataURL.startsWith("data:image/"))
    .map(a => ({ id: a.id, dataURL: a.dataURL, createdISO: safeStr(a.createdISO, isoDate(new Date())) }));

  // Back-compat: older builds used `customAvatar` (single)
  if(typeof safe.customAvatar === "string" && safe.customAvatar.startsWith("data:image/")){
    const exists = merged.customAvatars.some(a => a.dataURL === safe.customAvatar);
    if(!exists){
      merged.customAvatars.unshift({ id: uid(), dataURL: safe.customAvatar, createdISO: isoDate(new Date()) });
    }
  }

  // Normalize avatar selection
  const isEmoji = AVATARS.includes(merged.avatar);
  const isCustomRef = isCustomAvatarRef(merged.avatar);
  if(!isEmoji && !isCustomRef){
    if(merged.avatar === "__custom__" && merged.customAvatars.length){
      merged.avatar = CUSTOM_AVATAR_PREFIX + merged.customAvatars[0].id;
    }else{
      merged.avatar = AVATARS[0];
    }
  }
  if(isCustomAvatarRef(merged.avatar)){
    const id = merged.avatar.slice(CUSTOM_AVATAR_PREFIX.length);
    const found = merged.customAvatars.some(a => a.id === id);
    if(!found) merged.avatar = AVATARS[0];
  }

  // Habit Quest normalize
  const hq = merged.habitQuest || {};
  merged.habitQuest.nodeId = safeStr(hq.nodeId, DEFAULT_STATE.habitQuest.nodeId);
  merged.habitQuest.hearts = clamp(safeNum(hq.hearts, 3), 0, 5);
  merged.habitQuest.wisdom = Math.max(0, safeNum(hq.wisdom, 0));
  merged.habitQuest.tokens = Math.max(0, safeNum(hq.tokens, 0));
  merged.habitQuest.lastLessonDay = Math.max(0, safeNum(hq.lastLessonDay, 0));
  merged.habitQuest.flags = (hq.flags && typeof hq.flags === "object") ? hq.flags : {};
  merged.habitQuest.visited = (hq.visited && typeof hq.visited === "object") ? hq.visited : {};
  merged.habitQuest.history = Array.isArray(hq.history) ? hq.history.slice(-80) : [];

  // Save slots normalize (3)
  const slots = Array.isArray(merged.habitQuestSlots) ? merged.habitQuestSlots : [];
  while(slots.length < 3) slots.push(blankSaveSlot());
  merged.habitQuestSlots = slots.slice(0, 3).map(slot => {
    const out = blankSaveSlot();
    if(slot && typeof slot === "object"){
      out.savedISO = safeStr(slot.savedISO, null);
      out.label = safeStr(slot.label, "").slice(0, 24);
      out.data = (slot.data && typeof slot.data === "object") ? slot.data : null;
    }
    return out;
  });

  return merged;
}

let state = normalizeState(loadState());
saveState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =========================================================
   AVATAR HELPERS
========================================================= */
function getCustomAvatarById(id){
  const list = Array.isArray(state.customAvatars) ? state.customAvatars : [];
  return list.find(a => a && a.id === id) || null;
}
function getSelectedCustomAvatar(){
  if(!isCustomAvatarRef(state.avatar)) return null;
  const id = state.avatar.slice(CUSTOM_AVATAR_PREFIX.length);
  return getCustomAvatarById(id);
}
function getSelectedAvatarDataURL(){
  const c = getSelectedCustomAvatar();
  return c && c.dataURL ? c.dataURL : null;
}

function getReflectionPromptForLesson(lesson){
  // You can customize per day (below). Fallback is generic.
  const prompts = {
    1: "What’s one choice Future You would thank you for this week?",
    2: "What are 2 stress tools you can actually do in under 60 seconds?",
    3: "Write your best ‘No + Switch’ sentence for a real situation.",
    4: "How can you tell the difference between pressure and a real friend?",
    5: "List 3 safe ‘boredom breakers’ you’d actually try.",
    6: "Name 1 feeling you had today and what it was trying to tell you.",
    7: "When emotions spike, what’s your 3‑step calm plan?",
    8: "Who is 1 trusted adult you could talk to, and what would you say?",
    9: "What’s 1 online trend rule you want to follow to stay safe?",
    10:"What’s a boundary you want to practice this week?"
  };
  return prompts[lesson.day] || "What’s one thing you learned today, and how will you use it?";
}

function renderReflection(lesson){
  const promptEl = $("#reflection-prompt");
  const inputEl = $("#reflection-input");
  const statusEl = $("#reflection-status");
  const saveBtn = $("#btn-save-reflection");
  if(!promptEl || !inputEl || !saveBtn) return;

  promptEl.textContent = getReflectionPromptForLesson(lesson);

  const entry = state.reflections?.[String(lesson.day)];
  inputEl.value = entry?.text || "";
  if(statusEl) statusEl.textContent = entry?.savedISO ? `Saved (${entry.savedISO})` : "";

  if(!saveBtn.__bound){
    saveBtn.__bound = true;
    saveBtn.addEventListener("click", () => {
      const lessons = getActiveLessons();
      const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
      const cur = lessons[idx];
      const txt = safeStr($("#reflection-input")?.value || "", "").slice(0, 800);

      state.reflections = (state.reflections && typeof state.reflections === "object") ? state.reflections : {};
      const key = String(cur.day);
      const prev = state.reflections[key] && typeof state.reflections[key] === "object" ? state.reflections[key] : {};
      const firstReward = !prev.rewarded && txt.length >= 20;

      state.reflections[key] = {
        text: txt,
        savedISO: isoDate(new Date()),
        rewarded: prev.rewarded || (txt.length >= 20)
      };
      saveState();

      if(firstReward){
        addXP(10); // small reflection reward once
      }
      renderReflection(cur);
    });
  }
}


/* =========================================================
   TRACKS
========================================================= */
function getActiveLessons(){
  const t = state.selectedTrack || "general";
  if(t === "general") return LESSONS;
  const filtered = LESSONS.filter(l => (l.track === t) || (l.track === "general"));
  return filtered.length ? filtered : LESSONS;
}

function renderTrackUI(){
  const sel = $("#track-select");
  const preview = $("#track-preview");
  const t = state.selectedTrack || "general";
  if(sel) sel.value = t;
  if(preview) preview.textContent = (TRACKS[t] ? TRACKS[t].desc : TRACKS.general.desc);
}

function bindTracks(){
  const sel = $("#track-select");
  $("#btn-apply-track")?.addEventListener("click", () => {
    const v = sel?.value || "general";
    state.selectedTrack = TRACKS[v] ? v : "general";
    state.currentLessonIndex = 0;
    saveState();
    renderTrackUI();
    renderHomeRecommendation();
    showView("lesson");
  });
  $("#btn-clear-track")?.addEventListener("click", () => {
    state.selectedTrack = "general";
    state.currentLessonIndex = 0;
    saveState();
    renderTrackUI();
    renderHomeRecommendation();
    showView("lesson");
  });
  sel?.addEventListener("change", () => {
    const v = sel.value;
    const p = $("#track-preview");
    if(p) p.textContent = (TRACKS[v]?.desc || TRACKS.general.desc);
  });
}

/* =========================================================
   PROFILE NAME
========================================================= */
function bindProfileNameEditor(){
  const input = $("#profile-name-input");
  const btn = $("#btn-save-name");
  if(!input || !btn) return;
  if(btn.__bound) return;
  btn.__bound = true;
  input.value = safeStr(state.profileName, "Player").slice(0, 24);
  const commit = () => {
    state.profileName = safeStr(input.value, "Player").slice(0, 24);
    input.value = state.profileName;
    saveState();
    renderProfile();
  };
  btn.addEventListener("click", commit);
  input.addEventListener("keydown", (e) => { if(e.key === "Enter") commit(); });
}

/* =========================================================
   XP / LEVEL
========================================================= */
function recalcLevel(){
  state.xp = safeNum(state.xp, 0);
  state.level = 1 + Math.floor(state.xp / 200);
}

function addXP(amount){
  const a = safeNum(amount, 0);
  if(a <= 0) return;
  state.xp = safeNum(state.xp, 0) + a;
  recalcLevel();
  saveState();
  updateHomeStats();
  renderProgress();
  renderProfile();
  renderShop();
  renderRate();
  renderGamesCatalog();
  renderHomeRecommendation();
}

/* =========================================================
   NAVIGATION
========================================================= */
function showView(name){
  document.body.style.overflow = "";
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(`#view-${name}`)?.classList.remove("hidden");
  $$(".tab").forEach(t => t.classList.remove("active"));
  $(`.tab[data-view="${name}"]`)?.classList.add("active");

  if(name === "lesson")   renderLesson();
  if(name === "games")    renderGamesCatalog();
  if(name === "profile"){
    renderProfile();
    renderProgress(); // now lives inside profile
  }
  if(name === "progress") name = "home";
  if(name === "shop")     renderShop();
  if(name === "rate")     renderRate();
  if(name === "tracks")   renderTrackUI();
  if(name === "map")      renderStoryMap();
  if(name === "home")     renderHomeRecommendation();
  if(name === "habitquest"){
    $("#hq-current-node") && 
      ($("#hq-current-node").textContent = state.habitQuest.nodeId);
    $("#hq-token-count") && 
      ($("#hq-token-count").textContent = state.habitQuest.tokens);
    $("#hq-heart-count") && 
      ($("#hq-heart-count").textContent = state.habitQuest.hearts);
  }
}

function bindNav(){
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.view;
      if(v) showView(v);
    });
  });
  $("#btn-open-lesson")?.addEventListener("click", () => showView("lesson"));
  $("#btn-open-rate")?.addEventListener("click", () => showView("rate"));
  $("#btn-start-lesson")?.addEventListener("click", () => showView("lesson"));
  $("#btn-start-game")?.addEventListener("click", () => showView("games"));
  $("#btn-open-habitquest-tab")?.addEventListener("click", () => showView("habitquest"));
}

function renderHabitQuestLanding(){
  const wrap = $("#hq-wrap");
  if(!wrap) return;

  const gate = gameUnlockStatus({ unlock:{ type:"lessons", lessons:1 } });
  wrap.innerHTML = `
    <div class="card">
      <h2 style="margin-top:0;">Habit Quest 📖</h2>
      <p class="muted">A branching story where your choices change the path.</p>
      <p class="muted">${escapeHtml(gate.reason)} • ${gate.unlocked ? "Playable" : "Locked"}</p>
      <div class="actions">
        <button class="btn primary" id="btn-hq-play" type="button" ${gate.unlocked ? "" : "disabled"}>
          ${gate.unlocked ? "Play Habit Quest" : "Locked"}
        </button>
      </div>
    </div>
  `;

  $("#btn-hq-play")?.addEventListener("click", () => startHabitQuest());
}


/* =========================================================
   TIPS
========================================================= */
function randomTip(){
  const el = $("#tip-text");
  if(!el) return;
  el.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
}

/* =========================================================
   RECOMMENDED NEXT LESSON (PHASE 3)
========================================================= */
function recordQuizAttempt(day, wrongCount){
  const d = String(day);
  state.quizAttempts = (state.quizAttempts && typeof state.quizAttempts === "object") ? state.quizAttempts : {};
  const cur = state.quizAttempts[d] && typeof state.quizAttempts[d] === "object"
    ? state.quizAttempts[d]
    : { attempts: 0, wrongTotal: 0, lastISO: null };

  cur.attempts = safeNum(cur.attempts, 0) + 1;
  cur.wrongTotal = safeNum(cur.wrongTotal, 0) + Math.max(0, safeNum(wrongCount, 0));
  cur.lastISO = isoDate(new Date());
  state.quizAttempts[d] = cur;
  saveState();
}

function getRecommendedLesson(){
  const lessons = getActiveLessons();
  if(!lessons.length) return null;

  // Prefer: next uncompleted lesson in your active list
  const uncompleted = lessons.filter(l => !state.completedDays.includes(l.day));
  if(uncompleted.length) return uncompleted[0];

  // If all complete in track, recommend a “review” based on highest wrongTotal historically
  let best = null;
  let bestScore = -1;
  for(const l of lessons){
    const stat = state.quizAttempts?.[String(l.day)];
    const score = stat ? safeNum(stat.wrongTotal, 0) : 0;
    if(score > bestScore){
      bestScore = score;
      best = l;
    }
  }
  return best || lessons[0];
}

function goToLessonDay(day){
  const lessons = getActiveLessons();
  const idx = lessons.findIndex(l => l.day === day);
  if(idx >= 0){
    state.currentLessonIndex = idx;
    saveState();
    showView("lesson");
  }
}

function renderHomeRecommendation(){
  const boxTitle = $("#rec-title");
  const boxDesc  = $("#rec-desc");
  const btn      = $("#btn-go-recommended");
  if(!boxTitle || !boxDesc || !btn) return;

  const rec = getRecommendedLesson();
  if(!rec){
    boxTitle.textContent = "Recommended next lesson";
    boxDesc.textContent = "Start with Today’s Lesson!";
    btn.disabled = true;
    return;
  }

  const isDone = state.completedDays.includes(rec.day);
  const trackName = TRACKS[state.selectedTrack]?.name || "General";
  boxTitle.textContent = `Recommended: Day ${rec.day} — ${rec.title}`;
  boxDesc.textContent = isDone
    ? `Review (Track: ${trackName}). You’ve done this, but it’s a good refresh.`
    : `Next up (Track: ${trackName}). Goal: ${rec.goal}`;

  btn.disabled = false;
  if(!btn.__bound){
    btn.__bound = true;
    btn.addEventListener("click", () => {
      const r = getRecommendedLesson();
      if(!r) return;
      goToLessonDay(r.day);
    });
  }
}

/* =========================================================
   LESSONS + QUIZ
========================================================= */
function renderLesson(){
  const lessons = getActiveLessons();
  if(!lessons.length) return;

  const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
  state.currentLessonIndex = idx;
  saveState();

  const lesson = lessons[idx];
  $("#lesson-title") && ($("#lesson-title").textContent = lesson.title);
  $("#lesson-day")   && ($("#lesson-day").textContent   = `Day ${lesson.day} • Track: ${TRACKS[state.selectedTrack]?.name || "General"}`);
  $("#lesson-goal")  && ($("#lesson-goal").textContent  = `Goal: ${lesson.goal}`);

  const body = $("#lesson-content");
  if(body){
    body.innerHTML = "";
    lesson.content.forEach(p => {
      const el = document.createElement("p");
      el.textContent = p;
      body.appendChild(el);
    });
  }
  renderQuiz(lesson);
  renderReflection(lesson);

  updateLessonStatus(lesson.day);
}

function renderQuiz(lesson){
  const quiz = $("#quiz");
  if(!quiz) return;
  quiz.innerHTML = "";

  lesson.quiz.forEach((item, qi) => {
    const block = document.createElement("div");
    block.className = "card";
    block.style.marginTop = "10px";
    block.style.background = "rgba(255,255,255,0.06)";

    const qEl = document.createElement("p");
    qEl.style.fontWeight = "800";
    qEl.textContent = `${qi+1}. ${item.q}`;
    block.appendChild(qEl);

    item.options.forEach((opt, oi) => {
      const label = document.createElement("label");
      label.style.display = "flex";
      label.style.gap = "10px";
      label.style.alignItems = "center";
      label.style.margin = "8px 0";
      label.style.cursor = "pointer";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `q_${qi}`;
      input.value = String(oi);

      const span = document.createElement("span");
      span.textContent = opt;

      label.append(input, span);
      block.appendChild(label);
    });

    quiz.appendChild(block);
  });
}

function quizScoreForCurrentLesson(){
  const lessons = getActiveLessons();
  const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
  const lesson = lessons[idx];
  let correct = 0;
  lesson.quiz.forEach((item, qi) => {
    const picked = document.querySelector(`input[name="q_${qi}"]:checked`);
    if(picked && Number(picked.value) === item.answer) correct++;
  });
  return { correct, total: lesson.quiz.length, day: lesson.day, title: lesson.title };
}

function updateLessonStatus(day){
  const el = $("#lesson-status");
  if(!el) return;
  const done = state.completedDays.includes(day);
  el.textContent = done
    ? "✅ Well Done!"
    : "Not completed yet — answer all questions correctly, then click “Mark Lesson Complete”.";
}

function applyDailyStreakBonusIfAny(prevLastISO, newLastISO){
  // If the user completed yesterday and completes today, reward a small bonus.
  // (We only call this when a completion actually happens.)
  const today = isoDate(new Date());
  if(newLastISO !== today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = isoDate(yesterday);

  if(prevLastISO === yesterdayISO){
    // PHASE 3: streak bonus
    state.habitQuest.tokens = safeNum(state.habitQuest.tokens, 0) + 1; // bonus token
    addXP(15); // bonus XP
  }
}

function bindLessonButtons(){
  $("#btn-prev-lesson")?.addEventListener("click", () => {
    const lessons = getActiveLessons();
    state.currentLessonIndex = clamp(state.currentLessonIndex - 1, 0, lessons.length - 1);
    saveState();
    renderLesson();
  });

  $("#btn-next-lesson")?.addEventListener("click", () => {
    const lessons = getActiveLessons();
    state.currentLessonIndex = clamp(state.currentLessonIndex + 1, 0, lessons.length - 1);
    saveState();
    renderLesson();
  });

  $("#btn-complete-lesson")?.addEventListener("click", () => {
    const score = quizScoreForCurrentLesson();
    const wrong = score.total - score.correct;

    // record attempt if not perfect (helps recommendation)
    if(wrong > 0){
      recordQuizAttempt(score.day, wrong);
      $("#lesson-status") && ($("#lesson-status").textContent =
        `Almost! Quiz score: ${score.correct}/${score.total}. Fix the missed ones and try again.`);
      renderHomeRecommendation();
      return;
    }

    const firstTime = !state.completedDays.includes(score.day);

    if(firstTime){
      // quiz perfect reward
      addXP(score.total * 5);

      state.completedDays.push(score.day);

      // completion bonus
      addXP(50);

      // +1 token per FIRST-TIME lesson completion
      state.habitQuest.tokens = safeNum(state.habitQuest.tokens,0) + 1;
    }

    state.habitQuest.lastLessonDay = score.day;

    // streak logic + PHASE 3 daily streak bonus
    const prevLastISO = state.lastCompletedISO;
    const todayISO = isoDate(new Date());
    if(state.lastCompletedISO !== todayISO){
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = isoDate(yesterday);
      state.streak = (state.lastCompletedISO === yesterdayISO) ? (state.streak + 1) : 1;
      state.lastCompletedISO = todayISO;

      applyDailyStreakBonusIfAny(prevLastISO, state.lastCompletedISO);
    }

    saveState();
    updateHomeStats();
    updateLessonStatus(score.day);
    renderProgress();
    renderGamesCatalog();
    renderHomeRecommendation();
  });
}

function applyDailyLoginBonus(){
  const today = isoDate(new Date());
  if(state.lastLoginISO === today) return;

  // daily login bonus
  state.habitQuest.tokens = safeNum(state.habitQuest.tokens, 0) + 1;
  addXP(5);

  state.lastLoginISO = today;
  saveState();
}


/* =========================================================
   HOME STATS
========================================================= */
function updateHomeStats(){
  // streak
  const streakLabel = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
  $("#streak-text")   && ($("#streak-text").textContent   = streakLabel);
  $("#streak-text-2") && ($("#streak-text-2").textContent = streakLabel);

  // dashboard stats
  $("#dash-xp")      && ($("#dash-xp").textContent = String(state.xp));
  $("#dash-level")   && ($("#dash-level").textContent = String(state.level));
  $("#dash-lessons") && ($("#dash-lessons").textContent = String(state.completedDays.length));
}


/* =========================================================
   GAME OVERLAY (RELIABLE)
========================================================= */
let gameMode = null;
let gameIndex = 0;
let gameScore = 0;
let breathingTimerId = null;

function overlayEl(){ return document.getElementById("game-overlay"); }

function ensureGameOverlay(){
  const old = overlayEl();
  if(old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "game-overlay";
  overlay.className = "gameOverlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.display = "none";

  overlay.innerHTML = `
    <div class="gameOverlayInner" role="dialog" aria-modal="true" aria-label="Game overlay">
      <div class="gameOverlayTop">
        <div class="gameOverlayTitle">
          <div class="big" id="go-title">Game</div>
          <div class="muted" id="go-sub">Make good choices. Earn XP.</div>
        </div>
        <div class="gameOverlayStats">
          <span class="badge" id="go-score">Score: 0</span>
          <button class="btn" id="go-exit" type="button">Exit</button>
        </div>
      </div>
      <div class="divider"></div>
      <div id="go-content"></div>
      <div class="actions" style="margin-top:14px;">
        <button class="btn primary" id="go-restart" type="button" style="display:none;">Restart</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  if(!document.getElementById("__overlay_css")){
    const style = document.createElement("style");
    style.id = "__overlay_css";
    style.textContent = `
      .gameOverlay{
        position:fixed; inset:0; z-index:9999;
        background: rgba(0,0,0,0.70);
        backdrop-filter: blur(8px);
        padding: 14px;
        overflow:auto;
        color: rgba(255,255,255,0.92);
      }
      .gameOverlayInner{
        max-width: 1100px;
        margin: 0 auto;
        background: rgba(20,20,30,0.92);
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 16px;
        padding: 16px;
      }
      .gameOverlayTop{
        display:flex; gap:14px; align-items:center; justify-content:space-between;
        flex-wrap: wrap;
      }
      .gameOverlayStats{ display:flex; gap:10px; align-items:center; }
      .choiceBtn{
        display:block; width:100%;
        text-align:left;
        padding: 12px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.92);
        cursor:pointer;
        margin-top: 10px;
        font-weight: 800;
      }
      .choiceBtn:hover{ background: rgba(255,255,255,0.10); }
      .choiceBtn:disabled{ opacity:0.6; cursor:not-allowed; }
      .choiceGood{ border-color: rgba(80,220,140,0.6); }
      .choiceBad{ border-color: rgba(255,120,120,0.6); }
      .hqRow{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 10px; }
      .hqChip{
        padding: 6px 10px;
        border-radius: 999px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.14);
        display:flex; align-items:center; gap:8px;
        font-size: 12px;
      }
      .hqAvatarImg{
        width:22px;height:22px;border-radius:10px;object-fit:cover;
        border:1px solid rgba(255,255,255,0.18);
      }
      .hqSlotRow{
        display:flex; gap:10px; flex-wrap:wrap;
        margin-top: 12px;
      }
      .hqSlotCard{
        flex: 1 1 220px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 12px;
      }
      .mapTable{
        width:100%;
        border-collapse: collapse;
        margin-top: 10px;
      }
      .mapTable th, .mapTable td{
        text-align:left;
        padding: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.12);
        vertical-align: top;
        font-size: 13px;
      }
      .mapPill{
        display:inline-flex;
        align-items:center;
        padding: 4px 8px;
        border-radius: 999px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        font-size: 12px;
        margin-right: 6px;
      }
      .mapPill.ok{ border-color: rgba(80,220,140,0.5); }
      .mapPill.no{ border-color: rgba(255,120,120,0.5); }
    `;
    document.head.appendChild(style);
  }

  overlay.querySelector("#go-exit")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeGameOverlay();
  });

  overlay.querySelector("#go-restart")?.addEventListener("click", (e) => {
    e.preventDefault();
    if(gameMode === "choicequest") startChoiceQuest();
    if(gameMode === "breathing") startBreathing();
    if(gameMode === "habitquest") startHabitQuest();
  });

  overlay.addEventListener("click", (e) => {
    if(e.target === overlay) closeGameOverlay();
  });

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && overlayEl() && overlayEl().style.display === "block"){
      closeGameOverlay();
    }
        // Ctrl+Shift+D opens Dev Panel
    if(e.ctrlKey && e.shiftKey && (e.key === "D" || e.key === "d")){
      e.preventDefault();
      openDevPanel();
    }

  });
}

/* =========================================================
   DEV PANEL (PHASE 2)
   Ctrl+Shift+D to open. For testing branches fast.
========================================================= */
function openDevPanel(){
  ensureGameOverlay();
  gameMode = "devpanel";
  gameScore = 0;
  openGameOverlay("Dev Panel", "Testing tools (local only).");
  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const flags = (state.habitQuest.flags && typeof state.habitQuest.flags === "object")
    ? state.habitQuest.flags
    : {};

  area.innerHTML = `
    <div class="card" style="background: rgba(255,255,255,0.06);">
      <p style="margin:0 0 10px; font-weight:900;">Jump to node</p>
      <div class="row" style="margin:0;">
        <input id="dev-node" class="textInput" placeholder="ex: hq_start" />
        <button class="btn small" id="dev-jump" type="button">Jump</button>
      </div>
      <p class="muted" style="margin:10px 0 0;">Tip: use the Story Map in Habit Quest overlay for nodeIds.</p>
    </div>

    <div class="divider"></div>

    <div class="card" style="background: rgba(255,255,255,0.06);">
      <p style="margin:0 0 10px; font-weight:900;">Grant resources</p>
      <div class="row" style="margin:0;">
        <button class="btn small" id="dev-token" type="button">+1 Token</button>
        <button class="btn small" id="dev-heart" type="button">+1 Heart</button>
        <button class="btn small" id="dev-xp" type="button">+100 XP</button>
        <button class="btn small danger" id="dev-reset-hq" type="button">Reset Run</button>
      </div>
      <p class="muted" style="margin:10px 0 0;">
        Hearts clamp at 5. Tokens/Xp can grow.
      </p>
    </div>

    <div class="divider"></div>

    <div class="card" style="background: rgba(255,255,255,0.06);">
      <p style="margin:0 0 10px; font-weight:900;">Flags + history</p>
      <div class="row" style="margin:0;">
        <button class="btn small" id="dev-clear-flags" type="button">Clear Flags</button>
        <button class="btn small" id="dev-print-flags" type="button">Print Flags</button>
        <button class="btn small" id="dev-dump-history" type="button">Dump History</button>
      </div>
      <pre id="dev-flags-out" style="margin:10px 0 0; white-space:pre-wrap; color:rgba(255,255,255,0.85);"></pre>
    </div>
  `;

  const out = area.querySelector("#dev-flags-out");
  const refreshOut = () => {
    const f = (state.habitQuest.flags && typeof state.habitQuest.flags === "object") ? state.habitQuest.flags : {};
    out.textContent = JSON.stringify(f, null, 2);
  };
  refreshOut();

  area.querySelector("#dev-jump")?.addEventListener("click", () => {
    const id = (area.querySelector("#dev-node")?.value || "").trim();
    if(!id) return;
    if(!HQ_NODES[id]) return alert("Unknown nodeId: " + id);
    state.habitQuest.nodeId = id;
    saveState();
    closeGameOverlay();
    startHabitQuest();
  });

  area.querySelector("#dev-token")?.addEventListener("click", () => {
    state.habitQuest.tokens = safeNum(state.habitQuest.tokens,0) + 1;
    saveState();
    refreshOut();
  });
  area.querySelector("#dev-heart")?.addEventListener("click", () => {
    state.habitQuest.hearts = clamp(safeNum(state.habitQuest.hearts,3) + 1, 0, 5);
    saveState();
    refreshOut();
  });
  area.querySelector("#dev-xp")?.addEventListener("click", () => {
    addXP(100);
    refreshOut();
  });
  area.querySelector("#dev-reset-hq")?.addEventListener("click", () => {
    if(!confirm("Reset Habit Quest run?")) return;
    hqResetRun();
    refreshOut();
  });

  area.querySelector("#dev-clear-flags")?.addEventListener("click", () => {
    if(!confirm("Clear all HQ flags?")) return;
    state.habitQuest.flags = {};
    saveState();
    refreshOut();
  });
  area.querySelector("#dev-print-flags")?.addEventListener("click", () => {
    console.log("HQ flags:", structuredClone(state.habitQuest.flags || {}));
    refreshOut();
    alert("Flags printed to console.");
  });
  area.querySelector("#dev-dump-history")?.addEventListener("click", async () => {
    const dump = {
      nodeId: state.habitQuest.nodeId,
      hearts: state.habitQuest.hearts,
      wisdom: state.habitQuest.wisdom,
      tokens: state.habitQuest.tokens,
      flags: state.habitQuest.flags || {},
      visited: state.habitQuest.visited || {},
      history: state.habitQuest.history || [],
    };
    console.log("HQ dump:", structuredClone(dump));
    try{
      await navigator.clipboard.writeText(JSON.stringify(dump, null, 2));
      alert("Dump copied to clipboard (and printed to console).");
    }catch{
      alert("Dump printed to console (clipboard blocked).");
    }
  });

  const restartBtn = overlay?.querySelector("#go-restart");
  if(restartBtn) restartBtn.style.display = "none";
}


function openGameOverlay(title, subtitle=""){
  const overlay = overlayEl();
  if(!overlay) return;
  overlay.style.display = "block";
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  const titleEl = overlay.querySelector("#go-title");
  const subEl = overlay.querySelector("#go-sub");
  const scoreEl = overlay.querySelector("#go-score");
  const restartBtn = overlay.querySelector("#go-restart");

  if(titleEl) titleEl.textContent = title;
  if(subEl) subEl.textContent = subtitle;
  if(scoreEl) scoreEl.textContent = `Score: ${gameScore}`;
  if(restartBtn) restartBtn.style.display = "none";
}

function closeGameOverlay(){
  const overlay = overlayEl();
  if(!overlay) return;

  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  const c = overlay.querySelector("#go-content");
  if(c) c.innerHTML = "";

  if(breathingTimerId){
    clearInterval(breathingTimerId);
    breathingTimerId = null;
  }

  gameMode = null;
}

function openStoryMapOverlay(){
  gameMode = "storymap";
  gameScore = 0;
  openGameOverlay("Story Map", "Visited nodes + where choices can go.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const visited = (state.habitQuest && state.habitQuest.visited && typeof state.habitQuest.visited === "object")
    ? state.habitQuest.visited
    : {};

  const rows = Object.entries(HQ_NODES).map(([id, node]) => {
    const v = !!visited[id];
    const chapter = node.chapter || "";
    const nexts = (Array.isArray(node.choices) ? node.choices : [])
      .map(c => (c && c.next) ? c.next : null)
      .filter(Boolean);

    const uniqNexts = Array.from(new Set(nexts));
    return { id, v, chapter, nexts: uniqNexts };
  });

  rows.sort((a,b) => {
    // visited first, then by chapter, then id
    if(a.v !== b.v) return a.v ? -1 : 1;
    const ca = a.chapter.toLowerCase();
    const cb = b.chapter.toLowerCase();
    if(ca < cb) return -1;
    if(ca > cb) return 1;
    return a.id.localeCompare(b.id);
  });

  area.innerHTML = `
    <p class="muted" style="margin-top:0;">
      Visited: <strong>${Object.keys(visited).length}</strong> / <strong>${rows.length}</strong>
    </p>

    <div class="card" style="margin-top:10px; background: rgba(255,255,255,0.06);">
      <p style="margin:0 0 10px; font-weight:900;">Jump to a node (dev‑friendly)</p>
      <div class="row" style="margin:0;">
        <input id="sm-jump" class="textInput" placeholder="ex: hq_forest_boss" />
        <button class="btn small" id="sm-jump-btn" type="button">Jump</button>
      </div>
      <p class="muted" style="margin:10px 0 0;">Tip: copy a nodeId from the list below.</p>
    </div>

    <div class="divider"></div>

    <div class="card" style="background: rgba(255,255,255,0.06);">
      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
        <p style="margin:0; font-weight:900;">Nodes</p>
        <button class="btn small" id="sm-clear-visited" type="button">Clear visited (only)</button>
      </div>
      <div id="sm-list" style="margin-top:12px;"></div>
    </div>
  `;

  const list = area.querySelector("#sm-list");
  if(list){
    list.innerHTML = rows.map(r => {
      const badge = r.v ? "✅ Visited" : "⬜ Not visited";
      const nextLine = r.nexts.length ? r.nexts.join(", ") : "—";
      return `
        <div class="card" style="margin:10px 0; background: rgba(255,255,255,0.05);">
          <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">
            <div>
              <div style="font-weight:900;">${escapeHtml(r.id)}</div>
              <div class="muted" style="margin-top:4px;">${escapeHtml(r.chapter)}</div>
              <div class="muted" style="margin-top:6px;">Next: ${escapeHtml(nextLine)}</div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <span class="badge">${badge}</span>
              <button class="btn small" data-jump="${escapeHtml(r.id)}" type="button">Jump</button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }

  // jump handlers
  const doJump = (nodeId) => {
    const id = safeStr(nodeId, "");
    if(!id) return;
    if(!HQ_NODES[id]) {
      alert("Unknown nodeId: " + id);
      return;
    }
    state.habitQuest.nodeId = id;
    saveState();
    closeGameOverlay();
    startHabitQuest(); // re-open Habit Quest at that node
  };

  area.querySelector("#sm-jump-btn")?.addEventListener("click", () => {
    const v = area.querySelector("#sm-jump")?.value || "";
    doJump(v);
  });

  area.querySelectorAll("button[data-jump]").forEach(btn => {
    btn.addEventListener("click", () => doJump(btn.getAttribute("data-jump")));
  });

  area.querySelector("#sm-clear-visited")?.addEventListener("click", () => {
    if(!confirm("Clear visited nodes? (Does not change flags/tokens/hearts)")) return;
    state.habitQuest.visited = {};
    state.habitQuest.history = [];
    saveState();
    openStoryMapOverlay(); // refresh
  });

  const restartBtn = overlay?.querySelector("#go-restart");
  if(restartBtn) restartBtn.style.display = "none"; // story map doesn’t need restart
}


/* =========================================================
   GAMES CATALOG
========================================================= */
function gameUnlockStatus(game){
  const u = game.unlock || { type:"free" };
  const completed = state.completedDays.length;

  if(u.type === "free") return { unlocked:true, reason:"Unlocked" };
  if(u.type === "xp"){
    const ok = state.xp >= u.xp;
    return { unlocked: ok, reason: ok ? "Unlocked" : `Locked: earn ${u.xp} XP` };
  }
  if(u.type === "level"){
    const ok = state.level >= u.level;
    return { unlocked: ok, reason: ok ? "Unlocked" : `Locked: reach Level ${u.level}` };
  }
  if(u.type === "lessons"){
    const ok = completed >= u.lessons;
    return { unlocked: ok, reason: ok ? "Unlocked" : `Locked: complete ${u.lessons} lessons` };
  }
  return { unlocked:false, reason:"Locked" };
}

function renderGamesCatalog(){
  const grid = $("#games-grid");
  if(!grid) return;
  grid.innerHTML = "";

  const makeTile = ({ title, desc, statusLine, buttonText, onClick, disabled=false, extraClass="" }) => {
    const card = document.createElement("div");
    card.className = `card gameCard ${extraClass}`.trim();

    const h = document.createElement("h3");
    h.textContent = title;

    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = desc;

    const p2 = document.createElement("p");
    p2.className = "muted";
    p2.textContent = statusLine;

    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.type = "button";
    btn.textContent = buttonText;

    if(disabled){
      btn.disabled = true;
      btn.classList.add("disabled");
    }else{
      btn.addEventListener("click", onClick);
    }

    card.append(h, p, p2, btn);
    return card;
  };

  // ✅ Normal game tiles (NO Story Map tile)
  GAMES
    .filter(g => g.id !== "storymap") // <-- removes Story Map card entirely
    .forEach(game => {
      const { unlocked, reason } = gameUnlockStatus(game);

      const btnText =
        (game.status === "ready" && unlocked) ? "Play" : "Locked / Soon";

      const disabled =
        !(game.status === "ready" && unlocked);

      const card = document.createElement("div");
      card.className = "card gameCard";

      const h = document.createElement("h3");
      h.textContent = game.title;

      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = game.desc;

      const p2 = document.createElement("p");
      p2.className = "muted";
      p2.textContent = `${reason} • ${game.status === "ready" ? "Playable" : "Coming soon"}`;

      const btn = document.createElement("button");
      btn.className = "btn primary";
      btn.type = "button";
      btn.textContent = btnText;

      if(disabled){
        btn.disabled = true;
        btn.classList.add("disabled");
      }else{
        btn.addEventListener("click", () => launchGame(game.id));
      }

      card.append(h, p, p2, btn);
      grid.appendChild(card);
    });
}


function launchGame(id){
  if(id === "choicequest") return startChoiceQuest();
  if(id === "breathing") return startBreathing();
  if(id === "habitquest") return startHabitQuest();
  if(id === "responsebuilder") return startResponseBuilder();
  if(id === "pressuremeter") return startPressureMeter();

  alert("This game is coming soon. Keep earning XP to unlock more!");
}

function startPressureMeter(){
  gameMode = "pressuremeter";
  gameScore = 0;
  openGameOverlay("Pressure Meter", "Use calm + exit moves to keep pressure low.");
  renderPressureMeter();
}

function renderPressureMeter(){
  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  let pressure = 35; // 0..100
  let t = 0;
  let alive = true;
  let loopId = null;

  const draw = (msg="") => {
    area.innerHTML = `
      <p class="muted" style="margin-top:0;">Goal: keep pressure under <strong>80</strong> for 30 seconds.</p>
      <div class="card" style="background: rgba(255,255,255,0.06);">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div><strong>Time:</strong> ${t}s / 30s</div>
          <div><strong>Pressure:</strong> ${pressure}</div>
        </div>
        <div style="height:12px; border-radius:999px; background: rgba(255,255,255,0.08); margin-top:10px; overflow:hidden;">
          <div style="height:100%; width:${pressure}%; background: ${pressure<50 ? "rgba(68,215,182,0.9)" : pressure<80 ? "rgba(255,220,90,0.9)" : "rgba(255,85,119,0.9)"};"></div>
        </div>
      </div>

      <div class="hqRow" style="margin-top:12px;">
        <button class="btn small" id="pm-breathe" type="button">🫁 4 Breaths</button>
        <button class="btn small" id="pm-switch" type="button">🔁 No + Switch</button>
        <button class="btn small" id="pm-exit" type="button">🚪 Exit Plan</button>
        <button class="btn small" id="pm-text" type="button">📱 Text Adult</button>
      </div>

      <p class="muted" id="pm-msg" style="margin-top:10px;">${escapeHtml(msg)}</p>
    `;

    area.querySelector("#pm-breathe")?.addEventListener("click", () => { pressure = clamp(pressure - 12, 0, 100); draw("Breathing lowers the body alarm."); });
    area.querySelector("#pm-switch")?.addEventListener("click", () => { pressure = clamp(pressure - 8, 0, 100);  draw("Switching activities breaks pressure."); });
    area.querySelector("#pm-exit")?.addEventListener("click", () => { pressure = clamp(pressure - 10, 0, 100); draw("Exit plan = safety."); });
    area.querySelector("#pm-text")?.addEventListener("click", () => { pressure = clamp(pressure - 15, 0, 100); draw("Support makes choices easier."); });
  };

  const end = (win) => {
    alive = false;
    if(loopId) clearInterval(loopId);
    const restartBtn = overlay.querySelector("#go-restart");
    if(restartBtn) restartBtn.style.display = "inline-block";

    if(win){
      gameScore += 40;
      addXP(20);
      area.innerHTML += `<p class="big">✅ Nice!</p><p>You kept pressure manageable.</p>`;
    }else{
      area.innerHTML += `<p class="big">⚠️ Oops</p><p class="muted">Pressure got too high. Try using tools earlier.</p>`;
    }
    overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
  };

  draw();

  loopId = setInterval(() => {
    if(!alive) return;
    t += 1;

    // pressure slowly rises; rises faster later
    pressure = clamp(pressure + (t < 10 ? 4 : t < 20 ? 5 : 6), 0, 100);

    // win / lose
    if(pressure >= 80) return end(false);
    if(t >= 30) return end(true);

    draw();
  }, 1000);
}


/* =========================================================
   GAME: CHOICE QUEST
========================================================= */
function startChoiceQuest(){
  gameMode = "choicequest";
  gameIndex = 0;
  gameScore = 0;
  openGameOverlay("Choice Quest", "Pick the healthiest option.");
  renderChoiceQuest();
}

function renderChoiceQuest(){
  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  area.innerHTML = "";
  const scenario = GAME_SCENARIOS[gameIndex];

  if(!scenario){
    area.innerHTML = `
      <p class="big">🎉 Nice!</p>
      <p>You finished Choice Quest.</p>
      <p class="muted">Final score: <strong>${gameScore}</strong></p>
    `;
    const restartBtn = overlay.querySelector("#go-restart");
    if(restartBtn) restartBtn.style.display = "inline-block";

    if(gameScore > state.highScore){
      state.highScore = gameScore;
      saveState();
    }
    addXP(25);
    renderProgress();
    return;
  }

  const p = document.createElement("p");
  p.style.fontWeight = "900";
  p.textContent = scenario.prompt;
  area.appendChild(p);

  scenario.choices.forEach((c) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = c.text;

    btn.addEventListener("click", () => {
      $$(".choiceBtn").forEach(x => x.disabled = true);

      if(c.good){
        btn.classList.add("choiceGood");
        gameScore += 10;
      }else{
        btn.classList.add("choiceBad");
        gameScore = Math.max(0, gameScore - 3);
      }

      overlay.querySelector("#go-score") && (overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`);

      const why = document.createElement("p");
      why.className = "muted";
      why.style.marginTop = "10px";
      why.textContent = c.why;
      area.appendChild(why);

      const next = document.createElement("button");
      next.type = "button";
      next.className = "btn primary";
      next.style.marginTop = "12px";
      next.textContent = "Next";
      next.addEventListener("click", () => {
        gameIndex += 1;
        renderChoiceQuest();
      });
      area.appendChild(next);
    });

    area.appendChild(btn);
  });
}

/* =========================================================
   GAME: BREATHING BUDDY
========================================================= */
function startBreathing(){
  gameMode = "breathing";
  gameScore = 0;
  openGameOverlay("Breathing Buddy", "Calm your body for 60 seconds.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  area.innerHTML = "";

  const info = document.createElement("p");
  info.innerHTML = `Try this for <strong>60 seconds</strong>: breathe in… and out… slowly.`;
  area.appendChild(info);

  const ring = document.createElement("div");
  ring.style.width = "180px";
  ring.style.height = "180px";
  ring.style.margin = "14px auto";
  ring.style.borderRadius = "999px";
  ring.style.border = "2px solid rgba(255,255,255,0.18)";
  ring.style.display = "grid";
  ring.style.placeItems = "center";
  ring.style.background = "rgba(255,255,255,0.05)";
  ring.style.fontWeight = "900";
  ring.style.fontSize = "22px";
  area.appendChild(ring);

  const timerText = document.createElement("p");
  timerText.className = "muted";
  timerText.style.textAlign = "center";
  area.appendChild(timerText);

  let t = 60;
  let phase = "In";
  let phaseT = 0;
  let finished = false;

  if(breathingTimerId) clearInterval(breathingTimerId);
  breathingTimerId = setInterval(() => {
    timerText.textContent = `Time left: ${t}s`;
    ring.textContent = phase;

    const scale = phase === "In" ? 1 + (phaseT/4)*0.12 : 1.12 - (phaseT/4)*0.12;
    ring.style.transform = `scale(${scale.toFixed(3)})`;
    ring.style.transition = "transform 1s linear";

    phaseT += 1;
    if(phaseT >= 4){
      phaseT = 0;
      phase = (phase === "In") ? "Out" : "In";
    }

    t -= 1;
    if(t < 0){
      clearInterval(breathingTimerId);
      breathingTimerId = null;

      ring.textContent = "Nice!";
      timerText.textContent = "Done. You just practiced calming your body.";

      if(!finished){
        finished = true;
        addXP(10);
      }

      const restartBtn = overlay.querySelector("#go-restart");
      if(restartBtn) restartBtn.style.display = "inline-block";
    }
  }, 1000);
}

function startResponseBuilder(){
  gameMode = "responsebuilder";
  gameScore = 0;
  openGameOverlay("Response Builder", "Build a strong response to pressure.");
  renderResponseBuilder();
}

function renderResponseBuilder(){
  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const sets = [
    {
      prompt: "Friend: “Try it. Everyone’s doing it.”",
      parts: [
        ["No thanks.", "Uhh… maybe.", "Fine."],
        ["I’m not into that.", "Don’t tell anyone.", "I have to prove myself."],
        ["Let’s do something else.", "Let’s hide it.", "Let’s push it further."]
      ],
      best: [0,0,0]
    },
    {
      prompt: "Someone laughs when you say no.",
      parts: [
        ["No.", "Okay then.", "Whatever."],
        ["I’m heading out.", "I’ll do it later.", "Stop talking forever."],
        ["See you later.", "Don’t tell adults.", "I’ll risk it anyway."]
      ],
      best: [0,0,0]
    }
  ];

  const rng = mulberry32(7777 + state.xp);
  const round = sets[Math.floor(rng() * sets.length)];

  let picks = [null,null,null];

  const render = () => {
    const built = picks.map((p,i) => (p==null ? "____" : round.parts[i][p])).join(" ");
    area.innerHTML = `
      <p style="font-weight:900;">${escapeHtml(round.prompt)}</p>
      <div class="card" style="background: rgba(255,255,255,0.06); margin-top:10px;">
        <p class="muted" style="margin:0 0 8px;">Your response:</p>
        <p style="font-weight:900; font-size:18px; margin:0;">${escapeHtml(built)}</p>
      </div>

      <div style="margin-top:12px;">
        ${round.parts.map((opts, i) => `
          <div class="card" style="margin:10px 0; background: rgba(255,255,255,0.05);">
            <p class="muted" style="margin:0 0 8px;">Pick part ${i+1}</p>
            ${opts.map((t, oi) => `
              <button class="choiceBtn" data-part="${i}" data-opt="${oi}" type="button">${escapeHtml(t)}</button>
            `).join("")}
          </div>
        `).join("")}
      </div>

      <div class="actions">
        <button class="btn primary" id="rb-submit" type="button" ${picks.some(p=>p==null) ? "disabled" : ""}>Submit</button>
      </div>
      <p class="muted" id="rb-msg" style="margin-top:10px;"></p>
    `;

    area.querySelectorAll("button[data-part]").forEach(btn => {
      btn.addEventListener("click", () => {
        const part = Number(btn.getAttribute("data-part"));
        const opt  = Number(btn.getAttribute("data-opt"));
        picks[part] = opt;
        render();
      });
    });

    area.querySelector("#rb-submit")?.addEventListener("click", () => {
      const ok = picks.every((p,i) => p === round.best[i]);
      const msg = area.querySelector("#rb-msg");
      if(ok){
        gameScore += 25;
        addXP(15);
        if(msg) msg.textContent = "✅ Strong response. Clear ‘no’ + switch. Nice.";
      }else{
        gameScore = Math.max(0, gameScore - 5);
        if(msg) msg.textContent = "Almost. Try making it more clear and safer.";
      }
      overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
      const restartBtn = overlay.querySelector("#go-restart");
      if(restartBtn) restartBtn.style.display = "inline-block";
    });
  };

  render();
}


/* =========================================================
   HABIT QUEST — BRANCHING NODE GRAPH
========================================================= */
function getLastLessonTitle(){
  const day = safeNum(state.habitQuest.lastLessonDay, 0);
  if(day <= 0) return "";
  const l = LESSONS.find(x => x.day === day);
  return l ? l.title : "";
}

function hqCtx(){
  const avatarDataURL = getSelectedAvatarDataURL();
  const usingCustom = !!avatarDataURL;
  const emoji = (!usingCustom && !isCustomAvatarRef(state.avatar)) ? (state.avatar || "🙂") : "🙂";

  return {
    avatarIsCustom: usingCustom,
    avatarImg: avatarDataURL,
    avatarEmoji: emoji,
    name: state.profileName || "Player",
    completed: state.completedDays.length,
    lastLessonTitle: getLastLessonTitle(),
    tokens: safeNum(state.habitQuest.tokens,0),
    flags: state.habitQuest.flags || {},
  };
}

// Helpers for branching state
function hqMarkVisited(nodeId){
  state.habitQuest.visited = (state.habitQuest.visited && typeof state.habitQuest.visited === "object") ? state.habitQuest.visited : {};
  state.habitQuest.visited[nodeId] = true;

  state.habitQuest.history = Array.isArray(state.habitQuest.history) ? state.habitQuest.history : [];
  state.habitQuest.history.push(nodeId);
  state.habitQuest.history = state.habitQuest.history.slice(-80);
}

function hqSetFlag(key, value){
  state.habitQuest.flags = (state.habitQuest.flags && typeof state.habitQuest.flags === "object") ? state.habitQuest.flags : {};
  state.habitQuest.flags[key] = value;
}

function hqHasFlag(key){
  return !!(state.habitQuest.flags && state.habitQuest.flags[key]);
}

function hqCan(choice){
  const req = choice.require || null;
  if(!req) return true;

  const tok = safeNum(req.token, 0);
  if(tok > 0 && safeNum(state.habitQuest.tokens,0) < tok) return false;

  if(req.flag && !hqHasFlag(req.flag)) return false;

  if(req.notFlag && hqHasFlag(req.notFlag)) return false;

  const minW = safeNum(req.minWisdom, 0);
  if(minW > 0 && safeNum(state.habitQuest.wisdom,0) < minW) return false;

  return true;
}


// NODE GRAPH (same as your current demo; phase 3 adds save slots + map, not more nodes)
const HQ_NODES = {
  hq_start: {
    chapter: "Chapter 1: The First Steps",
    text: () => `You arrive at Sunny Town. A friend says, “Want to do something risky to feel cool?”`,
    choices: [
      { text:"Say no calmly and suggest a safe activity.", good:true,  effects:{ wisdom:+1, xp:+15 }, why:"Clear no + switch.", next:"hq_mentor" },
      { text:"Say yes to fit in.",                         good:false, effects:{ hearts:-1 },        why:"Fitting in isn’t worth it.", next:"hq_mentor" },
      { text:"Walk away and find a trusted adult.",        good:true,  effects:{ wisdom:+1, xp:+10, flag:{ key:"askedAdult", value:true } }, why:"Asking for help is strong.", next:"hq_mentor" },
    ]
  },
  hq_mentor: {
    chapter: "Chapter 1: The First Steps",
    text: () => `A mentor appears: “When you feel pressure, try: Pause → No → Switch.” Want to practice?`,
    choices: [
      { text:"Practice the 3‑step ‘No’ out loud.", good:true,  effects:{ wisdom:+1, xp:+12, flag:{ key:"practicedNo", value:true } }, why:"Practice makes real life easier.", next:"hq_kid_stressed" },
      { text:"Ignore them and scroll forever.",    good:false, effects:{ hearts:-1 }, why:"Escapes can become habits.", next:"hq_kid_stressed" },
    ]
  },
  hq_kid_stressed: {
    chapter: "Chapter 1: The First Steps",
    text: (ctx) => {
      const last = ctx.lastLessonTitle ? `You remember your last lesson: “${ctx.lastLessonTitle}.”` : "You remember: small choices add up.";
      return `${last} A kid nearby looks stressed. What do you do?`;
    },
    choices: [
      { text:"Offer a calm tool: 4 slow breaths together.", good:true,  effects:{ wisdom:+1, xp:+10, flag:{ key:"helpedKid", value:true } }, why:"Calm tools help fast.", next:"hq_gate" },
      { text:"Say “deal with it” and leave.",               good:false, effects:{ hearts:-1 },        why:"Kindness matters.", next:"hq_gate" },
      { text:"Help them find a trusted adult.",             good:true,  effects:{ wisdom:+1, xp:+10, flag:{ key:"askedAdult", value:true } }, why:"Support is powerful.", next:"hq_gate" },
    ]
  },
  hq_gate: {
    chapter: "Chapter 1: The First Steps",
    text: () => `Gatekeeper: “To enter the next area, you need a Lesson Token.”`,
    choices: [
      { text:"Use 1 token to open the gate.", require:{ token:1 }, good:true, effects:{ tokens:-1, xp:+20 }, why:"Nice! Lesson power unlocked.", next:"hq_forest_intro" },
      { text:"Exit and earn a token by completing a lesson.",      good:true, end:true,                      why:"Finish a lesson to earn a token." },
    ]
  },
  hq_forest_intro: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `In Focus Forest, someone offers “instant fun” that could turn into a bad habit.`,
    choices: [
      { text:"Pause and ask: “Will this help Future Me?”", good:true,  effects:{ wisdom:+1, xp:+15, flag:{ key:"usedFutureMe", value:true } }, why:"That question protects you.", next:"hq_forest_step" },
      { text:"Do it without thinking.",                    good:false, effects:{ hearts:-1 },               why:"Pausing is your superpower.", next:"hq_forest_step" },
      { text:"Take a side path to get support + a plan.",  good:true,  effects:{ xp:+8 },                   why:"A plan beats pressure.", next:"hq_forest_sidepath" },
    ]
  },
  hq_forest_step: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `You find a sign: “Tiny steps beat giant promises.” Pick your tiny step.`,
    choices: [
      { text:"Drink water + snack (brain fuel).",       good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"brainFuel", value:true } }, why:"Brain fuel helps choices.", next:"hq_forest_boss" },
      { text:"2‑minute tidy reset.",                    good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"tidyReset", value:true } }, why:"Small wins add up.", next:"hq_forest_boss" },
      { text:"Write 1 helpful thought about yourself.", good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"kindThought", value:true } }, why:"Kind self-talk matters.", next:"hq_forest_boss" },
      { text:"Stop at a rest spot (spend tokens to recover).", good:true, effects:{ xp:+5 }, why:"Resting is part of winning.", next:"hq_campfire_rest" },
      {next:"hq_campfire"}
    ]
  },
  hq_forest_boss: {
    chapter: "Chapter 2: The Focus Forest",
    text: (ctx) => {
      const bonus = ctx.flags && ctx.flags.helpedKid ? "You feel proud you helped someone earlier—confidence boost." : "You take a steady breath.";
      return `Boss moment: a crowd pressures you. ${bonus}`;
    },
    choices: [
      { text:"Say: “No thanks. I’m heading out.”", good:true,  effects:{ wisdom:+1, xp:+20 }, why:"Clear + calm + exit.", next:"hq_bridge" },
      { text:"Say yes so nobody laughs.",          good:false, effects:{ hearts:-1 },        why:"Real friends don’t demand proof.", next:"hq_bridge" },
      // add this extra choice inside hq_forest_boss choices array
      {
        text:"Step up as a leader and pull a friend away (mini ending).",
        require:{ minWisdom:4 }, // or require:{ flag:"helpedKid" } if you prefer
        good:true,
        effects:{ xp:+18, flag:{ key:"leaderMove", value:true } },
        why:"Leadership is choosing safety for yourself and others.",
        next:"hq_mini_end_friend"
      },

    ]
  },
  hq_bridge: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `A bridge guard says: “Tokens open the bridge.”`,
    choices: [
      { text:"Use 1 token to cross.", require:{ token:1 }, good:true, effects:{ tokens:-1, xp:+20 }, why:"Forward!", next:"hq_mountain_intro" },
      { text:"Try a shortcut path (riskier, no token).",   good:false, effects:{ hearts:-1, xp:+8 },  why:"Shortcuts can cost you.", next:"hq_bridge_shortcut" },
      { text:"Exit and make a plan to come back stronger.", good:true, effects:{ xp:+5 }, why:"Planning is a power move.", next:"hq_mini_end_plan" },
    ]

  },
  hq_mountain_intro: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `Up the mountain, feelings get big fast. A character says: “When emotions spike, your body needs calm first.”`,
    choices: [
      { text:"Try a calm reset: slow breaths + relax shoulders.", good:true, effects:{ wisdom:+1, xp:+15 }, why:"Calm first = better choices.", next:"hq_mountain_boost" },
      { text:"Yell and storm off.",                               good:false,effects:{ hearts:-1 },        why:"Big reactions can backfire.", next:"hq_mountain_boost" },
      { text:"Check on a friend who looks overwhelmed.",          good:true, effects:{ xp:+10 },           why:"Helping others builds courage.", next:"hq_mountain_friend" },
    ]

  },
  hq_mountain_boost: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `Someone offers an “energy boost” product to feel powerful instantly.`,
    choices: [
      { text:"Skip it and choose water/food/rest instead.", good:true, effects:{ wisdom:+1, xp:+15 }, why:"Brain fuel beats quick tricks.", next:"hq_mountain_nameit" },
      { text:"Take it to feel cool.",                        good:false,effects:{ hearts:-1 },        why:"Quick boosts can cause problems.", next:"hq_mountain_nameit" },
      { text:"Text/check in with a trusted adult first.", require:{ flag:"askedAdult" }, good:true, effects:{ wisdom:+1, xp:+18 }, why:"Support makes choices easier.", next:"hq_mountain_nameit" },
    ]
  },
  hq_mountain_nameit: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `You meet a helper who teaches: “Name it to tame it.” What do you do?`,
    choices: [
      { text:"Name the feeling: “I feel stressed.”", good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"namedFeeling", value:true } }, why:"Naming feelings helps control.", next:"hq_tunnel" },
      { text:"Pretend you feel nothing.",            good:false,effects:{ hearts:-1 },        why:"Ignoring feelings can build pressure.", next:"hq_tunnel" },
    ]
  },
  hq_tunnel: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `A tunnel gate needs a token.`,
    choices: [
      { text:"Use 1 token to enter the tunnel.", require:{ token:1 }, good:true, effects:{ tokens:-1, xp:+20 }, why:"Onward!", next:"hq_tunnel_echo" },
      { text:"Ask for help and step away from the risk.",             good:true, effects:{ xp:+10, flag:{ key:"askedAdult", value:true } }, why:"That’s a strong choice.", next:"hq_mini_end_help" },
      { text:"Exit and earn a token by completing a lesson.",         good:true, effects:{ xp:+5 }, why:"Lessons give tokens.", next:"hq_mini_end_plan" },
    ]

  },
  hq_win: {
    chapter: "Chapter 4+: Coming Soon",
    text: () => `You made it through the demo branch! We can extend this graph with more nodes, chapters, and backgrounds.`,
    choices: [
      { text:"Finish Habit Quest (for now).", good:true, effects:{ xp:+40 }, why:"Great job!", end:true },
    ]
  },
  hq_forest_sidepath: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `You take a quieter trail. A sign says: “Support is a shortcut to better choices.”`,
    choices: [
      { text:"Practice a refusal script again (Pause → No → Switch).", good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"practicedNo", value:true } }, why:"Practice makes it automatic.", next:"hq_forest_phonecall" },
      { text:"Write a tiny plan: what you’ll do if pressured today.",  good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"madePlan", value:true } },     why:"Plans protect Future You.", next:"hq_forest_phonecall" },
      { text:"Ignore the sign and rush back.",                          good:false,effects:{ hearts:-1 },                                                why:"Rushing can cause slips.", next:"hq_forest_boss" },
    ]
  },

  hq_forest_phonecall: {
    chapter: "Chapter 2: The Focus Forest",
    text: (ctx) => {
      const name = ctx.name || "Player";
      return `${name}, you find a “Call/Check‑in” booth. It’s normal to ask for support before things get hard.`;
    },
    choices: [
      { text:"Send a quick check-in to a trusted adult.", good:true, effects:{ xp:+12, flag:{ key:"askedAdult", value:true } }, why:"Support makes choices easier.", next:"hq_forest_boss" },
      { text:"Text a friend who respects boundaries.",    good:true, effects:{ xp:+10, flag:{ key:"supportFriend", value:true } }, why:"Good friends help you stay steady.", next:"hq_forest_boss" },
      { text:"Say “I’m fine” and keep it inside.",        good:false,effects:{ hearts:-1 }, why:"Keeping it in can build pressure.", next:"hq_forest_boss" },
    ]
  },

  // TOKEN SINK: heart restore (spend tokens)
  hq_campfire_rest: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `You reach a warm rest stop. A helper says: “Tokens can buy a recovery moment.”`,
    choices: [
      { text:"Spend 1 token to restore +1 heart.", require:{ token:1 }, good:true, effects:{ tokens:-1, hearts:+1, xp:+6, flag:{ key:"usedRest", value:true } }, why:"Recovery helps you keep going.", next:"hq_campfire_scene" },
      { text:"Spend 2 tokens to restore +2 hearts.", require:{ token:2 }, good:true, effects:{ tokens:-2, hearts:+2, xp:+10, flag:{ key:"usedBigRest", value:true } }, why:"Big recovery can be worth it.", next:"hq_campfire_scene" },
      { text:"Save tokens and keep going.",           good:true, effects:{ xp:+3 }, why:"Saving is okay too.", next:"hq_forest_boss" },
    ]
  },

  hq_campfire_scene: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `You feel steadier. A sign reads: “Strong choices are easier when your body is cared for.”`,
    choices: [
      { text:"Return to the main trail.", good:true, effects:{ xp:+5 }, why:"Back to the story.", next:"hq_forest_boss" },
      { text:"Practice one more calm breath cycle.", good:true, effects:{ xp:+6, wisdom:+1 }, why:"Calm is a skill.", next:"hq_forest_boss" },
    ]
  },

  hq_bridge_shortcut: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `You try the shortcut. It’s shaky, loud, and full of distractions.`,
    choices: [
      { text:"Stop, reset, and go back to the safe bridge.", good:true, effects:{ xp:+10 }, why:"Knowing when to stop is strength.", next:"hq_bridge" },
      { text:"Push through anyway (not recommended).",        good:false,effects:{ hearts:-1 }, why:"Pushing through risk can cost you.", next:"hq_mountain_cliff" },
    ]
  },

  hq_mountain_cliff: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `You reach a cliff overlook. A guide says: “Big emotions shrink when you slow down.”`,
    choices: [
      { text:"Use “Name it to tame it.” (say the feeling).", good:true, effects:{ wisdom:+1, xp:+12, flag:{ key:"namedFeeling", value:true } }, why:"Naming feelings gives you control.", next:"hq_mountain_boost" },
      { text:"Blame yourself harshly.",                       good:false,effects:{ hearts:-1 }, why:"Harsh self-talk makes it harder.", next:"hq_mountain_boost" },
      { text:"If you already asked an adult, check in now.",  require:{ flag:"askedAdult" }, good:true, effects:{ xp:+15 }, why:"Support + timing = success.", next:"hq_mountain_boost" },
    ]
  },

  hq_mountain_friend: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `Your friend says: “I don’t know how to say no.” You can model it.`,
    choices: [
      { text:"Teach them a quick refusal script.", good:true, effects:{ xp:+14, wisdom:+1, flag:{ key:"helpedFriend", value:true } }, why:"Helping others strengthens you too.", next:"hq_mountain_boost" },
      { text:"Tell them “figure it out.”",         good:false,effects:{ hearts:-1 }, why:"Kindness matters.", next:"hq_mountain_boost" },
    ]
  },

  hq_tunnel_echo: {
    chapter: "Chapter 3: The Mood Mountain",
    text: (ctx) => {
      const extra = ctx.flags?.practicedNo ? "Because you practiced, you feel more confident." : "You wish you had practiced a little more.";
      return `Inside the tunnel, you hear echoes of pressure. ${extra}`;
    },
    choices: [
      { text:"Use your practiced ‘No + Switch’ and keep moving.", require:{ flag:"practicedNo" }, good:true, effects:{ xp:+18, wisdom:+1 }, why:"Practice pays off later.", next:"hq_win" },
      { text:"Pause, breathe, and choose the safest next step.",  good:true, effects:{ xp:+12 }, why:"Pause beats panic.", next:"hq_win" },
      { text:"Exit and come back after a lesson.",                good:true, effects:{ xp:+6 },  why:"Building skill first is smart.", next:"hq_mini_end_plan" },
    ]
  },

  // MINI-ENDING #1
  hq_mini_end_help: {
    chapter: "Mini‑Ending: Support Win",
    text: () => `You choose support over risk. That’s a real win. You can come back anytime with more tokens and stronger skills.`,
    choices: [
      { text:"Finish (for now).", good:true, effects:{ xp:+25 }, why:"Support is strength.", end:true },
    ]
  },

  // MINI-ENDING #2
  hq_mini_end_plan: {
    chapter: "Mini‑Ending: Plan + Return",
    text: () => `You step away, make a plan, and decide to return after completing a lesson. That’s how you build long-term confidence.`,
    choices: [
      { text:"Finish (for now).", good:true, effects:{ xp:+20 }, why:"A plan beats pressure.", end:true },
    ]
  },

    hq_campfire: {
    chapter: "Chapter 2: The Focus Forest",
    text: (ctx) => {
      const p = ctx.flags?.practicedNo ? "Because you practiced your ‘No,’ you feel steadier." : "You feel tired, but you can still choose wisely.";
      return `You find a quiet campfire. ${p} A traveler offers a “shortcut” that could become a bad habit.`;
    },
    choices: [
      // Flag-gated stronger option
      { text:"Use your practiced script: Pause → No → Switch (strong).",
        require:{ flag:"practicedNo" },
        good:true,
        effects:{ wisdom:+2, xp:+22, flag:{ key:"usedScriptStrong", value:true } },
        why:"Practice turns into real skill.",
        next:"hq_bonus_vendor"
      },
      { text:"Say no and step away (basic).",
        good:true,
        effects:{ wisdom:+1, xp:+12 },
        why:"Still a solid boundary.",
        next:"hq_bonus_vendor"
      },
      { text:"Take the shortcut to impress them.",
        good:false,
        effects:{ hearts:-1 },
        why:"Shortcuts can become traps.",
        next:"hq_bonus_vendor"
      },
    ]
  },

  hq_bonus_vendor: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `A friendly vendor whispers: “Want a bonus scene? It costs 2 tokens, but it gives you a real boost.”`,
    choices: [
      { text:"Spend 2 tokens: Unlock Bonus Scene ✨",
        require:{ token:2, notFlag:"bonusSceneDone" },
        good:true,
        effects:{ tokens:-2, xp:+25, wisdom:+1, flag:{ key:"bonusSceneDone", value:true } },
        why:"Worth it: extra XP + wisdom, one-time unlock.",
        next:"hq_bonus_scene"
      },
      { text:"Save my tokens for later.",
        good:true,
        effects:{ xp:+5 },
        why:"Saving is a strategy.",
        next:"hq_forest_boss"
      },
    ]
  },

  hq_bonus_scene: {
    chapter: "Bonus Scene",
    text: () => `Bonus scene: You learn a “tiny reset” you can use anywhere: water + 4 breaths + one kind thought. You feel stronger.`,
    choices: [
      { text:"Lock it in and move on.",
        good:true,
        effects:{ xp:+10, wisdom:+1, flag:{ key:"learnedTinyReset", value:true } },
        why:"Small tools win big moments.",
        next:"hq_forest_boss"
      },
    ]
  },

  hq_mini_end_friend: {
    chapter: "Mini Ending",
    text: (ctx) => {
      const extra = ctx.flags?.helpedKid ? "The kid you helped earlier smiles and says thanks." : "You notice someone else struggling, and you feel more aware now.";
      return `Mini ending: You choose to be a leader today. ${extra} You leave the forest proud of your choices.`;
    },
    choices: [
      { text:"Finish this run (mini ending).",
        good:true,
        effects:{ xp:+30 },
        why:"Strong ending — you practiced leadership.",
        end:true
      },
    ]
  },


};

function hqGetNode(nodeId){
  return HQ_NODES[nodeId] || HQ_NODES.hq_start;
}

function hqApplyEffects(eff){
  const e = eff || {};
  if(e.hearts) state.habitQuest.hearts = clamp(safeNum(state.habitQuest.hearts,3) + safeNum(e.hearts,0), 0, 5);
  if(e.wisdom) state.habitQuest.wisdom = Math.max(0, safeNum(state.habitQuest.wisdom,0) + safeNum(e.wisdom,0));
  if(e.tokens) state.habitQuest.tokens = Math.max(0, safeNum(state.habitQuest.tokens,0) + safeNum(e.tokens,0));
  if(e.flag && typeof e.flag === "object"){
    const key = safeStr(e.flag.key, "");
    if(key) hqSetFlag(key, e.flag.value);
  }
}

function hqResetRun(){
  state.habitQuest.nodeId = "hq_start";
  state.habitQuest.hearts = 3;
  state.habitQuest.wisdom = 0;
  state.habitQuest.flags = {};
  state.habitQuest.visited = {};
  state.habitQuest.history = [];
  saveState();
}

/* =========================================================
   HABIT QUEST SAVE SLOTS (PHASE 3)
========================================================= */
function hqSnapshot(){
  return {
    nodeId: safeStr(state.habitQuest.nodeId, "hq_start"),
    hearts: clamp(safeNum(state.habitQuest.hearts, 3), 0, 5),
    wisdom: Math.max(0, safeNum(state.habitQuest.wisdom, 0)),
    tokens: Math.max(0, safeNum(state.habitQuest.tokens, 0)),
    lastLessonDay: Math.max(0, safeNum(state.habitQuest.lastLessonDay, 0)),
    flags: (state.habitQuest.flags && typeof state.habitQuest.flags === "object") ? structuredClone(state.habitQuest.flags) : {},
    visited: (state.habitQuest.visited && typeof state.habitQuest.visited === "object") ? structuredClone(state.habitQuest.visited) : {},
    history: Array.isArray(state.habitQuest.history) ? [...state.habitQuest.history] : [],
  };
}

function hqRestore(snapshot){
  if(!snapshot || typeof snapshot !== "object") return false;

  state.habitQuest.nodeId = safeStr(snapshot.nodeId, "hq_start");
  state.habitQuest.hearts = clamp(safeNum(snapshot.hearts, 3), 0, 5);
  state.habitQuest.wisdom = Math.max(0, safeNum(snapshot.wisdom, 0));
  state.habitQuest.tokens = Math.max(0, safeNum(snapshot.tokens, 0));
  state.habitQuest.lastLessonDay = Math.max(0, safeNum(snapshot.lastLessonDay, 0));
  state.habitQuest.flags = (snapshot.flags && typeof snapshot.flags === "object") ? snapshot.flags : {};
  state.habitQuest.visited = (snapshot.visited && typeof snapshot.visited === "object") ? snapshot.visited : {};
  state.habitQuest.history = Array.isArray(snapshot.history) ? snapshot.history.slice(-80) : [];
  saveState();
  return true;
}

function hqSaveToSlot(slotIndex){
  const i = clamp(safeNum(slotIndex, 0), 0, 2);
  const label = prompt(`Name this save slot (Slot ${i+1})?`, state.habitQuestSlots[i]?.label || "") ?? "";
  state.habitQuestSlots[i] = {
    savedISO: isoDate(new Date()),
    label: safeStr(label, "").slice(0, 24),
    data: hqSnapshot(),
  };
  saveState();
}

function hqLoadFromSlot(slotIndex){
  const i = clamp(safeNum(slotIndex, 0), 0, 2);
  const slot = state.habitQuestSlots[i];
  if(!slot || !slot.data) return alert("That slot is empty.");
  if(!confirm(`Load Slot ${i+1}? Your current run will be replaced.`)) return;
  hqRestore(slot.data);
}

function hqClearSlot(slotIndex){
  const i = clamp(safeNum(slotIndex, 0), 0, 2);
  if(!confirm(`Clear Slot ${i+1}?`)) return;
  state.habitQuestSlots[i] = blankSaveSlot();
  saveState();
}

/* =========================================================
   HABIT QUEST GAME
========================================================= */
function startHabitQuest(){
  gameMode = "habitquest";
  gameScore = 0;
  openGameOverlay("Habit Quest", "Branching story: your choices change the path.");
  renderHabitQuest();
}

function renderHabitQuest(){
  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const hearts = clamp(safeNum(state.habitQuest.hearts,3), 0, 5);
  const wisdom = safeNum(state.habitQuest.wisdom,0);
  const tokens = safeNum(state.habitQuest.tokens,0);
  const ctx = hqCtx();

  if(hearts <= 0){
    area.innerHTML = `
      <p class="big">😵 Oops!</p>
      <p>You ran out of hearts.</p>
      <p class="muted">Good news: you can restart and practice better choices.</p>
    `;
    const restartBtn = overlay.querySelector("#go-restart");
    if(restartBtn) restartBtn.style.display = "inline-block";
    hqResetRun();
    return;
  }

  const nodeId = safeStr(state.habitQuest.nodeId, "hq_start");
  const node = hqGetNode(nodeId);

  // mark visited
  hqMarkVisited(nodeId);
  saveState();

  // Header + Save Slots controls (PHASE 3)
  const slotSummary = (slot, idx) => {
    if(!slot || !slot.data) return `Slot ${idx+1}: (empty)`;
    const label = slot.label ? `“${escapeHtml(slot.label)}”` : "(no name)";
    const when = slot.savedISO ? escapeHtml(slot.savedISO) : "—";
    const nid = escapeHtml(slot.data.nodeId || "hq_start");
    return `Slot ${idx+1}: ${label} • ${when} • @ ${nid}`;
  };

  area.innerHTML = `
    <div class="hqRow">
      <div class="hqChip">📖 ${escapeHtml(node.chapter || "Habit Quest")}</div>
      <div class="hqChip">🧭 Node: <strong>${escapeHtml(nodeId)}</strong></div>
      <div class="hqChip">❤️ Hearts: <strong>${hearts}</strong></div>
      <div class="hqChip">🧠 Wisdom: <strong>${wisdom}</strong></div>
      <div class="hqChip">🪙 Tokens: <strong>${tokens}</strong></div>
      <div class="hqChip">
        ${
          ctx.avatarIsCustom && ctx.avatarImg
            ? `<img class="hqAvatarImg" src="${ctx.avatarImg}" alt="You" />`
            : `<span style="font-size:18px; line-height:1;">${escapeHtml(ctx.avatarEmoji || "🙂")}</span>`
        }
        <span>You</span>
      </div>
    </div>

    <div class="hqSlotRow">
      <div class="hqSlotCard">
        <div class="muted" style="font-weight:900;">Save Slots</div>
        <div class="muted" style="margin-top:6px;">${slotSummary(state.habitQuestSlots[0],0)}</div>
        <div class="actions" style="margin-top:8px;">
          <button class="btn small" type="button" data-save="0">Save</button>
          <button class="btn small" type="button" data-load="0">Load</button>
          <button class="btn small danger" type="button" data-clear="0">Clear</button>
        </div>
      </div>
      <div class="hqSlotCard">
        <div class="muted" style="font-weight:900;">&nbsp;</div>
        <div class="muted" style="margin-top:6px;">${slotSummary(state.habitQuestSlots[1],1)}</div>
        <div class="actions" style="margin-top:8px;">
          <button class="btn small" type="button" data-save="1">Save</button>
          <button class="btn small" type="button" data-load="1">Load</button>
          <button class="btn small danger" type="button" data-clear="1">Clear</button>
        </div>
      </div>
      <div class="hqSlotCard">
        <div class="muted" style="font-weight:900;">&nbsp;</div>
        <div class="muted" style="margin-top:6px;">${slotSummary(state.habitQuestSlots[2],2)}</div>
        <div class="actions" style="margin-top:8px;">
          <button class="btn small" type="button" data-save="2">Save</button>
          <button class="btn small" type="button" data-load="2">Load</button>
          <button class="btn small danger" type="button" data-clear="2">Clear</button>
        </div>
      </div>
    </div>

    <div class="actions" style="margin-top:10px; justify-content:space-between;">
      <div class="row">
        <button class="btn small danger" id="btn-hq-resetrun">New Run</button>
      </div>
      <div class="row">
        <button class="btn small" id="btn-hq-openmap">Story Map</button>
      </div>
    </div>


    <div class="divider"></div>

    <p id="hq-node-text" style="font-weight:900; font-size:18px; margin-top:10px;"></p>
    <div id="hq-choices"></div>
    <p class="muted" id="hq-why" style="margin-top:12px;"></p>
  `;

  // bind slot buttons
  area.querySelectorAll("[data-save]")?.forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-save"));
      hqSaveToSlot(i);
      renderHabitQuest();
    });
  });
  area.querySelectorAll("[data-load]")?.forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-load"));
      hqLoadFromSlot(i);
      renderHabitQuest();
    });
  });
  area.querySelectorAll("[data-clear]")?.forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.getAttribute("data-clear"));
      hqClearSlot(i);
      renderHabitQuest();
    });
  });

  area.querySelector("#btn-hq-resetrun")?.addEventListener("click", () => {
    if(!confirm("Start a fresh run? (Your tokens stay, but run stats reset.)")) return;
    hqResetRun();
    renderHabitQuest();
  });

  area.querySelector("#btn-hq-openmap")?.addEventListener("click", () => {
    closeGameOverlay();
    showView("map");
  });

  const textEl = area.querySelector("#hq-node-text");
  if(textEl) textEl.textContent = String(node.text(ctx));

  const wrap = area.querySelector("#hq-choices");
  const whyEl = area.querySelector("#hq-why");
  if(!wrap) return;

  const choices = Array.isArray(node.choices) ? node.choices : [];
  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = choice.text;

    if(!hqCan(choice)){
      btn.disabled = true;
      const needTok = choice.require?.token ? safeNum(choice.require.token,0) : 0;
      if(needTok > 0) btn.textContent = `${choice.text} (needs ${needTok} token${needTok===1?"":"s"})`;
      if(choice.require?.flag) btn.textContent = `${choice.text} (locked)`;
    }

    btn.addEventListener("click", () => {
      wrap.querySelectorAll(".choiceBtn").forEach(x => x.disabled = true);
      if(whyEl) whyEl.textContent = choice.why ? choice.why : "";

      hqApplyEffects(choice.effects || {});
      saveState();

      if(choice.effects?.xp && safeNum(choice.effects.xp,0) > 0) addXP(choice.effects.xp);

      if(choice.good) gameScore += 10; else gameScore = Math.max(0, gameScore - 3);
      overlay.querySelector("#go-score") && (overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`);

      const nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "btn primary";
      nextBtn.style.marginTop = "12px";
      nextBtn.textContent = choice.end ? "Exit" : "Continue";

      nextBtn.addEventListener("click", () => {
        if(choice.end){
          closeGameOverlay();
          return;
        }
        const nextId = safeStr(choice.next, "");
        if(nextId){
          state.habitQuest.nodeId = nextId;
          saveState();
        }
        renderHabitQuest();
      });

      area.appendChild(nextBtn);
    });

    wrap.appendChild(btn);
  });

  const restartBtn = overlay.querySelector("#go-restart");
  if(restartBtn) restartBtn.style.display = "inline-block";
}

/* =========================================================
   STORY MAP VIEW (PHASE 3)
========================================================= */
function nodeOutgoing(node){
  const outs = new Set();
  const choices = Array.isArray(node?.choices) ? node.choices : [];
  for(const c of choices){
    if(c && typeof c === "object" && typeof c.next === "string" && c.next.trim()){
      outs.add(c.next.trim());
    }
  }
  return Array.from(outs);
}

function renderStoryMap(){
  const wrap = $("#map-wrap");
  if(!wrap) return;

  const visited = (state.habitQuest.visited && typeof state.habitQuest.visited === "object") ? state.habitQuest.visited : {};
  const nodes = Object.entries(HQ_NODES).map(([id, node]) => ({
    id,
    chapter: safeStr(node.chapter, ""),
    visited: !!visited[id],
    outs: nodeOutgoing(node),
  }));

  // sort: chapter then id
  nodes.sort((a,b) => (a.chapter.localeCompare(b.chapter) || a.id.localeCompare(b.id)));

  const visCount = nodes.filter(n => n.visited).length;

  wrap.innerHTML = `
    <div class="card">
      <h2 style="margin-top:0;">Story Map 🗺️</h2>
      <p class="muted">
        Visited: <strong>${visCount}</strong> / <strong>${nodes.length}</strong>
        • Current node: <strong>${escapeHtml(safeStr(state.habitQuest.nodeId,"hq_start"))}</strong>
      </p>

      <div class="actions">
        <button class="btn small" id="btn-map-open-hq" type="button">Open Habit Quest</button>
        <button class="btn small" id="btn-map-jump" type="button">Jump to nodeId</button>
        <button class="btn small" id="btn-map-clear-visited" type="button">Clear visited marks</button>
      </div>

      <div class="divider"></div>

      <table class="mapTable">
        <thead>
          <tr>
            <th style="width:160px;">nodeId</th>
            <th style="width:220px;">chapter</th>
            <th style="width:120px;">visited</th>
            <th>outgoing next links</th>
          </tr>
        </thead>
        <tbody>
          ${
            nodes.map(n => `
              <tr>
                <td><code style="color:rgba(255,255,255,0.9)">${escapeHtml(n.id)}</code></td>
                <td>${escapeHtml(n.chapter || "—")}</td>
                <td>
                  ${n.visited ? `<span class="mapPill ok">✅ visited</span>` : `<span class="mapPill no">⬜ not yet</span>`}
                </td>
                <td>
                  ${
                    n.outs.length
                      ? n.outs.map(o => `<span class="mapPill">${escapeHtml(o)}</span>`).join(" ")
                      : `<span class="muted">—</span>`
                  }
                </td>
              </tr>
            `).join("")
          }
        </tbody>
      </table>
    </div>
  `;

  wrap.querySelector("#btn-map-open-hq")?.addEventListener("click", () => startHabitQuest());

  wrap.querySelector("#btn-map-jump")?.addEventListener("click", () => {
    const id = prompt("Jump to which nodeId? (example: hq_start)")?.trim();
    if(!id) return;
    if(!HQ_NODES[id]) return alert("That nodeId does not exist in HQ_NODES.");
    state.habitQuest.nodeId = id;
    saveState();
    startHabitQuest();
  });

  wrap.querySelector("#btn-map-clear-visited")?.addEventListener("click", () => {
    if(!confirm("Clear visited marks + history? (Does not delete save slots.)")) return;
    state.habitQuest.visited = {};
    state.habitQuest.history = [];
    saveState();
    renderStoryMap();
  });
}

/* =========================================================
   PROFILE (AVATARS + UPLOAD + DELETE)
========================================================= */
function ensureAvatarUploadInput(){
  if($("#avatar-upload")) return;
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.id = "avatar-upload";
  input.style.display = "none";
  document.body.appendChild(input);
}

function renderAvatars(){
  const grid = $("#avatar-grid");
  if(!grid) return;
  grid.innerHTML = "";

  const makeChip = (opts) => {
    const chip = document.createElement("button");
    chip.className = "chip avatarChip";
    chip.type = "button";

    if(opts.kind === "img"){
      const img = document.createElement("img");
      img.src = opts.src;
      img.alt = "Custom avatar";
      img.className = "avatarImg";
      chip.appendChild(img);
    }else{
      chip.textContent = opts.label;
    }

    if(opts.active) chip.classList.add("activeAvatar");
    chip.addEventListener("click", opts.onClick);
    return chip;
  };

  // emojis
  AVATARS.forEach(a => {
    grid.appendChild(makeChip({
      kind: "emoji",
      label: a,
      active: state.avatar === a,
      onClick: () => {
        state.avatar = a;
        saveState();
        renderAvatars();
        renderProfile();
      }
    }));
  });

  // custom avatars (many) with delete ×
  const list = Array.isArray(state.customAvatars) ? state.customAvatars : [];
  list.forEach((a) => {
    const ref = CUSTOM_AVATAR_PREFIX + a.id;

    const chip = makeChip({
      kind: "img",
      src: a.dataURL,
      active: state.avatar === ref,
      onClick: () => {
        state.avatar = ref;
        saveState();
        renderAvatars();
        renderProfile();
      }
    });

    const del = document.createElement("button");
    del.type = "button";
    del.className = "avatarDelete";
    del.textContent = "×";
    del.title = "Delete this uploaded avatar";

    del.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if(!confirm("Delete this uploaded avatar from this device?")) return;

      state.customAvatars = (Array.isArray(state.customAvatars) ? state.customAvatars : [])
        .filter(x => x && x.id !== a.id);

      if(state.avatar === ref) state.avatar = AVATARS[0];

      saveState();
      renderAvatars();
      renderProfile();
    });

    chip.appendChild(del);
    grid.appendChild(chip);
  });

  // plus upload
  const plus = document.createElement("button");
  plus.className = "chip avatarChip avatarPlus";
  plus.type = "button";
  plus.textContent = "＋";
  plus.title = "Upload your own photo";
  plus.addEventListener("click", () => {
    ensureAvatarUploadInput();
    $("#avatar-upload")?.click();
  });
  grid.appendChild(plus);
}

function bindAvatarUpload(){
  ensureAvatarUploadInput();
  const input = $("#avatar-upload");
  if(!input) return;
  if(input.__bound) return;
  input.__bound = true;

  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    if(!file) return;

    if(!file.type.startsWith("image/")){
      alert("Please upload an image file.");
      input.value = "";
      return;
    }
    if(file.size > 2_000_000){
      alert("That image is a bit large. Try one under 2MB.");
      input.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataURL = String(reader.result || "");
      if(!dataURL.startsWith("data:image/")) return;

      const item = { id: uid(), dataURL, createdISO: isoDate(new Date()) };
      state.customAvatars = Array.isArray(state.customAvatars) ? state.customAvatars : [];
      state.customAvatars.unshift(item);

      // auto-select the new upload
      state.avatar = CUSTOM_AVATAR_PREFIX + item.id;

      saveState();
      renderAvatars();
      renderProfile();
      input.value = "";
    };
    reader.readAsDataURL(file);
  });
}

function renderProfile(){
    const input = $("#profile-name-input");
  if(!input) return;

  const name = safeStr(state.profileName, "Player").slice(0, 24);

  // keep input synced
  input.value = name;

  // ✅ update the Profile banner title
  const title = $("#profile-title");
  if(title) title.textContent = `${name} 👤`;

  input.value = safeStr(state.profileName, "Player").slice(0, 24);

  const selectedCustom = getSelectedCustomAvatar();
  const usingCustom = !!(selectedCustom && selectedCustom.dataURL);

  const headerEmojiEl = $("#profile-avatar-emoji");
  const headerImgEl   = $("#profile-avatar-img");

  if(headerImgEl && headerEmojiEl){
    if(usingCustom){
      headerImgEl.src = selectedCustom.dataURL;
      headerImgEl.classList.remove("hidden");
      headerEmojiEl.textContent = "";
    }else{
      headerImgEl.removeAttribute("src");
      headerImgEl.classList.add("hidden");
      headerEmojiEl.textContent = (!isCustomAvatarRef(state.avatar) ? (state.avatar || "🙂") : "🙂");
    }
  }

  $("#profile-xp")      && ($("#profile-xp").textContent = String(state.xp));
  $("#profile-level")   && ($("#profile-level").textContent = String(state.level));
  $("#profile-lessons") && ($("#profile-lessons").textContent = String(state.completedDays.length));
  $("#profile-highscore") && ($("#profile-highscore").textContent = String(state.highScore));
  $("#profile-streak") && ($("#profile-streak").textContent = String(state.streak) + (state.streak === 1 ? " day" : " days"));
  const displayName = state.name?.trim() || "Profile";
  $("#profile-display-name") &&
    ($("#profile-display-name").textContent = displayName);

  renderAvatars();

  // auto-unlock badges
  const unlockedIds = BADGES.filter(b => state.xp >= b.xpRequired).map(b => b.id);
  state.ownedBadges = Array.from(new Set([...(state.ownedBadges||[]), ...unlockedIds]));
  saveState();

  const wrap = $("#owned-badges");
  const empty = $("#owned-badges-empty");
  if(wrap && empty){
    wrap.innerHTML = "";
    if(state.ownedBadges.length === 0){
      empty.textContent = "No badges yet — earn XP to unlock some!";
    }else{
      empty.textContent = "";
      state.ownedBadges.forEach(id => {
        const b = BADGES.find(x => x.id === id);
        if(!b) return;
        const chip = document.createElement("div");
        chip.className = "chip";
        chip.textContent = `${b.icon} ${b.name}`;
        wrap.appendChild(chip);
      });
    }
  }

  bindProfileNameEditor();
  renderProgress();
  updateHomeStats();
}

/* =========================================================
   SHOP
========================================================= */
function renderShop(){
  const grid = $("#shop-grid");
  if(!grid) return;

  grid.innerHTML = "";
  BADGES.forEach(b => {
    const unlocked = state.xp >= b.xpRequired;
    const card = document.createElement("div");
    card.className = "card shopCard" + (unlocked ? "" : " locked");
    card.innerHTML = `
      <div class="shopBadge">${escapeHtml(b.icon)}</div>
      <h3>${escapeHtml(b.name)}</h3>
      <p class="muted">${unlocked ? "Unlocked ✅" : `Locked 🔒 (needs ${b.xpRequired} XP)`}</p>
    `;
    grid.appendChild(card);
  });
}

/* =========================================================
   RATE
========================================================= */
function bindRatingStarsOnce(){
  if(window.__starsBound) return;
  window.__starsBound = true;

  const wrap = $("#stars");
  if(!wrap) return;

  wrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".star");
    if(!btn) return;

    const stars = Number(btn.dataset.star);
    if(!Number.isFinite(stars)) return;

    state.ratings.total = safeNum(state.ratings.total,0) + stars;
    state.ratings.count = safeNum(state.ratings.count,0) + 1;
    saveState();

    $("#rating-thanks") && ($("#rating-thanks").textContent = "Thanks for rating! ⭐");
    renderRate();
  });
}

function renderRate(){
  if(!$("#rating-average")) return;

  const total = safeNum(state.ratings?.total, 0);
  const count = safeNum(state.ratings?.count, 0);
  const avg = (count > 0) ? (total / count) : null;

  $("#rating-average").textContent = avg ? avg.toFixed(1) + " / 5" : "—";
  $("#rating-count").textContent = count === 0 ? "No ratings yet" : `${count} rating${count===1?"":"s"}`;
}

/* =========================================================
   PROGRESS
========================================================= */
function renderProgress(){
  $("#completed-count") && ($("#completed-count").textContent = String(state.completedDays.length));
  $("#highscore")       && ($("#highscore").textContent = String(state.highScore));
  $("#streak-text-2")   && ($("#streak-text-2").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`);

  const list = $("#completed-list");
  if(!list) return;

  list.innerHTML = "";
  const daysSorted = [...state.completedDays].sort((a,b)=>a-b);

  if(daysSorted.length === 0){
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No lessons completed yet — start with Today’s Lesson!";
    list.appendChild(p);
    return;
  }

  daysSorted.forEach(d => {
    const chip = document.createElement("div");
    chip.className = "chip";
    chip.textContent = `Day ${d} ✅`;
    list.appendChild(chip);
  });
}

function bindReset(){
  $("#btn-reset")?.addEventListener("click", () => {
    if(!confirm("Reset progress on this device?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = normalizeState(loadState());
    saveState();
    recalcLevel();
    closeGameOverlay();
    updateHomeStats();
    renderProgress();
    renderLesson();
    renderProfile();
    renderShop();
    renderRate();
    renderGamesCatalog();
    renderTrackUI();
    renderHomeRecommendation();
    showView("home");
  });
}

/* =========================================================
   INIT
========================================================= */
function init(){
  document.body.style.overflow = "";
  $("#year") && ($("#year").textContent = new Date().getFullYear());

  state = normalizeState(loadState());
  recalcLevel();
  saveState();
  state = normalizeState(loadState());
  recalcLevel();
  applyDailyLoginBonus();
  saveState();

  ensureGameOverlay();
  bindNav();
  bindTracks();
  bindLessonButtons();
  bindReset();
  bindRatingStarsOnce();
  bindAvatarUpload();
  bindProfileNameEditor();

  $("#btn-new-tip")?.addEventListener("click", randomTip);

  randomTip();
  updateHomeStats();

  renderLesson();
  renderProfile();
  renderShop();
  renderRate();
  renderGamesCatalog();
  renderTrackUI();
  renderHomeRecommendation();

  showView("home");

  $("#btn-hq-play")?.addEventListener("click", () => startHabitQuest());
  $("#btn-hq-new")?.addEventListener("click", () => {
    if(confirm("Start a new Habit Quest run?")) {
      hqResetRun();
      startHabitQuest();
    }
  });

}

init();


