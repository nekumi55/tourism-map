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

<!-- impeccable:design-map -->
Name: Quảng Ngãi Atlas
Colors: primary: primary #0d5c53; secondary: secondary #b45309; neutral: canvas #f7f4ee
Fonts: Source Serif 4 (display, headline, title); Be Vietnam Pro (body, label); JetBrains Mono (mono)
Spacing: xs 8px, sm 12px, md 16px, lg 24px, xl 32px, 2xl 56px
Radius: sm 6px, md 8px, lg 12px, xl 16px, full 9999px
North Star: "The Limestone Field Atlas"
Rules:
- The Accessible Amber Rule. Amber/ochre fills (`#f59e0b`) never carry white text; always pair them with Deep Basalt Ink (`#16201d`), or step down to Burnt Ochre Soft (`#fbf2e4`) with Deep Ochre Ink (`#7c3a06`).
- The Honest Mono Rule. Monospace (`JetBrains Mono`) is reserved strictly for GPS coordinates, numeric distances, and tabular counters—never as decorative eyebrow labels.
- The Single-Elevation Rule. Never stack a `1px` border beneath a permanent blurry shadow on static content cards; reserve shadows for hover lifts and true floating overlays.
Elevation:
- Elevated Hover / Card Lift: 0 14px 32px -10px rgba(17, 26, 24, 0.12), 0 2px 6px -1px rgba(17, 26, 24, 0.05)
- Overlay / Floating Search: 0 22px 48px -12px rgba(17, 26, 24, 0.18), 0 6px 16px -4px rgba(17, 26, 24, 0.08)
Don't:
- Don't place eyebrow kickers above section headings or decorative `01/02/03` badges on non-sequential cards.
- Don't use gradient text fills, glowing zero-offset shadows, pulsing decorative status dots, or `* { scroll-behavior: smooth; }` alongside Lenis.
- Don't expose internal development/CMS labels ("Mô phỏng", "Admin CMS", "Supabase PostGIS") on tourist-facing pages.
Do:
- Do preserve `vietnamese` font subsets on all Google Fonts and keep `tabular-nums` on coordinates, ratings, and distances.
- Do enforce minimum `44px` touch targets on mobile/tablet interactive controls and use non-blocking `role="status"` notices instead of `alert()`.
- Do keep `prefers-reduced-motion: reduce` respected in both CSS and GSAP hooks.
Full: .impeccable/design-full.md (read a section when you need its detail)
