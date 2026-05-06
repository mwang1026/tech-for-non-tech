import { useEffect, useState } from 'react'
import styles from './MobileNotice.module.css'

const STORAGE_KEY = 'dta:mobile-notice-dismissed'
const BREAKPOINT = '(max-width: 720px)'

export function MobileNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(STORAGE_KEY) === '1') return

    const mql = window.matchMedia(BREAKPOINT)
    const update = () => setVisible(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  if (!visible) return null

  const dismiss = () => {
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
    setVisible(false)
  }

  return (
    <div className={styles.sheet} role="dialog" aria-label="Desktop recommended">
      <button className={styles.close} onClick={dismiss} aria-label="Close">×</button>
      <div className={styles.title}>Built for desktop.</div>
      <div className={styles.body}>
        <p>A real architecture diagram on a phone is a pinch-and-zoom slideshow. We didn't want to pretend otherwise, so we didn't.</p>
        <p>Come back on a laptop. The text still works if you want to scroll.</p>
      </div>
      <div className={styles.actions}>
        <button className={styles.dismiss} onClick={dismiss}>I'll squint, thanks</button>
      </div>
    </div>
  )
}
