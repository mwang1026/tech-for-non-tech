import { marked } from 'marked'
import type { Inline } from '../content/types'

/**
 * Inline markdown rendering.
 *
 * Authored content uses standard markdown inline syntax (`**bold**`, `` `code` ``,
 * `*italic*`, `_em_`, etc.). Block structure is handled upstream by the
 * Block discriminated union in content/types.ts (paragraphs, lists, headings).
 *
 * For mixed inline runs (text + glossary terms), use `renderInlineRunToHtml` —
 * it assembles the whole run as one markdown string before parsing, so
 * formatting that spans term boundaries (e.g. `*foo TERM bar*`) renders
 * correctly. Per-node parsing breaks for cross-boundary syntax because the
 * opener and closer never see each other.
 *
 * Content is hand-authored, never user-supplied — sanitization is therefore
 * not required.
 */

marked.setOptions({ async: false })

export function inlineMdToHtml(input: string): string {
  return marked.parseInline(input) as string
}

/**
 * Render a mixed text/term inline run as HTML. Terms are encoded as markdown
 * links `[text](#glossary/id)` and parse back to <a href="#glossary/...">.
 * The Slide renderer uses event delegation to turn those anchors into
 * glossary-panel triggers.
 */
export function renderInlineRunToHtml(nodes: Inline): string {
  const md = nodes.map(n =>
    n.kind === 'text' ? n.text : `[${n.text}](#glossary/${n.glossaryId})`
  ).join('')
  return marked.parseInline(md) as string
}

/** Convenience component — renders inline markdown into a span. */
export function InlineMd({ children }: { children: string }) {
  return <span dangerouslySetInnerHTML={{ __html: inlineMdToHtml(children) }} />
}
