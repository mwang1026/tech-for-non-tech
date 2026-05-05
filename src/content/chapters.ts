import type { Chapter } from './types'
import { chapter01 } from './chapter-01'
import { chapter02 } from './chapter-02'
import { chapter03 } from './chapter-03'
import { chapter04 } from './chapter-04'
import { chapter05 } from './chapter-05'
import { chapter06 } from './chapter-06'
import { chapter07 } from './chapter-07'
import { chapter08 } from './chapter-08'
import { chapter09 } from './chapter-09'
import { chapter10 } from './chapter-10'
import { chapterFF } from './chapter-ff'

/**
 * Display order. Filename N == const chapterN == id `chN` == display number N.
 * Exception: the closing chapter is numbered 0xFF (filename `chapter-ff.ts`,
 * id `chff`) so 11–254 stay open for chapters inserted between Ch 10 and the
 * closer without renumbering this one.
 *
 * Act I — Anatomy of a request: 1–7
 *   1. Request-Response, 2. Identity, 3. Validation & Authorization,
 *   4. State, 5. Architecture, 6. Concurrency, 7. Putting It Together
 * Act II — How code becomes the running system: 8–9
 *   8. Code Lifecycle, 9. Deployment & Operations
 * Act III — Working with the agent: 10
 *   10. Working with Claude Code
 * Closer — past the primer: FF
 *   FF. What's next
 */
export const chapters: Chapter[] = [
  chapter01,
  chapter02,
  chapter03,
  chapter04,
  chapter05,
  chapter06,
  chapter07,
  chapter08,
  chapter09,
  chapter10,
  chapterFF,
]

export const chapterById = (id: string) =>
  chapters.find(c => c.id === id) ?? chapters[0]
