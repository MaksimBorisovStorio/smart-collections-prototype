# Photobox Prototype — Design Spec

**Date:** 2026-09-24  
**Status:** Approved  
**Goal:** Mobile web prototype simulating an iOS photo book creation flow, published via GitHub Pages, openable in mobile Safari.

---

## 1. What We're Building

A single-page mobile web app (`index.html`) that imitates the iOS Photobox app. It covers the "Smart Collections → Photo Book" user flow across 8 screens. No status bar is rendered (the real device provides it). Full-screen, iOS-style slide transitions.

Language: **English**.

---

## 2. Project Structure

```
photobox-prototype/
├── index.html              # Shell: mounts screens, hosts bottom tab bar
├── css/
│   ├── reset.css           # iOS base reset, CSS variables, safe-area handling
│   └── transitions.css     # iOS slide + bottom-sheet animations
├── js/
│   ├── router.js           # Hash-based router
│   ├── state.js            # Shared app state
│   └── app.js              # Boot — wires router to screens
├── screens/
│   ├── home.js
│   ├── smart-collections.js
│   ├── collection-detail.js
│   ├── create-options.js
│   ├── book-orientation.js
│   ├── book-options.js
│   ├── pdp.js
│   └── editor.js
└── assets/
    └── photos/             # Local placeholder travel photos
```

No build step. No framework. No `404.html` needed (hash routing works on GitHub Pages without it).

---

## 3. Screen Inventory & Navigation

| Route | Screen | How to reach |
|---|---|---|
| `#/home` | Home | Default on load |
| `#/smart-collections` | Smart Collections | Tap Smart Collections banner |
| `#/collection/:id` | Collection Detail | Tap a collection card |
| `#/create-options` | Create Options (sheet) | Tap "Create" CTA |
| `#/book-orientation` | Orientation Picker | Tap "Create photo book" |
| `#/book-options` | Size & Cover Picker | Tap an orientation |
| `#/pdp` | Product Detail Page | Tap a size/cover combo |
| `#/editor` | Editor | Tap "Create book" on PDP |

**Navigation directions:**
- Forward: new screen slides in from **right** (`translateX(100%) → 0`)
- Back (chevron): current screen slides out to **right**, previous slides in from **left**
- Create Options: slides up as a **bottom sheet** (`translateY(100%) → 0`)

---

## 4. State Object (`state.js`)

```js
const state = {
  currentCollection: null,   // { id, title, dates, photos[] }
  selectedPhotos: [],         // photo ids selected on collection-detail screen
  chosenOrientation: null,    // 'landscape' | 'portrait' | 'square'
  chosenSize: null,           // e.g. 'small' | 'medium' | 'large'
  chosenCover: null,          // e.g. 'softcover' | 'hardcover'
};
```

Screens read and write this object directly. No pub/sub needed for a prototype.

---

## 5. Router (`router.js`)

Hash-based. Each screen module exports:
```js
{ render(params), mount(), unmount() }
```

On route change:
1. Call `unmount()` on current screen → CSS triggers slide-out
2. Swap DOM content
3. Call `mount()` on new screen → CSS triggers slide-in

Back navigation via `history.back()` automatically triggers the reverse animation direction.

---

## 6. Design Tokens

> ⚠️ **Figma is the source of truth.** The values below are approximations from the reference screenshot only. When a Figma link is provided for a screen, extract exact colors, spacing, font sizes, and border radii from Figma and override these approximations.

```css
--color-primary: #2E8B87;       /* teal: logo, back arrows, CTA button, selected pill */
--color-purple: #8B6BB1;        /* Smart Collections banner background */
--color-bg: #FFFFFF;
--color-text: #1A1A1A;
--color-text-secondary: #666666;
--color-discount: #E53935;      /* sale price labels */
--color-border: #E5E5E5;
```

**Typography:** `-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif`  
No external font downloads — native iOS feel.

---

## 7. Key Component Patterns

### Collection Card
- Photo as background image
- `border-radius: 16px`
- Dark gradient overlay on bottom third
- White bold title + small date below

### Year Filter Pills
- Outlined oval by default
- Selected: teal fill, white text

### Bottom Tab Bar
- Fixed, 83px height + `env(safe-area-inset-bottom)` padding
- 5 tabs: Home, Projects, My Photos, Basket, Account
- Active icon: teal

### Back Chevron
- Top-left, teal `‹`
- Calls `history.back()`

### Sticky CTA Button
- Full width minus 16px side padding
- 52px height, `border-radius: 14px`
- Teal background, white bold text
- Sits above bottom safe area

### Infinite Carousel (Home — Smart Collections banner)
- Doubled photo strip
- CSS `animation: scroll linear infinite`
- Pauses on touch

---

## 8. Screen-by-Screen Notes

### Home
- PHXTOBOX logo top-center
- Teal promo banner
- Purple Smart Collections banner with infinite photo carousel
- "Shop by product" section below
- Bottom tab bar (Home active)
- Tapping Smart Collections banner → `#/smart-collections`

### Smart Collections
- Back chevron → Home
- Large bold "Smart Collections" heading
- **Travels** section: horizontal scrollable cards
- **Short trips and occasions** section: horizontal scrollable cards
- **All Smart Collections** section: year pills filter + grid
- Tapping any card → `#/collection/:id`

### Collection Detail
- Back chevron + centered title
- Date-grouped photo grid
- Photos are **selectable** (tap to toggle selection, show checkmark overlay)
- Sticky "Create" CTA at bottom
- Tapping Create → bottom sheet `#/create-options`

### Create Options (Bottom Sheet)
- "Create photo book" option
- "Upload to my Photos" option
- Tapping "Create photo book" → `#/book-orientation`

### Book Orientation
- Choose: Landscape / Portrait / Square
- Visual preview of each
- Tapping one → `#/book-options`

### Book Options
- Choose size (e.g. Small / Medium / Large)
- Choose cover type (Softcover / Hardcover)
- Tapping a combo → `#/pdp`

### PDP (Product Detail Page)
- Product preview image
- Title, description, price
- "Create book" CTA → `#/editor`

### Editor
- Last screen in flow
- Photo layout canvas (static for prototype)
- Represents the book editing experience

---

## 9. Screens Built Per Session

Work is done **one screen at a time**. Each session:
1. User provides Figma link for the screen
2. Extract exact design tokens from Figma (overrides Section 6 approximations)
3. Build the screen JS module
4. Wire into router + test transition

**Build order:** Home → Smart Collections → Collection Detail → Create Options → Book Orientation → Book Options → PDP → Editor

---

## 10. Constraints

- No status bar rendered (device provides it)
- Full-screen layout (`height: 100dvh`, no browser chrome leaking in)
- All assets local (no external CDN for images)
- Must feel like a real iOS app: inertia scroll, tap highlights, smooth transitions
- GitHub Pages compatible (hash routing, no server-side logic)
