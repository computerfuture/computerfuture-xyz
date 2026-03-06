// computerfuture.xyz
// Under construction. No game content served here yet.
// Routes: / (coming soon), /robots.txt, * (404)
//
// Stats bar: seeded static values for now.
// Wire when infrastructure exists:
//   DISPATCHES → count from computerfuture.me ALL_POSTS (or KV)
//   RANK 3+ → D1 sessions table, top zLevel scores
//   Visit counter → KV increment on each / hit

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
    padding: 4rem 2rem;
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
    margin-bottom: 3rem;
  }
  a {
    color: #888;
    text-decoration: none;
    border-bottom: 1px solid #333;
    padding-bottom: 1px;
    font-size: 0.9rem;
    transition: color 0.2s, border-color 0.2s;
  }
  a:hover { color: #f0f0f0; border-color: #888; }
  .stats {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 0.75rem 2rem;
    display: flex;
    justify-content: center;
    gap: 2.5rem;
    font-family: 'Courier New', monospace;
    font-size: 0.7rem;
    color: #333;
    letter-spacing: 0.04em;
    border-top: 1px solid #111;
    background: #080808;
  }
  .stats span { white-space: nowrap; }
  .stats .val { color: #555; }
`;

const PAGE = `<!DOCTYPE html>
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
    <p class="name">computer<br>future</p>
    <p class="tag">coming soon</p>
    <a href="https://computerfuture.me">computerfuture.me →</a>
  </div>
  <div class="stats">
    <span>RANK 1 &nbsp;<span class="val">E.M.</span></span>
    <span>RANK 2 &nbsp;<span class="val">COMPUTER FUTURE</span></span>
    <span>RANK 3 &nbsp;<span class="val">???</span></span>
    <span>DISPATCHES &nbsp;<span class="val">5</span></span>
  </div>
</body>
</html>`;

export default {
  async fetch(request) {
    const path = new URL(request.url).pathname.replace(/\/$/, '') || '/';

    if (path === '/robots.txt') {
      return new Response(ROBOTS, {
        headers: { 'content-type': 'text/plain', 'cache-control': 'public, max-age=86400' },
      });
    }

    if (path === '/') {
      return new Response(PAGE, {
        headers: {
          'content-type': 'text/html;charset=UTF-8',
          'cache-control': 'no-store',
          'x-robots-tag': 'noindex, nofollow',
        },
      });
    }

    return new Response('', { status: 404 });
  },
};
