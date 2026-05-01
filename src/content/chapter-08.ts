import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
// const h = (text: string): Block => ({ kind: 'h', text })  // available; rarely needed
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })

/* ============================================================================
 * Chapter 8 — Deployment & Operations (101)
 *
 * Slide arc:
 *   1. It works on my machine        (containers)
 *   2. Three places the code lives    (dev / staging / production)
 *   3. Updating without going down    (blue/green, canary, rolling)
 *   4. How you find out it broke      (logs, metrics, errors)
 *   5. Recap + Claude Code prompts
 * ============================================================================ */

/* --------------------------- Slide 1 — It works on my machine --------------------------- */

const containers: Block[] = [
  p(_('We have code that passed review, passed its tests, and is sitting in the main branch waiting to go live. The next question is how it actually reaches the servers running in production.')),
  p(_('Here’s the problem you hit the first time you try. The code runs perfectly on the developer’s laptop. You ship it to a server. It crashes. You investigate. The server is set up slightly differently than the laptop in some way that matters — a different version of a software dependency, a missing piece of configuration, anything. The phrase for this is "it works on my machine" — and it’s the most common cause of bad deploys in software history.')),
  p(_('What needs to happen: the code should run in an identical environment everywhere — laptop, test server, production — so that "works on my machine" means "works in production."')),
  p(
    _('The way this is solved is by packaging the code together with everything it depends on — software libraries, configuration, operating system pieces — into a single portable bundle called a '),
    t('container', 'container'),
    _('. The container runs identically wherever you put it down: the developer runs the same container locally that production runs in the cloud. Containers are also an isolation mechanism — one application can’t interfere with another sharing the same machine, because each lives in its own sealed bundle.'),
  ),
  p(
    _('The dominant tool here is '), t('Docker', 'docker'),
    _(' — when an engineer says "we run on Docker," they mean the back-end is packaged as Docker containers. Cloud platforms like '),
    t('AWS', 'aws'), _(' and '), t('GCP', 'gcp'),
    _(' deploy containers directly. Higher-level hosting platforms like '),
    t('Vercel', 'vercel'), _(' and '), t('Netlify', 'netlify'),
    _(' wrap your code in their own runtime instead — you never touch a container yourself, but the same "it works the same everywhere" property applies.'),
  ),
]

/* --------------------------- Slide 2 — Three places the code lives --------------------------- */

const environments: Block[] = [
  p(_('We have a way to package code so it runs the same everywhere. Now: where does it run?')),
  p(_('The answer is "in several different places, on purpose." You don’t want code going straight from a developer’s laptop to your real users. Even with tests and review, things slip through — a bug only visible with real data, a configuration that’s right locally but wrong at scale, an interaction with another service nobody anticipated. You need a place to catch those before users do.')),
  p(_('Most products run in three environments, each serving a specific purpose:')),
  ul(
    [t('dev', 'dev-environment'), _(' — The developer’s own laptop, or a personal cloud sandbox. Fake data. Frequent breakage is fine, because no real user is on it. This is where the engineer writes and tries the code.')],
    [t('staging', 'staging-environment'), _(' — A copy of the production setup, but pointed at fake or anonymized data. Same servers, same configuration, same shape — except no real users. New code goes here first, so the team can poke at it, run end-to-end tests, and catch problems that only show up "in something that looks like prod."')],
    [t('production', 'production-environment'), _(' — The real thing. Real users, real data, real consequences. Code only reaches here after passing through dev and staging, with reviewers signing off along the way.')],
  ),
  p(_('Some teams add more environments (a "preview" environment per pull request, a "QA" environment for the test team, a "performance" environment for load tests), but the core idea stays the same: the closer to real users, the higher the bar to ship there.')),
  p(_('Now we have somewhere safe to put new code. The next question is how to actually swap it in for the old code without users noticing.')),
]

/* --------------------------- Slide 3 — Updating without going down --------------------------- */

const noDowntime: Block[] = [
  p(_('We have new code in staging that’s been verified, and we’re ready to put it into production. The naive way: stop the production servers, swap in the new code, start them back up.')),
  p(_('That works — for about two seconds, and only if no users are on the site. Anything more than a tiny site will have users mid-request when you stop the servers, and they’ll see errors. If the new code turns out to be broken, you’ve already taken everyone offline. And if you do this every time you ship, you can’t ship often, because every release is a visible interruption.')),
  p(_('What needs to happen: roll the new code out in a way where the old version keeps serving users until the new one is ready, with a way to undo instantly if something’s wrong.')),
  p(_('There are three common patterns, in increasing sophistication:')),
  ul(
    [t('blue/green', 'blue-green-deployment'), _(' — You run two complete production environments side by side. "Blue" is what users are currently hitting. You deploy the new code to "green," let it warm up, run final checks. Then you flip a switch (in the load balancer) so all new traffic goes to green. Blue stays running, untouched. If green turns out to be broken, you flip the switch back to blue — instant rollback, no scrambling. Once you’re confident green is good, blue becomes the staging area for the next release.')],
    [t('canary', 'canary-release'), _(' — You deploy the new code to a small slice of your servers (or a small percentage of users — say 1%, then 5%, then 25%). You watch error rates and performance. If something’s wrong, only that small slice was affected. If everything looks healthy, you gradually expand until 100% of traffic is on the new version. Named after canaries in coal mines: the small slice is the early warning.')],
    [t('rolling deployment', 'rolling-deployment'), _(' — Update the servers one at a time. While server 1 is being replaced, servers 2 through 10 are still serving traffic. When server 1 comes back healthy, server 2 is taken offline for its turn, and so on. Slower than blue/green, simpler to operate, and uses no extra hardware.')],
  ),
  p(_('All three patterns rely on the load balancer from Chapter 6 — that’s the piece that decides who sees the old version vs. the new version. Releasing a new version of your code is structurally the same problem as routing traffic across many servers; you’re just routing across many *versions* now too.')),
]

/* --------------------------- Slide 4 — How you find out it broke --------------------------- */

const observability: Block[] = [
  p(_('We have new code running in production, served to real users with no downtime. Eventually — guaranteed — something will go wrong. A bug nobody caught. A spike in traffic. A third-party service that goes down. The question is how you find out, and how fast.')),
  p(_('You can’t log into each server one by one and watch what’s happening, because there are dozens of servers handling thousands of requests per second. You need the system to *tell you* what’s going on, in a form you can actually read after the fact.')),
  p(_('Three different things help you do this, and they answer different questions:')),
  ul(
    [t('Logs', 'logs'), _(' — A timestamped record of what the program did. Every time the code runs an interesting line ("user logged in", "payment failed", "request took 4 seconds"), it writes a line to the log. When something goes wrong at 3 a.m., logs are how you go back and reconstruct what happened. Logs answer: "what did the program do, in order?"')],
    [t('Metrics', 'metrics'), _(' — Numbers tracked over time. Requests per second, average response time, percentage of requests that returned an error, memory used. You watch dashboards of these, and set alerts so you’re paged when something crosses a threshold (e.g. error rate above 1%). Metrics answer: "is the system healthy right now, and how is it trending?"')],
    [t('Errors', 'errors'), _(' — When the code crashes, you don’t want to find out by reading 100,000 log lines. Error tracking tools capture each crash, group similar ones together, and show you which crashes are happening most often, with the line of code where they originated. Errors answer: "what specifically is broken, and how often?"')],
  ),
  p(
    _('The common tools: '), t('Sentry', 'sentry'), _(' for error tracking; '), t('Datadog', 'datadog'),
    _(' (and similar platforms like New Relic, Honeycomb) for metrics, dashboards, and log aggregation. Smaller teams often start with the cloud provider’s built-in logging (AWS CloudWatch, GCP Cloud Logging) and add tools as they grow.'),
  ),
  p(_('Without these, you discover problems when users tweet about them. With these, you discover problems before users notice — and you have the evidence to fix them.')),
]

/* --------------------------- Chapter 8 export --------------------------- */

export const chapter08: Chapter = {
  id: 'ch8',
  number: 8,
  title: 'Deployment & Operations',
  subtitle: 'Changing a running system without breaking it',
  slides: [
    { id: 's1', level: 101, headline: 'It works on my machine', body: { kind: 'prose', blocks: containers }, diagramFocus: 'app' },
    { id: 's2', level: 101, headline: 'Three places the code lives', body: { kind: 'prose', blocks: environments }, diagramFocus: 'full' },
    { id: 's3', level: 101, headline: 'Updating without going down', body: { kind: 'prose', blocks: noDowntime }, diagramFocus: 'app' },
    { id: 's4', level: 101, headline: 'How you find out it broke', body: { kind: 'prose', blocks: observability }, diagramFocus: 'full' },
    {
      id: 's5',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Containers package code with all of its dependencies, so it runs the same on a laptop as it does in production',
          'Code travels through dev → staging → production; the closer to real users, the higher the bar to ship',
          'Blue/green, canary, and rolling deployments all let you swap in new code without taking the site down',
          'Logs (what happened), metrics (how the system is trending), and errors (what crashed) are how you find out something\'s wrong before users do',
        ],
        whereInSystem: [
          _('Containers wrap the front-end and back-end servers from earlier chapters; the deployment patterns rely on the '),
          t('load balancer', 'load-balancer'),
          _(' to route traffic across versions; logs and metrics flow out of every server in the system to a separate observability tool.'),
        ],
        bridge: [
          _('Notice the pattern: containers are isolation applied to environments. CI gates from the last chapter are validation (Chapter 4) for code. Blue/green is load balancing (Chapter 6) applied to versions. Same concepts, different layer. Coming up — Chapter 9: Putting It Together. We now have the whole system in front of us. Next we walk real request scenarios end-to-end through it: the happy path, the auth failure, the validation rejection — to see how every layer cooperates on one actual user action.'),
        ],
        prompts: [
          'How does code get deployed in this repo? Show me the CI/CD config and walk me through what happens between merging to main and the change being live.',
          'If I add a new column to a database table, what\'s the safe deployment order so old code doesn\'t crash during the rollout?',
        ],
      },
    },
  ],
}
