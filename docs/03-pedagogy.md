# Pedagogy

How the primer is taught, not just what it covers.

## The framing pattern (every chapter opens with this)

Each chapter begins with the same four-part frame. The user explicitly requested this — understanding the **why** behind every concept is load-bearing.

1. **Job** — what is this concept's job-to-be-done in the system?
2. **Why it matters** — why is the job important?
3. **When it goes wrong** — what does the failure mode look like in practice?
4. **When it works** — what does success look like, often invisibly?

Concrete example (Chapter 5, Concurrency):

> **Job:** Let many requests run at the same time without corrupting shared data.
> **Why:** A real system never serves one user at a time. The moment two requests touch the same row, you have a correctness problem that's invisible at low load and catastrophic at scale.
> **When wrong:** Double-charged credit cards. Selling the last item twice. Counters that drift.
> **When right:** Thousands of overlapping requests produce results indistinguishable from a single-threaded execution.

This frame is the chapter's hook and its retention scaffold. Concepts attach to it.

## The level model — 101 / 201 / 301

The defining pedagogical choice. Three depth tiers that the learner toggles between.

### Definitions

- **101** — for someone who has never thought about software architecture. Goal: understand what each piece does and why it exists. Universal tech names only (Chrome, MySQL, GitHub).
- **201** — for someone who has worked around software professionally and wants the why-behind-the-why. Tradeoffs explicit. Common technologies named. Patterns named.
- **301** — for someone directing an agent on a complex production system. Edge cases, failure modes, advanced patterns. Most smell tests live here.

### The architecture choice — layered, not parallel

Slides are tagged by level. Some slides are **shared** (appear at all three levels). Some are **additive** (appear only at 201+). A few are **replacements** — a 201 slide *supersedes* the 101 version of the same concept with a more rigorous take.

Why this and not three parallel curricula:
- Same chapter outline, same architecture-diagram spine, same five-question template across levels — preserves spatial memory when the learner re-enters at a higher level.
- Authoring per-level is real authoring (not "watered-down 301 prose"); 101 is genuinely a different and complete story from 301.
- One toggle drives slides + glossary + diagram density simultaneously.

### What the toggle controls

| Surface | Effect of level change |
|---|---|
| Slides | Filter — show only slides at this level or below; replacement slides override their lower-level siblings |
| Glossary | Filter entries by level |
| Smell tests | Filter by level |
| Architecture diagram | Detail layers fade in/out (named tech at 201; replicas, observability, multi-region at 301) |

### Failure mode to avoid

The bad version of this is "201 = 101 with a sidebar of jargon." Every 201 slide must earn its place by genuinely changing how the learner understands the concept, not just adding name-drops. If a 201 slide could be deleted and the only loss is a few technology names, it should be a glossary entry, not a slide.

## The meta-pattern (taught in Ch 9, foreshadowed throughout)

> **Every feature is the same nine questions. See the pattern three times and you can predict it for any feature.**

The nine questions are detailed in `05-feature-template.md`. Each chapter introduces one or more of them; Ch 9 ties them together into the template the learner runs every time they direct an agent.

## Worked examples — the same feature at growing complexity

The notes feature is built across the curriculum at four complexity tiers. Each tier reuses the previous data shape and adds one new concern. This lets the learner see the *same skeleton* re-analyzed through every concept lens.

| Tier | Feature | Added complexity | Chapter where it lands |
|---|---|---|---|
| 1 | Notes box | Basic CRUD per user; isolation by `user_id` | Ch 3 (Identity) — first worked example |
| 2 | Sharing notes | Authorization: can I see this shared note? | Ch 4 (Auth) |
| 3 | Comments on notes | Cascading permissions: can I comment? | Ch 4 (Auth) |
| 4 | Real-time updates | Push vs. pull, WebSocket transport | Ch 6 (Architecture) |

By Ch 9 the learner has seen the same feature analyzed through identity, authorization, cascading permissions, and transport — and the nine-question template snaps into place naturally.

## Per-chapter recap — bridging concepts to the system end-to-end

Every chapter (Ch 1-8) ends with a recap slide before its Claude Code prompts. Three parts:

1. **What you've learned** — 3-4 tight bullets summarizing the chapter's load-bearing ideas.
2. **Where it lives in the system** — a callout on the persistent architecture diagram showing this chapter's concept lit up in context.
3. **The bridge to next chapter** — one sentence connecting forward.

This compounds across chapters. By Ch 8 the recap shows 8 lit regions on one diagram. Ch 9 then animates real request paths through those same regions, exercising every concept in concert. The recap pattern is the daily payoff for the persistent-diagram design choice — each chapter's concept doesn't live in isolation, it accretes onto a shared visual the learner has been building.

## Threading Claude Code prompts throughout

Originally the entire "how to use Claude Code" content was concentrated in Ch 8 / Ch 9. We rejected that — it forces the learner through seven chapters of theory before switching modes.

Instead: **two Claude Code prompts at the end of every chapter**, scoped to that chapter's concept. The learner is asked to try the prompt against their own codebase. By Ch 9 they've already used the agent 16 times in context — the final chapter is integration, not introduction.

Examples:
- Ch 2 (State): "What's stored in the database in this codebase vs. what's only in memory?"
- Ch 5 (Concurrency): "Does this codebase use any database transactions? Show me where and why."
- Ch 7 (Code Lifecycle): "What tests does this codebase have, where are they, and how do I run them locally?"

## Don't teach syntax, ever

The single firmest pedagogical rule. The ability to read or write code is not the goal. The goal is architectural judgment — the ability to understand what a system is doing, predict the consequences of changes, and direct an AI agent effectively.

Concepts are taught **through** a real codebase using the agent as guide. Abstract definitions don't stick. "What is a webhook?" lands as "There's a webhook in this file — let me show you why it exists here and what it's doing."

## Tone

- Direct, informational. No metaphor games ("the geography model"), no cute framings.
- Concept names describe the concept, not metaphorize it.
- Tradeoffs are framed honestly — there is rarely a "right answer," there are decisions and consequences.
- The reader is treated as smart and time-constrained.

## Narrative voice — the slide arc

Every content slide follows the same six-beat arc. This is how a senior engineer explains things at a whiteboard, and how good teachers introduce new concepts: each new idea arrives as the answer to a question the learner now has.

| Beat | What it does | Approx length |
|---|---|---|
| 1. **Recap** | Connect to where we just were. "Coming out of the last section, we have ..." | 1–2 sentences |
| 2. **Tension** | Name a new requirement, friction, or scaling problem. "But here's the situation ..." | 2–3 sentences |
| 3. **What needs to happen** | State the requirement plainly, before naming the solution. "What needs to happen is ..." | 1 sentence |
| 4. **The solution** | Explain how it's solved, mechanically. Plain language; no jargon yet. | 2–4 sentences |
| 5. **The names** | Now name the concept and the dominant technologies. **Bold** the concept and the providers. | 1–2 sentences |
| 6. **Tradeoff + bridge** | What's given up. Tie back to a prior concept the learner already has, OR set up the next slide. | 1–2 sentences |

### Why this arc

- **The recap forces continuity.** Each slide reads as continuation, not isolated lecture.
- **The tension creates the question.** A learner who feels the problem will retain the answer. A learner handed the answer first will forget.
- **Naming after explaining** is the pedagogical inversion that lets technical terms land. "A fleet of servers around the world serving cached files" is intuitive; learning that's called "a CDN" is then trivial. The reverse — "today we're learning about CDNs" — is forgettable.
- **Names + tradeoff** packages the practical knowledge: what to look for in a codebase, what to call it when you see it, and what's wrong about it.

### Voice rules

- Conversational, peer-to-peer. Not didactic. Not "Let's learn about ..."
- Active voice. "The CDN serves the cached file" — not "the cached file is served."
- Use second person ("you") sparingly; first-person plural ("we have a load balancer ...") works well for the recap and tension beats.
- One concept per slide. If the slide introduces two concepts, split it.

### Succinct but complete

The single most important writing principle. Better long-and-clear than short-and-jargony. **Every technical term gets explained inline at first mention, even if it costs words.** Don't say "rate budget" when "rate limit (the cap on how many requests they're allowed in a given window)" is what the learner needs. Don't write "stateless server" when "stateless (the server keeps no memory of past requests, so any server in the pool can answer the next one)" is what makes the concept land.

The trim-for-brevity instinct is wrong here. Our reader explicitly does not know these terms — that's why they're reading the primer. Saving 8 words by leaving "binary protocol" undefined fails the learner.

The check on every slide: read it as if you've never heard any of these terms before. Are there words that would stop you cold? If yes, expand them. If the slide gets long enough to overflow the viewport, that's fine — the body scrolls.

What this rule does *not* mean:
- Don't pad. Substance, not filler. Every added sentence should explain something concrete.
- Don't define every word. Words that aren't load-bearing for the concept (`Sydney`, `the database`, `requests`) don't need glosses.
- Don't repeat earlier definitions on every slide. Once introduced, terms can be used freely in later slides — that's why the level filter exists.

### Banned openings

- "Let's talk about ..."
- "A [concept] is ..." (defining-without-context)
- "In this section we will learn ..."
- "There are several types of ..."

### Required openings (one of these)

- "Coming out of [last concept], we have ..."
- "We've got [recap]. But ..."
- "So far, [recap]. The next problem is ..."

The recap-then-tension opening is non-negotiable. It's the difference between teaching and lecturing.

### Bold marks "what to remember"

In the slide body, **bold** is reserved for two things:
- The concept being introduced (e.g. **Content Delivery Network**, **CDN**)
- The dominant technology names (e.g. **Cloudflare**, **Fastly**, **Akamai**)

Nothing else gets bold. No bold on emphasis, no bold on important-sounding sentences. Bold means "this is a term you'll see again — when you spot it in a codebase or in agent output, you'll know what it means."

### Bold terms link to the glossary

Every bold concept and named technology is a hyperlink to its glossary entry. Hover reveals a small popover with the one-line definition; click jumps to the glossary panel. This makes the slide pull double-duty: the narrative teaches the concept; the link gives the durable reference. The glossary entries themselves are tagged by level (see `06-glossary-and-smell-tests.md`) so a 101 reader's links go to 101 definitions.

### Diagram choreography — beat-by-beat highlighting

The slide narrative doesn't just tell — it *cues the diagram*. Each beat of the arc can trigger its own diagram action. The narrative and the diagram are halves of the same thought.

| Beat | Diagram action |
|---|---|
| Recap | Prior element stays softly lit |
| Tension | Subtle pulse on the affected region (where the problem manifests) |
| What needs to happen | (no diagram change — text-only beat) |
| Solution | New element fades in at its position |
| Names | Tech-tag labels appear under the new element |
| Bridge | Soft secondary highlight on the prior-concept element being referenced |

Worked example — the CDN slide:
- Recap: load balancer stays softly lit (it was the focus of the prior slide)
- Tension: a long arrow between origin server and the user pulses, dramatizing the round-trip cost
- Solution: a CDN box fades in at the edge of the diagram, between the user and everything else
- Names: "Cloudflare / Fastly / Akamai / AWS CloudFront" appears as small tech-tag labels under the CDN
- Bridge: the Cache box (from Chapter 2) gets a soft secondary highlight as the bridge sentence references it

This is the killer feature of the persistent diagram. Without it, the diagram is just a chart that happens to be there. With it, each slide is a coordinated audiovisual moment.

### Implementation note

The MVP scaffold attaches one `diagramFocus` per slide. The richer version supports `diagramBeats: { recap, tension, solution, names, bridge }`, each a focus directive. Authoring can start with single-focus and progressively add beats where the choreography earns its keep.

### The bridge — both directions

Every slide ends with a bridge. Bridges go in either direction:

- **Backward bridge** (default): tie the new concept to a prior one the learner already has. Reinforces the spine. *"This is the cache-vs-freshness tradeoff from Chapter 2, applied at the network layer."*
- **Forward bridge**: set up the next slide's tension. Used when the next slide naturally builds on this one. *"But what happens when those edge servers themselves go down? Next: ..."*

A slide can do both, especially the recap slide at the end of a chapter, which bridges back to the chapter's start AND forward to the next chapter.
