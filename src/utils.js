export const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

export function rand(min, max) {
  return Math.random() * (max - min) + min;
}

export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function charDelay(speed = 1) {
  const r = Math.random();
  let d;
  if (r < 0.02) d = randInt(20, 35);
  else if (r < 0.10) d = randInt(2, 6);
  else d = randInt(5, 10);
  return Math.max(0, Math.floor(d * speed));
}

export function lineDelay(speed = 1) {
  return Math.max(0, Math.floor(randInt(4, 12) * speed));
}
