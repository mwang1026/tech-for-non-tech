import { motion } from 'framer-motion'
import type { Ch8ElementId, Ch8Scene } from './chapter8Elements'
import { ch8Scene, visibleCh8Elements } from './chapter8Elements'
import type { StepStatus } from '../../content/types'
import { diagramReveal, staggerChildren } from '../../motion/variants'

type Props = {
  slideIndex: number
  highlight?: string[]
  highlightStatus?: StepStatus
}

/**
 * Chapter 8 diagram — the 13-slide journey of one change (`sunColor = "yellow"`
 * → `"orange"`) from edited text to merged commit.
 *
 * The diagram switches between five scenes:
 *   change          (slide 1)   — the literal yellow → orange diff
 *   text-runtime    (slide 2)   — text file → compiler/runtime → running program
 *   organization    (slide 3)   — file tree + zoomed file (function/class/module/package)
 *   spine           (slides 4–7, 10–13) — accreting laptop / GitHub / branches / PR / CI
 *   merge-conflict  (slide 9)   — two branches, competing edits to the same line
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

// Diff colors used in slide 1 / slide 8 / slide 9.
const diffMinusBg = 'rgba(220, 38, 38, 0.10)'
const diffMinusInk = '#b91c1c'
const diffPlusBg = 'rgba(22, 163, 74, 0.10)'
const diffPlusInk = '#15803d'

function strokeForStatus(status: StepStatus | undefined): string {
  if (status === 'pass') return statusPass
  if (status === 'reject') return statusReject
  return accent
}

/** Generic outlined card with optional eyebrow and title. */
function Card({
  id, x, y, w, h, eyebrow, title, tinted, dashed, highlighted, status, children,
}: {
  id?: string
  x: number; y: number; w: number; h: number
  eyebrow?: string
  title?: string
  tinted?: boolean
  dashed?: boolean
  highlighted?: boolean
  status?: StepStatus
  children?: React.ReactNode
}) {
  const stroke = highlighted ? strokeForStatus(status) : ink
  const strokeWidth = highlighted ? 1.8 : 1.1
  return (
    <motion.g data-region={id} variants={diagramReveal}>
      {eyebrow && (
        <text x={x + 2} y={y - 10} fontSize="11" fontWeight={600} letterSpacing="1.4" fill={muted} fontFamily={fontUi}>
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
        <text x={x + 16} y={y + 26} fontSize="14" fontWeight={600} fill={ink} fontFamily={fontMono}>
          {title}
        </text>
      )}
      {children}
    </motion.g>
  )
}

/** A single line of monospace text — used in file trees and diffs. */
function MonoLine({
  x, y, text, fill = ink, weight = 400, size = 13,
}: {
  x: number; y: number; text: string
  fill?: string; weight?: number; size?: number
}) {
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={fill} fontFamily={fontMono}>
      {text}
    </text>
  )
}

/** A diff row: left gutter `+`/`-`, tinted background, monospace content. */
function DiffRow({
  x, y, w, sign, text, h = 22,
}: {
  x: number; y: number; w: number
  sign: '+' | '-'
  text: string
  h?: number
}) {
  const bg = sign === '-' ? diffMinusBg : diffPlusBg
  const fg = sign === '-' ? diffMinusInk : diffPlusInk
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={bg} />
      <text x={x + 10} y={y + 16} fontSize="13" fontWeight={700} fill={fg} fontFamily={fontMono}>
        {sign}
      </text>
      <text x={x + 28} y={y + 16} fontSize="13" fontFamily={fontMono} fill={ink}>
        {text}
      </text>
    </g>
  )
}

/** A commit dot on a branch graph. Filled = merge commit. */
function CommitDot({
  cx, cy, label, sublabel, filled = false, accentRing = false, highlighted, status,
}: {
  cx: number; cy: number
  label?: string
  sublabel?: string
  filled?: boolean
  accentRing?: boolean
  highlighted?: boolean
  status?: StepStatus
}) {
  const stroke = highlighted ? strokeForStatus(status) : (accentRing ? accent : ink)
  const fill = filled ? stroke : paper
  return (
    <g>
      <circle cx={cx} cy={cy} r={7} fill={fill} stroke={stroke} strokeWidth={accentRing ? 2 : 1.6} />
      {label && (
        <text x={cx} y={cy + 26} textAnchor="middle" fontSize="13" fontFamily={fontMono} fontWeight={500} fill={muted}>
          {label}
        </text>
      )}
      {sublabel && (
        <text x={cx} y={cy + 42} textAnchor="middle" fontSize="10" fontFamily={fontUi} fill={muted}>
          {sublabel}
        </text>
      )}
    </g>
  )
}

/* ============================================================================
 * SCENE 1 — 'change' (slide 1)
 * The literal yellow → orange diff, large, framed as the artifact we're tracking.
 * ========================================================================== */
function SceneChange() {
  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <text x={300} y={70} textAnchor="middle" fontSize="13" fontWeight={700} letterSpacing="2" fill={muted} fontFamily={fontUi}>
        THE CHANGE WE&apos;RE MAKING
      </text>

      {/* File frame */}
      <Card x={70} y={120} w={460} h={300} tinted>
        <text x={86} y={148} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
          FILE
        </text>
        <MonoLine x={86} y={172} text="src/components/Hero.tsx" weight={600} size={14} />
        <line x1={86} y1={186} x2={514} y2={186} stroke={hairline} strokeWidth={0.8} />

        {/* Diff rows */}
        <text x={86} y={216} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
          DIFF · 2 LINES
        </text>
        <DiffRow x={86} y={232} w={428} sign="-" text={'  sunColor = "yellow"'} />
        <DiffRow x={86} y={258} w={428} sign="+" text={'  sunColor = "orange"'} />

        {/* Caption */}
        <text x={86} y={310} fontSize="13" fill={ink} fontFamily={fontUi}>
          Six characters changed.
        </text>
        <text x={86} y={332} fontSize="13" fill={muted} fontFamily={fontUi}>
          One file edited.
        </text>
        <text x={86} y={354} fontSize="13" fill={muted} fontFamily={fontUi}>
          Thirteen slides to make it real.
        </text>
        <text x={86} y={394} fontSize="11" fontStyle="italic" fill={muted} fontFamily={fontUi}>
          (every change to every product, big or small, takes the same path)
        </text>
      </Card>
    </motion.g>
  )
}

/* ============================================================================
 * SCENE 2 — 'text-runtime' (slide 2)
 * Text file → (compiler | runtime) → running program. Two parallel paths.
 * ========================================================================== */
function SceneTextRuntime() {
  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <text x={300} y={70} textAnchor="middle" fontSize="13" fontWeight={700} letterSpacing="2" fill={muted} fontFamily={fontUi}>
        FROM TEXT TO RUNNING
      </text>

      {/* Left — text file */}
      <Card x={40} y={120} w={150} h={140} tinted>
        <text x={56} y={146} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
          TEXT FILE
        </text>
        <MonoLine x={56} y={174} text="Hero.tsx" weight={600} size={14} />
        <MonoLine x={56} y={196} text="theme.ts" size={12} fill={muted} />
        <MonoLine x={56} y={216} text="App.tsx" size={12} fill={muted} />
        <text x={56} y={246} fontSize="11" fontStyle="italic" fill={muted} fontFamily={fontUi}>
          what people edit
        </text>
      </Card>

      {/* Middle — two parallel paths */}
      <g>
        {/* Compiled path */}
        <Card x={220} y={110} w={170} h={70} dashed>
          <text x={305} y={136} textAnchor="middle" fontSize="13" fontWeight={600} fill={ink} fontFamily={fontUi}>
            Compiler
          </text>
          <text x={305} y={156} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
            ahead of time
          </text>
          <text x={305} y={172} textAnchor="middle" fontSize="10" fontStyle="italic" fill={muted} fontFamily={fontUi}>
            Go · Rust · Java
          </text>
        </Card>
        {/* Interpreted path */}
        <Card x={220} y={200} w={170} h={70} dashed>
          <text x={305} y={226} textAnchor="middle" fontSize="13" fontWeight={600} fill={ink} fontFamily={fontUi}>
            Interpreter / Runtime
          </text>
          <text x={305} y={246} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
            on the fly
          </text>
          <text x={305} y={262} textAnchor="middle" fontSize="10" fontStyle="italic" fill={muted} fontFamily={fontUi}>
            Python · Ruby · JS via Node
          </text>
        </Card>

        {/* Arrows from text file into both paths */}
        <line x1={190} y1={170} x2={220} y2={145} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch8-arrow)" />
        <line x1={190} y1={210} x2={220} y2={235} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch8-arrow)" />
      </g>

      {/* Right — running program */}
      <Card x={420} y={155} w={150} h={70} tinted>
        <text x={495} y={181} textAnchor="middle" fontSize="13" fontWeight={600} fill={ink} fontFamily={fontUi}>
          Running program
        </text>
        <text x={495} y={199} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
          machine instructions
        </text>
        <text x={495} y={215} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
          executing
        </text>
      </Card>

      {/* Arrows from both paths into running program */}
      <line x1={390} y1={145} x2={420} y2={175} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch8-arrow)" />
      <line x1={390} y1={235} x2={420} y2={205} stroke={ink} strokeWidth={1.2} markerEnd="url(#ch8-arrow)" />

      {/* Footnote */}
      <text x={300} y={320} textAnchor="middle" fontSize="12" fontStyle="italic" fill={muted} fontFamily={fontUi}>
        Either way, the source the developer edits is text.
      </text>
      <text x={300} y={340} textAnchor="middle" fontSize="12" fontStyle="italic" fill={muted} fontFamily={fontUi}>
        Editing is the same job in any language.
      </text>
    </motion.g>
  )
}

/* ============================================================================
 * SCENE 3 — 'organization' (slide 3)
 * File tree on the left; zoomed file on the right naming the smaller scales.
 * ========================================================================== */
function SceneOrganization() {
  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <text x={300} y={70} textAnchor="middle" fontSize="13" fontWeight={700} letterSpacing="2" fill={muted} fontFamily={fontUi}>
        HOW A CODEBASE IS ORGANIZED
      </text>

      {/* Left — file tree */}
      <Card x={30} y={110} w={250} h={420} tinted>
        <text x={46} y={138} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
          PACKAGE
        </text>
        <MonoLine x={46} y={162} text="your-repo/" weight={600} size={14} />

        <MonoLine x={62} y={194} text="src/" fill={muted} />
        <text x={170} y={194} fontSize="10" fill={muted} fontFamily={fontUi} fontStyle="italic">
          ← folder
        </text>
        <MonoLine x={78} y={216} text="components/" fill={muted} />
        <MonoLine x={94} y={238} text="Hero.tsx" weight={600} fill={accent} />
        <text x={210} y={238} fontSize="10" fill={accent} fontFamily={fontUi} fontStyle="italic">
          ← file
        </text>
        <MonoLine x={94} y={260} text="Header.tsx" fill={muted} />
        <MonoLine x={94} y={282} text="Footer.tsx" fill={muted} />
        <MonoLine x={78} y={304} text="theme.ts" fill={muted} />
        <MonoLine x={78} y={326} text="App.tsx" fill={muted} />
        <MonoLine x={62} y={350} text="package.json" fill={muted} />
        <MonoLine x={62} y={372} text="README.md" fill={muted} />

        <line x1={46} y1={400} x2={264} y2={400} stroke={hairline} strokeWidth={0.8} />
        <text x={46} y={426} fontSize="11" fill={muted} fontFamily={fontUi}>
          Folders group files by purpose.
        </text>
        <text x={46} y={446} fontSize="11" fill={muted} fontFamily={fontUi}>
          The package is the whole tree,
        </text>
        <text x={46} y={462} fontSize="11" fill={muted} fontFamily={fontUi}>
          named in package.json.
        </text>
      </Card>

      {/* Arrow from tree to zoomed file */}
      <line x1={282} y1={238} x2={310} y2={238} stroke={muted} strokeWidth={1} strokeDasharray="3 3" markerEnd="url(#ch8-arrow-muted)" />

      {/* Right — zoomed file */}
      <Card x={310} y={110} w={260} h={420}>
        <text x={326} y={138} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
          INSIDE Hero.tsx
        </text>

        {/* module label */}
        <text x={326} y={166} fontSize="10" fill={muted} fontFamily={fontUi} fontStyle="italic">
          ← module · what this file exports
        </text>
        <MonoLine x={326} y={188} text='import { theme } from "../theme"' size={11} fill={muted} />

        <MonoLine x={326} y={222} text="export class Hero {" weight={600} size={13} />
        <text x={460} y={222} fontSize="10" fill={accent} fontFamily={fontUi} fontStyle="italic">
          ← class
        </text>
        <MonoLine x={342} y={244} text="render() {" size={12} />
        <text x={425} y={244} fontSize="10" fill={accent} fontFamily={fontUi} fontStyle="italic">
          ← method
        </text>
        <MonoLine x={358} y={266} text="const sun =" size={12} />
        <MonoLine x={358} y={284} text='  this.getSunColor()' size={12} />
        <MonoLine x={358} y={302} text="..." size={12} fill={muted} />
        <MonoLine x={342} y={324} text="}" size={12} />
        <MonoLine x={326} y={346} text="}" size={12} />

        <MonoLine x={326} y={380} text="function getSunColor() {" weight={600} size={13} />
        <text x={490} y={380} fontSize="10" fill={accent} fontFamily={fontUi} fontStyle="italic">
          ← fn
        </text>
        <MonoLine x={342} y={402} text='return "yellow"' size={12} fill={diffMinusInk} weight={600} />
        <MonoLine x={326} y={424} text="}" size={12} />

        <line x1={326} y1={448} x2={550} y2={448} stroke={hairline} strokeWidth={0.8} />
        <text x={326} y={472} fontSize="10" fill={muted} fontFamily={fontUi}>
          Names vary by language —
        </text>
        <text x={326} y={488} fontSize="10" fill={muted} fontFamily={fontUi}>
          a function attached to a class
        </text>
        <text x={326} y={504} fontSize="10" fill={muted} fontFamily={fontUi}>
          is a &quot;method&quot; in Java/Python,
        </text>
        <text x={326} y={520} fontSize="10" fill={muted} fontFamily={fontUi}>
          still a &quot;function&quot; in JS/Go.
        </text>
      </Card>
    </motion.g>
  )
}

/* ============================================================================
 * SCENE 5 — 'merge-conflict' (slide 9)
 * Two branches, both off main, both editing the same line. Conflict marker.
 * ========================================================================== */
function SceneMergeConflict({ highlightSet, status }: { highlightSet: Set<string>; status: StepStatus }) {
  const isHi = (id: string) => highlightSet.has(id)
  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <text x={300} y={50} textAnchor="middle" fontSize="13" fontWeight={700} letterSpacing="2" fill={muted} fontFamily={fontUi}>
        MERGE CONFLICT
      </text>
      <text x={300} y={72} textAnchor="middle" fontSize="11" fontStyle="italic" fill={muted} fontFamily={fontUi}>
        two branches, same line, different edits
      </text>

      {/* main branch line with shared starting point */}
      <text x={20} y={116} fontSize="13" fontWeight={600} fill={ink} fontFamily={fontMono}>main</text>
      <line x1={70} y1={110} x2={530} y2={110} stroke={ink} strokeWidth={1.6} />
      <CommitDot cx={120} cy={110} label="A" />
      <CommitDot cx={200} cy={110} label="B (shared base)" />
      <CommitDot cx={490} cy={110} label="?" accentRing highlighted={isHi('ch8-conflict-target')} status={status} />

      {/* Branch 1 — orange */}
      <path d="M 200 110 Q 240 110 260 200 L 360 200 Q 410 200 430 110" fill="none" stroke={ink} strokeWidth={1.2} />
      <text x={20} y={206} fontSize="13" fontWeight={600} fill={muted} fontFamily={fontMono}>branch A</text>
      <CommitDot cx={310} cy={200} label="orange" highlighted={isHi('ch8-conflict-orange')} status={status} />

      {/* Branch 2 — gold */}
      <path d="M 200 110 Q 240 110 260 290 L 360 290 Q 410 290 430 110" fill="none" stroke={ink} strokeWidth={1.2} />
      <text x={20} y={296} fontSize="13" fontWeight={600} fill={muted} fontFamily={fontMono}>branch B</text>
      <CommitDot cx={310} cy={290} label="gold" highlighted={isHi('ch8-conflict-gold')} status={status} />

      {/* Conflict callout — what git literally writes into the file when it can't pick */}
      <Card x={60} y={350} w={480} h={210} tinted>
        <text x={76} y={376} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
          WHAT GIT WRITES INTO Hero.tsx
        </text>
        <MonoLine x={76} y={406} text="<<<<<<< HEAD (branch A)" size={12} fill={diffMinusInk} weight={600} />
        <DiffRow x={76} y={418} w={448} sign="+" text={'  sunColor = "orange"'} />
        <MonoLine x={76} y={460} text="=======" size={12} fill={muted} weight={600} />
        <DiffRow x={76} y={472} w={448} sign="+" text={'  sunColor = "gold"'} />
        <MonoLine x={76} y={514} text=">>>>>>> branch B" size={12} fill={diffMinusInk} weight={600} />
        <text x={76} y={544} fontSize="11" fontStyle="italic" fill={muted} fontFamily={fontUi}>
          A human edits the file, picks a winner, deletes the markers, commits.
        </text>
      </Card>

      <text x={300} y={600} textAnchor="middle" fontSize="12" fill={ink} fontFamily={fontUi}>
        Two ways to land here:
      </text>
      <text x={300} y={620} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
        1. two open PRs touching the same lines (one merges first, the other goes stale)
      </text>
      <text x={300} y={638} textAnchor="middle" fontSize="11" fill={muted} fontFamily={fontUi}>
        2. main moved while your branch sat (someone else changed your line)
      </text>
    </motion.g>
  )
}

/* ============================================================================
 * SCENE 4 — 'spine' (slides 4–8, 10–13)
 * The persistent picture: laptop ↔ GitHub, branch graph below, PR + CI to the
 * right of the branches as they appear.
 * ========================================================================== */
function SceneSpine({
  visible, highlightSet, status,
}: {
  visible: Set<Ch8ElementId>
  highlightSet: Set<string>
  status: StepStatus
}) {
  const v = (id: Ch8ElementId) => visible.has(id)
  const isHi = (id: string) => highlightSet.has(id)

  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      {/* ===== LAPTOP / LOCAL ===== */}
      {v('ch8-laptop') && (
        <Card
          id="ch8-laptop"
          x={20} y={62} w={230} h={250}
          eyebrow="Local · your laptop"
          title="your-repo/"
          tinted
          highlighted={isHi('ch8-laptop')}
          status={status}
        >
          {v('ch8-laptop-files') && (
            <g>
              {v('ch8-laptop-git-folder') && (
                <g>
                  <MonoLine x={36} y={64 + 36} text=".git/" />
                  <text x={120} y={64 + 36} fontSize="11" fontStyle="italic" fill={muted} fontFamily={fontUi}>
                    full history
                  </text>
                </g>
              )}
              <MonoLine x={36} y={64 + 64} text="src/" />
              <MonoLine x={52} y={64 + 88} text="components/" />
              <MonoLine x={68} y={64 + 112} text="Hero.tsx" weight={600} fill={accent} />
              <MonoLine x={52} y={64 + 136} text="theme.ts" />
              <MonoLine x={36} y={64 + 160} text="package.json" />
              <MonoLine x={36} y={64 + 184} text="README.md" />
              <line x1={36} y1={64 + 200} x2={234} y2={64 + 200} stroke={hairline} strokeWidth={0.6} />
              <text x={36} y={64 + 222} fontSize="11" fill={muted} fontFamily={fontUi}>
                git runs here
              </text>
            </g>
          )}
        </Card>
      )}

      {/* ===== GITHUB / REMOTE ===== */}
      {v('ch8-github') && (
        <Card
          id="ch8-github"
          x={370} y={62} w={210} h={250}
          eyebrow="Remote · GitHub"
          title="your-org/your-repo"
          tinted
          highlighted={isHi('ch8-github')}
          status={status}
        >
          {v('ch8-github-files') && (
            <g>
              <text x={386} y={108} fontSize="11" fill={muted} fontFamily={fontUi}>
                same files,
              </text>
              <text x={386} y={124} fontSize="11" fill={muted} fontFamily={fontUi}>
                same .git history
              </text>
              <line x1={386} y1={140} x2={564} y2={140} stroke={hairline} strokeWidth={0.6} />
              <text x={386} y={162} fontSize="11" fill={muted} fontFamily={fontUi}>
                hosted by GitHub
              </text>
              <text x={386} y={178} fontSize="11" fill={muted} fontFamily={fontUi}>
                (GitLab, Bitbucket
              </text>
              <text x={386} y={194} fontSize="11" fill={muted} fontFamily={fontUi}>
                play the same role)
              </text>

              {/* Branch list — appears once branches show up */}
              {v('ch8-branch-graph') && (
                <g>
                  <line x1={386} y1={210} x2={564} y2={210} stroke={hairline} strokeWidth={0.6} />
                  <text x={386} y={228} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
                    BRANCHES
                  </text>
                  <MonoLine x={386} y={248} text="main" size={12} weight={600} />
                  <MonoLine x={386} y={266} text="sun-color-orange" size={12} fill={accent} weight={v('ch8-arrow-push') ? 600 : 400} />
                  {!v('ch8-arrow-push') && (
                    <text x={490} y={266} fontSize="10" fontStyle="italic" fill={muted} fontFamily={fontUi}>
                      (local only)
                    </text>
                  )}
                </g>
              )}
            </g>
          )}
        </Card>
      )}

      {/* ===== CLONE ARROW ===== */}
      {v('ch8-arrow-clone') && (
        <motion.g data-region="ch8-arrow-clone" variants={diagramReveal}>
          {/* Label above the line so they never overlap. */}
          <text x={310} y={130} textAnchor="middle" fontSize="13" fontWeight={700} fill={isHi('ch8-arrow-clone') ? strokeForStatus(status) : ink} fontFamily={fontMono}>
            git clone
          </text>
          <text x={310} y={146} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi}>
            (one-time copy down)
          </text>
          <line
            x1={368} y1={158} x2={252} y2={158}
            stroke={isHi('ch8-arrow-clone') ? strokeForStatus(status) : ink}
            strokeWidth={isHi('ch8-arrow-clone') ? 1.8 : 1.2}
            markerEnd="url(#ch8-arrow)"
          />
        </motion.g>
      )}

      {/* ===== PUSH ARROW ===== */}
      {v('ch8-arrow-push') && (
        <motion.g data-region="ch8-arrow-push" variants={diagramReveal}>
          <text x={310} y={196} textAnchor="middle" fontSize="13" fontWeight={700} fill={isHi('ch8-arrow-push') ? strokeForStatus(status) : ink} fontFamily={fontMono}>
            git push
          </text>
          <text x={310} y={212} textAnchor="middle" fontSize="10" fill={muted} fontFamily={fontUi}>
            (send your branch up)
          </text>
          <line
            x1={252} y1={224} x2={368} y2={224}
            stroke={isHi('ch8-arrow-push') ? strokeForStatus(status) : ink}
            strokeWidth={isHi('ch8-arrow-push') ? 1.8 : 1.2}
            markerEnd="url(#ch8-arrow)"
          />
        </motion.g>
      )}

      {/* ===== BRANCH GRAPH ===== */}
      {v('ch8-branch-graph') && (
        <motion.g data-region="ch8-branch-graph" variants={diagramReveal}>
          <line x1={10} y1={336} x2={590} y2={336} stroke={ink} strokeWidth={1.2} />
          <rect x={10} y={336} width={170} height={26} fill={paper} />
          <text x={10} y={354} fontSize="13" fontWeight={700} letterSpacing="1.6" fill={ink} fontFamily={fontUi}>
            BRANCH GRAPH
          </text>
          <text x={120} y={354} fontSize="11" fill={muted} fontFamily={fontUi} fontStyle="italic">
            timelines on the .git history
          </text>
        </motion.g>
      )}

      {/* main branch */}
      {v('ch8-branch-main') && (
        <motion.g data-region="ch8-branch-main" variants={diagramReveal}>
          <text x={20} y={400} fontSize="13" fontWeight={600} fill={ink} fontFamily={fontMono}>main</text>
          <line x1={80} y1={394} x2={500} y2={394} stroke={ink} strokeWidth={1.6} />
          <CommitDot cx={120} cy={394} label="A" />
          <CommitDot cx={200} cy={394} label="B" />
          <CommitDot cx={280} cy={394} label="C" />
          {v('ch8-commit-merge') && (
            <CommitDot cx={460} cy={394} label="M (merge)" filled highlighted={isHi('ch8-commit-merge')} status={status} />
          )}
        </motion.g>
      )}

      {/* feature branch (sun-color-orange) — peels off C, sits below main */}
      {v('ch8-branch-feature') && (
        <motion.g data-region="ch8-branch-feature" variants={diagramReveal}>
          <text x={20} y={478} fontSize="13" fontWeight={600} fill={muted} fontFamily={fontMono}>sun-color-orange</text>
          <path
            d={
              v('ch8-commit-merge')
                ? 'M 280 394 Q 310 394 330 462 L 410 462 Q 440 462 460 394'
                : 'M 280 394 Q 310 394 330 462 L 460 462'
            }
            fill="none" stroke={ink} strokeWidth={1.2}
          />
          {v('ch8-commit-orange') && (
            <CommitDot
              cx={395} cy={462}
              label='42a1f2 · "orange"'
              accentRing
              highlighted={isHi('ch8-commit-orange')}
              status={status}
            />
          )}
        </motion.g>
      )}

      {/* Commit metadata callout — appears slide 5 */}
      {v('ch8-commit-callout') && (
        <motion.g data-region="ch8-commit-callout" variants={diagramReveal}>
          <line x1={395} y1={471} x2={420} y2={510} stroke={muted} strokeWidth={0.8} strokeDasharray="2 3" />
          <Card x={420} y={500} w={170} h={108}>
            <text x={436} y={520} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
              COMMIT
            </text>
            <MonoLine x={436} y={540} text="42a1f2 (hash)" size={11} fill={muted} />
            <MonoLine x={436} y={558} text="author: m.wang" size={11} fill={muted} />
            <MonoLine x={436} y={576} text="2026-05-04 14:22" size={11} fill={muted} />
            <text x={436} y={596} fontSize="11" fontWeight={600} fill={ink} fontFamily={fontUi}>
              &quot;change sun color
            </text>
            <text x={436} y={610} fontSize="11" fontWeight={600} fill={ink} fontFamily={fontUi}>
              from yellow to orange&quot;
            </text>
          </Card>
        </motion.g>
      )}

      {/* ===== PULL REQUEST CARD =====
          Appears slide 7 (slideIndex 7 in 0-based). Sits below the branch graph. */}
      {v('ch8-pr-card') && (
        <motion.g data-region="ch8-pr-card" variants={diagramReveal}>
          <Card
            x={10} y={528} w={580} h={180}
            highlighted={isHi('ch8-pr-card')}
            status={status}
          >
            <text x={26} y={552} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
              PULL REQUEST · GITHUB · #142
            </text>
            <text x={26} y={576} fontSize="14" fontWeight={700} fill={ink} fontFamily={fontUi}>
              change sun color from yellow to orange
            </text>
            <text x={26} y={594} fontSize="11" fill={muted} fontFamily={fontUi}>
              sun-color-orange → main · 1 commit · awaiting review
            </text>

            {/* Diff strip */}
            {v('ch8-pr-diff') && (
              <g>
                <text x={26} y={618} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
                  FILES CHANGED · 1
                </text>
                <DiffRow x={26} y={628} w={300} sign="-" text={'sunColor = "yellow"'} />
                <DiffRow x={26} y={654} w={300} sign="+" text={'sunColor = "orange"'} />
                <text x={26} y={690} fontSize="11" fill={muted} fontFamily={fontUi} fontStyle="italic">
                  reviewers comment line-by-line
                </text>
              </g>
            )}

            {/* Checks panel */}
            {v('ch8-pr-checks-panel') && (
              <Ch8PrChecksPanel
                showLanes={v('ch8-ci-lane-build')}
                green={v('ch8-ci-status-green')}
              />
            )}
          </Card>
        </motion.g>
      )}

      {/* ===== CI MACHINE ===== */}
      {/* The CI machine isn't a separate visual box — it lives inside the PR card's
          checks panel (slide 9 = green slot revealed; slide 10 = lanes revealed;
          slide 11 = all green). The Ch8PrChecksPanel above renders this conditionally. */}
    </motion.g>
  )
}

/** Checks panel rendered inside the PR card. Three states: pending placeholder
 *  (slide 7 / slide 9 — CI machine attached but lanes not detailed yet), lanes
 *  revealed (slide 10), all-green (slide 11+). */
function Ch8PrChecksPanel({ showLanes, green }: { showLanes: boolean; green: boolean }) {
  const baseX = 350
  const baseY = 614
  const laneW = 110
  const laneH = 28

  return (
    <g>
      <text x={baseX} y={602} fontSize="11" fontWeight={600} letterSpacing="1.2" fill={muted} fontFamily={fontUi}>
        CHECKS · CI
      </text>

      {!showLanes && (
        <g>
          <rect x={baseX} y={baseY} width={224} height={48} fill={paper} stroke={hairline} strokeWidth={1} rx={3} />
          <text x={baseX + 12} y={baseY + 20} fontSize="11" fill={ink} fontFamily={fontUi}>
            CI machine pulled the branch
          </text>
          <text x={baseX + 12} y={baseY + 36} fontSize="11" fill={muted} fontFamily={fontUi} fontStyle="italic">
            running tests, lint, type check, build…
          </text>
        </g>
      )}

      {showLanes && (
        <g>
          {(['Build', 'Lint', 'Types', 'Tests'] as const).map((label, i) => {
            const x = baseX + (i % 2) * (laneW + 4)
            const y = baseY + Math.floor(i / 2) * (laneH + 4)
            const checkColor = green ? statusPass : muted
            return (
              <g key={label}>
                <rect
                  x={x} y={y} width={laneW} height={laneH}
                  fill={paper}
                  stroke={green ? statusPass : ink}
                  strokeWidth={green ? 1.4 : 1}
                  rx={3}
                />
                <circle cx={x + 14} cy={y + laneH / 2} r={6} fill={checkColor} />
                <text x={x + 14} y={y + laneH / 2 + 3} textAnchor="middle" fontSize="9" fontWeight={700} fill={paper} fontFamily={fontUi}>
                  {green ? '✓' : '·'}
                </text>
                <text x={x + 28} y={y + laneH / 2 + 4} fontSize="11" fontWeight={600} fill={ink} fontFamily={fontUi}>
                  {label}
                </text>
              </g>
            )
          })}
          {green && (
            <text x={baseX + 224} y={baseY + 70} textAnchor="end" fontSize="11" fontWeight={700} fill={statusPass} fontFamily={fontUi}>
              all green · merge unblocked
            </text>
          )}
        </g>
      )}
    </g>
  )
}

export function Chapter8DiagramSvg({ slideIndex, highlight, highlightStatus }: Props) {
  const scene: Ch8Scene = ch8Scene(slideIndex)
  const visible = visibleCh8Elements(slideIndex)
  const highlightSet = new Set(highlight ?? [])
  const status = highlightStatus ?? 'neutral'

  return (
    <motion.g variants={staggerChildren} initial="hidden" animate="shown">
      <defs>
        <marker id="ch8-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={ink} />
        </marker>
        <marker id="ch8-arrow-muted" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={muted} />
        </marker>
      </defs>

      {scene === 'change' && <SceneChange />}
      {scene === 'text-runtime' && <SceneTextRuntime />}
      {scene === 'organization' && <SceneOrganization />}
      {scene === 'merge-conflict' && <SceneMergeConflict highlightSet={highlightSet} status={status} />}
      {scene === 'spine' && <SceneSpine visible={visible} highlightSet={highlightSet} status={status} />}
    </motion.g>
  )
}
