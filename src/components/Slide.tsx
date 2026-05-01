import type { Slide as SlideType, Paragraph, Inline, Block } from '../content/types'
import { useGlossary } from '../hooks/useGlossary'
import { InlineMd, inlineMdToHtml } from './inlineMd'
import styles from './Slide.module.css'

type Props = {
  slide: SlideType
  chapterNumber: number
  index: number
  total: number
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

function BlockRender({ block }: { block: Block }) {
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
  }
}

export function Slide({ slide, chapterNumber, index, total, onPrev, onNext }: Props) {
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
            <BlockRender key={i} block={block} />
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
              {slide.body.prompts && slide.body.prompts.length > 0 && (
                <div>
                  <div className={styles.recapHeading}>Try this in your codebase</div>
                  <div className={styles.promptList}>
                    {slide.body.prompts.map((pr, i) => (
                      <div key={i} className={styles.promptCard}><InlineMd>{pr}</InlineMd></div>
                    ))}
                  </div>
                </div>
              )}
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
