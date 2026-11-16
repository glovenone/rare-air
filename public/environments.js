const routes = new Set([
  "world",
  "science",
  "nature",
  "movies",
  "books",
  "music",
  "games",
  "arts",
  "everyday",
]);
export function setEnvironment(route) {
  const id = routes.has(route) ? route : "open";
  if (document.body.dataset.airspace === id) return;
  document.body.dataset.airspace = id;
  let scenery = document.getElementById("route-scenery");
  if (!scenery) {
    scenery = document.createElement("div");
    scenery.id = "route-scenery";
    scenery.setAttribute("aria-hidden", "true");
    document.body.prepend(scenery);
  }
  scenery.replaceChildren();
  if (id !== "open") {
    const image = document.createElement("img");
    image.src = "/art/routes/" + id + ".svg";
    image.alt = "";
    scenery.append(image);
  }
}
