# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are domestic and international visitors planning or traveling across Quảng Ngãi province (from Lý Sơn Island and Sa Huỳnh coast to Măng Đen highlands and Chư Mom Ray) on both mobile phones in the field and desktop browsers during trip planning. Secondary users are local editors managing destinations through the internal admin routes (`/admin`, `/admin/images`).

## Product Purpose

Bản Đồ Di Sản & Du Lịch Tỉnh Quảng Ngãi is an interactive digital tourism atlas and itinerary planner for Quảng Ngãi province (post-merger coverage spanning coastal islands, historic heritage sites, culinary specialties, and Western highland forests). Success means visitors immediately grasp the breadth of Quảng Ngãi's destinations, discover places by region or experience, locate every site on multi-layer interactive maps, and assemble sequential GPS-linked routes without friction.

## Positioning

Unlike static tourism brochures or generic map embeds, the platform unifies curated destination storytelling, tone-insensitive Vietnamese search (`utils/vietnamese.ts`), multi-layer Leaflet GIS mapping (road, terrain, satellite), and real-time Haversine distance/time route calculation with one-tap Google Maps navigation handoff.

## Operating Context

- Used on desktop during pre-trip planning (searching, filtering, reading editorial detail pages, sequencing multi-stop tours).
- Used on mobile smartphones outdoors during travel (switching between full-viewport interactive map, place directory, and turn-by-turn itinerary legs).
- Static/client-driven Next.js App Router architecture using curated mock datasets (`data/places.ts`, `data/categories.ts`, `data/districts.ts`, `data/settings.ts`) with `localStorage` persistence (`tourism_map_*_v6`) via `DataContext`.

## Capabilities and Constraints

- Preserve all routes (`/`, `/explore`, `/map`, `/itinerary`, `/places/[id]`, `/about`, `/admin`, `/admin/images`) and `DataContext` state/persistence contracts.
- Preserve tone-insensitive Vietnamese search, `HeroSearch` query parameter handoff, `MapViewer` mobile segmented controls and `100dvh` viewport lock, `LeafletMap` `ResizeObserver` and `data-lenis-prevent`, `ItineraryPageContent` Haversine routing, `PlaceGallery`, and `SmoothScrollProvider` Lenis–GSAP clock sync.
- Do not add new npm dependencies; build using Next.js 16, React 19, Tailwind CSS v4, GSAP, Lenis, Lucide icons, and Leaflet.
- All tourist-facing UI copy must be authentic Vietnamese without internal placeholder labels ("Tỉnh Non Xanh", "Mô phỏng", "Admin CMS", "Supabase PostGIS" in tourist flows) or blocking browser `alert()` dialogs.

## Brand Commitments

- **Visual Direction (User-Confirmed):** Warm Limestone & Deep Jade ("Đá vôi ấm & Ngọc bích sâu") — elevated editorial travel atlas aesthetic, warm daylight limestone ground, deep basalt ink, jade/coastal teal and warm amber-ochre accents, paired with `Source Serif 4` display typography, `Be Vietnam Pro` body typography, and `JetBrains Mono` for GPS/distance/data figures (all with full `vietnamese` subset support).
- **Scope (User-Confirmed):** Full tourist-facing redesign across Home, Explore, Map, Itinerary, Place Detail, and About pages, fixing all contrast, accessibility, reduced-motion, landmark, and responsive layout issues.

## Evidence on Hand

- 20 curated destinations across 4 categories (`Thiên nhiên sinh thái`, `Biển đảo & Vịnh biển`, `Di tích lịch sử`, `Văn hóa Ẩm thực`) and 7 administrative districts (`TP. Quảng Ngãi`, `Đặc Khu Lý Sơn`, `Xã Mộ Đức`, `Vùng Sa Huỳnh`, `Phường Kon Tum`, `Xã Măng Đen`, `Khu Vực Phía Tây`).
- Verified Unsplash photography in `data/places.ts` and `data/imageLibrary.ts`; hero default photo in `data/settings.ts` should use a distinct photo rather than duplicating `pl-thien-an`.

## Product Principles

1. **Landscape and heritage lead:** Photography and clear cartography carry authority; chrome and decorative widgets stay quiet.
2. **One cohesive atlas system:** Every tourist route shares the same warm limestone surfaces, typographic hierarchy, and tactile interaction grammar.
3. **Field-ready usability:** Mobile touch targets (≥44px), non-blocking feedback, readable outdoor contrast, and fast keyboard navigation come first.
4. **Honest provenance and copy:** Speak directly to travelers in natural Vietnamese; keep administrative/technical implementation details out of visitor views.

## Accessibility & Inclusion

- WCAG AA contrast (≥4.5:1 body/meta text, ≥3:1 large text) across all light, dark, and image surfaces.
- Full `prefers-reduced-motion: reduce` support across CSS, GSAP `useGSAP`, `AnimatedContent`, and `SplitText`.
- Semantic HTML landmarks (single `<main>` per page, skip-to-content link, strict `h1 -> h2 -> h3` hierarchy), accessible `<label for>` bindings, keyboard-accessible lightboxes/dialogs, and visible `:focus-visible` focus rings.
