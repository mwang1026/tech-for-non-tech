export type Level = 101 | 201 | 301

export type ChapterId =
  | 'ch1' | 'ch2' | 'ch3' | 'ch4' | 'ch5'
  | 'ch6' | 'ch7' | 'ch8' | 'ch9' | 'ch10' | 'chff'

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
  /** Diagram element IDs to highlight on this step (e.g. ['be-pool', 'cache']). Arrow ids (e.g. 'arrow:webhook-stripe-in') also accepted. */
  highlight?: string[]
  /** Tints the highlighted elements green / red / accent. Defaults to 'neutral'. */
  status?: StepStatus
  /** Optional viewBox region/element to pan to on this step. Overrides slide.diagramFocus. */
  focus?: string
  /** When set, any highlighted arrow pulses — once for a single ping, repeat for ongoing. */
  pulse?: 'once' | 'repeat'
}

/**
 * A list item is either flat inline content, or inline content with a nested
 * list under it (sub-bullets). Use the `li` helper for the nested form.
 */
export type ListItem =
  | Inline
  | { content: Inline; children: ListBlock }

export type ListBlock =
  | { kind: 'ul'; items: ListItem[] }
  | { kind: 'ol'; items: ListItem[] }

/** Top-level structural blocks within a slide body. Use sparingly — narrative voice prefers prose; structure when it genuinely aids scanning. */
export type Block =
  | { kind: 'p'; nodes: Inline }                   // paragraph
  | { kind: 'h'; text: string }                    // small subhead (sparingly)
  | ListBlock                                      // bullet / numbered list, with optional nested sub-lists
  | { kind: 'code'; text: string; lang?: string }  // monospace block for shell commands, folder trees, ASCII branch graphs
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
  /** Force-visible diagram element IDs for this slide only, regardless of chapter/level gating. Used when a slide needs a node that isn't part of the chapter's accretion arc (e.g. an external system shown for one slide). */
  extraVisible?: string[]
  /** Hide the architecture diagram for this slide — used when the slide is about a different layer (e.g. local-laptop mechanics). */
  hideDiagram?: boolean
  /**
   * Override which diagram this slide uses, regardless of chapter default. Currently used by
   * Ch 9's observability slide to swap back to the runtime architecture diagram from Ch 1–7.
   */
  diagramKind?: 'runtime' | 'chapter8' | 'chapter9' | 'console'
  /** Console mock used by Chapter 10. Rendered in place of the system diagram. */
  console?: ConsoleSpec
  kind?: SlideKind
}

/* ------------------------- Console mocks (Chapter 10) ------------------------- *
 * Per-slide terminal/chat mock that sits in the diagram column for Chapter 10.
 * The chapter teaches dialogue with an AI agent, not architecture, so a fake
 * Claude Code session is the right visual primitive.
 */

export type ConsoleBlock =
  /** Raw shell line, e.g. `blogcorp $ claude`. */
  | { kind: 'shell'; text: string }
  /** ASCII welcome banner — array of literal lines rendered inside a box. */
  | { kind: 'banner'; lines: string[] }
  /** Blank line — adds vertical breathing room between blocks. */
  | { kind: 'spacer' }
  /** A user message to the agent. Rendered with a `>` prefix. */
  | { kind: 'user'; text: string }
  /** An agent reply — multiline plain text. */
  | { kind: 'agent'; text: string }
  /** A sectioned agent reply — used by the feature-template slide. */
  | { kind: 'agent-sections'; intro?: string; sections: AgentSection[] }
  /** A red dotted-underline annotation attached to the block immediately above. */
  | { kind: 'flag'; note: string }
  /** Blinking cursor — used for the literal-first-run slide. */
  | { kind: 'cursor' }
  /** Animated next-token prediction — Slide A (LLM intro). */
  | { kind: 'tokenCascade'; prompt: string; steps: TokenCascadeStep[]; finalNote?: string }
  /** API-payload representation — Slide B (agent harness). */
  | { kind: 'payload'; title?: string; entries: PayloadEntry[] }

export type AgentSection = {
  label: string
  /** Optional chapter tag, e.g. 'Ch 4'. Rendered as a small accent pill. */
  chapter?: string
  text: string
}

export type TokenCascadeStep = {
  /** Top-N candidates for the next token, sorted desc by prob. */
  candidates: { token: string; prob: number }[]
  /** Index into candidates of the one that "wins" and gets appended. */
  pickedIndex: number
}

export type PayloadEntry =
  | { kind: 'systemPrompt'; text: string }
  | { kind: 'context'; label: string; detail?: string }
  | { kind: 'message'; role: 'user' | 'assistant'; text: string; latest?: boolean }
  | { kind: 'toolUse'; tool: string; args: string }
  | { kind: 'toolResult'; preview: string; sizeKB?: number }

export type ConsolePane = {
  /** Optional small label for the pane chrome, e.g. "Terminal A". */
  title?: string
  /** Branch label rendered in the pane chrome, e.g. "Branch: main". */
  branch?: string
  /** Working directory shown in the pane chrome, e.g. "blogcorp". */
  cwd?: string
  blocks: ConsoleBlock[]
}

export type ConsoleSpec = {
  /** Optional phase indicator, e.g. {n:3, total:5, label:'Run the feature template'}. */
  phase?: { n: number; total: number; label: string }
  /** 'single' (default), 'stacked' (slide 1), 'side' (slide 7 worktrees). */
  layout?: 'single' | 'stacked' | 'side'
  panes: ConsolePane[]
  /** Caption rendered below the console frame. */
  caption?: string
}

export type Chapter = {
  id: ChapterId
  number: number
  /** Optional display override for the chapter number (e.g. 'FF' for the 0xFF closer). Falls back to the padded numeric. */
  displayNumber?: string
  title: string
  subtitle?: string
  /** 'slides' (default) — chapter renders through the slide stream. 'page' — chapter is a custom standalone surface (e.g. the 0xFF closer); slides are ignored. */
  kind?: 'slides' | 'page'
  slides: Slide[]
}
