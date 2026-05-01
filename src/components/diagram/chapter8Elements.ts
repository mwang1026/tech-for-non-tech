/**
 * Chapter 8 (Code Lifecycle) — element registry.
 *
 * Coordinate system: 600 wide × 720 tall, matching the architecture diagram's canvas.
 *
 * Visibility is per-slide (not per-chapter+level like the architecture diagram), because
 * Ch 8's diagram accretes through the chapter's six slides:
 *   s0: a folder of files on a laptop (the chapter's starting state — no git yet)
 *   s1: + .git folder, + GitHub remote, + clone/push/pull arrows
 *   s2: + branch graph
 *   s3: + open-PR badge on the remote
 *   s4: + CI ✓ badge on the remote
 *   s5: full diagram (recap), + worktree pair
 */

export type Ch8ElementId =
  // Laptop / local
  | 'ch8-laptop'
  | 'ch8-folder-name'
  | 'ch8-git-folder'
  | 'ch8-src-folder'
  | 'ch8-package-json'
  | 'ch8-readme'
  | 'ch8-claude-badge'
  // GitHub / remote
  | 'ch8-github'
  | 'ch8-pr-badge'
  | 'ch8-ci-badge'
  // Sync arrows
  | 'ch8-arrow-clone'
  | 'ch8-arrow-push'
  | 'ch8-arrow-pull'
  // Branches
  | 'ch8-branches-frame'
  | 'ch8-branch-main'
  | 'ch8-branch-feature'
  | 'ch8-merge-commit'
  // Worktree
  | 'ch8-worktree-frame'
  | 'ch8-worktree-a'
  | 'ch8-worktree-b'
  | 'ch8-worktree-shared-git'

export type Ch8Element = {
  id: Ch8ElementId
  /** Slide index (0-based) at which this element first appears. */
  fromSlide: number
  /** Optional region used to drive viewBox focus when a slide names this region. */
  region?: 'local' | 'local-remote' | 'branches' | 'pr' | 'ci' | 'worktree'
}

export const ch8Elements: Record<Ch8ElementId, Ch8Element> = {
  // s0 — just the laptop with a folder of files
  'ch8-laptop':         { id: 'ch8-laptop',        fromSlide: 0, region: 'local' },
  'ch8-folder-name':    { id: 'ch8-folder-name',   fromSlide: 0, region: 'local' },
  'ch8-src-folder':     { id: 'ch8-src-folder',    fromSlide: 0, region: 'local' },
  'ch8-package-json':   { id: 'ch8-package-json',  fromSlide: 0, region: 'local' },
  'ch8-readme':         { id: 'ch8-readme',        fromSlide: 0, region: 'local' },

  // s1 — git appears, github appears, sync arrows appear
  'ch8-git-folder':     { id: 'ch8-git-folder',    fromSlide: 1, region: 'local' },
  'ch8-claude-badge':   { id: 'ch8-claude-badge',  fromSlide: 1, region: 'local' },
  'ch8-github':         { id: 'ch8-github',        fromSlide: 1, region: 'local-remote' },
  'ch8-arrow-clone':    { id: 'ch8-arrow-clone',   fromSlide: 1, region: 'local-remote' },
  'ch8-arrow-push':     { id: 'ch8-arrow-push',    fromSlide: 1, region: 'local-remote' },
  'ch8-arrow-pull':     { id: 'ch8-arrow-pull',    fromSlide: 1, region: 'local-remote' },

  // s2 — branch graph appears
  'ch8-branches-frame': { id: 'ch8-branches-frame', fromSlide: 2, region: 'branches' },
  'ch8-branch-main':    { id: 'ch8-branch-main',    fromSlide: 2, region: 'branches' },
  'ch8-branch-feature': { id: 'ch8-branch-feature', fromSlide: 2, region: 'branches' },
  'ch8-merge-commit':   { id: 'ch8-merge-commit',   fromSlide: 2, region: 'branches' },

  // s3 — PR badge on the remote
  'ch8-pr-badge':       { id: 'ch8-pr-badge',      fromSlide: 3, region: 'pr' },

  // s4 — CI badge on the remote
  'ch8-ci-badge':       { id: 'ch8-ci-badge',      fromSlide: 4, region: 'ci' },

  // s5 — recap; worktree visualization appears
  'ch8-worktree-frame':      { id: 'ch8-worktree-frame',      fromSlide: 5, region: 'worktree' },
  'ch8-worktree-a':          { id: 'ch8-worktree-a',          fromSlide: 5, region: 'worktree' },
  'ch8-worktree-b':          { id: 'ch8-worktree-b',          fromSlide: 5, region: 'worktree' },
  'ch8-worktree-shared-git': { id: 'ch8-worktree-shared-git', fromSlide: 5, region: 'worktree' },
}

/** Which element IDs are visible at this slide index? */
export function visibleCh8Elements(slideIndex: number): Set<Ch8ElementId> {
  const out = new Set<Ch8ElementId>()
  for (const el of Object.values(ch8Elements)) {
    if (el.fromSlide <= slideIndex) out.add(el.id)
  }
  return out
}

export const CH8_FULL_VIEWBOX = { x: 0, y: 0, w: 600, h: 720 }

/** Per-region viewBoxes that slides reference via `diagramFocus`. */
export const CH8_REGION_VIEWBOX: Record<string, { x: number; y: number; w: number; h: number }> = {
  full:           CH8_FULL_VIEWBOX,
  'local-only':   { x: 0,   y: 30,  w: 320, h: 330 },
  'local-remote': { x: 0,   y: 30,  w: 600, h: 330 },
  branches:       { x: 0,   y: 360, w: 600, h: 180 },
  pr:             { x: 300, y: 30,  w: 300, h: 330 },
  ci:             { x: 300, y: 30,  w: 300, h: 330 },
  worktree:       { x: 0,   y: 540, w: 600, h: 180 },
}
