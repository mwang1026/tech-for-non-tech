# Curriculum

The ten chapters with full 101 / 201 / 301 breakdowns and named technologies. Each chapter opens with the standard four-part frame (job / why / when wrong / when right), introduces concepts at the chosen level, names relevant technologies, and ends with a recap + two Claude Code prompts.

## Chapter list

1. The Request-Response Cycle
2. State
3. Identity
4. Validation & Authorization
5. Concurrency
6. Architecture & Communication Patterns
7. Code Lifecycle
8. Deployment & Operations
9. Putting It Together — Request Flows End-to-End
10. Working with Claude Code

---

## Chapter 1 — The Request-Response Cycle

**Job:** Move a user's intent from their browser to the right data and back, reliably.
**Why:** Everything else is a variation on this shape. Without it, every other concept floats free.
**When wrong:** Page never loads, request hangs, user sees an error with no signal where in the chain it broke.
**When right:** The user clicks; data they're allowed to see comes back; they don't think about it.

### 101
- Browser → Server → Database → back. The basic loop.
- HTTP at one-line depth: the language the browser speaks.
- Status codes you'll see (200 / 404 / 500) at the "they signal things" level.
- Why front-end and back-end exist (one-line each: security + scale).

### 201 (additions)
- HTTP methods: GET reads, POST creates, PUT updates, DELETE deletes (and why this matters for caching & idempotency).
- Status code families (2xx / 3xx / 4xx / 5xx) with the specific ones you'll actually see (200, 201, 301, 400, 401, 403, 404, 429, 500, 502, 503).
- Headers: Content-Type, Authorization, Cookie, User-Agent.
- Where data rides: URL path, query string, body, headers — and which is appropriate when.
- HTTPS vs. HTTP — encryption in transit.
- Browser DevTools Network tab as the "see it live" tool.

**Tech named at 201:** Cloudflare DNS (1.1.1.1), Google Public DNS (8.8.8.8), AWS Route 53; fetch / axios / requests; Let's Encrypt.

### 301 (additions)
- HTTP/1.1 vs HTTP/2 vs HTTP/3 — multiplexing, head-of-line blocking.
- Connection lifecycle, keep-alive.
- TLS handshake at conceptual depth.
- Cache headers (Cache-Control, ETag) and their downstream effects.
- CDN-edge interaction with this layer.

### Claude Code prompts
- "Walk me through what happens when a user logs into this app, step by step."
- "Where in this codebase is the boundary between front-end and back-end?"

---

## Chapter 2 — State

**Job:** Keep track of what's true about the system right now, in the right place for the right cost.
**Why:** Every architectural argument is downstream of "where does this data live and how fresh does it need to be." This is the single biggest tradeoff lever in software.
**When wrong:** Lost work after a crash; users see a cached number that's hours old when it needs to be live; the database melts under read load.
**When right:** Hot data is fast, durable data survives restarts, and the gap between them is a deliberate choice.

### 101
- Three places: memory (fast, lost on restart) / database (slow, permanent) / cache (fast copy that may be stale).
- The three questions: how fast, how durable, how fresh.
- Source of truth concept.

### 201 (additions)
- SQL vs. NoSQL — the structural difference.
- Tables, rows, columns, primary keys, foreign keys.
- Why indexes matter (this is the #1 thing agents quietly get wrong).
- **Strong vs. eventual consistency** — load-bearing concept.
- Browser-side state: cookies, localStorage, sessionStorage.
- Object storage as a third category (files don't go in databases).
- State transition rules (e.g. order lifecycle: pending → processing → shipped).

**Tech named at 201:** PostgreSQL, MySQL, SQLite, SQL Server, Oracle; MongoDB, Firestore, DynamoDB; Redis, Memcached, Cloudflare KV; Elasticsearch, Algolia, Meilisearch; AWS S3, Google Cloud Storage, Cloudflare R2; AWS RDS, Supabase, PlanetScale, Neon.

### 301 (additions)
- ACID properties in detail.
- Database isolation levels (READ COMMITTED → SERIALIZABLE).
- Read replicas + replication lag.
- Sharding / partitioning.
- CAP theorem.
- Cache invalidation strategies (TTL, write-through, write-behind).
- Materialized views, denormalization tradeoffs.

### Claude Code prompts
- "What's stored in the database in this codebase vs. what's only in memory?"
- "Is anything cached here? If so, what's the staleness tradeoff being made?"

---

## Chapter 3 — Identity

**Job:** Attach a verifiable identity to every request, so the system can serve the right slice of state to the right person.
**Why:** The instant you have more than one user, identity is what separates them. It's the foundation of multi-tenancy, security, personalization.
**When wrong:** User A sees User B's data. The single most common catastrophic bug class.
**When right:** Ten thousand users hit the same server simultaneously and each one only sees their own slice, automatically.

### 101
- Every request says who's asking.
- After login, the server hands you a token; you send it with every request.
- Without identity, the server can't safely show you your own data.

### 201 (additions)
- Session tokens vs. cookies vs. JWTs.
- API keys for machine-to-machine.
- Identity is re-validated at every internal boundary (defense in depth).

**Tech named at 201:** Auth0, Okta, Clerk, Supabase Auth, Firebase Auth, AWS Cognito, Stytch, WorkOS; OAuth 2.0, OIDC, SAML, JWT; bcrypt, argon2, scrypt; Microsoft Entra ID, Google Workspace SSO; Google Authenticator, 1Password.

### 301 (additions)
- OAuth 2.0 flow at depth (authorization code grant).
- OIDC vs. SAML vs. OAuth — distinctions and when each is right.
- Refresh tokens and rotation.
- 2FA / MFA / WebAuthn.
- Password hashing generations.
- Session storage strategies (server-side sessions vs. stateless JWTs).
- Token revocation as the hard JWT problem.

### Worked example introduced — **Notes box (Tier 1)**
First worked example. User can write and save notes on their dashboard. Isolation by `user_id`. Demonstrates: identity → state lookup → return only this user's slice.

### Claude Code prompts
- "How does this system know which user is making a request?"
- "Where is the auth token validated, and is it validated again at any internal boundary?"

---

## Chapter 4 — Validation & Authorization

**Job:** Before any meaningful action, prove three things: the request is from a real user (auth), that user is allowed to do this specific thing (authz), and the data they sent is well-formed (validation).
**Why:** Identity tells you *who*. This chapter is about *whether they can*. Every security model in every system is some version of this gate.
**When wrong:** Privilege escalation, IDOR (changing a URL parameter to read someone else's data), garbage data corrupting the database, regulatory exposure.
**When right:** Hostile requests bounce off with a clear rejection; legitimate ones flow through.

### 101
- Three gates: are you logged in? are you allowed? is the data valid?
- Front-end checks are UX; back-end checks are security.
- Hiding a button isn't security.

### 201 (additions)
- Authentication vs. authorization (precise definitions).
- RBAC at high level.
- Common attacks the gate prevents: SQL injection, XSS at one line each.
- API auth credentials: API keys, OAuth scopes, rate limits.

**Tech named at 201:** Zod, Yup, Joi (JS), Pydantic (Python), Bean Validation (Java); Cloudflare WAF, AWS WAF; Open Policy Agent (OPA), Cerbos, Casbin, Oso.

### 301 (additions)
- ABAC vs. RBAC tradeoffs.
- IDOR / privilege escalation patterns.
- CORS in detail.
- Idempotency keys.
- Rate limiting algorithms (token bucket, leaky bucket, sliding window).
- CSRF and same-site cookies.
- Defense in depth as a real practice.

### Worked example extended — **Sharing notes (Tier 2)**
Authorization question. Can I see this note? Am I the owner, or was it shared? Demonstrates the cascading authz pattern.

### Worked example extended — **Comments on notes (Tier 3)**
Cascading permissions. Can I comment? Only if I can see the note.

### Claude Code prompts
- "Find three places in this codebase where the back-end checks whether a user is allowed to do something."
- "If I removed the front-end check on this form, would the back-end still reject bad input?"

---

## Chapter 5 — Concurrency

**Job:** Let many requests run at the same time without corrupting shared data.
**Why:** A real system never serves one user at a time. The moment two requests touch the same row, you have a correctness problem that's invisible at low load and catastrophic at scale.
**When wrong:** Double-charged credit cards. Selling the last item twice. Counters that drift.
**When right:** Thousands of overlapping requests produce results indistinguishable from a single-threaded execution.

> Note: this chapter explicitly distinguishes itself from Ch 3's identity-as-isolation. Identity isolates *users* from each other (logical/security). Concurrency isolation prevents *simultaneous requests* from corrupting shared state (runtime/correctness). Different problems, sometimes confused.

### 101
- When two requests want the same thing at the same time, things break.
- Race condition example: last item in inventory, two buyers.
- Database transactions as the fix.

### 201 (additions)
- Optimistic vs. pessimistic locking.
- **Idempotency** — making operations safe to retry.
- When to push work to a queue instead of doing it inline.
- Background jobs vs. synchronous request handling.

**Tech named at 201:** PostgreSQL transactions, Redis distributed locks; Kafka, RabbitMQ, AWS SQS, GCP Pub/Sub, Redis Streams, NATS; Sidekiq (Ruby), Celery (Python), BullMQ (Node), Resque, Hangfire (.NET); ZooKeeper, etcd, Consul.

### 301 (additions)
- Database isolation levels (deeper than Ch 2 mentions).
- Distributed locks and their failure modes.
- CAP theorem in practice.
- Saga pattern for distributed transactions.
- Exactly-once vs. at-least-once delivery.
- Two-generals problem at one paragraph.

### Claude Code prompts
- "I want to add [feature that decrements a counter]. Are there race conditions to worry about? Does this need a transaction?"
- "Does this codebase use any database transactions? Show me where and why."

---

## Chapter 6 — Architecture & Communication Patterns

**Job:** Decide how the pieces of a system are split up and how they talk to each other.
**Why:** These decisions shape what the team can build for the next three years. Wrong split = constant friction. Right split = invisible.
**When wrong:** Monoliths nobody can deploy without breaking something else; microservices that can't function when the network blips; polling so aggressive it DDoSes your own database.
**When right:** Each service owns its data, fails independently, scales independently, and communicates with the right pattern for the use case.

### 101
- Monolith vs. microservices (one box vs. many) as a tradeoff.
- Polling vs. webhooks.
- Load balancers spread requests across servers.
- CDN caches static stuff close to users.

### 201 (additions)
- API styles: REST, GraphQL, gRPC, tRPC.
- Real-time ladder: polling → long-polling → SSE → WebSockets.
- Reverse proxy vs. forward proxy.
- API gateway as a pattern (auth + rate-limit + routing in one).
- Two product shapes: user-facing app (front-end + back-end API) vs. API product (gateway + services, no UI).
- Stateless servers and horizontal scaling.

**Tech named at 201:** Nginx, HAProxy, Caddy, Apache HTTPD, Traefik, Envoy; AWS ELB / ALB / NLB, GCP Load Balancing, Cloudflare Load Balancing; Kong, AWS API Gateway, Apigee, Tyk, Zuplo; Cloudflare, Akamai, Fastly, AWS CloudFront, Bunny.net; Express, Fastify, NestJS, FastAPI, Django, Flask, Rails, Spring Boot, ASP.NET, Gin; Apollo, Relay, Hasura; Pusher, Ably, Socket.IO, PartyKit, Liveblocks; Svix.

### 301 (additions)
- Service mesh.
- Event-driven architecture in depth.
- BFF (Backend For Frontend) pattern.
- Multi-region routing.
- Sticky sessions vs. stateless tradeoffs.
- Circuit breakers, bulkheads, backpressure.

### Worked example extended — **Real-time updates (Tier 4)**
Push vs. pull. WebSocket transport. Demonstrates: same data, different transport.

### Claude Code prompts
- "Is this codebase a monolith or split into services? What's the communication pattern between them?"
- "Are we polling anything we could be receiving as a webhook?"

---

## Chapter 7 — Code Lifecycle

**Job:** Manage code changes safely as a team — propose, review, verify, and roll back without losing history or stepping on each other.
**Why:** Every change to a running system starts as a change to a file. Without version control, two developers overwrite each other and history is lost. Without review and tests, bad code reaches production unfiltered.
**When wrong:** Lost work, untraceable bugs ("when did this break?"), two engineers' changes silently conflicting, broken main branch blocking the whole team.
**When right:** Twenty engineers change the same codebase daily. Every change is reviewed, tested, traceable, and reversible.

### 101
- Git tracks every change with a history.
- Commit / branch / PR / merge / merge conflict — definitions.
- Tests verify behavior; CI runs them before merge; green = good, red = blocked.

### 201 (additions)
- The build step (source → bundled output).
- Unit / integration / E2E tests — what each catches.
- Test coverage (and why 100% isn't the goal).
- Linters, formatters, type checkers.
- Rebase vs. merge.
- Lockfiles and dependency management.

**Tech named at 201:** GitHub, GitLab, Bitbucket, Gitea; GitHub Actions, GitLab CI, CircleCI, Buildkite, Jenkins, Travis CI; Vite, webpack, esbuild, Rollup, Turbopack, Parcel; Jest, Vitest, Mocha (JS), pytest (Python), JUnit (Java), RSpec (Ruby), go test (Go); Playwright, Cypress, Selenium, Puppeteer; ESLint, Prettier, Biome, Ruff, Black; TypeScript, mypy, pyright, Flow; npm, pnpm, yarn, pip, poetry, uv, cargo, go mod; Graphite, Reviewable.

### 301 (additions)
- Trunk-based vs. GitFlow strategies.
- Conventional commits, semver.
- Static analysis / SAST.
- Test patterns: mocks, stubs, fixtures, snapshot tests.
- Monorepo vs. polyrepo.
- Code review norms in practice.

### Claude Code prompts
- "Walk me through what happens between a developer opening a PR and that code being live for users."
- "What tests does this codebase have, where are they, and how do I run them locally?"

---

## Chapter 8 — Deployment & Operations

**Job:** Ship new code to a system serving live users without breaking it for them, and know what's happening once it's there.
**Why:** Software is never finished. The cost of deployment is the rate at which the team can improve the product. Slow deployments = slow company.
**When wrong:** Outages during releases. Bad code reaching production unfiltered. A schema change that takes the site down for an hour. A bug in production with no log to find it.
**When right:** The team deploys ten times a day and users never notice.

### 101
- Containers package code so it runs the same everywhere.
- Three environments: dev / staging / prod.
- Deployment strategies: blue/green, canary, rolling.
- Logs are how you find out what happened.

### 201 (additions)
- Schema migrations and the backward-compatibility problem.
- Health checks and auto-scaling.
- Feature flags — decoupling deploy from release.
- Secrets management.
- **Logs vs. metrics vs. traces** (the three pillars of observability).
- Error tracking as a separate concern from logs.

**Tech named at 201:** Docker, Podman; Kubernetes (K8s), Docker Compose, AWS ECS, Nomad; Docker Hub, AWS ECR, GitHub Container Registry; AWS, GCP, Azure, Oracle Cloud, DigitalOcean, Linode; Vercel, Netlify, Heroku, Railway, Render, Fly.io; AWS Lambda, Cloudflare Workers, Vercel Functions, GCP Cloud Functions, Azure Functions; Datadog, New Relic, Grafana + Prometheus, Honeycomb, Splunk, Loki; Sentry, Bugsnag, Rollbar; OpenTelemetry, Jaeger; LaunchDarkly, Statsig, GrowthBook, PostHog; HashiCorp Vault, AWS Secrets Manager, Doppler.

### 301 (additions)
- Infrastructure as Code: Terraform, Pulumi, CloudFormation, Ansible.
- Multi-region: active-active vs. active-passive.
- Disaster recovery: RPO and RTO.
- Serverless vs. containers vs. VMs — when each is right.
- Edge compute.
- SLOs, error budgets, chaos engineering.
- Blue/green for stateful services (the genuinely hard case).

### The reframe
- Containers = Ch 5's isolation, applied to environments.
- CI/CD gates = Ch 4's validation, applied to code changes.
- Blue/green = Ch 6's load balancing, applied to versions.
Same concepts, different layer.

### Claude Code prompts
- "How does code get deployed in this repo? Show me the CI config."
- "If I add a column to this table, what's the safe deployment order so old code doesn't crash?"

---

## Chapter 9 — Putting It Together — Request Flows End-to-End

**Job:** Synthesize everything from Ch 1-8 by tracing real request scenarios through the fully-built system, showing where each gate, store, and service participates.
**Why:** The persistent diagram has been accreting for eight chapters. It's never been exercised end-to-end. This chapter turns the diagram into a **playground** — pick a scenario, watch the request animate its path, see what happens at each layer.
**When wrong:** Without this synthesis, the learner has nine separate concepts and no mental model for how they cooperate during one actual user action.
**When right:** The learner can predict, for any feature in any codebase, the path a request will take and where it might be rejected, slow, or wrong.

### Format

The diagram does not add new elements. It is fully accreted from Ch 1-8. Each slide picks one scenario; the diagram lights up the request's path step by step, with rejection arrows at the gate where a failure occurs.

### Scenario list (one slide per scenario)

| # | Scenario | What it exercises |
|---|---|---|
| 1 | Happy path — authenticated user reads their own data | Ch 1, 3, 4 (all gates green) |
| 2 | Auth failure — no token / expired token | Ch 3, caught at gateway → 401 |
| 3 | Authz failure — user requests another user's data | Ch 3, 4, caught at back-end → 403 |
| 4 | Validation failure — malformed payload | Ch 4, caught at validation layer → 400 |
| 5 | Cache hit — served from Redis, never hits Postgres | Ch 2 |
| 6 | Cache miss — falls through to DB, populates cache | Ch 2 |
| 7 | Race condition averted — two concurrent writes; transaction serializes them | Ch 5 |
| 8 | Webhook in — Stripe POSTs to our webhook URL; signature-validated; triggers background job | Ch 4, 5, 6 |
| 9 | Background job + WebSocket push — queued work completes; pushes update via WebSocket | Ch 5, 6 |
| 10 | Cascading failure — third-party 500s; retry with backoff; circuit breaker opens; degraded response | Ch 6, 8 |

### Diagram interactions specific to Ch 9

- Each scenario has a "Play" button that animates the path step-by-step on the diagram.
- Rejected scenarios show the request highlighted up to the rejecting gate, then a red rejection arrow back.
- Successful scenarios trace the full round-trip with timings annotated (e.g. "12ms cache" vs. "180ms DB").
- Supplemental sequence diagrams (vertical lifelines + arrows) appear in the slide content, mirroring what an agent would output.

### Claude Code prompts
- "For [feature in your codebase], walk me through the full request path from browser to database and back. Tell me every gate it passes and what would cause each gate to reject."
- "Where in this codebase would a cascading failure most likely happen? What's the current circuit breaker / retry behavior?"

### Levels at Ch 9
- **101:** scenarios 1, 2, 3, 4 (the core success / failure paths)
- **201:** adds 5, 6, 8 (cache + webhook)
- **301:** adds 7, 9, 10 (concurrency + async + cascading failure)

---

## Chapter 10 — Working with Claude Code

**Job:** Use everything from chapters 1-9 to direct an agent in a real codebase.
**Why:** All the literacy you just built is wasted if you don't have a workflow that exercises it.
**When wrong:** Agent generates plausible code; you can't tell if it's right; you ship a race condition or a permission bug.
**When right:** You ask the right question, the agent surfaces the tradeoff, you make the call, the agent implements it cleanly.

### 101
- Get oriented (what does this codebase do?).
- Ask "why" about anything unfamiliar.
- Use the feature template before letting the agent write code.
- Always read the diff before merging.

### 201 (additions)
- The expanded nine-question feature template.
- Prompts for tracing identity, state, and validation in *this* codebase.
- Skipping the diff is how race conditions ship.

**Tech named at 201:** Claude Code, Cursor, Codex, GitHub Copilot, Aider, Cline, Continue; VS Code, JetBrains, Neovim.

### 301 (additions)
- MCP (Model Context Protocol) and skills for repeatable workflows.
- Multi-agent orchestration patterns.
- When to roll your own agent vs. use Claude Code.
- The smell-test catalog (every chapter's worth, gathered).

### Four phases of working in a codebase
1. **Get the map** — orientation prompts.
2. **Learn on demand** — ask about anything unfamiliar in context.
3. **Understand the design** — identity, state, security as practiced here.
4. **Build a feature** — the nine-question template every time.

### Claude Code prompts
- "Use the nine-question feature template to plan [feature] in this codebase. Don't write code yet."
- "I'm about to merge this PR. Before I do, walk me through what could go wrong: race conditions, missing validation, performance regressions, deployment risks."

---

## Per-chapter recap pattern

Every chapter (Ch 1-8) ends with a recap slide before its Claude Code prompts. Three parts:

1. **What you've learned** — 3-4 tight bullets summarizing the chapter's load-bearing ideas.
2. **Where it lives in the system** — a callout on the persistent architecture diagram showing the chapter's concept lit up in context.
3. **The bridge to next chapter** — one sentence connecting forward.

This compounds across chapters. By Ch 8 the recap shows 8 lit regions on one diagram. Ch 9 then animates request paths through those same regions.
