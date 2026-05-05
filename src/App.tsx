import { useCallback, useEffect, useMemo, useState } from 'react'
import { LevelProvider, useLevel } from './hooks/useLevel'
import { GlossaryProvider } from './hooks/useGlossary'
import { useUrlState } from './hooks/useUrlState'
import { chapters, chapterById } from './content/chapters'
import { Layout } from './components/Layout'
import { TopBar } from './components/TopBar'
import { ChapterRail } from './components/ChapterRail'
import { Diagram } from './components/diagram/Diagram'
import { Chapter8Diagram } from './components/diagram/Chapter8Diagram'
import { Chapter9Diagram } from './components/diagram/Chapter9Diagram'
import { Console } from './components/console/Console'
import { SlideStream } from './components/SlideStream'
import { GlossaryPanel } from './components/GlossaryPanel'
import { IntroPage } from './components/IntroPage'
import { WhatsNextPage } from './components/WhatsNextPage'
import type { Slide as SlideType, StepItem } from './content/types'

const INTRO_ID = 'ch0'

/** Find the first 'steps' block in a slide's prose body, if any. */
function findStepsBlock(slide: SlideType | undefined): StepItem[] | null {
  if (!slide || slide.body.kind !== 'prose') return null
  for (const block of slide.body.blocks) {
    if (block.kind === 'steps') return block.items
  }
  return null
}

function Inner() {
  const url = useUrlState()
  // 101-only phase: 201/301 are not authored yet. Hard-pin level=101.
  const { level, filter } = useLevel()

  const [chapterId, setChapterId] = useState<string>(url.chapterId)
  const [slideIndex, setSlideIndex] = useState<number>(url.slideIndex)
  const [stepIndex, setStepIndex] = useState<number>(0)

  const isIntro = chapterId === INTRO_ID
  const chapter = chapterById(chapterId)
  const isPage = chapter.kind === 'page'
  const visibleSlides = useMemo(() => filter(chapter.slides), [chapter, filter])
  const safeIndex = Math.min(slideIndex, Math.max(0, visibleSlides.length - 1))
  const currentSlide = visibleSlides[safeIndex]

  const stepsBlock = useMemo(() => findStepsBlock(currentSlide), [currentSlide])
  const totalSteps = stepsBlock?.length ?? 0
  const safeStepIndex = stepsBlock ? Math.min(stepIndex, totalSteps - 1) : 0
  const activeStep = stepsBlock ? stepsBlock[safeStepIndex] : null

  const chapterIdx = chapters.findIndex(c => c.id === chapter.id)
  const nextChapter = chapterIdx >= 0 ? chapters[chapterIdx + 1] : undefined
  const prevChapter = chapterIdx > 0 ? chapters[chapterIdx - 1] : undefined

  // Keep URL in sync with state. On the intro, write the sentinel id directly
  // rather than the chapter fallback that chapterById() returns.
  useEffect(() => {
    url.writeUrl(isIntro ? INTRO_ID : chapter.id, isIntro ? 0 : safeIndex, level)
  }, [isIntro, chapter.id, safeIndex, level, url])

  /** Reset step state whenever we land on a new slide or chapter. */
  useEffect(() => {
    setStepIndex(0)
  }, [chapterId, safeIndex])

  const goToChapter = useCallback((id: string) => {
    setChapterId(id)
    setSlideIndex(0)
    setStepIndex(0)
  }, [])

  /** Jump to the LAST slide of the previous chapter (used when ← is pressed on slide 0).
   *  Lands on the LAST step of that slide if it has interactive steps. */
  const goToPrevChapterEnd = useCallback(() => {
    if (!prevChapter) return
    const prevVisible = filter(prevChapter.slides)
    const lastSlide = prevVisible[prevVisible.length - 1]
    const prevSteps = findStepsBlock(lastSlide)
    setChapterId(prevChapter.id)
    setSlideIndex(Math.max(0, prevVisible.length - 1))
    setStepIndex(prevSteps ? prevSteps.length - 1 : 0)
  }, [prevChapter, filter])

  /** Move to the previous slide WITHIN the current chapter, landing on its last step if interactive. */
  const goToPrevSlideEnd = useCallback(() => {
    const target = visibleSlides[safeIndex - 1]
    const targetSteps = findStepsBlock(target)
    setSlideIndex(safeIndex - 1)
    setStepIndex(targetSteps ? targetSteps.length - 1 : 0)
  }, [visibleSlides, safeIndex])

  /** Unified prev/next that chains: step → slide → chapter. */
  const onPrev = useCallback(() => {
    if (stepsBlock && safeStepIndex > 0) {
      setStepIndex(safeStepIndex - 1)
    } else if (safeIndex > 0) {
      goToPrevSlideEnd()
    } else {
      goToPrevChapterEnd()
    }
  }, [stepsBlock, safeStepIndex, safeIndex, goToPrevSlideEnd, goToPrevChapterEnd])

  const onNext = useCallback(() => {
    if (stepsBlock && safeStepIndex < totalSteps - 1) {
      setStepIndex(safeStepIndex + 1)
    } else if (safeIndex < visibleSlides.length - 1) {
      setSlideIndex(safeIndex + 1)
    } else if (nextChapter) {
      goToChapter(nextChapter.id)
    }
  }, [stepsBlock, safeStepIndex, totalSteps, safeIndex, visibleSlides.length, nextChapter, goToChapter])

  const canGoPrev =
    (stepsBlock && safeStepIndex > 0) || safeIndex > 0 || prevChapter !== undefined
  const canGoNext =
    (stepsBlock && safeStepIndex < totalSteps - 1) ||
    safeIndex < visibleSlides.length - 1 ||
    nextChapter !== undefined

  /** Scroll the active slide's body content. Only one slide is in the DOM at a time. */
  const scrollActiveSlideBody = useCallback((delta: number): boolean => {
    const body = document.querySelector('[data-slide-body]') as HTMLElement | null
    if (!body) return false
    if (body.scrollHeight <= body.clientHeight + 4) return false
    body.scrollBy({ top: delta, behavior: 'smooth' })
    return true
  }, [])

  /** Keyboard navigation.
   *  ←/→ : prev/next slide. Chains across chapter boundaries — last slide of Ch N → first slide of Ch N+1, and vice versa.
   *  ↑/↓ : scroll the active slide's content (when it overflows). Not chapter nav.
   *  1-9 : jump to chapter N.
   *  Chapter navigation also available via clicking the left rail.
   */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) return
      const tag = (e.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      // 1-9 jumps to chapter N — works from the intro too, as a quick-skip.
      if (/^[1-9]$/.test(e.key)) {
        e.preventDefault()
        const target = chapters.find(c => c.number === parseInt(e.key, 10))
        if (target) goToChapter(target.id)
        return
      }

      // Arrow-key slide nav is meaningless on the intro.
      if (isIntro) return

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          if (canGoNext) onNext()
          break
        case 'ArrowLeft':
          e.preventDefault()
          if (canGoPrev) onPrev()
          break
        case 'ArrowDown':
          e.preventDefault()
          scrollActiveSlideBody(80)
          break
        case 'ArrowUp':
          e.preventDefault()
          scrollActiveSlideBody(-80)
          break
        // 'L' (level cycle) disabled in 101-only phase.
        // 'z' / 'Escape' — handled in Diagram.tsx.
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isIntro, canGoNext, canGoPrev, onNext, onPrev, goToChapter, scrollActiveSlideBody])

  /** Effective diagram coordinates: the active step's focus/highlight overrides the slide-level focus. */
  const diagramFocus = activeStep?.focus ?? currentSlide?.diagramFocus
  const diagramHighlight = activeStep?.highlight
  const diagramStatus = activeStep?.status
  const diagramPulse = activeStep?.pulse
  const diagramExtraVisible = currentSlide?.extraVisible

  if (isIntro) {
    return (
      <Layout
        topBar={
          <TopBar
            chapterNumber={0}
            chapterTitle="Introduction"
            slideIndex={0}
            totalSlides={0}
            isIntro
            levelToggle={null}
          />
        }
        rail={
          <ChapterRail
            currentChapterId={INTRO_ID}
            currentSlideIndex={0}
            visibleSlides={[]}
            onSelectChapter={goToChapter}
            onSelectSlide={() => {}}
          />
        }
        content={<IntroPage onBegin={() => goToChapter(chapters[0].id)} />}
        overlay={<GlossaryPanel />}
      />
    )
  }

  if (isPage) {
    return (
      <Layout
        topBar={
          <TopBar
            chapterNumber={chapter.displayNumber ?? chapter.number}
            chapterTitle={chapter.title}
            slideIndex={0}
            totalSlides={0}
            onGoToIntro={() => goToChapter(INTRO_ID)}
            hideCounter
            levelToggle={null}
          />
        }
        rail={
          <ChapterRail
            currentChapterId={chapter.id}
            currentSlideIndex={0}
            visibleSlides={[]}
            onSelectChapter={goToChapter}
            onSelectSlide={() => {}}
          />
        }
        content={<WhatsNextPage onReturnToIntro={() => goToChapter(INTRO_ID)} />}
        overlay={<GlossaryPanel />}
      />
    )
  }

  return (
    <Layout
      topBar={
        <TopBar
          chapterNumber={chapter.displayNumber ?? chapter.number}
          chapterTitle={chapter.title}
          slideIndex={safeIndex}
          totalSlides={visibleSlides.length}
          onGoToIntro={() => goToChapter(INTRO_ID)}
          /* Glossary button placeholder — wires up in next pass.
             Level toggle removed for the 101-only phase. */
          levelToggle={null}
        />
      }
      rail={
        <ChapterRail
          currentChapterId={chapter.id}
          currentSlideIndex={safeIndex}
          visibleSlides={visibleSlides}
          onSelectChapter={goToChapter}
          onSelectSlide={setSlideIndex}
        />
      }
      diagram={(() => {
        if (currentSlide?.hideDiagram) return undefined
        // Per-slide override wins over chapter default. Used by Ch 9 s5 (observability)
        // to swap back to the runtime diagram so logs/metrics light up the real fleet.
        const kind = currentSlide?.diagramKind
          ?? (chapter.number === 8 ? 'chapter8'
            : chapter.number === 9 ? 'chapter9'
            : chapter.number === 10 ? 'console'
            : 'runtime')
        if (kind === 'console') {
          if (!currentSlide?.console) return undefined
          return <Console spec={currentSlide.console} />
        }
        if (kind === 'chapter8') {
          return (
            <Chapter8Diagram
              slideIndex={safeIndex}
              focus={diagramFocus}
              highlight={diagramHighlight}
              highlightStatus={diagramStatus}
            />
          )
        }
        if (kind === 'chapter9') {
          return (
            <Chapter9Diagram
              slideIndex={safeIndex}
              focus={diagramFocus}
              highlight={diagramHighlight}
              highlightStatus={diagramStatus}
            />
          )
        }
        return (
          <Diagram
            chapter={chapter.number}
            level={level}
            focus={diagramFocus}
            highlight={diagramHighlight}
            highlightStatus={diagramStatus}
            extraVisible={diagramExtraVisible}
            pulse={diagramPulse}
          />
        )
      })()}
      content={
        visibleSlides.length === 0
          ? <EmptyChapter chapterTitle={chapter.title} />
          : <SlideStream
              chapter={chapter}
              visibleSlides={visibleSlides}
              currentIndex={safeIndex}
              activeStepIndex={stepsBlock ? safeStepIndex : null}
              onPrev={canGoPrev ? onPrev : undefined}
              onNext={canGoNext ? onNext : undefined}
            />
      }
      overlay={<GlossaryPanel />}
    />
  )
}

function EmptyChapter({ chapterTitle }: { chapterTitle: string }) {
  return (
    <div style={{
      height: '100%',
      display: 'grid',
      placeItems: 'center',
      padding: '64px',
      color: 'var(--ink-muted)',
      textAlign: 'center',
    }}>
      <div style={{ maxWidth: 480 }}>
        <div style={{
          fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
          marginBottom: 16,
        }}>
          Chapter pending
        </div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1.2,
          color: 'var(--ink)', marginBottom: 12,
        }}>
          {chapterTitle}
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6 }}>
          Content for this chapter is not yet authored.
        </div>
      </div>
    </div>
  )
}

export function App() {
  return (
    <LevelProvider initial={101}>
      <GlossaryProvider>
        <Inner />
      </GlossaryProvider>
    </LevelProvider>
  )
}
