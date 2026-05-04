import type { Chapter, Block } from './types'
import { _, t, p, ul, step, steps } from './authoring'

/* ============================================================================
 * Chapter 1 — The Request-Response Cycle (101)
 *
 * Diagram visible by end of this chapter at 101:
 *   Browser → Front-end → Back-end → Database
 *
 * Slide arc:
 *   1. The basic loop          (browser → server → database → back)
 *   2. HTTP, the shared language (the protocol; methods; URLs)
 *   3. Status codes              (200 / 404 / 500 — what the server says back)
 *   4. Front-end vs back-end     (what runs where; security + scale)
 *   5. Recap + Claude Code prompts
 * ============================================================================ */

/* --------------------------- Slide 1 — The basic loop --------------------------- */

const basicLoop: Block[] = [
  p(_('You click a button in your bank’s app — *Transfer $100 from Checking to Savings* — and a second later, the screen shows new balances. That second is the entire subject of this chapter. Press → to walk through it.')),
  steps(
    step(
      [
        _('You click. Your '), t('browser', 'browser'),
        _(' (Chrome, Safari, Firefox — the program you’re using to view the page) packages the action into a message called a "request" — *transfer $100, checking → savings*.'),
      ],
      { highlight: ['browser'], status: 'neutral', focus: 'full' },
    ),
    step(
      [
        _('The request travels across the internet to the bank’s '), t('server', 'server'),
        _(' — a computer somewhere on the internet that the bank owns or rents, which holds the code for the application.'),
      ],
      { highlight: ['be-pool'], status: 'neutral', focus: 'app' },
    ),
    step(
      [
        _('The server starts working through the transfer. First it reads from the '),
        t('database', 'database'),
        _(' — a specialized program that stores the bank’s permanent data — to look up your two account balances.'),
      ],
      { highlight: ['db-primary'], status: 'neutral', focus: 'data' },
    ),
    step(
      [_('The server is now holding both balances in its memory — the numbers it just read a moment ago in step 3. It uses those numbers to do a quick check: is there at least $100 in checking? Yes, there is. It decides the transfer can proceed. No new database trip in this step; the server is just doing the math with the data it already has.')],
      { highlight: ['be-pool'], status: 'neutral', focus: 'app' },
    ),
    step(
      [_('Now the writes — three of them, back to the database: subtract $100 from checking, add $100 to savings, append a row to your transaction history.')],
      { highlight: ['db-primary'], status: 'neutral', focus: 'data' },
    ),
    step(
      [_('With every write committed, the server packages a response — *Transfer complete* — and sends it back. Your browser receives it and updates the screen; you see the new balances.')],
      { highlight: ['browser'], status: 'pass', focus: 'full' },
    ),
  ),
  p(_('That whole round-trip — click → request → server → database → response → screen update — is what people mean by "the request-response cycle." One click on the outside; on the inside, the server made one read, one decision, and three writes against the database before it responded.')),
  p(_('A request that touches data is a chain of reads, decisions, and writes — not a single transaction. That shape repeats whether the feature is a $100 transfer, a search result, or a like on a post.')),
]

/* --------------------------- Slide 2 — HTTP, the shared language --------------------------- */

const httpLanguage: Block[] = [
  p(_('We have a browser, a server, and a database passing messages back and forth. They’re separate programs running on different machines, and they can be written in different languages — JavaScript in the browser; Python, Go, Ruby, Java, or Node on the server. They have to agree on a shared message format or they can’t communicate at all.')),
  p(
    _('That agreement is called '), t('HTTP', 'http'),
    _(' (HyperText Transfer Protocol). When your browser makes a request, it follows HTTP’s rules: it specifies a '), t('URL', 'url'),
    _(' (the address of what it wants — `mybank.com/accounts/checking`), a "method" (a one-word label for what it’s trying to do — read, write, delete), and any data it needs to send along.'),
  ),
  p(_('The two methods to know for now:')),
  ul(
    [t('GET', 'http-get'), _(' — "Give me this thing." Reading data. Loading a page, fetching a list, looking up a record.')],
    [t('POST', 'http-post'), _(' — "Take this and do something with it." Submitting a form, posting a comment, charging a card.')],
  ),
  p(
    _('Modern sites use '), t('HTTPS', 'https'),
    _(' instead of plain HTTP. The "S" is for Secure — the messages between browser and server are encrypted in transit, so anyone snooping on the network sees gibberish instead of your password. The small icon next to the URL is how the browser shows the connection is encrypted (Chrome shows a "tune" icon; other browsers still show a lock).'),
  ),
]

/* --------------------------- Slide 3 — Status codes --------------------------- */

const statusCodes: Block[] = [
  p(_('Every HTTP response carries a three-digit number — a '), t('status code', 'status-code'), _(' — that summarizes what happened. It’s how the server tells the browser (and you) what just went down. The codes are grouped by their first digit:')),
  ul(
    [_('**2xx — It worked.** `200 OK` is the standard success code; you see it on every successful page load, every successful click.')],
    [_('**3xx — Go somewhere else.** Redirects. The server is saying "what you asked for has moved; here’s the new address." Common when you visit `example.com` and end up on `www.example.com`.')],
    [_('**4xx — You did something wrong.** Examples: '), t('404', 'http-404'), _(' Not Found (the page or item doesn’t exist), `401 Unauthorized` (you’re not logged in), `403 Forbidden` (you’re logged in, but not allowed to see this).')],
    [_('**5xx — The server did something wrong.** `500 Internal Server Error` is the catch-all "something broke on our side and we don’t want to tell you what." `503 Service Unavailable` means the server is overloaded or down for maintenance.')],
  ),
  p(_('When a real product breaks for a user, the first thing an engineer asks is "what status code came back?" A 4xx points the investigation at the request (the user did something the system rejected). A 5xx points it at the server (something in our code or infrastructure broke). That single number narrows down where to look.')),
  p(_('We’ve been talking about "the server" as one thing. The next slide splits it: code that runs in the browser the user controls, and code that runs on the machines we control. That split decides where security can be enforced and what scales for free.')),
]

/* --------------------------- Slide 4 — Front-end vs back-end --------------------------- */

const frontVsBack: Block[] = [
  p(_('We’ve been treating the browser as one thing and the server as another. Engineers split that into two more specific terms: front-end and back-end. The split decides who owns what code, who can see what data, and where to fix what bug.')),
  p(
    _('The '), t('front-end', 'front-end'),
    _(' is the code that runs inside the user’s browser. The HTML that lays out the page, the styles that make it look right, the JavaScript that makes buttons respond when clicked. All of it gets downloaded to your computer when you visit the page, and runs there. You can right-click "View Source" in your browser and read it.'),
  ),
  p(
    _('The '), t('back-end', 'back-end'),
    _(' is the code that runs on the company’s servers. It handles the requests the front-end sends, talks to the database, enforces business rules, and decides what data to return. You can never see this code directly — it lives on machines you don’t have access to.'),
  ),
  p(_('Two practical consequences of the split:')),
  ul(
    [_('**Security.** The front-end runs on the user’s machine, which means the user can read it, modify it, or skip it entirely. Anything you really need to enforce — permissions, payment validation, database changes — must happen in the back-end. Hiding a button in the front-end is not security; the user can just call the underlying back-end URL directly with their own code.')],
    [_('**Scale.** When ten million people use your product at once, you don’t have ten million browsers to worry about — they each run on the user’s own device. You only have your own back-end servers to scale up. The front-end scales for free; the back-end is the bottleneck.')],
  ),
  p(_('One footnote you’ll hear from engineers: in production, what we’re calling "the back-end" is sometimes itself split into two server tiers — a **front-end server** that ships the HTML/CSS/JavaScript files to your browser (think Next.js, Vercel), and a **back-end server** that handles data, auth, and business rules (think Express, Django, Rails). When someone says "front-end server," that\'s what they mean — a server whose job is to serve up the front-end code. For the rest of this primer, we\'ll treat the back-end as one server tier — every distinction this material covers (auth, validation, concurrency, scaling, deployment) happens on the data-handling side regardless of how the team has carved up its servers.')),
]

/* --------------------------- Chapter 1 export --------------------------- */

export const chapter01: Chapter = {
  id: 'ch1',
  number: 1,
  title: 'The Request-Response Cycle',
  subtitle: 'How a click in your browser becomes data, and back',
  slides: [
    { id: 's1', level: 101, headline: 'The basic loop', body: { kind: 'prose', blocks: basicLoop }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'HTTP, the shared language', body: { kind: 'prose', blocks: httpLanguage }, diagramFocus: 'app' },
    { id: 's3', level: 101, headline: 'Status codes — what the server tells you', body: { kind: 'prose', blocks: statusCodes }, diagramFocus: 'app' },
    { id: 's4', level: 101, headline: 'Front-end vs. back-end', body: { kind: 'prose', blocks: frontVsBack }, diagramFocus: 'app' },
    {
      id: 's5',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Every web interaction is a request-response loop: browser asks, server answers, database holds the permanent data',
          'HTTP is the shared language; GET reads, POST writes; HTTPS is the encrypted version that modern sites use',
          'Status codes are the server\'s one-number summary — 2xx success, 3xx redirect, 4xx the request was wrong, 5xx the server broke',
          'Front-end runs in the user\'s browser (visible, modifiable); back-end runs on company servers (hidden, trusted) — security and scale both depend on the split',
        ],
        whereInSystem: [
          _('The '), t('browser', 'browser'),
          _(' sits at the top of the diagram. It sends requests to the '),
          t('back-end', 'back-end'),
          _(' (the application server), which talks to the '),
          t('database', 'database'),
          _(' for permanent data and sends a response back. Every other concept in this primer attaches to some piece of this loop.'),
        ],
        bridge: [
          _('That\'s the whole loop, named. The rest of Act I (Ch 2–6) answers the questions a real system has to answer to handle a request: **who** is asking (Ch 2), **what they\'re allowed to do** (Ch 3), **where the data they want lives** (Ch 4), **how to route it through many servers without slowing down** (Ch 5), and **what to do when many requests want the same data at the same instant** (Ch 6). Then Ch 7 walks real requests through the whole machine. Coming up next — Chapter 2: Identity.'),
        ],
      },
    },
  ],
}
