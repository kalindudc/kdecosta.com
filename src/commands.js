import { getTerminalProfileEntries } from "./profile.js";

const GROUP_ORDER = ["navigation", "profile", "tools", "ui"];

export function createCommands(ctx) {
  const commands = {
    help: {
      group: "tools",
      desc: "show available commands",
      run: () => generateHelp(commands, ctx.version),
    },
    mail: {
      group: "navigation",
      desc: "open email client",
      run: () => {
        window.open("mailto:kalindu@kdecosta.com", "_blank");
        return [{ text: "opening mailto:kalindu@kdecosta.com ...", accent: true }];
      },
    },
    github: {
      group: "navigation",
      desc: "open github profile",
      run: () => {
        window.open("https://github.com/kalindudc", "_blank");
        return [{ text: "opening github.com/kalindudc ...", accent: true }];
      },
    },
    linkedin: {
      group: "navigation",
      desc: "open linkedin profile",
      run: () => {
        window.open("https://www.linkedin.com/in/kdecosta/", "_blank");
        return [{ text: "opening linkedin.com/in/kdecosta ...", accent: true }];
      },
    },
    resume: {
      group: "navigation",
      desc: "open resume in new tab",
      run: () => {
        window.open("/media/kalindu_de_costa_resume.pdf", "_blank");
        return [{ text: "opening kalindu_de_costa_resume.pdf ...", accent: true }];
      },
    },
    reboot: {
      group: "tools",
      desc: "reload the page",
      run: () => {
        setTimeout(() => location.reload(), 200);
        return [{ text: "rebooting...", accent: true }];
      },
    },
    whoami: {
      group: "profile",
      desc: "show profile information",
      run: () => getTerminalProfileEntries(),
    },
    clear: {
      group: "profile",
      desc: "clear the terminal",
      run: () => {
        ctx.clearOutput();
        return getTerminalProfileEntries();
      },
    },
    echo: {
      group: "tools",
      desc: "repeat what you say",
      run: (args) => [{ text: args.join(" ") || "" }],
    },
    date: {
      group: "tools",
      desc: "show current date/time",
      run: () => [{ text: new Date().toString() }],
    },
    exit: {
      group: "ui",
      desc: "switch to modern profile view",
      run: () => {
        ctx.showModernView();
        if (ctx.setSavedView) ctx.setSavedView("modern");
        return [];
      },
    },
    mode: {
      group: "tools",
      desc: "toggle light / dark theme",
      run: () => {
        const next = ctx.toggleTheme();
        return [{ text: `switched to ${next} mode`, accent: true }];
      },
    },
  };
  return commands;
}

function generateHelp(commands, version) {
  const names = Object.keys(commands);
  const maxNameLen = Math.max(...names.map((n) => n.length));
  const dotCol = Math.max(18, maxNameLen + 10);

  // Group commands
  const groups = {};
  for (const name of names) {
    const g = commands[name].group || "other";
    if (!groups[g]) groups[g] = [];
    groups[g].push(name);
  }

  // Sort within each group
  for (const g of Object.keys(groups)) {
    groups[g].sort();
  }

  const lines = [
    { text: `kdecosta-os v${version}`, accent: true, speed: 0.02 },
    { text: "", skipType: true, speed: 0.06 },
  ];

  let firstGroup = true;
  for (const groupName of GROUP_ORDER) {
    const cmds = groups[groupName];
    if (!cmds || cmds.length === 0) continue;

    if (!firstGroup) {
      lines.push({ text: "", skipType: true, speed: 0.02 });
    }
    firstGroup = false;

    for (const name of cmds) {
      const desc = commands[name].desc;
      const dotCount = Math.max(2, dotCol - name.length);
      const dots = ".".repeat(dotCount);
      lines.push({ text: `${name} ${dots} ${desc}`, speed: 0.01 });
    }
  }

  // Append any commands in unrecognised groups
  for (const groupName of Object.keys(groups).sort()) {
    if (GROUP_ORDER.includes(groupName)) continue;
    const cmds = groups[groupName];
    if (!firstGroup) lines.push({ text: "", skipType: true, speed: 0.03 });
    firstGroup = false;
    for (const name of cmds) {
      const desc = commands[name].desc;
      const dotCount = Math.max(2, dotCol - name.length);
      const dots = ".".repeat(dotCount);
      lines.push({ text: `${name} ${dots} ${desc}`, speed: 0.02 });
    }
  }

  lines.push({ text: "[tab completion supported]", dim: true, speed: 0.06 });

  return lines;
}
