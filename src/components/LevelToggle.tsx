import { useLevel } from '../hooks/useLevel'
import type { Level } from '../content/types'
import styles from './LevelToggle.module.css'

const LEVELS: Level[] = [101, 201, 301]

export function LevelToggle() {
  const { level, setLevel } = useLevel()
  return (
    <div role="group" aria-label="Detail level" className={styles.toggle}>
      {LEVELS.map(l => (
        <button
          key={l}
          className={styles.btn}
          data-active={level === l}
          data-level={l}
          onClick={() => setLevel(l)}
          aria-pressed={level === l}
        >
          {l}
        </button>
      ))}
    </div>
  )
}
