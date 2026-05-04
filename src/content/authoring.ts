import type { Block, BodyNode, Inline, StepItem, StepStatus } from './types'

/**
 * Shared authoring helpers for chapter content.
 * Inline markdown (`**bold**`, `*italic*`, `` `code` ``) inside text nodes is
 * rendered via marked at the renderer level — see components/inlineMd.tsx.
 *
 * --------------------------------------------------------------------------
 * VOICE RULES — read before writing or editing prose in this directory.
 * Full ruleset with worked before/after rewrites lives in /CLAUDE.md (Voice).
 *
 * Anti-patterns (cite by tag in review):
 *   PROFOUND-HIGH-SCHOOLER — "matters" / "load-bearing" / "different worlds"
 *     without naming the consequence. Be the consequence or cut the line.
 *   MARKETER PITH — slogans and catchphrases ("same boxes; smarter
 *     conversations"). If it could go on a t-shirt, cut it.
 *   MANUFACTURED SUSPENSE — "here's the trick", "the situation we've been
 *     ignoring". The reader trusts the order; just continue.
 *   STRAWMAN DEFINITION — "X isn't a vague cloud of…". Define directly.
 *   WRITERLY TIC — "in practice", "as it turns out", "interestingly".
 *     If the phrase carries no factual weight, cut it.
 *   CLOSING FLOURISH — poetic restatement after the substance landed.
 *   METAPHOR-FOR-ITS-OWN-SAKE — metaphor where the literal name works
 *     ("geography model", "the spine"). Use the literal name.
 *   UNSOURCED CONSENSUS — "most", "usually", "typically", "the default",
 *     "the most common" without a number, named product, or citation.
 *     Hard ban: cut the qualifier, describe the thing factually, or
 *     attach a source. Even verifiable-feeling claims need the source.
 *
 * Character is welcome from substance, not framing — dry observation,
 * weirdly specific specifics, brief context-admitting asides, crisp
 * causal punchlines, felt-experience phrasing, honest scope notes.
 * If it's doing work, keep it. If it's flourish on a sentence that
 * already landed, it's CLOSING FLOURISH or MARKETER PITH.
 *
 * Good patterns (protect and replicate):
 *   EARNED TERM — concrete scenario first, name the term after.
 *   CAUSAL BULLET — each bullet states what breaks, costs, or behaves.
 *   NAMED CONSEQUENCE — name what breaks, not "there's a tradeoff".
 *   RECALL-THEN-ADD — one sentence of recall, one of the new question.
 *   FELT BUG — anchor concepts to user-visible bugs the reader has lived.
 *   SPECIFIC KEYSTROKES — literal steps beat generic adjectives.
 *   DIRECT DEFINITION — what the thing is, then what it does.
 * --------------------------------------------------------------------------
 */

export const _ = (text: string): BodyNode => ({ kind: 'text', text })
export const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })

export const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
export const h = (text: string): Block => ({ kind: 'h', text })
export const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })
export const ol = (...items: Inline[]): Block => ({ kind: 'ol', items })
export const code = (text: string, lang?: string): Block => ({ kind: 'code', text, lang })

export const step = (
  content: Inline,
  opts: { highlight?: string[]; status?: StepStatus; focus?: string; pulse?: 'once' | 'repeat' } = {},
): StepItem => ({ content, ...opts })
export const steps = (...items: StepItem[]): Block => ({ kind: 'steps', items })
