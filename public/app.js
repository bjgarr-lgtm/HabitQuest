/* How to Avoid Addiction — V3 (no frameworks)
   Static site. Saves progress in localStorage (device only).
   NOTE: app.js must contain ONLY JavaScript.
*/
"use strict";

/* =========================================================
   DOM HELPERS
========================================================= */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* =========================================================
   STORAGE + SMALL HELPERS
========================================================= */
const STORAGE_KEY = "htaa_v3_state";

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


// Deterministic PRNG for stable shuffles per lesson/day
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

function shuffleInPlace(arr, rng){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function lessonKey(trackId, day){
  return `${trackId}:${Number(day)}`;
}
function isLessonComplete(trackId, day){
  return state.completedDays.includes(lessonKey(trackId, day));
}
function markLessonComplete(trackId, day){
  const key = lessonKey(trackId, day);
  if(!state.completedDays.includes(key)) state.completedDays.push(key);
}


/* =========================================================
   CONTENT: TIPS
========================================================= */
const TIPS = [
  "If you’re not sure, pause. You get to choose your pace.",
  "A plan is a superpower: one tiny step now beats a huge promise later.",
  "Stress is a body signal. You can lower it before you decide anything.",
  "Real friends don’t need you to prove anything.",
  "If it needs secrecy, it’s usually not a safe choice.",
  "When you feel pulled toward a risky escape, zoom out: ‘What happens tomorrow?’",
];

/* =========================================================
   GAME SCENARIOS (small reuse is fine for games)
========================================================= */
const GAME_SCENARIOS = [
  {
    prompt: "A friend says: “Try this, everyone’s doing it.” What’s the best response?",
    choices: [
      { text: "“No thanks. Let’s do something else.”", good: true,  why: "Clear no + switch." },
      { text: "“Maybe later, don’t tell anyone.”",     good: false, why: "Secrecy keeps risk open." },
      { text: "“Okay so you like me.”",                good: false, why: "Pressure isn’t friendship." }
    ]
  },
  {
    prompt: "You’re stressed after school. What’s a healthy first move?",
    choices: [
      { text: "Take 4 slow breaths and drink water.", good: true,  why: "Calms your body fast." },
      { text: "Do something risky to forget it.",     good: false, why: "Risky escapes create bigger problems." },
      { text: "Hold it in forever.",                  good: false, why: "Support helps." }
    ]
  },
  {
    prompt: "Someone jokes about you for saying no. Best move?",
    choices: [
      { text: "Stay calm, repeat ‘No,’ and step away.", good: true,  why: "You protect yourself." },
      { text: "Prove yourself by saying yes.",          good: false, why: "That’s how pressure wins." },
      { text: "Start a fight.",                         good: false, why: "Fighting makes things worse." }
    ]
  }
];

/* =========================================================
   BADGES + AVATARS
========================================================= */
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
   TRACKS + CURRICULUM SOURCE (from curriculum.js)
========================================================= */
const CURR = (typeof window.CURR === "function") ? window.CURR() : window.CURR;

if(!CURR || !CURR.TRACKS){
  throw new Error("curriculum.js not loaded (or failed). Check console for curriculum.js errors and ensure it loads before app.js.");
}

const TRACKS = CURR.TRACKS;

// blueprint lookup by (day, track)
function getBlueprint(day, track){
  const t = (track && CURR.BLUEPRINTS_BY_TRACK[track]) ? track : "general";
  const arr = CURR.BLUEPRINTS_BY_TRACK[t] || CURR.BLUEPRINTS_BY_TRACK.general;
  const idx = clamp(safeNum(day, 1), 1, arr.length) - 1;
  return arr[idx] || arr[0];
}

let memoryState = null;

/* =========================================================
   QUIZ BUILDER (12 QUESTIONS PER DAY, DAY-SPECIFIC WORDING)
   - No “same five platitudes” re-used as-is across lessons.
========================================================= */

// --- quiz helpers (varied stems + plausible distractors) ---
function pick(rng, arr){ return arr[Math.floor(rng()*arr.length)]; }

function vary(rng, variants, tokens){
  // tokens like {DAY, TITLE, GOAL, TOOL, SCENARIO, PLAN, MYTH, BOUNDARY, TINYSTEP}
  let s = pick(rng, variants);
  return s.replace(/\{(\w+)\}/g, (_,k)=> (tokens[k] ?? `{${k}}`));
}

function normalizeText(s){
  return String(s||"").toLowerCase().replace(/\s+/g," ").trim();
}

function makeDistractors(rng, correct, pool, count){
  const c = normalizeText(correct);
  const out = [];
  for(const p of pool){
    if(out.length >= count) break;
    if(!p) continue;
    const t = normalizeText(p);
    if(!t || t === c) continue;
    // avoid super-close duplicates
    if(out.some(x => normalizeText(x) === t)) continue;
    out.push(p);
  }
  // if pool was too small, pad with generic but still safe distractors
  const filler = [
    "Do it fast so you don’t have to think",
    "Keep it secret so nobody finds out",
    "Go all-in and hope it works out",
    "Argue until you win"
  ];
  while(out.length < count) out.push(pick(rng, filler));
  return out.slice(0, count);
}

// small banks to keep questions feeling human
const QUIZ_STEMS = {
  goal: [
    "Day {DAY} — what are you trying to achieve in “{TITLE}”?",
    "In today’s lesson (“{TITLE}”), the real target is:",
    "What’s the main purpose of Day {DAY} (“{TITLE}”)?"
  ],
  tool: [
    "Which tool are you practicing today?",
    "Today’s key skill is called:",
    "Tool check (Day {DAY}): what’s the tool name?"
  ],
  scenarioBest: [
    "Scenario: {SCENARIO}\nWhat’s the safest move?",
    "In this situation: {SCENARIO}\nWhich plan matches the lesson?",
    "You’re here: {SCENARIO}\nPick the best next step."
  ],
  myth: [
    "Which belief is today’s lesson pushing back on?",
    "Myth check: which statement is the *myth*?",
    "Today corrects this idea:"
  ],
  boundary: [
    "Which line best matches today’s boundary style?",
    "Pick the strongest boundary line for this lesson:",
    "Which response fits the lesson’s tone?"
  ],
  tinyStep: [
    "Which tiny step matches today’s lesson?",
    "Best ‘tiny step’ for Day {DAY}:",
    "What’s the most doable action from today?"
  ],
  apply: [
    "Which option protects Future You the most here?",
    "Which choice reduces risk *and* keeps your dignity?",
    "What’s the most ‘clean tomorrow’ option?"
  ],
  sequence: [
    "Put the plan in order (choose the best sequence):",
    "Which sequence matches the safe plan steps?",
    "Pick the best step-by-step order:"
  ]
};

function getHardcodedQuiz(day, track){
  const QB =
    window.CURR?.QUIZZES_BY_TRACK?.[track] ??
    window.QUIZZES?.[track];

  if(!QB) return null;

  if(Array.isArray(QB)){
    const q = QB[day - 1];
    return Array.isArray(q) ? q : null;
  }

  const q = QB[String(day)] ?? QB[day];
  return Array.isArray(q) ? q : null;
}







function getQuizForLesson(day, title, goal, track){
  const hard = getHardcodedQuiz(day, track);
  if(hard) return hard;

  // fallback only if you still have generator available
  if(typeof makeQuizForLesson === "function"){
    return makeQuizForLesson(day, title, goal, track);
  }

  return []; // never crash renderQuiz
}






/* =========================================================
   LESSONS BY TRACK (from curriculum.js)
========================================================= */
const LESSONS_BY_TRACK = {};
Object.keys(TRACKS).forEach((trackId) => {
  const cur = CURR.CURRICULUM_BY_TRACK?.[trackId] || [];
  if(!cur.length) console.warn("No curriculum for track:", trackId);

  LESSONS_BY_TRACK[trackId] = cur.map((c, i) => {
    const day = i + 1;
    const bp = getBlueprint(day, trackId);
    return {
      id: `${trackId}-day-${day}`,
      day,
      track: trackId,
      title: c.title,
      goal: c.goal,
      toolName: bp.toolName,           // IMPORTANT: fixes your lesson.toolName usage
      content: makeLessonContent(day, c.title, c.goal, trackId),
      quiz: getQuizForLesson(day, c.title, c.goal, trackId),
    };
  });
});

function makeLessonContent(day, title, goal, track){
  const bp = getBlueprint(day, track);

  // If curriculum.js doesn't provide bp.content[], build a safe fallback
  const extra = Array.isArray(bp.content) && bp.content.length
    ? bp.content
    : [
        `Tool: ${bp.toolName || "—"}`,
        `Scenario: ${bp.scenario || "—"}`,
        `Safe plan: ${bp.safePlan || "—"}`,
        `Try this: ${bp.tinyStep || "—"}`
      ];

  return [
    `Today’s topic: ${title}.`,
    `Goal: ${goal}`,
    ...extra
  ];
}


/* =========================================================
   GAMES CATALOG
========================================================= */
const GAMES = [
  { id:"breathing",   title:"Breathing Buddy", desc:"60‑second calm timer that earns XP.",         status:"ready", unlock:{ type:"free" } },
  { id:"responsebuilder", title:"Response Builder", desc:"Build a strong response to pressure.",  status:"ready", unlock:{ type:"free" } },
  { id:"pressuremeter", title:"Pressure Meter", desc:"Keep pressure low using healthy moves.",    status:"ready", unlock:{ type:"lessons", lessons:3 } },
  { id:"streak-run",  title:"Streak Run",      desc:"Quick reaction game to keep your streak.",   status:"ready", unlock:{ type:"level", level:4 } },
  { id:"coping-sort", title:"Coping Sort", desc:"Sort coping tools into helpful vs risky.", status:"ready", unlock:{ type:"lessons", lessons:5 } },
  { id:"focus-dodge", title:"Focus Dodge", desc:"Avoid distractions and stay focused.", status:"ready", unlock:{ type:"level", level:5 } },
  { id:"memory", title:"Memory Match", desc:"Match healthy coping tools.", status:"ready", unlock:{ type:"xp", xp:250 } },
  { id:"goal-builder",title:"Goal Builder",    desc:"Pick goals + tiny steps to reach them.",     status:"ready", unlock:{ type:"xp", xp:600 } },
  { id:"friendship-quiz", title:"Friendship Signals", desc:"Spot healthy vs unhealthy friend behaviors.", status:"ready", unlock:{ type:"lessons", lessons:10 } },
  { id:"stress-lab",  title:"Stress Lab",      desc:"Try safe stress tools and see what works.",  status:"ready", unlock:{ type:"xp", xp:900 } },
];

// --- game unlock + render (THIS IS WHAT YOU’RE MISSING) ---
function gameUnlockInfo(g){
  const u = g?.unlock || { type:"free" };
  if(u.type === "free") return { ok:true, reason:"" };

  if(u.type === "lessons"){
    const need = Number(u.lessons || 0);
    const have = Number(state.completedDays?.length || 0);
    return { ok: have >= need, reason: `Complete ${need} lesson${need===1?"":"s"} to unlock (you have ${have}).` };
  }

  if(u.type === "level"){
    const need = Number(u.level || 1);
    const have = Number(state.level || 1);
    return { ok: have >= need, reason: `Reach Level ${need} to unlock (you are Level ${have}).` };
  }

  if(u.type === "xp"){
    const need = Number(u.xp || 0);
    const have = Number(state.xp || 0);
    return { ok: have >= need, reason: `Earn ${need} XP to unlock (you have ${have}).` };
  }

  return { ok:true, reason:"" };
}

function renderGamesCatalog(){
  // support multiple possible container IDs so your HTML doesn’t have to be perfect
  const wrap =
    document.getElementById("games-grid") ||
    document.getElementById("games-list") ||
    document.getElementById("mini-games-grid") ||
    document.getElementById("minigames-grid") ||
    document.getElementById("games");

  if(!wrap){
    console.warn("[games] No container found. Add <div id='games-grid'></div> in the Mini-Games view.");
    return;
  }

  wrap.innerHTML = "";
  if(!Array.isArray(GAMES) || !GAMES.length){
    wrap.innerHTML = `<p class="muted">No games found.</p>`;
    return;
  }

  GAMES.forEach(g => {
    const info = gameUnlockInfo(g);
    const card = document.createElement("div");
    card.className = "card";
    card.style.background = "rgba(255,255,255,0.06)";
    card.style.marginTop = "12px";

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:flex-start; flex-wrap:wrap;">
        <div>
          <div style="font-weight:900; font-size:18px;">${escapeHtml(g.title || g.id)}</div>
          <div class="muted" style="margin-top:6px;">${escapeHtml(g.desc || "")}</div>
          ${info.ok ? "" : `<div class="muted" style="margin-top:8px; color: rgba(255,220,90,0.95);">${escapeHtml(info.reason)}</div>`}
        </div>
        <div class="actions" style="margin:0;">
          <button class="btn primary" type="button" data-play="${escapeHtml(g.id)}" ${info.ok ? "" : "disabled"}>Play</button>
        </div>
      </div>
    `;

    card.querySelector("[data-play]")?.addEventListener("click", () => {
      const id = g.id;
      // make sure overlay exists before launching
      if(!document.getElementById("game-overlay")) ensureGameOverlay();
      launchGame(id);
    });

    wrap.appendChild(card);
  });
}
/* =========================================================
   STATE
========================================================= */

function blankSaveSlot(){
  return { savedISO: null, label: "", data: null };
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
  reflections: { /* day -> { text, savedISO, rewarded } */ },
  lastLoginISO: null,
  quizAttempts: { /* dayKey -> { attempts, wrongTotal, lastISO } */ },

  // Mistake Review mode
  mistakes: {
    /* qKey -> {
        qKey, track, day, lessonId,
        q, options, answer,
        wrongCount, lastWrongISO, firstWrongISO
    } */
  },
  mistakeMeta: { byLesson: {}, byConcept: {} },
  mistakeStats: { byLesson:{}, byConcept:{} },
  
  reviewMode: {
    active: false,
    queue: [],   // array of qKey
    idx: 0,
    lastBuiltISO: null
  },
  habitQuest: {
    nodeId: "hq_start",
    hearts: 3,
    wisdom: 0,
    tokens: 0,
    lastLessonDay: 0,
    flags: {},
    visited: {},
    history: [],
    difficulty: 0, // -2..+2
  },
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
    mistakes: (safe.mistakes && typeof safe.mistakes === "object") ? safe.mistakes : {},
    reviewMode: (safe.reviewMode && typeof safe.reviewMode === "object") ? safe.reviewMode : { active:false, queue:[], idx:0, lastBuiltISO:null },

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

  merged.customAvatars = Array.isArray(safe.customAvatars) ? safe.customAvatars : [];
  merged.customAvatars = merged.customAvatars
    .filter(a => a && typeof a.id === "string" && typeof a.dataURL === "string" && a.dataURL.startsWith("data:image/"))
    .map(a => ({ id: a.id, dataURL: a.dataURL, createdISO: safeStr(a.createdISO, isoDate(new Date())) }));
  merged.mistakes = (merged.mistakes && typeof merged.mistakes === "object") ? merged.mistakes : {};
  merged.mistakeStats = (safe.mistakeStats && typeof safe.mistakeStats === "object")
    ? safe.mistakeStats
    : { byLesson:{}, byConcept:{} };
  merged.reviewMode = (merged.reviewMode && typeof merged.reviewMode === "object") ? merged.reviewMode : { active:false, queue:[], idx:0, lastBuiltISO:null };
  merged.reviewMode.active = !!merged.reviewMode.active;
  merged.reviewMode.queue = Array.isArray(merged.reviewMode.queue) ? merged.reviewMode.queue : [];
  merged.reviewMode.idx = Math.max(0, safeNum(merged.reviewMode.idx, 0));
  merged.reviewMode.lastBuiltISO = safeStr(merged.reviewMode.lastBuiltISO, null);

  if(typeof safe.customAvatar === "string" && safe.customAvatar.startsWith("data:image/")){
    const exists = merged.customAvatars.some(a => a.dataURL === safe.customAvatar);
    if(!exists){
      merged.customAvatars.unshift({ id: uid(), dataURL: safe.customAvatar, createdISO: isoDate(new Date()) });
    }
  }

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

  const hq = merged.habitQuest || {};
  merged.habitQuest.nodeId = safeStr(hq.nodeId, DEFAULT_STATE.habitQuest.nodeId);
  merged.habitQuest.hearts = clamp(safeNum(hq.hearts, 3), 0, 5);
  merged.habitQuest.wisdom = Math.max(0, safeNum(hq.wisdom, 0));
  merged.habitQuest.tokens = Math.max(0, safeNum(hq.tokens, 0));
  merged.habitQuest.lastLessonDay = Math.max(0, safeNum(hq.lastLessonDay, 0));
  merged.habitQuest.flags = (hq.flags && typeof hq.flags === "object") ? hq.flags : {};
  merged.habitQuest.visited = (hq.visited && typeof hq.visited === "object") ? hq.visited : {};
  merged.habitQuest.history = Array.isArray(hq.history) ? hq.history.slice(-80) : [];

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
   REFLECTION PROMPTS (unique by lesson)
========================================================= */
function getReflectionPromptForLesson(lesson){
  const bp = getBlueprint(lesson.day, lesson.track);
  return bp.reflection || "What’s one thing you learned today, and how will you use it?";
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
      if(firstReward) addXP(10);
      renderReflection(cur);
    });
  }
}

/* =========================================================
   TRACKS
========================================================= */
function getLessonObject(meta){
  const day = safeNum(meta.day, 1);
  const track = safeStr(meta.track, "general");
  const bp = getBlueprint(day, track);

  return {
    id: `${track}-day-${day}`,
    day,
    track,
    title: safeStr(meta.title, `Day ${day}`),
    goal: safeStr(meta.goal, ""),
    // blueprint fields (so other code can use them)
    toolName: bp.toolName,
    scenario: bp.scenario,
    safePlan: bp.safePlan,
    boundaryLine: bp.boundaryLine,
    myth: bp.myth,
    tinyStep: bp.tinyStep,
    reflection: bp.reflection,
    // renderables
    content: makeLessonContent(day, meta.title, meta.goal, track),
    quiz: getQuizForLesson(day, meta.title, meta.goal, track),
  };
}

function makeQKey(track, day, qi){
  return `${track}|${day}|${qi}`;
}


function getActiveLessons(){
  const t = state.selectedTrack || "general";
  return (LESSONS_BY_TRACK[t] || LESSONS_BY_TRACK.general || []);
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

function applyStreakMilestoneBonus(){
  const s = safeNum(state.streak, 0);
  const given = state.__streakMilestonesGiven || [];
  const milestones = [
    { day: 7,  xp: 75,  label: "7‑Day Streak Bonus" },
    { day: 14, xp: 150, label: "14‑Day Streak Bonus" },
    { day: 30, xp: 300, label: "30‑Day Streak Bonus" },
  ];
  state.__streakMilestonesGiven = Array.isArray(given) ? given : [];

  const hit = milestones.find(m => m.day === s);
  if(!hit) return;

  const key = String(hit.day);
  if(state.__streakMilestonesGiven.includes(key)) return;

  state.__streakMilestonesGiven.push(key);
  addXP(hit.xp);
  saveState();

  const el = document.getElementById("lesson-status");
  if(el) el.textContent = `🔥 ${hit.label}! +${hit.xp} XP`;
}


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

  if(name === "lesson"){
    renderLesson(); // always render the lesson screen
  }

  if(name === "games")    renderGamesCatalog();
  if(name === "profile"){
    renderProfile();
    renderProgress();
  }
  if(name === "progress") name = "home";
  if(name === "shop")     renderShop();
  if(name === "map")      renderStoryMap();
  if(name === "home")     renderHomeRecommendation();
  if(name === "habitquest"){
    $("#hq-current-node") && ($("#hq-current-node").textContent = state.habitQuest.nodeId);
    $("#hq-token-count") && ($("#hq-token-count").textContent = state.habitQuest.tokens);
    $("#hq-heart-count") && ($("#hq-heart-count").textContent = state.habitQuest.hearts);
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
  $("#btn-start-lesson")?.addEventListener("click", () => showView("lesson"));
  $("#btn-start-game")?.addEventListener("click", () => showView("games"));
  $("#btn-open-habitquest-tab")?.addEventListener("click", () => showView("habitquest"));
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
   RECOMMENDED NEXT LESSON
========================================================= */
function recordQuizAttempt(track, day, wrongCount){
  const key = lessonKey(track, day); // track:day
  state.quizAttempts = (state.quizAttempts && typeof state.quizAttempts === "object") ? state.quizAttempts : {};
  const cur = state.quizAttempts[key] && typeof state.quizAttempts[key] === "object"
    ? state.quizAttempts[key]
    : { attempts: 0, wrongTotal: 0, lastISO: null };
  cur.attempts = safeNum(cur.attempts, 0) + 1;
  cur.wrongTotal = safeNum(cur.wrongTotal, 0) + Math.max(0, safeNum(wrongCount, 0));
  cur.lastISO = isoDate(new Date());
  state.quizAttempts[key] = cur;
  saveState();
}


function renderProgressChart(){
  const c = document.getElementById("progress-chart");
  if(!c) return;
  const ctx = c.getContext("2d");
  const W = c.width, H = c.height;
  ctx.clearRect(0,0,W,H);

  const totalDays = (getActiveLessons()?.length || 60);
  const done = (state.completedDays?.length || 0);
  const pct = totalDays ? Math.round((done/totalDays)*100) : 0;

  // background
  ctx.fillStyle = "rgba(255,255,255,0.06)";
  ctx.fillRect(0,0,W,H);

  // bar
  const pad = 24;
  const barW = W - pad*2;
  const barH = 26;
  const x = pad, y = 70;
  ctx.fillStyle = "rgba(255,255,255,0.10)";
  ctx.fillRect(x,y,barW,barH);

  ctx.fillStyle = "rgba(68,215,182,0.9)";
  ctx.fillRect(x,y,Math.round(barW*(done/Math.max(1,totalDays))),barH);

  // text
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "bold 20px system-ui, -apple-system, Segoe UI, Roboto";
  ctx.fillText(`Progress: ${done} / ${totalDays} lessons (${pct}%)`, pad, 40);

  ctx.font = "14px system-ui, -apple-system, Segoe UI, Roboto";
  ctx.fillStyle = "rgba(255,255,255,0.78)";
  ctx.fillText(`XP: ${state.xp}   Level: ${state.level}   Streak: ${state.streak} day(s)`, pad, 120);

  // small sparkline-like boxes for last 14 completions
  const items = [...(state.completedDays||[])].slice(-14);
  const box = 12, gap = 6;
  const startX = pad, startY = 150;
  items.forEach((_,i)=>{
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(startX + i*(box+gap), startY, box, box);
    ctx.fillStyle = "rgba(255,220,90,0.95)";
    ctx.fillRect(startX + i*(box+gap), startY, box, box);
  });
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText("Last completions", pad, 190);
}



function getRecommendedLesson(){
  const lessons = getActiveLessons();
  if(!lessons.length) return null;

  // ✅ If truly fresh, always recommend Day 1
  if((state.completedDays?.length || 0) === 0){
    return lessons[0];
  }

  const uncompleted = lessons.filter(l => !isLessonComplete(l.track, l.day));
  if(uncompleted.length) return uncompleted[0];

  // if all done, recommend the one with most wrong history
  let best = null;
  let bestScore = -1;
  for(const l of lessons){
    const stat = state.quizAttempts?.[lessonKey(l.track, l.day)];
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

  const isDone = isLessonComplete(rec.track, rec.day);
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

function logQuizMistake(lesson, qIndex, item){
  if(!lesson || !item) return;
  const nowISO = isoDate(new Date());
  const qKey = makeQKey(lesson.track, lesson.day, qIndex);
  
  state.mistakes = (state.mistakes && typeof state.mistakes === "object") ? state.mistakes : {};
  const prev = state.mistakes[qKey];

  state.mistakes[qKey] = {
    qKey,
    track: lesson.track || state.selectedTrack || "general",
    day: safeNum(lesson.day, 0),
    lessonId: safeStr(lesson.id, `${lesson.track || "general"}-day-${lesson.day}`),
    q: String(item.q || ""),
    options: Array.isArray(item.options) ? item.options.slice(0, 8) : [],
    answer: safeNum(item.answer, 0),

    wrongCount: safeNum(prev?.wrongCount, 0) + 1,
    lastWrongISO: nowISO,
    firstWrongISO: prev?.firstWrongISO || nowISO,
  };

  saveState();
}

// Build a daily review queue from stored mistakes (track-aware)
function buildMistakeReviewQueue({ max=10 } = {}){
  const track = state.selectedTrack || "general";
  const all = Object.values(state.mistakes || {})
    .filter(m => m && m.track === track && String(m.q||"").trim().length);

  // Sort: most wrong first, then most recent wrong
  all.sort((a,b) => {
    const wc = safeNum(b.wrongCount,0) - safeNum(a.wrongCount,0);
    if(wc) return wc;
    return String(b.lastWrongISO||"").localeCompare(String(a.lastWrongISO||""));
  });

  const picked = all.slice(0, Math.max(0, safeNum(max,10))).map(m => m.qKey);

  state.reviewMode = (state.reviewMode && typeof state.reviewMode === "object") ? state.reviewMode : {};
  state.reviewMode.active = true;
  state.reviewMode.queue = picked;
  state.reviewMode.idx = 0;
  state.reviewMode.lastBuiltISO = isoDate(new Date());
  saveState();
  return picked;
}

function exitMistakeReview(){
  state.reviewMode = (state.reviewMode && typeof state.reviewMode === "object") ? state.reviewMode : {};
  state.reviewMode.active = false;
  state.reviewMode.queue = [];
  state.reviewMode.idx = 0;
  saveState();
}

function getCurrentReviewItem(){
  if(!state.reviewMode?.active) return null;
  const qKey = state.reviewMode.queue?.[state.reviewMode.idx];
  if(!qKey) return null;
  return state.mistakes?.[qKey] || null;
}

function renderMistakeReviewInQuizPanel(){
  const item = getCurrentReviewItem();
  const quizWrap = $("#quiz");
  if(!quizWrap) return;

  // keep lesson content on screen; only control quiz area
  quizWrap.innerHTML = "";

  if(!item){
    quizWrap.innerHTML = `<div class="card" style="margin-top:10px;">
      <h3 style="margin-top:0;">Mistake Review</h3>
      <p class="muted">No mistakes saved yet — do a quiz first.</p>
      <div class="actions" style="margin-top:10px;">
        <button class="btn" id="btn-exit-review" type="button">Exit Review</button>
      </div>
    </div>`;

    $("#btn-exit-review")?.addEventListener("click", () => {
      exitMistakeReview();
      showView("home");
    });
    return;
  }

  quizWrap.innerHTML = `
    <div class="card" style="margin-top:10px; background: rgba(255,255,255,0.06);">
      <h3 style="margin-top:0;">Mistake Review 🔁</h3>
      <p class="muted">From Day ${item.day} • Missed ${item.wrongCount} time${item.wrongCount===1?"":"s"}</p>
      <div class="divider"></div>
      <p style="font-weight:900;">${escapeHtml(item.q)}</p>
      <div id="mr-opts"></div>
      <p class="muted" id="mr-msg" style="margin-top:10px;"></p>
      <div class="actions" style="margin-top:12px;">
        <button class="btn" id="btn-exit-review" type="button">Exit Review</button>
        <button class="btn primary" id="btn-skip-review" type="button">Skip</button>
      </div>
    </div>
  `;

  const optsWrap = quizWrap.querySelector("#mr-opts");
  const msgEl = quizWrap.querySelector("#mr-msg");

  (item.options || []).forEach((optText, optIndex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = optText;

    btn.addEventListener("click", () => {
      // lock
      optsWrap.querySelectorAll("button.choiceBtn").forEach(b => b.disabled = true);

      const correct = (optIndex === item.answer);
      if(correct){
        btn.classList.add("choiceGood");
        if(msgEl) msgEl.textContent = "✅ Correct! Clearing this mistake.";
        delete state.mistakes[item.qKey];
        state.reviewMode.idx += 1;

        if(state.reviewMode.idx >= (state.reviewMode.queue?.length || 0)){
          exitMistakeReview();
          addXP(15);
          saveState();
          showView("lesson"); // returns to normal lesson render
          return;
        }

        saveState();
        addXP(2);
        renderMistakeReviewInQuizPanel();
      }else{
        btn.classList.add("choiceBad");
        if(state.mistakes?.[item.qKey]){
          state.mistakes[item.qKey].wrongCount = safeNum(state.mistakes[item.qKey].wrongCount,0) + 1;
          state.mistakes[item.qKey].lastWrongISO = isoDate(new Date());
        }
        saveState();
        if(msgEl) msgEl.textContent = "Not yet — you’ve got this. Try again.";
        // re-enable so they can retry right away
        optsWrap.querySelectorAll("button.choiceBtn").forEach(b => b.disabled = false);
      }
    });

    optsWrap.appendChild(btn);
  });

  $("#btn-exit-review")?.addEventListener("click", () => {
    exitMistakeReview();
    showView("home");
  });

  $("#btn-skip-review")?.addEventListener("click", () => {
    state.reviewMode.idx += 1;
    if(state.reviewMode.idx >= (state.reviewMode.queue?.length || 0)){
      exitMistakeReview();
      saveState();
      showView("lesson");
      return;
    }
    saveState();
    renderMistakeReviewInQuizPanel();
  });

  $("#lesson-status") && ($("#lesson-status").textContent =
    `Review item ${state.reviewMode.idx + 1} / ${state.reviewMode.queue.length}`
  );
}



/* =========================================================
   LESSONS + QUIZ RENDERING
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

  // ✅ define these from the lesson you are actually rendering
  const day = Number(lesson.day);
  const track = String(lesson.track || state.selectedTrack || "general").toLowerCase();

  // TEMP DEBUG (leave for now)
  console.log("[QUIZ] keys", Object.keys(window.CURR?.QUIZZES_BY_TRACK || {}));
  console.log("[QUIZ] day", day, "track", track);

  const quizData = getQuizForLesson(day, lesson.title, lesson.goal, track);
  // ✅ IMPORTANT: make the rest of the app (scoring/mistakes) consistent
  lesson.quiz = Array.isArray(quizData) ? quizData : [];

  renderQuiz(quizData, lesson, track, day);
  // If review mode is active, draw the review question UI in the quiz area
  if(state.reviewMode?.active){
    renderMistakeReviewInQuizPanel();
  } else {
    // Optional: show inline “what you missed” after a failed attempt
    // renderMistakeReviewForCurrentLesson();
  }

  renderReflection(lesson);
  updateLessonStatus(track, day);

}


function renderLessonHeaderAndContent(lesson){
  $("#lesson-title") && ($("#lesson-title").textContent = lesson.title);
  $("#lesson-day")   && ($("#lesson-day").textContent   =
    `Day ${lesson.day} • Track: ${TRACKS[state.selectedTrack]?.name || "General"}`
  );
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
}


function renderMistakeReview(){
  const item = getCurrentReviewItem();
  const trackName = TRACKS[state.selectedTrack]?.name || "General";

  $("#lesson-title") && ($("#lesson-title").textContent = item ? "Mistake Review" : "Mistake Review");
  $("#lesson-day") && ($("#lesson-day").textContent = `Track: ${trackName} • Review`);
  $("#lesson-goal") && ($("#lesson-goal").textContent =
    item ? "Fix missed concepts: answer correctly to clear items." : "No mistakes saved yet — do a quiz first."
  );

  const body = $("#lesson-content");
  if(body){
    body.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = item
      ? "You previously missed this question. Answer it correctly to move on."
      : "Do some lessons + quizzes. Any wrong answers get saved here automatically.";
    body.appendChild(p);

    if(item){
      const meta = document.createElement("p");
      meta.className = "muted";
      meta.textContent = `From Day ${item.day} • Missed ${item.wrongCount} time${item.wrongCount===1?"":"s"}`;
      body.appendChild(meta);
    }
  }

  const quizWrap = $("#quiz");
  if(!quizWrap) return;
  quizWrap.innerHTML = "";

  if(!item){
    quizWrap.innerHTML = `<p class="muted">No mistakes saved yet — do a quiz first.</p>`;

    // make sure the main actions bar has the Exit button
    const actionsList = Array.from(document.querySelectorAll("#view-lesson .actions"));
    const actions = actionsList[actionsList.length - 1];
    if(actions){
      actions.innerHTML = `<button class="btn" id="btn-exit-review" type="button">Exit Review</button>`;
      document.getElementById("btn-exit-review")?.addEventListener("click", () => {
        exitMistakeReview();
        showView("home");
      });
    }
    return;
  }


  // Build a mini "lesson" object so your normal UI stays consistent
  const reviewQuestion = { q: item.q, options: item.options, answer: item.answer };

  const qEl = document.createElement("p");
  qEl.style.fontWeight = "900";
  qEl.textContent = reviewQuestion.q;
  quizWrap.appendChild(qEl);

  reviewQuestion.options.forEach((optText, optIndex) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = optText;
    btn.addEventListener("click", () => {
      // lock buttons
      quizWrap.querySelectorAll("button.choiceBtn").forEach(b => b.disabled = true);

      const correct = (optIndex === reviewQuestion.answer);
      if(correct){
        btn.classList.add("choiceGood");

        // remove this mistake entirely (cleared)
        const qKey = item.qKey;
        delete state.mistakes[qKey];

        // advance
        state.reviewMode.idx += 1;

        if(state.reviewMode.idx >= state.reviewMode.queue.length){
          exitMistakeReview();
          addXP(15);

          // advance to next lesson (same track)
          const lessons = getActiveLessons();
          state.currentLessonIndex = clamp(state.currentLessonIndex + 1, 0, lessons.length - 1);

          saveState();
          $("#lesson-status") && ($("#lesson-status").textContent = "✅ Review complete! Moving to next lesson…");
          showView("lesson"); // since reviewMode is off, this renders the next lesson
          return;
        }


        saveState();
        addXP(2);

        // next question
        renderMistakeReview();
      }else{
        btn.classList.add("choiceBad");
        // count it again (keep it in bank)
        state.mistakes[item.qKey].wrongCount = safeNum(state.mistakes[item.qKey].wrongCount,0) + 1;
        state.mistakes[item.qKey].lastWrongISO = isoDate(new Date());
        saveState();

        const msg = document.createElement("p");
        msg.className = "muted";
        msg.style.marginTop = "10px";
        msg.textContent = "Not yet — try again tomorrow or revisit the original lesson.";
        quizWrap.appendChild(msg);
      }
    });
    quizWrap.appendChild(btn);
  });

  // Replace lesson action buttons with review controls
  const actionsList = Array.from(document.querySelectorAll("#view-lesson .actions"));
  const actions = actionsList[actionsList.length - 1]; // use the bottom action bar
  if(actions){
    actions.innerHTML = `
      <button class="btn" id="btn-exit-review" type="button">Exit Review</button>
      <button class="btn primary" id="btn-next-review" type="button">Skip</button>
    `;
    $("#btn-exit-review")?.addEventListener("click", () => {
      exitMistakeReview();
      showView("home");
    });
    $("#btn-next-review")?.addEventListener("click", () => {
      state.reviewMode.idx += 1;

      if(state.reviewMode.idx >= (state.reviewMode.queue?.length || 0)){
        exitMistakeReview();

        // optional small XP for “skipping through” (or remove this line)
        // addXP(2);

        // advance to next lesson
        const lessons = getActiveLessons();
        state.currentLessonIndex = clamp(state.currentLessonIndex + 1, 0, lessons.length - 1);

        saveState();
        showView("lesson");
        return;
      }

      saveState();
      renderMistakeReview();
    });

  }

  $("#lesson-status") && ($("#lesson-status").textContent =
    `Review item ${state.reviewMode.idx + 1} / ${state.reviewMode.queue.length}`
  );
}


function renderQuiz(quizData, lesson, track, day){
  const quizEl = document.getElementById("quiz");
  if(!quizEl) return;

  const quizArr = Array.isArray(quizData) ? quizData : [];
  if(!quizArr.length){
    quizEl.innerHTML = `<div class="card" style="margin-top:10px;">No quiz for this lesson.</div>`;
    return;
  }

  quizEl.innerHTML = "";

  quizArr.forEach((item, qi) => {
    // optional: key for saving answers
    // const key = makeQKey(track, day, qi);

    const block = document.createElement("div");
    block.className = "card";
    block.style.marginTop = "10px";
    block.style.background = "rgba(255,255,255,0.06)";

    const qEl = document.createElement("p");
    qEl.style.fontWeight = "800";
    qEl.textContent = `${qi + 1}. ${item.q}`;
    block.appendChild(qEl);

    (item.options || []).forEach((opt, oi) => {
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

    quizEl.appendChild(block);
  });
}


function quizScoreForCurrentLesson(){
  const lessons = getActiveLessons();
  const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
  const lesson = lessons[idx];

  // ✅ ensure quiz exists even if lesson objects don’t ship with quiz embedded
  const quiz = Array.isArray(lesson.quiz) ? lesson.quiz : getQuizForLesson(lesson.day, lesson.title, lesson.goal, lesson.track || state.selectedTrack || "general");

  let correct = 0;
  quiz.forEach((item, qi) => {
    const sel = document.querySelector(`input[name="q_${qi}"]:checked`);
    const val = sel ? Number(sel.value) : null;
    const answerIndex = safeNum(item.answer, 0);
    if(Number.isFinite(val) && val === answerIndex){
      correct += 1;
    }
  });

  return { correct, total: quiz.length, day: lesson.day, title: lesson.title };
}

function getWrongItemsForCurrentLesson(){
  const lessons = getActiveLessons();
  const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
  const lesson = lessons[idx];

  const quiz = Array.isArray(lesson.quiz) ? lesson.quiz : getQuizForLesson(lesson.day, lesson.title, lesson.goal, lesson.track || state.selectedTrack || "general");

  const wrong = [];
  const wrongMeta = []; // for saving into mistake bank (needs original item)

  quiz.forEach((item, qi) => {
    const sel = document.querySelector(`input[name="q_${qi}"]:checked`);
    const val = sel ? Number(sel.value) : null;
    const answerIndex = safeNum(item.answer, 0);

    if(!Number.isFinite(val) || val !== answerIndex){
      const pickedText = (Number.isFinite(val) && Array.isArray(item.options) && item.options[val]) ? item.options[val] : null;
      wrong.push({
        q: String(item.q || ""),
        picked: pickedText,
        correct: (Array.isArray(item.options) && item.options[answerIndex]) ? item.options[answerIndex] : "",
        concept: item.concept || item.conceptName || ""
      });
      wrongMeta.push({ qIndex: qi, item });
    }
  });

  return { lesson, wrong, wrongMeta, total: quiz.length, day: lesson.day, track: lesson.track, title: lesson.title };
}



function updateLessonStatus(trackId, day){
  const el = $("#lesson-status");
  if(!el) return;
  const done = isLessonComplete(trackId, day);
  el.textContent = done
    ? "✅ Well Done!"
    : "Not completed yet — answer all questions correctly, then click “Mark Lesson Complete”.";
}




function applyDailyStreakBonusIfAny(prevLastISO, newLastISO){
  const today = isoDate(new Date());
  if(newLastISO !== today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayISO = isoDate(yesterday);

  if(prevLastISO === yesterdayISO){
    state.habitQuest.tokens = safeNum(state.habitQuest.tokens, 0) + 1;
    addXP(15);
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
    // ✅ define the current lesson FIRST (prevents "Cannot access 'lesson' before initialization")
    const lessons = getActiveLessons();
    const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
    const lesson = lessons[idx];

    const score = quizScoreForCurrentLesson();
    const wrong = score.total - score.correct;

    if (wrong > 0) {
      // ✅ track-aware stats key
      recordQuizAttempt(lesson.track, lesson.day, wrong);

      $("#lesson-status") && ($("#lesson-status").textContent =
        `Almost! Quiz score: ${score.correct}/${score.total}. Fix the missed ones and try again.`);
      renderHomeRecommendation();
      return;
    }

    const firstTime = !isLessonComplete(lesson.track, lesson.day);
    if (firstTime) {
      addXP(score.total * 5);
      markLessonComplete(lesson.track, lesson.day);
      addXP(50);
      state.habitQuest.tokens = safeNum(state.habitQuest.tokens, 0) + 1;
    }

    state.habitQuest.lastLessonDay = lesson.day;

    const prevLastISO = state.lastCompletedISO;
    const todayISO = isoDate(new Date());
    if (state.lastCompletedISO !== todayISO) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = isoDate(yesterday);
      state.streak = (state.lastCompletedISO === yesterdayISO) ? (state.streak + 1) : 1;
      state.lastCompletedISO = todayISO;
      applyStreakMilestoneBonus();
      applyDailyStreakBonusIfAny(prevLastISO, state.lastCompletedISO);
    }

    saveState();
    updateHomeStats();
    updateLessonStatus(lesson.track, lesson.day);
    renderProgress();
    renderGamesCatalog();
    renderHomeRecommendation();
  });


  document.getElementById("btn-review-mistakes")?.addEventListener("click", () => {
    const miss = getWrongItemsForCurrentLesson();

    if(!miss.wrong.length){
      renderMistakeReviewForCurrentLesson();
      return;
    }

    // Save the missed questions into the mistake bank (qKey -> item)
    recordMistakesForLesson({ lesson: miss.lesson, wrongMeta: miss.wrongMeta });

    // Build queue + enter review mode UI
    buildMistakeReviewQueue({ max: 10 });
    showView("lesson"); // will call renderMistakeReview() because reviewMode.active = true
  });



}

function applyDailyLoginBonus(){
  const today = isoDate(new Date());
  if(state.lastLoginISO === today) return;
  state.habitQuest.tokens = safeNum(state.habitQuest.tokens, 0) + 1;
  addXP(5);
  state.lastLoginISO = today;
  saveState();
}

function recordMistakesForLesson({ lesson, wrongMeta }){
  // Save mistakes in the format Mistake Review expects (qKey -> mistake object)
  if(!lesson || !Array.isArray(wrongMeta)) return;
  wrongMeta.forEach(w => {
    // w.qIndex + w.item are required
    logQuizMistake(lesson, w.qIndex, w.item);
  });
}


/* =========================================================
   HOME STATS
========================================================= */
function updateHomeStats(){
  const streakLabel = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
  $("#streak-text")   && ($("#streak-text").textContent   = streakLabel);
  $("#streak-text-2") && ($("#streak-text-2").textContent = streakLabel);

  $("#dash-xp")      && ($("#dash-xp").textContent = String(state.xp));
  $("#dash-level")   && ($("#dash-level").textContent = String(state.level));
  $("#dash-lessons") && ($("#dash-lessons").textContent = String(state.completedDays.length));
}

/* =========================================================
   GAME OVERLAY + MINIGAME ENGINE (V4)
   - fixes flashing / auto-switching / broken restart
   - all games are configurable via GAME_CFG
========================================================= */

let gameMode = null;
let gameScore = 0;
let gameRestartFn = null;

function overlayEl(){ return document.getElementById("game-overlay"); }

// ---------- V4: one runtime to rule them all ----------
const GameRT = (() => {
  const rt = {
    timers: new Set(),
    intervals: new Set(),
    rafs: new Set(),
    keyHandlers: new Set(),
    cleanupFns: new Set(),

    reset(){
      // timers
      rt.intervals.forEach(id => clearInterval(id));
      rt.timers.forEach(id => clearTimeout(id));
      rt.rafs.forEach(id => cancelAnimationFrame(id));
      rt.intervals.clear();
      rt.timers.clear();
      rt.rafs.clear();

      // key handlers
      rt.keyHandlers.forEach(fn => document.removeEventListener("keydown", fn));
      rt.keyHandlers.clear();

      // custom cleanup
      rt.cleanupFns.forEach(fn => { try{ fn(); }catch{} });
      rt.cleanupFns.clear();
    },

    setInterval(fn, ms){
      const id = setInterval(fn, ms);
      rt.intervals.add(id);
      return id;
    },
    clearInterval(id){
      clearInterval(id);
      rt.intervals.delete(id);
    },
    setTimeout(fn, ms){
      const id = setTimeout(fn, ms);
      rt.timers.add(id);
      return id;
    },
    clearTimeout(id){
      clearTimeout(id);
      rt.timers.delete(id);
    },
    raf(fn){
      const id = requestAnimationFrame(fn);
      rt.rafs.add(id);
      return id;
    },
    cancelRaf(id){
      cancelAnimationFrame(id);
      rt.rafs.delete(id);
    },
    onKey(fn){
      document.addEventListener("keydown", fn);
      rt.keyHandlers.add(fn);
      return fn;
    },
    addCleanup(fn){
      rt.cleanupFns.add(fn);
    }
  };
  return rt;
})();

// ---------- Config: change speeds/durations here ----------
const GAME_CFG = {
  breathing: { seconds: 60, phaseSeconds: 4, xp: 10 },

  responsebuilder: {
    seconds: 25,
    xpBase: 10,
    scoreGood: 20,
    scoreBad: -6,
    comboBonus: 4
  },

  pressuremeter: {
    durationS: 30,
    start: 35,
    loseAt: 80,
    riseEarly: 4,
    riseMid: 5,
    riseLate: 6,
    buttons: [
      { id:"pm-breathe", label:"🫁 4 Breaths", delta:-12, msg:"Breathing lowers the body alarm." },
      { id:"pm-switch",  label:"🔁 Switch Plan", delta:-8,  msg:"Switching activities breaks pressure." },
      { id:"pm-exit",    label:"🚪 Exit Plan",   delta:-10, msg:"Exit plan = safety." },
      { id:"pm-text",    label:"📱 Text Adult",  delta:-15, msg:"Support makes choices easier." },
    ],
    xpWin: 20
  },

  streakrun: {
    rounds: 14,
    waitMinMs: 650,
    waitMaxMs: 2050,
    xpBase: 10,
    xpScoreDiv: 25
  },

  copingsort: { maxItems: 12, xpBase: 10, xpPerCorrect: 2 },

  friendshipquiz: { xpBase: 10, xpPerCorrect: 3 },

  stresslab: {
    durationS: 60,
    startStress: 45,
    loseAt: 99,
    rise1: 10, rise2: 15, rise3: 20,
    tools: [
      { name:"🫁 4 Breaths", delta:-16, score:+8,  msg:"Breathing lowers the body alarm." },
      { name:"💧 Water",    delta:-10, score:+5,  msg:"Hydration helps your brain steady." },
      { name:"🚶 Move",     delta:-14, score:+7,  msg:"Movement burns off stress energy." },
      { name:"📱 Text help",delta:-20, score:+10, msg:"Support makes it easier." },
      { name:"🧠 Time‑Zoom",delta:-12, score:+6,  msg:"Zooming out reduces urgency." },
    ],
  },

  memory: {
    levels: 10,
    // cards = levelPairs*2; level 1 => 3 pairs (6 cards), ramps up
    startPairs: 3,
    pairsPerLevel: 1,
    peekMs: 650,
    xpBase: 8,
    xpPerLevel: 2
  },

  focusdodge: {
    durationS: 60,
    spawnEveryMs: 1500,
    bubbleLifeMs: 3500,
    focusChance: 0.65,
    keys: ["A","S","D","F","J","K","L"],
    scoreFocusHit: 12,
    scoreWrongHit: -10,
    scoreMissedFocus: -6,
    xpBase: 10,
    xpScoreDiv: 30
  },

  goalbuilder: {
    seconds: 35,
    interruptEveryS: 7,
    cooldownMs: 700,
    xpBase: 15,
    xpScoreDiv: 20
  }
};

// ---------- Overlay ----------
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
      .gameOverlay{ position:fixed; inset:0; z-index:9999; background: rgba(0,0,0,0.70);
        backdrop-filter: blur(8px); padding: 14px; overflow:auto; color: rgba(255,255,255,0.92); }
      .gameOverlayInner{ max-width: 1100px; margin: 0 auto; background: rgba(20,20,30,0.92);
        border: 1px solid rgba(255,255,255,0.14); border-radius: 16px; padding: 16px; }
      .gameOverlayTop{ display:flex; gap:14px; align-items:center; justify-content:space-between; flex-wrap: wrap; }
      .gameOverlayStats{ display:flex; gap:10px; align-items:center; }
      .choiceBtn{ display:block; width:100%; text-align:left; padding: 12px; border-radius: 12px;
        font-family: system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif;
        border: 1px solid rgba(255,255,255,0.16); background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.92); cursor:pointer; margin-top: 10px; font-weight: 800; }
      .choiceBtn:hover{ background: rgba(255,255,255,0.10); }
      .choiceBtn:disabled{ opacity:0.6; cursor:not-allowed; }
      .choiceGood{ border-color: rgba(80,220,140,0.6); }
      .choiceBad{ border-color: rgba(255,120,120,0.6); }
      .hqRow{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 10px; }
      .bubbleStage{
        position: relative;
        height: 420px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.05);
        overflow: hidden;
      }
      .bubble{
        position:absolute;
        width: 140px;
        height: 140px;
        border-radius: 999px;
        display:grid;
        place-items:center;
        font-weight: 900;
        user-select:none;
        text-align:center;
        box-shadow: 0 8px 30px rgba(0,0,0,0.35);
        transform: translate(-50%, -50%);
      }
      .bubble .k{ font-size: 28px; line-height: 1; }
      .bubble .t{ font-size: 12px; opacity: 0.92; margin-top: 6px; }
      .bubble.focus{ background: rgba(80,220,140,0.95); color: #062013; }
      .bubble.dist{ background: rgba(255,85,119,0.95); color: #2b070f; }
    `;
    document.head.appendChild(style);
  }

  overlay.querySelector("#go-exit")?.addEventListener("click", (e) => {
    e.preventDefault();
    closeGameOverlay();
  });

  overlay.querySelector("#go-restart")?.addEventListener("click", (e) => {
    e.preventDefault();
    if(typeof gameRestartFn === "function") gameRestartFn();
  });

  overlay.addEventListener("click", (e) => {
    if(e.target === overlay) closeGameOverlay();
  });

  window.addEventListener("keydown", (e) => {
    if(e.key === "Escape" && overlayEl()?.style.display === "block") closeGameOverlay();
  });
}

function openGameOverlay(title, subtitle=""){
  // kill anything from previous game
  GameRT.reset();

  const overlay = overlayEl();
  if(!overlay) return;

  overlay.style.display = "block";
  overlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  overlay.querySelector("#go-title").textContent = title;
  overlay.querySelector("#go-sub").textContent = subtitle;
  overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
  overlay.querySelector("#go-restart").style.display = "none";
}

function closeGameOverlay(){
  const overlay = overlayEl();
  if(!overlay) return;

  GameRT.reset();

  overlay.style.display = "none";
  overlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  const c = overlay.querySelector("#go-content");
  if(c) c.innerHTML = "";

  gameMode = null;
  gameRestartFn = null;
}

/* =========================================================
   GAMES LAUNCHER (mini-games only)
========================================================= */
function launchGame(id){
  if(id === "breathing") return startBreathing();
  if(id === "responsebuilder") return startResponseBuilder();
  if(id === "pressuremeter") return startPressureMeter();
  if(id === "streak-run") return startStreakRun();
  if(id === "coping-sort") return startCopingSort();
  if(id === "focus-dodge") return startFocusDodge();
  if(id === "memory") return startMemoryMatch();
  if(id === "goal-builder") return startGoalBuilder();
  if(id === "friendship-quiz") return startFriendshipQuiz();
  if(id === "stress-lab") return startStressLab();
  alert("This game is coming soon. Keep earning XP to unlock more!");
}

/* =========================================================
   GAME: BREATHING BUDDY (clean + restart safe)
========================================================= */
function startBreathing(){
  gameMode = "breathing";
  gameScore = 0;
  gameRestartFn = startBreathing;

  const cfg = GAME_CFG.breathing;
  openGameOverlay("Breathing Buddy", `Calm your body for ${cfg.seconds} seconds.`);

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  let t = cfg.seconds;
  let phase = "In";
  let phaseT = 0;
  let finished = false;

  area.innerHTML = `
    <p class="muted">Follow the ring. Slow in… slow out…</p>
    <div id="bb-ring" style="
      width:180px;height:180px;margin:14px auto;border-radius:999px;
      border:2px solid rgba(255,255,255,0.18);
      display:grid;place-items:center;
      background:rgba(255,255,255,0.05);
      font-weight:900;font-size:22px;
    ">In</div>
    <p class="muted" id="bb-txt" style="text-align:center;"></p>
  `;

  const ring = area.querySelector("#bb-ring");
  const txt = area.querySelector("#bb-txt");

  const tick = () => {
    if(!ring || !txt) return;
    txt.textContent = `Time left: ${t}s`;

    ring.textContent = phase;
    const prog = phaseT / Math.max(1, cfg.phaseSeconds);
    const scale = phase === "In" ? (1 + prog*0.12) : (1.12 - prog*0.12);
    ring.style.transform = `scale(${scale.toFixed(3)})`;
    ring.style.transition = "transform 1s linear";

    phaseT++;
    if(phaseT >= cfg.phaseSeconds){
      phaseT = 0;
      phase = (phase === "In") ? "Out" : "In";
    }

    t--;
    if(t < 0){
      if(!finished){
        finished = true;
        addXP(cfg.xp);
      }
      txt.textContent = "Done. You just practiced calming your body.";
      ring.textContent = "Nice!";
      overlay.querySelector("#go-restart").style.display = "inline-block";
      GameRT.reset(); // stops the interval cleanly
    }
  };

  tick();
  GameRT.setInterval(tick, 1000);
}

/* =========================================================
   GAME: COPING SORT (stable)
========================================================= */
function startCopingSort(){
  gameMode = "coping-sort";
  gameScore = 0;
  gameRestartFn = startCopingSort;

  openGameOverlay("Coping Sort", "Sort choices: helps now & later vs costs later.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const baseItems = [
    { t:"Take 4 slow breaths", good:true },
    { t:"Drink water", good:true },
    { t:"Text a trusted adult", good:true },
    { t:"Go for a short walk", good:true },
    { t:"Use an exit plan", good:true },
    { t:"Switch to a safer activity", good:true },
    { t:"Keep it secret so nobody knows", good:false },
    { t:"Argue until you win", good:false },
    { t:"Do something risky to escape feelings", good:false },
    { t:"Skip sleep and hope tomorrow works out", good:false },
    { t:"Keep scrolling even though it feels worse", good:false },
    { t:"Ask for support", good:true },
  ];

  const cfg = GAME_CFG.copingsort;
  const rng = mulberry32(5151 + state.xp);
  const items = shuffleInPlace(baseItems.slice(0, cfg.maxItems), rng);

  let i = 0;
  let correct = 0;

  const draw = (msg="") => {
    const cur = items[i];
    if(!cur){
      const xp = cfg.xpBase + correct * cfg.xpPerCorrect;
      addXP(xp);
      area.innerHTML = `
        <p class="big">✅ Finished!</p>
        <p class="muted">Correct: <strong>${correct}</strong> / ${items.length}</p>
        <p class="muted">XP earned: <strong>${xp}</strong></p>
      `;
      overlay.querySelector("#go-restart").style.display = "inline-block";
      return;
    }

    area.innerHTML = `
      <p class="muted" style="margin-top:0;">Item ${i+1} / ${items.length}</p>
      <div class="card" style="background: rgba(255,255,255,0.06);">
        <p style="font-weight:900; margin:0;">${escapeHtml(cur.t)}</p>
      </div>
      <div class="hqRow" style="margin-top:12px;">
        <button class="btn small" id="cs-good" type="button">✅ Helps now & later</button>
        <button class="btn small" id="cs-bad" type="button">⚠️ Costs later</button>
      </div>
      <p class="muted" style="margin-top:10px;">${escapeHtml(msg)}</p>
    `;

    const answer = (val) => {
      const ok = (val === cur.good);
      if(ok){ correct++; gameScore += 6; }
      else{ gameScore = Math.max(0, gameScore - 2); }
      overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
      i++;
      draw(ok ? "Correct ✅" : "Not quite — think “helps tomorrow too?”");
    };

    area.querySelector("#cs-good")?.addEventListener("click", () => answer(true));
    area.querySelector("#cs-bad")?.addEventListener("click", () => answer(false));
  };

  draw("Sort by long-term safety, not just short-term feelings.");
}

/* =========================================================
   GAME: FRIENDSHIP SIGNALS (stable)
========================================================= */
function startFriendshipQuiz(){
  gameMode = "friendship-quiz";
  gameScore = 0;
  gameRestartFn = startFriendshipQuiz;

  openGameOverlay("Friendship Signals", "Spot healthy vs pressure behaviors.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const qs = [
    { q:"A friend respects your ‘no’ the first time.", a:true },
    { q:"A friend says “prove you’re loyal” to push a risky choice.", a:false },
    { q:"A friend helps you leave when a hangout feels unsafe.", a:true },
    { q:"A friend pressures you and says “don’t tell anyone.”", a:false },
    { q:"A friend checks in after a rough day and listens.", a:true },
    { q:"A friend mocks you for protecting sleep or school.", a:false },
    { q:"A friend offers a safer plan when you say no.", a:true },
    { q:"A friend keeps arguing after you set a boundary.", a:false },
  ];

  const cfg = GAME_CFG.friendshipquiz;
  const rng = mulberry32(7878 + state.xp);
  shuffleInPlace(qs, rng);

  let i = 0;
  let correct = 0;

  const draw = (msg="") => {
    const cur = qs[i];
    if(!cur){
      const xp = cfg.xpBase + correct * cfg.xpPerCorrect;
      addXP(xp);
      area.innerHTML = `
        <p class="big">✅ Done!</p>
        <p class="muted">Correct: <strong>${correct}</strong> / ${qs.length}</p>
        <p class="muted">XP earned: <strong>${xp}</strong></p>
      `;
      overlay.querySelector("#go-restart").style.display = "inline-block";
      return;
    }

    area.innerHTML = `
      <p class="muted" style="margin-top:0;">Question ${i+1} / ${qs.length}</p>
      <p style="font-weight:900;">${escapeHtml(cur.q)}</p>
      <div class="hqRow">
        <button class="btn small" id="fq-healthy" type="button">✅ Healthy</button>
        <button class="btn small" id="fq-pressure" type="button">⚠️ Pressure</button>
      </div>
      <p class="muted" style="margin-top:10px;">${escapeHtml(msg)}</p>
    `;

    const answer = (val) => {
      const ok = (val === cur.a);
      if(ok){ correct++; gameScore += 10; }
      else{ gameScore = Math.max(0, gameScore - 4); }
      overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
      i++;
      draw(ok ? "Correct ✅" : "Not quite — pressure ignores boundaries.");
    };

    area.querySelector("#fq-healthy")?.addEventListener("click", () => answer(true));
    area.querySelector("#fq-pressure")?.addEventListener("click", () => answer(false));
  };

  draw();
}

/* =========================================================
   GAME: STRESS LAB (real rising stress loop)
========================================================= */
function startStressLab(){
  gameMode = "stress-lab";
  gameScore = 0;
  gameRestartFn = startStressLab;

  openGameOverlay("Stress Lab", "Stress rises over time. Use tools to keep it low.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const cfg = GAME_CFG.stresslab;
  let stress = cfg.startStress;
  let t = 0;
  let alive = true;

  const draw = (msg="") => {
    area.innerHTML = `
      <p class="muted" style="margin-top:0;">
        Survive <strong>${cfg.durationS}s</strong> while keeping stress under <strong>${cfg.loseAt}</strong>.
        • Time: <strong>${t}s</strong>
      </p>
      <div class="card" style="background: rgba(255,255,255,0.06);">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div><strong>Stress:</strong> ${stress} / 100</div>
          <div><strong>Score:</strong> ${gameScore}</div>
        </div>
        <div style="height:12px; border-radius:999px; background: rgba(255,255,255,0.08); margin-top:10px; overflow:hidden;">
          <div style="height:100%; width:${stress}%; background:${stress<40?"rgba(68,215,182,0.9)":stress<75?"rgba(255,220,90,0.9)":"rgba(255,85,119,0.9)"};"></div>
        </div>
      </div>
      <div class="hqRow" style="margin-top:12px;">
        ${cfg.tools.map((tt,idx)=>`<button class="btn small" data-tool="${idx}" type="button">${escapeHtml(tt.name)}</button>`).join("")}
      </div>
      <p class="muted" style="margin-top:10px;">${escapeHtml(msg)}</p>
    `;

    area.querySelectorAll("[data-tool]").forEach(b => {
      b.addEventListener("click", () => {
        if(!alive) return;
        const tool = cfg.tools[Number(b.getAttribute("data-tool"))];
        stress = clamp(stress + tool.delta, 0, 100);
        gameScore += tool.score;
        overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
        draw(tool.msg);
      });
    });
  };

  const end = (win) => {
    alive = false;
    overlay.querySelector("#go-restart").style.display = "inline-block";
    if(win){
      const xp = 20 + Math.max(0, (cfg.loseAt - stress));
      addXP(xp);
      area.innerHTML += `<p class="big">✅ Lab cleared!</p><p class="muted">XP earned: <strong>${xp}</strong></p>`;
      gameScore += 25;
    }else{
      area.innerHTML += `<p class="big">⚠️ Overloaded</p><p class="muted">Try using tools earlier and more often.</p>`;
      gameScore = Math.max(0, gameScore - 10);
    }
    overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
  };

  draw("Stress rises constantly — stay ahead of it.");

  const loopId = GameRT.setInterval(() => {
    if(!alive) return;

    t++;
    const rise = (t < 15) ? cfg.rise1 : (t < 30) ? cfg.rise2 : cfg.rise3;
    stress = clamp(stress + rise, 0, 100);

    if(stress >= cfg.loseAt) return end(false);
    if(t >= cfg.durationS) return end(true);

    draw();
  }, 1000);

  GameRT.addCleanup(() => { alive = false; GameRT.clearInterval(loopId); });
}

/* =========================================================
   GAME: PRESSURE METER (simple + stable)
========================================================= */
function startPressureMeter(){
  gameMode = "pressuremeter";
  gameScore = 0;
  gameRestartFn = startPressureMeter;

  const cfg = GAME_CFG.pressuremeter;
  openGameOverlay("Pressure Meter", "Use calm + exit moves to keep pressure low.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  let pressure = cfg.start;
  let t = 0;
  let alive = true;

  const draw = (msg="") => {
    area.innerHTML = `
      <p class="muted" style="margin-top:0;">Goal: keep pressure under <strong>${cfg.loseAt}</strong> for ${cfg.durationS} seconds.</p>
      <div class="card" style="background: rgba(255,255,255,0.06);">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap;">
          <div><strong>Time:</strong> ${t}s / ${cfg.durationS}s</div>
          <div><strong>Pressure:</strong> ${pressure}</div>
        </div>
        <div style="height:12px; border-radius:999px; background: rgba(255,255,255,0.08); margin-top:10px; overflow:hidden;">
          <div style="height:100%; width:${pressure}%; background: ${pressure<50 ? "rgba(68,215,182,0.9)" : pressure<cfg.loseAt ? "rgba(255,220,90,0.9)" : "rgba(255,85,119,0.9)"};"></div>
        </div>
      </div>
      <div class="hqRow" style="margin-top:12px;">
        ${cfg.buttons.map(b=>`<button class="btn small" id="${b.id}" type="button">${escapeHtml(b.label)}</button>`).join("")}
      </div>
      <p class="muted" style="margin-top:10px;">${escapeHtml(msg)}</p>
    `;

    cfg.buttons.forEach(b => {
      area.querySelector(`#${b.id}`)?.addEventListener("click", () => {
        if(!alive) return;
        pressure = clamp(pressure + b.delta, 0, 100);
        gameScore += 6;
        overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
        draw(b.msg);
      });
    });
  };

  const end = (win) => {
    alive = false;
    overlay.querySelector("#go-restart").style.display = "inline-block";
    if(win){
      gameScore += 40;
      addXP(cfg.xpWin);
      area.innerHTML += `<p class="big">✅ Nice!</p><p>You kept pressure manageable.</p>`;
    }else{
      area.innerHTML += `<p class="big">⚠️ Oops</p><p class="muted">Pressure got too high. Try using tools earlier.</p>`;
    }
    overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
  };

  draw("Use tools early. Pressure ramps up.");

  const loopId = GameRT.setInterval(() => {
    if(!alive) return;
    t++;
    const rise = (t < 10) ? cfg.riseEarly : (t < 20) ? cfg.riseMid : cfg.riseLate;
    pressure = clamp(pressure + rise, 0, 100);
    if(pressure >= cfg.loseAt) return end(false);
    if(t >= cfg.durationS) return end(true);
    draw();
  }, 1000);

  GameRT.addCleanup(() => { alive = false; GameRT.clearInterval(loopId); });
}

/* =========================================================
   GAME: STREAK RUN (no early click chaos)
========================================================= */
function startStreakRun(){
  gameMode = "streak-run";
  gameScore = 0;
  gameRestartFn = startStreakRun;

  const cfg = GAME_CFG.streakrun;
  openGameOverlay("Streak Run", "Wait for GO! Click fast. Don’t click early.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  let alive = true;
  let round = 0;
  let waiting = true;
  let startAt = 0;

  const confetti = () => {
    const el = document.createElement("div");
    el.style.position = "relative";
    el.style.marginTop = "8px";
    el.innerHTML = "🎉✨🎉✨🎉";
    area.appendChild(el);
    GameRT.setTimeout(() => el.remove(), 700);
  };

  const draw = (stateMsg="", mode="wait") => {
    const color = mode === "go" ? "rgba(68,215,182,0.9)" : mode === "bad" ? "rgba(255,85,119,0.9)" : "rgba(255,220,90,0.9)";
    const label = mode === "go" ? "GO!" : mode === "bad" ? "NO!" : "WAIT…";
    const disabled = (mode !== "go");

    area.innerHTML = `
      <p class="muted" style="margin-top:0;">Round <strong>${round}</strong> / ${cfg.rounds}</p>
      <div class="card" style="background: rgba(255,255,255,0.06); text-align:center;">
        <div style="font-weight:900; font-size:22px; margin:6px 0; color:${color}; text-shadow: 0 0 12px ${color};">
          ${label}
        </div>
        <button class="btn primary" id="sr-btn" type="button" ${disabled ? "disabled" : ""} style="
          font-weight:900;padding:12px 16px;border-radius:14px;
          box-shadow: 0 0 18px rgba(255,255,255,0.10);
          animation: ${mode==="go" ? "pulseGo 0.35s infinite alternate" : "none"};
        ">CLICK</button>
      </div>
      <p class="muted" id="sr-msg" style="margin-top:10px;">${escapeHtml(stateMsg || "Don’t click early.")}</p>
      <style>@keyframes pulseGo { from { transform: scale(1); } to { transform: scale(1.08); } }</style>
    `;

    area.querySelector("#sr-btn")?.addEventListener("click", () => {
      if(!alive) return;

      if(waiting){
        gameScore = Math.max(0, gameScore - 6);
        overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
        draw("Too early 😅", "bad");
        return;
      }

      const rt = Math.max(1, Math.floor(performance.now() - startAt));
      const gain = rt < 220 ? 25 : rt < 350 ? 18 : rt < 520 ? 12 : 7;
      gameScore += gain;
      overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
      confetti();

      waiting = true;
      draw(`Reaction: ${rt}ms (+${gain})`, "wait");
      GameRT.setTimeout(nextRound, 600);
    });
  };

  const nextRound = () => {
    round++;
    if(round > cfg.rounds){
      alive = false;
      const xp = cfg.xpBase + Math.floor(gameScore / cfg.xpScoreDiv);
      addXP(xp);
      area.innerHTML = `
        <p class="big">✅ Done!</p>
        <p class="muted">Final score: <strong>${gameScore}</strong></p>
        <p class="muted">XP earned: <strong>${xp}</strong></p>
      `;
      overlay.querySelector("#go-restart").style.display = "inline-block";
      return;
    }

    waiting = true;
    draw("Wait…", "wait");

    const delay = cfg.waitMinMs + Math.floor(Math.random()*(cfg.waitMaxMs - cfg.waitMinMs));
    GameRT.setTimeout(() => {
      if(!alive) return;
      waiting = false;
      startAt = performance.now();
      draw("GO GO GO!", "go");
    }, delay);
  };

  overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
  nextRound();

  GameRT.addCleanup(() => { alive = false; });
}

/* =========================================================
   GAME: MEMORY MATCH (10 levels, increasing cards)
========================================================= */
function startMemoryMatch(){
  gameMode = "memory";
  gameScore = 0;
  gameRestartFn = startMemoryMatch;

  const cfg = GAME_CFG.memory;
  openGameOverlay("Memory Match", `Beat ${cfg.levels} levels. Cards increase each level.`);

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const symbols = "🍎🍌🍇🍒🍉🍓🍍🥝🍑🍊🍐🍋🍈🍏🥥🥕🌽🍪🧁🍩🍿".split("");
  let level = 1;

  let flipped = [];
  let matched = new Set();
  let cards = [];

  const buildLevel = () => {
    flipped = [];
    matched = new Set();

    const pairs = cfg.startPairs + (level - 1) * cfg.pairsPerLevel;
    const use = symbols.slice(0, Math.min(symbols.length, pairs));
    const rng = mulberry32(3000 + state.xp + level);
    const deck = shuffleInPlace([...use, ...use], rng);

    cards = deck.map((v,i)=>({ id:i, v }));
  };

  const colsForCount = (n) => (n <= 8 ? 4 : n <= 12 ? 4 : n <= 16 ? 4 : 5);

  const render = (msg="") => {
    const open = (id) => flipped.includes(id) || matched.has(id);
    const cols = colsForCount(cards.length);

    area.innerHTML = `
      <p class="muted" style="margin-top:0;">Level <strong>${level}</strong> / ${cfg.levels} • Score: <strong>${gameScore}</strong></p>
      <p class="muted">${escapeHtml(msg)}</p>
      <div class="grid" style="grid-template-columns: repeat(${cols},1fr); gap:8px;">
        ${cards.map(c=>{
          const shown = open(c.id);
          return `<button class="choiceBtn" data-id="${c.id}" ${matched.has(c.id) ? "disabled" : ""} style="text-align:center;">
            <div style="font-size:28px; line-height:1.2;">${shown ? c.v : "❓"}</div>
          </button>`;
        }).join("")}
      </div>
    `;

    area.querySelectorAll("button[data-id]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const id = Number(btn.dataset.id);
        if(matched.has(id)) return;
        if(flipped.includes(id)) return;
        if(flipped.length >= 2) return;

        flipped.push(id);
        render();

        if(flipped.length === 2){
          const [a,b] = flipped;
          const ca = cards[a];
          const cb = cards[b];

          GameRT.setTimeout(()=>{
            if(ca && cb && ca.v === cb.v){
              matched.add(a); matched.add(b);
              gameScore += 12;
              overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
            }else{
              gameScore = Math.max(0, gameScore - 2);
              overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
            }

            flipped = [];

            if(matched.size === cards.length){
              const xp = cfg.xpBase + level * cfg.xpPerLevel;
              addXP(xp);
              level++;
              if(level > cfg.levels){
                area.innerHTML = `
                  <p class="big">🏁 Finished!</p>
                  <p class="muted">You beat all levels.</p>
                  <p class="muted">Final score: <strong>${gameScore}</strong></p>
                `;
                overlay.querySelector("#go-restart").style.display = "inline-block";
                return;
              }
              buildLevel();
              render(`✅ Level cleared! +${xp} XP`);
              return;
            }

            render();
          }, cfg.peekMs);
        }
      });
    });
  };

  buildLevel();
  render("Match pairs. Try to remember positions.");
}

/* =========================================================
   GAME: FOCUS DODGE (bubble spawner, tunable speed)
========================================================= */
function startFocusDodge(){
  gameMode = "focus-dodge";
  gameScore = 0;
  gameRestartFn = startFocusDodge;

  const cfg = GAME_CFG.focusdodge;
  openGameOverlay("Focus Dodge", "Type the key for 🟢 FOCUS bubbles. Avoid 🔴 DISTRACTION bubbles.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  let alive = true;
  let t = cfg.durationS;

  const bubbles = new Map(); // id -> bubble
  let nextId = 1;

  area.innerHTML = `
    <p class="muted" id="fd-top" style="margin-top:0;"></p>
    <div class="bubbleStage" id="fd-stage"></div>
    <p class="muted" id="fd-msg" style="margin-top:10px;"></p>
  `;

  const top = area.querySelector("#fd-top");
  const stage = area.querySelector("#fd-stage");
  const msg = area.querySelector("#fd-msg");

  const updateTop = () => {
    if(top) top.textContent = `Time: ${t}s • Score: ${gameScore}`;
    overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
  };

  const spawn = () => {
    if(!alive || !stage) return;

    const key = cfg.keys[Math.floor(Math.random() * cfg.keys.length)];
    const type = (Math.random() < cfg.focusChance) ? "focus" : "dist";

    const rect = stage.getBoundingClientRect();
    const pad = 90;
    const x = pad + Math.random() * Math.max(10, rect.width - pad*2);
    const y = pad + Math.random() * Math.max(10, rect.height - pad*2);

    const id = nextId++;
    const bornAt = performance.now();

    const el = document.createElement("div");
    el.className = `bubble ${type}`;
    el.dataset.id = String(id);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.innerHTML = `<div class="k">${escapeHtml(key)}</div><div class="t">${type === "focus" ? "FOCUS" : "DISTRACT"}</div>`;
    stage.appendChild(el);

    bubbles.set(id, { id, key, type, bornAt, el });
  };

  const removeBubble = (id) => {
    const b = bubbles.get(id);
    if(!b) return;
    try{ b.el?.remove(); }catch{}
    bubbles.delete(id);
  };

  const onKey = (e) => {
    if(!alive) return;
    const k = String(e.key || "").toUpperCase();
    // find a bubble with that key (prefer newest to feel responsive)
    const list = Array.from(bubbles.values()).filter(b => b.key === k);
    if(!list.length) return;

    list.sort((a,b)=> b.bornAt - a.bornAt);
    const hit = list[0];

    if(hit.type === "focus"){
      gameScore += cfg.scoreFocusHit;
      if(msg) msg.textContent = "✅ Focus hit!";
    }else{
      gameScore = Math.max(0, gameScore + cfg.scoreWrongHit);
      if(msg) msg.textContent = "⚠️ Oops — that was a distraction.";
    }
    removeBubble(hit.id);
    updateTop();
  };

  GameRT.onKey(onKey);

  const step = () => {
    if(!alive) return;

    // expire bubbles
    const now = performance.now();
    for(const b of Array.from(bubbles.values())){
      if(now - b.bornAt >= cfg.bubbleLifeMs){
        // missed focus bubbles penalize slightly
        if(b.type === "focus"){
          gameScore = Math.max(0, gameScore + cfg.scoreMissedFocus);
          if(msg) msg.textContent = "Missed a focus bubble — stay locked in.";
        }
        removeBubble(b.id);
      }
    }

    updateTop();
  };

  // timers
  const spawnId = GameRT.setInterval(spawn, cfg.spawnEveryMs);
  const tickId = GameRT.setInterval(() => {
    if(!alive) return;
    t--;
    if(t <= 0){
      alive = false;
      GameRT.clearInterval(spawnId);
      GameRT.clearInterval(tickId);

      // clear remaining
      for(const id of Array.from(bubbles.keys())) removeBubble(id);

      const xp = cfg.xpBase + Math.floor(gameScore / cfg.xpScoreDiv);
      addXP(xp);

      area.innerHTML = `
        <p class="big">✅ Done!</p>
        <p class="muted">Final score: <strong>${gameScore}</strong></p>
        <p class="muted">XP earned: <strong>${xp}</strong></p>
        <p class="muted">Tip: If it feels too fast, increase <code>spawnEveryMs</code> or <code>bubbleLifeMs</code> in GAME_CFG.focusdodge.</p>
      `;
      overlay.querySelector("#go-restart").style.display = "inline-block";
      return;
    }
    updateTop();
  }, 1000);

  const stepId = GameRT.setInterval(step, 120);

  // initial
  updateTop();
  spawn(); spawn();

  GameRT.addCleanup(() => {
    alive = false;
    GameRT.clearInterval(spawnId);
    GameRT.clearInterval(tickId);
    GameRT.clearInterval(stepId);
    for(const id of Array.from(bubbles.keys())) removeBubble(id);
  });
}

/* =========================================================
   GAME: GOAL BUILDER (more dynamic + tunable)
========================================================= */
function startGoalBuilder(){
  gameMode = "goal-builder";
  gameScore = 0;
  gameRestartFn = startGoalBuilder;

  const cfg = GAME_CFG.goalbuilder;
  openGameOverlay("Goal Builder", "Build a plan fast, while distractions try to derail you.");

  const overlay = overlayEl();
  const area = overlay?.querySelector("#go-content");
  if(!area) return;

  const goals = ["Sleep better", "Less scrolling", "Stop on time (games)", "Handle stress", "Say no to pressure"];
  const steps = ["Set a 10‑minute timer", "4 slow breaths", "Drink water first", "Text support", "5‑minute starter task"];
  const blockers = [
    "You feel bored and want to bail.",
    "A friend messages ‘lol do it’",
    "You think ‘this won’t matter anyway.’",
    "You feel a spike of stress.",
    "Your brain says ‘just one more minute.’",
  ];

  const rng = mulberry32(9001 + state.xp);
  const targetGoal = goals[Math.floor(rng()*goals.length)];
  const targetStep = steps[Math.floor(rng()*steps.length)];

  let pickedGoal = null;
  let pickedStep = null;

  let t = cfg.seconds;
  let alive = true;
  let strikes = 0;
  let interruptions = 0;
  let locked = false;

  const draw = (msg="") => {
    const built = `${pickedGoal ?? "____"} → ${pickedStep ?? "____"}`;

    area.innerHTML = `
      <p class="muted" style="margin-top:0;">
        Time: <strong>${t}s</strong> • Strikes: <strong>${strikes}</strong> • Interrupts: <strong>${interruptions}</strong>
      </p>
      <div class="card" style="background: rgba(255,255,255,0.06);">
        <p class="muted" style="margin:0 0 6px;">Target goal</p>
        <p style="font-weight:900; margin:0;">${escapeHtml(targetGoal)}</p>
      </div>
      <div class="card" style="background: rgba(255,255,255,0.06); margin-top:10px;">
        <p class="muted" style="margin:0 0 6px;">Your plan</p>
        <p style="font-weight:900; font-size:18px; margin:0;">${escapeHtml(built)}</p>
      </div>

      <div style="margin-top:12px; display:grid; gap:10px;">
        <div class="card" style="background: rgba(255,255,255,0.05);">
          <p class="muted" style="margin:0 0 8px;">Pick goal</p>
          ${goals.map((x,i)=>`<button class="choiceBtn" data-g="${i}" type="button" ${locked?"disabled":""}>${escapeHtml(x)}</button>`).join("")}
        </div>
        <div class="card" style="background: rgba(255,255,255,0.05);">
          <p class="muted" style="margin:0 0 8px;">Pick tiny step</p>
          ${steps.map((x,i)=>`<button class="choiceBtn" data-s="${i}" type="button" ${locked?"disabled":""}>${escapeHtml(x)}</button>`).join("")}
        </div>
      </div>

      <div class="actions" style="margin-top:12px;">
        <button class="btn primary" id="gb-submit" type="button" ${(!pickedGoal || !pickedStep || locked) ? "disabled" : ""}>Lock it in</button>
      </div>

      <p class="muted" style="margin-top:10px;">${escapeHtml(msg)}</p>
    `;

    area.querySelectorAll("[data-g]").forEach(b =>
      b.addEventListener("click", () => {
        if(locked) return;
        pickedGoal = goals[Number(b.getAttribute("data-g"))];
        draw();
      })
    );

    area.querySelectorAll("[data-s]").forEach(b =>
      b.addEventListener("click", () => {
        if(locked) return;
        pickedStep = steps[Number(b.getAttribute("data-s"))];
        draw();
      })
    );

    area.querySelector("#gb-submit")?.addEventListener("click", () => {
      if(!alive || locked) return;
      locked = true;
      alive = false;

      const goalOK = pickedGoal === targetGoal;
      const stepOK = pickedStep === targetStep;

      let score = 0;
      score += goalOK ? 45 : 18;
      score += stepOK ? 45 : 18;
      score -= strikes * 8;

      gameScore += Math.max(0, score);
      overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;

      const xp = cfg.xpBase + Math.max(0, Math.floor(gameScore / cfg.xpScoreDiv));
      addXP(xp);

      area.innerHTML += `
        <p class="big">✅ Plan locked</p>
        <p class="muted">Goal match: <strong>${goalOK ? "Yes" : "No"}</strong> • Step match: <strong>${stepOK ? "Yes" : "No"}</strong></p>
        <p class="muted">XP earned: <strong>${xp}</strong></p>
      `;

      overlay.querySelector("#go-restart").style.display = "inline-block";
      GameRT.reset();
    });
  };

  const interrupt = () => {
    if(!alive || locked) return;
    interruptions++;
    const line = blockers[Math.floor(rng()*blockers.length)];

    // player “handles it”: random but weighted toward success
    const stayOnTrack = Math.random() < 0.72;
    if(stayOnTrack){
      gameScore += 8;
      draw(`Distraction: “${line}” → You stay on track. (+8)`);
    }else{
      strikes++;
      gameScore = Math.max(0, gameScore - 6);
      draw(`Distraction: “${line}” → It shook you a bit. (-6)`);
    }
    overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
  };

  draw("Build a plan before time runs out.");

  const loopId = GameRT.setInterval(() => {
    if(!alive) return;
    t--;
    if(t <= 0){
      alive = false;
      overlay.querySelector("#go-restart").style.display = "inline-block";
      area.innerHTML += `<p class="big">⏰ Time!</p><p class="muted">Try again and lock a plan faster.</p>`;
      GameRT.reset();
      return;
    }
    if(t % cfg.interruptEveryS === 0) interrupt();
    draw();
  }, 1000);

  GameRT.addCleanup(() => { alive = false; GameRT.clearInterval(loopId); });
}

/* =========================================================
   GAME: RESPONSE BUILDER (stable + tunable)
========================================================= */
function startResponseBuilder(){
  gameMode = "responsebuilder";
  gameScore = 0;
  gameRestartFn = startResponseBuilder;

  const cfg = GAME_CFG.responsebuilder;
  openGameOverlay("Response Builder", "Build a strong response fast. Keep your combo alive.");

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

  const rng = mulberry32(7777 + state.xp + Math.floor(Math.random()*999));
  const round = sets[Math.floor(rng() * sets.length)];

  let picks = [null,null,null];
  let alive = true;
  let t = cfg.seconds;
  let combo = 0;

  const draw = (msg="") => {
    const built = picks.map((p,i) => (p==null ? "____" : round.parts[i][p])).join(" ");

    area.innerHTML = `
      <p class="muted" style="margin-top:0;">Time: <strong>${t}s</strong> • Combo: <strong>${combo}</strong></p>
      <p style="font-weight:900;">${escapeHtml(round.prompt)}</p>

      <div class="card" style="background: rgba(255,255,255,0.06); margin-top:10px;">
        <p class="muted" style="margin:0 0 8px;">Your response:</p>
        <p style="font-weight:900; font-size:18px; margin:0;">${escapeHtml(built)}</p>
      </div>

      <div style="margin-top:12px;">
        ${round.parts.map((opts, i) => `
          <div class="card" style="margin:10px 0; background: rgba(255,255,255,0.05);">
            <p class="muted" style="margin:0 0 8px;">Pick part ${i+1}</p>
            ${opts.map((tt, oi) => `
              <button class="choiceBtn" data-part="${i}" data-opt="${oi}" type="button">${escapeHtml(tt)}</button>
            `).join("")}
          </div>
        `).join("")}
      </div>

      <div class="actions">
        <button class="btn primary" id="rb-submit" type="button" ${picks.some(p=>p==null) ? "disabled" : ""}>Submit</button>
      </div>

      <p class="muted" id="rb-msg" style="margin-top:10px;">${escapeHtml(msg)}</p>
    `;

    area.querySelectorAll("button[data-part]").forEach(btn => {
      btn.addEventListener("click", () => {
        const part = Number(btn.getAttribute("data-part"));
        const opt  = Number(btn.getAttribute("data-opt"));
        picks[part] = opt;
        draw();
      });
    });

    area.querySelector("#rb-submit")?.addEventListener("click", () => {
      if(!alive) return;

      const ok = picks.every((p,i) => p === round.best[i]);
      if(ok){
        combo++;
        const timeBonus = Math.max(0, t);
        const gain = cfg.scoreGood + combo*cfg.comboBonus + Math.floor(timeBonus/3);
        gameScore += gain;
        addXP(cfg.xpBase + Math.min(18, combo*2));
        area.querySelector("#rb-msg").textContent = `✅ Strong. +${gain} score (time bonus!)`;
        overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
        overlay.querySelector("#go-restart").style.display = "inline-block";
      }else{
        combo = 0;
        gameScore = Math.max(0, gameScore + cfg.scoreBad);
        area.querySelector("#rb-msg").textContent = "Almost. Make it clearer: ‘No’ + reason + switch.";
        overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
      }
    });
  };

  draw("Build it fast and clean.");

  const loopId = GameRT.setInterval(() => {
    if(!alive) return;
    t--;
    if(t <= 0){
      alive = false;
      area.innerHTML += `<p class="big">⏰ Time!</p><p class="muted">Restart to try for a combo.</p>`;
      overlay.querySelector("#go-restart").style.display = "inline-block";
      GameRT.reset();
      return;
    }
    draw();
  }, 1000);

  GameRT.addCleanup(() => { alive = false; GameRT.clearInterval(loopId); });
}



/* =========================================================
   HABIT QUEST SAVE SLOTS
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
   HABIT QUEST — RUNTIME HELPERS (state lives in app.js)
   (habitquest.js provides: window.HQ.getNode / listNodeIds)
========================================================= */
function getLastLessonTitle(){
  const day = safeNum(state.habitQuest.lastLessonDay, 0);
  if(day <= 0) return "";
  const track = state.selectedTrack || "general";
  const list = (LESSONS_BY_TRACK[track] || LESSONS_BY_TRACK.general) || [];
  const l = list.find(x => x.day === day);
  return l ? l.title : "";
}

function hqCtx(){
  const avatarDataURL = getSelectedAvatarDataURL();
  const usingCustom = !!avatarDataURL;
  const emoji = (!usingCustom && !isCustomAvatarRef(state.avatar)) ? (state.avatar || "🙂") : "🙂";

  const nextDay = clamp(safeNum(state.habitQuest.lastLessonDay, 0) + 1, 1, 60);

  return {
    // generator/hub needs these:
    track: state.selectedTrack || "general",
    hqDay: nextDay,
    difficulty: safeNum(state.habitQuest.difficulty, 0),

    // UI needs these:
    avatarIsCustom: usingCustom,
    avatarImg: avatarDataURL,
    avatarEmoji: emoji,
    name: state.profileName || "Player",
    completed: state.completedDays.length,
    lastLessonTitle: getLastLessonTitle(),
    tokens: safeNum(state.habitQuest.tokens, 0),
    flags: state.habitQuest.flags || {},
  };
}


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

function hqApplyEffects(eff){
  const e = eff || {};
  if(e.hearts) state.habitQuest.hearts = clamp(safeNum(state.habitQuest.hearts,3) + safeNum(e.hearts,0), 0, 5);
  if(e.wisdom) state.habitQuest.wisdom = Math.max(0, safeNum(state.habitQuest.wisdom,0) + safeNum(e.wisdom,0));
  if(e.tokens) state.habitQuest.tokens = Math.max(0, safeNum(state.habitQuest.tokens,0) + safeNum(e.tokens,0));
  if(e.flag && typeof e.flag === "object"){
    const k = safeStr(e.flag.key, "");
    if(k) hqSetFlag(k, e.flag.value);
  }
    // ✅ allow HQ nodes to advance the "day"
  if(Number.isFinite(Number(e.setLastLessonDay))){
    const d = Math.max(0, Number(e.setLastLessonDay));
    state.habitQuest.lastLessonDay = Math.max(
      Math.max(0, safeNum(state.habitQuest.lastLessonDay, 0)),
      d
    );
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
  const node = window.HQ.getNode(nodeId, ctx);
  area.querySelector("#hq-read")?.addEventListener("click", () => hqReadAloud(node, ctx));

  hqMarkVisited(nodeId);
  saveState();

  const slotSummary = (slot, idx) => {
    if(!slot || !slot.data) return `Slot ${idx+1}: (empty)`;
    const label = slot.label ? `“${escapeHtml(slot.label)}”` : "(no name)";
    const when = slot.savedISO ? escapeHtml(slot.savedISO) : "—";
    const nid = escapeHtml(slot.data.nodeId || "hq_start");
    return `Slot ${idx+1}: ${label} • ${when} • @ ${nid}`;
  };

  area.innerHTML = `
    <div class="hqRow">
      <div class="hqChip">
        <button class="btn small" id="hq-read" type="button">🔊 Read Aloud</button>
      </div>

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
      ${[0,1,2].map(i => `
        <div class="hqSlotCard">
          <div class="muted" style="font-weight:900;">${i===0 ? "Save Slots" : "&nbsp;"}</div>
          <div class="muted" style="margin-top:6px;">${slotSummary(state.habitQuestSlots[i], i)}</div>
          <div class="actions" style="margin-top:8px;">
            <button class="btn small" type="button" data-save="${i}">Save</button>
            <button class="btn small" type="button" data-load="${i}">Load</button>
            <button class="btn small danger" type="button" data-clear="${i}">Clear</button>
          </div>
        </div>
      `).join("")}
    </div>

    <div class="divider"></div>
    <p id="hq-node-text" style="font-weight:900; font-size:18px; margin-top:10px;"></p>
    <div id="hq-choices"></div>
    <p class="muted" id="hq-why" style="margin-top:12px;"></p>
  `;

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

function hqReadAloud(node, ctx){
  if(!("speechSynthesis" in window)) return alert("Read aloud not supported in this browser.");

  // stop anything currently speaking
  window.speechSynthesis.cancel();

  const parts = [];
  parts.push(String(node?.chapter || "Habit Quest"));
  parts.push(String(node?.text ? node.text(ctx) : ""));
  const choices = Array.isArray(node?.choices) ? node.choices : [];
  if(choices.length){
    parts.push("Choices:");
    choices.forEach((c,i)=> parts.push(`Option ${i+1}: ${c.text}`));
  }

  const utter = new SpeechSynthesisUtterance(parts.join(". "));
  utter.rate = 1.0;
  utter.pitch = 1.0;
  utter.volume = 1.0;
  window.speechSynthesis.speak(utter);
}


/* =========================================================
   STORY MAP VIEW (simple)
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
  const ids = window.HQ?.listNodeIds ? window.HQ.listNodeIds() : [];
  const nodes = ids.map((id) => {
    const node = window.HQ.getNode(id, hqCtx());
    return {
      id,
      chapter: safeStr(node.chapter, ""),
      visited: !!visited[id],
      outs: nodeOutgoing(node),
    };
  });



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
          ${nodes.map(n => `
            <tr>
              <td><code style="color:rgba(255,255,255,0.9)">${escapeHtml(n.id)}</code></td>
              <td>${escapeHtml(n.chapter || "—")}</td>
              <td>
                ${n.visited ? `<span class="mapPill ok">✅ visited</span>` : `<span class="mapPill no">⬜ not yet</span>`}
              </td>
              <td>
                ${n.outs.length ? n.outs.map(o => `<span class="mapPill">${escapeHtml(o)}</span>`).join(" ") : `<span class="muted">—</span>`}
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;

  wrap.querySelector("#btn-map-open-hq")?.addEventListener("click", () => startHabitQuest());
  wrap.querySelector("#btn-map-jump")?.addEventListener("click", () => {
    const id = prompt("Jump to which nodeId? (example: hq_start)")?.trim();
    if(!id) return;
    const ok =
      id === "hq_start" ||
      id === "hq_daily_hub" ||
      id === "hq_jump_day" ||
      /^hq_day_(\d+)(?:_(a|b|c|end|event))?$/.test(id);

    if(!ok) return alert("Unknown nodeId. Try hq_start or hq_day_12");
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
   PROFILE: AVATARS + UPLOAD + DELETE
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
  input.value = name;

  const title = $("#profile-title");
  if(title) title.textContent = `${name} 👤`;

  const wrapRef = document.getElementById("profile-reflections");
  if(wrapRef){
    const entries = Object.entries(state.reflections || {})
      .sort((a,b)=> Number(b[0]) - Number(a[0]));
    if(!entries.length){
      wrapRef.innerHTML = `<p class="muted">No reflections yet.</p>`;
    }else{
      wrapRef.innerHTML = entries.slice(0, 14).map(([day, v])=>`
        <div class="card" style="background: rgba(255,255,255,0.05); margin-top:10px;">
          <div style="display:flex; justify-content:space-between; gap:10px;">
            <strong>Day ${escapeHtml(day)}</strong>
            <span class="muted">${escapeHtml(v.savedISO || "")}</span>
          </div>
          <div style="white-space:pre-wrap; margin-top:8px;">${escapeHtml(v.text || "")}</div>
        </div>
      `).join("");
    }
  }

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

  renderAvatars();

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
  renderProgressChart();
}

function buildProgressReportData(){
  // Group completedDays by track
  const completed = (state.completedDays || []).map(k => {
    const [track, dayStr] = String(k).split(":");
    return { track, day: Number(dayStr) };
  }).filter(x => x.track && Number.isFinite(x.day));

  // Mistakes grouped by lesson
  const mistakes = Object.values(state.mistakes || {}).map(m => ({
    track: m.track,
    day: m.day,
    q: m.q,
    options: m.options,
    answerIndex: m.answer,
    wrongCount: m.wrongCount,
    lastWrongISO: m.lastWrongISO,
    firstWrongISO: m.firstWrongISO
  }));

  // Reflections by day
  const reflections = Object.entries(state.reflections || {}).map(([day, r]) => ({
    day: Number(day),
    text: r?.text || "",
    savedISO: r?.savedISO || ""
  })).sort((a,b)=>a.day-b.day);

  return {
    generatedISO: isoDate(new Date()),
    profileName: state.profileName,
    selectedTrack: state.selectedTrack,
    xp: state.xp,
    level: state.level,
    streak: state.streak,
    lastCompletedISO: state.lastCompletedISO,
    ratings: state.ratings,
    completedDays: completed,
    quizAttempts: state.quizAttempts || {},
    mistakes,
    reflections
  };
}

function downloadJSON(filename, obj){
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type:"application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  gsetTimeout(()=>URL.revokeObjectURL(a.href), 500);
}

function openPrintableReport(){
  const data = buildProgressReportData();

  const byTrack = {};
  data.completedDays.forEach(x => {
    byTrack[x.track] = byTrack[x.track] || [];
    byTrack[x.track].push(x.day);
  });

  const w = window.open("", "_blank");
  if(!w) return alert("Popup blocked—allow popups to generate the report.");

  const esc = (s)=> String(s||"").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");

  w.document.write(`
<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Progress Report</title>
<style>
  body{ font-family: system-ui, -apple-system, Segoe UI, Roboto; padding:24px; color:#111; }
  h1{ margin:0 0 6px; }
  .muted{ color:#555; }
  .card{ border:1px solid #ddd; border-radius:12px; padding:14px; margin:12px 0; }
  table{ width:100%; border-collapse:collapse; }
  th,td{ text-align:left; padding:8px; border-bottom:1px solid #eee; vertical-align:top; }
  code{ background:#f3f3f3; padding:2px 6px; border-radius:6px; }
  @media print { button{ display:none; } }
</style>
</head>
<body>
  <h1>Progress Report</h1>
  <div class="muted">Generated: ${esc(data.generatedISO)}</div>

  <div class="card">
    <h2>Summary</h2>
    <p><strong>Name:</strong> ${esc(data.profileName)}<br/>
       <strong>Track:</strong> ${esc(data.selectedTrack)}<br/>
       <strong>XP / Level:</strong> ${esc(data.xp)} / ${esc(data.level)}<br/>
       <strong>Streak:</strong> ${esc(data.streak)} day(s)<br/>
       <strong>Last completed:</strong> ${esc(data.lastCompletedISO || "—")}
    </p>
    <p><strong>Rating:</strong> ${data.ratings?.count ? (data.ratings.total/data.ratings.count).toFixed(1) : "—"}
       (${esc(data.ratings?.count || 0)} rating(s))</p>
    <button onclick="window.print()">Print / Save as PDF</button>
    <button onclick="window.opener && window.opener.downloadJSON('progress_report_${esc(data.generatedISO)}.json', ${JSON.stringify(data).replaceAll("</","<\\/")})">Download JSON</button>
  </div>

  <div class="card">
    <h2>Lessons Completed</h2>
    ${Object.keys(byTrack).length ? Object.entries(byTrack).map(([t,days])=>`
      <p><strong>${esc(t)}</strong>: ${esc(days.sort((a,b)=>a-b).join(", "))}</p>
    `).join("") : `<p class="muted">None yet.</p>`}
  </div>

  <div class="card">
    <h2>Quiz Attempts</h2>
    <table>
      <thead><tr><th>Lesson</th><th>Attempts</th><th>Total Wrong</th><th>Last</th></tr></thead>
      <tbody>
        ${Object.entries(data.quizAttempts||{}).map(([k,v])=>`
          <tr>
            <td><code>${esc(k)}</code></td>
            <td>${esc(v.attempts||0)}</td>
            <td>${esc(v.wrongTotal||0)}</td>
            <td>${esc(v.lastISO||"—")}</td>
          </tr>
        `).join("") || `<tr><td colspan="4" class="muted">No attempts recorded.</td></tr>`}
      </tbody>
    </table>
  </div>

  <div class="card">
    <h2>Mistakes Bank</h2>
    ${data.mistakes.length ? data.mistakes.map(m=>`
      <p><strong>${esc(m.track)} Day ${esc(m.day)}</strong> (missed ${esc(m.wrongCount)}x, last ${esc(m.lastWrongISO||"—")})<br/>
      Q: ${esc(m.q)}</p>
    `).join("") : `<p class="muted">No mistakes saved.</p>`}
  </div>

  <div class="card">
    <h2>Reflections</h2>
    ${data.reflections.length ? data.reflections.map(r=>`
      <p><strong>Day ${esc(r.day)}</strong> <span class="muted">(${esc(r.savedISO||"—")})</span><br/>
      ${esc(r.text)}</p>
    `).join("") : `<p class="muted">No reflections saved.</p>`}
  </div>
</body>
</html>
  `);

  w.document.close();
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
   PROGRESS
========================================================= */
function renderProgress(){
  $("#completed-count") && ($("#completed-count").textContent = String(state.completedDays.length));
  $("#highscore")       && ($("#highscore").textContent = String(state.highScore));
  $("#streak-text-2")   && ($("#streak-text-2").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`);

  const list = $("#completed-list");
  if(!list) return;
  list.innerHTML = "";

  const items = [...state.completedDays]
    .map(k => {
      const [track, dayStr] = String(k).split(":");
      const day = Number(dayStr);
      return { key:k, track, day: Number.isFinite(day) ? day : 0 };
    })
    .sort((a,b) => (a.track.localeCompare(b.track) || a.day - b.day));

  if(items.length === 0){
    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = "No lessons completed yet — start with Today’s Lesson!";
    list.appendChild(p);
    return;
  }

  items.forEach(it => {
    const chip = document.createElement("div");
    chip.className = "chip";
    const trackName = TRACKS?.[it.track]?.name || it.track;
    chip.textContent = `${trackName} • Day ${it.day} ✅`;
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
  document.getElementById("btn-progress-report")?.addEventListener("click", openPrintableReport);

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

  $("#btn-start-review")?.addEventListener("click", () => {
  buildMistakeReviewQueue({ max: 10 });
  showView("lesson");
  });

  
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