export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function charDelay() {
  const r = Math.random();
  if (r < 0.02) return randInt(20, 35);    // rare micro-pause
  if (r < 0.10) return randInt(2, 6);      // occasional burst
  return randInt(5, 10);                    // snappy normal speed
}

export function lineDelay() {
  return randInt(4, 12);
}
