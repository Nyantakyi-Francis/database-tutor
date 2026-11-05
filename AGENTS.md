# Database Tutor working rules

Read relevant files before editing. Keep changes within the requested scope and preserve other members' work. Do not overwrite work or modify another owner's files without coordination.

## Ownership

- Nyantakyi Francis: src/lessons/* and README.md; coordinates requirements and documentation.
- Efehi Nehikhare: src/database/*, sql.js runtime configuration and WASM asset handling.
- Victor Talabi: src/assessment/*.
- Figuelia Ya'Sin: src/interface/*, src/App.tsx, src/main.tsx; coordinates shared build configuration and deployment.
- src/shared/types.ts is a shared contract. Coordinate changes with all affected owners before editing it.
- Coordinate package/configuration, AGENTS.md, CONTRIBUTING.md, and .github changes with their relevant owners.

## Implementation

- Preserve C1-C5 and E1; E2/E3 are optional after core requirements and E1 work.
- This foundation intentionally has placeholders. Do not claim unfinished features work.
- Use TypeScript for application logic. Keep React components small and readable.
- Install only necessary dependencies. Commit package-lock.json with dependency changes.
- Keep the SQL practice database separate from versioned saved progress.
- Use fictional school data. Never commit secrets, credentials, or real student records.
- Word/PDF reference documents stay local and ignored.
- Avoid unrelated changes. Explain changes to shared files and their effects.

## Verification and collaboration

- Run npm run typecheck, npm run build, and relevant tests before reporting completion.
- Verify affected views and interactions in a browser when changing the interface.
- Never invent test results. State checks not performed and remaining limitations.
- Branch from latest main, open small pull requests, request review, and merge regularly.
- Do not push or change remote settings without user authorization.

## Writing

Use clear, specific, restrained prose. Prefer plain verbs and concrete details. Avoid promotional language, invented citations, generic significance, canned introductions, unnecessary rhetorical contrast, repeated conclusions, and excessive formatting. Preserve the user's supplied Natural Writing Standard in future work.
