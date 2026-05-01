# Design system

The opinionated design tokens. Two fonts. One palette. One accent. No exceptions without an explicit revision to this doc.

## Typography — exactly two fonts

- **Fraunces** (variable serif) — display only: chapter titles, slide headlines.
- **Inter** (variable sans) — everything else: body, UI chrome, diagram labels, prompts, code-style cards.

No mono font. No third font. No system-stack fallback for display — Fraunces or nothing.

### Type scale (only these sizes)

| Use | Font | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|---|
| Chapter title | Fraunces | 28px | 400 | -0.01em | 1.15 |
| Slide headline | Fraunces | 32px | 400 | -0.01em | 1.2 |
| Subhead | Inter | 18px | 600 | 0 | 1.4 |
| Body | Inter | 17px | 400 | 0 | 1.6 |
| UI / label | Inter | 13px | 500 | +0.04em | 1.4 (uppercase) |
| Caption / tech-tag | Inter | 12px | 400 | 0 | 1.4 (muted) |
| Diagram primary label | Inter | 11px | 600 | 0 | 1.2 |
| Diagram tech-tag | Inter | 10px | 400 | +0.02em | 1.2 (uppercase, muted) |

If a use case isn't in this table, pick the closest entry. Don't invent new sizes.

## Color — single palette, single accent

### Tokens

| Token | Value | Use |
|---|---|---|
| `--paper` | `#FAF7F2` | Default background, diagram fills |
| `--ink` | `#1A1815` | Default text, diagram strokes |
| `--ink-muted` | `#6B6660` | Secondary text, tech-tag labels |
| `--hairline` | `#E5E0D7` | Borders, dividers, subtle structure |
| `--hairline-strong` | `#C9C2B5` | Stronger borders when needed |
| `--accent` | `#B6371F` | Vermillion — used sparingly |
| `--accent-soft` | `#B6371F` at 12% | Accent fills (active pill background) |

### Accent discipline

`--accent` is used for:
- Active level pill (when level = 301)
- Single highlighted region on the diagram (one at a time)
- Active prev/next button hover
- Current-slide marker on the chapter rail (left edge)

Nowhere else. No accent on links. No accent on body emphasis (use weight or italic instead).

## Level pill colors — restraint over palette proliferation

Three levels but **not three colors**. We use type and state instead:

| Level state | Visual treatment |
|---|---|
| 101 active | Ink text on paper-toned pill, 1px hairline border |
| 201 active | Ink text on paper, label is **underlined** |
| 301 active | Paper text on `--accent` fill |
| Any inactive | Muted ink, no border, 60% opacity |

Reason: the previous round of mocks tried color-coding (101=green, 201=amber, 301=rose) and the result was visually noisy. The level pill should be obvious without screaming.

## Spacing — 4px grid

All spacing is multiples of 4px. The most-used values:

| Name | Value | Use |
|---|---|---|
| `xs` | 4px | Tight inline gaps |
| `s` | 8px | Default small gap |
| `m` | 16px | Default block gap |
| `l` | 24px | Section spacing |
| `xl` | 40px | Major section breaks |
| `xxl` | 64px | Top-of-chapter spacing |

## Radii

| Token | Value | Use |
|---|---|---|
| `--r-sm` | 4px | Pills, small chips |
| `--r-md` | 8px | Cards, prompt boxes |
| `--r-lg` | 12px | Modal/dialog containers |

Diagram shapes use 0 radius (sharp corners feel editorial / blueprint-like).

## Motion

- Default duration: 200ms ease-out for hovers and small state changes.
- Slide transitions: 320ms ease-out cross-fade, with a 4px y-translate.
- Diagram zoom: 480ms cubic-bezier(0.22, 0.61, 0.36, 1) on viewBox.
- Element fade-in (e.g. 301 overlay reveal): 240ms ease-out, staggered 30ms per element.
- No bounce / spring on text. Spring is reserved for the diagram zoom only.

## Shadow

Almost none. The aesthetic is paper-on-paper editorial. If a card needs to lift, use a 1px ring in `--hairline-strong` rather than a drop shadow. Modals and the gateway-zoom overlay can use a single soft shadow:

```
box-shadow: 0 24px 48px -16px rgba(26, 24, 21, 0.18);
```

## What's banned

- Drop shadows on body content
- Multiple accent colors
- Colored level pills (red/amber/green)
- Bouncy / spring animations on text
- Any third font
- System sans fallbacks for display headlines
