# WorkReview

**Peer and manager reviews for professionals.** Look up a colleague, read what the people who worked with them say, and leave your own review.

**Live:** https://workreview.vercel.app

## What it does

- **Profiles and reviews:** public profile pages (`/profile/[slug]`) with reviews from peers and managers
- **Search:** find people by name or company, matching each word you type
- **Write a review:** a structured review form for signed-in users
- **Moderation:** flag a review that breaks the rules
- **Team import and claiming:** import a whole team at once. Each person gets an email link (sent with Resend) to claim their profile. This is the activation loop: one sign-up brings in a whole team.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Supabase (Postgres + Auth) · Tailwind v4 · Resend · Vercel

## Quality

Vitest tests cover the API routes for search, profile import and claiming (`__tests__/`). The database schema and migrations are in `supabase/`.

## Run locally

```bash
npm install
# .env.local: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL, RESEND_API_KEY (claim emails)
psql < supabase/schema.sql   # then supabase/migrations/*
npm run dev
npm test
```
