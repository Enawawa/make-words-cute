# AGENTS.md

## Cursor Cloud specific instructions

This is a Next.js 15 (App Router) + Tailwind CSS 4 frontend project. The app converts aggressive text into cute expressions using the SiliconFlow (硅基流动) LLM API.

### Quick reference

- **Install deps**: `npm install`
- **Dev server**: `npm run dev` (runs on port 3000)
- **Lint**: `npm run lint`
- **Build**: `npm run build`

### Important notes

- The SiliconFlow API key must be set as `SILICONFLOW_API_KEY` env var (in `.env.local` for local dev, or in Vercel dashboard for production). Without it, the `/api/transform` route returns a 500 error.
- Tailwind CSS 4 is used with `@tailwindcss/postcss` plugin (not the legacy `tailwindcss` CLI). There is no `tailwind.config.js` — configuration is done via CSS `@theme` directives in `globals.css`.
- The API route is at `src/app/api/transform/route.ts` and proxies requests to `https://api.siliconflow.cn/v1/chat/completions` using the `Qwen/Qwen2.5-7B-Instruct` model.
- The project targets deployment on Vercel with custom domain `suno-fashion.com`.
