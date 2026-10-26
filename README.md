# papemosque.ca

Public website of Pape Camii · Kanada Türk İslam Vakfı (Next.js on Vercel).

- **Data:** the same Supabase tables the mobile app (youth-toronto) reads, with
  the anon key, server-side and cached ~60 s (ISR). The schema and every
  migration live in the **pape-admin** repo; its `CLAUDE.md` is the system
  briefing.
- **Text:** every UI string is in `lib/i18n/tr.ts` (Turkish for now).
- **Must keep working:** the prayer refresh cron (`/api/prayer/refresh`,
  `vercel.json`), `/api/prayer/today`, Stripe donations (`/donation`,
  `/api/checkout`, `/api/stripe-webhook`), `/api/unsubscribe`, `/privacy`,
  `/announcements`.
- **Design reference:** `docs/design/website-home/index.html`.

```bash
pnpm install
pnpm dev      # http://localhost:3000 (needs .env, see .env.example)
pnpm test     # node --test on lib/**/*.test.ts
pnpm build
```
