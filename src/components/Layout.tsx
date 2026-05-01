import type { ReactNode } from 'react'
import styles from './Layout.module.css'

type Props = {
  topBar: ReactNode
  rail: ReactNode
  diagram: ReactNode
  content: ReactNode
  overlay?: ReactNode
}

export function Layout({ topBar, rail, diagram, content, overlay }: Props) {
  return (
    <div className={styles.app}>
      <div className={styles.topbar}>{topBar}</div>
      <div className={styles.body}>
        <aside className={styles.rail}>{rail}</aside>
        <section className={styles.diagramCol}>{diagram}</section>
        <main className={styles.contentCol}>{content}</main>
      </div>
      {overlay}
    </div>
  )
}
