# PN_form

PN_form is a Next.js 16 app for a professional education suite concept:

- Marketing site for product positioning.
- Dashboard and exam builder interfaces.
- Guard/proctoring live monitor.
- Secure session demo with client-side policy simulation.
- Backend API foundation with versioned routes in `app/api/v1`.

## Tech stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- ESLint 9
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Current backend foundation

The backend is intentionally split into layers:

- `app/api/*`: transport layer (HTTP route handlers).
- `lib/server/validation.ts`: request validation and input parsing.
- `lib/server/services/*`: domain and business logic.
- `lib/server/repository/inMemoryStore.ts`: in-memory persistence for prototyping.

This gives a clean upgrade path to a real database and auth system later.

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

## Seed data

The in-memory store is pre-seeded with a demo exam/session:

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
