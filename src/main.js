import "./style.css";
import pkg from "../package.json";

const VERSION = pkg.version;

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

// ── Theme system ──

const THEME_KEY = "kdecosta-theme";

function getTheme() {
  return localStorage.getItem(THEME_KEY) || "dark";
}

function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_KEY, theme);
  updateThemeIcon(theme);
}

function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

function updateThemeIcon(theme) {
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const svg = btn.querySelector("svg");
  if (!svg) return;
  if (theme === "light") {
    // moon icon
    svg.innerHTML = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
  } else {
    // sun icon
    svg.innerHTML = '<path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-13a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V5a1 1 0 0 1 1-1zm0 16a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1zM5.64 6.05a1 1 0 0 1 1.41 0 1 1 0 0 1 0 1.41l-1.41 1.42a1 1 0 0 1-1.42-1.42l1.42-1.41zm12.72 0 1.42 1.41a1 1 0 0 1-1.42 1.42l-1.41-1.42a1 1 0 0 1 1.41-1.41zM4 12a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2H5a1 1 0 0 1-1-1zm15 0a1 1 0 0 1 1-1h2a1 1 0 0 1 0 2h-2a1 1 0 0 1-1-1z"/>';
  }
}

const COMMANDS = {
  help: {
    desc: "show available commands",
    run: () => [
      { text: "────────────────────────────────────────────", dim: true },
      { text: `  kdecosta-os v${VERSION}`, accent: true },
      { text: "────────────────────────────────────────────", dim: true },
      { text: "" },
      { text: "  help        show this list" },
      { text: "  mail        open email client" },
      { text: "  github      open github profile" },
      { text: "  linkedin    open linkedin profile" },
      { text: "  resume      open resume in new tab" },
      { text: "  reload      reload the page" },
      { text: "  clear       clear the terminal" },
      { text: "  echo        repeat what you say" },
      { text: "  date        show current date/time" },
      { text: "  exit        switch to modern profile view" },
      { text: "  mode        toggle light / dark theme" },
      { text: "" },
      { text: "────────────────────────────────────────────", dim: true },
      { text: "  tab completion supported", dim: true },
      { text: "────────────────────────────────────────────", dim: true },
    ],
  },
  mail: {
    desc: "open email client",
    run: () => {
      window.open("mailto:kalindu@kdecosta.com", "_blank");
      return [{ text: "opening mailto:kalindu@kdecosta.com ...", accent: true }];
    },
  },
  github: {
    desc: "open github profile",
    run: () => {
      window.open("https://github.com/kalindudc", "_blank");
      return [{ text: "opening github.com/kalindudc ...", accent: true }];
    },
  },
  linkedin: {
    desc: "open linkedin profile",
    run: () => {
      window.open("https://www.linkedin.com/in/kdecosta/", "_blank");
      return [{ text: "opening linkedin.com/in/kdecosta ...", accent: true }];
    },
  },
  resume: {
    desc: "open resume in new tab",
    run: () => {
      window.open("/media/kalindu_de_costa_resume.pdf", "_blank");
      return [{ text: "opening kalindu_de_costa_resume.pdf ...", accent: true }];
    },
  },
  reload: {
    desc: "reload the page",
    run: () => {
      setTimeout(() => location.reload(), 200);
      return [{ text: "reloading...", accent: true }];
    },
  },
  whoami: {
    desc: "show profile information",
    run: () => {
      showProfile();
      return [];
    },
  },
  clear: {
    desc: "clear the terminal",
    run: () => {
      clearOutput();
      showProfile();
      return [];
    },
  },
  echo: {
    desc: "repeat what you say",
    run: (args) => [{ text: args.join(" ") || "" }],
  },
  date: {
    desc: "show current date/time",
    run: () => [{ text: new Date().toString() }],
  },
  exit: {
    desc: "switch to modern profile view",
    run: () => {
      showModernView();
      return [];
    },
  },
  mode: {
    desc: "toggle light / dark theme",
    run: () => {
      const next = toggleTheme();
      return [
        { text: `switched to ${next} mode`, accent: true },
      ];
    },
  },
};

let commandHistory = [];
let historyIndex = -1;
let currentInput = "";
let cursorPos = 0;
let hintEl = null;

const outputEl = document.getElementById("output");
const inputTextEl = document.getElementById("input-text");
const promptDateEl = document.querySelector(".prompt-date");
const terminalBody = document.getElementById("terminal-body");

function setPromptDate() {
  const now = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;
  if (promptDateEl) promptDateEl.textContent = dateStr;
}

function print(lines) {
  if (!lines || lines.length === 0) return;
  lines.forEach((line) => {
    const div = document.createElement("div");
    div.className = "output-line";

    const content = document.createElement("span");
    content.className = "output-content";
    if (line.accent) content.classList.add("accent");
    if (line.dim) content.classList.add("dim");
    if (line.warn) content.classList.add("warn");
    if (line.name) content.classList.add("name");
    if (line.role) content.classList.add("role");
    content.textContent = line.text;
    div.appendChild(content);
    outputEl.appendChild(div);
  });
  scrollToBottom();
}

function printCommand(cmd) {
  const div = document.createElement("div");
  div.className = "output-line";
  div.style.opacity = "1";

  const prompt = document.createElement("span");
  prompt.className = "prompt";
  const dateSpan = document.createElement("span");
  dateSpan.className = "prompt-date";
  const dollarSpan = document.createElement("span");
  dollarSpan.className = "prompt-dollar";
  dollarSpan.textContent = "$";
  prompt.appendChild(dateSpan);
  prompt.appendChild(dollarSpan);

  const content = document.createElement("span");
  content.className = "output-content";
  content.textContent = cmd;

  div.appendChild(prompt);
  div.appendChild(content);
  outputEl.appendChild(div);
  scrollToBottom();
}

function clearOutput() {
  outputEl.innerHTML = "";
}

function scrollToBottom() {
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

function buildProfileHTML(mode) {
  const wrapper =
    mode === "modern" ? "profile profile--modern" : "profile profile--terminal";
  const br = mode === "terminal" ? "<br />" : "";
  return `
    <div class="${wrapper}">
      <div class="profile-avatar-wrap">
        <img src="/media/avatar.jpg" alt="Kalindu De Costa" class="profile-avatar" />
      </div>
      <span class="profile-name">KALINDU DE COSTA</span>
      <span class="profile-role">staff infrastructure engineer @ <a href="https://www.shopify.com" target="_blank" rel="noopener noreferrer" class="shopify-link">shopify</a></span>
      <div class="profile-links">
        <a href="mailto:kalindu@kdecosta.com" class="profile-link">email</a>
        <span class="profile-sep">·</span>
        <a href="https://github.com/kalindudc" target="_blank" rel="noopener noreferrer" class="profile-link">github</a>
        <span class="profile-sep">·</span>
        <a href="https://www.linkedin.com/in/kdecosta/" target="_blank" rel="noopener noreferrer" class="profile-link">linkedin</a>
        <span class="profile-sep">·</span>
        <a href="/media/kalindu_de_costa_resume.pdf" target="_blank" rel="noopener noreferrer" class="profile-link accent">resume</a>
      </div>
      ${br}
    </div>
  `;
}

function showProfile() {
  const div = document.createElement("div");
  div.innerHTML = buildProfileHTML("terminal");
  const profileDiv = div.firstElementChild;
  profileDiv.style.opacity = "0";
  profileDiv.style.animation = "fadeIn 0.3s ease forwards";
  outputEl.appendChild(profileDiv);
  scrollToBottom();
}

function initModernView() {
  const modernView = document.getElementById("modern-view");
  if (!modernView) return;
  const profileDiv = document.createElement("div");
  profileDiv.innerHTML = buildProfileHTML("modern");
  modernView.appendChild(profileDiv.firstElementChild);
}

function showModernView() {
  const terminalWrap = document.getElementById("terminal-wrap");
  const modernView = document.getElementById("modern-view");
  if (terminalWrap) terminalWrap.style.display = "none";
  if (modernView) modernView.style.display = "flex";
}

function executeCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  printCommand(trimmed);

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  if (COMMANDS[cmd]) {
    const result = COMMANDS[cmd].run(args);
    if (result && result.length > 0) print(result);
  } else {
    print([{ text: `command not found: ${cmd}`, warn: true }]);
    print([{ text: "type 'help' for available commands", dim: true }]);
  }
}

function updateInputDisplay() {
  inputTextEl.innerHTML = "";

  for (let i = 0; i < currentInput.length; i++) {
    const charSpan = document.createElement("span");
    charSpan.className = "char";
    if (i === cursorPos) {
      charSpan.classList.add("cursor");
    }
    charSpan.textContent = currentInput[i];
    inputTextEl.appendChild(charSpan);
  }

  if (cursorPos === currentInput.length) {
    const endCursor = document.createElement("span");
    endCursor.className = "cursor-end";
    inputTextEl.appendChild(endCursor);
  }
}

function removeHint() {
  if (hintEl && hintEl.parentNode) {
    hintEl.parentNode.removeChild(hintEl);
    hintEl = null;
  }
}

function showHints() {
  if (hintEl) return;
  const cmds = Object.keys(COMMANDS).join("  ");
  const div = document.createElement("div");
  div.className = "output-line";
  div.style.opacity = "1";
  const content = document.createElement("span");
  content.className = "output-content dim";
  content.textContent = cmds;
  div.appendChild(content);
  outputEl.appendChild(div);
  hintEl = div;
  scrollToBottom();
}

function autocomplete() {
  if (currentInput.trim() === "") {
    showHints();
    return;
  }

  const partial = currentInput.toLowerCase();
  const matches = Object.keys(COMMANDS).filter((c) => c.startsWith(partial));

  if (matches.length === 1) {
    currentInput = matches[0];
    cursorPos = currentInput.length;
    removeHint();
    updateInputDisplay();
  } else if (matches.length > 1) {
    removeHint();
    const div = document.createElement("div");
    div.className = "output-line";
    div.style.opacity = "1";
    const content = document.createElement("span");
    content.className = "output-content dim";
    content.textContent = matches.join("  ");
    div.appendChild(content);
    outputEl.appendChild(div);
    hintEl = div;
    scrollToBottom();
  }
}

function bootSequence() {
  const lines = [
    { text: `kdecosta-os v${VERSION} — initialized`, dim: true },
    { text: "loading modules ...", dim: true },
    { text: "mounting filesystem ...", dim: true },
    { text: " " },
  ];

  setPromptDate();

  if (prefersReducedMotion) {
    print(lines);
    showProfile();
    updateInputDisplay();
    return;
  }

  let i = 0;
  function next() {
    if (i >= lines.length) {
      showProfile();
      updateInputDisplay();
      return;
    }
    print([lines[i]]);
    i++;
    setTimeout(next, 70);
  }
  next();
}

// ── Event listeners ──

document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    if (currentInput.trim()) {
      commandHistory.push(currentInput);
      historyIndex = commandHistory.length;
    }
    executeCommand(currentInput);
    currentInput = "";
    cursorPos = 0;
    removeHint();
    updateInputDisplay();
  } else if (e.key === "Backspace") {
    e.preventDefault();
    if (cursorPos > 0) {
      currentInput = currentInput.slice(0, cursorPos - 1) + currentInput.slice(cursorPos);
      cursorPos--;
      updateInputDisplay();
    }
  } else if (e.key === "Delete") {
    e.preventDefault();
    if (cursorPos < currentInput.length) {
      currentInput = currentInput.slice(0, cursorPos) + currentInput.slice(cursorPos + 1);
      updateInputDisplay();
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (cursorPos > 0) {
      cursorPos--;
      updateInputDisplay();
    }
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    if (cursorPos < currentInput.length) {
      cursorPos++;
      updateInputDisplay();
    }
  } else if (e.key === "Home") {
    e.preventDefault();
    cursorPos = 0;
    updateInputDisplay();
  } else if (e.key === "End") {
    e.preventDefault();
    cursorPos = currentInput.length;
    updateInputDisplay();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      currentInput = commandHistory[historyIndex];
      cursorPos = currentInput.length;
      updateInputDisplay();
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      currentInput = commandHistory[historyIndex];
      cursorPos = currentInput.length;
      updateInputDisplay();
    } else {
      historyIndex = commandHistory.length;
      currentInput = "";
      cursorPos = 0;
      updateInputDisplay();
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    autocomplete();
  } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    currentInput = currentInput.slice(0, cursorPos) + e.key + currentInput.slice(cursorPos);
    cursorPos++;
    updateInputDisplay();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  setTheme(getTheme());
  initModernView();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => toggleTheme());
  }

  bootSequence();
});
