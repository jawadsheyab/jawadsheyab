#!/usr/bin/env node
// Generates the themed README sections that sit under the zoom:
//   assets/about.svg            the "About Me" card        } dark, plus a -light
//   assets/heading-*.svg        section header bars        } copy for light mode
//   assets/icons/*.svg          one theme-neutral tile per skill / social link
//
// Icons keep their original colours. Sources live in scripts/icon-src: Devicon
// v2.16.0 originals (MIT), Simple Icons in the brand colour where Devicon has no
// usable mark (CC0), SVG Logos (CC0) for Apidog, official-site PNGs for SSMS and
// Testmo, and a hand-drawn mark for AI-Agentic.
// Run: node scripts/sections.mjs

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const THEMES = {
  dark: {
    suffix: '', bg: '#060911', panel: '#0d1420', text: '#e7ecf4', muted: '#8a96ab', dim: '#5d6a80',
    teal: '#34e5c9', violet: '#8b7bff', amber: '#ffb454', line: '#8ca8cc', glow: 0.14,
  },
  light: {
    suffix: '-light', bg: '#f6f8fb', panel: '#ffffff', text: '#0d1420', muted: '#4a5568', dim: '#7a8699',
    teal: '#0e9f8b', violet: '#6b5bff', amber: '#d9822b', line: '#0d1420', glow: 0.1,
  },
};
let C = THEMES.dark;            // the theme being rendered

// Returns markup that draws icon `name` in a size×size box at (x, y). Sources are
// SVG (nested as-is) or, where the brand only ships a bitmap, a transparent PNG.
function iconMarkup(name, x, y, size) {
  const dir = join(ROOT, 'scripts', 'icon-src');
  if (existsSync(join(dir, `${name}.png`))) {
    const png = readFileSync(join(dir, `${name}.png`)).toString('base64');
    return `<image x="${x}" y="${y}" width="${size}" height="${size}" href="data:image/png;base64,${png}"/>`;
  }
  const svg = readFileSync(join(dir, `${name}.svg`), 'utf8');
  const viewBox = /viewBox="([^"]+)"/.exec(svg)[1];
  const body = svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return `<svg x="${x}" y="${y}" width="${size}" height="${size}" viewBox="${viewBox}">${body}</svg>`;
}
const MONO = `'JetBrains Mono','SFMono-Regular','Cascadia Code',Consolas,'Liberation Mono',Menlo,monospace`;
const DISP = `'Space Grotesk','Segoe UI',Inter,'Helvetica Neue',Arial,sans-serif`;
const BODY = `Inter,'Segoe UI','Helvetica Neue',Arial,sans-serif`;
const W = 900;

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const write = (rel, svg) => {
  const path = join(ROOT, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, svg);
  console.log(`wrote ${rel}`);
};

const grid = () => `<pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="${C.line}" stroke-opacity=".06"/></pattern>`;
const frame = (w, h, r) => `<rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="${r - 0.5}" fill="none" stroke="${C.line}" stroke-opacity=".18"/>`;

// ── About Me card ──────────────────────────────────────────────────────────
const ABOUT = [
  ['🔭', 'I’m currently working as a Full-Stack Tester'],
  ['🌱', 'Solid experience in Manual Testing'],
  ['⭐', 'Former Front-End Developer'],
  ['📃', 'Holding several certificates ISTQB® - CTFL, CT-MAT, CTFL-AT, Scrum - PSM I, PSM II, PSPO I'],
  ['🎮', 'eFootball™ Player'],
  ['🌍', 'Based in Riyadh, Saudi Arabia'],
];

function about() {
  const top = 86;
  const step = 36;
  const h = top + step * (ABOUT.length - 1) + 32;
  const lines = ABOUT.map(([emoji, text], i) => {
    const y = top + step * i;
    return `
  <g class="ln" style="animation-delay:${(0.15 + i * 0.12).toFixed(2)}s">
    <text x="40" y="${y}" font-family="${MONO}" font-size="14" fill="${C.teal}">›</text>
    <text x="62" y="${y}" font-size="17">${emoji}</text>
    <text x="96" y="${y}" font-family="${BODY}" font-size="16" fill="${C.text}">${esc(text)}</text>
  </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="About Me. ${esc(ABOUT.map(([, t]) => t).join('. '))}.">
  <defs>
    ${grid()}
    <radialGradient id="glow" cx="100%" cy="0%" r="70%">
      <stop offset="0" stop-color="${C.teal}" stop-opacity="${C.glow}"/><stop offset="1" stop-color="${C.teal}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="card"><rect width="${W}" height="${h}" rx="16"/></clipPath>
  </defs>
  <style>
    .ln { animation: in .5s cubic-bezier(.2,.7,.2,1) both; }
    @keyframes in { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: none; } }
    .blink { animation: blink 1.1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  </style>
  <g clip-path="url(#card)">
    <rect width="${W}" height="${h}" fill="${C.bg}"/>
    <rect width="${W}" height="${h}" fill="url(#grid)"/>
    <rect width="${W}" height="${h}" fill="url(#glow)"/>
  </g>
  ${frame(W, h, 16)}
  <text x="40" y="44" font-family="${MONO}" font-size="11.5" fill="${C.teal}" letter-spacing="2.5">01 // ABOUT ME</text>
  <text x="860" y="44" font-family="${MONO}" font-size="11.5" fill="${C.dim}" text-anchor="end">~/jawadsheyab <tspan fill="${C.teal}">$</tspan> cat about.md<tspan class="blink" fill="${C.teal}"> ▍</tspan></text>
  ${lines}
</svg>
`;
}

// ── Section header bars ────────────────────────────────────────────────────
function heading(number, title, note, accent) {
  const h = 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${h}" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(title)}">
  <defs>
    ${grid()}
    <linearGradient id="fade" x1="0" x2="1">
      <stop offset="0" stop-color="${accent}" stop-opacity="${C.glow}"/><stop offset=".6" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="card"><rect width="${W}" height="${h}" rx="12"/></clipPath>
  </defs>
  <g clip-path="url(#card)">
    <rect width="${W}" height="${h}" fill="${C.bg}"/>
    <rect width="${W}" height="${h}" fill="url(#grid)"/>
    <rect width="${W}" height="${h}" fill="url(#fade)"/>
    <rect x="0" y="0" width="4" height="${h}" fill="${accent}"/>
  </g>
  ${frame(W, h, 12)}
  <text x="28" y="39" font-family="${MONO}" font-size="12" fill="${accent}" letter-spacing="2">${number} //</text>
  <text x="84" y="40.5" font-family="${DISP}" font-size="22" font-weight="700" fill="${C.text}">${esc(title)}</text>
  <text x="${W - 28}" y="38" font-family="${MONO}" font-size="11.5" fill="${C.dim}" text-anchor="end">${esc(note)}</text>
</svg>
`;
}

// ── Icon tiles ─────────────────────────────────────────────────────────────
// Tiles sit inside links, and GitHub can only theme-switch images that are not
// (<picture> inside a link loses its <img>, and #gh-*-mode-only is no longer
// honoured). So a tile is one theme-neutral image: a translucent panel that
// takes on the page colour, and a mid-grey label that reads on light and dark.
function tile(icon, label, accent) {
  const w = 84;
  const h = 96;
  const size = 36;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">
  <defs>
    <radialGradient id="tile-glow" cx="50%" cy="36%" r="55%">
      <stop offset="0" stop-color="${accent}" stop-opacity=".22"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect x=".5" y=".5" width="${w - 1}" height="${h - 1}" rx="14" fill="#8ca8cc" fill-opacity=".08" stroke="${accent}" stroke-opacity=".45"/>
  <rect x="1" y="1" width="${w - 2}" height="${h - 2}" rx="13.5" fill="url(#tile-glow)"/>
  ${iconMarkup(icon, (w - size) / 2, 16, size)}
  <text x="${w / 2}" y="80" font-family="${MONO}" font-size="10.5" font-weight="600" fill="#738096" text-anchor="middle">${esc(label)}</text>
</svg>
`;
}

// [icon source, label, glow colour taken from the brand]
const FRONTEND = [
  ['html5', 'HTML5', '#e44d26'], ['css3', 'CSS3', '#1572b6'], ['javascript', 'JavaScript', '#f0db4f'],
  ['jquery', 'jQuery', '#0868ac'], ['bootstrap', 'Bootstrap', '#7952b3'], ['sass', 'Sass', '#cb6699'],
  ['chartdotjs', 'Chart.js', '#ff6384'], ['react', 'React', '#61dafb'], ['photoshop', 'Photoshop', '#31a8ff'],
];
const TESTING = [
  ['postman', 'Postman', '#f37036'], ['apidog', 'Apidog', '#7733ff'], ['figma', 'Figma', '#a259ff'],
  ['selenium', 'Selenium', '#43b02a'], ['cypress', 'Cypress', '#69d3a7'], ['jenkins', 'Jenkins', '#d33833'],
  ['azuredevops', 'Azure DevOps', '#0078d4'], ['git', 'Git', '#f34f29'], ['gitlab', 'GitLab', '#fc6d26'],
  ['burpsuite', 'Burp Suite', '#ff6633'], ['jira', 'Jira', '#2684ff'],
  ['testrail', 'TestRail', '#50d18d'], ['testmo', 'Testmo', '#005caf'], ['tosca', 'Tosca', '#2a6fdb'],
  ['microsoftsqlserver', 'SQL Server', '#3b8eea'], ['kibana', 'Kibana', '#24bbb1'], ['ai-agentic', 'AI-Agentic', '#8b7bff'],
];
// X is black-on-white or white-on-black, so its tile uses a black badge that reads on both.
const SOCIALS = [['facebook', 'Facebook', '#3d5a98'], ['x-badge', 'X', '#8a96ab'], ['linkedin', 'LinkedIn', '#0076b2']];

// Unlinked cards get a dark and a light file, switched by <picture> in the README.
for (const theme of Object.values(THEMES)) {
  C = theme;
  const s = C.suffix;
  write(`assets/about${s}.svg`, about());
  write(`assets/heading-frontend${s}.svg`, heading('02', 'Front-End Skills', `${FRONTEND.length} tools · where I started`, C.violet));
  write(`assets/heading-testing${s}.svg`, heading('03', 'Testing Skills', `${TESTING.length} tools · what I do now`, C.teal));
  write(`assets/heading-socials${s}.svg`, heading('04', 'Socials', 'say hi 👋', C.amber));
}
for (const [icon, label, glow] of [...FRONTEND, ...TESTING, ...SOCIALS]) {
  write(`assets/icons/${icon}.svg`, tile(icon, label, glow));
}
