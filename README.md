# CTF Archives Explorer

Elegant, minimal frontend for browsing [sajjadium/ctf-archives](https://github.com/sajjadium/ctf-archives) — 470+ CTF competitions, 1,000+ events and 20,000+ challenges — with accounts, up/downvotes and community difficulty ratings.

Built on [kapeka-starter-kit](https://github.com/kapeka0/kapeka-starter-kit).

## Features

- **Browse** every CTF in the archive: editions, categories and challenges, each linking to its files on GitHub
- **Search & sort** by name, votes or challenge count
- **Accounts** (email + password) via Convex Auth
- **Vote** CTFs up/down and **rate difficulty** (1–5), with live averages on every card
- **i18n** (English & Spanish), light/dark theme

## Stack

- **Framework:** Next.js 16 + App Router + Turbopack
- **Backend:** Convex (real-time database, serverless functions, auth)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **i18n:** next-intl
- **Forms:** React Hook Form + Zod

## How it works

The challenge index is generated at development time from the archive's **git tree only** (no challenge files are downloaded):

```bash
node scripts/build-data.mjs   # clones the tree (~seconds) and writes data/generated/
```

The generated JSON (~3 MB) is committed, so the site statically renders all CTF pages at build time. Votes, ratings and auth live in Convex; aggregates are denormalized per CTF so lists stay cheap.

## Getting Started

```bash
pnpm install
npx convex dev --once          # set up your Convex dev deployment
npx @convex-dev/auth           # configure auth keys on the deployment
node scripts/build-data.mjs    # regenerate the CTF dataset (optional, committed)
pnpm dev
```

## Environment Variables

Copy `.env.local.example` to `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

## Deploying

Convex functions are deployed from your machine, and the static frontend from Vercel:

```bash
npx convex deploy              # push schema + functions to the prod deployment
vercel --prod                  # NEXT_PUBLIC_CONVEX_URL must point to the prod deployment
```

## Data source

All challenge data comes from [sajjadium/ctf-archives](https://github.com/sajjadium/ctf-archives). Challenge links point to the original repository — nothing is rehosted.
