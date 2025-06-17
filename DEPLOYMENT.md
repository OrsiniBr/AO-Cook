# Deployment Guide - Vercel

This guide will help you deploy your AO Cook Chatbot to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
3. **OpenAI API Key**: You'll need this for the backend functionality

## Step 1: Prepare Your Repository

Make sure your code is committed and pushed to your Git repository:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. **Go to Vercel Dashboard**: Visit [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Import Project**: Click "New Project"
3. **Connect Repository**: Select your Git repository
4. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: `bun run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   bun add -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Follow the prompts**:
   - Link to existing project or create new
   - Set up and deploy

## Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. **Go to Settings** → **Environment Variables**
2. **Add the following variables**:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NODE_ENV=production
   ```

## Step 4: Configure Build Settings

In your Vercel project settings:

1. **Build & Development Settings**:
   - **Framework Preset**: Other
   - **Build Command**: `bun run vercel-build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

2. **Functions**:
   - **Max Duration**: 30 seconds (for API routes)

## Step 5: Deploy

1. **Trigger Deployment**: Push to your main branch or manually deploy
2. **Wait for Build**: Vercel will build and deploy your application
3. **Get Your URL**: Your app will be available at `https://your-project.vercel.app`

## Configuration Files

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "dist/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/dist/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "functions": {
    "dist/server.js": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## Troubleshooting

### Common Issues

1. **Build Fails**:
   - Check that all dependencies are in `package.json`
   - Verify TypeScript compilation works locally
   - Check build logs in Vercel dashboard

2. **API Routes Not Working**:
   - Ensure environment variables are set correctly
   - Check that routes are prefixed with `/api`
   - Verify server.js is being built correctly

3. **Static Files Not Serving**:
   - Check that Vite is building to `dist` directory
   - Verify `vercel.json` routes are correct
   - Ensure `index.html` is in the build output

### Debugging

1. **Check Build Logs**: In Vercel dashboard → Deployments → View Function Logs
2. **Test Locally**: Run `bun run vercel-build` locally to test build process
3. **Check Environment**: Verify all environment variables are set

## Post-Deployment

1. **Test Your App**: Visit your Vercel URL and test the chat functionality
2. **Monitor Logs**: Check Vercel function logs for any errors
3. **Set Up Custom Domain** (Optional): Configure a custom domain in Vercel settings

## Performance Optimization

1. **Enable Caching**: Configure caching headers for static assets
2. **Optimize Images**: Use Vercel's image optimization
3. **Monitor Performance**: Use Vercel Analytics to track performance

## Security

1. **Environment Variables**: Never commit API keys to your repository
2. **CORS**: Configure CORS properly for production
3. **Rate Limiting**: Consider implementing rate limiting for API routes

## Support

If you encounter issues:
1. Check Vercel documentation: [vercel.com/docs](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Test locally with `bun run vercel-build` 