import type { Chapter, Block, ConsoleSpec } from './types'
import { _, t, p, ul, ol, code } from './authoring'

/* ============================================================================
 * Chapter 10 — Working with Claude Code (101)
 *
 * The payoff chapter. Everything in Ch 1-9 was preparation; this chapter is
 * the workflow for using an AI coding agent in a real codebase.
 *
 * Slide arc:
 *   1.  What's actually under the hood: a language model
 *   2.  What an agent is: tools, prompts, and a loop around the model
 *   3.  Where Claude Code runs
 *   4.  What's enforced before you can ship      (safety net the reader inherits)
 *   5.  What your codebase already tells the agent (CLAUDE.md + skills)
 *   6.  Phase 1 — Get oriented
 *   7.  Phase 2 — Learn on demand
 *   8.  Phase 3 — The feature template (10 questions)
 *   9.  Phase 4 — When the plan doesn't fit
 *   10. Phase 5 — Narrate the change and use it
 *   11. Recap
 * ============================================================================ */

/* --------------------------- Slide 1 — What's under the hood: an LLM --------------------------- */

const llmIntro: Block[] = [
  p(_('Claude Code, '), t('Cursor', 'cursor'), _(', '), t('Codex', 'codex'), _(', '), t('GitHub Copilot', 'copilot'), _(', '), t('Aider', 'aider'), _(' — every agent in this list is built around the same kind of component: a '), t('large language model', 'llm'), _(', or LLM.')),
  p(_('An LLM is a neural network — a function with billions to hundreds of billions of numbers, called *weights* — that takes a chunk of text and outputs a ranking of which **token** is most likely to come next. A token is roughly a short word or a piece of one: `comment`, `_likes`, `(`, `user_id`. The agent picks the top-ranked token (or close to it), appends it to the text, and asks the model again. That is the entire generation loop.')),
  p(_('The architecture is called a *transformer*, introduced by a Google paper in 2017 and now used by every major LLM — Claude, GPT, Gemini, Llama.')),
  p(_('How it learned to predict tokens: it was shown trillions of tokens of text — public web pages, books, documentation, and a very large amount of source code from open repositories — and trained for months on specialized hardware. For each snippet it tried to predict the next token, was corrected, and had its weights nudged toward the right answer. After enough rounds, the function encodes patterns from everything it read.')),
  p(_('Why it does well on code: code has tighter structure than prose. A variable declared on line 3 reappears on line 12 in a predictable shape. A function signature constrains what the body can plausibly look like. Test files mirror their implementation files. The model has read the open-source corpus — frameworks, common patterns, recurring bug shapes — many times over. When you ask for a Postgres handler that inserts a row idempotently, it has seen thousands of examples of exactly that.')),
  p(_('It is a pattern completer, not a fact lookup. There is no internal database it queries when you ask a question. What feels like recall is the same next-token prediction, drawing on text it saw often enough during training to reproduce.')),
  p(_('That is why it can be fluent and confidently wrong in the same paragraph. It was optimized to produce plausible-sounding text, not to be right. Verifying is on you.')),
]

/* --------------------------- Slide 2 — What an agent is --------------------------- */

const agentDef: Block[] = [
  p(_('The LLM by itself is just text-in, text-out. It can\'t read a file on your laptop, run a test, open a pull request, or even know what time it is. It generates tokens.')),
  p(_('An '), t('agent', 'agent'), _(' is a program that wraps the model with three things: a set of tools, a system prompt, and a loop. When you type a request into '), t('Claude Code', 'claude-code'), _(':')),
  ul(
    [_('The agent sends your message to the model, along with a hidden **system prompt** describing the tools it can call — `Read`, `Edit`, `Bash`, `Grep`, and so on.')],
    [_('The model replies with either text (back to you) or a structured request like *"run `Read` on `src/payments.ts`."*')],
    [_('The agent executes the tool on your laptop, captures the result, and feeds it back to the model as the next chunk of context.')],
    [_('The model decides what to do next. Repeat until it answers you or stops.')],
  ),
  p(_('The model itself runs on Anthropic\'s servers, not your laptop. Each turn is a network call: the agent ships your message *and the entire conversation so far* up to the model, and the next chunk of generated text comes back. The conversation grows on every turn — every prior message, every tool call and tool result, gets re-sent each time. That is why long sessions get slower and more expensive, and why a flaky network kills the session entirely.')),
  p(_('Picking different tools, or shipping a different system prompt, gives you a different agent on the same model. '), t('Cursor', 'cursor'), _(' and '), t('Claude Code', 'claude-code'), _(' can both be configured to call Claude Sonnet, but they expose different tools and ship different system prompts, so the experience differs. Two files in your repo — '), t('CLAUDE.md', 'claude-md'), _(' and the `skills` folder, covered on the next slide — change how the agent behaves without changing the model at all. The agent appends them to the prompt it was already sending.')),
  p(_('When the agent does something surprising, look in three places: the model\'s training, the tools it was given (or wasn\'t), or the prompt the agent steered it with — yours plus its built-in instructions. The next slides give you control over that third one.')),
]

/* --------------------------- Slide 3 — Where Claude Code runs --------------------------- */

const whereItRuns: Block[] = [
  p(_('Coming out of Chapter 9, you have a mental model of how a real software system works — every layer, every gate, every kind of failure it can produce. AI coding agents — '), t('Claude Code', 'claude-code'), _(', '), t('Cursor', 'cursor'), _(', '), t('Codex', 'codex'), _(', '), t('GitHub Copilot', 'copilot'), _(', '), t('Aider', 'aider'), _(' — write code at remarkable speed. They can also confidently produce code that ships race conditions, missing authorization checks, naive caching, and the other failure modes the previous chapters walked through. Direct one well and you ship features faster than you could yourself; direct one badly and you ship plausible-looking bugs.')),
  p(_('Concrete picture first. '), t('Claude Code', 'claude-code'), _(' is a program you run in your '), t('terminal', 'terminal'), _('. You give it a folder; it reads, edits, and runs commands inside that folder. The folder needs to be a '), t('git repo', 'repository'), _(', because the workflow ahead — branches, pull requests, reviewing the diff — is git-shaped (Ch 8 if any of that is fuzzy).')),
  p(_('The first session, after a one-time `git clone` of the repo:')),
  code(`cd ~/code/your-repo
claude`),
  p(_('You\'re now in a chat with the agent inside that folder. When the agent says *"I edited `src/payments.ts`,"* a real file on your laptop just changed on disk. Confirm it in your editor or ask the agent to show what it changed.')),
  p(_('This chapter shows the terminal flow because it\'s the lowest-common-denominator surface. The same model applies in the VS Code and JetBrains extensions and in the desktop and web apps — the surface differs, the mental model doesn\'t.')),
  p(_('Two things to confirm before going further. First, your team has cleared you to use an AI coding agent at work; some companies haven\'t approved them yet, and that\'s a separate conversation. Second, the workflow you\'re about to learn is how to direct the agent like a fast contractor who\'s never seen this codebase: orient them, ask them to explain, force them to surface tradeoffs before writing code, read their work before merging.')),
]

/* --------------------------- Slide 4 — What's enforced before you can ship --------------------------- */

const safetyNet: Block[] = [
  p(_('Before walking into the workflow, see the rails. A non-trivial team has automated and human gates between any change and real users — most of which Chapters 8 and 9 already covered. The list, recalled in one place:')),
  ul(
    [_('**Branch protection.** GitHub will refuse a direct push to `main` (Ch 8). All work goes through a branch and a pull request.')],
    [_('**Required review.** A PR can\'t be merged until at least one other engineer has approved it. The merge button is disabled until then.')],
    [_('**CI gates.** Build, lint, type check, and tests run on every PR (Ch 8). A red check blocks the merge.')],
    [_('**Staged rollout.** Even after merge, code reaches users gradually — canary or blue/green deploys (Ch 9) keep most traffic on the old version while the new one is observed.')],
    [_('**Observability.** Logs, metrics, and error trackers (Ch 9) raise an alarm when something goes wrong, often before users notice.')],
    [_('**Rollback.** Canary and blue/green make undo a one-click operation; a revert PR is the permanent path.')],
  ),
  p(_('What this means for you, walking in: you are not the only line of defense. The system catches whole categories of mistake on its own — a broken build, a failing test, a known security pattern, a sudden error spike. You don\'t need to catch those.')),
  p(_('What you do need to catch: the things automation can\'t. Logic that passes all the tests because no test was ever written for the case in question. Plan-level mistakes — wrong table design, wrong place for the auth check — that the agent confidently produces in clean, well-formatted code. Domain-specific judgments no static check will spot. The five phases ahead are aimed at exactly those.')),
]

/* --------------------------- Slide 5 — What your codebase already tells the agent --------------------------- */

const codebaseTellsAgent: Block[] = [
  p(_('Two files in your repo configure how the agent behaves before you type anything. Worth knowing before your first session, because they\'re where your team\'s conventions live.')),
  p(
    t('CLAUDE.md', 'claude-md'),
    _(' is a markdown file in the repo root that the agent loads automatically every time it starts in this folder. Architecture overview, conventions the team follows, build and test commands, "how we work" rules. The agent reads it; you should too.'),
  ),
  p(_('Read it before your first session, but skim — long files have an architecture section and a "how we work" section that are load-bearing; the rest you absorb by doing. If the file doesn\'t exist yet, that\'s normal in teams that haven\'t adopted the convention; you\'ll function fine without one.')),
  p(
    t('Skills', 'claude-skill'),
    _(' are named, reusable workflows the team has saved. Each one lives under `.claude/skills/<name>/SKILL.md` — a markdown file with a name, a one-line description, and a body of instructions the agent loads when the skill is invoked. Browse the folder when you start a task; if there\'s a skill that matches what you\'re about to do, use it instead of writing the prompt from scratch.'),
  ),
  p(_('Skills are invoked by slash command — typing `/review` runs the team\'s review skill. The agent loads the skill\'s instructions and works from those. Common names: `/review`, `/init`, `/security-review`, plus whatever your team has built.')),
  p(_('Both files are shared infrastructure. Edits go through a branch and a PR like any other change. If the agent suggests adding to '), t('CLAUDE.md', 'claude-md'), _(' or writing a new skill mid-session, the move is to open a separate PR for that change so the team can review it — not to let the agent rewrite the file inline.')),
  p(_('Authoring CLAUDE.md additions and skills yourself is a muscle worth growing into; the recap revisits it. For your first sessions, the consumer move — read what\'s there and use it — is enough.')),
]

/* --------------------------- Slide 6 — Phase 1: Get oriented --------------------------- */

const phase1: Block[] = [
  p(_('Before asking the agent to *do* anything, ask it to explain what it\'s looking at. The agent is faster at reading code than you are; let it do that work and report back.')),
  p(_('Useful first prompts when you sit down with a new codebase:')),
  ul(
    [_('"Explain this codebase to me like I\'ve never seen it. What does it do, and what are the main pieces?"')],
    [_('"Draw me a diagram of the main components and how they talk to each other." (Even just the agent listing them by name in order tells you a lot.)')],
    [_('"Walk me through what happens, step by step, when a user logs in." (Or whatever the central action of this product is — checkout, post, search.)')],
    [_('"What runs in the browser vs. on the server in this codebase? Where is the boundary?"')],
  ),
  p(_('What you\'re looking for at this stage isn\'t correctness — it\'s a map. You should be able to point at the architecture in your head when you\'re done.')),
  p(_('One verification habit to build from day one: when the agent cites a specific file, function, or line — *"the auth check happens in `src/middleware/auth.ts:34`"* — open the file and look. The agent will sometimes be confidently wrong about names, paths, or what code does. Catching this is much easier when you\'re still building the map than later, when you\'re trying to reason about a feature on top of a fact that wasn\'t true. If something the agent says doesn\'t match what you see, that\'s a flag worth following up on.')),
  p(_('Once you have the map, the next phase is filling in unfamiliar terms as you encounter them.')),
]

/* --------------------------- Slide 7 — Phase 2: Learn on demand --------------------------- */

const phase2: Block[] = [
  p(_('Software vocabulary is huge. No primer (including this one) covers everything you\'ll see in a real codebase. The good news is the agent is a tutor that works in context.')),
  p(_('When you encounter an unfamiliar term, framework, or pattern, don\'t look it up in the abstract. Ask about it *here*, in this code. (The terms in the examples below — middleware, services, controllers, useEffect — are real names from real codebases. You don\'t need to know any of them yet. That\'s the point.)')),
  ul(
    [_('"There\'s something called middleware in this file. What is it, and why is it here specifically?"')],
    [_('"This file imports from a folder called `services`. What does that folder do? How is it different from `controllers`?"')],
    [_('"What is this `useEffect` thing doing on this page? What would happen if I removed it?"')],
    [_('"Why is some code in `pages/` and some in `components/`? What\'s the convention?"')],
  ),
  p(_('Asking in context is the trick. "What is middleware?" gets you a generic answer that may or may not match how this codebase uses the term. "What is middleware *here*, in this file?" gets you a grounded answer with examples you can actually look at — and verify, the same way you did in Phase 1.')),
  p(_('Once you can navigate the codebase and ask about anything you don\'t recognize, you\'re ready to direct real changes. Which is where the feature template comes in.')),
]

/* --------------------------- Slide 8 — Phase 3: The feature template --------------------------- */

const phase3: Block[] = [
  p(
    _('Before letting the agent write a single line of code for a new feature, run the '),
    t('feature template', 'feature-template'),
    _(' — a fixed list of ten questions that force the agent to think across every layer of the system before producing code.'),
  ),
  p(_('Open with: *"I want to add [feature]. Walk me through:"*')),
  ul(
    [_('**State** — what new tables, columns, or in-memory data?')],
    [_('**API contract** — which endpoints, and what shape do the requests and responses take? (The "contract" is the agreement on what gets sent and what comes back.)')],
    [_('**Identity** — how does each endpoint know who\'s calling?')],
    [_('**Authorization & validation** — who\'s allowed to do this; what input is rejected?')],
    [_('**Concurrency** — does this read-then-write shared data; what\'s the lock or atomic write that prevents two requests from racing?')],
    [_('**Performance** — is anything cached; what\'s the staleness tolerance?')],
    [_('**Failure modes** — what if the database is down, the request times out, a third-party service returns a 500 error?')],
    [_('**Front-end vs. back-end** — what code moves where?')],
    [_('**Telemetry** — if this breaks in production, how would we find out? Which dashboard, which log line, which error tracker?')],
    [_('**Diagram** — show me the data flow before writing code.')],
  ),
  p(_('Close with: *"Don\'t write any code yet — just explain the plan."*')),
  p(_('Each question maps to a chapter you\'ve already done. Identity → Ch 2. Authorization & validation → Ch 3. State → Ch 4. Architecture & performance → Ch 5. Concurrency → Ch 6. Failure modes → Ch 5 (where things break across the network) and Ch 9 (how the team finds out when they do). Telemetry → Ch 9. The template is this primer applied.')),
  p(_('What you\'re reading the answers for: hand-waves. "It\'ll be cached" without saying where, or what the staleness window is, is a hand-wave. "It\'s authenticated" without saying where the check happens is a hand-wave. "We\'ll know if it breaks" without naming a dashboard or an alert is a hand-wave. Each one is a place to push back — and the next slide is a catalog of the ones that show up most often, mapped back to the chapters that named them.')),
]

/* --------------------------- Slide 9 — Phase 4: When the plan doesn't fit --------------------------- */

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
  p(_('Pushing back here is the cheapest place to do it. Once the agent has written 800 lines of code, the cost of redirecting goes up. Running the template before any code gets written is what catches the bad plan in plain English, where reasoning about the system is fastest.')),
]

/* --------------------------- Slide 10 — Phase 5: Narrate the change and use it --------------------------- */

const phase5_diff: Block[] = [
  p(_('Plan iterated, plan accepted. The agent writes the code. A pull request opens. CI goes green. A reviewer approves. Are you done?')),
  p(_('Two more steps before the merge button. The first is making the agent narrate, in plain English, what it actually did. Plans and code drift apart in subtle ways — a check moved to the wrong layer, a transaction quietly omitted, a default value that doesn\'t match what was discussed. CI catches the mistakes that have tests; it does not catch the mistakes that don\'t.')),
  p(_('Open with: *"Before I review this, walk me through the change. For every file you touched, give me one line on what changed and why the plan needed it. Then flag anything that should get my attention — decisions you made on your own, new packages, workarounds, or anything that didn\'t come straight from our plan."*')),
  p(_('What to specifically ask the agent to surface:')),
  ul(
    [_('**Files touched, in plain terms** — one line per file on what changed and why.')],
    [_('**Decisions the agent made on its own** — defaults chosen, libraries picked, error-handling style, naming. Anything that wasn\'t literally in the plan is a judgment call worth a second look.')],
    [_('**New dependencies or packages added** — what and why. Every new package widens the trust surface and deserves a question.')],
    [_('**Workarounds, TODOs, or temporary code** — anything the agent wrote knowing it isn\'t the final answer.')],
    [_('**Confirmations of every red flag from Phase 4** — *"Show me where the authorization check lives."* *"Where is the transaction wrapping the read-then-write?"* *"How is the cache invalidated?"* Make the agent point at lines, not summarize.')],
  ),
  p(_('The second step is using the feature like a user would. Modern teams ship a per-PR preview deploy (Ch 9) — a temporary URL running this PR\'s branch — exactly so a non-coder can click through. Open the preview, do the thing the feature is supposed to let users do: click the like button, log in as a different user and confirm you can\'t edit their comment, submit the form with bad input and watch what happens. Anything you can describe in user terms ("after I log in, the homepage should show my drafts") is a thing you can verify by clicking. Tests don\'t have feelings about whether the design is right; you do.')),
  p(_('Trust-but-verify caveat on the narration step: the agent describing its own work has a confirmation-bias problem. It may describe what it *intended* to write rather than what it wrote. Ask specific questions tied to the plan ("show me the authorization line"), not vague "summarize the change" — specific questions catch the gap. For high-stakes changes (auth, payments, migrations, anything touching real money or real users), open a fresh `claude` session in a new terminal with no plan context and ask it to describe what the diff does. A clean read catches what the author-agent glossed over.')),
  p(_('If the agent can\'t narrate the change cleanly, or you can\'t make the feature behave the way you expected in the preview, that\'s the signal to keep asking before the merge.')),
]

/* --------------------------- Console mocks --------------------------- *
 * The diagram column for Chapter 10 is replaced by a fake Claude Code session.
 * Slides 1–2 use bespoke visualizations (token cascade, API payload) to make
 * the LLM and agent-as-program ideas concrete. One worked feature ("add 👍 likes
 * to comments on a multi-author blog, BlogCorp") is carried across the phase
 * slides so the chapter shows one feature shipped end-to-end through the five
 * phases.
 */

/* Slide 1 — animated token-by-token prediction. The prompt is mid-function;
 * each step shows top-5 next-token candidates, picks one, advances. The
 * fluency-on-code point lands because most steps have a clear top candidate. */
const console_llm: ConsoleSpec = {
  panes: [
    {
      title: 'How the model picks the next token',
      blocks: [
        {
          kind: 'tokenCascade',
          prompt: 'function isValidEmail(email: string): boolean {\n  return email.',
          steps: [
            {
              candidates: [
                { token: 'includes', prob: 0.42 },
                { token: 'match',    prob: 0.22 },
                { token: 'indexOf',  prob: 0.14 },
                { token: 'length',   prob: 0.10 },
                { token: 'trim',     prob: 0.06 },
              ],
              pickedIndex: 0,
            },
            {
              candidates: [
                { token: '(',  prob: 0.91 },
                { token: '?.', prob: 0.04 },
                { token: '<',  prob: 0.02 },
                { token: '=',  prob: 0.02 },
                { token: '[',  prob: 0.01 },
              ],
              pickedIndex: 0,
            },
            {
              candidates: [
                { token: '"@"',   prob: 0.58 },
                { token: "'@'",   prob: 0.20 },
                { token: 'email', prob: 0.08 },
                { token: '"."',   prob: 0.06 },
                { token: '"\\n"', prob: 0.03 },
              ],
              pickedIndex: 0,
            },
            {
              candidates: [
                { token: ';',     prob: 0.34 },
                { token: ' &&',   prob: 0.31 },
                { token: '\n',    prob: 0.20 },
                { token: ' ||',   prob: 0.10 },
                { token: ' ?',    prob: 0.05 },
              ],
              pickedIndex: 1,
            },
            {
              candidates: [
                { token: ' email',  prob: 0.71 },
                { token: ' /',      prob: 0.10 },
                { token: ' !',      prob: 0.06 },
                { token: ' (',      prob: 0.05 },
                { token: ' typeof', prob: 0.05 },
              ],
              pickedIndex: 0,
            },
          ],
          finalNote: '...one token at a time, until the model picks something that ends the function. Notice how the second step is nearly certain — the structure of code constrains what comes next much harder than prose would.',
        },
      ],
    },
  ],
  caption: 'The model ranks every possible next token; the agent picks one and asks again. That loop is the whole generator.',
}

/* Slide 2 — stacked panes: chat the user sees on top, the API payload that
 * gets sent on the bottom. The payload pane scrolls because the transcript
 * always exceeds its share of the height — that's the point. Reuses the
 * BlogCorp likes scenario for continuity with the phase slides. */
const console_payload: ConsoleSpec = {
  layout: 'stacked',
  panes: [
    {
      title: 'Chat — what you see',
      blocks: [
        { kind: 'user',  text: 'Add likes to comments.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'Plan: new comment_likes table, POST/DELETE /api/comments/:id/like, idempotent on dup clicks. user_id from req.userId, never the body. OK to implement?' },
        { kind: 'spacer' },
        { kind: 'user',  text: 'Looks good. Implement it.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'Done — added the migration, the routes, and the heart icon. PR #142 is open.' },
        { kind: 'spacer' },
        { kind: 'user',  text: 'Show me the auth line.' },
      ],
    },
    {
      title: 'Sent to model on this turn',
      blocks: [
        {
          kind: 'payload',
          entries: [
            { kind: 'systemPrompt', text: 'You are Claude Code. Tools available: Read, Edit, Bash, Grep, Glob, … Follow project conventions.' },
            { kind: 'context', label: 'CLAUDE.md', detail: '(2.1 KB, loaded from repo root)' },
            { kind: 'context', label: 'Skills available', detail: '/review · /init · /security-review' },
            { kind: 'message', role: 'user',      text: 'Add likes to comments.' },
            { kind: 'message', role: 'assistant', text: 'Plan: new comment_likes table, POST/DELETE /api/comments/:id/like, …' },
            { kind: 'message', role: 'user',      text: 'Looks good. Implement it.' },
            { kind: 'toolUse', tool: 'Read', args: '"api/routes/comments.ts"' },
            { kind: 'toolResult', preview: '<file contents>', sizeKB: 4.2 },
            { kind: 'toolUse', tool: 'Edit', args: '"api/routes/likes.ts", …' },
            { kind: 'toolResult', preview: 'Created file', sizeKB: 1.8 },
            { kind: 'message', role: 'assistant', text: 'Done — added the migration, the routes, and the heart icon. PR #142 is open.' },
            { kind: 'message', role: 'user',      text: 'Show me the auth line.', latest: true },
          ],
        },
      ],
    },
  ],
  caption: 'Top: the chat as you see it. Bottom: every byte the agent re-sends to the model on this turn — system prompt, CLAUDE.md, every prior message, every tool call, every tool result.',
}

/* Slide 3 — literal first-run terminal. */
const console_s1: ConsoleSpec = {
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

/* Slide 4 — what gates an open PR has between merge and live. */
const console_s2: ConsoleSpec = {
  panes: [
    {
      title: 'PR #142 · Add comment likes',
      branch: 'feature/likes → main',
      blocks: [
        { kind: 'banner', lines: [
          '┌─ Status ─────────────────────────────────┐',
          '│  ✓  build           passed in 2m 14s     │',
          '│  ✓  type-check      passed               │',
          '│  ✓  lint            passed               │',
          '│  ✓  tests           passed (148/148)     │',
          '│  ⏸  approval        0 / 1 required       │',
          '└──────────────────────────────────────────┘',
        ] },
        { kind: 'spacer' },
        { kind: 'banner', lines: [
          '┌─ Branch protection ──────────────────────┐',
          '│  ⛔  direct push to main: blocked        │',
          '│  ⛔  merge without approval: blocked     │',
          '│  ⛔  merge with red CI: blocked          │',
          '└──────────────────────────────────────────┘',
        ] },
        { kind: 'spacer' },
        { kind: 'banner', lines: [
          '┌─ After merge ────────────────────────────┐',
          '│  →  canary 5% → 25% → 100%               │',
          '│  →  Sentry, Datadog watching             │',
          '│  →  rollback: re-route or revert PR      │',
          '└──────────────────────────────────────────┘',
        ] },
      ],
    },
  ],
  caption: 'The rails between an open PR and real users. You inherit them; the phases ahead handle what they don\'t catch.',
}

/* Slide 5 — startup banner showing CLAUDE.md and skills loaded. */
const console_s3: ConsoleSpec = {
  panes: [
    {
      cwd: 'blogcorp',
      branch: 'Branch: main',
      blocks: [
        { kind: 'shell', text: 'blogcorp $ claude' },
        { kind: 'spacer' },
        { kind: 'banner', lines: [
          '┌──────────────────────────────────────────┐',
          '│  Claude Code · v1.x                      │',
          '│  /Users/you/code/blogcorp                │',
          '│                                          │',
          '│  Loaded:                                 │',
          '│    CLAUDE.md  (2.1 KB)                   │',
          '│                                          │',
          '│  Skills available (4):                   │',
          '│    /review                               │',
          '│    /init                                 │',
          '│    /security-review                      │',
          '│    /deploy-staging                       │',
          '└──────────────────────────────────────────┘',
        ] },
        { kind: 'spacer' },
        { kind: 'user', text: '/review' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'Running the team\'s review skill — checks the diff against CLAUDE.md conventions, then reports.' },
      ],
    },
  ],
  caption: 'CLAUDE.md is read on every startup. Skills are saved workflows you invoke by name.',
}

/* Slide 6 — Phase 1, orient. */
const console_s4: ConsoleSpec = {
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
        { kind: 'flag', note: 'Open api/middleware/auth.ts and api/routes/comments.ts — confirm the files and the line referenced. Verifying claims is part of the phase.' },
      ],
    },
  ],
  caption: 'You now have a map. If anything here doesn\'t match what\'s actually in the file, that\'s where to dig.',
}

/* Slide 7 — Phase 2, learn on demand. */
const console_s5: ConsoleSpec = {
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

/* Slide 8 — Phase 3, the feature template. */
const console_s6: ConsoleSpec = {
  phase: { n: 3, total: 5, label: 'Feature template' },
  panes: [
    {
      cwd: 'blogcorp',
      branch: 'Branch: feature/likes',
      blocks: [
        { kind: 'user', text: "I want to add likes to comments. Walk me through: state, API contract, identity, authorization & validation, concurrency, performance, failure modes, front-end vs. back-end, telemetry, and a diagram. Don't write any code yet." },
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
          { label: 'Telemetry', chapter: 'Ch 9', text: 'New Datadog metric "likes.write.latency" + error count by route. Sentry already tags 5xx on /api/* — no extra wiring. Existing "comments dashboard" gets a likes panel.' },
          { label: 'Diagram', text: '[browser] → POST /like → [api/auth] → [comments handler] → [postgres: insert] → count via COUNT(*)' },
        ] },
      ],
    },
  ],
  caption: 'Each line of the answer is a place you can push back. The next slide is exactly that.',
}

/* Slide 9 — Phase 4, pushback. */
const console_s7: ConsoleSpec = {
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
  caption: 'Pushback in plain English: "won\'t this race?", "where does user_id come from?". Each flag has a chapter behind it.',
}

/* Slide 10 — Phase 5, narrate the diff and use the preview. */
const console_s8: ConsoleSpec = {
  phase: { n: 5, total: 5, label: 'Narrate and use' },
  panes: [
    {
      cwd: 'blogcorp',
      branch: 'Branch: feature/likes',
      blocks: [
        { kind: 'user', text: 'Before I review this, walk me through the change. For every file you touched, one line on what changed and why. Then flag anything you decided on your own.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'PR #142 — Add comment likes\nFiles (4):\n  db/migrations/0042_comment_likes.sql\n      New comment_likes table + index. Unique key on (comment_id, user_id) for idempotency.\n  api/routes/likes.ts\n      New POST and DELETE /api/comments/:id/like. user_id from req.userId. No request-body trust.\n  api/routes/comments.ts\n      Comment list now joins comment_likes to return count and viewer_has_liked.\n  web/components/Comment.tsx\n      Heart icon, optimistic toggle, rolls back on 4xx/5xx.\n\nDecisions I made on my own:\n  • Used Postgres ON CONFLICT DO NOTHING for idempotency. Plan didn\'t specify; preserves the "double-click is a no-op" property.\n  • Picked lucide-react for the heart icon — already in web/ deps; no new package.\n  • Optimistic UI rolls back after a 600ms timeout, not on a specific error code. Worth confirming.' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Show me the line where authorization happens.' },
        { kind: 'spacer' },
        { kind: 'agent', text: 'api/routes/likes.ts:8 — handler runs after the auth middleware (registered in api/server.ts:34). req.userId is guaranteed set; if absent, auth.ts returned 401 before this handler runs.' },
        { kind: 'spacer' },
        { kind: 'shell', text: 'Preview: https://blogcorp-pr-142.preview.example.com' },
        { kind: 'flag', note: 'Click through: like a comment, refresh, unlike, log in as a different user and confirm the count is shared. Tests don\'t feel; you do.' },
      ],
    },
  ],
  caption: 'Two final gates: the agent narrates what it actually did, and you use the feature like a user would.',
}

/* Slide 11 — recap cookbook of the five phase prompts. */
const console_s9: ConsoleSpec = {
  panes: [
    {
      title: 'The five prompts',
      blocks: [
        { kind: 'user', text: 'Explain this codebase to me like I\'ve never seen it. What does it do, and what are the main pieces?' },
        { kind: 'spacer' },
        { kind: 'user', text: 'There\'s a [term] in this file. What is it, here, specifically?' },
        { kind: 'spacer' },
        { kind: 'user', text: 'I want to add [feature]. Walk me through: state, API contract, identity, authorization & validation, concurrency, performance, failure modes, front-end vs. back-end, telemetry, and a diagram. Don\'t write any code yet.' },
        { kind: 'spacer' },
        { kind: 'user', text: 'Won\'t this race / where does user_id come from / what\'s the staleness window / where\'s the back-end check / how would we know if it broke?' },
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
    { id: 's1',  level: 101, headline: 'What\'s actually under the hood: a language model', body: { kind: 'prose', blocks: llmIntro },          console: console_llm },
    { id: 's2',  level: 101, headline: 'What an agent is: tools, prompts, and a loop around the model', body: { kind: 'prose', blocks: agentDef }, console: console_payload },
    { id: 's3',  level: 101, headline: 'Where Claude Code runs',                              body: { kind: 'prose', blocks: whereItRuns },       console: console_s1 },
    { id: 's4',  level: 101, headline: 'What\'s enforced before you can ship',                body: { kind: 'prose', blocks: safetyNet },         console: console_s2 },
    { id: 's5',  level: 101, headline: 'What your codebase already tells the agent',          body: { kind: 'prose', blocks: codebaseTellsAgent }, console: console_s3 },
    { id: 's6',  level: 101, headline: 'Phase 1 — Get oriented',                              body: { kind: 'prose', blocks: phase1 },            console: console_s4 },
    { id: 's7',  level: 101, headline: 'Phase 2 — Learn on demand',                           body: { kind: 'prose', blocks: phase2 },            console: console_s5 },
    { id: 's8',  level: 101, headline: 'Phase 3 — Run the feature template',                  body: { kind: 'prose', blocks: phase3 },            console: console_s6 },
    { id: 's9',  level: 101, headline: 'Phase 4 — When the plan doesn\'t fit',                body: { kind: 'prose', blocks: phase4_pushback },   console: console_s7 },
    { id: 's10', level: 101, headline: 'Phase 5 — Narrate the change and use it',             body: { kind: 'prose', blocks: phase5_diff },       console: console_s8 },
    {
      id: 's11',
      level: 101,
      kind: 'recap',
      headline: 'What you have, end to end',
      console: console_s9,
      body: {
        kind: 'recap',
        learned: [
          'A mental model of how software systems work — request flow, state, identity, validation, concurrency, architecture, code lifecycle, deployment',
          'A picture of the rails the team has between you and production — branch protection, CI, review, canary, observability, rollback',
          'A consumer view of the codebase\'s agent-facing knowledge — CLAUDE.md as standing instructions, skills as named workflows',
          'A five-phase workflow with an AI agent — orient, learn on demand, run the feature template, push back on red flags, narrate the change and use it',
          'A ten-question template that forces every plan to surface the tradeoffs the previous chapters named',
          'A vocabulary of warning signs — the patterns that quietly produce bugs, and the chapter each one maps back to when you need to push back',
        ],
        whereInSystem: [
          _('You are not a part of the diagram. You are the human watching it, directing changes to it, and verifying what comes back. The agent is your co-worker. The diagram is your shared reference. The feature template is your shared protocol.'),
        ],
        bridge: [
          _('Day one is phases 1 and 2: orient and learn on demand. You don\'t need to run the feature template on Monday. Phases 3 through 5 come into play the first time you direct a real change. After a few features, the patterns in your own corrections start repeating — that\'s when you grow into editing CLAUDE.md and writing skills, the producer side of the slide-3 file pair. Come back to specific chapters when something needs refreshing; the glossary is one click away.'),
        ],
      },
    },
  ],
}
