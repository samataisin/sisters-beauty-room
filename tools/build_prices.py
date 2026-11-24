"""Erzeugt die Preisliste (Tabs mit aufklappbaren Behandlungen) in index.html.

Texte und Preise nur hier pflegen, dann ausführen:
    python tools/build_prices.py
Das Skript ersetzt alles zwischen den Markern PRICES:START und PRICES:END.

Regeln für Texte (Heilwerbung, HWG/UWG): keine Heilversprechen, keine
medizinischen Wirkungen, keine Erfolgsgarantien. Gesicht = Ablauf erklären,
Nägel/Füße = Design beschreiben.
"""
from html import escape
from pathlib import Path
import re

# anim: Animationstyp aus js/treatments.js
# mode: "ablauf" (Gesicht: Ablauf der Behandlung) oder "design" (Nägel: Vorher/Nachher des Designs)
PANELS = [
    ("p-gesicht", "t-gesicht", [
        ("microneedling", "Microneedling", "Für ein ebenmäßiger wirkendes Hautbild", "140 €", "needling", "ablauf",
         "Die Haut wird mit einem feinen Needling-Gerät behandelt, danach tragen wir ein abgestimmtes Pflegeserum auf. "
         "Vorab klären wir in einem kurzen Gespräch, ob die Behandlung zu deiner Haut passt."),
        ("nano", "Nano Needling", "Sanfte Behandlung für frischen Glow", "120 €", "nano", "ablauf",
         "Die sanftere Variante: Ein Nano-Aufsatz arbeitet nur an der Hautoberfläche und massiert dabei ein Pflegeserum ein. "
         "Angenehm und gut geeignet, wenn du es zum ersten Mal ausprobierst."),
        ("mdg", "Microdermabrasion Gesicht", "Tiefenreinigung für einen strahlenden Teint", "110 €", "derma", "ablauf",
         "Ein Diamant-Aufsatz trägt abgestorbene Hautschüppchen sanft ab, die gelösten Partikel werden direkt abgesaugt. "
         "Zum Abschluss gibt es eine pflegende Maske."),
        ("mdb", "Microdermabrasion Behandlungsstelle", "z. B. Rücken, Dekolleté u. a.", "auf Anfrage", "derma", "ablauf",
         "Dieselbe Technik wie im Gesicht, zum Beispiel für Rücken oder Dekolleté. "
         "Den Preis nennen wir dir nach Größe der Fläche, frag einfach per WhatsApp."),
        ("fsp", "Fruchtsäurepeeling", "Für ein verfeinert wirkendes, frisches Hautbild", "105 €", "peeling", "ablauf",
         "Ein Peeling mit Fruchtsäuren löst abgestorbene Hautschüppchen. Die Stärke stimmen wir auf deine Haut ab, "
         "danach wird neutralisiert und die Haut gepflegt."),
        ("fsn", "Fruchtsäure + Nano Needling", "Die Kombination für ein klares, gepflegtes Hautgefühl", "150 €", "combo", "ablauf",
         "Erst das Fruchtsäurepeeling, direkt danach Nano Needling mit Pflegeserum. Zwei Schritte in einem Termin."),
        ("bright", "Intens-Bright", "Aufhellende Pflege für einen ebenmäßigen Teint", "170 €", "bright", "ablauf",
         "Eine intensive Pflegebehandlung mit aufhellenden Wirkstoffen. Welche Produkte zu deiner Haut passen, "
         "besprechen wir vor der Behandlung."),
        ("klassisch", "Klassische Gesichtsbehandlung", "Reinigung, Pflege, Entspannung", "95 €", "classic", "ablauf",
         "Reinigung, Peeling, Ausreinigung, Maske und Pflege, abgestimmt auf deinen Hauttyp. Der Klassiker zum Wohlfühlen."),
        ("massage30", "Gesichtsmassage (30 Min.)", "Entspannung für Gesicht und Seele", "39 €", "massage", "ablauf",
         "Eine wohltuende Massage des Gesichts mit pflegendem Öl oder Creme. 30 Minuten nur für dich."),
        ("massage45", "Gesichtsmassage + Hals & Dekolleté (45 Min.)", "Tiefe Entspannung und gepflegte Haut", "59 €", "massage-long", "ablauf",
         "Wie die Gesichtsmassage, zusätzlich mit Hals und Dekolleté. 45 Minuten zum Abschalten."),
    ]),
    ("p-mani", "t-mani", [
        ("neu", "Neumodellage", "inkl. Design", "100 €", "nail-new", "design",
         "Komplett neue Nägel aus Gel, in Form und Länge nach deinem Wunsch, inklusive Design."),
        ("auffuellen", "Auffüllen", "", "70 €", "nail-fill", "design",
         "Der nachgewachsene Bereich wird aufgefüllt und die Form korrigiert, damit deine Modellage wieder wie frisch gemacht aussieht."),
        ("french", "French / Babyboomer", "", "75 €", "nail-french", "design",
         "French mit klassischer weißer Spitze oder Babyboomer mit weichem Verlauf von Rosé zu Weiß."),
        ("shellac", "Shellac", "", "60 €", "nail-shellac", "design",
         "Farblack, der unter der Lampe aushärtet. Er glänzt lange und ist sofort trocken."),
        ("mani", "Kosmetische Maniküre", "", "25 €", "nail-mani", "design",
         "Nägel kürzen und formen, Nagelhaut pflegen, Hände eincremen. Gepflegte Hände ohne Lack."),
        ("entfernen", "Modellage entfernen", "", "30 €", "nail-remove", "design",
         "Gel wird schonend abgetragen, danach pflegen wir deine Naturnägel."),
        ("nailart", "Nail Art", "", "ab 5 €", "nail-art", "design",
         "Linien, Glitzer, Folie oder Steinchen. Der Preis richtet sich nach dem Aufwand."),
        ("reparatur", "Reparatur", "pro Nagel", "5 €", "nail-repair", "design",
         "Ein eingerissener oder abgebrochener Nagel wird repariert und an die anderen angepasst."),
    ]),
    ("p-pedi", "t-pedi", [
        ("pedi-shellac", "Pediküre mit Shellac", "", "70 €", "toe-shellac", "design",
         "Füße baden, Nägel kürzen und formen, Nagelhaut pflegen, Hornhaut sanft entfernen. Zum Schluss Shellac in deiner Wunschfarbe."),
        ("pedi-lack", "Pediküre mit Nagellack", "", "65 €", "toe-lack", "design",
         "Die gleiche Pflege wie bei der Pediküre mit Shellac, zum Schluss klassischer Nagellack."),
        ("fuss-modell", "Fußnägel Modellierung", "", "60 €", "toe-model", "design",
         "Modellage für die Fußnägel, für eine gleichmäßige Form und lange haltende Farbe."),
        ("fusspflege", "Kosmetische Fußpflege", "", "60 €", "toe-care", "design",
         "Füße baden, Nägel kürzen und formen, Hornhaut sanft entfernen, eincremen. "
         "Hinweis: Das ist eine kosmetische Fußpflege, keine medizinische Fußpflege (Podologie)."),
    ]),
]

LABELS = {
    "ablauf": "So läuft die Behandlung ab",
    "design": "Vorher · Nachher (Illustration)",
}


def item(slug, name, sub, price, anim, mode, desc):
    sub_html = f'<span class="treat__sub">{escape(sub)}</span>' if sub else ""
    return f"""            <li class="treat">
              <button class="treat__row" type="button" aria-expanded="false" aria-controls="d-{slug}">
                <span class="treat__name"><span class="treat__title">{escape(name)}</span>{sub_html}</span>
                <span class="treat__price">{escape(price)}</span>
                <i class="treat__plus" aria-hidden="true"></i>
              </button>
              <div class="treat__detail" id="d-{slug}" hidden>
                <div class="treat__inner">
                  <figure class="treat__anim" data-anim="{anim}" role="img" aria-label="{escape(LABELS[mode])}: {escape(name)} (vereinfachte Illustration)">
                    <figcaption>{escape(LABELS[mode])}</figcaption>
                  </figure>
                  <div class="treat__text">
                    <p>{escape(desc)}</p>
                    <a class="link-arrow" data-wa href="#">Termin anfragen <span>→</span></a>
                  </div>
                </div>
              </div>
            </li>"""


def build():
    out = ['      <div class="price-panels">']
    for i, (pid, tid, items) in enumerate(PANELS):
        active = " is-active" if i == 0 else ""
        hidden = "" if i == 0 else " hidden"
        out.append(f'        <div class="price-panel{active}" role="tabpanel" id="{pid}" aria-labelledby="{tid}"{hidden}>')
        out.append('          <ul class="price-list">')
        out += [item(*it) for it in items]
        out.append("          </ul>")
        out.append("        </div>")
    out.append("      </div>")
    return "\n".join(out)


if __name__ == "__main__":
    index = Path(__file__).resolve().parent.parent / "index.html"
    html = index.read_text(encoding="utf-8")
    pattern = re.compile(r"(<!-- PRICES:START -->).*?(<!-- PRICES:END -->)", re.S)
    if not pattern.search(html):
        raise SystemExit("Marker PRICES:START/PRICES:END fehlen in index.html")
    html = pattern.sub(lambda m: m.group(1) + "\n" + build() + "\n      " + m.group(2), html)
    index.write_text(html, encoding="utf-8", newline="\n")
    print("Preisliste aktualisiert:", sum(len(p[2]) for p in PANELS), "Behandlungen")
