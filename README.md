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

Database Tutor is a CSE 499 beginner database learning app. The objective is to explain database concepts and let students practise basic SQL without installing database software. The current local app has six interactive lessons, six guided SQL exercises with hints, three scored quizzes with explanations, and saved lesson completion and latest quiz results. See the Sprint 3 acceptance record below for the revision, checks, and verification limits.

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
npm test
npm run preview
npm ls --depth=0
```

The build produces dist/. CI runs installation, type checking, and the production build on pushes and pull requests. Run `npm test` locally; CI does not yet run the test suite.

## Folder structure and ownership

```text
public/                       Static assets and favicon
src/
  lessons/                    Nyantakyi Francis
    lessonData.ts
    LessonsPage.tsx
    LessonCard.tsx
    lessonContent.ts          Presents examples as tables and separates check answers
    lessonContent.test.ts
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

The practice database is disposable and separate from progress. `schoolSchema` contains fictional Students, Subjects, and Scores tables. SQL Practice connects the six exercises in `src/database/exercises.ts` to editable starter queries, expected results, and student-controlled hints. Learners compare their results with the examples; arbitrary SQL is not automatically graded.

Lessons render one at a time with school tables, answer disclosure, navigation, and completion/undo. `useProgress` connects Lessons, Quizzes, Progress, and Home to the shared progress store. The Progress view displays actual latest quiz scores; the earlier demo-score control has been removed. Storage validation and recovery notices remain in place, and progress reset requires confirmation.

The agreed quiz IDs are `database-basics`, `keys-and-relationships`, and `basic-sql`. `src/assessment/quizData.ts` now contains all twelve questions and explanations. The first two quizzes cover the lessons; the SQL quiz covers SELECT, WHERE, and ORDER BY from guided practice. A submitted retake replaces only that quiz's saved result.

## SQL runtime

loadSqlRuntime() in src/database/databaseService.ts initializes sql.js once and allows retry after failure. Vite imports the real node_modules/sql.js/dist/sql-wasm.wasm through ?url and emits the asset with the production bundle. SQL Practice creates the fictional school database and runs editable queries against it. There is no fake WASM file or CDN dependency.

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

The project has a Vercel production URL: https://database-tutor-virid.vercel.app. The Vercel project is `database-tutor` under `nyantakyi-francis-projects`, connected to `Nyantakyi-Francis/database-tutor`. It uses the Vite preset, `npm ci`, `npm run build`, and output directory `dist`. Hash navigation avoids server rewrite requirements; relative asset paths support hosting in a subdirectory.

Deployment verification on 16 November 2026 used revision `be1408f406cc9d51d4a5723123251848860c2040`, deployment `dpl_6SAAXfR7NgHagrP7ESoivGGMJeV6`. Vercel reported production status READY. The public URL returned HTTP 200 without authentication. In Chromium, the hosted `assets/sql-wasm-B-9ndiyM.wasm` request returned HTTP 200, and the starter SELECT returned the expected rows: `(101, Ama Mensah, JHS 1A)` and `(102, Kojo Owusu, JHS 1B)`.

On the hosted Progress view, completing `tables` and `records` and saving a demo quiz score of 3/4 restored both completions and the score after refresh. Browser console checks reported no errors or warnings. SQL Practice and Progress were checked at desktop (1366x900) and phone (390x844) widths. Checks used the Playwright CLI with artifacts outside the repository. Local typecheck, production build, all 48 tests, and `git diff --check` passed for the deployed revision. These checks do not establish browser-restart persistence, other-browser support, or completion of the learning activities.

The hosted checks above describe the 16 November starter revision. The current local source includes integrated lessons, guided exercises, hints, and scored quizzes. The production site was not rechecked on 26 November, so the historical hosted results do not establish the current deployed revision or its behavior. Browser-local progress belongs to the same browser and site and can be lost when browser data is cleared. No real student data should be included.

## Sprint outline

1. Foundation, agreed IDs/contracts, then owner-led query and save/restore demonstrations and starter deployment.
2. Six lessons, six SQL exercises, results/errors, database reset, lesson completion, and E1 hints.
3. Quizzes, scores, progress/reset, responsive layouts, and complete learning-flow checks.
4. Core/E1 acceptance checks, fixes, final deployment, documentation, and demonstration. Attempt E2/E3 only if time remains.

Sprint 1's hosted milestone was reached and verified on 16 November 2026, one day after the planned 9-15 November sprint. This is recorded as late Sprint 1 completion evidence. The closing record below includes Francis's reported team approvals and hours; it does not establish that every task was finished by 15 November.

## Francis's Sprint 1 lesson drafts (9–15 November 2026)

The six drafts in `src/lessons/lessonData.ts` address JHS learners with basic computer skills and no assumed database knowledge. Each draft contains a plain explanation, a fictional school example, and a short check question with its answer. Read the explanation in `content`, followed by the example and check in `example`. These checks are reading prompts, separate from the three scored quizzes planned for C3.

| Agreed stable ID | Topic | School example |
| --- | --- | --- |
| `tables` | Tables organise information into rows and columns | Separate Students and Subjects tables |
| `records` | One row holds one record | Read Kojo's ID, name, and class together |
| `fields` | A named field holds one kind of information | Distinguish `class_name` from its value `JHS 1B` |
| `primary-keys` | A primary key uniquely identifies a record | Two students with the same name have different IDs |
| `foreign-keys` | A foreign key refers to a related record | A Scores record refers to a student and a subject |
| `relationships` | Related tables connect through matching IDs | One student has several scores; one subject has scores from several students |

The drafts use the existing `Lesson` type without changing the shared contract. Francis confirmed on 13 November 2026 that Efehi and Victor agreed all six IDs. Preserve these IDs because saved lesson completion will refer to them. Titles can change without changing IDs.

### Agreed lesson example data

All names and scores below are fictional teaching data. Francis confirmed on 13 November 2026 that Efehi agreed the field names, keys, and sample records. This agreement does not establish an implemented database schema.

| Table | Agreed example fields | Key roles |
| --- | --- | --- |
| Students | `student_id`, `student_name`, `class_name` | Primary key: `student_id` |
| Subjects | `subject_id`, `subject_name` | Primary key: `subject_id` |
| Scores | `score_id`, `student_id`, `subject_id`, `score` | Primary key: `score_id`; foreign keys refer to Students and Subjects |

The main examples use Ama Mensah (101) and Kojo Owusu (102), Mathematics (1) and ICT (2). Scores are Ama/Mathematics 78, Ama/ICT 84, and Kojo/Mathematics 65. The primary-key lesson introduces another fictional Ama Mensah (103) to show why a name does not uniquely identify a student. The foreign-key lesson uses 999 only as an example of a missing student reference.

Lesson IDs and example data are agreed as reported above. Francis confirmed agreement to use Victor's existing lesson-completion API on 18 November 2026. Coordinate later quiz wording with Victor. Keep persistence implementation in `src/assessment/`. The relationship lesson explains the connections without adding the optional E3 SQL JOIN exercise.

### Sprint 1 closing record (16 November 2026)

The earlier 12-13 November status is superseded by the source, automated checks, and hosted checks recorded above. Team approvals and actual hours below were reported by Francis on 16 November; they were not independently verified.

| Sprint 1 item | Closing evidence or limitation |
| --- | --- |
| S1-11: six lesson drafts | Complete as drafts: all six topics include explanations, fictional school examples, and check questions with answers. Francis reports that the team reviewed and accepted all six. |
| S1-12: IDs and examples | Complete by Francis's report on 13 November: Efehi and Victor agreed the six IDs; Efehi agreed all example fields, keys, and sample records. |
| S1-13: lesson and setup documentation | Complete with late evidence on 16 November: coverage, IDs, setup, hosted URL, query results, save/restore steps, and limitations recorded. |
| School query demonstration | Verified on the hosted app at revision `be1408f`: the starter SELECT returned the two expected Students rows. |
| Save/restore demonstration | Verified on the hosted app: `tables`, `records`, and a demo quiz score of 3/4 survived refresh. |
| Hosted runtime demonstration | Vercel production deployment READY at https://database-tutor-virid.vercel.app; public page and hosted WASM returned HTTP 200. Verified on 16 November as late Sprint 1 evidence. |
| Quiz coverage and IDs | Twelve-question outline drafted; Francis reports team agreement on `database-basics`, `keys-and-relationships`, and `basic-sql`. Scored quizzes remain Sprint 3 work. |
| S1-14: meetings and peer review | Francis reports planning/standup attendance. His personal report records review of Victor's PR #3 before merging. He also reports additional teammate reviews, but cannot supply reviewer names or PR numbers, so those reviews remain unverified. |

Francis reports these final actual-hour totals. No task-level breakdown was supplied for the other members; his personal report retains its approximate retrospective allocation.

| Member | Estimated hours | Reported actual hours |
| --- | ---: | ---: |
| Nyantakyi Francis | 12 | 15 |
| Efehi Nehikhare | 12 | 15 |
| Victor Talabi | 11 | 15 |
| Figuelia Ya'Sin | 12 | 15 |
| Team total | 47 | 60 |

Francis's retrospective: separate lesson, SQL, and progress work came together in a working hosted starter. Next sprint, collect query, storage, and deployment evidence earlier.

At Sprint 1 closeout, the Lessons view still showed its preparation message. Sprint 2 covers rendering all six lessons, six guided exercises, E1 hints, and connecting lesson completion to saved progress. Later work includes scored quizzes and the full learning-flow checks. Other members' detailed review records were unavailable. Browser-restart persistence and other-browser checks were not performed in that hosted verification.

Local checks on 12 November 2026 passed: `npm run typecheck`, `npm run build`, and `git diff --check`. A content-structure check confirmed six unique IDs matching this README, populated Lesson fields, and a fictional example followed by a check question and answer in each draft. These checks do not establish learner understanding or team approval. No browser check was run for this draft-only change; the rendered interface was not changed.

## Francis's Sprint 2 lessons (16–22 November 2026)

Historical record from 18 November; integration status is superseded by the Sprint 3 record below. The lesson work was on `feature/lessons-sprint2`, branched from `349d7c4` after fetching and confirming that local main matched origin/main. Changes are limited to `src/lessons/` and this README. The existing Sprint 1 README updates were preserved. Accepted lesson wording and IDs are unchanged; the presentation helper reads the existing example format without changing the shared `Lesson` contract. Lesson controls reuse the existing button, table-scroll, notice, and focus styles.

### Use and check the lessons

1. Run `npm run dev` and open its local URL. Choose **Lessons**, or open `#lessons` directly.
2. Select a lesson from the numbered list. Read its explanation and fictional school tables. On a narrow screen, scroll tables horizontally; a keyboard user can focus a table region and use the arrow keys.
3. Read the check question and open **Show answer** when ready. This is an unscored reading check. Selecting a different lesson closes the previous answer.
4. Check **Mark this lesson complete**. The completed count and list label update; the status message reports whether storage succeeded. Uncheck it to mark the lesson incomplete.
5. Use **Next lesson** or **Previous lesson** to continue. Focus moves to the selected lesson heading. Every lesson remains available from the list, regardless of completion.
6. Refresh, or close and reopen the same browser profile at the same site. Completion should return. Use **View saved progress** to check the same completions on Progress. The selected lesson itself is not saved; reopening Lessons starts at the first lesson.

Completion uses `useProgress().setLessonCompleted(lesson.id, completed)`. Existing quiz results are preserved. Resetting the SQL database does not clear lesson completion. When storage is blocked or full, controls still work in memory and display Victor's warning; those unsaved changes are lost on refresh or close. Invalid saved data displays a recovery notice, and a subsequent successful save replaces it.

### Task evidence and reported participation

| Task | Local evidence or remaining work |
| --- | --- |
| S2-11: six React lessons (4 estimated hours) | All six accepted lessons render one at a time, with explanations, semantic tables, check questions, answer disclosures, and list/Previous/Next navigation. |
| S2-12: completion integration (3 estimated hours) | Uses Victor's agreed API. All six stable IDs and an existing demo quiz score survived refresh and a full browser-process restart in the same Chromium profile and origin. Completion can be undone; changes agree between Lessons and Progress after navigation. |
| S2-13: review and documentation (3 estimated hours) | Accepted content checked against the fictional school data, including the intentional extra student 103 in the primary-key example. Keyboard, desktop/mobile, table scrolling, storage warning/recovery, and SQL-reset separation checks passed. Usage instructions are above. |
| S2-14: planning, standup, peer review, and record (2 estimated hours) | Francis reports planning attendance on 17 November and standup attendance on 18 November. He identifies Victor's PR #5 as his teammate review. GitHub confirms the merged PR and author, but has no submitted review entry, so the review remains reported rather than independently verified. README evidence is recorded; Word sprint/personal reports are deferred at Francis's request. |

Francis reports **16 actual hours worked so far**, against 12 estimated hours. No task-level allocation was supplied; this is not a final sprint total. His answers also confirm agreement to use Victor's existing API and to leave shared styling changes with Figuelia. These are Francis's reports, not independently verified attendance or coordination records.

Peer-review reference: [Victor's PR #5: reject unknown lesson IDs when saving lesson progress](https://github.com/Nyantakyi-Francis/database-tutor/pull/5). At that checkpoint, the lesson changes still needed a commit, an authorized push, and teammate review before merge/deployment. The current integration status is recorded below. This historical evidence does not establish completion of the whole team's Sprint 2 work.

### Local verification (18 November 2026)

`npm run typecheck`, `npm run build`, `npm test` (72 tests in four files), and `git diff --check` passed. Seven lesson-format tests verify preservation of every accepted example table row, separation of check answers, consistent column counts, and prose containing pipe characters.

The Browser plugin/skill was not available, so Playwright CLI used temporary scripts, screenshots, and an isolated persistent Chromium profile outside the repository. The flow checked was Lessons → select/read/reveal answer → mark complete → Progress → reload/restart → restored completion. Production preview used `http://127.0.0.1:4173/` at 1366×900, 390×844, and 320×844. All six lessons rendered at each width without page-level horizontal overflow. Keyboard selection, visible focus, heading focus after navigation, skip-link access, answer disclosure, and table-region scrolling passed. Page identity, meaningful content, absence of a framework overlay, and normal-flow console checks passed with no browser errors or warnings.

Completion and undo survived refresh, preserved an existing demo quiz score, and reflected changes made on Progress when returning to Lessons. Closing the browser process and reopening the same persistent profile restored all six completions and the demo score. A working SQL query and school database reset preserved lesson progress. Separate simulated blocked-storage, full-storage, and corrupt-data cases checked the expected warnings, in-memory controls, and recovery after a successful save. These simulations intentionally generate progress warnings.

Screenshots were inspected for desktop and phone layouts. Checks are local Chromium evidence; Firefox, Safari, real mobile devices, hosted Sprint 2 behavior, and live synchronization across browser tabs remain unverified. Word reports were left unchanged.

## Sprint 3 acceptance record (26 November 2026)

Source checked: `174385d312a391c6685894cff9bbb836127e4d6b`, the current `main` and fetched `origin/main` before this documentation edit. [Sprint integration merge](https://github.com/Nyantakyi-Francis/database-tutor/commit/110086ced39c2bf5261cd8cbc0c61cd427e58aec) brought the lesson, quiz, and progress work into main. [Latest merge](https://github.com/Nyantakyi-Francis/database-tutor/commit/174385d312a391c6685894cff9bbb836127e4d6b) includes the narrow-screen quiz-question fix. This README update is local on `docs/sprint3-closeout` and is not included in either linked commit.

### Acceptance checks

These are repeatable checks for C1-C5 and E1. Source inspection confirms the listed controls and data exist; it does not establish that every browser check passes.

| Requirement | Check and expected result |
| --- | --- |
| C1: lessons | Choose each of six lessons; read its school tables, reveal/hide the answer, and use Previous/Next. Mark complete, then undo. Navigation remains available without completing earlier lessons. |
| C2: SQL practice | Run all six reference queries and compare headings and rows with Expected results. Try a valid query with no matches and an invalid query; expect a clear empty-result message and readable error. Edit school records, then reset; original records and the selected exercise's starter query return. |
| C3: quizzes | Take each four-question quiz. Compare all-correct, mixed, and all-incorrect scores with selected answers; inspect explanations. Submit with missing answers to check the warning and Submit anyway path. Retake one quiz; only its latest result changes. |
| C4: progress | Complete/undo lessons and submit quizzes; check matching counts and results on Home and Progress. Refresh and restart the same browser profile and site; saved completion and latest scores return. Cancel progress reset to preserve them, then confirm reset to clear them. School reset preserves progress; progress reset preserves the current SQL database. |
| C5: interface | At 320px, 390px, and desktop widths, visit Home, Lessons, SQL Practice, Quizzes, and Progress. Check readable text/tables, no page overflow, labelled controls, keyboard navigation, visible focus, and no application errors in the console. |
| E1: hints | Open and close Show/Hide hint for every SQL exercise. The current query remains unchanged. Changing exercise loads that exercise's own hint and starter query. |

### Demonstration steps

1. Run `npm ci`, `npm run build`, and `npm run preview`. Open the URL printed by Vite in a browser where saving site data is allowed.
2. On Lessons, choose a topic, reveal its answer, mark it complete, and demonstrate undo. Leave one lesson complete for the persistence check.
3. On SQL Practice, choose an exercise, open its hint, edit and run the query, then compare it with Expected results. Show an empty result and a readable SQL error.
4. On Quizzes, answer a four-question quiz and submit. Read the score and explanations. Retake it with different answers, then check the updated latest score on Progress and Home.
5. Refresh and fully close/reopen the same browser profile at the same URL. Check the lesson completion and latest quiz score. Progress belongs to that browser and site, not to an account.
6. Reset the school database and confirm saved progress remains. On Progress, cancel a reset first, then confirm one. Confirm lesson completions and quiz results are cleared while the SQL database is unaffected.
7. Repeat the relevant controls by keyboard and at phone widths. For a hosted demonstration, repeat query execution and persistence at the production URL and record the deployed revision separately.

### Verification and personal task status

On 26 November, `npm run typecheck`, `npm run build`, and `npm test` passed on this source revision (102 tests across 8 files). The build emitted the real sql.js WASM asset. Tests cover lesson content, exercise reference results, quiz structure/scoring, storage validation/recovery, shared progress, and separation of the two resets. Store-recreation tests use in-memory storage; they do not establish a real browser restart. No browser or hosted checks were run for this documentation update.

Francis confirms S3-11 (lesson integration) and S3-12 (all twelve quiz questions reviewed, plus completion/refresh/browser-restart checks) are complete. He also confirms S3-14 (planning, standup, peer review, and sprint records) is complete and reports no external blockers. These are his reported activities, not a new independent browser run. No specific peer-review PR was supplied in this confirmation.

S3-13 is complete with this README update: current implementation status, acceptance checks, demonstration steps, and verification limits are documented. Its completion does not mean every acceptance check has been independently repeated today. Francis reports 4 actual hours for each task, S3-11 through S3-14: 16 actual hours against 12 estimated hours. Planned estimates remain 4, 4, 2, and 2 hours, respectively.

Current limits: no browser, hosted, real-device, Firefox, or Safari checks were run on 26 November. No new UI defects were identified by source inspection, but this is not a clean browser-QA verdict. E2 progress export/import and E3 guided INNER JOIN remain outside this sprint's completed scope. Accounts, device synchronization, and full offline support remain excluded.

## Foundation verification (5 November 2026)

Installed versions: React/React DOM 19.3.1, Vite 8.3.6, TypeScript 7.0.2, sql.js 1.15.2, @vitejs/plugin-react 6.2.1; @types/react and @types/react-dom 19.3.0, @types/sql.js 1.4.11, @types/node 26.6.6. Setup environment: Node.js 24.14.0, npm 11.9.0.

A clean npm ci, type checking, and production build passed. Playwright with Chromium checked all five views in development and production preview at 1366x900 and 390x844, active navigation, the home lesson link, reload of a hash route, unknown-route fallback, keyboard skip-link focus, absence of horizontal overflow, and browser error logs. Screenshots were reviewed. The development browser executed SELECT 1 AS runtime_ok against the real loaded WASM runtime and returned 1. The production build emitted the real WASM file, and preview served a valid WebAssembly binary. SQL Practice initializes that same runtime; actual query UI remains deferred.

The Browser plugin/skill was not available, so temporary Playwright checks were used outside the repository. These checks do not cover finished learning features, other browsers, normal browser-restart persistence, GitHub Actions execution, or an externally hosted deployment. Package installation reported no vulnerabilities at setup time.

## Submit changes for review

The foundation is already on `main`. The existing `origin` points to https://github.com/Nyantakyi-Francis/database-tutor.git. Follow CONTRIBUTING.md to create a feature branch from current main, inspect the diff, run the required checks, and submit a small pull request. For Francis's lesson work, stage only the intended changes under `src/lessons/` and in `README.md`. Keep the local Word/PDF records out of Git.

Before an authorized push, check `git remote -v`, fetch origin, and inspect incoming changes. Integrate newer main changes with the relevant owners and rerun checks. Request teammate review before merging into main.
