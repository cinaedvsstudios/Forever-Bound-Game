/*
Forever Bound Game — Phase 1–3 Manual Prototype
Purpose:
- Title screen
- Play button
- Test scene display
- Placeholder Mel movement
*/

const playButton = document.getElementById("play-button");
const titleScreen = document.getElementById("title-screen");
const gameScreen = document.getElementById("game-screen");
const mel = document.getElementById("mel");
const statusLocation = document.getElementById("status-location");
const statusCalling = document.getElementById("status-calling");

const keysDown = new Set();

const gameState = {
  scene: null,
  mel: {
    x: 260,
    y: 760,
    speed: 9,
    facing: "right"
  },
  running: false
};

async function loadScene(scenePath) {
  const response = await fetch(scenePath);
  if (!response.ok) {
    throw new Error(`Could not load scene data: ${scenePath}`);
  }

  const scene = await response.json();
  gameState.scene = scene;

  gameState.mel.x = scene.playerStart?.x ?? 260;
  gameState.mel.y = scene.playerStart?.y ?? 760;

  statusLocation.textContent = scene.name ?? "Unknown Location";
  statusCalling.textContent = `Calling: ${scene.calling ?? "No active Calling."}`;

  updateMelPosition();
}

function showGameScreen() {
  titleScreen.classList.add("hidden");
  gameScreen.classList.remove("hidden");
}

function updateMelPosition() {
  mel.style.left = `${(gameState.mel.x / 2400) * 100}%`;
  mel.style.top = `${(gameState.mel.y / 1080) * 100}%`;

  if (gameState.mel.facing === "left") {
    mel.style.transform = "translate(-50%, -100%) scaleX(-1)";
  } else {
    mel.style.transform = "translate(-50%, -100%) scaleX(1)";
  }
}

function clampMelToScene() {
  const bounds = gameState.scene?.walkBounds;
  if (!bounds) return;

  gameState.mel.x = Math.max(bounds.xMin, Math.min(bounds.xMax, gameState.mel.x));
  gameState.mel.y = Math.max(bounds.yMin, Math.min(bounds.yMax, gameState.mel.y));
}

function gameLoop() {
  if (gameState.running) {
    let moved = false;

    if (keysDown.has("ArrowLeft") || keysDown.has("a")) {
      gameState.mel.x -= gameState.mel.speed;
      gameState.mel.facing = "left";
      moved = true;
    }

    if (keysDown.has("ArrowRight") || keysDown.has("d")) {
      gameState.mel.x += gameState.mel.speed;
      gameState.mel.facing = "right";
      moved = true;
    }

    if (keysDown.has("ArrowUp") || keysDown.has("w")) {
      gameState.mel.y -= gameState.mel.speed;
      moved = true;
    }

    if (keysDown.has("ArrowDown") || keysDown.has("s")) {
      gameState.mel.y += gameState.mel.speed;
      moved = true;
    }

    if (moved) {
      clampMelToScene();
      updateMelPosition();
    }
  }

  requestAnimationFrame(gameLoop);
}

function pressVirtualControl(control) {
  if (control === "left") keysDown.add("ArrowLeft");
  if (control === "right") keysDown.add("ArrowRight");
  if (control === "up") keysDown.add("ArrowUp");
  if (control === "down") keysDown.add("ArrowDown");
}

function releaseVirtualControl(control) {
  if (control === "left") keysDown.delete("ArrowLeft");
  if (control === "right") keysDown.delete("ArrowRight");
  if (control === "up") keysDown.delete("ArrowUp");
  if (control === "down") keysDown.delete("ArrowDown");
}

playButton.addEventListener("click", async () => {
  showGameScreen();
  await loadScene("data/scenes/ch00_q00_forest_route.json");
  gameState.running = true;
});

window.addEventListener("keydown", (event) => {
  keysDown.add(event.key);

  if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(event.key)) {
    event.preventDefault();
  }
});

window.addEventListener("keyup", (event) => {
  keysDown.delete(event.key);
});

document.querySelectorAll("[data-control]").forEach((button) => {
  const control = button.dataset.control;

  button.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    pressVirtualControl(control);
  });

  button.addEventListener("pointerup", () => releaseVirtualControl(control));
  button.addEventListener("pointercancel", () => releaseVirtualControl(control));
  button.addEventListener("pointerleave", () => releaseVirtualControl(control));
});

gameLoop();
