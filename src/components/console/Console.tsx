import { useEffect, useState } from 'react'
import type { ConsoleSpec, ConsolePane, ConsoleBlock, TokenCascadeStep, PayloadEntry } from '../../content/types'
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
    case 'tokenCascade':
      return <TokenCascade prompt={block.prompt} steps={block.steps} finalNote={block.finalNote} />
    case 'payload':
      return <Payload title={block.title} entries={block.entries} />
  }
}

/* ---------- Token cascade animation (Slide A) ---------- */

const STEP_MS = 1700        // total per-step duration
const PICK_DELAY_MS = 1100  // when in the step the pick highlights

function TokenCascade({
  prompt,
  steps,
  finalNote,
}: {
  prompt: string
  steps: TokenCascadeStep[]
  finalNote?: string
}) {
  const [stepIdx, setStepIdx] = useState(0)
  const [phase, setPhase] = useState<'thinking' | 'picked' | 'done'>('thinking')
  const [acc, setAcc] = useState('') // accumulated picked tokens
  const [runId, setRunId] = useState(0) // bump to replay

  useEffect(() => {
    if (stepIdx >= steps.length) {
      setPhase('done')
      return
    }
    setPhase('thinking')
    const pickT = setTimeout(() => setPhase('picked'), PICK_DELAY_MS)
    const advanceT = setTimeout(() => {
      const step = steps[stepIdx]
      setAcc(prev => prev + step.candidates[step.pickedIndex].token)
      setStepIdx(i => i + 1)
    }, STEP_MS)
    return () => {
      clearTimeout(pickT)
      clearTimeout(advanceT)
    }
  }, [stepIdx, steps, runId])

  const replay = () => {
    setStepIdx(0)
    setAcc('')
    setPhase('thinking')
    setRunId(id => id + 1)
  }

  const current = steps[Math.min(stepIdx, steps.length - 1)]
  const showBars = phase !== 'done'

  return (
    <div className={styles.cascade}>
      <div className={styles.cascadePromptLabel}>Prompt so far</div>
      <div className={styles.cascadePrompt}>
        <span>{prompt}</span>
        <span className={styles.cascadeAcc}>{acc}</span>
        {phase !== 'done' && <span className={styles.cascadeCaret} aria-hidden />}
      </div>

      {showBars ? (
        <>
          <div className={styles.cascadeBarsLabel}>
            Next-token candidates {phase === 'picked' ? '— picked' : '— ranking'}
          </div>
          <div className={styles.cascadeBars} key={`${runId}-${stepIdx}`}>
            {current.candidates.map((c, i) => {
              const isPicked = i === current.pickedIndex && phase === 'picked'
              return (
                <div
                  key={i}
                  className={`${styles.cascadeRow} ${isPicked ? styles.cascadeRowPicked : ''}`}
                >
                  <span className={styles.cascadeToken}>{renderTok(c.token)}</span>
                  <span className={styles.cascadeBarTrack}>
                    <span
                      className={styles.cascadeBarFill}
                      style={{ width: `${Math.round(c.prob * 100)}%` }}
                    />
                  </span>
                  <span className={styles.cascadeProb}>{Math.round(c.prob * 100)}%</span>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className={styles.cascadeDone}>
          {finalNote && <div className={styles.cascadeFinalNote}>{finalNote}</div>}
          <button type="button" className={styles.cascadeReplay} onClick={replay}>
            Replay
          </button>
        </div>
      )}
    </div>
  )
}

function renderTok(t: string) {
  if (t === ' ') return '␣'
  if (t === '\n') return '↵'
  return t
}

/* ---------- Payload representation (Slide B) ---------- */

function Payload({ title, entries }: { title?: string; entries: PayloadEntry[] }) {
  return (
    <div className={styles.payload}>
      {title && <div className={styles.payloadTitle}>{title}</div>}
      <div className={styles.payloadBody}>
        {entries.map((e, i) => <PayloadRow key={i} entry={e} />)}
      </div>
    </div>
  )
}

function PayloadRow({ entry }: { entry: PayloadEntry }) {
  switch (entry.kind) {
    case 'systemPrompt':
      return (
        <div className={styles.payloadRow}>
          <span className={`${styles.payloadTag} ${styles.payloadTagSystem}`}>system</span>
          <span className={styles.payloadText}>{entry.text}</span>
        </div>
      )
    case 'context':
      return (
        <div className={styles.payloadRow}>
          <span className={`${styles.payloadTag} ${styles.payloadTagContext}`}>+</span>
          <span className={styles.payloadText}>
            <strong>{entry.label}</strong>
            {entry.detail && <span className={styles.payloadDetail}> {entry.detail}</span>}
          </span>
        </div>
      )
    case 'message':
      return (
        <div className={`${styles.payloadRow} ${entry.latest ? styles.payloadRowLatest : ''}`}>
          <span
            className={`${styles.payloadTag} ${entry.role === 'user' ? styles.payloadTagUser : styles.payloadTagAssistant}`}
          >
            {entry.role}
          </span>
          <span className={styles.payloadText}>{entry.text}</span>
        </div>
      )
    case 'toolUse':
      return (
        <div className={styles.payloadRow}>
          <span className={`${styles.payloadTag} ${styles.payloadTagTool}`}>tool_use</span>
          <span className={styles.payloadText}>
            <code>{entry.tool}</code>({entry.args})
          </span>
        </div>
      )
    case 'toolResult':
      return (
        <div className={styles.payloadRow}>
          <span className={`${styles.payloadTag} ${styles.payloadTagToolResult}`}>tool_result</span>
          <span className={styles.payloadText}>
            {entry.preview}
            {entry.sizeKB !== undefined && (
              <span className={styles.payloadDetail}> ({entry.sizeKB} KB)</span>
            )}
          </span>
        </div>
      )
  }
}
