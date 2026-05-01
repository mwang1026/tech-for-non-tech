import type { Level } from '../../content/types'

/* ---------- Element type definitions ---------- */

export type ElementId =
  | 'browser' | 'mobile'
  | 'cdn'
  | 'waf'
  | 'gateway' | 'gateway-auth' | 'gateway-rate' | 'gateway-route'
  | 'lb'
  | 'be-pool' | 'be-1' | 'be-2' | 'be-3'
  | 'auth-svc' | 'cache' | 'queue'
  | 'db-primary' | 'db-replica-1' | 'db-replica-2' | 'object-store'
  | 'webhook-stripe'
  | 'obs-lane' | 'obs-logs' | 'obs-metrics' | 'obs-traces'
  | 'vault' | 'flags'
  | 'region-band'

export type DiagramElement = {
  id: ElementId
  /** Lowest chapter at which this element appears. */
  fromChapter: number
  /** Lowest level at which this element appears. */
  fromLevel: Level
  /** Optional grouping for region focus. */
  region?: 'edge' | 'gateway' | 'lb' | 'app' | 'data' | 'obs'
}

/** Registry — single source of truth for what's on the diagram.
 *
 * `fromChapter` values reflect the post-reorder display order (Identity = 2,
 * Validation/Auth = 3, State = 4, Architecture = 5, Concurrency = 6,
 * Putting It Together = 7, Code Lifecycle = 8, Deployment = 9). */
export const elements: Record<ElementId, DiagramElement> = {
  browser:        { id: 'browser', fromChapter: 1, fromLevel: 101 },
  mobile:         { id: 'mobile',  fromChapter: 1, fromLevel: 201 },

  cdn:            { id: 'cdn',     fromChapter: 5, fromLevel: 101, region: 'edge' },
  waf:            { id: 'waf',     fromChapter: 5, fromLevel: 301, region: 'edge' },

  gateway:        { id: 'gateway',       fromChapter: 5, fromLevel: 201, region: 'gateway' },
  'gateway-auth': { id: 'gateway-auth',  fromChapter: 5, fromLevel: 201, region: 'gateway' },
  'gateway-rate': { id: 'gateway-rate',  fromChapter: 5, fromLevel: 201, region: 'gateway' },
  'gateway-route':{ id: 'gateway-route', fromChapter: 5, fromLevel: 201, region: 'gateway' },

  lb:             { id: 'lb',      fromChapter: 5, fromLevel: 101, region: 'lb' },

  'be-pool':      { id: 'be-pool', fromChapter: 1, fromLevel: 101, region: 'app' },
  'be-1':         { id: 'be-1',    fromChapter: 5, fromLevel: 101, region: 'app' },
  'be-2':         { id: 'be-2',    fromChapter: 5, fromLevel: 101, region: 'app' },
  'be-3':         { id: 'be-3',    fromChapter: 5, fromLevel: 101, region: 'app' },

  'auth-svc':     { id: 'auth-svc', fromChapter: 2, fromLevel: 201 },
  cache:          { id: 'cache',   fromChapter: 4, fromLevel: 101 },
  queue:          { id: 'queue',   fromChapter: 6, fromLevel: 201 },

  'db-primary':   { id: 'db-primary',   fromChapter: 1, fromLevel: 101, region: 'data' },
  'db-replica-1': { id: 'db-replica-1', fromChapter: 9, fromLevel: 301, region: 'data' },
  'db-replica-2': { id: 'db-replica-2', fromChapter: 9, fromLevel: 301, region: 'data' },
  'object-store': { id: 'object-store', fromChapter: 5, fromLevel: 201, region: 'data' },

  'webhook-stripe':{ id: 'webhook-stripe', fromChapter: 5, fromLevel: 201 },

  'obs-lane':     { id: 'obs-lane',    fromChapter: 9, fromLevel: 301, region: 'obs' },
  'obs-logs':     { id: 'obs-logs',    fromChapter: 9, fromLevel: 301, region: 'obs' },
  'obs-metrics':  { id: 'obs-metrics', fromChapter: 9, fromLevel: 301, region: 'obs' },
  'obs-traces':   { id: 'obs-traces',  fromChapter: 9, fromLevel: 301, region: 'obs' },

  vault:          { id: 'vault', fromChapter: 9, fromLevel: 301 },
  flags:          { id: 'flags', fromChapter: 9, fromLevel: 301 },

  'region-band':  { id: 'region-band', fromChapter: 9, fromLevel: 301 },
}

/** What's visible at this chapter+level? */
export function visibleElements(chapter: number, level: Level): Set<ElementId> {
  const out = new Set<ElementId>()
  for (const el of Object.values(elements)) {
    if (el.fromChapter <= chapter && el.fromLevel <= level) out.add(el.id)
  }
  return out
}

/** ViewBox per region for programmatic zoom. Coordinates match the SVG layout in DiagramSvg.tsx. */
export const FULL_VIEWBOX = { x: 0, y: 0, w: 600, h: 720 }
export const REGION_VIEWBOX: Record<string, { x: number; y: number; w: number; h: number }> = {
  full:    FULL_VIEWBOX,
  edge:    { x: 80,  y: 80,  w: 440, h: 120 },
  gateway: { x: 60,  y: 180, w: 480, h: 160 },
  lb:      { x: 100, y: 290, w: 400, h: 110 },
  app:     { x: 30,  y: 380, w: 540, h: 110 },
  data:    { x: 30,  y: 480, w: 540, h: 180 },
  obs:     { x: 460, y: 160, w: 140, h: 480 },
}
