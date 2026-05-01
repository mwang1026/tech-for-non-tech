# The architecture diagram

The visual spine of the primer. A single diagram that lives across the entire experience and **accretes** elements as the learner advances through chapters, and **densifies** with detail as they advance through levels.

This is the design choice that distinguishes this primer from existing curricula. Existing courses (Skiplevel, Reforge, etc.) are linear text/video with disconnected diagrams. None show the architecture *building up* as concepts are introduced.

## Design intent

- One spatial layout that the learner internalizes early and keeps using.
- Elements appear at consistent positions across chapters — when the load balancer is added in Ch 6, it appears in front of where the server has always been; the database doesn't move.
- Density is managed by **level** (101 / 201 / 301) and by **manual zoom**, not by re-laying-out the diagram.
- The diagram is **interactive**: pan, zoom, and click-to-explore. Programmatic zoom on slide change; manual exploration takes over when the user wants it.

## Per-chapter accretion

| Chapter | What's added to the diagram |
|---|---|
| 1 — Request-Response Cycle | Browser → Server → Database (the seed) |
| 2 — State | RAM badge on Server, Cache box, "durable" tag on DB |
| 3 — Identity | Token traveling on the request arrow, user_id extraction, highlighted user-slice of DB |
| 4 — Validation & Authorization | Three gates at server boundary (auth → authz → data validation), rejection arrows |
| 5 — Concurrency | Zoom into DB row: two concurrent request arrows, lock symbol, transaction outcome |
| 6 — Architecture & Communication | Server multiplies to N behind Load Balancer; LB morphs into API Gateway with auth/rate-limit/routing badges; CDN at edge; webhook arrow from external service |
| 7 — Code Lifecycle | Zoom out: branches converge through PRs into main; CI gates; merged main becomes input to deployment |
| 8 — Deployment & Operations | Servers wrapped in container boundaries; CI/CD pipeline above; blue/green pair; observability lane |
| 9 — Putting It Together | No new elements added — diagram is fully accreted. Becomes a **playground** for animated request scenarios (see below) |
| 10 — Working with Claude Code | Full picture; Claude Code shown as side participant pointing at parts of the diagram |

## Per-level density

Same layout at all three levels. Detail layers fade in/out per level.

| Element | 101 | 201 | 301 |
|---|---|---|---|
| Boxes (Browser/Server/DB/Cache/etc.) | Generic labels | Labeled with example tech (Postgres, Redis, Nginx) | Multiple instances shown (replicas, regions) |
| Identity layer | Token + user_id | Token type called out (JWT/session) | Token rotation, refresh, revocation arrows |
| Validation gates | Three gates, generic | Auth library named, scope/role checks visible | Rate limiter, WAF, CORS layer |
| Concurrency | Lock symbol | Optimistic vs. pessimistic shown | Isolation level named, distributed lock |
| Edge | "CDN" box | "Cloudflare / Fastly" labels | Worker / edge function shown |
| CI/CD overlay | Pipeline boxes | Named tools (GitHub Actions) | Multi-stage promotion, canary % |
| Observability | Not shown | Logs/metrics/traces overlay | Tracing spans across services |

## Density management — the hard problem

At Ch 8 + 301, the diagram has dozens of elements. It will not all fit at once in the diagram pane. Density is managed by:

1. **Level filtering** — 101 view shows ~10 boxes. 201 adds ~12 more (named tech, gateway sub-badges, queue, auth service). 301 adds ~10 more (replicas, observability lane, regions, secrets, flags, WAF).
2. **Manual zoom & pan** — the user can drag and wheel-zoom into any region for detail. Wheel inside the diagram pane is captured (does not scroll the page).
3. **Click-to-zoom-into-region (programmatic)** — clicking a major element (e.g. API Gateway) animates the viewBox to focus on that region and reveals an "exploded view" with internal stages. The Mock 1 gateway exploded view is the quality bar — three numbered stages, mock API code, a "what 301 adds" footer.
4. **Slide-driven auto-focus** — as the learner scrolls past a slide anchor about (e.g.) the API Gateway, the diagram auto-zooms to the gateway region. Manual interaction takes precedence until another anchor crosses.

If at 201 a planned element won't fit cleanly at the diagram's max dimensions (600×480 desktop), that is a signal to push the element to 301-only — not to enlarge the diagram.

## Chapter 9 — diagram-as-playground

In Ch 9 the diagram is not extended — it's exercised. Each Ch 9 slide is one request scenario animated through the fully-accreted diagram:

- Happy path: request lights up gates green, returns successfully
- Auth/authz failures: request highlighted up to the rejecting gate, then a rejection arrow back
- Cache hit / miss: shows path through cache vs. fall-through to DB
- Race-condition averted: two concurrent paths converge on a row, lock visualizes serialization
- Webhook in / WebSocket push: external arrows into and out of the system
- Cascading failure: retry/backoff/circuit-breaker behavior visualized

Each scenario has a "Play" control. Rejected scenarios use the vermillion accent on the rejection arrow. Successful scenarios annotate timings ("12ms cache" vs. "180ms DB") on the path.

This is where the persistent-diagram design choice pays off most clearly: eight chapters of accretion become the substrate for end-to-end synthesis. See `02-curriculum.md` Chapter 9 for the full scenario list.

## Per-chapter recap callouts

Every chapter ends with a recap slide that lights up its concept's region on the persistent diagram. By Ch 8 the recap shows eight lit regions on one diagram — the system as the learner has built it in their head. Ch 9 then animates request paths through those same regions.

## Orientation — top-to-bottom

The diagram flows **top-to-bottom**, not left-to-right. Decision rationale:

- The diagram pane is portrait-shaped (~488×580 desktop, more so on tablet). Vertical flow uses available space naturally.
- Each chapter's accretion adds a *layer* (gateway, LB, app tier, data tier). Layers stack vertically more gracefully than they extend horizontally.
- Sequence diagrams (the inline supplemental kind that agents output) are top-to-bottom; the persistent diagram matching that convention reduces cognitive switching.
- At Ch 8 + 301, the observability lane sits alongside as a side rail rather than stealing horizontal real estate from the request path.

Standard top-to-bottom layout (request flow):
```
   Browser / Mobile
        ↓
   CDN (edge)
        ↓
   API Gateway / Load Balancer
        ↓
   Front-end Pool
        ↓
   Back-end Services
        ↓
   Cache · Queue · Data Stores
```

Cost we accept: most architecture diagrams in real codebases (and on engineer whiteboards) flow left-to-right. The learner will see L-to-R elsewhere. We accept that — our diagram serves its specific layout, and the convention isn't universal anyway.

## Visual style

Hand-authored editorial SVG (not Mermaid). The Mock 1 reference (`mocks/mock1-editorial.html`) is the visual quality bar.

- Boxes: paper fill (`#FAF7F2`), 1px hairline ink border (`#1A1815`)
- Group / container boundaries: dashed 1px hairline at 60% opacity
- Connectors: 1px hairline ink, with arrowheads
- Single highlight per view: vermillion 1.5px ring (no fill change)
- Primary labels: 11px Inter weight 600
- Tech-tag sub-labels: 10px Inter, uppercase, muted ink
- 301 overlays: dashed connectors, lower opacity, sit alongside base elements (never crammed inside)

## Implementation note

In the React build, the diagram is **one component** reading from data:

```
<Diagram chapter={6} level={201} highlight="gateway" />
```

Element visibility is data-driven. The diagram component does not have nine versions; it has one component reading state. Each diagram element knows which chapter it appears in and which level. Same source of truth feeds the auto-react on scroll, the level filter, and the highlight prop.

## Supplemental diagrams

The persistent architecture diagram is not the only diagram in the primer. Slides also contain inline supplemental diagrams — sequence diagrams (vertical lifelines + arrows), state machines, polling-vs-webhook comparisons. These are typical of agent output and the learner needs to recognize them.

Supplemental diagrams live in the slide content area, not the diagram pane. They use the same visual style (hairline ink on paper) so they feel of-a-piece with the spine.
