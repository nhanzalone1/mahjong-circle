# Mahjong Circle — Project Context for Claude Code

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Postgres (serverless)
- **Auth**: Neon Auth (powered by Better Auth)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + custom design tokens
- **Deployment**: Vercel

## Design System
- Deep jade background `#0D1F17`, gold accent `#C9A84C`, cream text `#F5ECD7`
- Fonts: Playfair Display (headings) + DM Sans (body)
- Dark mode first, mobile-first

## Auth Pattern
- Server Components/Actions → `import { getCurrentUser } from "@/lib/auth"`
- Client Components → `import { authClient } from "@/lib/auth-client"`
- Auth guard lives in `app/(dashboard)/layout.tsx`

## Database Pattern
- All DB access via Drizzle: `import { db } from "@/lib/db"`
- Schema in `lib/schema.ts` — run `npm run db:push` after changes
- User IDs are `text` type (from neon_auth.users_sync)
- `neon_auth.users_sync` is auto-managed — DO NOT modify it

## Environment Variables
```
DATABASE_URL=                    # Neon > Connect
NEON_AUTH_URL=                   # Neon > Auth > Configuration > Auth URL
NEXT_PUBLIC_NEON_AUTH_URL=       # Same as NEON_AUTH_URL
NEON_AUTH_COOKIE_SECRET=         # openssl rand -hex 32
```

## Commands
```bash
npm run dev
npm run db:push       # push schema changes to Neon
npm run db:studio     # visual DB browser at localhost:4983
```

## Pages Still To Build
1. sessions/page.tsx — list + create sessions
2. sessions/[id]/page.tsx — RSVP + record winner
3. Group creation + invite code join flow
4. Profile settings
