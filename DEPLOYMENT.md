# Deploying Reagan OS to Vercel

## Steps

1. **Push repo to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/reagan-os.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com) → **New Project** → Import your `reagan-os` repo

3. **Create KV Database**
   - In your Vercel project, go to **Storage** tab
   - Click **Create Database** → select **KV (Redis)**
   - Name it `reagan-os`
   - Vercel auto-populates all 4 KV environment variables:
     - `KV_URL`
     - `KV_REST_API_URL`
     - `KV_REST_API_TOKEN`
     - `KV_REST_API_READ_ONLY_TOKEN`

4. **Copy env vars for local dev**
   - Go to **Settings** → **Environment Variables** in your Vercel project
   - Copy all 4 KV values into your local `.env.local` file

5. **Deploy**
   - Click **Deploy** — auto-deploys on every push to `main`

6. **Optional: Custom domain**
   - Go to **Settings** → **Domains** in your Vercel project
   - Add your custom domain

## Local Development

```bash
npm install
cp .env.local.example .env.local  # Fill in KV credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
