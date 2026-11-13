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
cloudImage.src = "/art/cloud-bank.webp";
const balloonImage = new Image();
balloonImage.src = "/art/balloon.webp";

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

let effectGain = 0;
let effectTime = 10;
let pilotX = 0;
let pilotY = 0;
let targetPilotX = 0;
let targetPilotY = 0;
let pilotBank = 0;
let dragOrigin = null;
let manualGust = 0;
let pilotCenter = { x: innerWidth / 2, y: innerHeight / 2 };

function steer(x, y) {
  const minX = Math.max(
    -width * 0.1,
    14 + balloon.offsetWidth / 2 - balloon.offsetLeft,
  );
  const maxX = Math.min(
    width * 0.16,
    width - 14 - balloon.offsetWidth / 2 - balloon.offsetLeft,
  );
  targetPilotX = Math.max(minX, Math.min(maxX, x));
  targetPilotY = Math.max(-height * 0.065, Math.min(height * 0.075, y));
  document.body.classList.add("has-steered");
}

function catchGust() {
  manualGust = 1;
  document.body.classList.add("has-steered");
}

balloon.addEventListener("pointerdown", (event) => {
  if (balloon.disabled) return;
  dragOrigin = { x: event.clientX, y: event.clientY, pilotX, pilotY };
  balloon.setPointerCapture(event.pointerId);
  document.body.classList.add("has-steered");
});
balloon.addEventListener("pointermove", (event) => {
  if (!dragOrigin) return;
  steer(
    dragOrigin.pilotX + event.clientX - dragOrigin.x,
    dragOrigin.pilotY + event.clientY - dragOrigin.y,
  );
});
balloon.addEventListener("pointerup", (event) => {
  if (
    dragOrigin &&
    Math.hypot(event.clientX - dragOrigin.x, event.clientY - dragOrigin.y) < 8
  )
    catchGust();
  dragOrigin = null;
});
balloon.addEventListener("pointercancel", () => {
  dragOrigin = null;
});
balloon.addEventListener("lostpointercapture", () => {
  dragOrigin = null;
});
balloon.addEventListener("keydown", (event) => {
  if (event.key.startsWith("Arrow")) {
    event.preventDefault();
    const x =
      event.key === "ArrowLeft" ? -26 : event.key === "ArrowRight" ? 26 : 0;
    const y =
      event.key === "ArrowUp" ? -20 : event.key === "ArrowDown" ? 20 : 0;
    steer(targetPilotX + x, targetPilotY + y);
  } else if (event.code === "Space" || event.key === "Enter") {
    event.preventDefault();
    if (!event.repeat) catchGust();
  }
});

function updatePilot(delta) {
  const bounds = balloon.getBoundingClientRect();
  pilotCenter = {
    x: bounds.left + bounds.width / 2,
    y: bounds.top + bounds.height * 0.65,
  };
  const previousX = pilotX;
  const response = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 9);
  pilotX += (targetPilotX - pilotX) * response;
  pilotY += (targetPilotY - pilotY) * response;
  pilotBank += ((pilotX - previousX) * 1.2 - pilotBank) * response;
  manualGust = Math.max(0, manualGust - delta * 1.4);
  const gustLift = reducedMotion.matches
    ? 0
    : Math.sin(manualGust * Math.PI) * 24;
  root.style.setProperty("--pilot-x", `${pilotX.toFixed(1)}px`);
  root.style.setProperty("--pilot-y", `${(pilotY - gustLift).toFixed(1)}px`);
  root.style.setProperty(
    "--pilot-bank",
    `${Math.max(-12, Math.min(12, pilotBank)).toFixed(1)}deg`,
  );
  document.body.classList.toggle(
    "is-piloting",
    manualGust > 0 || dragOrigin !== null,
  );
}

function resize() {
  width = innerWidth;
  height = visualViewport?.height || innerHeight;
  targetPilotX = pilotX = 0;
  targetPilotY = pilotY = 0;
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

function drawPlane(x, y, angle, size, color) {
  front.save();
  front.translate(x, y);
  front.rotate(angle);
  front.fillStyle = "#25526618";
  front.beginPath();
  front.moveTo(-size, size * 0.65);
  front.lineTo(size * 1.2, 4);
  front.lineTo(-size * 0.6, -size * 0.25);
  front.closePath();
  front.fill();
  front.fillStyle = color;
  front.beginPath();
  front.moveTo(size * 1.3, 0);
  front.lineTo(-size, -size * 0.48);
  front.lineTo(-size * 0.48, 0);
  front.closePath();
  front.fill();
  front.fillStyle = "#fff4d9";
  front.beginPath();
  front.moveTo(size * 1.3, 0);
  front.lineTo(-size * 0.72, size * 0.62);
  front.lineTo(-size * 0.48, 0);
  front.closePath();
  front.fill();
  front.strokeStyle = "#2d65714d";
  front.lineWidth = 0.7;
  front.beginPath();
  front.moveTo(-size * 0.48, 0);
  front.lineTo(size * 1.3, 0);
  front.stroke();
  front.restore();
}

function drawUpdraft(delta) {
  if (reducedMotion.matches) return;
  effectTime += delta;
  const lifetime = 2.5 + effectGain * 0.0013;
  const progress = effectTime / lifetime;
  const active = effectGain > 0 && progress < 1;
  const envelope = active
    ? Math.sin(Math.min(1, progress) * Math.PI)
    : manualGust * 0.45;
  if (envelope <= 0.001) return;
  const strength = active ? Math.min(1, effectGain / 1000) : 0.2;
  const { x, y } = pilotCenter;

  // A single warm exposure leads into the wind tunnel and then fades gently.
  const glow = front.createRadialGradient(
    x,
    y,
    4,
    x,
    y,
    width < 600 ? 190 : 310,
  );
  glow.addColorStop(0, `rgba(255,233,158,${envelope * 0.25})`);
  glow.addColorStop(0.45, `rgba(255,244,208,${envelope * 0.12})`);
  glow.addColorStop(1, "rgba(255,244,208,0)");
  front.fillStyle = glow;
  front.fillRect(0, 0, width, height);

  const tunnelRadius = width < 600 ? 58 : 95;
  const travel = active ? effectTime * (100 + strength * 210) : elapsed * 60;
  const ringCount = strength >= 0.5 ? 7 : 4;
  for (let ring = 0; ring < ringCount; ring++) {
    const position = (ring / ringCount + travel / height) % 1;
    const ringY = y - height * 0.6 + position * height;
    const radius = tunnelRadius * (0.3 + position * 1.15);
    const bend = Math.sin(position * Math.PI * 1.8 + effectTime) * 22;
    front.strokeStyle = `rgba(255,246,203,${envelope * (0.1 + position * 0.35)})`;
    front.lineWidth = 1 + position * 1.8;
    front.beginPath();
    front.ellipse(
      x + bend,
      ringY,
      radius,
      radius * 0.25,
      -0.12,
      0,
      Math.PI * 2,
    );
    front.stroke();
    front.strokeStyle = `rgba(195,130,62,${envelope * 0.2})`;
    front.lineWidth = 0.8;
    front.beginPath();
    front.ellipse(
      x + bend,
      ringY + 2,
      radius + 5,
      radius * 0.25,
      -0.12,
      0.1,
      Math.PI * 0.95,
    );
    front.stroke();
  }
  const streakCount = width < 600 ? 20 : 38;
  for (let streak = 0; streak < streakCount; streak++) {
    const lane = (streak * 0.618) % 1;
    const streakX = x + (lane - 0.5) * tunnelRadius * 4.5;
    const streakY =
      ((streak * 71 + travel * (1 + lane)) % (height + 130)) - 100;
    const length = 14 + lane * 55 + strength * 45;
    front.strokeStyle = `rgba(255,251,225,${envelope * (0.15 + lane * 0.5)})`;
    front.lineWidth = lane > 0.8 ? 1.6 : 0.7;
    front.beginPath();
    front.moveTo(streakX, streakY);
    front.lineTo(streakX - 5, streakY + length);
    front.stroke();
  }

  if (active && effectGain >= 500) {
    const fleetSize = effectGain >= 1000 ? 3 : 2;
    for (let plane = 0; plane < fleetSize; plane++) {
      const phase = Math.max(0, Math.min(1, progress * 1.15 - plane * 0.07));
      const orbit = phase * Math.PI * 2.2 + plane * 2;
      const radius = (width < 600 ? 58 : 125) * (1 - phase * 0.3);
      const planeX = x + Math.cos(orbit) * radius + phase ** 4 * width * 0.8;
      const planeY =
        y + height * 0.2 - phase * height * 0.7 + Math.sin(orbit) * 25;
      front.globalAlpha =
        Math.min(1, phase * 10) * Math.min(1, (1 - phase) * 8);
      front.strokeStyle = plane === 0 ? "#fff0b8a0" : "#e8f7ed80";
      front.lineWidth = 1.8;
      front.beginPath();
      front.moveTo(planeX - Math.cos(orbit) * 28, planeY + 65);
      front.quadraticCurveTo(planeX - 38, planeY + 25, planeX, planeY);
      front.stroke();
      drawPlane(
        planeX,
        planeY,
        -0.9 + Math.sin(orbit) * 0.35,
        width < 600 ? 12 : 19,
        ["#db8a62", "#72a9a6", "#d8b066"][plane],
      );
    }
    front.globalAlpha = 1;
  }

  if (
    active &&
    effectGain >= 500 &&
    cloudImage.complete &&
    cloudImage.naturalWidth
  ) {
    const sweep = Math.max(0, Math.min(1, (progress - 0.08) / 0.65));
    const opacity = Math.sin(sweep * Math.PI) * 0.72;
    const cloudWidth = Math.min(width * 0.8, 850);
    front.globalAlpha = opacity;
    front.drawImage(
      cloudImage,
      x - cloudWidth * 1.05 - sweep * 65,
      y - height * 0.48 + sweep * height * 0.9,
      cloudWidth,
      (cloudWidth * cloudImage.naturalHeight) / cloudImage.naturalWidth,
    );
    front.drawImage(
      cloudImage,
      x + cloudWidth * 0.08 + sweep * 60,
      y - height * 0.58 + sweep * height * 0.9,
      cloudWidth,
      (cloudWidth * cloudImage.naturalHeight) / cloudImage.naturalWidth,
    );
    front.globalAlpha = 1;
  }
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
  updatePilot(delta);
  context.clearRect(0, 0, width, height);
  front.clearRect(0, 0, width, height);
  if (mode !== "result") {
    const zoom =
      1 +
      (effectGain > 0 && !reducedMotion.matches
        ? Math.sin(Math.min(effectTime / 4, 1) * Math.PI) * 0.025
        : 0);
    for (const paint of [context, front]) {
      paint.save();
      paint.translate(pilotCenter.x, pilotCenter.y);
      paint.scale(zoom, zoom);
      paint.translate(-pilotCenter.x, -pilotCenter.y);
    }
    drawClouds();
    drawWildlife();
    drawLandmarks();
    context.restore();
    front.restore();
    drawBurst(delta);
    drawUpdraft(delta);
  }
}
requestAnimationFrame(render);

export function setFlight({
  mode: nextMode = "home",
  altitude = 0,
  gain = 0,
} = {}) {
  const modeChanged = mode !== nextMode;
  mode = nextMode;
  balloon.disabled = nextMode === "result";
  if (modeChanged) {
    targetPilotX = 0;
    targetPilotY = 0;
    dragOrigin = null;
  }
  effectGain = gain;
  effectTime = gain > 0 ? 0 : 10;
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
    root.style.setProperty("--lift-distance", `${22 + gain * 0.055}px`);
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
