/* habitquest.js — V1 engine + node library + 60-day generator
   Loads AFTER curriculum.js, BEFORE app.js
*/
"use strict";

(function(){
  // tiny helpers (engine-local)
  const clamp = (n,min,max)=> Math.max(min, Math.min(max,n));
  const safeNum = (x,f=0)=> (Number.isFinite(Number(x)) ? Number(x) : f);
  const safeStr = (x,f="")=> (typeof x === "string" ? (x.trim() || f) : f);

  // deterministic RNG (same as app.js but self-contained)
  function mulberry32(seed){
    let t = seed >>> 0;
    return function(){
      t += 0x6D2B79F5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  // read curriculum blueprints safely
  function getBlueprint(track, day){
    const CURR = window.CURR;
    const t = (track && CURR?.BLUEPRINTS_BY_TRACK?.[track]) ? track : "general";
    const arr = CURR?.BLUEPRINTS_BY_TRACK?.[t] || CURR?.BLUEPRINTS_BY_TRACK?.general || [];
    const idx = clamp(safeNum(day,1), 1, Math.max(1, arr.length)) - 1;
    return arr[idx] || arr[0] || {};
  }
  function getTrackName(track){
    const CURR = window.CURR;
    return CURR?.TRACKS?.[track]?.name || "General";
  }

  // -------------------------
  // Base “hub” nodes (small)
  // -------------------------
  const BASE_NODES = {
    hq_start: {
      chapter: "Habit Quest",
      text: (ctx) =>
        `Welcome to Habit Quest. You’ll practice safer choices in small daily adventures.\n\nReady to start Day 1?`,
      choices: [
        { text:"Start Day 1", good:true, effects:{ xp:+10 }, why:"Let’s go.", next:"hq_day_1" },
      ]
    },
    hq_daily_hub: {
      chapter: "Habit Quest",
      text: (ctx) => {
        const day = safeNum(ctx?.hqDay, 1);
        const track = safeStr(ctx?.track, "general");
        const tName = getTrackName(track);
        return `Daily Hub — Track: ${tName}\n\nPick your run for Day ${day}.`;
      },
      choices: [
        { text:"Play today’s run", good:true, effects:{}, why:"Daily practice is how habits stick.", next:"__AUTO_DAY__" },
        { text:"Replay yesterday (practice)", good:true, effects:{}, why:"Practice builds confidence.", next:"__AUTO_YESTERDAY__" },
        { text:"Jump to a day…", good:true, effects:{}, why:"Review any day you want.", next:"hq_jump_day" },
      ]
    },
    hq_jump_day: {
      chapter: "Habit Quest",
      text: () => `Pick a day number nodeId like: hq_day_12`,
      choices: [
        { text:"Back", good:true, effects:{}, why:"Back to hub.", next:"hq_daily_hub" }
      ]
    }
  };

  // Authored node library (overrides generator)
const AUTHORED_NODES = {}; // nodeId -> node object

function registerNodes(map){
  if(!map || typeof map !== "object") return;
  for(const [id, node] of Object.entries(map)){
    if(!id || !node) continue;
    AUTHORED_NODES[id] = node;
  }
}

function isBossDay(day){
  day = safeNum(day, 1);
  return (day % 7 === 0) || (day === 30);
}

const RANDOM_EVENTS = [
  {
    id: "ev_bonus_breath",
    text: () => "🎁 Random Event: You notice your body is tense. Want a 20‑second reset?",
    choices: [
      { text:"Do 4 slow breaths", good:true, effects:{ xp:+8, wisdom:+1 }, why:"Fast calm = better choices.", next:"__RETURN__" },
      { text:"Skip it",           good:true, effects:{},                 why:"Okay. Keep going.",          next:"__RETURN__" },
    ]
  },
  {
    id: "ev_friend_check",
    text: () => "🎁 Random Event: A friend texts ‘you good?’ What do you do?",
    choices: [
      { text:"Be honest + ask for a plan", good:true, effects:{ xp:+10, wisdom:+1 }, why:"Support is strength.", next:"__RETURN__" },
      { text:"Say ‘fine’ and isolate",     good:false,effects:{ hearts:-1 },         why:"Isolation increases risk.", next:"__RETURN__" },
    ]
  },
  {
    id: "ev_tiny_win",
    text: () => "🎁 Random Event: Tiny win opportunity. Pick one:",
    choices: [
      { text:"Drink water",          good:true, effects:{ xp:+6 }, why:"Energy + mood help choices.", next:"__RETURN__" },
      { text:"Put phone away 2 min", good:true, effects:{ xp:+6 }, why:"Interrupts autopilot.",       next:"__RETURN__" },
    ]
  }
];

function maybeInjectRandomEvent(rng, chance=0.35){
  return (rng() < chance) ? pick(rng, RANDOM_EVENTS) : null;
}



  // ---------------------------------------------------------
  // 60-day generator: creates 1 “mini story” per day with branches
  // nodeId format: hq_day_<N>, plus internal nodes hq_day_<N>_a/_b/_c
  // ---------------------------------------------------------
  function buildDayNodes(track, day, ctx){
    const bp = getBlueprint(track, day);
    const seed = (safeNum(day,1) * 9973) ^ (track.length * 101);
    const rng = mulberry32(seed);

    // --- adaptive difficulty inputs ---
    const boss = (day % 7 === 0); // example: every 7th day is a boss day (change if you want)

    // diff: -1 = struggling, 0 = normal, +1 = thriving
    // (replace this with your real diff logic if you already have it)
    const diff = 0;

    // --- derived numbers used by node rewards/penalties ---
    const heartPenalty = diff <= -1 ? -1 : (boss ? -2 : -1);
    // struggling => lighter penalty, boss day => heavier penalty

    const xpTool = diff >= 1 ? (boss ? 20 : 12) : (boss ? 18 : 10);
    const xpSupport = diff <= -1 ? (boss ? 16 : 10) : (boss ? 14 : 8);

    const eventChance = diff <= -1 ? 0.55 : (boss ? 0.55 : 0.35);


    const tool = safeStr(bp.toolName, "Tool");
    const scenario = safeStr(bp.scenario, "A pressure moment shows up.");
    const plan = safeStr(bp.safePlan, "Pause → choose the safer option.");
    const boundary = safeStr(bp.boundaryLine, "No thanks.");
    const myth = safeStr(bp.myth, "I have to prove something.");
    const tiny = safeStr(bp.tinyStep, "Do one small step.");
    const reflection = safeStr(bp.reflection, "What will you do differently next time?");
    
    const villains = [
      "The Loop (autopilot)", "The Crowd (pressure)", "The Spike (big emotions)",
      "The Scroll (distraction)", "The Shortcut (bad tradeoffs)", "The Fog (confusion)"
    ];
    const settings = [
      "after school", "at a hangout", "in a group chat", "on a late night",
      "during a stressful week", "when you feel bored"
    ];

    const villain = pick(rng, villains);
    const setting = pick(rng, settings);

    const id0 = `hq_day_${day}`;
    const idA = `hq_day_${day}_a`;
    const idB = `hq_day_${day}_b`;
    const idC = `hq_day_${day}_c`;
    const idEnd = `hq_day_${day}_end`;
    const idEvent = `hq_day_${day}_event`;

    const introText = (ctx) => {
      const tName = getTrackName(track);
      return `Day ${day} — ${tName}\n\nSetting: ${setting}\nThreat: ${villain}\n\nScenario:\n${scenario}`;
    };

    // Branch outcomes:
    // A = clean choice
    // B = shaky choice (cost heart, still continue)
    // C = support choice (wisdom)
    const nodes = {};

    nodes[id0] = {
      chapter: boss ? `Day ${day} — BOSS` : `Day ${day}`,
      text: (ctx) => {
        const tName = getTrackName(track);
        const header = boss
          ? `🔥 BOSS DAY ${day} — ${tName}\n\nA harder pressure test shows up. Bigger rewards.`
          : `Day ${day} — ${tName}`;
        return `${header}\n\nSetting: ${setting}\nThreat: ${villain}\n\nScenario:\n${scenario}`;
      },
      choices: boss ? [
        { text:`Use the tool under pressure: ${tool}`, good:true, effects:{ wisdom:+2, xp:+18 }, why:`Boss clear: ${tool}`, next:idA },
        { text:`Freeze / go autopilot`,                good:false, effects:{ hearts:-2 },         why:`Boss days punish autopilot.`, next:idB },
        { text:`Call in support + exit plan`,          good:true, effects:{ wisdom:+2, xp:+14 }, why:`Support is a boss counter.`, next:idC },
      ] : [
        { text:`Use the tool: ${tool}`,               good:true,  effects:{ wisdom:+1, xp: xpTool },   why:`Use ${tool} to stay safe.`,                  next:idA },
        { text:`Get support (text/ask someone safe)`, good:true,  effects:{ wisdom:+1, xp: xpSupport }, why:"Support helps you choose safer options.",     next:idC },
        { text:`Go with the crowd / impulse`,         good:false, effects:{ hearts: heartPenalty }, why:"Following impulse may cost you later.",      next:idB }
      ]
    };

    const ev = maybeInjectRandomEvent(rng, boss ? 0.55 : 0.35);
    if(ev){
      nodes[idEvent] = {
        chapter: `Day ${day} — Event`,
        text: ev.text,
        choices: ev.choices.map(c => ({ ...c, next: idEnd }))
      };
    }


    nodes[idA] = {
      chapter: `Day ${day}`,
      text: () =>
        `Nice. You used: ${tool}.\n\nSafe plan:\n${plan}\n\nBoundary line:\n“${boundary}”`,
      choices: [
        { text:"Face the next moment", good:true, effects:{ xp:+10 }, why:"Keep it simple: reset → speak → move.", next:idEnd },
      ]
    };

    nodes[idB] = {
      chapter: `Day ${day}`,
      text: () =>
        `Oof. You took the shaky path.\n\nMyth that showed up:\n“${myth}”\n\nYou can still recover right now.`,
      choices: [
        { text:`Reset and use the tiny step`, good:true, effects:{ xp:+6 }, why:`Tiny step: ${tiny}`, next:idEnd },
        { text:`Double down (risky)`, good:false, effects:{ hearts:-1 }, why:"Doubling down usually costs tomorrow.", next:idEnd },
      ]
    };

    nodes[idC] = {
      chapter: `Day ${day}`,
      text: () =>
        `Good call getting support.\n\nNow do one small action:\n${tiny}\n\nThen choose your next step.`,
      choices: [
        { text:"Do the clean next step", good:true, effects:{ xp:+10 }, why:"Support + action = progress.", next:idEnd },
      ]
    };

    nodes[idEnd] = {
      chapter: `Day ${day} Complete`,
      text: () =>
        `Day ${day} complete ✅\n\nReflection:\n${reflection}\n\nCome back tomorrow for the next run.`,
      choices: [
        // end:true tells app.js to show Exit button behavior you already have
        { 
          text:"Exit",
          good:true,
          effects: boss
            ? { xp:+25, tokens:+2, wisdom:+1 }
            : { xp:+12, tokens:+1 },
          why: boss ? "Boss cleared. Big progress." : "Daily progress earned.",
          end:true
        }
      ]
    };

    return nodes;
  }

  // Prebuild 60-day nodes for each track so Story Map can list them
  function buildAllNodes(){
    const out = { ...BASE_NODES };
    const CURR = window.CURR;
    const tracks = Object.keys(CURR?.TRACKS || { general:true });

    for(const track of tracks){
      for(let day=1; day<=60; day++){
        // namespace by track so you can expand later without collisions
        // v1: keep nodeId simple (hq_day_N) and use selectedTrack in ctx to decide content
        // For now we generate using selected track at runtime via getNode().
        // But we still list “generic” ids for map convenience.
        out[`hq_day_${day}__${track}`] = { __alias:true, track, day };
      }
    }
    return out;
  }

  const NODE_INDEX = buildAllNodes();

  function resolveAutoNext(next, ctx){
    if(next === "__AUTO_DAY__"){
      const d = clamp(safeNum(ctx?.hqDay, 1), 1, 60);
      return `hq_day_${d}`;
    }
    if(next === "__AUTO_YESTERDAY__"){
      const d = clamp(safeNum(ctx?.hqDay, 1) - 1, 1, 60);
      return `hq_day_${d}`;
    }
    return next;
  }

  function getNode(nodeId, ctx){
    const id = safeStr(nodeId, "hq_start");

    // 1) authored overrides win
    if(AUTHORED_NODES[id]) return AUTHORED_NODES[id];

    // 2) generated day nodes
    const m = id.match(/^hq_day_(\d+)(?:_(a|b|c|end))?$/);
    if(m){
      const day = clamp(safeNum(m[1], 1), 1, 60);
      const track = safeStr(ctx?.track, "general");
      const dayNodes = buildDayNodes(track, day, ctx);

      // allow overriding generated subnodes too (if you want)
      if(AUTHORED_NODES[id]) return AUTHORED_NODES[id];

      return dayNodes[id] || dayNodes[`hq_day_${day}`];
    }

    // 3) base nodes
    const base = BASE_NODES[id] || BASE_NODES.hq_start;
    return {
      ...base,
      choices: (base.choices || []).map(c => ({ ...c, next: resolveAutoNext(c.next, ctx) }))
    };
  }


  function listNodeIds(){
    // list base nodes + “day shells” so map can show something
    return Object.keys(NODE_INDEX);
  }

  // Expose the engine
  window.HQ = { getNode, listNodeIds, registerNodes };
})();
