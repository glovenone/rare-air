export const companions = [
  {
    id: "swallow",
    days: 0,
    name: "Paper swallow",
    symbol: "➤",
    color: "#e9a373",
  },
  { id: "wren", days: 5, name: "Cloud wren", symbol: "✦", color: "#65b6bc" },
  { id: "kite", days: 14, name: "Sun kite", symbol: "◇", color: "#e3b54d" },
  { id: "moth", days: 30, name: "Moon moth", symbol: "☾", color: "#a49cd4" },
  {
    id: "phoenix",
    days: 45,
    name: "Ember phoenix",
    symbol: "❧",
    color: "#df7559",
  },
  { id: "ray", days: 60, name: "Aurora ray", symbol: "⌁", color: "#70c1a0" },
  { id: "comet", days: 75, name: "Comet fox", symbol: "✶", color: "#e3a5bd" },
  { id: "heron", days: 100, name: "Star heron", symbol: "✧", color: "#8eaddc" },
  {
    id: "dragon",
    days: 150,
    name: "Sky dragon",
    symbol: "∞",
    color: "#bc9a48",
  },
];
export function selectedCompanion() {
  let id;
  try {
    id = localStorage.getItem("rare:companion");
  } catch {}
  return companions.find((item) => item.id === id) || companions[0];
}
export function selectCompanion(id) {
  if (!companions.some((item) => item.id === id)) return;
  try {
    localStorage.setItem("rare:companion", id);
  } catch {}
  window.dispatchEvent(new CustomEvent("rare:companion", { detail: id }));
}
