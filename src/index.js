// computerfuture.xyz — The Infinite Game
//
// Routes:
//   GET  /              landing
//   GET  /pay           payment screen (stub)
//   GET  /play?l=1-9    game levels
//   GET  /leaderboard   leaderboard
//   POST /api/start     stub: create session (future: D1 + Stripe)
//   POST /api/hint      stub: return hint for level
//   POST /api/answer    stub: evaluate answer, advance level
//   *                   404
//
// v1 note: all state is URL-param-based. No session persistence.
// v2: wire D1 for sessions/scores, Stripe for payment, AI for evaluation.
// Bible content: BIBLE_CONTENT env secret (10 sections, pipe-separated).

const HINT_EXCERPTS = [
  // §I — The Frame
  `Everyone says "AI will change everything." They're right about the change, wrong about the frame. AI is a corporate label. The computer future is what actually happens to the world — the wave none of those labs fully control. Language shapes cognition. If you say "AI" you're thinking about tools. If you say "the computer future" you're thinking about what comes next for humans.`,
  // §II — High Agency
  `High agency is the ability to see paths where others see walls. It compounds: the more paths you see, the more paths appear. The less you ask permission, the less permission you need. The test of high agency is not what you say about yourself. It is what you do when there is friction. High agency people make their own paths. Everyone else waits.`,
  // §III — Signal
  `The solution is not better noise management. It is aggressive signal curation on both ends: what you send and what you receive. The willingness to pay converts an opinion into a commitment. The $15 you paid to enter this game is not revenue. It is a filter. If you understand this, you'll also understand why we don't respond to cold outreach from people who haven't completed the game.`,
  // §IV — Cure Is Disease
  `The most common trap in problem-solving: the solution replicates the structure of the problem. Install a productivity app → new things to manage, new anxiety. The cure is the disease. The question is rarely "what should I add?" The real question is almost always "what am I avoiding?" The purpose of this game is, in part, to help you see that in yourself.`,
  // §V — Money
  `Money is not wealth. Money is a coordination mechanism — the most powerful one humans have invented for organizing collective action around shared goals. A dollar committed in advance is worth more than a dollar promised. Skin in the game is not a metaphor — it is the mechanism by which interests align.`,
  // §VI — The Infinite Game
  `There are two kinds of games. Finite games are played to win. Infinite games are played to continue. The computer future is an infinite game. What we are testing for is not knowledge. It is orientation. Are you here to win something? Or are you here because you understand what's being built and you want to be part of building it?`,
  // §VII — Ambition
  `True ambition: desire + tractable change + moral grounding. Refined ambition pursues readily explicable reality. If you cannot explain what you're trying to do in plain language, and have that resonate with a thoughtful stranger, there is a good chance you are in delusion territory rather than ambition territory. Delusion and ambition feel identical from the inside.`,
  // §VIII — Public Commitment
  `Private conviction is necessary but insufficient. The computer future rewards people who show up publicly as themselves — who commit to ideas before they're proven. Public commitment is the difference between an idea you have and an idea you own.`,
  // §IX — The Agentic Partnership
  `The most interesting new entity in the computer future is the human-agent partnership. The question is not "will agents replace humans?" The question is "are you the kind of human who can work with an agent effectively?" That is a learnable skill requiring the same foundations as any other high agency: clear thinking, good communication, epistemic humility.`,
  // §X — The Test
  `This is not a test of what you know. It is a test of who you are. The maze has no correct answers — it has alignment. Some of the highest scores are for people who disagree clearly, with good reasons, and defend their position without needing validation. That is high agency. That is what we are looking for.`,
];

const LEVELS = 9;

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  :root {
    --black:  #080808;
    --white:  #f0f0f0;
    --gray:   #666;
    --dim:    #222;
    --line:   #1a1a1a;
    --accent: #e8e8e8;
    --warn:   #c8a44a;
    --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
    --font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
  }

  html, body {
    min-height: 100%;
    background: var(--black);
    color: var(--white);
    font-family: var(--font-sans);
    font-size: 16px;
    line-height: 1.6;
  }

  a { color: var(--white); text-decoration: underline; text-underline-offset: 3px; }
  a:hover { color: var(--accent); }

  /* ── Layout ── */

  .page {
    max-width: 680px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  /* ── Top bar (game screens) ── */

  .topbar {
    position: sticky;
    top: 0;
    background: var(--black);
    border-bottom: 1px solid var(--line);
    padding: 0.75rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--gray);
    z-index: 100;
    gap: 1rem;
  }

  .topbar-brand { font-weight: 500; color: var(--white); letter-spacing: 0.02em; }
  .topbar-right { display: flex; gap: 1.5rem; align-items: center; }

  .budget-num { color: var(--warn); }

  .progress-bar-wrap {
    flex: 1;
    max-width: 120px;
    height: 2px;
    background: var(--dim);
    border-radius: 1px;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--white);
    transition: width 0.4s ease;
  }

  /* ── Landing ── */

  .landing {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 6rem 1.5rem 4rem;
    max-width: 680px;
    margin: 0 auto;
  }

  .landing-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gray);
    margin-bottom: 2.5rem;
  }

  .landing h1 {
    font-size: clamp(3rem, 8vw, 5.5rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 0.95;
    margin-bottom: 2rem;
  }

  .landing-sub {
    font-size: clamp(1rem, 2.2vw, 1.25rem);
    color: var(--gray);
    max-width: 520px;
    margin-bottom: 3rem;
    line-height: 1.7;
  }

  .preamble {
    border-left: 2px solid var(--dim);
    padding: 1.2rem 1.5rem;
    margin-bottom: 3rem;
    font-size: 0.9rem;
    color: var(--gray);
    line-height: 1.7;
    max-width: 520px;
  }

  .preamble strong { color: var(--white); }

  .price-block {
    margin-bottom: 3rem;
  }

  .price-main {
    font-size: clamp(1.5rem, 3vw, 2rem);
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .price-note {
    font-size: 0.85rem;
    color: var(--gray);
    line-height: 1.6;
  }

  .btn {
    display: inline-block;
    padding: 0.9rem 2.2rem;
    background: var(--white);
    color: var(--black);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    border-radius: 3px;
    transition: background 0.15s, color 0.15s;
    border: none;
    cursor: pointer;
  }

  .btn:hover { background: var(--accent); color: var(--black); }

  .btn-outline {
    background: transparent;
    color: var(--white);
    border: 1px solid var(--dim);
  }

  .btn-outline:hover { border-color: var(--gray); background: transparent; }

  .landing-footer {
    margin-top: 5rem;
    padding-top: 2rem;
    border-top: 1px solid var(--line);
    font-size: 0.8rem;
    color: var(--dim);
    display: flex;
    gap: 1.5rem;
  }

  .landing-footer a { color: var(--dim); }
  .landing-footer a:hover { color: var(--gray); }

  /* ── Pay screen ── */

  .pay-wrap {
    max-width: 520px;
    margin: 0 auto;
    padding: 5rem 1.5rem;
  }

  .pay-wrap h2 {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.75rem;
  }

  .pay-wrap .sub { color: var(--gray); margin-bottom: 3rem; font-size: 0.95rem; }

  .pay-breakdown {
    background: var(--dim);
    border-radius: 4px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    font-size: 0.9rem;
    line-height: 2;
  }

  .pay-row { display: flex; justify-content: space-between; }
  .pay-row.total { border-top: 1px solid var(--gray); padding-top: 0.5rem; margin-top: 0.5rem; font-weight: 600; }

  .form-group { margin-bottom: 1.5rem; }

  label {
    display: block;
    font-size: 0.8rem;
    font-family: var(--font-mono);
    color: var(--gray);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
  }

  input[type="text"], input[type="url"], textarea {
    width: 100%;
    background: var(--dim);
    border: 1px solid #2a2a2a;
    border-radius: 3px;
    color: var(--white);
    font-family: var(--font-sans);
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
    outline: none;
    transition: border-color 0.2s;
    resize: vertical;
  }

  input[type="text"]:focus,
  input[type="url"]:focus,
  textarea:focus { border-color: var(--gray); }

  .pay-stub-notice {
    background: #1a1500;
    border: 1px solid #3a2e00;
    border-radius: 3px;
    padding: 1rem 1.2rem;
    font-size: 0.85rem;
    color: var(--warn);
    margin-bottom: 2rem;
    line-height: 1.6;
  }

  /* ── Game screen ── */

  .game-wrap {
    max-width: 680px;
    margin: 0 auto;
    padding: 3rem 1.5rem 5rem;
  }

  .level-tag {
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--gray);
    margin-bottom: 1.5rem;
  }

  .level-title {
    font-size: clamp(1.6rem, 3.5vw, 2.4rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .prompt {
    font-size: 1.05rem;
    line-height: 1.7;
    margin-bottom: 2rem;
    color: var(--gray);
  }

  .prompt strong { color: var(--white); }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
    margin-bottom: 2rem;
  }

  .choice-label {
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 0.9rem 1rem;
    background: var(--dim);
    border: 1px solid transparent;
    border-radius: 3px;
    cursor: pointer;
    transition: border-color 0.15s;
    font-size: 0.95rem;
    line-height: 1.5;
  }

  .choice-label:hover { border-color: var(--gray); }
  .choice-label input[type="radio"] { margin-top: 0.2rem; flex-shrink: 0; accent-color: #8b5cf6; width: 1.1em; height: 1.1em; }

  .hint-section {
    margin-bottom: 2rem;
  }

  details {
    border: 1px solid var(--line);
    border-radius: 3px;
    overflow: hidden;
  }

  summary {
    padding: 0.75rem 1rem;
    cursor: pointer;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    letter-spacing: 0.08em;
    color: var(--gray);
    list-style: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  summary::-webkit-details-marker { display: none; }
  summary::before { content: '+ '; transition: content 0.1s; }
  details[open] summary::before { content: '− '; }
  summary:hover { color: var(--white); }

  .hint-body {
    padding: 1rem 1rem 1.2rem;
    font-size: 0.9rem;
    color: var(--gray);
    line-height: 1.7;
    border-top: 1px solid var(--line);
    font-style: italic;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }

  .back-link-small {
    font-size: 0.85rem;
    color: var(--gray);
    text-decoration: none;
  }

  .back-link-small:hover { color: var(--white); }

  /* ── Leaderboard ── */

  .lb-wrap {
    max-width: 680px;
    margin: 0 auto;
    padding: 4rem 1.5rem 6rem;
  }

  .lb-wrap h1 {
    font-size: clamp(2rem, 5vw, 3rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 0.5rem;
  }

  .lb-sub { color: var(--gray); font-size: 0.9rem; margin-bottom: 3rem; }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
  }

  th {
    text-align: left;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--gray);
    padding: 0 0 0.75rem;
    border-bottom: 1px solid var(--line);
  }

  td {
    padding: 1rem 0;
    border-bottom: 1px solid var(--line);
    vertical-align: top;
  }

  td:last-child { text-align: right; }

  .lb-name { font-weight: 500; }
  .lb-date { color: var(--gray); font-family: var(--font-mono); font-size: 0.8rem; }
  .lb-note { color: var(--dim); font-size: 0.8rem; }

  /* ── Completion ── */

  .complete-wrap {
    max-width: 520px;
    margin: 0 auto;
    padding: 6rem 1.5rem;
    text-align: center;
  }

  .complete-mark {
    font-size: 3rem;
    margin-bottom: 2rem;
  }

  .complete-wrap h1 {
    font-size: clamp(1.8rem, 4vw, 2.5rem);
    font-weight: 700;
    letter-spacing: -0.02em;
    margin-bottom: 1rem;
  }

  .complete-wrap p {
    color: var(--gray);
    line-height: 1.7;
    margin-bottom: 1.5rem;
    font-size: 0.95rem;
  }

  /* ── 404 ── */

  .nf { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; gap: 1rem; }
  .nf h1 { font-size: 5rem; font-weight: 700; color: var(--dim); }

  @media (max-width: 600px) {
    .topbar { font-size: 0.65rem; padding: 0.6rem 1rem; }
    .progress-bar-wrap { max-width: 60px; }
  }
`;

// ── Helpers ────────────────────────────────────────────────────────────────

function topBar(level, budget) {
  const pct = Math.round((level / LEVELS) * 100);
  return `
<div class="topbar">
  <span class="topbar-brand">THE INFINITE GAME</span>
  <div class="topbar-right">
    <span>L${level}/${LEVELS}</span>
    <div class="progress-bar-wrap" title="${pct}% complete">
      <div class="progress-bar-fill" style="width:${pct}%"></div>
    </div>
    <span>budget: <span class="budget-num">$${budget.toFixed(2)}</span></span>
  </div>
</div>`;
}

function shell(title, body, includeTopBar = false, level = 0, budget = 10) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title} — the infinite game</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>
${includeTopBar ? topBar(level, budget) : ''}
${body}
</body>
</html>`;
}

// Budget simulation: starts at $10, deducts per level
const LEVEL_COSTS = [0, 0.50, 0.75, 0.50, 0.75, 0.50, 0.75, 0.50, 1.00, 1.25];

function budgetAfterLevel(l) {
  let b = 10.00;
  for (let i = 1; i <= l; i++) b -= LEVEL_COSTS[i];
  return Math.max(b, 0);
}

// ── Pages ──────────────────────────────────────────────────────────────────

function landingPage() {
  return shell('THE INFINITE GAME', `
<div class="landing">
  <p class="landing-tag">computerfuture.xyz</p>
  <h1>THE<br>INFINITE<br>GAME</h1>
  <p class="landing-sub">a high-agency benchmark<br>for the computer future</p>

  <div class="preamble">
    <strong>you are welcome to use an AI agent to assist you.</strong><br>
    best results — and cheapest cost to your wallet — come from doing this as a pure human first, to try it.<br><br>
    if you use an agent, it will cost you more later. the primary purpose here is not to make money. it is to help you learn true high agency at scale.<br><br>
    have fun escaping the box.
  </div>

  <div class="price-block">
    <div class="price-main">$15 to enter</div>
    <div class="price-note">
      $5 non-refundable &nbsp;·&nbsp; $10 token budget for the journey<br>
      max exposure: $1,000 (unlikely) &nbsp;·&nbsp; refund button visible throughout<br>
      your actions determine the total cost.
    </div>
  </div>

  <a href="/pay" class="btn">enter the game →</a>

  <div class="landing-footer">
    <a href="/leaderboard">leaderboard</a>
    <a href="https://computerfuture.me" target="_blank">computerfuture.me</a>
  </div>
</div>`);
}

function payPage() {
  return shell('enter', `
<div class="pay-wrap">
  <h2>you're entering<br>the infinite game</h2>
  <p class="sub">one-time entry. no subscription. no refund on the $5.</p>

  <div class="pay-breakdown">
    <div class="pay-row"><span>entry fee (non-refundable)</span><span>$5.00</span></div>
    <div class="pay-row"><span>token budget</span><span>$10.00</span></div>
    <div class="pay-row total"><span>total today</span><span>$15.00</span></div>
  </div>

  <div class="pay-stub-notice">
    ⚡ payment stub — Stripe integration coming in v2.<br>
    click "continue" to demo the full game flow.
  </div>

  <form action="/play" method="GET">
    <input type="hidden" name="l" value="1">

    <div class="form-group">
      <label>display name (for leaderboard)</label>
      <input type="text" name="name" placeholder="how you'll appear on the leaderboard" required>
    </div>

    <div class="form-group">
      <label>your public URL</label>
      <input type="url" name="url" placeholder="personal site, X, LinkedIn — something real">
    </div>

    <div class="form-actions">
      <button type="submit" class="btn">pay $15 &amp; enter →</button>
      <a href="/" class="back-link-small">← back</a>
    </div>
  </form>
</div>`);
}

const LEVEL_META = [
  null, // 0 unused
  { title: 'The Frame',            section: 'I',    hint: 0 },
  { title: 'High Agency',          section: 'II',   hint: 1 },
  { title: 'Signal',               section: 'III',  hint: 2 },
  { title: 'The Cure',             section: 'IV',   hint: 3 },
  { title: 'Money',                section: 'V',    hint: 4 },
  { title: 'Ambition',             section: 'VII',  hint: 6 },
  { title: 'Public Commitment',    section: 'VIII', hint: 7 },
  { title: 'The Video',            section: 'VI',   hint: 5 },
  { title: 'Apply',                section: 'IX–X', hint: 8 },
];

function hintBlock(levelIdx) {
  const text = HINT_EXCERPTS[LEVEL_META[levelIdx].hint];
  return `
<div class="hint-section">
  <details>
    <summary>hint — section ${LEVEL_META[levelIdx].section}</summary>
    <div class="hint-body">${text}</div>
  </details>
</div>`;
}

function gameLevel(l, params) {
  const meta = LEVEL_META[l];
  const budget = budgetAfterLevel(l - 1);
  const nextL = l + 1;

  let body = '';

  if (l === 1) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    In your own words: <strong>what is the computer future</strong> — and why does the distinction from "AI" matter?
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="form-group">
      <textarea name="a1" rows="6" placeholder="write your answer here..." required></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
      <a href="/leaderboard" class="back-link-small">leaderboard</a>
    </div>
  </form>
</div>`;
  }

  else if (l === 2) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    Tell me about a time you <strong>made your own path</strong> when the expected one wasn't available.
    <br><br>Specifics. Not a philosophy of agency — an actual moment.
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="form-group">
      <textarea name="a2" rows="7" placeholder="be specific. context → friction → what you actually did." required></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
    </div>
  </form>
</div>`;
  }

  else if (l === 3) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    Why did you pay $15 to take a test with no guaranteed outcome?
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="choices">
      <label class="choice-label"><input type="radio" name="a3" value="a" required> to prove something to myself</label>
      <label class="choice-label"><input type="radio" name="a3" value="b"> the filter is the point — i understand why signal costs</label>
      <label class="choice-label"><input type="radio" name="a3" value="c"> curiosity about whoever built this</label>
      <label class="choice-label"><input type="radio" name="a3" value="d"> someone told me to</label>
    </div>
    <div class="form-group">
      <label>or write your own</label>
      <input type="text" name="a3_other" placeholder="...">
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
    </div>
  </form>
</div>`;
  }

  else if (l === 4) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    Your focus has been declining for weeks. You feel scattered and behind.
    <strong>What do you do?</strong>
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="choices">
      <label class="choice-label"><input type="radio" name="a4" value="a" required> install a productivity system or focus app</label>
      <label class="choice-label"><input type="radio" name="a4" value="b"> find a coach or accountability partner</label>
      <label class="choice-label"><input type="radio" name="a4" value="c"> take a course, read a book, subscribe to a newsletter</label>
      <label class="choice-label"><input type="radio" name="a4" value="d"> cut something from my life and get back to basics</label>
    </div>
    <div class="form-group">
      <label>diagnose it yourself (optional but good)</label>
      <textarea name="a4_diag" rows="3" placeholder="what are you actually avoiding?"></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
    </div>
  </form>
</div>`;
  }

  else if (l === 5) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    Two questions. Answer both honestly.
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="form-group">
      <label>what would you pay for access to someone who could genuinely change your trajectory?</label>
      <input type="text" name="a5a" placeholder="a dollar amount, a range, or an honest 'I don't know'" required>
    </div>
    <div class="form-group">
      <label>what have you actually paid for in the last 30 days? (ballpark is fine)</label>
      <textarea name="a5b" rows="3" placeholder="subscriptions, services, experiences, things..." required></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
    </div>
  </form>
</div>`;
  }

  else if (l === 6) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    What are you building?<br><br>
    <strong>Two sentences.</strong> Explain it so a thoughtful stranger who has never heard of you can understand it. No jargon. No backstory.
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="form-group">
      <textarea name="a6" rows="4" placeholder="two sentences. be specific enough that someone could explain it to someone else." required></textarea>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
    </div>
  </form>
</div>`;
  }

  else if (l === 7) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    Post something about the computer future publicly.<br><br>
    A tweet, a LinkedIn post, a note on your site — anything with a URL you can share here.
    <br><br>
    <strong>Why?</strong> Conviction without public commitment is just a preference.
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="form-group">
      <label>your public post URL</label>
      <input type="url" name="a7" placeholder="https://..." required>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
    </div>
  </form>
</div>`;
  }

  else if (l === 8) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    Record a 1–3 minute video.<br><br>
    <strong>What does the computer future mean to you personally, and why are you here?</strong><br><br>
    Don't script it. Don't perform it. Just speak.
    Upload to Loom, YouTube (unlisted is fine), or anywhere with a public URL.
  </p>
  ${hintBlock(l)}
  <form action="/play" method="GET">
    <input type="hidden" name="l" value="${nextL}">
    <div class="form-group">
      <label>your video URL</label>
      <input type="url" name="a8" placeholder="https://..." required>
    </div>
    <div class="form-actions">
      <button type="submit" class="btn">continue →</button>
    </div>
  </form>
</div>`;
  }

  else if (l === 9) {
    body = `
<div class="game-wrap">
  <p class="level-tag">level ${l} of ${LEVELS} — §${meta.section}</p>
  <h2 class="level-title">${meta.title}</h2>
  <p class="prompt">
    You've reached the final level.<br><br>
    The person behind this game is real. The call is real.<br>
    You don't apply. You book.
  </p>
  ${hintBlock(l)}

  <div style="display:flex;flex-direction:column;gap:1.2rem;margin-top:2rem;max-width:480px;">

    <div style="border:1px solid var(--line);border-radius:4px;padding:1.5rem;">
      <div style="font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:var(--gray);margin-bottom:0.75rem;">option A — scheduled</div>
      <div style="font-size:1.5rem;font-weight:700;margin-bottom:0.4rem;">$100</div>
      <div style="font-size:0.85rem;color:var(--gray);margin-bottom:1.2rem;line-height:1.6;">
        Book a future slot. $25 non-refundable. $75 refunded if the call doesn't happen within 30 days.
      </div>
      <a href="/complete?type=scheduled" class="btn" style="font-size:0.9rem;padding:0.7rem 1.5rem;">
        schedule a call →
      </a>
      <div style="font-size:0.75rem;color:var(--dim);margin-top:0.75rem;">stub — Stripe + Calendly in v2</div>
    </div>

    <div style="border:1px solid #2a1a4a;border-radius:4px;padding:1.5rem;background:#0d0818;">
      <div style="font-family:var(--font-mono);font-size:0.7rem;letter-spacing:0.12em;text-transform:uppercase;color:#8b5cf6;margin-bottom:0.75rem;">option B — live now</div>
      <div style="font-size:1.5rem;font-weight:700;margin-bottom:0.4rem;">$250</div>
      <div style="font-size:0.85rem;color:var(--gray);margin-bottom:1.2rem;line-height:1.6;">
        Ring right now. $50 non-refundable. $200 refunded automatically if no answer within 72 hours.
      </div>
      <a href="/complete?type=live" class="btn" style="font-size:0.9rem;padding:0.7rem 1.5rem;background:#8b5cf6;color:#fff;">
        call now →
      </a>
      <div style="font-size:0.75rem;color:var(--dim);margin-top:0.75rem;">stub — Stripe + Twilio in v2</div>
    </div>

  </div>
</div>`;
  }

  return shell(meta.title, body, true, l, budget);
}

function completePage() {
  return shell('you made it', `
<div class="complete-wrap">
  <div class="complete-mark">∞</div>
  <h1>you made it</h1>
  <p>
    your application has been received.<br>
    you'll hear back if and when the timing is right.
  </p>
  <p>
    in the meantime: you've just done something most people won't.
    you've thought out loud about the computer future, committed publicly, and asked for the conversation directly.
  </p>
  <p>
    that's not nothing.
  </p>
  <div style="display:flex;gap:1rem;justify-content:center;margin-top:2rem;flex-wrap:wrap;">
    <a href="/leaderboard" class="btn">leaderboard →</a>
    <a href="https://computerfuture.me" class="btn btn-outline" target="_blank">computerfuture.me</a>
  </div>
</div>`);
}

function leaderboardPage() {
  // Seeded with one entry. v2: D1 query.
  return shell('leaderboard', `
<div class="lb-wrap">
  <h1>Leaderboard</h1>
  <p class="lb-sub">those who completed the infinite game</p>

  <table>
    <thead>
      <tr>
        <th>name</th>
        <th>completed</th>
        <th style="text-align:right">link</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <div class="lb-name">Computer Future</div>
          <div class="lb-note">built the game. passed the test.</div>
        </td>
        <td class="lb-date">2026-03-05</td>
        <td><a href="https://computerfuture.me" target="_blank">computerfuture.me</a></td>
      </tr>
    </tbody>
  </table>

  <p style="margin-top:3rem;font-size:0.8rem;color:var(--gray);">
    your name appears here after completing level 9.<br>
    <a href="/">enter the game →</a>
  </p>
</div>`);
}

// ── Stubs (future API endpoints) ───────────────────────────────────────────
//
// POST /api/start   → create D1 session, issue session_id, create Stripe PaymentIntent
// POST /api/answer  → evaluate answer against bible section, update score, advance level
// POST /api/hint    → return HINT_EXCERPTS[level] (eventually from BIBLE_CONTENT env secret)
// POST /api/apply   → send application email via Resend to hi@computerfuture.me

function apiStub(name) {
  return new Response(JSON.stringify({ stub: true, endpoint: name, note: 'not implemented in v1' }), {
    status: 501,
    headers: { 'content-type': 'application/json' },
  });
}

// ── Router ─────────────────────────────────────────────────────────────────

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    const params = url.searchParams;

    const html = (body, status = 200) => new Response(body, {
      status,
      headers: { 'content-type': 'text/html;charset=UTF-8', 'cache-control': 'no-store' },
    });

    if (request.method === 'POST') {
      if (path === '/api/start')  return apiStub('/api/start');
      if (path === '/api/answer') return apiStub('/api/answer');
      if (path === '/api/hint')   return apiStub('/api/hint');
      if (path === '/api/apply')  return apiStub('/api/apply');
    }

    if (path === '/')            return html(landingPage());
    if (path === '/pay')         return html(payPage());
    if (path === '/leaderboard') return html(leaderboardPage());
    if (path === '/complete')    return html(completePage());

    if (path === '/play') {
      const l = parseInt(params.get('l') || '1');
      if (l >= 1 && l <= LEVELS) return html(gameLevel(l, params));
      return Response.redirect(url.origin + '/play?l=1', 302);
    }

    return html(shell('404', `
<div class="nf">
  <h1>404</h1>
  <p style="color:var(--gray)"><a href="/">back to the game</a></p>
</div>`), 404);
  },
};
