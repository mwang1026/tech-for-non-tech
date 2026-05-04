import type { Chapter, Block } from './types'
import { _, t, p, ul, step, steps } from './authoring'

/* ============================================================================
 * Chapter 5 — Architecture & Communication Patterns (101)
 *
 * Diagram visible by end of this chapter at 101:
 *   Browser → CDN → Load Balancer → Front-end → Back-end → Cache + DB
 *
 * Slide arc:
 *   1. One server isn't enough          (sets up load balancer)
 *   2. Spread the work                  (load balancer)
 *   3. Static files don't need to travel that far  (CDN)
 *   4. Ask vs. be told                  (polling vs. webhooks)
 *   5. One codebase or many             (monolith vs. microservices, conceptual)
 *   6. Recap + Claude Code prompts
 * ============================================================================ */

/* --------------------------- Slide 1 — One server isn't enough --------------------------- */

const oneServerEnough: Block[] = [
  p(_('Up until now, we’ve drawn the back-end as a single server — with a cache and a database next to it. That picture handles the *kinds* of questions earlier chapters cared about: who’s asking, what they’re allowed to do, where data lives. The moment we ask how it scales, every box has to multiply.')),
  p(_('That single server works fine — until it doesn’t. A single machine can only do so much computation at once, hold so much data in memory, and move so much in and out of the network at any moment. Push enough simultaneous users at it and it slows down for everyone, then starts dropping requests, then crashes.')),
  p(_('You also can’t take it down for an update without taking the whole product down. And if the machine itself fails — bad disk, network glitch, power blip — every user is offline until you fix it.')),
  p(_('What needs to happen: more than one server, sharing the work. If five servers each handle a fifth of the traffic, no one server is overloaded. If one of them dies, the other four keep going.')),
  p(_('Which raises the question: when a request arrives, which server should it go to?')),
]

/* --------------------------- Slide 2 — Spread the work --------------------------- */

const loadBalancers: Block[] = [
  p(_('We need many servers doing the same job, with something in front of them deciding which one handles the next request.')),
  p(
    _('That something is a '), t('load balancer', 'load-balancer'),
    _('. It’s a piece of software (sometimes its own dedicated machine) that sits between the public internet and your fleet of back-end servers. Every incoming request hits it first; it picks one of the available servers and forwards the request there.'),
  ),
  p(_('How does it pick? The simplest strategy is round-robin: server 1, server 2, server 3, server 1, server 2, and so on. Smarter strategies look at which servers are busy and route to the least-loaded one. Some setups pin a user to one server (a pattern called a **sticky session**) so every request from that user keeps hitting the same machine and its in-memory cache for that user stays useful. Convenient until that server dies — at which point that user’s session goes with it.')),
  p(_('The load balancer also watches its servers. If one stops responding to a "are you alive?" check, the load balancer takes it out of rotation — new requests skip the broken one. When the server comes back, it’s added back in. Users never see the failure.')),
  p(_('Common load balancers:')),
  ul(
    [t('Nginx', 'nginx'), _(' — Open-source, runs on a server you operate. The most common general-purpose option.')],
    [t('HAProxy', 'haproxy'), _(' — Another popular open-source option, known for high throughput.')],
    [t('AWS Elastic Load Balancer (ELB)', 'aws-elb'), _(' — Managed by AWS; you don’t run any servers for it yourself.')],
    [t('Cloudflare Load Balancing', 'cloudflare-lb'), _(' — Runs on Cloudflare’s global network, close to users.')],
  ),
  p(_('Load balancing solves "more requests than one server can handle." The next problem is more subtle: even with many servers, every user still has to fetch a lot of stuff from far away.')),
]

/* --------------------------- Slide 3 — Static content, served close --------------------------- */

const cdn: Block[] = [
  p(
    _('We have a '), t('load balancer', 'load-balancer'),
    _(' fanning requests across many application servers. But every request still travels from the user’s browser, across the public internet, to those servers — and back.'),
  ),
  p(_('Most of what a web page actually delivers — images, JavaScript, fonts, stylesheets — is identical for every user. A typical page is 2–5 MB of these "static" files. If your servers sit in Virginia and your user is in Tokyo, that data crosses half the planet on every page load, even though the bytes never change. Multiply by millions of users and you’re shipping terabytes of identical content across the planet.')),
  p(_('What needs to happen: those static files should live closer to the user — geographically — so the user doesn’t pay the round-trip cost.')),
  p(
    _('The way this is solved is with a fleet of cache servers spread around the world — Tokyo, Frankfurt, São Paulo, Sydney, dozens of cities. Each one holds a local copy of your static files. When a user in Tokyo asks for your logo, the request never touches your real server in Virginia. It hits the closest cache server (called the '),
    t('edge', 'edge-server'),
    _(') which serves the file from local storage. Latency drops from hundreds of milliseconds to tens.'),
  ),
  p(
    _('This is called a '), t('Content Delivery Network', 'cdn'), _(', or '), t('CDN', 'cdn'), _('. The big providers:'),
  ),
  ul(
    [t('Cloudflare', 'cloudflare'), _(' — The default for most modern sites. Generous free tier, runs on a massive global network.')],
    [t('Fastly', 'fastly'), _(' — Heavy in media (Stripe, Shopify, NYT). Known for very fast cache purges.')],
    [t('Akamai', 'akamai'), _(' — The enterprise incumbent. Largest network; oldest in the space.')],
    [t('AWS CloudFront', 'cloudfront'), _(' — The AWS-native option, integrated with the rest of AWS.')],
  ),
  p(_('The tradeoff is staleness — the CDN serves what it cached, not what’s live. Updating a file may take time to reach every edge server, or you can manually "purge" the cache to force a refresh. This is the same speed-vs-freshness tradeoff from Chapter 4 (Cache vs. Database), now applied at the network layer.')),
]

/* --------------------------- Slide 4 — Ask vs. be told --------------------------- */

const pollVsWebhook: Block[] = [
  p(_('We’ve been drawing our system as self-contained. In practice, almost every real product lives next to systems we don’t own — payment processors, identity providers, email senders, '), t('GitHub', 'github'), _(', geocoders, weather APIs. Conversations with those systems usually fall into one of three shapes.')),
  steps(
    step(
      [
        _('**Synchronous API call.** We send a request and the answer comes back in the same response — the work happens *during* the call. *Convert this currency. Translate this text. Geocode this address. Charge this card.* It’s request-response with someone else’s server, no different in shape from how a browser talks to ours. Most external traffic looks like this.'),
      ],
      { highlight: ['arrow:webhook-stripe-out', 'arrow:webhook-stripe-in', 'webhook-stripe'], status: 'pass', focus: 'full', pulse: 'once' },
    ),
    step(
      [
        _('**'), t('Polling', 'polling'), _('.** Same shape as a synchronous call, except the answer doesn’t exist yet. We kicked something off — or want to know about something that changes on its own — and the work takes time on their side. So we ask, *is it ready?*, get "not yet," wait, ask again, until eventually the answer is "yes." *Is the video encoded yet? Has the bank batch processed the payout? Are there new Shopify orders since the last sync?* Each check is a normal GET; the pattern is the *loop*. Polling is also where you land when the other system doesn’t support push, or when you can’t receive a push at all (a browser, a mobile app, a server with no public URL).'),
      ],
      { highlight: ['arrow:webhook-stripe-out', 'webhook-stripe'], status: 'neutral', focus: 'full', pulse: 'repeat' },
    ),
    step(
      [
        _('**'), t('Webhooks', 'webhook'), _('.** The inverse: they call us when something happens. We give the external system one of our URLs ahead of time, and they hit it the moment an event occurs. *Stripe pings us when a charge confirms. '),
        t('GitHub', 'github'), _(' pings us when someone pushes code. Slack pings us when someone @s our bot.* The request originates from the outside — they’re talking, and our server is listening. Webhooks fit when both sides are servers and the external system supports them.'),
      ],
      { highlight: ['arrow:webhook-stripe-in', 'webhook-stripe'], status: 'pass', focus: 'full', pulse: 'once' },
    ),
  ),
  p(_('When you direct an agent to add a feature that touches an external system, the question to ask out loud is *which of these three is happening here, and why that one?* If the agent picked polling when webhooks were available, or made a synchronous call when the work actually takes time on their side, that’s where to push back.')),
]

/* --------------------------- Slide 5 — One codebase or many --------------------------- */

const monolith: Block[] = [
  p(_('We’ve been treating "the back-end" as one program — one codebase that does everything our product does.')),
  p(_('That works fine when one team owns it. But when three teams — or ten — share that codebase, every change risks breaking someone else’s code. Every '), t('deploy', 'deploy'), _(' (the act of pushing your latest code to production) requires coordination — if one team’s change breaks the build, nobody can ship until it’s fixed. The codebase becomes everyone’s mess and no one’s responsibility.')),
  p(_('There’s a choice here:')),
  ul(
    [t('Monolith', 'monolith'), _(' — One codebase, one program, one deployable unit. Simple to reason about — everything is in one place. Simple to deploy — one command pushes everything. The cost: every team shares it, so changes ripple, and the more code lives in one bundle, the slower the test suite and the riskier each deploy gets.')],
    [t('Microservices', 'microservices'), _(' — The back-end is split into many small programs (services), each owned by one team, each deployed independently. One team’s broken service doesn’t take down everyone else’s. One team can ship ten times a day without coordinating with anyone. The cost: complexity moves outward — services now have to talk to each other across the network (which can fail), and debugging a single user action means tracing it across several services.')],
  ),
  p(_('Most companies start as monoliths and split when scale forces it. Netflix, Amazon, and Uber are famous microservices stories — they grew past what one codebase could handle. GitHub, Shopify, and Basecamp run famously large monoliths and ship fine. The right answer is whichever lets your specific team ship safely — monolith vs. microservices is as much a team decision as a technical one.')),
]

/* --------------------------- Chapter 5 export --------------------------- */

export const chapter05: Chapter = {
  id: 'ch5',
  number: 5,
  title: 'Architecture & Communication Patterns',
  subtitle: 'How pieces of a system are split up, and how they talk',
  slides: [
    { id: 's1', level: 101, headline: 'One server isn’t enough', body: { kind: 'prose', blocks: oneServerEnough }, diagramFocus: 'app' },
    { id: 's2', level: 101, headline: 'Spread the work', body: { kind: 'prose', blocks: loadBalancers }, diagramFocus: 'lb' },
    { id: 's3', level: 101, headline: 'Static content, served close', body: { kind: 'prose', blocks: cdn }, diagramFocus: 'cdn' },
    { id: 's4', level: 101, headline: 'Talking to external systems', body: { kind: 'prose', blocks: pollVsWebhook }, diagramFocus: 'full', extraVisible: ['webhook-stripe'] },
    { id: 's5', level: 101, headline: 'One codebase or many', body: { kind: 'prose', blocks: monolith }, diagramFocus: 'app' },
    {
      id: 's6',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'A single back-end server can\'t serve a real audience — you need many, behind a load balancer that spreads requests across them',
          'CDNs cache static files (images, JS, fonts) close to users geographically, so most page weight never touches your origin server',
          'Talking to external systems comes in three shapes — regular API calls, polling, and webhooks — and most cross-system features are one of those three',
          'Monolith vs. microservices is a team-and-scale decision, not a winner — the answer depends on how independent your teams need to be',
        ],
        whereInSystem: [
          _('The '), t('load balancer', 'load-balancer'),
          _(' sits in front of your back-end fleet, choosing which server handles each request. The '),
          t('CDN', 'cdn'),
          _(' sits even further out at the network edge, serving static files from cache servers near each user.'),
        ],
        bridge: [
          _('Coming up — Chapter 6: Concurrency. Now that we have many servers handling thousands of requests at once, two questions appear. When two requests want the same row at the same instant, who wins — and how do we keep the loser from being silently overwritten? And when the work is too slow to make a user wait on it, where does it go instead? Sync, async, and what goes wrong with each.'),
        ],
      },
    },
  ],
}
