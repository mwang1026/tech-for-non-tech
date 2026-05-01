import { motion } from 'framer-motion'
import type { ElementId } from './elements'
import { visibleElements } from './elements'
import type { Level, StepStatus } from '../../content/types'
import { diagramReveal, staggerChildren } from '../../motion/variants'

type Props = {
  chapter: number
  level: Level
  /** Element IDs to highlight on the diagram. Slide step or focus drives this. */
  highlight?: string[]
  /** Tints the highlighted boxes green (pass), red (reject), or accent (neutral). */
  highlightStatus?: StepStatus
}

/**
 * Hand-authored editorial SVG, top-to-bottom flow.
 * Coordinate system: 600 wide × 720 tall.
 *
 * Three text styles per box, distinct from each other:
 *   - PRODUCT eyebrow:  9px UPPERCASE, muted, 1.5px letter-spaced, sits ABOVE the box top edge
 *                       (e.g. "KONG", "CLOUDFLARE", "POSTGRESQL"). The brand attribution.
 *   - COMPONENT label:  12px sentence-case, weight 600, ink, centered in the box upper region
 *                       (e.g. "API Gateway", "Cache", "Primary DB"). The conceptual name.
 *   - ATTRS row:        8px UPPERCASE, muted, 0.6px letter-spaced, in a thin row at the box bottom,
 *                       separated by a hairline divider from the component label
 *                       (e.g. "AUTH · RATE LIMIT · ROUTE"). The capabilities.
 */

const ink = 'var(--ink)'
const muted = 'var(--ink-muted)'
const paper = 'var(--paper)'
const hairline = 'var(--hairline-strong)'
const accent = 'var(--accent)'
const statusPass = 'var(--status-pass)'
const statusReject = 'var(--status-reject)'

/** Stroke color when a box is highlighted, by status. Falls back to accent for 'neutral' / undefined. */
function strokeForStatus(status: StepStatus | undefined): string {
  if (status === 'pass') return statusPass
  if (status === 'reject') return statusReject
  return accent
}

function Box({
  id, x, y, w, h, label, product, attrs, dashed, faded, highlighted, status, onClick,
}: {
  id: string
  x: number; y: number; w: number; h: number
  label: string
  product?: string
  attrs?: string[]
  dashed?: boolean
  faded?: boolean
  highlighted?: boolean
  status?: StepStatus
  onClick?: () => void
}) {
  const opacity = faded ? 0.55 : 1
  const hasAttrs = attrs && attrs.length > 0
  // Where does the label sit? If we have attrs we shift it up so attrs get clean space at the bottom.
  const labelY = hasAttrs ? y + (h - 14) / 2 : y + h / 2 + 4
  const attrsY = y + h - 7
  const dividerY = y + h - 16
  const stroke = highlighted ? strokeForStatus(status) : ink
  const strokeWidth = highlighted ? 1.8 : 1
  const showStatusBadge = highlighted && (status === 'pass' || status === 'reject')

  return (
    <motion.g
      data-region={id}
      variants={diagramReveal}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      opacity={opacity}
    >
      {/* PRODUCT eyebrow — above the box */}
      {product && (
        <text
          x={x + w / 2}
          y={y - 5}
          textAnchor="middle"
          fontSize="8"
          fontWeight={500}
          letterSpacing="1.2"
          fill={muted}
          fontFamily="var(--font-ui)"
        >
          {product.toUpperCase()}
        </text>
      )}

      {/* The box itself */}
      <rect
        x={x} y={y} width={w} height={h}
        fill={paper}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeDasharray={dashed ? '3 3' : undefined}
      />

      {/* COMPONENT label — primary */}
      <text
        x={x + w / 2}
        y={labelY}
        textAnchor="middle"
        fontSize="12"
        fontWeight={600}
        fill={ink}
        fontFamily="var(--font-ui)"
      >
        {label}
      </text>

      {/* ATTRS row — bottom, with hairline divider above */}
      {hasAttrs && (
        <>
          <line
            x1={x + 8}
            y1={dividerY}
            x2={x + w - 8}
            y2={dividerY}
            stroke={hairline}
            strokeWidth={0.5}
          />
          <text
            x={x + w / 2}
            y={attrsY}
            textAnchor="middle"
            fontSize="8"
            fontWeight={500}
            letterSpacing="0.8"
            fill={muted}
            fontFamily="var(--font-ui)"
          >
            {attrs!.map(a => a.toUpperCase()).join('  ·  ')}
          </text>
        </>
      )}

      {/* Status badge — small ✓ or ✗ in the top-right corner of a highlighted box. */}
      {showStatusBadge && (
        <>
          <circle cx={x + w - 8} cy={y + 8} r={7} fill={stroke} />
          <text
            x={x + w - 8}
            y={y + 11}
            textAnchor="middle"
            fontSize="10"
            fontWeight={700}
            fill={paper}
            fontFamily="var(--font-ui)"
          >
            {status === 'pass' ? '✓' : '✗'}
          </text>
        </>
      )}
    </motion.g>
  )
}

function Arrow({ x1, y1, x2, y2, dashed }: { x1: number; y1: number; x2: number; y2: number; dashed?: boolean }) {
  return (
    <line
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={ink} strokeWidth={1}
      strokeDasharray={dashed ? '3 3' : undefined}
      markerEnd="url(#arrow)"
    />
  )
}

export function DiagramSvg({ chapter, level, highlight, highlightStatus }: Props) {
  const visible = visibleElements(chapter, level)
  const v = (id: ElementId) => visible.has(id)

  /** Resolve glossary-style aliases (e.g. 'api-gateway' → 'gateway') so authors can use either name. */
  const resolveAlias = (id: string): string => {
    if (id === 'api-gateway') return 'gateway'
    if (id === 'load-balancer') return 'lb'
    return id
  }
  const highlightSet = new Set((highlight ?? []).map(resolveAlias))
  const isHi = (id: string) => highlightSet.has(id)
  const status = highlightStatus ?? 'neutral'

  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={ink} />
        </marker>
        <marker id="arrow-muted" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M 0 0 L 8 4 L 0 8 z" fill={muted} />
        </marker>
      </defs>

      {/* Region band (301) */}
      {v('region-band') && (
        <g>
          <text x={300} y={20} textAnchor="middle" fontSize="9" fill={muted}
            fontFamily="var(--font-ui)" letterSpacing="0.5">
            REGION · US-EAST-1 / US-WEST-2 (ACTIVE-ACTIVE)
          </text>
          <line x1={20} y1={28} x2={580} y2={28} stroke={hairline} strokeDasharray="4 4" />
        </g>
      )}

      {/* CLIENTS */}
      {v('browser') && (
        <Box id="browser" x={150} y={50} w={120} h={48} label="Browser" highlighted={isHi('browser')} status={status} />
      )}
      {v('mobile') && (
        <Box id="mobile" x={310} y={50} w={120} h={48} label="Mobile App" highlighted={isHi('mobile')} status={status} />
      )}

      {/* Edge: CDN + WAF */}
      {v('cdn') && (
        <Box id="cdn" x={170} y={130} w={260} h={56} label="CDN" product="Cloudflare" highlighted={isHi('cdn')} status={status} />
      )}
      {v('waf') && (
        <Box id="waf" x={440} y={130} w={140} h={56} label="WAF" product="Cloudflare" dashed faded highlighted={isHi('waf')} status={status} />
      )}

      {/* API Gateway with sub-attrs */}
      {v('gateway') && (
        <Box
          id="gateway"
          x={120}
          y={218}
          w={360}
          h={70}
          label="API Gateway"
          product="Kong"
          attrs={['Auth', 'Rate Limit', 'Route']}
          highlighted={isHi('gateway')}
          status={status}
        />
      )}

      {/* Stripe webhook */}
      {v('webhook-stripe') && (
        <g>
          <Box id="webhook-stripe" x={490} y={230} w={90} h={40} label="Stripe" product="webhook" faded highlighted={isHi('webhook-stripe')} status={status} />
          <Arrow x1={490} y1={250} x2={482} y2={250} />
        </g>
      )}

      {/* Load Balancer */}
      {v('lb') && (
        <Box id="lb" x={170} y={320} w={260} h={56} label="Load Balancer" product="Nginx" highlighted={isHi('lb')} status={status} />
      )}

      {/* Server pool — back-end servers. Treated as a single tier; the FE-server tier
          has been collapsed because no narrative in this primer requires it. */}
      {v('be-pool') && (
        <g>
          <rect x={50} y={406} width={500} height={70} fill="none" stroke={hairline} strokeDasharray="3 3" />
          <text x={56} y={400} fontSize="8" fontWeight={500} letterSpacing="1.2" fill={muted} fontFamily="var(--font-ui)">
            SERVER POOL · CONTAINERIZED
          </text>
          {v('be-1') && <Box id="be-1" x={70}  y={418} w={140} h={48} label="Server" highlighted={isHi('be-1') || isHi('be-pool')} status={status} />}
          {v('be-2') && <Box id="be-2" x={230} y={418} w={140} h={48} label="Server" highlighted={isHi('be-2') || isHi('be-pool')} status={status} />}
          {v('be-3') && <Box id="be-3" x={390} y={418} w={140} h={48} label="Server" highlighted={isHi('be-3') || isHi('be-pool')} status={status} />}
          {!v('be-1') && <Box id="be-pool" x={230} y={418} w={140} h={48} label="Server" highlighted={isHi('be-pool')} status={status} />}
        </g>
      )}

      {/* Auxiliary services row — shifted up 90px after FE pool removal. */}
      <g>
        {v('auth-svc') && <Box id="auth-svc" x={50}  y={498} w={140} h={42} label="Auth Service" product="Auth0" highlighted={isHi('auth-svc')} status={status} />}
        {v('cache')    && <Box id="cache"    x={210} y={498} w={140} h={42} label="Cache" product="Redis" highlighted={isHi('cache')} status={status} />}
        {v('queue')    && <Box id="queue"    x={370} y={498} w={140} h={42} label="Queue" product="Kafka" highlighted={isHi('queue')} status={status} />}
      </g>

      {/* Data tier */}
      <g>
        {v('db-primary')   && <Box id="db-primary"   x={50}  y={562} w={180} h={48} label="Primary DB" product="PostgreSQL" highlighted={isHi('db-primary')} status={status} />}
        {v('db-replica-1') && <Box id="db-replica-1" x={250} y={562} w={120} h={48} label="Replica" product="read" dashed faded highlighted={isHi('db-replica-1')} status={status} />}
        {v('db-replica-2') && (
          <text x={310} y={554} fontSize="8" fill={muted} fontFamily="var(--font-ui)" textAnchor="middle">
            replication lag ~10ms
          </text>
        )}
        {v('object-store') && <Box id="object-store" x={390} y={562} w={120} h={48} label="Object Store" product="S3" highlighted={isHi('object-store')} status={status} />}
      </g>

      {/* 301 — Vault & Flags lane */}
      {v('vault') && (
        <Box id="vault" x={50}  y={620} w={140} h={36} label="Secrets" product="Vault" dashed faded />
      )}
      {v('flags') && (
        <Box id="flags" x={210} y={620} w={140} h={36} label="Feature Flags" product="LaunchDarkly" dashed faded />
      )}

      {/* 301 — Observability lane on right side */}
      {v('obs-lane') && (
        <g opacity={0.85}>
          <rect x={530} y={320} width={60} height={310} fill="none" stroke={hairline} strokeDasharray="3 3" />
          <text x={560} y={312} fontSize="8" fontWeight={500} letterSpacing="1.2" fill={muted} fontFamily="var(--font-ui)" textAnchor="middle">
            OBSERVABILITY
          </text>
          {v('obs-logs')    && <Box id="obs-logs"    x={534} y={335} w={52} h={42} label="Logs" product="Datadog" dashed />}
          {v('obs-metrics') && <Box id="obs-metrics" x={534} y={388} w={52} h={42} label="Metrics" product="Prom." dashed />}
          {v('obs-traces')  && <Box id="obs-traces"  x={534} y={443} w={52} h={42} label="Traces" product="Honey" dashed />}
        </g>
      )}

      {/* Connectors (request flow).
          We draw between adjacent VISIBLE elements — when an intermediate layer (cdn / gateway / lb) is hidden,
          the chain skips down to the next visible element rather than leaving floating boxes. */}
      <g>
        {/* Browser → CDN (when CDN exists) */}
        {v('cdn') && (
          <>
            <Arrow x1={210} y1={98} x2={250} y2={130} />
            {v('mobile') && <Arrow x1={370} y1={98} x2={350} y2={130} />}
          </>
        )}
        {/* Browser → server pool DIRECT (when no CDN and no LB — chapters 1-4 at 101) */}
        {v('browser') && !v('cdn') && !v('lb') && <Arrow x1={210} y1={98} x2={295} y2={418} />}

        {/* CDN → Gateway (when both exist) */}
        {v('cdn') && v('gateway') && <Arrow x1={300} y1={186} x2={300} y2={218} />}
        {/* CDN → LB DIRECT (when CDN exists but gateway is hidden — Ch 6 at 101) */}
        {v('cdn') && !v('gateway') && v('lb') && <Arrow x1={300} y1={186} x2={300} y2={320} />}

        {/* Gateway → LB */}
        {v('gateway') && v('lb') && <Arrow x1={300} y1={288} x2={300} y2={320} />}

        {/* LB → server pool: fan out to each individual server when visible (Ch 5+),
            otherwise a single arrow into the placeholder (Ch 1-4). */}
        {v('lb') && v('be-1') && (
          <g opacity={0.7}>
            <line x1={300} y1={376} x2={140} y2={406} stroke={ink} strokeWidth={0.9} markerEnd="url(#arrow)" />
            <line x1={300} y1={376} x2={300} y2={406} stroke={ink} strokeWidth={0.9} markerEnd="url(#arrow)" />
            <line x1={300} y1={376} x2={460} y2={406} stroke={ink} strokeWidth={0.9} markerEnd="url(#arrow)" />
          </g>
        )}
        {v('lb') && !v('be-1') && <Arrow x1={300} y1={376} x2={300} y2={406} />}

        {/* server pool → aux services. When individual servers are visible, every server
            fans to each aux service. Subtle styling so 3 fans of 3 lines don't overwhelm.
            Fallback to single arrow when only the be-pool placeholder is visible. */}
        {v('cache') && (
          v('be-1') ? (
            <g opacity={0.55}>
              <line x1={140} y1={466} x2={280} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
              <line x1={300} y1={466} x2={280} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
              <line x1={460} y1={466} x2={280} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
            </g>
          ) : (
            <Arrow x1={290} y1={466} x2={280} y2={498} />
          )
        )}
        {v('queue') && (
          v('be-1') ? (
            <g opacity={0.55}>
              <line x1={140} y1={466} x2={440} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
              <line x1={300} y1={466} x2={440} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
              <line x1={460} y1={466} x2={440} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
            </g>
          ) : (
            <Arrow x1={310} y1={466} x2={440} y2={498} />
          )
        )}
        {v('auth-svc') && (
          v('be-1') ? (
            <g opacity={0.55}>
              <line x1={140} y1={466} x2={120} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
              <line x1={300} y1={466} x2={120} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
              <line x1={460} y1={466} x2={120} y2={498} stroke={ink} strokeWidth={0.8} markerEnd="url(#arrow)" />
            </g>
          ) : (
            <Arrow x1={270} y1={466} x2={120} y2={498} />
          )
        )}

        {/* Cache → DB (cache passes through to db when present) */}
        {v('cache')        && v('db-primary') && <Arrow x1={280} y1={540} x2={180} y2={562} />}
        {/* server pool → DB DIRECT (when no cache row at all) */}
        {!v('cache') && v('db-primary') && <Arrow x1={290} y1={466} x2={140} y2={562} />}

        {/* aux → object store */}
        {v('object-store') && <Arrow x1={310} y1={540} x2={420} y2={562} />}

        {v('obs-lane') && (
          <g opacity={0.5}>
            <line x1={440} y1={452} x2={534} y2={355} stroke={muted} strokeWidth={1} strokeDasharray="2 3" markerEnd="url(#arrow-muted)" />
            <line x1={440} y1={452} x2={534} y2={408} stroke={muted} strokeWidth={1} strokeDasharray="2 3" markerEnd="url(#arrow-muted)" />
            <line x1={440} y1={452} x2={534} y2={463} stroke={muted} strokeWidth={1} strokeDasharray="2 3" markerEnd="url(#arrow-muted)" />
          </g>
        )}
      </g>
    </motion.g>
  )
}
