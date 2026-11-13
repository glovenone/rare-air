const canvas = document.getElementById("cloud-canvas");
const foreground = document.getElementById("foreground-canvas");
const context = canvas.getContext("2d");
const front = foreground.getContext("2d");
const root = document.documentElement;
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const altitudeLabel = document.getElementById("altitude");
const zoneLabel = document.getElementById("sky-zone");
const checkpoint = document.getElementById("checkpoint");
const balloon = document.getElementById("balloon");
const cloudImage = new Image();
cloudImage.src = "/art/cloud-bank.png";
const balloonImage = new Image();
balloonImage.src = "/art/balloon.png";

const landmarks = [
  { altitude: 250, label: "Kites on the breeze", side: 1 },
  { altitude: 650, label: "A little bird country", side: -1 },
  { altitude: 1000, label: "THE CLOUDLINE", side: 1 },
  { altitude: 1700, label: "Drifting in good company", side: -1 },
  { altitude: 2500, label: "AN OCEAN OF CLOUDS", side: 1 },
  { altitude: 3300, label: "The glider’s playground", side: -1 },
  { altitude: 4200, label: "THE HIGH BLUE", side: 1 },
  { altitude: 5000, label: "A perfect climb", side: -1 },
];
const clouds = Array.from({ length: 25 }, (_, index) => ({
  altitude: index * 235 - 500,
  x: index % 2 ? 0.93 : 0.04,
  size: 0.32 + ((index * 0.618) % 1) * 0.35,
  depth: 0.55 + (index % 3) * 0.17,
  offset: Math.sin(index * 4.1) * 80,
  foreground: index % 5 === 0,
}));
let width = innerWidth;
let height = innerHeight;
let currentAltitude = 0;
let startAltitude = 0;
let targetAltitude = 0;
let transitionStart = 0;
let duration = 2000;
let lastFrame = 0;
let elapsed = 0;
let climbTimer;
let checkpointTimer;
let pendingLandmarks = [];
let mode = "home";
let particles = [];

function resize() {
  width = innerWidth;
  height = visualViewport?.height || innerHeight;
  root.style.setProperty("--screen-height", `${height}px`);
  const density = Math.min(devicePixelRatio || 1, 1.5);
  for (const [surface, paint] of [
    [canvas, context],
    [foreground, front],
  ]) {
    surface.width = Math.round(width * density);
    surface.height = Math.round(height * density);
    paint.setTransform(density, 0, 0, density, 0, 0);
  }
}
addEventListener("resize", resize);
visualViewport?.addEventListener("resize", resize);
resize();

function worldY(altitude, depth = 1) {
  const scale = width < 600 ? 0.58 : 0.72;
  return height * 0.48 + (currentAltitude - altitude) * scale * depth;
}

function drawClouds() {
  if (!cloudImage.complete || !cloudImage.naturalWidth) return;
  for (const cloud of clouds) {
    const size = Math.min(width, 1200) * cloud.size + 90;
    const y = worldY(cloud.altitude, cloud.depth) + cloud.offset;
    if (y < -size * 0.4 || y > height + 30) continue;
    const paint = cloud.foreground ? front : context;
    const drift = reducedMotion.matches
      ? 0
      : Math.sin(elapsed * 0.045 + cloud.altitude) * 20;
    const x = width * cloud.x - size / 2 + drift;
    paint.globalAlpha = cloud.foreground ? 0.84 : 0.45;
    paint.drawImage(
      cloudImage,
      x,
      y,
      size,
      (size * cloudImage.naturalHeight) / cloudImage.naturalWidth,
    );
  }
  context.globalAlpha = 1;
  front.globalAlpha = 1;
}

function drawBird(x, y, size, phase) {
  const wing = Math.sin(phase) * size * 0.8;
  context.beginPath();
  context.moveTo(x - size, y - wing);
  context.quadraticCurveTo(x - size * 0.35, y - size * 0.25, x, y + size * 0.2);
  context.quadraticCurveTo(
    x + size * 0.35,
    y - size * 0.25,
    x + size,
    y - wing,
  );
  context.stroke();
}

function drawWildlife() {
  context.strokeStyle = "#326675";
  context.lineWidth = width < 600 ? 1.3 : 1.8;
  context.lineCap = "round";
  for (const [flock, altitude] of [360, 1200, 2200, 3700, 4600].entries()) {
    const y = worldY(altitude, 0.8);
    if (y < -80 || y > height + 80) continue;
    const travel = reducedMotion.matches
      ? 0.6
      : ((elapsed * 0.014 + flock * 0.21) % 1.3) - 0.15;
    for (let bird = 0; bird < 5; bird++) {
      const x = width * travel + bird * 24;
      drawBird(
        x,
        y + Math.abs(bird - 2) * 13,
        5 + (bird % 2),
        reducedMotion.matches ? 0.7 : elapsed * 5 + bird,
      );
    }
  }
  for (const [index, altitude] of [250, 1650, 2950].entries()) {
    const y = worldY(altitude);
    if (y < -100 || y > height + 130) continue;
    const x = width * (index % 2 ? 0.72 : 0.17);
    const sway = reducedMotion.matches
      ? 0
      : Math.sin(elapsed * 1.4 + index) * 0.12;
    context.save();
    context.translate(x, y);
    context.rotate(sway);
    context.fillStyle = index % 2 ? "#4e9ba5" : "#cf7356";
    context.beginPath();
    context.moveTo(0, -17);
    context.lineTo(12, 0);
    context.lineTo(0, 21);
    context.lineTo(-12, 0);
    context.closePath();
    context.fill();
    context.fillStyle = "#f5dfae";
    context.beginPath();
    context.moveTo(0, -17);
    context.lineTo(0, 21);
    context.lineTo(-12, 0);
    context.closePath();
    context.fill();
    context.strokeStyle = "#5c89915c";
    context.lineWidth = 0.8;
    context.beginPath();
    context.moveTo(0, 21);
    context.bezierCurveTo(-14, 42, 22, 55, 0, 88);
    context.stroke();
    context.restore();
  }
  if (balloonImage.complete && balloonImage.naturalWidth) {
    for (const [index, altitude] of [1450, 3850].entries()) {
      const y = worldY(altitude, 0.75);
      if (y < -100 || y > height) continue;
      const x = width * (index ? 0.15 : 0.81);
      context.globalAlpha = 0.65;
      context.drawImage(balloonImage, x, y, 27, 40.5);
    }
    context.globalAlpha = 1;
  }
}

function drawLandmarks() {
  const mobile = width < 600;
  context.font = `${mobile ? 7 : 10}px "DM Sans", sans-serif`;
  for (const landmark of landmarks) {
    const y = worldY(landmark.altitude);
    if (y < 140 || y > height - 145) continue;
    const x =
      landmark.side > 0
        ? width * (mobile ? 0.67 : 0.79)
        : width * (mobile ? 0.06 : 0.06);
    const maxWidth = width * (mobile ? 0.23 : 0.15);
    context.globalAlpha = 0.55;
    context.strokeStyle = "#3c7682";
    context.lineWidth = 0.6;
    context.beginPath();
    context.moveTo(x, y + 9);
    context.lineTo(x + 23, y + 9);
    context.stroke();
    context.fillStyle = "#2d6978";
    context.fillText(`${landmark.altitude.toLocaleString()} m`, x, y, maxWidth);
    context.globalAlpha = 0.75;
    context.fillText(landmark.label, x, y + (mobile ? 23 : 27), maxWidth);
  }
  context.globalAlpha = 1;
}

function addBurst(gain) {
  if (reducedMotion.matches) return;
  const bounds = balloon.getBoundingClientRect();
  const originX = bounds.left + bounds.width / 2;
  const originY = bounds.top + bounds.height * 0.7;
  const count = gain >= 1000 ? 65 : gain >= 500 ? 38 : 20;
  particles = Array.from({ length: count }, (_, index) => ({
    x: originX,
    y: originY,
    vx: Math.sin(index * 2.4) * (25 + (index % 7) * 12),
    vy: 15 + (index % 9) * 19,
    life: 1.3 + (index % 7) * 0.24,
    remaining: 1.3 + (index % 7) * 0.24,
    size: index % 4 === 0 ? 3 : 1.4,
  }));
}

function drawBurst(delta) {
  for (const particle of particles) {
    particle.remaining -= delta;
    if (particle.remaining <= 0) continue;
    particle.x += particle.vx * delta;
    particle.y += particle.vy * delta;
    particle.vy += delta * 10;
    front.globalAlpha = Math.max(0, particle.remaining / particle.life);
    front.fillStyle = "#fff0ac";
    front.beginPath();
    front.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    front.fill();
  }
  front.globalAlpha = 1;
  particles = particles.filter((particle) => particle.remaining > 0);
}

function updateAltitude() {
  const ratio = Math.min(1, Math.max(0, currentAltitude / 5000));
  altitudeLabel.textContent = Math.round(currentAltitude).toLocaleString();
  root.style.setProperty("--altitude-ratio", ratio);
  root.style.setProperty(
    "--sky-shift",
    `${Math.min(currentAltitude * 0.24, height * 0.08)}px`,
  );
  root.style.setProperty(
    "--landscape-opacity",
    Math.max(0, 1 - currentAltitude / 1900),
  );
  root.style.setProperty("--high-opacity", ratio);
  zoneLabel.textContent =
    currentAltitude >= 4200
      ? "THE HIGH BLUE"
      : currentAltitude >= 2500
        ? "CLOUD OCEAN"
        : currentAltitude >= 1000
          ? "THE CLOUDLINE"
          : currentAltitude > 0
            ? "THE OPEN AIR"
            : "THE LAUNCHPAD";
  const passed = pendingLandmarks.filter(
    (landmark) => currentAltitude >= landmark.altitude - 1,
  );
  if (passed.length) {
    const landmark = passed.at(-1);
    checkpoint.textContent = `${landmark.altitude.toLocaleString()} m · ${landmark.label}`;
    checkpoint.classList.add("visible");
    clearTimeout(checkpointTimer);
    checkpointTimer = setTimeout(
      () => checkpoint.classList.remove("visible"),
      4000,
    );
    pendingLandmarks = pendingLandmarks.filter(
      (item) => !passed.includes(item),
    );
  }
}

function render(time) {
  requestAnimationFrame(render);
  if (document.hidden || time - lastFrame < (reducedMotion.matches ? 120 : 32))
    return;
  const delta = Math.min((time - lastFrame) / 1000, 0.1);
  lastFrame = time;
  if (!reducedMotion.matches) elapsed += delta;
  const progress = reducedMotion.matches
    ? 1
    : Math.min(1, Math.max(0, (time - transitionStart) / duration));
  // A gentle launch and arrival make the distance travelled visible throughout the climb.
  const eased =
    progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
  currentAltitude = startAltitude + (targetAltitude - startAltitude) * eased;
  updateAltitude();
  context.clearRect(0, 0, width, height);
  front.clearRect(0, 0, width, height);
  if (mode !== "result") {
    drawClouds();
    drawWildlife();
    drawLandmarks();
    drawBurst(delta);
  }
}
requestAnimationFrame(render);

export function setFlight({
  mode: nextMode = "home",
  altitude = 0,
  gain = 0,
} = {}) {
  mode = nextMode;
  startAltitude = currentAltitude;
  const previousTarget = targetAltitude;
  targetAltitude = altitude;
  transitionStart = performance.now();
  duration = gain ? 2000 + gain * 1.25 : 650;
  pendingLandmarks =
    gain > 0
      ? landmarks.filter(
          (landmark) =>
            landmark.altitude > previousTarget && landmark.altitude <= altitude,
        )
      : [];
  clearTimeout(climbTimer);
  document.body.classList.remove("is-climbing");
  if (nextMode === "home") {
    checkpoint.classList.remove("visible");
    pendingLandmarks = [];
  }
  if (gain > 0 && !reducedMotion.matches) {
    root.style.setProperty("--lift-distance", `${15 + gain * 0.035}px`);
    requestAnimationFrame(() => {
      document.body.classList.add("is-climbing");
      addBurst(gain);
    });
    climbTimer = setTimeout(
      () => document.body.classList.remove("is-climbing"),
      3300,
    );
  }
}
