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

/** Status for a step in an interactive walkthrough — controls diagram tinting. */
export type StepStatus = 'pass' | 'reject' | 'neutral'

/** One step in a `steps` block. Carries its prose plus optional diagram coordination. */
export type StepItem = {
  content: Inline
  /** Diagram element IDs to highlight on this step (e.g. ['be-pool', 'cache']). */
  highlight?: string[]
  /** Tints the highlighted elements green / red / accent. Defaults to 'neutral'. */
  status?: StepStatus
  /** Optional viewBox region/element to pan to on this step. Overrides slide.diagramFocus. */
  focus?: string
}

/** Top-level structural blocks within a slide body. Use sparingly — narrative voice prefers prose; structure when it genuinely aids scanning. */
export type Block =
  | { kind: 'p'; nodes: Inline }                   // paragraph
  | { kind: 'h'; text: string }                    // small subhead (sparingly)
  | { kind: 'ul'; items: Inline[] }                // bullet list
  | { kind: 'ol'; items: Inline[] }                // numbered list (use when sequence matters)
  | { kind: 'steps'; items: StepItem[] }           // interactive step-through with diagram coordination

export type SlideBody =
  | { kind: 'prose'; blocks: Block[] }
  | {
      kind: 'recap'
      learned: string[]
      whereInSystem: Paragraph
      bridge: Paragraph
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
