/* How to Avoid Addiction — V1 (no frameworks)
   Saves progress in localStorage (on this device).
*/

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const STORAGE_KEY = "htaa_v1_state";

const LESSONS = [
  {
    day: 1,
    title: "Choices & Your Future",
    goal: "Learn how small choices add up over time.",
    content: [
      "Every day you make choices—what you watch, who you hang out with, what you do when you’re bored or stressed.",
      "Addiction can start when someone uses something (or does something) to escape feelings again and again.",
      "Your superpower is learning healthier ways to handle feelings and pressure.",
      "Try this: If something feels risky, pause and ask: “Will this help Future Me?”",
      "Healthy choices can be fun, too: music, sports, art, gaming with friends, walking, talking to someone you trust."
    ],
    quiz: [
      {
        q: "A good first step when you feel pressured is…",
        options: ["Do it fast so no one notices", "Pause and think", "Laugh at everyone"],
        answer: 1
      },
      {
        q: "Addiction often starts when someone…",
        options: ["Practices piano", "Uses something to escape feelings repeatedly", "Drinks water"],
        answer: 1
      },
      {
        q: "A healthy question to ask is…",
        options: ["Will this help Future Me?", "How can I hide this?", "Is this the fastest way?"],
        answer: 0
      }
    ]
  },
  {
    day: 2,
    title: "Handling Stress in Healthy Ways",
    goal: "Build a quick plan for stress that doesn’t harm you.",
    content: [
      "Stress happens to everyone—school, friends, family, sports, social media.",
      "When stress is big, your brain wants a quick escape. Some escapes can be harmful.",
      "Healthy stress tools: breathing, stretching, talking, journaling, a short walk, cold water on your face, listening to music.",
      "Make a ‘3‑Tool Plan’: Pick three healthy things you can do when stressed.",
      "Example: 1) 4 deep breaths 2) text a trusted adult 3) play a calming game for 10 minutes."
    ],
    quiz: [
      {
        q: "Stress tools should be…",
        options: ["Helpful and safe", "Secret and risky", "Always expensive"],
        answer: 0
      },
      {
        q: "A ‘3‑Tool Plan’ means…",
        options: ["Three ways to cheat", "Three healthy ways to cope", "Three ways to argue"],
        answer: 1
      },
      {
        q: "When stress is big, a good first move is…",
        options: ["Breathe slowly", "Ignore everyone forever", "Break something"],
        answer: 0
      }
    ]
  },
  {
    day: 3,
    title: "Saying No With Confidence",
    goal: "Practice a simple, strong way to refuse pressure.",
    content: [
      "Sometimes people pressure others to do risky stuff to seem cool.",
      "You don’t owe anyone a ‘yes’ to your body or brain.",
      "Try the 3‑Step ‘No’:",
      "1) Say it clearly: “No.”",
      "2) Give a short reason (optional): “I’m not into that.”",
      "3) Switch: “Let’s do something else.” or “I’m heading out.”",
      "Practice in your head—it makes it easier in real life."
    ],
    quiz: [
      {
        q: "A confident ‘No’ is…",
        options: ["Clear and calm", "Mean and loud", "Never allowed"],
        answer: 0
      },
      {
        q: "A good ‘switch’ is…",
        options: ["“Let’s do something else.”", "“I’ll do anything.”", "“I hate you.”"],
        answer: 0
      },
      {
        q: "You owe people a ‘yes’ when pressured.",
        options: ["True", "False"],
        answer: 1
      }
    ]
  }
];

const TIPS = [
  "When you’re unsure, pause and ask: “Is this safe for my brain and body?”",
  "Pick a trusted adult now—so you know who to talk to later.",
  "Sleep + food + water make your brain stronger.",
  "Real friends respect your ‘no’.",
  "Stress is a signal, not a boss. You can handle it."
];

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

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return {
      currentLessonIndex: 0,
      completedDays: [],
      lastCompletedISO: null,
      streak: 0,
      highScore: 0
    };
    return JSON.parse(raw);
  }catch{
    return {
      currentLessonIndex: 0,
      completedDays: [],
      lastCompletedISO: null,
      streak: 0,
      highScore: 0
    };
  }
}

function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

// ---------- Navigation ----------
function showView(name){
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(`#view-${name}`).classList.remove("hidden");

  $$(".tab").forEach(t => t.classList.remove("active"));
  $(`.tab[data-view="${name}"]`)?.classList.add("active");

  if(name === "lesson") renderLesson();
  if(name === "progress") renderProgress();
}

$$(".tab").forEach(btn => {
  btn.addEventListener("click", () => showView(btn.dataset.view));
});

$("#btn-open-lesson").addEventListener("click", () => showView("lesson"));
$("#btn-start-lesson").addEventListener("click", () => showView("lesson"));
$("#btn-start-game").addEventListener("click", () => showView("games"));

$("#year").textContent = new Date().getFullYear();

// ---------- Tips ----------
function randomTip(){
  const tip = TIPS[Math.floor(Math.random()*TIPS.length)];
  $("#tip-text").textContent = tip;
}
$("#btn-new-tip").addEventListener("click", randomTip);
randomTip();

// ---------- Lessons ----------
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
    : "Not completed yet — finish the quiz and click “Mark Lesson Complete”.";
}

$("#btn-prev-lesson").addEventListener("click", () => {
  state.currentLessonIndex = clamp(state.currentLessonIndex - 1, 0, LESSONS.length - 1);
  saveState();
  renderLesson();
});

$("#btn-next-lesson").addEventListener("click", () => {
  state.currentLessonIndex = clamp(state.currentLessonIndex + 1, 0, LESSONS.length - 1);
  saveState();
  renderLesson();
});

$("#btn-complete-lesson").addEventListener("click", () => {
  const idx = clamp(state.currentLessonIndex, 0, LESSONS.length - 1);
  const day = LESSONS[idx].day;

  const score = quizScoreForCurrentLesson();
  if(score.correct < score.total){
    $("#lesson-status").textContent = `Almost! Quiz score: ${score.correct}/${score.total}. Answer all correctly to complete.`;
    return;
  }

  if(!state.completedDays.includes(day)){
    state.completedDays.push(day);
  }

  // streak logic: if last completion was yesterday, +1; if today, no change; else reset to 1
  const todayISO = isoDate(new Date());
  if(state.lastCompletedISO === todayISO){
    // already completed something today
  } else {
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

function updateHomeStats(){
  $("#streak-text").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
  $("#streak-text-2").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
}
updateHomeStats();

// ---------- Games ----------
let gameMode = null;
let gameIndex = 0;
let gameScore = 0;

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

$("#btn-exit-game").addEventListener("click", () => closeGameArea());
$("#btn-restart-game").addEventListener("click", () => {
  if(gameMode === "choicequest") startChoiceQuest();
});

$("#btn-play-choicequest").addEventListener("click", () => startChoiceQuest());
$("#btn-play-breathing").addEventListener("click", () => startBreathing());

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
    renderProgress(); // keep progress updated if user goes there
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
      // lock answers
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

  const tick = () => {
    timerText.textContent = `Time left: ${t}s`;
    ring.textContent = phase;

    // simple pulse
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
      return;
    }
  };

  tick();
  const id = setInterval(tick, 1000);
}

// ---------- Progress ----------
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

$("#btn-reset").addEventListener("click", () => {
  if(!confirm("Reset progress on this device?")) return;
  localStorage.removeItem(STORAGE_KEY);
  state = loadState();
  updateHomeStats();
  renderProgress();
  renderLesson();
});

// ---------- Helpers ----------
function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function isoDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}

// initial render
renderLesson();
renderProgress();
5