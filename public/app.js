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

function uid(){
  return Math.random().toString(16).slice(2) + "-" + Date.now().toString(16);
}

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

function makeLessonContent(title, goal){
  return [
    `Today’s topic: ${title}.`,
    `Goal: ${goal}`,
    "Key idea: your brain gets stronger when you practice safe choices and healthy coping tools.",
    "Try it: pick one small action you can do today that helps your future self.",
    "Remember: if something feels risky or confusing, talk to a trusted adult."
  ];
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

function makeQuizForLesson(day, title, goal, track){
  const diff = difficultyForDay(day);
  const rng = mulberry32(1000 + day * 97);
  const focus = LESSON_FOCUS[day] || { words:["choices","safe","plan","help"], skill:"Healthy choices" };
  const w = focus.words;
  const q = (question, options, answer) => ({ q: question, options, answer });

  const anchors = [
    q(`Today’s lesson (“${title}”) is mostly about…`, [`${focus.skill}`, "Hiding problems", "Taking bigger risks"], 0),
    q(`A helpful question for “${w[0]}” moments is…`, ["Will this help Future Me?", "How do I keep this secret?", "What’s the riskiest option?"], 0),
    q(`A strong “safe choice” is usually…`, ["Safe and helpful long‑term", "Risky but exciting", "Something you must hide"], 0),
  ];

  const poolEasy = [
    q(`When you feel ${w[1] || "pressure"}, the best first step is…`, ["Pause and think", "Say yes fast", "Do it secretly"], 0),
    q(`A trusted adult could be…`, ["Parent/guardian/teacher/coach", "Only strangers online", "Nobody"], 0),
    q(`Good friends will…`, ["Respect your boundaries", "Force you to prove yourself", "Laugh when you’re uncomfortable"], 0),
  ];

  const poolMed = [
    q(`Pick the best “switch” after saying no:`, ["Let’s do something else.", "You’re annoying.", "Fine, I’ll do it."], 0),
    q(`If stress is high, a smart tool is…`, ["Slow breathing + water", "Start a fight", "Do something risky"], 0),
    q(`A “tiny step” is…`, ["Small and doable today", "Huge and impossible", "Only for adults"], 0),
  ];

  const poolHard = [
    q(`Scenario: You feel ${w[2] || "stressed"} and someone offers a risky escape. Best plan:`,
      ["Delay + distract + talk to someone", "Keep it secret", "Say yes to fit in"], 0),
    q(`A good boundary sounds like…`, ["No thanks. I’m heading out.", "I guess… maybe…", "Stop talking forever."], 0),
    q(`If you make a mistake, the best comeback is…`, ["Learn + get support + try again", "Give up forever", "Blame everyone"], 0),
  ];

  const poolBoss = [
    q(`Boss moment: Your friend laughs at your “no.” Best move is…`,
      ["Repeat no calmly and step away", "Prove yourself by saying yes", "Start a fight"], 0),
    q(`Which plan is safest AND realistic?`,
      ["One you can do today + a trusted adult if needed", "A secret plan nobody knows", "A plan that needs expensive stuff"], 0),
    q(`When you feel a big urge, it helps to remember…`,
      ["Urges rise and fall like waves", "Urges never change", "You must obey urges"], 0),
  ];

  let pool = [...poolEasy];
  if(diff >= 2) pool = pool.concat(poolMed);
  if(diff >= 3) pool = pool.concat(poolHard);
  if(diff >= 4) pool = pool.concat(poolBoss);

  if(track === "socialmedia"){
    pool.push(
      q("Online dares are safest when you…", ["Skip them and choose your own plan", "Do them for likes", "Hide them from adults"], 0),
      q("A smart scroll rule is…", ["Set a stop time and follow it", "Scroll until 2AM", "Never stop"], 0),
    );
  }
  if(track === "gaming"){
    pool.push(
      q("A healthy gaming habit is…", ["Stop when you planned to stop", "Play forever", "Skip sleep for one more level"], 0),
      q("Best first step when you feel stuck in a loop:", ["Stand up + water + 2‑minute reset", "Keep clicking", "Get mad at yourself"], 0),
    );
  }
  if(track === "caffeine"){
    pool.push(
      q("Brain fuel usually starts with…", ["Sleep + food + water", "Only energy drinks", "Skipping meals"], 0),
      q("If you’re tired, a smart option is…", ["Drink water and take a short break", "Chug caffeine every time", "Give up"], 0),
    );
  }
  if(track === "nicotine"){
    pool.push(
      q("A cravings plan often begins with…", ["Delay and distract", "Hide and panic", "Say yes fast"], 0),
      q("If someone offers you something risky, you can say…", ["No thanks. I’m good.", "Maybe later secretly.", "Okay to fit in."], 0),
    );
  }
  if(track === "alcohol"){
    pool.push(
      q("At a party, a strong plan is…", ["Have an exit plan + buddy/adult backup", "Do whatever the crowd does", "Hide it"], 0),
      q("Pressure is not friendship. True or false?", ["True", "False"], 0),
    );
  }

  // Shuffle deterministically
  for(let i = pool.length - 1; i > 0; i--){
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const picked = [...anchors];
  for(const item of pool){
    if(picked.length >= 12) break;
    if(!picked.some(x => x.q === item.q)) picked.push(item);
  }
  while(picked.length < 12){
    picked.push(poolEasy[Math.floor(rng() * poolEasy.length)]);
  }
  return picked;
}

const LESSONS = CURRICULUM.map((c, i) => ({
  day: i + 1,
  track: c.track || "general",
  title: c.title,
  goal: c.goal,
  content: makeLessonContent(c.title, c.goal),
  quiz: makeQuizForLesson(i + 1, c.title, c.goal, c.track || "general"),
}));

const GAMES = [
  { id:"choicequest", title:"Choice Quest",    desc:"Quick practice: pick the healthiest choice.",                 status:"ready", unlock:{ type:"free" } },
  { id:"breathing",   title:"Breathing Buddy", desc:"60‑second calm timer that earns XP.",                         status:"ready", unlock:{ type:"free" } },
  { id:"habitquest",  title:"Habit Quest",     desc:"Story adventure: your avatar makes choices + learns skills.", status:"ready", unlock:{ type:"lessons", lessons:1 } },
  { id:"memory",          title:"Memory Match",        desc:"Match healthy coping tools.",                          status:"soon", unlock:{ type:"xp",     xp:120 } },
  { id:"coping-sort",     title:"Coping Sort",         desc:"Sort coping tools into helpful vs not helpful.",       status:"soon", unlock:{ type:"lessons",lessons:3 } },
  { id:"streak-run",      title:"Streak Run",          desc:"Quick reaction game to keep your streak alive.",       status:"soon", unlock:{ type:"level",  level:3 } },
  { id:"focus-dodge",     title:"Focus Dodge",         desc:"Avoid distractions; build focus.",                     status:"soon", unlock:{ type:"level",  level:4 } },
  { id:"goal-builder",    title:"Goal Builder",        desc:"Pick goals + tiny steps to reach them.",               status:"soon", unlock:{ type:"xp",     xp:350 } },
  { id:"friendship-quiz", title:"Friendship Signals",  desc:"Spot healthy vs unhealthy friend behaviors.",          status:"soon", unlock:{ type:"lessons",lessons:7 } },
  { id:"stress-lab",      title:"Stress Lab",          desc:"Try safe stress tools and see what works.",            status:"soon", unlock:{ type:"xp",     xp:600 } },
];

/* =========================================================
   STATE
========================================================= */
const DEFAULT_STATE = {
  currentLessonIndex: 0,
  completedDays: [],
  lastCompletedISO: null,
  streak: 0,
  highScore: 0,
  xp: 0,
  level: 1,
  profileName: "Player",

  // emoji OR "custom:<id>"
  avatar: AVATARS[0],
  // [{ id, dataURL, createdISO }]
  customAvatars: [],

  ownedBadges: [],
  ratings: { total: 0, count: 0 },

  // BRANCHING HABIT QUEST SAVE SCHEMA
  habitQuest: {
    nodeId: "hq_start",
    hearts: 3,
    wisdom: 0,
    tokens: 0,
    lastLessonDay: 0,

    // for branching + persistence
    flags: {},     // arbitrary booleans/strings/numbers (safe)
    visited: {},   // nodeId -> true
    history: [],   // last N visited nodeIds
  },

  selectedTrack: "general",
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
    habitQuest: {
      ...DEFAULT_STATE.habitQuest,
      ...(safe.habitQuest && typeof safe.habitQuest === "object" ? safe.habitQuest : {})
    }
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

  // Habit Quest normalize (branching)
  const hq = merged.habitQuest || {};
  merged.habitQuest.nodeId = safeStr(hq.nodeId, DEFAULT_STATE.habitQuest.nodeId);
  merged.habitQuest.hearts = clamp(safeNum(hq.hearts, 3), 0, 5);
  merged.habitQuest.wisdom = Math.max(0, safeNum(hq.wisdom, 0));
  merged.habitQuest.tokens = Math.max(0, safeNum(hq.tokens, 0));
  merged.habitQuest.lastLessonDay = Math.max(0, safeNum(hq.lastLessonDay, 0));

  merged.habitQuest.flags = (hq.flags && typeof hq.flags === "object") ? hq.flags : {};
  merged.habitQuest.visited = (hq.visited && typeof hq.visited === "object") ? hq.visited : {};
  merged.habitQuest.history = Array.isArray(hq.history) ? hq.history.slice(-50) : [];

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
    showView("lesson");
  });
  $("#btn-clear-track")?.addEventListener("click", () => {
    state.selectedTrack = "general";
    state.currentLessonIndex = 0;
    saveState();
    renderTrackUI();
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
}

/* =========================================================
   NAVIGATION
========================================================= */
function showView(name){
  document.body.style.overflow = ""; // safety reset
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(`#view-${name}`)?.classList.remove("hidden");
  $$(".tab").forEach(t => t.classList.remove("active"));
  $(`.tab[data-view="${name}"]`)?.classList.add("active");

  if(name === "lesson")   renderLesson();
  if(name === "games")    renderGamesCatalog();
  if(name === "progress") renderProgress();
  if(name === "profile")  renderProfile();
  if(name === "shop")     renderShop();
  if(name === "rate")     renderRate();
  if(name === "tracks")   renderTrackUI();
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
    ? "✅ You already completed this lesson!"
    : "Not completed yet — answer all questions correctly, then click “Mark Lesson Complete”.";
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

    if(score.correct < score.total){
      $("#lesson-status") && ($("#lesson-status").textContent =
        `Almost! Quiz score: ${score.correct}/${score.total}. Answer all correctly to complete.`);
      return;
    }

    const firstTime = !state.completedDays.includes(score.day);
    if(firstTime){
      addXP(score.total * 5);
      state.completedDays.push(score.day);
      addXP(50);

      // +1 token per FIRST-TIME lesson completion (Habit Quest)
      state.habitQuest.tokens = safeNum(state.habitQuest.tokens,0) + 1;
    }

    state.habitQuest.lastLessonDay = score.day;

    const todayISO = isoDate(new Date());
    if(state.lastCompletedISO !== todayISO){
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = isoDate(yesterday);
      state.streak = (state.lastCompletedISO === yesterdayISO) ? (state.streak + 1) : 1;
      state.lastCompletedISO = todayISO;
    }

    saveState();
    updateHomeStats();
    updateLessonStatus(score.day);
    renderProgress();
    renderGamesCatalog();
  });
}

/* =========================================================
   HOME STATS
========================================================= */
function updateHomeStats(){
  $("#streak-text")   && ($("#streak-text").textContent   = `${state.streak} day${state.streak === 1 ? "" : "s"}`);
  $("#streak-text-2") && ($("#streak-text-2").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`);
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
        max-width: 980px;
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
      }
      .hqAvatarImg{
        width:22px;height:22px;border-radius:999px;object-fit:cover;
        border:1px solid rgba(255,255,255,0.18);
      }
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
  });
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
  GAMES.forEach(game => {
    const { unlocked, reason } = gameUnlockStatus(game);

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
    btn.textContent = (game.status === "ready" && unlocked) ? "Play" : "Locked / Soon";

    if(!(game.status === "ready" && unlocked)){
      btn.disabled = true;
      btn.classList.add("disabled");
    }else{
      btn.addEventListener("click", () => launchGame(game.id));
    }

    card.append(h,p,p2,btn);
    grid.appendChild(card);
  });
}

function launchGame(id){
  if(id === "choicequest") return startChoiceQuest();
  if(id === "breathing") return startBreathing();
  if(id === "habitquest") return startHabitQuest();
  alert("This game is coming soon. Keep earning XP to unlock more!");
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
  state.habitQuest.history = state.habitQuest.history.slice(-50);
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
  return true;
}

// NODE GRAPH (IDs + branching next pointers)
const HQ_NODES = {
  // Chapter 1
  hq_start: {
    chapter: "Chapter 1: The First Steps",
    text: (ctx) => `You arrive at Sunny Town. A friend says, “Want to do something risky to feel cool?”`,
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
      // Branch: if you previously asked an adult, you get an extra “team up” option later (flag use)
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

  // Chapter 2 (Focus Forest) — with a small branch
  hq_forest_intro: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `In Focus Forest, someone offers “instant fun” that could turn into a bad habit.`,
    choices: [
      { text:"Pause and ask: “Will this help Future Me?”", good:true,  effects:{ wisdom:+1, xp:+15, flag:{ key:"usedFutureMe", value:true } }, why:"That question protects you.", next:"hq_forest_step" },
      { text:"Do it without thinking.",                    good:false, effects:{ hearts:-1 },               why:"Pausing is your superpower.", next:"hq_forest_step" },
    ]
  },

  hq_forest_step: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `You find a sign: “Tiny steps beat giant promises.” Pick your tiny step.`,
    choices: [
      { text:"Drink water + snack (brain fuel).",       good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"brainFuel", value:true } }, why:"Brain fuel helps choices.", next:"hq_forest_boss" },
      { text:"2‑minute tidy reset.",                    good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"tidyReset", value:true } }, why:"Small wins add up.", next:"hq_forest_boss" },
      { text:"Write 1 helpful thought about yourself.", good:true, effects:{ wisdom:+1, xp:+10, flag:{ key:"kindThought", value:true } }, why:"Kind self-talk matters.", next:"hq_forest_boss" },
    ]
  },

  hq_forest_boss: {
    chapter: "Chapter 2: The Focus Forest",
    text: (ctx) => {
      // a tiny conditional line based on flags (branch flavor)
      const bonus = ctx.flags && ctx.flags.helpedKid ? "You feel proud you helped someone earlier—confidence boost." : "You take a steady breath.";
      return `Boss moment: a crowd pressures you. ${bonus}`;
    },
    choices: [
      { text:"Say: “No thanks. I’m heading out.”", good:true,  effects:{ wisdom:+1, xp:+20 }, why:"Clear + calm + exit.", next:"hq_bridge" },
      { text:"Say yes so nobody laughs.",          good:false, effects:{ hearts:-1 },        why:"Real friends don’t demand proof.", next:"hq_bridge" },
    ]
  },

  hq_bridge: {
    chapter: "Chapter 2: The Focus Forest",
    text: () => `A bridge guard says: “Tokens open the bridge.”`,
    choices: [
      { text:"Use 1 token to cross.", require:{ token:1 }, good:true, effects:{ tokens:-1, xp:+20 }, why:"Forward!", next:"hq_mountain_intro" },
      { text:"Exit and earn a token by completing a lesson.", good:true, end:true, why:"Lessons give tokens." },
    ]
  },

  // Chapter 3 (Mood Mountain) — short demo branch: “askedAdult” unlocks a safer extra choice
  hq_mountain_intro: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `Up the mountain, feelings get big fast. A character says: “When emotions spike, your body needs calm first.”`,
    choices: [
      { text:"Try a calm reset: slow breaths + relax shoulders.", good:true, effects:{ wisdom:+1, xp:+15 }, why:"Calm first = better choices.", next:"hq_mountain_boost" },
      { text:"Yell and storm off.",                               good:false,effects:{ hearts:-1 },        why:"Big reactions can backfire.", next:"hq_mountain_boost" },
    ]
  },

  hq_mountain_boost: {
    chapter: "Chapter 3: The Mood Mountain",
    text: () => `Someone offers an “energy boost” product to feel powerful instantly.`,
    choices: [
      { text:"Skip it and choose water/food/rest instead.", good:true, effects:{ wisdom:+1, xp:+15 }, why:"Brain fuel beats quick tricks.", next:"hq_mountain_nameit" },
      { text:"Take it to feel cool.",                        good:false,effects:{ hearts:-1 },        why:"Quick boosts can cause problems.", next:"hq_mountain_nameit" },
      // only if you ever asked an adult (flag gate)
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
      { text:"Use 1 token to enter the tunnel.", require:{ token:1 }, good:true, effects:{ tokens:-1, xp:+20 }, why:"Onward!", next:"hq_win" },
      { text:"Exit and earn a token by completing a lesson.",          good:true, end:true,                     why:"Lessons give tokens." },
    ]
  },

  // Demo “ending”
  hq_win: {
    chapter: "Chapter 4+: Coming Soon",
    text: () => `You made it through the demo branch! We can extend this graph with more nodes, chapters, and backgrounds.`,
    choices: [
      { text:"Finish Habit Quest (for now).", good:true, effects:{ xp:+40 }, why:"Great job!", end:true },
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

  // flag setter: { flag:{ key, value } }
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

  const node = hqGetNode(safeStr(state.habitQuest.nodeId, "hq_start"));

  // mark visited
  hqMarkVisited(state.habitQuest.nodeId);
  saveState();

  // Header chips (includes image when custom)
  area.innerHTML = `
    <div class="hqRow">
      <div class="hqChip">📖 ${escapeHtml(node.chapter || "Habit Quest")}</div>
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
    <div class="divider"></div>

    <p id="hq-node-text" style="font-weight:900; font-size:18px; margin-top:10px;"></p>
    <div id="hq-choices"></div>
    <p class="muted" id="hq-why" style="margin-top:12px;"></p>
  `;

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

      // apply effects
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

  input.value = safeStr(state.profileName, "Player").slice(0, 24);

  const selectedCustom = getSelectedCustomAvatar();
  const usingCustom = !!(selectedCustom && selectedCustom.dataURL);

  // header avatar preview
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

  // stats
  $("#profile-xp")      && ($("#profile-xp").textContent = String(state.xp));
  $("#profile-level")   && ($("#profile-level").textContent = String(state.level));
  $("#profile-lessons") && ($("#profile-lessons").textContent = String(state.completedDays.length));

  // avatar grid
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
  renderProgress();
  renderProfile();
  renderShop();
  renderRate();
  renderGamesCatalog();
  renderTrackUI();

  showView("home");
}

init();
