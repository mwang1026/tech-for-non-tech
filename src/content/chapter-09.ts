import type { Chapter, Block } from './types'
import { _, t, p, ul } from './authoring'

/* ============================================================================
 * Chapter 9 — Deployment & Operations (101)
 *
 * Picks up where Ch 8 ends: a PR has merged to main, CI is green, the test
 * machine has shut down. The chapter walks the *pipeline* from there to running
 * code — what happens between "CI passed" and "users see the new version."
 *
 * Slide arc:
 *   1. From repo to running        (pipeline overview)
 *   2. Containers — the artifact   (what gets built and shipped)
 *   3. Three places the code lives (dev / staging / production)
 *   4. Updating without going down (blue/green, canary, rolling)
 *   5. How you find out it broke   (logs, metrics, errors)
 *   6. Recap (with prompts)
 * ============================================================================ */

/* --------------------------- Slide 1 — From repo to running --------------------------- */

const fromRepoToRunning: Block[] = [
  p(_('Coming out of Chapter 8, your change is merged to `main` and CI is green. The test machine has done its job and shut itself down. From the engineer\'s perspective, the work is done. From the system\'s perspective, nothing has actually changed yet — the new code still has to *get to the production servers* and *replace what\'s currently running there* without anyone noticing.')),
  p(_('That journey, end to end, is the deploy pipeline. Three things happen, in order:')),
  ul(
    [_('**Build** — A copy of the new `main` code is packaged into an artifact, ready to ship. (Most teams use containers; we cover those next slide.)')],
    [_('**Publish** — The artifact is pushed to a '), t('container registry', 'container-registry'), _(' — a storage service whose only job is to hold built images, ready for pickup.')],
    [_('**Deploy** — A separate piece of software pulls the latest image and replaces the running version on each production server.')],
  ),
  p(_('You can see the whole shape on the diagram: `main` (with its CI green check from Chapter 8) feeds into the registry, the registry feeds into a deploy controller, and the controller fans out to three places — dev, staging, and production.')),
  p(_('Two points worth flagging up front. First, this is one *example* shape; teams use different stacks (Vercel handles all of this for you; Kubernetes shops use ArgoCD or Flux; Heroku and Render hide it behind a single `git push`). The pieces in different positions, but the shape is recognizable. Second, the artifact moves; the source code doesn\'t. Production servers never run `git pull`. They run a container that was built somewhere else, then pulled to them.')),
]

/* --------------------------- Slide 2 — Containers --------------------------- */

const containers: Block[] = [
  p(_('Here\'s a problem you hit the first time you ship code anywhere. It runs perfectly on your laptop. You ship it to a server. It crashes. You investigate. The server is set up slightly differently than your laptop in some way that matters — a different version of a dependency, a missing config file, a Python that\'s 3.11 instead of 3.12, anything. The phrase for this is "it works on my machine," and it\'s the most common cause of bad deploys in software history.')),
  p(_('What we want: the code should run in an *identical environment* everywhere — laptop, test machine, staging, production — so "works on my machine" means "works in production."')),
  p(
    _('The way this is solved is by packaging the code together with everything it depends on — software libraries, configuration, even the operating system pieces — into a single portable bundle called a '),
    t('container', 'container'),
    _('. The container runs identically wherever you put it: the developer runs the same container locally that production runs in the cloud. Containers are also an isolation mechanism — one application can\'t interfere with another sharing the same machine, because each lives in its own sealed bundle.'),
  ),
  p(
    _('The dominant tool here is '), t('Docker', 'docker'),
    _('. When an engineer says "we run on Docker," they mean the back-end is packaged as Docker containers. The container has a name and a tag (`your-app:42a1f2`); the tag is usually the git commit it was built from, so you can always trace a running container back to a specific commit and a specific PR.'),
  ),
  p(
    _('That image goes into a '), t('container registry', 'container-registry'),
    _(' — '), t('GitHub Container Registry (GHCR)', 'ghcr'), _(', '), t('Docker Hub', 'docker-hub'), _(', or one your cloud provider runs ('),
    t('Amazon ECR', 'ecr'), _(', '), t('Google Artifact Registry', 'gar'), _('). The deploy controller pulls from there. Same image, every environment.'),
  ),
  p(_('Higher-level platforms like '), t('Vercel', 'vercel'), _(' and '), t('Netlify', 'netlify'), _(' wrap your code in their own runtime instead of giving you raw containers — but the same "it works the same everywhere" property applies. You just don\'t have to think about it.')),
]

/* --------------------------- Slide 3 — Environments --------------------------- */

const environments: Block[] = [
  p(_('We have a way to package code so it runs the same everywhere. Now: where, exactly, does it run?')),
  p(_('The answer is "in several different places, on purpose." You don\'t want code going straight from CI to your real users. Even with tests and review, things slip through — a bug only visible with real data, a configuration that\'s right locally but wrong at scale, an interaction with another service nobody anticipated. You need a place to catch those before users do.')),
  p(_('Most products run in three environments, each serving a specific purpose:')),
  ul(
    [t('dev', 'dev-environment'), _(' — A personal sandbox or shared playground. Fake data. Frequent breakage is fine, because no real user is on it. New code goes here as soon as a branch is pushed.')],
    [t('staging', 'staging-environment'), _(' — A copy of the production setup, but pointed at fake or anonymized data. Same servers, same configuration, same shape — except no real users. Code lands here after passing CI on `main`, and the team can poke at it, run end-to-end tests, and catch problems that only show up "in something that looks like prod."')],
    [t('production', 'production-environment'), _(' — The real thing. Real users, real data, real consequences. Code only reaches here after staging looks healthy.')],
  ),
  p(_('Same container in all three places. What differs is the configuration injected at startup — database connection strings, API keys, feature flags. The code is identical; only what it talks to is different.')),
  p(_('Some teams add more environments — a "preview" environment per pull request, a "QA" environment for the test team, a "performance" environment for load tests — but the core idea stays the same: the closer to real users, the higher the bar to ship there.')),
  p(_('Now we have somewhere safe to put new code, and three rungs of "real" to climb. The next question is how to actually swap the new code in for the old code on production without users noticing.')),
]

/* --------------------------- Slide 4 — Updating without going down --------------------------- */

const noDowntime: Block[] = [
  p(_('Production is running v1. The deploy controller has v2 ready to go. The naive way: stop the production servers, swap in v2, start them back up.')),
  p(_('That works — for about two seconds, and only if no users are mid-request. Anything more than a tiny site will have users mid-request when you stop the servers, and they\'ll see errors. If v2 turns out to be broken, you\'ve already taken everyone offline. And if you do this every time you ship, you can\'t ship often, because every release is a visible interruption.')),
  p(_('What needs to happen: roll v2 out in a way where v1 keeps serving users until v2 is ready, with a way to undo instantly if something\'s wrong.')),
  p(_('Three common patterns, in increasing sophistication:')),
  ul(
    [t('blue/green', 'blue-green-deployment'), _(' — Run two complete production environments side by side. "Blue" (v1) is what users hit. Deploy v2 to "green," let it warm up, run final checks. Then flip a switch in the load balancer so all new traffic goes to green. Blue stays running, untouched. If green turns out to be broken, flip the switch back — instant rollback, no scrambling.')],
    [t('canary', 'canary-release'), _(' — Deploy v2 to a small slice of traffic (start at 5%, then 25%, then 50%, then 100%). The diagram shows this state: 95% of users are still on v1, 5% on v2 (canary). Watch error rates and response times. If something\'s wrong, only that small slice was affected. If it looks healthy, gradually expand. Named after canaries in coal mines: the small slice is the early warning.')],
    [t('rolling deployment', 'rolling-deployment'), _(' — Update servers one at a time. While server 1 is being replaced, servers 2 through N are still serving traffic. When server 1 comes back healthy, server 2 takes its turn, and so on. Slower than blue/green, simpler to operate, uses no extra hardware.')],
  ),
  p(_('All three patterns rely on the load balancer from Chapter 5 — that\'s the piece that decides who sees v1 vs. v2. Releasing a new version is structurally the same problem as routing traffic across many servers; you\'re just routing across many *versions* now too.')),
]

/* --------------------------- Slide 5 — How you find out it broke --------------------------- */

const observability: Block[] = [
  p(_('v2 is running in production, served to real users with no downtime. Eventually — guaranteed — something will go wrong. A bug nobody caught. A traffic spike. A third-party service that goes down. The question is how you find out, and how fast.')),
  p(_('You can\'t log into each server one by one and watch what\'s happening, because there are dozens of servers handling thousands of requests per second. You need the system to *tell you* what\'s going on, in a form you can actually read.')),
  p(_('Three different things help, and they answer different questions:')),
  ul(
    [t('Logs', 'logs'), _(' — A timestamped record of what the program did. Every time the code runs an interesting line ("user logged in", "payment failed", "request took 4 seconds"), it writes a line to the log. When something goes wrong at 3 a.m., logs are how you go back and reconstruct what happened. Logs answer: *what did the program do, in order?*')],
    [t('Metrics', 'metrics'), _(' — Numbers tracked over time. Requests per second, average response time, error rate, memory used. You watch dashboards of these and set alerts so you\'re paged when something crosses a threshold. Metrics answer: *is the system healthy right now, and how is it trending?*')],
    [t('Errors', 'errors'), _(' — When code crashes, you don\'t want to find out by reading 100,000 log lines. Error tracking groups crashes by signature and shows you the most common ones, with the line of code that caused them. Errors answer: *what specifically is broken, and how often?*')],
  ),
  p(
    _('The common tools: '), t('Sentry', 'sentry'), _(' for errors; '), t('Datadog', 'datadog'),
    _(' (and similar platforms like New Relic, Honeycomb) for metrics, dashboards, and log aggregation. Smaller teams often start with the cloud provider\'s built-in logging ('),
    t('AWS CloudWatch', 'cloudwatch'), _(', '), t('GCP Cloud Logging', 'cloud-logging'),
    _(') and add specialized tools as they grow.'),
  ),
  p(_('On the diagram, all three flow *out* of production — the arrows reverse direction relative to the pipeline. Deploy is what goes in; observability is what comes back. Without these, you discover problems when users tweet about them. With these, you discover them before users notice — and you have the evidence to fix them.')),
]

/* --------------------------- Chapter 9 export --------------------------- */

export const chapter09: Chapter = {
  id: 'ch9',
  number: 9,
  title: 'Deployment & Operations',
  subtitle: 'From a green PR to running in production',
  slides: [
    { id: 's1', level: 101, headline: 'From repo to running', body: { kind: 'prose', blocks: fromRepoToRunning }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Containers — the artifact', body: { kind: 'prose', blocks: containers }, diagramFocus: 'registry' },
    { id: 's3', level: 101, headline: 'Three places the code lives', body: { kind: 'prose', blocks: environments }, diagramFocus: 'environments' },
    { id: 's4', level: 101, headline: 'Updating without going down', body: { kind: 'prose', blocks: noDowntime }, diagramFocus: 'production' },
    { id: 's5', level: 101, headline: 'How you find out it broke', body: { kind: 'prose', blocks: observability }, diagramFocus: 'observability' },
    {
      id: 's6',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'A merged PR with green CI starts a pipeline: build a container, push to a registry, deploy controller pulls and rolls it out',
          'Containers package code with all of its dependencies, so it runs the same on a laptop as it does in production — same image, every environment',
          'Code travels through dev → staging → production; the closer to real users, the higher the bar to ship',
          'Blue/green, canary, and rolling deployments swap new versions in without downtime — all of them rely on the load balancer from Chapter 5',
          'Logs, metrics, and errors flow OUT of production — they\'re how you find out something broke before users do',
        ],
        whereInSystem: [
          _('The pipeline lives upstream of the running system: '),
          t('container registry', 'container-registry'),
          _(' holds built images, the deploy controller pulls them, and they run on the front-end and back-end servers we drew in Chapter 5. Logs and metrics flow back out to a separate observability lane — '),
          t('Sentry', 'sentry'),
          _(' for errors, '),
          t('Datadog', 'datadog'),
          _(' for everything else.'),
        ],
        bridge: [
          _('Coming up — Chapter 10: Working with Claude Code. Acts I and II are done. You have the full picture: how requests flow through the running system, and how the code that runs it gets there. The final chapter is the payoff — how to direct an AI coding agent against a real codebase using the literacy you\'ve built.'),
        ],
      },
    },
  ],
}
