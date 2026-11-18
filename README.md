# folio

Personal portfolio of Panagiotis "Peter" Nicolacacos, served at
[gh.petestech.com](https://gh.petestech.com).

## Philosophy

Plain HTML, CSS, and JavaScript. No frameworks, no dependencies, no build
step, no trackers — the files in this repository are exactly the files the
server sends. For a single page, modern platform features (CSS custom
properties, fluid `clamp()` type, `IntersectionObserver`, ES modules) cover
everything a toolchain would, with nothing to install and nothing to break.

The page is built around outcomes rather than a list of skills: the hero is
one workday shown before and after an automation, and the work section is two
case studies followed by a ledger of smaller tools.

The theme follows the visitor's system setting. The toggle in the nav (or
`theme dark` / `theme light` in the terminal) overrides it, and that choice is
remembered in `localStorage`.

## Structure

```
index.html          the page
styles.css          design tokens (light + dark), layout, motion
js/main.js          theme, the before/after workday, scroll reveals,
                    nav scroll-spy, homelab diagram ↔ systems list linking
js/terminal.js      the interactive terminal in the homelab section
assets/             favicon, fonts (self-hosted woff2), og image
CNAME               custom domain for GitHub Pages — do not delete
.nojekyll           tells GitHub Pages to serve files as-is
```

Fonts are self-hosted and all under the SIL Open Font License: Instrument
Serif (display), Inter (text), JetBrains Mono (labels and the terminal).

Colour carries one meaning throughout: amber is work done by hand, green is
work that runs on its own.

The homelab topology is a hand-authored inline SVG in `index.html`. Each
`<g class="sys" data-sys="…">` pairs with the list item carrying the same
`data-sys`, which is how hovering one highlights the other.

Content that appears in two places — the page and the terminal's `work`,
`projects`, `skills`, `experience`, and `certs` commands — lives in
`index.html` and in the tables at the top of `js/terminal.js`. Update both.

## Local development

No install. From the repo root:

```
python3 -m http.server 8000
```

then open http://localhost:8000. (A server is needed because the JS is loaded
as ES modules; opening `index.html` from disk won't run it.)

## Deployment

GitHub Pages, classic branch serving from `main`. Pushing to `main` deploys.
The custom domain is configured via the `CNAME` file.
