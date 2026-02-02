/* How to Avoid Addiction — V2 (no frameworks)
   Runs as a static site. Saves progress in localStorage (on this device).
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE_KEY = "htaa_v2_state";

/* -----------------------------
   CONTENT
--------------------------------*/

// Tips
const TIPS = [
  "When you’re unsure, pause and ask: “Is this safe for my brain and body?”",
  "Pick a trusted adult now—so you know who to talk to later.",
  "Sleep + food + water make your brain stronger.",
  "Real friends respect your ‘no’.",
  "Stress is a signal, not a boss. You can handle it."
];

// Choice Quest scenarios
const GAME_SCENARIOS = [
  {
    prompt: "A friend says: “Try this, everyone’s doing it.” What’s the best response?",
    choices: [
      { text: "“No. I’m not into that. Let’s do something else.”", good: true, why: "Clear no + switch." },
      { text: "“Maybe later, don’t tell anyone.”", good: false, why: "That keeps risk open." },
      { text: "“Okay, so you like me.”", good: false, why: "Pressure isn’t friendship." }
    ]
  },
  {
    prompt: "You’re stressed after school. What’s a healthy first move?",
    choices: [
      { text: "Take 4 deep breaths and drink water.", good: true, why: "Calms your body fast." },
      { text: "Do something risky to forget it.", good: false, why: "Risky escapes can cause bigger problems." },
      { text: "Hold it in forever.", good: false, why: "Talking helps." }
    ]
  },
  {
    prompt: "Someone jokes about you for saying no. Best move?",
    choices: [
      { text: "Stay calm, repeat ‘No’, and step away.", good: true, why: "You protect yourself." },
      { text: "Prove yourself by saying yes.", good: false, why: "That’s how pressure wins." },
      { text: "Start a fight.", good: false, why: "Fighting can make things worse." }
    ]
  }
];

// Badges unlock by XP (XP never decreases)
const BADGES = [
  { id: "starter-star", name: "Starter Star", xpRequired: 50, icon: "⭐" },
  { id: "calm-master", name: "Calm Master", xpRequired: 120, icon: "🫧" },
  { id: "quiz-whiz", name: "Quiz Whiz", xpRequired: 200, icon: "🧠" },
  { id: "streak-hero", name: "Streak Hero", xpRequired: 350, icon: "🔥" },
  { id: "game-champ", name: "Game Champ", xpRequired: 500, icon: "🏆" },
];

// Games catalog (tiles render in #games-grid)
const GAMES = [
  { id:"choicequest", title:"Choice Quest", desc:"Pick the healthiest choice in quick scenarios.", status:"ready", unlock:{ type:"free" } },
  { id:"breathing", title:"Breathing Buddy", desc:"60-second calm timer that earns XP.", status:"ready", unlock:{ type:"free" } },

  // Coming soon placeholders (unlock rules still show)
  { id:"memory", title:"Memory Match", desc:"Match healthy coping tools.", status:"soon", unlock:{ type:"xp", xp:120 } },
  { id:"coping-sort", title:"Coping Sort", desc:"Sort coping tools into ‘healthy’ vs ‘not helpful’.", status:"soon", unlock:{ type:"lessons", lessons:3 } },
  { id:"streak-run", title:"Streak Run", desc:"Quick reaction game to keep your streak alive.", status:"soon", unlock:{ type:"level", level:3 } },
  { id:"focus-dodge", title:"Focus Dodge", desc:"Avoid distractions; build focus.", status:"soon", unlock:{ type:"level", level:4 } },
  { id:"goal-builder", title:"Goal Builder", desc:"Pick goals + tiny steps to reach them.", status:"soon", unlock:{ type:"xp", xp:350 } },
  { id:"friendship-quiz", title:"Friendship Signals", desc:"Spot healthy vs unhealthy friend behaviors.", status:"soon", unlock:{ type:"lessons", lessons:7 } },
  { id:"stress-lab", title:"Stress Lab", desc:"Try safe stress tools and see what works.", status:"soon", unlock:{ type:"xp", xp:600 } }
];

// 30 lesson curriculum
const CURRICULUM = [
  { title:"Choices & Your Future", goal:"Learn how small choices add up over time." },
  { title:"Handling Stress Safely", goal:"Build safe, healthy stress tools." },
  { title:"Saying No With Confidence", goal:"Practice refusing pressure calmly." },
  { title:"Friend Pressure vs Real Friends", goal:"Spot healthy friendships." },
  { title:"Boredom Without Risk", goal:"Make a fun plan that’s safe." },
  { title:"Feelings Are Signals", goal:"Name feelings and respond wisely." },
  { title:"Big Emotions Plan", goal:"Use a 3-step plan when emotions spike." },
  { title:"Asking for Help", goal:"Know who to talk to and how to ask." },
  { title:"Online Influence", goal:"Handle trends, dares, and social pressure." },
  { title:"Confidence & Self-Respect", goal:"Build self-respect so pressure loses power." },

  { title:"Healthy Coping Tools", goal:"Choose coping tools that help long-term." },
  { title:"Sleep, Food, Water = Brain Fuel", goal:"Build habits that protect your brain." },
  { title:"Stress + School", goal:"Use safe tools before stress stacks up." },
  { title:"Goals & Tiny Steps", goal:"Make goals and track small wins." },
  { title:"Mistakes & Comebacks", goal:"Recover from mistakes without shame." },
  { title:"Problem Solving", goal:"Use a simple method to solve problems." },
  { title:"Positive Routines", goal:"Build routines that make life easier." },
  { title:"Boundaries", goal:"Protect your time, body, and mind." },
  { title:"Handling Conflict", goal:"Stay calm and communicate respectfully." },
  { title:"Trusted Adults", goal:"Build your support team." },

  { title:"Curiosity vs Risk", goal:"Learn to be curious safely." },
  { title:"Celebrating Safely", goal:"Have fun without risky choices." },
  { title:"Helping a Friend", goal:"What to do if a friend is struggling." },
  { title:"Self-Talk", goal:"Use kinder thoughts to make better choices." },
  { title:"Dealing With Anger", goal:"Cool down without hurting anyone." },
  { title:"Dealing With Anxiety", goal:"Use grounding + breathing tools." },
  { title:"Building Confidence Skills", goal:"Practice skills that grow confidence." },
  { title:"Being a Leader", goal:"Help others make safe choices too." },
  { title:"Your Personal Safety Plan", goal:"Make a simple plan for tough moments." },
  { title:"Review & Next Steps", goal:"Lock in what you learned and keep going." },
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
  title: c.title,
  goal: c.goal,
  content: makeLessonContent(c.title, c.goal),
  quiz: make12QuestionQuiz(c.title)
}));

/* -----------------------------
   STATE (fixes NaN + old saves)
--------------------------------*/

const DEFAULT_STATE = {
  currentLessonIndex: 0,
  completedDays: [],
  lastCompletedISO: null,
  streak: 0,
  highScore: 0,

  xp: 0,
  level: 1,
  profileName: "Odin Garrett",
  ownedBadges: [],
  ratings: { total: 0, count: 0 }
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
    }
  };

  merged.xp = Number(merged.xp);
  if(!Number.isFinite(merged.xp)) merged.xp = 0;

  merged.level = Number(merged.level);
  if(!Number.isFinite(merged.level)) merged.level = 1;

  merged.highScore = Number(merged.highScore);
  if(!Number.isFinite(merged.highScore)) merged.highScore = 0;

  merged.streak = Number(merged.streak);
  if(!Number.isFinite(merged.streak)) merged.streak = 0;

  return merged;
}

let state = normalizeState(loadState());
saveState();

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* -----------------------------
   XP / LEVEL
--------------------------------*/

function recalcLevel(){
  const xp = Number(state.xp);
  state.xp = Number.isFinite(xp) ? xp : 0;
  state.level = 1 + Math.floor(state.xp / 200);
}

function addXP(amount, reason=""){
  const a = Number(amount);
  if(!Number.isFinite(a) || a <= 0) return;

  state.xp = Number(state.xp) + a;
  recalcLevel();
  saveState();

  updateHomeStats();
  renderProgress();
  renderProfile();
  renderShop();
  renderRate();
  renderGamesCatalog();
}

/* -----------------------------
   NAVIGATION
--------------------------------*/

function showView(name){
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(`#view-${name}`)?.classList.remove("hidden");

  $$(".tab").forEach(t => t.classList.remove("active"));
  $(`.tab[data-view="${name}"]`)?.classList.add("active");

  if(name === "lesson") renderLesson();
  if(name === "games") renderGamesCatalog();
  if(name === "progress") renderProgress();
  if(name === "profile") renderProfile();
  if(name === "shop") renderShop();
  if(name === "rate") renderRate();
}

function bindNav(){
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => showView(btn.dataset.view));
  });

  $("#btn-open-lesson")?.addEventListener("click", () => showView("lesson"));
  $("#btn-open-rate")?.addEventListener("click", () => showView("rate"));
  $("#btn-start-lesson")?.addEventListener("click", () => showView("lesson"));
  $("#btn-start-game")?.addEventListener("click", () => showView("games"));
}

/* -----------------------------
   TIPS
--------------------------------*/

function randomTip(){
  const tip = TIPS[Math.floor(Math.random()*TIPS.length)];
  $("#tip-text").textContent = tip;
}

/* -----------------------------
   LESSONS + QUIZ
--------------------------------*/

function renderLesson(){
  const idx = clamp(state.currentLessonIndex, 0, LESSONS.length - 1);
  const lesson = LESSONS[idx];

  $("#lesson-title").textContent = lesson.title;
  $("#lesson-day").textContent = `Day ${lesson.day}`;
  $("#lesson-goal").textContent = `Goal: ${lesson.goal}`;

  const body = $("#lesson-content");
  body.innerHTML = "";
  lesson.content.forEach((p) => {
    const el = document.createElement("p");
    el.textContent = p;
    body.appendChild(el);
  });

  renderQuiz(lesson);
  updateLessonStatus();
}

function renderQuiz(lesson){
  const quiz = $("#quiz");
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

      label.appendChild(input);
      label.appendChild(span);
      block.appendChild(label);
    });

    quiz.appendChild(block);
  });
}

function quizScoreForCurrentLesson(){
  const idx = clamp(state.currentLessonIndex, 0, LESSONS.length - 1);
  const lesson = LESSONS[idx];

  let correct = 0;
  lesson.quiz.forEach((item, qi) => {
    const picked = document.querySelector(`input[name="q_${qi}"]:checked`);
    if(picked && Number(picked.value) === item.answer) correct++;
  });

  return { correct, total: lesson.quiz.length };
}

function updateLessonStatus(){
  const idx = clamp(state.currentLessonIndex, 0, LESSONS.length - 1);
  const day = LESSONS[idx].day;
  const done = state.completedDays.includes(day);

  $("#lesson-status").textContent = done
    ? "✅ You already completed this lesson!"
    : "Not completed yet — answer all questions correctly, then click “Mark Lesson Complete”.";
}

function bindLessonButtons(){
  $("#btn-prev-lesson")?.addEventListener("click", () => {
    state.currentLessonIndex = clamp(state.currentLessonIndex - 1, 0, LESSONS.length - 1);
    saveState();
    renderLesson();
  });

  $("#btn-next-lesson")?.addEventListener("click", () => {
    state.currentLessonIndex = clamp(state.currentLessonIndex + 1, 0, LESSONS.length - 1);
    saveState();
    renderLesson();
  });

  $("#btn-complete-lesson")?.addEventListener("click", () => {
    const idx = clamp(state.currentLessonIndex, 0, LESSONS.length - 1);
    const day = LESSONS[idx].day;

    const score = quizScoreForCurrentLesson();

    if(score.correct < score.total){
      $("#lesson-status").textContent =
        `Almost! Quiz score: ${score.correct}/${score.total}. Answer all correctly to complete.`;
      return;
    }

    // XP for perfect quiz + lesson completion (first time only)
    const firstTime = !state.completedDays.includes(day);
    if(firstTime){
      addXP(score.total * 5, "Perfect quiz");
      state.completedDays.push(day);
      addXP(50, "Lesson complete");
    }

    // streak logic
    const todayISO = isoDate(new Date());
    if(state.lastCompletedISO !== todayISO){
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = isoDate(yesterday);

      if(state.lastCompletedISO === yesterdayISO){
        state.streak += 1;
      } else {
        state.streak = 1;
      }
      state.lastCompletedISO = todayISO;
    }

    saveState();
    updateHomeStats();
    updateLessonStatus();
  });
}

/* -----------------------------
   HOME STATS
--------------------------------*/

function updateHomeStats(){
  $("#streak-text").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
  $("#streak-text-2").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
}

/* -----------------------------
   GAMES (catalog + playable)
--------------------------------*/

let gameMode = null;
let gameIndex = 0;
let gameScore = 0;

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

    const top = document.createElement("div");
    top.className = "gameTileTop";

    const tag1 = document.createElement("span");
    tag1.className = "tag " + (unlocked ? "good" : "lock");
    tag1.textContent = unlocked ? "Unlocked ✅" : "Locked 🔒";

    const tag2 = document.createElement("span");
    tag2.className = "tag " + (game.status === "ready" ? "good" : "soon");
    tag2.textContent = (game.status === "ready") ? "Playable" : "Coming soon";

    top.appendChild(tag1);
    top.appendChild(tag2);

    const h = document.createElement("h3");
    h.textContent = game.title;

    const p = document.createElement("p");
    p.className = "muted";
    p.textContent = game.desc;

    const p2 = document.createElement("p");
    p2.className = "muted";
    p2.textContent = reason;

    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.textContent = (game.status === "ready") ? "Play" : "Locked / Soon";

    if(!unlocked || game.status !== "ready"){
      btn.classList.add("disabled");
      btn.disabled = true;
    } else {
      btn.addEventListener("click", () => launchGame(game.id));
    }

    card.appendChild(top);
    card.appendChild(h);
    card.appendChild(p);
    card.appendChild(p2);
    card.appendChild(btn);

    grid.appendChild(card);
  });
}

function openGameArea(title){
  $("#game-area").classList.remove("hidden");
  $("#game-title").textContent = title;
  $("#game-score").textContent = `Score: ${gameScore}`;
  $("#btn-restart-game").classList.add("hidden");
}

function closeGameArea(){
  $("#game-area").classList.add("hidden");
  $("#game-content").innerHTML = "";
  gameMode = null;
}

function bindGameShellButtons(){
  $("#btn-exit-game")?.addEventListener("click", () => closeGameArea());
  $("#btn-restart-game")?.addEventListener("click", () => {
    if(gameMode === "choicequest") startChoiceQuest();
    if(gameMode === "breathing") startBreathing();
  });
}

function launchGame(id){
  if(id === "choicequest") return startChoiceQuest();
  if(id === "breathing") return startBreathing();
  alert("This game is coming soon. Keep earning XP to unlock more!");
}

function startChoiceQuest(){
  gameMode = "choicequest";
  gameIndex = 0;
  gameScore = 0;
  openGameArea("Choice Quest");
  renderChoiceQuest();
}

function renderChoiceQuest(){
  const area = $("#game-content");
  area.innerHTML = "";

  const scenario = GAME_SCENARIOS[gameIndex];
  if(!scenario){
    area.innerHTML = `
      <p class="big">🎉 Nice!</p>
      <p>You finished Choice Quest.</p>
      <p class="muted">Final score: <strong>${gameScore}</strong></p>
    `;
    $("#btn-restart-game").classList.remove("hidden");

    if(gameScore > state.highScore){
      state.highScore = gameScore;
      saveState();
    }

    addXP(25, "Choice Quest finished");
    renderProgress();
    return;
  }

  const p = document.createElement("p");
  p.style.fontWeight = "900";
  p.textContent = scenario.prompt;
  area.appendChild(p);

  scenario.choices.forEach((c) => {
    const btn = document.createElement("div");
    btn.className = "choice";
    btn.textContent = c.text;

    btn.addEventListener("click", () => {
      $$(".choice").forEach(x => x.style.pointerEvents = "none");

      if(c.good){
        btn.classList.add("correct");
        gameScore += 10;
      } else {
        btn.classList.add("wrong");
        gameScore = Math.max(0, gameScore - 3);
      }

      $("#game-score").textContent = `Score: ${gameScore}`;

      const why = document.createElement("p");
      why.className = "muted";
      why.style.marginTop = "10px";
      why.textContent = c.why;
      area.appendChild(why);

      const next = document.createElement("button");
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

function startBreathing(){
  gameMode = "breathing";
  openGameArea("Breathing Buddy");

  const area = $("#game-content");
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

  const tick = () => {
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
      clearInterval(id);
      ring.textContent = "Nice!";
      timerText.textContent = "Done. You just practiced calming your body.";
      if(!finished){
        finished = true;
        addXP(10, "Breathing complete");
      }
      $("#btn-restart-game").classList.remove("hidden");
      return;
    }
  };

  tick();
  const id = setInterval(tick, 1000);
}

/* -----------------------------
   PROFILE / SHOP
--------------------------------*/

function renderProfile(){
  if(!$("#profile-name")) return;

  $("#profile-name").textContent = state.profileName || "Player";
  $("#profile-xp").textContent = String(state.xp);
  $("#profile-level").textContent = String(state.level);

  // auto-unlock badges based on XP
  const unlockedIds = BADGES.filter(b => state.xp >= b.xpRequired).map(b => b.id);
  const merged = new Set([...(state.ownedBadges || []), ...unlockedIds]);
  state.ownedBadges = Array.from(merged);
  saveState();

  const wrap = $("#owned-badges");
  const empty = $("#owned-badges-empty");
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
  if(!$("#shop-grid")) return;

  const grid = $("#shop-grid");
  grid.innerHTML = "";

  BADGES.forEach(b => {
    const unlocked = state.xp >= b.xpRequired;

    const card = document.createElement("div");
    card.className = "card shopCard" + (unlocked ? "" : " locked");
    card.innerHTML = `
      <div class="shopBadge">${b.icon}</div>
      <h3>${b.name}</h3>
      <p class="muted">${unlocked ? "Unlocked ✅" : `Locked 🔒 (needs ${b.xpRequired} XP)`}</p>
    `;
    grid.appendChild(card);
  });
}

/* -----------------------------
   RATE (clickable stars)
--------------------------------*/

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

    state.ratings.total += stars;
    state.ratings.count += 1;
    saveState();

    $("#rating-thanks").textContent = "Thanks for rating! ⭐";
    renderRate();
  });
}

function renderRate(){
  if(!$("#rating-average")) return;

  const r = state.ratings || { total:0, count:0 };
  const total = Number(r.total);
  const count = Number(r.count);
  const avg = (count > 0) ? (total / count) : null;

  $("#rating-average").textContent = avg ? avg.toFixed(1) + " / 5" : "—";
  $("#rating-count").textContent = count === 0 ? "No ratings yet" : `${count} rating${count===1?"":"s"}`;
}

/* -----------------------------
   PROGRESS
--------------------------------*/

function renderProgress(){
  $("#completed-count").textContent = String(state.completedDays.length);
  $("#highscore").textContent = String(state.highScore);
  $("#streak-text-2").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;

  const list = $("#completed-list");
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
  });
}

/* -----------------------------
   HELPERS
--------------------------------*/

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

function isoDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

/* -----------------------------
   INIT (bind everything once)
--------------------------------*/

function init(){
  $("#year").textContent = new Date().getFullYear();

  recalcLevel();

  bindNav();
  bindLessonButtons();
  bindGameShellButtons();
  bindReset();
  bindRatingStarsOnce();

  $("#btn-new-tip")?.addEventListener("click", randomTip);
  randomTip();

  renderLesson();
  renderProgress();
  renderProfile();
  renderShop();
  renderRate();
  renderGamesCatalog();
}

init();
