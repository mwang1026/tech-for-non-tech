import type { Chapter } from './types'

/* ============================================================================
 * Chapter 0xFF — What's next
 *
 * The closer. Rendered as a standalone page (kind: 'page'), not through the
 * slide stream — see components/WhatsNextPage.tsx. Prose lives here so the
 * /content directory remains the single home for all reader-facing copy.
 *
 * Numbered 0xFF (255) so the page after Ch 10 reads as an end marker, with
 * room (11–254) for chapters to be inserted later between Ch 10 and the
 * closer without renumbering this one.
 * ============================================================================ */

export const chapterFFContent = {
  eyebrow: 'After the primer',
  mark: 'FF',
  title: "What's next",
  paragraphs: [
    "This is the last chapter. The primer doesn't make you fluent — fluency comes from sessions in real code, not from reading. What it gives you is the vocabulary, the map, and the five-phase workflow you'll come back to.",
    "In your first week, open your team's codebase in Claude Code and ask the agent to walk you through what the project does and where each kind of work lives. When it uses a term you don't recognize, ask what the term means here, in this file. Then poke around: why is this folder named the way it is, what would break if you deleted some file, why did the team pick Postgres over an alternative. The orient-and-learn cycle is the first week. Feature work comes later.",
    "When something from earlier fades — what idempotent meant, why caches go stale, where the line between authentication and authorization sits — come back to the chapter that introduced it, or ask an LLM to explain it. The primer is reference, not a one-time read.",
    "The first feature you direct end-to-end is slow. You listen to the agent describe what it changed, work out which questions are worth asking, and ask them. The fifth time, the obvious questions come faster, and pressing on the parts of the plan that don't fit starts feeling like the work itself — not preparation for it.",
  ],
  closing: "The skill being asked of you isn't writing code. It's reading a plan in plain English, finding where it doesn't add up, asking the questions that close the gap, and directing the agent through iterations — the same instinct you already use on briefs, contracts, and proposals. The vocabulary in this primer is what lets you apply that instinct to software.",
  promptSnippet: {
    cwd: 'your-repo',
    shell: 'your-repo $ claude',
    user: "Explain this codebase to me like I've never seen it. What does it do, and what are the main pieces?",
    caption: 'The first session in your own codebase. Start with Phase 1.',
  },
}

export const chapterFF: Chapter = {
  id: 'chff',
  number: 0xff,
  displayNumber: 'FF',
  title: chapterFFContent.title,
  subtitle: 'What to do with this past the last chapter',
  kind: 'page',
  slides: [],
}
