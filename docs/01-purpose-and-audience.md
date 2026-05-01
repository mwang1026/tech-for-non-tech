# Purpose & audience

## Title

**Reading the System** — A Field Guide for Working with AI Coding Agents

The title foregrounds the comprehension goal (reading the system, not writing code). "Field guide" sets expectation that it's practical and reference-able. Repo directory name remains `tech-for-non-tech` for path stability.

## What this project is

An interactive, browser-based primer that teaches **architectural and systems literacy** to non-technical professionals so they can collaborate effectively with AI coding agents (Claude Code, Codex, Cursor, etc.).

## The thesis

Vibe-coding produces output you can't critique. To direct an agent well, the user needs intuition for the components a feature touches and the tradeoffs the agent is silently making — latency vs. consistency vs. durability, monolith vs. service split, push vs. pull, sync vs. async. The goal is **judgment**, not syntax fluency.

The user should be able to read agent output and ask:
- "Did you handle the race condition?"
- "Is this cached, and what's the staleness tolerance?"
- "Where does this validate authorization?"
- "Is this backward-compatible with old code during deploy?"

These questions don't require writing code. They require knowing the questions exist.

## The learner profile

A domain expert with **zero coding syntax knowledge**. Knows what an API, server, and client are at a vague conceptual level. Needs to read a real codebase with an agent, ask the right questions, and steer feature work — without ever writing a function.

The learner is intelligent, motivated, and has limited patience for irrelevant detail. Direct, informational framing — not metaphor, not cute analogies.

## What success looks like

After working through the primer, the learner can:

1. Open a real codebase with Claude Code and orient themselves (what is this, how is it shaped, where does each kind of work live).
2. Direct the agent to add a feature using the nine-question template, and recognize when the agent's plan is missing something important.
3. Read a diff and identify whether validation, identity checks, race conditions, and failure modes are handled.
4. Map any unfamiliar technology name (Cloudflare, Nginx, Kafka, Redis, Auth0...) to its conceptual role.

## What this is not

- Not a coding course. No syntax, no language tutorials.
- Not a framework or stack tutorial. No "how to use React" or "how to write SQL."
- Not exhaustive. Genuinely deep topics (distributed systems theory, performance engineering) are gestured at — not taught — at the 301 level.

## Why this gap exists

Existing curricula (Skiplevel, Reforge Technical Foundations, Udemy software-foundations courses) predate agent-driven coding and are linear text/video. None show the architecture *building up* as concepts are introduced, and none focus on the meta-skill of directing an AI agent inside a real codebase.
