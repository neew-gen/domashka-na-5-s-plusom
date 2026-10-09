---
name: ai-design-best-practices
description: >-
  Best practices for product UI design with AI assistance — editorial systems,
  tokens, hierarchy, anti-patterns. Use before implementing or redesigning UI,
  when the user mentions design, layout, visual style, NYTimes/editorial look,
  or asks to style screens.
---

# AI Design Best Practices

Read this skill **before** writing or changing UI markup/styles for this project.

## Process

1. Confirm the visual reference (here: NYTimes editorial / print).
2. Define tokens first: paper, ink, hairline, accent, fonts, spacing scale.
3. One composition per viewport: masthead → primary content → secondary.
4. Implement with existing UI primitives (`components/UI`), not one-off styled divs.
5. Check desktop and mobile (M2: stack top strip; day focus on small screens).

## Editorial / print (NYT-like)

- Masthead with serif brand name; small uppercase kicker above it
- Black/near-black ink on off-white paper; one restrained accent (red/deep crimson)
- Hairline 1px rules instead of cards, shadows, and rounded pill chrome
- Hierarchy: serif for titles/task text; sans for navigation/meta/forms
- Current day: typographic underline / weight, not a colored badge block
- Done: strikethrough; overdue: accent/overdue text color only

## Copy rules (this project)

- Russian UI
- No abbreviations except weekday names (Пн–Пт)
- Importance: full words «низкая» / «средняя» / «высокая» + muted color, not pills

## Anti-patterns (avoid)

- Purple gradients, glow, glassmorphism, multi-layer shadows
- Dense “AI dashboard” card grids in the hero/first viewport
- Random emoji as decoration
- Truncated labels («НИЗК.», «вып.») except allowed weekdays
- `watch`/`watchEffect` for layout side-effects (follow CODE-STYLE)

## Checklist before finishing a screen

- [ ] Tokens used (no hard-coded one-off palette sprawl)
- [ ] Readable at 320px and 1280px
- [ ] Interactive elements use UI components
- [ ] Empty/loading/error states exist in plain language
- [ ] Matches locked layout: top strip dashboard+goals, then Mon–Fri columns
