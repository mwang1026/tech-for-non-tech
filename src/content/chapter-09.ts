import type { Chapter, Block, BodyNode, Inline, StepItem, StepStatus } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
const step = (
  content: Inline,
  opts: { highlight?: string[]; status?: StepStatus; focus?: string } = {},
): StepItem => ({ content, ...opts })
const steps = (...items: StepItem[]): Block => ({ kind: 'steps', items })

/* ============================================================================
 * Chapter 7 — Putting It Together (101)
 *
 * No new diagram boxes — this chapter exercises the existing diagram by
 * walking real request scenarios through it. DiagramFocus shifts per scenario.
 *
 * Slide arc:
 *   1. Intro — we've built the whole system; now let's run things through it
 *   2. Happy path — authenticated user reads their data
 *   3. Auth failure — no/expired token (401)
 *   4. Authz failure — valid user, forbidden action (403)
 *   5. Validation failure — bad input (400)
 *   6. Recap (with prompts)
 * ============================================================================ */

/* --------------------------- Slide 1 — Intro --------------------------- */

const intro: Block[] = [
  p(_('Coming out of Chapter 6, we have the entire system in front of us. Browser at the top, CDN at the edge, load balancer routing, front-end and back-end pools, cache, database. We’ve also picked up a set of cross-cutting ideas that don’t live in any one box: identity (who’s asking), validation (is this allowed and well-formed), concurrency (what if two requests collide).')),
  p(_('We’ve built it one concept at a time. We have not yet watched anything actually flow through it.')),
  p(_('That’s this chapter — the climax of Act I. We’re going to walk four real request scenarios end-to-end through the diagram and see exactly what happens at each step. Some succeed. Some get rejected. The job is to feel where rejection happens — at which gate, with which status code, and why.')),
  p(_('When you direct an AI agent on a feature, this is the kind of trace you should be running in your head. "If this request comes in, where does it stop? Where could it be silently wrong instead of rejected?" Pattern recognition for the failure modes is the whole point.')),
  p(_('Four scenarios. Happy path first.')),
]

/* --------------------------- Slide 2 — Happy path --------------------------- */

const happyPath: Block[] = [
  p(_('A logged-in user opens their dashboard. Press → to walk through what happens.')),
  steps(
    step(
      [_('Browser asks for the dashboard HTML and assets. The CDN serves cached HTML, JavaScript, CSS, and fonts in tens of milliseconds, never touching our origin servers.')],
      { highlight: ['browser', 'cdn'], status: 'pass', focus: 'edge' },
    ),
    step(
      [_('Browser fires a separate API request for the user’s actual data, with the auth token attached. This one is dynamic — can’t be cached at the CDN. It passes through to the load balancer.')],
      { highlight: ['lb'], status: 'pass', focus: 'lb' },
    ),
    step(
      [_('Load balancer picks an available front-end server and forwards the request. The front-end passes it on to a back-end server.')],
      { highlight: ['fe-pool', 'be-pool'], status: 'pass', focus: 'app' },
    ),
    step(
      [_('Back-end runs the three gates: authentication (token valid ✓), authorization (user is reading their own data ✓), validation (request shape fine ✓).')],
      { highlight: ['be-pool'], status: 'pass', focus: 'app' },
    ),
    step(
      [_('Back-end checks the cache. On a hit, the answer comes back in ~12ms. On a miss, the back-end queries the database (~180ms) and stores the answer in the cache for next time.')],
      { highlight: ['cache', 'db-primary'], status: 'pass', focus: 'data' },
    ),
    step(
      [_('Data travels back: back-end → front-end → load balancer → browser. The browser renders it. Total round trip: a few hundred milliseconds.')],
      { highlight: ['browser'], status: 'pass', focus: 'full' },
    ),
  ),
  p(_('Every gate green. The user sees their dashboard, probably without thinking about any of this.')),
]

/* --------------------------- Slide 3 — Auth failure --------------------------- */

const authFailure: Block[] = [
  p(_('Same browser, same dashboard, but this time the request arrives at the back-end without a valid token. Maybe the session expired, maybe an attacker hit the API directly with no token at all. Press → to watch where it stops.')),
  steps(
    step(
      [_('Request travels through CDN, load balancer, front-end, back-end. Same path as the happy case so far — the CDN doesn’t check tokens; that’s the back-end’s job.')],
      { highlight: ['cdn', 'lb', 'fe-pool'], status: 'pass', focus: 'full' },
    ),
    step(
      [_('Back-end’s first check is authentication: is the token here, and does it verify? It’s missing or expired. The back-end immediately returns '), t('401 Unauthorized', '401'), _('.')],
      { highlight: ['be-pool'], status: 'reject', focus: 'app' },
    ),
    step(
      [_('No database query. No cache lookup. Nothing is read; nothing is changed. The 401 travels back the way the request came in.')],
      { highlight: ['cache', 'db-primary'], status: 'pass', focus: 'data' },
    ),
    step(
      [_('The browser sees the 401 and typically redirects the user to the login page. They re-authenticate, get a fresh token, retry — back to the happy path.')],
      { highlight: ['browser'], status: 'neutral', focus: 'full' },
    ),
  ),
  p(_('Why this matters: authentication is the *first* gate. A request that fails it never gets near your data. This is also why you never write code that does any sensitive work before checking the token — that work would be exposed even on rejected requests.')),
]

/* --------------------------- Slide 4 — Authz failure --------------------------- */

const authzFailure: Block[] = [
  p(_('User 47 is logged in with a valid token. They open the API in their browser’s developer tools and call `GET /api/orders/12345` — but order 12345 belongs to user 92. Press → to walk through what happens.')),
  steps(
    step(
      [_('Same path through CDN, load balancer, front-end, back-end.')],
      { highlight: ['cdn', 'lb', 'fe-pool'], status: 'pass', focus: 'full' },
    ),
    step(
      [_('Authentication: token is valid. User 47 is who they say they are. ✓')],
      { highlight: ['be-pool'], status: 'pass', focus: 'app' },
    ),
    step(
      [_('Authorization: the back-end looks up order 12345, sees it belongs to user 92, compares against user 47 (from the token). Mismatch. Returns '), t('403 Forbidden', '403'), _('.')],
      { highlight: ['be-pool'], status: 'reject', focus: 'app' },
    ),
    step(
      [_('Critical detail: the order data is *never sent to the client*. If it had been (a common bug), the user could read it by inspecting the network response, even if the UI hid it.')],
      { highlight: ['db-primary'], status: 'neutral', focus: 'data' },
    ),
    step(
      [_('The 403 goes back to the browser. The user sees an error, a redirect, or nothing — but never sees order 12345.')],
      { highlight: ['browser'], status: 'neutral', focus: 'full' },
    ),
  ),
  p(_('This is the failure mode that produces "user A read user B’s data" headlines when it’s done wrong. The fix is always the same: the back-end has to compare the resource’s owner against the user from the token, on every single request, on every single endpoint that returns user-specific data. Hide-the-button-in-the-UI is not enough.')),
]

/* --------------------------- Slide 5 — Validation failure --------------------------- */

const validationFailure: Block[] = [
  p(_('User 47 is updating their profile. They’re authenticated, they’re editing their own profile (so authorization passes), but they sent the request with the email field missing, or set to "not-actually-an-email." Press → to walk through what happens.')),
  steps(
    step(
      [_('Same path through CDN, load balancer, front-end, back-end.')],
      { highlight: ['cdn', 'lb', 'fe-pool'], status: 'pass', focus: 'full' },
    ),
    step(
      [_('Authentication ✓. Authorization ✓ (user 47 is editing user 47’s profile).')],
      { highlight: ['be-pool'], status: 'pass', focus: 'app' },
    ),
    step(
      [_('Validation: back-end checks the request body. Email missing? Required field error. Email malformed? Format error. Either way, back-end returns '), t('400 Bad Request', '400'), _(' with a message describing what was wrong.')],
      { highlight: ['be-pool'], status: 'reject', focus: 'app' },
    ),
    step(
      [_('Nothing is written to the database. The user’s real profile is unchanged.')],
      { highlight: ['db-primary'], status: 'pass', focus: 'data' },
    ),
    step(
      [_('The 400 goes back to the browser, which usually shows the user a form error highlighting the problem field.')],
      { highlight: ['browser'], status: 'neutral', focus: 'full' },
    ),
  ),
  p(_('Validation also catches actively malicious inputs — somebody trying to put database commands or executable code into a form field. Same response: 400, nothing changes, error returned. The system stays clean because the validation gate ran before any code took the bad input seriously.')),
  p(_('Three failure modes, three different gates, three different status codes — and a clear pattern: the request never gets further than the gate that can reject it. This is what a well-built system looks like in motion.')),
]

/* --------------------------- Slide 6 — Concurrency failure --------------------------- */

const concurrencyFailure: Block[] = [
  p(_('Three failure modes so far were caught at one of the gates — auth, authz, or validation. Now a fourth scenario, and it’s the one gate-thinking alone can’t catch. Two users, on opposite sides of the country, both buy the last copy of a popular book within the same 50 milliseconds. Press → to walk through it.')),
  steps(
    step(
      [_('Both requests hit the load balancer. It hands them to two different back-end servers, both of which begin processing in parallel.')],
      { highlight: ['lb', 'be-pool'], status: 'neutral', focus: 'lb' },
    ),
    step(
      [_('Both back-ends run the three gates: authentication ✓ (both users are logged in), authorization ✓ (both are allowed to buy), validation ✓ (both requests are well-formed). The gates pass *both* requests.')],
      { highlight: ['be-pool'], status: 'pass', focus: 'app' },
    ),
    step(
      [_('Both back-ends read the inventory: count = 1. Both see "yes, in stock." Neither has written anything yet — they’re looking at the same starting state.')],
      { highlight: ['db-primary'], status: 'neutral', focus: 'data' },
    ),
    step(
      [_('Both back-ends subtract 1 and write count = 0. The second write silently overwrites the first, as if the first never happened. The database thinks one book was sold; in reality, two were promised.')],
      { highlight: ['db-primary'], status: 'reject', focus: 'data' },
    ),
    step(
      [_('Both browsers get a 200 OK. Both customers get a confirmation email. The system stayed "up." Nothing was rejected. But one of those orders is going to ship; the other isn’t.')],
      { highlight: ['browser'], status: 'reject', focus: 'full' },
    ),
  ),
  p(_('This is the failure mode that *passes* every gate. Authentication, authorization, validation — they all said yes, twice. The bug is at the back-end ↔ database seam, where two requests racing on the same row both got "in stock" before either had written. Chapter 6’s transactions and locks are how this gets fixed; the pattern to recognize is read-modify-write on shared data.')),
  p(_('Why this belongs in the synthesis: gate-thinking catches a lot, but it doesn’t catch this. When you direct an agent on anything involving counters, balances, uniqueness checks, or state transitions, this is the failure mode to ask about explicitly — "could two of these run at the same time and both see the same starting value?"')),
]

/* --------------------------- Chapter 7 export --------------------------- */

export const chapter09: Chapter = {
  id: 'ch7',
  number: 7,
  title: 'Putting It Together',
  subtitle: 'Real request flows, end-to-end',
  slides: [
    { id: 's1', level: 101, headline: 'Watching the system run', body: { kind: 'prose', blocks: intro }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Happy path — request that works', body: { kind: 'prose', blocks: happyPath }, diagramFocus: 'full' },
    { id: 's3', level: 101, headline: 'Auth failure — 401 Unauthorized', body: { kind: 'prose', blocks: authFailure }, diagramFocus: 'app' },
    { id: 's4', level: 101, headline: 'Authz failure — 403 Forbidden', body: { kind: 'prose', blocks: authzFailure }, diagramFocus: 'app' },
    { id: 's5', level: 101, headline: 'Validation failure — 400 Bad Request', body: { kind: 'prose', blocks: validationFailure }, diagramFocus: 'app' },
    { id: 's6', level: 101, headline: 'Race condition — both requests pass every gate', body: { kind: 'prose', blocks: concurrencyFailure }, diagramFocus: 'data' },
    {
      id: 's7',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Every request flows through the same path — but where it stops, and which gate stops it, depends on what’s wrong',
          '401 means "we don’t know you"; 403 means "we know you, but you can’t do this"; 400 means "the request itself is broken"',
          'Concurrency failures are the ones that pass every gate — two requests racing on the same row, neither rejected, but the result is wrong',
          'Failed requests should be rejected at the earliest gate possible — never returned-and-then-hidden in the UI',
          'Pattern recognition for these failure modes is what lets you spot missing checks (and missing transactions) in agent-generated code',
        ],
        whereInSystem: [
          _('All five scenarios use the same diagram we’ve been building since Chapter 1. The CDN serves static assets at the edge; the back-end is where every gate (authentication, authorization, validation) actually runs; the database is only ever touched when a request makes it past every gate. Concurrency lives at that last seam — the back-end ↔ database — and is what bites when two requests race on the same row.'),
        ],
        bridge: [
          _('Act I is done. Coming up — Chapter 8: Code Lifecycle. We\'ve walked through how the system runs at runtime; Act II is the orthogonal story of how the code that runs all this becomes the system in the first place. Then Ch 10 is the payoff: directing an AI coding agent against the whole picture.'),
        ],
      },
    },
  ],
}
