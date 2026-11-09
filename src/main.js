const root = document.documentElement;
const themeBtn = document.getElementById("theme");
const themeLabel = themeBtn ? themeBtn.querySelector(".theme-label") : null;
const themeMeta = document.querySelector('meta[name="theme-color"]');
const mq = window.matchMedia("(prefers-color-scheme: dark)");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasIO = "IntersectionObserver" in window;

function syncTheme(theme) {
  root.dataset.theme = theme;
  if (themeBtn) {
    themeBtn.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  if (themeLabel) themeLabel.textContent = theme === "dark" ? "light" : "dark";
  if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#24221f" : "#f6f3ec");
}

syncTheme(root.dataset.theme === "dark" ? "dark" : "light");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    syncTheme(next);
    try { localStorage.setItem("theme-v2", next); } catch (e) {}
  });
}

if (mq.addEventListener) {
  mq.addEventListener("change", (event) => {
    let saved = null;
    try { saved = localStorage.getItem("theme-v2"); } catch (e) {}
    if (saved !== "light" && saved !== "dark") {
      syncTheme(event.matches ? "dark" : "light");
    }
  });
}

/* Reading progress ------------------------------------------------------- */
const bar = document.getElementById("progress");
let ticking = false;

function updateProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
  if (bar) bar.style.setProperty("--p", p.toFixed(4));
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateProgress);
  }
}, { passive: true });
window.addEventListener("resize", updateProgress);
updateProgress();

/* Section spy ------------------------------------------------------------ */
const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
const spyTargets = navLinks
  .map((a) => document.querySelector(a.getAttribute("href")))
  .filter(Boolean);

function setActive(id) {
  navLinks.forEach((a) => {
    if (a.getAttribute("href") === "#" + id) a.setAttribute("aria-current", "true");
    else a.removeAttribute("aria-current");
  });
}

if (spyTargets.length && hasIO) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: "-20% 0px -60% 0px", threshold: 0 });

  spyTargets.forEach((section) => spy.observe(section));

  window.addEventListener("scroll", () => {
    const atBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    if (atBottom && spyTargets.length) setActive(spyTargets[spyTargets.length - 1].id);
  }, { passive: true });
}

/* Reveal on scroll ------------------------------------------------------- */
const revealEls = Array.from(document.querySelectorAll(".reveal"));
if (revealEls.length && !reduce && hasIO) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("in"));
}

/* Self-typing terminals -------------------------------------------------- */
function typePre(pre) {
  const walker = document.createTreeWalker(pre, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);
  const full = nodes.map((n) => n.nodeValue);
  nodes.forEach((n) => (n.nodeValue = ""));
  const caret = document.createElement("span");
  caret.className = "caret";
  caret.textContent = "\u258d";
  pre.appendChild(caret);
  let ni = 0;
  let ci = 0;
  const step = () => {
    if (ni >= full.length) { caret.remove(); return; }
    const s = full[ni];
    if (ci >= s.length) { ni++; ci = 0; return step(); }
    nodes[ni].nodeValue = s.slice(0, ci + 1);
    ci++;
    setTimeout(step, 7);
  };
  step();
}

const terms = document.querySelectorAll(".term pre");
if (terms.length && !reduce && hasIO) {
  const termIO = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        termIO.unobserve(entry.target);
        typePre(entry.target);
      }
    });
  }, { threshold: 0.25 });
  terms.forEach((t) => termIO.observe(t));
}

/* Copy email to clipboard ------------------------------------------------ */
const toastEl = document.getElementById("toast");
let toastTimer = 0;

function say(text, bold) {
  if (!toastEl) return;
  toastEl.textContent = "";
  if (bold) {
    const b = document.createElement("b");
    b.textContent = bold;
    toastEl.appendChild(b);
    toastEl.appendChild(document.createTextNode(" " + text));
  } else {
    toastEl.textContent = text;
  }
  toastEl.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("on"), 2600);
}

document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const addr = a.getAttribute("href").slice(7);
    if (!navigator.clipboard || !navigator.clipboard.writeText) return;
    e.preventDefault();
    navigator.clipboard.writeText(addr).then(
      () => say("— no excuse now", "copied " + addr),
      () => { window.location.href = "mailto:" + addr; }
    );
  });
});

/* Shortcuts popover ------------------------------------------------------ */
const help = document.getElementById("help");
let helpReturnFocus = null;

function openHelp() {
  if (!help) return;
  helpReturnFocus = document.activeElement;
  help.classList.add("on");
  help.focus();
}

function closeHelp() {
  if (!help || !help.classList.contains("on")) return;
  help.classList.remove("on");
  if (helpReturnFocus && typeof helpReturnFocus.focus === "function") helpReturnFocus.focus();
  helpReturnFocus = null;
}

document.addEventListener("keydown", (e) => {
  const t = e.target;
  if (t && t.matches && t.matches("input, textarea, select, [contenteditable]")) return;
  if (e.key === "?") {
    e.preventDefault();
    if (help) { if (help.classList.contains("on")) closeHelp(); else openHelp(); }
  }
  if (e.key === "Escape") closeHelp();
});
if (help) help.addEventListener("click", () => closeHelp());

/* Live socket latency ---------------------------------------------------- */
const live = document.getElementById("live-lat");
if (live) {
  const tick = () => { live.textContent = (0.3 + Math.random() * 0.5).toFixed(1) + "ms"; };
  tick();
  if (!reduce) setInterval(tick, 2400);
}

/* Isometric agent stack -------------------------------------------------- */
const NS = "http://www.w3.org/2000/svg";
const iso = document.getElementById("iso");
if (iso) {
  const K = 52, CX = 320, TOP = 248;
  const px = (x, y, z) => [CX + (x - y) * K, TOP + (x + y) * K * 0.5 - z * K];
  const pts = (arr) => arr.map((p) => px(p[0], p[1], p[2]).join(",")).join(" ");
  const el = (name, attrs, parent) => {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    (parent || iso).appendChild(n);
    return n;
  };
  const box = (x, y, z, a, b, h, edge, o) => {
    const fy = z + h;
    // Stable hit area: a sibling group holding the block silhouette. It never
    // moves, so the hover lift on .iso-node cannot push the cursor off its own
    // edge and oscillate. .iso-node (visual) is pointer-events:none.
    const hit = el("g", { class: "iso-hit", tabindex: "0", role: "img", "aria-label": o.aria });
    el("polygon", { class: "hit", points: pts([[x, y, fy], [x + a, y, fy], [x + a, y, z], [x + a, y + b, z], [x, y + b, z], [x, y + b, fy]]) }, hit);
    const node = el("g", { class: "iso-node" }, iso);
    if (o.shadow) el("polygon", { class: "shadow", points: pts([[x - .22, y - .22, z - .28], [x + a + .22, y - .22, z - .28], [x + a + .22, y + b + .22, z - .28], [x - .22, y + b + .22, z - .28]]), opacity: ".5" }, node);
    el("polygon", { class: "side" + (edge ? " edge" : ""), points: pts([[x + a, y, z], [x + a, y + b, z], [x + a, y + b, fy], [x + a, y, fy]]) }, node);
    el("polygon", { class: "side" + (edge ? " edge" : ""), points: pts([[x, y + b, z], [x + a, y + b, z], [x + a, y + b, fy], [x, y + b, fy]]) }, node);
    el("polygon", { class: "top" + (edge ? " edge" : ""), points: pts([[x, y, fy], [x + a, y, fy], [x + a, y + b, fy], [x, y + b, fy]]) }, node);
    const c = px(x + a / 2, y + b / 2, fy);
    const t = el("text", { class: "lbl" + (edge ? " edge" : ""), x: c[0], y: c[1] + o.labelDy, "text-anchor": "middle" }, node);
    t.textContent = o.label;
    return hit;
  };
  const riser = (x, y, z0, z1) => el("path", { class: "riser", d: "M" + px(x, y, z0).join(" ") + " L" + px(x, y, z1).join(" ") });

  const nEng = box(0, 0, 0, 2, 2, .55, false, { label: "engineer", labelDy: 16, shadow: true, aria: "engineer — one engineer supervises the whole stack" });
  nEng.dataset.detail = "engineer — one engineer supervises the whole stack";
  riser(1, 1, .55, 2.3);
  const nCor = box(0, 0, 2.3, 2, 2, .5, true, { label: "cortex", labelDy: 4, aria: "cortex — one binary, one sqlite file, one private unix socket" });
  nCor.dataset.detail = "cortex — one binary, one sqlite file, one private unix socket";
  const cubes = [
    { x: 2.7, y: -1.0, label: "minions", detail: "minions — isolated sub-agents you can watch and halt" },
    { x: -1.0, y: 2.3, label: "quests", detail: "quests — a quest log that keeps long sessions honest" },
    { x: 0.8, y: -0.2, label: "burn", detail: "burn — live cost per agent thread, with budgets" },
  ];
  cubes.forEach((c) => riser(c.x + .6, c.y + .6, 2.8, 4.2));
  cubes.forEach((c) => {
    const g = box(c.x, c.y, 4.2, 1.2, 1.2, .4, false, { label: c.label, labelDy: -39, aria: c.detail });
    g.dataset.detail = c.detail;
  });

  const cap = document.getElementById("cap");
  const capDetail = document.getElementById("cap-detail");
  if (cap && capDetail) {
    iso.querySelectorAll(".iso-hit").forEach((n) => {
      const show = () => { capDetail.textContent = n.dataset.detail; cap.classList.add("on"); };
      const hide = () => { cap.classList.remove("on"); };
      n.addEventListener("mouseenter", show);
      n.addEventListener("mouseleave", hide);
      n.addEventListener("focus", show);
      n.addEventListener("blur", hide);
    });
  }
}

/* Scroll parallax + cardplane Z ------------------------------------------ */
const layers = document.querySelectorAll("[data-para]");
const planes = document.querySelectorAll(".cardplane");
let paraRaf = null;
function updateParallax() {
  paraRaf = null;
  if (reduce) return;
  const vh = window.innerHeight;
  layers.forEach((l) => {
    l.style.transform = "translate3d(0," + (-window.scrollY * parseFloat(l.dataset.para)) + "px,0)";
  });
  planes.forEach((p) => {
    const r = p.getBoundingClientRect();
    const centre = r.top + r.height / 2 - vh / 2;
    p.style.setProperty("--z", (-Math.abs(centre) / vh * parseFloat(p.dataset.z)).toFixed(2));
  });
}
if (!reduce) {
  window.addEventListener("scroll", () => { if (!paraRaf) paraRaf = requestAnimationFrame(updateParallax); }, { passive: true });
  window.addEventListener("resize", updateParallax);
  updateParallax();
}

/* Console easter egg ----------------------------------------------------- */
console.log(
  "%c production is boring. ",
  "background:#95bf47;color:#1b1917;font-weight:600;padding:3px 8px;border-radius:4px;font-family:monospace"
);
console.log(
  "%c Built by hand. No framework, no tracking. Press ? for shortcuts. ",
  "color:#66605a;font-family:monospace;font-size:11px"
);
