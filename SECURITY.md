# Security

## Reporting a vulnerability

Please report security issues privately rather than opening a public GitHub issue:

- Email: [support@frame-hub.com](mailto:support@frame-hub.com)
- Discord: link in the app header

## For self-hosters

- Set `AUTH_SECRET` to a long random value in production.
- Keep `.env`, SQLite databases, and `public/uploads/` out of version control.
- Rotate `AUTH_SECRET` and user passwords if a database file was ever committed to git.

## Secret scanning

This project uses `.env.example` with empty placeholders. Real credentials belong only in local `.env` files or your deployment platform's secret store.
