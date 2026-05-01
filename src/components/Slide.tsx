import type { Slide as SlideType, Paragraph, Inline, Block } from '../content/types'
import { useGlossary } from '../hooks/useGlossary'
import { InlineMd, inlineMdToHtml } from './inlineMd'
import styles from './Slide.module.css'

type Props = {
  slide: SlideType
  chapterNumber: number
  index: number
  total: number
  /** Active step within an interactive `steps` block; null when the slide has none. */
  activeStepIndex: number | null
  onPrev?: () => void
  onNext?: () => void
}

function InlineRender({ nodes }: { nodes: Inline }) {
  const { open } = useGlossary()
  return (
    <>
      {nodes.map((node, i) => {
        if (node.kind === 'text') {
          return <InlineMd key={i}>{node.text}</InlineMd>
        }
        return (
          <a
            key={i}
            href={`#glossary/${node.glossaryId}`}
            onClick={(e) => {
              e.preventDefault()
              open(node.glossaryId)
            }}
            dangerouslySetInnerHTML={{ __html: inlineMdToHtml(node.text) }}
          />
        )
      })}
    </>
  )
}

function ParagraphRender({ p }: { p: Paragraph }) {
  return <p><InlineRender nodes={p} /></p>
}

function BlockRender({ block, activeStepIndex }: { block: Block; activeStepIndex: number | null }) {
  switch (block.kind) {
    case 'p':
      return <p><InlineRender nodes={block.nodes} /></p>
    case 'h':
      return <h3 className={styles.subhead}><InlineMd>{block.text}</InlineMd></h3>
    case 'ul':
      return (
        <ul className={styles.bulletList}>
          {block.items.map((item, i) => (
            <li key={i}><InlineRender nodes={item} /></li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol className={styles.numberedList}>
          {block.items.map((item, i) => (
            <li key={i}><InlineRender nodes={item} /></li>
          ))}
        </ol>
      )
    case 'steps': {
      const active = activeStepIndex ?? 0
      return (
        <ol className={styles.stepsList}>
          {block.items.map((item, i) => {
            const cls =
              i === active ? styles.stepItemActive
              : i < active ? styles.stepItemPast
              : styles.stepItemFuture
            const statusCls =
              item.status === 'pass' ? styles.stepItemPass
              : item.status === 'reject' ? styles.stepItemReject
              : ''
            return (
              <li
                key={i}
                className={`${styles.stepItem} ${cls} ${i === active ? statusCls : ''}`}
                aria-current={i === active ? 'step' : undefined}
              >
                <InlineRender nodes={item.content} />
              </li>
            )
          })}
        </ol>
      )
    }
  }
}

export function Slide({ slide, chapterNumber, index, total, activeStepIndex, onPrev, onNext }: Props) {
  return (
    <article className={styles.slide} data-slide-id={slide.id}>
      <div className={styles.inner}>
        <div className={styles.eyebrow}>
          <span className={styles.eyebrowText}>Ch {chapterNumber} · §{index + 1}</span>
          <span className={styles.eyebrowDivider} />
          <span className={styles.eyebrowText}>{slide.level}</span>
        </div>

        <h2 className={styles.headline}>
          {slide.headline.split('—').map((part, i) =>
            i === 0
              ? <span key={i}>{part}</span>
              : <span key={i}>—<em>{part}</em></span>
          )}
        </h2>

        <div className={styles.body} data-slide-body>
          {slide.body.kind === 'prose' && slide.body.blocks.map((block, i) => (
            <BlockRender key={i} block={block} activeStepIndex={activeStepIndex} />
          ))}

          {slide.body.kind === 'recap' && (
            <>
              <div>
                <div className={styles.recapHeading}>What you have so far</div>
                <ul className={styles.recapList}>
                  {slide.body.learned.map((line, i) => (
                    <li key={i}><InlineMd>{line}</InlineMd></li>
                  ))}
                </ul>
              </div>
              <div>
                <div className={styles.recapHeading}>Where it lives in the system</div>
                <ParagraphRender p={slide.body.whereInSystem} />
              </div>
              <div className={styles.bridge}>
                <ParagraphRender p={slide.body.bridge} />
              </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.navBtn} onClick={onPrev} disabled={!onPrev} aria-label="Previous slide">← Prev</button>
          <span>{index + 1} / {total}</span>
          <button className={styles.navBtn} onClick={onNext} disabled={!onNext} aria-label="Next slide">Next →</button>
        </div>
      </div>
    </article>
  )
}
