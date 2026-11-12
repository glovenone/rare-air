-- Freeze exact question wording, answer lists and rarity tiers for each new game.
-- NULL means the original, immutable 30-question legacy bank.
ALTER TABLE sessions ADD COLUMN questions_json TEXT;
