# KelanaAI Deployment Guide

This guide covers deploying the KelanaAI backend to various cloud platforms.

## Prerequisites

- Python 3.11+
- PostgreSQL database (we're using Neon.tech)
- AWS account with Bedrock access
- AWS Knowledge Base configured

## Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# AWS Credentials
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=ap-southeast-2

# AWS Bedrock
MODEL_ID=amazon.nova-lite-v1:0
KNOWLEDGE_BASE_ID=your_kb_id
KNOWLEDGE_BASE_MODEL_ARN=arn:aws:bedrock:region::foundation-model/model-id

# Application
FRONTEND_URL=https://your-frontend-url.com
SECRET_KEY=generate_a_secure_random_string_here
```

## Deployment Platforms

### 1. Railway (Recommended)

1. Push code to GitHub
2. Go to [Railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway will auto-detect `railway.toml` configuration
6. Add environment variables in Railway dashboard:
   - DATABASE_URL
   - AWS_ACCESS_KEY_ID
   - AWS_SECRET_ACCESS_KEY
   - AWS_REGION
   - MODEL_ID
   - KNOWLEDGE_BASE_ID
   - KNOWLEDGE_BASE_MODEL_ARN
   - FRONTEND_URL
   - SECRET_KEY
7. Deploy!

**Railway will automatically:**
- Install dependencies from `requirements.txt`
- Run database migrations via `start.sh`
- Start the FastAPI server on the assigned port

### 2. Render

1. Push code to GitHub
2. Go to [Render.com](https://render.com)
3. Click "New" → "Web Service"
4. Connect your repository
5. Render will detect `render.yaml`
6. Configure environment variables in Render dashboard
7. Deploy!

**Note:** Update `render.yaml` if you need to connect a Render PostgreSQL database.

### 3. Heroku

1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
5. Set environment variables:
   ```bash
   heroku config:set AWS_ACCESS_KEY_ID=your_key
   heroku config:set AWS_SECRET_ACCESS_KEY=your_secret
   heroku config:set AWS_REGION=ap-southeast-2
   heroku config:set MODEL_ID=amazon.nova-lite-v1:0
   heroku config:set KNOWLEDGE_BASE_ID=your_kb_id
   heroku config:set KNOWLEDGE_BASE_MODEL_ARN=your_arn
   heroku config:set FRONTEND_URL=https://your-frontend.com
   heroku config:set SECRET_KEY=your_secret_key
   ```
6. Deploy: `git push heroku main`

**Heroku uses `Procfile`** which runs `start.sh` automatically.

### 4. Google Cloud Run

1. Install Google Cloud CLI
2. Build container:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT-ID/kelana-ai
   ```
3. Deploy:
   ```bash
   gcloud run deploy kelana-ai \
     --image gcr.io/PROJECT-ID/kelana-ai \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```
4. Set environment variables in Cloud Run console

### 5. AWS App Runner / Elastic Beanstalk

See AWS documentation for deploying Python FastAPI applications.

## Database Migrations

Migrations run automatically on startup via `start.sh`.

To run manually:
```bash
cd backend
python migrate.py
```

Migration files are in `backend/migrations/`:
- `001_create_users.sql`
- `002_add_user_id_to_trips.sql`
- `003_create_conversations_and_messages.sql`

## Health Check

All platforms can use the `/health` endpoint:
```
GET https://your-app.com/health
```

Response:
```json
{
  "status": "OK"
}
```

## CORS Configuration

Update `FRONTEND_URL` environment variable to match your deployed frontend URL.

In `backend/main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Troubleshooting

### "No such file or directory" error
- Ensure `start.sh` has execution permissions: `chmod +x start.sh`
- Check that the platform supports bash scripts
- Verify working directory is set correctly

### Database connection issues
- Verify `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database allows connections from the platform's IP range
- Check SSL requirements (Neon requires `sslmode=require`)

### AWS Bedrock errors
- Verify AWS credentials are correct
- Ensure the IAM user has Bedrock permissions
- Check Knowledge Base ID and ARN are correct
- Verify region matches your Knowledge Base location

### Migration failures
- Check database connection
- Ensure database user has CREATE TABLE permissions
- Verify migration files exist in `backend/migrations/`

## Local Testing

Test deployment configuration locally:

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
cd backend
python migrate.py

# Start server
cd ..
bash start.sh
```

Visit `http://localhost:8000/health` to verify.

## Security Notes

1. **Never commit `.env` files** (already in `.gitignore`)
2. **Use strong SECRET_KEY** - generate with:
   ```python
   import secrets
   print(secrets.token_urlsafe(32))
   ```
3. **Rotate AWS credentials** periodically
4. **Use environment variables** for all sensitive data
5. **Enable HTTPS** on production (most platforms do this automatically)

## Support

For deployment issues:
- Check platform-specific documentation
- Review application logs
- Verify environment variables are set correctly
- Ensure database is accessible

## Next Steps

After deploying backend:
1. Deploy frontend (Next.js) to Vercel/Netlify
2. Update frontend `API_BASE_URL` to point to deployed backend
3. Update `FRONTEND_URL` environment variable in backend
4. Test authentication flow
5. Test AWS Bedrock Knowledge Base integration
