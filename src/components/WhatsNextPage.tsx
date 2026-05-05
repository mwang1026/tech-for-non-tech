import { motion } from 'framer-motion'
import { chapterFFContent } from '../content/chapter-ff'
import styles from './WhatsNextPage.module.css'

type Props = {
  onReturnToIntro: () => void
}

const reveal = (i: number, opts: { duration?: number; delay?: number } = {}) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: {
    delay: opts.delay ?? 0.06 * i,
    duration: opts.duration ?? 0.55,
    ease: [0.22, 0.61, 0.36, 1] as const,
  },
})

export function WhatsNextPage({ onReturnToIntro }: Props) {
  const { eyebrow, title, paragraphs, closing, promptSnippet } = chapterFFContent
  const [first, ...rest] = paragraphs

  return (
    <div className={styles.scroll}>
      <article className={styles.page}>
        <div className={styles.body}>
          <motion.div className={styles.eyebrow} {...reveal(0)}>{eyebrow}</motion.div>

          <motion.h1 className={styles.title} {...reveal(1, { delay: 0.12 })}>
            {title}
          </motion.h1>

          <motion.div className={styles.ornament} {...reveal(2, { delay: 0.24 })} aria-hidden="true">
            <span className={styles.ornamentRule} />
            <span className={styles.ornamentDot} />
            <span className={styles.ornamentRule} />
          </motion.div>

          <motion.p className={styles.lede} {...reveal(3, { delay: 0.32 })}>
            {first}
          </motion.p>

          {rest.slice(0, 1).map((para, i) => (
            <motion.p key={`pre-${i}`} className={styles.body_p} {...reveal(4 + i, { delay: 0.74 + 0.08 * i })}>
              {para}
            </motion.p>
          ))}

          <motion.figure className={styles.console} {...reveal(0, { delay: 0.92, duration: 0.6 })}>
            <div className={styles.consoleFrame}>
              <div className={styles.consoleChrome}>
                <span className={styles.consoleDot} />
                <span className={styles.consoleDot} />
                <span className={styles.consoleDot} />
                <span className={styles.consoleCwd}>{promptSnippet.cwd}</span>
              </div>
              <pre className={styles.consoleShell}>{promptSnippet.shell}</pre>
              <div className={styles.consolePrompt}>
                <span className={styles.consoleAngle}>{'>'}</span>
                <span className={styles.consolePromptText}>{promptSnippet.user}</span>
                <span className={styles.consoleCursor} />
              </div>
            </div>
            <figcaption className={styles.consoleCaption}>{promptSnippet.caption}</figcaption>
          </motion.figure>

          {rest.slice(1).map((para, i) => (
            <motion.p key={`post-${i}`} className={styles.body_p} {...reveal(0, { delay: 1.12 + 0.08 * i })}>
              {para}
            </motion.p>
          ))}

          <motion.div className={styles.ornamentTrailing} {...reveal(0, { delay: 1.36 })} aria-hidden="true">
            <span className={styles.ornamentRule} />
            <span className={styles.ornamentDot} />
            <span className={styles.ornamentRule} />
          </motion.div>

          <motion.p className={styles.closing} {...reveal(0, { delay: 1.46, duration: 0.7 })}>
            {closing}
          </motion.p>

          <motion.footer className={styles.footer} {...reveal(0, { delay: 1.7 })}>
            <button type="button" className={styles.returnLink} onClick={onReturnToIntro}>
              <span className={styles.returnArrow}>↩</span>
              <span>Return to the introduction</span>
            </button>
            <span className={styles.colophon}>
              <span className={styles.colophonHex}>0xFF</span>
              <span className={styles.colophonDivider} />
              <span className={styles.colophonNote}>Directing the Agent · End</span>
            </span>
          </motion.footer>
        </div>
      </article>
    </div>
  )
}
