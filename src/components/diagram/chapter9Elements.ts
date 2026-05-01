/**
 * Chapter 9 (Deployment & Operations) — element registry.
 *
 * Coordinate system: 600 wide × 720 tall, matching the architecture and Ch 8 diagrams.
 *
 * Visibility is per-slide. The Ch 9 diagram tells a left-to-right pipeline story —
 * `main` (CI green from Ch 8) → container registry → deploy controller → environments.
 * Slide 5 (observability) swaps to the runtime architecture diagram via the
 * Slide.diagramKind override; no Ch 9 elements light up there.
 *
 *   s0 — From repo to running (overview, full pipeline visible)
 *   s1 — Containers: the artifact (container chip tinted accent in the registry)
 *   s2 — Three places the code lives (focus shifts to environments column)
 *   s3 — Updating without going down (cohort split appears inside production)
 *   s4 — How you find out it broke  (observability lane appears below production)
 *   s5 — Recap (full diagram)
 */

export type Ch9ElementId =
  // Pipeline stages
  | 'ch9-stage-source'        // main · CI green (left edge — bridge from Ch 8)
  | 'ch9-stage-registry'      // container registry
  | 'ch9-stage-deploy'        // deploy controller
  // The artifact moving through (only thing in accent)
  | 'ch9-container-artifact'
  // Pipeline arrows (with verb labels above)
  | 'ch9-arrow-build'         // source → registry  ("build & push image")
  | 'ch9-arrow-pull'          // registry → deploy  ("pull image")
  // Environments — three deploy targets fanning off the deploy controller
  | 'ch9-target-dev'
  | 'ch9-target-staging'
  | 'ch9-target-production'
  | 'ch9-arrow-rollout-dev'
  | 'ch9-arrow-rollout-staging'
  | 'ch9-arrow-rollout-prod'
  // Production internals (appear for the deploy-strategies slide)
  | 'ch9-prod-cohort-current'
  | 'ch9-prod-cohort-next'
  | 'ch9-prod-traffic-split'
  // Observability lane (appears for the "how you find out it broke" slide)
  | 'ch9-obs-logs'
  | 'ch9-obs-metrics'
  | 'ch9-obs-errors'
  | 'ch9-obs-arrow'

export type Ch9Element = {
  id: Ch9ElementId
  fromSlide: number
  region?: 'pipeline' | 'registry' | 'deploy' | 'environments' | 'production' | 'observability'
}

export const ch9Elements: Record<Ch9ElementId, Ch9Element> = {
  // s0 — full pipeline appears at once. The chapter opens with the overview.
  'ch9-stage-source':       { id: 'ch9-stage-source',       fromSlide: 0, region: 'pipeline' },
  'ch9-stage-registry':     { id: 'ch9-stage-registry',     fromSlide: 0, region: 'pipeline' },
  'ch9-stage-deploy':       { id: 'ch9-stage-deploy',       fromSlide: 0, region: 'pipeline' },
  'ch9-arrow-build':        { id: 'ch9-arrow-build',        fromSlide: 0, region: 'pipeline' },
  'ch9-arrow-pull':         { id: 'ch9-arrow-pull',         fromSlide: 0, region: 'pipeline' },
  'ch9-target-dev':         { id: 'ch9-target-dev',         fromSlide: 0, region: 'environments' },
  'ch9-target-staging':     { id: 'ch9-target-staging',     fromSlide: 0, region: 'environments' },
  'ch9-target-production':  { id: 'ch9-target-production',  fromSlide: 0, region: 'environments' },
  'ch9-arrow-rollout-dev':     { id: 'ch9-arrow-rollout-dev',     fromSlide: 0, region: 'environments' },
  'ch9-arrow-rollout-staging': { id: 'ch9-arrow-rollout-staging', fromSlide: 0, region: 'environments' },
  'ch9-arrow-rollout-prod':    { id: 'ch9-arrow-rollout-prod',    fromSlide: 0, region: 'environments' },

  // s1 — container artifact tinted in accent inside the registry
  'ch9-container-artifact': { id: 'ch9-container-artifact', fromSlide: 1, region: 'registry' },

  // s3 — production cohorts (blue/green split) appear inside production target
  'ch9-prod-cohort-current': { id: 'ch9-prod-cohort-current', fromSlide: 3, region: 'production' },
  'ch9-prod-cohort-next':    { id: 'ch9-prod-cohort-next',    fromSlide: 3, region: 'production' },
  'ch9-prod-traffic-split':  { id: 'ch9-prod-traffic-split',  fromSlide: 3, region: 'production' },

  // s4 — observability lane (logs, metrics, errors) attached to production
  'ch9-obs-arrow':   { id: 'ch9-obs-arrow',   fromSlide: 4, region: 'observability' },
  'ch9-obs-logs':    { id: 'ch9-obs-logs',    fromSlide: 4, region: 'observability' },
  'ch9-obs-metrics': { id: 'ch9-obs-metrics', fromSlide: 4, region: 'observability' },
  'ch9-obs-errors':  { id: 'ch9-obs-errors',  fromSlide: 4, region: 'observability' },
}

export function visibleCh9Elements(slideIndex: number): Set<Ch9ElementId> {
  const out = new Set<Ch9ElementId>()
  for (const el of Object.values(ch9Elements)) {
    if (el.fromSlide <= slideIndex) out.add(el.id)
  }
  return out
}

export const CH9_FULL_VIEWBOX = { x: 0, y: 0, w: 600, h: 720 }

/** Per-region viewBoxes for slide-driven pan/zoom. */
export const CH9_REGION_VIEWBOX: Record<string, { x: number; y: number; w: number; h: number }> = {
  full:          CH9_FULL_VIEWBOX,
  pipeline:      { x: 0,   y: 80,  w: 600, h: 200 },
  registry:      { x: 160, y: 80,  w: 220, h: 200 },
  deploy:        { x: 320, y: 80,  w: 280, h: 380 },
  environments:  { x: 0,   y: 280, w: 600, h: 200 },
  production:    { x: 370, y: 280, w: 230, h: 200 },
  observability: { x: 340, y: 280, w: 260, h: 320 },
}
