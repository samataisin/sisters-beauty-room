# Bild-Prompts für Nano Banana (polza.ai)

Modell: `google/gemini-2.5-flash-image` (Nano Banana) oder `google/gemini-3-pro-image-preview` (Pro, bessere Details).
Prompts auf Englisch, weil die Modelle damit am zuverlässigsten arbeiten. Fertige Bilder nach `assets/img/` legen.
Regel: keine Vorher-Nachher-Bilder, keine Haut-„Ergebnisse“, keine Menschen, die wie echte Kundinnen wirken.

## 1. Gesichtskosmetik (Karte 01), Format 4:3

```
Editorial still life for a luxury beauty studio. A glass serum bottle with a gold dropper, a jade facial roller and a small ceramic bowl with cream, arranged on warm beige travertine. Soft morning sunlight from the left casting long gentle shadows of a palm leaf. Color palette: cream, sand, blush pink, brushed gold. Shallow depth of field, high-end magazine photography, minimal, calm, no text, no logos, no people.
```

## 2. Hero-Standbild für Social-Media-Vorschau (Open Graph), Format 16:9

```
A single iridescent pearl-like liquid sphere floating above a cream-colored background, thin gold rings orbiting it, tiny gold dust particles in the air. Soft studio light, pearlescent pink and champagne reflections, elegant and calm, luxury beauty aesthetic, lots of empty space on the left side for text, no text, no logos.
```

## 3. Hintergrund-Textur (optional), Format 21:9

```
Abstract close-up of flowing champagne-colored silk fabric with soft folds, warm cream and blush tones, subtle gold sheen, soft diffused light, very calm and minimal, suitable as a website background, no text.
```

## Ablauf

1. Auf polza.ai Guthaben aufladen (ca. 3 ₽ pro Bild bei Nano Banana).
2. In der Web-Oberfläche („Нейростудия“) Modell wählen, Prompt einfügen, Format einstellen.
3. 2–4 Varianten erzeugen, die beste speichern.
4. Bild in den Ordner `Jessica website Projekt` legen und Claude Bescheid geben.

Alternative per API: Schlüssel als Umgebungsvariable `POLZA_API_KEY` setzen (Samat selbst), dann `POST https://polza.ai/api/v1/media`.
