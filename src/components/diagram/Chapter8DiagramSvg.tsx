import { motion } from 'framer-motion'
import type { Ch8ElementId } from './chapter8Elements'
import { visibleCh8Elements } from './chapter8Elements'
import type { StepStatus } from '../../content/types'
import { diagramReveal, staggerChildren } from '../../motion/variants'

type Props = {
  slideIndex: number
  highlight?: string[]
  highlightStatus?: StepStatus
}

/**
 * Chapter 8 diagram — code-lifecycle visual.
 *
 * Coordinate system: 600 wide × 720 tall.
 * Layout:
 *   y  60–340  — laptop (local) on the left, GitHub (remote) on the right, sync arrows between
 *   y 360–520  — branch graph
 *   y 540–700  — worktree pair sharing one .git
 *
 * Visual conventions (informed by Atlassian, Pro Git, w3schools tutorials and the project's
 * existing architecture diagram): horizontal local↔remote split with verb-labeled sync
 * arrows; subtle background tints to group local vs. remote; commit dots on a horizontal
 * branch graph; folder names in monospace, prose labels in UI font.
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

/** Container with a soft tinted backdrop + outlined frame and an eyebrow + title. */
function Card({
  id, x, y, w, h, eyebrow, title, tinted, highlighted, status, children,
}: {
  id: string
  x: number; y: number; w: number; h: number
  eyebrow?: string
  title?: string
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
          x={x + 2}
          y={y - 10}
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
        rx={6}
      />
      {title && (
        <text
          x={x + 16}
          y={y + 28}
          fontSize="15"
          fontWeight={600}
          fill={ink}
          fontFamily={fontMono}
        >
          {title}
        </text>
      )}
      {children}
    </motion.g>
  )
}

/** A line of the file tree inside the laptop. */
function FileLine({
  x, y, label, comment, highlighted, status,
}: {
  x: number; y: number; label: string; comment?: string;
  highlighted?: boolean; status?: StepStatus
}) {
  const fill = highlighted ? strokeForStatus(status) : ink
  const fontWeight = highlighted ? 600 : 400
  return (
    <g>
      <text
        x={x}
        y={y}
        fontSize="14"
        fontWeight={fontWeight}
        fill={fill}
        fontFamily={fontMono}
      >
        {label}
      </text>
      {comment && (
        <text
          x={x + 130}
          y={y}
          fontSize="11"
          fill={muted}
          fontFamily={fontUi}
          fontStyle="italic"
        >
          {comment}
        </text>
      )}
    </g>
  )
}

/** Sync arrow between the laptop and GitHub. Label sits ABOVE the arrow line, never overlapping it. */
function SyncArrow({
  id, y, direction, label, sublabel, highlighted, status,
}: {
  id: string
  y: number
  direction: 'right' | 'left'
  label: string
  sublabel?: string
  highlighted?: boolean
  status?: StepStatus
}) {
  // Laptop right edge ~ x=250; GitHub left edge ~ x=360. 110px gap; labels breathe.
  const x1 = direction === 'right' ? 250 : 360
  const x2 = direction === 'right' ? 360 : 250
  const stroke = highlighted ? strokeForStatus(status) : ink
  const strokeWidth = highlighted ? 1.8 : 1.2
  const markerId = direction === 'right' ? 'ch8-arrow-r' : 'ch8-arrow-l'
  return (
    <motion.g data-region={id} variants={diagramReveal}>
      {/* Label sits above the arrow line so they never overlap. */}
      <text
        x={305}
        y={y - 18}
        textAnchor="middle"
        fontSize="14"
        fontWeight={700}
        fill={highlighted ? stroke : ink}
        fontFamily={fontMono}
      >
        {label}
      </text>
      {sublabel && (
        <text
          x={305}
          y={y - 4}
          textAnchor="middle"
          fontSize="11"
          fill={muted}
          fontFamily={fontUi}
        >
          {sublabel}
        </text>
      )}
      <line
        x1={x1} y1={y + 8} x2={x2} y2={y + 8}
        stroke={stroke} strokeWidth={strokeWidth}
        markerEnd={`url(#${markerId})`}
      />
    </motion.g>
  )
}

/** A commit dot on the branch graph. */
function CommitDot({
  cx, cy, label, filled = false, highlighted, status,
}: {
  cx: number; cy: number; label?: string; filled?: boolean
  highlighted?: boolean; status?: StepStatus
}) {
  const stroke = highlighted ? strokeForStatus(status) : ink
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={filled ? stroke : paper} stroke={stroke} strokeWidth={1.6} />
      {label && (
        <text x={cx} y={cy + 26} textAnchor="middle" fontSize="13" fontFamily={fontMono} fontWeight={500} fill={muted}>
          {label}
        </text>
      )}
    </g>
  )
}

export function Chapter8DiagramSvg({ slideIndex, highlight, highlightStatus }: Props) {
  const visible = visibleCh8Elements(slideIndex)
  const v = (id: Ch8ElementId) => visible.has(id)
  const highlightSet = new Set(highlight ?? [])
  const isHi = (id: string) => highlightSet.has(id)
  const status = highlightStatus ?? 'neutral'

  // Y positions for file lines accrete from the top down. .git appears first when visible.
  const fileLineY = (idx: number) => 88 + idx * 28

  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <defs>
        <marker id="ch8-arrow-r" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
        </marker>
        <marker id="ch8-arrow-l" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
        </marker>
      </defs>

      {/* ============ LAPTOP / LOCAL ============ */}
      {v('ch8-laptop') && (
        <Card
          id="ch8-laptop"
          x={10} y={62} w={240} h={290}
          eyebrow="Local · your laptop"
          title="your-repo/"
          tinted
          highlighted={isHi('ch8-laptop')}
          status={status}
        />
      )}

      {/* File tree inside the laptop */}
      {v('ch8-folder-name') && (
        <>
          {(() => {
            const lines: { key: Ch8ElementId; label: string; comment?: string }[] = []
            if (v('ch8-git-folder')) lines.push({ key: 'ch8-git-folder', label: '.git/', comment: '← history' })
            lines.push({ key: 'ch8-src-folder', label: 'src/' })
            lines.push({ key: 'ch8-package-json', label: 'package.json' })
            lines.push({ key: 'ch8-readme', label: 'README.md' })
            return lines.map((line, i) => (
              <FileLine
                key={line.key}
                x={32}
                y={fileLineY(i + 2)}
                label={line.label}
                comment={line.comment}
                highlighted={isHi(line.key)}
                status={status}
              />
            ))
          })()}
        </>
      )}

      {/* Claude badge inside the laptop */}
      {v('ch8-claude-badge') && (
        <motion.g data-region="ch8-claude-badge" variants={diagramReveal}>
          <rect x={26} y={296} width={208} height={44} rx={4} fill={accentSoft} stroke={accent} strokeWidth={1.2} />
          <text x={40} y={316} fontSize="14" fontWeight={700} fill={accent} fontFamily={fontUi}>
            Claude Code
          </text>
          <text x={40} y={332} fontSize="11" fill={muted} fontFamily={fontUi}>
            edits the files in this folder
          </text>
        </motion.g>
      )}

      {/* ============ GITHUB / REMOTE ============ */}
      {v('ch8-github') && (
        <Card
          id="ch8-github"
          x={360} y={62} w={230} h={290}
          eyebrow="Remote · GitHub"
          title="your-org/your-repo"
          tinted
          highlighted={isHi('ch8-github')}
          status={status}
        />
      )}
      {v('ch8-github') && (
        <>
          <text x={376} y={120} fontSize="13" fill={muted} fontFamily={fontUi}>
            same files,
          </text>
          <text x={376} y={138} fontSize="13" fill={muted} fontFamily={fontUi}>
            same history
          </text>
        </>
      )}

      {/* PR badge on the remote */}
      {v('ch8-pr-badge') && (
        <motion.g data-region="ch8-pr-badge" variants={diagramReveal}>
          <rect x={376} y={170} width={198} height={48} rx={4} fill={paper} stroke={ink} strokeWidth={1.2} />
          <text x={392} y={192} fontSize="14" fontWeight={700} fill={ink} fontFamily={fontUi}>
            PR #142
          </text>
          <text x={392} y={210} fontSize="11" fill={muted} fontFamily={fontUi}>
            open · awaiting review
          </text>
        </motion.g>
      )}

      {/* CI badge on the remote */}
      {v('ch8-ci-badge') && (
        <motion.g data-region="ch8-ci-badge" variants={diagramReveal}>
          <rect x={376} y={234} width={198} height={48} rx={4} fill={paper} stroke={statusPass} strokeWidth={1.6} />
          <circle cx={394} cy={258} r={10} fill={statusPass} />
          <text x={394} y={262} textAnchor="middle" fontSize="12" fontWeight={700} fill={paper} fontFamily={fontUi}>
            ✓
          </text>
          <text x={414} y={254} fontSize="14" fontWeight={700} fill={ink} fontFamily={fontUi}>
            CI green
          </text>
          <text x={414} y={272} fontSize="11" fill={muted} fontFamily={fontUi}>
            142 tests passed
          </text>
        </motion.g>
      )}

      {/* ============ SYNC ARROWS ============
         Arrow zone: x=250 (laptop right edge) → x=360 (github left edge) = 110px wide.
         Labels centered at x=305, sit ABOVE the line so they never overlap. */}
      {v('ch8-arrow-clone') && (
        <SyncArrow
          id="ch8-arrow-clone"
          y={150}
          direction="left"
          label="git clone"
          sublabel="(initial copy)"
          highlighted={isHi('ch8-arrow-clone')}
          status={status}
        />
      )}
      {v('ch8-arrow-pull') && (
        <SyncArrow
          id="ch8-arrow-pull"
          y={222}
          direction="left"
          label="git pull"
          sublabel="(updates)"
          highlighted={isHi('ch8-arrow-pull')}
          status={status}
        />
      )}
      {v('ch8-arrow-push') && (
        <SyncArrow
          id="ch8-arrow-push"
          y={294}
          direction="right"
          label="git push"
          sublabel="(send your work)"
          highlighted={isHi('ch8-arrow-push')}
          status={status}
        />
      )}

      {/* ============ BRANCH GRAPH ============ */}
      {v('ch8-branches-frame') && (
        <motion.g data-region="ch8-branches-frame" variants={diagramReveal}>
          <line x1={10} y1={376} x2={590} y2={376} stroke={ink} strokeWidth={1.2} />
          <rect x={10} y={376} width={170} height={26} fill={paper} />
          <text x={10} y={394} fontSize="13" fontWeight={700} letterSpacing="1.6" fill={ink} fontFamily={fontUi}>
            BRANCHES
          </text>
          <text x={120} y={394} fontSize="12" fill={muted} fontFamily={fontUi} fontStyle="italic">
            how parallel work flows
          </text>
        </motion.g>
      )}

      {/* main branch line + dots */}
      {v('ch8-branch-main') && (
        <motion.g data-region="ch8-branch-main" variants={diagramReveal}>
          <text x={20} y={426} fontSize="13" fontWeight={600} fill={ink} fontFamily={fontMono}>main</text>
          <line x1={90} y1={420} x2={520} y2={420} stroke={ink} strokeWidth={1.6} />
          <CommitDot cx={130} cy={420} label="A" />
          <CommitDot cx={210} cy={420} label="B" />
          <CommitDot cx={290} cy={420} label="C" />
        </motion.g>
      )}

      {/* feature branch curve */}
      {v('ch8-branch-feature') && (
        <motion.g data-region="ch8-branch-feature" variants={diagramReveal}>
          <text x={20} y={494} fontSize="13" fontWeight={600} fill={muted} fontFamily={fontMono}>feature</text>
          <path
            d="M 290 420 Q 320 420 340 480 L 420 480 Q 460 480 480 420"
            fill="none" stroke={ink} strokeWidth={1.2}
          />
          <CommitDot cx={365} cy={480} label="D" />
          <CommitDot cx={425} cy={480} label="E" />
        </motion.g>
      )}

      {/* merge commit M */}
      {v('ch8-merge-commit') && (
        <motion.g data-region="ch8-merge-commit" variants={diagramReveal}>
          <CommitDot
            cx={480} cy={420}
            label="M (merge)"
            filled
            highlighted={isHi('ch8-merge-commit')}
            status={status}
          />
        </motion.g>
      )}

      {/* ============ WORKTREE PAIR ============ */}
      {v('ch8-worktree-frame') && (
        <motion.g data-region="ch8-worktree-frame" variants={diagramReveal}>
          <line x1={10} y1={550} x2={590} y2={550} stroke={ink} strokeWidth={1.2} />
          <rect x={10} y={550} width={290} height={26} fill={paper} />
          <text x={10} y={568} fontSize="13" fontWeight={700} letterSpacing="1.6" fill={ink} fontFamily={fontUi}>
            WORKTREE
          </text>
          <text x={114} y={568} fontSize="12" fill={muted} fontFamily={fontUi} fontStyle="italic">
            two folders, one history
          </text>
        </motion.g>
      )}
      {v('ch8-worktree-a') && (
        <Card
          id="ch8-worktree-a"
          x={30} y={588} w={252} h={86}
          title="your-repo/"
          highlighted={isHi('ch8-worktree-a')}
          status={status}
        >
          <text x={46} y={640} fontSize="13" fill={muted} fontFamily={fontMono}>branch: main</text>
          <text x={46} y={662} fontSize="11" fill={muted} fontFamily={fontUi} fontStyle="italic">agent A works here</text>
        </Card>
      )}
      {v('ch8-worktree-b') && (
        <Card
          id="ch8-worktree-b"
          x={318} y={588} w={252} h={86}
          title="your-repo-fix/"
          highlighted={isHi('ch8-worktree-b')}
          status={status}
        >
          <text x={334} y={640} fontSize="13" fill={muted} fontFamily={fontMono}>branch: fix-payments</text>
          <text x={334} y={662} fontSize="11" fill={muted} fontFamily={fontUi} fontStyle="italic">agent B works here</text>
        </Card>
      )}
      {v('ch8-worktree-shared-git') && (
        <motion.g data-region="ch8-worktree-shared-git" variants={diagramReveal}>
          {/* Inverted T: a single horizontal bar joining both worktrees, then one
              vertical drop into the shared .git box. Reads as "two folders, one history". */}
          <line x1={156} y1={682} x2={444} y2={682} stroke={ink} strokeWidth={1.2} />
          <line x1={156} y1={674} x2={156} y2={682} stroke={ink} strokeWidth={1.2} />
          <line x1={444} y1={674} x2={444} y2={682} stroke={ink} strokeWidth={1.2} />
          <line x1={300} y1={682} x2={300} y2={690} stroke={ink} strokeWidth={1.2} />
          <rect x={252} y={690} width={96} height={24} rx={3} fill={paper} stroke={ink} strokeWidth={1.2} />
          <text x={300} y={707} textAnchor="middle" fontSize="13" fontWeight={600} fill={ink} fontFamily={fontMono}>
            shared .git
          </text>
        </motion.g>
      )}
    </motion.g>
  )
}
