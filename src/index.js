// computerfuture.xyz
// Routes: / (landing + email capture), POST /join (waitlist), /robots.txt
//
// Stats bar benchmark entries:
//   EM            — 6/28/71    — x.com
//   HumanInvariant.com — 12/21/25 — mempool tx
//   a24z          — 3/6/26    — a-z.md post  [confirm date]
//   computer future — TBD date
//
// WAITLIST D1 (separate from game DB):
//   emails(id, email, created_at, ip)
//
// Stats bar seeded static values. Wire when live:
//   DISPATCHES → count from computerfuture.me published posts
//   Visit counter → KV increment

const ROBOTS = `User-agent: *
Disallow: /
`;

const CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body {
    min-height: 100%;
    background: #080808;
    color: #f0f0f0;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
  }
  .wrap {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 4rem 2rem 8rem;
  }
  .name {
    font-size: clamp(2.5rem, 8vw, 5rem);
    font-weight: 700;
    letter-spacing: -0.03em;
    line-height: 1;
    margin-bottom: 2rem;
  }
  .tag {
    font-size: 0.85rem;
    color: #555;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin-bottom: 2.5rem;
  }
  .link {
    color: #888;
    text-decoration: none;
    border-bottom: 1px solid #333;
    padding-bottom: 1px;
    font-size: 0.9rem;
    transition: color 0.2s, border-color 0.2s;
    margin-bottom: 2.5rem;
    display: inline-block;
  }
  .link:hover { color: #f0f0f0; border-color: #888; }
  .form {
    display: flex;
    gap: 0.5rem;
    width: 100%;
    max-width: 360px;
    margin-top: 0.5rem;
  }
  .form input {
    flex: 1;
    background: #111;
    border: 1px solid #222;
    color: #f0f0f0;
    padding: 0.65rem 1rem;
    font-size: 0.9rem;
    font-family: inherit;
    outline: none;
    transition: border-color 0.2s;
    min-width: 0;
  }
  .form input::placeholder { color: #444; }
  .form input:focus { border-color: #444; }
  .form button {
    background: #f0f0f0;
    color: #080808;
    border: none;
    padding: 0.65rem 1.25rem;
    font-size: 0.85rem;
    font-family: inherit;
    font-weight: 600;
    letter-spacing: 0.03em;
    cursor: pointer;
    white-space: nowrap;
    transition: opacity 0.2s;
  }
  .form button:hover { opacity: 0.85; }
  .form-msg {
    font-size: 0.8rem;
    color: #555;
    margin-top: 0.75rem;
    letter-spacing: 0.03em;
    min-height: 1.2em;
  }
  .form-msg.ok { color: #4a9; }
  .form-msg.err { color: #a44; }
  .stats {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.6rem 1.5rem;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.4rem 2rem;
    font-family: 'Courier New', monospace;
    font-size: 0.65rem;
    color: #2a2a2a;
    letter-spacing: 0.04em;
    border-top: 1px solid #111;
    background: #080808;
  }
  .stats .entry { white-space: nowrap; }
  .stats .val { color: #444; }
  .stats a.val {
    color: #444;
    text-decoration: none;
    border-bottom: 1px solid #222;
    padding-bottom: 1px;
    transition: color 0.2s, border-color 0.2s;
  }
  .stats a.val:hover { color: #666; border-color: #444; }
  @media (max-width: 480px) {
    .stats { font-size: 0.58rem; gap: 0.3rem 1.2rem; padding: 0.5rem 1rem; }
    .form { flex-direction: column; }
    .form button { width: 100%; }
  }
`;

function page(msg = '', msgClass = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>computer future</title>
  <meta name="robots" content="noindex, nofollow" />
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet">
  <style>${CSS}</style>
</head>
<body>
  <div class="wrap">
    <p class="name">the infinite<br>game</p>
    <p class="tag">coming soon</p>
    <a class="link" href="https://computerfuture.me">computerfuture.me →</a>
    <form class="form" id="f">
      <input type="email" name="email" placeholder="your@email.com" required autocomplete="email" />
      <button type="submit">GET EARLY ACCESS</button>
    </form>
    <p class="form-msg ${msgClass}" id="msg">${msg}</p>
  </div>
  <div class="stats">
    <span class="entry"><span class="val">EM</span> &nbsp;6/28/71</span>
    <span class="entry"><a class="val" href="https://mempool.space/tx/0684d5af997f80e6a668dfd7e0e6cecc8deaef4ab6d7e5c8bd9694b6aca8d8e4" target="_blank" rel="noopener">HUMANINVARIANT.COM</a> &nbsp;12/21/25</span>
    <span class="entry"><a class="val" href="https://a-z.md/posts/jn70ebqme1b6pq84dfaz59r9r1829d3v" target="_blank" rel="noopener">A24Z</a> &nbsp;3/6/26</span>
    <span class="entry"><span class="val">COMPUTER FUTURE</span> &nbsp;3/7/26</span>
    <span class="entry">DISPATCHES &nbsp;<span class="val">10</span></span>
  </div>
  <script>
    document.getElementById('f').addEventListener('submit', async e => {
      e.preventDefault();
      const email = e.target.email.value.trim();
      const msg = document.getElementById('msg');
      msg.className = 'form-msg';
      msg.textContent = '...';
      try {
        const r = await fetch('/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        if (r.ok) {
          msg.className = 'form-msg ok';
          msg.textContent = "you're on the list.";
          e.target.reset();
        } else if (r.status === 409) {
          msg.className = 'form-msg ok';
          msg.textContent = "already on the list.";
        } else {
          msg.className = 'form-msg err';
          msg.textContent = 'something went wrong. try again.';
        }
      } catch {
        msg.className = 'form-msg err';
        msg.textContent = 'connection error.';
      }
    });
  </script>
</body>
</html>`;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';

    if (path === '/robots.txt') {
      return new Response(ROBOTS, {
        headers: { 'content-type': 'text/plain', 'cache-control': 'public, max-age=86400' },
      });
    }

    if (path === '/') {
      return new Response(page(), {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'cache-control': 'no-store',
          'x-robots-tag': 'noindex, nofollow',
        },
      });
    }

    if (path === '/join' && request.method === 'POST') {
      try {
        const { email } = await request.json();
        if (!email || !email.includes('@')) {
          return new Response('invalid email', { status: 400 });
        }
        const ip = request.headers.get('CF-Connecting-IP') || null;
        await env.WAITLIST.prepare(
          'INSERT INTO emails (email, created_at, ip) VALUES (?, ?, ?)'
        ).bind(email.toLowerCase().trim(), Math.floor(Date.now() / 1000), ip).run();
        return new Response('ok', { status: 200 });
      } catch (e) {
        if (e?.message?.includes('UNIQUE')) {
          return new Response('already exists', { status: 409 });
        }
        return new Response('error', { status: 500 });
      }
    }

    return new Response('', { status: 404 });
  },
};
