import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })

/* ============================================================================
 * Chapter 9 — Putting It Together (101)
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
  p(_('Coming out of Chapter 8, we have the entire system in front of us. Browser at the top, CDN at the edge, load balancer routing, front-end and back-end pools, cache, database. We’ve also picked up a set of cross-cutting ideas that don’t live in any one box: identity (who’s asking), validation (is this allowed and well-formed), concurrency (what if two requests collide).')),
  p(_('We’ve built it one concept at a time. We have not yet watched anything actually flow through it.')),
  p(_('That’s this chapter. We’re going to walk four real request scenarios end-to-end through the diagram and see exactly what happens at each step. Some of them succeed. Some of them get rejected. The job is to feel where rejection happens — at which gate, with which status code, and why.')),
  p(_('When you direct an AI agent on a feature, this is the kind of trace you should be running in your head. "If this request comes in, where does it stop? Where could it be silently wrong instead of rejected?" Pattern recognition for the failure modes is the whole point.')),
  p(_('Four scenarios. Happy path first.')),
]

/* --------------------------- Slide 2 — Happy path --------------------------- */

const happyPath: Block[] = [
  p(_('A logged-in user opens their dashboard. The browser fires a request for the dashboard page and (separately) for the data on it. Here’s what happens.')),
  ul(
    [_('1. The browser asks for the dashboard HTML and assets. The CDN holds cached copies of the HTML, JavaScript, CSS, and fonts. It serves them in tens of milliseconds, never touching our origin servers. Most of what the user sees comes from here.')],
    [_('2. The browser also fires an API request for the user’s actual data, with the auth token attached. This one is dynamic — it can’t be cached at the CDN. It passes through to the load balancer.')],
    [_('3. The load balancer picks one of the front-end servers and forwards the request. The front-end server passes it on to a back-end server.')],
    [_('4. The back-end checks the token (authentication). Valid. It checks whether this user is allowed to read this dashboard data (authorization). Yes — they’re reading their own. It checks the request shape (validation). Fine.')],
    [_('5. The back-end checks the cache for this user’s dashboard data. Maybe a hit (12ms, no database touch). Maybe a miss — in which case it queries the database (180ms), stores the answer in the cache for next time, and proceeds.')],
    [_('6. The data goes back: back-end → front-end → load balancer → browser. The browser renders it.')],
  ),
  p(_('Every gate green. The user sees their dashboard, probably without thinking about any of this. Total round trip: a few hundred milliseconds.')),
]

/* --------------------------- Slide 3 — Auth failure --------------------------- */

const authFailure: Block[] = [
  p(_('Same browser, same dashboard, but this time something’s off with the auth token. Maybe the user’s session expired while they had the tab open. Maybe they cleared their cookies. Maybe an attacker hit the API directly with no token at all. Whatever the reason, the request arrives at the back-end without a valid token.')),
  ul(
    [_('1. Request travels through CDN (CDN doesn’t check tokens — that’s the back-end’s job), through the load balancer, into a front-end server, into a back-end server. Same path as the happy case so far.')],
    [_('2. The back-end’s very first check is authentication: is the token here, and does it actually verify? It’s missing or expired. The back-end immediately returns '), t('401 Unauthorized', '401'), _('.')],
    [_('3. No database query happens. No cache lookup happens. Nothing is read; nothing is changed. The 401 travels back the same way the request came in.')],
    [_('4. The browser sees the 401 and (typically) redirects the user to the login page. They re-authenticate, get a fresh token, and retry — back to the happy path.')],
  ),
  p(_('Why this matters: authentication is the *first* gate. A request that fails it never gets near your data. This is also why you never write code that does any sensitive work before checking the token — that work would be exposed even on rejected requests.')),
]

/* --------------------------- Slide 4 — Authz failure --------------------------- */

const authzFailure: Block[] = [
  p(_('User 47 is logged in with a valid token. They open the API directly in their browser’s developer tools and call `GET /api/orders/12345` — but order 12345 belongs to user 92. What happens?')),
  ul(
    [_('1. Same path through CDN, load balancer, front-end, back-end.')],
    [_('2. Authentication: token is valid. User 47 is who they say they are. ✓')],
    [_('3. Authorization: the back-end looks up order 12345, sees that it belongs to user 92, and compares against user 47 (from the token). Mismatch. The back-end returns '), t('403 Forbidden', '403'), _('.')],
    [_('4. Critical detail: the back-end does NOT return the order data and then "hide" it. The data is never sent to the client. If it had been (a common bug), the user could read it by inspecting the network response, even if the UI hid it.')],
    [_('5. The 403 goes back to the browser. Depending on the app, the user sees an error message, gets redirected, or just sees nothing — but they never see order 12345.')],
  ),
  p(_('This is the failure mode that produces "user A read user B’s data" headlines when it’s done wrong. The fix is always the same: the back-end has to compare the resource’s owner against the user from the token, on every single request, on every single endpoint that returns user-specific data. Hide-the-button-in-the-UI is not enough.')),
]

/* --------------------------- Slide 5 — Validation failure --------------------------- */

const validationFailure: Block[] = [
  p(_('User 47 is updating their profile. They’re authenticated, they’re editing their own profile (so authorization passes), but they sent a request with their email field missing entirely, or set to an empty string, or set to "not-actually-an-email."')),
  ul(
    [_('1. Same path through CDN, load balancer, front-end, back-end.')],
    [_('2. Authentication: ✓. Authorization: ✓ (user 47 is editing user 47’s profile).')],
    [_('3. Validation: the back-end checks the request body. Email field missing? Required field error. Email malformed? Format error. Either way, the back-end returns '), t('400 Bad Request', '400'), _(' with a message describing what was wrong.')],
    [_('4. Nothing is written to the database. The user’s real profile is unchanged.')],
    [_('5. The 400 goes back to the browser, which usually shows the user a form error highlighting the problem field.')],
  ),
  p(_('Validation also catches actively malicious inputs — somebody trying to put database commands or executable code into a form field. Same response: 400, nothing changes, error returned. The system stays clean because the validation gate ran before any code took the bad input seriously.')),
  p(_('Three failure modes, three different gates, three different status codes — and a clear pattern: the request never gets further than the gate that can reject it. This is what a well-built system looks like in motion.')),
]

/* --------------------------- Chapter 9 export --------------------------- */

export const chapter09: Chapter = {
  id: 'ch9',
  number: 9,
  title: 'Putting It Together',
  subtitle: 'Real request flows, end-to-end',
  slides: [
    { id: 's1', level: 101, headline: 'Watching the system run', body: { kind: 'prose', blocks: intro }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Happy path — request that works', body: { kind: 'prose', blocks: happyPath }, diagramFocus: 'full' },
    { id: 's3', level: 101, headline: 'Auth failure — 401 Unauthorized', body: { kind: 'prose', blocks: authFailure }, diagramFocus: 'app' },
    { id: 's4', level: 101, headline: 'Authz failure — 403 Forbidden', body: { kind: 'prose', blocks: authzFailure }, diagramFocus: 'app' },
    { id: 's5', level: 101, headline: 'Validation failure — 400 Bad Request', body: { kind: 'prose', blocks: validationFailure }, diagramFocus: 'app' },
    {
      id: 's6',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Every request flows through the same path — but where it stops, and which gate stops it, depends on what’s wrong',
          '401 means "we don’t know you"; 403 means "we know you, but you can’t do this"; 400 means "the request itself is broken"',
          'Failed requests should be rejected at the earliest gate possible — never returned-and-then-hidden in the UI',
          'Pattern recognition for these failure modes is what lets you spot missing checks in agent-generated code',
        ],
        whereInSystem: [
          _('All four scenarios use the same diagram we’ve been building since Chapter 1. The CDN serves static assets at the edge; the back-end is where every gate (authentication, authorization, validation) actually runs; the database is only ever touched when a request makes it past every gate.'),
        ],
        bridge: [
          _('Coming up — Chapter 10: Working with Claude Code. You now have the literacy to direct an AI coding agent on a real codebase. The final chapter is about the workflow — how to orient, how to ask better questions, and how to use the nine-question feature template to catch problems before code is even written.'),
        ],
        prompts: [
          'For [pick a feature in your codebase], walk me through the full request path from browser to database. Tell me which gates would reject it and why.',
          'Where in this codebase is a request most likely to be silently wrong rather than properly rejected? Show me the code and explain what the missing check would look like.',
        ],
      },
    },
  ],
}
