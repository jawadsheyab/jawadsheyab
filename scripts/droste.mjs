#!/usr/bin/env node
// Generates assets/zoom.svg (dark) and assets/zoom-light.svg: an endless
// "Droste" zoom that never cuts.
//
// Five worlds are nested inside each other, each one K times smaller and
// sitting in the hole at the centre of its parent. Every world runs the same
// exponential zoom, offset by one level, so the camera falls forever and the
// loop closes on its own first frame:
//
//   prompt + magnifier → bug caught in a diff → orbit of 5 companies
//   → ring of 6 certifications → gear of 16 skills → back to the prompt
//
// Run: node scripts/droste.mjs

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ASSETS = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets');

const W = 900;
const H = 500;
const K = 4;                    // each world is K times smaller than its parent
const HOLE = 40;                // radius of the window into the next world
const RIM = HOLE * K;           // outer radius of a world = its parent's hole
const SECONDS_PER_LEVEL = 1.6;
const TWIST = 14;               // degrees of rotation per level

const THEMES = {
  dark: {
    file: 'zoom.svg',
    bg: '#060911', panel: '#0d1420', panel2: '#0f1826', text: '#e7ecf4', muted: '#8a96ab',
    dim: '#5d6a80', teal: '#34e5c9', violet: '#8b7bff', amber: '#ffb454', red: '#ff5f57',
    line: '#8ca8cc', onAccent: '#060911', collar: '#c98a3c', bugDark: '#1b2433',
    worlds: ['#0b1220', '#0a0f1a', '#0c1322', '#0a0f1a', '#0d1420'],
  },
  light: {
    file: 'zoom-light.svg',
    bg: '#f6f8fb', panel: '#ffffff', panel2: '#eef2f7', text: '#0d1420', muted: '#4a5568',
    dim: '#7a8699', teal: '#0e9f8b', violet: '#6b5bff', amber: '#d9822b', red: '#e5484d',
    line: '#0d1420', onAccent: '#ffffff', collar: '#b06f22', bugDark: '#1b2433',
    worlds: ['#eef3f8', '#f4f7fb', '#edf1f7', '#f4f7fb', '#e9eef5'],
  },
};
let C = THEMES.dark;            // the theme being rendered; set by render()

const MONO = `'JetBrains Mono','SFMono-Regular','Cascadia Code',Consolas,'Liberation Mono',Menlo,monospace`;
const DISP = `'Space Grotesk','Segoe UI',Inter,'Helvetica Neue',Arial,sans-serif`;

const r2 = (n) => Math.round(n * 100) / 100;
const polar = (r, deg) => [r2(r * Math.cos((deg * Math.PI) / 180)), r2(r * Math.sin((deg * Math.PI) / 180))];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const circlePath = (r) => `M${-r} 0A${r} ${r} 0 1 0 ${r} 0A${r} ${r} 0 1 0 ${-r} 0Z`;

// Opaque annulus every world is painted on, plus the seam ring at its rim.
const base = (fill) => `
    <path d="${circlePath(RIM + 0.6)}${circlePath(HOLE - 0.6)}" fill="${fill}" fill-rule="evenodd"/>
    <circle r="${RIM}" fill="none" stroke="${C.teal}" stroke-opacity=".3" stroke-width=".8"/>`;

// A dial of `count` ticks between two radii; every `every`-th tick is longer.
function ticks(inner, outer, count, every, color) {
  const lines = Array.from({ length: count }, (_, i) => {
    const a = (360 / count) * i;
    const [x1, y1] = polar(i % every === 0 ? inner - 4 : inner, a);
    const [x2, y2] = polar(outer, a);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  }).join('');
  return `<g stroke="${color}" stroke-opacity=".35" stroke-width=".7">${lines}</g>`;
}

// ── World 0: the prompt, seen through a magnifier ──────────────────────────
function prompt() {
  const [gx1, gy1] = polar(42, 205);
  const [gx2, gy2] = polar(42, 250);
  return `${base(C.worlds[0])}
    <text y="-124" font-size="6" fill="${C.dim}" text-anchor="middle" letter-spacing=".6">~/jawadsheyab — zsh</text>
    <text y="-101" font-size="8.4" text-anchor="middle"><tspan fill="${C.teal}">jawad@qa</tspan><tspan fill="${C.dim}">:~$ </tspan><tspan fill="${C.text}">inspect --until-it-cant-break</tspan></text>
    <text y="-82" font-size="6.6" fill="${C.muted}" text-anchor="middle">› zooming into the code under test…</text>
    <text y="-64" font-size="6.6" fill="${C.dim}" text-anchor="middle">› depth: ∞</text>
    <line x1="31" y1="31" x2="64" y2="64" stroke="${C.amber}" stroke-width="10" stroke-linecap="round"/>
    <line x1="31" y1="31" x2="40" y2="40" stroke="${C.collar}" stroke-width="11"/>
    <circle r="42" fill="none" stroke="${C.teal}" stroke-width="4.5"/>
    <path d="M${gx1} ${gy1}A42 42 0 0 1 ${gx2} ${gy2}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6" stroke-linecap="round"/>
    <text y="94" font-size="6.6" text-anchor="middle"><tspan fill="${C.teal}">✓ 8 passed</tspan><tspan fill="${C.dim}">   </tspan><tspan fill="${C.amber}">○ 1 skipped: giving up</tspan></text>
    <rect x="-50" y="104" width="100" height="14" rx="7" fill="${C.teal}"/>
    <text y="113.6" font-size="6" font-weight="700" fill="${C.onAccent}" text-anchor="middle" letter-spacing=".8">QUALITY GATE PASSED</text>
    <text y="137" font-size="5.4" fill="${C.dim}" text-anchor="middle" letter-spacing=".5">JAWAD ALSHEYAB · SENIOR SQC ENGINEER</text>`;
}

// ── World 1: a bug caught red-handed in a diff ─────────────────────────────
const DIFF = [
  [' ', 'describe("wallet transfer", () => {'],
  [' ', '  it("rejects overdrafts", async () => {'],
  ['-', '    if (amount > balance) approve(tx);'],
  ['+', '    if (amount <= balance) approve(tx);'],
  [' ', '    const VAT = 0.15;'],
  ['-', '    total = price * VAT;'],
  ['+', '    total = round(price * (1 + VAT), 2);'],
  [' ', '    expect(res.status).toBe(200);'],
  ['-', '    retry(3); // flaky?'],
  ['+', '    await waitFor(ledger.synced);'],
  [' ', '    assert.equal(receipt.iban, iban);'],
  ['+', '    expect(audit.log).toContain(tx.id);'],
  [' ', '  });'],
  ['-', '  const fee = amount * rate;  // NaN on 0'],
  ['+', '  const fee = amount ? amount * rate : 0;'],
  [' ', '  it("handles Arabic names", () => {'],
  ['-', '    name.split(" ").reverse();'],
  ['+', '    normalize(name, { rtl: true });'],
  [' ', '  });'],
  ['+', '  it("survives a timeout", retryable);'],
  [' ', '});'],
  ['-', '// TODO: test this later'],
  ['+', '// tested. every release.'],
  [' ', '// ✓ 0 known bugs in this file'],
];

function diff() {
  const lines = DIFF.map(([kind, code], j) => {
    const y = -150 + 13 * j;
    const tint = kind === '+' ? C.teal : kind === '-' ? C.red : null;
    const bg = tint ? `<rect x="-160" y="${y - 8.5}" width="320" height="11" fill="${tint}" fill-opacity=".1"/>` : '';
    const sign = kind === ' ' ? ' ' : kind;
    const color = kind === '+' ? C.teal : kind === '-' ? C.red : C.muted;
    return `${bg}<text x="-150" y="${y}" font-size="6.6" fill="${color}" xml:space="preserve">${esc(`${sign} ${code}`)}</text>`;
  }).join('');

  return `${base(C.worlds[1])}
    <g clip-path="url(#annulus)">${lines}</g>
    <rect x="82" y="-8" width="46" height="46" rx="3" fill="${C.teal}" fill-opacity=".07" stroke="${C.teal}" stroke-width=".9" stroke-dasharray="3 2"/>
    <rect x="82" y="-19" width="64" height="10" rx="2" fill="${C.teal}"/>
    <text x="114" y="-11.6" font-size="5.6" font-weight="700" fill="${C.onAccent}" text-anchor="middle" letter-spacing=".3">BUG-404 CAUGHT</text>
    <g transform="translate(105 16) rotate(-25)">
      <g stroke="${C.bugDark}" stroke-width="1.3" stroke-linecap="round">
        <line x1="-6" y1="-4" x2="-12" y2="-8"/><line x1="6" y1="-4" x2="12" y2="-8"/>
        <line x1="-7" y1="1" x2="-13" y2="1"/><line x1="7" y1="1" x2="13" y2="1"/>
        <line x1="-6" y1="6" x2="-12" y2="10"/><line x1="6" y1="6" x2="12" y2="10"/>
        <path d="M-1.5 -13.5q-2 -4 -6 -5M1.5 -13.5q2 -4 6 -5" fill="none"/>
      </g>
      <ellipse rx="7.5" ry="9.5" fill="${C.red}"/>
      <line y1="-9.5" y2="9.5" stroke="${C.bugDark}" stroke-width=".9"/>
      <circle cy="-11" r="4.2" fill="${C.bugDark}"/>
      <circle cx="-3.6" cy="-2" r="1.4" fill="${C.bugDark}"/><circle cx="3.6" cy="1.5" r="1.4" fill="${C.bugDark}"/><circle cx="-3" cy="5.5" r="1.1" fill="${C.bugDark}"/>
    </g>`;
}

// ── World 2: an orbit of five companies ────────────────────────────────────
const COMPANIES = [
  ['Takamol · Qiwa', '2025 → now'],
  ['ZATCA', '2024'],
  ['STCpay', '2022'],
  ['Mixed Dimensions', '2019'],
  ['Javna', '2017'],
];

function orbit() {
  const nodes = COMPANIES.map(([name, year], i) => {
    const a = -90 + 72 * i;
    const [x, y] = polar(100, a);
    const [lx, ly] = polar(124, a);
    const current = i === 0;
    return `
    ${current ? `<circle cx="${x}" cy="${y}" r="15" fill="${C.teal}" fill-opacity=".15"/>` : ''}
    <circle cx="${x}" cy="${y}" r="8.5" fill="${current ? C.teal : C.panel}" stroke="${i < 3 ? C.teal : C.violet}" stroke-width="1.6"/>
    <text x="${lx}" y="${ly}" font-family="${DISP}" font-size="7.2" font-weight="700" fill="${C.text}" text-anchor="middle">${esc(name)}</text>
    <text x="${lx}" y="${r2(ly + 8)}" font-size="5.4" fill="${current ? C.teal : C.muted}" text-anchor="middle">${year}</text>`;
  }).join('');

  return `${base(C.worlds[2])}
    ${ticks(146, 152, 72, 6, C.teal)}
    <circle r="100" fill="none" stroke="${C.teal}" stroke-opacity=".45" stroke-width="1" stroke-dasharray="2 4"/>
    <path id="tp-orbit" d="M-54 0A54 54 0 1 1 54 0A54 54 0 1 1 -54 0" fill="none"/>
    <text font-size="6.4" fill="${C.muted}" letter-spacing="1.6"><textPath href="#tp-orbit">2017 → NOW · SEVEN YEARS · FIVE COMPANIES ·</textPath></text>
    ${nodes}`;
}

// ── World 3: a ring of six certifications ──────────────────────────────────
const CERTS = [
  ['CTFL', 'ISTQB®', 'teal'],
  ['CT-MAT', 'ISTQB®', 'teal'],
  ['CTFL-AT', 'ISTQB®', 'teal'],
  ['PSM I', 'SCRUM.ORG', 'violet'],
  ['PSM II', 'SCRUM.ORG', 'violet'],
  ['PSPO I', 'SCRUM.ORG', 'violet'],
];

function certs() {
  const hexes = CERTS.map(([label, issuer, accent], i) => {
    const color = C[accent];
    const [cx, cy] = polar(100, -90 + 60 * i);
    const pts = Array.from({ length: 6 }, (_, k) => polar(27, -90 + 60 * k).map((v, n) => r2(v + (n ? cy : cx))).join(',')).join(' ');
    return `
    <polygon points="${pts}" fill="${C.panel}" stroke="${color}" stroke-width="1.4"/>
    <text x="${cx}" y="${r2(cy + 1)}" font-family="${DISP}" font-size="7.6" font-weight="700" fill="${C.text}" text-anchor="middle">${label}</text>
    <text x="${cx}" y="${r2(cy + 9.5)}" font-size="4.6" fill="${color}" text-anchor="middle" letter-spacing=".6">${issuer}</text>`;
  }).join('');

  return `${base(C.worlds[3])}
    <circle r="100" fill="none" stroke="${C.violet}" stroke-opacity=".4" stroke-width="1"/>
    <circle r="146" fill="none" stroke="${C.teal}" stroke-opacity=".2" stroke-width="5" stroke-dasharray="1 5"/>
    <path id="tp-certs" d="M-54 0A54 54 0 1 1 54 0A54 54 0 1 1 -54 0" fill="none"/>
    <text font-size="6.4" fill="${C.muted}" letter-spacing="1.6"><textPath href="#tp-certs">CERTIFIED · ISTQB® × SCRUM.ORG · 6 OF 6 ·</textPath></text>
    ${hexes}`;
}

// ── World 4: a gear of sixteen testing skills ──────────────────────────────
const SKILLS = [
  'black-box testing', 'API testing', 'test automation', 'regression', 'UAT', 'SIT',
  'mobile testing', 'functional', 'non-functional', 'bug tracking', 'critical thinking',
  'analytical thinking', 'attention to detail', 'time management', 'communication', 'problem-solving',
];

function gear() {
  const teeth = SKILLS.length;
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a = (360 / teeth) * i;
    pts.push(polar(136, a - 8), polar(152, a - 4.6), polar(152, a + 4.6), polar(136, a + 8));
  }
  const outline = `M${pts.map((p) => p.join(' ')).join('L')}Z`;
  const labels = SKILLS.map((skill, i) => {
    const a = (360 / teeth) * i;
    const flip = a > 90 && a < 270;
    const [dx, dy] = polar(144, a);
    return `
    <circle cx="${dx}" cy="${dy}" r="1.7" fill="${C.teal}"/>
    <text transform="rotate(${flip ? a + 180 : a})" x="${flip ? -56 : 56}" y="2" font-size="6.1" fill="${i % 2 ? C.muted : C.text}" text-anchor="${flip ? 'end' : 'start'}">${esc(skill)}</text>`;
  }).join('');

  return `${base(C.worlds[4])}
    <path d="${outline}${circlePath(46)}" fill="${C.panel2}" fill-rule="evenodd" stroke="${C.teal}" stroke-opacity=".55" stroke-width="1"/>
    <circle r="128" fill="none" stroke="${C.teal}" stroke-opacity=".18" stroke-width=".8"/>
    <circle r="50" fill="none" stroke="${C.amber}" stroke-opacity=".5" stroke-width="1" stroke-dasharray="2 3"/>
    ${labels}`;
}

// ── Assemble ───────────────────────────────────────────────────────────────
const WORLDS = [prompt, diff, orbit, certs, gear];
const N = WORLDS.length;
const PERIOD = N * SECONDS_PER_LEVEL;
const P_MIN = -N / 2;
const CX = W / 2;
const CY = H / 2;

const scaleAt = (p) => +(K ** p).toPrecision(6);
const turnAt = (p) => r2(TWIST * p);

// The zoom has to be exponential in time to feel constant. One keyframe per
// level (scale ×K each), eased with a cubic that matches K^u in value and in
// slope at both ends, so speed is continuous across keyframes. Rotation lives on
// a parent with its own linear timing, so the easing never makes it pulse.
const kSlope = Math.log(K) / (K - 1);
const EASE = `cubic-bezier(.3333,${r2(kSlope / 3)},.6667,${r2(1 - (K * kSlope) / 3)})`;
const zoomFrames = Array.from({ length: N + 1 }, (_, j) =>
  `${(100 * j) / N}%{transform:scale(${scaleAt(P_MIN + j)});animation-timing-function:${EASE}}`).join('');
const turnFrames = `from{transform:translate(${CX}px,${CY}px) rotate(${turnAt(P_MIN)}deg)}to{transform:translate(${CX}px,${CY}px) rotate(${turnAt(-P_MIN)}deg)}`;

const bracket = (x, y, sx, sy) => `<path d="M${x} ${y + sy * 22}V${y}H${x + sx * 22}"/>`;

function render(theme) {
  C = THEMES[theme];

  // World i starts at zoom level p = 1 - i, so world 0 fills the frame.
  const levels = WORLDS.map((world, i) => {
    const p0 = ((((1 - i - P_MIN) % N) + N) % N) + P_MIN;
    const delay = `animation-delay:${r2(-((p0 - P_MIN) / N) * PERIOD)}s`;
    return `
  <g class="turn" transform="translate(${CX} ${CY}) rotate(${turnAt(p0)})" style="${delay}">
    <g class="zoom" transform="scale(${scaleAt(p0)})" style="${delay}">${world()}
    </g>
  </g>`;
  }).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="An endless zoom through Jawad Alsheyab's world: a terminal prompt seen through a magnifier, a bug caught in a code diff, an orbit of five companies, a ring of six certifications and a gear of sixteen testing skills, then back to the same prompt.">
  <defs>
    <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
    <clipPath id="annulus"><path d="${circlePath(RIM - 2)}${circlePath(HOLE + 3)}" clip-rule="evenodd"/></clipPath>
    <radialGradient id="vignette" cx="50%" cy="50%" r="75%">
      <stop offset=".45" stop-color="${C.bg}" stop-opacity="0"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity=".92"/>
    </radialGradient>
    <linearGradient id="hudTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.bg}" stop-opacity=".95"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="hudBottom" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="${C.bg}" stop-opacity=".95"/>
      <stop offset="1" stop-color="${C.bg}" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0" stop-color="${C.teal}" stop-opacity=".9"/>
      <stop offset="1" stop-color="${C.teal}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <style>
    text { font-family: ${MONO}; }
    .turn, .zoom { transform-box: view-box; transform-origin: 0 0; will-change: transform; }
    .turn { animation: turn ${PERIOD}s linear infinite; }
    .zoom { animation: zoom ${PERIOD}s infinite; }
    @keyframes turn { ${turnFrames} }
    @keyframes zoom { ${zoomFrames} }
    .blink { animation: blink 1.2s steps(1) infinite; }
    @keyframes blink { 50% { opacity: .15; } }
    @media (prefers-reduced-motion: reduce) { .turn, .zoom, .blink { animation-play-state: paused; } }
  </style>

  <g clip-path="url(#frame)">
    <rect width="${W}" height="${H}" fill="${C.bg}"/>${levels}
    <circle cx="${CX}" cy="${CY}" r="6" fill="url(#core)"/>
    <rect width="${W}" height="${H}" fill="url(#vignette)"/>
    <rect width="${W}" height="76" fill="url(#hudTop)"/>
    <rect y="${H - 76}" width="${W}" height="76" fill="url(#hudBottom)"/>
  </g>

  <!-- HUD: stays still while the world falls away -->
  <g fill="none" stroke="${C.teal}" stroke-opacity=".75" stroke-width="2" stroke-linecap="round">
    ${bracket(18, 18, 1, 1)}${bracket(W - 18, 18, -1, 1)}${bracket(18, H - 18, 1, -1)}${bracket(W - 18, H - 18, -1, -1)}
  </g>
  <g stroke="${C.teal}" stroke-opacity=".5" stroke-width="1">
    <line x1="${CX - 20}" y1="${CY}" x2="${CX - 9}" y2="${CY}"/><line x1="${CX + 9}" y1="${CY}" x2="${CX + 20}" y2="${CY}"/>
    <line x1="${CX}" y1="${CY - 20}" x2="${CX}" y2="${CY - 9}"/><line x1="${CX}" y1="${CY + 9}" x2="${CX}" y2="${CY + 20}"/>
  </g>
  <text x="34" y="40" font-size="11.5" letter-spacing="1.4"><tspan fill="${C.teal}" font-weight="700">JAWAD.QA</tspan><tspan fill="${C.dim}">  //  ENDLESS INSPECTION</tspan></text>
  <g class="blink"><circle cx="${W - 134}" cy="36" r="4" fill="${C.red}"/></g>
  <text x="${W - 34}" y="40" font-size="11.5" fill="${C.text}" text-anchor="end" letter-spacing="1.4">INSPECTING</text>
  <text x="34" y="${H - 30}" font-size="10.5" fill="${C.dim}" letter-spacing=".6">${K}× per level · ${N} worlds · ${PERIOD}s loop · zero cuts</text>
  <text x="${W - 34}" y="${H - 30}" font-size="10.5" fill="${C.dim}" text-anchor="end" letter-spacing=".6">github.com/jawadsheyab</text>
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="${C.line}" stroke-opacity=".18"/>
</svg>
`;
}

for (const theme of Object.keys(THEMES)) {
  const svg = render(theme);
  writeFileSync(join(ASSETS, THEMES[theme].file), svg);
  console.log(`wrote assets/${THEMES[theme].file} (${(svg.length / 1024).toFixed(1)} KB)`);
}
