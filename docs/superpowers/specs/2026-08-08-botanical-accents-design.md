# Design: Botanical Accents for Java Origins Storefront

Date: 2026-08-08
Status: Approved by user

## Goal

Add subtle nature-themed decorative accents to the storefront using the existing
`lucide-react` icon library (real icon library — no hand-crafted SVG). Keep the
current warm brown/amber palette **unchanged** and do **not** touch any
functionality (state, fetch, handlers, forms, API).

## Design Principles

- Colors are preserved 100%. No hex value is modified.
- Decorations are additive only — pure presentational `<div>`/`<Icon>` additions
  to JSX, `pointer-events-none` where overlaid so clicks are never blocked.
- Icons come from the already-installed `lucide-react` dependency (Leaf, Sprout,
  Flower2, TreePine, Wheat). No new dependency, no hand-authored SVG paths.
- Monochrome per element: each icon uses exactly one color already present in the
  palette (e.g. `#EAB308`, `#FACC15`, `#786C60`, or `#140E0A`), no gradients.

## Scope

Storefront pages only. Admin pages are explicitly out of scope.

Affected pages (all storefront): `/`, `/shop`, `/products/[id]`, `/cart`,
`/checkout`, `/order/[id]`, `/login`, `/register`, `/profile`.

## Components

### New: `src/components/BotanicalDivider.tsx`

Reusable decorative component: one leaf (lucide `Leaf`) flanked by thin lines,
centered under a section heading. Props: `color?: string` (default `#EAB308`),
`size?: number` (default 18).

Usage pattern:

```tsx
<BotanicalDivider />
```

Must not require any state or props beyond optional styling. Rendered purely
visually (no interactive handlers).

## Placement

1. **Hero** (`src/components/HeroSlider.tsx`): add 1–2 `Leaf` icons at large size
   (40–64px) positioned absolutely in the lower-left / lower-right of the hero
   overlay area, semi-transparent, `pointer-events-none`. Color from existing
   palette (amber tones).

2. **Section / page headers** (homepage sections, shop header, product detail,
   cart, checkout, order, login, register, profile): place a `BotanicalDivider`
   (leaf + thin lines) beneath the main `h1`/section heading.

3. **Footer** (`src/components/Footer.tsx`): a row of small leaf/sprout ornaments
   (`Leaf` + `Sprout`, `#FACC15` on the dark `#140E0A` background) above the
   bottom copyright bar.

## Explicitly NOT Changed

- All logic: cart context, auth, orders, upload, all API routes, `lib/store.ts`,
  `lib/db.ts`, `lib/auth.ts`.
- Colors, fonts, layout, spacing.
- Admin pages (`/admin/**`).
- Any icon currently in use is kept; nature icons are additions.

## Risk

Low. Changes are additive presentational JSX. The only layout interaction is
`absolute` positioning inside the hero, which is verified by visual check after
deploy.

Deployment: build → zip `.next/` → upload to
`~/javaorigins.co.nz/admin/public_html/` → extract → copy
`.next/static` to `~/public_html/public/_next/static` → Stop→Start Node App.
