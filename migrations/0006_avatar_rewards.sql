ALTER TABLE passports ADD COLUMN avatar TEXT NOT NULL DEFAULT 'swallow';
CREATE TABLE passport_unlocks (
  account TEXT NOT NULL REFERENCES passports(id) ON DELETE CASCADE,
  item TEXT NOT NULL,
  cost INTEGER NOT NULL CHECK(cost >= 0),
  created INTEGER NOT NULL,
  PRIMARY KEY(account, item)
);
