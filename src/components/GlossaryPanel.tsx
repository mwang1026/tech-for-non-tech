import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlossary } from '../hooks/useGlossary'
import { glossary, glossaryCategories, getGlossaryEntry, type GlossaryEntry } from '../content/glossary'
import { InlineMd } from './inlineMd'
import styles from './GlossaryPanel.module.css'

export function GlossaryPanel() {
  const { isOpen, activeId, close, open } = useGlossary()
  const [query, setQuery] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)

  /** Esc closes the panel. */
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, close])

  /** When opened with an active id, scroll that entry into view. */
  useEffect(() => {
    if (!isOpen || !activeId) return
    /* Wait one frame so the panel content has mounted. */
    const id = requestAnimationFrame(() => {
      const el = listRef.current?.querySelector(`[data-entry-id="${activeId}"]`) as HTMLElement | null
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
    return () => cancelAnimationFrame(id)
  }, [isOpen, activeId])

  /** Reset search when closed (so reopening starts fresh). */
  useEffect(() => {
    if (!isOpen) setQuery('')
  }, [isOpen])

  const filtered = useMemo(() => filterEntries(query), [query])
  const grouped = useMemo(() => groupByCategory(filtered), [filtered])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.scrim}
            onClick={close}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-hidden
          />
          <motion.aside
            className={styles.panel}
            role="dialog"
            aria-label="Glossary"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <header className={styles.head}>
              <div>
                <div className={styles.eyebrow}>Glossary</div>
                <div className={styles.title}>{glossary.length} terms</div>
                <div className={styles.quip}>
                  Every term used across the chapters, defined in one place. Search, scroll, or consult your friendly LLM.
                </div>
              </div>
              <button className={styles.closeBtn} onClick={close} aria-label="Close glossary">×</button>
            </header>

            <div className={styles.searchWrap}>
              <input
                type="text"
                className={styles.search}
                placeholder="Search terms…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
              />
            </div>

            <div className={styles.list} ref={listRef}>
              {grouped.length === 0 && (
                <div className={styles.empty}>No matches.</div>
              )}
              {grouped.map(({ category, label, entries }) => (
                <section key={category} className={styles.group}>
                  <h3 className={styles.groupLabel}>{label}</h3>
                  {entries.map(entry => (
                    <Entry
                      key={entry.id}
                      entry={entry}
                      isActive={entry.id === activeId}
                      onLink={open}
                    />
                  ))}
                </section>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Entry({
  entry,
  isActive,
  onLink,
}: {
  entry: GlossaryEntry
  isActive: boolean
  onLink: (id: string) => void
}) {
  return (
    <article
      data-entry-id={entry.id}
      className={`${styles.entry} ${isActive ? styles.entryActive : ''}`}
    >
      <h4 className={styles.term}>{entry.term}</h4>
      <p className={styles.short}><InlineMd>{entry.short}</InlineMd></p>
      {entry.body.map((para, i) => (
        <p key={i} className={styles.body}><InlineMd>{para}</InlineMd></p>
      ))}
      {entry.related && entry.related.length > 0 && (
        <div className={styles.related}>
          <span className={styles.relatedLabel}>Related:</span>
          {entry.related.map((rid, i) => {
            const target = getGlossaryEntry(rid)
            if (!target) return null
            return (
              <button
                key={rid}
                type="button"
                className={styles.relatedLink}
                onClick={() => onLink(rid)}
              >
                {target.term}{i < (entry.related?.length ?? 0) - 1 ? ',' : ''}
              </button>
            )
          })}
        </div>
      )}
      <div className={styles.entryFoot}>Ch {entry.chapter}</div>
    </article>
  )
}

/* --------------------------- helpers --------------------------- */

function filterEntries(query: string): GlossaryEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return glossary
  return glossary.filter(entry =>
    entry.term.toLowerCase().includes(q) ||
    entry.short.toLowerCase().includes(q) ||
    entry.body.some(p => p.toLowerCase().includes(q))
  )
}

function groupByCategory(entries: GlossaryEntry[]) {
  return glossaryCategories
    .map(cat => ({
      category: cat.id,
      label: cat.label,
      entries: entries.filter(e => e.category === cat.id),
    }))
    .filter(g => g.entries.length > 0)
}
