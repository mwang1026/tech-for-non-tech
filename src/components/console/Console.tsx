import type { ConsoleSpec, ConsolePane, ConsoleBlock } from '../../content/types'
import styles from './Console.module.css'

type Props = { spec: ConsoleSpec }

export function Console({ spec }: Props) {
  const layout = spec.layout ?? 'single'
  return (
    <div className={styles.frame}>
      <div className={styles.phaseBar}>
        <span className={styles.label}>Claude Code · session</span>
        {spec.phase ? <PhasePill phase={spec.phase} /> : <span />}
      </div>
      <div className={`${styles.body} ${styles[layout]}`}>
        {spec.panes.map((pane, i) => <Pane key={i} pane={pane} />)}
      </div>
      {spec.caption && <div className={styles.caption}>{spec.caption}</div>}
    </div>
  )
}

function PhasePill({ phase }: { phase: NonNullable<ConsoleSpec['phase']> }) {
  const dots = Array.from({ length: phase.total }, (_, i) => i + 1)
  return (
    <span className={styles.phasePill}>
      Phase {phase.n} · {phase.label}
      <span className={styles.phaseDots}>
        {dots.map(i => (
          <span
            key={i}
            className={`${styles.phaseDot} ${i === phase.n ? styles.phaseDotActive : ''}`}
          />
        ))}
      </span>
    </span>
  )
}

function Pane({ pane }: { pane: ConsolePane }) {
  return (
    <div className={styles.pane}>
      {(pane.title || pane.cwd || pane.branch) && (
        <div className={styles.paneChrome}>
          <span className={styles.paneTitle}>{pane.title ?? pane.cwd ?? ''}</span>
          <span className={styles.paneMeta}>
            {pane.cwd && pane.title && <span>{pane.cwd}</span>}
            {pane.branch && <span>{pane.branch}</span>}
          </span>
        </div>
      )}
      <div className={styles.transcript}>
        {pane.blocks.map((b, i) => <Block key={i} block={b} />)}
      </div>
    </div>
  )
}

function Block({ block }: { block: ConsoleBlock }) {
  switch (block.kind) {
    case 'shell':
      return <div className={styles.shell}>{block.text}</div>
    case 'banner':
      return <div className={styles.banner}>{block.lines.join('\n')}</div>
    case 'spacer':
      return <div className={styles.spacer} />
    case 'user':
      return (
        <div className={styles.user}>
          <span className={styles.userPrefix}>&gt;</span>
          {block.text}
        </div>
      )
    case 'agent':
      return (
        <div className={styles.agent}>
          <span className={styles.agentPrefix}>[Claude]</span>
          {block.text}
        </div>
      )
    case 'agent-sections':
      return (
        <div className={styles.agent}>
          <span className={styles.agentPrefix}>[Claude]</span>
          {block.intro && <span>{block.intro}</span>}
          <div className={styles.sections}>
            {block.sections.map((s, i) => (
              <div key={i}>
                <div className={styles.sectionHead}>
                  <span className={styles.sectionLabel}>{s.label}</span>
                  {s.chapter && <span className={styles.sectionChapter}>{s.chapter}</span>}
                </div>
                <div className={styles.sectionBody}>{s.text}</div>
              </div>
            ))}
          </div>
        </div>
      )
    case 'flag':
      return (
        <div className={styles.flag}>
          <span className={styles.flagArrow}>↑</span>
          <span>{block.note}</span>
        </div>
      )
    case 'cursor':
      return <span className={styles.cursor} aria-hidden />
  }
}
