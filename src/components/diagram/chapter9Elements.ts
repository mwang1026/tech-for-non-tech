/**
 * Chapter 9 (Deployment & Operations) — element registry.
 *
 * Coordinate system: 600 wide × 720 tall.
 *
 * The chapter picks up the orange-sun change at "merged into main, CI green"
 * and follows it through build, container packaging, environments, deploy
 * strategies, observability, and rollback.
 *
 * The diagram switches between two scenes via `ch9Scene(slideIndex)`:
 *
 *   slide 0  — scene 'gap'      the merged commit on the left, the running fleet
 *                               on the right, empty middle with a question mark
 *   slides 1–9 — scene 'pipeline'  the full pipeline accretes left-to-right and
 *                                  top-to-bottom (build → registry → environments
 *                                  → deploy strategies → observability)
 *
 * Inside the 'pipeline' scene, individual elements appear at fixed slide indices:
 *
 *   slide 1  source + build stage
 *   slide 2  container artifact + container internals callout
 *   slide 3  registry stage + publish/pull arrows
 *   slide 4  three environments + rollout arrows
 *   slide 5  production naive-deploy visualization (stopped servers, errors)
 *   slide 6  production cohort split (v1 95% / v2 5% canary, blue/green analogue)
 *   slide 7  observability lane (logs / metrics / errors flowing out)
 *   slide 8  rollback indicator (canary aborted, traffic returns to v1)
 */

export type Ch9Scene = 'gap' | 'pipeline'

export type Ch9ElementId =
  // Pipeline row
  | 'ch9-source-main'         // bridge from Ch 8: main with green CI badge
  | 'ch9-stage-build'
  | 'ch9-stage-registry'
  | 'ch9-arrow-build'         // source → build
  | 'ch9-arrow-publish'       // build → registry
  | 'ch9-arrow-pull'          // registry → environments
  // Container artifact
  | 'ch9-container-artifact'
  | 'ch9-container-callout'   // labeled layers: OS, runtime, libs, app
  // Environments
  | 'ch9-target-dev'
  | 'ch9-target-staging'
  | 'ch9-target-production'
  | 'ch9-arrow-rollout-dev'
  | 'ch9-arrow-rollout-staging'
  | 'ch9-arrow-rollout-prod'
  // Production internal states (mutually exclusive — only one renders per slide)
  | 'ch9-prod-naive'          // slide 5: stop/swap/restart with errors
  | 'ch9-prod-cohort'         // slide 6+: v1 / v2 split
  | 'ch9-prod-rollback'       // slide 8: rollback indicator overlay
  // Observability
  | 'ch9-obs-arrow'
  | 'ch9-obs-logs'
  | 'ch9-obs-metrics'
  | 'ch9-obs-errors'

export type Ch9Element = {
  id: Ch9ElementId
  fromSlide: number
}

export const ch9Elements: Record<Ch9ElementId, Ch9Element> = {
  // s1 — source + build appear
  'ch9-source-main':  { id: 'ch9-source-main',  fromSlide: 1 },
  'ch9-stage-build':  { id: 'ch9-stage-build',  fromSlide: 1 },
  'ch9-arrow-build':  { id: 'ch9-arrow-build',  fromSlide: 1 },

  // s2 — container artifact + callout
  'ch9-container-artifact': { id: 'ch9-container-artifact', fromSlide: 2 },
  'ch9-container-callout':  { id: 'ch9-container-callout',  fromSlide: 2 },

  // s3 — registry + publish/pull arrows
  'ch9-stage-registry':   { id: 'ch9-stage-registry',   fromSlide: 3 },
  'ch9-arrow-publish':    { id: 'ch9-arrow-publish',    fromSlide: 3 },
  'ch9-arrow-pull':       { id: 'ch9-arrow-pull',       fromSlide: 3 },

  // s4 — three environments + rollout arrows
  'ch9-target-dev':            { id: 'ch9-target-dev',            fromSlide: 4 },
  'ch9-target-staging':        { id: 'ch9-target-staging',        fromSlide: 4 },
  'ch9-target-production':     { id: 'ch9-target-production',     fromSlide: 4 },
  'ch9-arrow-rollout-dev':     { id: 'ch9-arrow-rollout-dev',     fromSlide: 4 },
  'ch9-arrow-rollout-staging': { id: 'ch9-arrow-rollout-staging', fromSlide: 4 },
  'ch9-arrow-rollout-prod':    { id: 'ch9-arrow-rollout-prod',    fromSlide: 4 },

  // Production internal states. Each fromSlide encodes "appears starting here";
  // the SVG additionally consults slideIndex to pick which one renders.
  'ch9-prod-naive':    { id: 'ch9-prod-naive',    fromSlide: 5 },
  'ch9-prod-cohort':   { id: 'ch9-prod-cohort',   fromSlide: 6 },
  'ch9-prod-rollback': { id: 'ch9-prod-rollback', fromSlide: 8 },

  // s7 — observability lane
  'ch9-obs-arrow':   { id: 'ch9-obs-arrow',   fromSlide: 7 },
  'ch9-obs-logs':    { id: 'ch9-obs-logs',    fromSlide: 7 },
  'ch9-obs-metrics': { id: 'ch9-obs-metrics', fromSlide: 7 },
  'ch9-obs-errors':  { id: 'ch9-obs-errors',  fromSlide: 7 },
}

/** Which scene the Ch 9 diagram is in for a given slide index. */
export function ch9Scene(slideIndex: number): Ch9Scene {
  if (slideIndex === 0) return 'gap'
  return 'pipeline'
}

export function visibleCh9Elements(slideIndex: number): Set<Ch9ElementId> {
  const out = new Set<Ch9ElementId>()
  for (const el of Object.values(ch9Elements)) {
    if (el.fromSlide <= slideIndex) out.add(el.id)
  }
  // Callout only relevant on slide 2 (container intro). Once the registry
  // and rollout bus appear on slide 3+, the callout would overlap them.
  if (slideIndex >= 3) out.delete('ch9-container-callout')
  return out
}

/**
 * Which production internal state to render for a given slide.
 *  - slide 5 (deploy naive)              → 'naive'
 *  - slide 6 (deploy strategies)         → 'cohort'
 *  - slide 7 (observability)             → 'cohort' (cohort persists; obs adds the arrows)
 *  - slide 8 (rollback)                  → 'rollback'
 *  - slide 9 (recap) and earlier         → 'cohort' once we're past slide 6, else 'fleet'
 */
export type ProdState = 'fleet' | 'naive' | 'cohort' | 'rollback'
export function ch9ProdState(slideIndex: number): ProdState {
  if (slideIndex === 5) return 'naive'
  if (slideIndex === 8) return 'rollback'
  if (slideIndex >= 6) return 'cohort'
  return 'fleet'
}

export const CH9_FULL_VIEWBOX = { x: 0, y: 0, w: 600, h: 720 }

export const CH9_REGION_VIEWBOX: Record<string, { x: number; y: number; w: number; h: number }> = {
  full:           CH9_FULL_VIEWBOX,
  gap:            CH9_FULL_VIEWBOX,
  pipeline:      { x: 0,   y: 60,  w: 600, h: 220 },
  registry:      { x: 200, y: 60,  w: 240, h: 220 },
  environments:  { x: 0,   y: 280, w: 600, h: 200 },
  production:    { x: 350, y: 280, w: 250, h: 220 },
  observability: { x: 350, y: 280, w: 250, h: 320 },
}
