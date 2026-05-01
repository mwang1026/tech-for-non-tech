import type { ReactNode } from 'react'
import styles from './Layout.module.css'

type Props = {
  topBar: ReactNode
  rail: ReactNode
  /** When omitted, the diagram column is removed and content fills the rest
   *  of the row beside the rail. Used by the intro surface. */
  diagram?: ReactNode
  content: ReactNode
  overlay?: ReactNode
}

export function Layout({ topBar, rail, diagram, content, overlay }: Props) {
  const hasDiagram = diagram !== undefined && diagram !== null
  return (
    <div className={styles.app}>
      <div className={styles.topbar}>{topBar}</div>
      <div className={hasDiagram ? styles.body : styles.bodyNoDiagram}>
        <aside className={styles.rail}>{rail}</aside>
        {hasDiagram && <section className={styles.diagramCol}>{diagram}</section>}
        <main className={styles.contentCol}>{content}</main>
      </div>
      {overlay}
    </div>
  )
}
