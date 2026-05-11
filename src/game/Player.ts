import { ASSETS } from "./assets";
import type { Input } from "./Input";

type Facing = "front" | "back" | "left" | "right";

export class Player {
  readonly element: HTMLDivElement;
  private x = 50;
  private y = 77;
  private facing: Facing = "right";
  private readonly speed = 22;

  constructor(private sceneElement: HTMLElement) {
    this.element = document.createElement("div");
    this.element.className = "player";
    this.element.style.setProperty("--player-width", "8.2%");
    this.element.style.setProperty("--player-height", "36%");
    this.sceneElement.appendChild(this.element);
    this.render();
  }

  update(deltaSeconds: number, input: Input): void {
    let dx = 0; let dy = 0;
    if (input.isDown("left")) dx -= 1;
    if (input.isDown("right")) dx += 1;
    if (input.isDown("up")) dy -= 1;
    if (input.isDown("down")) dy += 1;
    if (dx !== 0 && dy !== 0) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }

    this.x = clamp(this.x + dx * this.speed * deltaSeconds, 7, 93);
    this.y = clamp(this.y + dy * this.speed * deltaSeconds, 58, 86);

    if (Math.abs(dx) > Math.abs(dy)) this.facing = dx < 0 ? "left" : "right";
    else if (dy !== 0) this.facing = dy < 0 ? "back" : "front";
    this.render();
  }

  private render(): void {
    this.element.style.left = `${this.x}%`;
    this.element.style.top = `${this.y}%`;
    this.element.style.backgroundImage = `url("${this.getSprite()}")`;
  }

  private getSprite(): string {
    if (this.facing === "front") return ASSETS.mel.front;
    if (this.facing === "back") return ASSETS.mel.back;
    if (this.facing === "left") return ASSETS.mel.left;
    return ASSETS.mel.right;
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
