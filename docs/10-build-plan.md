# Build plan & current status

## The path

```
Phase 1 — Design exploration       [DONE]
   └─ 5 mock directions, screenshots, critique, recommendation
Phase 2 — Refined single mock      [IN PROGRESS]
   └─ Pinned-left layout, tokens applied, diagram pan/zoom
Phase 3 — React slice              [NEXT]
   └─ 2-3 slides + level toggle + chapter transition, validates patterns
Phase 4 — Full curriculum build    [AFTER SLICE APPROVED]
   └─ Author all 9 chapters × 3 levels, populate diagram registry
Phase 5 — Polish & deploy
   └─ Performance, accessibility, deployment, share
```

## Status today

### Done

- Project purpose, audience, thesis (`docs/01-purpose-and-audience.md`)
- Curriculum structure: 10 chapters with 101/201/301 breakdowns and named-tech inventory (Ch 9 added as end-to-end synthesis playground; Working with Claude Code now Ch 10)
- Per-chapter recap pattern: each chapter ends bridging its concept onto the persistent diagram
- Pedagogical model: layered slides (not parallel curricula), level toggle drives slides + glossary + diagram
- Architecture-diagram spine with per-chapter accretion and per-level density tables
- Feature template (9 questions) and chapter mappings
- Design system: 2 fonts (Fraunces + Inter), single palette + accent, type scale
- Layout: pinned-left, three columns, hard scroll snap, content-fit-per-slide
- Navigation model: scroll + keyboard + click, explicit chapter transitions, URL state
- Tech stack chosen: React + Vite + TypeScript + Framer Motion
- Five exploration mocks built and reviewed (`mocks/mock1-editorial.html` through `mock5-scrollytelling.html`)
- Recommendation: Mock 5 scaffolding + Mock 1 diagram quality + Mock 4 chapter rail

### In progress

- Refined single mock (`mocks/mock6-refined.html`) being built against `mocks/REFINED_SPEC.md`
  - Pinned-left layout
  - Fraunces + Inter only
  - Diagram capped at 600×480, pan/zoom enabled
  - Hard scroll-snap with content-fit-per-slide

### Open questions before React build

1. **Tailwind or CSS modules + custom properties?** Currently leaning CSS modules for purity; Tailwind for speed. Decide before scaffolding.
2. **Keep `mocks/` or delete after Phase 3?** Currently gitignored; can stay as visual reference indefinitely or be cleared once the React build looks better than they do.
3. **Self-hosted fonts vs. Google Fonts CDN?** Self-hosted is faster and more reliable; needs to download the variable files.
4. **Hosting choice — Vercel vs. Cloudflare Pages?** Either works for a static SPA. Defer until Phase 5.

## Phase 3 — React slice scope

What the slice must demonstrate before authorizing Phase 4:

- Vite + React + TypeScript + Framer Motion scaffold
- All design tokens loaded from `tokens.css` and `type.css`
- `Layout` component with the three-column grid, scroll snap, sticky diagram pane
- `Diagram` component reading from a small element registry, supporting pan/zoom and one programmatic focus
- `Slide` component honoring the content-fit-per-slide rule
- `LevelToggle` driving a `useLevel()` hook that filters slides
- 2-3 slides authored as content data, not embedded in components
- One chapter transition (Ch 6 → Ch 7) showing the explicit "Next" card pattern
- Keyboard navigation (`←` `→` `L`) wired
- URL hash state for slide position

What the slice does NOT need:
- All 9 chapters of content
- Full glossary or smell-tests UI
- Cmd+K palette
- Tablet / mobile responsive polish
- Real deployment

## Phase 4 — Authoring rhythm

Once the slice is approved, content authoring is the long pole. Suggested cadence:

- One chapter per session: write all three levels, register diagram elements, write smell tests, add glossary entries.
- Author chapters in numerical order — later chapters depend on earlier ones for the diagram accretion to make sense.
- Each chapter ends with two Claude Code prompts (the threading rule).

Estimated chapter authoring time: 2-4 hours per chapter for the content; ~30-60 minutes per chapter for diagram registration.

## Phase 5 — Polish checklist

- Performance: bundle under 200kb gzip; first paint under 1s on 4G
- Accessibility: keyboard-complete; screen reader pass on slide content; respect `prefers-reduced-motion` (skip diagram zoom animations)
- Print stylesheet (one-page-per-slide print fallback for those who want PDF)
- OG / Twitter meta with a real social card
- Analytics minimal (Plausible or none)
- Deploy to chosen host with custom domain
