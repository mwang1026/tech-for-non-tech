import { useCallback, useEffect, useState } from 'react'
import type { Level } from '../content/types'

/** Parse `#ch6/3` and `?level=201` from the current URL. */
function parse(): { chapterId: string; slideIndex: number; level: Level } {
  const hash = window.location.hash.replace(/^#/, '')
  const [chapterId = 'ch6', slideIndexStr = '0'] = hash.split('/')
  const slideIndex = Math.max(0, parseInt(slideIndexStr, 10) || 0)

  const search = new URLSearchParams(window.location.search)
  const lvRaw = parseInt(search.get('level') || '201', 10)
  const level: Level = lvRaw === 101 || lvRaw === 301 ? lvRaw : 201

  return { chapterId, slideIndex, level }
}

export function useUrlState() {
  const [state, setState] = useState(parse)

  useEffect(() => {
    const onPop = () => setState(parse())
    window.addEventListener('popstate', onPop)
    window.addEventListener('hashchange', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      window.removeEventListener('hashchange', onPop)
    }
  }, [])

  const writeUrl = useCallback((chapterId: string, slideIndex: number, level: Level) => {
    const search = new URLSearchParams(window.location.search)
    search.set('level', String(level))
    const next = `?${search.toString()}#${chapterId}/${slideIndex}`
    if (next !== window.location.search + window.location.hash) {
      window.history.replaceState(null, '', next)
    }
  }, [])

  return { ...state, writeUrl }
}
