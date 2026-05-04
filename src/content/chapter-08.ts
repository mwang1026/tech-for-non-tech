import type { Chapter, Block } from './types'
import { _, t, p, ul, code } from './authoring'

/* ============================================================================
 * Chapter 8 — From Edited Text to Merged Change (101)
 *
 * One worked example threads through the whole chapter: a developer wants to
 * change `sunColor = "yellow"` to `"orange"` inside `src/components/Hero.tsx`.
 * Every concept is anchored to that two-line edit.
 *
 * Slide arc:
 *   1.  The change we're making        (set up the worked example)
 *   2.  Code is text + the thing that runs it   (compiler / interpreter / runtime)
 *   3.  How a codebase is organized     (file / folder / function / method / class / module / package)
 *   4.  git, GitHub, clone              (the canonical copy + your local copy)
 *   5.  Branches                        (parallel timeline so you don't disturb main)
 *   6.  Commits                         (the named unit of change)
 *   7.  Push                            (your branch reaches the remote)
 *   8.  Pull request                    (a proposal everyone can read)
 *   9.  Merge conflicts                 (when two timelines disagree)
 *   10. CI                              (the robot that checks every PR)
 *   11. What CI runs                    (build / lint / type check / tests)
 *   12. Green, red, the merge           (the change officially lands on main)
 *   13. Recap
 *
 * The diagram (Chapter8DiagramSvg.tsx) switches between five scenes driven by
 * the slide index — see chapter8Elements.ts.
 * ============================================================================ */

/* --------------------------- Slide 1 — The change we're making --------------------------- */

const theChange: Block[] = [
  p(_('Act II is about how the code that runs the system gets there in the first place. Watching that journey from one direction is the cleanest way to see every piece, so this whole chapter and the next track a single change end to end.')),
  p(_('Somewhere in the codebase of some product, a line says:')),
  code(`sunColor = "yellow"`),
  p(_('Product wants the homepage sun to be orange. The developer needs that line to read:')),
  code(`sunColor = "orange"`),
  p(_('Six characters changed, in one file, in one place. That is the entire technical change. Everything else in this chapter — git, branches, pull requests, CI — exists because real teams need a way to do that change safely with other people in the codebase, with a record of what happened, and with automated checks before it ships.')),
  p(_('The same path applies to changes a thousand times bigger. Walking it through a tiny example makes every step visible without the reader having to know any code.')),
]

/* --------------------------- Slide 2 — Code is text + runtime --------------------------- */

const codeIsText: Block[] = [
  p(_('Some readers of this primer have edited code; some haven\'t. So before going further: what is code, literally?')),
  p(_('Code is text saved in files. Plain text — no fonts, no formatting, just characters. A developer opens the file in a text editor (VS Code, Cursor, JetBrains IDEs are all editors), types, and saves. The "yellow" in the previous slide is seven literal characters inside one file. Changing it to "orange" is a six-character edit and another save.')),
  p(_('Text by itself doesn\'t do anything — it just sits on disk. The machine doesn\'t speak the language the developer wrote. A second program sits between the text and the machine and translates. Two flavors of that second program:')),
  ul(
    [_('A '), t('compiler', 'compiler'), _(' translates the whole codebase into machine instructions ahead of time, producing a binary the machine runs later. Go, Rust, Java, and C work this way.')],
    [_('An '), t('interpreter', 'interpreter'), _(' reads the text and executes it on the fly, every time the program runs. Python and Ruby work this way. JavaScript runs in the browser via the browser\'s built-in interpreter, and on the server via '), t('Node.js', 'nodejs'), _(' — the JavaScript runtime that executes the same code outside the browser.')],
  ),
  p(
    _('The word '),
    t('runtime', 'runtime'),
    _(' shows up everywhere — it\'s the umbrella name for whatever piece does that translation and execution while the program runs. Containers in the next chapter package the code together with its runtime so the program runs the same anywhere.'),
  ),
  p(_('Different languages have different syntax (the rules for what counts as a valid sentence) and different communities, but the developer\'s job is the same in any of them: edit text in files, save, hand it to the compiler or runtime.')),
]

/* --------------------------- Slide 3 — Codebase organization --------------------------- */

const organization: Block[] = [
  p(_('A real product is rarely one giant text file. Splitting code into many smaller pieces is how a human (or an agent) navigates a codebase without drowning. The vocabulary for those scales:')),
  ul(
    [_('A '), t('file', 'code-file'), _(' is one text document on disk. `Hero.tsx` is a file. The orange-sun change touches one file.')],
    [_('A '), t('folder', 'folder'), _(' (sometimes called a directory) groups files by purpose. `src/components/` holds UI components; `src/db/` holds database code. Folder structure is a navigation tool — it tells you where to look for a given concern.')],
    [_('A '), t('function', 'function'), _(' is a named block of code that does one job. `getSunColor()` returns a color. Inside the file, code is organized into functions so each one can be read, tested, and reused on its own.')],
    [_('A '), t('class', 'class'), _(' bundles related data together with the operations on it. A `User` class might hold a name and email plus operations like `changePassword()`. When a function lives inside a class, some languages call it a '), t('method', 'method'), _(' (Java, Python, Ruby do; JavaScript and Go usually still say function). Same job, different name by convention.')],
    [_('A '), t('module', 'module'), _(' is a single file (or small group) treated as a unit other code imports from. `theme.ts` exporting the sun color is a module — other files bring it in by name.')],
    [_('A '), t('package', 'package'), _(' is a folder of modules distributed and versioned together. The whole `your-repo/` codebase is a package. `react`, which other projects install and use, is also a package — published, versioned, and pulled in as a dependency.')],
  ),
  p(_('Names blur across languages — what JavaScript calls a module is roughly what Python calls a module which is roughly what Java calls a class file. The reader doesn\'t need to know the differences. Just to recognize that when a reviewer or an agent says "module," "package," or "method," they\'re naming a scale of code organization, not a magic concept.')),
  p(_('For the orange-sun change: the file is `Hero.tsx`, inside the `components` folder, inside `src`, inside the `your-repo` package. The line being changed sits inside a function called `getSunColor`, attached to a class called `Hero`. The reviewer asking "where\'s the change?" is asking for that path.')),
]

/* --------------------------- Slide 4 — git, GitHub, clone --------------------------- */

const gitAndGitHub: Block[] = [
  p(_('Now: where does the code actually live? Two layers, often confused.')),
  ul(
    [t('Git', 'git'), _(' is the version-control software. It runs on every developer\'s laptop and on the server hosting the canonical copy. It tracks every change ever made to the codebase, with full history. It\'s open source, free, and works offline. When someone runs `git commit` or `git push`, that\'s the git program on their laptop doing the work.')],
    [t('GitHub', 'github'), _(' is an application companies use to host their code. It runs git on its servers — that\'s where "the canonical copy" actually sits — and adds a website on top: pull request pages, code review, search, issue tracking, automated checks, permissions. GitHub is owned by Microsoft. '), t('GitLab', 'gitlab'), _(' is the main alternative; it can also be self-hosted on a company\'s own infrastructure. '), t('Bitbucket', 'bitbucket'), _(' (Atlassian) is a third. A team picks one and that\'s where their code lives.')],
  ),
  p(
    _('A '), t('repository', 'repository'),
    _(' (or "repo") is the whole tree of files plus the full history git tracks for them. To work on a repo, the developer brings a copy onto their laptop:'),
  ),
  code(`git clone https://github.com/your-org/your-repo.git
cd your-repo`),
  p(_('After this, the laptop has a folder `your-repo/` with all the project files plus a hidden `.git` folder where git stores the history. The two copies (laptop and GitHub) start identical. Two terms used constantly:')),
  ul(
    [_('**Local** — the copy on the laptop. What you can edit and run.')],
    [_('**Remote** — the copy on GitHub. The shared source of truth.')],
  ),
  p(_('For the orange-sun change: `git clone` ran some time ago; the laptop already has the repo. The developer opens `src/components/Hero.tsx` in the editor and is ready to change "yellow" to "orange".')),
]

/* --------------------------- Slide 5 — Branches --------------------------- */

const branches: Block[] = [
  p(_('Editing `Hero.tsx` directly on the canonical timeline is the wrong move. The canonical timeline is called '), t('main', 'main-branch'), _(' (some older repos call it `master`). Every other developer pulling from `main` would immediately get the half-finished orange change in their working copy. Worse, the moment something else needs to ship from `main`, the orange change is part of it whether it\'s ready or not.')),
  p(
    _('The fix is a '),
    t('branch', 'branch'),
    _(' — a parallel timeline of changes that doesn\'t disturb `main`. The developer creates one and switches to it:'),
  ),
  code(`git checkout -b sun-color-orange`),
  p(_('`checkout` is the verb git uses for "switch to this branch." `-b` means "and create it if it doesn\'t exist." The branch starts as an exact copy of `main` at that moment, then diverges from there.')),
  p(_('On the new branch, the developer edits `Hero.tsx` and changes "yellow" to "orange". The file on disk now reads orange. On `main`, the same file still reads yellow. Two timelines, same starting point, different content from this point forward.')),
  p(_('Five developers can each have their own branch open at the same time — one fixing a payment bug, one adding a new sign-up flow, one rewording the homepage, plus the orange-sun change — all without stepping on each other. Branches are how parallel work happens without chaos.')),
]

/* --------------------------- Slide 6 — Commits --------------------------- */

const commits: Block[] = [
  p(_('Saving the file in the editor isn\'t enough. The file on disk has new content, but git doesn\'t yet know which set of edits the developer wants to record as a unit. That\'s what a commit is.')),
  p(
    _('A '),
    t('commit', 'commit'),
    _(' is a snapshot of the codebase at a moment, with a message explaining what changed and why. Two commands do it:'),
  ),
  code(`git add src/components/Hero.tsx
git commit -m "change sun color from yellow to orange"`),
  p(_('`git add` stages the file — tells git "this edit is part of the next commit." `git commit -m "..."` saves the snapshot with the given message. After this, the orange change is one commit on the `sun-color-orange` branch.')),
  p(_('Every commit carries:')),
  ul(
    [_('**A unique ID** — a long string of letters and numbers (often shortened to seven characters in display, e.g. `42a1f2`). This ID is how every other tool refers to the commit later.')],
    [_('**An author** — who wrote it.')],
    [_('**A timestamp** — when it was made.')],
    [_('**A message** — the human-readable explanation.')],
    [_('**A diff** — the exact lines added and removed.')],
  ),
  p(_('Commit messages are not throwaway. Six months from now, when something breaks and an investigator runs `git blame` on `Hero.tsx`, the commit message is what tells them why orange. "fix" or "wip" as a message is a small disservice to that future person.')),
]

/* --------------------------- Slide 7 — Push --------------------------- */

const push: Block[] = [
  p(_('After the commit, the orange change exists in exactly one place: the local copy on the developer\'s laptop. The remote on GitHub still doesn\'t know about it. Anybody else who clones the repo right now gets yellow.')),
  code(`git push -u origin sun-color-orange`),
  p(_('`git push` sends the branch and its commits to the remote. `-u origin sun-color-orange` is plumbing the first time a branch is pushed — it tells git "this local branch tracks the remote branch with the same name on the `origin` remote." After running it once, future pushes on this branch can be just `git push`.')),
  p(_('Now the branch exists in two places: the laptop and GitHub. The two are in sync. `main` on the remote is still untouched — the orange-sun branch is sitting next to `main`, not part of it.')),
  p(_('That last point is the bridge to the next slide. The branch is on the remote but it isn\'t merged into `main`, which is what would actually make it part of the canonical codebase. The mechanism for proposing the merge is the pull request.')),
]

/* --------------------------- Slide 8 — Pull request --------------------------- */

const pullRequest: Block[] = [
  p(
    _('A '),
    t('pull request', 'pull-request'),
    _(' (PR) is a proposal to merge one branch into another — almost always, a feature branch into `main`. On '),
    t('GitLab', 'gitlab'),
    _(' the same thing is called a "merge request" (MR). Same concept, different name.'),
  ),
  p(_('A PR is a webpage on GitHub. It has a URL anyone with access can read. On the page:')),
  ul(
    [_('**The title and description** — what this change is and why. For the orange-sun PR: title "change sun color from yellow to orange," description with any context the reviewer needs.')],
    [_('**The diff** — every line added and removed across every file. For this PR, exactly two lines: `- sunColor = "yellow"` (red) and `+ sunColor = "orange"` (green). Diffs are how engineers read changes; learning to read them is the foundation of code review.')],
    [_('**Discussion threads** — reviewers comment on specific lines or on the PR overall. Asking questions, requesting changes, approving.')],
    [_('**The list of commits** — every commit on the branch. For this PR, just one.')],
    [_('**A checks panel** — the live status of the automated checks that run on every PR. (Next slides cover what those checks are.)')],
  ),
  p(_('GitHub enforces team rules at the PR level: a PR usually can\'t be merged until at least one other engineer has approved it, and until all the automated checks pass. Those rules are configured per repository. They\'re not a social convention — the merge button literally won\'t click on a PR that hasn\'t met them.')),
  p(_('When an AI agent makes a change, it goes through the same path: branch, commits, PR, review, checks, merge. The PR is where a non-coder can verify what the agent did before any of it lands — read the diff, ask questions, approve or push back.')),
]

/* --------------------------- Slide 9 — Merge conflicts --------------------------- */

const mergeConflicts: Block[] = [
  p(_('Two ways the orange-sun PR can hit trouble at the merge step. Both have the same root cause: a line has two competing versions, and git can\'t pick.')),
  ul(
    [_('**Two open PRs touching the same lines.** Two developers branched off `main` at the same point. PR A changed `sunColor` to `"orange"`; PR B changed the same line to `"gold"`. PR A merges first and goes in cleanly. When PR B tries to merge, its baseline is now stale — the line PR B is touching has already been changed by PR A. Git doesn\'t know whether "gold" should win over "orange" or the other way around.')],
    [_('**`main` moved while a branch sat.** The orange-sun branch was created off `main` last Tuesday. Over the week, four PRs merged into `main`, and one of them touched the same line. When the orange-sun PR is opened a week later, its view of that line disagrees with `main`\'s view. Same problem, different way to land in it.')],
  ),
  p(
    _('When git can\'t merge automatically, it produces a '),
    t('merge conflict', 'merge-conflict'),
    _('. Git rewrites the file with both versions clearly marked, separated by special lines. Something like:'),
  ),
  code(`<<<<<<< HEAD
  sunColor = "orange"
=======
  sunColor = "gold"
>>>>>>> branch B`),
  p(_('Resolving the conflict is a human job. The developer opens the file, reads both versions, picks (or combines) the right answer, deletes the marker lines, saves, commits the resolution. Modern editors and the GitHub website have UI for this — visual side-by-side views, a "use ours / use theirs" button — so it doesn\'t require typing literally between the markers.')),
  p(_('Conflicts are routine. They happen any time two changes touch the same lines. Not scary, just tedious. The reason this slide exists at all is that the word "conflict" sounds dramatic and it isn\'t — it\'s the normal cost of letting parallel work happen.')),
]

/* --------------------------- Slide 10 — CI --------------------------- */

const ci: Block[] = [
  p(_('When the orange-sun PR is opened, a separate piece of automation kicks in. A fresh machine — not the developer\'s laptop, not GitHub\'s general infrastructure — downloads the branch, sets the project up from scratch, and runs every automated check the team has configured. The umbrella term for this is '), t('CI', 'ci'), _(' (continuous integration).')),
  p(_('Why a fresh machine? Because "works on my laptop" is famously not a guarantee. The laptop has the developer\'s editor, their tools, their cached files, their shell history. The CI machine starts from nothing — clones the repo, installs dependencies, runs the checks. If the change works there, it has a real chance of working somewhere else.')),
  p(_('CI is the current industry standard for any codebase past one developer working alone. Most professional teams run it on every PR. The 2024 Stack Overflow Developer Survey reports CI/CD adoption among professional developers; GitHub\'s State of the Octoverse reports usage of GitHub Actions specifically. Plenty of repos still don\'t have CI — solo prototypes, internal scripts, abandoned projects — and that\'s fine for what they are. The point isn\'t that CI is universal; it\'s that any team shipping a real product should have it, and the reader will see it on every serious codebase they meet.')),
  ul(
    [_('Stack Overflow Developer Survey — '), _('https://survey.stackoverflow.co/')],
    [_('GitHub Octoverse — '), _('https://octoverse.github.com/')],
  ),
  p(
    _('Common CI services: '),
    t('GitHub Actions', 'github-actions'),
    _(' (built into GitHub, the most common choice for repos hosted there), '),
    t('CircleCI', 'circleci'),
    _(', '),
    t('GitLab CI', 'gitlab-ci'),
    _(' (built into GitLab), '),
    t('Buildkite', 'buildkite'),
    _('. They look different on the inside, but the job they do is the same: pull the branch, run the checks, report back.'),
  ),
]

/* --------------------------- Slide 11 — What CI runs --------------------------- */

const whatCiRuns: Block[] = [
  p(_('CI runs several different kinds of check, each catching a different category of bug. For a real PR, all of them have to pass.')),
  ul(
    [_('**Build** — does the code turn into a runnable program at all? For compiled languages, this is literally running the compiler. For interpreted ones, it usually means installing dependencies and bundling files together. Build catches typos, missing imports, broken syntax — the most basic class of "this can\'t even run" mistake.')],
    [_('A '), t('linter', 'linter'), _(' enforces the team\'s style and pattern rules — things like unused variables, banned functions, formatting drift, inconsistent quoting. It doesn\'t catch behavior bugs. It catches the small surface-level inconsistencies that, accumulated, make a codebase harder for everyone to read.')],
    [_('A '), t('type checker', 'type-checker'), _(' verifies that the pieces fit together. If `sunColor` is supposed to be a string and somewhere a number got assigned to it, the type checker catches that before the code ever runs. Languages like TypeScript, Go, Rust, and Java have type checking built in; languages like Python and JavaScript add it as a separate optional layer.')],
    [t('Tests', 'tests'), _(' — small programs that exercise the real code and check it does what it should. Three sizes worth knowing:')],
  ),
  ul(
    [t('Unit tests', 'unit-test'), _(' — one function, in isolation. "Given input X, do we get output Y?" Cheapest to run, cheapest to maintain, narrowest in what they prove.')],
    [t('Integration tests', 'integration-test'), _(' — multiple pieces working together. "When the API receives this request, does the right row appear in the database?" More setup, broader coverage.')],
    [t('End-to-end tests', 'e2e-test'), _(' — a fake browser drives the real app from the outside. "Load the homepage, see an orange sun." Slow to run, easy to break, but the only kind that proves the user-visible thing works.')],
  ),
  p(_('For the orange-sun change, the test that matters is probably an end-to-end one that loads the homepage and checks for the right color. If a test was previously asserting the literal string "yellow" on the page, it\'s about to fail — not because orange is wrong, but because the test needs updating to match the new expected value. That update is part of the PR.')),
]

/* --------------------------- Slide 12 — Green, red, the merge --------------------------- */

const greenRedMerge: Block[] = [
  p(_('When CI finishes, the PR is in one of two states.')),
  ul(
    [t('Green', 'green-build'), _(' — every check passed. The PR is mergeable, assuming reviewers have approved.')],
    [t('Red', 'red-build'), _(' — at least one check failed. GitHub blocks the merge button (this is enforced server-side, not just visually). The developer reads the CI output, fixes whatever broke, pushes another commit. CI re-runs automatically. Repeat until green.')],
  ),
  p(_('For the orange-sun PR: assume CI is now green and a reviewer has approved. Click **Merge**. Behind the scenes, GitHub takes the branch\'s commits and adds them to `main`. The orange-sun commit is now part of `main`\'s history. The branch can be deleted (the commits stay, attached to `main`). The PR page is preserved permanently as the record of what happened and why.')),
  p(_('From here on, anybody who clones the repo or pulls `main` gets the orange version of `Hero.tsx`. The change is officially part of the canonical codebase.')),
  p(_('But — and this is the bridge to chapter 9 — `main` on GitHub is *not* what users see when they load the homepage. Real users hit production servers, and production servers don\'t run code straight off GitHub. They run a packaged, ready-to-execute version that has to be built and deployed to them. Until that happens, every visitor still sees yellow.')),
  p(_('Chapter 9 picks up from this exact moment.')),
]

/* --------------------------- Chapter 8 export --------------------------- */

export const chapter08: Chapter = {
  id: 'ch8',
  number: 8,
  title: 'From Edited Text to Merged Change',
  subtitle: 'How one tiny edit travels through git, review, and CI',
  slides: [
    { id: 's1', level: 101, headline: 'The change we’re making', body: { kind: 'prose', blocks: theChange }, diagramFocus: 'change' },
    { id: 's2', level: 101, headline: 'Code is text — plus the thing that runs it', body: { kind: 'prose', blocks: codeIsText }, diagramFocus: 'text-runtime' },
    { id: 's3', level: 101, headline: 'How a codebase is organized', body: { kind: 'prose', blocks: organization }, diagramFocus: 'organization' },
    { id: 's4', level: 101, headline: 'git, GitHub, and getting a copy', body: { kind: 'prose', blocks: gitAndGitHub }, diagramFocus: 'laptop' },
    { id: 's5', level: 101, headline: 'Branches — a parallel timeline', body: { kind: 'prose', blocks: branches }, diagramFocus: 'branches' },
    { id: 's6', level: 101, headline: 'Commits — the named unit of change', body: { kind: 'prose', blocks: commits }, diagramFocus: 'commit-detail' },
    { id: 's7', level: 101, headline: 'Push — your branch reaches the remote', body: { kind: 'prose', blocks: push }, diagramFocus: 'remote' },
    { id: 's8', level: 101, headline: 'Pull request — a proposal everyone can read', body: { kind: 'prose', blocks: pullRequest }, diagramFocus: 'pr' },
    { id: 's9', level: 101, headline: 'Merge conflicts — when two timelines disagree', body: { kind: 'prose', blocks: mergeConflicts }, diagramFocus: 'merge-conflict' },
    { id: 's10', level: 101, headline: 'CI — the robot that checks every PR', body: { kind: 'prose', blocks: ci }, diagramFocus: 'pr' },
    { id: 's11', level: 101, headline: 'What CI actually runs', body: { kind: 'prose', blocks: whatCiRuns }, diagramFocus: 'pr' },
    { id: 's12', level: 101, headline: 'Green, red, and the merge', body: { kind: 'prose', blocks: greenRedMerge }, diagramFocus: 'pr' },
    {
      id: 's13',
      level: 101,
      kind: 'recap',
      headline: 'What you have so far',
      body: {
        kind: 'recap',
        learned: [
          'Code is human-readable text in files; a compiler or runtime translates it into instructions the machine runs',
          'A codebase is organized at several scales — file, folder, function, method, class, module, package — with names that vary by language',
          'git tracks history; GitHub (or GitLab, Bitbucket) is an application that hosts the canonical copy and adds review, CI, and permissions on top',
          'A change starts on a branch, becomes a commit, gets pushed to the remote, and is proposed via a pull request that shows the diff for review',
          'CI runs build, lint, type checks, and tests on every PR; green unblocks the merge, red blocks it; the merge is what officially lands the change on `main`',
          'The orange-sun change is now part of `main` on GitHub — but no real user has seen it yet, because production runs a deployed copy, not GitHub directly',
        ],
        whereInSystem: [
          _('The code-lifecycle layer sits upstream of the running system. Developers edit files locally, push branches up to '),
          t('GitHub', 'github'),
          _(', open pull requests, and pass through CI before any change reaches the production servers from earlier chapters. Nothing in this chapter has touched a real user yet.'),
        ],
        bridge: [
          _('Chapter 9 picks up at the exact moment the orange-sun PR is merged into `main` and follows the same change through build, container packaging, environments, deploy, and observability — until a real visitor finally sees orange.'),
        ],
      },
    },
  ],
}
