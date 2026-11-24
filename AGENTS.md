# Sisters Beauty Room – Website

One-Page-Website für das Kosmetikstudio von Jessica Karich (Inhaberin), Weil am Rhein.
Auftraggeber/Betreuer: Samat. Status und offene Punkte: [docs/state.md](docs/state.md).

## Stack

- Statisches HTML/CSS/JS, kein Build-Schritt.
- Three.js r170 (3D-Perle im Hero, eigener Shader), GSAP 3.12 + ScrollTrigger, Lenis (sanftes Scrollen).
- Alle Bibliotheken und Schriften liegen lokal in `vendor/` und `fonts/` (DSGVO: keine Anfragen an Google Fonts oder CDNs).
  Quelle: npm-Pakete aus `package.json`; nach `npm i` die Dateien aus `node_modules` nach `vendor/`/`fonts/` kopieren. `node_modules/` gehört nicht ins Repo.

## Struktur

- `index.html` – alle Abschnitte (Hero, Leistungen, Preise, Galerie, Team, Kontakt). Kein eigener Jessica-Abschnitt (Wunsch Samat): Jessica steht als Inhaberin im Team.
- Preisliste: wird aus `tools/build_prices.py` erzeugt (Texte/Preise nur dort ändern, dann `python tools/build_prices.py`). Jeder Eintrag klappt auf: Beschreibung + Animation.
- `js/treatments.js` – SVG-Animationen der Preisliste. Gesicht = nur Ablauf, Nägel/Füße = Vorher/Nachher des Designs. Vorschau aller Animationen: `tools/anim-test.html` (`?t=3` hält bei Sekunde 3).
- Hintergrund-Animationen: `.bg-fx` in den Abschnitten (CSS), pausieren außerhalb des Sichtbereichs.
- `impressum.html`, `datenschutz.html` – Entwürfe mit gelb markierten Lücken (`.todo`)
- `js/config.js` – WhatsApp-Nummer, Instagram-Links (nur hier ändern)
- `js/main.js` – Animationen, Menü, Tabs; `js/hero3d.js` – 3D-Szene
- `css/style.css` – Design-Tokens oben in `:root`
- `assets/img/` – Fotos (Studio + Instagram-Auswahl in `galerie/`)
- `docs/` – Stand, Bild-Prompts

## Regeln

- Keine Heilwerbung (HWG/UWG): keine Heilversprechen, keine medizinischen Wirkungsaussagen. Kein Haut-Vorher/Nachher bei Gesichtsbehandlungen (auch nicht animiert), nur Ablauf. Vorher/Nachher nur für Nagel-/Fußdesign.
- Leistung vor Effekt: 3D pausiert außerhalb des Sichtbereichs, weniger Geometrie auf dem Handy, `prefers-reduced-motion` wird respektiert.
- Lokal starten: `python -m http.server 5173 --directory C:\Users\aisin\Dev\jessica-website` → http://localhost:5173 (ES-Module laufen nicht über `file://`).
- Animationen trotz Windows-Einstellung „Animationen aus“ testen: `http://localhost:5173/?motion=1` (wirkt auf JS und CSS über die Klasse `force-motion`).
