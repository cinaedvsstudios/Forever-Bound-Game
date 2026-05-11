const ASSETS = {
  studioLogo: "./assets/branding/cinaedvus_studios_logo.png",
  foreverBoundLogo: "./assets/branding/forever_bound_logo.png",
  forestBackground: "./assets/scenes/ch00/ch00_q00_forest_route_bg1.png",
  mel: {
    front: "./assets/characters/mel/mel_idle_front.png",
    back: "./assets/characters/mel/mel_idle_back.png",
    left: "./assets/characters/mel/mel_idle_left.png",
    right: "./assets/characters/mel/mel_idle_right.png"
  }
};

const app = document.querySelector("#app");

let state = "title";
let keys = {
  up: false,
  down: false,
  left: false,
  right: false
};

let mel = {
  x: 50,
  y: 77,
  facing: "right",
  speed: 22
};

let lastTime = performance.now();
let playerElement = null;

function createGame() {
  app.innerHTML = `
    <main class="game-shell">
      <section class="game-frame">
        <section class="title-screen">
          <div class="title-content">
            <div class="studio-mark">
              <img src="${ASSETS.studioLogo}" alt="CINAEDVUS Studios" />
              <span>CINAEDVUS Studios</span>
            </div>

            <div class="logo-stack">
              <img class="main-logo" src="${ASSETS.foreverBoundLogo}" alt="Forever Bound" />
              <h1 class="fallback-logo">Forever Bound</h1>
              <p>A lightweight browser-based 2D companion game.</p>
            </div>

            <div class="title-buttons">
              <button class="fb-button" id="start-game">Start Game</button>
              <button class="fb-button" type="button">Continue</button>
              <button class="fb-button" type="button">Options</button>
            </div>
          </div>
        </section>

        <section class="play-screen hidden">
          <div class="scene-background"></div>
          <div class="scene-vignette"></div>

          <div class="hud">
            <div class="hud-panel hearts">
              <span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span>
            </div>

            <div class="hud-panel status-box">
              <div class="status-title">Silva Tenebrosa</div>
              <div class="status-line">Quest 0.0 — Follow the forest path</div>
            </div>

            <div class="hud-panel active-item">
              <div class="active-item-label">Empty Hands</div>
              <div class="active-item-name">No item selected</div>
            </div>
          </div>

          <div class="player"></div>

          <div class="dev-note">Test build: use Arrow Keys or WASD to move Mel.</div>

          <div class="controls">
            <div class="dpad">
              <button class="control-button dpad-up" data-control="up">▲</button>
              <button class="control-button dpad-left" data-control="left">◀</button>
              <div class="dpad-center"></div>
              <button class="control-button dpad-right" data-control="right">▶</button>
              <button class="control-button dpad-down" data-control="down">▼</button>
            </div>

            <div class="center-pad">
              <button class="control-button">Select</button>
              <button class="control-button">Start</button>
            </div>

            <div class="action-pad">
              <button class="control-button button-x">X</button>
              <button class="control-button button-y">Y</button>
              <button class="control-button button-b">B</button>
              <button class="control-button button-a">A</button>
            </div>
          </div>
        </section>
      </section>
    </main>
  `;

  document.querySelector(".scene-background").style.backgroundImage = `url("${ASSETS.forestBackground}")`;
  playerElement = document.querySelector(".player");

  document.querySelector("#start-game").addEventListener("click", startGame);
  bindControls();
  renderMel();
  requestAnimationFrame(loop);
}

function startGame() {
  state = "playing";
  document.querySelector(".title-screen").classList.add("hidden");
  document.querySelector(".play-screen").classList.remove("hidden");
}

function bindControls() {
  window.addEventListener("keydown", (event) => {
    const direction = keyToDirection(event.key);
    if (direction) {
      event.preventDefault();
      keys[direction] = true;
      setButtonVisual(direction, true);
    }
  });

  window.addEventListener("keyup", (event) => {
    const direction = keyToDirection(event.key);
    if (direction) {
      event.preventDefault();
      keys[direction] = false;
      setButtonVisual(direction, false);
    }
  });

  document.querySelectorAll("[data-control]").forEach((button) => {
    const direction = button.dataset.control;

    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      keys[direction] = true;
      setButtonVisual(direction, true);
    });

    button.addEventListener("pointerup", (event) => {
      event.preventDefault();
      keys[direction] = false;
      setButtonVisual(direction, false);
    });

    button.addEventListener("pointerleave", () => {
      keys[direction] = false;
      setButtonVisual(direction, false);
    });
  });
}

function keyToDirection(key) {
  if (key === "ArrowUp" || key.toLowerCase() === "w") return "up";
  if (key === "ArrowDown" || key.toLowerCase() === "s") return "down";
  if (key === "ArrowLeft" || key.toLowerCase() === "a") return "left";
  if (key === "ArrowRight" || key.toLowerCase() === "d") return "right";
  return null;
}

function setButtonVisual(direction, pressed) {
  document.querySelectorAll(`[data-control="${direction}"]`).forEach((button) => {
    button.classList.toggle("is-pressed", pressed);
  });
}

function loop(time) {
  const deltaSeconds = Math.min((time - lastTime) / 1000, 0.05);
  lastTime = time;

  if (state === "playing") {
    updateMel(deltaSeconds);
  }

  requestAnimationFrame(loop);
}

function updateMel(deltaSeconds) {
  let dx = 0;
  let dy = 0;

  if (keys.left) dx -= 1;
  if (keys.right) dx += 1;
  if (keys.up) dy -= 1;
  if (keys.down) dy += 1;

  if (dx !== 0 && dy !== 0) {
    dx *= Math.SQRT1_2;
    dy *= Math.SQRT1_2;
  }

  mel.x += dx * mel.speed * deltaSeconds;
  mel.y += dy * mel.speed * deltaSeconds;

  mel.x = clamp(mel.x, 7, 93);
  mel.y = clamp(mel.y, 58, 86);

  if (Math.abs(dx) > Math.abs(dy)) {
    mel.facing = dx < 0 ? "left" : "right";
  } else if (dy !== 0) {
    mel.facing = dy < 0 ? "back" : "front";
  }

  renderMel();
}

function renderMel() {
  const sprite = ASSETS.mel[mel.facing];
  playerElement.style.left = `${mel.x}%`;
  playerElement.style.top = `${mel.y}%`;
  playerElement.style.backgroundImage = `url("${sprite}")`;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

createGame();
