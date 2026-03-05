# Mahjong Circle — Project Context for Claude Code

## Tech Stack
- **Framework**: Next.js 14 (App Router)
- **Database**: Neon Postgres (serverless)
- **Auth**: Neon Auth (powered by Better Auth)
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + custom design tokens
- **Deployment**: Vercel

## Design System (Light Theme)
- **Page background**: light cream `#F5ECD7`
- **Cards**: pure white `#FFFFFF` with soft drop shadows
- **Primary text**: dark jade `#0D1F17`
- **Secondary text**: gray `#6B7280`
- **Primary buttons**: dark green `#1a3d2b`
- **Accent/highlights**: gold `#C9A84C`
- **Bottom nav**: white background, gold active state
- **Auth page**: dark theme (jade `#0D1F17` background) as dramatic entrance
- **Fonts**: Playfair Display (headings) + DM Sans (body)
- **Style**: Light mode, mobile-first (like Robinhood, Airbnb, Calm)

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

## Key Pages
- `/dashboard` — Home with next game, RSVPs, quick links
- `/sessions` — List of upcoming/past games
- `/sessions/[id]` — Session detail with RSVP + record winner
- `/sessions/new` — Create new game night
- `/leaderboard` — Friends leaderboard by wins
- `/profile` — User profile with stats, invite code
- `/friends` — Add/manage friends via invite codes
- `/groups` — Create/join circles (groups)
- `/auth` — Login/signup (dark theme)
