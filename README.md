# frontend-gromar

Next.js frontend for GROMAR. The AI chat widget now runs inside this app through the Next.js route `/api/chat`, so you do not need a separate Express server for chat.

## Setup

1. Copy `.env.local.example` to `.env.local`.
2. Fill in `ANTHROPIC_API_KEY`.
3. Keep `NEXT_PUBLIC_API_URL` only if you still use the separate backend for other features like auth, cart, orders, or products.
4. Install dependencies:

```bash
npm install
```

5. Run the app:

```bash
npm run dev
```

## Deploy to Vercel

1. Push the latest code to GitHub.
2. Import the `frontend-gromar` project in Vercel.
3. Set `ANTHROPIC_API_KEY` in the Vercel environment variables.
4. If you still use the old backend for other app features, also set `NEXT_PUBLIC_API_URL` in Vercel.
5. Deploy.

## Notes

- Chat requests now go to `/api/chat`.
- The chat widget is mounted globally from `app/layout.tsx`.