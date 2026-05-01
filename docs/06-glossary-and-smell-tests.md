# Glossary & smell tests

Two reference appendices that live alongside the chapters. Both are tagged by level so the 101 view shows only the foundational terms / questions; 301 reveals everything.

## Glossary

A flat alphabetical list of every technology and concept named in the primer, each with a one-line definition and a chapter back-reference.

### Tagging

| Level | Approximate count |
|---|---|
| 101 | ~25 entries — only the most universal (browser, server, database, cache, API, login, container...) |
| 201 | ~80 entries — adds named technologies (Postgres, Redis, Cloudflare, Nginx, Auth0, Docker, GitHub, Vercel...) and intermediate concepts (JWT, REST, GraphQL, transaction, webhook, blue/green) |
| 301 | ~150+ entries — adds advanced concepts (CAP theorem, isolation levels, OPA, service mesh, edge compute) and deep tooling (Terraform, Honeycomb, OpenTelemetry, Cerbos) |

### Entry shape

```
Cloudflare
  CDN, DNS, edge-compute, and security platform. Sits at the network edge,
  caching static content close to users and providing a Web Application
  Firewall in front of origins.
  Mentioned in: Ch 1 (DNS), Ch 6 (CDN, edge), Ch 8 (WAF, edge compute).
  Level: 201
```

### Implementation note

Glossary entries are stored as data, not embedded in chapter content. The level-filter hook used by slides also filters the glossary view — same source of truth.

## Smell tests

A bank of "ask the agent this when..." questions. These are the muscle the primer is building: the learner sees a piece of code or an agent's plan, and has a reflex to ask the right follow-up.

### Tagging

Most live at 201 / 301. A few foundational ones live at 101.

### Examples by chapter

**Ch 2 (State) — 201**
> The agent added a query that runs on every page load. Ask: "Should this be cached? What's the freshness requirement?"

**Ch 3 (Identity) — 201**
> The agent's new endpoint takes `userId` as a request parameter. Ask: "Should `userId` come from the request, or from the auth token? What stops me from passing someone else's ID?"

**Ch 4 (Auth) — 201**
> The agent hid a button on the front-end based on a permission check. Ask: "Where is the back-end check that prevents calling this endpoint directly?"

**Ch 5 (Concurrency) — 301**
> The agent's plan reads a counter, modifies it, and writes it back. Ask: "What if two requests run this at the same time? Does this need a transaction or atomic increment?"

**Ch 6 (Architecture) — 201**
> The agent suggested the front-end poll an endpoint every 5 seconds. Ask: "Could this be a webhook or WebSocket instead? What's the cost of polling at that rate at scale?"

**Ch 7 (Code Lifecycle) — 201**
> The agent's PR has no test for the new behavior. Ask: "What's the smallest unit test that would have caught this if I broke it later?"

**Ch 8 (Deployment) — 301**
> The agent's migration adds a NOT NULL column to a large table. Ask: "Is this a backward-compatible migration? What happens to old code during the deploy window?"

### Composition

Each smell test is:
1. The trigger ("the agent did X")
2. The question ("ask: Y")
3. (Optional) the chapter concept it exercises

### Surfacing in the product

Smell tests appear in two places:
- Inline at the end of relevant slides ("If you saw this in agent output, ask...")
- Aggregated in the Ch 9 (Working with Claude Code) chapter as the full bank, filterable by chapter and level

## Authoring discipline

Both glossary and smell tests should be authored against this rule: **every entry exists because the learner will encounter that term / situation when working with an agent.** No entries for completeness alone. If a 301 learner will never encounter "Paxos" while directing Claude Code, it's not in the glossary, even if it's a fundamental distributed-systems concept.
