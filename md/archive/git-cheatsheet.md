# Git Cheat Sheet

A detailed, professional-grade reference for everyday and advanced Git usage, grouped by subcommand. Every section explains what the command does, the flags worth knowing, and runnable examples.

**Conventions used below:** angle brackets like `<branch>` mark a placeholder you replace with a real name. Lines starting with `#` inside code blocks are comments, not commands to type.

---

## Configuration

### git config

`git config` reads and writes the settings Git uses for identity, editor, aliases, and behavior. Settings apply at three scopes, and a more specific scope always wins: **system** (every user on the machine, `--system`), **global** (your user account, `--global`), and **local** (a single repository, the default, no flag needed). Local config lives in `.git/config`; global config lives in `~/.gitconfig`.

```bash
# Identity — required before your first commit
git config --global user.name "Anish Safui"
git config --global user.email "isafuianish-dev@outlook.com"

# Sensible defaults
git config --global init.defaultBranch main
git config --global core.editor vim
git config --global pull.rebase false

# Repository-only override (no --global)
git config user.email "work-email@company.com"

# Inspect settings
git config --list                # everything in effect, with source scope
git config --get user.email      # a single key
git config --global --edit       # open the global config file in $EDITOR
```

### git help

Every command has built-in documentation — reach for it instead of guessing at a flag.

```bash
git help config          # full man-page style docs for `git config`
git config -h            # short flag summary, faster to scan
git help -g              # list of concept guides (workflows, glossary, etc.)
```

---

## Starting a Repository

### git init

Creates a new, empty Git repository by adding a `.git` directory to the current folder. Nothing is tracked yet — `init` only sets up the metadata store.

```bash
cd /path/to/code
git init                       # initialize in the current directory
git init my-project            # create ./my-project and initialize it there
git init --initial-branch=main # explicit default branch name (Git 2.28+)
```

### git clone

Copies an existing remote repository — full history, all branches' refs, and the default branch's working files — into a new local directory, and automatically wires up `origin` as the remote.

```bash
git clone https://github.com/user/repo.git
git clone git@github.com:user/repo.git my-folder   # clone into a custom folder name
git clone --depth 1 https://github.com/user/repo.git # shallow clone: latest commit only, faster for CI
git clone --branch develop https://github.com/user/repo.git # clone a specific branch
```

---

## Inspecting the Working Directory

### git status

Shows the state of the working directory and the staging area (index): which tracked files have unstaged changes, which changes are staged for the next commit, and which files aren't tracked at all. This is the command to run before every add/commit.

```bash
git status
git status --short     # compact two-column form (M/A/D/?? per file)
git status --short -b  # compact form plus the current branch and ahead/behind count
```

### git diff

Shows line-by-line changes as a unified diff. With no arguments it compares the working directory against the staging area (i.e., your unstaged edits). Understanding which two states are being compared is the key to using it well.

```bash
git diff                    # working directory vs. staging area (unstaged changes)
git diff --staged           # staging area vs. last commit (what `commit` would record)
git diff HEAD                # working directory vs. last commit (staged + unstaged combined)
git diff main..feature       # compare two branches
git diff -- path/to/file.js  # limit the diff to one file or path
git diff --stat              # summary only: files changed, insertions/deletions count
```

---

## Staging & Snapshotting

### git add

Copies changes from the working directory into the staging area, marking them to be included in the next commit. Staging is incremental — you can add only part of what you've changed.

```bash
git add filename.txt     # stage one file
git add src/ tests/       # stage everything under one or more directories
git add .                 # stage everything changed in and below the current directory
git add --all              # stage everything in the whole repo, including deletions
git add -p                 # interactively choose which hunks to stage (great for focused commits)
```

### git rm

Removes a file from both the working directory and the staging area in one step, so the deletion is recorded in the next commit.

```bash
git rm filename.txt         # delete the file and stage the deletion
git rm --cached filename.txt # unstage/untrack the file but keep it on disk (e.g., after adding it to .gitignore too late)
git rm -r build/             # remove a directory recursively
```

### git mv

Renames or moves a tracked file and stages the rename in a single step. It's a convenience wrapper — `mv old new && git add new && git rm old` produces the same result, and Git detects renames automatically at commit time either way.

```bash
git mv filename.txt filenamenew.txt
git mv src/old-name.js src/new-folder/old-name.js
```

### git restore

Restores files in the working directory or staging area to a previous state, without moving the branch pointer (`HEAD`). It was split out of the older, overloaded `git checkout` to make file-restoration intent explicit.

```bash
git restore filename.txt            # discard unstaged working-directory changes to a file
git restore --staged filename.txt   # unstage a file, keep the edits in the working directory
git restore --source=HEAD~2 file.txt # pull a file's contents from an older commit
git restore .                        # discard all unstaged changes in the current directory
```

### .gitignore

Not a subcommand, but the standard way to tell Git which untracked files to never suggest staging (build artifacts, secrets, logs).

```bash
echo 'secrets.csv' >> .gitignore
echo '*.log' >> .gitignore
echo 'node_modules/' >> .gitignore
git status --ignored     # confirm what's being ignored
```

---

## Committing

### git commit

Records the staged snapshot as a permanent point in history, along with an author, timestamp, and message. Write messages in the imperative mood ("Fix login bug", not "Fixed" or "Fixes") — it matches Git's own generated messages (merges, reverts) and reads cleanly in `git log`.

```bash
git commit -m "Add password reset flow"
git commit -a -m "Fix off-by-one in pagination"   # -a auto-stages tracked-file changes first (skips new/untracked files)
git commit                                          # opens $EDITOR for a multi-line message (summary + blank line + body)
git commit --amend -m "Add password reset flow (fixed)" # replace the previous commit's message and/or staged content
```

**Amend carefully:** `--amend` rewrites the last commit's SHA. Never amend a commit that's already been pushed and could be in use by someone else, unless you coordinate a force-push.

---

## Branching & Navigation

### git branch

Lists, creates, renames, or deletes branches. A branch is just a movable pointer to a commit — creating one is cheap and instant.

```bash
git branch                     # list local branches (current one marked with *)
git branch -a                  # list local and remote-tracking branches
git branch feature/login        # create a new branch (doesn't switch to it)
git branch -m feature/login feature/auth  # rename the current branch
git branch -d feature/login     # delete a branch (fails safely if it has unmerged commits)
git branch -D feature/login     # force-delete regardless of merge status
```

### git switch

The modern, focused command for changing which branch you're on. It replaces `git checkout` for this purpose and can't accidentally touch files the way checkout's overloaded syntax could.

```bash
git switch main                  # switch to an existing branch
git switch -c feature/new-thing   # create a new branch from the current commit and switch to it
git switch -c hotfix origin/main   # branch off a specific starting point
git switch -                       # switch back to the previously checked-out branch
```

### git checkout

The older, multi-purpose command that predates `switch`/`restore`. Still common in scripts and older habits, so it's worth recognizing even if you prefer the newer, more explicit commands day to day.

```bash
git checkout <branch>          # switch branches (same as `git switch <branch>`)
git checkout -b <branch>        # create and switch (same as `git switch -c`)
git checkout -- file.txt         # discard working-directory changes to a file (same as `git restore`)
```

---

## Merging & Rebasing

### git merge

Combines another branch's changes into the current branch. If the current branch hasn't diverged, Git performs a **fast-forward** (just moves the pointer); otherwise it creates a new **merge commit** with two parents, preserving both branches' full history.

```bash
git switch main
git merge feature/login                     # merge feature/login into main
git merge --no-ff feature/login              # force a merge commit even if a fast-forward were possible (keeps feature history visible)
git merge -m "Merge feature/login into main" feature/login
git merge --abort                             # bail out cleanly if a merge produces conflicts you're not ready to resolve
```

When a merge conflicts, Git marks the affected files with `<<<<<<<`/`=======`/`>>>>>>>` conflict markers. Edit the files to the resolution you want, then:

```bash
git add resolved-file.txt
git commit          # completes the merge with the conflict resolution
```

### git rebase

Replays the current branch's commits, one by one, on top of another branch's tip — producing a linear history instead of a merge commit. Rewrites commit SHAs, so treat it the same way as `--amend`: safe on local/unpushed work, dangerous on shared history.

```bash
git switch feature/login
git rebase main                  # replay feature/login's commits onto the tip of main
git rebase -i HEAD~5               # interactive rebase: reorder, squash, reword, or drop the last 5 commits
git rebase --continue               # after resolving a conflict during rebase
git rebase --abort                   # bail out and return to the pre-rebase state
```

**Golden rule of rebasing:** don't rebase commits that other people have already pulled — it forces everyone downstream to reconcile a rewritten history.

### git cherry-pick

Applies the changes from a specific commit (identified by SHA) onto the current branch as a new commit, without merging or rebasing the whole branch.

```bash
git cherry-pick a1b2c3d              # apply a single commit onto the current branch
git cherry-pick a1b2c3d..f4e5d6c      # apply a range of commits
git cherry-pick --continue             # after resolving a conflict
git cherry-pick -n a1b2c3d              # apply the changes but don't auto-commit (stage only)
```

---

## Working with Remotes

### git remote

Manages the named shortcuts (like `origin`) that point at remote repository URLs.

```bash
git remote -v                                    # list remotes and their URLs
git remote add origin git@github.com:user/repo.git
git remote set-url origin git@github.com:user/new-repo.git  # change an existing remote's URL
git remote remove origin
git remote rename origin upstream
```

### git fetch

Downloads commits, branches, and tags from a remote into your local **remote-tracking branches** (e.g., `origin/main`) without touching your own working branches. Fetching is always safe — it never merges or rewrites your work.

```bash
git fetch origin                # update all remote-tracking branches for origin
git fetch --all                  # fetch from every configured remote
git fetch --prune                 # also remove local remote-tracking branches deleted on the remote
```

### git pull

Runs `git fetch` immediately followed by an integration step — by default `git merge`, or `git rebase` if `pull.rebase` is configured/passed. It's a convenience command; understanding it as fetch+merge makes conflicts far less mysterious.

```bash
git pull                    # fetch + merge (or rebase, per config) the current branch's upstream
git pull --rebase            # fetch + rebase instead of merge, for a linear history
git pull origin develop       # pull a specific remote branch into the current branch
```

### git push

Uploads local commits on a branch to a remote, updating the remote branch's pointer.

```bash
git push origin main                 # push main to origin
git push -u origin main               # push and remember the upstream, so future `git push` needs no arguments
git push --all                         # push all local branches
git push --tags                         # push tags (tags aren't pushed by default)
git push --force-with-lease              # overwrite the remote branch, but only if no one else has pushed to it since your last fetch
```

**Avoid plain `--force`:** it overwrites the remote unconditionally, silently discarding any commits someone else pushed in the meantime. `--force-with-lease` checks first and refuses if the remote has moved.

---

## Inspecting History

### git log

Walks commit history starting from `HEAD`, newest first. Endlessly configurable — the flags below cover the ones worth memorizing.

```bash
git log                                 # full history: SHA, author, date, message
git log --oneline                        # one compact line per commit
git log --oneline --graph --all           # ASCII graph of all branches, great for visualizing merges
git log -p                                 # full history with each commit's diff
git log -n 5                                # last 5 commits only
git log --author="Anish"                     # commits by a specific author
git log --since="2 weeks ago" --until="yesterday"
git log -- path/to/file.js                    # history that touched a specific file
git log main..feature                          # commits on feature not yet on main
```

### git show

Displays a single object in detail — most often a commit's metadata plus its diff, but it also works on tags, blobs, and trees.

```bash
git show a1b2c3d              # metadata + diff for a specific commit
git show HEAD                  # the most recent commit
git show HEAD~2:path/to/file.js # a file's contents as of two commits ago
```

### git blame

Annotates each line of a file with the commit and author that last changed it — the fastest way to find out *why* a line exists.

```bash
git blame path/to/file.js
git blame -L 10,25 path/to/file.js   # limit to a line range
git blame -w path/to/file.js          # ignore whitespace-only changes when attributing lines
```

---

## Undoing Changes

### git reset

Moves the current branch pointer to a different commit, with three modes that control how much of the working directory and staging area follow along.

```bash
git reset --soft HEAD~1    # move HEAD back one commit; keep changes staged (great for "redo that commit message")
git reset HEAD~1             # mixed (default): move HEAD back; unstage changes but keep them in the working directory
git reset --hard HEAD~1       # move HEAD back; discard changes everywhere — destructive, use with care
git reset HEAD filename.txt    # unstage a single file without touching the commit history (older equivalent of `git restore --staged`)
```

**`--hard` is irreversible from the working tree's point of view** — uncommitted changes it discards are not recoverable. Double-check `git status` first.

### git revert

Creates a **new** commit that undoes the changes from an earlier commit, leaving history intact. Unlike `reset`, it's safe on shared/pushed branches because nothing is rewritten.

```bash
git revert a1b2c3d              # revert a single commit, opens editor for the revert message
git revert --no-edit a1b2c3d      # revert without prompting for a message
git revert HEAD~3..HEAD             # revert a range of commits (newest first)
```

### git clean

Deletes untracked files from the working directory — the counterpart to `reset --hard`, which only touches tracked files.

```bash
git clean -n     # dry run: list what would be deleted, without deleting anything (always run this first)
git clean -f       # delete untracked files
git clean -fd        # also delete untracked directories
git clean -fx         # also delete files ignored via .gitignore (e.g., wipe build output)
```

---

## Stashing

### git stash

Temporarily shelves uncommitted changes (both staged and unstaged) so you can switch context — pull, switch branches, fix an urgent bug — with a clean working directory, then bring the changes back later.

```bash
git stash                          # stash tracked changes with a default message
git stash push -m "WIP: login form"  # stash with a descriptive message
git stash -u                          # also stash untracked files
git stash list                          # show all stashed entries
git stash show -p stash@{0}              # view a stash's diff
git stash pop                              # reapply the most recent stash and remove it from the stash list
git stash apply stash@{1}                    # reapply a specific stash but keep it in the list
git stash drop stash@{1}                       # delete a specific stash without applying it
git stash clear                                  # delete all stashes
```

---

## Tagging

### git tag

Marks a specific commit with a permanent, human-readable name — most commonly for releases (`v1.0.0`). **Lightweight tags** are just a named pointer; **annotated tags** are full objects with a message, tagger, and date, and are the recommended kind for releases.

```bash
git tag v1.0.0                                  # lightweight tag on the current commit
git tag -a v1.0.0 -m "First stable release"        # annotated tag (preferred)
git tag -a v0.9.0 a1b2c3d -m "Beta release"          # annotated tag on a past commit
git tag                                                # list all tags
git tag -d v0.9.0                                        # delete a local tag
git push origin v1.0.0                                     # push a single tag (tags don't push automatically)
git push origin --tags                                       # push all tags
```

---

## Advanced & Troubleshooting

### git reflog

Records every movement of `HEAD` — commits, resets, rebases, checkouts — in a local, per-repository log that persists even after history-rewriting operations. It's the safety net for "I think I just lost a commit."

```bash
git reflog                          # list recent HEAD movements with their SHAs
git reset --hard HEAD@{2}             # recover by resetting back to a state the reflog remembers
git checkout HEAD@{5}                   # inspect an old state without altering the current branch
```

### git bisect

Binary-searches through history to find the exact commit that introduced a bug, by repeatedly checking out a midpoint commit and asking you (or a script) to mark it good or bad.

```bash
git bisect start
git bisect bad                 # the current commit is broken
git bisect good v1.2.0           # this earlier tag/commit was known good
# Git checks out a midpoint commit — test it, then:
git bisect good                 # or `git bisect bad`, repeat until Git identifies the culprit
git bisect reset                  # done — return to the original branch/commit

# Automate it with a test script that exits non-zero on failure:
git bisect start HEAD v1.2.0
git bisect run npm test
```

### git submodule

Embeds another Git repository as a subdirectory at a pinned commit, useful for vendoring a dependency that itself has its own history.

```bash
git submodule add https://github.com/user/lib.git vendor/lib
git submodule init                          # after cloning a repo that has submodules
git submodule update                          # fetch the pinned commit for each submodule
git submodule update --init --recursive         # do both, including nested submodules, in one step
git submodule update --remote                     # advance a submodule to its remote's latest commit
```

---

## Productivity: Aliases

Aliases turn long or frequent commands into short ones, defined via `git config` and stored under the `[alias]` section of your config file.

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.last "log -1 HEAD"
git config --global alias.lg "log --oneline --graph --all"

# Now usable as:
git st
git lg
```

---

## Quick Task Reference

A fast lookup from "what am I trying to do" to the command that does it.

- **See what changed:** `git status` and `git diff`
- **Save my work-in-progress before switching tasks:** `git stash`
- **Start a new feature:** `git switch -c feature/name`
- **Combine a finished feature into main:** `git switch main && git merge feature/name`
- **Clean up a feature branch's messy commits before merging:** `git rebase -i HEAD~n`
- **Undo my last commit but keep the edits:** `git reset --soft HEAD~1`
- **Undo a commit that's already been pushed:** `git revert <sha>`
- **Get a teammate's latest changes:** `git pull`
- **Find who wrote a line and why:** `git blame path/to/file.js` then `git show <sha>`
- **Find which commit broke something:** `git bisect start`
- **Recover a commit I think I lost:** `git reflog`
- **Mark a release:** `git tag -a vX.Y.Z -m "message"` then `git push origin vX.Y.Z`
