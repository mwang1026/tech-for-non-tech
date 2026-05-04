import { motion } from 'framer-motion'
import type { Ch9ElementId, Ch9Scene, ProdState } from './chapter9Elements'
import { ch9ProdState, ch9Scene, visibleCh9Elements } from './chapter9Elements'
import type { StepStatus } from '../../content/types'
import { diagramReveal, staggerChildren } from '../../motion/variants'

type Props = {
  slideIndex: number
  highlight?: string[]
  highlightStatus?: StepStatus
}

/**
 * Chapter 9 diagram — the journey from "merged into main" to "users see orange,"
 * plus what happens when orange turns out to be wrong (rollback).
 *
 * Two scenes:
 *   gap       (slide 1)   — the merged commit on the left, the running fleet on
 *                            the right, empty middle
 *   pipeline  (slides 2–10) — the full pipeline accretes left-to-right and
 *                              top-to-bottom
 *
 * Coordinate system: 600 wide × 720 tall.
 */

const ink = 'var(--ink)'
const muted = 'var(--ink-muted)'
const paper = 'var(--paper)'
const hairline = 'var(--hairline-strong)'
const accent = 'var(--accent)'
const accentSoft = 'var(--accent-soft)'
const statusPass = 'var(--status-pass)'
const statusReject = 'var(--status-reject)'
const fontUi = 'var(--font-ui)'
const fontMono = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace'

function strokeForStatus(status: StepStatus | undefined): string {
  if (status === 'pass') return statusPass
  if (status === 'reject') return statusReject
  return accent
}

function Stage({
  id, x, y, w, h, eyebrow, title, sublabel, dashed, tinted, highlighted, status, children,
}: {
  id?: string
  x: number; y: number; w: number; h: number
  eyebrow?: string
  title?: string
  sublabel?: string
  dashed?: boolean
  tinted?: boolean
  highlighted?: boolean
  status?: StepStatus
  children?: React.ReactNode
}) {
  const stroke = highlighted ? strokeForStatus(status) : ink
  const strokeWidth = highlighted ? 1.8 : 1.1
  return (
    <motion.g data-region={id} variants={diagramReveal}>
      {eyebrow && (
        <text x={x + w / 2} y={y - 10} textAnchor="middle" fontSize="11" fontWeight={600} letterSpacing="1.4" fill={muted} fontFamily={fontUi}>
          {eyebrow.toUpperCase()}
        </text>
      )}
      <rect
        x={x} y={y} width={w} height={h}
        fill={tinted ? 'rgba(26, 24, 21, 0.025)' : paper}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '3 3' : undefined}
        rx={6}
      />
      {title && (
        <text x={x + w / 2} y={y + 24} textAnchor="middle" fontSize="13" fontWeight={600} fill={ink} fontFamily={fontUi}>
          {title}
        </text>
      )}
      {sublabel && (
        <text x={x + w / 2} y={y + 42} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontMono}>
          {sublabel}
        </text>
      )}
      {children}
    </motion.g>
  )
}

function PipelineArrow({
  id, x1, x2, y, label, highlighted, status,
}: {
  id?: string
  x1: number; x2: number; y: number
  label: string
  highlighted?: boolean
  status?: StepStatus
}) {
  const stroke = highlighted ? strokeForStatus(status) : ink
  const strokeWidth = highlighted ? 1.8 : 1.2
  return (
    <motion.g data-region={id} variants={diagramReveal}>
      <text x={(x1 + x2) / 2} y={y - 10} textAnchor="middle" fontSize="11" fontWeight={500} fill={highlighted ? stroke : ink} fontFamily={fontUi}>
        {label}
      </text>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={stroke} strokeWidth={strokeWidth} markerEnd="url(#ch9-arrow)" />
    </motion.g>
  )
}

/* ============================================================================
 * SCENE — 'gap' (slide 1)
 * GitHub box on the left with a green commit; production box on the right with
 * a fleet of servers; empty middle with a question mark.
 * ========================================================================== */
function SceneGap() {
  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <text x={300} y={60} textAnchor="middle" fontSize="13" fontWeight={700} letterSpacing="2" fill={muted} fontFamily={fontUi}>
        BETWEEN MERGED AND LIVE
      </text>

      {/* Left — merged commit on GitHub */}
      <Stage x={30} y={150} w={180} h={140} tinted eyebrow="GitHub · main">
        <line x1={50} y1={186} x2={210} y2={186} stroke={hairline} strokeWidth={0.6} />
        <circle cx={56} cy={210} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
        <circle cx={86} cy={210} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
        <circle cx={116} cy={210} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
        <line x1={56} y1={210} x2={170} y2={210} stroke={ink} strokeWidth={1.6} />
        <circle cx={170} cy={210} r={7} fill={paper} stroke={accent} strokeWidth={2} />
        <text x={170} y={234} textAnchor="middle" fontSize="11" fontFamily={fontMono} fill={accent}>
          orange
        </text>
        <g>
          <circle cx={48} cy={258} r={7} fill={statusPass} />
          <text x={48} y={262} textAnchor="middle" fontSize="9" fontWeight={700} fill={paper} fontFamily={fontUi}>✓</text>
          <text x={62} y={261} fontSize="11" fill={muted} fontFamily={fontUi}>
            CI green · merged
          </text>
        </g>
      </Stage>

      {/* Middle — the gap */}
      <g>
        <rect x={230} y={150} width={140} height={140} fill="none" stroke={muted} strokeDasharray="4 4" strokeWidth={1} rx={8} />
        <text x={300} y={216} textAnchor="middle" fontSize="44" fontWeight={300} fill={muted} fontFamily={fontUi}>
          ?
        </text>
        <text x={300} y={250} textAnchor="middle" fontSize="11" fontStyle="italic" fill={muted} fontFamily={fontUi}>
          this chapter
        </text>
      </g>

      {/* Right — running production fleet */}
      <Stage x={390} y={150} w={180} h={140} tinted eyebrow="Production · live users">
        <text x={480} y={210} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
          serving requests
        </text>
        <circle cx={440} cy={236} r={7} fill={paper} stroke={ink} strokeWidth={1.4} />
        <circle cx={480} cy={236} r={7} fill={paper} stroke={ink} strokeWidth={1.4} />
        <circle cx={520} cy={236} r={7} fill={paper} stroke={ink} strokeWidth={1.4} />
        <text x={480} y={272} textAnchor="middle" fontSize="11" fontWeight={600} fill={diffMinusInk} fontFamily={fontUi}>
          still serving yellow
        </text>
      </Stage>

      {/* Caption */}
      <text x={300} y={340} textAnchor="middle" fontSize="13" fontWeight={600} fill={ink} fontFamily={fontUi}>
        Production servers don&apos;t run code from GitHub directly.
      </text>
      <text x={300} y={360} textAnchor="middle" fontSize="13" fill={muted} fontFamily={fontUi}>
        They run a packaged, ready-to-execute version that has to be built
      </text>
      <text x={300} y={378} textAnchor="middle" fontSize="13" fill={muted} fontFamily={fontUi}>
        and deployed to them. Until that happens, every visitor sees yellow.
      </text>

      <text x={300} y={420} textAnchor="middle" fontSize="11" fontStyle="italic" fill={muted} fontFamily={fontUi}>
        the rest of the chapter fills in the middle
      </text>
    </motion.g>
  )
}

const diffMinusInk = '#b91c1c'

/* ============================================================================
 * SCENE — 'pipeline' (slides 2–10)
 * The full pipeline accretes. Layout:
 *
 *   y 80–180   pipeline row: source → build → registry
 *   y 230      horizontal rollout bus
 *   y 280–460  environments row: dev, staging, production
 *   y 480–620  observability lane (under production)
 * ========================================================================== */
function ScenePipeline({
  slideIndex, visible, highlightSet, status,
}: {
  slideIndex: number
  visible: Set<Ch9ElementId>
  highlightSet: Set<string>
  status: StepStatus
}) {
  const v = (id: Ch9ElementId) => visible.has(id)
  const isHi = (id: string) => highlightSet.has(id)
  const prodState: ProdState = ch9ProdState(slideIndex)

  // Layout constants
  const STAGE_Y = 100, STAGE_H = 80
  const ARROW_Y = STAGE_Y + STAGE_H / 2
  const SOURCE_X = 10,   SOURCE_W = 130
  const BUILD_X = 230,   BUILD_W = 130
  const REGISTRY_X = 450, REGISTRY_W = 140
  const SOURCE_RIGHT = SOURCE_X + SOURCE_W
  const BUILD_RIGHT = BUILD_X + BUILD_W

  const ENV_Y = 320, ENV_H = 90
  const DEV_X = 30, DEV_W = 140
  const STG_X = 210, STG_W = 140
  const PROD_X = 390, PROD_W = 180
  const PROD_Y = 300, PROD_H = 160
  const DEV_CENTER = DEV_X + DEV_W / 2
  const STG_CENTER = STG_X + STG_W / 2
  const PROD_CENTER = PROD_X + PROD_W / 2

  const BUS_Y = 240
  const REGISTRY_BOTTOM_CENTER = REGISTRY_X + REGISTRY_W / 2

  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      {/* ===== PIPELINE ROW ===== */}

      {/* Source — main with green CI */}
      {v('ch9-source-main') && (
        <Stage
          id="ch9-source-main"
          x={SOURCE_X} y={STAGE_Y} w={SOURCE_W} h={STAGE_H}
          eyebrow="Source · GitHub"
          title="main"
          highlighted={isHi('ch9-source-main')}
          status={status}
        >
          <g>
            <circle cx={SOURCE_X + 22} cy={STAGE_Y + 56} r={6} fill={statusPass} />
            <text x={SOURCE_X + 22} y={STAGE_Y + 60} textAnchor="middle" fontSize="9" fontWeight={700} fill={paper} fontFamily={fontUi}>✓</text>
            <text x={SOURCE_X + 36} y={STAGE_Y + 59} fontSize="11" fill={muted} fontFamily={fontUi}>
              CI green
            </text>
          </g>
        </Stage>
      )}

      {/* Build stage */}
      {v('ch9-stage-build') && (
        <Stage
          id="ch9-stage-build"
          x={BUILD_X} y={STAGE_Y} w={BUILD_W} h={STAGE_H}
          eyebrow="Build"
          title="package"
          sublabel="source → artifact"
          highlighted={isHi('ch9-stage-build')}
          status={status}
        />
      )}

      {/* Arrow: source → build */}
      {v('ch9-arrow-build') && (
        <PipelineArrow
          id="ch9-arrow-build"
          x1={SOURCE_RIGHT} x2={BUILD_X} y={ARROW_Y}
          label="build"
          highlighted={isHi('ch9-arrow-build')}
          status={status}
        />
      )}

      {/* Registry stage */}
      {v('ch9-stage-registry') && (
        <Stage
          id="ch9-stage-registry"
          x={REGISTRY_X} y={STAGE_Y} w={REGISTRY_W} h={STAGE_H}
          eyebrow="Registry · GHCR"
          title="container store"
          sublabel="myapp:42a1f2"
          highlighted={isHi('ch9-stage-registry')}
          status={status}
        />
      )}

      {/* Arrow: build → registry (publish) */}
      {v('ch9-arrow-publish') && (
        <PipelineArrow
          id="ch9-arrow-publish"
          x1={BUILD_RIGHT} x2={REGISTRY_X} y={ARROW_Y}
          label="publish"
          highlighted={isHi('ch9-arrow-publish')}
          status={status}
        />
      )}

      {/* Container artifact + callout (slide 3) */}
      {v('ch9-container-artifact') && (
        <motion.g data-region="ch9-container-artifact" variants={diagramReveal}>
          {/* Container chip inside the build stage. */}
          <rect
            x={BUILD_X + 14} y={STAGE_Y + 50} width={BUILD_W - 28} height={20} rx={3}
            fill={accentSoft}
            stroke={isHi('ch9-container-artifact') ? strokeForStatus(status) : accent}
            strokeWidth={isHi('ch9-container-artifact') ? 1.8 : 1.2}
          />
          <text
            x={BUILD_X + BUILD_W / 2} y={STAGE_Y + 64}
            textAnchor="middle" fontSize="10" fontWeight={700} letterSpacing="0.8"
            fill={accent} fontFamily={fontUi}
          >
            CONTAINER · 124 MB
          </text>
        </motion.g>
      )}
      {v('ch9-container-callout') && (
        <motion.g data-region="ch9-container-callout" variants={diagramReveal}>
          {/* Connector from build stage down to callout */}
          <line x1={BUILD_X + BUILD_W / 2} y1={STAGE_Y + STAGE_H} x2={BUILD_X + BUILD_W / 2} y2={210} stroke={muted} strokeDasharray="2 3" strokeWidth={0.8} />
          <Stage x={210} y={210} w={170} h={62} tinted>
            <text x={295} y={228} textAnchor="middle" fontSize="10" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
              WHAT&apos;S IN A CONTAINER
            </text>
            <text x={222} y={246} fontSize="11" fill={ink} fontFamily={fontUi}>· OS pieces</text>
            <text x={300} y={246} fontSize="11" fill={ink} fontFamily={fontUi}>· libraries</text>
            <text x={222} y={262} fontSize="11" fill={ink} fontFamily={fontUi}>· runtime</text>
            <text x={300} y={262} fontSize="11" fill={ink} fontFamily={fontUi}>· your code</text>
          </Stage>
        </motion.g>
      )}

      {/* ===== ROLLOUT BUS ===== */}
      {v('ch9-arrow-pull') && (
        <motion.g data-region="ch9-arrow-pull" variants={diagramReveal}>
          <line x1={REGISTRY_BOTTOM_CENTER} y1={STAGE_Y + STAGE_H} x2={REGISTRY_BOTTOM_CENTER} y2={BUS_Y} stroke={ink} strokeWidth={1.2} />
          <text x={REGISTRY_BOTTOM_CENTER + 10} y={BUS_Y - 10} fontSize="11" fontWeight={500} fill={ink} fontFamily={fontUi}>
            pull image
          </text>
          <line x1={DEV_CENTER} y1={BUS_Y} x2={REGISTRY_BOTTOM_CENTER} y2={BUS_Y} stroke={ink} strokeWidth={1.2} />
        </motion.g>
      )}

      {/* Drops to environments */}
      {v('ch9-arrow-rollout-dev') && (
        <line
          x1={DEV_CENTER} y1={BUS_Y} x2={DEV_CENTER} y2={ENV_Y}
          stroke={isHi('ch9-arrow-rollout-dev') ? strokeForStatus(status) : ink}
          strokeWidth={isHi('ch9-arrow-rollout-dev') ? 1.8 : 1.2}
          markerEnd="url(#ch9-arrow)"
        />
      )}
      {v('ch9-arrow-rollout-staging') && (
        <line
          x1={STG_CENTER} y1={BUS_Y} x2={STG_CENTER} y2={ENV_Y}
          stroke={isHi('ch9-arrow-rollout-staging') ? strokeForStatus(status) : ink}
          strokeWidth={isHi('ch9-arrow-rollout-staging') ? 1.8 : 1.2}
          markerEnd="url(#ch9-arrow)"
        />
      )}
      {v('ch9-arrow-rollout-prod') && (
        <line
          x1={PROD_CENTER} y1={BUS_Y} x2={PROD_CENTER} y2={PROD_Y}
          stroke={isHi('ch9-arrow-rollout-prod') ? strokeForStatus(status) : ink}
          strokeWidth={isHi('ch9-arrow-rollout-prod') ? 1.8 : 1.2}
          markerEnd="url(#ch9-arrow)"
        />
      )}

      {/* ===== ENVIRONMENTS ===== */}
      {v('ch9-target-dev') && (
        <Stage
          id="ch9-target-dev"
          x={DEV_X} y={ENV_Y} w={DEV_W} h={ENV_H}
          eyebrow="Dev"
          title="dev"
          dashed
          highlighted={isHi('ch9-target-dev')}
          status={status}
        >
          <text x={DEV_CENTER} y={ENV_Y + 50} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>fake data</text>
          <text x={DEV_CENTER} y={ENV_Y + 68} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>breakage OK</text>
        </Stage>
      )}
      {v('ch9-target-staging') && (
        <Stage
          id="ch9-target-staging"
          x={STG_X} y={ENV_Y} w={STG_W} h={ENV_H}
          eyebrow="Staging"
          title="staging"
          highlighted={isHi('ch9-target-staging')}
          status={status}
        >
          <text x={STG_CENTER} y={ENV_Y + 50} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>mirrors prod</text>
          <text x={STG_CENTER} y={ENV_Y + 68} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>no real users</text>
        </Stage>
      )}
      {v('ch9-target-production') && (
        <Stage
          id="ch9-target-production"
          x={PROD_X} y={PROD_Y} w={PROD_W} h={PROD_H}
          eyebrow="Production"
          title="production"
          tinted
          highlighted={isHi('ch9-target-production')}
          status={status}
        >
          <ProductionInner
            x={PROD_X} y={PROD_Y} w={PROD_W} h={PROD_H}
            state={prodState}
          />
        </Stage>
      )}

      {/* ===== OBSERVABILITY LANE ===== */}
      {v('ch9-obs-arrow') && (
        <motion.g data-region="ch9-obs-arrow" variants={diagramReveal}>
          <line x1={PROD_CENTER} y1={PROD_Y + PROD_H} x2={PROD_CENTER} y2={490} stroke={ink} strokeWidth={1.2} />
          <text x={PROD_CENTER + 10} y={486} fontSize="10" fill={muted} fontFamily={fontUi}>data flows out</text>
          <line x1={420} y1={490} x2={560} y2={490} stroke={ink} strokeWidth={1.2} />
          <line x1={420} y1={490} x2={420} y2={508} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch9-arrow)" />
          <line x1={490} y1={490} x2={490} y2={508} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch9-arrow)" />
          <line x1={560} y1={490} x2={560} y2={508} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch9-arrow)" />
        </motion.g>
      )}
      {v('ch9-obs-logs') && (
        <Stage id="ch9-obs-logs" x={390} y={510} w={60} h={80} highlighted={isHi('ch9-obs-logs')} status={status}>
          <text x={420} y={530} textAnchor="middle" fontSize="11" fontWeight={600} fill={ink} fontFamily={fontUi}>Logs</text>
          <text x={420} y={550} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi}>Datadog</text>
          <text x={420} y={566} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">what happened</text>
          <text x={420} y={580} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">in order</text>
        </Stage>
      )}
      {v('ch9-obs-metrics') && (
        <Stage id="ch9-obs-metrics" x={460} y={510} w={60} h={80} highlighted={isHi('ch9-obs-metrics')} status={status}>
          <text x={490} y={530} textAnchor="middle" fontSize="11" fontWeight={600} fill={ink} fontFamily={fontUi}>Metrics</text>
          <text x={490} y={550} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi}>Prom.</text>
          <text x={490} y={566} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">how trending</text>
          <text x={490} y={580} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">right now</text>
        </Stage>
      )}
      {v('ch9-obs-errors') && (
        <Stage id="ch9-obs-errors" x={530} y={510} w={60} h={80} highlighted={isHi('ch9-obs-errors')} status={status}>
          <text x={560} y={530} textAnchor="middle" fontSize="11" fontWeight={600} fill={ink} fontFamily={fontUi}>Errors</text>
          <text x={560} y={550} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi}>Sentry</text>
          <text x={560} y={566} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">what crashed</text>
          <text x={560} y={580} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">how often</text>
        </Stage>
      )}
    </motion.g>
  )
}

/** What's drawn inside the production box, depending on which slide we're on. */
function ProductionInner({
  x, y, w, h, state,
}: { x: number; y: number; w: number; h: number; state: ProdState }) {
  const cx = x + w / 2
  const innerY = y + 36
  const innerH = h - 48

  if (state === 'naive') {
    return (
      <g>
        <line x1={x + 10} y1={innerY} x2={x + w - 10} y2={innerY} stroke={hairline} strokeWidth={0.5} />
        <text x={cx} y={innerY + 22} textAnchor="middle" fontSize="11" fontWeight={600} fill={diffMinusInk} fontFamily={fontUi}>
          stop · swap · restart
        </text>
        {/* Three servers, all stopped */}
        <g>
          <rect x={cx - 60} y={innerY + 36} width={36} height={28} fill="rgba(220, 38, 38, 0.10)" stroke={diffMinusInk} strokeWidth={1} rx={3} />
          <text x={cx - 42} y={innerY + 54} textAnchor="middle" fontSize="11" fill={diffMinusInk} fontFamily={fontUi}>✗</text>
          <rect x={cx - 18} y={innerY + 36} width={36} height={28} fill="rgba(220, 38, 38, 0.10)" stroke={diffMinusInk} strokeWidth={1} rx={3} />
          <text x={cx} y={innerY + 54} textAnchor="middle" fontSize="11" fill={diffMinusInk} fontFamily={fontUi}>✗</text>
          <rect x={cx + 24} y={innerY + 36} width={36} height={28} fill="rgba(220, 38, 38, 0.10)" stroke={diffMinusInk} strokeWidth={1} rx={3} />
          <text x={cx + 42} y={innerY + 54} textAnchor="middle" fontSize="11" fill={diffMinusInk} fontFamily={fontUi}>✗</text>
        </g>
        <text x={cx} y={innerY + 86} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi} fontStyle="italic">
          users mid-request see errors
        </text>
        <text x={cx} y={innerY + 102} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi} fontStyle="italic">
          (don&apos;t do it this way)
        </text>
      </g>
    )
  }

  if (state === 'cohort' || state === 'rollback') {
    const isRollback = state === 'rollback'
    const v1Pct = isRollback ? 100 : 95
    const v2Pct = isRollback ? 0 : 5
    const v1FillStroke = isRollback ? statusPass : ink
    const v2FillStroke = isRollback ? muted : accent
    const v1Bg = isRollback ? 'rgba(22, 163, 74, 0.10)' : paper
    const v2Bg = isRollback ? 'rgba(26, 24, 21, 0.025)' : accentSoft
    return (
      <g>
        <line x1={x + 10} y1={innerY} x2={x + w - 10} y2={innerY} stroke={hairline} strokeWidth={0.5} />
        <text x={cx} y={innerY + 18} textAnchor="middle" fontSize="10" fontWeight={600} letterSpacing="1" fill={muted} fontFamily={fontUi}>
          LOAD BALANCER SPLITS TRAFFIC
        </text>
        {/* v1 cohort */}
        <rect x={x + 16} y={innerY + 26} width={(w - 38) / 2} height={70} fill={v1Bg} stroke={v1FillStroke} strokeWidth={isRollback ? 1.4 : 1} rx={4} />
        <text x={x + 16 + (w - 38) / 4} y={innerY + 48} textAnchor="middle" fontSize="13" fontWeight={700} fill={ink} fontFamily={fontUi}>v1</text>
        <text x={x + 16 + (w - 38) / 4} y={innerY + 66} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi}>{isRollback ? 'restored' : 'current'}</text>
        <text x={x + 16 + (w - 38) / 4} y={innerY + 86} textAnchor="middle" fontSize="13" fontWeight={700} fill={ink} fontFamily={fontMono}>{v1Pct}%</text>

        {/* v2 cohort */}
        <rect x={x + 22 + (w - 38) / 2} y={innerY + 26} width={(w - 38) / 2} height={70} fill={v2Bg} stroke={v2FillStroke} strokeWidth={isRollback ? 1 : 1.2} strokeDasharray={isRollback ? '3 3' : undefined} rx={4} />
        <text x={x + 22 + 3 * (w - 38) / 4} y={innerY + 48} textAnchor="middle" fontSize="13" fontWeight={700} fill={isRollback ? muted : accent} fontFamily={fontUi}>v2</text>
        <text x={x + 22 + 3 * (w - 38) / 4} y={innerY + 66} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi}>{isRollback ? 'rolled back' : 'canary'}</text>
        <text x={x + 22 + 3 * (w - 38) / 4} y={innerY + 86} textAnchor="middle" fontSize="13" fontWeight={700} fill={isRollback ? muted : accent} fontFamily={fontMono}>{v2Pct}%</text>

        <text x={cx} y={y + h - 6} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi} fontStyle="italic">
          {isRollback ? 'traffic returned to v1; v2 set aside' : '5% canary expanding if healthy'}
        </text>
      </g>
    )
  }

  // 'fleet' default — three servers, hint to Ch 5 architecture.
  return (
    <g>
      <line x1={x + 10} y1={innerY} x2={x + w - 10} y2={innerY} stroke={hairline} strokeWidth={0.5} />
      <text x={cx} y={innerY + 22} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
        front-end + back-end fleet
      </text>
      <circle cx={cx - 40} cy={innerY + 50} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
      <circle cx={cx}      cy={innerY + 50} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
      <circle cx={cx + 40} cy={innerY + 50} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
      <text x={cx} y={innerY + 82} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">
        (the architecture from Ch 5)
      </text>
    </g>
  )
}

export function Chapter9DiagramSvg({ slideIndex, highlight, highlightStatus }: Props) {
  const scene: Ch9Scene = ch9Scene(slideIndex)
  const visible = visibleCh9Elements(slideIndex)
  const highlightSet = new Set(highlight ?? [])
  const status = highlightStatus ?? 'neutral'

  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <defs>
        <marker id="ch9-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
        </marker>
      </defs>

      {scene === 'gap' && <SceneGap />}
      {scene === 'pipeline' && <ScenePipeline slideIndex={slideIndex} visible={visible} highlightSet={highlightSet} status={status} />}
    </motion.g>
  )
}
