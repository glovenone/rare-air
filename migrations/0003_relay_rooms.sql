CREATE TABLE relay_rooms (
  code TEXT PRIMARY KEY,
  state_json TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 0,
  creator TEXT NOT NULL,
  created INTEGER NOT NULL,
  expires INTEGER NOT NULL
);
CREATE INDEX relay_creator_rate ON relay_rooms(creator, created);
CREATE INDEX relay_expiry ON relay_rooms(expires);
