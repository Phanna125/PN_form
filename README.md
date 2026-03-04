# PN_form

PN_form is a Next.js 16 app for a professional education suite concept:

- Marketing site for product positioning.
- Dashboard and exam builder interfaces.
- Guard/proctoring live monitor.
- Secure session demo with client-side policy simulation.
- Backend API foundation with versioned routes in `app/api/v1` and Prisma persistence.

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Prisma ORM + PostgreSQL (local Docker)
- ESLint 9
- Lucide icons

## Run locally

```bash
npm install
npm run db:up
npm run db:setup
npm run dev
```

Open `http://localhost:3000`.

## Local database (Docker)

This project uses `docker-compose.yml` to run PostgreSQL locally.

```bash
npm run db:up
npm run db:migrate
npm run db:seed
```

Connection string in `.env` / `.env.example`:

`postgresql://postgres:postgres@localhost:5433/pn_form?schema=public`

Stop/remove local DB containers:

```bash
npm run db:down
```

## Backend architecture

The backend is split into clear layers:

- `app/api/*`: transport layer (HTTP route handlers).
- `lib/server/validation.ts`: request validation and input parsing.
- `lib/server/services/*`: domain and business logic.
- `lib/server/repository/prismaClient.ts`: Prisma client for database access.
- `prisma/schema.prisma`: database schema.
- `prisma/migrations/*`: versioned SQL migration scripts.
- `lib/server/repository/inMemoryStore.ts`: fallback memory driver (used in tests).

Persistence mode:

- Default: `prisma`
- Test env: forced `memory` for deterministic tests
- Optional override: `PN_FORM_PERSISTENCE=memory|prisma`

## Database commands

```bash
npm run db:generate
npm run db:up
npm run db:down
npm run db:logs
npm run db:migrate
npm run db:migrate:dev
npm run db:seed
npm run db:setup
npm run db:reset
```

`db:migrate` applies the committed SQL migration file:
`prisma/migrations/20260304093000_init/migration.sql`.

## API endpoints (v1)

- `GET /api/health`
- `GET /api/v1/exams?status=draft|published|archived`
- `POST /api/v1/exams`
- `GET /api/v1/exams/:examId`
- `PATCH /api/v1/exams/:examId`
- `DELETE /api/v1/exams/:examId`
- `GET /api/v1/exams/:examId/sessions`
- `POST /api/v1/exams/:examId/sessions`
- `GET /api/v1/exams/:examId/sessions/:sessionId`
- `GET /api/v1/exams/:examId/sessions/:sessionId/events`
- `POST /api/v1/exams/:examId/sessions/:sessionId/events`

All routes return a consistent JSON envelope:

- Success: `{ "success": true, "data": ... }`
- Error: `{ "success": false, "error": { "code": "...", "message": "..." } }`

## Demo seed data

The Prisma seed script inserts a demo exam/session:

- Exam ID: `exam-demo-physics`
- Session ID: `session-demo-alex-chen`

The secure session page posts live events to this seeded session.

## Quality checks

```bash
npm run test
npm run lint
npm run build
```

## Continuous integration

GitHub Actions workflow [`ci.yml`](.github/workflows/ci.yml) runs on every push, pull request, and manual trigger.

It executes:

- `npm ci`
- `npm run test`
- `npm run lint`
- `npm run build`

