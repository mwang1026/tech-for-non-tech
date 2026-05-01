import { motion } from 'framer-motion'
import type { Ch9ElementId } from './chapter9Elements'
import { visibleCh9Elements } from './chapter9Elements'
import type { StepStatus } from '../../content/types'
import { diagramReveal, staggerChildren } from '../../motion/variants'

type Props = {
  slideIndex: number
  highlight?: string[]
  highlightStatus?: StepStatus
}

/**
 * Chapter 9 diagram — deployment pipeline.
 *
 * Coordinate system: 600 wide × 720 tall.
 *
 * Layout:
 *   y 110–200   pipeline row: source → registry → deploy controller (90px gaps so
 *               arrow labels never clip into the boxes).
 *   y 240       horizontal "rollout bus" — trunk drops from deploy controller, bus
 *               extends left, vertical drops fan down to each environment.
 *   y 300–440   environments: dev / staging / production.
 *   y 460–560   observability lane (s4): logs / metrics / errors. Trunk-and-bus
 *               connector inverts direction (data flows OUT of production).
 *
 * Visual conventions match the Ch 8 diagram. Eyebrows are CENTERED on the box (not
 * left-aligned) so they fit inside their containers regardless of label length.
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

/** Stage card — eyebrow centered above, title centered inside, optional sublabel below title. */
function Stage({
  id, x, y, w, h, eyebrow, title, sublabel, dashed, tinted, highlighted, status, children,
}: {
  id: string
  x: number; y: number; w: number; h: number
  eyebrow?: string
  title: string
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
        <text
          x={x + w / 2}
          y={y - 10}
          textAnchor="middle"
          fontSize="11"
          fontWeight={600}
          letterSpacing="1.4"
          fill={muted}
          fontFamily={fontUi}
        >
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
      <text
        x={x + w / 2}
        y={y + 26}
        textAnchor="middle"
        fontSize="14"
        fontWeight={600}
        fill={ink}
        fontFamily={fontUi}
      >
        {title}
      </text>
      {sublabel && (
        <text
          x={x + w / 2}
          y={y + 44}
          textAnchor="middle"
          fontSize="11"
          fill={muted}
          fontFamily={fontMono}
        >
          {sublabel}
        </text>
      )}
      {children}
    </motion.g>
  )
}

/** Arrow with a verb-style label centered above. */
function PipelineArrow({
  id, x1, x2, y, label, highlighted, status,
}: {
  id: string
  x1: number; x2: number; y: number
  label: string
  highlighted?: boolean
  status?: StepStatus
}) {
  const stroke = highlighted ? strokeForStatus(status) : ink
  const strokeWidth = highlighted ? 1.8 : 1.2
  return (
    <motion.g data-region={id} variants={diagramReveal}>
      <text
        x={(x1 + x2) / 2}
        y={y - 12}
        textAnchor="middle"
        fontSize="11"
        fontWeight={500}
        fill={highlighted ? stroke : ink}
        fontFamily={fontUi}
      >
        {label}
      </text>
      <line
        x1={x1} y1={y} x2={x2} y2={y}
        stroke={stroke} strokeWidth={strokeWidth}
        markerEnd="url(#ch9-arrow)"
      />
    </motion.g>
  )
}

export function Chapter9DiagramSvg({ slideIndex, highlight, highlightStatus }: Props) {
  const visible = visibleCh9Elements(slideIndex)
  const v = (id: Ch9ElementId) => visible.has(id)
  const highlightSet = new Set(highlight ?? [])
  const isHi = (id: string) => highlightSet.has(id)
  const status = highlightStatus ?? 'neutral'

  // ----- Layout constants. Centralized so a layout tweak doesn't require chasing
  // a dozen magic numbers. -----
  const STAGE_Y = 120
  const STAGE_H = 80
  const ARROW_Y = STAGE_Y + STAGE_H / 2  // 160
  const SOURCE_X = 10,    SOURCE_W  = 130
  const REGISTRY_X = 230, REGISTRY_W = 140
  const DEPLOY_X = 460,   DEPLOY_W  = 130
  const SOURCE_RIGHT = SOURCE_X + SOURCE_W       // 140
  const REGISTRY_RIGHT = REGISTRY_X + REGISTRY_W // 370
  const DEPLOY_CENTER = DEPLOY_X + DEPLOY_W / 2  // 525

  const ENV_Y = 320, ENV_H = 80
  const DEV_X = 30,    DEV_W = 140    // center 100
  const STG_X = 210,   STG_W = 140    // center 280
  const PROD_X = 410,  PROD_W = 160   // center 490
  const PROD_Y = 300,  PROD_H = 140
  const DEV_CENTER = DEV_X + DEV_W / 2
  const STG_CENTER = STG_X + STG_W / 2
  const PROD_CENTER = PROD_X + PROD_W / 2

  const BUS_Y = 240   // horizontal rollout bus

  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <defs>
        <marker id="ch9-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
        </marker>
      </defs>

      {/* ============ PIPELINE ROW ============ */}

      {/* Stage 1 — Source · main · CI green (bridge from Ch 8) */}
      {v('ch9-stage-source') && (
        <Stage
          id="ch9-stage-source"
          x={SOURCE_X} y={STAGE_Y} w={SOURCE_W} h={STAGE_H}
          eyebrow="Source · GitHub"
          title="main"
          highlighted={isHi('ch9-stage-source')}
          status={status}
        >
          {/* CI green pill — the handoff from Ch 8 */}
          <g>
            <circle cx={SOURCE_X + 22} cy={172} r={7} fill={statusPass} />
            <text x={SOURCE_X + 22} y={176} textAnchor="middle" fontSize="9" fontWeight={700} fill={paper} fontFamily={fontUi}>
              ✓
            </text>
            <text x={SOURCE_X + 36} y={175} fontSize="11" fill={muted} fontFamily={fontUi}>
              CI green
            </text>
          </g>
        </Stage>
      )}

      {/* Arrow: build & push image */}
      {v('ch9-arrow-build') && (
        <PipelineArrow
          id="ch9-arrow-build"
          x1={SOURCE_RIGHT} x2={REGISTRY_X} y={ARROW_Y}
          label="build & push"
          highlighted={isHi('ch9-arrow-build')}
          status={status}
        />
      )}

      {/* Stage 2 — Container Registry */}
      {v('ch9-stage-registry') && (
        <Stage
          id="ch9-stage-registry"
          x={REGISTRY_X} y={STAGE_Y} w={REGISTRY_W} h={STAGE_H}
          eyebrow="Registry · GHCR"
          title="Container"
          sublabel="your-app:42a1f2"
          highlighted={isHi('ch9-stage-registry')}
          status={status}
        >
          {/* Container artifact chip — the only accent element by default. */}
          {v('ch9-container-artifact') && (
            <g data-region="ch9-container-artifact">
              <rect
                x={REGISTRY_X + 15} y={172} width={REGISTRY_W - 30} height={18} rx={3}
                fill={accentSoft}
                stroke={isHi('ch9-container-artifact') ? strokeForStatus(status) : accent}
                strokeWidth={isHi('ch9-container-artifact') ? 1.8 : 1.2}
              />
              <text x={REGISTRY_X + REGISTRY_W / 2} y={184} textAnchor="middle" fontSize="9" fontWeight={700} letterSpacing="0.8" fill={accent} fontFamily={fontUi}>
                IMAGE · 124 MB
              </text>
            </g>
          )}
        </Stage>
      )}

      {/* Arrow: pull image */}
      {v('ch9-arrow-pull') && (
        <PipelineArrow
          id="ch9-arrow-pull"
          x1={REGISTRY_RIGHT} x2={DEPLOY_X} y={ARROW_Y}
          label="pull image"
          highlighted={isHi('ch9-arrow-pull')}
          status={status}
        />
      )}

      {/* Stage 3 — Deploy Controller */}
      {v('ch9-stage-deploy') && (
        <Stage
          id="ch9-stage-deploy"
          x={DEPLOY_X} y={STAGE_Y} w={DEPLOY_W} h={STAGE_H}
          eyebrow="Deploy · ArgoCD"
          title="Deploy controller"
          highlighted={isHi('ch9-stage-deploy')}
          status={status}
        >
          <line x1={DEPLOY_X + 10} y1={160} x2={DEPLOY_X + DEPLOY_W - 10} y2={160} stroke={hairline} strokeWidth={0.5} />
          <text x={DEPLOY_X + DEPLOY_W / 2} y={180} textAnchor="middle" fontSize="9" fontWeight={500} letterSpacing="1" fill={muted} fontFamily={fontUi}>
            PULL · ROLLOUT · WATCH
          </text>
        </Stage>
      )}

      {/* ============ ROLLOUT TRUNK + BUS + DROPS ============
          Single trunk drops from deploy controller bottom-center to a horizontal
          bus, which extends left to dev. Three vertical drops fan down to each
          environment. No curves crossing eyebrow text. */}

      {(v('ch9-arrow-rollout-dev') || v('ch9-arrow-rollout-staging') || v('ch9-arrow-rollout-prod')) && (
        <motion.g data-region="ch9-arrow-rollout" variants={diagramReveal}>
          {/* Trunk: deploy controller bottom-center → bus */}
          <line x1={DEPLOY_CENTER} y1={STAGE_Y + STAGE_H} x2={DEPLOY_CENTER} y2={BUS_Y} stroke={ink} strokeWidth={1.2} />
          {/* "rollout" label nestled to the right of the trunk */}
          <text x={DEPLOY_CENTER + 10} y={BUS_Y - 10} fontSize="11" fontWeight={500} fill={ink} fontFamily={fontUi}>
            rollout
          </text>
          {/* Horizontal bus: from leftmost drop to deploy center */}
          <line x1={DEV_CENTER} y1={BUS_Y} x2={DEPLOY_CENTER} y2={BUS_Y} stroke={ink} strokeWidth={1.2} />
        </motion.g>
      )}

      {/* Three drops (each addressable individually so highlights can light a single environment) */}
      {v('ch9-arrow-rollout-dev') && (
        <motion.g data-region="ch9-arrow-rollout-dev" variants={diagramReveal}>
          <line
            x1={DEV_CENTER} y1={BUS_Y} x2={DEV_CENTER} y2={ENV_Y}
            stroke={isHi('ch9-arrow-rollout-dev') ? strokeForStatus(status) : ink}
            strokeWidth={isHi('ch9-arrow-rollout-dev') ? 1.8 : 1.2}
            markerEnd="url(#ch9-arrow)"
          />
        </motion.g>
      )}
      {v('ch9-arrow-rollout-staging') && (
        <motion.g data-region="ch9-arrow-rollout-staging" variants={diagramReveal}>
          <line
            x1={STG_CENTER} y1={BUS_Y} x2={STG_CENTER} y2={ENV_Y}
            stroke={isHi('ch9-arrow-rollout-staging') ? strokeForStatus(status) : ink}
            strokeWidth={isHi('ch9-arrow-rollout-staging') ? 1.8 : 1.2}
            markerEnd="url(#ch9-arrow)"
          />
        </motion.g>
      )}
      {v('ch9-arrow-rollout-prod') && (
        <motion.g data-region="ch9-arrow-rollout-prod" variants={diagramReveal}>
          <line
            x1={PROD_CENTER} y1={BUS_Y} x2={PROD_CENTER} y2={PROD_Y}
            stroke={isHi('ch9-arrow-rollout-prod') ? strokeForStatus(status) : ink}
            strokeWidth={isHi('ch9-arrow-rollout-prod') ? 1.8 : 1.2}
            markerEnd="url(#ch9-arrow)"
          />
        </motion.g>
      )}

      {/* ============ ENVIRONMENTS ROW ============ */}

      {/* Dev */}
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
          <text x={DEV_CENTER} y={364} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
            fake data
          </text>
          <text x={DEV_CENTER} y={380} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
            breakage OK
          </text>
        </Stage>
      )}

      {/* Staging */}
      {v('ch9-target-staging') && (
        <Stage
          id="ch9-target-staging"
          x={STG_X} y={ENV_Y} w={STG_W} h={ENV_H}
          eyebrow="Staging"
          title="staging"
          highlighted={isHi('ch9-target-staging')}
          status={status}
        >
          <text x={STG_CENTER} y={364} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
            mirrors prod
          </text>
          <text x={STG_CENTER} y={380} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
            no real users
          </text>
        </Stage>
      )}

      {/* Production — the headline destination */}
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
          <line x1={PROD_X + 10} y1={336} x2={PROD_X + PROD_W - 10} y2={336} stroke={hairline} strokeWidth={0.5} />

          {/* Default state — show the fleet as a hint to Ch 5's architecture diagram. */}
          {!v('ch9-prod-cohort-current') && (
            <g>
              <text x={PROD_CENTER} y={358} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
                front-end + back-end fleet
              </text>
              <circle cx={PROD_CENTER - 40} cy={386} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
              <circle cx={PROD_CENTER}      cy={386} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
              <circle cx={PROD_CENTER + 40} cy={386} r={6} fill={paper} stroke={ink} strokeWidth={1.4} />
              <text x={PROD_CENTER} y={420} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">
                (the architecture from Ch 5)
              </text>
            </g>
          )}

          {/* Deploy strategies state — version cohort split (canary). */}
          {v('ch9-prod-cohort-current') && (
            <g>
              <rect x={PROD_X + 16} y={350} width={(PROD_W - 38) / 2} height={60} rx={4} fill={paper} stroke={ink} strokeWidth={1} />
              <text x={PROD_X + 16 + (PROD_W - 38) / 4} y={372} textAnchor="middle" fontSize="12" fontWeight={600} fill={ink} fontFamily={fontUi}>
                v1
              </text>
              <text x={PROD_X + 16 + (PROD_W - 38) / 4} y={388} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi}>
                current
              </text>
              <text x={PROD_X + 16 + (PROD_W - 38) / 4} y={402} textAnchor="middle" fontSize="10" fontWeight={600} fill={ink} fontFamily={fontMono}>
                95%
              </text>

              <rect x={PROD_X + 22 + (PROD_W - 38) / 2} y={350} width={(PROD_W - 38) / 2} height={60} rx={4} fill={accentSoft} stroke={accent} strokeWidth={1.2} />
              <text x={PROD_X + 22 + 3 * (PROD_W - 38) / 4} y={372} textAnchor="middle" fontSize="12" fontWeight={600} fill={accent} fontFamily={fontUi}>
                v2
              </text>
              <text x={PROD_X + 22 + 3 * (PROD_W - 38) / 4} y={388} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi}>
                canary
              </text>
              <text x={PROD_X + 22 + 3 * (PROD_W - 38) / 4} y={402} textAnchor="middle" fontSize="10" fontWeight={600} fill={accent} fontFamily={fontMono}>
                5%
              </text>

              {v('ch9-prod-traffic-split') && (
                <text x={PROD_CENTER} y={428} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi} fontStyle="italic">
                  load balancer splits traffic
                </text>
              )}
            </g>
          )}
        </Stage>
      )}

      {/* ============ OBSERVABILITY LANE ============
         Below production. Trunk/bus/drops invert the rollout pattern: data flows
         OUT of production into three observability destinations. Boxes 60 wide
         centered under production (production center = 490) with 10px gaps. */}

      {v('ch9-obs-arrow') && (
        <motion.g data-region="ch9-obs-arrow" variants={diagramReveal}>
          {/* Trunk: production bottom-center → obs bus */}
          <line x1={PROD_CENTER} y1={PROD_Y + PROD_H} x2={PROD_CENTER} y2={470} stroke={ink} strokeWidth={1.2} />
          {/* Bus: extends across the three obs box centers */}
          <line x1={420} y1={470} x2={560} y2={470} stroke={ink} strokeWidth={1.2} />
          {/* Drops with arrowheads — boxes start at y=490 */}
          <line x1={420} y1={470} x2={420} y2={488} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch9-arrow)" />
          <line x1={490} y1={470} x2={490} y2={488} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch9-arrow)" />
          <line x1={560} y1={470} x2={560} y2={488} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch9-arrow)" />
        </motion.g>
      )}

      {v('ch9-obs-logs') && (
        <Stage
          id="ch9-obs-logs"
          x={390} y={490} w={60} h={70}
          title="Logs"
          highlighted={isHi('ch9-obs-logs')}
          status={status}
        >
          <text x={420} y={530} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi}>
            Datadog
          </text>
          <text x={420} y={546} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">
            what happened
          </text>
        </Stage>
      )}

      {v('ch9-obs-metrics') && (
        <Stage
          id="ch9-obs-metrics"
          x={460} y={490} w={60} h={70}
          title="Metrics"
          highlighted={isHi('ch9-obs-metrics')}
          status={status}
        >
          <text x={490} y={530} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi}>
            Prometheus
          </text>
          <text x={490} y={546} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">
            how trending
          </text>
        </Stage>
      )}

      {v('ch9-obs-errors') && (
        <Stage
          id="ch9-obs-errors"
          x={530} y={490} w={60} h={70}
          title="Errors"
          highlighted={isHi('ch9-obs-errors')}
          status={status}
        >
          <text x={560} y={530} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi}>
            Sentry
          </text>
          <text x={560} y={546} textAnchor="middle" fontSize="9" fill={muted} fontFamily={fontUi} fontStyle="italic">
            what crashed
          </text>
        </Stage>
      )}
    </motion.g>
  )
}
