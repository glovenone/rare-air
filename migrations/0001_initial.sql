CREATE TABLE sessions (
 id TEXT PRIMARY KEY, player TEXT NOT NULL, day TEXT NOT NULL, mode TEXT NOT NULL CHECK(mode IN ('daily','practice')),
 seed TEXT NOT NULL, round INTEGER NOT NULL DEFAULT 0, started INTEGER NOT NULL, created INTEGER NOT NULL,
 name TEXT NOT NULL
);
CREATE UNIQUE INDEX one_daily ON sessions(player,day) WHERE mode='daily';
CREATE INDEX session_rate ON sessions(player,created);
CREATE INDEX daily_board ON sessions(day,mode,round);
CREATE TABLE answers (
 session TEXT NOT NULL REFERENCES sessions(id), round INTEGER NOT NULL,
 question TEXT NOT NULL, answer TEXT NOT NULL, label TEXT NOT NULL, tier INTEGER NOT NULL,
 points INTEGER NOT NULL, correct INTEGER NOT NULL, timed_out INTEGER NOT NULL,
 PRIMARY KEY(session,round)
);
