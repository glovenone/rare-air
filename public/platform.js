export const native = false;
export const publicOrigin = location.origin;
export async function request(path, body) {
  const response = await fetch("/api/" + path, {
    method: body ? "POST" : "GET",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The connection was interrupted. Please try again.");
  }
  if (!response.ok) throw new Error(data.error || "Please try again.");
  return data;
}
export async function haptic() {}
export async function shareFlight(text) {
  await navigator.clipboard.writeText(text);
  return "copied";
}
