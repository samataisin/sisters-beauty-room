// Kleine SVG-Animationen für die Preisliste.
// Gesicht: zeigen nur den ABLAUF (Gerät, Serum, Maske), kein Haut-Vorher/Nachher (Heilwerbung/UWG).
// Nägel/Füße: Vorher/Nachher des DESIGNS (keine Gesundheitsaussage).
const { gsap } = window;

const C = {
  bg: "#fbf6f0", skinTop: "#f1d3c5", skinMid: "#e8bfad", skinLow: "#d9a28a", line: "#c98f76",
  finger: "#f0cdb8", fingerLine: "#e0b3a3", nat: "#f5dcd2", ext: "#f7e6dd",
  ink: "#2a201a", muted: "#7a6a5d", gold: "#c9a46a", goldDeep: "#b08a5a", cream: "#fffaf5",
  nude: "#e6a99c", rose: "#d98f8a", red: "#b5473f", coral: "#e76f51", uv: "#b9a3e3", serum: "#e9d3a1"
};

let uid = 0;

/* ---------- Bausteine (SVG-Strings) ---------- */
const SKIN = "M0 92 C40 86 80 98 120 92 S200 86 240 92 V150 H0Z";
const FINGER = "M86 160 V70 C86 40 154 40 154 70 V160Z";
const NAIL_NAT = "M98 98 V60 C98 40 142 40 142 60 V98 C142 104 98 104 98 98Z";
const NAIL_EXT = "M98 98 V58 C98 36 111 22 120 12 C129 22 142 36 142 58 V98 C142 104 98 104 98 98Z";
const TOE = "M62 160 V92 C62 50 178 50 178 92 V160Z";
const TOE_NAT = "M84 122 V92 C84 66 156 66 156 92 V122 C156 129 84 129 84 122Z";
const TOE_EXT = "M82 124 V88 C82 60 158 60 158 88 V124 C158 131 82 131 82 124Z";

const caption = () =>
  `<text class="cap" x="14" y="22" font-family="Manrope, sans-serif" font-size="8.5" letter-spacing="1.4" fill="${C.muted}"> </text>`;

const frame = (id, inner) => `
<svg viewBox="0 0 240 150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <clipPath id="${id}frame"><rect width="240" height="150" rx="16"/></clipPath>
    <linearGradient id="${id}sk" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${C.skinTop}"/><stop offset=".45" stop-color="${C.skinMid}"/><stop offset="1" stop-color="${C.skinLow}"/>
    </linearGradient>
    <linearGradient id="${id}gl" x1="0" x2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".8"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <radialGradient id="${id}hand"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <radialGradient id="${id}uv"><stop offset="0" stop-color="${C.uv}" stop-opacity=".7"/><stop offset="1" stop-color="${C.uv}" stop-opacity="0"/></radialGradient>
    <clipPath id="${id}skc"><path d="${SKIN}"/></clipPath>
  </defs>
  <g clip-path="url(#${id}frame)">
    <rect width="240" height="150" fill="${C.bg}"/>
    ${inner}
  </g>
  ${caption()}
</svg>`;

const skin = (id) => `
  <path d="${SKIN}" fill="url(#${id}sk)"/>
  <path d="M0 116 C50 110 110 122 160 115 S220 112 240 116" fill="none" stroke="${C.line}" stroke-opacity=".35"/>
  <path d="M0 134 C60 129 120 139 240 132" fill="none" stroke="${C.line}" stroke-opacity=".22"/>`;

const glowSweep = (id) => `<g clip-path="url(#${id}skc)"><rect class="sweep" x="-90" y="78" width="80" height="80" fill="url(#${id}gl)"/></g>`;

const pen = (cls = "pen") => `<g class="${cls}" transform="translate(-40 40)">
  <rect x="-6" y="-58" width="12" height="44" rx="6" fill="${C.ink}"/>
  <rect x="-4.5" y="-16" width="9" height="9" rx="2" fill="${C.gold}"/>
  <rect x="-1.5" y="-7" width="3" height="7" rx="1" fill="#8d7a68"/></g>`;

const brush = (color, cls = "brush") => `<g class="${cls}" transform="translate(-40 -40)">
  <rect x="-3" y="-54" width="6" height="42" rx="3" fill="${C.ink}"/>
  <path d="M-5.5 -13 h11 l-2 13 h-7z" fill="${color}"/></g>`;

const file = () => `<g class="file" transform="translate(-60 -60)">
  <rect x="-34" y="-3" width="68" height="6" rx="3" fill="${C.gold}" transform="rotate(-8)"/></g>`;

const drops = (xs) => xs.map((x) => `<g class="drop" transform="translate(${x} -20)"><path d="M0 -7 C3.5 -2 4.5 1.5 0 4.5 C-4.5 1.5 -3.5 -2 0 -7Z" fill="${C.serum}"/></g>`).join("");

const film = (id, color, cls = "film") =>
  `<g clip-path="url(#${id}skc)"><rect class="${cls}" x="0" y="84" width="240" height="12" fill="${color}" opacity="0"/></g>`;

const sparkles = (pts) => pts.map(([x, y, s]) =>
  `<path class="spark" transform="translate(${x} ${y}) scale(0)" data-s="${s}" d="M0 -5 L1.2 -1.2 L5 0 L1.2 1.2 L0 5 L-1.2 1.2 L-5 0 L-1.2 -1.2Z" fill="${C.gold}"/>`).join("");

const bubbles = (n, y0, cls = "bub") => Array.from({ length: n }, (_, i) =>
  `<circle class="${cls}" cx="${30 + i * (180 / Math.max(n - 1, 1))}" cy="${y0}" r="${2 + (i % 3)}" fill="none" stroke="#fff" stroke-width="1.2" opacity="0"/>`).join("");

/* ---------- Zeitleisten-Helfer ---------- */
function say(tl, ctx, text, at) {
  tl.call(() => { ctx.cap.textContent = text; }, null, at);
  tl.fromTo(ctx.cap, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
}
const sweep = (tl, ctx, at) => tl.fromTo(ctx.q(".sweep"), { x: 0 }, { x: 340, duration: 1.4, ease: "power2.inOut" }, at);
const twinkle = (tl, ctx, at) => ctx.qa(".spark").forEach((s, i) =>
  tl.fromTo(s, { scale: 0, rotation: 0, svgOrigin: "0 0" }, { scale: +s.dataset.s, rotation: 90, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, at + i * 0.12));

function needling(tl, ctx, at, { nano = false } = {}) {
  const p = ctx.q(nano ? ".nano" : ".pen");
  const dots = ctx.qa(nano ? ".ndot" : ".dot");
  tl.fromTo(p, { x: -40, y: 40 }, { x: dots[0].cx.baseVal.value, y: 90, duration: 0.6, ease: "power2.out" }, at);
  let t = at + 0.6;
  dots.forEach((d) => {
    const x = d.cx.baseVal.value;
    tl.to(p, { x, duration: nano ? 0.12 : 0.22, ease: "sine.inOut" }, t);
    tl.to(p, { y: 93, duration: 0.07, yoyo: true, repeat: 1 }, t + (nano ? 0.05 : 0.12));
    tl.fromTo(d, { opacity: 0, scale: 0, svgOrigin: `${x} ${d.cy.baseVal.value}` }, { opacity: 0.85, scale: 1, duration: 0.2 }, t + (nano ? 0.1 : 0.18));
    t += nano ? 0.15 : 0.3;
  });
  tl.to(p, { x: 280, y: 30, duration: 0.6, ease: "power2.in" }, t);
  tl.to(dots, { opacity: 0, duration: 0.6 }, t + 0.4);
  return t + 0.9;
}

function serum(tl, ctx, at) {
  ctx.qa(".drop").forEach((d, i) => {
    tl.fromTo(d, { y: -20, scaleX: 1, opacity: 1 }, { y: 88, duration: 0.6, ease: "power2.in" }, at + i * 0.18);
    tl.to(d, { scaleX: 3, scaleY: 0.3, opacity: 0, duration: 0.4 }, at + 0.6 + i * 0.18);
  });
  tl.fromTo(ctx.q(".film"), { opacity: 0 }, { opacity: 0.45, duration: 0.8 }, at + 0.7);
  return at + 1.6;
}

/* ---------- Szenen ---------- */
const SCENES = {
  needling: {
    svg: (id) => frame(id, skin(id) + film(id, C.serum) + glowSweep(id) +
      Array.from({ length: 6 }, (_, i) => `<circle class="dot" cx="${45 + i * 30}" cy="93" r="1.6" fill="#b5644f" opacity="0"/>`).join("") +
      drops([80, 125, 170]) + pen()),
    anim(tl, ctx) {
      say(tl, ctx, "1 · FEINES NEEDLING", 0.01);
      const t = needling(tl, ctx, 0);
      say(tl, ctx, "2 · PFLEGESERUM", t);
      const t2 = serum(tl, ctx, t);
      say(tl, ctx, "3 · EINWIRKEN & ENTSPANNEN", t2);
      sweep(tl, ctx, t2 + 0.1);
      tl.to(ctx.q(".film"), { opacity: 0, duration: 0.6 }, t2 + 1.6);
    }
  },

  nano: {
    svg: (id) => frame(id, skin(id) + film(id, C.serum) + glowSweep(id) +
      Array.from({ length: 12 }, (_, i) => `<circle class="ndot" cx="${36 + i * 15}" cy="${92 + (i % 2)}" r=".9" fill="#c98f76" opacity="0"/>`).join("") +
      drops([90, 150]) + pen("nano")),
    anim(tl, ctx) {
      say(tl, ctx, "1 · NANO-AUFSATZ, GANZ SANFT", 0.01);
      const t = needling(tl, ctx, 0, { nano: true });
      say(tl, ctx, "2 · SERUM EINMASSIEREN", t);
      const t2 = serum(tl, ctx, t);
      sweep(tl, ctx, t2);
      tl.to(ctx.q(".film"), { opacity: 0, duration: 0.6 }, t2 + 1.4);
    }
  },

  derma: {
    svg: (id) => frame(id, skin(id) + film(id, "#ffffff", "mask") +
      Array.from({ length: 9 }, (_, i) => `<rect class="flake" x="${28 + i * 22}" y="88.5" width="5" height="2.2" rx="1" fill="#f8ebe3" transform="rotate(${(i % 3) * 8 - 8} ${30 + i * 22} 89)"/>`).join("") +
      `<g class="hp" transform="translate(-40 40)"><rect x="-8" y="-58" width="16" height="50" rx="8" fill="${C.ink}"/><rect x="-5" y="-10" width="10" height="5" fill="${C.gold}"/><circle cx="0" cy="-2" r="5" fill="#e4e7ea" stroke="#9aa3ad"/></g>`),
    anim(tl, ctx) {
      say(tl, ctx, "1 · DIAMANT-AUFSATZ", 0.01);
      const hp = ctx.q(".hp");
      tl.fromTo(hp, { x: -20, y: 40 }, { x: 10, y: 88, duration: 0.5 }, 0);
      tl.to(hp, { x: 250, duration: 2.6, ease: "none" }, 0.5);
      ctx.qa(".flake").forEach((f, i) => {
        const x = 28 + i * 22;
        const when = 0.5 + ((x - 10) / 240) * 2.6;
        tl.fromTo(f, { x: 0, y: 0, opacity: 1 }, { x: 6, y: -8, opacity: 0, duration: 0.25, ease: "power2.in" }, when);
      });
      say(tl, ctx, "2 · PARTIKEL WERDEN ABGESAUGT", 1.6);
      say(tl, ctx, "3 · PFLEGENDE MASKE", 3.3);
      tl.fromTo(ctx.q(".mask"), { opacity: 0 }, { opacity: 0.7, duration: 0.8 }, 3.3);
      tl.to(ctx.q(".mask"), { opacity: 0, duration: 0.6 }, 5);
    }
  },

  peeling: {
    svg: (id) => frame(id, skin(id) + film(id, C.gold, "gel") + glowSweep(id) + bubbles(7, 88) + brush(C.gold) + film(id, C.serum)),
    anim(tl, ctx) {
      say(tl, ctx, "1 · FRUCHTSÄURE AUFTRAGEN", 0.01);
      const b = ctx.q(".brush"), gel = ctx.q(".gel");
      tl.fromTo(b, { x: -10, y: 40 }, { x: 10, y: 88, duration: 0.4 }, 0);
      tl.fromTo(gel, { opacity: 0.45, attr: { width: 0 } }, { attr: { width: 240 }, duration: 1.6, ease: "none" }, 0.4);
      tl.to(b, { x: 250, duration: 1.6, ease: "none" }, 0.4);
      say(tl, ctx, "2 · KURZ EINWIRKEN", 2.1);
      ctx.qa(".bub").forEach((c, i) => tl.fromTo(c, { opacity: 0, y: 0 }, { opacity: 0.9, y: -10, duration: 0.8, yoyo: true, repeat: 1 }, 2.1 + i * 0.1));
      say(tl, ctx, "3 · NEUTRALISIEREN & PFLEGEN", 4);
      tl.to(gel, { opacity: 0, duration: 0.8 }, 4);
      tl.fromTo(ctx.q(".film"), { opacity: 0 }, { opacity: 0.4, duration: 0.6, yoyo: true, repeat: 1 }, 4.3);
      sweep(tl, ctx, 4.6);
    }
  },

  combo: {
    svg: (id) => frame(id, skin(id) + film(id, C.gold, "gel") + film(id, C.serum) + glowSweep(id) + bubbles(6, 88) +
      Array.from({ length: 12 }, (_, i) => `<circle class="ndot" cx="${36 + i * 15}" cy="${92 + (i % 2)}" r=".9" fill="#c98f76" opacity="0"/>`).join("") +
      drops([90, 150]) + brush(C.gold) + pen("nano")),
    anim(tl, ctx) {
      say(tl, ctx, "1 · FRUCHTSÄUREPEELING", 0.01);
      const b = ctx.q(".brush"), gel = ctx.q(".gel");
      tl.fromTo(b, { x: -10, y: 40 }, { x: 10, y: 88, duration: 0.4 }, 0);
      tl.fromTo(gel, { opacity: 0.45, attr: { width: 0 } }, { attr: { width: 240 }, duration: 1.4, ease: "none" }, 0.4);
      tl.to(b, { x: 250, duration: 1.4, ease: "none" }, 0.4);
      ctx.qa(".bub").forEach((c, i) => tl.fromTo(c, { opacity: 0, y: 0 }, { opacity: 0.9, y: -10, duration: 0.6, yoyo: true, repeat: 1 }, 1.9 + i * 0.08));
      tl.to(gel, { opacity: 0, duration: 0.6 }, 3.1);
      say(tl, ctx, "2 · NANO NEEDLING", 3.4);
      const t = needling(tl, ctx, 3.4, { nano: true });
      say(tl, ctx, "3 · PFLEGESERUM", t);
      const t2 = serum(tl, ctx, t);
      sweep(tl, ctx, t2);
      tl.to(ctx.q(".film"), { opacity: 0, duration: 0.6 }, t2 + 1.4);
    }
  },

  bright: {
    svg: (id) => frame(id, skin(id) + film(id, C.serum) + glowSweep(id) + drops([70, 120, 170]) +
      `<circle class="ring" cx="120" cy="91" r="6" fill="none" stroke="#fff" stroke-width="1.5" opacity="0"/>` +
      sparkles([[60, 70, 0.9], [110, 60, 1.2], [160, 72, 0.8], [200, 62, 1]])),
    anim(tl, ctx) {
      say(tl, ctx, "1 · AUFHELLENDE WIRKSTOFFE", 0.01);
      const t = serum(tl, ctx, 0);
      say(tl, ctx, "2 · SANFT EINARBEITEN", t);
      const ring = ctx.q(".ring");
      [0, 0.5, 1].forEach((d, i) => tl.fromTo(ring, { attr: { r: 4, cx: 70 + i * 50 }, opacity: 0.9 }, { attr: { r: 18 }, opacity: 0, duration: 0.8 }, t + d));
      say(tl, ctx, "3 · GLOW", t + 1.8);
      sweep(tl, ctx, t + 1.8);
      twinkle(tl, ctx, t + 2);
      tl.to(ctx.q(".film"), { opacity: 0, duration: 0.6 }, t + 3.3);
    }
  },

  classic: {
    svg: (id) => frame(id, skin(id) + film(id, "#ffffff", "mask") + film(id, C.serum) + glowSweep(id) +
      Array.from({ length: 10 }, (_, i) => `<circle class="foam" cx="${25 + i * 21}" cy="${87 - (i % 3) * 2}" r="${3 + (i % 2) * 2}" fill="#fff" opacity="0"/>`).join("") +
      drops([120])),
    anim(tl, ctx) {
      say(tl, ctx, "1 · REINIGUNG", 0.01);
      ctx.qa(".foam").forEach((f, i) => {
        tl.fromTo(f, { opacity: 0, scale: 0, svgOrigin: `${f.cx.baseVal.value} ${f.cy.baseVal.value}` }, { opacity: 0.95, scale: 1, duration: 0.3 }, 0.1 + i * 0.06);
      });
      tl.to(ctx.qa(".foam"), { opacity: 0, x: 30, duration: 0.6, stagger: 0.03 }, 1.5);
      say(tl, ctx, "2 · MASKE", 2.2);
      tl.fromTo(ctx.q(".mask"), { opacity: 0 }, { opacity: 0.75, duration: 0.7 }, 2.2);
      tl.to(ctx.q(".mask"), { opacity: 0, duration: 0.5 }, 3.4);
      say(tl, ctx, "3 · PFLEGE", 3.8);
      const t = serum(tl, ctx, 3.8);
      sweep(tl, ctx, t - 0.4);
      tl.to(ctx.q(".film"), { opacity: 0, duration: 0.6 }, t + 0.8);
    }
  },

  massage: face(false),
  "massage-long": face(true),

  /* ---- Nägel ---- */
  "nail-new": nailScene({
    shape: "ext", start: "nat", color: C.nude, gold: true,
    steps: ["VORHER · NATURNAGEL", "AUFBAU MIT GEL", "NACHHER · MIT DESIGN"]
  }),
  "nail-fill": nailScene({ shape: "ext", start: "gap", color: C.rose, steps: ["VORHER · NACHGEWACHSEN", "AUFFÜLLEN", "NACHHER · WIE FRISCH GEMACHT"] }),
  "nail-french": nailScene({ shape: "ext", start: "base", color: "#f3d3c8", french: true, steps: ["VORHER", "FRENCH", "BABYBOOMER"] }),
  "nail-shellac": nailScene({ shape: "nat", start: "nat", color: C.red, uv: true, steps: ["VORHER", "SHELLAC AUFTRAGEN", "AUSHÄRTEN · NACHHER"] }),
  "nail-mani": nailScene({ shape: "nat", start: "nat", mani: true, steps: ["VORHER", "KÜRZEN & FORMEN", "NACHHER · GEPFLEGT"] }),
  "nail-remove": nailScene({ shape: "ext", start: "full", color: C.red, remove: true, steps: ["VORHER · MODELLAGE", "SCHONEND ABTRAGEN", "NACHHER · NATURNAGEL"] }),
  "nail-art": nailScene({ shape: "ext", start: "base", color: "#f3d3c8", art: true, steps: ["VORHER", "NAIL ART", "NACHHER"] }),
  "nail-repair": nailScene({ shape: "ext", start: "full", color: C.rose, crack: true, steps: ["VORHER · EINGERISSEN", "REPARIEREN", "NACHHER"] }),

  /* ---- Füße ---- */
  "toe-shellac": nailScene({ toe: true, shape: "nat", start: "nat", color: C.red, bath: true, uv: true, steps: ["PFLEGE", "SHELLAC", "NACHHER"] }),
  "toe-lack": nailScene({ toe: true, shape: "nat", start: "nat", color: C.coral, bath: true, steps: ["PFLEGE", "NAGELLACK", "NACHHER"] }),
  "toe-model": nailScene({ toe: true, shape: "ext", start: "nat", color: C.nude, steps: ["VORHER", "MODELLIEREN", "NACHHER"] }),
  "toe-care": nailScene({ toe: true, shape: "nat", start: "nat", bath: true, mani: true, steps: ["FUSSBAD", "KÜRZEN & FORMEN", "EINCREMEN"] })
};

function face(long) {
  const PROFILE = "M170 -10 C134 -8 110 22 108 46 C107 54 104 58 100 64 C98 67 101 69 104 69 C103 73 104 76 106 77 C104 79 105 82 107 83 C106 90 109 95 116 96 C124 97 128 100 130 110 L136 160 L250 160 L250 -10 Z";
  return {
    svg: (id) => frame(id, `
      <path d="${PROFILE}" fill="${C.skinTop}"/>
      <path d="M170 -10 C134 -8 110 22 108 46 C107 54 104 58 100 64 C98 67 101 69 104 69 C103 73 104 76 106 77 C104 79 105 82 107 83 C106 90 109 95 116 96 C124 97 128 100 130 110 L136 160" fill="none" stroke="${C.goldDeep}" stroke-width="1.4"/>
      <path d="M118 50 q6 3 12 0" fill="none" stroke="${C.ink}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M116 44 q8 -4 16 -1" fill="none" stroke="${C.goldDeep}" stroke-width="1" stroke-linecap="round"/>
      <circle class="wave" cx="140" cy="70" r="6" fill="none" stroke="${C.gold}" opacity="0"/>
      <circle class="h1" cx="140" cy="70" r="15" fill="url(#${id}hand)"/>
      <circle class="h2" cx="140" cy="70" r="11" fill="url(#${id}hand)"/>`),
    anim(tl, ctx) {
      const h1 = ctx.q(".h1"), h2 = ctx.q(".h2"), wave = ctx.q(".wave");
      const circle = (cx, cy, r, at, dur) => {
        const s = { a: 0 };
        tl.to(s, {
          a: Math.PI * 4, duration: dur, ease: "sine.inOut",
          onUpdate() {
            h1.setAttribute("cx", cx + Math.cos(s.a) * r); h1.setAttribute("cy", cy + Math.sin(s.a) * r);
            h2.setAttribute("cx", cx + Math.cos(s.a + Math.PI) * r * 0.7); h2.setAttribute("cy", cy + Math.sin(s.a + Math.PI) * r * 0.7);
          }
        }, at);
        [0, 1, 2].forEach((i) => tl.fromTo(wave, { attr: { r: 6, cx, cy }, opacity: 0.8 }, { attr: { r: 26 }, opacity: 0, duration: 1.2 }, at + i * 0.9));
      };
      say(tl, ctx, "SANFTE MASSAGE · GESICHT", 0.01);
      circle(142, 66, 9, 0, 3);
      if (long) {
        say(tl, ctx, "HALS & DEKOLLETÉ", 3.1);
        circle(170, 122, 12, 3.1, 3);
      }
    }
  };
}

function nailScene(o) {
  const toe = !!o.toe;
  const nat = toe ? TOE_NAT : NAIL_NAT;
  const ext = toe ? TOE_EXT : NAIL_EXT;
  const finalShape = o.shape === "ext" ? ext : nat;
  const top = toe ? 60 : 12, bottom = toe ? 131 : 104;
  const cx = 120, baseY = toe ? 128 : 101;

  return {
    svg: (id) => frame(id, `
      <defs>
        <clipPath id="${id}nc"><path d="${finalShape}"/></clipPath>
        <linearGradient id="${id}bb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".6"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
      </defs>
      ${o.bath ? bubbles(8, 140, "bath") : ""}
      <path d="${toe ? TOE : FINGER}" fill="${C.finger}"/>
      <path d="${toe ? "M70 140 q50 8 100 0" : "M92 112 q28 6 56 0"}" fill="none" stroke="${C.fingerLine}" stroke-width="1"/>
      <path class="ext" d="${ext}" fill="${C.ext}" stroke="${C.fingerLine}" opacity="${o.shape === "ext" ? 1 : 0}"/>
      <path class="nat" d="${nat}" fill="${C.nat}" stroke="${C.fingerLine}"/>
      ${o.mani ? `<path class="edge" d="${toe ? "M86 92 C86 62 154 62 154 92 C146 76 94 76 86 92Z" : "M99 60 C99 36 141 34 141 60 C134 48 106 48 99 60Z"}" fill="#fff4ee" stroke="${C.fingerLine}"/>
        <path class="cut" d="${toe ? "M90 124 q30 7 60 0" : "M102 100 q18 4 36 0"}" fill="none" stroke="#d9a28a" stroke-width="2.2" stroke-linecap="round"/>` : ""}
      <g clip-path="url(#${id}nc)">
        <rect class="col" x="70" y="${bottom}" width="100" height="${bottom - top + 10}" fill="${o.color || "transparent"}"/>
        ${o.french ? `<path class="tip" d="M96 ${top - 4} V40 C110 48 130 48 144 40 V${top - 4}Z" fill="#fffdfa"/>
          <rect class="bb" x="96" y="${top - 4}" width="48" height="70" fill="url(#${id}bb)" opacity="0"/>` : ""}
        ${o.gold ? `<path class="gl" d="M110 86 C118 70 108 52 124 30" fill="none" stroke="${C.gold}" stroke-width="2" stroke-linecap="round"/>` : ""}
        ${o.art ? `<path class="gl" d="M104 78 C116 64 126 70 136 50" fill="none" stroke="${C.gold}" stroke-width="1.6" stroke-linecap="round"/>
          <circle class="ad" cx="112" cy="58" r="2.2" fill="${C.gold}"/><circle class="ad" cx="128" cy="76" r="1.8" fill="${C.gold}"/><circle class="ad" cx="122" cy="40" r="1.5" fill="${C.gold}"/>
          <path class="gem" d="M120 84 l5 -5 l5 5 l-5 6z" fill="#fff" stroke="${C.goldDeep}" stroke-width=".8"/>` : ""}
        ${o.crack ? `<path class="crack" d="M124 16 l-4 8 l5 5 l-5 8" fill="none" stroke="#7a4a3c" stroke-width="1.3"/>` : ""}
        <rect class="gloss" x="40" y="0" width="12" height="160" fill="#fff" opacity=".55" transform="skewX(-18)"/>
      </g>
      ${o.uv ? `<g class="uvl" opacity="0"><ellipse cx="120" cy="${top + 10}" rx="70" ry="44" fill="url(#${id}uv)"/>
        <path d="M60 ${top - 8} Q120 ${top - 40} 180 ${top - 8}" fill="none" stroke="${C.ink}" stroke-width="5" stroke-linecap="round"/></g>` : ""}
      ${brush(o.color || C.gold)}${o.mani || o.remove ? file() : ""}
      ${sparkles([[150, top + 12, 0.9], [96, top + 30, 0.7], [146, top + 46, 0.6]])}`),

    anim(tl, ctx) {
      const s = o.steps;
      const col = ctx.q(".col"), b = ctx.q(".brush"), gloss = ctx.q(".gloss");
      const extEl = ctx.q(".ext"), natEl = ctx.q(".nat");
      const origin = `${cx} ${baseY}`;
      const paint = (at, dur = 1.2, fromY = bottom, toY = top - 6) => {
        tl.fromTo(col, { attr: { y: fromY } }, { attr: { y: toY }, duration: dur, ease: "power1.inOut" }, at);
        tl.fromTo(b, { x: cx, y: fromY + 4 }, { x: cx, y: toY + 10, duration: dur, ease: "power1.inOut" }, at);
        tl.to(b, { x: 260, y: -20, duration: 0.5, ease: "power2.in" }, at + dur);
      };
      const shine = (at) => tl.fromTo(gloss, { x: 0 }, { x: 170, duration: 0.9, ease: "power2.inOut" }, at);

      // Grundzustand bei jedem Durchlauf
      tl.set(b, { x: -40, y: -40 }, 0);
      tl.set(gloss, { x: 0 }, 0);
      if (o.start === "nat") {
        tl.set(col, { attr: { y: bottom + 10 } }, 0);
        if (o.shape === "ext") tl.set(extEl, { opacity: 0, scaleY: 0.55, svgOrigin: origin }, 0);
      } else if (o.start === "gap") {
        tl.set(col, { attr: { y: top - 6, height: bottom - top - 8 } }, 0);
      } else { // base / full
        tl.set(col, { attr: { y: top - 6, height: bottom - top + 10 } }, 0);
      }

      say(tl, ctx, s[0], 0.01);
      let t = 1.1;

      if (o.bath) {
        ctx.qa(".bath").forEach((c, i) => {
          tl.fromTo(c, { y: 0 }, { y: -60 - (i % 3) * 12, duration: 1.4, ease: "sine.out" }, 0.1 + i * 0.08);
          tl.fromTo(c, { opacity: 0 }, { opacity: 0.9, duration: 0.5, yoyo: true, repeat: 1, repeatDelay: 0.4 }, 0.1 + i * 0.08);
        });
        t = 1.6;
      }

      say(tl, ctx, s[1], t);

      if (o.mani) {
        const f = ctx.q(".file");
        tl.fromTo(f, { x: cx - 20, y: toe ? 72 : 52 }, { x: cx + 20, duration: 0.22, repeat: 5, yoyo: true, ease: "sine.inOut" }, t);
        tl.fromTo(ctx.q(".edge"), { opacity: 1 }, { opacity: 0, duration: 1.2 }, t);
        tl.to(f, { x: 270, y: -30, duration: 0.4 }, t + 1.35);
        tl.fromTo(ctx.q(".cut"), { opacity: 1 }, { opacity: 0, duration: 0.6 }, t + 1.3);
        t += 1.9;
      }

      if (o.shape === "ext" && o.start === "nat") {
        tl.to(extEl, { opacity: 1, scaleY: 1, svgOrigin: origin, duration: 1, ease: "power3.out" }, t);
        tl.to(natEl, { opacity: 0, duration: 0.5 }, t + 0.4);
        paint(t + 0.9);
        t += 2.4;
      } else if (o.start === "gap") {
        tl.fromTo(b, { x: cx, y: bottom - 8 }, { x: cx + 10, y: bottom - 14, duration: 0.6, yoyo: true, repeat: 1 }, t);
        tl.to(col, { attr: { height: bottom - top + 10 }, duration: 1, ease: "power2.inOut" }, t + 0.2);
        tl.to(b, { x: 260, y: -20, duration: 0.5 }, t + 1.3);
        t += 1.8;
      } else if (o.remove) {
        const f = ctx.q(".file");
        tl.fromTo(f, { x: cx - 18, y: toe ? 90 : 60 }, { x: cx + 18, duration: 0.2, repeat: 7, yoyo: true }, t);
        tl.to(col, { opacity: 0, duration: 1.4 }, t);
        tl.to(extEl, { scaleY: 0.55, svgOrigin: origin, opacity: 0, duration: 1.4 }, t + 0.2);
        tl.set(natEl, { opacity: 1 }, t);
        tl.to(f, { x: 270, y: -30, duration: 0.4 }, t + 1.6);
        t += 2.1;
      } else if (o.crack) {
        const c = ctx.q(".crack");
        tl.set(c, { opacity: 1 }, 0);
        tl.fromTo(b, { x: 124, y: 40 }, { y: 20, duration: 0.4, yoyo: true, repeat: 2 }, t);
        tl.to(c, { opacity: 0, duration: 1 }, t + 0.3);
        tl.to(b, { x: 260, y: -20, duration: 0.5 }, t + 1.3);
        t += 1.8;
      } else if (o.color && o.start === "nat") {
        if (o.shape === "nat") tl.set(natEl, { opacity: 1 }, 0);
        paint(t);
        t += 1.8;
      }

      if (o.french) {
        const tip = ctx.q(".tip"), bb = ctx.q(".bb");
        tl.fromTo(tip, { scaleY: 0, svgOrigin: `${cx} ${top}`, opacity: 1 }, { scaleY: 1, duration: 0.9, ease: "power2.out" }, t);
        t += 1.6;
        say(tl, ctx, s[2], t);
        tl.to(tip, { opacity: 0, duration: 0.8 }, t);
        tl.fromTo(bb, { opacity: 0 }, { opacity: 1, duration: 0.8 }, t);
        shine(t + 0.8);
        tl.to(bb, { opacity: 0, duration: 0.4 }, t + 2.4);
        return;
      }

      if (o.gold || o.art) {
        const gl = ctx.q(".gl");
        const len = gl.getTotalLength();
        tl.fromTo(gl, { attr: { "stroke-dasharray": len, "stroke-dashoffset": len } }, { attr: { "stroke-dashoffset": 0 }, duration: 0.9, ease: "power2.inOut" }, t);
        if (o.art) {
          ctx.qa(".ad").forEach((d, i) => tl.fromTo(d, { scale: 0, svgOrigin: `${d.cx.baseVal.value} ${d.cy.baseVal.value}` }, { scale: 1, duration: 0.3, ease: "back.out(3)" }, t + 0.5 + i * 0.15));
          tl.fromTo(ctx.q(".gem"), { scale: 0, svgOrigin: "125 84" }, { scale: 1, duration: 0.4, ease: "back.out(3)" }, t + 1);
        }
        t += 1.4;
      }

      if (o.uv) {
        tl.fromTo(ctx.q(".uvl"), { opacity: 0 }, { opacity: 1, duration: 0.4, yoyo: true, repeat: 3 }, t);
        t += 1.8;
      }

      say(tl, ctx, s[2], t);
      shine(t + 0.1);
      twinkle(tl, ctx, t + 0.2);
      tl.to({}, { duration: 1.2 }, t + 1);
    }
  };
}

/* ---------- Öffentliche Schnittstelle ---------- */
export function createScene(host, { reducedMotion = false } = {}) {
  const type = host.dataset.anim;
  const scene = SCENES[type];
  if (!scene || !gsap) return null;
  const id = `tr${++uid}`;
  host.insertAdjacentHTML("afterbegin", scene.svg(id));
  const svg = host.querySelector("svg");
  const ctx = {
    svg,
    cap: svg.querySelector(".cap"),
    q: (sel) => svg.querySelector(sel),
    qa: (sel) => [...svg.querySelectorAll(sel)]
  };
  const tl = gsap.timeline({ paused: true, repeat: -1, repeatDelay: 0.8 });
  scene.anim(tl, ctx);
  if (reducedMotion) tl.progress(0.97).pause();
  return {
    play() { if (!reducedMotion) tl.play(); },
    pause() { tl.pause(); },
    seek(time) { tl.pause(time, false); } // für tools/anim-test.html (Beschriftungen mitsetzen)
  };
}
