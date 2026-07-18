# Contributing

Thanks for helping with FrameHub.

## Quick start

1. Follow [README](README.md) setup (`npm install`, `.env`, `npm run dev`).
2. Read [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) before large changes.
3. Run `npm test` and `npm run lint` when touching logic or UI.

## Data changes

- Edit **one item at a time** in `src/data/` (mods, weapons, warframes, arcanes, …).
- Mod *behavior* usually belongs in `src/data/mod-behaviors/`, not only flat `stats`.
- Do not commit blanket catalog transforms or script dumps.

See [scripts/README.md](scripts/README.md) before running audit/apply tooling.

## Pull requests

- Keep PRs focused (one concern when possible).
- Do not commit `.env`, `*.db`, `public/uploads/`, or `scripts/` scratch dumps.
- Prefer clear commit messages that say *why*.
