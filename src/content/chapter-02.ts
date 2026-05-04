import type { Chapter, Block } from './types'
import { _, t, p, ul } from './authoring'

/* ============================================================================
 * Chapter 2 — Identity (101)
 *
 * Diagram visible by end of this chapter at 101:
 *   Browser → Front-end → Back-end → Cache + DB
 *   (No new boxes added at this chapter — identity is overlay/concept,
 *   represented as the token "riding" on the request arrows.)
 *
 * Slide arc:
 *   1. The multi-user problem        (why identity matters at all)
 *   2. Logging in once, proving it many times (the token-after-login pattern)
 *   3. What the token actually is    (long unguessable string + how server checks it)
 *   4. Slicing the database          (identity is what carves "your data" out of all data)
 *   5. Recap + Claude Code prompts
 * ============================================================================ */

/* --------------------------- Slide 1 — The multi-user problem --------------------------- */

const multiUserProblem: Block[] = [
  p(_('Coming out of Chapter 1, we have the request-response loop: browser asks, back-end answers. But here’s the situation we’ve been ignoring: real products serve hundreds, thousands, sometimes millions of users at once, all hitting the same back-end. Every one of those users wants to see *their* data — their orders, their messages, their account balance — and definitely not anyone else’s.')),
  p(_('Imagine the back-end ignored this question entirely. Two people log into the same banking app at the same time. Both make a request: "show me my account." The back-end reads its records. Which account does it return? Without something attached to the request that says "this is from user 123," the back-end has no way to know — and either every request gets the same data, or none of them do.')),
  p(_('What needs to happen: every single request the back-end receives has to carry, somehow, a verifiable answer to the question "who is this from?" That answer is what we call '), t('identity', 'identity'), _('. It’s the very first thing the system needs to know about every request — before it can decide what to do, it has to know who’s asking.')),
]

/* --------------------------- Slide 2 — Logging in once, proving it many times --------------------------- */

const loginOnce: Block[] = [
  p(_('We need every request to carry proof of who it’s from. The obvious solution is also the wrong one: send your username and password with every single request.')),
  p(_('Why that’s wrong, in three pieces:')),
  ul(
    [_('**Leakage in transit.** Every time a password crosses the network, it’s another chance for it to leak — through a logging system that captured it accidentally, or an attacker watching the traffic. Loading one page might mean fifty requests; that would be fifty chances to lose it.')],
    [_('**Leakage at rest.** A password that’s sent constantly is a password that ends up in screenshots, browser history, support tickets, error reports — places it was never meant to land.')],
    [_('**Speed.** The server would have to re-check the password against its records on every single request, which is slow.')],
  ),
  p(_('What needs to happen: the user proves their password *once*, at login. Then for every request after that, the user sends something else — something easier to verify, something that can be replaced if it leaks, something that doesn’t expose the password.')),
  p(
    _('The way this is solved: after a successful login, the server creates a '),
    t('token', 'token'),
    _(' — a long, opaque string — and hands it back to the browser. The browser stores it. From that point on, every request the browser makes includes that token in a header (an extra piece of information tagged onto the request, separate from the page or data being requested). The server checks the token, sees it’s valid, and knows which user this request belongs to. The password never crosses the wire again until the next login.'),
  ),
  p(
    _('Two common forms at this level: a '),
    t('session', 'session'),
    _(' (the server keeps a list of every active token and which user it belongs to) or a '),
    t('JWT', 'jwt'),
    _(' (the token has the user’s identity baked into it, signed by the server, so no lookup is needed). Both work; we’ll get into the tradeoffs later.'),
  ),
  p(_('Tokens have expiration dates and can be revoked — if your laptop is stolen, the token can be invalidated without anyone changing their password. (Sessions revoke trivially; JWTs are harder, since their "I am valid" lives inside the token itself — the JWT glossary entry has the details.)')),
  p(
    _('Most teams don’t build this themselves. They use a hosted service like '),
    t('Auth0', 'auth0'), _(', '), t('Clerk', 'clerk'), _(', or '), t('Okta', 'okta'),
    _(' that handles login flows, issues tokens, and provides the verification logic. The team just plugs it in and trusts the service to get the cryptography right.'),
  ),
]

/* --------------------------- Slide 3 — What the token actually is --------------------------- */

const whatTokenIs: Block[] = [
  p(_('Two questions follow from "the browser sends a token back on every request": what does the token actually look like, and how does the server verify it?')),
  p(_('Imagine the token is just a number — 1, 2, 3 — that the server hands out in order. You can probably see the problem: anyone could guess "I bet someone has token 47" and pretend to be that user. Identity would be trivially forgeable. So the token has to be unguessable in practice — long enough and random enough that no attacker can produce a valid one without already having stolen it.')),
  p(_('In practice, tokens come in two shapes:')),
  ul(
    [_('**Opaque random tokens** — long random strings, typically 30+ characters of letters and numbers (looks like `r3kT9xY2bQ8mN1pV...`). The string itself means nothing; the server checks it by looking it up in a list of issued tokens and finding which user it belongs to. Not found, or expired? Reject the request.')],
    [_('**Signed tokens (JWTs)** — the token contains the user’s ID, plus a tamper-proof seal (a *cryptographic signature*) that the server made when it issued the token. JWTs look more structured: `eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NSJ9.abc...` (you’re not meant to read it). The server checks that the seal is its own — if it is, the token is genuine and the user ID inside it is trustworthy. No lookup needed.')],
  ),
  p(_('Either way, the verification has to happen on every single request that does anything sensitive. Skipping the check, even once, is how breaches happen.')),
]

/* --------------------------- Slide 4 — Slicing the database --------------------------- */

const slicingTheDb: Block[] = [
  p(_('Now we know how the request says "this is from user 123." But that’s only useful if the back-end actually does something with it.')),
  p(_('Picture the back-end’s data as one giant room with everyone’s stuff in it — every user’s notes, orders, messages, photos. Each item carries a small stamp: this one belongs to user 123, this one to user 456, and so on.')),
  p(_('When a request arrives that says "show me my notes," the back-end pulls the user ID out of the verified token (let’s say 123), then asks for everything stamped 123. Items stamped 456 are sitting right there next to them, but they were never asked for, so they never come back. The requesting user only ever sees their own.')),
  p(_('This is what we mean when we say identity "isolates" users from each other. The data isn’t really separated — it’s all in one place — but identity is the key that decides which slice of it any given request can read or change. It’s the thing that turns a shared back-end into something that feels, to each user, like their own private space. Every safe multi-user system in the world works this way.')),
]

/* --------------------------- Recap --------------------------- */

export const chapter02: Chapter = {
  id: 'ch2',
  number: 2,
  title: 'Identity',
  subtitle: 'How the system knows whose data to show',
  slides: [
    { id: 's1', level: 101, headline: 'A room full of strangers', body: { kind: 'prose', blocks: multiUserProblem }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Prove it once, then prove it cheaply', body: { kind: 'prose', blocks: loginOnce }, diagramFocus: 'browser' },
    { id: 's3', level: 101, headline: 'What the token actually is', body: { kind: 'prose', blocks: whatTokenIs }, diagramFocus: 'app' },
    { id: 's4', level: 101, headline: 'Slicing the database', body: { kind: 'prose', blocks: slicingTheDb }, diagramFocus: 'data' },
    {
      id: 's5',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Real systems serve many users at once; the back-end has no way to know whose data to return without something attached to each request that identifies the user',
          'After a successful login, the server hands back a token — a long unguessable string — that the browser sends with every subsequent request, so the password never has to cross the wire again',
          'The server verifies the token on every sensitive request, either by looking it up in a list or by checking its cryptographic signature; without that check, anyone can pretend to be anyone',
          'Identity is what slices a shared database into "your data" vs. "everyone else\'s" — the data isn\'t really separated, but every query is filtered by the user ID extracted from the verified token',
        ],
        whereInSystem: [
          _('At this level, identity doesn’t add a new box to the diagram — it rides on the request arrows. A '),
          t('token', 'token'),
          _(' travels from the browser to the back-end on every request. The back-end verifies it, extracts the user ID, and uses that ID to filter what gets read from or written to the database. Same boxes; smarter conversations.'),
        ],
        bridge: [
          _('Coming up — Chapter 3: Validation & Authorization. Knowing *who* the user is (this chapter) is one thing. Knowing whether they’re *allowed* to do this specific thing — read this record, change this setting, delete this account — is another. Identity says "this is user 123." Authorization says "and yes, user 123 is permitted to do what they’re asking."'),
        ],
      },
    },
  ],
}
