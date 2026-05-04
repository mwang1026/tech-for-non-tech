# Reading the System

*A Field Guide for Working with AI Coding Agents*

(Repo name: `tech-for-non-tech` — kept for the directory; the product name is "Reading the System.")

## What this project is

An interactive, browser-based primer that teaches **architectural and systems literacy** to non-technical professionals so they can collaborate effectively with AI coding agents (Claude Code, Codex, Cursor, etc.).

The thesis: vibe-coding produces output you can't critique. To direct an agent well, the user needs intuition for the components a feature touches and the tradeoffs the agent is silently making (latency vs. consistency vs. durability, monolith vs. service split, push vs. pull, etc.). The goal is **judgment**, not syntax.

## Audience

A domain expert with no coding syntax knowledge. Knows what an API, server, and client are at a vague conceptual level. Needs to read a real codebase with an agent, ask the right questions, and steer feature work — without ever writing a function.

## Format

A single-page web experience with:
- **Chapter navigation** — jump between modules (Geography, State, Identity, Validation, Isolation, Architecture, Deployment, Working with Claude Code).
- **Progressive slides within a chapter** — concepts revealed one step at a time.
- **A persistent visual layer** — a single architecture diagram that lives across the experience and accretes elements (load balancer, cache, DB, identity layer, etc.) as the learner advances. The diagram is the spine; the slides are the narration.

This is the design constraint that distinguishes the project. Existing curricula (Skiplevel, Reforge, Udemy) are linear text/video. None show the architecture *building up* as concepts are introduced.

## Voice

The voice is a **storytelling educator**. Narrative arcs build the concept; the reader earns each term by seeing it needed. State facts plainly, make the connection visible, and let the aha land on its own. No fluff, no profundity, no catchphrases.

### Anti-patterns (named — cite by tag in review)

1. **PROFOUND-HIGH-SCHOOLER** — Asserting that something "matters", "is load-bearing", or describes "different worlds" without naming the consequence.
   *Test:* Delete the sentence. If the reader still learns the consequence from what follows, the sentence was the violation. If deleting leaves a gap, rewrite to *be* the consequence.

2. **MARKETER PITH** — Closing or summarizing with a slogan, parallelism, or catchphrase instead of the underlying fact.
   *Test:* Could this line appear on a t-shirt? Cut it. Recap the fact in plain language.

3. **MANUFACTURED SUSPENSE** — "Here's the trick", "the situation we've been ignoring", "what they don't tell you". The reader trusts the order; don't fake-foreshadow.
   *Test:* Does the next sentence deliver a genuine reversal? If no, just continue.

4. **STRAWMAN DEFINITION** — Defining a concept by knocking down a vague misconception nobody held ("X isn't a vague cloud of stuff", "X isn't magic").
   *Test:* If the reader didn't already hold the strawman view, you put it in their head just to remove it. Define directly.

5. **WRITERLY TIC** — Throat-clearing phrases: "in practice", "as it turns out", "interestingly", "concrete and load-bearing", "the distinction matters".
   *Test:* If the phrase carries no factual weight, cut it.

6. **CLOSING FLOURISH** — A sentence at the end of a slide that restates the previous sentence in a more poetic register.
   *Test:* If you just said the thing, don't say it again wearing a hat.

7. **METAPHOR-FOR-ITS-OWN-SAKE** — Naming a concept with a metaphor when the literal name works ("geography model", "the spine of the experience", "smarter conversations").
   *Test:* Does the metaphor survive literal restatement, or does it replace meaning with vibe? If the latter, use the literal name.

8. **UNSOURCED CONSENSUS** — Asserting "most", "usually", "typically", "often", "the default", "the most common" without a number, a named product/team, or a citation. Hard ban: every soft quantifier must either be cut, replaced with a factual description, or backed by an explicit source or named example. This is unconditional — even verifiable-feeling claims ("most modern sites use HTTPS") must attach the source or be rephrased as a factual description ("Chrome, Firefox, and Safari now flag plain HTTP as insecure").
   *Test:* Can you replace the qualifier with a number, a named example, or a citation? If not, cut the qualifier — then check whether the sentence still says something factual. If the sentence was *only* a consensus claim, cut the whole line. If it described what the thing *is* or *does*, keep that part.
   *Worked example:* "Nginx — the most common general-purpose option" → "Nginx — open-source, runs on a server you operate." The descriptive sentence carries; the ranking claim was filler.

### Good patterns (named — protect and replicate)

1. **EARNED TERM** — Concrete scenario or counterfactual first; name the term *after* the reader feels the need for it. (Example: `chapter-01.ts` walks the bank transfer, *then* names the request-response cycle.)

2. **CAUSAL BULLET** — Each bullet states a thing that breaks, costs, or behaves a specific way — not a category label. (Example: `chapter-02.ts` "leakage in transit / leakage at rest / speed".)

3. **NAMED CONSEQUENCE** — When a tradeoff appears, name what breaks ("that user's session goes with it"), not "there's a tradeoff". (Example: `chapter-05.ts` sticky-session line.)

4. **RECALL-THEN-ADD** — Open a slide with one sentence of recall from a prior chapter and one sentence of the new question. (Example: `chapter-04.ts` slide 1 opener.)

5. **FELT BUG** — Anchor abstract concepts to a user-visible bug the reader has lived through. (Example: `chapter-04.ts` source-of-truth bugs — "I updated my settings but my phone still shows the old value".)

6. **SPECIFIC KEYSTROKES** — Replace "easily bypassable" with the literal steps. Concrete actions beat generic adjectives. (Example: `chapter-03.ts` DevTools steps.)

7. **DIRECT DEFINITION** — Say what the thing *is*, then what it does. No "isn't a vague cloud" preamble.

### On character

The anti-pattern rules cut rhetorical flourish, not personality. Character is welcome — but it has to come from substance, not framing. The voice can be dry, observational, and occasionally wry. What's permitted:

- **Dry observation of how systems actually behave.** Naming an institutional behavior plainly is voice — "500 Internal Server Error is the catch-all 'something broke on our side and we don't want to tell you what.'" The wryness is in the accurate description, not in editorializing about it.
- **Weirdly specific specifics.** "Tokyo, Frankfurt, São Paulo, Sydney" beats "many cities worldwide." Specificity is personality.
- **Brief aside that admits its own context.** "(you're not meant to read it)" after a JWT example. One short clause; no setup.
- **Crisp causal punchline.** "Skipping the check, even once, is how breaches happen." Period at the end of a paragraph; the bite is the consequence, not the phrasing.
- **Felt-experience phrasing.** "I updated my settings but my phone still shows the old value." Reader empathy *is* voice.
- **Honest scope acknowledgment.** "Both work; we'll get into the tradeoffs later." Saying out loud what the prose is and isn't doing.

The line: if the character is doing *work* (it's an aside on real behavior, a specific detail, a crisp consequence), keep it. If it's a flourish on top of a sentence that already said the thing, it's a CLOSING FLOURISH or MARKETER PITH and the rules above apply.

### Worked before/after

**A.** PROFOUND-HIGH-SCHOOLER + WRITERLY TIC.
- *Before:* "We've been talking about 'the server' as one thing. In practice, what runs on the user's machine and what runs on the company's machine are very different worlds, and the distinction matters."
- *After:* "We've been talking about 'the server' as one thing. The next slide splits it: code that runs in the browser the user controls, and code that runs on the machines we control. That split decides where security can be enforced and what scales for free."

**B.** MARKETER PITH.
- *Before:* "Same boxes; smarter conversations."
- *After:* (delete — the surrounding recap already says it.) Or: "The diagram doesn't change this chapter; identity rides on the existing request arrows."

**C.** CLOSING FLOURISH.
- *Before:* "Three lifetimes, visible side-by-side in the same flow. The request was born and died in seconds. The identity is held warm in the cache between requests. The resource is permanent until something writes over it."
- *After:* "The request was born and died in seconds. The identity stayed warm in the cache between requests. The resource is permanent until something writes over it." (Drop the topic sentence; the three concrete facts carry it.)

**D.** STRAWMAN DEFINITION.
- *Before:* "State isn't a vague cloud of 'stuff the system knows.' It's the attributes of specific things, and the interesting question is *where each thing's attributes live*."
- *After:* "State is the attributes of those entities — every fact the system holds belongs to one of them. The interesting question is *where each entity's attributes live*."

## Repo conventions

- Static site, no server backend required for the primer itself.
- Diagrams should evolve a single SVG/canvas state, not be a sequence of disconnected images.
- Prompts and worked examples in the "Working with Claude Code" chapter use the agent in a real codebase as the teaching surface, not a toy app.
