import { marked } from 'marked'

/**
 * Inline markdown rendering.
 *
 * Authored content uses standard markdown inline syntax (`**bold**`, `` `code` ``,
 * `*italic*`, `_em_`, etc.). Block structure is handled upstream by the
 * Block discriminated union in content/types.ts (paragraphs, lists, headings).
 *
 * We use `marked.parseInline` rather than rolling a parser, so the full
 * markdown spec works (escapes, nested emphasis, links, etc.) without us
 * having to maintain it. Content is hand-authored, never user-supplied —
 * sanitization is therefore not required.
 */

marked.setOptions({ async: false })

export function inlineMdToHtml(input: string): string {
  return marked.parseInline(input) as string
}

/** Convenience component — renders inline markdown into a span. */
export function InlineMd({ children }: { children: string }) {
  return <span dangerouslySetInnerHTML={{ __html: inlineMdToHtml(children) }} />
}
