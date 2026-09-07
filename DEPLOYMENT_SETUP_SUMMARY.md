# Deployment Setup Summary

## Files Created for Deployment

### 1. **start.sh** (Startup Script)
- Runs database migrations before starting the server
- Starts uvicorn on the correct port
- Used by all deployment platforms

### 2. **Procfile** (Heroku/Render)
- Specifies how to start the application
- Used by Heroku and some other platforms

### 3. **railway.toml** (Railway)
- Configuration for Railway.app deployment
- Specifies build and start commands
- Includes health check configuration

### 4. **render.yaml** (Render)
- Configuration for Render.com deployment
- Defines web service settings
- Includes environment variable templates

### 5. **runtime.txt** (Python Version)
- Specifies Python 3.11.0
- Used by platforms to select correct Python version

### 6. **Dockerfile** (Container Deployment)
- For Docker-based deployments
- Can be used with Google Cloud Run, AWS ECS, etc.
- Includes all dependencies and startup script

### 7. **.dockerignore** (Docker)
- Excludes unnecessary files from Docker image
- Reduces image size and build time

### 8. **.env.example** (Template)
- Example environment variables
- Documentation for required configuration
- No sensitive data included

### 9. **DEPLOYMENT.md** (Guide)
- Complete deployment instructions
- Platform-specific steps
- Troubleshooting guide

### 10. **DEPLOYMENT_CHECKLIST.md** (Checklist)
- Step-by-step deployment verification
- Post-deployment checks
- Security reminders

## Code Changes Made

### 1. **backend/database.py**
- Now handles .env file in both root and backend directories
- Throws error if DATABASE_URL is not set
- More robust for deployment environments

### 2. **backend/main.py**
- CORS now uses `FRONTEND_URL` environment variable
- Supports comma-separated multiple origins
- Loads dotenv explicitly

### 3. **.gitignore**
- Expanded to exclude more files
- Prevents committing sensitive data
- Includes Python, Node, and IDE files

## Environment Variables Required

All deployment platforms need these environment variables:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# AWS
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-southeast-2

# Bedrock
MODEL_ID=amazon.nova-lite-v1:0
KNOWLEDGE_BASE_ID=your_kb_id
KNOWLEDGE_BASE_MODEL_ARN=arn:aws:bedrock:region::foundation-model/model

# Application
FRONTEND_URL=https://your-frontend.com
SECRET_KEY=your_secure_random_key
```

## How It Works

### Deployment Flow:

1. **Platform detects configuration**
   - Railway reads `railway.toml`
   - Render reads `render.yaml`
   - Heroku reads `Procfile`
   - Docker-based platforms use `Dockerfile`

2. **Install dependencies**
   - Runs: `pip install -r requirements.txt`

3. **Run startup script**
   - Executes: `bash start.sh`
   - Which does:
     ```bash
     cd backend
     python migrate.py    # Run migrations
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```

4. **Application starts**
   - FastAPI server runs
   - Health check at `/health`
   - Ready to accept requests

## Quick Deploy Commands

### Railway
```bash
# Push to GitHub
git add .
git commit -m "Add deployment configuration"
git push origin main

# Then connect on railway.app
# Railway auto-deploys from railway.toml
```

### Docker
```bash
# Build
docker build -t kelana-ai .

# Run locally
docker run -p 8000:8000 --env-file backend/.env kelana-ai

# Deploy to cloud
# (varies by platform - see DEPLOYMENT.md)
```

### Heroku
```bash
heroku create kelana-ai
heroku config:set DATABASE_URL=...
heroku config:set AWS_ACCESS_KEY_ID=...
# (set all env vars)
git push heroku main
```

## Testing Deployment

After deploying, test these endpoints:

1. **Health Check**
   ```
   GET https://your-app.com/health
   ```

2. **Register User**
   ```
   POST https://your-app.com/api/v1/auth/register
   ```

3. **Login**
   ```
   POST https://your-app.com/api/v1/auth/login
   ```

4. **Ask Question**
   ```
   POST https://your-app.com/api/v1/ask
   ```

## Common "No such file or directory" Fixes

This error typically means:

1. **Working directory is wrong**
   - Solution: Use `cd backend` in startup script ✓

2. **File paths are incorrect**
   - Solution: Use relative paths from backend directory ✓

3. **Migrations directory not found**
   - Solution: Ensure `backend/migrations/` exists ✓

4. **.env file not accessible**
   - Solution: Use environment variables from platform ✓

5. **start.sh not executable**
   - Solution: Run `chmod +x start.sh` or use `bash start.sh` ✓

## Next Steps

1. **Choose deployment platform** (Railway recommended)
2. **Set environment variables** on platform dashboard
3. **Push code to GitHub**
4. **Connect repository** to deployment platform
5. **Deploy and test**
6. **Update frontend** API URL to deployed backend
7. **Test full application** flow

## Support

If you encounter issues:

1. Check application logs on platform dashboard
2. Verify all environment variables are set
3. Test the startup script locally: `bash start.sh`
4. Review DEPLOYMENT.md for platform-specific notes
5. Check DEPLOYMENT_CHECKLIST.md for verification steps

## Files to Commit

Make sure to commit these new files:

```bash
git add start.sh Procfile railway.toml render.yaml runtime.txt
git add Dockerfile .dockerignore .env.example
git add DEPLOYMENT.md DEPLOYMENT_CHECKLIST.md
git add .gitignore  # Updated version
git commit -m "Add deployment configuration files"
git push
```

**Do NOT commit:** `.env` files (they're in `.gitignore`)
