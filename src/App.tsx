import { useCallback, useEffect, useMemo, useState } from 'react'
import { LevelProvider, useLevel } from './hooks/useLevel'
import { GlossaryProvider } from './hooks/useGlossary'
import { useUrlState } from './hooks/useUrlState'
import { chapters, chapterById } from './content/chapters'
import { Layout } from './components/Layout'
import { TopBar } from './components/TopBar'
import { ChapterRail } from './components/ChapterRail'
import { Diagram } from './components/diagram/Diagram'
import { SlideStream } from './components/SlideStream'
import { GlossaryPanel } from './components/GlossaryPanel'

function Inner() {
  const url = useUrlState()
  // 101-only phase: 201/301 are not authored yet. Hard-pin level=101.
  const { level, filter } = useLevel()

  const [chapterId, setChapterId] = useState<string>(url.chapterId)
  const [slideIndex, setSlideIndex] = useState<number>(url.slideIndex)

  const chapter = chapterById(chapterId)
  const visibleSlides = useMemo(() => filter(chapter.slides), [chapter, filter])
  const safeIndex = Math.min(slideIndex, Math.max(0, visibleSlides.length - 1))
  const currentSlide = visibleSlides[safeIndex]

  const nextChapter = chapters.find(c => c.number === chapter.number + 1)
  const prevChapter = chapters.find(c => c.number === chapter.number - 1)

  // Keep URL in sync with state
  useEffect(() => {
    url.writeUrl(chapter.id, safeIndex, level)
  }, [chapter.id, safeIndex, level, url])

  const goToChapter = useCallback((id: string) => {
    setChapterId(id)
    setSlideIndex(0)
  }, [])

  /** Jump to the LAST slide of the previous chapter (used when ← is pressed on slide 0). */
  const goToPrevChapterEnd = useCallback(() => {
    if (!prevChapter) return
    const prevVisible = filter(prevChapter.slides)
    setChapterId(prevChapter.id)
    setSlideIndex(Math.max(0, prevVisible.length - 1))
  }, [prevChapter, filter])

  /** Unified prev/next that chains across chapter boundaries. */
  const onPrev = useCallback(() => {
    if (safeIndex > 0) setSlideIndex(safeIndex - 1)
    else goToPrevChapterEnd()
  }, [safeIndex, goToPrevChapterEnd])

  const onNext = useCallback(() => {
    if (safeIndex < visibleSlides.length - 1) setSlideIndex(safeIndex + 1)
    else if (nextChapter) goToChapter(nextChapter.id)
  }, [safeIndex, visibleSlides.length, nextChapter, goToChapter])

  const canGoPrev = safeIndex > 0 || prevChapter !== undefined
  const canGoNext = safeIndex < visibleSlides.length - 1 || nextChapter !== undefined

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
        default:
          if (/^[1-9]$/.test(e.key)) {
            e.preventDefault()
            const target = chapters.find(c => c.number === parseInt(e.key, 10))
            if (target) goToChapter(target.id)
          }
          // 'z' / 'Escape' — handled in Diagram.tsx.
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [canGoNext, canGoPrev, onNext, onPrev, goToChapter, scrollActiveSlideBody])

  const focus = currentSlide?.diagramFocus

  return (
    <Layout
      topBar={
        <TopBar
          chapterNumber={chapter.number}
          chapterTitle={chapter.title}
          slideIndex={safeIndex}
          totalSlides={visibleSlides.length}
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
      diagram={<Diagram chapter={chapter.number} level={level} focus={focus} />}
      content={
        visibleSlides.length === 0
          ? <EmptyChapter chapterTitle={chapter.title} />
          : <SlideStream
              chapter={chapter}
              visibleSlides={visibleSlides}
              currentIndex={safeIndex}
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
