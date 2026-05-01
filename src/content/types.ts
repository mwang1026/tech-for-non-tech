export type Level = 101 | 201 | 301

export type ChapterId =
  | 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5'
  | 'ch6' | 'ch7' | 'ch8' | 'ch9' | 'ch10'

export type SlideKind = 'content' | 'recap' | 'transition'

/**
 * Bold concepts and named technologies render as glossary links.
 * Use BodyNode[] paragraphs to express which terms are bold.
 */
export type BodyNode =
  | { kind: 'text'; text: string }
  | { kind: 'term'; text: string; glossaryId: string }

/** A run of inline nodes — used for paragraphs, list items, and recap sub-pieces. */
export type Paragraph = BodyNode[]
export type Inline = BodyNode[]

/** Top-level structural blocks within a slide body. Use sparingly — narrative voice prefers prose; structure when it genuinely aids scanning. */
export type Block =
  | { kind: 'p'; nodes: Inline }                   // paragraph
  | { kind: 'h'; text: string }                    // small subhead (sparingly)
  | { kind: 'ul'; items: Inline[] }                // bullet list

export type SlideBody =
  | { kind: 'prose'; blocks: Block[] }
  | {
      kind: 'recap'
      learned: string[]
      whereInSystem: Paragraph
      bridge: Paragraph
      /** Two Claude-Code prompts to try in the user's own codebase. Always present at the recap of a chapter. */
      prompts?: string[]
    }
  | { kind: 'transition'; nextChapterId: ChapterId; nextChapterTitle: string }

export type Slide = {
  id: string
  level: Level
  replaces?: string
  headline: string
  body: SlideBody
  diagramFocus?: string
  kind?: SlideKind
}

export type Chapter = {
  id: ChapterId
  number: number
  title: string
  subtitle?: string
  slides: Slide[]
}
