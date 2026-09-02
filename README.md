# dualframe.it

Sito statico della brand agency **Dualframe**, pubblicato su GitHub Pages sul
dominio `www.dualframe.it` (vedi `CNAME`).

Nessun build step: i file nella root sono esattamente quelli serviti. Per
lavorarci basta un server statico locale.

```bash
python3 -m http.server 8000
# poi apri http://localhost:8000
```

## Struttura

```
index.html                  homepage (hero, servizi, lavori, chi siamo, pacchetti, contatti)
service-*.html              4 pagine di approfondimento servizio
<progetto>.html             6 case study di portfolio
call.html                   landing standalone per la call gratuita
privacy.html                informativa GDPR
404.html                    pagina di errore servita da GitHub Pages
googlefa*.html              file di verifica Google Search Console (non toccare)

style.css                   design system e layout condivisi
enhancements.css            accessibilità, form, menu mobile, reduced motion
luxury.css                  livello motion della homepage (parallax, hover, servizi)
project-style.css           pagine progetto (hero, palette, cover zoom, lightbox, pager)
service-detail.css          pagine servizio
no-js.css                   fallback caricato solo da <noscript>

script.js                   navbar, menu mobile, reveal on scroll, smooth scroll
luxury.js                   parallax hero e hover magnetico delle card
project.js                  lightbox della cover nelle pagine progetto
form-handler.js             invio AJAX dei form Formspree (progressive enhancement)

assets/fonts/               Inter, Syne, Space Grotesk self-hosted (woff2 variabili)
assets/img/                 logo, icone, foto team, immagini social
assets/img/projects/        cover .webp dei case study, più le .jpg
                            omonime usate solo come og:image
tools/check_site.py         controlli statici (link, head, immagini, sitemap)
```

## Convenzioni

**Fonts.** Inter, Syne e Space Grotesk sono self-hosted in `assets/fonts/`
(woff2 variabili, subset latin + latin-ext, licenza SIL OFL 1.1). Nessuna
richiesta esce verso Google Fonts: la CSP di ogni pagina dichiara
`font-src 'self'`. Le due facce critiche sono in `<link rel="preload">`.

**CSP.** Ogni pagina porta la stessa policy in un `<meta http-equiv>`.
Non è possibile usare `<script>` inline: `script-src` è `'self'`. Gli stili
inline sono ammessi (`style-src 'unsafe-inline'`) perché alcune pagine hanno
un blocco `<style>` nel head.

**Immagini.** Le pagine servono `.webp`; le `.jpg` con lo stesso nome restano
solo perché alcuni scraper social non leggono webp e sono referenziate da
`og:image`. Ogni `<img>` deve avere `alt`, `width` e `height` (evita layout
shift) e, se sotto la piega, `loading="lazy" decoding="async"`.

Ogni cover progetto esiste in quattro misure: `<slug>-600.webp`,
`-800.webp`, `-1200.webp` e la piena `<slug>.webp` (1920w). Griglia lavori e
card servizio usano `srcset` con le prime tre; la cover della pagina progetto
le usa tutte e quattro, perché la 1920 è anche la sorgente del lightbox a
schermo intero. Le derivate si rigenerano con `python3 tools/resize_covers.py`.
Se cambi il `srcset` di una cover, aggiorna anche l'`imagesrcset` del
`<link rel="preload">` nella stessa pagina: se i due divergono il browser
scarica due immagini invece di una.

**Servizi.** Ogni pagina servizio dichiara il proprio accento sul body
(`<body class="service-detail-body" data-accent="marketing">`): `identity`,
`marketing`, `innovation` e `motion` ridefiniscono `--detail-accent` e
`--detail-glow` in `service-detail.css`. Le card in homepage usano lo stesso
attributo (`data-accent` su `.service-card`) con i colori in `luxury.css`.
Aggiungendo un quinto servizio vanno toccati entrambi i punti.

**Senza JavaScript.** Gli elementi `.reveal` partono a `opacity: 0` e vengono
mostrati da `script.js`. Se aggiungi una pagina che carica `style.css`, aggiungi
anche `<noscript><link rel="stylesheet" href="no-js.css" /></noscript>` nel
head, altrimenti la pagina resta bianca con JS disattivato.

**Accessibilità.** Ogni pagina ha skip link, landmark `<header>` / `<main>`,
un solo `<h1>` e rispetta `prefers-reduced-motion` (blocco globale in
`enhancements.css`).

**Line endings.** Tutto LF, imposto da `.gitattributes` e `.editorconfig`.

## Controlli

```bash
python3 tools/check_site.py
```

Verifica, senza dipendenze esterne:

- ogni `href`/`src` locale punta a un file esistente;
- ogni ancora `#…` esiste nella pagina di destinazione;
- il `<head>` di ogni pagina ha CSP, canonical, Open Graph, favicon, manifest,
  font self-hosted e fallback `no-js`;
- ogni `<img>` ha `alt` e dimensioni intrinseche;
- il JSON-LD è JSON valido;
- `sitemap.xml` elenca esattamente le pagine indicizzabili esistenti;
- nessun asset in `assets/` è orfano.

Gira anche in CI su ogni push e pull request
(`.github/workflows/check-site.yml`).

## Aggiungere un case study

1. Duplica una pagina progetto esistente (per esempio `forloox.html`) e
   aggiorna testi, `title`, `description`, canonical, Open Graph e JSON-LD.
2. Metti la cover in `assets/img/projects/<slug>.webp` (1920×1080) e una
   `<slug>.jpg` con la stessa immagine per `og:image` (alcuni scraper social
   non leggono webp). La cover è cliccabile e si apre a schermo intero nel
   lightbox.
3. Aggiungi la card nella griglia `#work` di `index.html`.
4. Aggiorna i link `rel="prev"` / `rel="next"` del `.project-pager` nelle due
   pagine adiacenti.
5. Aggiungi la URL a `sitemap.xml`.
6. Lancia `python3 tools/check_site.py`.

## Form

I due form (`index.html#contact` e `call.html`) inviano a Formspree
(`https://formspree.io/f/xkoqwvgp`). `form-handler.js` intercetta l'invio via
`fetch` e mostra l'esito inline; senza JavaScript il form fa un POST normale e
funziona comunque. Il campo `_gotcha` è un honeypot anti-spam.

## Note

Alcuni asset non più usati sono stati rimossi dal working tree perché venivano
pubblicati senza essere referenziati da nessuna pagina: le 19 `page_*.jpg`
esportate da un PDF (sei delle quali byte-identiche alle cover dei progetti),
la foto sorgente `team_page.jpg`, lo script one-shot `crop_faces.py` che ne
ritagliava i ritratti del team e le `*-detail.jpg` / `*-detail.webp`, che erano
soltanto un ritaglio ingrandito della stessa cover a risoluzione più bassa.
Restano nella storia git e si recuperano con:

```bash
git checkout 3407443 -- assets/img/team_page.jpg crop_faces.py
```
