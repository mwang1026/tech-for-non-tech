import type { ReactNode } from 'react'
import { useGlossary } from '../hooks/useGlossary'
import { chapters } from '../content/chapters'
import styles from './TopBar.module.css'

const INTRO_ID = 'ch0'

type Props = {
  chapterNumber: number | string
  chapterTitle: string
  slideIndex: number
  totalSlides: number
  onGoToIntro?: () => void
  isIntro?: boolean
  /** Hide the "X of Y" counter — used by page-kind chapters that aren't slide-paginated. */
  hideCounter?: boolean
  /** Currently selected chapter id — used to bind the mobile chapter dropdown. */
  currentChapterId?: string
  /** Mobile dropdown handler — same callback the desktop rail uses. */
  onSelectChapter?: (id: string) => void
  levelToggle?: ReactNode
}

export function TopBar({
  chapterNumber, chapterTitle, slideIndex, totalSlides,
  onGoToIntro, isIntro, hideCounter,
  currentChapterId, onSelectChapter,
  levelToggle,
}: Props) {
  const { open } = useGlossary()
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.brand}
          onClick={onGoToIntro}
          aria-label={onGoToIntro ? 'Return to intro' : undefined}
          disabled={!onGoToIntro}
        >
          <span className={styles.mark} />
          <span className={styles.brandText}>Directing the Agent</span>
        </button>
        <div className={styles.crumb}>
          {isIntro
            ? <><strong>Introduction</strong> · A Field Guide</>
            : hideCounter
              ? <>Ch {chapterNumber} · <strong>{chapterTitle}</strong></>
              : <>Ch {chapterNumber} · <strong>{chapterTitle}</strong> · <span className={styles.counter}>{slideIndex + 1} of {totalSlides}</span></>}
        </div>
        {onSelectChapter && (
          <select
            className={styles.chapterSelect}
            value={currentChapterId ?? INTRO_ID}
            onChange={(e) => onSelectChapter(e.target.value)}
            aria-label="Jump to chapter"
          >
            <option value={INTRO_ID}>Introduction</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>
                Ch {c.displayNumber ?? c.number} · {c.title}
              </option>
            ))}
          </select>
        )}
      </div>
      <div className={styles.right}>
        <button
          type="button"
          className={styles.glossaryBtn}
          onClick={() => open()}
          aria-label="Open glossary"
        >
          Glossary
        </button>
        {levelToggle}
      </div>
    </header>
  )
}
