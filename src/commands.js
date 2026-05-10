import { getTerminalProfileEntries } from "./profile.js";

export function createCommands(ctx) {
  const commands = {
    help: {
      desc: "show available commands",
      run: () => generateHelp(commands, ctx.version),
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
    reboot: {
      desc: "reload the page",
      run: () => {
        setTimeout(() => location.reload(), 200);
        return [{ text: "rebooting...", accent: true }];
      },
    },
    whoami: {
      desc: "show profile information",
      run: () => getTerminalProfileEntries(),
    },
    clear: {
      desc: "clear the terminal",
      run: () => {
        ctx.clearOutput();
        return getTerminalProfileEntries();
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
        ctx.showModernView();
        return [];
      },
    },
    mode: {
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
  const names = Object.keys(commands).sort();
  let headings = ["COMMANDS", "DESCRIPTION"];
  let maxLen = Math.max(...names.map((n) => n.length));
  maxLen = Math.max(maxLen, headings[0].length) + 1;
  return [
    { text: `kdecosta-os v${version}`, accent: true },
    { text: "============================", dim: true },
    { text: "" },
    { text: headings[0] + " ".repeat(maxLen - headings[0].length + 2) + headings[1], dim: true },
    { text: "-".repeat(maxLen) + "  -----------", dim: true },
    ...names.map((name) => {
      const padding = " ".repeat(maxLen - name.length);
      return { text: `${name}${padding}  ${commands[name].desc}` };
    }),
    { text: "" },
    { text: "[tab completion supported]", dim: true },
  ];
}
