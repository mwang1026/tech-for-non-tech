import type { Chapter, Block } from './types'
import { _, t, p, ul, step, steps } from './authoring'

/* ============================================================================
 * Chapter 6 — Concurrency (101)
 *
 * Diagram visible at this chapter / 101: browser → cdn → lb → be-pool → cache
 * + queue + workers + db-primary. The queue + workers cluster is the new
 * element this chapter introduces — drawn alongside the cache/aux row, with
 * arrows from be-pool → queue → workers → db-primary.
 *
 * Slide arc:
 *   1.  Many at once, two strategies      (frame: sync vs async)
 *   2.  Synchronous: what & why           (define sync, when to pick it)
 *   3.  When sync requests collide        (race condition walkthrough)
 *   4.  Locks and atomicity               (transactions, locks, atomic UPDATE alt)
 *   5.  Read-modify-write everywhere      (pattern recognition)
 *   6.  Asynchronous: what & why          (define async, when to pick it)
 *   7.  Queues and workers                (the mechanism — diagram update)
 *   8.  What async costs                  (3 new concerns)
 *   9.  Sync vs async — choosing          (judgment slide)
 *   10. Recap
 * ============================================================================ */

/* --------------------------- Slide 1 — Many at once, two strategies --------------------------- */

const manyAtOnce: Block[] = [
  p(_('Up until now we’ve followed a single request through the system. The gates from Chapter 3 do their job — token verified, permission checked, data validated — and the request flows through cleanly.')),
  p(_('The reality is busier. A real back-end has thousands of requests in flight at any given moment. Most of them touch different data and never interact. Some of them collide.')),
  p(_('Before we get to the collisions, a frame: a back-end can handle each request one of two ways.')),
  ul(
    [
      t('Synchronously', 'synchronous'),
      _(' — caller asks, server does the work, server answers, all in the same back-and-forth. The user’s browser holds the connection open and waits. This is the default we’ve been drawing.'),
    ],
    [
      t('Asynchronously', 'asynchronous'),
      _(' — caller hands the work off to be done later. Server immediately replies "got it." The actual work happens out of the request, and the user finds out the result some other way.'),
    ],
  ),
  p(_('Each comes with its own appeal and its own pitfalls. The rest of the chapter takes them one at a time, sync first.')),
]

/* --------------------------- Slide 2 — Synchronous: what & why --------------------------- */

const syncDefinition: Block[] = [
  p(
    _('A '), t('synchronous', 'synchronous'),
    _(' request is the shape of every flow we’ve drawn so far. The browser opens a connection, sends a request, and waits with that connection held open. The server reads the request, does whatever the work is — query the database, check the user’s permission, render a response — and writes back. The user’s browser receives the answer and unblocks.'),
  ),
  p(_('From the back-end’s perspective: a single request kicks off whatever work is needed — function calls, database queries, calls out to other services — and once that work finishes, the result goes out as the response. The shape from the outside is still one in, one out, all in one continuous moment.')),
  p(_('Why teams reach for sync first:')),
  ul(
    [_('The user gets an immediate, definitive answer in the same call.')],
    [_('The code is the simplest possible shape — one function, one return value, no extra moving parts. Easy to write, easy to debug.')],
    [_('The mental model matches everyday conversation: ask a question, get an answer.')],
  ),
  p(_('Where it fits: anywhere the user is actively waiting and the work is fast. Logging in. Posting a comment. Checking whether a username is taken. Fetching a page. The user wants the answer to keep going, and the server can produce it in well under a second.')),
  p(_('The catch starts to show when more than one of these is happening at once on the same data.')),
]

/* --------------------------- Slide 3 — When sync requests collide --------------------------- */

const collide: Block[] = [
  p(_('Imagine we run an online store. There’s one item left in stock — the last copy of a popular book. Two users, on opposite sides of the country, both decide to buy it at almost the exact same moment. Within 50 milliseconds of each other, both browsers send a "buy this book" request to our back-end. Press → to walk through what happens.')),
  steps(
    step(
      [_('Both requests arrive at the back-end almost simultaneously. The load balancer hands them to two different back-end servers, both of which begin processing in parallel.')],
      { highlight: ['be-1', 'be-3'], status: 'neutral', focus: 'app' },
    ),
    step(
      [_('Both back-ends read the inventory count from the database. Both read "1." Neither has written anything yet — they’re looking at the same starting state.')],
      { highlight: ['db-primary'], status: 'neutral', focus: 'data' },
    ),
    step(
      [_('Both back-ends check: is the count greater than zero? Both see "yes, 1 > 0, the book is in stock." Both decide to proceed with the sale.')],
      { highlight: ['be-1', 'be-3'], status: 'neutral', focus: 'app' },
    ),
    step(
      [_('Both back-ends subtract 1 from the count and write the new value back. Both write "0." The second write silently overwrites the first as if nothing went wrong.')],
      { highlight: ['db-primary'], status: 'reject', focus: 'data' },
    ),
    step(
      [_('Both back-ends confirm the sale. Both customers get a confirmation email. We just sold the same book twice — and one of them is going to be very disappointed when their order doesn’t ship.')],
      { highlight: ['browser'], status: 'reject', focus: 'full' },
    ),
  ),
  p(
    _('This is called a '), t('race condition', 'race-condition'),
    _('. Two operations racing against each other on the same data, where the outcome depends on which one happens to win — and where the losing write gets silently overwritten. In a typical setup, with no special protection, this is exactly what happens. At low traffic you may never see it, but it’s the kind of bug that passes every test, never reproduces locally, and only shows up in production when traffic is high enough that two requests really do land in the same instant.'),
  ),
  p(_('In a typical relational database — Postgres, MySQL, the kind we’ve been drawing — the fix is built right in. We just have to use it correctly. (Some distributed and eventually-consistent setups don’t offer the same locks directly; in those, the application has to coordinate the protection itself. That’s 201 territory; the rest of this chapter sticks to the database-level case.)')),
]

/* --------------------------- Slide 4 — Locks and atomicity --------------------------- */

const locks: Block[] = [
  p(_('What we need is a way to tell the database: "while I’m working with this row, nobody else gets to touch it. I’m going to read it, decide what to do, and write the result. Until I’m done, every other request that wants this row has to wait."')),
  p(
    _('Databases have this built in. It’s called a '), t('transaction', 'transaction'),
    _('. A transaction wraps a sequence of operations into a single unit, with two guarantees:'),
  ),
  ul(
    [
      t('Atomic', 'atomic'),
      _(' — all or nothing. Either every operation in the transaction succeeds and gets saved (a "commit"), or any failure undoes everything as if it never happened (a "rollback"). There’s no halfway state where some changes stuck and others didn’t.'),
    ],
    [
      t('Lock', 'lock'),
      _(' — you can ask the database to hold a lock on the rows you’re working with, so other transactions that want the same rows wait their turn. The lock releases when the transaction commits or rolls back.'),
    ],
  ),
  p(_('Important catch: in most databases, just wrapping reads and writes in a transaction is *not* enough on its own. By default, two transactions can both read the same "1 in stock" before either has written. The lock that prevents this has to be asked for explicitly — it doesn’t come for free.')),
  p(_('Done correctly, the inventory replay works:')),
  ul(
    [_('Request A asks for the lock and gets it. Request B asks for the lock too and is told to wait.')],
    [_('Request A reads "1," subtracts to "0," commits the change. The lock releases.')],
    [_('Request B’s wait ends. It reads the now-current "0" — and correctly rejects the sale.')],
    [_('First user gets the book. Second user gets a polite "sold out." The database stays consistent.')],
  ),
  p(_('A simpler alternative when the logic is simple enough: tell the database to do the read, the check, and the write all in a single operation — "decrease the count by one, but only if it’s still greater than zero." The database treats it as one indivisible step, so two requests can’t both pass the check. It works when the operation really is that simple. The moment the decision is multi-step or touches multiple rows, you’re back to transactions and locks.')),
]

/* --------------------------- Slide 5 — Read-modify-write everywhere --------------------------- */

const rmw: Block[] = [
  p(
    _('The inventory example is dramatic, but the same shape shows up everywhere. Anywhere code reads a value, decides something based on it, and writes a new value back, there’s a potential race condition. The pattern has a name: '),
    t('read-modify-write', 'read-modify-write'),
    _('.'),
  ),
  p(_('Some shapes this takes:')),
  ul(
    [_('Counters — inventory, page views, likes, "now there’s one more of these."')],
    [_('Balances — adding to or subtracting from money.')],
    [_('Uniqueness checks — "is this username taken?" before creating an account with it.')],
    [_('State transitions — moving an order from "pending" to "paid" to "shipped."')],
  ),
  p(_('These bugs are insidious because they almost always work fine. Two users rarely sign up with the same username at the exact same instant. Two payments rarely hit the same account at the same nanosecond. So under normal load, the code passes every test. Then traffic spikes — Black Friday, a viral tweet, an automated stress test — and suddenly the impossible coincidence happens many times an hour.')),
  p(_('The rule of thumb: any time the back-end reads a value and then writes a new value based on it, ask whether two of those operations could happen at the same time on the same row. If yes, you need a transaction with the right protection — the previous slide spelled out the options.')),
  p(_('That covers the synchronous side of concurrency. Now the other half: what if the user shouldn’t be waiting on the answer in the first place?')),
]

/* --------------------------- Slide 6 — Asynchronous: what & why --------------------------- */

const asyncDefinition: Block[] = [
  p(
    _('An '), t('asynchronous', 'asynchronous'),
    _(' request starts the same way any other does — the user’s browser (or another system) sends a call to the server. What’s different is what the server does once it receives it. Instead of doing the work and replying with the answer, the server just records that there’s work to do, immediately replies "got it," and the actual work happens later, out of the request path, on its own time.'),
  ),
  p(_('Four reasons teams reach for async, each one a real cost sync can’t pay:')),
  ul(
    [_('**Slow work.** Encoding a video takes minutes. Generating a fifty-page report takes thirty seconds. Sending ten thousand emails takes a while. The user shouldn’t sit there with a spinner.')],
    [_('**Server capacity.** Every in-flight request consumes one of the server’s slots for as long as it runs. Slow sync work means fewer slots free for everyone else, and the back-end starts dropping requests when it runs out.')],
    [_('**Crash survival.** If the work lives only inside the running request and the server crashes mid-work, the work is lost — there’s no record of what we were trying to do. Async work can be made durable, so it survives crashes and gets retried.')],
    [_('**Spike absorption.** When ten thousand users all submit at once, sync would melt the back-end. Async lets the system queue the work up and chew through it at a sustainable pace.')],
  ),
  p(_('Async needs a place to put the pending work, and something to do the work. That’s the next slide.')),
]

/* --------------------------- Slide 7 — Queues and workers --------------------------- */

const queuesAndWorkers: Block[] = [
  p(_('Async needs two new pieces of infrastructure, drawn alongside the back-end fleet:')),
  ul(
    [
      t('Message queue', 'message-queue'),
      _(' — a piece of infrastructure that durably stores pending jobs. The back-end writes a job description into the queue and immediately moves on. The job sits there until something picks it up.'),
    ],
    [
      t('Worker pool', 'worker-pool'),
      _(' — a separate fleet of programs whose only job is to pull jobs off the queue, do them, and mark them done. Workers run as their own service, distinct from the back-end fleet that handles user requests.'),
    ],
  ),
  p(_('The producer (the back-end) and the consumer (the workers) never talk directly. They communicate through the queue. That’s the point — it decouples them. The back-end can keep accepting requests at full speed even while the workers are slowly chewing through a long backlog. If a worker crashes mid-job, the queue holds onto the job until another worker picks it up.')),
  p(_('Common queues you’ll see in real systems:')),
  ul(
    [t('AWS SQS', 'sqs'), _(' — managed by AWS; you don’t run any servers for it yourself. The default for anything else running on AWS.')],
    [t('RabbitMQ', 'rabbitmq'), _(' — open-source, self-hosted. The general-purpose workhorse when you want full control.')],
    [t('Kafka', 'kafka'), _(' — heavy-duty event streaming, used when the volume is enormous or many consumers need to read the same stream. Overkill for small job queues; reach for SQS or RabbitMQ first.')],
  ),
  p(_('On the diagram: a queue and a worker pool now sit alongside the cache, with the back-end writing jobs into the queue, workers pulling them out, and workers writing results back into the database. From here on, every async flow runs through that path.')),
]

/* --------------------------- Slide 8 — What async costs --------------------------- */

const asyncCosts: Block[] = [
  p(_('Going async fixes the wait problem but introduces three new things to worry about. Each one is genuinely new — they don’t exist in a sync world.')),
  p(_('**The result arrives through a different channel.** The original request already returned "got it" — not the answer. The actual outcome surfaces later through one of the patterns from Chapter 5: polling a status endpoint, receiving a webhook, getting a push notification, or being told "we’ll email you when it’s ready." Whichever pattern you pick, it has to be designed in deliberately. The user has to know what to expect.')),
  p(_('**Jobs can run more than once.** If a worker crashes mid-job, the queue redelivers — the same job runs again. So the same job may run twice. The 101 takeaway when an agent is writing async work: ask *"what if this runs twice — does the user get charged twice, do we send the email twice, do we ship the order twice?"* The pattern that handles this safely has a name; that’s a 201 topic.')),
  p(_('**Workers still race.** Async doesn’t rescue you from concurrency. Two workers can grab two different jobs that touch the same row at the same instant — and the same race conditions from earlier in this chapter still apply. Transactions and locks still earn their keep, just inside the worker now instead of inside the request handler.')),
  p(_('That last one is worth pausing on: async and concurrency are two separate problems. Async decides where the work runs (in the request, or later in a worker). Concurrency decides what protects shared rows when many things touch them at once. Most real systems need both.')),
]

/* --------------------------- Slide 9 — Sync vs async: choosing --------------------------- */

const choosing: Block[] = [
  p(_('Sync vs. async isn’t a project-wide religion. It’s a per-feature decision. Two questions decide it:')),
  ul(
    [_('**Is the user waiting on this answer to keep going?** If yes, lean sync. The user wants login to return a session, the comment to appear, the username check to come back yes or no.')],
    [_('**Is the work fast and reliable?** If yes, lean sync. Anything that finishes in well under a second and rarely fails belongs in the request path.')],
  ),
  p(_('When either answer is no — the work is slow, or fragile, or shouldn’t block the user — go async. Sending email. Generating a report. Encoding video. Settling a payment with the bank. Indexing an uploaded document. Calling a flaky third-party API on a retry. Notifying ten thousand subscribers. None of these belong in a request the user is staring at.')),
  p(_('The common hybrid: sync acknowledgment + async work. The request returns "got your video, processing now, we’ll notify you when it’s ready" in a few hundred milliseconds. The heavy work runs in the background. The user sees fast feedback and a clear expectation for how the result will arrive.')),
  p(_('Why this is judgment territory when working with an agent: an agent will default to whatever is simpler to write — usually sync. That’s fine until you ship a feature that takes thirty seconds and the browser times out, or until traffic spikes and the back-end melts. The right question to push the agent on:')),
  p(_('  *"How long will this realistically take, and what should the user see while it runs?"*')),
  p(_('That one question pushes the agent off autopilot and makes the sync-vs-async call deliberate.')),
]

/* --------------------------- Chapter 6 export --------------------------- */

export const chapter06: Chapter = {
  id: 'ch6',
  number: 6,
  title: 'Concurrency',
  subtitle: 'Many requests at once: sync, async, and what goes wrong',
  slides: [
    { id: 's1', level: 101, headline: 'Many at once, two strategies', body: { kind: 'prose', blocks: manyAtOnce }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Synchronous: what it is, when you’d pick it', body: { kind: 'prose', blocks: syncDefinition }, diagramFocus: 'app' },
    { id: 's3', level: 101, headline: 'When sync requests collide', body: { kind: 'prose', blocks: collide }, diagramFocus: 'data' },
    { id: 's4', level: 101, headline: 'Locks and atomicity', body: { kind: 'prose', blocks: locks }, diagramFocus: 'data' },
    { id: 's5', level: 101, headline: 'Read-modify-write everywhere', body: { kind: 'prose', blocks: rmw }, diagramFocus: 'data' },
    { id: 's6', level: 101, headline: 'Asynchronous: what it is, when you’d pick it', body: { kind: 'prose', blocks: asyncDefinition }, diagramFocus: 'app' },
    { id: 's7', level: 101, headline: 'Queues and workers', body: { kind: 'prose', blocks: queuesAndWorkers }, diagramFocus: 'data' },
    { id: 's8', level: 101, headline: 'What async costs', body: { kind: 'prose', blocks: asyncCosts }, diagramFocus: 'data' },
    { id: 's9', level: 101, headline: 'Sync vs. async: choosing per feature', body: { kind: 'prose', blocks: choosing }, diagramFocus: 'full' },
    {
      id: 's10',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Many requests run at once. The back-end handles each one synchronously (caller waits for the answer in the same call) or asynchronously (caller is told "got it" and the work happens later)',
          'Sync race conditions appear when two requests touch the same row at the same instant; transactions plus an explicitly-asked-for row lock are the fix. A single indivisible database operation is a simpler alternative when the logic is straightforward',
          'Read-modify-write is the shape to look for — counters, balances, uniqueness checks, state transitions on shared data',
          'Async work goes through a queue + worker pool, separate from the back-end fleet. This buys durability, decoupling, and absorbed spikes',
          'Async costs: results come back through a different channel, jobs can run twice if a worker crashes, and workers still need locks when they touch shared rows',
          'The sync-vs-async call is per feature. Sync if the user is waiting on the answer and the work is fast; async if the work is slow, fragile, or shouldn’t block',
        ],
        whereInSystem: [
          _('Concurrency lives at the seam between the '),
          t('back-end', 'back-end'),
          _(' and the '),
          t('database', 'database'),
          _(' — the database’s own transactions and locks are the tool that makes simultaneous reads and writes safe. The async path adds a '),
          t('queue', 'message-queue'),
          _(' and a '),
          t('worker pool', 'worker-pool'),
          _(' alongside the back-end fleet, drawn as a separate service that consumes jobs from the queue and writes results back to the database.'),
        ],
        bridge: [
          _('Coming up — Chapter 7: Putting It Together. We’ve now built every piece of the system Act I covers — identity, authorization, validation, state, architecture, concurrency. The next chapter walks real requests end-to-end through that whole machine, watching where each one stops, succeeds, or gets rejected.'),
        ],
      },
    },
  ],
}
