# Database Tutor

Nyantakyi Francis

> When bad men combine, the good must associate; else they will fall, one by one, an unpitied sacrifice, in a contemptible struggle.
>
> — Edmund Burke (1729–1797)

Figuelia Ya'Sin

>And it came to pass that I, Nephi, said unto my father: I will go and do the things which the Lord hath commanded, for I know that the Lord giveth no commandments unto the children of men, save he shall prepare a way for them that they may accomplish the thing which he commandeth them.
>
>1 Nephi 3:7

## Purpose and scope

Database Tutor is a CSE 499 beginner database learning app. The objective is to explain database concepts and let students practise basic SQL without installing database software. This repository currently provides the initial application foundation, not the finished learning activities.

The completed W02 project plan is the scope reference. Local Word/PDF planning documents are ignored by Git; put agreed changes in this README so everyone can read them.

## Requirements

- C1: six lessons on tables, records, fields, primary keys, foreign keys, and basic relationships, each with a school example.
- C2: six guided SQL exercises: two SELECT, two WHERE, two ORDER BY. Show headings, result rows, empty results, and readable errors. Include database reset. Automatic grading of arbitrary SQL is outside scope.
- C3: three quizzes with four questions each, scored results, and answer explanations.
- C4: versioned browser localStorage for completed lesson IDs and latest quiz scores; validate saved data, report storage failures, and confirm progress reset.
- C5: responsive Home, Lessons, SQL Practice, Quizzes, and Progress views, labelled controls and keyboard focus.
- E1: student-controlled SQL hints, the first enhancement priority.
- E2: optional JSON progress export/import.
- E3: optional guided INNER JOIN exercise.

Complete C1-C5 and E1 before E2 or E3. Accounts, automatic device sync, teacher dashboards, AI tutoring, and full offline support are excluded.

## Technology and setup

React, TypeScript, Vite, CSS, SQLite through sql.js/WebAssembly, browser localStorage, Git and GitHub. Use Node.js 24 LTS and npm. Exact installed versions are recorded in package-lock.json.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Other commands:

```sh
npm run typecheck
npm run build
npm run preview
npm ls --depth=0
```

The build produces dist/. CI runs installation, type checking, and the production build on pushes and pull requests. It does not yet test completed features.

## Folder structure and ownership

```text
public/                       Static assets and favicon
src/
  lessons/                    Nyantakyi Francis
    lessonData.ts
    LessonsPage.tsx
    LessonCard.tsx
  database/                   Efehi Nehikhare
    schoolData.ts
    databaseService.ts
    exercises.ts
    SqlPracticePage.tsx
    QueryResults.tsx
  assessment/                 Victor Talabi
    quizData.ts
    quizScoring.ts
    QuizzesPage.tsx
    progressStorage.ts
    ProgressPage.tsx
  interface/                  Figuelia Ya'Sin
    HomePage.tsx
    Navigation.tsx
    Layout.tsx
    ExerciseHint.tsx
    styles.css
  shared/
    types.ts                  Shared contract; coordinate changes
  App.tsx                     Figuelia Ya'Sin
  main.tsx                    Figuelia Ya'Sin
.github/
  pull_request_template.md
  workflows/ci.yml
AGENTS.md
CONTRIBUTING.md
README.md
.gitignore
index.html
package.json
package-lock.json
tsconfig.json
tsconfig.app.json
tsconfig.node.json
vite.config.ts
```

Francis also owns README.md and coordinates requirements/documentation. Figuelia coordinates shared build configuration and deployment. Efehi owns sql.js and WASM configuration. Discuss changes to another owner's files before editing. Changes to src/shared/types.ts need coordination with affected owners.

## Shared contracts

src/shared/types.ts defines Lesson, SQLExercise, SQLQueryResult, Quiz, QuizQuestion, QuizResult, and StudentProgress. IDs are stable keys, not display titles or array positions. Coordinate IDs before writing content. SQL errors use error with empty columns/rows. Quiz scores are numbers correct out of totalQuestions; completion timestamps use ISO 8601. StudentProgress version 1 stores completedLessonIds and latestQuizResults keyed by quiz ID.

The practice database is disposable and separate from progress. schoolSchema and content arrays are intentionally empty. quizScoring.ts and progressStorage.ts do not implement scoring or persistence yet. The results table and optional hint disclosure are small presentation components ready for their owners to connect.

## SQL runtime

loadSqlRuntime() in src/database/databaseService.ts initializes sql.js once and allows retry after failure. Vite imports the real node_modules/sql.js/dist/sql-wasm.wasm through ?url and emits the asset with the production bundle. There is no fake WASM file, CDN dependency, or completed school database.

Development-only runtime smoke check (browser console while npm run dev is running):

```js
const { loadSqlRuntime } = await import('/src/database/databaseService.ts')
const SQL = await loadSqlRuntime()
const db = new SQL.Database()
try {
  console.log(db.exec('SELECT 1 AS runtime_ok'))
} finally {
  db.close()
}
```

Expected columns: ['runtime_ok']; values: [[1]]. This is infrastructure verification, not a guided exercise. Production asset loading must also be checked after deployment.

## Git workflow

main is the stable integration branch. Create short-lived branches from latest main:

- Francis: feature/lessons
- Efehi: feature/database
- Victor: feature/assessment
- Figuelia: feature/interface

Open small pull requests, use the supplied template, request review, and merge regularly. Do not keep one unmerged branch for the entire project. Commit package-lock.json when dependencies change; avoid simultaneous dependency edits. See CONTRIBUTING.md for commands.

If repository settings and the GitHub plan permit it, configure a main ruleset requiring pull requests, at least one approval, resolved review conversations, and the CI build check. Block force pushes and deletion. These settings have not been changed by this setup.

## Deployment and limitations

Choose a static host as a team. Build with npm ci and npm run build, then publish dist/. Hash navigation avoids server rewrite requirements; relative asset paths support hosting in a subdirectory. Verify the actual hosted WASM request and query execution before accepting deployment. No hosting service is configured or deployed by this setup.

Lessons, exercises, quizzes, scoring, and saved progress remain unimplemented. The progress view describes planned behavior; it does not currently save anything. Browser-local progress will belong to the same browser and site and can be lost when browser data is cleared. No real student data should be included.

## Sprint outline

1. Foundation, agreed IDs/contracts, then owner-led query and save/restore demonstrations and starter deployment.
2. Six lessons, six SQL exercises, results/errors, database reset, lesson completion, and E1 hints.
3. Quizzes, scores, progress/reset, responsive layouts, and complete learning-flow checks.
4. Core/E1 acceptance checks, fixes, final deployment, documentation, and demonstration. Attempt E2/E3 only if time remains.

The foundation alone does not complete Sprint 1: its storage demonstration and deployed runtime check remain team tasks.

## Foundation verification (5 November 2026)

Installed versions: React/React DOM 19.3.1, Vite 8.3.6, TypeScript 7.0.2, sql.js 1.15.2, @vitejs/plugin-react 6.2.1; @types/react and @types/react-dom 19.3.0, @types/sql.js 1.4.11, @types/node 26.6.6. Setup environment: Node.js 24.14.0, npm 11.9.0.

A clean npm ci, type checking, and production build passed. Playwright with Chromium checked all five views in development and production preview at 1366x900 and 390x844, active navigation, the home lesson link, reload of a hash route, unknown-route fallback, keyboard skip-link focus, absence of horizontal overflow, and browser error logs. Screenshots were reviewed. The development browser executed SELECT 1 AS runtime_ok against the real loaded WASM runtime and returned 1. The production build emitted the real WASM file, and preview served a valid WebAssembly binary. SQL Practice initializes that same runtime; actual query UI remains deferred.

The Browser plugin/skill was not available, so temporary Playwright checks were used outside the repository. These checks do not cover finished learning features, other browsers, normal browser-restart persistence, GitHub Actions execution, or an externally hosted deployment. Package installation reported no vulnerabilities at setup time.

## Publish the foundation

Git already has commits, main, and origin pointing to https://github.com/Nyantakyi-Francis/database-tutor.git. The setup has not committed or pushed anything. To create the first foundation commit locally after reviewing it:

```sh
git add .gitignore .github AGENTS.md CONTRIBUTING.md README.md index.html package.json package-lock.json public src tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts
git diff --cached --stat
git diff --cached
git commit -m "Set up Database Tutor team foundation"
```

No remote connection command is needed. Before an authorized push, inspect git remote -v and git fetch origin, then compare git log --oneline --left-right main...origin/main. If the remote has newer commits, integrate them and rerun checks before publishing. Once synchronized and approved, git push -u origin main publishes the foundation (or use a setup branch and pull request if main is protected). Never force-push to bypass a rejected update.
