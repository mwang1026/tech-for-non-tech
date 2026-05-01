# The feature-request template

The single most useful artifact in the primer. Forces the agent to think across all relevant layers before it writes a line of code, and forces the learner to recognize when the agent's plan is incomplete.

## The template

> "I want to add **[feature]**. Walk me through:
>
> 1. **State** — what new tables, columns, or in-memory data?
> 2. **API contract** — what endpoints, request shapes, response shapes?
> 3. **Identity** — how does each endpoint know who's calling?
> 4. **Authorization & validation** — who's allowed to do this; what input is rejected?
> 5. **Concurrency** — does this read-then-write shared data? does it need a transaction?
> 6. **Performance** — is anything cached? what's the staleness tolerance?
> 7. **Failure modes** — what happens if the DB is down, the request times out, the third-party service 500s?
> 8. **Front-end & back-end changes** — what code moves where?
> 9. **Diagram** — show me the data flow before writing code.
>
> Don't write any code yet — just explain the plan."

## How each question maps to a chapter

| # | Question | Covered in |
|---|---|---|
| 1 | State | Ch 4 |
| 2 | API contract | Ch 1, Ch 5 |
| 3 | Identity | Ch 2 |
| 4 | Authorization & validation | Ch 3 |
| 5 | Concurrency | Ch 6 |
| 6 | Performance | Ch 4, Ch 5 |
| 7 | Failure modes | Ch 5, Ch 9 |
| 8 | Front-end & back-end | Ch 1 |
| 9 | Diagram | Ch 1 (sequence), Ch 5 (architecture) |

This mapping itself is a slide in Ch 10 — it shows the learner that the template is the curriculum applied. Ch 10 also names the common red flags that should *fail* the template's review (see "Phase 4 — When the plan doesn't fit"): each red flag is a place where one of these nine questions was hand-waved.

## How to use it

- Run the template **every time** you propose a feature, even small ones.
- Read the agent's answers as if they were a junior engineer's design doc. Where is it hand-wavy? Where is it skipping a question? That's where to push.
- The template is the bar for "ready to write code." If question 5 (concurrency) gets a vague answer for a feature that touches shared data, that's where the conversation goes next.

## Why nine, not five

The original template floating around as a heuristic uses five questions (state, API, authorization, front-end, back-end). That set misses three of the most common ways agents quietly produce wrong code:

- **Concurrency** — agents write the read-then-write pattern without flagging the race condition.
- **Performance / caching** — agents add a query without considering whether it should be cached, or invalidate a cache without acknowledging staleness windows.
- **Failure modes** — agents write the happy path and skip the timeout / 5xx / partial-failure branches.

Adding those three — plus an explicit diagram step — costs the learner about 30 seconds of prompt and saves entire categories of bugs.

## When to extend

For specific domains, append questions:
- Payments: "What's the idempotency key strategy? What's the chargeback handling?"
- Multi-tenant: "What's the tenant isolation guarantee? Can data cross tenants?"
- Compliance-heavy: "What's the audit-log behavior? What gets PII-redacted in logs?"

The base nine cover the common ground. Domain extensions live with the codebase, not in this primer.
