# Skill: "Nujoom Clay Glass" — Extract This App's UI/UX Design Language

## Goal

Summarize the visual/interaction design of this app into a reusable skill (`.agents/skills/nujoom-clay-glass/`) so the same design language can be applied in other projects and creative work. The skill is portable: written generically, not tied to invoices or this codebase.

## What the skill will capture (from the codebase)

**Identity — "Navy Glow, Clay & Glass"**
- Deep navy surfaces (dark: `216 71% 15%`), light-blue primary/accent (light `205 100% 45%`, dark `205 100% 85%`), neon-green success as the "go" color, amber warnings, red destructive.
- Dual light/dark themes via HSL semantic tokens; every color goes through tokens, never hardcoded utilities.
- Ambient fixed radial-gradient body glow + subtle noise overlay.

**Claymorphism + Liquid Glass surface system**
- Tiered glass: strong blur (20px) on chrome/headers/overlays, medium (10px) on cards, low (6px) on input wells, near-opaque (97%) on data tables so text stays crisp.
- Clay shadows: puffy drop shadow + inset top white rim + inset bottom dark shade; hover lifts, active presses. Dark mode rims dialed way down (3–9%) to avoid white bloom.
- Rounded 1.25rem clay radius; pressed-inset input wells with focus ring glow.

**Motion & feedback**
- Spring/bounce easing (`0.34 1.56 0.64 1`), 150–500ms tiers, hover-glow borders (ElectricBorder-style neon stroke), fade/slide/scale entrances, skeleton pulses.
- Audio feedback paired with visual states (chime on success, whoosh on transitions); `prefers-reduced-motion` fully respected.

**Interaction rules**
- Destructive actions always behind a confirmation modal with a ~1.5s countdown.
- Toasts slide in bottom-left; 44px minimum touch targets; tables reflow into cards on mobile; tables never wrap (scroll in their own box).
- Full RTL support (Arabic/Kurdish): logical layout, right-aligned text, bidi-safe typography.

## Files to create

```
.agents/skills/nujoom-clay-glass/
├── SKILL.md              # core: when to trigger, identity, tokens, tiered glass rules, motion, interaction laws
└── references/
    ├── tokens.md         # full HSL palette (light+dark), shadows, radii, easing curves
    └── recipes.md        # copy-ready CSS/Tailwind patterns: clay card, glass header, input well, electric border, countdown confirm, mobile card reflow
```

- `SKILL.md` frontmatter — name `nujoom-clay-glass`; description targeting when to trigger: "Use when building or restyling UI with the Nujoom Clay Glass language — navy + light-blue glow theme, claymorphism, liquid-glass surfaces, spring animations. Triggers on 'clay', 'glass UI', 'nujoom style', 'apply the app's design language', or when asked to match this app's look elsewhere."
- Keep the body lean per skill-authoring principles: identity + rules + why; token values and recipes live in the two references, loaded on demand.
- After the draft is complete, register it with `skills--apply_draft` so it becomes an active skill (visible in Settings > Skills).

## Deliverables to the user

1. A short chat summary of the app's design language (the "what this app looks/feels like" answer).
2. The installed `nujoom-clay-glass` skill, usable in any project or creative space by typing `/` or describing the style.

No app code changes — this task only reads the codebase and writes the skill.
