import { companions } from "./companions.js";

const prices = [0, 0, 0, 120, 180, 240, 300, 420, 600];
export const avatars = companions.map((companion, index) => ({
  id: companion.id,
  name: companion.name,
  color: companion.color,
  cost: prices[index],
}));
export function avatarImage(id) {
  const avatar = avatars.find((item) => item.id === id) || avatars[0];
  return "/art/companions/" + avatar.id + ".svg";
}
export function selectedAvatar() {
  try {
    return (
      avatars.find((item) => item.id === localStorage.getItem("rare:avatar")) ||
      avatars[0]
    );
  } catch {
    return avatars[0];
  }
}
export function selectAvatar(id) {
  if (!avatars.some((item) => item.id === id)) return;
  try {
    localStorage.setItem("rare:avatar", id);
  } catch {}
  window.dispatchEvent(new CustomEvent("rare:avatar", { detail: id }));
}
