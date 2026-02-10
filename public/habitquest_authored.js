/* habitquest_authored.js
   Hand-authored Habit Quest events (Days 1–30)
   Overrides generator for specific days
*/
"use strict";

(function(){
  if(!window.HQ) {
    console.error("HQ engine not loaded before habitquest_authored.js");
    return;
  }

  const A = {}; // authored nodes

  /* =========================================================
     HELPER: create endings
  ========================================================= */
  function ending(day, type, text, effects){
    return {
      chapter: `Day ${day} — ${type}`,
      text: () => text,
      choices: [
        { text:"Exit", good:true, effects, end:true }
      ]
    };
  }

  /* =========================================================
     DAY 1 — First Pressure
  ========================================================= */
  A["hq_day_1"] = {
    chapter: "Day 1 — First Pressure",
    text: () =>
      `You’re in a group chat after school.
Someone says: “Come on, everyone’s doing it.”

Your stomach tightens. This is the first real test.`,
    choices: [
      { text:"Use a short no and change topic", good:true, effects:{ xp:+12, wisdom:+1 }, next:"hq_day_1_clean" },
      { text:"Say maybe and wait", good:false, effects:{}, next:"hq_day_1_shaky" },
      { text:"Ask a friend to back you up", good:true, effects:{ xp:+10, wisdom:+1 }, next:"hq_day_1_support" },
    ]
  };

  A["hq_day_1_clean"] = ending(
    1,
    "Clean Win",
    `You keep it simple.
The moment passes faster than you expected.

Confidence feels quieter than hype — but stronger.`,
    { xp:+15, tokens:+1 }
  );

  A["hq_day_1_shaky"] = {
    chapter: "Day 1 — Shaky Choice",
    text: () =>
      `You didn’t say yes… but you didn’t say no either.
The pressure lingers.`,
    choices: [
      { text:"Reset and set a boundary now", good:true, effects:{ xp:+8 }, next:"hq_day_1_recover" },
      { text:"Go along to avoid tension", good:false, effects:{ hearts:-1 }, next:"hq_day_1_consequence" },
    ]
  };

  A["hq_day_1_support"] = ending(
    1,
    "Support Win",
    `Your friend backs you instantly.
You’re not alone — and you didn’t have to explain.`,
    { xp:+14, tokens:+1, wisdom:+1 }
  );

  A["hq_day_1_recover"] = ending(
    1,
    "Recovery Win",
    `You course-correct.
Not perfect — but strong.`,
    { xp:+10 }
  );

  A["hq_day_1_consequence"] = ending(
    1,
    "Consequence",
    `You feel off afterward.
This didn’t match who you want to be.`,
    { xp:+4 }
  );

  /* =========================================================
     DAY 2 — Boredom Trap
  ========================================================= */
  A["hq_day_2"] = {
    chapter: "Day 2 — Boredom Trap",
    text: () =>
      `You’re home. Nothing to do.
Your brain whispers: “Just scroll… just something.”`,
    choices: [
      { text:"Pick a planned boredom breaker", good:true, effects:{ xp:+12 }, next:"hq_day_2_clean" },
      { text:"Scroll without thinking", good:false, effects:{}, next:"hq_day_2_shaky" },
    ]
  };

  A["hq_day_2_clean"] = ending(
    2,
    "Clean Win",
    `You move your body and reset.
Five minutes was enough.`,
    { xp:+14, tokens:+1 }
  );

  A["hq_day_2_shaky"] = {
    chapter: "Day 2 — Time Slip",
    text: () =>
      `Thirty minutes disappear.
You feel more tired than before.`,
    choices: [
      { text:"Stop now and reset", good:true, effects:{ xp:+8 }, next:"hq_day_2_recover" },
      { text:"Keep going", good:false, effects:{ hearts:-1 }, next:"hq_day_2_consequence" },
    ]
  };

  A["hq_day_2_recover"] = ending(
    2,
    "Recovery Win",
    `Stopping late still counts as stopping.`,
    { xp:+9 }
  );

  A["hq_day_2_consequence"] = ending(
    2,
    "Consequence",
    `Sleep takes a hit.
Tomorrow will be harder.`,
    { xp:+4 }
  );

  /* =========================================================
     DAYS 3–30 — TEMPLATE (AUTHORED BUT FAST)
     You can expand any day later without touching engine
  ========================================================= */
  for(let day = 3; day <= 30; day++){
    A[`hq_day_${day}`] = {
      chapter: `Day ${day} — Choice Moment`,
      text: () =>
        `Day ${day}.
A familiar situation shows up again.

You recognize the pattern now.`,
      choices: [
        { text:"Use the tool you’ve been practicing", good:true, effects:{ xp:+12 }, next:`hq_day_${day}_clean` },
        { text:"Hesitate", good:false, effects:{}, next:`hq_day_${day}_shaky` },
      ]
    };

    A[`hq_day_${day}_clean`] = ending(
      day,
      "Clean Win",
      `You act with less effort than before.
This is getting easier.`,
      { xp:+15, tokens:+1 }
    );

    A[`hq_day_${day}_shaky`] = {
      chapter: `Day ${day} — Wobble`,
      text: () =>
        `Old habits tug at you.
This is where practice matters.`,
      choices: [
        { text:"Recover", good:true, effects:{ xp:+8 }, next:`hq_day_${day}_recover` },
        { text:"Ignore the warning", good:false, effects:{ hearts:-1 }, next:`hq_day_${day}_consequence` },
      ]
    };

    A[`hq_day_${day}_recover`] = ending(
      day,
      "Recovery Win",
      `You didn’t spiral.
That matters.`,
      { xp:+10 }
    );

    A[`hq_day_${day}_consequence`] = ending(
      day,
      "Consequence",
      `You feel the cost.
You log it — and move on.`,
      { xp:+5 }
    );
  }

  /* =========================================================
     PATCH INTO HQ ENGINE
  ========================================================= */
  const originalGetNode = window.HQ.getNode;

  window.HQ.getNode = function(nodeId, ctx){
    if(A[nodeId]) return A[nodeId];
    return originalGetNode(nodeId, ctx);
  };

  console.log("[HQ] Authored Habit Quest days 1–30 loaded");
})();
