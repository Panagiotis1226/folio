# folio

Personal portfolio of Panagiotis "Peter" Nicolacacos, served at
[gh.petestech.com](https://gh.petestech.com).

## Philosophy

Hand-written HTML, CSS, and JavaScript. No frameworks, no dependencies, no
build step — the files in this repository are exactly the files the server
sends. For a single page, modern platform features (CSS custom properties,
fluid `clamp()` type, `IntersectionObserver`, ES modules) cover everything a
toolchain would, with nothing to install and nothing to break.

The site is dark-only by design.

## Structure

```
index.html          the page
styles.css          design tokens, layout, motion
js/main.js          scroll reveals + nav scroll-spy
js/terminal.js      the interactive terminal in the hero
assets/             favicon, fonts (self-hosted woff2), og image
CV.pdf              resume
CNAME               custom domain for GitHub Pages — do not delete
.nojekyll           tells GitHub Pages to serve files as-is
```

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
