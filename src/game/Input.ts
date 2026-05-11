export type Direction = "up" | "down" | "left" | "right";

type ButtonState = Record<Direction, boolean>;

const keyDirectionMap: Record<string, Direction> = {
  ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
  w: "up", W: "up", s: "down", S: "down", a: "left", A: "left", d: "right", D: "right"
};

export class Input {
  private directions: ButtonState = { up: false, down: false, left: false, right: false };
  private pressedButtons = new Set<string>();

  constructor(private root: HTMLElement) {
    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
    this.bindTouchButtons();
  }

  destroy(): void {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);
  }

  isDown(direction: Direction): boolean { return this.directions[direction]; }
  isButtonDown(button: string): boolean { return this.pressedButtons.has(button); }

  private handleKeyDown = (event: KeyboardEvent): void => {
    const direction = keyDirectionMap[event.key];
    if (direction) {
      event.preventDefault(); this.directions[direction] = true; this.setVisualPressed(direction, true); return;
    }
    const button = this.mapKeyToButton(event.key);
    if (button) { event.preventDefault(); this.pressedButtons.add(button); this.setVisualPressed(button, true); }
  };

  private handleKeyUp = (event: KeyboardEvent): void => {
    const direction = keyDirectionMap[event.key];
    if (direction) {
      event.preventDefault(); this.directions[direction] = false; this.setVisualPressed(direction, false); return;
    }
    const button = this.mapKeyToButton(event.key);
    if (button) { event.preventDefault(); this.pressedButtons.delete(button); this.setVisualPressed(button, false); }
  };

  private mapKeyToButton(key: string): string | null {
    const normalized = key.toLowerCase();
    if (normalized === "e" || normalized === "x") return "b";
    if (normalized === " " || normalized === "z") return "a";
    if (normalized === "q" || normalized === "c") return "x";
    if (normalized === "r" || normalized === "v") return "y";
    if (normalized === "tab") return "select";
    if (normalized === "enter" || normalized === "escape") return "start";
    return null;
  }

  private bindTouchButtons(): void {
    const controls = this.root.querySelectorAll<HTMLElement>("[data-control]");
    controls.forEach((control) => {
      const value = control.dataset.control; if (!value) return;
      const start = (event: Event): void => { event.preventDefault(); this.applyControl(value, true); };
      const end = (event: Event): void => { event.preventDefault(); this.applyControl(value, false); };
      control.addEventListener("pointerdown", start);
      control.addEventListener("pointerup", end);
      control.addEventListener("pointercancel", end);
      control.addEventListener("pointerleave", end);
    });
  }

  private applyControl(value: string, isPressed: boolean): void {
    if (value === "up" || value === "down" || value === "left" || value === "right") {
      this.directions[value] = isPressed; this.setVisualPressed(value, isPressed); return;
    }
    if (isPressed) this.pressedButtons.add(value); else this.pressedButtons.delete(value);
    this.setVisualPressed(value, isPressed);
  }

  private setVisualPressed(value: string, isPressed: boolean): void {
    const elements = this.root.querySelectorAll<HTMLElement>(`[data-control="${value}"]`);
    elements.forEach((element) => element.classList.toggle("is-pressed", isPressed));
  }
}
