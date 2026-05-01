# Layout & navigation

## The pinned-left layout

Three columns at desktop. The diagram is **pinned on the left**, sticky and vertically centered in its column. Content scrolls slide-by-slide on the right with hard snap. A slim chapter rail sits on the far left for navigation.

```
┌───────────────────────────────────────────────────────────────┐
│  ◐ logo · Ch 6 / 3 of 7 · [breadcrumb]      [101 | 201 | 301] │  56px top bar
├──────────┬────────────────────────────┬───────────────────────┤
│ Chapter  │                            │  Slide content        │
│ rail     │   Diagram pane             │  (scrolls vertically  │
│          │   (pinned, sticky,         │   with hard snap)     │
│ always   │    vertically centered)    │                       │
│ expanded │                            │                       │
│ for      │                            │                       │
│ current  │                            │                       │
│ chapter  │                            │                       │
└──────────┴────────────────────────────┴───────────────────────┘
   220px            flex (40%)                  flex (60%)
                    max 600px wide              max 720px content
                    max 480px tall
```

### Why pinned-left, not top

Wide screens want horizontal real estate used horizontally. Diagram-on-top crammed reading into a narrow vertical column; pinned-left lets the diagram be a constant companion without being the page's center of gravity.

### Column rules

- **Left rail:** 220px fixed. Always-expanded for the *current* chapter (slide list visible). Other chapters show title only. Collapses to 56px icon strip below 1200px viewport.
- **Diagram pane:** flex ~40% of remaining width. Diagram capped at **600px wide × 480px tall**. Vertically centered in the pane. Sticky so it stays visible as the right side scrolls.
- **Content pane:** flex ~60% of remaining width. Prose capped at **640px** for readability, centered in the pane.

### Critical content rule

**Each slide MUST fit the content pane without internal scrolling.** This is the single firmest layout constraint. The slide is the unit; if a slide's content overflows, split it across two snap points (e.g. 3a / 3b), don't add a scrollbar within the slide. Authoring discipline trumps overflow handling.

### Responsive

| Viewport | Behavior |
|---|---|
| ≥ 1200px | Three columns, full layout |
| 1024–1199px | Rail collapses to 56px icon strip; diagram and content split 45/55 |
| 900–1023px | Rail hides behind a hamburger; diagram + content split 50/50 |
| < 900px | Out of scope for v1. Will likely stack vertically with diagram becoming a tap-to-expand thumbnail. |

## Navigation — three modes that coexist

### Primary — scroll

Right pane uses `scroll-snap-type: y mandatory`. Each slide is `scroll-snap-align: start` at full pane height. As scroll position changes, the diagram morphs (highlights, zooms, level overlays fade in).

### Precision — keyboard

| Key | Action |
|---|---|
| `←` | Previous slide (within current chapter) |
| `→` | Next slide (within current chapter) |
| `↑` | Previous chapter (jumps to slide 1) |
| `↓` | Next chapter (jumps to slide 1) |
| `1` – `9` | Jump to chapter N |
| `L` | Cycle level (101 → 201 → 301 → 101) |
| `Z` | Zoom diagram into current focus |
| `Esc` | Close any modal / zoom |
| `/` or `Cmd+K` | Open command palette (chapter & slide search) |

### Direct — click

- Click any slide title in the rail → jump to it
- Click chapter title → navigate to its first slide
- Bottom-right floating prev/next buttons for non-keyboard users

## Chapter transitions

**Explicit, never scroll-implicit.** End of a chapter's right pane shows a "Next: Chapter 7 — Code Lifecycle →" card filling the slide. Scroll alone does not advance to the next chapter. `→` keypress or click on the card advances.

This rule kills accidental over-scroll chapter jumps, which would be disorienting given the diagram changes meaningfully across chapter boundaries.

## URL state

- `#ch6/3` for slide deep-links. Click any rail item updates the hash; reload restores position.
- `?level=201` persisted in query string. Toggle updates query; reload restores level.
- Combined: `#ch6/3?level=301` for shareable "this exact view" links.

## Diagram interactions (in the diagram pane)

Three modes coexist:

1. **Auto-react on scroll** — as right-pane scroll passes slide anchors, the diagram morphs.
2. **Manual pan & zoom** — the user can drag the diagram in any direction; mouse wheel inside the diagram pane zooms (clamped 0.5× to 4×). Page scroll is unaffected when the pointer is over the diagram. Touch: pinch-zoom and two-finger pan.
3. **Programmatic zoom** — clicking a major element (e.g. API Gateway) animates viewBox to focus on that region and reveals an exploded view with internal stages.

### Manual ↔ auto handoff

Once the user manually pans or zooms, a small "Reset to slide" button appears (replaces the fit button). Crossing another scroll anchor also auto-resets to the slide-driven view. This gives the user freedom to explore without losing the guided experience.

## Progress affordances

- Top bar always shows `Chapter 6 · 3 of 7`
- Rail highlights current chapter (vermillion left edge marker) and current slide (filled dot)
- Subtle vertical scroll-progress bar pinned to the right edge of the content pane

## Implementation note

The layout grid is the most stable thing in the system — it should be a `Layout` component used by every page state. Components plug into named slots:

```
<Layout
  rail={<ChapterRail />}
  diagram={<Diagram chapter={ch} level={lv} />}
  content={<SlideStream chapter={ch} level={lv} />}
  topBar={<TopBar />}
/>
```

The `Layout` component owns scroll snap, sticky positioning, responsive breakpoints, and column widths. No other component touches those rules.
