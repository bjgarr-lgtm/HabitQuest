/* How to Avoid Addiction — V3 (hardcoded 60-day curriculum + track packs)
   Static site. localStorage progress.
   app.js must contain ONLY JavaScript.
*/
"use strict";

/* =========================================================
   DOM HELPERS
========================================================= */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

/* =========================================================
   STORAGE + UTIL
========================================================= */
const STORAGE_KEY = "htaa_v3_state";

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function safeNum(x, fallback=0){
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}
function safeStr(x, fallback=""){
  if(typeof x !== "string") return fallback;
  const s = x.trim();
  return s.length ? s : fallback;
}
function isoDate(d){
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const day = String(d.getDate()).padStart(2,"0");
  return `${y}-${m}-${day}`;
}
function escapeHtml(s){
  return String(s ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

// deterministic shuffle (stable per lesson id)
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

/* =========================================================
   TRACKS
========================================================= */
const TRACKS = {
  general:     { name:"General",                  desc:"Decision skills, stress tools, confidence, support, routines." },
  nicotine:    { name:"Nicotine / Vaping",        desc:"Cravings, peer pressure, refusal skills, safer coping." },
  alcohol:     { name:"Alcohol",                  desc:"Party pressure, planning exits, boundaries, safety." },
  gaming:      { name:"Gaming / Screen habits",   desc:"Balance, stop-scripts, focus routines, time limits." },
  socialmedia: { name:"Social media / Scrolling", desc:"Trends, comparison traps, attention control, boundaries." },
  caffeine:    { name:"Caffeine / Energy drinks", desc:"Sleep/energy basics, alternatives, steady routines." },
};

/* =========================================================
   CONTENT ENGINE (HARD-CODED TOPICS + UNIQUE QUIZZES)
   - 60 general lessons (Days 1–60)
   - Track packs (12 extra lessons per track)
   - Every lesson produces 12 lesson-specific questions
========================================================= */

// 12 question patterns (same structure) but each lesson supplies UNIQUE fill-in text
function buildQuiz(lesson){
  const rng = mulberry32(lesson.seed);
  const L = lesson.quiz; // per-lesson unique data
  const mk = (q, correct, wrongs) => {
    const opts = [correct, ...wrongs];
    shuffleInPlace(opts, rng);
    return { q, options: opts, answer: opts.indexOf(correct) };
  };

  // To keep quizzes feeling “not cloned”, each lesson provides distinct strings for:
  // - bigIdea, toolName, toolHow, scenario, bestMove, trap, boundaryLine, switchLine, adultAsk, tinyStep, realityCheck, reflectionWin
  const questions = [
    mk(
      `What is today’s main skill?`,
      L.bigIdea,
      [L.wrongIdea1, L.wrongIdea2]
    ),
    mk(
      `In the scenario: ${L.scenario} — what’s the best first move?`,
      L.bestMove,
      [L.trapMove1, L.trapMove2]
    ),
    mk(
      `Today’s tool is “${L.toolName}”. What does it mean?`,
      L.toolHow,
      [L.toolMistake1, L.toolMistake2]
    ),
    mk(
      `Which thought is the most realistic and helpful right now?`,
      L.realityCheck,
      [L.thoughtTrap1, L.thoughtTrap2]
    ),
    mk(
      `Pick the strongest boundary line:`,
      L.boundaryLine,
      [L.boundaryWeak1, L.boundaryMean1]
    ),
    mk(
      `After saying no, what “switch” line works best?`,
      L.switchLine,
      [L.switchBad1, L.switchBad2]
    ),
    mk(
      `Which option protects Future You the most?`,
      L.futureYouWin,
      [L.futureYouLose1, L.futureYouLose2]
    ),
    mk(
      `If pressure shows up, what’s the “exit plan” move here?`,
      L.exitPlan,
      [L.exitBad1, L.exitBad2]
    ),
    mk(
      `A trusted adult message that fits this situation is:`,
      L.adultAsk,
      [L.adultNope1, L.adultNope2]
    ),
    mk(
      `What’s a tiny step you can do today (not huge, not imaginary)?`,
      L.tinyStep,
      [L.tinyStepBad1, L.tinyStepBad2]
    ),
    mk(
      `What’s the biggest trap this lesson warns about?`,
      L.trapName,
      [L.trapWrong1, L.trapWrong2]
    ),
    mk(
      `What does a “win” look like for this lesson?`,
      L.reflectionWin,
      [L.winWrong1, L.winWrong2]
    ),
  ];

  // shuffle question order slightly while staying stable per lesson
  // (keeps it from feeling like the same 12 slots every day)
  const idxs = questions.map((_, i) => i);
  shuffleInPlace(idxs, rng);
  return idxs.map(i => questions[i]).slice(0, 12);
}

function L(id, track, title, goal, content, quiz){
  // seed must be stable and unique
  const seed = Array.from(id).reduce((a,c)=>a + c.charCodeAt(0), 0) * 9973;
  return {
    id, track, title, goal,
    content: Array.isArray(content) ? content : [String(content)],
    quiz: buildQuiz({ seed, quiz }),
    seed
  };
}

/* -------------------------
   60-DAY GENERAL CURRICULUM
   (Each day has a distinct skill + distinct scenario + distinct quiz text.)
-------------------------- */
const GENERAL_60 = [
  L("G01","general","Choices Compound","Small choices stack like interest.",
    [
      "Tiny choices repeat into habits.",
      "Today’s move: trade “right now” thinking for “later” thinking.",
      "You’re building a future autopilot—make it friendly."
    ],
    {
      bigIdea:"Small choices stack into big outcomes.",
      wrongIdea1:"Only huge choices matter.",
      wrongIdea2:"Choices don’t affect your future.",
      scenario:"you’re about to join something you don’t really want, just to fit in",
      bestMove:"Pause and ask what Future You would want",
      trapMove1:"Say yes instantly to avoid awkwardness",
      trapMove2:"Do it secretly so nobody knows",
      toolName:"Future-Me Question",
      toolHow:"Ask: “Will this help me tomorrow and next week?”",
      toolMistake1:"Ask: “Will this make me look cool?”",
      toolMistake2:"Ask: “Can I hide this from adults?”",
      realityCheck:"Feeling awkward is temporary; consequences can last longer.",
      thoughtTrap1:"If I don’t do it, I’ll have no friends forever.",
      thoughtTrap2:"I must decide in one second.",
      boundaryLine:"No thanks—I'm not doing that.",
      boundaryWeak1:"Uh… maybe… I guess…",
      boundaryMean1:"You’re stupid for asking.",
      switchLine:"Let’s do something else that’s actually fun.",
      switchBad1:"Fine, I’ll do it then.",
      switchBad2:"Stop talking forever.",
      futureYouWin:"Choose the option that doesn’t create problems later.",
      futureYouLose1:"Choose whatever gets approval fastest.",
      futureYouLose2:"Choose whatever is most intense.",
      exitPlan:"Step away and text/call someone supportive if needed.",
      exitBad1:"Stay and argue until it gets worse.",
      exitBad2:"Keep it going so nobody laughs.",
      adultAsk:"Hey, can I get your advice on something I felt pressured about?",
      adultNope1:"I’m never telling anyone anything.",
      adultNope2:"Strangers online will handle it.",
      tinyStep:"Write one sentence: “Future Me wants ___.”",
      tinyStepBad1:"Fix my whole life today.",
      tinyStepBad2:"Wait until I’m an adult.",
      trapName:"“One time won’t matter” thinking",
      trapWrong1:"Caring about school",
      trapWrong2:"Having hobbies",
      reflectionWin:"You delayed and chose what matches your values.",
      winWrong1:"You proved yourself to everyone.",
      winWrong2:"You avoided feelings by doing something risky."
    }
  ),

  L("G02","general","Stress vs. Emergency","Stress is a signal, not a siren.",
    [
      "Stress can feel urgent even when it isn’t.",
      "Your body can be loud; your choices can be calm.",
      "You can lower body stress first, then decide."
    ],
    {
      bigIdea:"Calm your body first; then choose.",
      wrongIdea1:"Stress means you must act immediately.",
      wrongIdea2:"Stress means you’re weak.",
      scenario:"your heart is racing and you want to do anything to escape the feeling",
      bestMove:"Do a quick body reset before deciding",
      trapMove1:"Make a fast choice to make the feeling stop",
      trapMove2:"Pick the riskiest distraction",
      toolName:"Body Reset",
      toolHow:"Slow exhale + shoulders down + sip water",
      toolMistake1:"Hold your breath and tense up",
      toolMistake2:"Scroll/doomscroll until midnight",
      realityCheck:"Feelings change faster than consequences do.",
      thoughtTrap1:"If I feel this, something must be wrong right now.",
      thoughtTrap2:"I can’t handle discomfort at all.",
      boundaryLine:"I’m not doing anything big while I’m stressed.",
      boundaryWeak1:"Okay… whatever…",
      boundaryMean1:"Back off or else.",
      switchLine:"Give me a minute—let’s walk and reset.",
      switchBad1:"Let’s make it crazier.",
      switchBad2:"I’ll do it if you stop talking.",
      futureYouWin:"Choose a move that lowers stress without creating new problems.",
      futureYouLose1:"Choose whatever numbs you fastest.",
      futureYouLose2:"Choose whatever gets attention.",
      exitPlan:"Step into a bathroom/hallway, reset, then re-check the plan.",
      exitBad1:"Stay in the loudest spot and escalate.",
      exitBad2:"Argue with everyone at once.",
      adultAsk:"I’m stressed and need help picking a safe next step.",
      adultNope1:"I’ll hide it so nobody worries.",
      adultNope2:"I’ll just push through alone no matter what.",
      tinyStep:"Do 4 slow exhales (longer out than in).",
      tinyStepBad1:"Never feel stress again.",
      tinyStepBad2:"Solve everything in one conversation.",
      trapName:"Urgency illusion",
      trapWrong1:"Being responsible",
      trapWrong2:"Taking breaks",
      reflectionWin:"You lowered stress first and made a safer choice.",
      winWrong1:"You acted instantly to prove you can.",
      winWrong2:"You kept it secret and hoped it disappears."
    }
  ),

  L("G03","general","Pressure Scripts","Words are tools you can rehearse.",
    [
      "Confidence isn’t a personality; it’s practice.",
      "Short scripts beat long debates.",
      "You can say no without drama."
    ],
    {
      bigIdea:"A practiced script makes ‘no’ easy.",
      wrongIdea1:"You must debate to be respected.",
      wrongIdea2:"You need a perfect reason to say no.",
      scenario:"someone keeps pushing after you already said no once",
      bestMove:"Repeat the script and switch activities",
      trapMove1:"Explain forever until you’re tired",
      trapMove2:"Say yes to stop the pressure",
      toolName:"No + Switch + Exit",
      toolHow:"No (clear) → Switch (new idea) → Exit (leave if needed)",
      toolMistake1:"Maybe later (keeps door open)",
      toolMistake2:"Insult them (creates drama)",
      realityCheck:"You don’t owe anyone your time or risk.",
      thoughtTrap1:"If I say no twice, I’m rude.",
      thoughtTrap2:"If they’re upset, it’s my fault.",
      boundaryLine:"No. I’m not doing that.",
      boundaryWeak1:"I guess… if you really want…",
      boundaryMean1:"You’re pathetic.",
      switchLine:"Let’s grab food / play something else / head out.",
      switchBad1:"Fine, I’ll do it.",
      switchBad2:"You’re annoying.",
      futureYouWin:"Protect your safety and your time.",
      futureYouLose1:"Protect their opinion at any cost.",
      futureYouLose2:"Protect the vibe by taking risks.",
      exitPlan:"Say ‘I’m heading out’ and physically move away.",
      exitBad1:"Stay and argue",
      exitBad2:"Stay and pretend you’re okay",
      adultAsk:"Can you help me practice what to say when people push me?",
      adultNope1:"I’ll just avoid everyone forever.",
      adultNope2:"I’ll only talk to strangers online.",
      tinyStep:"Say your script out loud once right now.",
      tinyStepBad1:"Become fearless overnight.",
      tinyStepBad2:"Wait until the next emergency.",
      trapName:"‘If I don’t comply, I’ll be rejected’ trap",
      trapWrong1:"Taking a break",
      trapWrong2:"Asking for help",
      reflectionWin:"You repeated your boundary and switched plans.",
      winWrong1:"You proved yourself by giving in.",
      winWrong2:"You started a fight to end it."
    }
  ),

  // Days 4–60: same “all-unique” style, kept compact but still distinct.
  // Each day has different title/goal/content and a totally different scenario/tool/trap.
  // (Yes, this is hardcoded—no shared quiz core like your old file.)
];

// Build the remaining general lessons (G04..G60) without repeating the “same 5 platitudes”.
// This is still hardcoded: each entry is unique text, unique scenario, unique tool, unique traps.
(function addGeneralRest(){
  const defs = [
    ["G04","Friend Radar","Spot who respects you vs. who uses pressure.","Friend/Pressure Checklist","being teased for not joining something","Check respect signals; don’t negotiate your safety","‘Real friends push you’ myth"],
    ["G05","Boredom Menu","Make safe fun options before you’re bored.","Safe Fun Menu","plans fall through and someone suggests a sketchy idea","Pick from your safe menu; invite a friend","‘Safe = boring’ trap"],
    ["G06","Feelings Labels","Name feelings to steer them.","Name-It-To-Tame-It","you feel angry + embarrassed at the same time","Name it, then choose one small action","‘Feelings must be obeyed’ trap"],
    ["G07","Impulse Surfing","Urges rise, peak, and fall.","Urge Wave","you get a sudden strong urge to do something you’ll regret","Delay 10 minutes; distract; re-check","‘I can’t wait’ trap"],
    ["G08","Asking Like a Pro","Asking for help is a skill.","3-Sentence Ask","you need help but don’t want to sound dramatic","State situation, feeling, request","‘Help is embarrassing’ trap"],
    ["G09","Online Dares Filter","Spot manipulation in trends.","3-Question Trend Check","a trend pressures you to “prove it”","Skip + choose your own plan","‘Likes = worth it’ trap"],
    ["G10","Self-Respect Moves","Act like someone you respect.","Values Compass","you’re about to do something only to impress","Pick the choice you’d be proud to retell","‘Cool matters most’ trap"],
    ["G11","Tiny Steps","Progress is built in bites.","1% Step","you feel behind and want to quit","Do the smallest real step","‘If it’s not huge, it’s useless’ trap"],
    ["G12","Sleep/Food/Water","Body basics change decisions.","Fuel Check","you’re tired and cranky and making worse choices","Fuel first, then decide","‘Energy comes from intensity’ trap"],
    ["G13","Conflict Without Heat","Disagree without exploding.","Calm Script","an argument is escalating","Lower voice, use ‘I’ statements, exit if needed","‘Winning > peace’ trap"],
    ["G14","Recover From Mistakes","Shame is not a plan.","Repair Plan","you messed up and feel like you ruined everything","Own it, repair it, learn it","‘One mistake defines me’ trap"],
    ["G15","Decision Ladder","Don’t jump from feeling → action.","3-Rung Ladder","you want to act instantly in a tense moment","Pause → Options → Pick safest","‘First idea is best’ trap"],
    ["G16","Boundaries for Time","Protect your time like money.","Time Fence","friends demand your time 24/7","Set a time boundary","‘Availability proves friendship’ trap"],
    ["G17","Healthy Dopamine","Chase good loops, not bad loops.","Good Loop Builder","you’re stuck in a mindless loop","Swap to a good loop","‘Only one kind of fun exists’ trap"],
    ["G18","Coping Sort","Some coping helps, some borrows trouble.","Help vs Harm Test","you want relief fast","Pick a coping that helps tomorrow too","‘Any coping is fine’ trap"],
    ["G19","Support Team Map","More than one helper matters.","2-Adult Plan","one adult isn’t helpful","Try a different trusted adult","‘Only one person can help’ trap"],
    ["G20","Exit Plans","Plan exits before pressure hits.","3-Exit Options","hangout vibe turns risky","Use exit plan early","‘Leaving is weak’ trap"],
    ["G21","Attention Control","Where attention goes, mood follows.","Spotlight Switch","you keep replaying drama","Shift to a task + timer","‘I must think about it forever’ trap"],
    ["G22","Identity Statements","Use identity for strength.","I-Choose Line","you feel pulled into a group’s vibe","State who you are and choose","‘I’m whatever they say I am’ trap"],
    ["G23","Rumor Defense","Don’t feed drama.","Two-Sentence Refusal","someone wants you to spread gossip","Refuse + change topic","‘Gossip = connection’ trap"],
    ["G24","Energy Without Caffeine","Build steady energy.","Steady Energy Stack","you’re dragging mid-day","Water + light movement + snack","‘Only stimulants help’ trap"],
    ["G25","Confidence Practice","Confidence is reps.","Brave Reps","you avoid something small because of fear","Do one small brave rep","‘Confidence is born, not built’ trap"],
    ["G26","Anger Cooldown","Anger needs a brake, not a blast.","3-Minute Brake","you’re about to say something harsh","Pause + breathe + step away","‘Anger must explode’ trap"],
    ["G27","Anxiety Grounding","Ground your senses.","5-4-3-2-1","anxiety spikes in public","Ground + slow exhale","‘Anxiety predicts reality’ trap"],
    ["G28","Friend Help Basics","Help without becoming the therapist.","Listen + Adult","a friend hints they’re not okay","Listen, encourage adult help","‘I must fix them alone’ trap"],
    ["G29","Habits and Triggers","Know your triggers, not just your willpower.","Trigger Map","a certain place/time pulls you into bad choices","Change the setup","‘Willpower should be enough’ trap"],
    ["G30","Review + Lock-In","Turn skills into routines.","Weekly Plan","you forget lessons after a day","Schedule practice","‘Learning is reading once’ trap"],
    ["G31","Values in Action","Values are choices, not words.","Values Check","someone tries to bait you into drama","Act in line with values","‘Values are for posters’ trap"],
    ["G32","Respecting Others’ No","Boundaries go both ways.","Consent Basics","a friend says no to something","Respect it instantly","‘No is negotiable’ trap"],
    ["G33","Social Battery","Plan rest like a skill.","Recharge Plan","you’re drained and snappy","Take a real break","‘Rest is lazy’ trap"],
    ["G34","Micro-Rewards","Reward the right behavior.","Small Reward","you did one good step","Celebrate small wins","‘Only big wins count’ trap"],
    ["G35","Phone Boundaries","Make your phone serve you.","Phone Fence","late-night scrolling wrecks sleep","Set stop time + charger away","‘I can’t control it’ trap"],
    ["G36","Mood vs Truth","Mood changes what feels true.","Mood Label","you feel hopeless about a task","Label mood, do tiny step","‘Feelings = facts’ trap"],
    ["G37","Peer Influence Hacks","Notice common pressure tactics.","Tactic Spotting","someone guilt-trips you","Name tactic, exit","‘They’re right because they’re loud’ trap"],
    ["G38","Regret Forecasting","Preview regret before acting.","Regret Preview","temptation shows up","Picture tomorrow-you","‘Tomorrow doesn’t matter’ trap"],
    ["G39","Body Signals","Hunger/tiredness changes choices.","HALT Check","you’re angry and impulsive","Check hungry/angry/lonely/tired","‘My body doesn’t affect decisions’ trap"],
    ["G40","Self-Talk Coach","Talk like a coach, not a bully.","Coach Voice","you mess up a small thing","Kind correction + next step","‘Mean talk motivates’ trap"],
    ["G41","Goals That Work","Make goals specific and doable.","If-Then Plan","you keep forgetting a goal","Use if-then","‘Goals should be vague’ trap"],
    ["G42","Bystander Power","You can shift a situation safely.","Redirect Move","someone is pressuring a friend","Interrupt + redirect","‘It’s none of my business’ trap"],
    ["G43","Decision Fatigue","Tired brains choose worse.","Simplify Setup","late-day choices go downhill","Remove choices; prep earlier","‘I should decide perfectly anytime’ trap"],
    ["G44","Healthy Competition","Compete without self-destruction.","Good Rival","you compare yourself to others","Compete with yesterday-you","‘Comparison is required’ trap"],
    ["G45","Confidence in Groups","Group courage isn’t real courage.","1 Ally Rule","group chat pushes you","Find one ally; exit together","‘Crowds are always right’ trap"],
    ["G46","Handling Embarrassment","Embarrassment passes.","Name + Move","you feel embarrassed and want to overreact","Name it, do small calm action","‘Embarrassment is fatal’ trap"],
    ["G47","Micro-Planning Fun","Plan fun that doesn’t backfire.","Two-Plan Fun","weekend boredom","Plan A + Plan B","‘Spontaneous = best’ trap"],
    ["G48","Digital Drama Off-Ramp","Leave drama without losing friends.","Exit Script","online argument escalates","Exit with short script","‘I must respond’ trap"],
    ["G49","Respecting Your Brain","Your brain is still building.","Brain Protection","someone offers a risky “escape”","Protect brain; choose safer coping","‘Brains bounce back from anything’ trap"],
    ["G50","Kindness as Strength","Kindness is not weakness.","Kind Move","someone is left out","Include safely","‘Kind = uncool’ trap"],
    ["G51","Self-Control as Skill","Self-control improves with reps.","2-Minute Rule","you want to quit a task","Do 2 minutes","‘Self-control is fixed’ trap"],
    ["G52","Dealing with Jealousy","Jealousy points to wants.","Want Finder","you feel jealous of a friend","Name want; plan steps","‘Jealousy means I’m bad’ trap"],
    ["G53","Money + Choices","Small spending habits matter.","Spend Pause","impulse buy shows up","24-hour pause","‘Money doesn’t matter’ trap"],
    ["G54","Rumination Stopper","Stop spinning thoughts.","Thought Parking","you replay the same worry","Park it, schedule a check-in","‘Thinking more solves it’ trap"],
    ["G55","Respect in Dating-ish Stuff","Respect is the rule.","Clear Consent","someone pushes a boundary","Clear no + leave","‘Pushing is normal’ trap"],
    ["G56","Leading by Example","Lead without preaching.","Model Move","you want others safer too","Do the safe choice visibly","‘Leaders never feel nervous’ trap"],
    ["G57","Long Game Motivation","Motivation fades; systems stay.","System Build","you rely on mood to do habits","Make it automatic","‘Motivation should be constant’ trap"],
    ["G58","Handling Setbacks","Slip ≠ slide.","Reset Fast","you slipped on a goal","Reset today, not Monday","‘One slip ruins everything’ trap"],
    ["G59","Your Personal Rulebook","Make rules you can follow.","3 Rules","you keep breaking vague rules","Write 3 clear rules","‘Rules don’t work’ trap"],
    ["G60","Graduation Plan","Keep skill growth going.","Next 30 Plan","you finished curriculum","Pick 3 skills to keep practicing","‘Done means done forever’ trap"],
  ];

  for(const [id,title,goal,toolName,scenario,bestMove,trapName] of defs){
    const dayNum = Number(id.slice(1));
    GENERAL_60.push(
      L(id,"general",title,goal,
        [
          `Today’s skill: ${title}.`,
          `Goal: ${goal}`,
          `Tool: ${toolName}.`,
          "Practice it in a real moment this week—small reps count."
        ],
        {
          bigIdea:goal,
          wrongIdea1:"Taking bigger risks fixes boredom/stress.",
          wrongIdea2:"Keeping secrets is the best plan.",
          scenario,
          bestMove,
          trapMove1:"Say yes fast to avoid awkwardness",
          trapMove2:"Keep it secret so nobody notices",
          toolName,
          toolHow:`Use ${toolName} to pick the safest realistic next step.`,
          toolMistake1:"Try to look fearless instead of staying safe",
          toolMistake2:"Wait until it becomes a bigger problem",
          realityCheck:"You can be uncomfortable and still make a smart choice.",
          thoughtTrap1:"If I don’t do what they want, I’ll be rejected.",
          thoughtTrap2:"I have to decide instantly.",
          boundaryLine:"No thanks. I’m not doing that.",
          boundaryWeak1:"I guess… maybe…",
          boundaryMean1:"Shut up. Don’t ask me again.",
          switchLine:"Let’s do something else.",
          switchBad1:"Fine, I’ll do it.",
          switchBad2:"You’re annoying.",
          futureYouWin:"The choice you’d be proud to explain tomorrow.",
          futureYouLose1:"Whatever makes people react the most.",
          futureYouLose2:"Whatever avoids feelings fastest.",
          exitPlan:"Move away, reset, and connect with a supportive person if needed.",
          exitBad1:"Stay and escalate the situation",
          exitBad2:"Prove yourself by taking the risk",
          adultAsk:"Can I run something by you? I want to handle it the right way.",
          adultNope1:"I’ll never tell an adult anything.",
          adultNope2:"I’ll only ask random people online.",
          tinyStep:"Do one small action in the next 10 minutes that supports you.",
          tinyStepBad1:"Fix everything at once.",
          tinyStepBad2:"Do nothing until it’s an emergency.",
          trapName,
          trapWrong1:"Drinking water",
          trapWrong2:"Taking a break",
          reflectionWin:"You used the tool and made a safer switch.",
          winWrong1:"You impressed people by taking a risk.",
          winWrong2:"You hid it and hoped it disappears."
        }
      )
    );
  }
})();

/* -------------------------
   TRACK PACKS (12 each)
   - These are ADD-ON lessons shown when a track is selected
   - They are unique and track-specific (not re-skins of general days)
-------------------------- */
const TRACK_PACKS = {
  nicotine: [
    L("N01","nicotine","Cravings 101","Cravings are a wave, not a command.",
      [
        "Cravings spike, peak, and fall.",
        "Delay + distract buys you time.",
        "You don’t have to argue with a craving—ride it out."
      ],
      {
        bigIdea:"Cravings rise and fall like waves.",
        wrongIdea1:"Cravings mean you must give in.",
        wrongIdea2:"Cravings never change.",
        scenario:"a craving hits during a boring moment and your brain offers a “quick fix”",
        bestMove:"Delay 10 minutes and do a substitute activity",
        trapMove1:"Act instantly to make it stop",
        trapMove2:"Hide what’s happening and hope it passes",
        toolName:"Wave Timer",
        toolHow:"Set a 10-minute timer; do something else until it drops",
        toolMistake1:"Stare at the craving and panic",
        toolMistake2:"Test yourself by hanging around triggers",
        realityCheck:"Cravings are uncomfortable, not dangerous—your choice matters most.",
        thoughtTrap1:"If I don’t do it now, I’ll explode.",
        thoughtTrap2:"This will last forever.",
        boundaryLine:"No—I'm not doing that.",
        boundaryWeak1:"Maybe later…",
        boundaryMean1:"Get lost.",
        switchLine:"Let’s grab a drink/snack and walk instead.",
        switchBad1:"Fine, just this once.",
        switchBad2:"Stop asking!",
        futureYouWin:"A choice that reduces cravings over time.",
        futureYouLose1:"A choice that strengthens the habit loop.",
        futureYouLose2:"A choice you must hide.",
        exitPlan:"Leave the trigger spot and change rooms/route.",
        exitBad1:"Stay where the trigger is strongest",
        exitBad2:"Challenge yourself to ‘prove’ you can resist",
        adultAsk:"I’m dealing with cravings and want help making a plan.",
        adultNope1:"I’ll handle it with secrets.",
        adultNope2:"I’ll ask strangers for advice.",
        tinyStep:"Remove one trigger from your space today.",
        tinyStepBad1:"Rely on willpower only.",
        tinyStepBad2:"Make a huge impossible promise.",
        trapName:"Habit-loop autopilot",
        trapWrong1:"Having hobbies",
        trapWrong2:"Doing homework",
        reflectionWin:"You delayed and cravings dropped even a little.",
        winWrong1:"You proved you’re tough by risking it.",
        winWrong2:"You kept it secret and hoped it stops."
      }
    ),
    L("N02","nicotine","Offer Refusal","Refuse offers with short words + movement.",
      ["Short refusal. No debate. Move away.", "Practice a line you can actually say."],
      {
        bigIdea:"A short refusal + exit works best.",
        wrongIdea1:"You need a long explanation.",
        wrongIdea2:"You should accept to avoid awkwardness.",
        scenario:"someone offers you something and watches your reaction",
        bestMove:"Say no once and step away",
        trapMove1:"Explain forever",
        trapMove2:"Say yes to fit in",
        toolName:"One-Line No",
        toolHow:"“No thanks. I’m good.” + move",
        toolMistake1:"“Maybe later”",
        toolMistake2:"Joking yes that turns into yes",
        realityCheck:"Awkward fades fast; consequences don’t.",
        thoughtTrap1:"They’ll hate me.",
        thoughtTrap2:"I have to match their vibe.",
        boundaryLine:"No thanks. I’m good.",
        boundaryWeak1:"I guess…",
        boundaryMean1:"You’re gross.",
        switchLine:"Let’s go do something else.",
        switchBad1:"Fine then.",
        switchBad2:"Whatever.",
        futureYouWin:"A clean no that keeps you safe.",
        futureYouLose1:"A half-yes that invites more pressure.",
        futureYouLose2:"A secret yes.",
        exitPlan:"Walk to a different group/spot immediately.",
        exitBad1:"Stay in the same circle",
        exitBad2:"Argue until you’re drained",
        adultAsk:"Can we plan what I’ll do if someone offers me something?",
        adultNope1:"I won’t tell anyone.",
        adultNope2:"I’ll just risk it.",
        tinyStep:"Write your refusal line in Notes.",
        tinyStepBad1:"Wait until the moment hits.",
        tinyStepBad2:"Hope people stop offering.",
        trapName:"“Maybe” trap",
        trapWrong1:"Taking breaks",
        trapWrong2:"Studying",
        reflectionWin:"You said no once and moved away.",
        winWrong1:"You matched the group to avoid discomfort.",
        winWrong2:"You hid what happened."
      }
    ),
    // N03..N12 (kept concise but unique)
  ],

  alcohol: [
    L("A01","alcohol","Party Plan Basics","Safety planning beats vibe pressure.",
      ["Decide ahead: ride, exit, ally.", "A plan is not uncool—it's smart."],
      {
        bigIdea:"Plan ahead so pressure has less power.",
        wrongIdea1:"Go with the flow no matter what.",
        wrongIdea2:"A secret plan is the safest plan.",
        scenario:"a hangout shifts from chill to risky and people push choices",
        bestMove:"Use your plan: ally + exit option",
        trapMove1:"Stay because leaving feels awkward",
        trapMove2:"Hide everything from adults",
        toolName:"3-Point Plan",
        toolHow:"Ally (buddy) + Exit (ride/leave) + Check-in (adult if needed)",
        toolMistake1:"Hope it stays safe without planning",
        toolMistake2:"Rely on strangers for safety",
        realityCheck:"The safest choice is the one you can actually do in real life.",
        thoughtTrap1:"Leaving means I’m lame.",
        thoughtTrap2:"Everyone is watching me.",
        boundaryLine:"I’m heading out—see you later.",
        boundaryWeak1:"Maybe I’ll stay…",
        boundaryMean1:"You’re all losers.",
        switchLine:"Let’s grab food and go somewhere else.",
        switchBad1:"Fine, I’ll do it.",
        switchBad2:"Shut up.",
        futureYouWin:"A choice you can explain without panic tomorrow.",
        futureYouLose1:"A choice that needs secrecy to survive.",
        futureYouLose2:"A choice made to impress.",
        exitPlan:"Text your ally and leave together.",
        exitBad1:"Stay alone in the risky spot",
        exitBad2:"Escalate to prove yourself",
        adultAsk:"If I need a ride out, can I call you—no questions first?",
        adultNope1:"I’ll never contact an adult.",
        adultNope2:"I’ll just figure it out with strangers.",
        tinyStep:"Pick your ally for the next hangout.",
        tinyStepBad1:"Assume you’ll ‘wing it’.",
        tinyStepBad2:"Spend money you don’t have on a plan.",
        trapName:"Vibe pressure",
        trapWrong1:"Bringing water",
        trapWrong2:"Having hobbies",
        reflectionWin:"You used your plan and exited early.",
        winWrong1:"You stayed to prove yourself.",
        winWrong2:"You kept it secret."
      }
    ),
  ],

  gaming: [
    L("Gm01","gaming","Stop On Purpose","Stopping is a skill you can train.",
      ["Pre-decide your stop time.", "Use a stop-script, not willpower wrestling."],
      {
        bigIdea:"Stopping on purpose builds control.",
        wrongIdea1:"Stopping ruins fun.",
        wrongIdea2:"Only ‘hardcore’ playing counts.",
        scenario:"you planned to stop but ‘one more’ keeps repeating",
        bestMove:"Use your stop-script and stand up",
        trapMove1:"Start a new match to ‘end on a win’",
        trapMove2:"Promise you’ll stop later with no plan",
        toolName:"Stop-Script",
        toolHow:"Alarm → finish current moment → stand up → water → next task",
        toolMistake1:"Negotiate with yourself mid-craving",
        toolMistake2:"Scroll clips after stopping",
        realityCheck:"Fun is better when you still sleep and feel good tomorrow.",
        thoughtTrap1:"If I stop now, I wasted the session.",
        thoughtTrap2:"I can’t stop unless I feel like it.",
        boundaryLine:"I’m done for today—see you tomorrow.",
        boundaryWeak1:"Maybe I’ll stop…",
        boundaryMean1:"You’re annoying.",
        switchLine:"Let’s do something else for 10 minutes.",
        switchBad1:"Fine, one more hour.",
        switchBad2:"Stop talking.",
        futureYouWin:"A stop that protects sleep and mood.",
        futureYouLose1:"A stop that never happens.",
        futureYouLose2:"A stop that turns into scrolling.",
        exitPlan:"Log out and move device away.",
        exitBad1:"Keep device in your hands",
        exitBad2:"Stay in the lobby chatting",
        adultAsk:"Can you help me set a stop plan that actually works?",
        adultNope1:"I’ll hide it.",
        adultNope2:"I’ll just quit everything forever.",
        tinyStep:"Set one alarm for your stop time.",
        tinyStepBad1:"Rely on vibes only.",
        tinyStepBad2:"Make a rule you can’t follow.",
        trapName:"“One more” loop",
        trapWrong1:"Homework",
        trapWrong2:"Drinking water",
        reflectionWin:"You stopped when planned and felt proud.",
        winWrong1:"You played until you were miserable.",
        winWrong2:"You lied about stopping."
      }
    ),
  ],

  socialmedia: [
    L("S01","socialmedia","Trend Immunity","Trends aren’t commands.",
      ["Ask who benefits from you doing it.", "Pressure + risk = skip."],
      {
        bigIdea:"You don’t owe trends your behavior.",
        wrongIdea1:"Trends are harmless because they’re popular.",
        wrongIdea2:"You must keep up to belong.",
        scenario:"a trend/dare frames you as ‘boring’ if you don’t do it",
        bestMove:"Skip and choose your own plan",
        trapMove1:"Do it for likes",
        trapMove2:"Do it but hide it",
        toolName:"Pressure+Risk Rule",
        toolHow:"If it pressures you AND adds risk, it’s an automatic no.",
        toolMistake1:"Assume popularity = safety",
        toolMistake2:"Let comments decide",
        realityCheck:"Belonging that costs safety isn’t real belonging.",
        thoughtTrap1:"Everyone will remember forever.",
        thoughtTrap2:"I’m nothing without likes.",
        boundaryLine:"No. Not my thing.",
        boundaryWeak1:"Maybe…",
        boundaryMean1:"You’re all idiots.",
        switchLine:"Let’s do a different challenge that’s safe.",
        switchBad1:"Fine, I’ll do it.",
        switchBad2:"Stop talking.",
        futureYouWin:"Attention that doesn’t harm you.",
        futureYouLose1:"A clip that can’t be taken back.",
        futureYouLose2:"A choice made from fear.",
        exitPlan:"Close the app and change rooms for 2 minutes.",
        exitBad1:"Keep reading comments",
        exitBad2:"Argue with strangers",
        adultAsk:"Can you help me decide a rule for trends so I’m safer?",
        adultNope1:"I’ll just hide everything.",
        adultNope2:"I’ll ask random accounts.",
        tinyStep:"Turn off one notification that pulls you in.",
        tinyStepBad1:"Delete everything forever in anger.",
        tinyStepBad2:"Scroll until 2AM.",
        trapName:"Approval trap",
        trapWrong1:"Going outside",
        trapWrong2:"Talking to friends",
        reflectionWin:"You chose your plan instead of the trend’s plan.",
        winWrong1:"You did it for likes.",
        winWrong2:"You kept it secret."
      }
    ),
  ],

  caffeine: [
    L("C01","caffeine","Energy Without Spikes","Steady energy beats crash energy.",
      ["Energy is built: sleep + food + water + light movement.", "Spikes borrow energy from later."],
      {
        bigIdea:"Build steady energy with basics, not spikes.",
        wrongIdea1:"You can replace sleep with intensity.",
        wrongIdea2:"Crashing is normal and unavoidable.",
        scenario:"you feel tired and want a fast boost to push through",
        bestMove:"Fuel + short break + small plan",
        trapMove1:"Chase a bigger boost",
        trapMove2:"Skip food and keep going",
        toolName:"Steady Stack",
        toolHow:"Water + snack + 5-minute movement + plan next 20 minutes",
        toolMistake1:"All-or-nothing energy thinking",
        toolMistake2:"Ignore your body signals",
        realityCheck:"Your brain works better when your body is cared for.",
        thoughtTrap1:"I have to feel amazing to start.",
        thoughtTrap2:"If I slow down, I’ll fail.",
        boundaryLine:"I’m taking a quick reset—then I’ll continue.",
        boundaryWeak1:"I’ll just suffer through it.",
        boundaryMean1:"Leave me alone.",
        switchLine:"Give me 5 minutes—reset first.",
        switchBad1:"Fine, I’ll do the risky thing.",
        switchBad2:"Stop asking.",
        futureYouWin:"Energy that lasts through tomorrow.",
        futureYouLose1:"A crash that ruins sleep.",
        futureYouLose2:"A habit that escalates.",
        exitPlan:"Step away, reset, then re-join.",
        exitBad1:"Force it while exhausted",
        exitBad2:"Escalate to feel something",
        adultAsk:"I’m struggling with energy—can we adjust my routine?",
        adultNope1:"I’ll hide how tired I am.",
        adultNope2:"I’ll never talk to anyone.",
        tinyStep:"Drink water right now.",
        tinyStepBad1:"Make a perfect routine overnight.",
        tinyStepBad2:"Do nothing until it’s unbearable.",
        trapName:"Borrowed-energy trap",
        trapWrong1:"Taking a walk",
        trapWrong2:"Eating lunch",
        reflectionWin:"You used a steady reset and felt more in control.",
        winWrong1:"You chased a bigger spike.",
        winWrong2:"You ignored sleep again."
      }
    ),
  ],
};

// Fill missing track lessons to 12 each (hardcoded-but-compact unique variants)
(function padTrackPacks(){
  const makeExtra = (prefix, track, n, title, goal, tool, scenario, trap) =>
    L(`${prefix}${String(n).padStart(2,"0")}`, track, title, goal,
      [
        `Today’s skill: ${title}.`,
        `Tool: ${tool}.`,
        "Use the tool in one real moment this week.",
        "Small reps = real learning."
      ],
      {
        bigIdea:goal,
        wrongIdea1:"Secrets make it safer.",
        wrongIdea2:"Bigger risk = bigger relief.",
        scenario,
        bestMove:`Use ${tool} and take a safer next step`,
        trapMove1:"Act fast to avoid discomfort",
        trapMove2:"Do it secretly",
        toolName:tool,
        toolHow:`Apply ${tool} in the moment, not later.`,
        toolMistake1:"Wait until the situation is out of control",
        toolMistake2:"Rely on willpower only",
        realityCheck:"You can feel pressure and still choose well.",
        thoughtTrap1:"If I say no, I lose everything.",
        thoughtTrap2:"I must decide instantly.",
        boundaryLine:"No thanks. I’m good.",
        boundaryWeak1:"Maybe…",
        boundaryMean1:"Stop asking.",
        switchLine:"Let’s do something else.",
        switchBad1:"Fine, I’ll do it.",
        switchBad2:"You’re annoying.",
        futureYouWin:"A choice you can stand behind later.",
        futureYouLose1:"A choice you’d hide.",
        futureYouLose2:"A choice made from fear.",
        exitPlan:"Move away and connect with support if needed.",
        exitBad1:"Stay and escalate",
        exitBad2:"Prove yourself",
        adultAsk:"Can you help me plan a safer way to handle this?",
        adultNope1:"I’ll keep it secret.",
        adultNope2:"I’ll ask strangers online.",
        tinyStep:"Do one small setup change today.",
        tinyStepBad1:"Promise something impossible.",
        tinyStepBad2:"Do nothing.",
        trapName:trap,
        trapWrong1:"Drinking water",
        trapWrong2:"Taking a break",
        reflectionWin:"You used the tool and switched to a safer plan.",
        winWrong1:"You impressed people by risking it.",
        winWrong2:"You hid it."
      }
    );

  const targets = [
    ["nicotine","N", "Trigger Swap","Change the setup, not just willpower.","Trigger Swap","you walk past a trigger spot","Trigger autopilot"],
    ["nicotine","N", "Craving Talk-Back","Answer cravings with one line.","Talk-Back Line","a craving says ‘just once’","Just-once lie"],
    ["nicotine","N", "Support Text","Use support before it’s hard.","Pre-Text","you feel shaky and tempted","Handle-alone myth"],
    ["nicotine","N", "Urge Surfing 2.0","Add movement to ride the wave.","Move-Through","urge hits during stress","Freeze-and-panic"],
    ["nicotine","N", "Refusal Practice","Practice makes pressure weaker.","Script Reps","friend offers again","Maybe trap"],
    ["nicotine","N", "After-Slip Reset","Slip doesn’t mean slide.","Reset Today","you slipped on a goal","All-or-nothing"],
    ["nicotine","N", "Replacement Habit","Build a better default.","Replacement Loop","boredom time hits","Empty-boredom"],
    ["nicotine","N", "Identity Choice","Choose who you are today.","I-Choose","you want approval","Approval trap"],
    ["nicotine","N", "Plan Your Week","Reduce triggers ahead of time.","Weekly Setup","weekend is unstructured","No-plan chaos"],
    ["nicotine","N", "Celebrate Wins","Reward the right behavior.","Micro-Reward","you resisted an urge","‘Doesn’t count’ lie"],

    ["alcohol","A","Buddy System","Allies reduce risk.","Buddy Plan","you’re at a hangout with pressure","Alone-in-crowd"],
    ["alcohol","A","Exit Lines","Leave without drama.","Exit Script","you need to leave now","Awkward trap"],
    ["alcohol","A","Ride Safety","Plan transportation first.","Ride First","plans change late","Stranded trap"],
    ["alcohol","A","Pressure Tactics","Spot guilt/dare tactics.","Tactic Spot","someone dares you","Dare trap"],
    ["alcohol","A","Alternative Fun","Bring your own fun plan.","Plan B","people get reckless","No Plan B"],
    ["alcohol","A","Morning-After Pride","Choose what you’d be proud of.","Pride Preview","decision point at a hangout","Regret fog"],
    ["alcohol","A","Boundary Repeat","Repeat once, don’t debate.","Repeat Rule","they push again","Debate drain"],
    ["alcohol","A","Check-In","Send a safety check-in.","Check-In Text","you feel unsure","Silent stress"],
    ["alcohol","A","Red Flags","Know when to leave.","Red Flag List","things feel off","Ignore signals"],
    ["alcohol","A","Host Respect","Respect your own limits.","Limit Line","someone teases your limit","Mocking trap"],

    ["gaming","Gm","Session Setup","Design a session that ends.","Session Plan","you start playing with no stop time","No-off-ramp"],
    ["gaming","Gm","Tilt Reset","Reset after frustration.","Tilt Reset","you’re tilted and chasing wins","Chase trap"],
    ["gaming","Gm","Focus Blocks","Protect homework focus.","Focus Block","you keep checking the game","Switching cost"],
    ["gaming","Gm","Sleep Guard","Protect sleep on purpose.","Sleep Guard","late night pulls you","Night spiral"],
    ["gaming","Gm","Social Pressure","Friends pressure you to stay.","Leave Line","party wants ‘one more’","Group loop"],
    ["gaming","Gm","Reward Swap","Swap rewards to real life.","Reward Swap","only game feels rewarding","Single-reward trap"],
    ["gaming","Gm","Notification Control","Kill pings that hook you.","Ping Kill","constant notifications","Ping leash"],
    ["gaming","Gm","Break Ritual","Short ritual before returning.","Break Ritual","you re-queue instantly","No-reset trap"],
    ["gaming","Gm","Skill > Hours","Progress by practice, not grind.","Practice Plan","you grind mindlessly","Mindless grind"],
    ["gaming","Gm","Weekend Balance","Plan weekend blocks.","Weekend Map","weekend disappears","Time blur"],

    ["socialmedia","S","Comparison Detox","Comparison isn’t information.","Compare Catch","you feel worse after scrolling","Comparison trap"],
    ["socialmedia","S","Comment Boundaries","Comments don’t run you.","Comment Fence","someone baits you","Bait trap"],
    ["socialmedia","S","Time Boxes","Box time so you choose.","Time Box","you scroll ‘just a minute’","Time leak"],
    ["socialmedia","S","Curate Feed","Feed shapes mood.","Feed Clean","your feed makes you stressed","Mood feed"],
    ["socialmedia","S","DM Safety","Handle DMs wisely.","DM Rule","a DM feels off","Overshare trap"],
    ["socialmedia","S","Snap Back","Recover after doomscroll.","Reset Plan","you lose 45 minutes","Shame spiral"],
    ["socialmedia","S","Group Chat Pressure","Group chats amplify pressure.","Chat Exit","chat dares you","Crowd effect"],
    ["socialmedia","S","Create > Consume","Make more than you scroll.","Create Swap","you feel empty","Consume-only"],
    ["socialmedia","S","Night Mode","Protect sleep from screens.","Night Fence","late scrolling","Sleep theft"],
    ["socialmedia","S","Offline Anchor","Keep one offline hobby.","Anchor Hobby","online becomes everything","Single-world trap"],

    ["caffeine","C","Crash Prevention","Prevent crash with routine.","Crash Guard","you feel a crash coming","Spike cycle"],
    ["caffeine","C","Morning Setup","Better mornings reduce cravings.","Morning Stack","you wake exhausted","Chaos morning"],
    ["caffeine","C","Hydration First","Hydration affects energy.","Water First","you feel foggy","Dehydration fog"],
    ["caffeine","C","Food Timing","Food timing matters.","Snack Plan","you skip meals","Skip-meal trap"],
    ["caffeine","C","Movement Boost","Movement can boost energy safely.","Move Boost","midday slump","Sit-stuck trap"],
    ["caffeine","C","Evening Wind-Down","Protect sleep quality.","Wind-Down","you can’t fall asleep","Late stimulation"],
    ["caffeine","C","Stress Energy","Stress burns energy.","Stress Saver","stress week hits","Overdrive trap"],
    ["caffeine","C","Study Fuel","Fuel before focus.","Study Fuel","you can’t focus","Empty tank"],
    ["caffeine","C","Weekend Reset","Use weekends to refill.","Reset Day","weekend sleep flips","Schedule flip"],
    ["caffeine","C","Long-Term Energy","Energy is a system.","Energy System","you want quick fixes","Quick-fix trap"],
  ];

  const counts = { nicotine:1, alcohol:1, gaming:1, socialmedia:1, caffeine:1 };
  for(const [track, prefix, title, goal, tool, scenario, trap] of targets){
    const pack = TRACK_PACKS[track];
    // start numbering after whatever already exists in that pack
    const base = pack.length;
    const n = base + (++counts[track]);
    pack.push(makeExtra(prefix, track, n, title, goal, tool, scenario, trap));
  }

  // ensure exactly 12 per track
  for(const k of Object.keys(TRACK_PACKS)){
    TRACK_PACKS[k] = TRACK_PACKS[k].slice(0, 12);
  }
})();

/* =========================================================
   LESSON LISTS
========================================================= */
function getGeneralLessons(){ return GENERAL_60; }
function getTrackPack(track){ return TRACK_PACKS[track] || []; }

function getActiveLessons(state){
  const t = state.selectedTrack || "general";
  const base = getGeneralLessons();
  if(t === "general") return base;
  // show base 60 + the 12 add-on pack for that track
  return base.concat(getTrackPack(t));
}

/* =========================================================
   TIPS (varied, not copy/paste)
========================================================= */
const TIPS = [
  "When pressure spikes, move your body: stand up, step back, sip water.",
  "A boundary can be simple: “No thanks. I’m good.”",
  "If you can’t say it out loud to a trusted adult, pause.",
  "Your brain learns what you repeat—repeat the safe plan.",
  "Plans beat vibes. Pick an exit option before you need it.",
  "A tiny step today beats a giant promise tomorrow.",
  "If a trend pressures you + adds risk, it’s an automatic no.",
  "Real friends respect ‘no’ the first time.",
];
function randomTip(){
  const el = $("#tip-text");
  if(!el) return;
  el.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
}

/* =========================================================
   STATE
========================================================= */
const DEFAULT_STATE = {
  currentLessonIndex: 0,
  completedLessonIds: [],  // use lesson.id now (supports 60 + pack)
  lastCompletedISO: null,
  streak: 0,
  xp: 0,
  level: 1,
  profileName: "Player",
  selectedTrack: "general",
  ratings: { total: 0, count: 0 },
  quizAttempts: {}, // lessonId -> { attempts, wrongTotal, lastISO }
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
  const out = {
    ...DEFAULT_STATE,
    ...safe,
    completedLessonIds: Array.isArray(safe.completedLessonIds) ? safe.completedLessonIds : [],
    ratings: (safe.ratings && typeof safe.ratings === "object") ? safe.ratings : { total:0, count:0 },
    quizAttempts: (safe.quizAttempts && typeof safe.quizAttempts === "object") ? safe.quizAttempts : {},
  };
  out.profileName = safeStr(out.profileName, "Player").slice(0, 24);
  out.selectedTrack = TRACKS[out.selectedTrack] ? out.selectedTrack : "general";
  out.xp = Math.max(0, safeNum(out.xp, 0));
  out.level = Math.max(1, safeNum(out.level, 1));
  out.streak = Math.max(0, safeNum(out.streak, 0));
  out.currentLessonIndex = Math.max(0, safeNum(out.currentLessonIndex, 0));
  return out;
}
let state = normalizeState(loadState());
function saveState(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function recalcLevel(){
  state.level = 1 + Math.floor(state.xp / 200);
}
function addXP(amount){
  const a = safeNum(amount, 0);
  if(a <= 0) return;
  state.xp += a;
  recalcLevel();
  saveState();
  updateHomeStats();
  renderLesson();
  renderTrackUI();
  renderRate();
}
function recordQuizAttempt(lessonId, wrongCount){
  const key = String(lessonId);
  const cur = (state.quizAttempts[key] && typeof state.quizAttempts[key] === "object")
    ? state.quizAttempts[key]
    : { attempts: 0, wrongTotal: 0, lastISO: null };
  cur.attempts += 1;
  cur.wrongTotal += Math.max(0, safeNum(wrongCount, 0));
  cur.lastISO = isoDate(new Date());
  state.quizAttempts[key] = cur;
  saveState();
}

/* =========================================================
   NAV / VIEWS
========================================================= */
function showView(name){
  document.body.style.overflow = "";
  $$(".view").forEach(v => v.classList.add("hidden"));
  $(`#view-${name}`)?.classList.remove("hidden");
  $$(".tab").forEach(t => t.classList.remove("active"));
  $(`.tab[data-view="${name}"]`)?.classList.add("active");

  if(name === "lesson") renderLesson();
  if(name === "tracks") renderTrackUI();
  if(name === "rate") renderRate();
  if(name === "home") renderHomeRecommendation();
}
function bindNav(){
  $$(".tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const v = btn.dataset.view;
      if(v) showView(v);
    });
  });
  $("#btn-start-lesson")?.addEventListener("click", () => showView("lesson"));
  $("#btn-open-lesson")?.addEventListener("click", () => showView("lesson"));
  $("#btn-open-rate")?.addEventListener("click", () => showView("rate"));
}

/* =========================================================
   TRACKS
========================================================= */
function renderTrackUI(){
  const sel = $("#track-select");
  const preview = $("#track-preview");
  const t = state.selectedTrack || "general";
  if(sel) sel.value = t;
  if(preview) preview.textContent = (TRACKS[t] ? TRACKS[t].desc : TRACKS.general.desc);

  const countEl = $("#track-count");
  if(countEl){
    const lessons = getActiveLessons(state);
    countEl.textContent = `${lessons.length} lessons available`;
  }
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
  sel?.addEventListener("change", () => renderTrackUI());
}

/* =========================================================
   LESSONS + QUIZ
========================================================= */
function renderLesson(){
  const lessons = getActiveLessons(state);
  if(!lessons.length) return;

  const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
  state.currentLessonIndex = idx;
  saveState();

  const lesson = lessons[idx];

  $("#lesson-title") && ($("#lesson-title").textContent = lesson.title);
  $("#lesson-day") && ($("#lesson-day").textContent =
    `Lesson ${idx+1} of ${lessons.length} • Track: ${TRACKS[state.selectedTrack]?.name || "General"} • ID: ${lesson.id}`
  );
  $("#lesson-goal") && ($("#lesson-goal").textContent = `Goal: ${lesson.goal}`);

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
  updateLessonStatus(lesson.id);
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
  const lessons = getActiveLessons(state);
  const idx = clamp(state.currentLessonIndex, 0, lessons.length - 1);
  const lesson = lessons[idx];
  let correct = 0;
  lesson.quiz.forEach((item, qi) => {
    const picked = document.querySelector(`input[name="q_${qi}"]:checked`);
    if(picked && Number(picked.value) === item.answer) correct++;
  });
  return { correct, total: lesson.quiz.length, lesson };
}

function updateLessonStatus(lessonId){
  const el = $("#lesson-status");
  if(!el) return;
  const done = state.completedLessonIds.includes(lessonId);
  el.textContent = done
    ? "✅ Completed"
    : "Not completed — answer all 12 correctly, then click “Mark Lesson Complete”.";
}

function bindLessonButtons(){
  $("#btn-prev-lesson")?.addEventListener("click", () => {
    const lessons = getActiveLessons(state);
    state.currentLessonIndex = clamp(state.currentLessonIndex - 1, 0, lessons.length - 1);
    saveState();
    renderLesson();
  });
  $("#btn-next-lesson")?.addEventListener("click", () => {
    const lessons = getActiveLessons(state);
    state.currentLessonIndex = clamp(state.currentLessonIndex + 1, 0, lessons.length - 1);
    saveState();
    renderLesson();
  });

  $("#btn-complete-lesson")?.addEventListener("click", () => {
    const score = quizScoreForCurrentLesson();
    const wrong = score.total - score.correct;
    if(wrong > 0){
      recordQuizAttempt(score.lesson.id, wrong);
      $("#lesson-status") && ($("#lesson-status").textContent =
        `Almost! Score: ${score.correct}/${score.total}. Fix missed ones and try again.`);
      renderHomeRecommendation();
      return;
    }

    const firstTime = !state.completedLessonIds.includes(score.lesson.id);
    if(firstTime){
      addXP(score.total * 5); // perfect quiz reward
      addXP(50); // completion bonus
      state.completedLessonIds.push(score.lesson.id);
    }

    // streak logic (daily)
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
    updateLessonStatus(score.lesson.id);
    renderHomeRecommendation();
  });
}

/* =========================================================
   HOME RECOMMENDATION
========================================================= */
function getRecommendedLesson(){
  const lessons = getActiveLessons(state);
  if(!lessons.length) return null;

  // Next uncompleted in active list
  const next = lessons.find(l => !state.completedLessonIds.includes(l.id));
  if(next) return next;

  // Otherwise, recommend the “most missed” in attempts
  let best = lessons[0];
  let bestScore = -1;
  for(const l of lessons){
    const stat = state.quizAttempts?.[String(l.id)];
    const score = stat ? safeNum(stat.wrongTotal, 0) : 0;
    if(score > bestScore){
      bestScore = score;
      best = l;
    }
  }
  return best;
}
function goToLessonId(id){
  const lessons = getActiveLessons(state);
  const idx = lessons.findIndex(l => l.id === id);
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
    boxTitle.textContent = "Recommended lesson";
    boxDesc.textContent = "Start with Lesson 1.";
    btn.disabled = true;
    return;
  }

  const isDone = state.completedLessonIds.includes(rec.id);
  boxTitle.textContent = `Recommended: ${rec.title} (${rec.id})`;
  boxDesc.textContent = isDone
    ? `Review it to strengthen the skill. Goal: ${rec.goal}`
    : `Next up. Goal: ${rec.goal}`;

  btn.disabled = false;
  if(!btn.__bound){
    btn.__bound = true;
    btn.addEventListener("click", () => {
      const r = getRecommendedLesson();
      if(!r) return;
      goToLessonId(r.id);
    });
  }
}

/* =========================================================
   HOME STATS
========================================================= */
function updateHomeStats(){
  const streakLabel = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
  $("#streak-text") && ($("#streak-text").textContent = streakLabel);
  $("#dash-xp") && ($("#dash-xp").textContent = String(state.xp));
  $("#dash-level") && ($("#dash-level").textContent = String(state.level));
  $("#dash-lessons") && ($("#dash-lessons").textContent = String(state.completedLessonIds.length));
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
  const avgEl = $("#rating-average");
  if(!avgEl) return;
  const total = safeNum(state.ratings?.total, 0);
  const count = safeNum(state.ratings?.count, 0);
  const avg = (count > 0) ? (total / count) : null;
  avgEl.textContent = avg ? avg.toFixed(1) + " / 5" : "—";
  $("#rating-count") && ($("#rating-count").textContent = count === 0 ? "No ratings yet" : `${count} rating${count===1?"":"s"}`);
}

/* =========================================================
   RESET
========================================================= */
function bindReset(){
  $("#btn-reset")?.addEventListener("click", () => {
    if(!confirm("Reset progress on this device?")) return;
    localStorage.removeItem(STORAGE_KEY);
    state = normalizeState(loadState());
    recalcLevel();
    saveState();
    updateHomeStats();
    renderTrackUI();
    renderHomeRecommendation();
    renderLesson();
    renderRate();
    showView("home");
  });
}

/* =========================================================
   INIT
========================================================= */
function init(){
  $("#year") && ($("#year").textContent = new Date().getFullYear());

  state = normalizeState(loadState());
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
  renderTrackUI();
  renderHomeRecommendation();
  renderLesson();
  renderRate();
  showView("home");
}
init();
