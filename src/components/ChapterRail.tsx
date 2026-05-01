import { chapters } from '../content/chapters'
import type { Chapter, Slide } from '../content/types'
import styles from './ChapterRail.module.css'

type Props = {
  currentChapterId: string
  currentSlideIndex: number
  visibleSlides: Slide[]
  onSelectChapter: (id: string) => void
  onSelectSlide: (index: number) => void
}

const INTRO_ID = 'ch0'

export function ChapterRail({
  currentChapterId, currentSlideIndex, visibleSlides, onSelectChapter, onSelectSlide,
}: Props) {
  const isIntroCurrent = currentChapterId === INTRO_ID
  return (
    <nav className={styles.rail} aria-label="Chapters">
      <span className={styles.title}>Contents</span>
      <div className={`${styles.chapter} ${isIntroCurrent ? styles.current : ''}`}>
        <button className={styles.chapterButton} onClick={() => onSelectChapter(INTRO_ID)}>
          <span className={styles.num}>00</span>
          <span className={styles.label}>Introduction</span>
        </button>
      </div>
      {chapters.map(ch => (
        <ChapterRow
          key={ch.id}
          chapter={ch}
          isCurrent={ch.id === currentChapterId}
          currentSlideIndex={currentSlideIndex}
          visibleSlides={ch.id === currentChapterId ? visibleSlides : []}
          onSelectChapter={onSelectChapter}
          onSelectSlide={onSelectSlide}
        />
      ))}
    </nav>
  )
}

function ChapterRow({
  chapter, isCurrent, currentSlideIndex, visibleSlides, onSelectChapter, onSelectSlide,
}: {
  chapter: Chapter
  isCurrent: boolean
  currentSlideIndex: number
  visibleSlides: Slide[]
  onSelectChapter: (id: string) => void
  onSelectSlide: (i: number) => void
}) {
  const num = String(chapter.number).padStart(2, '0')
  return (
    <div className={`${styles.chapter} ${isCurrent ? styles.current : ''}`}>
      <button className={styles.chapterButton} onClick={() => onSelectChapter(chapter.id)}>
        <span className={styles.num}>{num}</span>
        <span className={styles.label}>{chapter.title}</span>
      </button>
      {isCurrent && (
        visibleSlides.length === 0 ? (
          <div className={styles.slides}><div className={styles.empty}>No slides at this level.</div></div>
        ) : (
          <ul className={styles.slides}>
            {visibleSlides.map((s, i) => (
              <li key={s.id}>
                <button
                  className={styles.slide}
                  data-current={i === currentSlideIndex}
                  onClick={() => onSelectSlide(i)}
                >
                  <span className={styles.dot} />
                  <span className={styles.label}>{s.headline}</span>
                </button>
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
}
