import type { ReactNode } from 'react'
import { useGlossary } from '../hooks/useGlossary'
import styles from './TopBar.module.css'

type Props = {
  chapterNumber: number
  chapterTitle: string
  slideIndex: number
  totalSlides: number
  levelToggle?: ReactNode
}

export function TopBar({ chapterNumber, chapterTitle, slideIndex, totalSlides, levelToggle }: Props) {
  const { open } = useGlossary()
  return (
    <header className={styles.bar}>
      <div className={styles.left}>
        <div className={styles.brand}>
          <span className={styles.mark} />
          <span className={styles.brandText}>Reading the Stack</span>
        </div>
        <div className={styles.crumb}>
          Ch {chapterNumber} · <strong>{chapterTitle}</strong> · {slideIndex + 1} of {totalSlides}
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
