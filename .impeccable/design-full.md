---
name: Quảng Ngãi Atlas
description: Editorial heritage & interactive GIS tourism atlas for Quảng Ngãi province built in Warm Limestone, Deep Basalt, Coastal Jade, and Burnt Ochre.
colors:
  primary: "#0d5c53"
  primary-hover: "#094740"
  primary-soft: "#e3f0ed"
  primary-ink: "#0b4f47"
  secondary: "#b45309"
  secondary-bright: "#d97706"
  secondary-soft: "#fbf2e4"
  secondary-ink: "#7c3a06"
  canvas: "#f7f4ee"
  surface: "#fffdf9"
  surface-muted: "#efece4"
  basalt: "#111a18"
  basalt-elevated: "#1a2623"
  ink-primary: "#16201d"
  ink-secondary: "#43504b"
  ink-muted: "#596661"
  ink-on-dark: "#f5f2eb"
  ink-on-dark-muted: "#a9b4af"
  border-subtle: "#e3ddd1"
  border-strong: "#cbc3b3"
typography:
  display:
    fontFamily: "Source Serif 4, Georgia, Cambria, serif"
    fontSize: "3.5rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Source Serif 4, Georgia, Cambria, serif"
    fontSize: "2.25rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Source Serif 4, Georgia, Cambria, serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0em"
  body:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  label:
    fontFamily: "Be Vietnam Pro, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: "0em"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "56px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "0 16px"
  card-atlas:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.lg}"
    padding: "20px"
  input-field:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink-primary}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "8px 14px"
---

# Design System: Quảng Ngãi Atlas

## Overview

**Creative North Star: "The Limestone Field Atlas"**

Quảng Ngãi Atlas combines archival Vietnamese heritage typography with daylight field-guide clarity. Instead of generic SaaS gradients and heavy floating glass cards, the interface rests on warm limestone paper (`#f7f4ee`) and ivory surfaces (`#fffdf9`), anchored by deep basalt (`#111a18`) for cartographic stages and editorial dark bands.

Color discipline stays restrained so destination photography (Lý Sơn sea cliffs, Sa Huỳnh salt fields, Măng Đen pine forests) carries the page. Interactive affordances—search controls, active filters, map pins, and primary actions—use Coastal Jade (`#0d5c53`) and Warm Ochre (`#b45309` / `#d97706`) with strict WCAG AA legibility.

**Key Characteristics:**
- Warm limestone daylight canvas (`#f7f4ee`) paired with crisp `1px` warm borders (`#e3ddd1`).
- High-legibility Vietnamese typography (`Source Serif 4` display + `Be Vietnam Pro` UI + `JetBrains Mono` coordinates/distances).
- Single elevation declaration: cards sit flat by default and lift cleanly on hover or floating overlay state.
- Full `prefers-reduced-motion: reduce` parity across CSS transitions, GSAP timelines, and Lenis scrolling.

## Colors

The palette pairs warm mineral neutrals with coastal jade and burnt ochre accents.

### Primary
- **Coastal Jade** (`#0d5c53`): Primary CTA buttons, active route indicators, map selection labels, and `:focus-visible` outlines. Achieves ≥7.5:1 contrast with ivory text (`#fffdf9`).
- **Coastal Jade Hover** (`#094740`): Hover/pressed fill state for primary actions.
- **Jade Tint Wash** (`#e3f0ed`): Selected filter rows, price pills, and non-blocking inline status notices paired with **Jade Ink** (`#0b4f47`).

### Secondary
- **Burnt Ochre** (`#b45309`) & **Amber Ochre** (`#d97706`): Featured destination badges, star ratings, and itinerary step indices. When amber (`#f59e0b`) fills a pill or badge, ink always flips to **Deep Basalt Ink** (`#16201d`) for high contrast.

### Neutral
- **Warm Limestone Canvas** (`#f7f4ee`): Default page background.
- **Elevated Ivory Surface** (`#fffdf9`): Card, sidebar, search bar, and dialog grounds.
- **Muted Stone** (`#efece4`): Tab tracks, segmented control rails, and tag pills.
- **Deep Basalt** (`#111a18`): Interactive map stage, gallery lightbox, hero scrim, dark showcase band, and site footer.
- **Basalt Ink** (`#16201d`), **Charcoal Moss** (`#43504b`), and **Stone Muted** (`#596661`): Hierarchical light-ground text colors maintaining ≥4.5:1 contrast.
- **Cream On Dark** (`#f5f2eb`) & **Stone On Dark** (`#a9b4af`): Dark-ground primary and secondary text colors maintaining ≥7.5:1 contrast on `#111a18`.

### Named Rules
**The Accessible Amber Rule.** Amber/ochre fills (`#f59e0b`) never carry white text; always pair them with Deep Basalt Ink (`#16201d`), or step down to Burnt Ochre Soft (`#fbf2e4`) with Deep Ochre Ink (`#7c3a06`).

## Typography

**Display Font:** `Source Serif 4` (with `Georgia, Cambria, serif` fallback, full `vietnamese` subset)
**Body Font:** `Be Vietnam Pro` (with `ui-sans-serif, system-ui, sans-serif` fallback, full `vietnamese` subset)
**Label/Mono Font:** `JetBrains Mono` (with `ui-monospace, SFMono-Regular, monospace` fallback, full `vietnamese` subset)

**Character:** Editorial serif headlines carry cultural warmth and authority across Vietnamese diacritics, while `Be Vietnam Pro` keeps filter sidebars, mobile buttons, and long descriptions effortless to scan.

### Hierarchy
- **Display** (600, `3rem–3.5rem`, `1.15` line-height, `-0.025em` tracking): Hero headings on Home and About.
- **Headline** (600, `1.875rem–2.25rem`, `1.2` line-height, `-0.02em` tracking): Page headers on Explore, Itinerary, and section titles.
- **Title** (600, `1.125rem–1.25rem`, `1.35` line-height): Card titles, detail sub-sections, modal headers.
- **Body** (400–500, `1rem` / `0.875rem`, `1.6` line-height): Editorial descriptions, card summaries, form fields.
- **Label** (600, `0.75rem`, `1.35` line-height): Form labels, category chips, filter counts, map legend tags.
- **Mono** (500, `0.75rem–0.875rem`, `tabular-nums`): WGS84 latitude/longitude coordinates, leg distances (km), stop numbers, and slide counters.

### Named Rules
**The Honest Mono Rule.** Monospace (`JetBrains Mono`) is reserved strictly for GPS coordinates, numeric distances, and tabular counters—never as decorative eyebrow labels.

## Layout

Content wraps inside `max-w-7xl` (`1280px`) with balanced horizontal gutters (`px-4 sm:px-6 lg:px-8`).
- Home alternates full-bleed hero, flush province overview strip, 4-column category grid, 3-column featured destination grid on elevated ivory, and a 12-column basalt itinerary split.
- Explore uses a 4-column asymmetric layout (`1` sticky filter sidebar + `3` results grid/list) collapsing to an accessible slide-over drawer below `lg` (`1024px`).
- Map locks to `100dvh` below `lg` with a floating 3-way mobile segmented control (`Bản đồ`, `Địa điểm`, `Lịch trình`), expanding into a persistent `384px–420px` sidebar + full-height Leaflet stage on desktop.

## Elevation & Depth

Surfaces communicate hierarchy through tone contrast and crisp `1px` warm borders rather than permanent drop shadows. Shadows appear only when an element hovers into focus or floats above the canvas/map (hero search bar, autocomplete panel, map popups, drawers).

### Shadow Vocabulary
- **Elevated Hover / Card Lift** (`box-shadow: 0 14px 32px -10px rgba(17, 26, 24, 0.12), 0 2px 6px -1px rgba(17, 26, 24, 0.05)`): Applied on card hover (`atlas-card:hover`) and floating map controls.
- **Overlay / Floating Search** (`box-shadow: 0 22px 48px -12px rgba(17, 26, 24, 0.18), 0 6px 16px -4px rgba(17, 26, 24, 0.08)`): Applied on HeroSearch dropdown, modal dialogs, and MapViewer popup cards.

### Named Rules
**The Single-Elevation Rule.** Never stack a `1px` border beneath a permanent blurry shadow on static content cards; reserve shadows for hover lifts and true floating overlays.

## Shapes

- **Cards & Sections:** Consistent `12px` (`rounded-xl`) corners, with `16px` (`rounded-2xl`) reserved for large feature containers.
- **Buttons, Inputs & Inner Frames:** Crisp `8px` (`rounded-lg`) corners.
- **Pills & Badges:** Compact status badges use `6px` (`rounded-md`); quick-filter tags and map legend dots use `9999px` (`rounded-full`).

## Components

### Buttons
- **Shape:** Rounded rectangle (`8px` radius), minimum `44px` (`min-h-11`) touch target height across mobile and desktop.
- **Primary:** Deep Coastal Jade (`#0d5c53`) background with ivory text (`#fffdf9`); darkens to `#094740` on hover with tactile `.ui-interactive-press` feedback (`scale(0.97)` active).
- **Secondary:** Warm Limestone (`#f7f4ee`) or Ivory (`#fffdf9`) fill with `1px` border (`#cbc3b3` / `#e3ddd1`) and dark basalt ink (`#16201d`).

### Cards / Containers
- **Corner Style:** `12px` (`rounded-xl`).
- **Background:** Elevated Ivory (`#fffdf9`) over Warm Limestone (`#f7f4ee`).
- **Border:** `1px solid #e3ddd1` at rest; shifts toward jade (`rgba(13, 92, 83, 0.42)`) on hover with `-2px` translate lift and `1.03` image zoom inside its frame.

### Inputs / Fields
- **Style:** `44px–48px` height, `8px` radius, `#f7f4ee` background with `1px solid #e3ddd1`. Always paired with an explicit visible `<label for>` above or beside the field.
- **Focus:** Border transitions to `#0d5c53`, plus global `2px solid #0d5c53` `:focus-visible` ring.

### Navigation
- Sticky `64px` (mobile) / `80px` (desktop) ivory bar (`#fffdf9/95` backdrop blur) with bottom `1px` border (`#e3ddd1`), geometric Jade compass seal, single active sliding bottom bar indicator (`#0d5c53`), and responsive mobile drawer (`role="dialog"`).

## Do's and Don'ts

### Do:
- **Do** preserve `vietnamese` font subsets on all Google Fonts and keep `tabular-nums` on coordinates, ratings, and distances.
- **Do** enforce minimum `44px` touch targets on mobile/tablet interactive controls and use non-blocking `role="status"` notices instead of `alert()`.
- **Do** keep `prefers-reduced-motion: reduce` respected in both CSS and GSAP hooks.

### Don't:
- **Don't** place eyebrow kickers above section headings or decorative `01/02/03` badges on non-sequential cards.
- **Don't** use gradient text fills, glowing zero-offset shadows, pulsing decorative status dots, or `* { scroll-behavior: smooth; }` alongside Lenis.
- **Don't** expose internal development/CMS labels ("Mô phỏng", "Admin CMS", "Supabase PostGIS") on tourist-facing pages.
