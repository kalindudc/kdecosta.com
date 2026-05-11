import { buildProfileHTML } from "./profile.js";
import { prefersReducedMotion, charDelay, lineDelay } from "./utils.js";

const outputEl = document.getElementById("output");
const inputTextEl = document.getElementById("input-text");
const promptDateEl = document.querySelector(".prompt-date");
const terminalBody = document.getElementById("terminal-body");

let isTyping = false;
export const getIsTyping = () => isTyping;
export const setIsTyping = (v) => { isTyping = v; };

export function typeTextInto(element, text, onDone, speed = 1) {
  let i = 0;
  element.textContent = "";
  function next() {
    if (i >= text.length) {
      if (onDone) onDone();
      return;
    }
    element.textContent += text[i];
    i++;
    scrollToBottom();
    setTimeout(next, charDelay(speed));
  }
  next();
}

export function typeLine(line, onDone) {
  const div = document.createElement("div");
  div.className = "output-line";

  const content = document.createElement("span");
  content.className = "output-content";
  if (line.accent) content.classList.add("accent");
  if (line.dim) content.classList.add("dim");
  if (line.warn) content.classList.add("warn");

  div.appendChild(content);
  outputEl.appendChild(div);

  const speed = line.speed || 1;

  // Blank line separator — render as visible empty line
  if (!line.text && !line.html) {
    content.innerHTML = "<br/>";
    scrollToBottom();
    if (onDone) onDone();
    return;
  }

  if (prefersReducedMotion || line.instant || line.skipType) {
    if (line.html) {
      content.innerHTML = line.html;
    } else {
      content.textContent = line.text;
    }
    scrollToBottom();
    if (onDone) onDone();
    return;
  }

  typeTextInto(content, line.text || "", onDone, speed);
}

export function typeLines(lines, onDone) {
  if (!lines || lines.length === 0) {
    if (onDone) onDone();
    return;
  }
  isTyping = true;
  let i = 0;
  function next() {
    if (i >= lines.length) {
      isTyping = false;
      if (onDone) onDone();
      return;
    }
    const speed = lines[i].speed || 1;
    typeLine(lines[i], () => {
      i++;
      setTimeout(next, lineDelay(speed));
    });
  }
  next();
}

export function typeCommand(cmd, onDone, keepState = false) {
  isTyping = true;
  const div = document.createElement("div");
  div.className = "output-line";

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

  div.appendChild(prompt);
  div.appendChild(content);
  outputEl.appendChild(div);

  if (prefersReducedMotion) {
    content.textContent = cmd;
    scrollToBottom();
    if (!keepState) isTyping = false;
    if (onDone) onDone();
    return;
  }

  typeTextInto(content, cmd, () => {
    if (!keepState) isTyping = false;
    if (onDone) onDone();
  });
}

export function printInstant(lines) {
  if (!lines || lines.length === 0) return;
  lines.forEach((line) => {
    const div = document.createElement("div");
    div.className = "output-line";
    div.style.opacity = "1";
    const content = document.createElement("span");
    content.className = "output-content";
    if (line.accent) content.classList.add("accent");
    if (line.dim) content.classList.add("dim");
    if (line.warn) content.classList.add("warn");
    if (line.html) {
      content.innerHTML = line.html;
    } else {
      content.textContent = line.text || "";
    }
    div.appendChild(content);
    outputEl.appendChild(div);
  });
  scrollToBottom();
}

export function clearOutput() {
  outputEl.innerHTML = "";
}

export function scrollToBottom() {
  terminalBody.scrollTop = terminalBody.scrollHeight;
}

export function updateInputDisplay(text, pos) {
  inputTextEl.innerHTML = "";

  for (let i = 0; i < text.length; i++) {
    const charSpan = document.createElement("span");
    charSpan.className = "char";
    if (i === pos) charSpan.classList.add("cursor");
    charSpan.textContent = text[i];
    inputTextEl.appendChild(charSpan);
  }

  if (pos === text.length) {
    const endCursor = document.createElement("span");
    endCursor.className = "cursor-end";
    inputTextEl.appendChild(endCursor);
  }
}

export function setPromptDate() {
  const now = new Date();
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const dateStr = `${months[now.getMonth()]} ${now.getDate()}`;
  if (promptDateEl) promptDateEl.textContent = dateStr;
}

export function initModernView() {
  const modernView = document.getElementById("modern-view");
  if (!modernView) return;
  const profileDiv = document.createElement("div");
  profileDiv.innerHTML = buildProfileHTML("modern");
  modernView.appendChild(profileDiv.firstElementChild);
}

export function showModernView() {
  const terminalWrap = document.getElementById("terminal-wrap");
  const modernView = document.getElementById("modern-view");
  if (terminalWrap) terminalWrap.style.display = "none";
  if (modernView) modernView.style.display = "flex";
}
