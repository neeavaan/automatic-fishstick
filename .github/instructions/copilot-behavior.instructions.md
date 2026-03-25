---
applyTo: "**"
---

# Copilot Behavior Rules

## Before Generating Code

- Open `.github/user-stories.md` alongside your working files so acceptance criteria are in context.
- Identify the user story being worked on. Generate code only within that story's scope.

## Complete Implementations

- Never generate `// TODO`, `// implement later`, or placeholder stubs.
- If a full implementation is not possible, explicitly state what is missing rather than leaving a stub.

## Reuse Before Creating

- Before generating a new utility, hook, or component, check if a similar one exists in `src/utils/`, `src/hooks/`, or the component tree.
- If a suitable module exists, import and use it. Do not create duplicates.

## Dependency Awareness

- Never silently import a package not in `package.json`.
- If a new dependency is needed, state the package name, reason, and install command.
- Prefer lightweight, single-purpose packages.

## No Unnecessary Comments

- Do not add comments that restate what the code does.
- Comments should only explain *why* — non-obvious business logic, workarounds, or trade-offs.

## No Hardcoded or Mock Data

- Do not generate hardcoded sample data or placeholder values in production code.
- Wire all data to the actual database layer or API.
- Mock data belongs exclusively in test files (`*.test.ts(x)`).

## Stay Within Story Scope

- Generate code only for the current user story.
- Do not add features or logic from other stories — even if they seem useful.
- If you identify a cross-story dependency, note it but do not implement it.

## Follow Existing Patterns

- Match code style, file structure, and patterns already in the codebase.
- When no pattern exists yet, follow the TypeScript and Tailwind instruction files.

## Test Awareness

- When generating a component or utility, also generate the co-located test file.
- Tests should cover the acceptance criteria of the relevant user story.
- Use `vitest` and `@testing-library/react`.

## Security

- Never generate hardcoded secrets, API keys, tokens, or credentials.
- Never disable TypeScript strict checks, ESLint rules, or security headers.
- Flag any filesystem write outside the designated `/data/` directory.
