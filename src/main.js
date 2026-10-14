const KEY = "theme-v2";
const btn = document.getElementById("theme");
const root = document.documentElement;

const sync = () => {
  btn.textContent = root.dataset.theme === "dark" ? "light" : "dark";
};

btn.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  try { localStorage.setItem(KEY, root.dataset.theme); } catch {}
  sync();
});

sync();
