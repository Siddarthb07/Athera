# Athera

Athera is a multi-page static agency website for an AI automation brand. It is built with HTML/CSS/JS plus animation libraries for premium motion and interactions.

## Implemented Experience

- Multi-page site architecture:
  - `index.html`
  - `services.html`
  - `about.html`
  - `portfolio.html`
  - `contact.html`
- Shared navigation with mobile menu and active-link logic (`nav.js`)
- Scroll-driven animation system with GSAP + ScrollTrigger (`animations.js`)
- Hero particle effects via tsParticles (`particles-config.js`)
- Counters, testimonial motion, section reveals, and card transitions
- Contact page form + FAQ accordion style interactions

## Tech Stack

- HTML5
- CSS3 (custom design system with rose-gold themed palette)
- Vanilla JavaScript
- GSAP + ScrollTrigger
- tsParticles

## Folder Layout

All site files are inside `athera/`:

- `index.html`, `services.html`, `about.html`, `portfolio.html`, `contact.html`
- `styles.css`
- `nav.js`
- `animations.js`
- `particles-config.js`

## Local Run

```bash
cd athera
python -m http.server 5500
```

Open `http://127.0.0.1:5500` and navigate between pages.

## Notes

- This repo is frontend-only; no backend APIs are included.
- Contact actions are currently UI-driven and can be integrated with a backend form handler or CRM webhook in a later phase.

