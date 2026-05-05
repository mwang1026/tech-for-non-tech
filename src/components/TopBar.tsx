import type { ReactNode } from 'react'
import { useGlossary } from '../hooks/useGlossary'
import styles from './TopBar.module.css'

type Props = {
  chapterNumber: number | string
  chapterTitle: string
  slideIndex: number
  totalSlides: number
  onGoToIntro?: () => void
  isIntro?: boolean
  /** Hide the "X of Y" counter — used by page-kind chapters that aren't slide-paginated. */
  hideCounter?: boolean
  levelToggle?: ReactNode
}

export function TopBar({ chapterNumber, chapterTitle, slideIndex, totalSlides, onGoToIntro, isIntro, hideCounter, levelToggle }: Props) {
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
              : <>Ch {chapterNumber} · <strong>{chapterTitle}</strong> · {slideIndex + 1} of {totalSlides}</>}
        </div>
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
