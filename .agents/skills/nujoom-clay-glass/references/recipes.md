# Nujoom Clay Glass — Recipes

Copy-ready patterns. Adapt token names to the host project.

## Clay card (with hover lift / press)

```css
.clay {
  border-radius: var(--clay-radius);
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur-card);
  border: 1px solid var(--glass-rim);
  box-shadow: var(--clay-shadow);
  transition: box-shadow var(--transition-base), transform var(--transition-base), background var(--transition-base);
}
.clay:hover  { box-shadow: var(--clay-shadow-hover); transform: translateY(-2px); }
.clay:active { box-shadow: var(--clay-shadow-pressed); transform: translateY(0); }
```

Data-heavy variant: swap background to `var(--data-bg)` and blur to `saturate(105%) blur(3px)`, shadow to `var(--clay-shadow-flat)` — dense content must stay crisp.

## Glass header

```css
header {
  position: sticky; top: 0; z-index: 50;
  background-color: var(--glass-bg-strong);
  backdrop-filter: var(--glass-blur);              /* saturate(150%) blur(20px) */
  border-bottom: 1px solid var(--glass-rim);
  box-shadow: 0 10px 30px -18px hsl(var(--foreground) / 0.35);
}
```

## Input well (pressed, not puffy)

```css
.input-well {
  background-color: var(--control-bg);
  backdrop-filter: saturate(110%) blur(6px);
  border: 1px solid hsl(var(--input));
  border-radius: calc(var(--clay-radius) - 0.5rem);
  box-shadow: var(--clay-inset-soft);
}
.input-well:focus-visible {
  background-color: hsl(var(--background));
  box-shadow: var(--clay-inset-soft), 0 0 0 3px hsl(var(--ring) / 0.3);
  outline: none;
}
```

## Buttons — puffy clay, ghost stays flat

```css
.btn-clay {
  border-radius: 0.75rem;
  box-shadow: 0 8px 18px -10px hsl(var(--foreground) / 0.35),
              inset 0 1px 0 0 hsl(0 0% 100% / 0.28);
  transition: box-shadow var(--transition-base), transform var(--transition-base);
}
.btn-clay:hover  { transform: translateY(-1px);
  box-shadow: 0 14px 26px -12px hsl(var(--foreground) / 0.4), inset 0 1px 0 0 hsl(0 0% 100% / 0.35); }
.btn-clay:active { transform: translateY(0); box-shadow: var(--clay-shadow-pressed); }
/* Dark theme: outer 0.25/0.3 alphas, inset rim 0.06 / 0.09 — never full white */
```

Ghost/text buttons stay shadowless until hover — reserve puffy clay for real actions.

## Spotlight hover-glow border

```css
.hover-glow { position: relative; transition: box-shadow .3s ease; }
.hover-glow::before {
  content: ''; position: absolute; inset: -1px; border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(135deg, hsl(var(--primary) / 0) 0%, hsl(var(--primary) / 0) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  pointer-events: none; opacity: 0;
  transition: background .35s ease, opacity .35s ease;
}
.hover-glow:hover::before {
  background: linear-gradient(135deg, hsl(var(--primary) / .8) 0%, hsl(var(--primary) / .4) 40%, hsl(var(--primary) / .8) 100%);
  opacity: 1;
}
.hover-glow:hover { box-shadow: 0 0 12px hsl(var(--primary) / .25), 0 0 24px hsl(var(--primary) / .1); }
```

## Electric border (hero / submit accent)

Neon stroke that ignites on hover with layered glow. Set `--electric-border-color` to the accent hue (e.g. neon green for submit):

```css
.electric { position: relative; border-radius: 8px; --electric-border-color: hsl(142 90% 45%); }
.electric .stroke  { position: absolute; inset: 0; border-radius: inherit; border: 3px solid var(--electric-border-color); opacity: .5; transition: .3s; }
.electric .glow-1  { position: absolute; inset: -1.5px; border-radius: inherit; border: 4.5px solid var(--electric-border-color); filter: blur(6px); opacity: .9; transition: .3s; }
.electric .glow-2  { position: absolute; inset: -3px;   border-radius: inherit; border: 6px solid var(--electric-border-color);   filter: blur(12px); opacity: .6; transition: .3s; }
.electric:hover .stroke { opacity: 1; filter: brightness(1.3); }
.electric:hover .glow-1 { filter: blur(8px) brightness(1.4); }
.electric:hover .glow-2 { opacity: .9; filter: blur(16px) brightness(1.3); }
.electric .content { position: relative; z-index: 1; border-radius: inherit; }
```

## Card shine sweep

```css
.shine { position: relative; overflow: hidden; }
.shine::before {
  content: ''; position: absolute; top: 0; left: -100%;
  width: 100%; height: 100%;
  background: linear-gradient(90deg, transparent, hsl(0 0% 100% / .2), transparent);
  transition: left .5s; pointer-events: none;
}
.shine:hover::before { left: 100%; }
```

## Entrance animations (fade-up + stagger)

```css
@keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
@keyframes successPop { from { opacity: 0; transform: scale(.9); } to { opacity: 1; transform: scale(1); } }

.list-item { animation: fadeInUp var(--transition-slow) ease-out both; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
.list-item:nth-child(4) { animation-delay: 150ms; }
.list-item:nth-child(5) { animation-delay: 200ms; }
.list-item:nth-child(6) { animation-delay: 250ms; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Destructive-action countdown confirm

Safety law: destructive buttons never fire instantly. Pattern:

1. "Delete" click opens a modal restating exactly what will be removed.
2. The confirm button renders disabled with a live countdown — hold ~1.5s (progress ring or `1.5 → 0` seconds) before it enables.
3. On confirm: play the success chime, toast bottom-left. On cancel: no penalty, modal closes.
4. Optional undo window (~8s toast action) for reversible operations like moves.

## Table treatment (crisp data surface)

```css
.table-wrap { overflow-x: auto; max-width: 100%; -webkit-overflow-scrolling: touch; }
table { width: 100%; background-color: var(--data-bg); border-collapse: collapse; }
th {
  background-color: var(--data-head-bg);
  backdrop-filter: saturate(120%) blur(4px);
  border-bottom: 1px solid var(--data-grid);
  font-weight: 600; letter-spacing: .01em;
}
tbody tr { border-bottom: 1px solid hsl(var(--border) / .6); transition: background-color var(--transition-fast); }
tbody tr:nth-child(even) { background-color: var(--data-row-alt); }
tbody tr:hover { background-color: hsl(var(--primary) / .1); box-shadow: inset 0 0 0 1px hsl(var(--primary) / .2); }
th, td {
  white-space: nowrap; overflow-wrap: normal; word-break: keep-all;
  font-size: clamp(0.68rem, 0.55rem + 0.32vw, 0.875rem);
  backdrop-filter: none;  /* text stays crisp — blur never touches content */
}
td.wrap, th.wrap { white-space: normal; overflow-wrap: anywhere; }  /* opt-out */
```

Slim themed scrollbar in primary tint:

```css
* { scrollbar-width: thin; scrollbar-color: hsl(var(--primary) / .55) hsl(var(--muted) / .35); }
::-webkit-scrollbar { width: 10px; height: 10px; }
::-webkit-scrollbar-track { background: hsl(var(--muted) / .35); border-radius: 999px; }
::-webkit-scrollbar-thumb { background: hsl(var(--primary) / .55); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }
```

## Mobile reflow (table → cards)

Below ~768px, reflow each row into a stacked card: keep clay card styling, ≥44px touch targets, label/value pairs instead of columns. Tables scroll in their own box before the breakpoint is hit.

## Print / export strip

```css
@media print {
  body { background-image: none; }
  *, *::before, *::after {
    box-shadow: none !important;
    backdrop-filter: none !important;
    background-color: transparent !important;
  }
}
```

## Overflow & stacking safety net

```css
html, body { max-width: 100%; overflow-x: auto; }
main *, header * { min-width: 0; }            /* flex children must shrink */
img, svg, video, canvas, iframe { max-width: 100%; }
[role="dialog"] { max-width: min(96vw, 64rem); max-height: 92dvh; overflow-y: auto; overscroll-behavior: contain; }
header.sticky { z-index: 50; }
[data-radix-popper-content-wrapper] { z-index: 60; }
[data-radix-toast-viewport] { z-index: 80; max-width: calc(100vw - 1rem); }
```

## RTL / bidi

- Use logical properties (`margin-inline-start`, `padding-inline-end`) instead of left/right wherever possible.
- `[dir="rtl"] { text-align: right; }` as a base; verify tables, toasts (bottom-**right** in RTL feel), and icons mirror correctly.
- For PDF generation with Arabic/Kurdish text, lazy-load an Arabic-capable font (e.g. Amiri) and patch text shaping + bidi before rendering; keep dates strictly `dd/MM/yyyy` from local (not UTC) values.
