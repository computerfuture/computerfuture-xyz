-- computerfuture.xyz D1 schema
-- Apply: wrangler d1 execute computerfuture-xyz --file=schema.sql

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,                   -- uuid, set server-side, stored in cookie
  created_at INTEGER NOT NULL,           -- unix timestamp
  handle TEXT,                           -- leaderboard display name
  public_url TEXT,                       -- their public presence URL
  net_worth_raw TEXT,                    -- honor system, free text
  self_ambition_score INTEGER,           -- 1-10 self-reported
  research_summary TEXT,                 -- opus research dive output, if run
  z_level_running REAL DEFAULT 0,        -- internal score 0-9+
  token_budget_used INTEGER DEFAULT 0,   -- cumulative tokens used (input+output)
  api_key_provided INTEGER DEFAULT 0,    -- 1 if user brought own key
  referral_code_used TEXT,               -- which referral code they came in on
  nps_score INTEGER,                     -- 0-10, collected at endgame
  phase TEXT DEFAULT 'onboarding',       -- onboarding | cli | chat | endgame | complete
  completed_at INTEGER                   -- null until they complete the game
);

CREATE TABLE IF NOT EXISTS turns (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  turn_index INTEGER NOT NULL,
  phase TEXT,                            -- which phase this turn occurred in
  level INTEGER,                         -- level number if in cli phase
  user_input TEXT,
  claude_eval TEXT,                      -- raw eval JSON from claude
  score_delta REAL DEFAULT 0,            -- how this turn affected z_level
  hints_used INTEGER DEFAULT 0,          -- hints revealed this turn
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,                   -- stripe session or payment intent id
  session_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  status TEXT DEFAULT 'pending',         -- pending | paid | refunded | failed
  call_type TEXT,                        -- 'scheduled' | 'live' | null (entry fee only)
  card_saved INTEGER DEFAULT 0,
  card_last4 TEXT,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS referrals (
  code TEXT PRIMARY KEY,                 -- 8-char random code
  session_id TEXT NOT NULL,             -- session that generated this code
  created_at INTEGER NOT NULL,
  click_count INTEGER DEFAULT 0,
  conversion_count INTEGER DEFAULT 0    -- how many referred users paid
);

CREATE TABLE IF NOT EXISTS referral_clicks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL,
  clicked_at INTEGER NOT NULL,
  converted_session_id TEXT             -- set when referred user completes payment
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_turns_session ON turns(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_session ON payments(session_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_referral_clicks_code ON referral_clicks(code);
