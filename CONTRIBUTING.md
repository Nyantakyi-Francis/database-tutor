# Contributing

## Get started

Install Node.js 24 LTS and Git. The existing repository is:

```sh
git clone https://github.com/Nyantakyi-Francis/database-tutor.git
cd database-tutor
npm ci
npm run dev
```

If the foundation has not been pushed yet, wait for Francis to publish it before starting from main. Read README.md and AGENTS.md for scope, contracts, and file ownership.

## Work in a feature branch

Start with a clean working tree. Commit or stash unfinished work before switching.

```sh
git switch main
git pull --ff-only origin main
git switch -c feature/lessons
```

Use feature/database, feature/assessment, or feature/interface for the corresponding owner. Reuse a name only after the previous branch has merged and been removed, or choose a small task-specific suffix.

Edit your assigned files. Coordinate before changing another owner's files, shared types, packages, or build configuration. Francis coordinates documentation; Figuelia coordinates build and integration changes.

## Check and submit

```sh
npm run typecheck
npm run build
git diff --check
git status --short
git add src/lessons
git commit -m "Add beginner database lessons"
git push -u origin feature/lessons
```

Replace the paths, branch, and message with your actual work. Stage only intended files and inspect the staged diff with git diff --cached before committing. Never commit credentials or real student records. Word/PDF references stay local.

On Windows, stop running Vite development/preview servers before rerunning npm ci; the native bundler can otherwise remain locked.

Open a pull request into main, fill in its template, link the Trello card, report actual test results, and ask another member to review. Run the affected views in a browser, including a phone-sized viewport. Add meaningful logic tests when implementing SQL results, scoring, or storage validation. Do not claim placeholder features are complete.

Keep changes small and merge regularly. Bring current main into an active branch with git fetch origin followed by git merge origin/main; resolve conflicts with the relevant owner, then rerun checks. After merging your pull request, update main and start a fresh branch for the next task. Do not push directly to main.

## Repository setup

main and origin already exist locally. Do not reinitialize Git or replace origin. Check git remote -v and confirm the destination before publishing. Repository settings, collaborators, branch protection, and hosting require access from the repository owner and have not been changed by the foundation setup.
