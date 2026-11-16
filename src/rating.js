// Pairwise Elo averaged over the table; tied finishing positions split equally.
export function ratingChanges(players) {
  if (
    players.length < 2 ||
    new Set(players.map((p) => p.account)).size !== players.length
  )
    return [];
  return players.map((player) => {
    let difference = 0;
    for (const other of players) {
      if (other === player) continue;
      const result =
        player.rank === other.rank ? 0.5 : player.rank < other.rank ? 1 : 0;
      const expected = 1 / (1 + 10 ** ((other.rating - player.rating) / 400));
      difference += result - expected;
    }
    return {
      account: player.account,
      rank: player.rank,
      delta: Math.round((32 * difference) / (players.length - 1)),
    };
  });
}
