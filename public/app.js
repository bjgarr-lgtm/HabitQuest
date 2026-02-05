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
   TRACKS + CURRICULUM META
========================================================= */
const TRACKS = {
  general:     { name:"General",                  desc:"Healthy choices, stress tools, confidence, asking for help." },
  nicotine:    { name:"Nicotine / Vaping",        desc:"Cravings, pressure, coping skills, and refusing offers." },
  alcohol:     { name:"Alcohol",                  desc:"Safer choices, boundaries, and handling social pressure." },
  gaming:      { name:"Gaming / Screen habits",   desc:"Balance, routines, and stopping when you planned to stop." },
  socialmedia: { name:"Social media / Scrolling", desc:"Trends, influence, focus, and safer online choices." },
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

/* =========================================================
   LESSONS (UNIQUE CONTENT) + UNIQUE QUIZZES
   - No duplicated question sets between lessons.
   - Each lesson has its own scenario, tool, boundary line, and “myth” to correct.
========================================================= */
const LESSON_BLUEPRINTS = [
  // Day 1
  {
    toolName: "Time‑Zoom (Now → Later)",
    scenario: "You’re about to copy someone else’s homework because you’re tired and panicking.",
    safePlan: "Pause, time‑zoom, then pick the smallest honest step: ask for help or do what you can and tell the truth.",
    boundaryLine: "I’m not doing that. I’ll handle it another way.",
    myth: "‘One decision doesn’t matter.’",
    tinyStep: "Write ONE task you can finish in 5 minutes.",
    reflection: "What’s one choice Future You would thank you for this week?",
    content: [
      "Your brain is like a trail: every choice is a footprint. The trail you repeat becomes the easy path.",
      "Time‑Zoom: ask ‘What happens in 10 minutes? 10 days? 10 months?’ before you decide.",
      "If the ‘later’ version looks messy, you’ve got your answer.",
      "Try it now: pick one small, honest action you can do today."
    ],
  },
  // Day 2
  {
    toolName: "Body‑First Reset",
    scenario: "You get a mean message and feel your chest tighten. You want to react instantly.",
    safePlan: "Reset your body first (breath/water/move), then decide what response helps you most.",
    boundaryLine: "I’m not answering right now. I’ll respond later.",
    myth: "‘Stress means I’m weak.’",
    tinyStep: "Drink water + 4 slow breaths.",
    reflection: "What are 2 stress tools you can actually do in under 60 seconds?",
    content: [
      "Stress is your body’s alarm system. An alarm is information, not an order.",
      "Body‑First Reset: water, slow breathing, relax shoulders, or a short walk—then make choices.",
      "Decisions made while your alarm is blaring are usually worse.",
      "Try it now: inhale 4, exhale 6, repeat 4 times."
    ],
  },
  // Day 3
  {
    toolName: "No‑Switch‑Exit",
    scenario: "A friend keeps pushing you to sneak out because ‘it’ll be funny.’",
    safePlan: "Say no clearly, switch to another plan, and exit if they keep pushing.",
    boundaryLine: "No thanks. I’m heading out.",
    myth: "‘Saying no is rude.’",
    tinyStep: "Say your script once out loud.",
    reflection: "Write your best ‘No + Switch’ sentence for a real situation.",
    content: [
      "Refusing pressure is a skill, not a personality trait. Skills get better with reps.",
      "No‑Switch‑Exit: ‘No’ (clear), then offer a safer switch, then leave if needed.",
      "You don’t owe long explanations. Clarity is kindness to yourself.",
      "Practice: say your line in a calm voice once."
    ],
  },
  // Day 4
  {
    toolName: "Pressure vs Friend Check",
    scenario: "Someone says ‘If you were my real friend, you’d do it.’",
    safePlan: "Use the checklist: respect, safety, and consent. If it fails, it’s pressure—step back.",
    boundaryLine: "A real friend wouldn’t ask me to prove it.",
    myth: "‘Real friends push you.’",
    tinyStep: "List 2 people who respect your no.",
    reflection: "How can you tell the difference between pressure and a real friend?",
    content: [
      "Pressure tries to shrink your choices: ‘Do it or else.’ A friend expands options.",
      "Checklist: Do they respect boundaries? Do they care about safety? Do they listen?",
      "If you feel trapped or rushed, that’s a red flag.",
      "Try it: think of one time someone respected you—what did they do?"
    ],
  },
  // Day 5
  {
    toolName: "Safe‑Fun Menu",
    scenario: "You’re bored on a weekend and someone suggests a risky ‘thrill’ plan.",
    safePlan: "Pick 3 safe options before boredom hits; choose one and invite someone.",
    boundaryLine: "I’m down to hang, but not like that. Let’s do something else.",
    myth: "‘Safe fun is boring.’",
    tinyStep: "Write 3 boredom breakers you’d actually do.",
    reflection: "List 3 safe ‘boredom breakers’ you’d actually try.",
    content: [
      "Boredom isn’t an emergency. It’s a signal: ‘I need a change.’",
      "Safe‑Fun Menu: keep a short list of fun things that don’t create problems later.",
      "Boredom plus peer pressure is a risky combo—plan ahead.",
      "Try it: pick one menu item you can do today."
    ],
  },
  // Day 6
  {
    toolName: "Name‑It Map",
    scenario: "You feel ‘bad’ but can’t explain it, and you want to escape the feeling.",
    safePlan: "Name the feeling (stressed, lonely, jealous, embarrassed), then choose the matching need.",
    boundaryLine: "I need a minute. I’m not making a decision right now.",
    myth: "‘Feelings should be ignored.’",
    tinyStep: "Write: ‘I feel ___ because ___.’",
    reflection: "Name 1 feeling you had today and what it was trying to tell you.",
    content: [
      "Feelings are messengers. They’re not always correct, but they’re worth listening to.",
      "Name‑It Map: feeling → need → next step (rest, support, food, space, movement).",
      "When you name it, your brain gets more control.",
      "Try it: pick one word for your feeling right now."
    ],
  },
  // Day 7
  {
    toolName: "3‑Step Spike Plan",
    scenario: "You’re furious during an argument and want to say something that will explode it.",
    safePlan: "Step 1: pause body. Step 2: name the goal. Step 3: choose a calm action.",
    boundaryLine: "I’m too heated to talk. I’ll come back in 10 minutes.",
    myth: "‘Big emotions mean I must act.’",
    tinyStep: "Set a 2‑minute timer and cool down.",
    reflection: "When emotions spike, what’s your 3‑step calm plan?",
    content: [
      "Spikes feel urgent. That’s the trap. You can ride the wave without acting.",
      "3 steps: Pause body → Name goal → Choose action (walk, water, text support).",
      "You’re not ‘losing’ by stepping away—you’re staying in control.",
      "Try it: relax your jaw and shoulders for 10 seconds."
    ],
  },
  // Day 8
  {
    toolName: "Help‑Ask Script",
    scenario: "You’re overwhelmed but don’t want to ‘bother’ anyone.",
    safePlan: "Use a short opener, be honest, and ask for one specific thing (listen, advice, ride).",
    boundaryLine: "Can I talk to you about something that’s been stressing me out?",
    myth: "‘Asking for help is embarrassing.’",
    tinyStep: "Write the name of one trusted adult.",
    reflection: "Who is 1 trusted adult you could talk to, and what would you say?",
    content: [
      "Help is not a last resort. It’s a skill: reaching out early keeps problems small.",
      "Use a script: ‘Can I talk?’ + ‘Here’s what’s happening’ + ‘Can you help me with ____?’",
      "If one person isn’t available, try another. Keep going.",
      "Try it: write your opener sentence once."
    ],
  },
  // Day 9
  {
    toolName: "Trend Filter",
    scenario: "A viral challenge says ‘do it or you’re lame.’",
    safePlan: "Ask: does it add risk, secrecy, or harm? If yes, skip and choose your own plan.",
    boundaryLine: "Nope. I’m not doing dares for attention.",
    myth: "‘Online trends are harmless.’",
    tinyStep: "Turn on a 15‑minute app timer.",
    reflection: "What’s 1 online trend rule you want to follow to stay safe?",
    content: [
      "Online pressure uses speed: ‘Do it now.’ Safety uses pause: ‘Check first.’",
      "Trend Filter: risk? secrecy? harm? if any are yes, it’s a no.",
      "You can be bold without being reckless.",
      "Try it: set one boundary for your scrolling today."
    ],
  },
  // Day 10
  {
    toolName: "Values Anchor",
    scenario: "You’re tempted to act cool in a way that isn’t you.",
    safePlan: "Pick a value (health, honesty, respect) and act like the person you want to be.",
    boundaryLine: "That’s not me. I’m good.",
    myth: "‘Confidence means never doubting.’",
    tinyStep: "Write one value you want to live by.",
    reflection: "What’s a boundary you want to practice this week?",
    content: [
      "Confidence isn’t loud. It’s steady: ‘I know what I’m about.’",
      "Values Anchor: decide who you want to be before pressure shows up.",
      "When you live your values, you respect yourself—and pressure gets weaker.",
      "Try it: choose one value and one action that matches it."
    ],
  },
  // Day 11
  {
    toolName: "Coping Sort",
    scenario: "You want relief fast and you’re about to pick a coping tool that causes problems later.",
    safePlan: "Sort coping tools into ‘helps later too’ vs ‘borrows relief and charges interest.’",
    boundaryLine: "I need a coping tool that doesn’t create new problems.",
    myth: "‘Any coping is fine.’",
    tinyStep: "Pick one ‘helps later too’ tool for today.",
    reflection: "What’s one coping tool that helps now AND later?",
    content: [
      "Relief is a real need. The question is: how do you get it without paying for it later?",
      "Coping Sort: healthy tools lower stress without secrecy, harm, or regret.",
      "When you’re tempted, choose a tool with a clean ‘tomorrow.’",
      "Try it: pick one tool and do it for 2 minutes."
    ],
  },
  // Day 12
  {
    toolName: "Brain‑Fuel Check",
    scenario: "You’re exhausted and craving a huge caffeine hit to ‘fix’ it.",
    safePlan: "Check sleep/food/water first; choose a safer energy reset (water, snack, short walk).",
    boundaryLine: "I’m going to fuel my body first.",
    myth: "‘Energy drinks fix tiredness.’",
    tinyStep: "Water + small snack if possible.",
    reflection: "What’s one small ‘brain fuel’ habit you can do today?",
    content: [
      "Your brain runs on basics: sleep, food, water. When those drop, cravings rise.",
      "Brain‑Fuel Check before decisions: am I thirsty, hungry, tired, stressed?",
      "If you’re low-fuel, your ‘risk filter’ gets weaker.",
      "Try it: drink water right now."
    ],
  },
  // Day 13
  {
    toolName: "Stack‑Breaker",
    scenario: "You have three assignments, practice, and drama—stress is stacking up.",
    safePlan: "Break the stack: reset body, pick the next tiny task, ask for help early.",
    boundaryLine: "I’m handling one step at a time.",
    myth: "‘School stress must be handled alone.’",
    tinyStep: "Pick the easiest 5‑minute task.",
    reflection: "What’s one small school step you can do before you relax?",
    content: [
      "Stress stacks when you carry everything in your head at once.",
      "Stack‑Breaker: write it down, pick ONE next action, then do a short reset.",
      "Tiny progress lowers stress more than perfect plans.",
      "Try it: choose the next 5‑minute task and start."
    ],
  },
  // Day 14
  {
    toolName: "Tiny‑Step Ladder",
    scenario: "You want a big goal but your brain keeps saying ‘too hard, quit.’",
    safePlan: "Make a ladder: step 1 is so small you can’t talk yourself out of it.",
    boundaryLine: "I’m doing the first rung today.",
    myth: "‘Goals must be huge to count.’",
    tinyStep: "One rung you can do in 2 minutes.",
    reflection: "What’s a goal, and what’s the first tiny rung?",
    content: [
      "Motivation is unreliable. Systems are reliable.",
      "Tiny‑Step Ladder: tiny action → repeat → build confidence → add difficulty.",
      "Small wins train your brain to keep promises to yourself.",
      "Try it: choose a 2‑minute rung and do it."
    ],
  },
  // Day 15
  {
    toolName: "Comeback Script",
    scenario: "You broke a promise to yourself and feel like giving up completely.",
    safePlan: "Use the comeback script: ‘I slipped. Next step is ____.’ Then take one tiny repair action.",
    boundaryLine: "I’m not quitting. I’m resetting.",
    myth: "‘Mistakes ruin everything.’",
    tinyStep: "Write your comeback sentence.",
    reflection: "What’s your comeback sentence for the next time you slip?",
    content: [
      "A slip is data, not destiny.",
      "Comeback Script: name the slip without insults, then pick the next helpful action.",
      "Shame makes loops stronger. Learning makes loops weaker.",
      "Try it: write your next step in one sentence."
    ],
  },
  // Day 16
  {
    toolName: "Option‑Map",
    scenario: "You have a problem and your brain says ‘there’s no good choice.’",
    safePlan: "List 3 options, then rate each by safety + long‑term effect + honesty.",
    boundaryLine: "I’m going to list options before I choose.",
    myth: "‘There’s only one right answer.’",
    tinyStep: "Write 3 options (even imperfect).",
    reflection: "What problem are you solving, and what are 3 options?",
    content: [
      "When stressed, your brain narrows. Option‑Map widens it again.",
      "Write three options, then check: safe? honest? helps later?",
      "You’re not looking for perfect. You’re looking for better.",
      "Try it: list 3 options right now."
    ],
  },
  // Day 17
  {
    toolName: "Stop‑Signal Routine",
    scenario: "You keep scrolling/gaming past your planned stop time.",
    safePlan: "Use a stop signal (timer + stand up + water) and a replacement action.",
    boundaryLine: "I’m stopping now like I planned.",
    myth: "‘Routines are only for adults.’",
    tinyStep: "Set a timer for your next session.",
    reflection: "What’s your stop signal + replacement action?",
    content: [
      "Habits love ‘just one more.’ Your job is to install a stop signal.",
      "Stop signal: timer → stand up → water → move to the next planned thing.",
      "You’re training your brain to follow your plan, not your urge.",
      "Try it: pick your replacement action."
    ],
  },
  // Day 18
  {
    toolName: "Boundary Builder",
    scenario: "Someone keeps invading your space or time and acts like you’re mean for stopping it.",
    safePlan: "State boundary, repeat once, then change distance/leave if needed.",
    boundaryLine: "Stop. I’m not okay with that.",
    myth: "‘Boundaries hurt people.’",
    tinyStep: "Write one boundary sentence you’ll use.",
    reflection: "Where do you need a boundary, and what will you say?",
    content: [
      "Boundaries protect relationships by preventing resentment and harm.",
      "Good boundary = clear + calm + consistent.",
      "If someone argues with your boundary, that’s information.",
      "Try it: practice your line once."
    ],
  },
  // Day 19
  {
    toolName: "Cool‑Talk Script",
    scenario: "A disagreement is heating up and you’re about to go for the meanest line.",
    safePlan: "Lower the heat: slow voice, name the issue, propose a next step, or take a break.",
    boundaryLine: "I want to solve this, not win it.",
    myth: "‘Conflict must be won.’",
    tinyStep: "Replace one insult with one request.",
    reflection: "What’s one sentence that lowers heat in conflict?",
    content: [
      "Conflict is normal. Escalation is optional.",
      "Cool‑Talk: ‘Here’s the issue’ + ‘Here’s what I need’ + ‘What can we do next?’",
      "Pausing is not losing. It’s steering.",
      "Try it: write one ‘request’ sentence."
    ],
  },
  // Day 20
  {
    toolName: "Support Team Map",
    scenario: "Something is hard and you feel like you must handle it alone.",
    safePlan: "Make a support map: 2 adults + 2 peers + 1 place you can go (office, counselor).",
    boundaryLine: "I’m going to talk to someone who can help.",
    myth: "‘You should only rely on yourself.’",
    tinyStep: "Write 2 names + how to reach them.",
    reflection: "Who is in your support map?",
    content: [
      "Support is strategy. It makes good choices easier to keep.",
      "Map: who listens, who helps solve, who helps in emergencies.",
      "If your first ask doesn’t work, try again with someone else.",
      "Try it: write two names now."
    ],
  },
  // Day 21
  {
    toolName: "Urge Wave Rule",
    scenario: "An urge hits hard and your brain says ‘do it now or you’ll explode.’",
    safePlan: "Ride the wave: delay 10 minutes, distract, breathe, move, and reach out if needed.",
    boundaryLine: "This urge will pass. I can wait it out.",
    myth: "‘Urges control you.’",
    tinyStep: "Delay 10 minutes (timer).",
    reflection: "What’s your best 10‑minute urge plan?",
    content: [
      "Urges rise, peak, and fall—like waves.",
      "Delay breaks the spell. You don’t have to fight forever—just long enough.",
      "Add a distraction that uses your body (walk, water, shower, stretch).",
      "Try it: set a 10‑minute timer."
    ],
  },
  // Day 22
  {
    toolName: "Offer Refusal Kit",
    scenario: "Someone offers you something you should avoid, and everyone is watching.",
    safePlan: "Short no, no debate, move your feet, text someone if needed.",
    boundaryLine: "No thanks. I’m good.",
    myth: "‘If you hesitate, you lose.’",
    tinyStep: "Write your ‘no’ in 6 words or fewer.",
    reflection: "What’s your quick refusal line?",
    content: [
      "You don’t need a speech. You need a clean line and a clean exit.",
      "Refusal Kit: short no + change subject + move away.",
      "If people mock you, that’s a sign to leave, not to prove something.",
      "Try it: say your line out loud once."
    ],
  },
  // Day 23
  {
    toolName: "Hangout Plan",
    scenario: "You’re at a hangout and it turns risky. You don’t want to be the ‘boring’ one.",
    safePlan: "Use the buddy system and an exit plan before you need it.",
    boundaryLine: "I’m out. I’ll see you later.",
    myth: "‘Everyone is judging you.’",
    tinyStep: "Pick your ‘ride home’ option.",
    reflection: "What’s your exit plan if a hangout turns risky?",
    content: [
      "The safest plan is one you can actually do.",
      "Hangout Plan: who you’re with, where you’ll go if it shifts, and how you leave.",
      "A solid exit plan makes saying no easier.",
      "Try it: decide your exit phrase now."
    ],
  },
  // Day 24
  {
    toolName: "Friend‑Help Steps",
    scenario: "A friend hints they’re struggling and you’re not sure what to do.",
    safePlan: "Listen, don’t promise secrecy, and involve a trusted adult when needed.",
    boundaryLine: "I care about you too much to keep this secret.",
    myth: "‘It’s not your job to help a friend.’",
    tinyStep: "Send one supportive text.",
    reflection: "What’s one sentence that shows care and gets help?",
    content: [
      "You don’t have to be a therapist to be helpful.",
      "Steps: listen → show care → get support from an adult if it’s serious.",
      "Don’t carry heavy stuff alone; share it with safe adults.",
      "Try it: write one caring sentence."
    ],
  },
  // Day 25
  {
    toolName: "Coach‑Voice",
    scenario: "Your inner voice is roasting you and you want to quit.",
    safePlan: "Replace bully‑voice with coach‑voice: honest, kind, and specific.",
    boundaryLine: "I’m learning. I can improve with practice.",
    myth: "‘Mean self-talk motivates.’",
    tinyStep: "Rewrite one insult into a coach sentence.",
    reflection: "What would a good coach say to you today?",
    content: [
      "Your brain listens to your words. Harsh words don’t build skill—practice does.",
      "Coach‑Voice: ‘Here’s what happened’ + ‘Here’s the next step.’",
      "Kind isn’t weak. Kind is effective.",
      "Try it: rewrite one thought right now."
    ],
  },
  // Day 26
  {
    toolName: "Anger Cooldown Kit",
    scenario: "You feel anger rising fast and you want to slam/throw/say something intense.",
    safePlan: "Cooldown kit: move body, cold water, slow breathing, then talk or take space.",
    boundaryLine: "I’m angry. I’m taking a break to cool down.",
    myth: "‘Anger must explode.’",
    tinyStep: "Cold water on hands + 10 slow breaths.",
    reflection: "What’s in your cooldown kit?",
    content: [
      "Anger is energy. You can steer it without hurting anyone.",
      "Cooldown: create space, lower body heat, slow breathing, then use words.",
      "If you’re too hot to talk, that’s the sign to pause.",
      "Try it: unclench your hands and jaw."
    ],
  },
  // Day 27
  {
    toolName: "Grounding 5‑4‑3‑2‑1",
    scenario: "Anxiety spikes and your brain starts making worst‑case movies.",
    safePlan: "Ground to the present using senses and slow breathing; then take one small step.",
    boundaryLine: "I’m safe right now. I’m grounding.",
    myth: "‘Anxiety means danger is real.’",
    tinyStep: "Do 5‑4‑3‑2‑1 once.",
    reflection: "Which grounding step helps you most?",
    content: [
      "Anxiety is a false alarm sometimes. Grounding helps you check reality.",
      "5‑4‑3‑2‑1: 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste.",
      "Then choose a tiny step that moves you forward.",
      "Try it: do the first two senses now."
    ],
  },
  // Day 28
  {
    toolName: "Brave Step Ladder",
    scenario: "You want confidence but you keep waiting to ‘feel ready.’",
    safePlan: "Confidence comes after reps. Pick a small brave step and repeat it.",
    boundaryLine: "I can do this even nervous.",
    myth: "‘Confidence is something you’re born with.’",
    tinyStep: "One small brave action today.",
    reflection: "What’s your small brave step?",
    content: [
      "Confidence is built, not gifted.",
      "Brave Step Ladder: tiny brave step → repeat → level up gradually.",
      "Being nervous is allowed. Quitting isn’t required.",
      "Try it: choose your smallest brave step."
    ],
  },
  // Day 29
  {
    toolName: "Lead‑By‑Example Move",
    scenario: "A group is drifting toward risky choices and someone needs to steer it.",
    safePlan: "Change the activity, invite one person to join you, and keep it calm.",
    boundaryLine: "Let’s do something safer. I’m not into that.",
    myth: "‘Leaders never ask for help.’",
    tinyStep: "Invite one person to a safer plan.",
    reflection: "How can you lead without being bossy?",
    content: [
      "Leadership isn’t controlling people. It’s modeling the safer path.",
      "A simple redirect can change the whole vibe.",
      "If it gets unsafe, leaders leave and get support.",
      "Try it: write one redirect sentence."
    ],
  },
  // Day 30
  {
    toolName: "Keep‑Going Plan",
    scenario: "You finished lessons, but you’re worried you’ll forget everything in a week.",
    safePlan: "Pick 2 skills to keep, set reminders, and do quick reviews when you slip.",
    boundaryLine: "I’m building habits, not perfection.",
    myth: "‘If you slip, quit.’",
    tinyStep: "Pick 2 skills + when you’ll use them.",
    reflection: "What 2 skills are you keeping, and when will you use them?",
    content: [
      "The goal isn’t ‘never mess up.’ The goal is ‘recover fast and keep going.’",
      "Keep‑Going Plan: pick two tools, schedule tiny practice, and review when you struggle.",
      "You keep what you repeat.",
      "Try it: choose your two tools now."
    ],
  },
];

function getBlueprint(day){
  const idx = clamp(day, 1, 30) - 1;
  return LESSON_BLUEPRINTS[idx] || LESSON_BLUEPRINTS[0];
}

function makeLessonContent(day, title, goal){
  const bp = getBlueprint(day);
  return [
    `Today’s topic: ${title}.`,
    `Goal: ${goal}`,
    ...bp.content,
  ];
}

/* =========================================================
   QUIZ BUILDER (12 QUESTIONS PER DAY, DAY-SPECIFIC WORDING)
   - No “same five platitudes” re-used as-is across lessons.
========================================================= */
function makeQuizForLesson(day, title, goal, track){
  const bp = getBlueprint(day);
  const rng = mulberry32(50000 + day * 999);

  const q = (question, correctOpt, wrongOpts) => {
    const options = [correctOpt, ...wrongOpts];
    shuffleInPlace(options, rng);
    const answer = options.indexOf(correctOpt);
    return { q: question, options, answer };
  };

  // Track flavor (only when relevant)
  const trackQ =
    track === "socialmedia" ? q(
      `Day ${day} (“${title}”): Which sign means a trend is a bad idea?`,
      "It pressures you, adds risk, or needs secrecy",
      ["It’s popular", "It has a funny sound"]
    ) :
    track === "gaming" ? q(
      `Day ${day} (“${title}”): Which stop-signal is most realistic?`,
      "Timer goes off → stand up → water → switch tasks",
      ["Keep playing until you feel guilty", "Promise you’ll stop ‘eventually’"]
    ) :
    track === "caffeine" ? q(
      `Day ${day} (“${title}”): What’s the best first fix for low energy?`,
      "Check sleep/food/water first",
      ["Double the caffeine every time", "Skip meals to ‘stay sharp’"]
    ) :
    track === "nicotine" ? q(
      `Day ${day} (“${title}”): When an urge hits, what’s the smart first move?`,
      "Delay and do a body reset before deciding",
      ["Hide it and panic", "Say yes fast so it’s over"]
    ) :
    track === "alcohol" ? q(
      `Day ${day} (“${title}”): Which hangout plan reduces pressure the most?`,
      "Buddy + exit plan + safe adult backup",
      ["Go with no plan and ‘see what happens’", "Rely on secrecy"]
    ) :
    q(
      `Day ${day} (“${title}”): What makes a choice ‘safe’ long-term?`,
      "It helps now and doesn’t create problems later",
      ["It feels exciting right now", "It’s something you must hide"]
    );

  const questions = [
    q(
      `Day ${day}: What is the main goal of “${title}”?`,
      goal,
      ["To hide problems", "To take bigger risks"]
    ),
    q(
      `Tool check: Which tool is today’s key skill?`,
      bp.toolName,
      ["Luck", "Doing it fast before you think"]
    ),
    q(
      `Scenario: ${bp.scenario} What’s the best safe plan?`,
      bp.safePlan,
      ["Do it secretly so nobody knows", "Pick the riskiest option to feel something"]
    ),
    q(
      `Myth check: Which belief does today correct?`,
      bp.myth,
      ["‘If you’re nervous, you’re doomed.’", "‘Only adults need plans.’"]
    ),
    q(
      `Which sentence matches today’s boundary style best?`,
      bp.boundaryLine,
      ["I guess… maybe…", "Stop talking forever."]
    ),
    q(
      `What’s the point of doing a “tiny step”?`,
      "It’s doable today, so it actually happens",
      ["It proves you’re perfect", "It has to be huge to count"]
    ),
    q(
      `Pick the strongest friend behavior in a pressure moment:`,
      "They respect your no and help you switch plans",
      ["They tease you until you give in", "They say ‘prove it’"]
    ),
    q(
      `When your body alarm is high, what should happen first?`,
      "Lower the alarm, then decide",
      ["Decide immediately", "Ignore it and push harder"]
    ),
    q(
      `Which option is the best “switch” after saying no?`,
      "Let’s do something else.",
      ["Fine, I’ll do it.", "You’re annoying."]
    ),
    q(
      `Trusted adult: which is a real example?`,
      "Parent/guardian/teacher/coach",
      ["Only strangers online", "Nobody ever"]
    ),
    trackQ,
    q(
      `Tiny step for Day ${day}: which is closest to today’s tiny step?`,
      bp.tinyStep,
      ["A huge impossible promise", "Wait until you feel ready"]
    ),
  ];

  // Ensure 12 and ensure question text uniqueness within the quiz
  const out = [];
  const seen = new Set();
  for(const item of questions){
    if(!seen.has(item.q)){
      seen.add(item.q);
      out.push(item);
    }
    if(out.length >= 12) break;
  }
  return out.slice(0, 12);
}

/* =========================================================
   LESSONS ARRAY
========================================================= */
const LESSONS = CURRICULUM.map((c, i) => ({
  day: i + 1,
  track: c.track || "general",
  title: c.title,
  goal: c.goal,
  content: makeLessonContent(i + 1, c.title, c.goal),
  quiz: makeQuizForLesson(i + 1, c.title, c.goal, c.track || "general"),
}));

/* =========================================================
   GAMES CATALOG
========================================================= */
const GAMES = [
  { id:"choicequest", title:"Choice Quest",    desc:"Quick practice: pick the healthiest choice.", status:"ready", unlock:{ type:"free" } },
  { id:"breathing",   title:"Breathing Buddy", desc:"60‑second calm timer that earns XP.",         status:"ready", unlock:{ type:"free" } },
  { id:"responsebuilder", title:"Response Builder", desc:"Build a strong response to pressure.",  status:"ready", unlock:{ type:"free" } },
  { id:"pressuremeter", title:"Pressure Meter", desc:"Keep pressure low using healthy moves.",    status:"ready", unlock:{ type:"lessons", lessons:3 } },
  { id:"memory",      title:"Memory Match",    desc:"Match healthy coping tools.",                status:"soon", unlock:{ type:"xp", xp:250 } },
  { id:"coping-sort", title:"Coping Sort",     desc:"Sort coping tools into helpful vs not.",     status:"soon", unlock:{ type:"lessons", lessons:5 } },
  { id:"streak-run",  title:"Streak Run",      desc:"Quick reaction game to keep your streak.",   status:"soon", unlock:{ type:"level", level:4 } },
  { id:"focus-dodge", title:"Focus Dodge",     desc:"Avoid distractions; build focus.",           status:"soon", unlock:{ type:"level", level:5 } },
  { id:"goal-builder",title:"Goal Builder",    desc:"Pick goals + tiny steps to reach them.",     status:"soon", unlock:{ type:"xp", xp:600 } },
  { id:"friendship-quiz", title:"Friendship Signals", desc:"Spot healthy vs unhealthy friend behaviors.", status:"soon", unlock:{ type:"lessons", lessons:10 } },
  { id:"stress-lab",  title:"Stress Lab",      desc:"Try safe stress tools and see what works.",  status:"soon", unlock:{ type:"xp", xp:900 } },
];

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
  quizAttempts: { /* day -> { attempts, wrongTotal, lastISO } */ },
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

  merged.customAvatars = Array.isArray(safe.customAvatars) ? safe.customAvatars : [];
  merged.customAvatars = merged.customAvatars
    .filter(a => a && typeof a.id === "string" && typeof a.dataURL === "string" && a.dataURL.startsWith("data:image/"))
    .map(a => ({ id: a.id, dataURL: a.dataURL, createdISO: safeStr(a.createdISO, isoDate(new Date())) }));

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
  const bp = getBlueprint(lesson.day);
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
    renderProgress();
  }
  if(name === "progress") name = "home";
  if(name === "shop")     renderShop();
  if(name === "rate")     renderRate();
  if(name === "tracks")   renderTrackUI();
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
  $("#btn-open-rate")?.addEventListener("click", () => showView("rate"));
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

  const uncompleted = lessons.filter(l => !state.completedDays.includes(l.day));
  if(uncompleted.length) return uncompleted[0];

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
    const score = quizScoreForCurrentLesson();
    const wrong = score.total - score.correct;

    if(wrong > 0){
      recordQuizAttempt(score.day, wrong);
      $("#lesson-status") && ($("#lesson-status").textContent =
        `Almost! Quiz score: ${score.correct}/${score.total}. Fix the missed ones and try again.`);
      renderHomeRecommendation();
      return;
    }

    const firstTime = !state.completedDays.includes(score.day);
    if(firstTime){
      addXP(score.total * 5);
      state.completedDays.push(score.day);
      addXP(50);
      state.habitQuest.tokens = safeNum(state.habitQuest.tokens,0) + 1;
    }

    state.habitQuest.lastLessonDay = score.day;

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
  state.habitQuest.tokens = safeNum(state.habitQuest.tokens, 0) + 1;
  addXP(5);
  state.lastLoginISO = today;
  saveState();
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
   GAME OVERLAY
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
      .hqSlotRow{ display:flex; gap:10px; flex-wrap:wrap; margin-top: 12px; }
      .hqSlotCard{
        flex: 1 1 220px;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
        border-radius: 14px;
        padding: 12px;
      }
      .mapTable{ width:100%; border-collapse: collapse; margin-top: 10px; }
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
    if(gameMode === "responsebuilder") startResponseBuilder();
    if(gameMode === "pressuremeter") startPressureMeter();
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
    const btnText = (game.status === "ready" && unlocked) ? "Play" : "Locked / Soon";
    const disabled = !(game.status === "ready" && unlocked);

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

/* =========================================================
   GAME: PRESSURE METER
========================================================= */
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

  let pressure = 35;
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
        <button class="btn small" id="pm-switch" type="button">🔁 Switch Plan</button>
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
    pressure = clamp(pressure + (t < 10 ? 4 : t < 20 ? 5 : 6), 0, 100);
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

/* =========================================================
   GAME: RESPONSE BUILDER
========================================================= */
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
        if(msg) msg.textContent = "Almost. Make it clearer and safer.";
      }
      overlay.querySelector("#go-score").textContent = `Score: ${gameScore}`;
      const restartBtn = overlay?.querySelector("#go-restart");
      if(restartBtn) restartBtn.style.display = "inline-block";
    });
  };

  render();
}

/* =========================================================
   HABIT QUEST (unchanged node graph; your existing content)
   NOTE: Keeping HQ_NODES as-is from your file is fine; it’s not the quiz system.
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
      { text:"Pause and ask: “Will this help Future Me?”", good:true,  effects:{ wisdom:+1, xp:+15, flag:{ key:"usedFutureMe", value:true } }, why:"That question protects you.", next:"hq_forest_boss" },
      { text:"Do it without thinking.",                    good:false, effects:{ hearts:-1 },               why:"Pausing is your superpower.", next:"hq_forest_boss" },
      { text:"Take a side path to get support + a plan.",  good:true,  effects:{ xp:+8 },                   why:"A plan beats pressure.", next:"hq_forest_boss" },
    ]
  },
  hq_forest_boss: {
    chapter: "Chapter 2: The Focus Forest",
    text: (ctx) => {
      const bonus = ctx.flags && ctx.flags.helpedKid ? "You feel proud you helped someone earlier—confidence boost." : "You take a steady breath.";
      return `Boss moment: a crowd pressures you. ${bonus}`;
    },
    choices: [
      { text:"Say: “No thanks. I’m heading out.”", good:true,  effects:{ wisdom:+1, xp:+20 }, why:"Clear + calm + exit.", next:"hq_win" },
      { text:"Say yes so nobody laughs.",          good:false, effects:{ hearts:-1 },        why:"Real friends don’t demand proof.", next:"hq_win" },
    ]
  },
  hq_win: {
    chapter: "Chapter 3+: Coming Soon",
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
  const nodes = Object.entries(HQ_NODES).map(([id, node]) => ({
    id,
    chapter: safeStr(node.chapter, ""),
    visited: !!visited[id],
    outs: nodeOutgoing(node),
  }));

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

/* =========================================================
   DEV PANEL (drop-in) — paste AFTER init();
   Toggle: Ctrl+Shift+D (or Cmd+Shift+D on Mac)
========================================================= */
(function devPanel(){
  const DEV_KEY = "__htaa_devpanel_v1";
  if (window[DEV_KEY]) return; // prevent double-inject
  window[DEV_KEY] = true;

  // ------- helpers -------
  const h = (tag, attrs={}, children=[]) => {
    const el = document.createElement(tag);
    for(const [k,v] of Object.entries(attrs)){
      if(k === "style") Object.assign(el.style, v);
      else if(k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, String(v));
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if(c == null) return;
      el.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return el;
  };
  const toast = (msg) => {
    let t = document.getElementById("dev-toast");
    if(!t){
      t = h("div",{ id:"dev-toast", style:{
        position:"fixed", left:"50%", bottom:"18px", transform:"translateX(-50%)",
        background:"rgba(0,0,0,0.75)", color:"#fff", padding:"10px 12px",
        border:"1px solid rgba(255,255,255,0.18)", borderRadius:"10px",
        fontWeight:"800", zIndex:100000, maxWidth:"92vw", textAlign:"center"
      }});
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(t.__tid);
    t.__tid = setTimeout(()=>{ t.style.display="none"; }, 1600);
  };

  // ------- UI shell -------
  const root = h("div", { id:"dev-panel", style:{
    position:"fixed", right:"12px", bottom:"12px", width:"360px",
    maxWidth:"92vw", maxHeight:"78vh", overflow:"auto",
    background:"rgba(15,15,22,0.94)", color:"rgba(255,255,255,0.92)",
    border:"1px solid rgba(255,255,255,0.18)", borderRadius:"14px",
    padding:"12px", zIndex:99999, display:"none",
    boxShadow:"0 18px 60px rgba(0,0,0,0.45)", backdropFilter:"blur(10px)"
  }});

  const title = h("div", { style:{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:"10px" }}, [
    h("div", { style:{ fontWeight:"900" }}, "Dev Panel"),
    h("button", { style:{
      border:"1px solid rgba(255,255,255,0.18)", background:"rgba(255,255,255,0.08)",
      color:"#fff", borderRadius:"10px", padding:"6px 10px", cursor:"pointer",
      fontWeight:"900"
    }, onclick: () => toggle(false) }, "✕")
  ]);

  const stats = h("pre", { id:"dev-stats", style:{
    whiteSpace:"pre-wrap", margin:"10px 0 0", padding:"10px",
    borderRadius:"12px", border:"1px solid rgba(255,255,255,0.14)",
    background:"rgba(255,255,255,0.06)", fontSize:"12px", lineHeight:"1.25"
  }});

  const btnStyle = {
    border:"1px solid rgba(255,255,255,0.18)",
    background:"rgba(255,255,255,0.08)",
    color:"#fff", borderRadius:"10px", padding:"8px 10px",
    cursor:"pointer", fontWeight:"900"
  };
  const row = (...kids) => h("div", { style:{ display:"flex", gap:"8px", flexWrap:"wrap", marginTop:"10px" }}, kids);

  // ------- actions -------
  function refresh(){
    try{
      const lessonsTotal = Array.isArray(LESSONS) ? LESSONS.length : 0;
      const activeTotal = (typeof getActiveLessons === "function") ? getActiveLessons().length : 0;
      const track = state?.selectedTrack || "general";
      stats.textContent =
`STORAGE_KEY: ${typeof STORAGE_KEY === "string" ? STORAGE_KEY : "(missing)"}
Track: ${track} (${TRACKS?.[track]?.name || "?"})
Lessons total: ${lessonsTotal}
Active lessons: ${activeTotal}

XP: ${state?.xp ?? "?"}   Level: ${state?.level ?? "?"}
Streak: ${state?.streak ?? "?"}   Completed: ${state?.completedDays?.length ?? "?"}
Current index: ${state?.currentLessonIndex ?? "?"}
Current day (active list): ${(() => {
  try {
    const ls = getActiveLessons();
    const idx = Math.max(0, Math.min(ls.length-1, state.currentLessonIndex||0));
    return ls[idx]?.day ?? "?";
  } catch { return "?"; }
})()}

HQ: node=${state?.habitQuest?.nodeId ?? "?"} hearts=${state?.habitQuest?.hearts ?? "?"} tokens=${state?.habitQuest?.tokens ?? "?"}
`;
    }catch(e){
      stats.textContent = "Dev panel refresh failed: " + String(e?.message || e);
    }
  }

  function setDay(day){
    const d = Number(day);
    if(!Number.isFinite(d)) return;
    goToLessonDay(Math.max(1, Math.min(30, d)));
    toast("Jumped to Day " + d);
    refresh();
  }

  function completeAll(){
    const ls = Array.isArray(LESSONS) ? LESSONS : [];
    state.completedDays = ls.map(x => x.day);
    state.currentLessonIndex = 0;
    state.lastCompletedISO = isoDate(new Date());
    state.streak = Math.max(1, state.streak||0);
    addXP(1); // forces renders + save
    saveState();
    toast("Marked all lessons complete");
    refresh();
  }

  function unlockEverything(){
    state.xp = 99999;
    recalcLevel();
    state.habitQuest.tokens = 99;
    state.habitQuest.hearts = 5;
    saveState();
    updateHomeStats();
    renderProfile();
    renderShop();
    renderGamesCatalog();
    renderHomeRecommendation();
    toast("Unlocked XP/tokens/hearts");
    refresh();
  }

  function exportSave(){
    const raw = localStorage.getItem(STORAGE_KEY) || "";
    navigator.clipboard?.writeText(raw).then(
      () => toast("Save copied to clipboard"),
      () => { prompt("Copy this save JSON:", raw); }
    );
  }

  function importSave(){
    const raw = prompt("Paste save JSON here:");
    if(!raw) return;
    try{
      JSON.parse(raw);
      localStorage.setItem(STORAGE_KEY, raw);
      state = normalizeState(loadState());
      recalcLevel();
      saveState();
      updateHomeStats();
      renderLesson();
      renderProfile();
      renderShop();
      renderRate();
      renderGamesCatalog();
      renderTrackUI();
      renderHomeRecommendation();
      showView("home");
      toast("Imported save");
      refresh();
    }catch(e){
      alert("Invalid JSON: " + String(e?.message || e));
    }
  }

  // ------- quiz validator / auto-fix -------
  function normalizeQ(s){
    return String(s||"").toLowerCase().replace(/\s+/g," ").trim();
  }

  function validateAndFixQuizDuplicates({ autoFix=true } = {}){
    const seen = new Map(); // normQ -> {day, title}
    const dups = [];
    for(const lesson of (Array.isArray(LESSONS)?LESSONS:[])){
      if(!Array.isArray(lesson.quiz)) continue;
      for(const item of lesson.quiz){
        const k = normalizeQ(item?.q);
        if(!k) continue;
        if(seen.has(k)){
          const first = seen.get(k);
          dups.push({ day: lesson.day, firstDay: first.day, q: item.q });
          if(autoFix){
            // Prefix with day/title to force uniqueness (safe + simple)
            item.q = `Day ${lesson.day} (“${lesson.title}”): ${item.q}`;
          }
        }else{
          seen.set(k, { day: lesson.day, title: lesson.title });
        }
      }
    }
    if(autoFix && dups.length){
      saveState();
      toast(`Fixed ${dups.length} duplicate quiz question(s)`);
    }else if(!dups.length){
      toast("No duplicate quiz questions found");
    }else{
      toast(`Found ${dups.length} duplicates (not fixed)`);
    }
    console.log("[DevPanel] quiz duplicates:", dups);
    return dups;
  }

  // ------- build + bind -------
  root.appendChild(title);
  root.appendChild(stats);
  root.appendChild(row(
    h("button",{style:btnStyle, onclick:()=>{ refresh(); toast("Refreshed"); }}, "Refresh"),
    h("button",{style:btnStyle, onclick:()=>{ unlockEverything(); }}, "Unlock all"),
    h("button",{style:btnStyle, onclick:()=>{ completeAll(); }}, "Complete all"),
  ));
  root.appendChild(row(
    h("button",{style:btnStyle, onclick:()=>{ const d = prompt("Jump to Day (1-30):","1"); if(d) setDay(d); }}, "Jump day"),
    h("button",{style:btnStyle, onclick:()=>{ addXP(200); toast("+200 XP"); refresh(); }}, "+200 XP"),
    h("button",{style:btnStyle, onclick:()=>{ state.selectedTrack="general"; state.currentLessonIndex=0; saveState(); renderTrackUI(); renderLesson(); toast("Track: General"); refresh(); }}, "Track: General")
  ));
  root.appendChild(row(
    h("button",{style:btnStyle, onclick:()=>{ exportSave(); }}, "Export save"),
    h("button",{style:btnStyle, onclick:()=>{ importSave(); }}, "Import save"),
    h("button",{style:btnStyle, onclick:()=>{ validateAndFixQuizDuplicates({autoFix:true}); }}, "Fix quiz duplicates")
  ));
  root.appendChild(h("div",{ style:{ marginTop:"10px", opacity:"0.85", fontSize:"12px" } },
    "Toggle: Ctrl+Shift+D • Logs: console"
  ));
  document.body.appendChild(root);

  function toggle(force){
    const show = (typeof force === "boolean") ? force : (root.style.display === "none");
    root.style.display = show ? "block" : "none";
    if(show) refresh();
  }

  window.addEventListener("keydown", (e) => {
    const key = (e.key || "").toLowerCase();
    const hot = (key === "d") && (e.ctrlKey || e.metaKey) && e.shiftKey;
    if(hot){
      e.preventDefault();
      toggle();
    }
  });
})();
