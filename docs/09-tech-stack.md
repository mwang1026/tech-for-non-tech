# Tech stack

## Choices

| Layer | Choice | Reason |
|---|---|---|
| Build | **Vite** | Fast dev server, no config, static build deploys anywhere |
| Framework | **React** + **TypeScript** | Component model fits "diagram element appears on slide N as a function of state"; types prevent content-shape regressions |
| Animation | **Framer Motion** | Declarative variants, good defaults, handles SVG transforms cleanly for the diagram zoom |
| Styling | **CSS variables + CSS modules** *(tentative — see open question below)* | Native, no runtime cost, design tokens live as CSS custom properties |
| State | **React context** for level + chapter; URL hash as source of truth for slide position | Scope is small enough that a state library is overkill |
| Content | **TypeScript data files** under `src/content/` | Types catch schema drift; level filtering is a pure function over data |
| Deploy | **Vercel** or **Cloudflare Pages** | Static build, zero infra, instant rollback |

### Open question — Tailwind?

Currently leaning **CSS variables + modules** for purity. Tailwind would speed up iteration but adds a dependency and the editorial typography spec is detailed enough that hand-written CSS reads more naturally. Decide before scaffolding the React slice.

## DRY templating spine

Extract these as templates from day one. Refactoring later is more expensive than getting them right at the start.

### Design tokens (`src/tokens/`)

- `tokens.css` — CSS custom properties for color, spacing, radii (mirror of `docs/07-design-system.md`)
- `type.css` — font-face declarations, type-scale utility classes
- Single source of truth. Every component reads from tokens, never hard-codes colors or font sizes.

### Layout component (`src/components/Layout.tsx`)

Owns the three-column grid, top bar, scroll snap behavior, sticky diagram pane, responsive breakpoints. Plugs in named slots: `rail`, `diagram`, `content`, `topBar`. Other components don't touch grid rules.

### Slide layout (`src/components/Slide.tsx`)

Standard slide chrome: optional headline area, body slot, footer with prev/next, level pill. Each slide just supplies content into slots. Enforces the content-fit-per-slide rule by setting fixed pane height.

### Architecture diagram (`src/components/Diagram.tsx`)

ONE SVG component. Element visibility is **data-driven** by props:

```tsx
<Diagram chapter={6} level={201} focus="gateway" zoomed={false} />
```

The diagram component does not have nine versions. It has one component reading state. Same source of truth feeds the auto-react on scroll, the level filter, and the focus prop.

Internals:
- SVG element registry tagged with `chapter` and `level` metadata
- `useDiagramState()` hook reads chapter + level + focus and computes which elements are visible
- Framer Motion handles the fade-in/out with stagger
- ViewBox manipulation handles pan/zoom (manual + programmatic)

### Motion variants (`src/motion/variants.ts`)

A small set of named variants used everywhere:
- `fadeRise` — for slides entering
- `crossFade` — for slide transitions
- `diagramReveal` — for new diagram elements appearing
- `gatewayZoom` — for the programmatic viewBox zoom
- `staggerChildren` — for ordered reveals

Components import variants by name. No bespoke per-component animation timing.

### Content registry (`src/content/`)

Chapter and slide content lives in structured TypeScript data files, not inside components:

```
src/content/
  chapter-01-request-response.ts
  chapter-02-state.ts
  ...
  glossary.ts
  smell-tests.ts
```

Each chapter exports an array of slide objects with shape:

```ts
type Slide = {
  id: string
  level: 101 | 201 | 301
  replaces?: string  // ID of a lower-level slide this supersedes
  headline: string
  body: SlideBody  // structured, not a string blob
  diagramFocus?: string  // which diagram region to focus when this slide is active
}
```

Authoring is decoupled from layout. Filtering by level is a pure function over this data.

### Level filter hook (`src/hooks/useLevel.ts`)

Single hook used by slides, glossary, smell tests, and the diagram. One source of truth for "what should be visible at the current level."

```ts
const { level, setLevel, filter } = useLevel()
const visibleSlides = filter(allSlidesForChapter)
```

## Dependency budget

Keep the dependency footprint tight. Justified additions:
- `react`, `react-dom`
- `framer-motion`
- `vite`, `typescript`, `@vitejs/plugin-react`

Anything else needs justification. No utility library kitchen sinks. No icon font (use inline SVG icons).

## File structure (proposed)

```
src/
  main.tsx
  App.tsx
  tokens/
    tokens.css
    type.css
  components/
    Layout.tsx
    TopBar.tsx
    ChapterRail.tsx
    LevelToggle.tsx
    Slide.tsx
    SlideStream.tsx
    Diagram.tsx
    diagram/
      elements.ts        // element registry
      DiagramElement.tsx // single element renderer
      panZoom.ts         // viewBox manipulation
  content/
    chapter-01-request-response.ts
    ...
    glossary.ts
    smell-tests.ts
    types.ts
  hooks/
    useLevel.ts
    useSlidePosition.ts
    useUrlState.ts
  motion/
    variants.ts
public/
  fonts/  (Fraunces, Inter — self-hosted)
```

## Why not other stacks

- **Next.js** — overkill for a static, single-page learning experience. No need for SSR or routing beyond hash state.
- **Reveal.js / Slidev** — slide frameworks fight the persistent-evolving-diagram pattern.
- **Vanilla HTML** — viable but the diagram + level + slide state coupling is real. React's component model earns its complexity here.
- **Svelte / Solid** — fine choices, but React's familiarity and Framer Motion ecosystem win.
