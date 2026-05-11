export const PROFILE = {
  name: "KALINDU DE COSTA",
  role: "staff infrastructure engineer",
  company: {
    name: "shopify",
    url: "https://www.shopify.com",
  },
  avatar: "/media/avatar.jpg",
  links: [
    { label: "email", url: "mailto:kalindu@kdecosta.com" },
    { label: "github", url: "https://github.com/kalindudc" },
    { label: "linkedin", url: "https://www.linkedin.com/in/kdecosta/" },
    { label: "resume", url: "/media/kalindu_de_costa_resume.pdf", accent: true },
  ],
};

export function buildProfileHTML(mode) {
  const isModern = mode === "modern";
  const wrapper = isModern ? "profile profile--modern" : "profile profile--terminal";
  const br = isModern ? "" : "<br />";
  const linksHtml = PROFILE.links
    .map((l) => {
      const accent = l.accent ? " accent" : "";
      return `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="profile-link${accent}">${l.label}</a>`;
    })
    .join('<span class="profile-sep">·</span>');

  return `
    <div class="${wrapper}">
      <div class="profile-avatar-wrap">
        <img src="${PROFILE.avatar}" alt="${PROFILE.name}" class="profile-avatar" />
      </div>
      <span class="profile-name">${PROFILE.name}</span>
      <span class="profile-role">${PROFILE.role} @ <a href="${PROFILE.company.url}" target="_blank" rel="noopener noreferrer" class="shopify-link">${PROFILE.company.name}</a></span>
      <div class="profile-links">${linksHtml}</div>
      ${br}
    </div>
  `;
}

export function getTerminalProfileEntries() {
  const { name, role, company, avatar, links } = PROFILE;
  const linksHtml = links
    .map((l) => {
      const accent = l.accent ? " accent" : "";
      return `<a href="${l.url}" target="_blank" rel="noopener noreferrer" class="profile-link${accent}">${l.label}</a>`;
    })
    .join('<span class="profile-sep">·</span>');

  return [
    {
      html: `<div class="profile-avatar-wrap"><img src="${avatar}" alt="${name}" class="profile-avatar" /></div>`,
      instant: true,
    },
    { html: `<span class="profile-name">${name}</span>`, instant: true },
    {
      html: `<span class="profile-role">${role} @ <a href="${company.url}" target="_blank" rel="noopener noreferrer" class="shopify-link">${company.name}</a></span>`,
      instant: true,
    },
    { html: `<div class="profile-links">${linksHtml}</div>`, instant: true },
    { html: `<br />`, instant: true },
  ];
}
