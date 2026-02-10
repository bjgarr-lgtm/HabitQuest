/* habitquest_authored.js
   Hand-authored Habit Quest events (Days 1–60)
   - “Hardcoded” content: day-specific prompts + multi-step nodes per day (~5 min reading/choices)
   - Boss days: every 7th day + Day 30
   - Multiple endings: Clean Win / Recovery Win / Consequence / Boss Clear
   Requires: habitquest.js loaded first and exposes window.HQ.registerNodes(map)
*/
"use strict";

(function(){
  if(!window.HQ || typeof window.HQ.registerNodes !== "function"){
    console.error("HQ engine not loaded (or missing registerNodes) before habitquest_authored.js");
    return;
  }

  const A = {}; // authored nodes: nodeId -> node

  // ---------- helpers ----------
  const clamp = (n,min,max)=> Math.max(min, Math.min(max,n));
  const safeNum = (x,f=0)=> (Number.isFinite(Number(x)) ? Number(x) : f);
  const safeStr = (x,f="")=> (typeof x === "string" ? (x.trim() || f) : f);

  function isBossDay(day){
    day = safeNum(day, 1);
    return (day % 7 === 0) || (day === 30);
  }

  function ending(day, label, text, effects){
    return {
      chapter: `Day ${day} — ${label}`,
      text: () => text,
      choices: [
        { text:"Exit", good:true, effects: effects || {}, end:true }
      ]
    };
  }

  function stepNode(day, stepN, title, text, choices){
    return {
      chapter: `Day ${day} — ${title}`,
      text: () => text,
      choices: Array.isArray(choices) ? choices : []
    };
  }

  // Day-specific “hardcoded” flavor (60 entries each)
  const SETTINGS = [
    "after school at the bus stop","at lunch with a noisy table","in a group chat that won’t stop buzzing",
    "walking home with someone talking big","late night when you can’t sleep","at a friend’s house with snacks out",
    "on a weekend hangout","during a boring study hall","in the hallway before class",
    "right after practice","while waiting for a ride","at a sleepover",
    "in a game party chat","when you’re home alone for a bit","during a stressful week",
    "at the mall food court","in the back seat of a car ride","when a notification pops up",
    "when you feel left out","when you feel bored and restless","when you feel annoyed",
    "when you feel anxious","when you feel hyped up","when you feel lonely",
    "when you feel embarrassed","when you feel pressured to be funny","when you feel pressured to be tough",
    "when you feel tired","when you feel angry","when you feel sad",
    "when you feel numb","when you feel FOMO","when you feel behind",
    "when you feel overwhelmed","when you feel unmotivated","when you feel distracted",
    "when you feel like proving something","when you feel judged","when you feel misunderstood",
    "when you feel stuck","when you feel “whatever”","when you feel like quitting",
    "when you feel like scrolling forever","when you feel like hiding","when you feel like snapping",
    "when you feel like giving in","when you feel like escaping","when you feel like copying others",
    "when you feel like arguing","when you feel like overthinking","when you feel like ghosting",
    "when you feel like saying yes to fit in","when you feel like showing off","when you feel like testing limits",
    "when you feel like making a risky joke","when you feel like pushing a boundary","when you feel like “just once”",
    "when you feel like “everyone else does”","when you feel like “it won’t matter”","when you feel like “I deserve it”"
  ];

  const PRESSURE_LINES = [
    "“Come on. Don’t be lame.”","“Everyone’s doing it.”","“Just try it once.”","“If you say no, you’re scared.”",
    "“Don’t tell anyone.”","“It’s not a big deal.”","“You owe me.”","“Prove you’re loyal.”",
    "“You’ll be the only one not doing it.”","“Stop being dramatic.”","“It’ll make you feel better.”","“You need this.”"
  ];

  const TOOLS = [
    "Pause + 4 breaths","Time‑Zoom (tomorrow check)","Boundary + Switch","Exit Plan",
    "Text Support","Tiny Step Reset","Name the Feeling","Body Check (water/food/sleep)",
    "2‑Minute Move","Delay Timer (10 minutes)","Plan Ahead","Self‑respect script"
  ];

  const MYTHS = [
    "“I have to prove something.”","“If I say no, I’ll lose everyone.”","“If I feel this bad, I need an escape.”",
    "“One time can’t hurt.”","“I can handle it better than others.”","“I’ll fix it tomorrow.”",
    "“I’m already behind, so it doesn’t matter.”","“If I don’t do it, I’ll look weak.”"
  ];

  function pickFrom(arr, idx){
    return arr[(idx % arr.length + arr.length) % arr.length];
  }

  // ---------- 5-minute day template ----------
  // Each day: intro -> 6 steps -> checkpoint -> twist/boss -> ending
  // Roughly 8–10 screens of text+choices.
  function buildDay(day){
    const boss = isBossDay(day);

    const setting = pickFrom(SETTINGS, day-1);
    const pressure = pickFrom(PRESSURE_LINES, day+2);
    const tool = pickFrom(TOOLS, day+4);
    const tool2 = pickFrom(TOOLS, day+7);
    const myth = pickFrom(MYTHS, day+1);

    const id0  = `hq_day_${day}`;
    const id1  = `hq_day_${day}_1`;
    const id2  = `hq_day_${day}_2`;
    const id3  = `hq_day_${day}_3`;
    const id4  = `hq_day_${day}_4`;
    const id5  = `hq_day_${day}_5`;
    const id6  = `hq_day_${day}_6`;
    const id7  = `hq_day_${day}_7`;
    const id8  = `hq_day_${day}_8`;
    const idEND_CLEAN = `hq_day_${day}_end_clean`;
    const idEND_REC   = `hq_day_${day}_end_recover`;
    const idEND_CONS  = `hq_day_${day}_end_consequence`;
    const idEND_BOSS  = `hq_day_${day}_end_boss`;

    // Intro node
    A[id0] = {
      chapter: boss ? `Day ${day} — 🔥 BOSS TEST` : `Day ${day} — Daily Run`,
      text: () => (
`Setting: ${setting}

A moment shows up that tries to steer you off-track.
Someone hits you with:
${pressure}

Your body reacts first (tight chest / hot face / racing thoughts).
Today’s goal: practice the skill *on purpose* — not perfect, just real.

Pick your first move.`
      ),
      choices: [
        { text:`Use ${tool}`, good:true, effects:{ xp:+10, wisdom:+1 }, why:`You choose on purpose. Tool: ${tool}.`, next:id1 },
        { text:`Delay 10 seconds (buy time)`, good:true, effects:{ xp:+6 }, why:"Buying time breaks autopilot.", next:id1 },
        { text:`Go quiet and hope it stops`, good:false, effects:{}, why:"Silence often invites more pressure.", next:id1 },
      ]
    };

    // Step 1: label the moment
    A[id1] = stepNode(
      day, 1, "Name the Moment",
`Quick check:
1) What’s the pressure?
2) What’s the cost tomorrow?
3) What do *you* want to stand for?

A thought pops up:
${myth}

What do you do with that thought?`,
      [
        { text:"Name it as a myth and move anyway", good:true, effects:{ xp:+10, wisdom:+1 }, why:"Thoughts aren’t commands.", next:id2 },
        { text:"Argue with it for 2 minutes", good:false, effects:{}, why:"Arguing can trap you in your head.", next:id2 },
        { text:"Text support: “pressure moment. remind me why no?”", good:true, effects:{ xp:+8, wisdom:+1 }, why:"Support makes it easier.", next:id2 },
      ]
    );

    // Step 2: pick a boundary line
    A[id2] = stepNode(
      day, 2, "Boundary Line",
`You need a short line you can repeat.
It should be:
- simple
- calm
- doesn’t invite debate

Pick your line:`,
      [
        { text:"“No thanks.” (repeatable)", good:true, effects:{ xp:+10 }, why:"Short + steady works.", next:id3 },
        { text:"“I’m good—let’s do something else.”", good:true, effects:{ xp:+12 }, why:"No + switch plan.", next:id3 },
        { text:"“Maybe later.” (keeps door open)", good:false, effects:{}, why:"‘Maybe’ often becomes pressure later.", next:id3 },
      ]
    );

    // Step 3: handle the pushback
    A[id3] = stepNode(
      day, 3, "Pushback",
`They push again.
Your brain wants a fast escape: joke, snap, or fold.

Choose how you handle pushback:`,
      [
        { text:"Repeat boundary + switch (same tone)", good:true, effects:{ xp:+12, wisdom:+1 }, why:"Consistency ends debates.", next:id4 },
        { text:"Exit plan: step away / change room / end chat", good:true, effects:{ xp:+12 }, why:"Safety beats winning.", next:id4 },
        { text:"Prove yourself (get louder / tougher)", good:false, effects:{ hearts: (boss ? -2 : -1) }, why:"Proving is a trap.", next:id4 },
      ]
    );

    // Step 4: body reset (prevents spiral)
    A[id4] = stepNode(
      day, 4, "Body Reset",
`Your body is still lit up.
If you don’t lower the stress signal, the next choice gets harder.

Pick a reset:`,
      [
        { text:"4 slow breaths", good:true, effects:{ xp:+8 }, why:"Calms your body fast.", next:id5 },
        { text:"Drink water / quick snack", good:true, effects:{ xp:+8 }, why:"Brain fuel helps choices.", next:id5 },
        { text:"Scroll to numb out", good:false, effects:{}, why:"Numbing can extend the stress.", next:id5 },
      ]
    );

    // Step 5: second wave (temptation)
    A[id5] = stepNode(
      day, 5, "Second Wave",
`The moment doesn’t fully end — there’s a second wave.
A chance to “just go along” shows up.

Use a second tool to lock in the win.`,
      [
        { text:`Use ${tool2} + take one tiny action`, good:true, effects:{ xp:+12, wisdom:+1 }, why:`Tool stack: ${tool2}.`, next:id6 },
        { text:"Ask for backup: “Can we switch plans?”", good:true, effects:{ xp:+10 }, why:"You recruit the room.", next:id6 },
        { text:"Give a vague answer to escape", good:false, effects:{}, why:"Vague answers keep pressure alive.", next:id6 },
      ]
    );

    // Step 6: checkpoint
    A[id6] = stepNode(
      day, 6, "Checkpoint",
`Checkpoint:
- Did you protect Future You?
- Did you keep your dignity?
- Did you lower risk?

Now pick how you finish the day:`,
      [
        { text:"Clean finish: boundary + exit + reset", good:true, effects:{ xp:+14 }, why:"That’s the full skill loop.", next:id7 },
        { text:"Recovery finish: you slipped a bit but course-correct now", good:true, effects:{ xp:+10 }, why:"Recovery is a real win.", next:id7 },
        { text:"Consequence finish: you ignore warnings and roll the dice", good:false, effects:{ hearts:(boss ? -2 : -1) }, why:"Risk usually charges interest.", next:id7 },
      ]
    );

    // Step 7: twist / boss gate
    A[id7] = stepNode(
      day, 7, boss ? "Boss Gate" : "Tiny Twist",
boss
? `🔥 Boss Gate:
A harder version shows up *right at the end*.
This is when people usually fold: tired, stressed, “whatever.”

Choose your boss move:`
: `A small twist: one more message / one more invite / one more urge.
Not huge — but this is where streaks are made.

Choose your last move:`,
      boss
      ? [
          { text:"Boss clear: repeat boundary, leave, and text support", good:true, effects:{ xp:+18, wisdom:+2 }, why:"That’s a boss counter.", next:id8 },
          { text:"Boss clear: calm body first, then decide", good:true, effects:{ xp:+16, wisdom:+2 }, why:"Body calm = brain online.", next:id8 },
          { text:"Fold at the end (common)", good:false, effects:{ hearts:-2 }, why:"Boss days punish autopilot.", next:id8 },
        ]
      : [
          { text:"Stick to your plan (repeat + switch)", good:true, effects:{ xp:+12 }, why:"Consistency wins.", next:id8 },
          { text:"Exit immediately (clean)", good:true, effects:{ xp:+12 }, why:"Leaving is allowed.", next:id8 },
          { text:"Engage in debate (drains you)", good:false, effects:{}, why:"Debate invites more pressure.", next:id8 },
        ]
    );

    // Step 8: resolution -> endings
    A[id8] = stepNode(
      day, 8, "Wrap + Reflection",
`Wrap it up:
1) What did you do that worked?
2) What would you say next time (one sentence)?
3) What tiny step keeps you safe today?

Pick your ending based on how you played it.`,
      [
        { text:"End with a Clean Win", good:true, effects:{ xp:+10, tokens:+1 }, why:"Clean win earns progress.", next: boss ? idEND_BOSS : idEND_CLEAN },
        { text:"End with a Recovery Win", good:true, effects:{ xp:+8 }, why:"Recovery builds confidence.", next: idEND_REC },
        { text:"End with a Consequence (learn + move on)", good:false, effects:{ xp:+4 }, why:"You can learn without spiraling.", next: idEND_CONS },
      ]
    );

    // Endings (multiple)
    A[idEND_CLEAN] = ending(
      day,
      "Clean Win ✅",
`You kept it simple and safe.
No speeches. No proving. Just calm strength.

Tomorrow-you is protected.
That’s the whole point.`,
      { xp:+18, tokens:+1, wisdom:+1, flag:{ key:`hq_done_${day}`, value:true } }
    );

    A[idEND_REC] = ending(
      day,
      "Recovery Win 🔁",
`Not perfect — but you course-corrected.
That’s a real skill: noticing and returning to your plan.

You don’t need perfection to improve.`,
      { xp:+14, flag:{ key:`hq_done_${day}`, value:true } }
    );

    A[idEND_CONS] = ending(
      day,
      "Consequence ⚠️",
`You feel the cost: stress, regret, or a messy vibe.
Here’s the power move: you *log it* and reset.

No shame spiral. Just data and a better plan next time.`,
      { xp:+8, flag:{ key:`hq_done_${day}`, value:true } }
    );

    A[idEND_BOSS] = ending(
      day,
      "Boss Clear 🔥",
`Boss day cleared.
You did the hard version: tired, pressured, and still chose yourself.

That’s how habits change.`,
      { xp:+30, tokens:+2, wisdom:+2, flag:{ key:`hq_done_${day}`, value:true } }
    );
  }

  // ---------- build all 60 authored days ----------
  for(let day=1; day<=60; day++){
    buildDay(day);
  }

  // Register into engine (authored overrides will win)
  window.HQ.registerNodes(A);
  console.log("[HQ] Authored Habit Quest days 1–60 loaded:", Object.keys(A).length, "nodes");
})();
