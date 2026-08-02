# MRRS Frontend (Next.js)

Meeting Room Reservation System frontend.

## Local

```bash
cp .env.example .env.local
npm install --legacy-peer-deps
npm run dev
```

Set `NEXT_PUBLIC_API_URL` to your API URL.

## Deploy (Vercel)

- Root Directory: `/`
- Install: `npm install --legacy-peer-deps`
- Env: `NEXT_PUBLIC_API_URL=https://your-api.up.railway.app`
