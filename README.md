# Frame Hub

Open-source Warframe build planner — warframe, weapon, companion, and modular (kitgun / zaw / amp) builders with mod capacity, set bonuses, archon shards, arcanes, and cloud saves.

**Live site:** [frame-hub.com](https://frame-hub.com)

> **Fan project disclaimer:** Frame Hub is not affiliated with, endorsed by, or sponsored by Digital Extremes. *Warframe* and related logos are trademarks of Digital Extremes Ltd. All game data is used for informational purposes under community fan-site conventions.

## Features

- Warframe, primary/secondary/melee, companion, and modular weapon builders
- Mod capacity, polarity, set bonuses, Helminth subsume, archon shards, and warframe arcanes
- Local builds (no account) or cloud saves with email/password or Google sign-in
- Share builds via URL; loadout grouping across slots

## Tech stack

- [Next.js](https://nextjs.org) 16 (App Router), React 19, TypeScript, Tailwind CSS
- SQLite via Prisma + `better-sqlite3`
- Session auth (JWT cookies), optional Google OAuth and Resend email

## Getting started

### Prerequisites

- Node.js 20+
- npm

### Setup

```bash
git clone https://github.com/StepTwo33/FrameHub.git
cd FrameHub
npm install
cp .env.example .env
```

Edit `.env`:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Dev | Default `file:./dev.db` |
| `AUTH_SECRET` | **Production** | Long random string for session signing |
| `AUTH_URL` | Production | Public origin, e.g. `https://frame-hub.com` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | Google sign-in |
| `RESEND_API_KEY` | Optional | Verification / notification email |

Generate a secret:

```bash
openssl rand -base64 32
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production (self-hosted)

```bash
./start.sh          # build + migrate + start on PORT (default 3000)
./start.sh --dev    # dev server instead of production build
```

`start.sh` loads `.env`, runs `prisma migrate deploy`, and optionally a Cloudflare tunnel (`SKIP_TUNNEL=1` to disable).

**Updating the server:** do not run `npm install` on the server — it changes `package-lock.json` and blocks `git pull`. Use:

```bash
git fetch origin dev
git reset --hard origin/dev
npm ci
npm run build
# then restart: ./start.sh (or your process manager)
```

Or run `./scripts/deploy.sh` (same steps, default branch `dev`).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js dev server |
| `npm run build` | Production build |
| `npm run db:migrate` | Apply Prisma migrations |
| `CONFIRM_SET_ADMIN=1 npx tsx scripts/set-admin.ts` | **Local dev only** — promote users to admin |

Never run `set-admin.ts` against a production database you do not fully control.

## Security

- Do **not** commit `.env`, `*.db`, or `public/uploads/` — they are gitignored.
- Set a strong `AUTH_SECRET` in production (the app refuses to start without one).
- See [`.env.example`](.env.example) for all supported environment variables.

## Contributing

Issues and pull requests are welcome. Please do not commit secrets, database files, or user uploads.

## License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPLv3)**.

See [LICENSE](LICENSE) for details.

This change provides stronger copyleft protection for the web application (if you modify and host it, you must share your changes).