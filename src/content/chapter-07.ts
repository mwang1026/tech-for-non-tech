import type { Chapter, Block, BodyNode, Inline } from './types'

/* --------------------------- Authoring helpers --------------------------- */
const _ = (text: string): BodyNode => ({ kind: 'text', text })
const t = (text: string, glossaryId: string): BodyNode => ({ kind: 'term', text, glossaryId })
const p = (...nodes: BodyNode[]): Block => ({ kind: 'p', nodes })
const ul = (...items: Inline[]): Block => ({ kind: 'ul', items })

/* ============================================================================
 * Chapter 7 — Code Lifecycle (101)
 *
 * No new diagram boxes at 101 — code lifecycle is process, not architecture.
 *
 * Slide arc:
 *   1. Why "save the file" isn't enough
 *   2. Git: a record of every change
 *   3. Pull requests — proposing a change
 *   4. Tests + CI — verifying behavior automatically
 *   5. Recap (with prompts)
 * ============================================================================ */

/* --------------------------- Slide 1 — Save isn't enough --------------------------- */

const saveNotEnough: Block[] = [
  p(_('Coming out of Chapter 6, we have a system that runs in production — many servers, a CDN, a load balancer, a database. The next question: how does the code that runs on those servers get there in the first place?')),
  p(_('Imagine for a moment a team of ten engineers, all editing the same codebase by just saving files to a shared folder. The problems start immediately:')),
  ul(
    [_('Two engineers edit the same file at the same time. One save overwrites the other. Hours of work, gone.')],
    [_('Something breaks in production. You ask "when did this break?" — and there’s no record. No history. Just the current state of the files.')],
    [_('You want to try a risky change without affecting anyone else. There’s no way to do that without making your own copy of the whole codebase.')],
    [_('You want to roll back to last Tuesday’s working version. There’s no last Tuesday — only now.')],
  ),
  p(_('What needs to happen: a system that records *every* change anyone ever made, lets people work on different versions in parallel, and gives you a way to bring those versions back together (or revert them) safely.')),
  p(_('That system is called version control, and the version that essentially every team uses is git.')),
]

/* --------------------------- Slide 2 — Git basics --------------------------- */

const gitBasics: Block[] = [
  p(
    t('Git', 'git'),
    _(' is a system that tracks every change anyone makes to the code, with full history. It lives in your project folder and treats the whole codebase as a sequence of snapshots over time.'),
  ),
  p(_('Three ideas do most of the work:')),
  ul(
    [t('Commit', 'commit'), _(' — A snapshot of the code at a moment in time, with a message explaining what changed and why. Every commit has an author, a timestamp, and a unique ID. You can travel back to any commit. "I broke X yesterday afternoon" → find the commit that broke it, look at exactly what changed.')],
    [t('Branch', 'branch'), _(' — A parallel timeline of commits. The main timeline is usually called `main` (or sometimes `master`). When you want to work on a feature without disturbing the main timeline, you create a branch off of it, make commits there, and the main branch stays untouched. Other people can be working on their own branches at the same time.')],
    [t('Merge', 'merge'), _(' — Bringing changes from one branch back into another. When your feature branch is ready, you merge it into main, and main now contains your work plus everyone else’s. Sometimes git can do this automatically; sometimes it can’t.')],
  ),
  p(
    _('When git can’t merge automatically, it’s because two branches changed the same lines of the same file. Git doesn’t know which version should win, so it asks a human. This is called a '),
    t('merge conflict', 'merge-conflict'),
    _('. The person merging looks at both versions, picks (or combines) the right answer, and saves the resolution. Common, not scary, just tedious.'),
  ),
  p(_('Most teams host their git repositories on '), t('GitHub', 'github'), _(' or '), t('GitLab', 'gitlab'), _(' — services that store the code and add review and collaboration features on top. Which is the next slide.')),
]

/* --------------------------- Slide 3 — Pull requests --------------------------- */

const pullRequests: Block[] = [
  p(_('Imagine you’ve made a branch, written some code, and you think it’s ready. You don’t just merge it into main yourself. You open a pull request.')),
  p(
    _('A '),
    t('pull request', 'pull-request'),
    _(' (often shortened to "PR" — or "MR" for "merge request" on GitLab) is a *proposal* to merge your branch into main. It’s where the team reviews the change before it actually happens. The PR shows the '),
    t('diff', 'diff'),
    _(' — the exact lines added, removed, and changed — alongside discussion threads where reviewers can comment on specific lines.'),
  ),
  p(_('What a pull request does:')),
  ul(
    [_('Makes the change visible. Other engineers see what you’re proposing and can comment, ask questions, or request changes before anything ships.')],
    [_('Forces a review. Most teams require at least one approval from another engineer before a PR can be merged.')],
    [_('Triggers automated checks. The moment you open the PR, automated tests start running against your branch. If they fail, the PR is blocked from merging until you fix them. (More on this next slide.)')],
    [_('Creates a record. The PR’s description, the discussion, and the list of commits become permanent history. Six months from now, when someone asks "why did we do this?", the PR is the answer.')],
  ),
  p(_('When you direct an AI agent to make a change, the agent doesn’t commit directly to main. It (and you) work on a branch; the work becomes a PR; the PR gets reviewed; the PR gets merged. Reading the diff in the PR is your last chance to catch mistakes before they ship — never skip it.')),
]

/* --------------------------- Slide 4 — Tests and CI --------------------------- */

const testsAndCI: Block[] = [
  p(_('When you open a pull request, you usually want to know one thing right away: did your change break anything? Doing that by hand — clicking through the entire app to make sure nothing’s broken — is impossibly slow. So we automate it.')),
  p(
    t('Tests', 'tests'),
    _(' are little programs that exercise the real code and check that it does what it’s supposed to. The simplest kind tests one function in isolation: "given this input, did we get the right output?" Bigger tests stand up parts of the system together and check that they cooperate. The biggest tests drive a fake browser through the full app to make sure the user-visible flow still works.'),
  ),
  p(
    _('When a pull request opens, an automation called '),
    t('CI', 'ci'),
    _(' (Continuous Integration) runs the entire test suite against your branch automatically. If every test passes, your PR shows up '),
    t('green', 'green-build'),
    _(' — ready for review and merge. If anything fails, your PR shows up '),
    t('red', 'red-build'),
    _(' — blocked from merging until you fix it. The team’s rule is usually simple: red PRs do not get merged.'),
  ),
  p(
    _('CI usually also runs other automated checks alongside tests: linting (style consistency), type checking (catching obvious mismatches like "expected a number, got text"), and sometimes security scans. All of them have to pass. Common CI services: '),
    t('GitHub Actions', 'github-actions'),
    _(' (built into GitHub), '),
    t('CircleCI', 'circleci'),
    _(', '),
    t('GitLab CI', 'gitlab-ci'),
    _(', '),
    t('Buildkite', 'buildkite'),
    _('.'),
  ),
]

/* --------------------------- Chapter 7 export --------------------------- */

export const chapter07: Chapter = {
  id: 'ch7',
  number: 7,
  title: 'Code Lifecycle',
  subtitle: 'How code becomes the running system',
  slides: [
    { id: 's1', level: 101, headline: 'Save isn’t enough', body: { kind: 'prose', blocks: saveNotEnough }, diagramFocus: 'full' },
    { id: 's2', level: 101, headline: 'Git — a record of every change', body: { kind: 'prose', blocks: gitBasics }, diagramFocus: 'full' },
    { id: 's3', level: 101, headline: 'Pull requests — proposing a change', body: { kind: 'prose', blocks: pullRequests }, diagramFocus: 'full' },
    { id: 's4', level: 101, headline: 'Tests and CI — verifying behavior automatically', body: { kind: 'prose', blocks: testsAndCI }, diagramFocus: 'full' },
    {
      id: 's5',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Git tracks every change to the code with full history; commits are snapshots, branches are parallel timelines, merges combine them',
          'Pull requests are proposals to merge — where reviewers see the diff, comment, and approve before anything ships',
          'CI runs the test suite automatically on every PR; green means tests passed and the PR can merge, red means blocked',
          'Reading the diff before a PR merges is your last chance to catch mistakes — especially important when the code came from an AI agent',
        ],
        whereInSystem: [
          _('Code lifecycle happens *upstream* of the running system: developers write code on their machines, commit to git, open pull requests on '),
          t('GitHub', 'github'),
          _(' or '),
          t('GitLab', 'gitlab'),
          _(', and pass through CI before the new version ever reaches the production servers we drew in earlier chapters.'),
        ],
        bridge: [
          _('Coming up — Chapter 8: Deployment & Operations. Once a pull request passes CI and gets merged into main, the code still has to actually reach production safely — without breaking the live system for users in the middle of a session.'),
        ],
        prompts: [
          'What tests does this codebase have? Where do they live, and how do I run them locally before opening a PR?',
          'Walk me through what happens between a developer pushing code to a PR and that code being live for users — every step, every check, every gate.',
        ],
      },
    },
  ],
}
