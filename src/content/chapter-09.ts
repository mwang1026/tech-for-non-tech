import type { Chapter, Block } from './types'
import { _, t, p, ul } from './authoring'

/* ============================================================================
 * Chapter 9 — From Merged to Running (101)
 *
 * Picks up the orange-sun change at the exact moment Chapter 8 left it: merged
 * into `main` on GitHub, CI green, no real user has seen it yet. Walks the
 * change through build, container packaging, environments, deploy strategies,
 * observability, and rollback.
 *
 * Slide arc:
 *   1.  The gap between merged and live    (why users still see yellow)
 *   2.  Build — source text → runnable artifact
 *   3.  Containers — the portable bundle
 *   4.  The registry — where built images live
 *   5.  Three environments, one artifact   (dev / staging / production)
 *   6.  Deploy — replacing the running version (the naive way breaks)
 *   7.  Without downtime — rolling, blue/green, canary
 *   8.  Observability — how you find out it broke
 *   9.  Rollback — when orange was wrong
 *   10. Recap
 *
 * The diagram (Chapter9DiagramSvg.tsx) switches between two scenes:
 *   - 'gap' for slide 1 (the question-mark visual)
 *   - 'pipeline' for slides 2–10 (the full pipeline accreting)
 * ============================================================================ */

/* --------------------------- Slide 1 — The gap --------------------------- */

const theGap: Block[] = [
  p(_('Coming out of Chapter 8, the orange-sun PR has merged into `main`. CI was green, the reviewer approved, the merge button worked. From the developer\'s perspective, the work is done.')),
  p(_('A user opens the homepage. The sun is still yellow. Why?')),
  p(_('Production servers don\'t run code from GitHub directly. They never run `git pull` against `main`. They run a packaged, ready-to-execute version that has to be built from `main`, copied to where the servers can pull it, and rolled out across the fleet — without breaking the live system for users in the middle of a session. Until that whole pipeline finishes, every visitor sees yellow.')),
  p(_('This chapter is the journey from "merged into `main`" to "users see orange," plus what to do when orange turns out to be wrong. Same change, same artifact, all the way through.')),
]

/* --------------------------- Slide 2 — Build --------------------------- */

const build: Block[] = [
  p(_('The text in `main` isn\'t directly runnable on a server. Even for languages without a separate compile step, dependencies have to be installed, files have to be assembled, and the result has to be packaged into something the server can be handed.')),
  p(
    _('That whole packaging step is the '),
    t('build', 'build-step'),
    _(', and it produces a build artifact — the thing that gets shipped. What the artifact looks like depends on the language and the platform:'),
  ),
  ul(
    [_('**JavaScript / TypeScript** — files are bundled and minified into a smaller set of JS files, plus assets, that the browser can load and that '), t('Node.js', 'nodejs'), _(' can run on the server.')],
    [_('**Go, Rust** — the compiler produces a single executable binary. That binary is the artifact.')],
    [_('**Python, Ruby** — there isn\'t a true compile step, but dependencies are installed and the project is packaged together so a server can run it without reaching out to the internet.')],
  ),
  p(_('For the orange-sun change: the build runs from `main`, produces a fresh artifact containing the new `Hero.tsx` with "orange" in it, and (almost always) wraps that artifact inside a container — the next slide.')),
  p(_('Build runs on a fresh machine, the same way CI does. The output is supposed to be reproducible: the same commit on `main` should produce the same artifact every time. That property is what lets the artifact be trusted as a faithful representation of the source.')),
]

/* --------------------------- Slide 3 — Containers --------------------------- */

const containers: Block[] = [
  p(_('A bug that ships every team eventually: the code runs on a developer\'s laptop, gets uploaded to a server, and crashes. The server\'s Linux is a slightly different version. The Node runtime is 20.3 instead of 20.5. A library installed locally isn\'t there. The phrase for this is "works on my machine," and it has been the most reliable cause of bad deploys for as long as software has been deployed.')),
  p(
    _('The fix is a '),
    t('container', 'container'),
    _(' — the source code packaged together with its language runtime, libraries, configuration, and the OS-level pieces it needs, all in one sealed bundle that runs identically on any machine. The developer runs the same container locally that production runs in the cloud. If it works on the laptop, it works in production, because they\'re running the literal same package.'),
  ),
  p(
    _('The dominant tool for building and running containers is '),
    t('Docker', 'docker'),
    _('. When an engineer says "we run on Docker," they mean the back-end is packaged as Docker containers. Each container has a name and a tag — typically `myapp:42a1f2`, where the tag is the short hash of the commit it was built from. That tag is the breadcrumb back to the exact PR.'),
  ),
  p(_('Containers are also an isolation mechanism: one application can\'t read or interfere with another sharing the same machine, because each lives in its own sealed bundle. Useful for security and for running many services on shared infrastructure without them stepping on each other.')),
  p(_('For the orange-sun change: the build produces a container image tagged `myapp:42a1f2` (or whatever the merged commit hash is). That image is the artifact that travels through the rest of the pipeline.')),
]

/* --------------------------- Slide 4 — Registry --------------------------- */

const registry: Block[] = [
  p(_('The container image lives somewhere production servers can pull it from. That somewhere is a container registry.')),
  p(
    _('A '),
    t('container registry', 'container-registry'),
    _(' is a storage service whose only job is to hold built container images, indexed by name and tag. Engineers push images up; servers pull them down. Common ones:'),
  ),
  ul(
    [t('GitHub Container Registry (GHCR)', 'ghcr'), _(' — registries hosted by GitHub, so a team\'s code, PRs, CI, and images live in one place.')],
    [t('Docker Hub', 'docker-hub'), _(' — the original public registry; widely used for open-source images that anyone can pull.')],
    [t('Amazon ECR', 'ecr'), _(' (Elastic Container Registry) and '), t('Google Artifact Registry', 'gar'), _(' — registries run by AWS and GCP for teams that already host on those clouds.')],
  ),
  p(_('After the build step finishes, the new image is **published** — uploaded to the registry. The registry now holds an entry like `myapp:42a1f2`. Any server that knows the registry address and has permission can pull that exact image down. Same image, byte-for-byte, every environment.')),
  p(_('The reason this is its own step (instead of "build and deploy in one motion") is that the same image is going to be deployed to several places — dev, staging, production — at different moments. Storing it in a central place is what makes that fan-out cheap and predictable.')),
]

/* --------------------------- Slide 5 — Environments --------------------------- */

const environments: Block[] = [
  p(_('The built image isn\'t shipped straight to real users. Most teams run the same image in three places, in increasing levels of "real."')),
  ul(
    [t('dev', 'dev-environment'), _(' — a personal sandbox or a shared playground. Fake data, frequent breakage is fine, no real user is on it. New code lands here as soon as a branch is pushed, sometimes earlier.')],
    [t('staging', 'staging-environment'), _(' — a copy of the production setup, pointed at fake or anonymized data. Same servers, same configuration shape, same load balancer, same database engine — except no real users. Code reaches staging after passing CI and merging to `main`. The team can poke at it, run end-to-end tests, and catch problems that only show up "in something that looks like prod."')],
    [t('production (prod)', 'production-environment'), _(' — the real thing. Real users, real data, real consequences. Code only reaches here after staging looks healthy.')],
  ),
  p(_('The same container image runs in all three. What differs is configuration injected at startup — database connection strings, API keys, feature flags, environment-specific settings. The code is identical, byte-for-byte; only what it talks to is different.')),
  p(_('Some teams add more environments — a per-PR "preview" environment that builds an isolated copy of the app for the reviewer to click through, a "QA" environment for the test team, a "performance" environment for load tests. The principle stays the same: the closer to real users, the higher the bar to ship there.')),
]

/* --------------------------- Slide 6 — Deploy (the naive way) --------------------------- */

const deployNaive: Block[] = [
  p(
    _('Production is currently running the old version of the app — call it v1, with the yellow sun. The new version, v2 with the orange sun, is sitting in the registry waiting. To '),
    t('deploy', 'deploy'),
    _(' is to replace what production is running with v2.'),
  ),
  p(_('The naive way: stop the production servers, swap the image, start them back up. This works — for about two seconds, and only if no users are mid-request.')),
  p(_('What breaks:')),
  ul(
    [_('**Users mid-request see errors.** Anything more than a tiny site has people in the middle of clicking, scrolling, or submitting at any moment. When the servers stop, those requests fail. Users see error pages, abandoned carts, broken submissions.')],
    [_('**The site is briefly down.** Even a few seconds of downtime is visible. For a high-traffic product it costs real revenue and trust.')],
    [_('**Rollback is slow.** If v2 turns out to be broken, undoing the deploy means another stop-swap-restart cycle — another window of downtime, on top of the bad version users already saw.')],
    [_('**Shipping becomes rare.** If every deploy is a visible interruption, the team ships less often. Less often means bigger changes per deploy, which means more risk, which means even less often. The cycle compounds.')],
  ),
  p(_('What we actually want: roll v2 out so v1 keeps serving users until v2 is healthy, with a way to undo instantly if something goes wrong. The next slide covers the three patterns that do this.')),
]

/* --------------------------- Slide 7 — Without downtime --------------------------- */

const noDowntime: Block[] = [
  p(_('Three patterns in increasing sophistication. All three rely on the load balancer from chapter 5 — that\'s the piece that decides which server (and now, which version) any given request hits.')),
  ul(
    [t('Rolling deployment', 'rolling-deployment'), _(' — update servers one at a time. While server 1 is being replaced with v2, servers 2 through N are still on v1, still serving traffic. When server 1 comes back healthy on v2, server 2 takes its turn, and so on. Slowest of the three; simplest to operate; uses no extra hardware.')],
    [t('Blue/green deployment', 'blue-green-deployment'), _(' — run two complete production environments side by side. "Blue" (v1) is what users currently hit. Deploy v2 to "green," let it warm up, run final checks. Then flip the load balancer so all new traffic goes to green. Blue stays running, untouched. If green turns out to be broken, flip the switch back — instant rollback. Costs twice the hardware while both are up; pays for itself when a deploy goes wrong.')],
    [t('Canary release', 'canary-release'), _(' — deploy v2 to a small slice of traffic first. Start at 5%, then 25%, then 50%, then 100%. While the rollout is at 5%, 95% of users are still on v1; only the small slice is on v2. Watch error rates and latency on the canary. If something\'s wrong, only that small slice was affected. If it looks healthy, gradually expand. Named after canaries in coal mines: the small slice is the early warning.')],
  ),
  p(_('For the orange-sun change: the team runs canary. The deploy controller routes 5% of homepage traffic to v2. The diagram shows that state — most users still on yellow, 5% on orange, the load balancer doing the splitting. Watch the dashboards. Expand if quiet. Roll back if not.')),
]

/* --------------------------- Slide 8 — Observability --------------------------- */

const observability: Block[] = [
  p(_('v2 is rolling out to real users with no downtime. Eventually — guaranteed — something will go wrong. A bug nobody caught. A traffic spike. A third-party service that goes down. A configuration that\'s right locally but wrong at scale. The question isn\'t whether something will break, but how quickly the team finds out and how much information they have when they do.')),
  p(_('Logging into each server one by one to watch what\'s happening is hopeless when there are dozens of servers handling thousands of requests per second. The system has to tell the team what\'s going on, in a form a human can actually read. Three different signals — answering different questions:')),
  ul(
    [t('Logs', 'logs'), _(' — a timestamped record of what the program did, line by line. Every time interesting code runs ("user logged in," "payment failed," "request took 4.2 seconds"), a log line gets written. Logs answer: *what did the program do, in order?*')],
    [t('Metrics', 'metrics'), _(' — numbers tracked over time. Requests per second, average response time, error rate, memory used, CPU. The team watches dashboards of these and sets alerts so they\'re paged when a metric crosses a threshold (error rate above 1%, latency above 500ms). Metrics answer: *is the system healthy right now, and how is it trending?*')],
    [t('Errors', 'errors'), _(' — when code crashes, an error tracker captures the crash with the exact line of code that caused it and groups similar crashes together so the team isn\'t drowning in 100,000 individual reports. Errors answer: *what specifically is broken, and how often?*')],
  ),
  p(
    _('Common tools: '),
    t('Sentry', 'sentry'), _(' for errors; '),
    t('Datadog', 'datadog'), _(' (and similar platforms like New Relic and Honeycomb) for metrics, dashboards, and log aggregation. Smaller teams often start with the cloud provider\'s built-in logging — '),
    t('AWS CloudWatch', 'cloudwatch'), _(' on AWS, '),
    t('GCP Cloud Logging', 'cloud-logging'), _(' on GCP — and add specialized tools as they grow.'),
  ),
  p(_('On the diagram, all three signals flow *out* of production — the arrows reverse direction relative to the deploy pipeline. Without these, the team finds out about problems when users tweet about them. With these, the team usually finds out before users do, and has the evidence to fix what actually broke.')),
]

/* --------------------------- Slide 9 — Rollback --------------------------- */

const rollback: Block[] = [
  p(_('The orange canary has been at 5% for ten minutes. Sentry shows a sharp uptick in homepage errors among users on v2. A metric dashboard shows the bounce rate on the homepage spiking. Investigation: orange has poor contrast against the headline gradient and triggered an accessibility check that\'s now firing on every render.')),
  p(
    _('The team needs to '),
    t('rollback', 'rollback'),
    _(' — go back to the previous version, fast. The mechanism depends on which deploy strategy is in play:'),
  ),
  ul(
    [_('**Canary** — stop expanding the rollout, route the 5% on v2 back to v1. Done in seconds. The bad version was only ever seen by a small slice of users.')],
    [_('**Blue/green** — flip the load balancer back to blue. Instant. The previous environment was untouched the whole time.')],
    [_('**Rolling** — redeploy the previous image across the fleet, server by server. Slower than the other two, because each server still has to swap.')],
  ),
  p(_('The reason every artifact gets kept around — the merged commit, the previous container image, the previously running version — is that any of them might be the one to go back to in a hurry. Container registries hold many tags at once for exactly this reason.')),
  p(
    _('There\'s also a slower, permanent path: open a '),
    t('revert', 'revert'),
    _(' PR that undoes the orange commit on `main`, push it through CI, ship the revert through the same pipeline. This is what gets done when the bad change has been live long enough that just routing traffic away isn\'t enough — the team wants the orange commit out of the canonical history of `main` until it can be re-done correctly.'),
  ),
  p(_('When orange is fixed (better contrast, accessibility check passing, new tests added) the same pipeline runs again — new commit, new PR, new CI run, new build, new image, new canary, new observation. The whole journey from chapter 8 slide 1 happens again, with the lessons from the first attempt baked in.')),
]

/* --------------------------- Chapter 9 export --------------------------- */

export const chapter09: Chapter = {
  id: 'ch9',
  number: 9,
  title: 'From Merged to Running',
  subtitle: 'How a merged change becomes the live experience — and what to do when it shouldn’t have',
  slides: [
    { id: 's1', level: 101, headline: 'The gap between merged and live', body: { kind: 'prose', blocks: theGap }, diagramFocus: 'gap' },
    { id: 's2', level: 101, headline: 'Build — source text into a runnable artifact', body: { kind: 'prose', blocks: build }, diagramFocus: 'pipeline' },
    { id: 's3', level: 101, headline: 'Containers — the portable bundle', body: { kind: 'prose', blocks: containers }, diagramFocus: 'pipeline' },
    { id: 's4', level: 101, headline: 'The registry — where built images live', body: { kind: 'prose', blocks: registry }, diagramFocus: 'registry' },
    { id: 's5', level: 101, headline: 'Three environments, one artifact', body: { kind: 'prose', blocks: environments }, diagramFocus: 'environments' },
    { id: 's6', level: 101, headline: 'Deploy — replacing the running version', body: { kind: 'prose', blocks: deployNaive }, diagramFocus: 'production' },
    { id: 's7', level: 101, headline: 'Updating without going down', body: { kind: 'prose', blocks: noDowntime }, diagramFocus: 'production' },
    { id: 's8', level: 101, headline: 'Observability — how you find out it broke', body: { kind: 'prose', blocks: observability }, diagramFocus: 'observability' },
    { id: 's9', level: 101, headline: 'Rollback — when orange was wrong', body: { kind: 'prose', blocks: rollback }, diagramFocus: 'production' },
    {
      id: 's10',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'A merged commit on `main` is not what users see; production runs a built artifact, not source from GitHub directly',
          'Build packages source into a runnable artifact, almost always wrapped in a container so it runs identically anywhere',
          'A container registry holds built images by tag (often the commit hash); production servers pull from the registry',
          'The same image flows through dev → staging → production; configuration is what differs at startup',
          'Rolling, blue/green, and canary deployments swap new versions in without downtime — all three rely on the load balancer from Ch 5',
          'Logs, metrics, and errors flow out of production into Sentry / Datadog / cloud-provider tools — that\'s how the team finds out something broke before users tweet about it',
          'Rollback is fast on canary or blue/green, slower on rolling; a revert PR undoes the change permanently when traffic-routing alone isn\'t enough',
        ],
        whereInSystem: [
          _('The deploy pipeline lives upstream of the running system: '),
          t('container registry', 'container-registry'),
          _(' holds built images, the deploy controller pulls them, and they run on the front-end and back-end servers from earlier chapters. Logs and metrics flow back out to '),
          t('Sentry', 'sentry'), _(' for errors and '), t('Datadog', 'datadog'),
          _(' (or equivalents) for everything else. Rollback uses the same routing layer the rollout used.'),
        ],
        bridge: [
          _('Acts I and II are done. The orange-sun change is now visible end-to-end: from the line of text in `Hero.tsx`, through git, review, CI, build, container, registry, environments, deploy, observation, and rollback. Chapter 10 is the payoff — directing an AI coding agent against a real codebase using the literacy from these nine chapters.'),
        ],
      },
    },
  ],
}
