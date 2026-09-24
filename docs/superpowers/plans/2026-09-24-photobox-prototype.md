# Photobox Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multi-screen mobile web prototype of the Photobox iOS app covering the Smart Collections → Photo Book creation flow.

**Architecture:** Single-page app using hash-based routing (`#/route`). Each screen is a JS module that exports `render()`, `mount()`, `unmount()`. A central router swaps screens with iOS-style slide transitions. Shared `state.js` object carries data (selected photos, product choices) across screens.

**Tech Stack:** Vanilla HTML, CSS (custom properties, transforms), vanilla JavaScript (ES modules). No build step. No framework. GitHub Pages compatible.

**Spec:** `docs/superpowers/specs/2026-09-24-photobox-prototype-design.md`

## Global Constraints

- No status bar rendered — device provides it
- Full-screen layout: `height: 100dvh`, no visible browser chrome
- All photo assets must be local files under `assets/photos/` — no external CDN
- Font stack: `-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`
- Hash routing only — no server-side logic, GitHub Pages compatible
- Design tokens in CSS are **approximations only** — when a Figma link is provided for a screen, extract exact values and override the approximations
- Language: English throughout
- Each screen module exports exactly: `{ render(params), mount(), unmount() }`

---

### Task 1: Project Scaffold & Git Init

**Files:**
- Create: `index.html`
- Create: `css/reset.css`
- Create: `css/transitions.css`
- Create: `js/state.js`
- Create: `js/router.js`
- Create: `js/app.js`
- Create: `assets/photos/.gitkeep`
- Create: `screens/` (empty directory)

**Interfaces:**
- Produces: `window.AppState` — the shared state object all screen modules read/write
- Produces: `window.Router` — `{ navigate(hash), back() }` used by all screens
- Produces: CSS classes `.screen`, `.screen--active`, `.screen--enter-right`, `.screen--exit-right` used by every screen module

- [ ] **Step 1: Init git and create directory structure**

```bash
cd "/Users/mborisov/Desktop/test/Smart collections"
git init
mkdir -p css js screens assets/photos
touch assets/photos/.gitkeep
```

- [ ] **Step 2: Write `css/reset.css`**

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  /* Approximations — override per-screen once Figma link is provided */
  --color-primary: #2E8B87;
  --color-purple: #8B6BB1;
  --color-bg: #FFFFFF;
  --color-text: #1A1A1A;
  --color-text-secondary: #666666;
  --color-discount: #E53935;
  --color-border: #E5E5E5;
  --font: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
  --tab-bar-height: 83px;
  --safe-bottom: env(safe-area-inset-bottom, 0px);
}

html, body {
  height: 100%;
  overflow: hidden;
  background: #000;
  font-family: var(--font);
  -webkit-font-smoothing: antialiased;
}

#app {
  position: relative;
  width: 100%;
  height: 100dvh;
  max-width: 430px;
  margin: 0 auto;
  background: var(--color-bg);
  overflow: hidden;
}

img { max-width: 100%; display: block; }
button { font-family: var(--font); cursor: pointer; border: none; background: none; }
```

- [ ] **Step 3: Write `css/transitions.css`**

```css
.screen {
  position: absolute;
  inset: 0;
  background: var(--color-bg);
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  will-change: transform;
  transition: transform 300ms ease;
}

/* Screen enters from right (forward navigation) */
.screen--enter-right {
  transform: translateX(100%);
}

/* Screen exits to right (back navigation) */
.screen--exit-right {
  transform: translateX(100%);
}

/* Active (visible) screen */
.screen--active {
  transform: translateX(0);
}

/* Bottom sheet */
.sheet {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-bg);
  border-radius: 20px 20px 0 0;
  transform: translateY(100%);
  transition: transform 350ms ease;
  will-change: transform;
}

.sheet--active {
  transform: translateY(0);
}

/* Sheet backdrop */
.sheet-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 350ms ease;
  pointer-events: none;
}

.sheet-backdrop--active {
  opacity: 1;
  pointer-events: auto;
}
```

- [ ] **Step 4: Write `js/state.js`**

```js
const AppState = {
  currentCollection: null,  // { id, title, dateRange, photos: [] }
  selectedPhotos: [],        // array of photo ids
  chosenOrientation: null,   // 'landscape' | 'portrait' | 'square'
  chosenSize: null,          // 'small' | 'medium' | 'large'
  chosenCover: null,         // 'softcover' | 'hardcover'

  reset() {
    this.currentCollection = null;
    this.selectedPhotos = [];
    this.chosenOrientation = null;
    this.chosenSize = null;
    this.chosenCover = null;
  }
};

window.AppState = AppState;
```

- [ ] **Step 5: Write `js/router.js`**

```js
const Router = (() => {
  const screens = {};
  let currentScreen = null;
  let isNavigatingBack = false;

  function register(route, module) {
    screens[route] = module;
  }

  function getRouteAndParams(hash) {
    const path = hash.replace('#/', '').split('/');
    const route = path[0] || 'home';
    const params = path.slice(1);
    return { route, params };
  }

  function navigate(hash, back = false) {
    isNavigatingBack = back;
    window.location.hash = hash;
  }

  function back() {
    isNavigatingBack = true;
    history.back();
  }

  async function handleRoute() {
    const { route, params } = getRouteAndParams(window.location.hash);
    const module = screens[route];
    if (!module) return;

    const container = document.getElementById('app');

    // Unmount old screen
    if (currentScreen) {
      currentScreen.unmount && currentScreen.unmount();
      const old = container.querySelector('.screen--active');
      if (old) {
        old.classList.remove('screen--active');
        old.classList.add('screen--exit-right');
        old.addEventListener('transitionend', () => old.remove(), { once: true });
      }
    }

    // Mount new screen
    const el = document.createElement('div');
    el.className = 'screen' + (isNavigatingBack ? ' screen--active' : ' screen--enter-right');
    el.innerHTML = module.render(params);
    container.appendChild(el);

    // Trigger enter animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.classList.remove('screen--enter-right');
        el.classList.add('screen--active');
      });
    });

    currentScreen = module;
    module.mount && module.mount(el, params);
    isNavigatingBack = false;
  }

  window.addEventListener('hashchange', handleRoute);

  return { register, navigate, back, handleRoute };
})();

window.Router = Router;
```

- [ ] **Step 6: Write `js/app.js`**

```js
// Import order matters — screens register themselves
const screenModules = [
  'home',
  'smart-collections',
  'collection-detail',
  'create-options',
  'book-orientation',
  'book-options',
  'pdp',
  'editor',
];

// Screens self-register via Router.register() when their script loads.
// app.js just triggers the initial route after all scripts are loaded.
window.addEventListener('DOMContentLoaded', () => {
  const hash = window.location.hash || '#/home';
  window.location.hash = hash;
  Router.handleRoute();
});
```

- [ ] **Step 7: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>Photobox</title>
  <link rel="stylesheet" href="css/reset.css">
  <link rel="stylesheet" href="css/transitions.css">
</head>
<body>
  <div id="app">
    <!-- Screens are injected here by the router -->
  </div>

  <script src="js/state.js"></script>
  <script src="js/router.js"></script>
  <!-- Screen modules (each calls Router.register on load) -->
  <script src="screens/home.js"></script>
  <script src="screens/smart-collections.js"></script>
  <script src="screens/collection-detail.js"></script>
  <script src="screens/create-options.js"></script>
  <script src="screens/book-orientation.js"></script>
  <script src="screens/book-options.js"></script>
  <script src="screens/pdp.js"></script>
  <script src="screens/editor.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 8: Write stub modules for all 8 screens** (so the app loads without errors)

Create each file `screens/<name>.js` with this stub pattern:

```js
// screens/home.js
Router.register('home', {
  render(params) {
    return `<div style="padding:20px;font-family:var(--font)">Home screen — coming soon</div>`;
  },
  mount(el, params) {},
  unmount() {}
});
```

Repeat for: `smart-collections`, `collection-detail`, `create-options`, `book-orientation`, `book-options`, `pdp`, `editor`.

- [ ] **Step 9: Open `index.html` in a browser and verify**

Open the file directly (`open index.html`) or via a local server (`npx serve .`).
Expected: white screen with "Home screen — coming soon", no JS errors in console.
Navigate to `#/smart-collections` in the URL bar — expected: "Smart Collections screen — coming soon".

- [ ] **Step 10: Commit scaffold**

```bash
git add .
git commit -m "feat: scaffold SPA router, state, CSS reset and screen stubs"
```

---

### Task 2: Home Screen

> Before implementing: user provides Figma link for Home screen. Extract exact colors, spacing, font sizes, and border-radii. Override CSS variable approximations in `css/reset.css` if Figma values differ.

**Files:**
- Modify: `screens/home.js` (replace stub)
- Modify: `css/reset.css` (update token values from Figma if needed)
- Add: `assets/photos/` — 6 travel photos for the Smart Collections carousel (JPG, ~800×600px)

**Interfaces:**
- Consumes: `Router.navigate(hash)` from `js/router.js`
- Produces: Navigates to `#/smart-collections` when Smart Collections banner is tapped

- [ ] **Step 1: Get Figma link from user; extract exact design tokens**

Open Figma link. Note exact hex values for primary color, banner background, font sizes (logo, section headers, card labels), spacing (horizontal padding, section gaps, card border-radius). Update `--color-primary`, `--color-purple`, etc. in `css/reset.css`.

- [ ] **Step 2: Add 6 placeholder travel photos**

Download or source 6 travel-themed photos (people + landmarks) into `assets/photos/`:
- `photo-1.jpg` through `photo-6.jpg`
- Minimum 400×400px, JPG

- [ ] **Step 3: Implement `screens/home.js`**

```js
Router.register('home', {
  render() {
    return `
      <div class="home">
        <!-- Logo -->
        <header class="home__header">
          <div class="home__logo">PH<span class="logo-icon">⊕</span>TOBOX</div>
        </header>

        <!-- Promo banner -->
        <div class="home__promo-banner">
          <p class="promo__title">25% off selected photo books, wall decorations and photo gifts</p>
          <p class="promo__code">Using code SALE50 ends 12/06/2026</p>
        </div>

        <!-- Smart Collections banner -->
        <button class="home__sc-banner" id="sc-banner">
          <div class="sc-banner__text">
            <span class="sc-banner__title">Smart Collections</span>
            <span class="sc-banner__sub">Your photos, already sorted into albums</span>
          </div>
          <div class="sc-banner__arrow">→</div>
          <div class="sc-banner__carousel" id="sc-carousel">
            <div class="carousel__track" id="carousel-track">
              <img src="assets/photos/photo-1.jpg" alt="">
              <img src="assets/photos/photo-2.jpg" alt="">
              <img src="assets/photos/photo-3.jpg" alt="">
              <img src="assets/photos/photo-1.jpg" alt="">
              <img src="assets/photos/photo-2.jpg" alt="">
              <img src="assets/photos/photo-3.jpg" alt="">
            </div>
          </div>
        </button>

        <!-- Shop by product -->
        <section class="home__shop">
          <h2 class="section-title">Shop by product</h2>
          <div class="product-card">
            <img src="assets/photos/photo-4.jpg" alt="Photo Book Landscape" class="product-card__img">
            <p class="product-card__name">Photo Books - Landscape</p>
            <p class="product-card__discount">Up to 60% Off</p>
          </div>
        </section>

        <!-- Bottom tab bar -->
        <nav class="tab-bar">
          <button class="tab-bar__item tab-bar__item--active">
            <span class="tab-icon">⌂</span>
            <span class="tab-label">Home</span>
          </button>
          <button class="tab-bar__item">
            <span class="tab-icon">◫</span>
            <span class="tab-label">Projects</span>
          </button>
          <button class="tab-bar__item">
            <span class="tab-icon">◻</span>
            <span class="tab-label">My Photos</span>
          </button>
          <button class="tab-bar__item">
            <span class="tab-icon">⛉</span>
            <span class="tab-label">Basket</span>
          </button>
          <button class="tab-bar__item">
            <span class="tab-icon">◯</span>
            <span class="tab-label">Account</span>
          </button>
        </nav>
      </div>
    `;
  },

  mount(el) {
    // Navigate to Smart Collections
    el.querySelector('#sc-banner').addEventListener('click', () => {
      Router.navigate('#/smart-collections');
    });

    // Start carousel animation
    this._startCarousel(el);
  },

  unmount() {},

  _startCarousel(el) {
    const track = el.querySelector('#carousel-track');
    if (!track) return;
    // CSS animation handles the infinite scroll — just ensure it's running
    track.style.animation = 'carousel-scroll 8s linear infinite';
  }
});
```

- [ ] **Step 4: Add Home screen styles to `css/reset.css`**

```css
/* ── Home ── */
.home { display: flex; flex-direction: column; min-height: 100%; padding-bottom: calc(var(--tab-bar-height) + var(--safe-bottom)); }

.home__header { display: flex; justify-content: center; padding: 16px; }
.home__logo { font-size: 22px; font-weight: 700; color: var(--color-primary); letter-spacing: 2px; }
.logo-icon { display: inline-block; color: var(--color-primary); }

.home__promo-banner { margin: 0 16px 12px; background: var(--color-primary); border-radius: 14px; padding: 16px; color: #fff; }
.promo__title { font-size: 16px; font-weight: 600; line-height: 1.3; margin-bottom: 6px; }
.promo__code { font-size: 12px; opacity: 0.85; }

.home__sc-banner { display: flex; flex-direction: column; margin: 0 16px 12px; background: var(--color-purple); border-radius: 14px; padding: 16px; color: #fff; text-align: left; width: calc(100% - 32px); overflow: hidden; -webkit-tap-highlight-color: rgba(0,0,0,0.1); }
.sc-banner__text { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.sc-banner__title { font-size: 18px; font-weight: 700; }
.sc-banner__sub { font-size: 13px; opacity: 0.85; margin-top: 4px; }
.sc-banner__arrow { font-size: 22px; background: rgba(255,255,255,0.25); border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-left: 8px; }
.sc-banner__carousel { width: 100%; overflow: hidden; height: 80px; border-radius: 10px; }
.carousel__track { display: flex; gap: 8px; height: 100%; }
.carousel__track img { width: 90px; height: 80px; object-fit: cover; border-radius: 8px; flex-shrink: 0; }

@keyframes carousel-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(calc(-50% - 4px)); }
}

.home__shop { padding: 0 16px; }
.section-title { font-size: 18px; font-weight: 700; color: var(--color-text); margin-bottom: 12px; }
.product-card { border-radius: 14px; overflow: hidden; margin-bottom: 16px; }
.product-card__img { width: 100%; height: 200px; object-fit: cover; }
.product-card__name { font-size: 16px; font-weight: 600; color: var(--color-text); margin-top: 8px; }
.product-card__discount { font-size: 14px; font-weight: 600; color: var(--color-discount); margin-top: 2px; }

/* ── Tab Bar ── */
.tab-bar { position: fixed; bottom: 0; left: 50%; transform: translateX(-50%); width: 100%; max-width: 430px; height: var(--tab-bar-height); padding-bottom: var(--safe-bottom); background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); border-top: 1px solid var(--color-border); display: flex; justify-content: space-around; align-items: center; z-index: 100; }
.tab-bar__item { display: flex; flex-direction: column; align-items: center; gap: 2px; color: var(--color-text-secondary); font-size: 10px; padding: 4px 8px; }
.tab-bar__item--active { color: var(--color-primary); }
.tab-icon { font-size: 22px; line-height: 1; }
.tab-label { font-size: 10px; }
```

- [ ] **Step 5: Open in browser and verify Home screen**

Expected:
- Photobox logo centered at top
- Teal promo banner
- Purple Smart Collections banner with scrolling photo carousel
- "Shop by product" section
- Tab bar fixed at bottom
- Tapping Smart Collections banner navigates to `#/smart-collections`

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: implement Home screen with carousel and tab bar"
```

---

### Task 3: Smart Collections Screen

> Before implementing: user provides Figma link. Extract exact card dimensions, section title styles, pill styles.

**Files:**
- Modify: `screens/smart-collections.js` (replace stub)

**Interfaces:**
- Consumes: `Router.navigate(hash)`, `Router.back()`
- Produces: Sets `AppState.currentCollection` and navigates to `#/collection/:id`

- [ ] **Step 1: Get Figma link from user; note exact design values**

- [ ] **Step 2: Define collection data (hardcoded for prototype)**

At the top of `screens/smart-collections.js`:

```js
const COLLECTIONS = {
  travels: [
    { id: 'florence-italy', title: 'Florence, Italy', dates: '12–21 July, 2026', cover: 'assets/photos/photo-1.jpg', photos: ['photo-1.jpg','photo-2.jpg','photo-3.jpg','photo-4.jpg','photo-5.jpg','photo-6.jpg'] },
    { id: 'tuscany', title: 'Tuscany', dates: '3–12 Aug, 2026', cover: 'assets/photos/photo-2.jpg', photos: ['photo-2.jpg','photo-3.jpg','photo-4.jpg'] },
  ],
  shortTrips: [
    { id: 'london', title: 'One day in London', dates: '12 August, 2026', cover: 'assets/photos/photo-3.jpg', photos: ['photo-3.jpg','photo-4.jpg'] },
    { id: 'paris', title: 'Weekend in Paris', dates: '11 July, 2026', cover: 'assets/photos/photo-4.jpg', photos: ['photo-4.jpg','photo-5.jpg','photo-6.jpg'] },
    { id: 'amsterdam', title: 'Amsterdam', dates: '5 June, 2026', cover: 'assets/photos/photo-5.jpg', photos: ['photo-5.jpg','photo-6.jpg'] },
  ],
};

const ALL_COLLECTIONS = [...COLLECTIONS.travels, ...COLLECTIONS.shortTrips];
```

- [ ] **Step 3: Implement `screens/smart-collections.js`**

```js
Router.register('smart-collections', {
  render() {
    return `
      <div class="sc-screen">
        <div class="sc-screen__header">
          <button class="back-btn" id="sc-back">&#8249;</button>
        </div>
        <div class="sc-screen__content">
          <h1 class="sc-screen__title">Smart Collections</h1>

          <section class="sc-section">
            <h2 class="sc-section__heading">Travels</h2>
            <div class="sc-row" id="travels-row">
              ${COLLECTIONS.travels.map(c => collectionCard(c, 'large')).join('')}
            </div>
          </section>

          <section class="sc-section">
            <h2 class="sc-section__heading">Short trips and occasions</h2>
            <div class="sc-row" id="short-trips-row">
              ${COLLECTIONS.shortTrips.map(c => collectionCard(c, 'small')).join('')}
            </div>
          </section>

          <section class="sc-section">
            <h2 class="sc-section__heading">All Smart Collections</h2>
            <div class="year-pills" id="year-pills">
              ${['2026','2025','2024','2023','2022','2021'].map((y, i) =>
                `<button class="year-pill ${i === 0 ? 'year-pill--active' : ''}" data-year="${y}">${y}</button>`
              ).join('')}
            </div>
            <div class="all-grid" id="all-grid">
              ${ALL_COLLECTIONS.map(c => collectionCard(c, 'small')).join('')}
            </div>
          </section>
        </div>
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#sc-back').addEventListener('click', () => Router.back());

    el.querySelectorAll('[data-collection-id]').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.collectionId;
        const collection = ALL_COLLECTIONS.find(c => c.id === id);
        AppState.currentCollection = collection;
        Router.navigate(`#/collection/${id}`);
      });
    });

    el.querySelectorAll('.year-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        el.querySelectorAll('.year-pill').forEach(p => p.classList.remove('year-pill--active'));
        pill.classList.add('year-pill--active');
        // For prototype: all years show same data
      });
    });
  },

  unmount() {}
});

function collectionCard(c, size) {
  return `
    <button class="collection-card collection-card--${size}" data-collection-id="${c.id}"
      style="background-image: url('${c.cover}')">
      <div class="collection-card__overlay">
        <p class="collection-card__title">${c.title}</p>
        <p class="collection-card__dates">${c.dates}</p>
      </div>
    </button>
  `;
}
```

- [ ] **Step 4: Add Smart Collections styles to `css/reset.css`**

```css
/* ── Smart Collections ── */
.sc-screen { display: flex; flex-direction: column; min-height: 100%; }
.sc-screen__header { padding: 12px 16px 0; }
.back-btn { font-size: 32px; color: var(--color-primary); line-height: 1; padding: 4px; }
.sc-screen__content { padding: 0 16px 32px; overflow-y: auto; }
.sc-screen__title { font-size: 28px; font-weight: 800; color: var(--color-text); margin: 8px 0 20px; }

.sc-section { margin-bottom: 28px; }
.sc-section__heading { font-size: 17px; font-weight: 700; color: var(--color-text); margin-bottom: 12px; }

.sc-row { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; padding-bottom: 4px; }
.sc-row::-webkit-scrollbar { display: none; }

.collection-card { flex-shrink: 0; border-radius: 16px; overflow: hidden; background-size: cover; background-position: center; position: relative; text-align: left; -webkit-tap-highlight-color: transparent; }
.collection-card--large { width: 200px; height: 260px; scroll-snap-align: start; }
.collection-card--small { width: 160px; height: 200px; scroll-snap-align: start; }
.collection-card__overlay { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px; background: linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%); }
.collection-card__title { font-size: 15px; font-weight: 700; color: #fff; line-height: 1.2; }
.collection-card__dates { font-size: 12px; color: rgba(255,255,255,0.85); margin-top: 3px; }

.year-pills { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; padding-bottom: 4px; }
.year-pills::-webkit-scrollbar { display: none; }
.year-pill { flex-shrink: 0; height: 34px; padding: 0 16px; border-radius: 17px; border: 1.5px solid var(--color-border); font-size: 14px; font-weight: 500; color: var(--color-text); background: #fff; -webkit-tap-highlight-color: transparent; }
.year-pill--active { background: var(--color-primary); border-color: var(--color-primary); color: #fff; }

.all-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.all-grid .collection-card { width: 100%; height: 160px; }
```

- [ ] **Step 5: Open in browser and verify**

Expected:
- Back chevron top left
- "Smart Collections" large bold heading
- Travels row: horizontal scroll, large cards with photo + title + date overlay
- Short trips row: same pattern, smaller cards
- All Smart Collections: year filter pills + 2-column grid
- Tapping any card navigates to `#/collection/:id`

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: implement Smart Collections screen"
```

---

### Task 4: Collection Detail Screen

> Before implementing: user provides Figma link. Note photo grid layout, selection state styling, CTA button placement.

**Files:**
- Modify: `screens/collection-detail.js` (replace stub)

**Interfaces:**
- Consumes: `AppState.currentCollection` (set by Smart Collections), `Router.back()`
- Produces: Sets `AppState.selectedPhotos[]`, navigates to `#/create-options`

- [ ] **Step 1: Get Figma link from user; extract design values**

- [ ] **Step 2: Define hardcoded photo data per collection**

Photos are grouped by date. Use `AppState.currentCollection.photos` for the list. For the prototype, assign dates:

```js
function groupPhotosByDate(photos) {
  // Prototype: split photos into two date groups
  const mid = Math.ceil(photos.length / 2);
  return [
    { date: '1 Jan 2026', photos: photos.slice(0, mid) },
    { date: '2 Jan 2026', photos: photos.slice(mid) },
  ];
}
```

- [ ] **Step 3: Implement `screens/collection-detail.js`**

```js
Router.register('collection', {
  render(params) {
    const collection = AppState.currentCollection;
    if (!collection) return `<div style="padding:20px">No collection selected</div>`;

    const groups = groupPhotosByDate(collection.photos);
    return `
      <div class="cd-screen">
        <div class="cd-screen__header">
          <button class="back-btn" id="cd-back">&#8249;</button>
          <h1 class="cd-screen__title">${collection.title}</h1>
          <div style="width:40px"></div>
        </div>
        <div class="cd-screen__grid" id="photo-grid">
          ${groups.map(g => `
            <div class="cd-date-group">
              <p class="cd-date-label">${g.date}</p>
              <div class="cd-photo-grid">
                ${g.photos.map(p => `
                  <button class="cd-photo" data-photo="${p}" style="background-image:url('assets/photos/${p}')">
                    <div class="cd-photo__check" id="check-${p}">✓</div>
                  </button>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        <div class="cd-cta">
          <button class="cta-btn" id="create-btn">Create</button>
        </div>
      </div>
    `;
  },

  mount(el) {
    // Reset selected photos on entry
    AppState.selectedPhotos = [];

    el.querySelector('#cd-back').addEventListener('click', () => Router.back());

    el.querySelectorAll('.cd-photo').forEach(photo => {
      photo.addEventListener('click', () => {
        const id = photo.dataset.photo;
        const idx = AppState.selectedPhotos.indexOf(id);
        if (idx === -1) {
          AppState.selectedPhotos.push(id);
          photo.classList.add('cd-photo--selected');
        } else {
          AppState.selectedPhotos.splice(idx, 1);
          photo.classList.remove('cd-photo--selected');
        }
      });
    });

    el.querySelector('#create-btn').addEventListener('click', () => {
      Router.navigate('#/create-options');
    });
  },

  unmount() {}
});

function groupPhotosByDate(photos) {
  const mid = Math.ceil(photos.length / 2);
  return [
    { date: '1 Jan 2026', photos: photos.slice(0, mid) },
    { date: '2 Jan 2026', photos: photos.slice(mid) },
  ];
}
```

- [ ] **Step 4: Add Collection Detail styles to `css/reset.css`**

```css
/* ── Collection Detail ── */
.cd-screen { display: flex; flex-direction: column; height: 100%; }
.cd-screen__header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; flex-shrink: 0; }
.cd-screen__title { font-size: 17px; font-weight: 600; color: var(--color-text); }
.cd-screen__grid { flex: 1; overflow-y: auto; padding: 0 16px 100px; -webkit-overflow-scrolling: touch; }
.cd-date-group { margin-bottom: 20px; }
.cd-date-label { font-size: 14px; font-weight: 600; color: var(--color-text); margin-bottom: 8px; }
.cd-photo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 3px; }
.cd-photo { aspect-ratio: 1; background-size: cover; background-position: center; position: relative; border-radius: 2px; -webkit-tap-highlight-color: transparent; }
.cd-photo__check { position: absolute; top: 6px; right: 6px; width: 22px; height: 22px; border-radius: 50%; background: var(--color-primary); color: #fff; font-size: 13px; display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 150ms; }
.cd-photo--selected .cd-photo__check { opacity: 1; }
.cd-photo--selected::after { content: ''; position: absolute; inset: 0; border: 3px solid var(--color-primary); border-radius: 2px; pointer-events: none; }

.cd-cta { position: absolute; bottom: 0; left: 0; right: 0; padding: 12px 16px calc(12px + var(--safe-bottom)); background: var(--color-bg); border-top: 1px solid var(--color-border); }
.cta-btn { width: 100%; height: 52px; border-radius: 14px; background: var(--color-primary); color: #fff; font-size: 17px; font-weight: 600; }
```

- [ ] **Step 5: Open in browser and verify**

Expected:
- Header with back chevron and collection title
- Date-grouped photo grid (3 columns)
- Tapping a photo toggles selection (teal border + checkmark)
- "Create" CTA sticky at bottom
- Tapping Create navigates to `#/create-options`

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat: implement Collection Detail screen with photo selection"
```

---

### Task 5: Create Options Bottom Sheet

> Before implementing: user provides Figma link. Note sheet height, option row styles, drag handle.

**Files:**
- Modify: `screens/create-options.js` (replace stub)

**Interfaces:**
- Consumes: `Router.back()` (dismiss sheet), `Router.navigate`
- Produces: Navigates to `#/book-orientation` (Create photo book) or does nothing (Upload to my Photos — prototype dead end)

- [ ] **Step 1: Get Figma link from user**

- [ ] **Step 2: Implement `screens/create-options.js`**

```js
Router.register('create-options', {
  render() {
    return `
      <div class="sheet-screen">
        <div class="sheet-backdrop sheet-backdrop--ready" id="sheet-backdrop"></div>
        <div class="sheet sheet--ready" id="create-sheet">
          <div class="sheet__handle"></div>
          <h2 class="sheet__title">Create with your photos</h2>
          <div class="sheet__options">
            <button class="sheet-option" id="opt-photobook">
              <div class="sheet-option__icon">📖</div>
              <div class="sheet-option__text">
                <p class="sheet-option__name">Create photo book</p>
                <p class="sheet-option__sub">Turn your memories into a beautiful book</p>
              </div>
              <span class="sheet-option__arrow">›</span>
            </button>
            <button class="sheet-option" id="opt-upload">
              <div class="sheet-option__icon">⬆</div>
              <div class="sheet-option__text">
                <p class="sheet-option__name">Upload to my Photos</p>
                <p class="sheet-option__sub">Save to your photo library</p>
              </div>
              <span class="sheet-option__arrow">›</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  mount(el) {
    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.querySelector('#create-sheet').classList.add('sheet--active');
        el.querySelector('#sheet-backdrop').classList.add('sheet-backdrop--active');
      });
    });

    el.querySelector('#sheet-backdrop').addEventListener('click', () => Router.back());
    el.querySelector('#opt-photobook').addEventListener('click', () => Router.navigate('#/book-orientation'));
    el.querySelector('#opt-upload').addEventListener('click', () => Router.back());
  },

  unmount() {}
});
```

- [ ] **Step 3: Add sheet styles to `css/reset.css`**

```css
/* ── Create Options Sheet ── */
.sheet-screen { position: absolute; inset: 0; }
.sheet__handle { width: 36px; height: 4px; background: var(--color-border); border-radius: 2px; margin: 12px auto 20px; }
.sheet__title { font-size: 18px; font-weight: 700; color: var(--color-text); padding: 0 20px 16px; }
.sheet__options { padding: 0 16px calc(20px + var(--safe-bottom)); }
.sheet-option { display: flex; align-items: center; gap: 14px; width: 100%; padding: 16px; border-radius: 14px; background: #F7F7F7; margin-bottom: 10px; -webkit-tap-highlight-color: transparent; }
.sheet-option__icon { font-size: 24px; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 10px; }
.sheet-option__text { flex: 1; text-align: left; }
.sheet-option__name { font-size: 15px; font-weight: 600; color: var(--color-text); }
.sheet-option__sub { font-size: 12px; color: var(--color-text-secondary); margin-top: 2px; }
.sheet-option__arrow { font-size: 20px; color: var(--color-text-secondary); }
```

- [ ] **Step 4: Verify in browser**

Expected: Backdrop darkens, sheet slides up from bottom, two options visible, tapping backdrop or "Upload" dismisses, tapping "Create photo book" navigates forward.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: implement Create Options bottom sheet"
```

---

### Task 6: Book Orientation Screen

> Before implementing: user provides Figma link.

**Files:**
- Modify: `screens/book-orientation.js` (replace stub)

**Interfaces:**
- Consumes: `Router.back()`
- Produces: Sets `AppState.chosenOrientation`, navigates to `#/book-options`

- [ ] **Step 1: Get Figma link from user**

- [ ] **Step 2: Implement `screens/book-orientation.js`**

```js
Router.register('book-orientation', {
  render() {
    const options = [
      { id: 'landscape', label: 'Landscape', aspect: '4/3', icon: '▭' },
      { id: 'portrait',  label: 'Portrait',  aspect: '3/4', icon: '▯' },
      { id: 'square',    label: 'Square',    aspect: '1/1', icon: '▢' },
    ];
    return `
      <div class="picker-screen">
        <div class="picker-screen__header">
          <button class="back-btn" id="orient-back">&#8249;</button>
          <h1 class="picker-screen__title">Choose orientation</h1>
          <div style="width:40px"></div>
        </div>
        <div class="orient-options">
          ${options.map(o => `
            <button class="orient-option" data-orientation="${o.id}">
              <div class="orient-option__preview" style="aspect-ratio:${o.aspect}">
                <span style="font-size:40px">${o.icon}</span>
              </div>
              <p class="orient-option__label">${o.label}</p>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#orient-back').addEventListener('click', () => Router.back());
    el.querySelectorAll('.orient-option').forEach(btn => {
      btn.addEventListener('click', () => {
        AppState.chosenOrientation = btn.dataset.orientation;
        Router.navigate('#/book-options');
      });
    });
  },

  unmount() {}
});
```

- [ ] **Step 3: Add orientation styles to `css/reset.css`**

```css
/* ── Orientation Picker ── */
.picker-screen { display: flex; flex-direction: column; height: 100%; }
.picker-screen__header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; }
.picker-screen__title { font-size: 17px; font-weight: 600; color: var(--color-text); }
.orient-options { display: flex; justify-content: space-around; align-items: flex-end; padding: 40px 16px; flex: 1; }
.orient-option { display: flex; flex-direction: column; align-items: center; gap: 12px; -webkit-tap-highlight-color: transparent; }
.orient-option__preview { width: 80px; background: #F0F0F0; border-radius: 8px; display: flex; align-items: center; justify-content: center; border: 2px solid var(--color-border); }
.orient-option__label { font-size: 14px; font-weight: 500; color: var(--color-text); }
```

- [ ] **Step 4: Verify and commit**

```bash
git add . && git commit -m "feat: implement Book Orientation picker"
```

---

### Task 7: Book Options Screen (Size & Cover)

> Before implementing: user provides Figma link.

**Files:**
- Modify: `screens/book-options.js` (replace stub)

**Interfaces:**
- Consumes: `AppState.chosenOrientation`, `Router.back()`
- Produces: Sets `AppState.chosenSize`, `AppState.chosenCover`, navigates to `#/pdp`

- [ ] **Step 1: Get Figma link from user**

- [ ] **Step 2: Implement `screens/book-options.js`**

```js
Router.register('book-options', {
  render() {
    return `
      <div class="picker-screen">
        <div class="picker-screen__header">
          <button class="back-btn" id="opts-back">&#8249;</button>
          <h1 class="picker-screen__title">Customise your book</h1>
          <div style="width:40px"></div>
        </div>
        <div class="book-options-content" style="padding:0 16px">
          <h2 class="options-group__title">Size</h2>
          <div class="options-group" id="size-group">
            ${['Small (15×15cm)','Medium (21×21cm)','Large (30×30cm)'].map((s, i) => `
              <button class="option-pill ${i===0?'option-pill--active':''}" data-group="size" data-value="${['small','medium','large'][i]}">${s}</button>
            `).join('')}
          </div>
          <h2 class="options-group__title" style="margin-top:24px">Cover</h2>
          <div class="options-group" id="cover-group">
            ${['Softcover','Hardcover'].map((c, i) => `
              <button class="option-pill ${i===0?'option-pill--active':''}" data-group="cover" data-value="${c.toLowerCase()}">${c}</button>
            `).join('')}
          </div>
        </div>
        <div class="cd-cta">
          <button class="cta-btn" id="opts-next">Continue</button>
        </div>
      </div>
    `;
  },

  mount(el) {
    AppState.chosenSize = 'small';
    AppState.chosenCover = 'softcover';

    el.querySelector('#opts-back').addEventListener('click', () => Router.back());

    el.querySelectorAll('.option-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const group = pill.dataset.group;
        el.querySelectorAll(`[data-group="${group}"]`).forEach(p => p.classList.remove('option-pill--active'));
        pill.classList.add('option-pill--active');
        if (group === 'size') AppState.chosenSize = pill.dataset.value;
        if (group === 'cover') AppState.chosenCover = pill.dataset.value;
      });
    });

    el.querySelector('#opts-next').addEventListener('click', () => Router.navigate('#/pdp'));
  },

  unmount() {}
});
```

- [ ] **Step 3: Add option styles to `css/reset.css`**

```css
/* ── Book Options ── */
.options-group__title { font-size: 17px; font-weight: 700; color: var(--color-text); margin: 20px 0 12px; }
.options-group { display: flex; flex-wrap: wrap; gap: 10px; }
.option-pill { height: 40px; padding: 0 18px; border-radius: 20px; border: 1.5px solid var(--color-border); font-size: 14px; font-weight: 500; color: var(--color-text); background: #fff; -webkit-tap-highlight-color: transparent; }
.option-pill--active { border-color: var(--color-primary); color: var(--color-primary); background: rgba(46,139,135,0.08); }
```

- [ ] **Step 4: Verify and commit**

```bash
git add . && git commit -m "feat: implement Book Options (size + cover) picker"
```

---

### Task 8: PDP Screen

> Before implementing: user provides Figma link.

**Files:**
- Modify: `screens/pdp.js` (replace stub)

**Interfaces:**
- Consumes: `AppState.chosenOrientation`, `AppState.chosenSize`, `AppState.chosenCover`, `Router.back()`
- Produces: Navigates to `#/editor`

- [ ] **Step 1: Get Figma link from user**

- [ ] **Step 2: Implement `screens/pdp.js`**

```js
Router.register('pdp', {
  render() {
    const orientation = AppState.chosenOrientation || 'landscape';
    const size = AppState.chosenSize || 'medium';
    const cover = AppState.chosenCover || 'softcover';

    const sizeLabels = { small: 'Small (15×15cm)', medium: 'Medium (21×21cm)', large: 'Large (30×30cm)' };
    const price = { small: '€14.99', medium: '€19.99', large: '€29.99' };

    return `
      <div class="pdp-screen">
        <div class="picker-screen__header">
          <button class="back-btn" id="pdp-back">&#8249;</button>
          <h1 class="picker-screen__title">Your Photo Book</h1>
          <div style="width:40px"></div>
        </div>
        <div class="pdp-content">
          <div class="pdp-preview" style="aspect-ratio:${orientation==='portrait'?'3/4':orientation==='square'?'1/1':'4/3'}">
            <img src="assets/photos/photo-1.jpg" alt="Book preview" style="width:100%;height:100%;object-fit:cover;border-radius:12px">
          </div>
          <h2 class="pdp-title">Photo Book — ${orientation.charAt(0).toUpperCase()+orientation.slice(1)}</h2>
          <p class="pdp-specs">${sizeLabels[size]} · ${cover.charAt(0).toUpperCase()+cover.slice(1)}</p>
          <p class="pdp-price">${price[size]}</p>
          <p class="pdp-desc">Created from your ${AppState.currentCollection?.title || 'Smart Collection'} album. Your photos, beautifully arranged and ready to print.</p>
        </div>
        <div class="cd-cta">
          <button class="cta-btn" id="pdp-create">Create book</button>
        </div>
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#pdp-back').addEventListener('click', () => Router.back());
    el.querySelector('#pdp-create').addEventListener('click', () => Router.navigate('#/editor'));
  },

  unmount() {}
});
```

- [ ] **Step 3: Add PDP styles to `css/reset.css`**

```css
/* ── PDP ── */
.pdp-screen { display: flex; flex-direction: column; height: 100%; }
.pdp-content { padding: 0 16px 100px; overflow-y: auto; flex: 1; }
.pdp-preview { width: 100%; margin-bottom: 20px; border-radius: 12px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
.pdp-title { font-size: 20px; font-weight: 700; color: var(--color-text); margin-bottom: 6px; }
.pdp-specs { font-size: 14px; color: var(--color-text-secondary); margin-bottom: 4px; }
.pdp-price { font-size: 22px; font-weight: 700; color: var(--color-primary); margin: 8px 0; }
.pdp-desc { font-size: 14px; color: var(--color-text-secondary); line-height: 1.5; }
```

- [ ] **Step 4: Verify and commit**

```bash
git add . && git commit -m "feat: implement PDP screen"
```

---

### Task 9: Editor Screen

> Before implementing: user provides Figma link.

**Files:**
- Modify: `screens/editor.js` (replace stub)

**Interfaces:**
- Consumes: `AppState.selectedPhotos`, `AppState.currentCollection`, `Router.back()`
- Produces: Final screen — no further navigation in prototype

- [ ] **Step 1: Get Figma link from user**

- [ ] **Step 2: Implement `screens/editor.js`**

```js
Router.register('editor', {
  render() {
    const photos = AppState.selectedPhotos.length > 0
      ? AppState.selectedPhotos
      : (AppState.currentCollection?.photos || []);

    return `
      <div class="editor-screen">
        <div class="editor-header">
          <button class="back-btn" id="editor-back">&#8249;</button>
          <h1 class="picker-screen__title">Editor</h1>
          <button class="editor-header__save">Save</button>
        </div>
        <div class="editor-canvas">
          <div class="editor-spread">
            ${photos.slice(0, 4).map(p => `
              <div class="editor-photo" style="background-image:url('assets/photos/${p}')"></div>
            `).join('')}
          </div>
          <p class="editor-hint">Tap a photo to edit · Drag to rearrange</p>
        </div>
        <div class="editor-toolbar">
          <button class="editor-tool">Layout</button>
          <button class="editor-tool">Background</button>
          <button class="editor-tool">Text</button>
          <button class="editor-tool">Filters</button>
        </div>
      </div>
    `;
  },

  mount(el) {
    el.querySelector('#editor-back').addEventListener('click', () => Router.back());
  },

  unmount() {}
});
```

- [ ] **Step 3: Add Editor styles to `css/reset.css`**

```css
/* ── Editor ── */
.editor-screen { display: flex; flex-direction: column; height: 100%; background: #F2F2F7; }
.editor-header { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: var(--color-bg); border-bottom: 1px solid var(--color-border); }
.editor-header__save { font-size: 16px; font-weight: 600; color: var(--color-primary); }
.editor-canvas { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px; }
.editor-spread { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; width: 100%; max-width: 320px; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.15); background: #fff; }
.editor-photo { aspect-ratio: 1; background-size: cover; background-position: center; }
.editor-hint { font-size: 12px; color: var(--color-text-secondary); margin-top: 16px; }
.editor-toolbar { display: flex; justify-content: space-around; padding: 12px 16px calc(12px + var(--safe-bottom)); background: var(--color-bg); border-top: 1px solid var(--color-border); }
.editor-tool { font-size: 14px; font-weight: 500; color: var(--color-text); padding: 6px 12px; border-radius: 8px; background: #F2F2F7; }
```

- [ ] **Step 4: Verify full end-to-end flow**

Walk the complete flow: Home → Smart Collections → Florence Italy → select photos → Create → Create photo book → Landscape → Medium + Softcover → Create book → Editor.
Verify all transitions are smooth (300ms slide) and state is preserved through the flow.

- [ ] **Step 5: Final commit**

```bash
git add .
git commit -m "feat: implement Editor screen — full flow complete"
```

---

### Task 10: Context Documentation for Future Sessions

**Files:**
- Create: `CONTEXT.md` (project root)
- Create: `docs/superpowers/specs/2026-09-24-photobox-prototype-design.md` *(already exists)*

- [ ] **Step 1: Write `CONTEXT.md` at project root**

```markdown
# Photobox Prototype — Session Context

## What this is
Mobile web SPA prototype of the Photobox iOS app, covering the Smart Collections → Photo Book flow.
Hosted on GitHub Pages. Open in mobile Safari for the full iOS experience.

## Tech
Vanilla HTML/CSS/JS. No framework. No build step. Hash-based routing.
Each screen: `screens/<name>.js` exports `{ render(params), mount(el, params), unmount() }`.

## Current state
All 8 screens implemented. See build order below.

## Build order / flow
Home → Smart Collections → Collection Detail → Create Options (sheet) → Book Orientation → Book Options → PDP → Editor

## Design source of truth
Figma links provided per screen. CSS approximations are in `css/reset.css` under `:root`.
When Figma values are provided, override the `:root` variables.

## Spec
`docs/superpowers/specs/2026-09-24-photobox-prototype-design.md`
```

- [ ] **Step 2: Commit**

```bash
git add CONTEXT.md
git commit -m "docs: add session context file"
```
