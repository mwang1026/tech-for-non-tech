import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useAnimation } from 'framer-motion'
import { Chapter8DiagramSvg } from './Chapter8DiagramSvg'
import { CH8_FULL_VIEWBOX, CH8_REGION_VIEWBOX } from './chapter8Elements'
import type { StepStatus } from '../../content/types'
import styles from './Diagram.module.css'

type ViewBox = { x: number; y: number; w: number; h: number }

type Props = {
  /** Slide index within Chapter 8 — drives which elements are visible. */
  slideIndex: number
  /** Region/element id the slide wants in focus. Drives viewBox pan/zoom. */
  focus?: string
  /** Element IDs to highlight on the diagram (set by the active step). */
  highlight?: string[]
  /** Tints highlighted elements green/red/accent. */
  highlightStatus?: StepStatus
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n))
const ease = (t: number) => 1 - Math.pow(1 - t, 3)

function tween(from: ViewBox, to: ViewBox, ms: number, onUpdate: (vb: ViewBox) => void, onDone?: () => void) {
  const start = performance.now()
  let raf = 0
  const step = (now: number) => {
    const t = clamp((now - start) / ms, 0, 1)
    const k = ease(t)
    onUpdate({
      x: lerp(from.x, to.x, k),
      y: lerp(from.y, to.y, k),
      w: lerp(from.w, to.w, k),
      h: lerp(from.h, to.h, k),
    })
    if (t < 1) raf = requestAnimationFrame(step)
    else onDone?.()
  }
  raf = requestAnimationFrame(step)
  return () => cancelAnimationFrame(raf)
}

function regionForFocus(focus?: string): ViewBox {
  if (!focus) return CH8_FULL_VIEWBOX
  if (CH8_REGION_VIEWBOX[focus]) return CH8_REGION_VIEWBOX[focus]
  return CH8_FULL_VIEWBOX
}

export function Chapter8Diagram({ slideIndex, focus, highlight, highlightStatus }: Props) {
  const [vb, setVb] = useState<ViewBox>(CH8_FULL_VIEWBOX)
  const [manual, setManual] = useState(false)
  const dragging = useRef<{ x: number; y: number; vb: ViewBox } | null>(null)
  const cancelTween = useRef<(() => void) | null>(null)
  const controls = useAnimation()

  /** Auto-focus on slide change unless user is in manual mode. */
  useEffect(() => {
    if (manual) return
    const target = regionForFocus(focus)
    cancelTween.current?.()
    cancelTween.current = tween(vb, target, 480, setVb)
    return () => cancelTween.current?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, manual])

  const reset = useCallback(() => {
    setManual(false)
    const target = regionForFocus(focus)
    cancelTween.current?.()
    cancelTween.current = tween(vb, target, 320, setVb)
  }, [focus, vb])

  const zoomBy = useCallback((factor: number) => {
    cancelTween.current?.()
    setManual(true)
    setVb(prev => {
      const cx = prev.x + prev.w / 2
      const cy = prev.y + prev.h / 2
      const w = clamp(prev.w / factor, CH8_FULL_VIEWBOX.w / 4, CH8_FULL_VIEWBOX.w * 2)
      const h = w * (CH8_FULL_VIEWBOX.h / CH8_FULL_VIEWBOX.w)
      return { x: cx - w / 2, y: cy - h / 2, w, h }
    })
  }, [])

  const onWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    cancelTween.current?.()
    setManual(true)
    const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setVb(prev => {
      const w = clamp(prev.w / factor, CH8_FULL_VIEWBOX.w / 4, CH8_FULL_VIEWBOX.w * 2)
      const h = w * (CH8_FULL_VIEWBOX.h / CH8_FULL_VIEWBOX.w)
      const x = prev.x + (prev.w - w) * px
      const y = prev.y + (prev.h - h) * py
      return { x, y, w, h }
    })
  }, [])

  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    if ((e.target as Element).closest('button')) return
    ;(e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId)
    dragging.current = { x: e.clientX, y: e.clientY, vb }
    setManual(true)
    cancelTween.current?.()
  }, [vb])

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const dx = (e.clientX - dragging.current.x) * (dragging.current.vb.w / rect.width)
    const dy = (e.clientY - dragging.current.y) * (dragging.current.vb.h / rect.height)
    setVb({
      ...dragging.current.vb,
      x: dragging.current.vb.x - dx,
      y: dragging.current.vb.y - dy,
    })
  }, [])

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = null
    ;(e.currentTarget as HTMLDivElement).releasePointerCapture(e.pointerId)
  }, [])

  /** Click on a region — programmatic zoom. */
  const onSvgClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGElement
    const node = target.closest('[data-region]') as SVGElement | null
    const region = node?.getAttribute('data-region')
    if (!region) return
    const target_vb = CH8_REGION_VIEWBOX[region] ?? null
    if (!target_vb) return
    setManual(true)
    cancelTween.current?.()
    cancelTween.current = tween(vb, target_vb, 480, setVb)
  }, [vb])

  /** Z key — zoom toward focus. Esc — reset. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'z' || e.key === 'Z') {
        zoomBy(1.4)
      } else if (e.key === 'Escape') {
        reset()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomBy, reset])

  return (
    <div className={styles.frame}>
      <div
        className={styles.canvas}
        onWheel={onWheel}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className={styles.label}>Code Lifecycle · Ch 8</span>
        <svg
          className={styles.svg}
          viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
          preserveAspectRatio="xMidYMid meet"
          onClick={onSvgClick}
        >
          <motion.g animate={controls}>
            <Chapter8DiagramSvg slideIndex={slideIndex} highlight={highlight} highlightStatus={highlightStatus} />
          </motion.g>
        </svg>

        {manual && <span className={styles.modeLabel}>manual · drag · wheel zoom</span>}

        <div className={styles.controls}>
          <button className={styles.btn} onClick={() => zoomBy(1.2)} aria-label="Zoom in">+</button>
          <button className={styles.btn} onClick={() => zoomBy(1 / 1.2)} aria-label="Zoom out">−</button>
          {manual ? (
            <button className={`${styles.btn} ${styles.resetText}`} onClick={reset} aria-label="Reset to slide">
              Reset
            </button>
          ) : (
            <button className={styles.btn} onClick={reset} aria-label="Fit">⤢</button>
          )}
        </div>
      </div>
    </div>
  )
}
