import { Input } from "./Input";
import { Player } from "./Player";

export class Scene {
  readonly element: HTMLDivElement;
  private player: Player | null = null;

  constructor(private frame: HTMLElement) {
    this.element = document.createElement("div");
    this.element.className = "play-screen hidden";
    this.element.innerHTML = `
      <div class="scene-background" aria-hidden="true"></div>
      <div class="scene-vignette" aria-hidden="true"></div>
      <div class="hud">
        <div class="hud-panel hearts" aria-label="Life Force"><span class="heart">♥</span><span class="heart">♥</span><span class="heart">♥</span><span class="heart">♥</span><span class="heart">♥</span></div>
        <div class="hud-panel status-box"><div class="status-title">Silva Tenebrosa</div><div class="status-line">Quest 0.0 — Follow the forest path</div></div>
        <div class="hud-panel active-item"><div class="active-item-label">Empty Hands</div><div class="active-item-name">No item selected</div></div>
      </div>
      <div class="dev-note">Test build: use Arrow Keys or WASD to move Mel. On-screen buttons also respond.</div>
      <div class="controls" aria-label="On-screen controller">
        <div class="dpad"><button class="control-button dpad-up" data-control="up">▲</button><button class="control-button dpad-left" data-control="left">◀</button><div class="dpad-center"></div><button class="control-button dpad-right" data-control="right">▶</button><button class="control-button dpad-down" data-control="down">▼</button></div>
        <div class="center-pad"><button class="control-button" data-control="select">Select</button><button class="control-button" data-control="start">Start</button></div>
        <div class="action-pad"><button class="control-button button-x" data-control="x">X</button><button class="control-button button-y" data-control="y">Y</button><button class="control-button button-b" data-control="b">B</button><button class="control-button button-a" data-control="a">A</button></div>
      </div>
    `;
    this.frame.appendChild(this.element);
  }

  show(): void {
    this.element.classList.remove("hidden");
    if (!this.player) this.player = new Player(this.element);
  }

  hide(): void { this.element.classList.add("hidden"); }
  update(deltaSeconds: number, input: Input): void { this.player?.update(deltaSeconds, input); }
}
