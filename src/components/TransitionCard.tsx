import styles from './TransitionCard.module.css'

type Props = {
  fromTitle: string
  toNumber: number
  toTitle: string
  onAdvance: () => void
}

export function TransitionCard({ fromTitle, toNumber, toTitle, onAdvance }: Props) {
  return (
    <div className={styles.card}>
      <div className={styles.inner}>
        <span className={styles.eyebrow}>End of {fromTitle}</span>
        <h2 className={styles.title}>Next — Chapter {toNumber}<br />{toTitle}</h2>
        <button className={styles.go} onClick={onAdvance} aria-label="Advance to next chapter">
          Continue →
        </button>
      </div>
    </div>
  )
}
