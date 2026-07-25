# Contributing / Team Workflow (3 Developers)

Work is split along the architecture's natural seams so each person owns a lane with minimal file overlap.

| Person | Owns | Covers |
|---|---|---|
| **A — Channels/Frontend** | Channels layer | PWA, USSD, WhatsApp entry points, API Gateway client integration |
| **B — Core Backend** | Backend services | API Gateway, Valuation Service, Export Assessment Service |
| **C — AI & Data** | AI/Data layer | AI Service, Notification Service, PostgreSQL, Market Data (KAMIS / Cooperative Data / Verified Sales) |

Each lane maps to a top-level folder (e.g. `channels/`, `services/`, `ai-data/`) so day-to-day work rarely touches another person's files.

## Branching model — GitHub Flow

- `main` is always deployable. No one commits to it directly.
- Every change starts from an up-to-date `main`:

  ```bash
  git checkout main
  git pull origin main
  git checkout -b feature/<lane>-<short-description>
  # e.g. feature/channels-ussd-menu, feature/backend-valuation-api, feature/ai-export-scoring
  ```
- Branch naming: `feature/...` for new work, `fix/...` for bug fixes, `chore/...` for tooling/docs.
- Commit in small, logical chunks with clear messages.
- Push and open a Pull Request into `main` as soon as the branch is in a reviewable state (draft PRs are fine) — don't sit on large unreviewed branches.
- At least one of the other two teammates reviews and approves before merge.
- Use **squash merge** into `main` so history stays one commit per feature and `git log` on `main` stays readable.
- Delete the branch after merge.

## Avoiding merge conflicts

1. **Stay in your lane.** Since each person owns a layer, conflicts should mostly happen only in shared files (README, shared types/config, `package.json`).
2. **Pull `main` before you branch, and rebase often while you work:**
   ```bash
   git fetch origin
   git rebase origin/main
   ```
   Do this at least once a day, and always right before opening a PR — small, frequent rebases produce tiny conflicts instead of one large one at the end.
3. **Keep PRs small and short-lived** (hours to a couple of days, not weeks). The longer a branch lives, the more `main` drifts under it.
4. **Touch shared files carefully.** If a change needs to land in a shared file (e.g. a common interface between the Valuation Service and AI Service), post in the team channel before editing it, or pair on that specific change.
5. **Agree on formatting/linting up front** (one formatter config, committed to the repo) — most "conflicts" in practice are just whitespace/formatting diffs, and a shared formatter eliminates them.
6. **Never force-push a shared branch.** Force-push only your own feature branch, and only after a rebase you initiated.

## Integration flow

1. Feature branch → PR → review → squash-merge into `main`.
2. `main` is the integration point — it should build and pass tests after every merge (wire up CI to enforce this).
3. Weekly (or after any cross-layer change), all three pull latest `main` locally and smoke-test the full flow end-to-end (Channels → API Gateway → Services → Data layer) to catch integration gaps that unit-level PR review can miss.
4. If two lanes need to change the same interface (e.g. the Valuation API contract), agree on the contract first, land it as its own small PR, then build both sides against it — this avoids large simultaneous edits to the same file.
