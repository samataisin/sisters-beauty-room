import { initHero3D } from "./hero3d.js";
import { createScene } from "./treatments.js";

const root = document.documentElement;
root.classList.add("js");
// Animationen laufen überall (Wunsch Samat, 2026-11-24). Bei der Einstellung „wenig Bewegung“
// (Windows/iPhone) gilt ein sanfter Modus: kein Nachgleiten beim Scrollen, keine gepinnte
// Galerie, kein Parallax, kein Kippen. ?motion=1 schaltet auch das volle Programm ein (Test).
const calmMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  && !new URLSearchParams(location.search).has("motion");
if (calmMotion) root.classList.add("calm-motion");

const { gsap, ScrollTrigger, Lenis } = window;
const cfg = window.SITE_CONFIG || {};

/* ---------- Kontakt-Links aus config.js ---------- */
const waUrl = `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(cfg.whatsappText || "")}`;
document.querySelectorAll("[data-wa]").forEach((a) => { a.href = waUrl; a.target = "_blank"; a.rel = "noopener"; });
document.querySelectorAll("[data-ig]").forEach((a) => (a.href = cfg.instagramSalon));
document.querySelectorAll("[data-ig-jessica]").forEach((a) => (a.href = cfg.instagramJessica));
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

/* ---------- 3D-Hero ---------- */
let hero3d = null;
const canvas = document.getElementById("hero3d");
try {
  hero3d = canvas ? initHero3D(canvas) : null;
} catch (err) {
  console.warn("3D-Szene konnte nicht starten:", err);
}
if (!hero3d) root.classList.add("no-webgl");

/* ---------- Menü (mobil) ---------- */
const burger = document.querySelector(".burger");
const nav = document.getElementById("nav");
function setMenu(open) {
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
  nav.classList.toggle("is-open", open);
  document.body.style.overflow = open ? "hidden" : "";
  if (lenis) open ? lenis.stop() : lenis.start();
}
burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
nav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setMenu(false)));

/* ---------- Preis-Tabs ---------- */
const tabs = [...document.querySelectorAll(".tab")];
const ink = document.querySelector(".tabs__ink");
function moveInk(tab) {
  if (!ink || !tab) return;
  ink.style.width = `${tab.offsetWidth}px`;
  ink.style.transform = `translateX(${tab.offsetLeft}px)`;
}
function selectTab(tab) {
  document.querySelectorAll('.treat__row[aria-expanded="true"]').forEach((btn) => toggleTreat(btn, false));
  tabs.forEach((t) => {
    const active = t === tab;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", String(active));
    t.tabIndex = active ? 0 : -1;
    const panel = document.getElementById(t.getAttribute("aria-controls"));
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
    if (active && gsap) {
      gsap.fromTo(panel.querySelectorAll("li"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: "power3.out" });
    }
  });
  moveInk(tab);
  ScrollTrigger?.refresh();
}
tabs.forEach((t, i) => {
  t.addEventListener("click", () => selectTab(t));
  t.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
    next.focus();
    selectTab(next);
  });
});
window.addEventListener("resize", () => moveInk(document.querySelector(".tab.is-active")));
document.fonts?.ready.then(() => moveInk(document.querySelector(".tab.is-active")));
moveInk(document.querySelector(".tab.is-active"));

/* ---------- Header: Hintergrund ab Scroll, beim Runterscrollen ausblenden ---------- */
const header = document.querySelector(".header");
let lastY = window.scrollY;
function updateHeader() {
  const y = window.scrollY;
  header.classList.toggle("is-scrolled", y > 40);
  header.classList.toggle("is-hidden", y > 400 && y > lastY + 2 && !nav.classList.contains("is-open"));
  if (y < lastY - 2 || y <= 400) header.classList.remove("is-hidden");
  lastY = y;
}
window.addEventListener("scroll", updateHeader, { passive: true });
updateHeader();

/* ---------- Hintergrund-Animationen: Goldstaub erzeugen, außerhalb des Bildes pausieren ---------- */
document.querySelectorAll(".bg-fx .dust").forEach((dust) => {
  const n = +dust.dataset.count || 12;
  const small = window.matchMedia("(max-width: 860px)").matches;
  for (let i = 0; i < (small ? Math.ceil(n / 2) : n); i++) {
    const p = document.createElement("i");
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${55 + Math.random() * 45}%`;
    p.style.setProperty("--s", `${2 + Math.random() * 4}px`);
    p.style.setProperty("--d", `${10 + Math.random() * 10}s`);
    p.style.setProperty("--delay", `${-Math.random() * 20}s`);
    dust.appendChild(p);
  }
});
/* Zusätzliche Effekte je Abschnitt (werden per JS erzeugt, damit das HTML schlank bleibt) */
const FX = {
  leistungen: ["rings:right", "bokeh"],
  preise: ["leaf:right", "bokeh"],
  galerie: ["rings:left", "bokeh:gold"],
  team: ["face", "leaf:left", "bokeh"],
  kontakt: ["rings:left", "bokeh:gold"]
};
const isSmall = window.matchMedia("(max-width: 860px)").matches;
const rand = (a, b) => a + Math.random() * (b - a);
const svgNS = "http://www.w3.org/2000/svg";

const fxBuilders = {
  rings(side) {
    const el = document.createElement("div");
    el.className = "rings";
    el.innerHTML = "<i></i><i></i><i></i>";
    Object.assign(el.style, side === "right" ? { right: "-140px", top: "8%" } : { left: "-160px", bottom: "6%" });
    return el;
  },
  bokeh(variant) {
    const frag = document.createDocumentFragment();
    const n = isSmall ? 5 : 9;
    for (let i = 0; i < n; i++) {
      const b = document.createElement("span");
      b.className = `bokeh${variant === "gold" || i % 3 === 0 ? " bokeh--gold" : ""}`;
      const size = rand(40, isSmall ? 100 : 150);
      Object.assign(b.style, { width: `${size}px`, height: `${size}px`, left: `${rand(0, 95)}%`, top: `${rand(0, 90)}%` });
      b.style.setProperty("--x", `${rand(-90, 90)}px`);
      b.style.setProperty("--y", `${rand(-90, 60)}px`);
      b.style.setProperty("--d", `${rand(10, 20)}s`);
      b.style.setProperty("--delay", `${-rand(0, 20)}s`);
      frag.appendChild(b);
    }
    return frag;
  },
  leaf(side) {
    // Palmwedel: geschwungener Stiel mit Blättchen links und rechts
    const P = (t) => ({ x: (1 - t) ** 2 * 20 + 2 * (1 - t) * t * 300 + t * t * 580, y: (1 - t) ** 2 * 390 + 2 * (1 - t) * t * 110 + t * t * 50 });
    let d = "";
    for (let i = 0; i < 18; i++) {
      const t = 0.1 + i * 0.048;
      const p = P(t), q = P(t + 0.01);
      const ang = Math.atan2(q.y - p.y, q.x - p.x) * 180 / Math.PI;
      const L = 150 * (1 - t * 0.6), W = 9 * (1 - t * 0.4);
      [-58, 58].forEach((off) => {
        const a = (ang + off) * Math.PI / 180;
        const tip = { x: p.x + Math.cos(a) * L, y: p.y + Math.sin(a) * L };
        const n = { x: -Math.sin(a) * W, y: Math.cos(a) * W };
        d += `M${p.x.toFixed(1)} ${p.y.toFixed(1)} Q${((p.x + tip.x) / 2 + n.x).toFixed(1)} ${((p.y + tip.y) / 2 + n.y).toFixed(1)} ${tip.x.toFixed(1)} ${tip.y.toFixed(1)} Q${((p.x + tip.x) / 2 - n.x).toFixed(1)} ${((p.y + tip.y) / 2 - n.y).toFixed(1)} ${p.x.toFixed(1)} ${p.y.toFixed(1)}Z `;
      });
    }
    d += "M20 390 Q300 110 580 50 L582 56 Q302 118 24 394Z";
    const wrap = document.createElement("div");
    Object.assign(wrap.style, { position: "absolute", top: "-4%", [side === "right" ? "right" : "left"]: "-6%", transform: side === "right" ? "scaleX(-1)" : "none" });
    wrap.innerHTML = `<svg class="leaf" viewBox="0 0 640 420" xmlns="${svgNS}"><path d="${d}"/></svg>`;
    wrap.firstElementChild.style.position = "relative";
    return wrap;
  },
  face() {
    const prof = "M140 20 C84 30 66 104 96 150 C104 162 98 172 108 178 C102 186 110 190 114 192 C110 198 116 204 118 206 C114 220 122 232 138 232 C158 234 158 262 148 300 C138 340 156 370 196 384";
    const el = document.createElement("div");
    el.innerHTML = `<svg class="face" viewBox="0 0 400 400" xmlns="${svgNS}"><path d="${prof}"/><path transform="translate(420 -16) scale(-1 1)" d="${prof}"/></svg>`;
    const svg = el.firstElementChild;
    Object.assign(svg.style, isSmall ? { right: "-10%", top: "2%" } : { right: "4%", top: "6%" });
    return svg;
  }
};

Object.entries(FX).forEach(([id, list]) => {
  const fx = document.getElementById(id)?.querySelector(".bg-fx");
  if (!fx) return;
  list.forEach((entry) => {
    const [name, arg] = entry.split(":");
    fx.appendChild(fxBuilders[name](arg));
  });
});

/* Goldschein folgt der Maus (nur mit Maus, nicht auf Touch) */
if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const glow = document.createElement("div");
  glow.className = "cursor-glow";
  glow.setAttribute("aria-hidden", "true");
  document.body.appendChild(glow);
  const pos = { x: innerWidth / 2, y: innerHeight / 2, tx: innerWidth / 2, ty: innerHeight / 2 };
  let raf = 0;
  const tick = () => {
    pos.x += (pos.tx - pos.x) * 0.12;
    pos.y += (pos.ty - pos.y) * 0.12;
    glow.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
    raf = Math.abs(pos.tx - pos.x) + Math.abs(pos.ty - pos.y) > 0.5 ? requestAnimationFrame(tick) : 0;
  };
  window.addEventListener("pointermove", (e) => {
    pos.tx = e.clientX; pos.ty = e.clientY;
    glow.classList.add("is-on");
    if (!raf) raf = requestAnimationFrame(tick);
  }, { passive: true });
  document.addEventListener("pointerleave", () => glow.classList.remove("is-on"));
}

const fxObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.target.classList.toggle("is-paused", !e.isIntersecting));
}, { rootMargin: "100px" });
document.querySelectorAll(".bg-fx, .contact__card").forEach((el) => fxObserver.observe(el));

/* ---------- Behandlungen aufklappen (Beschreibung + Animation) ---------- */
const scenes = new Map();
const refreshLayout = () => window.ScrollTrigger?.refresh();

function toggleTreat(btn, force) {
  const detail = document.getElementById(btn.getAttribute("aria-controls"));
  const open = force ?? btn.getAttribute("aria-expanded") !== "true";
  if (open === (btn.getAttribute("aria-expanded") === "true")) return;
  const anim = detail.querySelector(".treat__anim");
  const animate = !!gsap;

  if (open) {
    // Nur ein Eintrag pro Liste offen
    btn.closest(".price-list").querySelectorAll('.treat__row[aria-expanded="true"]').forEach((b) => toggleTreat(b, false));
    btn.setAttribute("aria-expanded", "true");
    detail.hidden = false;
    if (!scenes.has(anim)) scenes.set(anim, createScene(anim));
    scenes.get(anim)?.play();
    if (animate) {
      gsap.fromTo(detail, { height: 0, opacity: 0 }, { height: "auto", opacity: 1, duration: 0.6, ease: "power3.out", onComplete: refreshLayout });
    } else refreshLayout();
  } else {
    btn.setAttribute("aria-expanded", "false");
    scenes.get(anim)?.pause();
    const done = () => { detail.hidden = true; detail.style.height = ""; refreshLayout(); };
    if (animate) gsap.to(detail, { height: 0, opacity: 0, duration: 0.45, ease: "power3.inOut", onComplete: done });
    else done();
  }
}

document.querySelectorAll(".treat__row").forEach((btn) => {
  const detail = document.getElementById(btn.getAttribute("aria-controls"));
  const name = btn.querySelector(".treat__title").textContent;
  const wa = detail.querySelector("[data-wa]");
  if (wa) {
    const text = `Hallo Jessica, ich interessiere mich für: ${name}. Wann hättest du einen Termin frei?`;
    wa.href = `https://wa.me/${cfg.whatsappNumber}?text=${encodeURIComponent(text)}`;
  }
  btn.addEventListener("click", () => toggleTreat(btn));
});

/* ---------- Ohne GSAP oder mit reduzierter Bewegung: alles sofort zeigen ---------- */
let lenis = null;
function hidePreloader() {
  document.body.classList.remove("is-loading");
  document.querySelector(".preloader")?.remove();
}
if (!gsap || !ScrollTrigger) {
  document.querySelectorAll("[data-reveal]").forEach((el) => { el.style.opacity = 1; el.style.transform = "none"; });
  hidePreloader();
} else {
  initMotion();
}

function initMotion() {
  gsap.registerPlugin(ScrollTrigger);

  /* Sanftes Scrollen (nur Maus/Trackpad; Touch scrollt nativ) */
  if (Lenis && !calmMotion) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { offset: id === "#hero" ? 0 : -60 });
      });
    });
  }

  /* Überschriften Wort für Wort aufbauen */
  document.querySelectorAll("[data-split]").forEach(splitWords);

  /* Preloader raus, dann Hero-Intro */
  const intro = gsap.timeline({ paused: true });
  intro
    .to(".preloader", { yPercent: -100, duration: 1.0, ease: "power4.inOut", onComplete: hidePreloader })
    .from(".hero__title .line > span", { yPercent: 110, duration: 1.2, stagger: 0.12, ease: "power4.out" }, "-=0.45")
    .from("[data-hero-fade]", { opacity: 0, y: 24, duration: 1, stagger: 0.1, ease: "power3.out" }, "-=0.9")
    .from(".header", { opacity: 0, y: -20, duration: 0.8, ease: "power3.out", clearProps: "transform,opacity" }, "-=0.9")
    .from(".hero__canvas", { opacity: 0, scale: 1.08, duration: 1.6, ease: "power2.out" }, "-=1.4");

  let started = false;
  const go = () => { if (!started) { started = true; intro.play(); } };
  if (document.readyState === "complete") setTimeout(go, 500);
  else window.addEventListener("load", () => setTimeout(go, 350));
  setTimeout(go, 2500); // Sicherheitsnetz bei langsamen Bildern

  /* Hero: Text bewegt sich weg, 3D-Perle reagiert auf Scroll */
  ScrollTrigger.create({
    trigger: ".hero", start: "top top", end: "bottom top", scrub: true,
    onUpdate: (self) => hero3d?.setScroll(self.progress)
  });
  gsap.to(".hero__content", {
    yPercent: -18, opacity: 0, ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true }
  });

  /* Laufband: läuft gleichmäßig per CSS, unabhängig vom Scrollen (Wunsch Samat) */

  /* Einblenden beim Scrollen */
  ScrollTrigger.batch("[data-reveal]", {
    start: "top 88%",
    onEnter: (els) => gsap.to(els, { opacity: 1, y: 0, duration: 1.1, stagger: 0.1, ease: "power3.out", overwrite: true })
  });

  document.querySelectorAll("[data-split]").forEach((el) => {
    gsap.from(el.querySelectorAll(".w > span"), {
      yPercent: 110, duration: 1.1, stagger: 0.05, ease: "power4.out",
      scrollTrigger: { trigger: el, start: "top 85%" }
    });
  });

  const mm = gsap.matchMedia();

  /* Desktop: Galerie horizontal, Bild-Parallax, 3D-Tilt der Karten */
  if (!calmMotion) mm.add("(min-width: 861px)", () => {
    const pin = document.querySelector(".gallery__pin");
    const gTrack = document.querySelector(".gallery__track");
    const distance = () => Math.max(0, gTrack.scrollWidth + gTrack.offsetLeft - window.innerWidth + 80);
    gsap.to([".gallery__intro", gTrack], {
      x: () => -distance(), ease: "none",
      scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${distance()}`, pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 }
    });
    gsap.utils.toArray(".shot img").forEach((img) => {
      gsap.fromTo(img, { scale: 1.15 }, { scale: 1, ease: "none", scrollTrigger: { trigger: pin, start: "top top", end: () => `+=${distance()}`, scrub: true } });
    });

    gsap.utils.toArray(".member__img img").forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: "none",
        scrollTrigger: { trigger: img.closest(".member"), start: "top bottom", end: "bottom top", scrub: true }
      });
    });

    const cleanups = [];
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      document.querySelectorAll("[data-tilt]").forEach((card) => {
        const rx = gsap.quickTo(card, "rotationX", { duration: 0.6, ease: "power3.out" });
        const ry = gsap.quickTo(card, "rotationY", { duration: 0.6, ease: "power3.out" });
        gsap.set(card, { transformPerspective: 900 });
        const move = (e) => {
          const r = card.getBoundingClientRect();
          ry(((e.clientX - r.left) / r.width - 0.5) * 8);
          rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
        };
        const leave = () => { rx(0); ry(0); };
        card.addEventListener("pointermove", move);
        card.addEventListener("pointerleave", leave);
        cleanups.push(() => { card.removeEventListener("pointermove", move); card.removeEventListener("pointerleave", leave); });
      });
    }
    return () => cleanups.forEach((fn) => fn());
  });

  /* Handy: Galerie-Bilder einzeln einblenden */
  mm.add(calmMotion ? "all" : "(max-width: 860px)", () => {
    gsap.utils.toArray(".shot").forEach((shot, i) => {
      gsap.from(shot, { opacity: 0, y: 30, duration: 0.9, delay: (i % 2) * 0.08, ease: "power3.out", scrollTrigger: { trigger: shot, start: "top 92%" } });
    });
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
}

/* Wörter einer Überschrift in maskierte Spans packen, <em> bleibt erhalten */
function splitWords(el) {
  const wrapText = (text) => {
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
      const w = document.createElement("span");
      w.className = "w";
      const inner = document.createElement("span");
      inner.textContent = part;
      w.appendChild(inner);
      frag.appendChild(w);
    });
    return frag;
  };
  [...el.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) node.replaceWith(wrapText(node.textContent));
    else if (node.nodeType === Node.ELEMENT_NODE) {
      const text = node.textContent;
      node.textContent = "";
      node.appendChild(wrapText(text));
    }
  });
}
