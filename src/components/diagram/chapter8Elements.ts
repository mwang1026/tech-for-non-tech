/**
 * Chapter 8 (Code Lifecycle) — element registry.
 *
 * Coordinate system: 600 wide × 720 tall, matching the architecture diagram's canvas.
 *
 * The chapter walks one concrete change (`sunColor = "yellow"` → `"orange"` in
 * `src/components/Hero.tsx`) through 13 slides. The diagram switches between
 * five scenes driven by `ch8Scene(slideIndex)`:
 *
 *   slide 0  — scene 'change'         the literal yellow→orange diff, big inset
 *   slide 1  — scene 'text-runtime'   text file → compiler / runtime → running program
 *   slide 2  — scene 'organization'   file tree + zoomed-in file (function, class, module, package)
 *   slides 3–7, 9–12 — scene 'spine'  accreting laptop / GitHub / branches / PR / CI
 *   slide 8  — scene 'merge-conflict' two branches, competing edits to the same line
 *
 * Inside the 'spine' scene, individual elements appear at fixed slide indices:
 *
 *   slide 3  laptop + GitHub + clone arrow         (git, GitHub, clone)
 *   slide 4  branch graph                          (a branch peels off main)
 *   slide 5  commit metadata callout               (one commit zoomed in)
 *   slide 6  push arrow + branch on remote         (push)
 *   slide 7  PR card with diff + checks panel      (pull request)
 *   slide 9  CI machine attached to PR             (CI)
 *   slide 10 four lanes: build / lint / types / tests
 *   slide 11 green status + merge commit on main   (the merge happens)
 *   slide 12 recap (everything visible)
 */

export type Ch8Scene = 'change' | 'text-runtime' | 'organization' | 'spine' | 'merge-conflict'

export type Ch8ElementId =
  // Spine — laptop side
  | 'ch8-laptop'
  | 'ch8-laptop-files'
  | 'ch8-laptop-git-folder'
  // Spine — remote side
  | 'ch8-github'
  | 'ch8-github-files'
  // Spine — sync arrow
  | 'ch8-arrow-clone'
  | 'ch8-arrow-push'
  // Spine — branch graph
  | 'ch8-branch-graph'
  | 'ch8-branch-main'
  | 'ch8-branch-feature'
  | 'ch8-commit-orange'
  | 'ch8-commit-merge'
  // Spine — commit metadata callout (slide 6)
  | 'ch8-commit-callout'
  // Spine — pull request card (slide 8)
  | 'ch8-pr-card'
  | 'ch8-pr-diff'
  | 'ch8-pr-checks-panel'
  // Spine — CI machine (slide 10)
  | 'ch8-ci-machine'
  | 'ch8-ci-lane-build'
  | 'ch8-ci-lane-lint'
  | 'ch8-ci-lane-types'
  | 'ch8-ci-lane-tests'
  | 'ch8-ci-status-green'

export type Ch8Element = {
  id: Ch8ElementId
  /** Slide index (0-based) at which this element first appears within the 'spine' scene. */
  fromSlide: number
}

export const ch8Elements: Record<Ch8ElementId, Ch8Element> = {
  // Slide 3 — laptop, GitHub, clone arrow appear together
  'ch8-laptop':         { id: 'ch8-laptop',         fromSlide: 3 },
  'ch8-laptop-files':   { id: 'ch8-laptop-files',   fromSlide: 3 },
  'ch8-laptop-git-folder': { id: 'ch8-laptop-git-folder', fromSlide: 3 },
  'ch8-github':         { id: 'ch8-github',         fromSlide: 3 },
  'ch8-github-files':   { id: 'ch8-github-files',   fromSlide: 3 },
  'ch8-arrow-clone':    { id: 'ch8-arrow-clone',    fromSlide: 3 },

  // Slide 4 — branch graph
  'ch8-branch-graph':   { id: 'ch8-branch-graph',   fromSlide: 4 },
  'ch8-branch-main':    { id: 'ch8-branch-main',    fromSlide: 4 },
  'ch8-branch-feature': { id: 'ch8-branch-feature', fromSlide: 4 },
  'ch8-commit-orange':  { id: 'ch8-commit-orange',  fromSlide: 4 },

  // Slide 5 — commit metadata callout
  'ch8-commit-callout': { id: 'ch8-commit-callout', fromSlide: 5 },

  // Slide 6 — push arrow
  'ch8-arrow-push':     { id: 'ch8-arrow-push',     fromSlide: 6 },

  // Slide 7 — PR card (diff + empty checks panel)
  'ch8-pr-card':        { id: 'ch8-pr-card',        fromSlide: 7 },
  'ch8-pr-diff':        { id: 'ch8-pr-diff',        fromSlide: 7 },
  'ch8-pr-checks-panel': { id: 'ch8-pr-checks-panel', fromSlide: 7 },

  // Slide 9 — CI machine appears (slide 8 is merge-conflict scene; CI shows up after)
  'ch8-ci-machine':     { id: 'ch8-ci-machine',     fromSlide: 9 },

  // Slide 10 — four lanes inside CI
  'ch8-ci-lane-build':  { id: 'ch8-ci-lane-build',  fromSlide: 10 },
  'ch8-ci-lane-lint':   { id: 'ch8-ci-lane-lint',   fromSlide: 10 },
  'ch8-ci-lane-types':  { id: 'ch8-ci-lane-types',  fromSlide: 10 },
  'ch8-ci-lane-tests':  { id: 'ch8-ci-lane-tests',  fromSlide: 10 },

  // Slide 11 — all green; merge lands
  'ch8-ci-status-green': { id: 'ch8-ci-status-green', fromSlide: 11 },
  'ch8-commit-merge':   { id: 'ch8-commit-merge',   fromSlide: 11 },
}

/** Which scene the diagram is in for a given slide index. */
export function ch8Scene(slideIndex: number): Ch8Scene {
  if (slideIndex === 0) return 'change'
  if (slideIndex === 1) return 'text-runtime'
  if (slideIndex === 2) return 'organization'
  if (slideIndex === 8) return 'merge-conflict'
  return 'spine'
}

/** Which spine elements are visible at this slide index. Only consulted when scene === 'spine'. */
export function visibleCh8Elements(slideIndex: number): Set<Ch8ElementId> {
  const out = new Set<Ch8ElementId>()
  for (const el of Object.values(ch8Elements)) {
    if (el.fromSlide <= slideIndex) out.add(el.id)
  }
  return out
}

export const CH8_FULL_VIEWBOX = { x: 0, y: 0, w: 600, h: 720 }

/**
 * Per-region viewBoxes the slides reference via `diagramFocus`. Each scene has
 * its own natural framing; the spine has region zooms for laptop, branches, PR, CI.
 */
export const CH8_REGION_VIEWBOX: Record<string, { x: number; y: number; w: number; h: number }> = {
  full:           CH8_FULL_VIEWBOX,
  // Whole-scene framings
  change:         { x: 0,   y: 0,   w: 600, h: 720 },
  'text-runtime': { x: 0,   y: 0,   w: 600, h: 720 },
  organization:   { x: 0,   y: 0,   w: 600, h: 720 },
  'merge-conflict': { x: 0, y: 0,   w: 600, h: 720 },
  // Spine subregions
  spine:          CH8_FULL_VIEWBOX,
  laptop:         { x: 0,   y: 40,  w: 320, h: 320 },
  remote:         { x: 280, y: 40,  w: 320, h: 320 },
  branches:       { x: 0,   y: 360, w: 600, h: 160 },
  'commit-detail': { x: 200, y: 360, w: 400, h: 200 },
  pr:             { x: 0,   y: 360, w: 600, h: 200 },
  ci:             { x: 0,   y: 540, w: 600, h: 180 },
}
