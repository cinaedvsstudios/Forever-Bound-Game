import { Input } from "./Input";
import { Scene } from "./Scene";
import { ASSETS, testImage } from "./assets";

type GameState = "title" | "playing";

export class Game {
  private frame!: HTMLDivElement;
  private titleScreen!: HTMLDivElement;
  private scene!: Scene;
  private input!: Input;
  private state: GameState = "title";
  private lastTime = 0;
  private animationFrameId = 0;

  constructor(private app: HTMLDivElement) {}

  start(): void {
    this.app.innerHTML = `<main class="game-shell"><section class="game-frame" aria-label="Forever Bound Game"></section></main>`;
    const frame = this.app.querySelector<HTMLDivElement>(".game-frame");
    if (!frame) throw new Error("Could not create game frame.");
    this.frame = frame;
    this.createTitleScreen();
    this.scene = new Scene(this.frame);
    this.input = new Input(this.frame);
    this.showTitle();
    this.lastTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  private createTitleScreen(): void {
    this.titleScreen = document.createElement("div");
    this.titleScreen.className = "title-screen";
    this.titleScreen.innerHTML = `
      <div class="title-fallback-bg"></div>
      <div class="title-content">
        <div class="studio-mark"><img src="${ASSETS.branding.studioLogo}" alt="CINAEDVUS Studios" /><span>CINAEDVUS Studios</span></div>
        <div class="logo-stack"><img class="main-logo" src="${ASSETS.branding.foreverBoundLogo}" alt="Forever Bound" /><h1 class="fallback-logo hidden">Forever Bound</h1><div class="subtitle">A lightweight browser-based 2D companion game.</div></div>
        <div class="title-buttons"><button class="fb-button" data-action="start">Start Game</button><button class="fb-button" data-action="continue">Continue</button><button class="fb-button" data-action="options">Options</button></div>
      </div>
    `;
    this.frame.appendChild(this.titleScreen);
    this.titleScreen.querySelector<HTMLButtonElement>('[data-action="start"]')?.addEventListener("click", () => this.startGame());
    this.titleScreen.querySelector<HTMLButtonElement>('[data-action="continue"]')?.addEventListener("click", () => this.startGame());
    this.titleScreen.querySelector<HTMLButtonElement>('[data-action="options"]')?.addEventListener("click", () => window.alert("Options screen placeholder. This will become Settings later."));
    this.handleMissingLogoFallback();
  }

  private async handleMissingLogoFallback(): Promise<void> {
    const logoWorks = await testImage(ASSETS.branding.foreverBoundLogo);
    const logo = this.titleScreen.querySelector<HTMLImageElement>(".main-logo");
    const fallback = this.titleScreen.querySelector<HTMLElement>(".fallback-logo");
    if (!logoWorks) { logo?.classList.add("hidden"); fallback?.classList.remove("hidden"); }
  }

  private showTitle(): void { this.titleScreen.classList.remove("hidden"); this.scene.hide(); }
  private startGame(): void { this.state = "playing"; this.titleScreen.classList.add("hidden"); this.scene.show(); }

  private loop = (time: number): void => {
    const deltaSeconds = Math.min((time - this.lastTime) / 1000, 0.05);
    this.lastTime = time;
    if (this.state === "playing") this.scene.update(deltaSeconds, this.input);
    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  destroy(): void { cancelAnimationFrame(this.animationFrameId); this.input?.destroy(); }
}
