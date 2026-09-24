# Nujoom Clay Glass — Design Tokens

All values are HSL channel triplets (for `hsl(var(--token))` usage), matching the source design system.

## Palette — Light theme

```css
:root {
  --background: 0 0% 100%;
  --foreground: 216 71% 15%;
  --card: 0 0% 100%;
  --card-foreground: 216 71% 15%;
  --popover: 0 0% 100%;
  --popover-foreground: 216 71% 15%;
  --primary: 205 100% 45%;          /* light blue */
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96%;
  --secondary-foreground: 216 71% 15%;
  --muted: 210 40% 96%;
  --muted-foreground: 215 20% 45%;
  --accent: 205 100% 45%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 84% 60%;
  --destructive-foreground: 0 0% 100%;
  --success: 142 76% 36%;           /* neon green */
  --success-foreground: 0 0% 100%;
  --warning: 38 92% 50%;
  --warning-foreground: 0 0% 100%;
  --border: 214 32% 85%;
  --input: 214 32% 85%;
  --ring: 205 100% 45%;
  --radius: 0.75rem;
}
```

## Palette — Dark theme (navy)

```css
.dark {
  --background: 216 71% 15%;        /* deep navy */
  --foreground: 0 0% 100%;
  --card: 216 71% 20%;
  --card-foreground: 0 0% 100%;
  --popover: 216 71% 18%;
  --primary: 205 100% 85%;          /* pale glowing blue */
  --primary-foreground: 216 71% 12%;
  --secondary: 216 60% 25%;
  --muted: 216 50% 22%;
  --muted-foreground: 210 30% 70%;
  --accent: 205 100% 85%;
  --destructive: 0 62% 50%;
  --success: 142 70% 45%;
  --warning: 38 92% 50%;
  --border: 216 50% 28%;
  --input: 216 50% 28%;
  --ring: 205 100% 85%;
}
```

## Ambient backdrop

```css
body {
  background-image:
    radial-gradient(at 12% 8%, hsl(var(--primary) / 0.16) 0px, transparent 55%),
    radial-gradient(at 88% 4%, hsl(var(--accent) / 0.14) 0px, transparent 50%),
    radial-gradient(at 76% 92%, hsl(var(--success) / 0.1) 0px, transparent 55%),
    radial-gradient(at 20% 96%, hsl(var(--primary) / 0.1) 0px, transparent 50%);
  background-attachment: fixed;
}
```

Optional 2% noise overlay: inline SVG `feTurbulence` (baseFrequency 0.9, 3 octaves) at `opacity: 0.02; pointer-events: none`.

## Clay shadow system

```css
:root {
  --clay-radius: 1.25rem;
  --clay-shadow:
    0 18px 40px -12px hsl(var(--foreground) / 0.28),
    0 8px 16px -8px hsl(var(--foreground) / 0.18),
    inset 0 2px 1px 0 hsl(0 0% 100% / 0.55),
    inset 0 -6px 12px -6px hsl(var(--foreground) / 0.16);
  --clay-shadow-hover:
    0 28px 60px -16px hsl(var(--foreground) / 0.34),
    0 10px 20px -10px hsl(var(--foreground) / 0.2),
    inset 0 2px 1px 0 hsl(0 0% 100% / 0.65),
    inset 0 -8px 16px -8px hsl(var(--foreground) / 0.18);
  --clay-shadow-pressed:
    inset 0 8px 16px -6px hsl(var(--foreground) / 0.24),
    inset 0 -2px 1px 0 hsl(0 0% 100% / 0.4),
    0 2px 6px -4px hsl(var(--foreground) / 0.2);
  --clay-inset-soft: inset 0 2px 4px -2px hsl(var(--foreground) / 0.18);
  --clay-shadow-flat:
    0 6px 16px -12px hsl(var(--foreground) / 0.3),
    0 1px 2px -1px hsl(var(--foreground) / 0.12);
}

/* Dark: deep navy drop shadows, white rims dialed down to 3-5%.
   This dial-down is the whole trick to dark mode not looking bloomy. */
.dark {
  --clay-shadow:
    0 20px 44px -14px hsl(216 80% 4% / 0.75),
    0 8px 18px -8px hsl(216 80% 4% / 0.6),
    inset 0 1px 0 0 hsl(0 0% 100% / 0.03),
    inset 0 -8px 16px -8px hsl(216 80% 4% / 0.5);
  --clay-shadow-hover:
    0 30px 66px -18px hsl(216 80% 4% / 0.85),
    0 12px 24px -10px hsl(216 80% 4% / 0.65),
    inset 0 1px 0 0 hsl(0 0% 100% / 0.05),
    inset 0 -10px 20px -10px hsl(216 80% 4% / 0.55);
  --clay-shadow-pressed:
    inset 0 10px 20px -8px hsl(216 80% 4% / 0.7),
    inset 0 -1px 0 0 hsl(0 0% 100% / 0.03);
  --clay-inset-soft: inset 0 2px 4px -2px hsl(216 80% 4% / 0.5);
  --clay-shadow-flat:
    0 8px 18px -14px hsl(216 80% 4% / 0.7),
    0 1px 2px -1px hsl(216 80% 4% / 0.5);
}
```

## Glass tiers

```css
:root {
  --glass-bg: hsl(var(--card) / 0.8);
  --glass-bg-strong: hsl(var(--card) / 0.92);
  --glass-rim: hsl(216 30% 30% / 0.14);
  --glass-blur: saturate(150%) blur(20px);          /* chrome */
  --glass-blur-card: saturate(120%) blur(10px);     /* cards */
  --glass-blur-control: saturate(110%) blur(6px);   /* inputs */
  --data-bg: hsl(var(--card) / 0.97);               /* tables/forms */
  --data-head-bg: hsl(210 40% 94% / 0.96);
  --data-row-alt: hsl(210 40% 97% / 0.7);
  --data-grid: hsl(214 32% 85% / 0.9);
  --control-bg: hsl(0 0% 100% / 0.9);
}

.dark {
  --glass-bg: hsl(var(--card) / 0.78);
  --glass-bg-strong: hsl(var(--card) / 0.9);
  --glass-rim: hsl(0 0% 100% / 0.06);
  --data-bg: hsl(var(--card) / 0.96);
  --data-head-bg: hsl(216 60% 26% / 0.95);
  --data-row-alt: hsl(216 55% 24% / 0.55);
  --data-grid: hsl(216 50% 34% / 0.85);
  --control-bg: hsl(216 65% 14% / 0.85);
}
```

## Easing & timing

```css
:root {
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 250ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 350ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-bounce: 500ms cubic-bezier(0.34, 1.56, 0.64, 1); /* spring — celebrations, success pops */
}
```

## Radii & type

- Clay radius `1.25rem` (cards/surfaces); base radius `0.75rem`; inputs `calc(var(--clay-radius) - 0.5rem)`; pills `999px`.
- Fluid type: `h1 clamp(1.25rem, 0.9rem + 1.4vw, 2rem)`, `h2 clamp(1.1rem, 0.9rem + 1vw, 1.6rem)`, `h3 clamp(1rem, 0.9rem + 0.6vw, 1.3rem)`.
- Table text: `clamp(0.68rem, 0.55rem + 0.32vw, 0.875rem)`; headers one step smaller.
