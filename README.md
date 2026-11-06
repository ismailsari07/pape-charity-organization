# papemosque.ca

Public website of Pape Camii · Kanada Türk İslam Vakfı (Next.js on Vercel).

- **Data:** the same Supabase tables the mobile app (youth-toronto) reads, with
  the anon key, server-side and cached ~60 s (ISR). The schema and every
  migration live in the **pape-admin** repo; its `CLAUDE.md` is the system
  briefing.
- **Text:** every UI string is in `lib/i18n/{tr,en,fr}.ts`. Turkish is at the root, English under `/en`, French under `/fr` (`middleware.ts`, `lib/i18n/config.ts`).
- **Must keep working:** the prayer refresh cron (`/api/prayer/refresh`,
  `vercel.json`), `/api/prayer/today`, Stripe donations (`/donation`,
  `/api/checkout`, `/api/stripe-webhook`), `/api/unsubscribe`, `/privacy`,
  `/announcements`, `/hesap/onaylandi` (the app's email-confirmation fallback).
- **Email logo:** `public/email/logo.png` (192 px) is a fixed URL for emails,
  `https://papemosque.ca/email/logo.png`. Never rename or move it; update the
  image in place. It is a copy, independent of the favicon and icon files.
- **Design reference:** `docs/design/website-home/index.html`.

```bash
pnpm install
pnpm dev      # http://localhost:3000 (needs .env, see .env.example)
pnpm test     # node --test on lib/**/*.test.ts
pnpm build
```
