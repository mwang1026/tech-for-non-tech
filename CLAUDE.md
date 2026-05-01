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

## Tone

Direct and informational. No "geography models" or cute framings. Concept names should describe the concept, not metaphorize it.

## Repo conventions

- Static site, no server backend required for the primer itself.
- Diagrams should evolve a single SVG/canvas state, not be a sequence of disconnected images.
- Prompts and worked examples in the "Working with Claude Code" chapter use the agent in a real codebase as the teaching surface, not a toy app.
