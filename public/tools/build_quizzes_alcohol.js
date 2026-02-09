/* tools/build_quizzes_general.js
   Generates public/quizzes_general.js (60 days * 12 questions) for ONE track: general
*/
"use strict";

const path = require("path");
const fs = require("fs");
const CURR_PATH = path.resolve(__dirname, "..", "curriculum.js"); 
const txt = fs.readFileSync(CURR_PATH, "utf8");
const vm = require("vm");

// --- stable RNG (same as app.js) ---
function mulberry32(seed){
  let t = seed >>> 0;
  return function(){
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleInPlace(arr, rng){
  for(let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function q(rng, question, correctOpt, wrongOpts){
  const options = [correctOpt, ...wrongOpts];
  shuffleInPlace(options, rng);
  const answer = options.indexOf(correctOpt);
  return { q: question, options, answer };
}

function uniqPush(out, seen, item){
  if(!seen.has(item.q)){
    seen.add(item.q);
    out.push(item);
  }
}

function buildDayQuestions(dayObj, bp){
  const day = dayObj.day;
  const title = dayObj.title;
  const goal  = dayObj.goal;

  const rng = mulberry32(900000 + day * 1337);
  const out = [];
  const seen = new Set();

  // 12 authored-style questions (still generated here, but the OUTPUT becomes hardcoded)
  uniqPush(out, seen, q(rng,
    `Day ${day} — "${title}": What is today’s goal in plain words?`,
    goal,
    ["To impress people fast", "To ignore problems until later", "To take bigger risks to feel something"]
  ));

  uniqPush(out, seen, q(rng,
    `Tool focus: Which tool are you practicing today?`,
    bp.toolName,
    ["Going with the vibe", "Doing it instantly", "Keeping it secret"]
  ));

  uniqPush(out, seen, q(rng,
    `Scenario check: ${bp.scenario} What’s the best first move?`,
    bp.safePlan,
    ["Rush the decision before you think", "Do it secretly so nobody knows", "Pick the most intense option to feel relief"]
  ));

  uniqPush(out, seen, q(rng,
    `Myth buster: Which belief does today push back against?`,
    bp.myth,
    ["If something is popular it’s safe", "If you feel pressure you should obey it", "If you hesitate you’re weak"]
  ));

  uniqPush(out, seen, q(rng,
    `Boundary line: Which sentence matches today’s boundary style best?`,
    bp.boundaryLine,
    ["I guess… maybe… if you want.", "Stop talking forever.", "Fine, whatever—just hurry."]
  ));

  uniqPush(out, seen, q(rng,
    `Tiny step: Why do tiny steps work better than huge promises?`,
    "They’re doable today, so they actually happen and build momentum",
    ["They prove you’re perfect", "They only matter if they’re huge", "They let you avoid doing anything real"]
  ));

  uniqPush(out, seen, q(rng,
    `Apply it: If you feel your “body alarm” rising, what should happen BEFORE you decide?`,
    "Lower the alarm first (breath/water/move), then decide",
    ["Decide immediately to get it over with", "Ignore it and push harder", "Ask someone to decide for you every time"]
  ));

  uniqPush(out, seen, q(rng,
    `Friend pressure: Which response shows “No + Switch”?`,
    "No thanks—let’s do something else.",
    ["Maybe—don’t tell anyone.", "Okay fine, I’ll do it.", "You’re annoying, whatever."]
  ));

  uniqPush(out, seen, q(rng,
    `Skill test: What makes a choice “safe” long-term?`,
    "It helps now and doesn’t create problems later",
    ["It feels exciting right now", "It’s something you must hide", "It gets you approval today"]
  ));

  uniqPush(out, seen, q(rng,
    `Real-life use: If you’re stuck, what’s a strong way to widen your options?`,
    "List a few options and pick the one with the cleanest “tomorrow”",
    ["Wait until you feel ready", "Do what others say", "Pick the fastest relief no matter what"]
  ));

  uniqPush(out, seen, q(rng,
    `Tiny step match: Which is closest to today’s tiny step?`,
    bp.tinyStep,
    ["A huge impossible promise", "Wait until you feel motivated", "Try to do everything at once"]
  ));

  uniqPush(out, seen, q(rng,
    `Reflection prep: Which reflection question fits today?`,
    bp.reflection,
    ["What’s the coolest thing you could do?", "How do you hide mistakes better?", "Who should you impress next?"]
  ));

  // safety: force exactly 12
  return out.slice(0, 12);
}

// --- Load curriculum.js in a sandbox so window.CURR gets created ---
function loadCURR(curriculumPath){
  const code = fs.readFileSync(curriculumPath, "utf8");
  const sandbox = {
    window: {},
    console,
  };
  vm.createContext(sandbox);
  vm.runInContext(code, sandbox, { filename: "curriculum.js" });
  const CURR = sandbox.window.CURR;
  if(!CURR || !CURR.TRACKS || !CURR.CURRICULUM_BY_TRACK || !CURR.BLUEPRINTS_BY_TRACK){
    throw new Error("Failed to load window.CURR from curriculum.js");
  }
  return CURR;
}

function main(){
  const root = process.cwd();
  const curriculumPath = path.join(root, "public", "curriculum.js");
  const outPath = path.join(root, "public", "quizzes_alcohol.js");

  const CURR = loadCURR(curriculumPath);

  const track = "alcohol";
  const days = CURR.CURRICULUM_BY_TRACK[track];
  const bps  = CURR.BLUEPRINTS_BY_TRACK[track];

  if(!Array.isArray(days) || days.length !== 60) throw new Error("general curriculum missing/incorrect length");
  if(!Array.isArray(bps)  || bps.length  !== 60) throw new Error("general blueprints missing/incorrect length");

  const byDay = {};
  for(let i = 0; i < 60; i++){
    const dayObj = days[i];
    const bp = bps[i];
    const qs = buildDayQuestions(dayObj, bp);
    if(qs.length !== 12) throw new Error(`Day ${dayObj.day}: expected 12 questions, got ${qs.length}`);
    byDay[String(dayObj.day)] = qs;
  }

  const file = `/* public/quizzes_general.js
   Auto-generated. DO NOT EDIT BY HAND.
   Track: general (60 days * 12 questions)
*/
"use strict";
window.QUIZZES = window.QUIZZES || {};
window.QUIZZES.general = ${JSON.stringify(byDay, null, 2)};
console.log("quizzes_general.js loaded", Object.keys(window.QUIZZES.general).length, "days");
`;

  fs.writeFileSync(outPath, file, "utf8");
  console.log("Wrote:", outPath);
}

main();
