---
applyTo: "**"
---

# Branch Strategy

Never commit directly to `main`. Always work on a branch and merge into `main` after local testing.

## Branch Naming

- `feature/us-<id>-<description>` — new functionality tied to a user story
- `fix/<description>` — bug fixes
- `chore/<description>` — config, tooling, dependencies
- `docs/<description>` — documentation-only changes

## Workflow

```bash
git checkout main
git pull origin main
git checkout -b feature/us-03-csv-file-upload

# work, commit with conventional commits

git checkout main
git merge --ff-only feature/us-03-csv-file-upload
git push origin main
git branch -d feature/us-03-csv-file-upload
```

## Commit Messages

Format: `<type>(<scope>): <description>`

Types: `feat`, `fix`, `chore`, `docs`, `test`, `style`, `refactor`

- Imperative mood: "add", not "added"
- Under 72 characters
- Reference the user story: `Ref: US-03`

## Rules

- One purpose per branch — do not mix features and fixes.
- Branches should not live longer than 1–2 working days.
- Delete branches after merge.
- Keep branches current: `git fetch origin; git rebase origin/main`.
