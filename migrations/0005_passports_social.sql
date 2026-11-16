CREATE TABLE passports (
 id TEXT PRIMARY KEY, player TEXT NOT NULL UNIQUE, name TEXT NOT NULL, recovery_hash TEXT NOT NULL UNIQUE,
 created INTEGER NOT NULL, rating INTEGER NOT NULL DEFAULT 1000, matches INTEGER NOT NULL DEFAULT 0,
 buddy TEXT NOT NULL DEFAULT 'swallow', trail TEXT NOT NULL DEFAULT 'classic'
);
CREATE TABLE passport_sessions (hash TEXT PRIMARY KEY, account TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
CREATE INDEX passport_session_expiry ON passport_sessions(expires);
CREATE TABLE passport_players (player TEXT PRIMARY KEY, account TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE);
CREATE INDEX passport_link_account ON passport_players(account);
CREATE TABLE passkeys (id TEXT PRIMARY KEY, account TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE, public_key TEXT NOT NULL, counter INTEGER NOT NULL, transports TEXT NOT NULL);
CREATE TABLE auth_challenges (id TEXT PRIMARY KEY, player TEXT NOT NULL, account TEXT, kind TEXT NOT NULL, challenge TEXT NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE request_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE friend_invites (hash TEXT PRIMARY KEY, account TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE, expires INTEGER NOT NULL);
CREATE TABLE friendships (a TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE, b TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE, created INTEGER NOT NULL, PRIMARY KEY(a,b));
CREATE TABLE pilot_blocks (owner TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE, target TEXT NOT NULL, PRIMARY KEY(owner,target));
CREATE TABLE pilot_reports (id TEXT PRIMARY KEY, reporter TEXT NOT NULL, target TEXT NOT NULL, room TEXT, reason TEXT NOT NULL, created INTEGER NOT NULL);
CREATE TABLE rating_results (room TEXT NOT NULL, account TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE, delta INTEGER NOT NULL, rank INTEGER NOT NULL, applied INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, PRIMARY KEY(room,account));
CREATE TABLE ranked_seats (account TEXT PRIMARY KEY REFERENCES passports(id) ON DELETE CASCADE, room TEXT NOT NULL, expires INTEGER NOT NULL);
ALTER TABLE relay_rooms ADD COLUMN visibility TEXT NOT NULL DEFAULT 'private';
ALTER TABLE relay_rooms ADD COLUMN pool TEXT;
ALTER TABLE relay_rooms ADD COLUMN activity INTEGER NOT NULL DEFAULT 0;
CREATE INDEX relay_public_activity ON relay_rooms(visibility,activity);
CREATE INDEX relay_match_pool ON relay_rooms(pool,activity);
