import type { Chapter, Block } from './types'
import { _, t, p, ul, h, step, steps } from './authoring'

/* ============================================================================
 * Chapter 4 — State (101)
 *
 * Diagram visible by end of chapter at 101: browser, be-pool,
 * db-primary, + cache (new this chapter)
 *
 * Slide arc:
 *   1. State is the attributes of an entity — three entities matter
 *   2. Three entities, three lifetimes, three storage tiers
 *   3. How state moves through one bank transfer
 *   4. Source of truth — when copies of an attribute disagree
 *   5. Recap
 * ============================================================================ */

/* --------------------------- Slide 1 — Attributes of something --------------------------- */

const whatIsState: Block[] = [
  p(_('Coming out of Chapter 3, we know the back-end checks identity (Ch 2) and gates the action on a resource (Ch 3). The next question: what does the system *hold* between requests, so the next one can find it?')),
  p(_('Look back at the bank transfer from Chapter 1. Several different things are involved at once: the user clicking the button, the request flying across the wire, the two accounts whose balances change. Each of these has facts attached to it. The user has a name and an email. The request has an amount and a source. Each account has a balance and an owner.')),
  p(
    _('These facts are *attributes* — each one is the X of some Y. Every piece of data the system holds is an attribute of some thing; there is no free-floating data. The collection of those attributes is what we call '),
    t('state', 'state'),
    _('. The interesting question is *where each entity\'s attributes live*.'),
  ),
  p(_('Three entities make up state, the same three the curriculum has been building toward:')),
  ul(
    [_('The '), t('identity', 'identity'), _(' — the user. Has attributes like name, email, the list of accounts they own, and "are they currently logged in." Verified in Chapter 2.')],
    [_('The **request** — the in-flight transfer itself. Has attributes like amount, source account, target account, where it is in processing.')],
    [_('The '), t('resource', 'resource'), _(' — the thing the action is being taken on. The bank account. Has attributes like balance, owner, account type. Gated in Chapter 3.')],
  ),
  p(_('State is the collected attributes of these three. The rest of this chapter is about *where each one\'s attributes live, and why they live there* — because the answer is different for each.')),
]

/* --------------------------- Slide 2 — Three entities, three lifetimes --------------------------- */

const threeLifetimes: Block[] = [
  p(_('The three entities have very different lifetimes, and lifetime is what decides where their attributes are stored.')),
  ul(
    [_('The **resource** — the bank account — must outlast every restart, every deploy, forever. Its attributes (balance, owner, account type) live on disk, in a '), t('database', 'database'), _(' such as '), t('PostgreSQL', 'postgresql'), _(' or '), t('MySQL', 'mysql'), _('. A database is structured like a stack of spreadsheets: each spreadsheet is a *table* (one for accounts, one for users, one for transfers); each row is one record (one account); each column is one attribute (`balance`, `owner_id`, `account_type`). When engineers say "the database has the balance," they mean a row in the `accounts` table has a column called `balance` with a value in it. Reading and writing the database takes milliseconds — slower than memory, but it survives anything.')],
    [_('The **request** — the in-flight transfer — exists only for the second between the click and the response. Its attributes (amount, source, target, current step) live in the server\'s '), t('memory (RAM)', 'memory'), _(' while the request is processing, and disappear when the response is sent. Nothing has to survive a restart, because the request is over by then. Memory is essentially instant to read and write — nanoseconds — so the server can pull data into memory, do the math, and write the result without paying a real cost for any of it.')],
    [_('The **identity** — the user — splits in two. The durable attributes (name, email, account list) live in the **database** alongside resources. But the question every single request asks — "is this user currently logged in, and which user are they?" — has to be answered fast, on every single hit. That session lookup *can* live in the database (a row per active session), but it\'s exactly the kind of read a '), t('cache', 'cache'), _(' is built for. '), t('Redis', 'redis'), _(' is fast in-memory storage that sits outside any one server. On every request, the back-end takes the token, looks it up in the '), t('session', 'session'), _(' store, and finds the user. The "hot lookup on every request" pattern is what a cache is for.')],
  ),
  p(_('Three storage tiers — memory, database, cache — and they aren\'t picked at random. Each one fits the lifetime of one of the three entities\' attributes. The cache is the new box on the diagram this chapter, sitting between the back-end and the database. It\'s where the session lives.')),
]

/* --------------------------- Slide 3 — How state moves through one transfer --------------------------- */

const stateInMotion: Block[] = [
  p(_('To see all three lifetimes side-by-side, walk the bank transfer end-to-end again — the same six steps as Chapter 1, with one question added at each: *which entity\'s attributes are moving, and where to.*')),
  steps(
    step(
      [_('**Click.** The user presses *Transfer*. The browser builds the request — its attributes (amount: 100, source: checking, target: savings) live in the browser\'s memory.')],
      { highlight: ['browser'], status: 'neutral', focus: 'full' },
    ),
    step(
      [_('**Request travels to the server.** The request attributes are copied across the wire from the browser into the server\'s memory. The server takes the token and looks the identity up in the session store (cache or database, depending on the setup). Now the server knows which user is asking.')],
      { highlight: ['be-pool', 'cache'], status: 'neutral', focus: 'full' },
    ),
    step(
      [_('**Server reads the resource.** The server queries the database for the two account rows. The resource attributes (balance: 500 in checking, balance: 200 in savings) are copied from disk into the server\'s memory.')],
      { highlight: ['db-primary'], status: 'neutral', focus: 'data' },
    ),
    step(
      [_('**Server does the math.** The server now holds request attributes and resource attributes side-by-side in memory. It runs the check (is checking ≥ 100?) entirely on the in-memory copies. No new database trip.')],
      { highlight: ['be-pool'], status: 'neutral', focus: 'app' },
    ),
    step(
      [_('**Server writes.** The server updates the two rows in the database — checking goes to 400, savings to 300. The resource attributes are now durable on disk. If the cache happened to hold a copy of these balances, that copy is now wrong; it has to be invalidated, or it will keep serving the old value.')],
      { highlight: ['db-primary', 'cache'], status: 'neutral', focus: 'data' },
    ),
    step(
      [_('**Response sent.** The server packages a response and ships it back. Request attributes die — that memory is freed. Identity attributes stay warm in the cache for the next request. Resource attributes persist in the database, ready for the next read.')],
      { highlight: ['browser'], status: 'pass', focus: 'full' },
    ),
  ),
  p(_('The request was born and died in seconds. The identity stayed warm in the cache between requests. The resource is permanent until something writes over it.')),
  p(_('When you direct an AI agent to add a feature that touches data, the question to ask out loud is: *which entity does this attribute belong to, and how long does it have to last?* The answer to the second question decides where it lives. If the agent picks a place without naming the entity, that\'s where to push back.')),
]

/* --------------------------- Slide 4 — Source of truth --------------------------- */

const sourceOfTruth: Block[] = [
  p(_('In step 5 of the walkthrough, something subtle happened. The same attribute — the checking account\'s balance — existed in three places at once. On disk in the database (the row that just got updated). In the server\'s memory (the value the math ran on, now stale the moment the write completed). And possibly in the cache, if anything had cached that account.')),
  p(_('When copies of the same attribute exist in multiple places, they can disagree. The cache says balance = 500. The database says balance = 400. Which one is right?')),
  p(
    _('The '),
    t('source of truth', 'source-of-truth'),
    _(' is the place that, by rule, wins when copies disagree. Every other copy is just that — a copy, derived from the source of truth, allowed to lag behind. The system needs *some* place that\'s designated as authoritative; otherwise there\'s no way to resolve the disagreement.'),
  ),
  p(_('For durable attributes — anything that has to outlive a restart — the source of truth is the database. That\'s really *why* the database is in the picture: it\'s the one place attributes are written to disk and treated as canonical. The in-memory copy on a server is a snapshot from a moment ago. The version in the user\'s browser is whatever was on the screen the last time it loaded. All of those are derivative; the database is the original.')),
  p(_('This is why engineers will say "let me hit the database directly to confirm" — they\'re stepping past every copy and going to the place that\'s authoritative.')),
  p(_('Source-of-truth thinking heads off a whole class of bugs: "I updated my settings but my phone still shows the old value," "the inventory system says we have 5 but the floor only has 3," "the user\'s name updated everywhere except the receipt." Every one of these is a copy that hasn\'t caught up with the source of truth — and the question to ask is *which place is authoritative for that attribute, and what\'s blocking the others from syncing.*')),
  h('Why we put a cache in front'),
  p(_('Being durable comes at a cost: the database writes to disk, runs careful checks, and is built to never lose data — and all of that makes it slower than memory. Under heavy traffic, the same popular row can get read thousands of times per second, and the database can\'t keep up. That\'s why the '), t('cache', 'cache'), _(' exists. It sits in front of the database and absorbs those repeat reads cheaply, in exchange for being a copy that can be slightly stale. Reads that can tolerate slight staleness use the cache — a session lookup, a homepage banner, a leaderboard. Reads that can\'t (a bank balance the user is about to act on) skip the cache and go to the source of truth.')),
]

/* --------------------------- Chapter 4 export --------------------------- */

export const chapter04: Chapter = {
  id: 'ch4',
  number: 4,
  title: 'State',
  subtitle: 'Where each thing\'s attributes live, and why',
  slides: [
    { id: 's1', level: 101, headline: 'State is the attributes of something', body: { kind: 'prose', blocks: whatIsState }, diagramFocus: 'data' },
    { id: 's2', level: 101, headline: 'Three entities, three lifetimes', body: { kind: 'prose', blocks: threeLifetimes }, diagramFocus: 'data' },
    { id: 's3', level: 101, headline: 'How state moves through one transfer', body: { kind: 'prose', blocks: stateInMotion }, diagramFocus: 'data' },
    { id: 's4', level: 101, headline: 'Source of truth', body: { kind: 'prose', blocks: sourceOfTruth }, diagramFocus: 'data' },
    {
      id: 's5',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Every piece of state is an attribute of some entity — there is no free-floating data; every fact is "the X of Y"',
          'Three entities make up state in a request flow: identity (the user), request (the in-flight operation), resource (the thing being acted on)',
          'Each entity\'s lifetime decides where its attributes are stored: request → server memory (seconds), resource and durable identity → database (forever), active session → cache (warm between requests)',
          'When copies of the same attribute disagree, the source of truth wins — for durable attributes that\'s the database; everything else is a copy catching up',
        ],
        whereInSystem: [
          _('The '),
          t('database', 'database'),
          _(' (Postgres, MySQL) sits at the bottom of the diagram as the source of truth — durable, slower, the one that everything else syncs against. The '),
          t('cache', 'cache'),
          _(' (Redis) sits between the back-end and the database — the home for the active session lookup and any other attributes that are expensive to recompute on every request.'),
        ],
        bridge: [
          _('Coming up — Chapter 5: Architecture & Communication Patterns. We\'ve been drawing the back-end as one server. Real systems have many — and the way they\'re arranged (load balancers, CDNs, monolith vs. services) is the next layer of the picture.'),
        ],
      },
    },
  ],
}
