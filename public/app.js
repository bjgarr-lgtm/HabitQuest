/* How to Avoid Addiction — V2 (no frameworks)
   Runs as a static site. Saves progress in localStorage (on this device).
   NOTE: app.js must contain ONLY JavaScript (no HTML at the bottom).
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE_KEY = "htaa_v2_state";

/* =========================================================
   HELPERS
========================================================= */
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

function escapeHtml(s){
  return String(s)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* =========================================================
   CONTENT
========================================================= */

// Tips
const TIPS = [
  "When you’re unsure, pause and ask: “Is this safe for my brain and body?”",
  "Pick a trusted adult now—so you know who to talk to later.",
  "Sleep + food + water make your brain stronger.",
  "Real friends respect your ‘no’.",
  "Stress is a signal, not a boss. You can handle it.",
  "If something feels risky, ask: “Will this help Future Me?”",
];

// Choice Quest scenarios (short)
const GAME_SCENARIOS = [
  {
    prompt: "A friend says: “Try this, everyone’s doing it.” What’s the best response?",
    choices: [
      { text: "“No. I’m not into that. Let’s do something else.”", good: true,  why: "Clear no + switch." },
      { text: "“Maybe later, don’t tell anyone.”",                  good: false, why: "That keeps risk open." },
      { text: "“Okay, so you like me.”",                            good: false, why: "Pressure isn’t friendship." }
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

// 25+ badges (XP based)
const BADGES = [
  { id:"starter-star",    name:"Starter Star",    xpRequired: 50,   icon:"⭐" },
  { id:"calm-master",     name:"Calm Master",     xpRequired: 120,  icon:"🫧" },
  { id:"quiz-whiz",       name:"Quiz Whiz",       xpRequired: 200,  icon:"🧠" },
  { id:"streak-hero",     name:"Streak Hero",     xpRequired: 350,  icon:"🔥" },
  { id:"game-champ",      name:"Game Champ",      xpRequired: 500,  icon:"🏆" },

  { id:"daily-doer",      name:"Daily Doer",      xpRequired: 650,  icon:"📅" },
  { id:"focus-falcon",    name:"Focus Falcon",    xpRequired: 800,  icon:"🦅" },
  { id:"kind-mind",       name:"Kind Mind",       xpRequired: 950,  icon:"💛" },
  { id:"stress-tamer",    name:"Stress Tamer",    xpRequired: 1100, icon:"🧯" },
  { id:"brave-voice",     name:"Brave Voice",     xpRequired: 1250, icon:"🗣️" },

  { id:"steady-steps",    name:"Steady Steps",    xpRequired: 1400, icon:"👟" },
  { id:"boundary-boss",   name:"Boundary Boss",   xpRequired: 1600, icon:"🛡️" },
  { id:"help-seeker",     name:"Help Seeker",     xpRequired: 1800, icon:"🤝" },
  { id:"sleep-guardian",  name:"Sleep Guardian",  xpRequired: 2000, icon:"🌙" },
  { id:"hydration-hero",  name:"Hydration Hero",  xpRequired: 2200, icon:"💧" },

  { id:"streak-7",        name:"7‑Day Streak",    xpRequired: 2400, icon:"7️⃣" },
  { id:"streak-14",       name:"14‑Day Streak",   xpRequired: 2700, icon:"1️⃣4️⃣" },
  { id:"streak-30",       name:"30‑Day Streak",   xpRequired: 3200, icon:"3️⃣0️⃣" },

  { id:"lesson-10",       name:"10 Lessons",      xpRequired: 3500, icon:"📘" },
  { id:"lesson-20",       name:"20 Lessons",      xpRequired: 4000, icon:"📗" },
  { id:"lesson-30",       name:"30 Lessons",      xpRequired: 4600, icon:"📙" },

  { id:"game-grinder",    name:"Game Grinder",    xpRequired: 5200, icon:"🎮" },
  { id:"calm-pro",        name:"Calm Pro",        xpRequired: 6000, icon:"🧘" },
  { id:"level-10",        name:"Level 10",        xpRequired: 6800, icon:"🔟" },
  { id:"legend",          name:"Legend",          xpRequired: 8000, icon:"👑" },

  // extra fun ones
  { id:"gentle-giant",    name:"Gentle Giant",    xpRequired: 9000, icon:"🐘" },
  { id:"super-helper",    name:"Super Helper",    xpRequired: 10000,icon:"🦸" },
  { id:"wise-owl",        name:"Wise Owl",        xpRequired: 12000,icon:"🦉" },
];

// Avatars
const AVATARS = ["🦊","🐼","🐸","🦁","🐨","🐯","🐧","🐙","🦄","🐲"];

// Tracks (for filtering lessons)
const TRACKS = {
  general:    { name:"General",                 desc:"Healthy choices, stress tools, confidence, asking for help." },
  nicotine:   { name:"Nicotine / Vaping",       desc:"Cravings, pressure, coping skills, and refusing offers." },
  alcohol:    { name:"Alcohol",                 desc:"Safer choices, boundaries, and handling social pressure." },
  gaming:     { name:"Gaming / Screen habits",  desc:"Balance, routines, and stopping when you planned to stop." },
  socialmedia:{ name:"Social media / Scrolling",desc:"Dopamine loops, focus, and healthier habits." },
  caffeine:   { name:"Caffeine / Energy drinks",desc:"Sleep/energy basics and alternatives to overstimulation." },
};

// 30 lesson curriculum (includes track tags)
const CURRICULUM = [
  { title:"Choices & Your Future",              goal:"Learn how small choices add up over time.",               track:"general" },
  { title:"Handling Stress Safely",             goal:"Build safe, healthy stress tools.",                       track:"general" },
  { title:"Saying No With Confidence",          goal:"Practice refusing pressure calmly.",                      track:"general" },
  { title:"Friend Pressure vs Real Friends",    goal:"Spot healthy friendships.",                               track:"general" },
  { title:"Boredom Without Risk",               goal:"Make a fun plan that’s safe.",                            track:"general" },
  { title:"Feelings Are Signals",               goal:"Name feelings and respond wisely.",                       track:"general" },
  { title:"Big Emotions Plan",                  goal:"Use a 3-step plan when emotions spike.",                  track:"general" },
  { title:"Asking for Help",                    goal:"Know who to talk to and how to ask.",                     track:"general" },
  { title:"Online Influence",                   goal:"Handle trends, dares, and social pressure.",              track:"socialmedia" },
  { title:"Confidence & Self-Respect",          goal:"Build self-respect so pressure loses power.",             track:"general" },

  { title:"Healthy Coping Tools",               goal:"Choose coping tools that help long-term.",                track:"general" },
  { title:"Sleep, Food, Water = Brain Fuel",    goal:"Build habits that protect your brain.",                   track:"caffeine" },
  { title:"Stress + School",                    goal:"Use safe tools before stress stacks up.",                 track:"general" },
  { title:"Goals & Tiny Steps",                 goal:"Make goals and track small wins.",                        track:"general" },
  { title:"Mistakes & Comebacks",               goal:"Recover from mistakes without shame.",                    track:"general" },
  { title:"Problem Solving",                    goal:"Use a simple method to solve problems.",                  track:"general" },
  { title:"Positive Routines",                  goal:"Build routines that make life easier.",                   track:"gaming" },
  { title:"Boundaries",                         goal:"Protect your time, body, and mind.",                      track:"general" },
  { title:"Handling Conflict",                  goal:"Stay calm and communicate respectfully.",                 track:"general" },
  { title:"Trusted Adults",                     goal:"Build your support team.",                                track:"general" },

  { title:"Cravings & Urges Plan",              goal:"Make a plan for urges so they pass safely.",              track:"nicotine" },
  { title:"Refusing Offers (Practice)",         goal:"Use a confident script and exit plan.",                   track:"nicotine" },
  { title:"Parties & Social Pressure",          goal:"Make choices when others are pushing you.",               track:"alcohol" },
  { title:"Helping a Friend",                   goal:"What to do if a friend is struggling.",                   track:"general" },
  { title:"Self-Talk",                          goal:"Use kinder thoughts to make better choices.",             track:"general" },
  { title:"Dealing With Anger",                 goal:"Cool down without hurting anyone.",                       track:"general" },
  { title:"Dealing With Anxiety",               goal:"Use grounding + breathing tools.",                        track:"general" },
  { title:"Building Confidence Skills",         goal:"Practice skills that grow confidence.",                   track:"general" },
  { title:"Being a Leader",                     goal:"Help others make safe choices too.",                      track:"general" },
  { title:"Review & Next Steps",                goal:"Lock in what you learned and keep going.",                track:"general" },
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

function make12QuestionQuiz(title){
  const q = (question, options, answer) => ({ q: question, options, answer });
  return [
    q(`The main goal of today’s lesson (“${title}”) is to…`, ["Make safe choices", "Hide problems", "Take bigger risks"], 0),
    q("When you feel pressured, a good first step is…", ["Pause and think", "Say yes immediately", "Do it secretly"], 0),
    q("A healthy coping tool is usually…", ["Safe and helpful long-term", "Risky but exciting", "Always expensive"], 0),
    q("If you’re stressed, a smart choice is to…", ["Use a calming tool", "Hold it in forever", "Make a risky choice"], 0),
    q("A strong ‘No’ should be…", ["Clear and calm", "Mean and loud", "Impossible to say"], 0),
    q("A trusted adult could be…", ["A parent/guardian, teacher, coach", "Only strangers online", "Nobody"], 0),
    q("Good friends will…", ["Respect your boundaries", "Force you to prove yourself", "Laugh when you’re uncomfortable"], 0),
    q("If you make a mistake, the best move is…", ["Learn and try again", "Give up forever", "Blame everyone"], 0),
    q("One way to handle big feelings is…", ["Breathe slowly", "Break something", "Start a fight"], 0),
    q("A safe plan includes…", ["Healthy options you can actually do", "Only secret risky options", "No help from anyone"], 0),
    q("The app rewards progress with…", ["XP and unlocks", "Ads and paywalls", "Nothing"], 0),
    q("Finishing lessons helps you…", ["Build skills over time", "Lose skills over time", "Forget everything"], 0),
  ];
}

const LESSONS = CURRICULUM.map((c, i) => ({
  day: i + 1,
  track: c.track || "general",
  title: c.title,
  goal: c.goal,
  content: makeLessonContent(c.title, c.goal),
  quiz: make12QuestionQuiz(c.title)
}));

// Games catalog (tiles render in #games-grid)
const GAMES = [
  { id:"choicequest", title:"Choice Quest",    desc:"Quick practice: pick the healthiest choice.",              status:"ready", unlock:{ type:"free" } },
  { id:"breathing",   title:"Breathing Buddy", desc:"60‑second calm timer that earns XP.",                       status:"ready", unlock:{ type:"free" } },

  // NEW: bigger, story-based game
  { id:"habitquest",  title:"Habit Quest",     desc:"Story adventure: your avatar makes choices + learns skills.",status:"ready", unlock:{ type:"lessons", lessons:1 } },

  // Coming soon placeholders
  { id:"memory",          title:"Memory Match",        desc:"Match healthy coping tools.",                        status:"soon", unlock:{ type:"xp",     xp:120 } },
  { id:"coping-sort",     title:"Coping Sort",         desc:"Sort coping tools into helpful vs not helpful.",     status:"soon", unlock:{ type:"lessons",lessons:3 } },
  { id:"streak-run",      title:"Streak Run",          desc:"Quick reaction game to keep your streak alive.",     status:"soon", unlock:{ type:"level",  level:3 } },
  { id:"focus-dodge",     title:"Focus Dodge",         desc:"Avoid distractions; build focus.",                   status:"soon", unlock:{ type:"level",  level:4 } },
  { id:"goal-builder",    title:"Goal Builder",        desc:"Pick goals + tiny steps to reach them.",             status:"soon", unlock:{ type:"xp",     xp:350 } },
  { id:"friendship-quiz", title:"Friendship Signals",  desc:"Spot healthy vs unhealthy friend behaviors.",        status:"soon", unlock:{ type:"lessons",lessons:7 } },
  { id:"stress-lab",      title:"Stress Lab",          desc:"Try safe stress tools and see what works.",          status:"soon", unlock:{ type:"xp",     xp:600 } },
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

  selectedTrack: "general",

  xp: 0,
  level: 1,

  profileName: "Odin Garrett",
  avatar: AVATARS[0],

  ownedBadges: [],
  ratings: { total: 0, count: 0 },

  // Habit Quest (story)
  habitQuest: {
    chapter: 0,
    scene: 0,
    hearts: 3,
    wisdom: 0,
    tokens: 0,      // earned by completing lessons
    lastLessonDay: 0
  }
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

  merged.selectedTrack = TRACKS[merged.selectedTrack] ? merged.selectedTrack : "general";
  merged.avatar = AVATARS.includes(merged.avatar) ? merged.avatar : AVATARS[0];

  merged.xp = safeNum(merged.xp, 0);
  merged.level = safeNum(merged.level, 1);
  merged.highScore = safeNum(merged.highScore, 0);
  merged.streak = safeNum(merged.streak, 0);
  merged.currentLessonIndex = safeNum(merged.currentLessonIndex, 0);

  merged.habitQuest.chapter = safeNum(merged.habitQuest.chapter, 0);
  merged.habitQuest.scene   = safeNum(merged.habitQuest.scene, 0);
  merged.habitQuest.hearts  = clamp(safeNum(merged.habitQuest.hearts, 3), 0, 5);
  merged.habitQuest.wisdom  = safeNum(merged.habitQuest.wisdom, 0);
  merged.habitQuest.tokens  = safeNum(merged.habitQuest.tokens, 0);
  merged.habitQuest.lastLessonDay = safeNum(merged.habitQuest.lastLessonDay, 0);

  return merged;
}

let state = normalizeState(loadState());
saveState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =========================================================
   TRACKS (FILTERED LESSONS)
========================================================= */
function getActiveLessons(){
  const t = state.selectedTrack || "general";
  if(t === "general") return LESSONS;

  // show track lessons + general support lessons
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
  $$(".tab").forEach(btn => btn.addEventListener("click", () => showView(btn.dataset.view)));

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
  el.textContent = TIPS[Math.floor(Math.random()*TIPS.length)];
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

    const q = document.createElement("p");
    q.style.fontWeight = "800";
    q.textContent = `${qi+1}. ${item.q}`;
    block.appendChild(q);

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
      // XP: quiz + lesson
      addXP(score.total * 5); // 5 XP per question
      state.completedDays.push(score.day);
      saveState();
      addXP(50);

      // Habit Quest: earn 1 token for finishing a lesson (used in story)
      state.habitQuest.tokens = safeNum(state.habitQuest.tokens,0) + 1;
      state.habitQuest.lastLessonDay = score.day;
      saveState();
    }

    // streak logic
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
   GAMES: FULLSCREEN OVERLAY (NO SCROLL)
========================================================= */
let gameMode = null;
let gameIndex = 0;
let gameScore = 0;
let breathingTimerId = null;

function ensureGameOverlay(){
  if($("#game-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "game-overlay";
  overlay.className = "gameOverlay hidden";
  overlay.innerHTML = `
    <div class="gameOverlayInner">
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
        <button class="btn primary hidden" id="go-restart" type="button">Restart</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  // minimal styling injected (so it works even if CSS is missing)
  const style = document.createElement("style");
  style.textContent = `
    .gameOverlay.hidden{ display:none; }
    .gameOverlay{
      position:fixed; inset:0; z-index:9999;
      background: rgba(0,0,0,0.70);
      backdrop-filter: blur(8px);
      padding: 14px;
      overflow:auto;
    }
    .gameOverlayInner{
      max-width: 900px;
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
      cursor:pointer;
      margin-top: 10px;
    }
    .choiceBtn:hover{ background: rgba(255,255,255,0.10); }
    .choiceGood{ border-color: rgba(80,220,140,0.6); }
    .choiceBad{ border-color: rgba(255,120,120,0.6); }
    .hqRow{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 10px; }
    .hqChip{
      padding: 6px 10px;
      border-radius: 999px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(255,255,255,0.14);
    }
  `;
  document.head.appendChild(style);

  // bind overlay buttons once
  $("#go-exit")?.addEventListener("click", closeGameOverlay);
  $("#go-restart")?.addEventListener("click", () => {
    if(gameMode === "choicequest") startChoiceQuest();
    if(gameMode === "breathing") startBreathing();
    if(gameMode === "habitquest") startHabitQuest();
  });
}

function openGameOverlay(title, subtitle=""){
  ensureGameOverlay();
  $("#game-overlay")?.classList.remove("hidden");
  $("#go-title") && ($("#go-title").textContent = title);
  $("#go-sub") && ($("#go-sub").textContent = subtitle);
  $("#go-score") && ($("#go-score").textContent = `Score: ${gameScore}`);
  $("#go-restart")?.classList.add("hidden");
  document.body.style.overflow = "hidden";
}

function closeGameOverlay(){
  $("#game-overlay")?.classList.add("hidden");
  const c = $("#go-content");
  if(c) c.innerHTML = "";
  gameMode = null;

  if(breathingTimerId){
    clearInterval(breathingTimerId);
    breathingTimerId = null;
  }
  document.body.style.overflow = "";
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
    } else {
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
  const area = $("#go-content");
  if(!area) return;
  area.innerHTML = "";

  const scenario = GAME_SCENARIOS[gameIndex];
  if(!scenario){
    area.innerHTML = `
      <p class="big">🎉 Nice!</p>
      <p>You finished Choice Quest.</p>
      <p class="muted">Final score: <strong>${gameScore}</strong></p>
    `;
    $("#go-restart")?.classList.remove("hidden");

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
      } else {
        btn.classList.add("choiceBad");
        gameScore = Math.max(0, gameScore - 3);
      }

      $("#go-score") && ($("#go-score").textContent = `Score: ${gameScore}`);

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
  const area = $("#go-content");
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
      $("#go-restart")?.classList.remove("hidden");
    }
  }, 1000);
}

/* =========================================================
   GAME: HABIT QUEST (STORY / TURN-BASED)
========================================================= */

// A kid-friendly story system:
// - You have an avatar (emoji)
// - Scenes have text + choices
// - Choices can give wisdom, cost a heart, give XP, and can require a token (earned by lessons)
// - "Lesson integration": uses last completed lesson title/day in a few lines
const HQ = {
  chapters: [
    {
      name: "Chapter 1: The First Steps",
      scenes: [
        {
          text: (ctx) => `You (${ctx.avatar}) arrive at Sunny Town. A friend says, “Want to do something risky to feel cool?”`,
          choices: [
            { text:"Say no calmly and suggest a safe activity.", good:true,  effects:{ wisdom:+1, xp:+15 }, why:"Clear no + switch." },
            { text:"Say yes to fit in.",                         good:false, effects:{ hearts:-1, xp:+0 },  why:"Fitting in isn’t worth it." },
            { text:"Walk away and find a trusted adult.",        good:true,  effects:{ wisdom:+1, xp:+10 }, why:"Asking for help is strong." },
          ]
        },
        {
          text: (ctx) => `A mentor character appears: “When you feel pressure, try: Pause → No → Switch.” They ask: “Want to practice?”`,
          choices: [
            { text:"Practice the 3‑step ‘No’ out loud.", good:true, effects:{ wisdom:+1, xp:+12 }, why:"Practice makes real life easier." },
            { text:"Ignore them and scroll forever.",     good:false,effects:{ hearts:-1, xp:+0 },  why:"Escapes can become habits." },
          ]
        },
        {
          text: (ctx) => {
            const last = ctx.lastLessonTitle ? `You remember your last lesson: “${ctx.lastLessonTitle}.”` : "You remember: small choices add up.";
            return `${last} A kid nearby looks stressed. What do you do?`;
          },
          choices: [
            { text:"Offer a simple calm tool: 4 slow breaths together.", good:true, effects:{ wisdom:+1, xp:+10 }, why:"Calm tools help fast." },
            { text:"Tell them to ‘just deal with it’ and leave.",         good:false,effects:{ hearts:-1, xp:+0 },  why:"Kindness matters." },
            { text:"Help them find a trusted adult.",                     good:true, effects:{ wisdom:+1, xp:+10 }, why:"Support is powerful." },
          ]
        },
        {
          text: (ctx) => `Gatekeeper: “To enter the next area, you need a Lesson Token.” (You earn tokens by completing lessons.)`,
          choices: [
            { text:"Use 1 token to open the gate.", require:{ token:1 }, good:true, effects:{ tokens:-1, xp:+20 }, why:"Nice! You used your lesson power." },
            { text:"Come back later after finishing a lesson.",          good:true, effects:{ xp:+0 },             why:"Finish a lesson to earn a token." , end:true },
          ]
        }
      ]
    },
    {
      name: "Chapter 2: The Focus Forest",
      scenes: [
        {
          text: (ctx) => `In Focus Forest, a character offers “instant fun” that could become a bad habit. What’s your move?`,
          choices: [
            { text:"Pause and ask: “Will this help Future Me?”", good:true, effects:{ wisdom:+1, xp:+15 }, why:"That question protects you." },
            { text:"Do it without thinking.",                     good:false,effects:{ hearts:-1, xp:+0 },  why:"Pausing is your superpower." },
          ]
        },
        {
          text: (ctx) => `You find a “Routine Builder” sign: “Tiny steps beat giant promises.” Pick your tiny step.`,
          choices: [
            { text:"Drink water + snack (brain fuel).", good:true, effects:{ wisdom:+1, xp:+10 }, why:"Brain fuel helps choices." },
            { text:"2 minutes tidy reset.",             good:true, effects:{ wisdom:+1, xp:+10 }, why:"Small wins add up." },
            { text:"1 helpful thought about yourself.", good:true, effects:{ wisdom:+1, xp:+10 }, why:"Kind self-talk matters." },
          ]
        },
        {
          text: (ctx) => `Boss moment: a crowd pressures you. Your avatar ${ctx.avatar} takes a deep breath…`,
          choices: [
            { text:"Say: “No thanks. I’m heading out.”", good:true, effects:{ wisdom:+1, xp:+20 }, why:"Clear + calm + exit." },
            { text:"Say yes so nobody laughs.",          good:false,effects:{ hearts:-1, xp:+0 },  why:"A real friend won’t demand proof." },
          ]
        }
      ]
    }
  ]
};

function getLastLessonTitle(){
  const day = safeNum(state.habitQuest.lastLessonDay, 0);
  if(day <= 0) return "";
  const l = LESSONS.find(x => x.day === day);
  return l ? l.title : "";
}

function hqCtx(){
  return {
    avatar: state.avatar || "🙂",
    name: state.profileName || "Player",
    lastLessonTitle: getLastLessonTitle()
  };
}

function startHabitQuest(){
  gameMode = "habitquest";
  gameScore = 0;

  openGameOverlay("Habit Quest", "Story adventure: make choices, learn skills, earn XP.");
  renderHabitQuest();
}

function renderHabitQuest(){
  const area = $("#go-content");
  if(!area) return;

  const ch = clamp(safeNum(state.habitQuest.chapter,0), 0, HQ.chapters.length - 1);
  const chapter = HQ.chapters[ch];
  const sc = clamp(safeNum(state.habitQuest.scene,0), 0, chapter.scenes.length - 1);
  const scene = chapter.scenes[sc];

  // header stats
  const hearts = clamp(safeNum(state.habitQuest.hearts,3), 0, 5);
  const wisdom = safeNum(state.habitQuest.wisdom,0);
  const tokens = safeNum(state.habitQuest.tokens,0);

  const ctx = hqCtx();

  area.innerHTML = `
    <div class="hqRow">
      <div class="hqChip">📖 ${escapeHtml(chapter.name)}</div>
      <div class="hqChip">❤️ Hearts: <strong>${hearts}</strong></div>
      <div class="hqChip">🧠 Wisdom: <strong>${wisdom}</strong></div>
      <div class="hqChip">🪙 Tokens: <strong>${tokens}</strong></div>
      <div class="hqChip">${escapeHtml(ctx.avatar)} You</div>
    </div>

    <div class="divider"></div>

    <p style="font-weight:900; font-size:18px; margin-top:10px;">Scene ${sc+1}</p>
    <p>${escapeHtml(scene.text(ctx))}</p>
    <div id="hq-choices"></div>
    <p class="muted" id="hq-why" style="margin-top:12px;"></p>
  `;

  const wrap = $("#hq-choices");
  const whyEl = $("#hq-why");
  if(!wrap) return;

  // if hearts are 0, game over screen
  if(hearts <= 0){
    area.innerHTML = `
      <p class="big">😵 Oops!</p>
      <p>You ran out of hearts.</p>
      <p class="muted">Good news: you can restart and practice better choices.</p>
    `;
    $("#go-restart")?.classList.remove("hidden");

    // reset for restart next time
    state.habitQuest.hearts = 3;
    state.habitQuest.wisdom = 0;
    state.habitQuest.tokens = safeNum(state.habitQuest.tokens,0); // keep tokens
    state.habitQuest.chapter = 0;
    state.habitQuest.scene = 0;
    saveState();
    return;
  }

  scene.choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "choiceBtn";
    btn.textContent = choice.text;

    // require token?
    const needTok = choice.require?.token ? safeNum(choice.require.token,0) : 0;
    if(needTok > 0 && tokens < needTok){
      btn.disabled = true;
      btn.classList.add("disabled");
      btn.textContent = `${choice.text} (needs ${needTok} token)`;
    }

    btn.addEventListener("click", () => {
      // lock buttons
      $$(".choiceBtn").forEach(x => x.disabled = true);

      // show why
      if(whyEl) whyEl.textContent = choice.why ? choice.why : "";

      // apply effects
      const eff = choice.effects || {};
      if(eff.hearts) state.habitQuest.hearts = clamp(safeNum(state.habitQuest.hearts,3) + safeNum(eff.hearts,0), 0, 5);
      if(eff.wisdom) state.habitQuest.wisdom = safeNum(state.habitQuest.wisdom,0) + safeNum(eff.wisdom,0);
      if(eff.tokens) state.habitQuest.tokens = Math.max(0, safeNum(state.habitQuest.tokens,0) + safeNum(eff.tokens,0));
      saveState();

      // xp
      if(eff.xp && safeNum(eff.xp,0) > 0) addXP(eff.xp);

      // small score feedback
      if(choice.good) gameScore += 10; else gameScore = Math.max(0, gameScore - 3);
      $("#go-score") && ($("#go-score").textContent = `Score: ${gameScore}`);

      // next button
      const next = document.createElement("button");
      next.type = "button";
      next.className = "btn primary";
      next.style.marginTop = "12px";
      next.textContent = choice.end ? "Exit" : "Continue";
      next.addEventListener("click", () => {
        if(choice.end){
          closeGameOverlay();
          return;
        }

        // advance scene/chapter
        const newCh = safeNum(state.habitQuest.chapter,0);
        const newSc = safeNum(state.habitQuest.scene,0) + 1;

        if(newSc >= chapter.scenes.length){
          // chapter completed
          state.habitQuest.chapter = clamp(newCh + 1, 0, HQ.chapters.length - 1);
          state.habitQuest.scene = 0;

          // chapter reward
          addXP(40);
          state.habitQuest.wisdom = safeNum(state.habitQuest.wisdom,0) + 1;
          saveState();

          // if finished final chapter
          if(newCh + 1 >= HQ.chapters.length){
            renderHabitQuestWin();
            return;
          }
        } else {
          state.habitQuest.scene = newSc;
          saveState();
        }

        renderHabitQuest();
      });
      $("#go-content")?.appendChild(next);
    });

    wrap.appendChild(btn);
  });

  $("#go-restart")?.classList.remove("hidden");
}

function renderHabitQuestWin(){
  const area = $("#go-content");
  if(!area) return;

  area.innerHTML = `
    <p class="big">🏁 You finished Habit Quest (for now)!</p>
    <p>You made lots of strong choices. Your avatar ${escapeHtml(state.avatar)} is getting wiser.</p>
    <p class="muted">We can add more chapters next.</p>
  `;
  $("#go-restart")?.classList.remove("hidden");

  // reset story position but keep rewards
  state.habitQuest.chapter = 0;
  state.habitQuest.scene = 0;
  state.habitQuest.hearts = 3;
  saveState();
}

/* =========================================================
   PROFILE / SHOP
========================================================= */
function renderAvatars(){
  const grid = $("#avatar-grid");
  if(!grid) return;
  grid.innerHTML = "";

  AVATARS.forEach(a => {
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.type = "button";
    chip.textContent = a;

    if(state.avatar === a) chip.style.outline = "2px solid rgba(255,255,255,0.6)";

    chip.addEventListener("click", () => {
      state.avatar = a;
      saveState();
      renderAvatars();
      renderProfile();
    });

    grid.appendChild(chip);
  });
}

function renderProfile(){
  if(!$("#profile-name")) return;

  renderAvatars();

  $("#profile-name").textContent = `${state.avatar || "🙂"} ${state.profileName || "Player"}`;
  $("#profile-xp").textContent = String(state.xp);
  $("#profile-level").textContent = String(state.level);

  // auto-unlock badges
  const unlockedIds = BADGES.filter(b => state.xp >= b.xpRequired).map(b => b.id);
  state.ownedBadges = Array.from(new Set([...(state.ownedBadges||[]), ...unlockedIds]));
  saveState();

  const wrap = $("#owned-badges");
  const empty = $("#owned-badges-empty");
  if(!wrap || !empty) return;

  wrap.innerHTML = "";
  if(state.ownedBadges.length === 0){
    empty.textContent = "No badges yet — earn XP to unlock some!";
    return;
  }
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

function renderShop(){
  const grid = $("#shop-grid");
  if(!grid) return;

  grid.innerHTML = "";
  BADGES.forEach(b => {
    const unlocked = state.xp >= b.xpRequired;
    const card = document.createElement("div");
    card.className = "card shopCard" + (unlocked ? "" : " locked");
    card.innerHTML = `
      <div class="shopBadge">${b.icon}</div>
      <h3>${escapeHtml(b.name)}</h3>
      <p class="muted">${unlocked ? "Unlocked ✅" : `Locked 🔒 (needs ${b.xpRequired} XP)`}</p>
    `;
    grid.appendChild(card);
  });
}

/* =========================================================
   RATE (clickable stars)
========================================================= */
function bindRatingStarsOnce(){
  if(window.__starsBound) return;
  window.__starsBound = true;

  const wrap = document.getElementById("stars");
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
  $("#highscore") && ($("#highscore").textContent = String(state.highScore));
  $("#streak-text-2") && ($("#streak-text-2").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`);

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
  $("#year") && ($("#year").textContent = new Date().getFullYear());

  recalcLevel();
  saveState();

  bindNav();
  bindTracks();
  bindLessonButtons();
  bindReset();
  bindRatingStarsOnce();

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

  // Make sure overlay exists (so first game opens instantly)
  ensureGameOverlay();
}

init();
