import { AnimatePresence, motion } from 'framer-motion'
import type { Chapter, Slide as SlideType } from '../content/types'
import { Slide } from './Slide'

type Props = {
  chapter: Chapter
  visibleSlides: SlideType[]
  currentIndex: number
  /** Active step index when the slide has a `steps` block; otherwise null. */
  activeStepIndex: number | null
  onPrev?: () => void
  onNext?: () => void
}

/**
 * Renders ONLY the current slide. Slide navigation never happens via scroll —
 * only via ←/→ keys (which chain across chapter boundaries via App.tsx),
 * the prev/next buttons, or rail clicks.
 *
 * Scroll within a slide affects only that slide's body content.
 */
export function SlideStream({
  chapter,
  visibleSlides,
  currentIndex,
  activeStepIndex,
  onPrev,
  onNext,
}: Props) {
  const current = visibleSlides[currentIndex]
  if (!current) return null

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${chapter.id}-${current.id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
          style={{ height: '100%' }}
        >
          <Slide
            slide={current}
            chapterNumber={chapter.displayNumber ?? chapter.number}
            index={currentIndex}
            total={visibleSlides.length}
            activeStepIndex={activeStepIndex}
            onPrev={onPrev}
            onNext={onNext}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
