import { motion } from 'framer-motion'
import { chapters } from '../content/chapters'
import { intro } from '../content/intro'
import styles from './IntroPage.module.css'

type Props = {
  onBegin: () => void
}

const reveal = (i: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: {
    delay: 0.06 * i,
    duration: 0.5,
    ease: [0.22, 0.61, 0.36, 1] as const,
  },
})

/** Editorial content for the intro. Lives inside the same Layout as the chapter
 *  surface, so the rail + top bar are provided by the parent. This component
 *  owns only the content column. */
export function IntroPage({ onBegin }: Props) {
  const firstChapter = chapters[0]

  return (
    <div className={styles.scroll}>
      <article className={styles.main}>
        <motion.h1 className={styles.headline} {...reveal(0)}>
          {intro.headline.lead}
          <em>{intro.headline.italic}</em>
        </motion.h1>

        <div className={styles.thesisGroup}>
          {intro.thesis.map((para, i) => (
            <motion.p key={i} className={styles.thesis} {...reveal(1 + i)}>
              {para}
            </motion.p>
          ))}
        </div>

        <motion.section className={styles.section} {...reveal(1 + intro.thesis.length)}>
          <div className={styles.sectionLabel}>{intro.audienceLabel}</div>
          <ul className={styles.audienceList}>
            {intro.audience.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </motion.section>

        <motion.div className={styles.cta} {...reveal(2 + intro.thesis.length)}>
          <button
            type="button"
            className={styles.beginBtn}
            onClick={onBegin}
          >
            {intro.cta.label}
            <span className={styles.beginArrow}>→</span>
          </button>
          <div className={styles.beginCaption}>
            {intro.cta.sublabel} · <strong>{firstChapter.title}</strong>
          </div>
        </motion.div>
      </article>
    </div>
  )
}

