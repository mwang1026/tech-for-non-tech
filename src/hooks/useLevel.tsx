import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { Level, Slide } from '../content/types'

type LevelCtx = {
  level: Level
  setLevel: (l: Level) => void
  cycle: () => void
  filter: <T extends Slide>(slides: T[]) => T[]
}

const Ctx = createContext<LevelCtx | null>(null)

const ORDER: Level[] = [101, 201, 301]

/**
 * Filter slides to those visible at the current level.
 * - Include slides whose level <= current level.
 * - When a 201/301 slide has `replaces`, hide the lower-level slide it replaces.
 */
function filterSlides<T extends Slide>(slides: T[], level: Level): T[] {
  const allowed = slides.filter(s => s.level <= level)
  const replaced = new Set(allowed.map(s => s.replaces).filter(Boolean) as string[])
  return allowed.filter(s => !replaced.has(s.id))
}

export function LevelProvider({ children, initial = 201 }: { children: ReactNode; initial?: Level }) {
  const [level, setLevel] = useState<Level>(initial)
  const cycle = useCallback(() => {
    setLevel(prev => ORDER[(ORDER.indexOf(prev) + 1) % ORDER.length])
  }, [])
  const filter = useCallback(<T extends Slide>(slides: T[]) => filterSlides(slides, level), [level])
  const value = useMemo(() => ({ level, setLevel, cycle, filter }), [level, cycle, filter])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useLevel(): LevelCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useLevel must be used inside <LevelProvider>')
  return v
}
