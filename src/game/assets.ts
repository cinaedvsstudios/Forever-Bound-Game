export const ASSETS = {
  branding: {
    studioLogo: "/assets/branding/cinaedvus_studios_logo.png",
    foreverBoundLogo: "/assets/branding/forever_bound_logo.png"
  },
  scenes: {
    forestRoute: "/assets/scenes/ch00/ch00_q00_forest_route_bg1.png"
  },
  mel: {
    front: "/assets/characters/mel/mel_idle_front.png",
    back: "/assets/characters/mel/mel_idle_back.png",
    left: "/assets/characters/mel/mel_idle_left.png",
    right: "/assets/characters/mel/mel_idle_right.png"
  }
} as const;

export function testImage(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}
