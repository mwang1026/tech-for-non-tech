import type { Chapter, Block } from './types'
import { _, t, p, ul, code } from './authoring'

/* ============================================================================
 * Chapter 8 — Code Lifecycle (101)
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
  p(_('Act I done — coming out of Chapter 7, you have the full mental model of how a request flows through the running system. Act II is the orthogonal story: how the code that runs all this gets there in the first place. Starting with the very first problem: editing files.')),
  p(_('Imagine for a moment a team of ten engineers, all editing the same codebase by just saving files to a shared folder. The problems start immediately:')),
  ul(
    [_('Two engineers edit the same file at the same time. One save overwrites the other. Hours of work, gone.')],
    [_('Something breaks in production. You ask "when did this break?" — and there’s no record. No history. Just the current state of the files.')],
    [_('You want to try a risky change without affecting anyone else. There’s no way to do that without making your own copy of the whole codebase.')],
    [_('You want to roll back to last Tuesday’s working version. There’s no last Tuesday — only now.')],
  ),
  p(_('What needs to happen: a system that records *every* change anyone ever made, lets people work on different versions in parallel, and gives you a way to bring those versions back together (or revert them) safely.')),
  p(_('That system is called **version control**, and the version that essentially every team uses is git.')),
]

/* --------------------------- Slide 2 — Your local copy --------------------------- */

const localCopy: Block[] = [
  p(_('Before any of this works, the code has to live somewhere on your computer. The codebase itself sits on '), t('GitHub', 'github'), _(' (or GitLab); your job is to make a copy onto your laptop to work on. The command for that is '), t('git clone', 'git-clone'), _('.')),
  p(_('What you actually type, the very first time:')),
  code(`git clone https://github.com/your-org/your-repo.git
cd your-repo`),
  p(_('After this, you have a folder on your laptop that contains the project plus a hidden `.git` folder where git stores all the history. You never edit `.git` directly — git manages it.')),
  code(`~/code/your-repo/
  .git/           ← history lives here (don't touch)
  src/
  package.json
  README.md`),
  p(_('When you run `claude` inside that folder, this is the agent’s working surface. Every file edit lands here on disk; git records what changed.')),
  p(_('Two terms you’ll keep hearing:')),
  ul(
    [_('**Local** — the copy on your laptop. What you can edit and run.')],
    [_('**Remote** — the copy on GitHub. The shared source of truth that everyone else clones from.')],
  ),
  p(_('They sync via two commands: `git pull` brings down changes from the remote into your local copy; `git push` sends your local commits up to the remote. The next slide gets to commits, branches, and how those flow.')),
]

/* --------------------------- Slide 3 — Git basics --------------------------- */

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
    _('When git can’t merge automatically, it’s because two branches changed the same lines of the same file. For example: developer A changed line 42 to set `price = 10`, and developer B changed the same line to set `price = 15`. Git can’t pick a winner, so it asks a human. This is called a '),
    t('merge conflict', 'merge-conflict'),
    _('. The person merging looks at both versions, picks (or combines) the right answer, and saves the resolution. Common, not scary, just tedious.'),
  ),
  p(_('Visualized as a graph, a feature branch that gets merged back looks like this:')),
  code(`main:     A───B───C────────M
                   \\      /
feature:            D────E`),
  p(_('A, B, C are commits on `main`. D and E are two commits made on a feature branch (which started from C). M is the merge commit — the moment those two timelines come back together.')),
  p(_('What you actually type day-to-day:')),
  code(`git checkout -b fix-payments    # create a new branch and switch to it
git add .                       # stage your edits for the next commit
git commit -m "fix payment bug" # save a snapshot with a message
git push                        # send the branch up to GitHub`),
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
  p(_('When you direct an AI agent to make a change, the agent doesn’t commit directly to main. It (and you) work on a branch; the work becomes a PR; the PR gets reviewed; the PR gets merged. Reading the diff in the PR is your last chance to catch mistakes before they ship — never skip it. On GitHub, the diff lives on the **Files changed** tab of the pull request page. (And if you’re working with Claude Code, you can also ask the agent: *"show me the diff for this branch."*) Chapter 10 covers how to actually verify the change without reading code yourself.')),
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

/* --------------------------- Chapter 8 export --------------------------- */

export const chapter08: Chapter = {
  id: 'ch8',
  number: 8,
  title: 'Code Lifecycle',
  subtitle: 'How code becomes the running system',
  slides: [
    { id: 's1', level: 101, headline: 'Save isn’t enough', body: { kind: 'prose', blocks: saveNotEnough }, diagramFocus: 'local-only' },
    { id: 's2', level: 101, headline: 'Your local copy — clone, folder, history', body: { kind: 'prose', blocks: localCopy }, diagramFocus: 'local-remote' },
    { id: 's3', level: 101, headline: 'Git — a record of every change', body: { kind: 'prose', blocks: gitBasics }, diagramFocus: 'branches' },
    { id: 's4', level: 101, headline: 'Pull requests — proposing a change', body: { kind: 'prose', blocks: pullRequests }, diagramFocus: 'pr' },
    { id: 's5', level: 101, headline: 'Tests and CI — verifying behavior automatically', body: { kind: 'prose', blocks: testsAndCI }, diagramFocus: 'ci' },
    {
      id: 's6',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Cloning a repo gives you a local folder with the code plus its full history (`.git`); local is your copy, remote is GitHub',
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
          _('Coming up — Chapter 9: Deployment & Operations. Once a pull request passes CI and gets merged into main, the code still has to actually reach production safely — without breaking the live system for users in the middle of a session.'),
        ],
      },
    },
  ],
}
