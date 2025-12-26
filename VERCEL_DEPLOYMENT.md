# Vercel Deployment Instructions

## Option 1: Deploy via Vercel Dashboard

1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import `israelgrowthventure-cloud/igv-site`
5. Configure:
   - **Framework Preset:** Create React App
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
6. Add Environment Variables:
   ```
   REACT_APP_BACKEND_URL=https://igv-cms-backend.onrender.com
   REACT_APP_SITE_URL=https://israelgrowthventure.com
   NODE_ENV=production
   GENERATE_SOURCEMAP=false
   CI=false
   ```
7. Deploy

## Option 2: Deploy via Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## Domain Configuration

After deployment, add custom domain:
1. Go to Project Settings → Domains
2. Add `israelgrowthventure.com`
3. Update DNS records as instructed

## Why Vercel?

- ✅ Unlimited deployments (no quota like Render)
- ✅ Auto-deploy on every git push
- ✅ Zero-config for React apps
- ✅ Global CDN included
- ✅ Free tier sufficient for this project
