# Git Cheatsheet

> **Convention used throughout this file**
> `<required>` · `[optional]` · `…` = one or more items

---

## Table of Contents

1. [Configuration — `git config`](#1-configuration--git-config)
2. [Repository Initialization — `git init` / `git clone`](#2-repository-initialization--git-init--git-clone)
3. [Staging & Snapshot — `git add` / `git rm` / `git mv`](#3-staging--snapshot--git-add--git-rm--git-mv)
4. [Committing — `git commit`](#4-committing--git-commit)
5. [Inspection & Status — `git status` / `git diff` / `git show`](#5-inspection--status--git-status--git-diff--git-show)
6. [Log & History — `git log`](#6-log--history--git-log)
7. [Branching — `git branch`](#7-branching--git-branch)
8. [Checkout & Switch — `git checkout` / `git switch`](#8-checkout--switch--git-checkout--git-switch)
9. [Merging — `git merge`](#9-merging--git-merge)
10. [Rebasing — `git rebase`](#10-rebasing--git-rebase)
11. [Stashing — `git stash`](#11-stashing--git-stash)
12. [Tagging — `git tag`](#12-tagging--git-tag)
13. [Remote Repositories — `git remote`](#13-remote-repositories--git-remote)
14. [Fetching & Pulling — `git fetch` / `git pull`](#14-fetching--pulling--git-fetch--git-pull)
15. [Pushing — `git push`](#15-pushing--git-push)
16. [Undoing Changes — `git reset` / `git revert` / `git restore`](#16-undoing-changes--git-reset--git-revert--git-restore)
17. [Cherry-Picking — `git cherry-pick`](#17-cherry-picking--git-cherry-pick)
18. [Bisect — `git bisect`](#18-bisect--git-bisect)
19. [Blame & Attribution — `git blame`](#19-blame--attribution--git-blame)
20. [Submodules — `git submodule`](#20-submodules--git-submodule)
21. [Worktrees — `git worktree`](#21-worktrees--git-worktree)
22. [Reflog — `git reflog`](#22-reflog--git-reflog)
23. [Archive & Bundle — `git archive` / `git bundle`](#23-archive--bundle--git-archive--git-bundle)
24. [Hooks — `.git/hooks`](#24-hooks--githooks)
25. [Advanced & Internals — `git cat-file` / `git ls-tree` / `git gc`](#25-advanced--internals)
26. [Day-to-Day Workflows](#26-day-to-day-workflows)
27. [Reporting & Statistics](#27-reporting--statistics)
28. [Searching & Finding](#28-searching--finding)
29. [Useful Git Aliases](#29-useful-git-aliases)
30. [.gitignore Patterns](#30-gitignore-patterns)
31. [Troubleshooting & Common Errors](#31-troubleshooting--common-errors)
32. [Git LFS — Large File Storage](#32-git-lfs--large-file-storage)
33. [Q&A — Conceptual Questions](#qa--conceptual-questions)

---

## 1. Configuration — `git config`

Git configuration is stored at three scopes — later scopes override earlier ones.

| Scope    | Flag       | File location                              |
|----------|------------|--------------------------------------------|
| system   | `--system` | `/etc/gitconfig`                           |
| global   | `--global` | `~/.gitconfig` or `~/.config/git/config`   |
| local    | `--local`  | `.git/config` (default when inside a repo) |

### Essential first-time setup

```bash
git config --global user.name  "Jane Smith"
git config --global user.email "jane@example.com"

# Use VS Code as the default editor (use "vim" for terminal-only environments)
git config --global core.editor "code --wait"

git config --global init.defaultBranch main

# Use merge strategy when pulling (set to true to rebase instead)
git config --global pull.rebase false

# Normalize line endings to LF on commit; use 'true' on Windows
git config --global core.autocrlf input
```

### Listing and querying

```bash
# Show all resolved config values from all scopes
git config --list

# Same as above but also shows which file each value comes from
git config --list --show-origin

# Read a single key
git config user.email

# Read a multi-value key (e.g. aliases that have been set multiple times)
git config --global --get-all alias.st
```

### Useful aliases

```bash
# Short status with branch info
git config --global alias.st  "status -sb"

# Pretty one-line graph of all branches
git config --global alias.lg  "log --oneline --graph --decorate --all"

# Undo last commit but keep changes unstaged
git config --global alias.undo "reset HEAD~1 --mixed"

# Stage everything and commit as WIP in one shot
git config --global alias.wip  "!git add -A && git commit -m 'WIP'"
```

### Credential helpers

```bash
# Store credentials in a plaintext file (not recommended for production machines)
git config --global credential.helper store

# Cache credentials in memory for 15 minutes (default timeout)
git config --global credential.helper cache

# Use macOS Keychain to store credentials securely
git config --global credential.helper osxkeychain
```

### Conditional includes (e.g. work vs personal)

```ini
# ~/.gitconfig
[includeIf "gitdir:~/work/"]
    path = ~/.gitconfig-work
```

---

## 2. Repository Initialization — `git init` / `git clone`

### `git init`

Creates a new empty repository (or reinitializes an existing one).

```bash
# Initialize a repo in the current directory
git init

# Create a new directory called my-project and initialize a repo inside it
git init my-project

# Create a bare repo (no working tree) — used as a server-side remote
git init --bare repo.git

# Set the initial branch name (requires git ≥ 2.28)
git init --initial-branch main
```

### `git clone`

Clones a remote repository locally. Downloads all branches, tags, and history.

```bash
# Clone over HTTPS
git clone https://github.com/org/repo.git

# Clone over SSH (requires SSH key set up)
git clone git@github.com:org/repo.git

# Clone a local repository
git clone /path/to/local/repo

# Shallow clone — download only the latest commit (fast for CI bootstrapping)
git clone --depth 1 <url>

# Check out a specific branch after cloning
git clone --branch develop <url>

# Download only one branch (no other branch history)
git clone --single-branch --branch main <url>

# Also initialize and clone all nested submodules
git clone --recurse-submodules <url>

# Bare clone including all refs — useful for full backups
git clone --mirror <url>

# Clone into a custom directory name instead of the repo name
git clone <url> my-custom-dir
```

---

## 3. Staging & Snapshot — `git add` / `git rm` / `git mv`

The **index** (staging area) is the draft for your next commit. You compose the snapshot explicitly before committing.

### `git add`

```bash
# Stage a specific file
git add <file>

# Stage everything in the current directory tree (new, modified, deleted)
git add .

# Stage all changes across the whole repo including deletions
git add -A

# Interactively choose which hunks to stage (highly recommended for atomic commits)
git add -p

# Full interactive mode: stage, unstage, diff
git add -i

# Stage only modifications and deletions — skip new untracked files
git add -u

# Stage all JS files in the current directory
git add *.js

# Stage all TypeScript test files recursively (quote to prevent shell expansion)
git add 'src/**/*.test.ts'
```

> **`-p` workflow tip:** after `git add -p` you can choose `y` (yes), `n` (no), `s` (split hunk), `e` (edit hunk manually) for each change block. This lets you craft atomic commits even when a file has mixed changes.

### `git rm`

```bash
# Delete file from disk AND stage the deletion
git rm <file>

# Remove from index only — keeps the file on disk (useful to stop tracking a file)
git rm --cached <file>

# Remove a directory and all its contents recursively
git rm -r dist/

# Force remove even if the file has local modifications
git rm --force <file>
```

### `git mv`

```bash
# Rename a file — stages the deletion of the old name and addition of the new name
git mv old_name.js new_name.js

# Move a file to a different directory
git mv src/utils.js lib/utils.js
```

Git tracks renames by similarity (no explicit rename metadata), but `git mv` keeps the staging clean.

---

## 4. Committing — `git commit`

### Basic usage

```bash
# Commit staged changes with an inline message
git commit -m "feat: add login endpoint"

# Open $EDITOR to write the commit message (allows multi-line)
git commit

# Auto-stage all tracked modified files and commit in one step
git commit -a -m "fix: correct off-by-one"

# Create a commit with no file changes (useful to trigger CI)
git commit --allow-empty -m "trigger CI"
```

### Amending

```bash
# Reword the last commit message or add currently staged changes into it
git commit --amend

# Amend the last commit without changing the message
git commit --amend --no-edit

# Update the author name/email/timestamp after changing git config
git commit --amend --reset-author
```

> **Warning:** `--amend` rewrites history. Only use on commits not yet pushed to a shared branch.

### Commit message conventions (Conventional Commits)

```
<type>(<scope>): <short summary>

[optional body]

[optional footer — BREAKING CHANGE: ..., Closes #123]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`, `perf`

### Signing commits

```bash
# Always GPG-sign all commits automatically
git config --global commit.gpgsign true

# Sign a single commit explicitly
git commit -S -m "signed commit"

# Use an SSH key for signing instead of GPG (requires git ≥ 2.34)
git config --global gpg.format ssh
```

---

## 5. Inspection & Status — `git status` / `git diff` / `git show`

### `git status`

```bash
# Full status output showing staged, unstaged, and untracked files
git status

# Short format: two-letter code followed by filename
git status -s

# Short format plus current branch and upstream tracking info
git status -sb

# Also show files that are being ignored via .gitignore
git status --ignored
```

**Short format legend:** first column = index, second = working tree. `M` modified, `A` added, `D` deleted, `?` untracked, `!` ignored.

### `git diff`

```bash
# Show unstaged changes (working tree vs index)
git diff

# Show staged changes (index vs last commit); --cached is an alias
git diff --staged

# Show all changes — staged and unstaged — compared to last commit
git diff HEAD

# Show changes introduced in the last 3 commits
git diff HEAD~3

# Show what feature has that main doesn't (two-dot = tip-to-tip)
git diff main..feature

# Show only changes made on feature since it diverged from main (three-dot)
git diff main...feature

# Diff a specific file between two commits
git diff <commit> <commit> -- <file>

# Summary of which files changed and how many lines
git diff --stat

# Word-level diff instead of line-level (great for prose or config)
git diff --word-diff

# Show diff with zero context lines (very compact output)
git diff -U0
```

### `git show`

```bash
# Show the last commit with its full diff
git show

# Show any commit by hash, branch, or tag
git show <commit>

# Print the content of a file at a specific revision
git show HEAD:src/main.go

# Show metadata and diff for an annotated tag
git show v2.3.1

# Show commit metadata and file-change summary only (no diff)
git show --stat <commit>
```

---

## 6. Log & History — `git log`

### Common formats

```bash
# Full log with author, date, and message
git log

# One line per commit: short hash + subject
git log --oneline

# ASCII branch graph showing all branches and tags
git log --oneline --graph --all

# Custom format: full hash, author name, subject
git log --format="%H %an %s"

# Full author and committer dates
git log --format=fuller
```

### Filtering

```bash
# Show only the last 10 commits
git log -n 10

# Show commits from the last two weeks
git log --since="2 weeks ago"

# Show commits before a specific date
git log --until="2024-01-01"

# Filter by author name (substring match, case-insensitive)
git log --author="Jane"

# Filter by commit message using a regex
git log --grep="fix"

# Pickaxe: find commits that added or removed a specific string
git log -S "queryUserById"

# Pickaxe regex variant: find commits where a matching line count changed
git log -G "queryUser.*"

# Show only commits that touched a specific path
git log -- src/api/

# Follow file history across renames
git log --follow src/api/user.ts

# Show only merge commits
git log --merges

# Exclude merge commits
git log --no-merges

# Show only the first-parent (main line) — hides merged branch commits
git log --first-parent main
```

### Ranges

```bash
# Commits in feature that are not in main
git log main..feature

# Commits in either branch but not both (symmetric difference)
git log main...feature

# Equivalent to main..feature using the exclusion operator
git log ^main feature

# Show only the last 5 commits
git log HEAD~5..HEAD
```

### Stat / patch modes

```bash
# Show which files changed and how many lines per commit
git log --stat

# Include the full diff for every commit
git log -p

# Full history and diff for a single file, following renames
git log -p --follow -- <file>

# Show only commits where files were deleted
git log --diff-filter=D
```

---

## 7. Branching — `git branch`

### List branches

```bash
# List local branches; current branch is marked with *
git branch

# List remote-tracking branches
git branch -r

# List all local and remote-tracking branches
git branch -a

# List local branches with the last commit hash and message
git branch -v

# List local branches with upstream tracking info and ahead/behind counts
git branch -vv

# List branches that have already been merged into main
git branch --merged main

# List branches that have NOT yet been merged into main
git branch --no-merged main
```

### Create and delete

```bash
# Create a branch at HEAD without switching to it
git branch feature/login

# Create a branch at a specific commit
git branch feature/login <sha>

# Delete branch safely — refuses if the branch is not yet merged
git branch -d feature/login

# Force delete regardless of merge status
git branch -D feature/login

# Rename a local branch
git branch -m old-name new-name

# Force rename (overwrites if new name already exists)
git branch -M old-name new-name
```

### Set / change tracking upstream

```bash
# Link local main to origin/main for push/pull tracking
git branch --set-upstream-to=origin/main main

# Shorthand version of set-upstream-to
git branch -u origin/feature feature

# Remove the upstream tracking link from the current branch
git branch --unset-upstream
```

---

## 8. Checkout & Switch — `git checkout` / `git switch`

`git switch` and `git restore` were introduced in Git 2.23 to split `git checkout`'s responsibilities.

### `git switch` (recommended for branch operations)

```bash
# Switch to an existing branch
git switch main

# Create a new branch and switch to it
git switch -c feature/dark-mode

# Create a local branch that tracks a remote branch
git switch -c hotfix origin/hotfix

# Switch back to the previously checked-out branch (like cd -)
git switch -

# Enter detached HEAD state at a tag or commit
git switch --detach v1.0.0
```

### `git checkout` (legacy / still common)

```bash
# Switch to an existing branch
git checkout main

# Create a new branch and switch to it
git checkout -b feature/dark-mode

# Create a local branch that tracks a remote branch
git checkout -b hotfix origin/hotfix

# Discard ALL working-tree changes across every file (dangerous — irreversible)
git checkout --

# Discard unstaged changes to a single file
git checkout -- src/app.ts

# Restore a single file to its state at a specific commit
git checkout <sha> -- config.yaml
```

### `git restore` (recommended for file operations)

```bash
# Discard working-tree changes to a file (does not touch the index)
git restore src/app.ts

# Unstage a file — moves it back from index to working tree
git restore --staged src/app.ts

# Fully discard both staged and unstaged changes to a file
git restore --staged --worktree src/app.ts

# Restore a file's content from 2 commits ago
git restore --source=HEAD~2 config.yaml
```

---

## 9. Merging — `git merge`

### Fast-forward vs. three-way merge

```
main:    A---B
              \
feature:       C---D

git merge feature
→ Fast-forward: A---B---C---D   (no merge commit, linear history)
→ Three-way:    A---B-------E   (E is the merge commit)
                      \   /
                       C-D
```

### Commands

```bash
# Merge the feature branch into the current branch
git merge feature

# Always create a merge commit even when fast-forward is possible (preserves branch topology)
git merge --no-ff feature

# Squash all commits from feature into one staged diff — you then commit manually
git merge --squash feature

# Abort an in-progress merge that has conflicts
git merge --abort

# Continue a merge after you have resolved all conflicts
git merge --continue

# Specify a custom merge commit message
git merge -m "Merge feature/x"

# Keep current branch content entirely and discard all incoming changes
git merge --strategy=ours feature
```

### Resolving conflicts

1. Edit files — conflict markers look like:
   ```
   <<<<<<< HEAD
   your changes
   =======
   their changes
   >>>>>>> feature
   ```
2. `git add <resolved-file>`
3. `git merge --continue` or `git commit`

```bash
# Launch the configured visual merge tool for interactive conflict resolution
git mergetool

# Set vimdiff as the merge tool globally
git config --global merge.tool vimdiff
```

---

## 10. Rebasing — `git rebase`

Rebase replays commits on top of a new base, producing a linear history. **Never rebase public/shared branches.**

### Basic rebase

```bash
# Rebase the current branch onto main
git rebase main

# Rebase the feature branch onto main without switching to it first
git rebase main feature

# Rebase client onto main, excluding commits that belong to server
git rebase --onto main server client

# Abort the rebase and return to the pre-rebase state
git rebase --abort

# Continue the rebase after manually resolving a conflict
git rebase --continue

# Skip the current conflicting commit and continue with the rest
git rebase --skip
```

### Interactive rebase (`-i`)

The most powerful history-editing tool.

```bash
# Edit the last 4 commits interactively
git rebase -i HEAD~4

# Rebase from (not including) a specific commit — edit everything after it
git rebase -i <sha>
```

**Pick actions in the editor:**

| Action     | Shorthand | Effect                                              |
|------------|-----------|-----------------------------------------------------|
| `pick`     | `p`       | Keep commit as-is                                   |
| `reword`   | `r`       | Keep but edit the commit message                    |
| `edit`     | `e`       | Pause so you can amend the commit                   |
| `squash`   | `s`       | Meld into previous commit, combine messages         |
| `fixup`    | `f`       | Meld into previous commit, discard this message     |
| `drop`     | `d`       | Remove the commit                                   |
| `exec`     | `x`       | Run a shell command after this commit               |
| `break`    | `b`       | Pause here                                          |

**Example: squash last 3 commits**
```bash
git rebase -i HEAD~3
# change pick → squash for commits 2 and 3
# edit combined message → save → done
```

### `--autosquash` with fixup commits

```bash
# Create a "fixup! <original message>" commit that targets a specific commit
git commit --fixup <sha>

# Automatically reorder and squash all fixup!/squash! commits during rebase
git rebase -i --autosquash HEAD~5
```

---

## 11. Stashing — `git stash`

Save and restore uncommitted work without committing.

```bash
# Stash all tracked modified and staged files
git stash

# Stash with a descriptive label for easy identification later
git stash push -m "WIP login form"

# Include untracked files in the stash
git stash push -u

# Include untracked and ignored files in the stash
git stash push -a

# Stash only a specific file instead of all changes
git stash push -- src/form.ts

# Show all stash entries with their index and label
git stash list

# Show the diff summary of the most recent stash
git stash show

# Show the full diff of a specific stash entry
git stash show -p stash@{1}

# Apply the most recent stash and remove it from the stash list
git stash pop

# Apply a specific stash entry without removing it from the list
git stash apply stash@{2}

# Delete a specific stash entry
git stash drop stash@{1}

# Delete every stash entry permanently
git stash clear

# Create a new branch from the stash state and apply the stash to it
git stash branch new-branch
```

> **Tip:** stashes are stored as commits on a hidden refs/stash ref. They survive branch switches but are local — not pushed.

---

## 12. Tagging — `git tag`

Tags are named pointers to commits. **Annotated tags** are full objects (message, tagger, date); **lightweight tags** are just refs.

```bash
# List all tags
git tag

# List tags matching a pattern
git tag -l "v1.*"

# Create a lightweight tag at HEAD (just a pointer, no extra metadata)
git tag v1.0.0

# Create an annotated tag with a message (recommended for releases)
git tag -a v1.0.0 -m "Release v1.0.0"

# Create an annotated tag at a specific past commit
git tag -a v1.0.0 <sha>

# Create a GPG-signed tag
git tag -s v1.0.0 -m "Signed"

# Delete a tag from the local repo
git tag -d v1.0.0

# Push a specific tag to the remote
git push origin v1.0.0

# Push all local tags to the remote at once
git push origin --tags

# Delete a tag from the remote
git push origin :refs/tags/v1.0.0

# Verify the GPG signature on a signed tag
git tag -v v1.0.0
```

---

## 13. Remote Repositories — `git remote`

```bash
# List the names of all configured remotes
git remote

# List remotes with their fetch and push URLs
git remote -v

# Add a new remote named origin
git remote add origin https://github.com/org/repo.git

# Add the original repo as upstream (common when working with forks)
git remote add upstream git@github.com:upstream/repo.git

# Rename a remote
git remote rename origin old-origin

# Remove a remote entirely
git remote remove upstream

# Change the URL of an existing remote
git remote set-url origin git@github.com:org/repo.git

# Print the current URL for a remote
git remote get-url origin

# Remove stale remote-tracking refs for branches deleted on the remote
git remote prune origin

# Show detailed info: fetch/push URLs, tracked branches, ahead/behind status
git remote show origin
```

---

## 14. Fetching & Pulling — `git fetch` / `git pull`

### `git fetch`

Downloads remote objects and refs **without touching your working tree or local branches**.

```bash
# Fetch from the default remote (origin)
git fetch

# Fetch from a specific remote explicitly
git fetch origin

# Fetch from every configured remote at once
git fetch --all

# Fetch and automatically remove stale remote-tracking refs
git fetch --prune

# Fetch only the main branch ref (no other branches)
git fetch origin main

# Fetch a GitHub pull request into a local branch named pr-42
git fetch origin refs/pull/42/head:pr-42
```

### `git pull`

`git pull` = `git fetch` + integration (merge or rebase).

```bash
# Fetch and merge the upstream branch into the current branch
git pull

# Fetch and rebase instead of merging (produces cleaner linear history)
git pull --rebase

# Fetch and start an interactive rebase
git pull --rebase=interactive

# Fetch but fail if the result is not a fast-forward (safe default for main)
git pull --ff-only

# Pull from an explicit remote and branch
git pull origin main

# Fetch and merge but do not automatically create the merge commit
git pull --no-commit
```

> **Best practice:** prefer `git pull --rebase` for feature branches; use `--ff-only` on main to guard against accidental merges.

---

## 15. Pushing — `git push`

```bash
# Push the current branch to its configured upstream
git push

# Push a specific branch to a specific remote explicitly
git push origin main

# Push and set the upstream tracking reference at the same time
git push -u origin feature/login

# Push all local branches to the remote
git push --all origin

# Push all local tags to the remote
git push --tags

# Delete a remote branch
git push origin --delete feature/login

# Delete a remote branch using the empty-source shorthand
git push origin :feature/login

# Force push but fail if the remote has commits you have not fetched yet
git push --force-with-lease

# Force push — overwrites remote history regardless (dangerous)
git push --force

# Preview what would be pushed without actually sending anything
git push --dry-run
```

> **`--force-with-lease` is always preferred over `--force`** — it prevents accidentally overwriting a collaborator's commits.

---

## 16. Undoing Changes — `git reset` / `git revert` / `git restore`

### `git reset`

Moves HEAD (and optionally the index and working tree) to a different commit. **Rewrites local history — do not use on shared branches.**

```bash
# Undo the last commit; keep all changes staged in the index
git reset --soft HEAD~1

# Undo the last commit; keep changes in the working tree but unstage them (default)
git reset --mixed HEAD~1

# Undo the last commit and permanently discard all changes
git reset --hard HEAD~1

# Discard all uncommitted changes — staged and unstaged — without moving HEAD
git reset --hard HEAD

# Reset to any commit using mixed mode (unstage everything after that point)
git reset <sha>

# Unstage a specific file (older syntax; prefer git restore --staged)
git reset HEAD <file>
```

**Mode comparison:**

| Mode      | HEAD | Index | Working tree |
|-----------|------|-------|--------------|
| `--soft`  | ✓    | —     | —            |
| `--mixed` | ✓    | ✓     | —            |
| `--hard`  | ✓    | ✓     | ✓            |

### `git revert`

Creates a **new commit** that undoes an existing commit. Safe for shared branches.

```bash
# Create a new commit that reverses the last commit
git revert HEAD

# Revert any commit by its hash
git revert <sha>

# Revert a range of commits — creates one revert commit per original commit
git revert HEAD~3..HEAD

# Apply the revert changes to the index without committing (lets you batch reverts)
git revert --no-commit <sha>

# Revert a merge commit; -m 1 means keep the first parent's line of history
git revert -m 1 <merge-sha>
```

### `git restore` — see [Section 8](#8-checkout--switch--git-checkout--git-switch)

---

## 17. Cherry-Picking — `git cherry-pick`

Apply the changes introduced by one or more commits onto the current branch, creating new commits.

```bash
# Apply a single commit from another branch
git cherry-pick <sha>

# Apply multiple specific commits in the given order
git cherry-pick abc123 def456

# Apply a range of commits (exclusive start, inclusive end)
git cherry-pick v1.2..v1.3

# Apply the changes without creating a commit (lets you edit or combine)
git cherry-pick --no-commit <sha>

# Append a "(cherry picked from commit <sha>)" line to the commit message for traceability
git cherry-pick -x <sha>

# Abort a cherry-pick that has conflicts and return to the previous state
git cherry-pick --abort

# Continue after manually resolving conflicts
git cherry-pick --continue

# Open the editor to change the commit message during the pick
git cherry-pick --edit <sha>
```

**Use case:** a bug is fixed on `main`; you need it on the `release/1.x` branch.
```bash
git switch release/1.x
git cherry-pick <fix-sha>
```

---

## 18. Bisect — `git bisect`

Binary search through history to find the commit that introduced a bug.

```bash
# Start a bisect session
git bisect start

# Mark the current commit as broken
git bisect bad

# Mark a known-good commit or tag as the last working point
git bisect good v2.1.0

# After Git checks out a midpoint commit, test it and then mark it:
git bisect good
# or
git bisect bad

# End the bisect session and return to the original HEAD
git bisect reset
```

### Automated bisect

```bash
# Start bisect from HEAD (bad) to v2.1.0 (good)
git bisect start HEAD v2.1.0

# Run a test script automatically — exit 0 = good, exit non-zero = bad
git bisect run npm test
```

> **Tip:** `git bisect run` is extremely powerful for CI-detectable regressions — Git finds the culprit in O(log N) steps automatically.

---

## 19. Blame & Attribution — `git blame`

Show which commit and author last modified each line of a file.

```bash
# Show blame for every line in the file
git blame src/app.ts

# Show blame for a specific line range only
git blame -L 40,60 src/app.ts

# Ignore whitespace-only changes when assigning blame
git blame -w src/app.ts

# Detect lines that were moved within the same file
git blame -M src/app.ts

# Detect lines that were copied from other files in the same commit
git blame -C src/app.ts

# Follow blame across file renames in history
git blame --follow src/app.ts

# Output columns: hash | author | date | line-number | content
```

---

## 20. Submodules — `git submodule`

Embed another Git repository as a dependency inside your repo.

```bash
# Add a submodule at the given path
git submodule add https://github.com/org/lib.git vendor/lib

# Add a submodule that tracks a specific branch
git submodule add -b stable <url> vendor/lib

# Clone a repo and automatically initialize all submodules
git clone --recurse-submodules <url>

# Initialize submodule config after cloning without --recurse-submodules
git submodule init

# Check out the recorded submodule commits
git submodule update

# Fetch latest upstream commits for all submodules and update them
git submodule update --remote

# Fetch and merge remote changes into each submodule's working tree
git submodule update --remote --merge

# Run a git command inside every submodule
git submodule foreach git pull origin main

# Unregister a submodule (removes its .git/config entry and working tree)
git submodule deinit vendor/lib

# Stage the removal of the submodule path
git rm vendor/lib

# Delete the submodule's git data from the repo's .git directory
rm -rf .git/modules/vendor/lib
```

---

## 21. Worktrees — `git worktree`

Check out multiple branches simultaneously in separate directories without multiple clones.

```bash
# Create a linked worktree for an existing branch in a sibling directory
git worktree add ../hotfix-1.x hotfix/1.x

# Create a new branch and a linked worktree for it at the same time
git worktree add -b new-feature ../nf

# List all worktrees (main + all linked)
git worktree list

# Remove a linked worktree (the directory and the git metadata)
git worktree remove ../hotfix-1.x

# Remove metadata for worktrees whose directories no longer exist
git worktree prune
```

> **Typical workflow:** keep `main` in the primary worktree, add a worktree for a hotfix branch, apply and push the hotfix without stashing or context-switching in your main checkout.

---

## 22. Reflog — `git reflog`

A local log of all HEAD movements. Your safety net for recovering "lost" commits after resets, rebases, or bad merges.

```bash
# Show the full HEAD reflog (most recent entries first)
git reflog

# Show the reflog for a specific branch
git reflog show main

# Show reflog entries with ISO timestamps
git reflog --date=iso

# Step 1: find the SHA of the commit you want to recover
git reflog

# Step 2a: restore HEAD to that commit (destructive — discards everything after it)
git reset --hard <sha>

# Step 2b (safer): create a new branch at the lost commit instead of resetting
git branch recovered <sha>
```

> **The reflog only exists locally** — it is not pushed. By default, entries expire after 90 days (30 days for unreachable objects).

---

## 23. Archive & Bundle — `git archive` / `git bundle`

### `git archive`

Export a snapshot without `.git/` metadata.

```bash
# Export HEAD as a gzipped tarball
git archive --format=tar.gz HEAD > release.tar.gz

# Export a tagged release as a ZIP file
git archive --format=zip v2.0.0 > v2.0.0.zip

# Export HEAD with a top-level directory prefix inside the archive
git archive --prefix=myproject/ HEAD | gzip > myproject.tar.gz

# Archive only a specific subdirectory
git archive HEAD src/
```

### `git bundle`

Pack a repo or a range of commits into a single portable file — useful when you can't push over a network.

```bash
# Create a full bundle containing all refs
git bundle create repo.bundle --all

# Create a bundle with only new commits not yet on the remote
git bundle create patch.bundle main ^origin/main

# Clone from a bundle file (receive end)
git clone repo.bundle my-repo

# Pull from a bundle file
git pull patch.bundle main

# Verify a bundle file's integrity before using it
git bundle verify repo.bundle
```

---

## 24. Hooks — `.git/hooks`

Hooks are scripts Git executes at specific lifecycle events. Put them in `.git/hooks/` (or use a tool like `husky` for team-shared hooks).

| Hook                  | When it runs                                  | Common use                              |
|-----------------------|-----------------------------------------------|-----------------------------------------|
| `pre-commit`          | Before `git commit` (after staging)           | Lint, format, run tests                 |
| `prepare-commit-msg`  | Before commit message editor opens            | Inject branch name into message         |
| `commit-msg`          | After message is entered                      | Enforce Conventional Commits format     |
| `post-commit`         | After commit succeeds                         | Notifications, local CI trigger         |
| `pre-push`            | Before `git push`                             | Run test suite, check branch policy     |
| `pre-rebase`          | Before rebase starts                          | Warn on shared branches                 |
| `post-merge`          | After a successful merge                      | Run `npm install` if package.json changed |
| `post-checkout`       | After checkout/switch                         | Update dependencies                     |

**Example: `pre-commit` hook that runs ESLint**

```bash
#!/bin/sh
# .git/hooks/pre-commit
npm run lint --silent
```

Make it executable: `chmod +x .git/hooks/pre-commit`

**Bypass hooks (use sparingly):**
```bash
# Skip all hooks — only for genuine emergencies
git commit --no-verify -m "emergency: skip hooks"
```

---

## 25. Advanced & Internals

### Garbage collection

```bash
# Run garbage collection: pack loose objects and prune unreachable ones
git gc

# More thorough GC pass — slower but produces a smaller repo (run periodically)
git gc --aggressive

# Manually prune objects that are no longer reachable from any ref
git prune

# Pack all loose refs into the packed-refs file for faster ref resolution
git pack-refs --all
```

### Investigating objects

```bash
# Print the type of any Git object: blob, tree, commit, or tag
git cat-file -t <sha>

# Pretty-print the full contents of any Git object
git cat-file -p <sha>

# List the tree entries (files and subdirectories) at HEAD
git ls-tree HEAD

# Recursively list every file tracked at HEAD
git ls-tree -r HEAD

# Compute the SHA of a file as Git would store it (without committing)
git hash-object <file>

# Count loose objects and show total on-disk size
git count-objects -v
```

### Searching content

```bash
# Search the working tree for a string (faster than system grep)
git grep "TODO"

# Search the content of a specific revision
git grep "TODO" HEAD

# Case-insensitive search with line numbers in a commit from 5 ago
git grep -n -i "auth" HEAD~5

# Show only the filenames that contain a match
git grep -l "queryUser"
```

### `git shortlog`

```bash
# List commit count per author, sorted by count descending
git shortlog -sn

# Same but exclude merge commits from the count
git shortlog -sn --no-merges
```

### `git clean`

Remove untracked files from the working tree.

```bash
# Dry run — show what would be removed without deleting anything
git clean -n

# Remove untracked files (does not touch directories)
git clean -f

# Remove untracked files and untracked directories
git clean -fd

# Remove untracked files and files ignored by .gitignore
git clean -fx
```

### `git sparse-checkout` (monorepos)

Check out only a subset of a large repository.

```bash
# Partial clone: download only metadata, no file blobs yet; enable sparse mode
git clone --filter=blob:none --sparse <url>

# Materialize only the src/backend directory in the working tree
git sparse-checkout set src/backend

# Add another path to the sparse checkout without removing existing ones
git sparse-checkout add src/shared

# Disable sparse checkout and materialize the full working tree
git sparse-checkout disable
```

### `git notes`

Attach extra metadata to a commit without changing its SHA.

```bash
# Attach a note to a specific commit
git notes add -m "Reviewed by Jane" <sha>

# Read the note attached to a commit
git notes show <sha>

# Push notes to the remote — they are NOT pushed automatically
git push origin refs/notes/commits
```

### Useful one-liners

```bash
# List every unique author email that has ever committed to this repo
git log --format="%ae" | sort -u

# Find the biggest files ever stored in git history
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | sort -k3 -rn | head

# Delete all local branches that have already been merged into main
git branch --merged main | grep -v '^\* main' | xargs git branch -d

# Show a changelog between two release tags
git log v1.1.0..v1.2.0 --oneline

# Undo the last push — force-pushes the commit before HEAD to main (use with caution)
git push --force-with-lease origin HEAD~1:main
```

---

## 26. Day-to-Day Workflows

### Quick status check

```bash
# See what branch you are on and what is staged/unstaged at a glance
git status -sb

# See only the file names that changed (no diff content)
git diff --name-only

# See only the file names that are staged
git diff --staged --name-only

# Count how many files have uncommitted changes
git diff --name-only | wc -l
```

### Undoing mistakes fast

```bash
# Throw away all local changes — staged and unstaged — and go back to last commit
git reset --hard HEAD

# Discard changes to one file without touching anything else
git restore src/app.ts

# Unstage a file you accidentally added
git restore --staged src/app.ts

# Undo the last commit but keep your changes unstaged (safe undo)
git reset --mixed HEAD~1

# Undo the last commit and keep changes staged (ready to recommit)
git reset --soft HEAD~1

# Fix the last commit message without creating a new commit
git commit --amend -m "correct message here"

# Add a forgotten file to the last commit without changing the message
git add forgotten.ts
git commit --amend --no-edit
```

### Branch housekeeping

```bash
# Delete all local branches already merged into main
git branch --merged main | grep -v '^\*\|main\|master' | xargs git branch -d

# Prune remote-tracking refs for branches deleted on the remote
git fetch --prune

# See which branches are stale (no commits in 30 days)
git for-each-ref --sort=committerdate refs/heads/ --format='%(committerdate:short) %(refname:short)'

# Rename the current branch
git branch -m new-name

# Show the name of the current branch only
git branch --show-current
```

### Comparing branches

```bash
# List commits on feature that are not yet on main
git log main..feature --oneline

# Show files that differ between two branches
git diff main..feature --name-only

# Show files that differ between two branches with change type (A/M/D)
git diff main..feature --name-status

# Count commits ahead/behind between current branch and main
git rev-list --left-right --count main...HEAD
```

---

## 27. Reporting & Statistics

### Commit activity

```bash
# Count total commits in the repo
git rev-list --count HEAD

# Count commits per author, sorted by most active
git shortlog -sn --no-merges

# Count commits per author for a date range
git shortlog -sn --no-merges --since="30 days ago"

# Show commits per day for the last 2 weeks (bar chart in terminal)
git log --since="2 weeks ago" --format="%cd" --date=short | sort | uniq -c

# Show commit count per hour of day (find peak coding hours)
git log --format="%ad" --date=format:"%H" | sort | uniq -c | sort -k2 -n

# Number of commits by each author in a specific file
git log --follow --format="%an" -- src/app.ts | sort | uniq -c | sort -rn
```

### File change statistics

```bash
# Show total lines added and removed per author (all time)
git log --numstat --format="%ae" | awk 'NF==3 {added[$0]+=$1; removed[$0]+=$2} NF==1 {author=$0}'

# Show which files have been changed the most across all commits
git log --name-only --format="" | sort | uniq -c | sort -rn | head -20

# Show the total lines added / removed for the current branch vs main
git diff --stat main

# Show a summary of changes since a specific date
git log --since="2024-01-01" --stat --no-merges | grep -E "^\s+[0-9]+ files"

# Show the total number of lines in the repo right now (tracked files)
git ls-files | xargs wc -l | tail -1
```

### Release / changelog reporting

```bash
# Show all commits between two tags (changelog format)
git log v1.1.0..v1.2.0 --oneline --no-merges

# Show commits between two tags with author and date
git log v1.1.0..v1.2.0 --format="%h %ad %an — %s" --date=short --no-merges

# Show only commits that match Conventional Commits type 'feat'
git log --oneline --no-merges --grep="^feat"

# Show only bug fixes since a tag
git log v1.1.0..HEAD --oneline --grep="^fix"

# List all tags with their creation dates
git log --tags --simplify-by-decoration --format="%d %ci" | grep "tag:"

# Show files changed between the last two tags
git diff $(git describe --tags --abbrev=0 HEAD^)..$(git describe --tags --abbrev=0) --name-status
```

### Contributor reports

```bash
# Show each author's first and last commit date
git log --format="%an %ad" --date=short | sort -k1,2 | awk '!seen[$1]++ {first[$1]=$2} {last[$1]=$2} END {for (a in first) print first[a], last[a], a}'

# Show number of files each author has ever touched
git log --name-only --format="%an" | awk '/^$/{next} !/\//&&prev{print prev; prev=""} /\//||/\.[a-z]+$/{files[author][$0]=1; next} {author=$0; prev=$0} END {for (a in files) print length(files[a]), a}' | sort -rn

# Top 10 authors by lines added
git log --shortstat --format="%an" | awk '/^$/{next} /files/{split($0,a," "); author_add[author]+=a[4]; author_del[author]+=a[6]} {author=$0} END {for (a in author_add) print author_add[a], a}' | sort -rn | head -10
```

---

## 28. Searching & Finding

### Search commit messages

```bash
# Find commits whose message contains a keyword
git log --oneline --grep="login"

# Case-insensitive message search
git log --oneline -i --grep="login"

# Find commits matching multiple terms (AND)
git log --oneline --grep="auth" --grep="token" --all-match

# Find commits matching either term (OR — default)
git log --oneline --grep="auth\|token"
```

### Search code changes (pickaxe)

```bash
# Find every commit that added or removed the string "getUserById"
git log -S "getUserById" --oneline

# Find every commit where the number of occurrences of a pattern changed
git log -G "getUserBy.*" --oneline

# Show the full diff for those commits
git log -S "getUserById" -p

# Restrict the pickaxe search to a specific file or directory
git log -S "getUserById" -- src/api/

# Find which commit introduced a specific line of code
git log -S "const maxRetries = 3" --oneline
```

### Search file contents (grep across history)

```bash
# Search for a string in the current working tree
git grep "TODO"

# Search in a specific branch or commit — does not touch your working tree
git grep "TODO" origin/main

# Case-insensitive, show line numbers
git grep -in "deprecated" HEAD

# Show only file names that match
git grep -l "hardcoded" HEAD

# Search across all commits (expensive — use sparingly on large repos)
git grep "hardcoded" $(git rev-list --all)

# Search only in a specific file type
git grep "console.log" HEAD -- "*.ts"

# Show context lines around each match
git grep -n -C 3 "queryUser" HEAD
```

### Find when a file or function changed

```bash
# Full history of a single file including renames
git log --follow -p -- src/auth/login.ts

# Show only commit titles for a file
git log --follow --oneline -- src/auth/login.ts

# Show who last changed each line of a file
git blame src/auth/login.ts

# Show blame for a specific line range
git blame -L 20,40 src/auth/login.ts

# Find the commit that deleted a file
git log --diff-filter=D --summary -- src/old-file.ts

# Find the commit that first introduced a file
git log --diff-filter=A --oneline -- src/new-feature.ts

# Show all commits that touched a directory
git log --oneline -- src/api/
```

### Find by date / author / content combination

```bash
# All commits by a specific author in the last week
git log --author="Jane" --since="1 week ago" --oneline

# All commits touching a path by a specific author
git log --author="Jane" --oneline -- src/payments/

# Find the most recently modified tracked files
git ls-files -z | xargs -0 -I{} git log -1 --format="%ai {}" -- {} | sort -r | head -20

# Find all files modified in the last commit
git diff-tree --no-commit-id -r --name-only HEAD

# Show what changed in the last 3 commits across the whole repo
git diff HEAD~3 --stat

# Find all commits that touched both file A and file B
git log --oneline -- src/auth.ts src/token.ts
```

### Find lost commits and dangling objects

```bash
# List all commits not reachable from any branch or tag (about to be GC'd)
git fsck --lost-found

# Show dangling commits with their messages (find lost work)
git fsck --unreachable | grep commit | awk '{print $3}' | xargs git log --oneline

# Find the reflog entry just before a bad reset
git reflog --since="2 hours ago"
```

---

## 29. Useful Git Aliases

Add any alias with `git config --global alias.<name> "<command>"`.
Aliases that call external shell commands must be prefixed with `!`.

### How to set and unset aliases

```bash
# Set an alias globally
git config --global alias.st "status -sb"

# Set an alias that calls a shell command (prefix with !)
git config --global alias.wip "!git add -A && git commit -m 'WIP'"

# View all currently configured aliases
git config --global --list | grep alias

# Remove an alias
git config --global --unset alias.st
```

---

### Status & inspection

```bash
# Short status with branch info — the most-used alias
git config --global alias.st "status -sb"

# Show only the names of files that differ from HEAD
git config --global alias.changed "diff --name-only HEAD"

# Show staged files only
git config --global alias.staged "diff --staged --name-only"

# Show the last commit in a compact format
git config --global alias.last "log -1 --format='%C(yellow)%h%Creset %s %C(cyan)(%an, %ar)%Creset'"
```

### Log & history

```bash
# Pretty one-line graph of all branches — the most useful log alias
git config --global alias.lg "log --oneline --graph --decorate --all"

# Detailed graph with author and relative date
git config --global alias.ll "log --graph --format='%C(yellow)%h%Creset %C(cyan)%an%Creset %s %C(green)(%ar)%Creset' --all"

# Show only my commits
git config --global alias.mine "log --oneline --author=$(git config user.email)"

# Show commits in the last 7 days
git config --global alias.week "log --oneline --since='7 days ago' --no-merges"

# Show a changelog between the last two tags
git config --global alias.changelog "!git log $(git describe --tags --abbrev=0 HEAD^)..$(git describe --tags --abbrev=0) --oneline --no-merges"

# Show which branches have been merged into main
git config --global alias.merged "branch --merged main"

# Show what changed in the last N commits (default 5)
git config --global alias.recap "log --stat --no-merges -5"
```

### Committing

```bash
# Stage all tracked files and commit
git config --global alias.ca "commit -a"

# Amend the last commit without changing its message
git config --global alias.amend "commit --amend --no-edit"

# Create a WIP commit with all current changes
git config --global alias.wip "!git add -A && git commit -m 'WIP'"

# Undo the last commit, keep changes unstaged
git config --global alias.undo "reset --mixed HEAD~1"

# Undo the last commit, keep changes staged
git config --global alias.uncommit "reset --soft HEAD~1"

# Stage all and create a fixup commit for a given SHA
git config --global alias.fixup "!f() { git add -A && git commit --fixup \$1; }; f"
```

### Branching & switching

```bash
# Create and switch to a new branch
git config --global alias.nb "switch -c"

# Switch back to previous branch (like cd -)
git config --global alias.back "switch -"

# List branches sorted by most recently committed
git config --global alias.recent "branch --sort=-committerdate --format='%(committerdate:short) %(refname:short)'"

# Delete all branches already merged into main
git config --global alias.cleanup "!git branch --merged main | grep -v '^\*\\|main\\|master' | xargs git branch -d"
```

### Remote & sync

```bash
# Fetch and prune stale remote-tracking refs in one step
git config --global alias.fp "fetch --prune"

# Pull with rebase and auto-stash any local changes
git config --global alias.up "pull --rebase --autostash"

# Push current branch and set upstream in one step
git config --global alias.pub "!git push -u origin $(git branch --show-current)"

# Force push safely (fails if remote has new commits you haven't fetched)
git config --global alias.fpush "push --force-with-lease"
```

### Diff & review

```bash
# Diff staged changes — what will go into the next commit
git config --global alias.ds "diff --staged"

# Word-level diff for prose or config files
git config --global alias.dw "diff --word-diff"

# Show a stat summary of all uncommitted changes
git config --global alias.diffstat "diff --stat HEAD"

# Show changes between this branch and main (what the PR adds)
git config --global alias.pr-diff "diff main..."
```

### Stash shortcuts

```bash
# Save a stash with a message
git config --global alias.ss "stash push -m"

# List stashes with index
git config --global alias.sl "stash list"

# Apply the latest stash and remove it
git config --global alias.sp "stash pop"

# Drop the latest stash without applying
git config --global alias.sd "stash drop"
```

### Searching

```bash
# Find commits that introduced or removed a string
git config --global alias.find "log -S"

# Search commit messages for a keyword
git config --global alias.search "log --oneline --grep"

# Show who last changed each line of a file
git config --global alias.who "blame -w"
```

### Utility

```bash
# Show the root directory of the current repo
git config --global alias.root "rev-parse --show-toplevel"

# Show the current branch name only
git config --global alias.current "branch --show-current"

# Count total commits in the repo
git config --global alias.count "rev-list --count HEAD"

# Show all contributors and their commit counts
git config --global alias.contributors "shortlog -sn --no-merges"

# Show the 10 most recently modified files
git config --global alias.newest "!git ls-files -z | xargs -0 -I{} git log -1 --format='%ai {}' -- {} | sort -r | head -10 | awk '{print $1, $4}'"

# Dry-run a push to see what would be sent
git config --global alias.pushcheck "push --dry-run"

# Open the repo's remote URL in the browser (macOS/Linux)
git config --global alias.open "!open $(git remote get-url origin)"
```

### Paste-ready `.gitconfig` block

Copy the `[alias]` block below into your `~/.gitconfig` to load all aliases at once:

```ini
[alias]
    # Status & inspection
    st         = status -sb
    changed    = diff --name-only HEAD
    staged     = diff --staged --name-only
    last       = log -1 --format='%C(yellow)%h%Creset %s %C(cyan)(%an, %ar)%Creset'

    # Log & history
    lg         = log --oneline --graph --decorate --all
    ll         = log --graph --format='%C(yellow)%h%Creset %C(cyan)%an%Creset %s %C(green)(%ar)%Creset' --all
    mine       = !git log --oneline --author=$(git config user.email)
    week       = log --oneline --since='7 days ago' --no-merges
    recap      = log --stat --no-merges -5
    merged     = branch --merged main

    # Committing
    ca         = commit -a
    amend      = commit --amend --no-edit
    wip        = !git add -A && git commit -m 'WIP'
    undo       = reset --mixed HEAD~1
    uncommit   = reset --soft HEAD~1

    # Branching
    nb         = switch -c
    back       = switch -
    recent     = branch --sort=-committerdate --format='%(committerdate:short) %(refname:short)'
    cleanup    = !git branch --merged main | grep -v '^\\*\\|main\\|master' | xargs git branch -d

    # Remote & sync
    fp         = fetch --prune
    up         = pull --rebase --autostash
    pub        = !git push -u origin $(git branch --show-current)
    fpush      = push --force-with-lease

    # Diff & review
    ds         = diff --staged
    dw         = diff --word-diff
    diffstat   = diff --stat HEAD
    pr-diff    = diff main...

    # Stash
    ss         = stash push -m
    sl         = stash list
    sp         = stash pop
    sd         = stash drop

    # Searching
    find       = log -S
    search     = log --oneline --grep
    who        = blame -w

    # Utility
    root       = rev-parse --show-toplevel
    current    = branch --show-current
    count      = rev-list --count HEAD
    contributors = shortlog -sn --no-merges
    pushcheck  = push --dry-run
```

---

## 30. `.gitignore` Patterns

### How `.gitignore` works

Git checks multiple ignore files in order of precedence (lowest → highest):

| File | Scope | Notes |
|------|-------|-------|
| `~/.config/git/ignore` | Global (all repos) | Editors, OS noise, personal tools |
| `.gitignore` in repo root | Whole repo | Committed — shared with team |
| `.gitignore` in subdirectory | That subtree only | Overrides parent for its paths |
| `.git/info/exclude` | Local repo only | Not committed — personal overrides |

### Pattern syntax

```gitignore
# This is a comment

# Ignore a specific file anywhere in the repo
secret.env

# Ignore all .log files anywhere
*.log

# Ignore a specific directory anywhere
node_modules/

# Ignore a file only at the repo root (leading slash = anchored)
/config.local.js

# Ignore a directory only at the repo root
/dist/

# Ignore everything inside a directory but keep the directory itself
logs/*
!logs/.gitkeep

# Negate a pattern — track this file even though *.env is ignored
!.env.example

# Match any single character
debug?.log

# Match a range of characters
file[0-9].txt

# Match any path depth (double-star)
**/generated/*.js

# Ignore files in any subdirectory named temp
**/temp/
```

> **Negation rule:** a negated pattern (`!`) only works if its parent directory is not itself ignored. You cannot un-ignore a file inside an ignored directory.

### Global gitignore (OS & editor noise)

```bash
# Point git to a global ignore file
git config --global core.excludesFile ~/.gitignore_global
```

**`~/.gitignore_global` starter:**

```gitignore
# macOS
.DS_Store
.AppleDouble
.LSOverride

# Windows
Thumbs.db
ehthumbs.db
Desktop.ini

# Linux
*~

# Editors & IDEs
.vscode/
.idea/
*.suo
*.user
*.swp
*.swo
*~

# Logs & temp
*.log
*.tmp
*.bak

# Environment files
.env
.env.local
.env.*.local
```

### Common project patterns

```gitignore
# Node.js
node_modules/
npm-debug.log*
.npm
dist/
build/
coverage/
.nyc_output/

# Python
__pycache__/
*.py[cod]
*.egg-info/
.venv/
venv/
dist/
build/
.pytest_cache/
.mypy_cache/

# Java / Maven / Gradle
target/
*.class
*.jar
*.war
.gradle/
build/

# Go
/vendor/
*.exe
*.test
/bin/

# Docker
.dockerignore   # (this file itself is fine to commit)
docker-compose.override.yml

# Terraform
.terraform/
*.tfstate
*.tfstate.backup
*.tfvars        # may contain secrets
```

### Debugging ignore rules

```bash
# Check whether a file is ignored and which rule is responsible
git check-ignore -v src/generated/schema.ts

# List all currently ignored files in the repo
git ls-files --ignored --exclude-standard

# List all untracked files (including those that would be ignored)
git status --ignored

# Show every file git is tracking right now
git ls-files
```

### Removing a tracked file that should be ignored

```bash
# Stop tracking the file without deleting it from disk
git rm --cached path/to/file

# Stop tracking an entire directory
git rm --cached -r path/to/dir/

# Then add the pattern to .gitignore and commit both changes
echo "path/to/file" >> .gitignore
git add .gitignore
git commit -m "chore: untrack file and add to .gitignore"
```

---

## 31. Troubleshooting & Common Errors

---

### "My branch has diverged from the remote"

**Symptom:** `git pull` says _"your branch and 'origin/main' have diverged"_ or push is rejected with _"non-fast-forward"_.

**Cause:** you and someone else both committed since the last sync.

```bash
# Option A — rebase your commits on top of the remote (recommended for feature branches)
git pull --rebase

# Option B — create a merge commit (safe, preserves both histories)
git pull --no-rebase

# Option C — inspect first, then decide
git fetch
git log HEAD..origin/main --oneline    # what the remote has that you don't
git log origin/main..HEAD --oneline    # what you have that the remote doesn't
```

---

### "I committed to the wrong branch"

**Scenario:** you made commits on `main` that should be on a new feature branch.

```bash
# Step 1 — create the correct branch at the current position
git branch feature/my-work

# Step 2 — move main back to where it was before your commits
git reset --hard origin/main

# Step 3 — switch to the correct branch (your commits are already there)
git switch feature/my-work
```

**Scenario:** you need to move commits from one existing branch to another.

```bash
# Note the SHAs of the commits you want to move
git log --oneline -5

# Switch to the correct target branch
git switch correct-branch

# Cherry-pick the commits over
git cherry-pick <sha1> <sha2>

# Go back and remove them from the original branch
git switch wrong-branch
git reset --hard <sha-before-your-commits>
```

---

### "I need to undo a push to a shared branch"

**Always prefer `git revert` on shared branches** — it adds a new commit that reverses the changes without rewriting history.

```bash
# Revert the last commit on the remote
git revert HEAD
git push

# Revert a specific commit (not necessarily the last)
git revert <sha>
git push

# Revert multiple commits as a single revert commit
git revert --no-commit HEAD~3..HEAD
git commit -m "revert: roll back last 3 commits"
git push
```

Only use `--force-with-lease` if you are the **sole user** of the branch and you understand the consequences:

```bash
git reset --hard HEAD~1
git push --force-with-lease
```

---

### "I accidentally deleted a branch"

The commits still exist in the reflog for 90 days.

```bash
# Find the tip of the deleted branch in the reflog
git reflog

# Look for an entry like: abc1234 HEAD@{4}: checkout: moving from deleted-branch to main

# Recreate the branch at that SHA
git branch recovered-branch abc1234

# Or switch directly to it
git switch -c recovered-branch abc1234
```

---

### "I ran `git reset --hard` and lost my work"

`--hard` changes are not truly deleted immediately — they are in the reflog.

```bash
# Find the commit SHA that HEAD was at before the reset
git reflog

# Restore it
git reset --hard <sha-before-reset>

# Or put it on a new branch to be safe
git branch rescue <sha-before-reset>
```

---

### "Merge conflict — how do I resolve it cleanly?"

```bash
# See which files have conflicts
git status

# Open each conflicted file and look for conflict markers:
#   <<<<<<< HEAD
#   your version
#   =======
#   their version
#   >>>>>>> branch-name

# After editing each file to the desired state, mark it resolved
git add <resolved-file>

# Once all conflicts are resolved, finish the merge
git merge --continue
# or just:
git commit

# If you want to abandon the merge entirely and go back to before it started
git merge --abort
```

**Use a merge tool for complex conflicts:**

```bash
# Launch the configured visual merge tool
git mergetool

# Set a tool globally (options: vimdiff, vscode, kdiff3, meld, opendiff)
git config --global merge.tool vscode
git config --global mergetool.vscode.cmd 'code --wait $MERGED'
```

**Accept one side entirely for a specific file:**

```bash
# Keep your version of a conflicted file
git checkout --ours   src/config.ts
git add src/config.ts

# Keep their version
git checkout --theirs src/config.ts
git add src/config.ts
```

---

### "Push rejected — remote contains work you do not have"

```bash
# Fetch and integrate the remote changes first
git pull --rebase

# Then push normally
git push
```

If the push is to your own feature branch and you intentionally rewrote history (e.g. after an interactive rebase):

```bash
# Safe force-push — fails if someone else pushed to this branch in the meantime
git push --force-with-lease
```

---

### "I accidentally staged a file with secrets"

```bash
# Remove the file from the index without deleting it from disk
git rm --cached .env

# Add it to .gitignore so it is never staged again
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: untrack .env"
```

If the file was already committed and pushed, the secret must be treated as **compromised**. Rotate it immediately, then scrub history:

```bash
# Scrub a file from the entire commit history (requires git ≥ 2.24)
git filter-repo --path .env --invert-paths

# Force-push all branches to overwrite the remote history
git push --force --all
git push --force --tags
```

> All collaborators must re-clone after a `filter-repo` rewrite.

---

### "Rebase went wrong — how do I abort and start over?"

```bash
# Abort an in-progress rebase and return to the state before it started
git rebase --abort

# If you already finished but it produced a bad result, use the reflog
git reflog                          # find the SHA before the rebase started
git reset --hard <pre-rebase-sha>
```

---

### "My working tree is a mess — I just want a clean state"

```bash
# Discard all tracked changes (staged + unstaged)
git reset --hard HEAD

# Remove all untracked files
git clean -fd

# Remove untracked files AND files ignored by .gitignore (nuclear option)
git clean -fdx

# Dry-run first to see what would be deleted
git clean -ndx
```

---

### "Git says a file is modified but I haven't changed it"

Usually caused by line-ending normalization or file permission changes.

```bash
# Check if it is a line-ending issue
git diff src/app.ts

# Fix line-ending normalization
git config --global core.autocrlf input     # Linux/macOS
git config --global core.autocrlf true      # Windows

# Ignore file permission changes (common in Docker mounts)
git config core.fileMode false

# Re-normalize all line endings in the repo
git add --renormalize .
git commit -m "chore: normalize line endings"
```

---

### "How do I find what caused a regression?"

Use `git bisect` to binary-search the history automatically:

```bash
git bisect start
git bisect bad                      # current commit is broken
git bisect good v2.1.0              # this version was known-good

# Git checks out a midpoint commit — test it, then:
git bisect good   # or: git bisect bad

# Repeat until git prints "<sha> is the first bad commit"
git bisect reset  # restore HEAD when done

# Automated version (script exits 0 = good, non-zero = bad)
git bisect start HEAD v2.1.0
git bisect run npm test
```

---

## 32. Git LFS — Large File Storage

Git LFS replaces large binary files in the repository with small text **pointer files** and stores the actual file content on a separate LFS server. This keeps the `.git` directory small while still versioning large assets.

### Installation

```bash
# macOS
brew install git-lfs

# Ubuntu / Debian
sudo apt-get install git-lfs

# Windows (via winget)
winget install GitHub.GitLFS

# Activate LFS for your user account (run once per machine)
git lfs install
```

### Tracking file types

```bash
# Track all PNG files with LFS — adds a rule to .gitattributes
git lfs track "*.png"

# Track multiple types at once
git lfs track "*.psd" "*.ai" "*.mp4" "*.zip"

# Track files in a specific directory
git lfs track "assets/**"

# View all currently tracked patterns
git lfs track

# Untrack a pattern (does not migrate existing files back to Git)
git lfs untrack "*.png"
```

Always commit `.gitattributes` so the rules are shared with the team:

```bash
git add .gitattributes
git commit -m "chore: track large assets with Git LFS"
```

### Cloning & pulling LFS content

```bash
# Clone a repo and download all LFS files
git clone <url>

# Clone without downloading LFS files (download on demand)
GIT_LFS_SKIP_SMUDGE=1 git clone <url>

# Download LFS files after a skip-smudge clone
git lfs pull

# Download LFS files for a specific path only
git lfs pull --include="assets/videos/"

# Fetch LFS objects without checking them out
git lfs fetch
```

### Inspecting LFS state

```bash
# List all files currently managed by LFS in the working tree
git lfs ls-files

# Show LFS status (similar to git status but LFS-aware)
git lfs status

# Show pointer file content for an LFS-tracked file
git lfs pointer --file=assets/logo.png

# Show LFS environment info and server connection details
git lfs env

# Check LFS storage usage on the remote
git lfs ls-files --size | awk '{total += $NF} END {print total/1024/1024 " MB"}'
```

### Migrating existing files to LFS

```bash
# Migrate files that match a pattern from existing history into LFS
# WARNING: rewrites history — coordinate with the team before running
git lfs migrate import --include="*.psd,*.ai" --everything

# Migrate only files above a size threshold (e.g. 10 MB)
git lfs migrate import --above=10mb --everything

# Migrate only on the current branch (safer for review first)
git lfs migrate import --include="*.mp4"

# After migration, force-push all rewritten branches
git push --force --all
git push --force --tags
```

> After a history migration, every collaborator must re-clone.

### Migrating files out of LFS (export)

```bash
# Move files back from LFS into regular git objects
git lfs migrate export --include="*.png" --everything
git push --force --all
```

### Pruning local LFS cache

```bash
# Remove LFS objects not referenced by any local branch or tag
git lfs prune

# Dry run — show what would be removed
git lfs prune --dry-run

# Also remove objects only referenced by remote branches
git lfs prune --recent
```

### Common `.gitattributes` starter

```gitattributes
# Images
*.png  filter=lfs diff=lfs merge=lfs -text
*.jpg  filter=lfs diff=lfs merge=lfs -text
*.jpeg filter=lfs diff=lfs merge=lfs -text
*.gif  filter=lfs diff=lfs merge=lfs -text
*.webp filter=lfs diff=lfs merge=lfs -text
*.psd  filter=lfs diff=lfs merge=lfs -text
*.ai   filter=lfs diff=lfs merge=lfs -text

# Audio / Video
*.mp3  filter=lfs diff=lfs merge=lfs -text
*.mp4  filter=lfs diff=lfs merge=lfs -text
*.mov  filter=lfs diff=lfs merge=lfs -text
*.wav  filter=lfs diff=lfs merge=lfs -text

# Archives & binaries
*.zip  filter=lfs diff=lfs merge=lfs -text
*.tar  filter=lfs diff=lfs merge=lfs -text
*.gz   filter=lfs diff=lfs merge=lfs -text
*.exe  filter=lfs diff=lfs merge=lfs -text
*.dll  filter=lfs diff=lfs merge=lfs -text

# ML models
*.pt   filter=lfs diff=lfs merge=lfs -text
*.onnx filter=lfs diff=lfs merge=lfs -text
*.h5   filter=lfs diff=lfs merge=lfs -text
```

---

## Q&A — Conceptual Questions

---

### Q1: What is the difference between `git pull` and `git pull --rebase`?

Both commands download changes from the remote, but they differ in how they integrate those changes into your local branch.

**`git pull` (merge strategy)**
```
Remote: A---B---C
Local:  A---B---D   (you made commit D locally)

After git pull:
A---B---C---M   (M is a merge commit combining C and D)
         \ /
          D
```
- Creates a merge commit `M` that has two parents.
- Preserves the exact history of both lines.
- History becomes non-linear — harder to read in `git log`.

**`git pull --rebase`**
```
Remote: A---B---C
Local:  A---B---D   (you made commit D locally)

After git pull --rebase:
A---B---C---D'   (D is replayed on top of C as D')
```
- Replays your local commits on top of the fetched commits.
- No merge commit — history stays linear and clean.
- Your local commit gets a new SHA (`D'`) because its parent changed.

**When to use which:**
| Situation | Recommendation |
|-----------|----------------|
| Personal feature branch | `--rebase` (keeps history clean) |
| Long-lived shared branch | merge (preserves context of parallel work) |
| Protected `main` / `master` | `--ff-only` (fail if not fast-forward) |

---

### Q2: What is `git rebase`?

Rebase takes the commits on your current branch and **replays them one by one on top of a different base commit**, as if you had started your branch from that point.

**Before rebase:**
```
main:    A---B---C
              \
feature:       D---E---F
```

**After `git rebase main` (run on feature):**
```
main:    A---B---C
                  \
feature:           D'--E'--F'
```

- `D`, `E`, `F` are rewritten as new commits `D'`, `E'`, `F'` with new SHAs.
- The branch now starts from `C` instead of `B`.
- The end result is a **linear history** with no merge commits.

**Key rule:** Never rebase commits that have already been pushed to a shared branch. Rewriting history causes problems for anyone else who has based work on those commits.

**Interactive rebase (`-i`)** additionally lets you edit, reorder, squash, or drop individual commits before they are replayed.

---

### Q3: What is a squash merge?

A squash merge collapses all commits from a feature branch into a **single commit** that is then applied to the target branch. The feature branch's individual commit history is discarded.

**Before:**
```
main:    A---B
              \
feature:       C---D---E---F
```

**After `git merge --squash feature` + `git commit`:**
```
main:    A---B---S   (S contains all changes from C+D+E+F in one commit)
```

The feature branch itself is unchanged — you must delete it manually after.

**Squash merge vs regular merge vs rebase:**

| Strategy | History | Merge commit | Feature commits visible |
|----------|---------|--------------|------------------------|
| Regular merge (`--no-ff`) | Non-linear | Yes | Yes (on branch) |
| Fast-forward merge | Linear | No | Yes (inline) |
| Squash merge | Linear | No | No (collapsed to one) |
| Rebase | Linear | No | Yes (replayed) |

**When to use squash merge:** when a feature branch has many noisy/WIP commits (`fix typo`, `temp`, `try again`) and you want the target branch to have one clean, meaningful commit per feature.

---

### Q4: What is the difference between `git merge` and `git rebase`?

Both integrate changes from one branch into another, but they produce different history shapes.

**`git merge`**
- Creates a new **merge commit** with two parents.
- Preserves the full context of when and where work was done.
- History is non-linear (branchy) but truthful.

**`git rebase`**
- Rewrites commits onto a new base — no merge commit.
- Produces a clean linear history.
- Loses the information that commits were originally on a separate branch.

```
Merge result:   A---B---C---M
                     \     /
                      D---E

Rebase result:  A---B---C---D'---E'
```

**Rule of thumb:** rebase for local cleanup before sharing; merge for integrating completed, reviewed work.

---

### Q5: What is the difference between `git reset` and `git revert`?

Both undo changes, but in fundamentally different ways.

**`git reset`**
- Moves the branch pointer backwards to a previous commit.
- **Rewrites history** — the undone commits disappear from the log.
- The undone changes can be kept (staged or unstaged) or discarded (`--hard`).
- **Only safe on local, unshared commits.**

```bash
# Before: A---B---C  (HEAD)
git reset --hard HEAD~1
# After:  A---B  (HEAD) — C is gone from history
```

**`git revert`**
- Creates a **new commit** that applies the inverse of a past commit.
- History is preserved — nothing is deleted.
- **Safe on shared/public branches.**

```bash
# Before: A---B---C  (HEAD)
git revert HEAD
# After:  A---B---C---C'  (C' undoes C's changes)
```

**Quick decision guide:**
- Commit not yet pushed → `git reset`
- Commit already pushed / on a shared branch → `git revert`

---

### Q6: What is the difference between `git fetch` and `git pull`?

**`git fetch`**
- Downloads commits, branches, and tags from the remote.
- Updates your remote-tracking refs (e.g. `origin/main`).
- **Does not touch your working tree or local branches at all.**
- Safe to run at any time — no risk of conflicts.

**`git pull`**
- Runs `git fetch` internally.
- Then immediately integrates (merge or rebase) the fetched changes into your current local branch.
- Can produce conflicts if local and remote histories diverged.

```bash
# These two are equivalent to git pull:
git fetch origin
git merge origin/main
```

**Best practice:** use `git fetch` + inspect (`git log origin/main`) + then manually merge or rebase. This gives you a chance to review what is coming in before integrating.

---

### Q7: What is a detached HEAD state?

Normally, HEAD points to a **branch name** (e.g. `main`), and that branch name points to a commit. When you commit, both HEAD and the branch pointer advance.

In **detached HEAD** state, HEAD points **directly to a commit SHA** instead of a branch name. Any commits you make are not attached to any branch and will be lost (garbage collected) once you switch away.

```bash
git checkout abc1234          # enter detached HEAD
git switch --detach v1.0.0    # detach at a tag
```

**When it happens:**
- Checking out a specific commit SHA or tag.
- During a rebase conflict (temporarily).
- After `git bisect` checks out a midpoint.

**To save work done in detached HEAD:**
```bash
# Create a branch from the current detached position before switching away
git branch my-experiment
# or
git switch -c my-experiment
```

---

### Q8: What is the difference between `git stash pop` and `git stash apply`?

Both restore a stashed snapshot to your working tree, but differ in what they do to the stash list afterward.

| Command | Applies stash | Removes from stash list |
|---------|--------------|------------------------|
| `git stash pop` | Yes | Yes (if no conflict) |
| `git stash apply` | Yes | No — entry stays |

**Use `apply` when:**
- You want to apply the same stash to multiple branches.
- You are not sure if the apply will conflict and want to keep the stash as a safety net.

**Use `pop` when:**
- You are done with the stash and want to clean up the list in one step.

Note: if `git stash pop` encounters a conflict, it applies the changes but does **not** remove the stash entry, leaving the list intact.

---

### Q9: What is the difference between a lightweight tag and an annotated tag?

**Lightweight tag**
- Just a named pointer (ref) to a commit — nothing more.
- No tagger name, email, date, or message stored.
- Stored as a simple file in `.git/refs/tags/`.

```bash
git tag v1.0.0
```

**Annotated tag**
- A full Git object stored in the object database.
- Contains: tagger identity, tagging date, a message, and optionally a GPG signature.
- Shown by `git describe` and visible in `git log --decorate`.

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
```

**When to use which:**
- Use **annotated** tags for releases — they carry authorship metadata and can be signed.
- Use **lightweight** tags for personal/temporary local bookmarks.

---

### Q10: What is `git cherry-pick` and when should you use it?

`git cherry-pick` takes the diff introduced by a specific commit and applies it as a **new commit** on the current branch. It copies a commit's changes without merging the entire branch history.

```
main:    A---B---C---D
              \
release:       E---F

# A critical bug fix is in commit C (on main).
# You need it on release without merging all of main.

git switch release
git cherry-pick C

release: E---F---C'   (C' = same changes as C, new SHA)
```

**Good use cases:**
- Backporting a bug fix to a maintenance/release branch.
- Pulling a single useful commit from an abandoned branch.
- Applying a hotfix committed directly on `main` to a `release` branch.

**Avoid cherry-pick when:** the fix depends on other commits not present in the target branch — you will get conflicts or wrong behavior. In that case, merge or rebase the whole branch instead.

---

### Q11: What is the difference between `git diff main..feature` and `git diff main...feature`?

**Two-dot (`..`) — tip-to-tip diff**
- Shows the difference between the tip of `main` and the tip of `feature`.
- Equivalent to: what does `feature` have that `main` doesn't **right now**.
- If `main` has advanced since the branch diverged, those new `main` commits are included in the comparison.

**Three-dot (`...`) — common-ancestor diff**
- Shows only the changes made **on `feature` since it diverged from `main`**.
- Uses the merge base (common ancestor) as the left side.
- Ignores any new commits that landed on `main` after the branch was created.
- This is what GitHub's pull request diff shows.

```
Diagram:
A---B---C---D    (main)
     \
      E---F      (feature)

Two-dot (main..feature):   D vs F  (includes C and D from main side)
Three-dot (main...feature): B vs F  (only what feature added since B)
```

**Rule of thumb:** use `...` (three-dot) to review what a PR actually adds; use `..` (two-dot) to compare branch tips directly.

---

### Q12: What is `git reflog` and why is it useful?

The reflog is a **local journal** that records every time HEAD or any branch pointer moved — commits, resets, rebases, merges, cherry-picks, checkouts. It is your last line of defense when you think you have lost commits.

```bash
git reflog
# Output:
# abc1234 HEAD@{0}: reset: moving to HEAD~1
# def5678 HEAD@{1}: commit: feat: add login
# ...
```

**Recovery scenario — you ran `git reset --hard` by mistake:**
```bash
git reflog                        # find the SHA before the reset
git reset --hard def5678          # go back to it
# or
git branch recovered def5678      # safer: put it on a new branch first
```

**Key facts:**
- The reflog is **local only** — it is never pushed or cloned.
- Entries expire after 90 days by default (30 days for unreachable objects).
- It records events even if the commits are no longer reachable from any branch or tag.

---

### Q13: When should you use `git rebase --onto`?

`git rebase --onto` is used when you want to move a range of commits onto a new base, **excluding** commits from an intermediate branch.

**Scenario:** you created `client` off `server`, but now `server` is not ready and you want to move only `client`'s commits directly onto `main`.

```
Before:
main:   A---B
              \
server:        C---D
                    \
client:              E---F

git rebase --onto main server client

After:
main:   A---B---E'---F'
              \
server:        C---D   (unchanged)
```

The syntax is: `git rebase --onto <new-base> <upstream> <branch>`
- `<new-base>` — where to transplant the commits
- `<upstream>` — the commits after this point are replayed (excluded)
- `<branch>` — which branch to move (defaults to current if omitted)

---

### Q14: What is the difference between `git clone` and `git fork`?

**`git clone`**
- A Git operation: creates a local copy of a repository on your machine.
- Sets up `origin` pointing to the source URL.
- Works with any Git repo — local or remote.

**Fork**
- A hosting-platform concept (GitHub, GitLab, Bitbucket), not a Git command.
- Creates a **server-side copy** of a repo under your own account.
- Lets you push changes to your own copy and then open a pull request to the original.
- The fork and the original are separate repos on the server; you clone your fork locally.

**Typical open-source contribution flow:**
```
1. Fork the repo on GitHub (server-side copy → your account)
2. git clone git@github.com:you/repo.git   (local copy of your fork)
3. git remote add upstream git@github.com:original/repo.git
4. Make changes, push to your fork
5. Open a pull request from your fork to the original
```

---

### Q15: What is a fast-forward merge and when does it happen?

A fast-forward merge happens when the target branch has **not diverged** from the source branch — i.e., the target is a direct ancestor of the source. Git simply moves the branch pointer forward without creating a merge commit.

```
Before:
main:    A---B
              \
feature:       C---D

# main has no new commits since feature branched off B.
git switch main
git merge feature

After (fast-forward):
main:    A---B---C---D   (pointer just moved forward)
# No merge commit created.
```

If `main` had a new commit after `B`, a three-way merge commit would be required instead.

**Force a merge commit even when fast-forward is possible:**
```bash
git merge --no-ff feature
```

**Prevent merging unless it is a fast-forward:**
```bash
git merge --ff-only feature    # fails if diverged — used to protect main
```

---

*Generated 2026-08-20*
