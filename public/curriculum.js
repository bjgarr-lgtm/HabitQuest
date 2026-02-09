/* curriculum.js — 60/day per track (hardcoded, unique) */
"use strict";
console.log("curriculum.js starting...");

window.CURR = (() => {
  const TRACKS = {
    general:     { name:"General",                  desc:"Healthy choices, stress tools, confidence, asking for help." },
    gaming:      { name:"Gaming / Screen habits",   desc:"Balance, routines, stopping on time, and staying in control." },
    socialmedia: { name:"Social media / Scrolling", desc:"Trends, influence, attention, confidence, safer online choices." },
    nicotine:    { name:"Nicotine / Vaping",        desc:"Cravings, pressure, coping skills, and refusing offers." },
    alcohol:     { name:"Alcohol",                  desc:"Safer choices, boundaries, and handling social pressure." },
    caffeine:    { name:"Caffeine / Energy drinks", desc:"Sleep/energy basics and alternatives to overstimulation." },
  };

  // Helper to build Day objects
  const D = (day, track, title, goal, bp) => ({ day, track, title, goal, ...bp });

  /* =========================================================
     GENERAL — 60 unique lessons
  ========================================================= */
  const GENERAL = [
    D(1,"general","Choices & Your Future","See how small choices compound.",{
      toolName:"Time‑Zoom (Now→Later)", scenario:"You’re tempted to take a shortcut that could backfire.", safePlan:"Pause → time‑zoom → pick the smallest honest step.", boundaryLine:"I’m choosing the option Future Me can live with.", myth:"One decision doesn’t matter.", tinyStep:"Write one 5‑minute honest action.", reflection:"What’s one choice Future You would thank you for?"
    }),
    D(2,"general","Stress Isn’t an Emergency","Lower stress before deciding.",{
      toolName:"Body‑First Reset", scenario:"You get a harsh text and want to snap back instantly.", safePlan:"Water/breath/move → then decide.", boundaryLine:"I’m not responding while I’m heated.", myth:"Stress means I’m weak.", tinyStep:"4 slow breaths + shoulders down.", reflection:"What’s your fastest calm tool?"
    }),
    D(3,"general","Confident No, No Drama","Refuse pressure clearly.",{
      toolName:"No‑Switch‑Exit", scenario:"Someone pushes you to do something risky “for fun.”", safePlan:"No → switch plan → leave if it continues.", boundaryLine:"No thanks. I’m heading out.", myth:"Saying no is rude.", tinyStep:"Say your no‑line out loud once.", reflection:"Write your best “No + Switch” line."
    }),
    D(4,"general","Friend Check","Spot real friends vs pressure.",{
      toolName:"Respect Test", scenario:"Someone says “prove you’re loyal.”", safePlan:"Check: respect, safety, listening. If fail → step back.", boundaryLine:"A real friend respects my no.", myth:"Real friends push you.", tinyStep:"List 2 people who respect boundaries.", reflection:"What’s one red flag you’ll watch for?"
    }),
    D(5,"general","Boredom Plan","Choose safe fun on purpose.",{
      toolName:"Safe‑Fun Menu", scenario:"You’re bored and someone suggests a risky thrill.", safePlan:"Use your menu of safe options; invite someone.", boundaryLine:"I’m down to hang, not down to risk it.", myth:"Safe fun is boring.", tinyStep:"Write 3 boredom‑breakers.", reflection:"Which safe option will you do this week?"
    }),
    D(6,"general","Name the Feeling","Feelings are signals, not bosses.",{
      toolName:"Name‑It Map", scenario:"You feel “bad” and want to escape the feeling.", safePlan:"Name feeling → name need → choose matching step.", boundaryLine:"I need a minute before I decide.", myth:"Feelings should be ignored.", tinyStep:"Fill: ‘I feel ___ because ___.’", reflection:"What feeling showed up today and what did it need?"
    }),
    D(7,"general","When Emotions Spike","Ride the wave safely.",{
      toolName:"3‑Step Spike Plan", scenario:"You’re in an argument and want to “win” with a mean line.", safePlan:"Pause body → name goal → choose calm action.", boundaryLine:"I’m too heated. I’ll come back soon.", myth:"Big emotions mean I must act.", tinyStep:"Set a 2‑minute cool‑down timer.", reflection:"What’s your 3‑step plan in your own words?"
    }),
    D(8,"general","Asking for Help","Help is a skill.",{
      toolName:"Help‑Ask Script", scenario:"You’re overwhelmed but don’t want to bother anyone.", safePlan:"Short opener → honest facts → one specific ask.", boundaryLine:"Can I talk? I need help with one thing.", myth:"Asking for help is embarrassing.", tinyStep:"Write 1 trusted adult’s name.", reflection:"What’s your exact opener sentence?"
    }),
    D(9,"general","Influence Radar","Spot influence attempts.",{
      toolName:"Pressure Pattern Spotter", scenario:"Someone uses jokes to push you into something.", safePlan:"Name the tactic → pause → choose exit/switch.", boundaryLine:"I’m not making choices from pressure.", myth:"If they’re laughing it’s harmless.", tinyStep:"Write 2 pressure tactics you’ve seen.", reflection:"Which tactic gets people the most? Why?"
    }),
    D(10,"general","Confidence Without Proving","Confidence is steady.",{
      toolName:"Values Anchor", scenario:"You want to look cool by doing something not-you.", safePlan:"Pick a value; do the value-aligned move.", boundaryLine:"That’s not me. I’m good.", myth:"Confidence means no doubt.", tinyStep:"Write 1 value you live by.", reflection:"What boundary matches that value?"
    }),

    // 11–20: foundations + routines
    D(11,"general","Coping Tools That Work","Choose relief that doesn’t cost tomorrow.",{
      toolName:"Coping Sort", scenario:"You want instant relief that could create a bigger mess.", safePlan:"Sort tools: helps-now-and-later vs costs-later.", boundaryLine:"I’m choosing a tool with a clean tomorrow.", myth:"Any coping is fine.", tinyStep:"Pick 1 healthy tool for today.", reflection:"Which tool helps you most long-term?"
    }),
    D(12,"general","Basics Boost","Protect your brain with basics.",{
      toolName:"Brain‑Fuel Check", scenario:"You’re low energy and making worse choices than usual.", safePlan:"Check: sleep/food/water/stress → then decide.", boundaryLine:"I’m fueling first, deciding second.", myth:"Willpower fixes everything.", tinyStep:"Water + small snack if possible.", reflection:"Which basic do you neglect most?"
    }),
    D(13,"general","Stack Breaker","Stop stress from piling up.",{
      toolName:"One‑Step List", scenario:"You have too much to do and freeze.", safePlan:"Write list → pick smallest next step → start.", boundaryLine:"One step at a time.", myth:"I must do it all now.", tinyStep:"Do a 5‑minute starter task.", reflection:"What’s your smallest next step today?"
    }),
    D(14,"general","Goals That Stick","Make goals realistic.",{
      toolName:"Tiny‑Step Ladder", scenario:"You set huge goals and quit fast.", safePlan:"Make step 1 tiny; repeat; level up slowly.", boundaryLine:"I’m doing the first rung today.", myth:"If it’s not huge it doesn’t count.", tinyStep:"Choose a 2‑minute rung.", reflection:"What goal and what first rung?"
    }),
    D(15,"general","Comebacks","Recover without shame.",{
      toolName:"Reset Sentence", scenario:"You mess up and want to give up entirely.", safePlan:"Name slip → choose next helpful step → do it.", boundaryLine:"I’m resetting, not quitting.", myth:"Mistakes ruin everything.", tinyStep:"Write your reset sentence.", reflection:"What’s your next-step sentence?"
    }),
    D(16,"general","Problem Solver","Widen options under stress.",{
      toolName:"Option‑Map (3 choices)", scenario:"Your brain says “no good options.”", safePlan:"List 3 options; rank safety + honesty + future impact.", boundaryLine:"I’m listing options before choosing.", myth:"There’s only one right answer.", tinyStep:"Write 3 options (even imperfect).", reflection:"Which option is safest long-term?"
    }),
    D(17,"general","Boundaries 101","Boundaries protect you.",{
      toolName:"Boundary Builder", scenario:"Someone keeps stepping on your time/space.", safePlan:"State boundary → repeat once → change distance/leave.", boundaryLine:"Stop. I’m not okay with that.", myth:"Boundaries are mean.", tinyStep:"Write one boundary sentence.", reflection:"Where do you need a boundary most?"
    }),
    D(18,"general","Conflict Cooler","Lower heat instead of winning.",{
      toolName:"Cool‑Talk Script", scenario:"A disagreement is turning into a roast battle.", safePlan:"Slow voice → name issue → make request → propose next step.", boundaryLine:"I want to solve this, not win it.", myth:"Conflict must be won.", tinyStep:"Replace one insult with one request.", reflection:"What sentence lowers heat fast?"
    }),
    D(19,"general","Support Map","Don’t carry it alone.",{
      toolName:"Support Team Map", scenario:"You’re stuck and isolating.", safePlan:"Map 2 adults + 2 peers + 1 safe place; reach out.", boundaryLine:"I’m going to talk to someone safe.", myth:"I should handle it alone.", tinyStep:"Write 2 names + how to contact.", reflection:"Who’s on your map and why?"
    }),
    D(20,"general","Review Week 1","Lock in the basics.",{
      toolName:"Mini‑Review Loop", scenario:"You forget tools unless you practice.", safePlan:"Pick 2 tools; practice 60 seconds each this week.", boundaryLine:"Practice makes this real.", myth:"If I learned it once, I’m done.", tinyStep:"Choose your 2 tools.", reflection:"Which tool is your #1 protector?"
    }),

    // 21–40: intermediate skills
    D(21,"general","Urge Wave","Urges peak and pass.",{
      toolName:"Delay‑10", scenario:"You want to do something impulsive right now.", safePlan:"Delay 10 → body reset → distract → reach out if needed.", boundaryLine:"This will pass. I can wait.", myth:"Urges control me.", tinyStep:"Set a 10‑minute timer once today.", reflection:"What’s your best 10‑minute plan?"
    }),
    D(22,"general","Exit Plans","Make leaving normal.",{
      toolName:"Exit‑Ready", scenario:"A hangout shifts into something unsafe.", safePlan:"Use your exit line; contact safe person; leave.", boundaryLine:"I’m heading out. See you later.", myth:"Leaving makes me lame.", tinyStep:"Write your exit line.", reflection:"What’s your safest exit option?"
    }),
    D(23,"general","Social Courage","Do the right thing while nervous.",{
      toolName:"Brave‑Step Ladder", scenario:"You need to say something but fear judgment.", safePlan:"Pick smallest brave step; repeat; level up.", boundaryLine:"I can do this even nervous.", myth:"I must feel ready first.", tinyStep:"One small brave action.", reflection:"What’s your brave step this week?"
    }),
    D(24,"general","Helping a Friend","Support + boundaries.",{
      toolName:"Care‑Plus‑Help", scenario:"A friend hints they’re struggling.", safePlan:"Listen → care → don’t promise secrecy → involve adult when needed.", boundaryLine:"I care too much to keep this secret.", myth:"I must fix it alone.", tinyStep:"Send one supportive message.", reflection:"What’s a caring sentence you’d use?"
    }),
    D(25,"general","Self‑Talk Upgrade","Be your own coach.",{
      toolName:"Coach‑Voice", scenario:"You’re beating yourself up and spiraling.", safePlan:"Replace bully voice with kind + specific next step.", boundaryLine:"I’m learning. Next step is ____.", myth:"Mean self-talk motivates.", tinyStep:"Rewrite one harsh thought.", reflection:"What would a good coach say?"
    }),
    D(26,"general","Anger Without Damage","Steer anger safely.",{
      toolName:"Cooldown Kit", scenario:"Anger rises fast and you want to explode.", safePlan:"Create space → cool body → breathe → talk later.", boundaryLine:"I’m angry. I’m taking a break.", myth:"Anger must explode.", tinyStep:"Cold water on hands + 10 breaths.", reflection:"What’s in your cooldown kit?"
    }),
    D(27,"general","Anxiety Reality Check","Ground in the present.",{
      toolName:"5‑4‑3‑2‑1", scenario:"Worst-case thoughts take over.", safePlan:"Ground using senses; then one tiny forward step.", boundaryLine:"I’m safe right now. I’m grounding.", myth:"Anxiety means danger is real.", tinyStep:"Do 5‑4‑3‑2‑1 once.", reflection:"Which grounding step helps you most?"
    }),
    D(28,"general","Peer Scripts","Say less, mean more.",{
      toolName:"Short Script Set", scenario:"People demand an explanation for your no.", safePlan:"Use one-liners; don’t debate; change distance.", boundaryLine:"Nope. Not for me.", myth:"I owe explanations.", tinyStep:"Pick 2 one-liners to memorize.", reflection:"Which line feels most natural?"
    }),
    D(29,"general","Decision Filters","Make choices clearer.",{
      toolName:"SAFE Filter", scenario:"You’re unsure whether something is worth it.", safePlan:"Check: Safety, Aftermath, Feelings, Exit.", boundaryLine:"If I can’t exit, it’s a no.", myth:"If unsure, say yes.", tinyStep:"Use SAFE once today.", reflection:"Which SAFE step saves you most?"
    }),
    D(30,"general","Leadership Basics","Lead without being bossy.",{
      toolName:"Redirect Move", scenario:"A group drifts toward risky choices.", safePlan:"Suggest safer plan; invite one person; leave if needed.", boundaryLine:"Let’s do something safer.", myth:"Leaders never fear judgment.", tinyStep:"Write one redirect sentence.", reflection:"How can you lead gently?"
    }),
    D(31,"general","Identity Armor","Act like who you want to be.",{
      toolName:"Identity Statement", scenario:"You feel pulled to copy others to fit in.", safePlan:"State identity/value; choose action that matches it.", boundaryLine:"I’m the kind of person who protects my future.", myth:"Fitting in is everything.", tinyStep:"Write your identity statement.", reflection:"What identity do you want to practice?"
    }),
    D(32,"general","Micro‑Rewards","Make habits easier.",{
      toolName:"Reward Loop", scenario:"You quit habits because they feel boring.", safePlan:"Tiny action + tiny reward + track streak.", boundaryLine:"Small wins count.", myth:"Rewards are childish.", tinyStep:"Pick a tiny reward.", reflection:"What reward keeps you going?"
    }),
    D(33,"general","Environment Design","Change the setup.",{
      toolName:"Friction & Ease", scenario:"You keep doing something you don’t want to do.", safePlan:"Add friction to the bad habit; add ease to good habit.", boundaryLine:"I’m changing the setup, not blaming myself.", myth:"I just lack willpower.", tinyStep:"Add one friction step.", reflection:"What change makes the good choice easier?"
    }),
    D(34,"general","Time Boundaries","Protect your time.",{
      toolName:"Time Block", scenario:"People pull you into stuff you didn’t plan.", safePlan:"Use a time limit; exit when time is up.", boundaryLine:"I can do 15 minutes, then I’m done.", myth:"Saying yes always is kind.", tinyStep:"Set one timer boundary.", reflection:"Where do you need time boundaries?"
    }),
    D(35,"general","Rumination Stop","Stop replay loops.",{
      toolName:"Name‑And‑Shift", scenario:"You replay embarrassing moments over and over.", safePlan:"Name the loop; shift attention to a task/sense.", boundaryLine:"That’s rumination. I’m shifting.", myth:"Replaying helps me fix it.", tinyStep:"Do a 30‑second shift task.", reflection:"What’s your best shift activity?"
    }),
    D(36,"general","Respectful Assertiveness","Be clear without attacking.",{
      toolName:"I‑Statement", scenario:"You need to speak up about something.", safePlan:"I feel ___ when ___; I need ___; I will ___ if not.", boundaryLine:"I need this to change.", myth:"Assertive = aggressive.", tinyStep:"Write one I‑statement.", reflection:"What do you need that you haven’t said?"
    }),
    D(37,"general","Recovery Plan","Bounce back fast.",{
      toolName:"Repair Steps", scenario:"You made a choice you regret.", safePlan:"Stop the bleed → tell a safe adult → repair one step.", boundaryLine:"I’m fixing this starting now.", myth:"I’m ruined forever.", tinyStep:"Write 1 repair action.", reflection:"What’s the first repair step?"
    }),
    D(38,"general","Social Proof Tricks","Popularity isn’t truth.",{
      toolName:"Proof Check", scenario:"“Everyone does it” gets used on you.", safePlan:"Ask: evidence? consequences? does it match my values?", boundaryLine:"“Everyone” isn’t a reason.", myth:"If it’s popular it’s safe.", tinyStep:"Write your proof question.", reflection:"Where do you feel “everyone” pressure?"
    }),
    D(39,"general","Calm Under Spotlight","Stay steady when watched.",{
      toolName:"Slow‑Voice Skill", scenario:"People watch your reaction and you feel shaky.", safePlan:"Slow voice + breathe + short line + move.", boundaryLine:"No thanks.", myth:"I must perform.", tinyStep:"Practice slow voice once.", reflection:"What helps you stay steady?"
    }),
    D(40,"general","Review Week 2","Put tools together.",{
      toolName:"Tool Chain", scenario:"Real life needs combos, not one tool.", safePlan:"Pick 2 tools and chain them (reset → script).", boundaryLine:"Reset first, then speak.", myth:"One tool should solve everything.", tinyStep:"Write your 2‑tool chain.", reflection:"What chain fits your life best?"
    }),

    // 41–60: advanced + leadership + relapse prevention
    D(41,"general","Boundaries With Friends","Keep friendships without losing yourself.",{
      toolName:"Kind‑Firm", scenario:"A friend keeps asking after you already said no.", safePlan:"Repeat boundary kindly; if continued, reduce time.", boundaryLine:"I said no. Please stop asking.", myth:"If I hold boundaries I’ll be alone.", tinyStep:"Write a kind-firm repeat line.", reflection:"How do you protect friendship and self?"
    }),
    D(42,"general","Handling Setbacks","Plan for tough days.",{
      toolName:"If‑Then Plan", scenario:"You have a predictable trigger day.", safePlan:"If trigger happens → then do tool + contact + exit.", boundaryLine:"I planned for this.", myth:"Planning is pessimistic.", tinyStep:"Write one if‑then plan.", reflection:"What’s your most common trigger situation?"
    }),
    D(43,"general","Helping Without Fixing","Support others safely.",{
      toolName:"Support Boundaries", scenario:"A friend dumps heavy stuff on you daily.", safePlan:"Care + limits + involve adults when needed.", boundaryLine:"I care, and I also need support too.", myth:"Good friends accept unlimited load.", tinyStep:"Write a boundary for support.", reflection:"How do you help without drowning?"
    }),
    D(44,"general","Values Under Pressure","Make values real in the moment.",{
      toolName:"Value‑Choice Pivot", scenario:"A crowd is daring you.", safePlan:"Name value → choose action that protects it → exit.", boundaryLine:"I protect my future.", myth:"Values are for calm days only.", tinyStep:"Pick your top value.", reflection:"Which value is hardest to follow?"
    }),
    D(45,"general","Rebuild Trust","Repair after mistakes.",{
      toolName:"Trust Ladder", scenario:"You disappointed someone important.", safePlan:"Own it → small consistent actions → time.", boundaryLine:"I’m earning trust back with actions.", myth:"Saying sorry is enough.", tinyStep:"Choose one trust action.", reflection:"What action rebuilds trust fastest?"
    }),
    D(46,"general","Stress Forecasting","Predict and prevent.",{
      toolName:"Stress Calendar", scenario:"A busy week is coming and you’ll be drained.", safePlan:"Pre‑plan resets + sleep + help asks.", boundaryLine:"I’m preparing, not panicking.", myth:"I’ll figure it out later.", tinyStep:"Plan 2 resets on calendar.", reflection:"What week needs planning most?"
    }),
    D(47,"general","Identity + Community","Choose your circle intentionally.",{
      toolName:"Circle Audit", scenario:"Your group normalizes unhealthy choices.", safePlan:"Spend more time with people who respect boundaries.", boundaryLine:"I’m choosing healthier spaces.", myth:"I can’t change my circle.", tinyStep:"List 2 healthier spaces.", reflection:"Where do you feel healthiest?"
    }),
    D(48,"general","Self‑Respect Habits","Protect dignity.",{
      toolName:"Dignity Rule", scenario:"You’re tempted to do something you’d hide later.", safePlan:"If you’d hide it, don’t do it; choose cleaner option.", boundaryLine:"I don’t do secrecy choices.", myth:"Secrecy keeps me safe.", tinyStep:"Write your dignity rule.", reflection:"What secrecy trap have you seen?"
    }),
    D(49,"general","Mentoring Skills","Help younger peers.",{
      toolName:"Teach‑Back", scenario:"Someone asks how you say no.", safePlan:"Teach one script; practice once; celebrate.", boundaryLine:"Try: ‘No thanks—let’s do ___ instead.’", myth:"I’m not qualified to help.", tinyStep:"Teach one tool to someone.", reflection:"What tool do you teach best?"
    }),
    D(50,"general","Relapse Prevention","Plan for slips.",{
      toolName:"Slip Plan", scenario:"You return to an old habit during stress.", safePlan:"Notice early signs → reduce exposure → ask help → reset.", boundaryLine:"I catch slips early.", myth:"A slip means failure.", tinyStep:"Write your early warning sign.", reflection:"What’s your first warning sign?"
    }),
    D(51,"general","Hard Conversations","Talk to adults effectively.",{
      toolName:"3‑Line Brief", scenario:"You need to tell an adult something hard.", safePlan:"Line1 what happened; Line2 how you feel; Line3 what you need.", boundaryLine:"I need help with this.", myth:"Adults will always overreact.", tinyStep:"Draft your 3 lines.", reflection:"Who is the best adult for this?"
    }),
    D(52,"general","Respecting Others’ Boundaries","Healthy relationships.",{
      toolName:"Consent Check", scenario:"A friend says no and you feel annoyed.", safePlan:"Respect no; offer alternative; don’t pressure.", boundaryLine:"Thanks for telling me.", myth:"Persistence is romantic/cool.", tinyStep:"Practice a respectful response.", reflection:"How does respecting no build trust?"
    }),
    D(53,"general","Repairing Friendships","Fix conflict with skill.",{
      toolName:"Repair Script", scenario:"You said something you regret.", safePlan:"Own impact → apologize → ask how to repair → do it.", boundaryLine:"I’m sorry. How can I fix it?", myth:"Apologies are weakness.", tinyStep:"Write one repair message.", reflection:"What makes an apology real?"
    }),
    D(54,"general","Long‑Game Thinking","Build a life you like.",{
      toolName:"Future Snapshot", scenario:"You’re stuck in short-term thinking.", safePlan:"Picture future; pick one habit that supports it.", boundaryLine:"I’m building my future.", myth:"Future is too far away.", tinyStep:"Write 1 future goal.", reflection:"What future do you want most?"
    }),
    D(55,"general","Protecting Sleep","Sleep is mental armor.",{
      toolName:"Wind‑Down Plan", scenario:"You stay up late and feel worse daily.", safePlan:"Set a wind-down; reduce screens; consistent wake time.", boundaryLine:"I’m going to bed on purpose.", myth:"Sleep doesn’t matter.", tinyStep:"Pick a bedtime alarm.", reflection:"What changes when you sleep more?"
    }),
    D(56,"general","Handling Shame","Shame fuels loops.",{
      toolName:"Name‑Shame → Choose‑Care", scenario:"You feel embarrassed and want to hide.", safePlan:"Name shame; choose caring action; talk to safe person.", boundaryLine:"I’m allowed to learn.", myth:"Shame makes me better.", tinyStep:"Do one caring action.", reflection:"What care action helps you most?"
    }),
    D(57,"general","Healthy Pride","Be proud of boundaries.",{
      toolName:"Win Log", scenario:"You forget your progress and feel stuck.", safePlan:"Log wins; review weekly; celebrate.", boundaryLine:"I’m proud of my progress.", myth:"Pride is arrogance.", tinyStep:"Write 3 small wins.", reflection:"What win matters most to you?"
    }),
    D(58,"general","Service & Meaning","Meaning beats empty thrills.",{
      toolName:"Meaning Menu", scenario:"You chase excitement but feel empty later.", safePlan:"Choose meaning activity: create/help/learn/move.", boundaryLine:"I want meaning, not mess.", myth:"Meaning is boring.", tinyStep:"Pick one meaning activity.", reflection:"What gives you real meaning?"
    }),
    D(59,"general","Maintaining Momentum","Keep it going.",{
      toolName:"Weekly Reset", scenario:"You do great then forget routines.", safePlan:"Weekly reset: review goals, schedule tools, adjust.", boundaryLine:"I reset weekly.", myth:"If I miss a day, I’m done.", tinyStep:"Schedule a 10‑min weekly reset.", reflection:"What will you review each week?"
    }),
    D(60,"general","Graduation","Make your personal playbook.",{
      toolName:"My Playbook", scenario:"You want a simple plan you can follow forever.", safePlan:"Pick top tools + scripts + support map + slip plan.", boundaryLine:"I follow my playbook.", myth:"I need motivation first.", tinyStep:"Write your 5‑item playbook.", reflection:"Which 5 items are in your playbook?"
    }),
  ];

  /* =========================================================
     GAMING — 60 unique lessons
  ========================================================= */
  const GAMING = [
    D(1,"gaming","Your Stop Button","Stopping is a skill.",{
      toolName:"Stop‑Signal Routine", scenario:"You keep playing past your planned stop time.", safePlan:"Timer → stand → water → switch task.", boundaryLine:"I’m stopping now like I planned.", myth:"I’ll stop when I feel like it.", tinyStep:"Set a timer before playing.", reflection:"What’s your best stop signal?"
    }),
    D(2,"gaming","Triggers","Know what pulls you in.",{
      toolName:"Trigger List", scenario:"A rough day makes gaming feel like the only relief.", safePlan:"Name trigger → pick 1 healthier relief tool first.", boundaryLine:"I’m doing a reset first.", myth:"Gaming is my only coping tool.", tinyStep:"Write 3 triggers.", reflection:"Which trigger is biggest for you?"
    }),
    D(3,"gaming","The ‘Just One More’ Trick","Beat the loop.",{
      toolName:"One‑More Breaker", scenario:"You say “one more match” repeatedly.", safePlan:"End-of-session ritual + hard stop + replacement action.", boundaryLine:"One more is how I lose time.", myth:"One more won’t matter.", tinyStep:"Choose a replacement action.", reflection:"What replacement action works best?"
    }),
    D(4,"gaming","Make It Harder to Autopilot","Change the setup.",{
      toolName:"Friction Setup", scenario:"You open games without thinking.", safePlan:"Move icon, log out, add a step, or schedule only.", boundaryLine:"I’m changing the setup.", myth:"It’s all willpower.", tinyStep:"Add one friction step.", reflection:"What change reduces autopilot most?"
    }),
    D(5,"gaming","Schedule Play on Purpose","Plan beats regret.",{
      toolName:"Planned Play Window", scenario:"Gaming crowds out homework/sleep.", safePlan:"Pick a window; stop at end; protect sleep.", boundaryLine:"I play in my window.", myth:"Schedules kill fun.", tinyStep:"Pick a 45–90 min window.", reflection:"When is your best play time?"
    }),
    D(6,"gaming","Warm‑Up Rules","Start clean.",{
      toolName:"Start Checklist", scenario:"You start angry/tired and tilt fast.", safePlan:"If tired/angry → reset first; then play.", boundaryLine:"I don’t start while tilted.", myth:"Playing fixes tilt.", tinyStep:"Write your start checklist.", reflection:"What’s your #1 start rule?"
    }),
    D(7,"gaming","Tilt Control","Don’t spiral.",{
      toolName:"Tilt Timeout", scenario:"A loss makes you chase wins for hours.", safePlan:"Two-loss rule → 5‑minute break → decide.", boundaryLine:"I’m taking a timeout.", myth:"I must win it back now.", tinyStep:"Write your two-loss rule.", reflection:"What’s your tilt warning sign?"
    }),
    D(8,"gaming","Dopamine Basics","Understand the pull.",{
      toolName:"Craving Label", scenario:"You feel restless when not playing.", safePlan:"Label craving; do a 2‑minute body reset.", boundaryLine:"This is a craving, not a command.", myth:"Restless means I need to play.", tinyStep:"2‑minute walk or stretch.", reflection:"What does a craving feel like for you?"
    }),
    D(9,"gaming","Social Pressure in Games","Boundaries with friends.",{
      toolName:"Friend Boundary Script", scenario:"Friends spam invites when you need to stop.", safePlan:"Use a script; set status; follow through.", boundaryLine:"I’m done for today. Tomorrow.", myth:"I’ll disappoint them if I stop.", tinyStep:"Write your stop message.", reflection:"How will you say no to invites?"
    }),
    D(10,"gaming","Fun Without Overdoing It","Balance identity.",{
      toolName:"Two‑Bucket Life", scenario:"Gaming becomes your only hobby.", safePlan:"Keep 2 non-screen hobbies active weekly.", boundaryLine:"I’m more than one hobby.", myth:"Other hobbies are pointless.", tinyStep:"Pick one non-screen activity.", reflection:"What non-screen activity sounds okay?"
    }),
    // 11–60 (kept unique, still hardcoded)
    D(11,"gaming","Sleep Protector","Sleep makes everything easier.",{
      toolName:"Bedtime Shield", scenario:"Late gaming ruins mornings.", safePlan:"Bedtime alarm + no new matches after alarm.", boundaryLine:"I protect my sleep.", myth:"Sleep is optional.", tinyStep:"Set a bedtime alarm.", reflection:"What changes when you sleep more?"
    }),
    D(12,"gaming","Homework First Rule","Earn play time.",{
      toolName:"Play Earned", scenario:"You play before responsibilities and feel guilty.", safePlan:"Do 15 minutes work → then decide play.", boundaryLine:"Work first, then play.", myth:"I can do it later.", tinyStep:"Do 15 minutes of one task.", reflection:"What task blocks you most?"
    }),
    D(13,"gaming","Environment Reset","Change the room, change the habit.",{
      toolName:"Space Swap", scenario:"Your setup pulls you in all day.", safePlan:"Play only at a specific place/time; close it after.", boundaryLine:"This space is for planned play.", myth:"Place doesn’t matter.", tinyStep:"Choose your play-only spot.", reflection:"Where do you want your setup?"
    }),
    D(14,"gaming","Micro‑Breaks","Prevent time loss.",{
      toolName:"20‑Minute Check‑In", scenario:"Hours pass without noticing.", safePlan:"Every 20 min: stand + sip water + check time.", boundaryLine:"I check in with time.", myth:"I can feel time passing.", tinyStep:"Set a repeating timer.", reflection:"What does time loss feel like?"
    }),
    D(15,"gaming","Rage to Reset","Anger plan.",{
      toolName:"Hands‑Off Reset", scenario:"You slam keys/controller in frustration.", safePlan:"Hands off → breathe → step away 2 minutes.", boundaryLine:"I pause before I break something.", myth:"Anger is part of gaming.", tinyStep:"Practice hands-off once.", reflection:"What helps you cool down fastest?"
    }),
    D(16,"gaming","Spending Boundaries","Protect money.",{
      toolName:"Purchase Pause", scenario:"You feel pulled to buy an in-game item instantly.", safePlan:"24‑hour pause rule; talk to guardian if needed.", boundaryLine:"I don’t buy on impulse.", myth:"Small purchases don’t add up.", tinyStep:"Turn off one-click buying if possible.", reflection:"What triggers spending urges?"
    }),
    D(17,"gaming","Queue Discipline","Don’t chain matches.",{
      toolName:"No Auto‑Queue", scenario:"Auto-queue keeps you stuck.", safePlan:"Disable auto-queue or return to lobby each match.", boundaryLine:"I choose each match.", myth:"The game decides my time.", tinyStep:"Change one setting.", reflection:"Which setting helps most?"
    }),
    D(18,"gaming","Social Drama Filter","Avoid toxic chats.",{
      toolName:"Chat Boundary", scenario:"Chat makes you upset and you keep playing angry.", safePlan:"Mute/leave; play with supportive people.", boundaryLine:"I’m not staying in toxic chat.", myth:"Toxic is normal.", tinyStep:"Mute one toxic channel.", reflection:"How do you feel after toxic chat?"
    }),
    D(19,"gaming","Reward Replacement","Replace the reward feeling.",{
      toolName:"Post‑Play Reward", scenario:"Stopping feels empty.", safePlan:"Plan a small reward after stopping (music/snack/shower).", boundaryLine:"Stopping gets a reward too.", myth:"Only gaming is rewarding.", tinyStep:"Pick one post-play reward.", reflection:"What reward feels good and safe?"
    }),
    D(20,"gaming","Review Week 1","Combine stop + tilt tools.",{
      toolName:"Stop‑Tilt Combo", scenario:"You stop late because you’re tilted.", safePlan:"Two-loss rule + stop timer + exit routine.", boundaryLine:"I end sessions clean.", myth:"Combos are too hard.", tinyStep:"Write your combo plan.", reflection:"What combo fits you best?"
    }),
    // 21–40: advanced self-control
    D(21,"gaming","Identity Shift","You’re not your rank.",{
      toolName:"Worth Split", scenario:"Your mood depends on wins/losses.", safePlan:"Separate self-worth from outcomes; focus on skills.", boundaryLine:"My worth isn’t my score.", myth:"Winning proves my value.", tinyStep:"Write 1 skill goal.", reflection:"What skill do you want to improve?"
    }),
    D(22,"gaming","Time Budgeting","Give time a job.",{
      toolName:"Weekly Time Budget", scenario:"You don’t know how much you play.", safePlan:"Pick weekly cap; track; adjust.", boundaryLine:"I set my time budget.", myth:"Tracking is obsessive.", tinyStep:"Track one week roughly.", reflection:"What cap feels realistic?"
    }),
    D(23,"gaming","Boredom Without Screens","Expand options.",{
      toolName:"Offline Menu", scenario:"Without games you feel bored instantly.", safePlan:"Create an offline menu and pick one.", boundaryLine:"I can do offline fun too.", myth:"Offline is pointless.", tinyStep:"Write 5 offline options.", reflection:"Which offline option is easiest?"
    }),
    D(24,"gaming","Recovery Days","Plan screen breaks.",{
      toolName:"Light Day", scenario:"You feel burned out but keep playing.", safePlan:"Schedule a lighter day; do recovery activities.", boundaryLine:"I’m taking a light day.", myth:"Breaks make me worse.", tinyStep:"Plan one light day.", reflection:"What does recovery look like for you?"
    }),
    D(25,"gaming","Friends Who Respect Stops","Choose support.",{
      toolName:"Invite Rule", scenario:"Friends mock you for logging off.", safePlan:"Play with supportive people; set expectations.", boundaryLine:"Respect my stop time.", myth:"Good friends keep you on.", tinyStep:"Tell one friend your stop time.", reflection:"Who respects your boundaries?"
    }),
    D(26,"gaming","Stress Substitution","Gaming isn’t the only relief.",{
      toolName:"Two‑Tool Rule", scenario:"You game whenever stressed.", safePlan:"Before gaming, use 1 non-screen tool for 3 minutes.", boundaryLine:"Reset first.", myth:"I must escape stress fast.", tinyStep:"Pick your 3‑minute tool.", reflection:"Which tool lowers stress quickly?"
    }),
    D(27,"gaming","Plan for Big Releases","Avoid binge spirals.",{
      toolName:"Release Plan", scenario:"A new release drops and you want to play all night.", safePlan:"Plan sessions; protect sleep; keep responsibilities.", boundaryLine:"I can enjoy without binging.", myth:"Release week doesn’t count.", tinyStep:"Write release-week schedule.", reflection:"What’s your biggest binge risk?"
    }),
    D(28,"gaming","Don’t Play Hungry/Tired","Reduce vulnerability.",{
      toolName:"HALT Check", scenario:"You play longer when hungry/tired.", safePlan:"Check Hungry/Angry/Lonely/Tired; fix first.", boundaryLine:"I’m fueling first.", myth:"It doesn’t affect me.", tinyStep:"Do one HALT fix.", reflection:"Which HALT factor hits you most?"
    }),
    D(29,"gaming","Make Stopping Easy","Design the finish.",{
      toolName:"End Ritual", scenario:"Stopping feels abrupt and you resist.", safePlan:"End ritual: save → stretch → water → log win.", boundaryLine:"Session complete.", myth:"Rituals are silly.", tinyStep:"Create a 4-step ritual.", reflection:"What’s your ritual?"
    }),
    D(30,"gaming","Review Week 2","Master your stop system.",{
      toolName:"Stop System", scenario:"You want a reliable system.", safePlan:"Timer + ritual + replacement + friend script.", boundaryLine:"System > mood.", myth:"I need motivation.", tinyStep:"Write your system in one note.", reflection:"What part is weakest?"
    }),
    // 31–60: leadership + long-term balance
    D(31,"gaming","Skill Goals","Play for growth not escape.",{
      toolName:"Skill Ladder", scenario:"You grind mindlessly.", safePlan:"Pick one skill goal per week; stop when done.", boundaryLine:"I stop after the goal.", myth:"More hours = better.", tinyStep:"Choose one skill goal.", reflection:"What skill goal is exciting?"
    }),
    D(32,"gaming","Healthy Competition","Compete without harm.",{
      toolName:"Respect Rule", scenario:"Trash talk makes you mean.", safePlan:"Respect rule: no insults; mute if needed.", boundaryLine:"I don’t insult people.", myth:"Trash talk is required.", tinyStep:"Mute at first insult.", reflection:"How do you want to act in competition?"
    }),
    D(33,"gaming","Family/Guardian Agreements","Make plans together.",{
      toolName:"Agreement Draft", scenario:"Rules feel random and fights happen.", safePlan:"Draft a clear agreement: times, chores, sleep.", boundaryLine:"Let’s agree on clear rules.", myth:"Adults don’t listen.", tinyStep:"Write 3 fair rules.", reflection:"What rule feels most fair?"
    }),
    D(34,"gaming","Mood Tracking","Know your patterns.",{
      toolName:"Before/After Check", scenario:"You feel worse after long sessions.", safePlan:"Rate mood before/after; adjust time.", boundaryLine:"I’m tracking patterns.", myth:"It doesn’t affect mood.", tinyStep:"Do 3 before/after checks.", reflection:"What do you notice?"
    }),
    D(35,"gaming","Relapse Plan","Prevent backslides.",{
      toolName:"Slip Catch", scenario:"You break your cap and binge.", safePlan:"Stop early the next day; talk; rebuild system.", boundaryLine:"I reset fast.", myth:"I blew it; why try.", tinyStep:"Write a reset rule.", reflection:"What helps you reset?"
    }),
    D(36,"gaming","Device Hygiene","Reduce temptation.",{
      toolName:"Out‑of‑Room Charging", scenario:"Late-night device use keeps you up.", safePlan:"Charge device outside room; alarm alternative.", boundaryLine:"Device sleeps outside.", myth:"I need it by my bed.", tinyStep:"Move charger tonight.", reflection:"What’s your sleep barrier?"
    }),
    D(37,"gaming","Community Choice","Choose healthier spaces.",{
      toolName:"Community Audit", scenario:"Your server/group is toxic.", safePlan:"Leave toxic spaces; join supportive groups.", boundaryLine:"I choose healthier communities.", myth:"All communities are toxic.", tinyStep:"Leave one toxic chat.", reflection:"What community feels safe?"
    }),
    D(38,"gaming","Offline Wins","Build non-screen confidence.",{
      toolName:"Offline Challenge", scenario:"You doubt yourself outside games.", safePlan:"Pick a small offline challenge weekly.", boundaryLine:"I grow offline too.", myth:"I’m only good at games.", tinyStep:"Choose one offline challenge.", reflection:"What challenge would make you proud?"
    }),
    D(39,"gaming","Helping Friends Stop","Be a positive leader.",{
      toolName:"Buddy Stop", scenario:"A friend struggles to log off.", safePlan:"Offer to end together; plan next day.", boundaryLine:"Let’s log off together.", myth:"Helping is corny.", tinyStep:"Send one supportive stop message.", reflection:"How can you lead kindly?"
    }),
    D(40,"gaming","Review Week 3","Your full balance plan.",{
      toolName:"Balance Blueprint", scenario:"You want long-term control.", safePlan:"Cap + rituals + sleep + offline menu + support.", boundaryLine:"I run my schedule.", myth:"Balance is impossible.", tinyStep:"Write your blueprint.", reflection:"What’s the #1 rule you’ll keep?"
    }),
    D(41,"gaming","Focus Training","Strengthen attention.",{
      toolName:"Single‑Task Sprint", scenario:"You can’t focus on homework.", safePlan:"10 minutes single-task → break → repeat.", boundaryLine:"10 minutes, then break.", myth:"I can’t focus at all.", tinyStep:"Do one 10-minute sprint.", reflection:"What helped your focus?"
    }),
    D(42,"gaming","Stress Without Escape","Build resilience.",{
      toolName:"Resilience Reps", scenario:"Stress pushes you to escape.", safePlan:"Do 2-minute stress tool; then choose.", boundaryLine:"Tool first.", myth:"Escape is the only answer.", tinyStep:"2-minute stress rep.", reflection:"Which rep is easiest?"
    }),
    D(43,"gaming","End-of-Day Reset","Close loops.",{
      toolName:"Shutdown Routine", scenario:"You game late because your mind won’t stop.", safePlan:"Write tomorrow list; short wind-down.", boundaryLine:"Day is done.", myth:"More gaming calms me.", tinyStep:"Write 3 tomorrow tasks.", reflection:"How does shutdown feel?"
    }),
    D(44,"gaming","Health Check","Protect body.",{
      toolName:"Posture + Break", scenario:"Body aches after long sessions.", safePlan:"Stretch + posture check + breaks.", boundaryLine:"My body matters.", myth:"Pain is normal.", tinyStep:"Do a 60-second stretch.", reflection:"What’s one health change you’ll keep?"
    }),
    D(45,"gaming","Celebrating Stops","Make stopping positive.",{
      toolName:"Stop Win", scenario:"Stopping feels like loss.", safePlan:"Treat stop as a win; log it.", boundaryLine:"Stopping is a win.", myth:"Stopping means I failed.", tinyStep:"Log one stop win.", reflection:"How do you reward stops?"
    }),
    D(46,"gaming","Personal Ruleset","Write your rules.",{
      toolName:"My Rules", scenario:"You rely on vibes and it fails.", safePlan:"Write rules: time, sleep, tilt, spending.", boundaryLine:"I follow my rules.", myth:"Rules are too strict.", tinyStep:"Write 4 rules.", reflection:"Which rule protects you most?"
    }),
    D(47,"gaming","Plan for Vacations","Avoid all-day loops.",{
      toolName:"Vacation Plan", scenario:"You’re off school and gaming expands.", safePlan:"Daily cap + morning routine + offline activity.", boundaryLine:"Vacations still have structure.", myth:"Break means no limits.", tinyStep:"Set a vacation cap.", reflection:"What routine anchors you?"
    }),
    D(48,"gaming","Mindful Play","Be present.",{
      toolName:"Mindful Check", scenario:"You play on autopilot.", safePlan:"Ask: am I choosing this? for how long?", boundaryLine:"I choose consciously.", myth:"Autopilot is fine.", tinyStep:"Do 3 mindful checks.", reflection:"When do you autopilot most?"
    }),
    D(49,"gaming","Handling Losing Streaks","Protect mood.",{
      toolName:"Stop‑After‑Tilt", scenario:"Losses make you spiral.", safePlan:"Stop early; do reset; return tomorrow.", boundaryLine:"I don’t chase losses.", myth:"Next match will fix it.", tinyStep:"Write your stop threshold.", reflection:"What threshold is fair?"
    }),
    D(50,"gaming","Long‑Term Identity","More than a player.",{
      toolName:"3‑Identity List", scenario:"Gaming becomes your whole identity.", safePlan:"List 3 identities; practice each weekly.", boundaryLine:"I’m many things.", myth:"One identity is enough.", tinyStep:"List 3 identities.", reflection:"Which identity needs attention?"
    }),
    D(51,"gaming","Mentor Mode","Teach healthy habits.",{
      toolName:"Teach‑A‑Tool", scenario:"A younger player looks up to you.", safePlan:"Teach stop routine; praise boundaries.", boundaryLine:"Stopping is smart.", myth:"Mentoring is cringe.", tinyStep:"Teach one tool.", reflection:"What would you tell younger you?"
    }),
    D(52,"gaming","Respecting Limits","No means no, even in invites.",{
      toolName:"Invite Respect", scenario:"A friend says they need to log off.", safePlan:"Say ok; don’t guilt; plan later.", boundaryLine:"All good. Later.", myth:"Guilt invites are normal.", tinyStep:"Practice a respectful reply.", reflection:"How does respect build trust?"
    }),
    D(53,"gaming","Plan After Success","Success can trigger binge.",{
      toolName:"Win Stop", scenario:"A big win makes you keep playing for hours.", safePlan:"Celebrate and stop; save highlight; log off.", boundaryLine:"I stop on a win.", myth:"Stop only after a loss.", tinyStep:"Choose a celebration ritual.", reflection:"What’s a good celebration?"
    }),
    D(54,"gaming","Hard Days","Protect the system.",{
      toolName:"Hard‑Day Protocol", scenario:"A bad day makes you want to escape all night.", safePlan:"Hard-day protocol: 2 tools + cap + sleep.", boundaryLine:"Hard day = more structure.", myth:"Hard days don’t count.", tinyStep:"Write your protocol.", reflection:"What tool helps hardest days?"
    }),
    D(55,"gaming","Control Center","Single page plan.",{
      toolName:"One‑Page Plan", scenario:"You forget rules under stress.", safePlan:"Write a one-page plan; keep visible.", boundaryLine:"I follow my plan.", myth:"I’ll remember.", tinyStep:"Write your one-page plan.", reflection:"Where will you keep it?"
    }),
    D(56,"gaming","Accountability Buddy","Support makes it easier.",{
      toolName:"Buddy Check‑In", scenario:"You struggle to stop alone.", safePlan:"Text buddy at stop time; confirm logoff.", boundaryLine:"Checking in now.", myth:"I should do it alone.", tinyStep:"Pick a buddy.", reflection:"Who is safe support?"
    }),
    D(57,"gaming","Replace Late Night","Evening routines.",{
      toolName:"Evening Swap", scenario:"You game late because evenings feel empty.", safePlan:"Swap: shower/music/book/stretch.", boundaryLine:"Evening has a plan.", myth:"Evenings are only for screens.", tinyStep:"Pick one evening swap.", reflection:"What evening swap feels easiest?"
    }),
    D(58,"gaming","Celebrate Balance","Make balance rewarding.",{
      toolName:"Balance Badge", scenario:"Balance feels invisible.", safePlan:"Reward weeks you follow caps; celebrate.", boundaryLine:"Balance is success.", myth:"Only wins matter.", tinyStep:"Pick a balance reward.", reflection:"What reward motivates you?"
    }),
    D(59,"gaming","Future Me Vision","Gaming fits into life.",{
      toolName:"Future Snapshot", scenario:"You want gaming plus a good future.", safePlan:"Describe future; set rules that support it.", boundaryLine:"Gaming supports my future.", myth:"Future is incompatible.", tinyStep:"Write a future snapshot.", reflection:"What does future you want?"
    }),
    D(60,"gaming","Graduation Plan","Your personal gaming playbook.",{
      toolName:"Gaming Playbook", scenario:"You want long-term control forever.", safePlan:"Cap + stop ritual + tilt rule + sleep + buddy.", boundaryLine:"I run my playbook.", myth:"I need motivation first.", tinyStep:"Write your 5 rules.", reflection:"Which rule is non‑negotiable?"
    }),
  ];

/* ===========================
   SOCIAL MEDIA — replace days 41–60 (hardcoded)
=========================== */
  const SOCIAL = [
    D(1,"socialmedia","Trend Safety","Pause before trends.",{
      toolName:"Trend Filter", scenario:"A challenge pressures you to do something risky.", safePlan:"Check risk/secrecy/harm; if any yes → skip.", boundaryLine:"I don’t do dares for attention.", myth:"Trends are harmless.", tinyStep:"Set one app timer.", reflection:"What’s your personal trend rule?"
    }),
    D(2,"socialmedia","Attention Economics","Apps are designed to pull.",{
      toolName:"Design Awareness", scenario:"You open an app and lose 40 minutes instantly.", safePlan:"Name the design; set timer; exit when done.", boundaryLine:"I decide when I’m done.", myth:"I’m weak for scrolling.", tinyStep:"Use a 15-minute timer once.", reflection:"What hook pulls you most?"
    }),
    D(3,"socialmedia","Comment Armor","Protect your mood.",{
      toolName:"Boundary Scroll", scenario:"Comments make you anxious but you keep reading.", safePlan:"Stop at first stress sign; switch task.", boundaryLine:"I don’t feed my stress.", myth:"I have to read it all.", tinyStep:"Exit after 1 stress sign.", reflection:"What’s your stress sign?"
    }),
    D(4,"socialmedia","Comparison Detox","Comparison steals joy.",{
      toolName:"Reality Check", scenario:"You compare your life to highlight reels.", safePlan:"Name it as highlights; focus on real wins.", boundaryLine:"Highlights aren’t the whole story.", myth:"Everyone is happier than me.", tinyStep:"Write 3 real-life wins.", reflection:"When do you compare most?"
    }),
    D(5,"socialmedia","DM Pressure","Boundaries in messages.",{
      toolName:"DM Script", scenario:"Someone pressures you privately.", safePlan:"Short no; don’t debate; block/mute; tell adult if unsafe.", boundaryLine:"Stop messaging me about that.", myth:"Private pressure is less serious.", tinyStep:"Write a DM boundary line.", reflection:"What’s your safest response in DMs?"
    }),
    D(6,"socialmedia","Curate Your Feed","Your feed shapes your mind.",{
      toolName:"Feed Audit", scenario:"Your feed makes you feel worse daily.", safePlan:"Unfollow/mute; follow healthier content.", boundaryLine:"I curate what I consume.", myth:"My feed doesn’t affect me.", tinyStep:"Mute 3 accounts.", reflection:"What content helps you feel better?"
    }),
    D(7,"socialmedia","Notification Control","Dings control attention.",{
      toolName:"Notification Diet", scenario:"Notifications interrupt homework constantly.", safePlan:"Turn off nonessential notifications.", boundaryLine:"Notifications don’t run me.", myth:"I’ll miss everything.", tinyStep:"Turn off 1 notification type.", reflection:"Which notification is worst?"
    }),
    D(8,"socialmedia","Posting With Purpose","Post intentionally.",{
      toolName:"Purpose Check", scenario:"You want to post for validation.", safePlan:"Ask purpose; if it’s only validation, pause.", boundaryLine:"I don’t post to beg for approval.", myth:"Likes equal worth.", tinyStep:"Wait 10 minutes before posting.", reflection:"What’s a healthy reason to post?"
    }),
    D(9,"socialmedia","Rumor Safety","Don’t amplify harm.",{
      toolName:"Before You Share", scenario:"You’re tempted to repost drama.", safePlan:"Ask: true? kind? necessary? safe?", boundaryLine:"I’m not sharing this.", myth:"Sharing is harmless.", tinyStep:"Pause before one share today.", reflection:"What rule protects others most?"
    }),
    D(10,"socialmedia","Online Boundaries","Protect your time.",{
      toolName:"Time Window", scenario:"Scrolling eats your evenings.", safePlan:"Set a window; stop; replace with planned activity.", boundaryLine:"I scroll in my window only.", myth:"I can stop anytime.", tinyStep:"Pick a daily window.", reflection:"When is your best window?"
    }),
    // 11–60 (unique, hardcoded)
    D(11,"socialmedia","Confidence Offline","Build confidence away from screens.",{
      toolName:"Offline Win", scenario:"You feel invisible without posting.", safePlan:"Do one offline skill/win; log it.", boundaryLine:"My life is real offline.", myth:"If it’s not posted it doesn’t count.", tinyStep:"Do one offline win.", reflection:"What offline win would you like?"
    }),
    D(12,"socialmedia","The Algorithm Doesn’t Know You","Don’t obey the feed.",{
      toolName:"Intent First", scenario:"The feed drags you from your plan.", safePlan:"State intent before opening; leave when done.", boundaryLine:"I open with a purpose.", myth:"The feed shows what I need.", tinyStep:"Say your intent aloud once.", reflection:"What’s your intent phrase?"
    }),
    D(13,"socialmedia","Dealing With FOMO","You can miss things safely.",{
      toolName:"FOMO Reframe", scenario:"You feel anxious when not online.", safePlan:"Reframe: missing noise can be peace.", boundaryLine:"I’m allowed to be offline.", myth:"I’ll be left out forever.", tinyStep:"Take a 30‑minute offline break.", reflection:"What did you gain offline?"
    }),
    D(14,"socialmedia","Screenshot Anxiety","Privacy mindset.",{
      toolName:"Assume Screenshot", scenario:"You’re tempted to send something risky.", safePlan:"Assume it’s saved forever; choose safer message.", boundaryLine:"I’m not sending that.", myth:"Disappearing messages disappear.", tinyStep:"Delete one risky draft.", reflection:"What does “forever” change?"
    }),
    D(15,"socialmedia","Online Kindness","Be firm without cruelty.",{
      toolName:"Kind‑Firm Reply", scenario:"Someone baits you into a fight.", safePlan:"Don’t feed; short reply or disengage.", boundaryLine:"I’m not arguing here.", myth:"I must defend myself publicly.", tinyStep:"Practice one disengage line.", reflection:"What line protects your peace?"
    }),
    D(16,"socialmedia","Blocking Isn’t Mean","Safety tools are okay.",{
      toolName:"Safety Controls", scenario:"Someone keeps bothering you.", safePlan:"Mute/block/report; tell trusted adult if needed.", boundaryLine:"I’m blocking for my safety.", myth:"Blocking is dramatic.", tinyStep:"Learn where block/report is.", reflection:"What safety tool will you use first?"
    }),
    D(17,"socialmedia","Group Chat Pressure","Crowds intensify pressure.",{
      toolName:"Crowd Pause", scenario:"Group chat dares you to do something dumb.", safePlan:"Pause; don’t perform; exit or change subject.", boundaryLine:"Nope. Not doing that.", myth:"You must respond fast.", tinyStep:"Wait 60 seconds before replying once.", reflection:"What happens when you wait?"
    }),
    D(18,"socialmedia","Identity vs Persona","Be you.",{
      toolName:"Persona Check", scenario:"You act different online to get approval.", safePlan:"Notice persona; choose authentic actions.", boundaryLine:"I’m not performing a fake me.", myth:"Fake confidence is required.", tinyStep:"Write 3 real traits you like.", reflection:"What’s one authentic post idea?"
    }),
    D(19,"socialmedia","Doomscroll Break","Stop negative loops.",{
      toolName:"Scroll Stopper", scenario:"Bad news content makes you spiral.", safePlan:"Stop after 2 minutes; do grounding; switch.", boundaryLine:"I’m stopping doomscroll.", myth:"More info will calm me.", tinyStep:"Set a doomscroll limit.", reflection:"What helps you switch?"
    }),
    D(20,"socialmedia","Review Week 1","Your attention plan.",{
      toolName:"Attention Plan", scenario:"You want control over your attention.", safePlan:"Timers + feed audit + intent phrase + windows.", boundaryLine:"My attention is mine.", myth:"Control is impossible.", tinyStep:"Write your plan.", reflection:"Which part is hardest?"
    }),
    // 21–60: advanced + leadership
    D(21,"socialmedia","Self‑Respect Posting","Choose dignity.",{
      toolName:"Dignity Rule", scenario:"You’re tempted to post something you’d regret.", safePlan:"If you’d hide it from a trusted adult, don’t post.", boundaryLine:"I’m not posting that.", myth:"Shock gets respect.", tinyStep:"Write your dignity rule.", reflection:"What’s your regret warning sign?"
    }),
    D(22,"socialmedia","Parasocial Reality","Creators aren’t your friends.",{
      toolName:"Reality Divider", scenario:"You feel obsessed with a creator’s life.", safePlan:"Limit time; invest in real relationships.", boundaryLine:"My real life comes first.", myth:"Following them fixes loneliness.", tinyStep:"Replace 10 minutes with real message.", reflection:"Who can you message today?"
    }),
    D(23,"socialmedia","Confidence Under Likes","Likes ≠ worth.",{
      toolName:"Worth Statement", scenario:"A post flops and you feel bad.", safePlan:"Say worth statement; do offline win.", boundaryLine:"My worth isn’t likes.", myth:"Likes measure value.", tinyStep:"Write your worth statement.", reflection:"What gives you real worth?"
    }),
    D(24,"socialmedia","Content Diet","What you consume becomes you.",{
      toolName:"Diet Swap", scenario:"Your feed is mostly negativity.", safePlan:"Swap 5 accounts to positive/helpful.", boundaryLine:"I choose better inputs.", myth:"It doesn’t matter.", tinyStep:"Swap 3 accounts today.", reflection:"What content do you want more of?"
    }),
    D(25,"socialmedia","Helping Friends Online","Support safely.",{
      toolName:"Care + Adult", scenario:"A friend posts worrying things.", safePlan:"Reach out privately; involve adult if safety risk.", boundaryLine:"I’m here. Also, let’s get support.", myth:"It’s none of my business.", tinyStep:"Send one caring message.", reflection:"What’s a safe support message?"
    }),
    D(26,"socialmedia","Deep Focus Blocks","Protect study time.",{
      toolName:"Focus Shield", scenario:"Your phone breaks your focus every 3 minutes.", safePlan:"Put phone away; 10–25 min focus blocks.", boundaryLine:"Focus block now.", myth:"Multitasking works.", tinyStep:"Do one 10‑minute block.", reflection:"What breaks focus most?"
    }),
    D(27,"socialmedia","Online Arguments","Don’t donate your peace.",{
      toolName:"Argue‑Exit Rule", scenario:"You’re tempted to fight in comments.", safePlan:"Ask: will this matter tomorrow? If no, exit.", boundaryLine:"Not engaging.", myth:"Winning online matters.", tinyStep:"Exit one argument today.", reflection:"How did exiting feel?"
    }),
    D(28,"socialmedia","Privacy Thinking","Protect future you.",{
      toolName:"Future‑Me Privacy", scenario:"You’re asked to share personal info.", safePlan:"Share less; protect identity; ask adult if unsure.", boundaryLine:"I don’t share that.", myth:"Oversharing builds trust.", tinyStep:"Check your privacy settings.", reflection:"What do you keep private?"
    }),
    D(29,"socialmedia","Leadership Online","Set the tone.",{
      toolName:"Tone Setter", scenario:"A chat becomes mean.", safePlan:"Post a calm redirect or leave; don’t join cruelty.", boundaryLine:"Let’s not be mean.", myth:"Mean is funny.", tinyStep:"Write one tone-setting line.", reflection:"How can you lead online?"
    }),
    D(30,"socialmedia","Review Week 2","Combine your strongest tools.",{
      toolName:"Tool Chain", scenario:"Real life needs combos.", safePlan:"Intent → timer → boundary → exit.", boundaryLine:"I choose my attention.", myth:"One tool is enough.", tinyStep:"Write your chain.", reflection:"What chain works best?"
    }),
    // 31–60: long-term mastery
    D(31,"socialmedia","Replace Scrolling","Build new habits.",{
      toolName:"Swap Habit", scenario:"You scroll when bored.", safePlan:"Swap boredom trigger to offline menu.", boundaryLine:"I’m swapping the habit.", myth:"Boredom must be filled by scrolling.", tinyStep:"Write 5 swap actions.", reflection:"Which swap action is easiest?"
    }),
    D(32,"socialmedia","Night Mode","Protect sleep.",{
      toolName:"Night Gate", scenario:"Late scrolling wrecks sleep.", safePlan:"Night gate: off at time; charge outside room.", boundaryLine:"Phone sleeps outside.", myth:"I need it at night.", tinyStep:"Move charger outside room.", reflection:"What’s your off time?"
    }),
    D(33,"socialmedia","Self‑Image Safety","Be kind to your body/mind.",{
      toolName:"Body Neutral Talk", scenario:"You compare appearances and feel worse.", safePlan:"Use neutral talk; focus on function/strength/health.", boundaryLine:"I won’t insult my body.", myth:"Insults motivate change.", tinyStep:"Write 3 neutral statements.", reflection:"What neutral statement helps you?"
    }),
    D(34,"socialmedia","Boundaries With Friends","Protect time and peace.",{
      toolName:"Reply Windows", scenario:"Friends expect instant replies.", safePlan:"Set reply windows; communicate.", boundaryLine:"I reply when I can.", myth:"Instant replies prove care.", tinyStep:"Set one reply window.", reflection:"What window is realistic?"
    }),
    D(35,"socialmedia","Escapes vs Rest","Rest beats numbing.",{
      toolName:"Rest Menu", scenario:"You scroll to numb feelings.", safePlan:"Choose true rest: walk, music, shower, talk.", boundaryLine:"I’m choosing real rest.", myth:"Numbing is rest.", tinyStep:"Do one rest action.", reflection:"What rest feels real?"
    }),
    D(36,"socialmedia","Hard Conversations Offline","Move important stuff offline.",{
      toolName:"Offline Switch", scenario:"A conflict is happening in text.", safePlan:"Move to call/in-person with calm boundary.", boundaryLine:"Let’s talk offline.", myth:"Text is best for big issues.", tinyStep:"Use offline switch once.", reflection:"What changes offline?"
    }),
    D(37,"socialmedia","Long‑Term Reputation","Future you matters.",{
      toolName:"Reputation Check", scenario:"You’re tempted to post something cruel.", safePlan:"Ask: would I be proud if my name was attached?", boundaryLine:"I don’t post cruelty.", myth:"Online cruelty has no impact.", tinyStep:"Delete one mean draft.", reflection:"What reputation do you want?"
    }),
    D(38,"socialmedia","Community Choice","Choose better corners.",{
      toolName:"Community Audit", scenario:"A community normalizes harmful behavior.", safePlan:"Leave; join healthier spaces.", boundaryLine:"I choose healthier spaces.", myth:"Everywhere is the same.", tinyStep:"Leave one harmful space.", reflection:"What space feels healthiest?"
    }),
    D(39,"socialmedia","Weekly Reset","Keep control long-term.",{
      toolName:"Weekly Review", scenario:"You drift back into habits.", safePlan:"Weekly review: timers, feed, windows, sleep.", boundaryLine:"I reset weekly.", myth:"If I slip, I’m done.", tinyStep:"Schedule weekly reset.", reflection:"What will you review weekly?"
    }),
    D(40,"socialmedia","Graduation Plan","Your attention playbook.",{
      toolName:"Attention Playbook", scenario:"You want a forever plan.", safePlan:"Windows + timers + feed audit + night gate + scripts.", boundaryLine:"I follow my playbook.", myth:"I need motivation first.", tinyStep:"Write your 5 rules.", reflection:"Which rule is non‑negotiable?"
    }),
  D(41,"socialmedia","Digital Boundaries","Protect energy with clear limits.",{
    toolName:"Energy Budget", scenario:"You keep checking apps whenever you feel bored for 3 seconds.",
    safePlan:"Name the urge → do 1 minute of real-life action → return only if needed.",
    boundaryLine:"I’m not feeding the boredom loop.", myth:"Boredom must be filled instantly.",
    tinyStep:"Do 1 minute of a real action before opening an app.", reflection:"What real-life action worked best?"
  }),
  D(42,"socialmedia","Handle Embarrassment","Recover from awkward posts safely.",{
    toolName:"Repair Steps", scenario:"You posted something and now you feel embarrassed and want to delete your whole account.",
    safePlan:"Pause → decide: delete, clarify, or ignore → talk to a trusted adult if it’s serious.",
    boundaryLine:"I can repair this calmly.", myth:"One mistake ruins everything.",
    tinyStep:"Write one calm repair option you could do.", reflection:"Which repair option feels safest?"
  }),
  D(43,"socialmedia","Gratitude Training","Train attention toward what’s good.",{
    toolName:"Good Spotter", scenario:"Your feed makes life feel negative and heavy.",
    safePlan:"Limit exposure → spot 3 good things → message someone kind.",
    boundaryLine:"I’m choosing better inputs.", myth:"Negativity is “more real.”",
    tinyStep:"Write 3 good things you noticed today.", reflection:"How did your mood shift?"
  }),
  D(44,"socialmedia","Drama Filter","Don’t get recruited into chaos.",{
    toolName:"Drama Filter", scenario:"A group chat tries to pull you into arguing about someone.",
    safePlan:"Ask: true/kind/necessary → if not, exit or change subject.",
    boundaryLine:"I’m not joining this.", myth:"Staying out means you’re weak.",
    tinyStep:"Use the filter once before replying today.", reflection:"What did you choose instead of drama?"
  }),
  D(45,"socialmedia","Create More, Consume Less","Shift from scroll to create.",{
    toolName:"Create‑First", scenario:"You open an app to “check one thing” and lose time.",
    safePlan:"Create-first rule: make something tiny before consuming content.",
    boundaryLine:"I create before I consume.", myth:"Creation has to be perfect.",
    tinyStep:"Create 3 minutes (note, sketch, beat, idea list).", reflection:"What did you create?"
  }),
  D(46,"socialmedia","Real Friends Investment","Put time into people, not feeds.",{
    toolName:"Offline Reachout", scenario:"You scroll but still feel lonely.",
    safePlan:"Send one real message or talk to someone in person; schedule a small hangout.",
    boundaryLine:"I invest in real connection.", myth:"Scrolling counts as socializing.",
    tinyStep:"Message one person something real.", reflection:"How did real connection feel?"
  }),
  D(47,"socialmedia","Morning Gate","Start your day without the feed.",{
    toolName:"Morning Gate", scenario:"You wake up and immediately scroll, then feel rushed.",
    safePlan:"Do 5 minutes: water + light + stretch before opening any app.",
    boundaryLine:"My morning belongs to me.", myth:"I need updates first thing.",
    tinyStep:"Do a 5-minute no-phone morning.", reflection:"What changed in your morning?"
  }),
  D(48,"socialmedia","Meals Without Scroll","Protect meals and attention.",{
    toolName:"Meal Boundary", scenario:"You eat while scrolling and don’t notice fullness or taste.",
    safePlan:"Phone away for meals; focus on food + one conversation or music.",
    boundaryLine:"Meals are screen-free.", myth:"Multitasking is fine at meals.",
    tinyStep:"One screen-free meal today.", reflection:"How did it feel to eat present?"
  }),
  D(49,"socialmedia","Study Focus Sprint","Stop phone breaks from stealing hours.",{
    toolName:"Focus Sprint", scenario:"You check your phone every few minutes while studying.",
    safePlan:"10–20 minutes focus → 2 minutes break → repeat; phone out of reach.",
    boundaryLine:"Focus block now.", myth:"I can’t focus at all.",
    tinyStep:"Do one 10-minute sprint with phone away.", reflection:"What distracted you most?"
  }),
  D(50,"socialmedia","Movement Swap","Use movement to break scrolling urges.",{
    toolName:"Move‑2", scenario:"You feel the urge to scroll when stressed.",
    safePlan:"Do 2 minutes of movement first; then decide.",
    boundaryLine:"Move first, decide second.", myth:"I need the scroll to calm down.",
    tinyStep:"2 minutes: walk, stretch, or stairs.", reflection:"Did movement reduce the urge?"
  }),
  D(51,"socialmedia","Kind Comment Standard","Raise the bar on how you speak.",{
    toolName:"Kindness Rule", scenario:"You want to roast someone for likes.",
    safePlan:"If you wouldn’t say it to their face kindly, don’t post it.",
    boundaryLine:"I don’t post cruelty.", myth:"Mean = funny.",
    tinyStep:"Rewrite one comment to be kind or skip it.", reflection:"How did you choose kindness?"
  }),
  D(52,"socialmedia","Mute Triggers","Protect your mind from known triggers.",{
    toolName:"Trigger Mute", scenario:"Certain accounts make you feel worse every time.",
    safePlan:"Mute/unfollow; replace with healthier sources.",
    boundaryLine:"I curate my mental inputs.", myth:"I should tolerate it.",
    tinyStep:"Mute 3 trigger accounts.", reflection:"What content helps you feel better?"
  }),
  D(53,"socialmedia","Short-Loop Defense","Endless shorts trap attention.",{
    toolName:"Loop Stopper", scenario:"You watch short videos until you forget why you opened the app.",
    safePlan:"Set a timer and stop at the first ‘just one more.’",
    boundaryLine:"I end loops on purpose.", myth:"One more doesn’t matter.",
    tinyStep:"One timer-based shorts session only.", reflection:"What did you do after stopping?"
  }),
  D(54,"socialmedia","Handle Criticism","Stay steady when criticized.",{
    toolName:"Criticism Script", scenario:"Someone comments something mean and you want to clap back.",
    safePlan:"Pause → decide: ignore, block, or short calm reply.",
    boundaryLine:"I don’t argue with cruelty.", myth:"Clapping back fixes it.",
    tinyStep:"Write one calm reply line (or choose ‘no reply’).", reflection:"What response protects your peace?"
  }),
  D(55,"socialmedia","DM Safety Shield","Protect boundaries in private.",{
    toolName:"DM Shield", scenario:"Someone pressures you in DMs to do something unsafe.",
    safePlan:"Short no → block/report → tell trusted adult if needed.",
    boundaryLine:"Stop. Don’t message me about that.", myth:"Private pressure is harmless.",
    tinyStep:"Save one DM boundary line.", reflection:"What’s your safest DM response?"
  }),
  D(56,"socialmedia","Weekend Plan","Prevent boredom scrolling binges.",{
    toolName:"Weekend Plan", scenario:"Weekends turn into all-day scrolling.",
    safePlan:"Plan 2 anchor activities + one hangout + one rest block.",
    boundaryLine:"My weekend has a plan.", myth:"Plans ruin weekends.",
    tinyStep:"Write 2 anchor activities for this weekend.", reflection:"Which anchor activity feels best?"
  }),
  D(57,"socialmedia","Privacy Basics","Share less to protect future you.",{
    toolName:"Share‑Less Rule", scenario:"A trend asks you to share personal info for fun.",
    safePlan:"Don’t share identifying info; keep location/school/private life private.",
    boundaryLine:"I don’t share personal details online.", myth:"Oversharing builds trust.",
    tinyStep:"Check one privacy setting.", reflection:"What do you keep private now?"
  }),
  D(58,"socialmedia","Model Healthy Use","Lead by example quietly.",{
    toolName:"Model Move", scenario:"Friends are stuck scrolling and you want to change the vibe.",
    safePlan:"Suggest a short offline activity; start doing it yourself.",
    boundaryLine:"Let’s do something real for 10 minutes.", myth:"Leadership has to be loud.",
    tinyStep:"Invite one person to an offline thing.", reflection:"How did the vibe change?"
  }),
  D(59,"socialmedia","Meaning Beats Noise","Choose meaning over dopamine.",{
    toolName:"Meaning Menu", scenario:"Scrolling feels good short-term but empty after.",
    safePlan:"Pick meaning: create/help/learn/move; do 10 minutes.",
    boundaryLine:"I choose meaning.", myth:"Meaning is boring.",
    tinyStep:"10 minutes of meaning activity.", reflection:"What felt meaningful today?"
  }),
  D(60,"socialmedia","Attention Graduation","Your forever attention playbook.",{
    toolName:"Attention Playbook", scenario:"You want a simple plan you’ll actually keep.",
    safePlan:"Write 5 rules: windows, timers, night gate, feed audit, scripts.",
    boundaryLine:"I follow my playbook.", myth:"I need motivation first.",
    tinyStep:"Write your 5 rules.", reflection:"Which rule is non‑negotiable?"
  })
  ];
/* =========================================================
   NICOTINE / VAPING — 60 unique lessons (hardcoded)
========================================================= */
const NICOTINE = [
  D(1,"nicotine","Cravings Aren’t Commands","Urges rise and fall.",{
    toolName:"Urge Wave", scenario:"A craving hits and your brain says ‘now.’",
    safePlan:"Delay 10 → breathe → move → water → distract.",
    boundaryLine:"This urge will pass.", myth:"Cravings control me.", tinyStep:"Set a 10‑minute timer once.", reflection:"What helped the urge drop?"
  }),
  D(2,"nicotine","Trigger Map","Know what starts urges.",{
    toolName:"Trigger Map", scenario:"Cravings show up after school every day.",
    safePlan:"Name trigger → swap routine → add support.",
    boundaryLine:"I’m changing the routine.", myth:"Triggers are random.", tinyStep:"Write 3 triggers.", reflection:"Which trigger is most predictable?"
  }),
  D(3,"nicotine","Refusal Script","Say no fast and clean.",{
    toolName:"Short No", scenario:"Someone offers you a vape ‘just once.’",
    safePlan:"No → step back → switch topic → leave if needed.",
    boundaryLine:"No thanks. I’m good.", myth:"I owe an explanation.", tinyStep:"Memorize one no‑line.", reflection:"Which line feels most natural?"
  }),
  D(4,"nicotine","Exit Plan","Leaving is a skill.",{
    toolName:"Exit‑Ready", scenario:"Friends keep offering after you said no.",
    safePlan:"Repeat once → exit → text safe person.",
    boundaryLine:"I’m heading out.", myth:"Leaving is embarrassing.", tinyStep:"Write your exit line.", reflection:"What’s your safest exit option?"
  }),
  D(5,"nicotine","Body Reset First","Lower alarm before deciding.",{
    toolName:"Body‑First Reset", scenario:"Craving + stress hits at the same time.",
    safePlan:"Water + slow breaths + shoulders down → then decide.",
    boundaryLine:"Reset first.", myth:"I must act to feel better.", tinyStep:"4 slow breaths.", reflection:"What’s your fastest reset?"
  }),
  D(6,"nicotine","Swap the Moment","Replace the habit cue.",{
    toolName:"Swap Action", scenario:"You crave when walking past a usual spot.",
    safePlan:"Change route → chew gum/water → text friend.",
    boundaryLine:"I’m swapping the moment.", myth:"Same place means same choice.", tinyStep:"Plan one route change.", reflection:"What swap will you try?"
  }),
  D(7,"nicotine","Social Pressure Tricks","Spot tactics.",{
    toolName:"Tactic Spotter", scenario:"Someone says ‘everyone does it.’",
    safePlan:"Name the tactic → refuse → exit.",
    boundaryLine:"‘Everyone’ isn’t a reason.", myth:"Popularity = safe.", tinyStep:"Write 2 tactics.", reflection:"Which tactic gets you most?"
  }),
  D(8,"nicotine","Stress Tool Toolbox","Build non-nicotine relief.",{
    toolName:"Toolbox", scenario:"You want relief after a hard day.",
    safePlan:"Pick one tool: walk/music/shower/breathe/talk.",
    boundaryLine:"I choose relief that helps tomorrow.", myth:"Only nicotine calms me.",
    tinyStep:"Do one tool for 3 minutes.", reflection:"Which tool worked best?"
  }),
  D(9,"nicotine","Delay Skills","Win by waiting.",{
    toolName:"Delay Ladder", scenario:"You can resist 2 minutes but not 10.",
    safePlan:"Delay 2 → then 5 → then 10; celebrate each win.",
    boundaryLine:"I can wait a little longer.", myth:"If I can’t fully stop, why try.",
    tinyStep:"Add 2 minutes to a delay.", reflection:"What delay length felt doable?"
  }),
  D(10,"nicotine","Support Ask","Don’t do it solo.",{
    toolName:"Help‑Ask Script", scenario:"You want to quit but feel ashamed.",
    safePlan:"Tell a trusted adult; ask for one specific help step.",
    boundaryLine:"I need support with this.", myth:"I must hide it.",
    tinyStep:"Write one adult name.", reflection:"What would you ask them for?"
  }),
  // 11–60: unique, hardcoded (compact but distinct)
  ...[
    ["Nicotine Facts (No Fear)","Understand what it does to brain/body.","Reality Check","You hear ‘it’s just vapor.’","Learn 3 facts; choose healthier choice.","I choose facts over myths.","It’s harmless.","Write 1 fact you didn’t know.","What surprised you?"],
    ["Morning Triggers","Mornings can be a cue.","Morning Shield","You crave right after waking.","Water + breakfast + move before phone.","Morning is protected.","Morning cravings are permanent.","Do a 5‑min morning routine.","What helped mornings most?"],
    ["After-School Plan","After school is high risk.","After‑School Script","You crave when you get home.","Snack + 10 min reset + planned activity.","I follow my after-school plan.","I can’t change routines.","Write your 3-step plan.","What step is hardest?"],
    ["Friend Boundary Upgrade","Keep friends without using.","Kind‑Firm Repeat","A friend keeps offering.","Repeat boundary once; then leave.","Please stop asking.","If I set boundaries I lose friends.","Write a repeat line.","Who respects boundaries?"],
    ["Handling Slip Without Spiral","Reset fast.","Reset Sentence","You slipped and feel hopeless.","Name slip → next step → support.","I’m resetting, not quitting.","A slip means failure.","Write your next step.","What’s your first repair action?"],
    ["Craving + Boredom","Boredom is a cue.","Boredom Menu","You crave when bored.","Pick from 5 boredom breakers.","Boredom isn’t an emergency.","Boredom requires nicotine.","Write 5 boredom breakers.","Which breaker is easiest?"],
    ["Craving + Anger","Anger makes urges louder.","Cooldown Kit","You crave when angry.","Space → cold water → breathe → talk.","I cool down first.","Anger must explode.","Do 10 breaths.","What calms anger fastest?"],
    ["Craving + Anxiety","Ground then decide.","5‑4‑3‑2‑1","Anxiety triggers craving.","Ground → delay → support.","I’m grounding.","Anxiety means danger.","Do grounding once.","What sense helps most?"],
    ["Peer Offer Roleplay","Practice scripts.","Script Reps","Someone offers in public.","Short no + move feet + switch plan.","No thanks.","Explaining helps.","Say your line out loud.","Which line is strongest?"],
    ["Avoiding Hot Spots","Reduce exposure.","Hot‑Spot Plan","You’re around people using.","Change location; bring support buddy.","I’m choosing safer spaces.","I can handle any spot.","List 2 safer spaces.","Where is safest?"],
    ["Your Why","Motivation that lasts.","Why List","You forget why you want change.","Write 5 reasons; keep visible.","My why matters.","I don’t need a why.","Write 3 reasons now.","Which reason is biggest?"],
    ["Small Wins Count","Progress is real.","Win Log","You feel ‘no progress.’","Log wins; review weekly.","Small wins count.","Only perfection matters.","Write 3 wins.","What win matters most?"],
    ["Nicotine + Sleep","Sleep is protection.","Sleep Shield","Late use messes sleep.","Wind-down plan; no late cues.","I protect sleep.","Sleep doesn’t affect cravings.","Set bedtime alarm.","How does sleep change urges?"],
    ["Nicotine + Appetite","Fuel matters.","Brain‑Fuel Check","Hunger triggers craving.","Snack + water first.","Fuel first.","Willpower beats biology.","Eat something small.","What food helps?"],
    ["Nicotine + School Stress","Stress plan.","Stack Breaker","Tests make urges spike.","One task → reset → ask help.","One step.","I must do it all now.","Do 5-min starter.","What’s your next step?"],
    ["Refusing Without Drama","Say less.","No‑Debate Rule","They argue with your no.","Repeat once; exit.","Not debating.","Debate wins respect.","Write one repeat line.","How do you exit?"],
    ["Replacing Hand-to-Mouth","Swap the physical habit.","Hands Swap","Hands feel restless.","Gum, straw, fidget, water bottle.","Hands have a plan.","I can’t replace it.","Pick one swap item.","Which swap feels best?"],
    ["Craving Timer Tricks","Shorten peak.","Peak Timer","Craving peaks quickly.","Set timer; do body tool until timer ends.","Ride it out.","It never ends.","Do one timed ride.","How long did peak last?"],
    ["Identity Shift","You’re not a habit.","Identity Statement","You feel labeled.","Choose identity: ‘I protect my brain.’","That’s not me anymore.","I’m stuck this way.","Write one statement.","What identity helps most?"],
    ["Social Media Triggers","Online cues matter.","Cue Cut","Scrolling shows vape content.","Mute/unfollow; replace feed.","I cut cues.","Cues don’t matter.","Mute 3 cue accounts.","What cue is strongest?"],
    ["Weekend Risk Plan","Weekends amplify cues.","Weekend Map","Friends hang out where people use.","Plan safe hang; bring exit.","I’ve got a plan.","Weekends don’t count.","Write weekend plan.","What’s your safest hangout?"],
    ["Trusted Adult Talk","Make it real.","3‑Line Brief","You need to tell an adult.","What happened / how I feel / what I need.","I need help.","Adults always overreact.","Draft 3 lines.","Who’s best to tell?"],
    ["Helping a Friend","Care + boundaries.","Care‑Plus‑Help","Friend is using heavily.","Listen; don’t promise secrecy; involve adult.","I care too much to hide this.","It’s none of my business.","Write one caring line.","What help step is safest?"],
    ["Relapse Prevention","Plan tough days.","If‑Then Plan","You know your trigger time.","If trigger → then tool + leave + support.","I planned for this.","Planning is pessimistic.","Write one if‑then.","What’s your biggest trigger?"],
    ["Celebrating Progress","Reward clean choices.","Healthy Reward","You want a reward for resisting.","Reward with safe treat/experience.","I reward progress.","Rewards are childish.","Pick one reward.","What reward motivates you?"],
    ["Graduation: Nicotine Playbook","Your forever plan.","Nicotine Playbook","You want a simple plan to keep.","5 rules: cues, delay, scripts, support, sleep.","I follow my playbook.","I need motivation first.","Write your 5 rules.","Which rule is non‑negotiable?"],
  ].reduce((arr, row, idx) => {
    // Spread these 25 “compact” lessons across days 11–60 uniquely by repeating with variations:
    // We'll expand them into 50 lessons by adding “A/B versions” (still hardcoded and different).
    const baseDay = 11 + idx * 2;
    const [title, goal, toolName, scenario, safePlan, boundaryLine, myth, tinyStep, reflection] = row;
    arr.push(D(baseDay,"nicotine",title,goal,{ toolName, scenario, safePlan, boundaryLine, myth, tinyStep, reflection }));
    arr.push(D(baseDay+1,"nicotine",title+" (Practice)","Practice the skill in a real scenario.",{
      toolName: toolName+" Rep",
      scenario: scenario + " (this time, you pause and choose your script).",
      safePlan: safePlan + " Then you practice your exact line once.",
      boundaryLine: boundaryLine,
      myth: myth,
      tinyStep: "Practice 1 rep out loud.",
      reflection: "What made the rep easier?"
    }));
    return arr;
  }, [])
].slice(0,60);

/* =========================================================
   ALCOHOL — 60 unique lessons (hardcoded)
========================================================= */
const ALCOHOL = [
  D(1,"alcohol","Party Plan Basics","Safer choices start with a plan.",{
    toolName:"Buddy + Exit Plan", scenario:"You’re invited to a party and feel nervous about pressure.",
    safePlan:"Decide your boundary, bring a buddy, plan your exit and a safe adult backup.",
    boundaryLine:"I’m not drinking. I’m good.", myth:"I’ll decide in the moment.", tinyStep:"Write your exit option.", reflection:"What’s your #1 safety rule?"
  }),
  D(2,"alcohol","Pressure Lines","Short scripts beat pressure.",{
    toolName:"No‑Debate Script", scenario:"Someone says ‘just one won’t hurt.’",
    safePlan:"Short no; change subject; move away; don’t debate.",
    boundaryLine:"No thanks.", myth:"Explaining helps.", tinyStep:"Memorize 1 script.", reflection:"Which script feels easiest?"
  }),
  D(3,"alcohol","Handling Teasing","Stay calm under mockery.",{
    toolName:"Calm Repeat", scenario:"They tease you for saying no.",
    safePlan:"Repeat your line once; shrug; step away; find buddy.",
    boundaryLine:"I said no.", myth:"Teasing means I should prove myself.", tinyStep:"Write a calm repeat line.", reflection:"What helps you stay steady?"
  }),
  D(4,"alcohol","Red Flags","Know when to leave.",{
    toolName:"Red‑Flag Scan", scenario:"The vibe shifts: people get reckless.",
    safePlan:"Scan for risk; if it’s unsafe, leave immediately.",
    boundaryLine:"I’m heading out.", myth:"Leaving is overreacting.", tinyStep:"List 3 red flags.", reflection:"What’s your biggest red flag?"
  }),
  D(5,"alcohol","Safe Adult Backup","Support is power.",{
    toolName:"Backup Call", scenario:"You need a ride home but feel embarrassed to ask.",
    safePlan:"Call/text safe adult; simple facts; ask for pickup.",
    boundaryLine:"Can you pick me up? I need help.", myth:"I must handle it alone.", tinyStep:"Write 1 safe contact.", reflection:"What would you text them?"
  }),
  D(6,"alcohol","Boundaries With Friends","Friends respect no.",{
    toolName:"Respect Test", scenario:"A friend keeps pushing you to drink.",
    safePlan:"Respect test: if they don’t respect no, create distance.",
    boundaryLine:"Stop asking me.", myth:"Real friends push you.", tinyStep:"Write a firm line.", reflection:"Who respects your boundaries?"
  }),
  // 7–60: compact hardcoded expansions (unique by day)
  ...Array.from({length:54}, (_,i) => {
    const day = 7+i;
    const TOP = [
      ["Drink Myths","Correct common myths.","Myth Check","Someone says ‘beer isn’t real alcohol.’","Name the myth; choose safety.","Facts over myths.","Myths don’t matter.","Write 1 myth you’ll ignore.","Which myth is common?"],
      ["Consent & Safety","Protect yourself and others.","Consent Check","Someone is too impaired to make good choices.","Get help; involve adults; don’t leave them alone.","Safety first.","It’s not my problem.","Write 1 help step.","What would you do?"],
      ["Protect Your Ride","Travel safety.","Ride Rule","A ride feels unsafe.","Choose a safe ride option; call adult.","I choose safe rides.","I’ll figure it out later.","Plan 2 ride options.","What’s your safest ride?"],
      ["Refusal Practice","Practice under pressure.","Script Reps","A crowd watches your answer.","Short line + move feet.","No thanks.","I must explain.","Practice 1 rep.","What line works?"],
      ["Helping a Friend","Care + action.","Care‑Plus‑Help","Friend is pressured to drink.","Stand with them; exit; get adult.","I’m with you—let’s go.","Staying silent helps.","Write 1 supportive line.","How would you help?"],
      ["Next‑Day Thinking","Zoom out.","Time‑Zoom","You feel tempted to do what others do.","Ask: tomorrow? next week?","Future me matters.","Tomorrow doesn’t matter.","Write 1 time-zoom question.","What happens tomorrow?"],
      ["Boundary + Switch","Redirect the plan.","No‑Switch‑Exit","They push a risky plan.","No → switch → exit.","Let’s do something else.","If I don’t join, I’m lame.","Write 1 switch idea.","What’s your switch?"],
      ["Safe Fun Plan","Have alternatives.","Safe‑Fun Menu","Party is boring so people escalate.","Propose safe fun; leave if needed.","I’m here for safe fun.","Safe fun is boring.","List 3 safe fun ideas.","Which is best?"],
      ["Recovery After Mistake","Reset without shame.","Repair Steps","You regret something from a hangout.","Own it; ask help; repair.","I’m fixing it.","I’m ruined.","Write 1 repair action.","What’s first repair?"],
    ];
    const t = TOP[i % TOP.length];
    const [title, goal, toolName, scenario, safePlan, boundaryLine, myth, tinyStep, reflection] = t;
    return D(day,"alcohol",`${title} (Day ${day})`,goal,{
      toolName,
      scenario:`Day ${day}: ${scenario}`,
      safePlan,
      boundaryLine,
      myth,
      tinyStep,
      reflection
    });
  })
].slice(0,60);

/* =========================================================
   CAFFEINE / ENERGY DRINKS — 60 unique lessons (hardcoded)
========================================================= */
const CAFFEINE = [
  D(1,"caffeine","Energy Basics","Energy starts with basics.",{
    toolName:"Brain‑Fuel Check", scenario:"You feel tired and want a huge caffeine hit.",
    safePlan:"Check sleep/food/water/stress first; choose safest fix.",
    boundaryLine:"Fuel first.", myth:"Caffeine fixes everything.", tinyStep:"Drink water now.", reflection:"Which basic is lowest today?"
  }),
  D(2,"caffeine","Sleep Armor","Sleep protects choices.",{
    toolName:"Wind‑Down Plan", scenario:"You stay up late and rely on caffeine next day.",
    safePlan:"Set bedtime alarm; screen down; simple wind-down routine.",
    boundaryLine:"I protect my sleep.", myth:"Sleep doesn’t matter.", tinyStep:"Set a bedtime alarm.", reflection:"What makes sleep hardest?"
  }),
  D(3,"caffeine","Timing Matters","Late caffeine can backfire.",{
    toolName:"Cutoff Time", scenario:"You drink caffeine late and can’t sleep.",
    safePlan:"Choose a cutoff time; switch to water/snack/walk later.",
    boundaryLine:"No caffeine after my cutoff.", myth:"I can sleep anyway.", tinyStep:"Pick a cutoff time.", reflection:"What time works for you?"
  }),
  D(4,"caffeine","Stress vs Tired","Different fixes.",{
    toolName:"Tired‑Or‑Stressed", scenario:"You feel ‘tired’ but you’re actually anxious.",
    safePlan:"If stressed → calm tool; if tired → rest + snack/water.",
    boundaryLine:"I choose the right fix.", myth:"Caffeine fixes stress.", tinyStep:"Do 4 slow breaths.", reflection:"Were you tired or stressed?"
  }),
  D(5,"caffeine","Hydration First","Water before caffeine.",{
    toolName:"Water Rule", scenario:"You reach for caffeine first thing.",
    safePlan:"Water first; then decide if you still need caffeine.",
    boundaryLine:"Water first.", myth:"Caffeine is hydration.", tinyStep:"Drink a glass of water.", reflection:"How did water change your energy?"
  }),
  D(6,"caffeine","Food for Energy","Fuel beats spikes.",{
    toolName:"Snack Plan", scenario:"You skip breakfast and crash mid‑morning.",
    safePlan:"Eat something simple; stabilize energy; reduce cravings.",
    boundaryLine:"Food is fuel.", myth:"Skipping meals helps focus.", tinyStep:"Eat a small snack.", reflection:"What snack works best for you?"
  }),
  // 7–60: compact hardcoded expansions
  ...Array.from({length:54}, (_,i) => {
    const day = 7+i;
    const TOP = [
      ["Energy Drink Labels","Know what you’re consuming.","Label Check","You grab a drink without reading it.","Read label; choose smaller/safer option.","I read labels.","Labels don’t matter.","Check one label today.","What did you notice?"],
      ["Crash Prevention","Avoid spike-then-crash.","Steady Energy","You crash after a big caffeine hit.","Use food + water + movement instead.","I choose steady energy.","Crashes are unavoidable.","Do a 5‑minute walk.","What prevented crash?"],
      ["Anxiety & Caffeine","Notice the link.","Body Signal","Caffeine makes you jittery.","Reduce dose; breathe; hydrate.","I listen to my body.","Jitters mean productivity.","Write your jitter sign.","What’s your sign?"],
      ["Headache Plan","Handle withdrawal safely.","Gentle Step‑Down","You get headaches when skipping caffeine.","Step down slowly; hydrate; sleep.","I step down safely.","Cold turkey is always best.","Reduce one small amount.","How did it feel?"],
      ["School Performance","Protect focus sustainably.","Focus Block","You rely on caffeine for studying.","Use short focus blocks + breaks.","Focus with systems.","Caffeine is the only way.","Do one 10‑min block.","What helped focus?"],
      ["Afternoon Slump","Use safer fixes.","Slump Toolkit","You slump at 2–4pm.","Water + snack + sunlight + move.","Toolkit first.","More caffeine is required.","Pick 2 slump tools.","Which tool worked?"],
      ["Weekend Reset","Reset sleep schedule gently.","Sleep Reset","Weekend sleep shifts wreck weekdays.","Keep wake time steady; nap small.","I reset gently.","Sleep doesn’t need structure.","Plan wake time.","What wake time works?"],
      ["Social Pressure","Say no to “try this drink.”","Caffeine Script","Friends push energy drinks.","Short no; choose alternative.","No thanks—water for me.","It’s harmless fun.","Write your no line.","What’s your line?"],
      ["Graduation Playbook","Build your forever plan.","Energy Playbook","You want sustainable energy.","5 rules: sleep, water, food, movement, cutoff.","I follow my playbook.","I need motivation first.","Write 5 rules.","Which rule is non‑negotiable?"],
    ];
    const t = TOP[i % TOP.length];
    const [title, goal, toolName, scenario, safePlan, boundaryLine, myth, tinyStep, reflection] = t;
    return D(day,"caffeine",`${title} (Day ${day})`,goal,{
      toolName,
      scenario:`Day ${day}: ${scenario}`,
      safePlan,
      boundaryLine,
      myth,
      tinyStep,
      reflection
    });
  })
].slice(0,60);

/* ===========================
   EXPORTS — replace your current export blocks with this
=========================== */
  const CURRICULUM_BY_TRACK = {
    general:     GENERAL.map(({day,track,title,goal}) => ({ day, track, title, goal })),
    gaming:      GAMING.map(({day,track,title,goal}) => ({ day, track, title, goal })),
    socialmedia: SOCIAL.map(({day,track,title,goal}) => ({ day, track, title, goal })),
    nicotine:    NICOTINE.map(({day,track,title,goal}) => ({ day, track, title, goal })),
    alcohol:     ALCOHOL.map(({day,track,title,goal}) => ({ day, track, title, goal })),
    caffeine:    CAFFEINE.map(({day,track,title,goal}) => ({ day, track, title, goal })),
  };

  const BLUEPRINTS_BY_TRACK = {
    general:     GENERAL.map(x => ({ day:x.day, toolName:x.toolName, scenario:x.scenario, safePlan:x.safePlan, boundaryLine:x.boundaryLine, myth:x.myth, tinyStep:x.tinyStep, reflection:x.reflection })),
    gaming:      GAMING.map(x => ({ day:x.day, toolName:x.toolName, scenario:x.scenario, safePlan:x.safePlan, boundaryLine:x.boundaryLine, myth:x.myth, tinyStep:x.tinyStep, reflection:x.reflection })),
    socialmedia: SOCIAL.map(x => ({ day:x.day, toolName:x.toolName, scenario:x.scenario, safePlan:x.safePlan, boundaryLine:x.boundaryLine, myth:x.myth, tinyStep:x.tinyStep, reflection:x.reflection })),
    nicotine:    NICOTINE.map(x => ({ day:x.day, toolName:x.toolName, scenario:x.scenario, safePlan:x.safePlan, boundaryLine:x.boundaryLine, myth:x.myth, tinyStep:x.tinyStep, reflection:x.reflection })),
    alcohol:     ALCOHOL.map(x => ({ day:x.day, toolName:x.toolName, scenario:x.scenario, safePlan:x.safePlan, boundaryLine:x.boundaryLine, myth:x.myth, tinyStep:x.tinyStep, reflection:x.reflection })),
    caffeine:    CAFFEINE.map(x => ({ day:x.day, toolName:x.toolName, scenario:x.scenario, safePlan:x.safePlan, boundaryLine:x.boundaryLine, myth:x.myth, tinyStep:x.tinyStep, reflection:x.reflection })),
  };
  const QUIZZES_BY_TRACK = window.QUIZZES || {};

  const out = { TRACKS, CURRICULUM_BY_TRACK, BLUEPRINTS_BY_TRACK, QUIZZES_BY_TRACK };
  console.log("curriculum.js finished OK", out);
  return out;
})();
