import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })

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

/* --------------------------- Slide 2 — Phase 1: Get oriented --------------------------- */

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

/* --------------------------- Slide 6 — Phase 5: Read the diff --------------------------- */

const phase5_diff: Block[] = [
  p(_('Plan iterated, plan accepted. The agent writes the code. Pull request opens. CI goes green. Reviewers approve. Are you done?')),
  p(_('No. Read the diff first.')),
  p(_('The plan is one thing. The actual code change is another. Agents are very good at producing code that *resembles* the plan and is subtly different — a check moved to the wrong layer, a transaction quietly omitted, a default value that doesn’t match what was discussed. CI catches the mistakes that have tests; it does not catch the mistakes that don’t.')),
  p(_('What to look for as you read the diff:')),
  ul(
    [_('Each authorization check from the plan — is it actually present in the code, on the right side (back-end) of the boundary?')],
    [_('Each transaction the plan called for — is it actually wrapped in a transaction in the code, or is it a sequence of separate writes?')],
    [_('Cache reads and writes — is invalidation happening correctly, or will the cache hold stale data forever?')],
    [_('Inputs from the request — are they validated, or trusted because "the front-end checks it"?')],
    [_('Database queries — are user inputs being passed as proper parameters, or pasted into the query string? (Pasted = SQL injection risk, from Ch 3.)')],
  ),
  p(_('Skipping the diff is how race conditions and missing authz checks ship to production with everyone’s blessing. Reading it is the last gate, and you are the only thing that can stand at it.')),
]

/* --------------------------- Chapter 10 export --------------------------- */

export const chapter10: Chapter = {
  id: 'ch10',
  number: 10,
  title: 'Working with Claude Code',
  subtitle: 'How to direct an AI coding agent in a real codebase',
  slides: [
    { id: 's1', level: 101, headline: 'The agent isn’t a vending machine', body: { kind: 'prose', blocks: notVendingMachine }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Phase 1 — Get oriented', body: { kind: 'prose', blocks: phase1 }, diagramFocus: 'full' },
    { id: 's3', level: 101, headline: 'Phase 2 — Learn on demand', body: { kind: 'prose', blocks: phase2 }, diagramFocus: 'full' },
    { id: 's4', level: 101, headline: 'Phase 3 — Run the feature template', body: { kind: 'prose', blocks: phase3 }, diagramFocus: 'full' },
    { id: 's5', level: 101, headline: 'Phase 4 — When the plan doesn’t fit', body: { kind: 'prose', blocks: phase4_pushback }, diagramFocus: 'full' },
    { id: 's6', level: 101, headline: 'Phase 5 — Always read the diff', body: { kind: 'prose', blocks: phase5_diff }, diagramFocus: 'full' },
    {
      id: 's7',
      level: 101,
      kind: 'recap',
      headline: 'What you have, end to end',
      body: {
        kind: 'recap',
        learned: [
          'You have a full mental model of how software systems work — request flow, state, identity, validation, concurrency, architecture, code lifecycle, deployment',
          'You have a five-phase workflow with an AI agent: orient, learn on demand, run the feature template, push back on red flags in the plan, read the diff',
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
