/**
 * Glossary — every term marked with `t()` in chapters 1–10 has an entry here.
 *
 * Authoring rules:
 *  - Keep `short` to one sentence; it's the at-a-glance definition shown in the panel list.
 *  - `body` is 1–3 short paragraphs. Plain prose; don't introduce more jargon than necessary.
 *  - `chapter` is where the term is first introduced (used to group/order in the panel).
 */

export type GlossaryCategory =
  | 'web-basics'
  | 'state-data'
  | 'identity-auth'
  | 'concurrency'
  | 'architecture'
  | 'code-lifecycle'
  | 'deployment-ops'
  | 'agents'

export type GlossaryEntry = {
  id: string
  term: string
  short: string
  body: string[]
  chapter: number
  category: GlossaryCategory
  /** Optional list of related entry IDs the panel can show as cross-links. */
  related?: string[]
}

export const glossary: GlossaryEntry[] = [
  /* ====================================================================
   * Chapter 1 — The Request-Response Cycle
   * ==================================================================== */
  {
    id: 'browser',
    term: 'Browser',
    short: 'The program on your device that loads, displays, and runs web pages.',
    body: [
      'Chrome, Safari, Firefox, Edge — all browsers. They take a URL, fetch the page over HTTPS, render the HTML and CSS, and run the JavaScript the page brought along.',
      'Anything described as the "front-end" runs inside the browser. Because the browser is on the user’s machine, the user can read, modify, or skip anything that runs there — which is why security checks must live on the back-end.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['front-end', 'back-end'],
  },
  {
    id: 'server',
    term: 'Server',
    short: 'A computer somewhere on the internet that runs the application’s code and answers requests.',
    body: [
      'When the browser sends a request, a server receives it, figures out what was asked for, and returns a response. A real product usually runs many servers at once behind a load balancer, not just one.',
      '"Server" loosely covers anything that listens for requests — application servers, database servers, cache servers. When engineers say "the server" without qualification, they usually mean the application back-end.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['back-end', 'load-balancer'],
  },
  {
    id: 'database',
    term: 'Database',
    short: 'A specialized program that stores the application’s permanent data on disk.',
    body: [
      'Databases survive restarts and crashes — anything written to one is still there after the machine reboots. They’re slower than memory (milliseconds, not nanoseconds) but they’re where everything that has to outlive the next deploy actually lives.',
      'In almost every system, the database is the "source of truth": when copies elsewhere (caches, in-memory snapshots) disagree, the database wins. PostgreSQL and MySQL are the two most common.',
    ],
    chapter: 1,
    category: 'state-data',
    related: ['postgresql', 'mysql', 'source-of-truth', 'cache'],
  },
  {
    id: 'http',
    term: 'HTTP',
    short: 'The protocol — the agreed-on message format — that browsers and servers use to talk.',
    body: [
      'HTTP (HyperText Transfer Protocol) defines what a request and response look like: the verb (method), the URL, headers, and an optional body. Every browser and every server agrees on this format, which is why anything can talk to anything.',
      'Modern sites use HTTPS — the encrypted version of HTTP — so messages between browser and server can’t be read in transit.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['https', 'url', 'http-get', 'http-post'],
  },
  {
    id: 'url',
    term: 'URL',
    short: 'The address of what the request wants — `mybank.com/accounts/checking`.',
    body: [
      'A URL identifies a specific resource: which host (the domain), which path (the resource), and any query parameters. The browser uses it to know where to send the request; the server uses it to know what was asked for.',
    ],
    chapter: 1,
    category: 'web-basics',
  },
  {
    id: 'http-get',
    term: 'GET',
    short: 'The HTTP verb for "give me this thing." Used for reading data.',
    body: [
      'GET requests load pages, fetch lists, look up records. They’re supposed to be safe to repeat — calling the same GET twice should give the same answer and not change anything on the server.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['http-post', 'http'],
  },
  {
    id: 'http-post',
    term: 'POST',
    short: 'The HTTP verb for "take this and do something with it." Used for writes.',
    body: [
      'POST requests submit forms, post comments, charge cards, create records. Unlike GET, a POST is expected to change something on the server — so calling the same POST twice can have very different effects (charging the user twice, posting two copies).',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['http-get', 'http'],
  },
  {
    id: 'https',
    term: 'HTTPS',
    short: 'HTTP, but encrypted in transit so anyone snooping the network sees gibberish.',
    body: [
      'The "S" is for Secure. The small icon next to the URL in your browser shows the connection is encrypted (a lock, a "tune" icon, etc., depending on browser). Every legitimate site uses HTTPS now — plain HTTP is treated as broken.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['http'],
  },
  {
    id: 'status-code',
    term: 'Status code',
    short: 'A three-digit number on every HTTP response that summarizes what happened.',
    body: [
      '2xx means success, 3xx is a redirect, 4xx means the request was wrong, 5xx means the server broke. The first digit narrows the investigation: a 4xx points at the caller, a 5xx points at the server.',
      'When a real product breaks for a user, the first thing engineers ask is "what status code came back?"',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['http-404', '401', '403', '400'],
  },
  {
    id: 'http-404',
    term: '404 Not Found',
    short: 'The page or item you asked for doesn’t exist.',
    body: [
      'A 4xx code: the request was syntactically fine, but there’s nothing at the URL you used. Often a typo in the URL, or a record that was deleted.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['status-code'],
  },
  {
    id: 'endpoint',
    term: 'Endpoint',
    short: 'A specific URL on the back-end that does one thing — `/api/orders`, `/api/login`, etc.',
    body: [
      'When engineers say "this endpoint" they mean one of those addressable doors into the back-end. Each endpoint accepts certain HTTP methods (GET to read, POST to write), expects certain inputs, and returns certain outputs.',
      'A back-end is essentially a collection of endpoints. Authorization, validation, and the rest of the gates run on every endpoint that does anything sensitive.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['back-end', 'http', 'authorization'],
  },
  {
    id: 'front-end',
    term: 'Front-end',
    short: 'The code that runs inside the user’s browser.',
    body: [
      'HTML for layout, CSS for styles, JavaScript for behavior — all of it gets downloaded to the user’s computer and runs there. You can right-click "View Source" in a browser and read it.',
      'Because the front-end runs on the user’s machine, the user can read it, modify it, or skip it entirely. Anything you really need to enforce — permissions, payment validation, database changes — has to happen on the back-end.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['back-end', 'browser'],
  },
  {
    id: 'back-end',
    term: 'Back-end',
    short: 'The code that runs on the company’s servers, hidden from users.',
    body: [
      'The back-end handles the requests the front-end sends, talks to the database, enforces business rules, and decides what data to return. Users can never read its source — it lives on machines they don’t have access to.',
      'Every meaningful security check, every authoritative data write, every gate the system depends on, runs on the back-end.',
    ],
    chapter: 1,
    category: 'web-basics',
    related: ['front-end', 'server'],
  },

  /* ====================================================================
   * Chapter 4 — State
   * ==================================================================== */
  {
    id: 'state',
    term: 'State',
    short: 'Everything the system "knows" about the world right now.',
    body: [
      'The user’s name, their cart, whether they’re logged in, how many items are in inventory, which notifications they haven’t opened — all of it is state. The question of where each piece of state lives (memory, database, cache) is one of the biggest decisions in software design.',
    ],
    chapter: 4,
    category: 'state-data',
    related: ['memory', 'database', 'cache', 'source-of-truth'],
  },
  {
    id: 'memory',
    term: 'Memory (RAM)',
    short: 'The server’s working memory — instant to read and write, lost on restart.',
    body: [
      'Reading and writing memory takes nanoseconds. The catch: when the server restarts (a deploy, a crash, routine maintenance), everything in memory is gone.',
      'Use memory for data you’re actively computing with right now, or for data that’s OK to lose (an in-progress search query, a "loading…" indicator).',
    ],
    chapter: 4,
    category: 'state-data',
    related: ['database', 'cache'],
  },
  {
    id: 'postgresql',
    term: 'PostgreSQL',
    short: 'A widely-used open-source relational database — often "Postgres" for short.',
    body: [
      'Mature, feature-rich, the default choice for most modern web back-ends. Strong support for transactions and complex queries.',
    ],
    chapter: 4,
    category: 'state-data',
    related: ['database', 'mysql'],
  },
  {
    id: 'mysql',
    term: 'MySQL',
    short: 'Another widely-used open-source relational database.',
    body: [
      'Older than Postgres in popular use, still extremely common — especially in older codebases and in PHP/WordPress ecosystems. Owned by Oracle. MariaDB is a community-driven fork.',
    ],
    chapter: 4,
    category: 'state-data',
    related: ['database', 'postgresql'],
  },
  {
    id: 'cache',
    term: 'Cache',
    short: 'A fast copy of database data, usually held in memory, used to skip the slow database.',
    body: [
      'When the back-end needs data, it checks the cache first. Hit → answer comes back in milliseconds, no database touch. Miss → it queries the database and stores the answer in the cache for next time.',
      'The tradeoff is freshness: a cached copy can be out of date if the database changed since the cache was filled. Caches are great for data that’s expensive to compute and tolerable to be a few seconds stale; bad for data that has to be exactly current (account balances).',
    ],
    chapter: 4,
    category: 'state-data',
    related: ['redis', 'database', 'source-of-truth'],
  },
  {
    id: 'redis',
    term: 'Redis',
    short: 'The most common cache. An in-memory data store keyed by string.',
    body: [
      'Redis sits between the back-end and the database, holding fast copies of recent answers. It’s also commonly used for session storage, rate-limit counters, and lightweight queues.',
    ],
    chapter: 4,
    category: 'state-data',
    related: ['cache'],
  },
  {
    id: 'source-of-truth',
    term: 'Source of truth',
    short: 'The one place that, when copies disagree, is treated as authoritative.',
    body: [
      'Once data lives in multiple places (database, cache, the user’s browser), they can disagree. The source of truth is whichever one wins by rule — usually the database. Caches are allowed to be stale and catch up later.',
      'Source-of-truth thinking heads off "I updated it but it’s not showing up" bugs across synced contacts, multi-device settings, inventory across stores, and anywhere else data is replicated.',
    ],
    chapter: 4,
    category: 'state-data',
    related: ['database', 'cache'],
  },

  /* ====================================================================
   * Chapter 2 — Identity
   * ==================================================================== */
  {
    id: 'token',
    term: 'Token',
    short: 'A long, opaque string the server gives the browser after login, used to prove identity on subsequent requests.',
    body: [
      'After the user proves their password once at login, the server hands back a token. The browser stores it and includes it in a header on every subsequent request. The server checks the token, knows which user this is, and the password never has to cross the wire again.',
      'Tokens have expiration dates and can be revoked. Session tokens are easy to invalidate — just delete them from the server’s session store. JWTs are harder, since the "I am valid" lives inside the token itself; you typically maintain a deny-list or wait for expiration.',
    ],
    chapter: 2,
    category: 'identity-auth',
    related: ['session', 'jwt', 'authentication'],
  },
  {
    id: 'session',
    term: 'Session',
    short: 'A token where the server keeps a list of "this token belongs to this user."',
    body: [
      'On every request, the server takes the token from the request, looks it up in its session store (often Redis), and finds the user. To revoke a session, just delete the row.',
      'Trade-off vs. JWT: requires a lookup on every request, but invalidating a session is trivially easy.',
    ],
    chapter: 2,
    category: 'identity-auth',
    related: ['token', 'jwt'],
  },
  {
    id: 'jwt',
    term: 'JWT',
    short: 'A token that carries the user’s identity inside itself, signed by the server.',
    body: [
      'A JWT (JSON Web Token) contains the user ID plus a cryptographic signature the server made when issuing it. On a subsequent request, the server verifies the signature is its own — if it is, the embedded user ID is trustworthy. No database lookup needed.',
      'Trade-off vs. sessions: faster to verify (no lookup), but harder to invalidate before expiry — you typically have to maintain a deny-list or wait for the expiration.',
    ],
    chapter: 2,
    category: 'identity-auth',
    related: ['token', 'session'],
  },
  {
    id: 'auth0',
    term: 'Auth0',
    short: 'A hosted identity service that handles login, token issuance, and user management for you.',
    body: [
      'Most teams don’t build authentication from scratch. They use a service like Auth0, plug it into their app, and trust the service to get the cryptography and edge cases right.',
    ],
    chapter: 2,
    category: 'identity-auth',
    related: ['clerk', 'okta', 'token'],
  },
  {
    id: 'clerk',
    term: 'Clerk',
    short: 'A modern hosted identity service, popular with React/Next.js apps.',
    body: [
      'Newer than Auth0 and Okta; bundles login UI components, social logins, and session management.',
    ],
    chapter: 2,
    category: 'identity-auth',
    related: ['auth0', 'okta'],
  },
  {
    id: 'okta',
    term: 'Okta',
    short: 'An enterprise-focused identity provider.',
    body: [
      'Common in big companies that need single sign-on across many internal apps — log in once, get access to everything.',
    ],
    chapter: 2,
    category: 'identity-auth',
    related: ['auth0', 'clerk'],
  },

  /* ====================================================================
   * Chapter 3 — Validation & Authorization
   * ==================================================================== */
  {
    id: 'authentication',
    term: 'Authentication (authn)',
    short: 'Are you who you say you are? — the gate that checks the token.',
    body: [
      'Authentication answers the identity question. A valid token gets you in; missing, expired, or tampered tokens are rejected with 401.',
      'Note the naming: HTTP’s "401 Unauthorized" actually means unauthenticated. Authorization (the next gate) is a separate question.',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['authorization', 'token', '401'],
  },
  {
    id: 'authorization',
    term: 'Authorization (authz)',
    short: 'OK, you’re really you — but are you allowed to do this specific thing?',
    body: [
      'Authentication says you’re user 47. Authorization says whether user 47 is allowed to read this particular order, edit this particular profile, delete this particular comment. It runs on every endpoint, on every request.',
      'A common mistake: an endpoint that accepts `userId` from the request body and returns whatever was asked for. The fix is to derive the user ID from the verified token, not from anything the caller controls.',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['authentication', 'token', '403'],
  },
  {
    id: 'validation',
    term: 'Validation',
    short: 'Is this input even something the system can safely use?',
    body: [
      'After authn and authz pass, validation checks the data itself: required fields present, numbers in range, strings under max length, emails shaped like emails. Bad input → 400, nothing is written.',
      'Validation also defends against actively hostile inputs — SQL injection, XSS — by rejecting (or sanitizing) anything that looks like code where data was expected.',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['400', 'sql-injection', 'xss'],
  },
  {
    id: '401',
    term: '401 Unauthorized',
    short: 'The status code for "we don’t know who you are." Authentication failed.',
    body: [
      'Returned when the request has no token, an expired token, or a tampered token. The fix is usually for the user to log in again.',
      'Despite the name, 401 actually means "unauthenticated" — confusingly different from 403 (Forbidden), which is the real "unauthorized."',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['403', '400', 'authentication', 'status-code'],
  },
  {
    id: '403',
    term: '403 Forbidden',
    short: 'The status code for "we know who you are, but you can’t do this."',
    body: [
      'Authentication passed; authorization failed. The user is logged in but isn’t allowed to perform this specific action on this specific resource.',
      'Critical detail: a 403 must mean the data was never sent. Returning the data and then "hiding" it in the UI is the bug behind most "user A read user B’s data" headlines.',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['401', '400', 'authorization', 'status-code'],
  },
  {
    id: '400',
    term: '400 Bad Request',
    short: 'The status code for "the request itself is malformed."',
    body: [
      'Returned when validation fails: required field missing, value out of range, malformed JSON, etc. Nothing in the database changes.',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['401', '403', 'validation', 'status-code'],
  },
  {
    id: 'sql-injection',
    term: 'SQL injection',
    short: 'When user input ends up inside a database query as if it were code.',
    body: [
      'An attacker types fragments of database language into a form field — instead of a name they type something that means "delete the entire users table" — and tricks the system into running it.',
      'Modern frameworks defend against this by using parameterized queries, but only when developers use them correctly. Hand-built SQL with string concatenation is the classic vulnerability.',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['validation', 'xss'],
  },
  {
    id: 'xss',
    term: 'Cross-site scripting (XSS)',
    short: 'When user input is shown back to other users as code that runs in their browser.',
    body: [
      'An attacker hides little bits of code in their post or profile; when another user views it, the code runs in that user’s browser — stealing session tokens, redirecting them, defacing the page.',
      'Modern frameworks escape user content by default, but only when developers use them correctly. The danger zone is anywhere code says "render this raw" or "insert this HTML."',
    ],
    chapter: 3,
    category: 'identity-auth',
    related: ['validation', 'sql-injection'],
  },

  /* ====================================================================
   * Chapter 6 — Concurrency
   * ==================================================================== */
  {
    id: 'race-condition',
    term: 'Race condition',
    short: 'Two operations racing on the same data, where the outcome depends on which one wins.',
    body: [
      'Classic example: two buyers click "buy" on the last item at the same instant. Both reads see "1 in stock"; both writes set it to "0"; both customers get a confirmation. The store sold the same item twice.',
      'Race conditions almost always pass tests, never reproduce locally, and only show up in production when traffic is high enough that two requests really do land in the same instant.',
    ],
    chapter: 6,
    category: 'concurrency',
    related: ['transaction', 'lock', 'read-modify-write'],
  },
  {
    id: 'transaction',
    term: 'Transaction',
    short: 'A wrapper around a sequence of database operations that the database treats as a single unit.',
    body: [
      'A transaction is atomic (all or nothing — either every operation succeeds and commits, or any failure rolls everything back).',
      'A common misconception: just wrapping reads and writes in a transaction is *not* enough to prevent race conditions on its own. Under most databases’ default settings, two transactions can both read the same value before either has written. To prevent that, you also have to ask for a lock on the rows (`SELECT ... FOR UPDATE`), or raise the isolation level, or express the read-and-write as a single atomic statement.',
    ],
    chapter: 6,
    category: 'concurrency',
    related: ['atomic', 'lock', 'race-condition'],
  },
  {
    id: 'atomic',
    term: 'Atomic',
    short: 'All or nothing — either every operation in the transaction commits, or any failure rolls everything back.',
    body: [
      'There’s no halfway state where some changes stuck and others didn’t. If the second write in a 5-step transaction crashes, the first write is undone as if it never happened.',
    ],
    chapter: 6,
    category: 'concurrency',
    related: ['transaction'],
  },
  {
    id: 'lock',
    term: 'Lock',
    short: 'A hold on one or more rows that makes other transactions wait until you release it.',
    body: [
      'A lock is the actual mechanism that prevents two transactions from racing on the same row. The transaction asks the database for the lock (`SELECT ... FOR UPDATE` is the standard form), the database grants it, and any other transaction that wants the same row queues up until the first one commits or rolls back.',
      'Critically, locks are not automatic in most databases — you have to ask. A bare transaction without a lock request will not stop two simultaneous reads from seeing the same stale value.',
    ],
    chapter: 6,
    category: 'concurrency',
    related: ['transaction', 'atomic'],
  },
  {
    id: 'read-modify-write',
    term: 'Read-modify-write',
    short: 'The pattern: read a value, decide based on it, write a new value. The shape race conditions hide in.',
    body: [
      'Decrement inventory, increment a counter, update an account balance, check whether a username is taken, move an order from "pending" to "paid" — all read-modify-write.',
      'Any time you see this shape on shared data, ask whether two of those operations could happen at the same time on the same row. If yes, they need to be inside a transaction.',
    ],
    chapter: 6,
    category: 'concurrency',
    related: ['race-condition', 'transaction'],
  },

  /* ====================================================================
   * Chapter 5 — Architecture & Communication Patterns
   * ==================================================================== */
  {
    id: 'load-balancer',
    term: 'Load balancer',
    short: 'A piece of software in front of a fleet of servers that picks which one handles each request.',
    body: [
      'Every incoming request hits the load balancer first; it picks an available server and forwards the request there. Strategies range from round-robin to least-loaded to "send the same user to the same server."',
      'Load balancers also watch their servers. If one stops responding to health checks, the load balancer takes it out of rotation. This is also the piece that makes blue/green and canary deployments possible.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['nginx', 'haproxy', 'aws-elb', 'cloudflare-lb', 'blue-green-deployment'],
  },
  {
    id: 'nginx',
    term: 'Nginx',
    short: 'The most common general-purpose load balancer and reverse proxy. Open source.',
    body: [
      'Runs on a server you operate. Often used both as a load balancer in front of a fleet and as a static-file server in its own right.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['load-balancer', 'haproxy'],
  },
  {
    id: 'haproxy',
    term: 'HAProxy',
    short: 'Another popular open-source load balancer, known for very high throughput.',
    body: [
      'Often chosen when you need to push enormous amounts of traffic through one machine, or when you want sophisticated routing rules at the load-balancer layer.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['load-balancer', 'nginx'],
  },
  {
    id: 'aws-elb',
    term: 'AWS Elastic Load Balancer (ELB)',
    short: 'AWS’s managed load balancer — you don’t run any servers for it yourself.',
    body: [
      'You configure it through AWS, and AWS handles the underlying machines. The default choice for anything else running on AWS.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['load-balancer', 'aws'],
  },
  {
    id: 'cloudflare-lb',
    term: 'Cloudflare Load Balancing',
    short: 'Load balancing that runs on Cloudflare’s global network, close to users.',
    body: [
      'Often paired with Cloudflare’s CDN. Routes users to the nearest healthy origin server, and can fail over across regions automatically.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['load-balancer', 'cloudflare', 'cdn'],
  },
  {
    id: 'edge-server',
    term: 'Edge server',
    short: 'A cache server located geographically close to users, part of a CDN.',
    body: [
      'When a user in Tokyo asks for your logo, the request hits the closest edge server (in or near Tokyo) instead of crossing the planet to your origin in Virginia. Latency drops from hundreds of milliseconds to tens.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['cdn', 'cloudflare'],
  },
  {
    id: 'cdn',
    term: 'CDN (Content Delivery Network)',
    short: 'A fleet of cache servers around the world that serve your static files from the user’s nearest city.',
    body: [
      'Most of what a web page actually delivers — images, JavaScript, fonts, stylesheets — is identical for every user. CDNs hold local copies of those files in dozens of cities so users don’t pay the round-trip cost across the planet.',
      'The tradeoff is staleness: the CDN serves what it cached, not what’s live. Updating a file may take time to propagate, or you can manually purge the cache to force a refresh.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['cloudflare', 'fastly', 'akamai', 'cloudfront', 'edge-server'],
  },
  {
    id: 'cloudflare',
    term: 'Cloudflare',
    short: 'The default CDN for most modern sites. Generous free tier, massive global network.',
    body: [
      'Also offers DNS, DDoS protection, edge compute (Cloudflare Workers), load balancing, and more. Often the first piece of infrastructure a small team puts in front of their site.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['cdn', 'cloudflare-lb'],
  },
  {
    id: 'fastly',
    term: 'Fastly',
    short: 'A CDN heavy in media (Stripe, Shopify, NYT). Known for very fast cache purges.',
    body: [
      'When you need to invalidate cached content within seconds (a breaking news update, a stale product price), Fastly’s purge speed is its claim to fame.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['cdn'],
  },
  {
    id: 'akamai',
    term: 'Akamai',
    short: 'The enterprise CDN incumbent. Largest network; oldest in the space.',
    body: [
      'Powers a huge fraction of the world’s media and large-enterprise traffic. Less commonly chosen by startups but still ubiquitous in big-company stacks.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['cdn'],
  },
  {
    id: 'cloudfront',
    term: 'AWS CloudFront',
    short: 'AWS’s CDN. Integrates tightly with the rest of AWS.',
    body: [
      'Often the path of least resistance when your servers are already on AWS.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['cdn', 'aws'],
  },
  {
    id: 'polling',
    term: 'Polling',
    short: 'Repeatedly asking another system "is it done yet?" on a fixed interval.',
    body: [
      'Simple to build (it’s just regular requests), but most checks return "no" — wasted bandwidth and server time. You’ll never know any faster than your poll interval.',
      'Polling is the right answer when the other system doesn’t support webhooks, or when events are so frequent that the overhead of asking is cheaper than the overhead of receiving.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['webhook'],
  },
  {
    id: 'webhook',
    term: 'Webhook',
    short: 'A URL you give another system, which it calls when something happens — instead of you asking.',
    body: [
      'You hand the payment processor a URL ahead of time. The moment a charge confirms, it sends a request to your URL. No polling, instant notification.',
      'The cost: your server has to be reachable from the public internet, and you have to verify each incoming webhook is really from the sender (not someone spoofing) — usually via a signed header.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['polling'],
  },
  {
    id: 'github',
    term: 'GitHub',
    short: 'The dominant hosting service for git repositories, plus pull-request review and CI integrations.',
    body: [
      'Most modern open-source code lives on GitHub, as does much of the world’s commercial code. Owned by Microsoft.',
      'In the deployment world, GitHub also sends webhooks (e.g. "a commit was just pushed to this branch") that trigger CI runs and deploys.',
    ],
    chapter: 5,
    category: 'code-lifecycle',
    related: ['gitlab', 'pull-request', 'github-actions', 'webhook'],
  },
  {
    id: 'deploy',
    term: 'Deploy',
    short: 'The act of pushing your latest code to production.',
    body: [
      'A deploy can be as simple as overwriting files on a server, or as elaborate as a multi-stage canary rollout across hundreds of machines. Either way, it’s the moment new code becomes the running system.',
    ],
    chapter: 5,
    category: 'deployment-ops',
    related: ['blue-green-deployment', 'canary-release', 'rolling-deployment'],
  },
  {
    id: 'monolith',
    term: 'Monolith',
    short: 'One codebase, one program, one deployable unit — the whole back-end in a single bundle.',
    body: [
      'Simple to reason about — everything is in one place. Simple to deploy — one command pushes everything. The cost: every team shares it, so changes ripple, and the more code lives in one bundle, the slower the test suite and the riskier each deploy.',
      'GitHub, Shopify, and Basecamp run famously large monoliths and ship fine. The "monoliths don’t scale" claim is a myth — what doesn’t scale is many teams sharing one without discipline.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['microservices'],
  },
  {
    id: 'microservices',
    term: 'Microservices',
    short: 'The back-end split into many small programs, each owned by one team and deployed independently.',
    body: [
      'One team’s broken service doesn’t take down everyone else’s. One team can ship ten times a day without coordinating. The cost: complexity moves outward — services have to discover each other, the network between them can fail, and debugging crosses service boundaries.',
      'Most companies start as monoliths and split when scale forces it. Netflix, Amazon, and Uber are the famous microservices stories.',
    ],
    chapter: 5,
    category: 'architecture',
    related: ['monolith'],
  },

  /* ====================================================================
   * Chapter 8 — Code Lifecycle
   * ==================================================================== */
  {
    id: 'git',
    term: 'Git',
    short: 'The version-control system that tracks every change to the code, with full history.',
    body: [
      'Git lives in your project folder and treats the whole codebase as a sequence of snapshots over time. Every change is a commit; parallel work happens on branches; branches merge back together.',
      'Essentially every modern team uses git. Other systems exist (Mercurial, Perforce, SVN) but git is the default.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['commit', 'branch', 'merge', 'github', 'gitlab'],
  },
  {
    id: 'commit',
    term: 'Commit',
    short: 'A snapshot of the code at a moment in time, with a message explaining what changed.',
    body: [
      'Every commit has an author, a timestamp, and a unique ID. You can travel back to any commit. "I broke X yesterday afternoon" → find the commit that broke it, look at exactly what changed.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['git', 'branch'],
  },
  {
    id: 'branch',
    term: 'Branch',
    short: 'A parallel timeline of commits — a way to work without disturbing the main line.',
    body: [
      'The main timeline is usually called `main` (or sometimes `master`). When you want to work on a feature, you create a branch off of it, make commits there, and main stays untouched until you merge.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['git', 'commit', 'merge'],
  },
  {
    id: 'merge',
    term: 'Merge',
    short: 'Bringing changes from one branch back into another.',
    body: [
      'Sometimes git can do this automatically; sometimes it can’t. When two branches changed the same lines of the same file, git asks a human to resolve it — that’s a merge conflict.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['git', 'branch', 'merge-conflict'],
  },
  {
    id: 'merge-conflict',
    term: 'Merge conflict',
    short: 'When git can’t merge two branches automatically because they changed the same lines.',
    body: [
      'Git doesn’t know which version should win, so it asks a human. The person merging looks at both versions, picks (or combines) the right answer, and saves the resolution. Common, not scary, just tedious.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['merge', 'branch'],
  },
  {
    id: 'gitlab',
    term: 'GitLab',
    short: 'A GitHub competitor — git hosting plus pull-request review and built-in CI/CD.',
    body: [
      'Where GitHub uses the term "pull request," GitLab uses "merge request" (MR) — same concept, different name.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['github', 'pull-request', 'gitlab-ci'],
  },
  {
    id: 'pull-request',
    term: 'Pull request (PR)',
    short: 'A proposal to merge your branch into main, where the team reviews the diff first.',
    body: [
      'The PR shows the exact lines added, removed, and changed, alongside discussion threads where reviewers can comment on specific lines. Most teams require at least one approval before merging.',
      'Opening a PR also triggers CI to run the test suite against your branch. Reading the PR diff is the last chance to catch mistakes before they ship — never skip it.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['diff', 'ci', 'github', 'gitlab'],
  },
  {
    id: 'diff',
    term: 'Diff',
    short: 'The exact lines added, removed, and changed in a commit or pull request.',
    body: [
      'Diffs are how engineers read changes. Removed lines are usually red; added lines are usually green; unchanged context is plain. Reading a diff is a learnable skill — and the foundation of effective code review.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['pull-request', 'commit'],
  },
  {
    id: 'tests',
    term: 'Tests',
    short: 'Little programs that exercise the real code and check that it does what it’s supposed to.',
    body: [
      'Unit tests check one function in isolation. Integration tests stand up parts of the system together. End-to-end tests drive a fake browser through the full app.',
      'Tests catch regressions: when you change one thing, the test suite tells you whether you accidentally broke something else.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['ci', 'green-build', 'red-build'],
  },
  {
    id: 'ci',
    term: 'CI (Continuous Integration)',
    short: 'Automation that runs the test suite (and other checks) on every pull request.',
    body: [
      'When a PR opens, CI runs every test, lints the code style, type-checks, sometimes runs security scans. Pass → green build, ready to merge. Fail → red build, blocked.',
      'The team’s rule is usually simple: red PRs do not get merged.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['tests', 'green-build', 'red-build', 'github-actions', 'circleci', 'gitlab-ci', 'buildkite'],
  },
  {
    id: 'green-build',
    term: 'Green build',
    short: 'A CI run where every check passed — the PR is ready for review and merge.',
    body: [
      'Most CI dashboards literally use a green icon. When engineers say "the build is green," they mean CI is passing.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['ci', 'red-build'],
  },
  {
    id: 'red-build',
    term: 'Red build',
    short: 'A CI run with at least one failing check — the PR is blocked from merging.',
    body: [
      'Common causes: a test failed, a lint rule was violated, a type error was introduced, a security scan flagged something. The fix is to read the CI output, address the failure, and push another commit.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['ci', 'green-build'],
  },
  {
    id: 'github-actions',
    term: 'GitHub Actions',
    short: 'CI built into GitHub — runs workflows defined in `.github/workflows/*.yml`.',
    body: [
      'The default CI choice for most projects on GitHub. Workflows can run on every push, every PR, on a schedule, or in response to many other events.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['ci', 'github'],
  },
  {
    id: 'circleci',
    term: 'CircleCI',
    short: 'A widely-used standalone CI service.',
    body: [
      'Common in larger orgs and in pipelines that predate GitHub Actions, but still actively chosen for new projects in some shops.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['ci'],
  },
  {
    id: 'gitlab-ci',
    term: 'GitLab CI',
    short: 'CI built into GitLab — workflows defined in `.gitlab-ci.yml`.',
    body: [
      'The default CI choice when your code is hosted on GitLab.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['ci', 'gitlab'],
  },
  {
    id: 'buildkite',
    term: 'Buildkite',
    short: 'A CI service where you provide the runners (machines) and they orchestrate.',
    body: [
      'Common in larger orgs that want CI control without operating the whole pipeline themselves.',
    ],
    chapter: 8,
    category: 'code-lifecycle',
    related: ['ci'],
  },

  /* ====================================================================
   * Chapter 9 — Deployment & Operations
   * ==================================================================== */
  {
    id: 'container',
    term: 'Container',
    short: 'Code packaged together with its language runtime, libraries, config, and OS pieces — a sealed bundle that runs identically anywhere.',
    body: [
      'Containers solve "it works on my machine." The developer runs the same container locally that production runs in the cloud. If it works on the laptop, it works in production, because they’re running the literal same package.',
      'Containers are also an isolation mechanism: one app can’t mess with another sharing the same machine, because each lives in its own sealed bundle.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['docker', 'vercel', 'aws'],
  },
  {
    id: 'docker',
    term: 'Docker',
    short: 'The dominant tool for building and running containers.',
    body: [
      'When an engineer says "we run on Docker," they mean the back-end is packaged as Docker containers. Most modern hosting platforms accept Docker containers as the unit they deploy.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['container'],
  },
  {
    id: 'vercel',
    term: 'Vercel',
    short: 'A hosting platform geared toward modern JavaScript apps — Next.js especially.',
    body: [
      'Push code to GitHub, Vercel builds and deploys it automatically. Handles the load balancer, the CDN, preview deploys per pull request, and rolling out new versions — you never touch the underlying servers or containers.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['netlify', 'aws'],
  },
  {
    id: 'netlify',
    term: 'Netlify',
    short: 'A hosting platform similar in shape to Vercel — build, deploy, CDN, previews.',
    body: [
      'The original "git push to deploy" platform. Popular for marketing sites and front-end-heavy web apps.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['vercel'],
  },
  {
    id: 'aws',
    term: 'AWS (Amazon Web Services)',
    short: 'Amazon’s cloud platform — the dominant infrastructure provider.',
    body: [
      'A vast catalog of services: EC2 (virtual servers), S3 (file storage), RDS (managed databases), Lambda (serverless functions), and hundreds more. Most large web products run on AWS or one of its competitors.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['gcp', 'aws-elb', 'cloudfront'],
  },
  {
    id: 'gcp',
    term: 'GCP (Google Cloud Platform)',
    short: 'Google’s cloud platform — the main alternative to AWS.',
    body: [
      'Strong in data analytics and machine learning. Also runs much of the consumer Google footprint.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['aws'],
  },
  {
    id: 'dev-environment',
    term: 'dev (development environment)',
    short: 'The developer’s own laptop, or a personal cloud sandbox. Fake data, frequent breakage is fine.',
    body: [
      'No real users are on it. This is where the engineer writes the code and tries it out before sending it any further.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['staging-environment', 'production-environment'],
  },
  {
    id: 'staging-environment',
    term: 'staging',
    short: 'A copy of the production setup, but pointed at fake or anonymized data.',
    body: [
      'Same servers, same configuration, same shape — except no real users. New code goes here first, so the team can poke at it, run end-to-end tests, and catch problems that only show up "in something that looks like prod."',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['dev-environment', 'production-environment'],
  },
  {
    id: 'production-environment',
    term: 'production (prod)',
    short: 'The real thing — real users, real data, real consequences.',
    body: [
      'Code only reaches production after passing through dev and staging, with reviewers signing off along the way. The closer to real users, the higher the bar.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['dev-environment', 'staging-environment'],
  },
  {
    id: 'blue-green-deployment',
    term: 'Blue/green deployment',
    short: 'Run two complete production environments side by side; flip a switch to send traffic to the new one.',
    body: [
      '"Blue" is currently serving users. Deploy new code to "green," let it warm up, run final checks. Flip the load balancer so all new traffic goes to green. If green turns out to be broken, flip back to blue — instant rollback.',
      'Costs twice the hardware while both are up; pays for itself when a deploy goes wrong.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['canary-release', 'rolling-deployment', 'deploy', 'load-balancer'],
  },
  {
    id: 'canary-release',
    term: 'Canary release',
    short: 'Deploy new code to a small slice of servers (or users) first; watch error rates; expand if healthy.',
    body: [
      'Start at 1%, then 5%, then 25%, then 100%. If something’s wrong, only the small slice was affected. Named after canaries in coal mines: the small slice is the early warning.',
      'The canonical pattern when a bad deploy could affect millions of users.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['blue-green-deployment', 'rolling-deployment', 'deploy'],
  },
  {
    id: 'rolling-deployment',
    term: 'Rolling deployment',
    short: 'Update servers one at a time, leaving the others to serve traffic during the swap.',
    body: [
      'While server 1 is being replaced, servers 2–10 are still serving. When server 1 comes back healthy, server 2 is taken offline for its turn, and so on. Slower than blue/green, simpler to operate, no extra hardware.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['blue-green-deployment', 'canary-release', 'deploy'],
  },
  {
    id: 'logs',
    term: 'Logs',
    short: 'A timestamped record of what the program did, line by line.',
    body: [
      'Every time the code runs an interesting line ("user logged in", "payment failed", "request took 4 seconds"), it writes a line to the log. When something breaks at 3 a.m., logs are how you reconstruct what happened.',
      'Logs answer "what did the program do, in order?" — a different question from metrics ("is the system healthy right now?") and errors ("what specifically crashed?").',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['sentry', 'datadog'],
  },
  {
    id: 'metrics',
    term: 'Metrics',
    short: 'Numbers tracked over time — requests per second, response times, error rates, memory used.',
    body: [
      'You watch dashboards of metrics, and set alerts so you’re paged when something crosses a threshold (e.g. error rate above 1%).',
      'Metrics answer "is the system healthy right now, and how is it trending?" — a different question from logs ("what did the program do?") and errors ("what specifically crashed?").',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['logs', 'errors', 'datadog'],
  },
  {
    id: 'errors',
    term: 'Errors (error tracking)',
    short: 'Tools that capture each crash, group similar ones together, and show which are happening most often.',
    body: [
      'When the code crashes, an error tracker captures it with a record of exactly where the crash happened. You see which errors are new, which ones are spiking, and which users they affected.',
      'Errors answer "what specifically is broken, and how often?" Sentry is the most common standalone tool; Datadog and similar platforms also include error tracking.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['logs', 'metrics', 'sentry'],
  },
  {
    id: 'sentry',
    term: 'Sentry',
    short: 'An error-tracking tool — captures crashes, groups similar ones, shows you the line of code where each one originated.',
    body: [
      'When the code crashes, Sentry captures it with a record of exactly where the crash happened and the conditions that led to it. You see which errors are happening most often, which ones are new, and which users they affected.',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['logs', 'datadog'],
  },
  {
    id: 'datadog',
    term: 'Datadog',
    short: 'A platform for metrics, dashboards, and log aggregation. New Relic and Honeycomb are similar.',
    body: [
      'Watch dashboards of requests-per-second, response times, error rates, memory usage. Set alerts so you’re paged when something crosses a threshold (e.g. error rate above 1%).',
    ],
    chapter: 9,
    category: 'deployment-ops',
    related: ['logs', 'sentry'],
  },

  /* ====================================================================
   * Chapter 10 — Working with Claude Code
   * ==================================================================== */
  {
    id: 'claude-code',
    term: 'Claude Code',
    short: 'Anthropic’s AI coding agent — runs in the terminal, reads and edits code in a real repository.',
    body: [
      'You point Claude Code at a codebase and ask it to do things — "explain this," "add this feature," "fix this bug." It reads files, runs commands, and proposes changes; you approve or push back before anything ships.',
    ],
    chapter: 10,
    category: 'agents',
    related: ['cursor', 'codex', 'copilot', 'aider', 'feature-template'],
  },
  {
    id: 'cursor',
    term: 'Cursor',
    short: 'An AI-native code editor — a customized version of VS Code (a popular code editor) with deep model integration.',
    body: [
      'Lets you chat with the codebase, accept multi-file edits inline, and use AI-driven autocomplete as you type.',
    ],
    chapter: 10,
    category: 'agents',
    related: ['claude-code', 'copilot'],
  },
  {
    id: 'codex',
    term: 'Codex',
    short: 'OpenAI’s coding agent — comparable in shape to Claude Code.',
    body: [
      'Reads, edits, and runs code in real repos; was relaunched as a CLI/agent product distinct from the older Codex API.',
    ],
    chapter: 10,
    category: 'agents',
    related: ['claude-code'],
  },
  {
    id: 'copilot',
    term: 'GitHub Copilot',
    short: 'GitHub’s AI assistant — started as inline autocomplete; now also offers chat and agent modes.',
    body: [
      'The first widely-used AI coding tool. Integrated tightly into VS Code, into GitHub’s pull-request review surface, and into the GitHub website.',
    ],
    chapter: 10,
    category: 'agents',
    related: ['cursor', 'claude-code'],
  },
  {
    id: 'aider',
    term: 'Aider',
    short: 'An open-source AI pair-programmer — runs in the terminal, edits files, makes git commits.',
    body: [
      'Provider-agnostic — works with Claude, OpenAI, and others. Popular among engineers who want full control of which model and how the agent behaves.',
    ],
    chapter: 10,
    category: 'agents',
    related: ['claude-code'],
  },
  {
    id: 'feature-template',
    term: 'Feature template',
    short: 'A fixed list of nine questions you ask the agent before letting it write any code for a new feature.',
    body: [
      'State, API contract, identity, authorization & validation, concurrency, performance, failure modes, front-end vs. back-end, diagram. Each one maps to a chapter in this primer.',
      'Running the template forces hand-waves to the surface in plain English — far easier to push back on than 800 lines of code that already look reasonable.',
    ],
    chapter: 10,
    category: 'agents',
    related: ['claude-code'],
  },
]

/** Quick lookup by ID. */
const glossaryIndex = new Map(glossary.map(e => [e.id, e]))
export const getGlossaryEntry = (id: string): GlossaryEntry | undefined => glossaryIndex.get(id)

export const glossaryCategories: { id: GlossaryCategory; label: string }[] = [
  { id: 'web-basics',      label: 'Web basics' },
  { id: 'state-data',      label: 'State & data' },
  { id: 'identity-auth',   label: 'Identity & auth' },
  { id: 'concurrency',     label: 'Concurrency' },
  { id: 'architecture',    label: 'Architecture' },
  { id: 'code-lifecycle',  label: 'Code lifecycle' },
  { id: 'deployment-ops',  label: 'Deployment & ops' },
  { id: 'agents',          label: 'AI coding agents' },
]
