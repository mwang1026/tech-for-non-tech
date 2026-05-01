import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })
const ol = (...items: Inline[]): Block => ({ kind: 'ol', items })
const code = (text: string): Block => ({ kind: 'code', text })

/* ============================================================================
 * Chapter 10 — Working with Claude Code (101)
 *
 * The payoff chapter. Everything in Ch 1-9 was preparation; this chapter is
 * the workflow for using an AI coding agent in a real codebase.
 * ============================================================================ */

/* --------------------------- Slide 1 — Not a vending machine --------------------------- */

const notVendingMachine: Block[] = [
  p(_('Coming out of Chapter 9, you have a full mental model of how a real software system works. Every layer it has, every gate it runs, every kind of failure it can produce. That literacy is what lets the rest of this chapter actually pay off.')),
  p(_('AI coding agents — '), t('Claude Code', 'claude-code'), _(', '), t('Cursor', 'cursor'), _(', '), t('Codex', 'codex'), _(', '), t('GitHub Copilot', 'copilot'), _(', '), t('Aider', 'aider'), _(' — can write code at remarkable speed. They can also confidently produce code that ships race conditions, missing authorization checks, naive caching, and a dozen other categories of bug we’ve walked through in this primer.')),
  p(_('The trap: an agent will give you an answer to almost anything you ask. The answer will look reasonable. It will be syntactically valid, run cleanly, and pass a quick test. And it might be silently wrong in exactly the ways the previous nine chapters warned about.')),
  p(_('What needs to happen: you direct the agent like you’d direct a fast junior engineer who hasn’t worked on this codebase before. You orient them. You ask them to explain things. You force them to surface tradeoffs before they write code. You read their work before merging.')),
]

/* --------------------------- Slide 2 — Where Claude Code actually runs --------------------------- */

const whereItRuns: Block[] = [
  p(_('Before any of the prompts in this chapter make sense, ground the picture: '), t('Claude Code', 'claude-code'), _(' is a program you run in your '), t('terminal', 'terminal'), _('. You give it a folder; it reads, edits, and runs commands inside that folder. That folder needs to be a '), t('git repo', 'repository'), _(', because the workflow you’re about to learn — branches, pull requests, reviewing the diff — is git-shaped (see Chapter 8 if any of that is fuzzy).')),
  p(_('The literal first session, assuming you’ve cloned the repo (Ch 8):')),
  code(`cd ~/code/your-repo
claude`),
  p(_('You’re now in a chat with the agent inside that folder. Its working surface is the files in there. When the agent says *"I edited `src/payments.ts`,"* that means a file on your laptop just changed on disk — at `~/code/your-repo/src/payments.ts`. You can confirm it in your editor, or ask the agent to show you what it changed.')),
  p(_('Every prompt in the rest of this chapter — orient, learn on demand, run the feature template, push back on red flags, narrate the diff — happens inside this session. Five phases, one terminal window, one folder.')),
]

/* --------------------------- Slide 3 — Phase 1: Get oriented --------------------------- */

const phase1: Block[] = [
  p(_('Before asking the agent to *do* anything, ask it to explain what it’s looking at. The agent is faster at reading code than you are; let it do that work and report back.')),
  p(_('Useful first prompts when you sit down with a new (or unfamiliar) codebase:')),
  ul(
    [_('"Explain this codebase to me like I’ve never seen the code before. What does it do, and what are the main pieces?"')],
    [_('"Draw me a diagram of the main components and how they talk to each other." (Even just the agent listing them by name in order tells you a lot.)')],
    [_('"Walk me through what happens, step by step, when a user logs in." (Or whatever the central action of this product is — checkout, post, search.)')],
    [_('"What runs in the browser vs. on the server in this codebase? Where is the boundary?"')],
  ),
  p(_('What you’re looking for at this stage isn’t correctness — it’s a map. You should be able to point at the architecture in your head when you’re done. If something the agent says doesn’t match the picture you’ve been building since Chapter 1, that’s a flag worth following up on.')),
  p(_('Once you have the map, the next phase is filling in unfamiliar terms as you encounter them.')),
]

/* --------------------------- Slide 3 — Phase 2: Learn on demand --------------------------- */

const phase2: Block[] = [
  p(_('Software vocabulary is huge. No primer (including this one) covers everything you’ll see in a real codebase. The good news is the agent is a tutor that works in context.')),
  p(_('When you encounter an unfamiliar term, framework, or pattern, don’t look it up in the abstract. Ask about it *here*, in this code. (The terms in the examples below — middleware, services, controllers, useEffect — are real names from real codebases. You don’t need to know any of them yet. That’s the point.)')),
  ul(
    [_('"There’s something called middleware in this file. What is it, and why is it here specifically?"')],
    [_('"This file imports from a folder called `services`. What does that folder do? How is it different from `controllers`?"')],
    [_('"What is this `useEffect` thing doing on this page? What would happen if I removed it?"')],
    [_('"Why is some code in `pages/` and some in `components/`? What’s the convention?"')],
  ),
  p(_('Asking in context is the trick. "What is middleware?" gets you a generic answer that may or may not match how this codebase uses the term. "What is middleware *here*, in this file?" gets you a grounded answer with examples you can actually look at.')),
  p(_('Once you can navigate the codebase and ask about anything you don’t recognize, you’re ready to direct real changes. Which is where the feature template comes in.')),
]

/* --------------------------- Slide 4 — Phase 3: The feature template --------------------------- */

const phase3: Block[] = [
  p(_('The single most useful prompt in this primer.')),
  p(
    _('Before letting the agent write a single line of code for a new feature, run the '),
    t('feature template', 'feature-template'),
    _(' — a fixed list of nine questions that force the agent to think across every layer of the system before producing code.'),
  ),
  p(_('Open with: *"I want to add [feature]. Walk me through:"*')),
  ul(
    [_('**State** — what new tables, columns, or in-memory data?')],
    [_('**API contract** — which endpoints, and what shape do the requests and responses take? (The "contract" is the agreement on what gets sent and what comes back.)')],
    [_('**Identity** — how does each endpoint know who’s calling?')],
    [_('**Authorization & validation** — who’s allowed to do this; what input is rejected?')],
    [_('**Concurrency** — does this read-then-write shared data; what’s the lock or atomic write that prevents two requests from racing?')],
    [_('**Performance** — is anything cached; what’s the staleness tolerance?')],
    [_('**Failure modes** — what if the database is down, the request times out, a third-party service returns a 500 error?')],
    [_('**Front-end vs. back-end** — what code moves where?')],
    [_('**Diagram** — show me the data flow before writing code.')],
  ),
  p(_('Close with: *"Don’t write any code yet — just explain the plan."*')),
  p(_('Each question maps to a chapter you’ve already done. Identity → Ch 2. Authorization & validation → Ch 3. State → Ch 4. Architecture & performance → Ch 5. Concurrency → Ch 6. Failure modes → Ch 5 (where things can break across the network) and Ch 9 (how you find out when they do). The template is this primer applied.')),
  p(_('What you’re reading the answers for: hand-waves. "It’ll be cached" without saying where, or what the staleness window is, is a hand-wave. "It’s authenticated" without saying where the check happens is a hand-wave. Each hand-wave is a place to push back — and the next slide is a catalog of the most common ones, mapped back to the chapters that named them.')),
]

/* --------------------------- Slide 5 — Phase 4: When the plan doesn't fit --------------------------- */

const phase4_pushback: Block[] = [
  p(_('The agent runs the template. The plan comes back. Now what?')),
  p(_('You read it for hand-waves and red flags. Each red flag corresponds to something this primer has already covered — naming it in the system\'s vocabulary is what makes pushback land.')),
  p(_('Common red flags, mapped to chapters:')),
  ul(
    [_('**"The endpoint accepts a userId in the request body."** — Authorization smell (Ch 3). The user ID should come from the verified token, not from anything the caller can change.')],
    [_('**"We\'ll keep it in memory."** — Durability smell (Ch 4). Anything that should survive a restart belongs in the database. Memory only works for state that\'s OK to lose.')],
    [_('**"We\'ll cache it."** — Staleness smell (Ch 4). What\'s the freshness requirement? When does the cache get invalidated? "Just cache it" without answers ships a stale-data bug.')],
    [_('**"Read the count, then write count − 1."** — Concurrency smell (Ch 6). Two requests will race; one silently overwrites the other. Needs a transaction with the right lock, or a single atomic statement.')],
    [_('**"The front-end won\'t let users do that."** — Security smell (Ch 3). The front-end runs on the user\'s machine. Anyone can call the API directly. The check has to be on the back-end too.')],
    [_('**"Add a NOT NULL column with no default."** — Deploy smell (Ch 9). Existing rows break the migration. Either add a default, or do a two-step deploy (column nullable first, fill it, then enforce).')],
  ),
  p(_('The move is the same in every case: don\'t accept "trust me." Ask why this approach. Name the concern in the system\'s vocabulary ("won\'t this race?"; "what\'s the staleness tolerance?"; "where\'s the back-end check?"). Propose the alternative the chapter taught you. The agent will either reach for a better answer or reveal it doesn\'t have one.')),
  p(_('Pushing back here is the cheapest place to do it. Once the agent has written 800 lines of code, the cost of redirecting goes up. The whole point of running the template before any code gets written is to catch the bad plan in plain English, where reasoning about the system is fastest.')),
]

/* --------------------------- Slide 7 — Running parallel agents and worktrees --------------------------- */

const worktrees: Block[] = [
  p(_('Sometimes you want two agents working at once: one finishing feature A while another starts feature B, or one writing the code while a *fresh* agent reads the diff (which is the move on the next slide).')),
  p(_('The naive setup: open a second terminal, `cd` into the same folder, run `claude` again. Both agents see the same files. They will overwrite each other’s work — and they’re both on the same branch, so there’s no isolation. Don’t do this.')),
  p(_('The fix is a '), t('worktree', 'worktree'), _(': a *second folder* on your laptop that shares the same git history but is checked out to a different branch. Same repo under the hood, separate files on disk.')),
  p(_('To create one:')),
  code(`git worktree add ../your-repo-feature-b feature-b`),
  p(_('That makes a sibling folder next to your main checkout:')),
  code(`~/code/your-repo/             (branch: main)         ← agent A works here
~/code/your-repo-feature-b/   (branch: feature-b)    ← agent B works here`),
  p(_('Each terminal `cd`s into its own folder and runs `claude`. The two agents can’t collide because they’re editing different files on disk; git ties them together under the hood. When B is done, push the branch, open a PR, merge it through the normal flow.')),
  p(_('Cleanup, when the worktree’s no longer useful:')),
  code(`git worktree remove ../your-repo-feature-b`),
  p(_('Worktrees pay off when you have genuinely parallel tracks. If you’re doing one thing at a time, you don’t need them — finish the branch, push, start the next. The reason worktrees show up here is the next slide: opening a *fresh* agent to review code without the writing-agent’s confirmation bias is the most common reason a beginner reaches for one.')),
]

/* --------------------------- Slide 8 — Phase 5: Have the agent narrate the change --------------------------- */

const phase5_diff: Block[] = [
  p(_('Plan iterated, plan accepted. The agent writes the code. Pull request opens. CI goes green. Reviewers approve. Are you done?')),
  p(_('No. You are still the last gate. But the verification step isn’t reading code — that was never the deal. It’s making the agent report back, in plain English, on what it actually did. The plan is one thing; the actual code change is another. Agents are very good at producing code that *resembles* the plan and is subtly different — a check moved to the wrong layer, a transaction quietly omitted, a default value that doesn’t match what was discussed. CI catches the mistakes that have tests; it does not catch the mistakes that don’t.')),
  p(_('Open with: *"Before I review this, walk me through the change. For every file you touched, give me one line on what changed and why the plan needed it. Then flag anything that should get my attention — decisions you made on your own, new packages, workarounds, or anything that didn’t come straight from our plan."*')),
  p(_('What to specifically ask the agent to surface:')),
  ul(
    [_('**Files touched, in plain terms** — one line per file on what changed and why.')],
    [_('**Decisions the agent made on its own** — defaults chosen, libraries picked, error-handling style, naming. Anything that wasn’t literally in the plan is a judgment call worth a second look.')],
    [_('**New dependencies or packages added** — what and why. Every new package widens the trust surface and deserves a question.')],
    [_('**Workarounds, TODOs, or temporary code** — anything the agent wrote knowing it isn’t the final answer.')],
    [_('**Confirmations of every red flag from Phase 4** — one question per concern. *"Show me where the authorization check lives."* *"Where is the transaction wrapping the read-then-write?"* *"How is the cache invalidated?"* Make the agent point at lines, not summarize.')],
  ),
  p(_('The trust-but-verify caveat: the agent narrating its own work has a confirmation-bias problem. It may describe what it *intended* to write rather than what it wrote. Two countermeasures:')),
  ul(
    [_('**Ask specific questions tied to the plan**, not vague "summarize the change." Specific questions catch the gap; vague ones invite reassurance.')],
    [_('**For high-stakes changes** (auth, payments, migrations, anything touching real money or real users), open a *fresh* agent session — easiest with a worktree (previous slide) — with no plan context and ask it to describe what the diff does. A clean read catches what the author-agent glossed over. It is the cheapest second opinion in software.')],
  ),
  p(_('What that looks like in Claude Code:')),
  ol(
    [_('Open a new terminal window or tab. This is what makes the session "fresh" — it can’t see what the previous agent was working on.')],
    [_('`cd` into the same project folder. (The same command you used the first time.)')],
    [_('Run `claude` to start a new agent there.')],
    [_('Paste a prompt like: *"There’s an open pull request on this repo, #142. Read the diff and tell me, in plain English: what does this change actually do, what files does it touch and why, and is anything in it surprising or risky?"*')],
  ),
  p(_('The verification habit isn’t about reading code. It’s about refusing to merge anything you can’t have explained back to you in language you understand. If the agent can’t narrate the change cleanly, that’s the signal to keep asking.')),
]

/* --------------------------- Chapter 10 export --------------------------- */

export const chapter10: Chapter = {
  id: 'ch10',
  number: 10,
  title: 'Working with Claude Code',
  subtitle: 'How to direct an AI coding agent in a real codebase',
  slides: [
    { id: 's1', level: 101, headline: 'The agent isn’t a vending machine', body: { kind: 'prose', blocks: notVendingMachine }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Where Claude Code actually runs', body: { kind: 'prose', blocks: whereItRuns }, hideDiagram: true },
    { id: 's3', level: 101, headline: 'Phase 1 — Get oriented', body: { kind: 'prose', blocks: phase1 }, diagramFocus: 'full' },
    { id: 's4', level: 101, headline: 'Phase 2 — Learn on demand', body: { kind: 'prose', blocks: phase2 }, diagramFocus: 'full' },
    { id: 's5', level: 101, headline: 'Phase 3 — Run the feature template', body: { kind: 'prose', blocks: phase3 }, diagramFocus: 'full' },
    { id: 's6', level: 101, headline: 'Phase 4 — When the plan doesn’t fit', body: { kind: 'prose', blocks: phase4_pushback }, diagramFocus: 'full' },
    { id: 's7', level: 101, headline: 'Running parallel agents — worktrees', body: { kind: 'prose', blocks: worktrees }, hideDiagram: true },
    { id: 's8', level: 101, headline: 'Phase 5 — Have the agent narrate the change', body: { kind: 'prose', blocks: phase5_diff }, diagramFocus: 'full' },
    {
      id: 's9',
      level: 101,
      kind: 'recap',
      headline: 'What you have, end to end',
      body: {
        kind: 'recap',
        learned: [
          'You have a full mental model of how software systems work — request flow, state, identity, validation, concurrency, architecture, code lifecycle, deployment',
          'You have a five-phase workflow with an AI agent: orient, learn on demand, run the feature template, push back on red flags in the plan, have the agent narrate the change before merging',
          'You have a nine-question template that forces every plan to surface the tradeoffs you now know how to evaluate',
          'You have a vocabulary of warning signs — the patterns that quietly produce bugs, and the chapter each one maps back to when you need to push back',
        ],
        whereInSystem: [
          _('You are not a part of the diagram. You are the human watching it, directing changes to it, and verifying what comes back. The agent is your co-worker. The diagram is your shared reference. The feature template is your shared protocol.'),
        ],
        bridge: [
          _('There is no next chapter. From here, the work is iteration: take a real codebase, run the feature template on a real change, read the diff, ship it, learn from what surprises you. Come back to specific chapters when something needs refreshing. The glossary is always one click away. The literacy compounds with every feature you direct.'),
        ],
      },
    },
  ],
}
