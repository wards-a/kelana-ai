# Frontend Deployment Guide (Next.js)

## Environment Variables

The frontend needs one environment variable to connect to the backend API:

### Development (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Production
```bash
NEXT_PUBLIC_API_URL=https://your-backend-url.com
```

**Important:** 
- Next.js requires environment variables to be prefixed with `NEXT_PUBLIC_` to be accessible in the browser
- Update this after deploying the backend

## Deployment Platforms

### 1. Vercel (Recommended for Next.js)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Configure environment variables"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration

3. **Set Environment Variable**
   - In project settings → Environment Variables
   - Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
   - Important: Use your deployed backend URL!

4. **Deploy**
   - Vercel deploys automatically
   - Get your frontend URL (e.g., `https://kelana-ai.vercel.app`)

5. **Update Backend CORS**
   - Add your Vercel URL to backend `FRONTEND_URL` environment variable
   - Example: `FRONTEND_URL=https://kelana-ai.vercel.app`

### 2. Netlify

1. **Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Base directory: `frontend`

2. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL` in Netlify dashboard

3. **Deploy**
   - Netlify auto-deploys from Git

### 3. Railway

1. **Create New Project**
   - Select GitHub repo
   - Set root directory: `frontend`

2. **Environment Variables**
   - Add `NEXT_PUBLIC_API_URL`

3. **Deploy**
   - Railway auto-detects Next.js

## Local Development

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open browser**
   - Navigate to `http://localhost:3000`

## Build for Production

```bash
cd frontend
npm run build
npm start
```

## Important Notes

### CORS Configuration
After deploying frontend, update backend CORS:

1. Set backend `FRONTEND_URL` environment variable
2. Example: `FRONTEND_URL=https://kelana-ai.vercel.app`
3. Multiple origins: `FRONTEND_URL=https://app.vercel.app,https://www.app.com`

### API URL Configuration
- Development: `http://localhost:8000`
- Production: Your deployed backend URL
- Must include protocol (`https://` or `http://`)
- No trailing slash

### Testing Deployment

After deployment, test:

1. **Frontend loads** - Visit your Vercel URL
2. **Register works** - Create new account
3. **Login works** - Sign in
4. **API calls work** - Create a trip, ask a question
5. **CORS works** - No console errors

## Environment Variables Reference

| Variable | Example | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `https://api.example.com` | Backend API URL (no trailing slash) |

## Troubleshooting

### CORS Errors
- Check backend `FRONTEND_URL` matches your frontend domain
- Ensure both URLs use HTTPS in production
- Check browser console for specific error

### API Connection Fails
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is deployed and running
- Test backend health: `https://backend-url.com/health`

### Environment Variable Not Working
- Must start with `NEXT_PUBLIC_`
- Rebuild after changing environment variables
- On Vercel: redeploy after updating env vars

## Deployment Checklist

- [ ] Backend deployed and accessible
- [ ] Backend health endpoint works
- [ ] Frontend `NEXT_PUBLIC_API_URL` set to backend URL
- [ ] Backend `FRONTEND_URL` set to frontend URL
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test trip creation
- [ ] Test ask/conversation feature
- [ ] Check browser console for errors
- [ ] Verify CORS working (no CORS errors)

## Next Steps

1. Deploy backend first
2. Get backend URL
3. Deploy frontend with backend URL
4. Get frontend URL
5. Update backend CORS with frontend URL
6. Test complete application flow

## Custom Domain (Optional)

### Vercel
1. Go to project settings → Domains
2. Add your custom domain
3. Update DNS records
4. Update backend `FRONTEND_URL`

### Netlify
1. Go to Domain settings
2. Add custom domain
3. Configure DNS
4. Update backend CORS
