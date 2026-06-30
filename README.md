# Kapeka Starter Kit

Starter kit for building SaaS applications quickly without repeating boilerplate code.

## Stack

- **Framework:** Next.js 16 + App Router + Turbopack
- **Backend:** Convex (real-time database, serverless functions)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Typography:** DM Sans
- **i18n:** next-intl (English & Spanish)
- **Forms:** React Hook Form + Zod
- **Auth:** Template ready (plug your provider)
- **Animations:** Framer Motion + Lottie

## Getting Started

```bash
pnpm install
npx convex dev --once  # Set up Convex project
pnpm dev
```

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

> [!CAUTION]
> Remove `.git` folder after cloning the repo.
