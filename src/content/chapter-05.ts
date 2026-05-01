import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
// const h = (text: string): Block => ({ kind: 'h', text })
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })

/* ============================================================================
 * Chapter 5 — Concurrency (101)
 *
 * Diagram visible at this chapter / 101: browser → fe-pool → be-pool → cache + db-primary.
 * No new boxes — concurrency is conceptual at the data tier. Most slides focus on 'data'.
 *
 * Slide arc:
 *   1. When requests collide          (sets up the problem; disambiguates from Ch 3 isolation)
 *   2. Two buyers, one item           (the canonical race condition, walked step by step)
 *   3. All-or-nothing                 (transactions, locks, atomic / commit / rollback)
 *   4. Anywhere you read, then write  (the broader read-modify-write pattern)
 *   5. Recap + Claude Code prompts
 * ============================================================================ */

/* --------------------------- Slide 1 — When requests collide --------------------------- */

const collide: Block[] = [
  p(_('Up to now we’ve thought about each request on its own. Token verified, permission checked, data validated — the gates from Chapter 4 do their job and the request flows through cleanly.')),
  p(_('But the back-end isn’t serving one request at a time. A real system might have thousands of requests in flight at any given moment. Most of them touch different data and never interact. But every so often, two requests touch the same piece of data at the same instant — and a whole new class of problem appears. The gates pass both of them. The validation says yes to both. But because they overlap in time, they corrupt each other’s work.')),
  p(_('The canonical example: the inventory problem. Two buyers, one item.')),
]

/* --------------------------- Slide 2 — Two buyers, one item --------------------------- */

const twoBuyers: Block[] = [
  p(_('Imagine we run an online store. There’s one item left in stock — let’s call it the last copy of a popular book. Two users, on opposite sides of the country, both decide to buy it at almost the exact same moment. Within 50 milliseconds of each other, both browsers send a "buy this book" request to our back-end.')),
  p(_('Here’s what each request does, step by step:')),
  ul(
    [_('Step 1 — Read the inventory count for this book from the database. Both requests do this. Both read "1."')],
    [_('Step 2 — Check whether the count is greater than zero. Both requests do this. Both see "yes, 1 > 0, the book is in stock."')],
    [_('Step 3 — Subtract 1 from the count and write the new value back. Both requests do this. Both write "0."')],
    [_('Step 4 — Confirm the sale to the user. Both requests do this. Both customers get a confirmation email.')],
  ),
  p(_('We just sold the same book twice. Both customers think they bought the last copy. One of them is going to be very disappointed when their order doesn’t ship. The numbers don’t add up because both requests read the same "1" before either of them got the chance to write "0."')),
  p(
    _('This is called a '), t('race condition', 'race-condition'),
    _('. Two operations racing against each other, where the outcome depends on which one happens to win — and at low load, you might never see one. It’s the kind of bug that passes every test, never reproduces locally, and only shows up in production when traffic is high enough that two requests really do land in the same instant.'),
  ),
  p(_('The fix exists in the database itself — we just have to use it correctly.')),
]

/* --------------------------- Slide 3 — All-or-nothing --------------------------- */

const transactions: Block[] = [
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
  p(_('Important catch: in most databases, just wrapping reads and writes in a transaction is *not* enough on its own. By default, two transactions can both read the same "1 in stock" before either has written. The lock that prevents this has to be asked for — either explicitly (the standard form is `SELECT ... FOR UPDATE`, which means "lock these rows while I work with them") or by raising the database to its strongest isolation level. An even simpler fix when it fits: express the read-and-write as one atomic statement (`UPDATE inventory SET count = count - 1 WHERE count > 0`) so the database never has to coordinate two separate steps.')),
  p(_('Done correctly, the inventory replay works: Request A locks the row, reads "1," subtracts to "0," commits, releases. Request B was waiting; the moment the lock releases, it reads "0" and correctly rejects the sale. First user gets the book; second user gets a polite "sold out." Database stays consistent.')),
  p(_('Transactions exist for exactly this. The work is in noticing where to use them — and asking for the lock you actually need.')),
]

/* --------------------------- Slide 4 — Anywhere you read, then write --------------------------- */

const readModifyWrite: Block[] = [
  p(
    _('The inventory example is dramatic, but the same shape shows up everywhere. Anywhere code reads a value, decides something based on it, and writes a new value back — with no transaction in between — there’s a potential race condition. The pattern is called '),
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
  p(_('The rule of thumb: any time the back-end reads a value and then writes a new value based on it, ask whether two of those operations could happen at the same time on the same row. If yes, you need a transaction *and* the right kind of lock — the previous slide spelled out which.')),
]

/* --------------------------- Chapter 5 export --------------------------- */

export const chapter05: Chapter = {
  id: 'ch5',
  number: 5,
  title: 'Concurrency',
  subtitle: 'When two requests want the same thing',
  slides: [
    { id: 's1', level: 101, headline: 'When requests collide', body: { kind: 'prose', blocks: collide }, diagramFocus: 'app' },
    { id: 's2', level: 101, headline: 'Two buyers, one item', body: { kind: 'prose', blocks: twoBuyers }, diagramFocus: 'data' },
    { id: 's3', level: 101, headline: 'All-or-nothing', body: { kind: 'prose', blocks: transactions }, diagramFocus: 'data' },
    { id: 's4', level: 101, headline: 'Anywhere you read, then write', body: { kind: 'prose', blocks: readModifyWrite }, diagramFocus: 'data' },
    {
      id: 's5',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Concurrency is what happens when many requests run at the same time on shared data — a correctness problem, distinct from the per-user data separation in Chapter 3',
          'Race conditions are the failure mode: two requests read the same value, both decide to act on it, both write back — and the second write silently overwrites the first',
          'Database transactions plus an explicit row lock (the standard form is `SELECT ... FOR UPDATE`) are the fix — wrapping a read-then-write in a bare transaction is not enough on its own',
          'The shape to look for in code is "read a value, then write a new value based on it" (read-modify-write); on shared data, that\'s the cue to ask whether a transaction is needed',
        ],
        whereInSystem: [
          _('Concurrency lives at the seam between the '),
          t('back-end', 'back-end'),
          _(' and the '),
          t('database', 'database'),
          _('. Many back-end requests can ask the database for the same row at the same instant; transactions are the database\'s built-in tool for serializing those requests so they don\'t corrupt each other.'),
        ],
        bridge: [
          _('Coming up — Chapter 6: Architecture & Communication Patterns. We\'ve now covered everything that happens for a request — and for many simultaneous requests — through one back-end server. Next: what changes when there are many servers, and how the system reaches across the public internet to talk to other systems.'),
        ],
        prompts: [
          'Where in this codebase do we have read-then-write patterns on shared data — counters, balances, inventory, status transitions? Are they wrapped in transactions, or could two simultaneous requests collide?',
          'Pick the most contention-prone operation in this codebase. Walk me through what would happen if two of those ran at the exact same instant, with no coordination. Does the current code prevent it?',
        ],
      },
    },
  ],
}
