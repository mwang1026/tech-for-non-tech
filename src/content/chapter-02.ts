import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })

/* ============================================================================
 * Chapter 4 — State (101)
 *
 * Diagram visible by end of chapter at 101: browser, fe-pool, be-pool,
 * db-primary, + cache (new this chapter)
 *
 * Slide arc:
 *   1. What "state" actually means
 *   2. The three places state lives — memory, disk, cache
 *   3. The three questions you ask of every piece of state
 *   4. Source of truth — when copies disagree, which one wins
 *   5. Recap (with prompts)
 * ============================================================================ */

/* --------------------------- Slide 1 — What state means --------------------------- */

const whatIsState: Block[] = [
  p(_('Coming out of Chapter 3, we know how the back-end identifies users (Ch 2) and gates their requests (Ch 3). The next question: when a request arrives that asks "show me X," where does X actually live?')),
  p(_('Everything the system "knows" about the world lives somewhere. The user’s name. Their shopping cart. Whether they’re logged in. How many items are left in inventory. Which notifications they haven’t opened. All of it has to be held somewhere between requests, so the next one can find it.')),
  p(
    _('All of that — every fact the system holds about the world right now — is called '),
    t('state', 'state'),
    _('. It’s a generic word that covers a lot of ground: the contents of the database, the user’s active session, a temporary calculation in progress, a cached copy of yesterday’s analytics.'),
  ),
  p(_('Quick anchor before we go further: most of this state lives in a database, and a database is structured like a stack of spreadsheets. Each spreadsheet is called a *table* (one for users, one for orders, one for messages); each row is one record (one user, one order); each column is one field (name, email, created_at). When the rest of this primer talks about "rows" and "tables," that’s the picture.')),
  p(_('Tying back to Chapter 2: most rows carry the user ID of their owner as one of those columns. The "stamp" you saw the back-end pull a slice off of — "give me everything stamped 123" — is the database filtering rows by that column on every query. Same idea, now with the structure underneath it.')),
  p(_('What needs to happen: every piece of state has to be put somewhere on purpose, with the right tradeoffs for what it is. Three main places it can go.')),
]

/* --------------------------- Slide 2 — Three places --------------------------- */

const threePlaces: Block[] = [
  p(_('When you have a piece of data the system needs to hold onto, you have three main options for where to put it. Each one is a tradeoff.')),
  ul(
    [t('Memory (RAM)', 'memory'), _(' — The server’s working memory. Reading and writing is essentially instant (nanoseconds — a billionth of a second; effectively free). The catch: when the server restarts (a deploy, a crash, a routine maintenance window), everything in memory is gone. Use this for data you’re actively computing with right now, or for data that’s OK to lose (a user’s in-progress search query).')],
    [t('Database (disk)', 'database'), _(' — A specialized program (like '), t('PostgreSQL', 'postgresql'), _(' or '), t('MySQL', 'mysql'), _(') that writes data to disk in a structured way. Slower than memory (milliseconds — a thousandth of a second; noticeable when you stack thousands of them) but the data survives restarts, crashes, and machine failures. This is where you put anything that has to outlive the next reboot — accounts, orders, posts, settings.')],
    [t('Cache', 'cache'), _(' — A fast copy of database data, usually held in memory, used to avoid hitting the slow database when the same answer would come back. '), t('Redis', 'redis'), _(' is the most common. The catch: a cached copy can be out of date if the database changed since the cache was filled. Use this for data that’s expensive to compute and tolerable to be a few seconds stale (a leaderboard, a homepage banner, a list of trending posts).')],
  ),
  p(_('In our diagram, the cache is the new box that just appeared between the back-end and the database. When the back-end needs data, it checks the cache first; if the answer is there and recent enough, it skips the database entirely. If not, it reads from the database and stores the answer in the cache for next time.')),
  p(_('Three places, three sets of tradeoffs. Choosing the right place comes down to three questions.')),
]

/* --------------------------- Slide 3 — The three questions --------------------------- */

const threeQuestions: Block[] = [
  p(_('Where a piece of data lives comes down to three questions. Each one maps to a specific choice, and a piece of data often lives in more than one place at once.')),
  ul(
    [_('**Does it need to survive a restart?** — A user’s purchase history must. A "thinking…" spinner doesn’t. **No → memory is fine. Yes → it must go in the database.**')],
    [_('**Does it need to be perfectly current?** — A bank account balance does. A "trending posts" list can be a few seconds stale and nobody notices. **Tolerant of staleness → a cache becomes an option. Must be exact → read straight from the database.**')],
    [_('**Is the database fast enough on its own?** — Usually yes. When it isn’t (millions of reads of the same answer, or one query that takes seconds to compute), **you put a cache in front of the database as a speed layer.**')],
  ),
  p(_('Three example pieces of data:')),
  ul(
    [_('A user’s order history — must survive restart, must be current → **database only.**')],
    [_('A homepage "trending posts" list — must survive restart, tolerates staleness, hit on every page load → **database, with a cache in front.**')],
    [_('A "loading…" indicator on the user’s screen — doesn’t need to survive anything → **memory only.**')],
  ),
  p(_('When you direct an AI agent to add a feature that touches data, these are the three questions to ask out loud. The answers narrow down where the data should live. If the agent picks a place without checking these, that’s where to push back.')),
]

/* --------------------------- Slide 4 — Source of truth --------------------------- */

const sourceOfTruth: Block[] = [
  p(_('Once you have data in multiple places — the database, a cache, sometimes the user’s browser — they can disagree. The cache says the user has 5 unread messages; the database says 7. Which one is correct?')),
  p(
    _('The '),
    t('source of truth', 'source-of-truth'),
    _(' is the one place that, when in doubt, is treated as authoritative. Every other copy is just that — a copy. Caches, browser-side data, in-memory snapshots: all derived. When they conflict with the source of truth, the source of truth wins.'),
  ),
  p(_('In almost every system, the database is the source of truth for durable data. The cache is allowed to be stale (a copy that hasn’t caught up yet); when you need to be sure, you read from the database. This is why you’ll often hear engineers say "let me hit the database directly to confirm" — they’re bypassing the cache to get the real answer.')),
  p(_('Source-of-truth thinking matters for any feature that involves data living in multiple places. Synced contacts, inventory across stores, a user’s settings on web and mobile — every one of these has a source of truth, and copies that catch up to it. Knowing which is which prevents a whole class of "I updated it but it’s not showing up" bugs.')),
  p(_('Next chapter: we’ve been treating "the back-end" as one server. Real systems have many — and the way they\'re arranged, and how requests are routed across them, is its own subject.')),
]

/* --------------------------- Chapter 4 export --------------------------- */

export const chapter02: Chapter = {
  id: 'ch4',
  number: 4,
  title: 'State',
  subtitle: 'Where data lives, and why that matters',
  slides: [
    { id: 's1', level: 101, headline: 'What state actually means', body: { kind: 'prose', blocks: whatIsState }, diagramFocus: 'data' },
    { id: 's2', level: 101, headline: 'Three places state lives', body: { kind: 'prose', blocks: threePlaces }, diagramFocus: 'data' },
    { id: 's3', level: 101, headline: 'Three questions that decide where data lives', body: { kind: 'prose', blocks: threeQuestions }, diagramFocus: 'data' },
    { id: 's4', level: 101, headline: 'Source of truth', body: { kind: 'prose', blocks: sourceOfTruth }, diagramFocus: 'data' },
    {
      id: 's5',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'State is everything the system "knows" about the world right now — every fact it holds, anywhere',
          'Three places to put state: memory (instant, lost on restart), database (slower, durable), cache (fast copy that may be stale)',
          'Three questions decide where each piece of state lives: does it need to survive a restart, does it need to be perfectly current, is the database fast enough on its own',
          'When copies disagree, the source of truth wins — usually the database; everything else is a copy catching up',
        ],
        whereInSystem: [
          _('The '),
          t('database', 'database'),
          _(' (Postgres, MySQL) sits at the bottom of the diagram as the source of truth — durable, slower, the one that everything else syncs against. The '),
          t('cache', 'cache'),
          _(' (Redis) sits between the back-end and the database, holding fast copies of recent answers so the database doesn’t get hit for the same question over and over.'),
        ],
        bridge: [
          _('Coming up — Chapter 5: Architecture & Communication Patterns. We\'ve been drawing the back-end as one server. Real systems have many — and the way they\'re arranged (load balancers, CDNs, monolith vs. services) is the next layer of the picture.'),
        ],
      },
    },
  ],
}
