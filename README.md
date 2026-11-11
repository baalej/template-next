# template-next

Template for Next.js + Payload 3 + Postgres projects, deployed to a VPS with
Docker Compose and Caddy.

Conventions, architecture decisions and how-tos (adding collections, fetching
data, env vars, CSP…) are in **[AGENTS.md](AGENTS.md)**, written for people and
coding agents alike. This README covers running and deploying.

## New projects

Create them with `new-next <name>` (in `~/automation`). The script clones the
latest tagged version, sets the project name in the compose files and
`package.json`, writes `.env` with a free Postgres port, installs dependencies,
starts the dev database, applies the migrations and makes the first commit.

## Requirements

- Node 24 (`.nvmrc`; `fnm use` or `nvm use`) and pnpm 11 (`corepack enable`)
- Docker (on macOS, e.g. `colima start`)

## Development

The app runs **natively** with `pnpm dev`; only Postgres and Mailpit run in
containers. HMR is much faster that way, and production runs the build rather
than the dev server, so no real parity is lost.

```bash
colima start
docker compose up -d
pnpm payload migrate     # first time, and after pulling new migrations
pnpm dev                 # http://localhost:3000, admin at /admin
```

The first account you create at `/admin` is an admin.

Emails the app sends (password resets and so on) land in Mailpit:
<http://localhost:8025>, or the port in `MAILPIT_UI_PORT`.

When you're done:

```bash
docker compose down     # add -v to delete the data as well
colima stop
```

## Changing the schema

The database only changes through migrations, locally as in production (no
dev "push"), so the two never drift apart:

```bash
pnpm payload migrate:create short-description
pnpm payload migrate
pnpm generate:types
```

Commit `src/migrations/` and `src/payload-types.ts` with the change. CI fails
if a schema change is missing its migration. In production the `migrate`
service applies migrations before the app starts.

## Checks and tests

```bash
pnpm check        # lint, typecheck, formatting
pnpm format       # fix formatting
pnpm test:int     # integration + component tests
pnpm test:e2e     # browser tests (first time: pnpm exec playwright install chromium)
```

Tests use a separate `<db>_test` database on the same Postgres, created and
migrated automatically; they never touch your dev data. e2e starts its own
server on port 3100.

CI (GitHub Actions) runs the checks and integration tests on every PR and push
to `main`. The e2e suite is manual: Actions → CI → Run workflow.

## Deploying to the VPS

### Before the first deploy

- **DNS**: the domain's A record (and `www`'s, if it exists) must already
  point to the server. Caddy answers the ACME challenge on port 80; if DNS
  isn't pointing yet, certificate issuance fails.
- **Email**: pick an SMTP provider for the client (Resend, Brevo, Postmark,
  Amazon SES… any SMTP works) and add the SPF and DKIM records it gives you to
  the domain, or mail lands in spam. The deploy stops with an error if `SMTP_HOST`
  or `EMAIL_FROM_ADDRESS` is missing.
- **Memory**: `next build` runs on the server and can spike memory. On a VPS
  with 2 GB of RAM or less, add swap first (e.g. 2 GB) so the build isn't
  killed.

### First time

```bash
git clone <repo> && cd <repo>
cp .env.example .env      # fill in the production values
docker compose -f docker-compose.prod.yml up -d --build
```

The `migrate` service runs on its own; `payload` waits for it to succeed, and
Caddy waits until `payload` passes its healthcheck.

### Updates

```bash
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

### Logs

```bash
docker compose -f docker-compose.prod.yml logs -f payload
```

Each container keeps at most 30 MB of logs (3 × 10 MB, rotated).

## Maintaining this template

Projects created from it **don't** inherit later changes. Tag a semver
version for each change new projects should get:

```bash
git tag v1.4.0 && git push --tags
```

How the template was first built, for reference: a project generated with
`pnpm dlx create-payload-app@latest template-next -t blank --db postgres --use-pnpm`,
with the Docker, Compose, Caddy, testing and CI setup added on top.
