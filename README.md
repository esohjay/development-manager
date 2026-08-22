# SojiTracker

A mobile-first personal goal execution app built with Next.js App Router, TypeScript, MongoDB, Zod, and BetterAuth.

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` to your MongoDB Atlas connection string.
3. Set `MONGODB_DB` to the database name you want to use.
4. Generate a long random value for `BETTER_AUTH_SECRET`.
5. Set `BETTER_AUTH_URL=http://localhost:3000` locally.
6. Set `INITIAL_ADMIN_EMAIL` to the only email allowed to create the first account.
7. Run `npm run dev` and open `/setup` once.

The BetterAuth user creation hook accepts the configured email only while no user exists. After the first account is created, all subsequent sign-up attempts are rejected at the database hook, including direct requests to the auth API. There is no user-management or public registration UI.

For Vercel, add the same environment variables and set `BETTER_AUTH_URL` to the production origin. Keep `.env.local` out of source control.

## Commands

```bash
npm run dev
npm run lint
npm run build
```

## Phase 1 scope

- Email/password login and one-time account setup
- Today view with deterministic next-task recommendation
- Weekly planning that references canonical task records
- Goals, focus periods, outcomes/milestones, and tasks
- Mobile bottom navigation and quick task creation

Activities, reviews, specialised logs, notifications, and analytics are intentionally deferred.
