# Frontend Deployment Instructions

## Quick Deploy to Vercel

### Prerequisites
- Vercel account (sign up at https://vercel.com)
- Backend already deployed and URL obtained

### Step 1: Update API URL

Before deploying, update the production API URL in `js/config.js` (line 65):

```javascript
production: {
    apiBaseUrl: 'https://your-backend-project.vercel.app/api',  // ← Update this!
    environment: 'production',
    debug: false,
    mockMode: false
}
```

### Step 2: Deploy Using CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

### Step 3: Deploy Using Dashboard

1. Go to https://vercel.com/dashboard
2. Click "Add New Project"
3. Import Git repository: `https://github.com/adamwilson22/Velaa-dashboard.git`
4. Click "Deploy"

## Files Configured

- ✅ `vercel.json` - Deployment configuration
- ✅ `.vercelignore` - Files excluded from deployment

## After Deployment

1. Get your frontend URL: `https://your-frontend-project.vercel.app`
2. Update backend `ALLOWED_ORIGINS` environment variable with this URL
3. Test the application

## Automatic Deployments

- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment

---

For complete deployment guide, see: `VERCEL_DEPLOYMENT_GUIDE.md`

