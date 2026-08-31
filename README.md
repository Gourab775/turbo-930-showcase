# Turbo 930 â€” Scroll-Driven 3D Showcase

Interactive automotive showcase for the 1975 Porsche 930 Turbo. A scroll-driven narrative experience that blends WebGL, motion design, and editorial storytelling to present an iconic air-cooled legend.

Live Demo: `https://turbo-930-showcase.vercel.app` Â· Category: Interactive Website / Automotive 3D Â· Stack: Three.js, Vanilla JS, CSS

---

## Overview

This project delivers a premium, editorial-grade product story for the Porsche 930. Users scroll through curated sections â€” Overview, Specifications, Design Details, Press, and Enquiry â€” while a Three.js scene reacts to scroll progress with smooth camera transitions, depth-of-field, and drag interactions.

Built as a performant static site with zero build step, it is ideal for campaign landings, product reveals, and immersive brand storytelling.

## Features

- **Scroll-driven 3D** â€” Camera and scene progress tied to scroll position with lerp, progress bar, and section pinning
- **Interactive model** â€” Drag to orbit, responsive breakpoints for mobile/desktop, reduced motion support
- **Editorial sections** â€” Specs table, feature grid (Whale Tail, Air-Cooled, Turbo, etc.), press quote, and CTA
- **Performance first** â€” Import maps for Three.js 0.158, no framework overhead, lazy asset loading, optimized CSS
- **Polish & accessibility** â€” Keyboard navigation, ARIA labels, responsive nav with hamburger, smooth section scrolling

## Tech Stack

- **3D / Rendering:** Three.js 0.158 (ES modules via importmap), WebGL
- **Frontend:** Semantic HTML5, modern CSS (custom properties, grid/flex), Vanilla JavaScript (ES modules)
- **Tooling:** No bundler required â€” runs directly in browser; optional `npx serve .` for local preview
- **Deployment:** Static hosting (GitHub Pages, Vercel, Netlify, Cloudflare Pages)

## Project Structure

```
.
â”œâ”€ index.html          # Markup + importmap + sections (Overview/Specs/Design/Press/CTA)
â”œâ”€ css/
â”‚  â””â”€ styles.css       # Design system, layout, scroll/3D styling, responsive
â”œâ”€ js/
â”‚  â””â”€ app.js           # Scroll progress, Three.js scene, camera, drag/orbit, nav
â”œâ”€ assets/             # Images / textures / model assets
â”œâ”€ start.bat           # Windows quick start
â””â”€ .gitignore
```

## Getting Started

**Option 1 â€” Open directly**
Just open `index.html` in a modern browser.

**Option 2 â€” Local server (recommended)**
```bash
# Node.js required
npx serve .
# or
python -m http.server 8000
# then open http://localhost:3000 or http://localhost:8000
```

**Windows**
```bash
start.bat
```

## Deployment

This is a static site. Deploy the repository root:

- **GitHub Pages:** Settings â†’ Pages â†’ Deploy from `main` / root
- **Vercel / Netlify:** Import repo, framework preset: `Other`, output directory: `.`
- **Any static host:** Upload `index.html`, `css/`, `js/`, `assets/` as-is

No environment variables required.

## Performance Notes

- Three.js loaded via CDN importmap â€” swap to self-hosted for full offline/CSP control
- CSS and JS are unbundled for clarity; minify for production if needed
- Images in `assets/` â€” compress with Squoosh / Sharp for LCP gains
- Scroll handler is throttled with `requestAnimationFrame` in `js/app.js`

## Customization

- **Model / textures:** Replace entries in `assets/` and update paths in `js/app.js`
- **Copy & sections:** Edit `index.html` â€” sections are `section-overview`, `section-specs`, `section-features`, `section-quote`, `section-cta`
- **Styling:** Tokens in `css/styles.css` (`:root` variables for color, spacing, typography)
- **Branding:** Change `<title>`, nav logo, and CTA link targets in `index.html`

## Roadmap

- [ ] Add WebP/AVIF variants and `loading="lazy"` for assets
- [ ] Optional build step (Vite) for minification and hashing
- [ ] CMS-driven specs (JSON/Markdown) for non-dev edits

## License

MIT â€” free for personal and commercial use.

---

Built as a full-stack showcase for interactive web experiences. For inquiries or custom builds, use the Enquire section on the live site.

