import type { Chapter, Block, ConsoleSpec } from './types'
import { _, t, p, ul, ol, code } from './authoring'

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
    [_('**"The endpoint accepts a userId in the request body."** — Authorization smell (Ch 3). The canonical owner-based authz mistake: the identity has to come from the verified token, not from anything the caller can change. If the resource\'s "is this yours?" check uses input the caller controls, the check is meaningless.')],
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

/* --------------------------- Console mocks --------------------------- *
 * The diagram column for Chapter 10 is replaced by a fake Claude Code session.
 * One worked feature ("add 👍 likes to comments on a multi-author blog,
 * BlogCorp") is carried across slides 1, 3, 4, 5, 6, and 8 so the chapter
 * shows one feature shipped end-to-end through the five phases.
 */

/* Slide 1 — bad prompt vs. directed prompt, stacked. */
const console_s1: ConsoleSpec = {
  layout: 'stacked',
  panes: [
    {
      title: 'Vending-machine prompt',
      cwd: 'blogcorp',
      branch: 'Branch: main',
      blocks: [
        { kind: 'shell', text: 'blogcorp $ claude' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Add a like button to comments. Make it work.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'Done. Added a Like component and a POST /comments/:id/like that does:\n  const c = await db.comments.find(id)\n  await db.comments.update(id, { likes: c.likes + 1 })\nLikes update on click. Anything else?' },
        { kind: 'flag', note: 'Read-then-write race — two simultaneous likes both read 7, both write 8. Ch 6.' },
      ],
    },
    {
      title: 'Directed prompt',
      cwd: 'blogcorp',
      branch: 'Branch: main',
      blocks: [
        { kind: 'shell', text: 'blogcorp $ claude' },
        { kind: 'spacer' },
        { kind: 'user', text: "I want to add likes to comments. Before any code: what state changes, what's the API, where does the count live, and what happens when two people click at once?" },
        { kind: 'spacer' },
        { kind: 'agent', text: "Good — let me lay out the options first. Three places the count can live, two ways to handle the race…" },
      ],
    },
  ],
  caption: 'Same task, same agent. The prompt is the steering wheel.',
}

/* Slide 2 — literal first-run terminal. */
const console_s2: ConsoleSpec = {
  panes: [
    {
      cwd: 'blogcorp',
      blocks: [
        { kind: 'shell', text: '~ $ cd ~/code/blogcorp' },
        { kind: 'shell', text: 'blogcorp $ claude' },
        { kind: 'spacer' },
        { kind: 'banner', lines: [
          '┌──────────────────────────────────────────┐',
          '│  Claude Code · v1.x                      │',
          '│  /Users/you/code/blogcorp                │',
          '│  Branch: main                            │',
          '└──────────────────────────────────────────┘',
        ] },
        { kind: 'spacer' },
        { kind: 'cursor' },
      ],
    },
  ],
  caption: 'A folder, a chat. Every prompt in this chapter happens here.',
}

/* Slide 3 — Phase 1, orient. */
const console_s3: ConsoleSpec = {
  phase: { n: 1, total: 5, label: 'Get oriented' },
  panes: [
    {
      cwd: 'blogcorp',
      branch: 'Branch: main',
      blocks: [
        { kind: 'user', text: "Explain this codebase to me like I've never seen it. What does it do, and what are the main pieces?" },
        { kind: 'spacer' },
        { kind: 'agent', text: 'BlogCorp is a multi-author blog. Three pieces:\n  • web/   — the React front-end users see in the browser\n  • api/   — Node service for posts, comments, auth\n  • db/    — Postgres; main tables: users, posts, comments\n\nThe api talks to the db. The web talks to the api. Auth is via signed cookies issued at /api/login.\nWant me to walk through a specific action?' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Walk me through what happens when someone posts a comment.' },
        { kind: 'spacer' },
        { kind: 'agent', text: '1. Browser POSTs { postId, body } to /api/comments\n2. Middleware in api/middleware/auth.ts verifies the cookie and sets req.userId\n3. Handler in api/routes/comments.ts validates body length, then INSERTs into the comments table\n4. Returns the new comment as JSON; web prepends it to the visible thread' },
      ],
    },
  ],
  caption: 'You now have a map. If anything here doesn\'t match the picture in your head, that\'s where to dig.',
}

/* Slide 4 — Phase 2, learn on demand. */
const console_s4: ConsoleSpec = {
  phase: { n: 2, total: 5, label: 'Learn on demand' },
  panes: [
    {
      cwd: 'blogcorp',
      branch: 'Branch: main',
      blocks: [
        { kind: 'user', text: 'I see api/middleware/auth.ts uses something called middleware. What is middleware in this codebase, specifically?' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'In this codebase, middleware is a function that runs before a route handler. Three of them, all in api/middleware/:\n  • auth.ts        — reads the session cookie, sets req.userId, rejects with 401 if missing or invalid\n  • rateLimit.ts   — caps requests per IP\n  • requestId.ts   — tags each request with a UUID for logs\n\nIn api/routes/comments.ts you\'ll see them applied in order:\n  router.use(requestId, rateLimit, auth)\n\nBy the time your handler runs, req.userId is already set — that\'s why the comment-creation handler doesn\'t do any auth work itself.' },
      ],
    },
  ],
  caption: 'Asking "what is middleware here" beats asking "what is middleware" — you get an answer tied to lines you can open.',
}

/* Slide 5 — Phase 3, the feature template. */
const console_s5: ConsoleSpec = {
  phase: { n: 3, total: 5, label: 'Feature template' },
  panes: [
    {
      cwd: 'blogcorp',
      branch: 'Branch: feature/likes',
      blocks: [
        { kind: 'user', text: "I want to add likes to comments. Walk me through: state, API contract, identity, authorization & validation, concurrency, performance, failure modes, front-end vs. back-end, and a diagram. Don't write any code yet." },
        { kind: 'spacer' },
        { kind: 'agent-sections', sections: [
          { label: 'State', chapter: 'Ch 4', text: 'Add a comment_likes table: (comment_id, user_id, created_at), primary key (comment_id, user_id). Count is COUNT(*); we can denormalize later if it\'s slow.' },
          { label: 'API contract', text: 'POST   /api/comments/:id/like → { liked: true,  count }\nDELETE /api/comments/:id/like → { liked: false, count }\nGET on the comment list returns each comment\'s count and whether the viewer has liked it.' },
          { label: 'Identity', chapter: 'Ch 2', text: 'auth.ts middleware sets req.userId from the session cookie. The user_id we write is req.userId — never from the request body.' },
          { label: 'Authz + validation', chapter: 'Ch 3', text: 'Must be logged in (auth middleware enforces). Comment must exist. No other restriction; anyone logged in can like.' },
          { label: 'Concurrency', chapter: 'Ch 6', text: 'INSERT … ON CONFLICT DO NOTHING on (comment_id, user_id) keeps double-clicks idempotent. Count is COUNT(*); no read-modify-write to get wrong.' },
          { label: 'Performance', chapter: 'Ch 5', text: 'Counts are cheap with an index on comment_likes(comment_id). No cache for v1.' },
          { label: 'Failure modes', chapter: 'Ch 5/9', text: 'DB unreachable → 503; the front-end shows the heart un-toggled and an error toast. We do NOT queue or local-cache; a missed like is acceptable.' },
          { label: 'Front-end / back-end', chapter: 'Ch 5', text: 'Web renders the heart filled if liked=true in the comment payload. Click toggles via the API and replaces the count optimistically; rollback on error.' },
          { label: 'Diagram', text: '[browser] → POST /like → [api/auth] → [comments handler] → [postgres: insert] → count via COUNT(*)' },
        ] },
      ],
    },
  ],
  caption: 'Each line of the answer is a place you can push back. The next slide is exactly that.',
}

/* Slide 6 — Phase 4, pushback. */
const console_s6: ConsoleSpec = {
  phase: { n: 4, total: 5, label: "When the plan doesn't fit" },
  panes: [
    {
      cwd: 'blogcorp',
      branch: 'Branch: feature/likes',
      blocks: [
        { kind: 'agent', text: '…on second thought, I\'ll keep a likes_count column on the comments table and increment it: count = count + 1. Faster than COUNT(*) on big threads.' },
        { kind: 'flag', note: 'Read-then-write smell — Ch 6 concurrency. Two simultaneous likes will lose one.' },
        { kind: 'spacer' },
        { kind: 'user', text: "Won't that race? Two people like the same comment in the same millisecond — both read 7, both write 8, the count is 8 instead of 9." },
        { kind: 'spacer' },
        { kind: 'agent', text: "You're right. Two ways to fix it:\n  (a) UPDATE comments SET likes_count = likes_count + 1 WHERE id = $1\n      — atomic in Postgres; no read needed.\n  (b) Keep the comment_likes table as the source of truth (idempotent on dupe clicks) and recompute likes_count via a trigger or periodic job.\n\n(b) is safer because it also handles unlikes correctly. Want me to go with (b)?" },
        { kind: 'spacer' },
        { kind: 'user', text: 'Yes. And confirm: the user_id on insert comes from req.userId, not the request body, right?' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'Confirmed. Body never carries user_id.' },
      ],
    },
  ],
  caption: 'Pushback in plain English: "won\'t this race?", "where does user_id come from?". Every flag has a name.',
}

/* Slide 7 — worktrees, two terminals side by side. */
const console_s7: ConsoleSpec = {
  layout: 'side',
  panes: [
    {
      title: 'Terminal A',
      cwd: 'blogcorp',
      branch: 'Branch: main',
      blocks: [
        { kind: 'shell', text: 'blogcorp $ claude' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Finish the comment-edit bug fix on this branch.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'Reading api/routes/comments.ts…' },
      ],
    },
    {
      title: 'Terminal B',
      cwd: 'blogcorp-likes',
      branch: 'Branch: feature/likes',
      blocks: [
        { kind: 'shell', text: 'blogcorp-likes $ claude' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Start on the likes plan we just agreed to.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'Reading the plan…' },
      ],
    },
  ],
  caption: 'Two folders on disk, one git history underneath. Neither agent can stomp the other. Created with: git worktree add ../blogcorp-likes feature/likes',
}

/* Slide 8 — Phase 5, narrate the diff. */
const console_s8: ConsoleSpec = {
  phase: { n: 5, total: 5, label: 'Narrate the change' },
  panes: [
    {
      cwd: 'blogcorp-likes',
      branch: 'Branch: feature/likes',
      blocks: [
        { kind: 'user', text: 'Before I review this, walk me through the change. For every file you touched, one line on what changed and why. Then flag anything you decided on your own.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'PR #142 — Add comment likes\nFiles (4):\n  db/migrations/0042_comment_likes.sql\n      New comment_likes table + index. Unique key on (comment_id, user_id) for idempotency.\n  api/routes/likes.ts\n      New POST and DELETE /api/comments/:id/like. user_id from req.userId. No request-body trust.\n  api/routes/comments.ts\n      Comment list now joins comment_likes to return count and viewer_has_liked.\n  web/components/Comment.tsx\n      Heart icon, optimistic toggle, rolls back on 4xx/5xx.\n\nDecisions I made on my own:\n  • Used Postgres ON CONFLICT DO NOTHING for idempotency. Plan didn\'t specify; preserves the "double-click is a no-op" property.\n  • Picked lucide-react for the heart icon — already in web/ deps; no new package.\n  • Optimistic UI rolls back after a 600ms timeout, not on a specific error code. Worth confirming.' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Show me the line where authorization happens.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'api/routes/likes.ts:8 — handler runs after the auth middleware (registered in api/server.ts:34). req.userId is guaranteed set; if absent, auth.ts returned 401 before this handler runs.' },
      ],
    },
  ],
  caption: "Narration in plain English, not a code review. If the agent can't explain its own change, that's the signal.",
}

/* Slide 9 — recap cookbook of the five phase prompts. */
const console_s9: ConsoleSpec = {
  panes: [
    {
      title: 'The five prompts',
      blocks: [
        { kind: 'user', text: 'Explain this codebase to me like I\'ve never seen it. What does it do, and what are the main pieces?' },
        { kind: 'spacer' },
        { kind: 'user', text: 'There\'s a [term] in this file. What is it, here, specifically?' },
        { kind: 'spacer' },
        { kind: 'user', text: 'I want to add [feature]. Walk me through: state, API contract, identity, authorization & validation, concurrency, performance, failure modes, front-end vs. back-end, and a diagram. Don\'t write any code yet.' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Won\'t this race / where does user_id come from / what\'s the staleness window / where\'s the back-end check?' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Walk me through the change file by file. Then flag anything you decided on your own.' },
      ],
    },
  ],
  caption: 'One cookbook page. Five prompts, applied to any feature, in any codebase.',
}

/* --------------------------- Chapter 10 export --------------------------- */

export const chapter10: Chapter = {
  id: 'ch10',
  number: 10,
  title: 'Working with Claude Code',
  subtitle: 'How to direct an AI coding agent in a real codebase',
  slides: [
    { id: 's1', level: 101, headline: 'The agent isn’t a vending machine', body: { kind: 'prose', blocks: notVendingMachine }, console: console_s1 },
    { id: 's2', level: 101, headline: 'Where Claude Code actually runs', body: { kind: 'prose', blocks: whereItRuns }, console: console_s2 },
    { id: 's3', level: 101, headline: 'Phase 1 — Get oriented', body: { kind: 'prose', blocks: phase1 }, console: console_s3 },
    { id: 's4', level: 101, headline: 'Phase 2 — Learn on demand', body: { kind: 'prose', blocks: phase2 }, console: console_s4 },
    { id: 's5', level: 101, headline: 'Phase 3 — Run the feature template', body: { kind: 'prose', blocks: phase3 }, console: console_s5 },
    { id: 's6', level: 101, headline: 'Phase 4 — When the plan doesn’t fit', body: { kind: 'prose', blocks: phase4_pushback }, console: console_s6 },
    { id: 's7', level: 101, headline: 'Running parallel agents — worktrees', body: { kind: 'prose', blocks: worktrees }, console: console_s7 },
    { id: 's8', level: 101, headline: 'Phase 5 — Have the agent narrate the change', body: { kind: 'prose', blocks: phase5_diff }, console: console_s8 },
    {
      id: 's9',
      level: 101,
      kind: 'recap',
      headline: 'What you have, end to end',
      console: console_s9,
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
