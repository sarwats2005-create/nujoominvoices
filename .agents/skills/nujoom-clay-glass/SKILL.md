---
name: nujoom-clay-glass
description: Apply the Nujoom Clay Glass design language — navy + light-blue glow theme, claymorphism (puffy dual shadows) fused with liquid-glass surfaces, spring animations, and safe interactive feedback. Use when building or restyling UI "in the Nujoom style", when asked for clay/glass aesthetics, or when matching the look of the Nujoom Invoices app in another project or creative space. Triggers on "clay", "glass UI", "nujoom style", "claymorphism", "apply the app's design language".
---

# Nujoom Clay Glass

A tactile, high-contrast design language: soft puffy clay forms floating over a glowing navy backdrop, wrapped in translucent liquid glass. Everything feels physical — surfaces lift on hover, press inward on click, and glow on attention.

## Identity

**"Navy Glow, Clay & Glass."** One clear emotional target: a premium tool that feels soft to touch but crisp to read.

- **Base**: deep navy surfaces (dark `hsl(216 71% 15%)`), near-white in light mode, always tinted by an ambient fixed radial-gradient glow in primary/accent/success hues plus a 2% noise overlay.
- **Signal colors**: light blue for primary/accent (`205 100% 45%` light, `205 100% 85%` dark), neon green for success/"go" actions, amber warnings, red destructive. Never hardcode colors — route every value through semantic tokens so both themes stay balanced.
- **Contrast law**: text and data stay fully opaque and crisp; blur and translucency belong to the *surfaces*, never the content. Any surface holding a table, form, or dense data drops to near-opaque (≥96%) with minimal blur.

## The tiered glass system

Blur strength follows the layer's distance from data — the closer to raw content, the crisper:

| Tier | Use | Backdrop | Opacity |
|---|---|---|---|
| Chrome | header, nav, dialogs, popovers, menus | `saturate(150%) blur(20px)` | 78–92% |
| Cards | standalone cards | `saturate(120%) blur(10px)` | 80% |
| Controls | inputs, selects, wells | `saturate(110%) blur(6px)` | 85–90% |
| Data | tables, forms, anything dense | `saturate(105%) blur(3px)` | 96–97% |

## Clay shadows (the signature)

Every raised surface carries a **dual inset recipe**: a bright top rim (`inset 0 2px 1px white/50%`) plus a soft bottom shade, over a large diffuse drop shadow. Three states:

- **Rest**: `0 18px 40px -12px fg/0.28` + rim.
- **Hover**: deeper, wider shadow, surface lifts `translateY(-2px)`, rim brightens.
- **Pressed**: shadow inverts to inset — the surface physically sinks.

**Dark-mode dial-down (critical)**: white inset rims drop to 3–9% opacity in dark themes. Full-strength white rims read as white bloom and look broken. See `references/tokens.md` for exact values per theme.

Other constants: clay radius `1.25rem`; buttons get a smaller version of the same recipe; inputs are pressed wells (inset shadow, focus = brighter background + 3px primary ring glow); tabs/badges are soft pills.

## Motion & feedback

- **Easing tiers**: 150ms / 250ms / 350ms on `cubic-bezier(0.4, 0, 0.2, 1)`; celebrate with a 500ms spring `cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **Entrances**: fade-up 30px for lists/pages (stagger 50ms per item, cap ~6), fade-scale 0.9 for modals.
- **Attention**: spotlight gradient border that ignites on hover (`.hover-glow`), electric neon stroke border for hero/submit actions, shine sweep across cards, ripple on button press.
- **Sound**: pair key visual states with subtle audio — chime on success, whoosh on transitions — at user-controlled volume.
- **Accessibility**: always ship a `prefers-reduced-motion` kill-switch that collapses animations to ~0ms.

## Interaction laws

1. **Destructive actions never fire instantly.** Confirmation modal with a ~1.5s countdown before the button enables.
2. **Toasts slide in bottom-left** and stay inside the viewport safe area.
3. **Touch targets ≥ 44px**; dashboard tables reflow into cards on mobile.
4. **Tables never wrap**: `white-space: nowrap`, shrink-to-fit font via `clamp(0.68rem, 0.55rem + 0.32vw, 0.875rem)`, horizontal scroll in the table's own box, themed slim scrollbars in primary tint.
5. **Full RTL readiness**: logical layout, `[dir="rtl"]` right-alignment, bidi-safe typography for Arabic/Kurdish content.
6. **Nothing overflows**: fluid containers, `min-width: 0` on flex children, media capped at 100%, overlays capped at `min(96vw, 64rem)` / `92dvh`, stacking order pinned (header 50, poppers 60, toasts 80).
7. **Print/export strips all effects**: no shadows, no blur, transparent backgrounds — output stays crisp.

## Where the recipes live

- `references/tokens.md` — full HSL palette (light + dark), clay shadow values, radii, easing curves, glass tiers.
- `references/recipes.md` — copy-ready CSS/Tailwind: clay card, glass header, input well, hover-glow border, electric border, countdown confirmation, mobile table reflow.

Start there before writing styles from scratch; adapt the token values to the host project's palette while keeping the *relationships* (tiered blur, dual-inset shadows, dark rim dial-down) intact.
