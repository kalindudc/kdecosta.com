import "./style.css";
import pkg from "../package.json";

import { prefersReducedMotion, randInt } from "./utils.js";
import { getTheme, setTheme, toggleTheme } from "./theme.js";
import { createCommands } from "./commands.js";
import {
  getIsTyping,
  setIsTyping,
  typeLines,
  typeCommand,
  printInstant,
  clearOutput,
  showModernView,
  updateInputDisplay,
  setPromptDate,
  initModernView,
} from "./terminal.js";
import { getTerminalProfileEntries } from "./profile.js";

const VERSION = pkg.version;
const VIEW_KEY = "kdecosta-view";

// ── View state ──
function getSavedView() {
  return localStorage.getItem(VIEW_KEY) || "terminal";
}

function setSavedView(view) {
  localStorage.setItem(VIEW_KEY, view);
}

let hasBooted = false;

function showTerminalView() {
  const terminalWrap = document.getElementById("terminal-wrap");
  const modernView = document.getElementById("modern-view");
  if (terminalWrap) terminalWrap.style.display = "block";
  if (modernView) modernView.style.display = "none";
  setSavedView("terminal");

  if (!hasBooted) {
    bootSequence();
    hasBooted = true;
  }
}

function applyView(view) {
  if (view === "modern") {
    showModernView();
  } else {
    showTerminalView();
  }
}

function toggleView() {
  const terminalWrap = document.getElementById("terminal-wrap");
  const isTerminal = terminalWrap && terminalWrap.style.display !== "none";
  if (isTerminal) {
    showModernView();
    setSavedView("modern");
  } else {
    showTerminalView();
  }
}

// ── Input state ──
let commandHistory = [];
let historyIndex = -1;
let currentInput = "";
let cursorPos = 0;
let hintEl = null;

// ── Command registry ──
const ctx = {
  version: VERSION,
  clearOutput,
  showModernView,
  toggleTheme,
  setSavedView,
};
const COMMANDS = createCommands(ctx);

// ── Execute ──
function executeCommand(raw) {
  const trimmed = raw.trim();
  if (!trimmed) return;

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);

  typeCommand(trimmed, () => {
    if (COMMANDS[cmd]) {
      const result = COMMANDS[cmd].run(args);
      if (result && result.length > 0) {
        typeLines(result);
      } else {
        setIsTyping(false);
      }
    } else {
      typeLines([
        { text: `kdecosta-os: ${cmd}: command not found`, warn: true },
        { text: "type 'help' for available commands", dim: true },
      ]);
    }
  }, true);
}

// ── Autocomplete ──
function removeHint() {
  if (hintEl && hintEl.parentNode) {
    hintEl.parentNode.removeChild(hintEl);
    hintEl = null;
  }
}

function showHints() {
  if (hintEl) return;
  const cmds = Object.keys(COMMANDS).join("  ");
  typeLines([{ text: cmds, dim: true }], () => {
    const lines = document.querySelectorAll(".output-line");
    if (lines.length > 0) hintEl = lines[lines.length - 1];
  });
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
    updateInputDisplay(currentInput, cursorPos);
  } else if (matches.length > 1) {
    removeHint();
    typeLines([{ text: matches.join("  "), dim: true }], () => {
      const lines = document.querySelectorAll(".output-line");
      if (lines.length > 0) hintEl = lines[lines.length - 1];
    });
  }
}

// ── Boot ──
function bootSequence() {
  const lines = [
    { text: `kdecosta-os v${VERSION} — initialized`, dim: true },
    { text: "loading modules ...", dim: true },
    { text: "mounting filesystem ...", dim: true },
    { text: " ", skipType: true },
  ];

  setPromptDate();

  function showHelpHint() {
    const hintLines = [{ text: "type 'help' for usage", dim: true }];
    if (prefersReducedMotion) {
      printInstant(hintLines);
      const lines = document.querySelectorAll(".output-line");
      if (lines.length > 0) hintEl = lines[lines.length - 1];
      return;
    }
    typeLines(hintLines, () => {
      const lines = document.querySelectorAll(".output-line");
      if (lines.length > 0) hintEl = lines[lines.length - 1];
    });
  }

  if (prefersReducedMotion) {
    printInstant(lines);
    printInstant(getTerminalProfileEntries());
    updateInputDisplay(currentInput, cursorPos);
    showHelpHint();
    return;
  }

  typeLines(lines, () => {
    setTimeout(() => {
      typeLines(getTerminalProfileEntries(), () => {
        updateInputDisplay(currentInput, cursorPos);
        showHelpHint();
      });
    }, randInt(100, 200));
  });
}

// ── Keyboard ──
document.addEventListener("keydown", (e) => {
  // `/` from modern view → terminal
  if (e.key === "/") {
    const modernView = document.getElementById("modern-view");
    if (modernView && modernView.style.display === "flex") {
      e.preventDefault();
      showTerminalView();
      return;
    }
  }

  // Ignore all other keys when terminal is hidden (modern view active)
  const terminalWrap = document.getElementById("terminal-wrap");
  if (terminalWrap && terminalWrap.style.display === "none") {
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    if (getIsTyping()) return;
    if (currentInput.trim()) {
      commandHistory.push(currentInput);
      historyIndex = commandHistory.length;
    }
    executeCommand(currentInput);
    currentInput = "";
    cursorPos = 0;
    removeHint();
    updateInputDisplay(currentInput, cursorPos);
  } else if (e.key === "Backspace") {
    e.preventDefault();
    if (cursorPos > 0) {
      currentInput = currentInput.slice(0, cursorPos - 1) + currentInput.slice(cursorPos);
      cursorPos--;
      updateInputDisplay(currentInput, cursorPos);
    }
  } else if (e.key === "Delete") {
    e.preventDefault();
    if (cursorPos < currentInput.length) {
      currentInput = currentInput.slice(0, cursorPos) + currentInput.slice(cursorPos + 1);
      updateInputDisplay(currentInput, cursorPos);
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    if (cursorPos > 0) {
      cursorPos--;
      updateInputDisplay(currentInput, cursorPos);
    }
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    if (cursorPos < currentInput.length) {
      cursorPos++;
      updateInputDisplay(currentInput, cursorPos);
    }
  } else if (e.key === "Home") {
    e.preventDefault();
    cursorPos = 0;
    updateInputDisplay(currentInput, cursorPos);
  } else if (e.key === "End") {
    e.preventDefault();
    cursorPos = currentInput.length;
    updateInputDisplay(currentInput, cursorPos);
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      currentInput = commandHistory[historyIndex];
      cursorPos = currentInput.length;
      updateInputDisplay(currentInput, cursorPos);
    }
  } else if (e.key === "ArrowDown") {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      currentInput = commandHistory[historyIndex];
      cursorPos = currentInput.length;
      updateInputDisplay(currentInput, cursorPos);
    } else {
      historyIndex = commandHistory.length;
      currentInput = "";
      cursorPos = 0;
      updateInputDisplay(currentInput, cursorPos);
    }
  } else if (e.key === "Tab") {
    e.preventDefault();
    if (getIsTyping()) return;
    autocomplete();
  } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    e.preventDefault();
    currentInput = currentInput.slice(0, cursorPos) + e.key + currentInput.slice(cursorPos);
    cursorPos++;
    updateInputDisplay(currentInput, cursorPos);
  }
});

// ── Init ──
document.addEventListener("DOMContentLoaded", () => {
  setTheme(getTheme());
  initModernView();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => toggleTheme());
  }

  const viewBtn = document.getElementById("view-toggle");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => toggleView());
  }

  // Apply saved view (default terminal)
  // showTerminalView() will lazy-boot if terminal is chosen
  applyView(getSavedView());
});
