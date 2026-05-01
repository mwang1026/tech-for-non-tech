import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })

/* ============================================================================
 * Chapter 3 — Validation & Authorization (101)
 *
 * Diagram visible: same as Ch 2 (no new boxes; gates are conceptual overlay).
 *
 * Slide arc:
 *   1. Why every operation needs gates
 *   2. Authentication vs. authorization
 *   3. Three ways authorization gets answered
 *   4. The third gate: data validation
 *   5. Why front-end checks aren't security
 *   6. Recap (with prompts)
 * ============================================================================ */

/* --------------------------- Slide 1 — Why gates --------------------------- */

const whyGates: Block[] = [
  p(_('Coming out of Chapter 2, we know how the back-end establishes '), t('identity', 'identity'), _(' — who the request is from. But knowing the identity doesn’t tell you what they’re allowed to do — or whether what they sent is even something the system should accept.')),
  p(_('Imagine a back-end URL that updates a user’s profile, with no checks at all on it. What could go wrong?')),
  ul(
    [_('Someone could call it without logging in — and the system has no way to refuse.')],
    [_('A logged-in user could call it with someone else’s user ID in the URL — and edit a stranger’s profile.')],
    [_('Someone could send a "name" field that’s absurdly long, or contains code, or is a number where text was expected — and the database accepts the garbage and corrupts itself.')],
  ),
  p(_('Every one of these is a regular bug class that ships to production whenever someone forgets to add the right check. What needs to happen: every meaningful operation passes through three gates before anything actually changes — authentication, authorization, validation.')),
]

/* --------------------------- Slide 2 — Authn vs Authz --------------------------- */

const authnVsAuthz: Block[] = [
  p(_('The first two gates sound similar but answer very different questions. Engineers shorten them to "authn" and "authz" — and it’s worth getting straight which is which.')),
  ul(
    [t('Authentication', 'authentication'), _(' (authn) — Are you who you say you are? This is the gate that checks the token from Chapter 2. Valid token → the back-end has an '), t('identity', 'identity'), _('. No token, expired token, or tampered token → request is rejected with status code '), t('401 Unauthorized', '401'), _(' (which despite the name actually means "unauthenticated").')],
    [t('Authorization', 'authorization'), _(' (authz) — OK, you’re really you. But are you allowed to do *this specific thing*? Read this particular order? Edit this particular profile? Delete this comment? Authorization asks: can this identity perform this '), t('action', 'action'), _(' on this '), t('resource', 'resource'), _('? Failure returns '), t('403 Forbidden', '403'), _('.')],
  ),
  p(_('Here’s the trap: a successful login (authentication) doesn’t mean you can do anything. A logged-in user can still try to read someone else’s data, and authorization is what stops them. The auth checks happen on every single request, every single endpoint — not just at the login screen.')),
  p(_('A common authorization mistake: an endpoint that accepts a `userId` from the request body and returns that user’s data. The token authenticates the caller as user 47, but if the endpoint blindly returns whatever userId you asked for, you can pass `userId=48` and read someone else’s data. The fix: derive the identity from the verified *token*, not from anything the caller can change.')),
]

/* --------------------------- Slide 3 — Three ways authorization gets answered --------------------------- */

const authzPatterns: Block[] = [
  p(_('Authorization is a question — *can this identity perform this action on this resource?* — but how the back-end actually answers it varies. Three patterns cover almost everything you’ll see in a real codebase. Recognizing them by name is the goal here; an agent will use these terms unprompted, and you’ll want to follow.')),
  ul(
    [_('**Owner-based** — the most common. The resource has an owner (the user who created it, the account it belongs to), and the back-end checks that the identity matches. "Can user 47 edit comment 8932?" becomes "is comment 8932’s author_id equal to 47?" Most consumer apps run on this.')],
    [_('**Role-based** — the identity carries a role (admin, editor, viewer, customer), and each action requires a role. "Can this user delete any post?" becomes "does this identity have the admin role?" Common in admin panels, content systems, and enterprise apps with structured permission tiers.')],
    [_('**Rule-based** — an arbitrary check function combining identity, action, resource, and current state. "Can this user refund this order?" becomes "is this identity in the support team AND is the order paid AND is the order less than 30 days old?" The most flexible; covers ownership and roles as special cases. Often expressed as a policy file, or a check function that returns yes/no.')],
  ),
  p(_('Real codebases mix all three. A user owns their own posts (owner-based) but admins can edit any post (role-based) unless the post is in a frozen state (rule-based). When directing an agent, naming the pattern is what makes the conversation crisp — *"the comment-edit endpoint should be an owner check"*; *"the admin override should be role-gated"*; *"the refund window is a rule, not just a role."*')),
]

/* --------------------------- Slide 4 — Data validation --------------------------- */

const dataValidation: Block[] = [
  p(_('You’re authenticated, you’re authorized, and now the back-end actually has to look at what you sent. Even from a legitimate user, the data could be malformed, out of range, or actively malicious.')),
  p(
    t('Validation', 'validation'),
    _(' is the third gate: is this input even something the system can safely use? Required fields present? Numbers within the expected range? Text fields short enough to fit? Email addresses shaped like email addresses? An empty or wrong-shaped request gets rejected with status code '),
    t('400 Bad Request', '400'),
    _(', and nothing in the database changes.'),
  ),
  p(_('Validation also defends against actively hostile inputs. Two of the most common attack categories — both worth knowing by name:')),
  ul(
    [t('SQL injection', 'sql-injection'), _(' — When user input ends up inside a database query as if it were code, an attacker can put fragments of database language into a form field and trick the system into running them. ("Put your name here:" → the attacker types something that means "delete the entire users table.") Modern frameworks defend against this, but only if developers use them correctly.')],
    [t('Cross-site scripting (XSS)', 'xss'), _(' — When user input is shown back to other users without being cleaned up, an attacker can hide little bits of code in their post that runs in your browser when you read it. Modern frameworks again defend against this, but only if used correctly.')],
  ),
  p(_('The pattern in both: an attacker putting code where data was expected. Validation is what catches it before it reaches the part of the system that would execute it.')),
]

/* --------------------------- Slide 5 — Front-end checks aren't security --------------------------- */

const frontendNotSecurity: Block[] = [
  p(_('Every modern web app has front-end checks: the email field that turns red when you type something invalid, the "delete" button that’s grayed out for users who don’t own the resource, the form that won’t submit if a required field is empty. These are good UX. They are *not* security.')),
  p(_('The reason: the front-end runs on the user’s machine. Anyone who controls a machine controls what runs on it. They can:')),
  ul(
    [_('Open the browser’s developer tools and call the API directly, skipping every front-end check.')],
    [_('Modify the page in DevTools to un-disable the "delete" button and click it.')],
    [_('Write a script that sends fake requests pretending to be the front-end. The back-end has no reliable way to tell the difference.')],
  ),
  p(_('The rule: if it matters, the back-end checks it. The front-end can check the same things on top, for UX reasons (instant feedback, fewer round-trips), but the back-end check is the real one. Hiding a button doesn’t protect the underlying URL — and "we hid the button" is one of the most consistent sources of "we shipped a security hole" stories.')),
  p(_('When directing an agent to add a feature, ask explicitly: where is this validated on the back-end? Where is permission checked on the back-end?')),
]

/* --------------------------- Chapter 3 export --------------------------- */

export const chapter03: Chapter = {
  id: 'ch3',
  number: 3,
  title: 'Validation & Authorization',
  subtitle: 'Three gates every request passes through',
  slides: [
    { id: 's1', level: 101, headline: 'Why every operation needs gates', body: { kind: 'prose', blocks: whyGates }, diagramFocus: 'app' },
    { id: 's2', level: 101, headline: 'Authentication vs. authorization', body: { kind: 'prose', blocks: authnVsAuthz }, diagramFocus: 'app' },
    { id: 's3', level: 101, headline: 'Three ways authorization gets answered', body: { kind: 'prose', blocks: authzPatterns }, diagramFocus: 'app' },
    { id: 's4', level: 101, headline: 'The third gate — is the data even valid?', body: { kind: 'prose', blocks: dataValidation }, diagramFocus: 'app' },
    { id: 's5', level: 101, headline: 'Why front-end checks aren’t security', body: { kind: 'prose', blocks: frontendNotSecurity }, diagramFocus: 'browser' },
    {
      id: 's6',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Every request passes three gates at the back-end: authentication (is the identity real), authorization (can this identity perform this action on this resource), validation (is the input even acceptable)',
          'A 401 means "we don’t know who you are"; 403 means "we know who you are, but you can’t do this"; 400 means "the request itself is malformed"',
          'Authorization in real codebases is owner-based (does the resource belong to you), role-based (do you have the right role), or rule-based (does an arbitrary policy say yes) — usually a mix of all three',
          'Front-end checks (graying out a button, validating a form) are UX, not security — anyone can call the API directly',
          'Authorization mistakes (like trusting a userId from the request body) are one of the most common sources of "user A read user B’s data" bugs',
        ],
        whereInSystem: [
          _('The three gates live in the back-end, between the request arriving and any '),
          t('resource', 'resource'),
          _(' being read or written. The '),
          t('identity', 'identity'),
          _(' from Chapter 2 (proven by the '),
          t('token', 'token'),
          _(') flows in with the request and is what the authentication and authorization gates evaluate.'),
        ],
        bridge: [
          _('Coming up — Chapter 4: State. We now know the identity, the actions they can take, and the resources they can touch. The next question is *where those resources actually live* — memory, database, cache — and the tradeoffs between them.'),
        ],
      },
    },
  ],
}
