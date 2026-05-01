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

/**
 * Display order. The number rendered to the reader comes from each chapter's
 * `number` field, NOT from this array index. URL hash IDs (`ch3` etc.) are
 * stable and decoupled from display order — old links keep working.
 *
 * Act I — Anatomy of a request:
 *   1. Request-Response (ch1)
 *   2. Identity (ch3)
 *   3. Validation & Authorization (ch4)
 *   4. State (ch2)
 *   5. Architecture (ch6)
 *   6. Concurrency (ch5)
 *   7. Putting It Together (ch9)
 *
 * Act II — How code becomes the running system:
 *   8. Code Lifecycle (ch7)
 *   9. Deployment & Operations (ch8)
 *
 * Act III — Working with the agent:
 *   10. Working with Claude Code (ch10)
 */
export const chapters: Chapter[] = [
  chapter01,
  chapter03,
  chapter04,
  chapter02,
  chapter06,
  chapter05,
  chapter09,
  chapter07,
  chapter08,
  chapter10,
]

export const chapterById = (id: string) =>
  chapters.find(c => c.id === id) ?? chapters[0]
