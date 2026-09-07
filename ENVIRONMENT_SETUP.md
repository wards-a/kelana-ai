# Environment Variables Setup Guide

This guide explains how environment variables are configured in KelanaAI.

## Project Structure

```
kelana-ai/
├── backend/           # FastAPI backend
│   ├── .env          # Backend environment variables (not committed)
│   └── ...
├── frontend/          # Next.js frontend
│   ├── .env          # Frontend environment variables (not committed)
│   └── ...
├── .env.example       # Backend environment template
└── frontend/.env.example  # Frontend environment template
```

## Backend Environment Variables

### Location
`backend/.env`

### Template
See `.env.example` in project root

### Required Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database

# AWS Credentials
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=ap-southeast-2

# AWS Bedrock
MODEL_ID=amazon.nova-lite-v1:0
KNOWLEDGE_BASE_ID=your_knowledge_base_id
KNOWLEDGE_BASE_MODEL_ARN=arn:aws:bedrock:ap-southeast-2::foundation-model/amazon.nova-lite-v1:0

# Application
FRONTEND_URL=http://localhost:3000
SECRET_KEY=your_secure_random_secret_key
```

### Usage in Backend

Backend files automatically load from `backend/.env`:

```python
# backend/database.py
from dotenv import load_dotenv
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")

# backend/main.py
allowed_origins = os.getenv("FRONTEND_URL", "http://localhost:3000").split(",")
```

## Frontend Environment Variables

### Location
`frontend/.env`

### Template
See `frontend/.env.example`

### Required Variables

```bash
# Backend API URL (must start with NEXT_PUBLIC_)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Usage in Frontend

All service files use this variable:

```typescript
// frontend/app/services/askService.ts
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/v1`;
```

### Important: Next.js Environment Variables

- **Must start with `NEXT_PUBLIC_`** to be accessible in browser
- Loaded at **build time**, not runtime
- Rebuild after changing environment variables
- Use for public values only (visible in browser)

## Local Development Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Create .env file
cp ../.env.example .env

# Edit .env with your values
# (Use your editor or nano/vim)

# Install dependencies
pip install -r requirements.txt

# Run migrations
python migrate.py

# Start server
cd ..
bash start.sh
```

Backend runs on: `http://localhost:8000`

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Create .env file
cp .env.example .env

# Edit if needed (default should work for local dev)
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs on: `http://localhost:3000`

## Production/Deployment Setup

### 1. Deploy Backend First

Choose a platform (Railway, Render, Heroku):

**Set these environment variables on your platform:**
- `DATABASE_URL`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `MODEL_ID`
- `KNOWLEDGE_BASE_ID`
- `KNOWLEDGE_BASE_MODEL_ARN`
- `FRONTEND_URL` (temporary: use `http://localhost:3000`)
- `SECRET_KEY` (generate secure value)

**Deploy and get your backend URL**, e.g.:
- `https://kelana-ai.railway.app`
- `https://kelana-ai.onrender.com`

### 2. Deploy Frontend

Choose a platform (Vercel recommended):

**Set this environment variable:**
- `NEXT_PUBLIC_API_URL` = Your deployed backend URL
  - Example: `https://kelana-ai.railway.app`
  - No trailing slash!

**Deploy and get your frontend URL**, e.g.:
- `https://kelana-ai.vercel.app`

### 3. Update Backend CORS

**Update backend `FRONTEND_URL`:**
- Change from `http://localhost:3000`
- To your deployed frontend URL: `https://kelana-ai.vercel.app`

**Redeploy backend** with updated environment variable

## Environment Variables by File

### Updated Files Using Environment Variables

1. **backend/database.py**
   - Reads: `DATABASE_URL`

2. **backend/main.py**
   - Reads: `FRONTEND_URL` (for CORS)

3. **backend/services/auth_service.py**
   - Reads: `SECRET_KEY` (for JWT)

4. **backend/services/bedrock_service.py**
   - Reads: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `MODEL_ID`

5. **backend/services/kb_service.py**
   - Reads: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `KNOWLEDGE_BASE_ID`, `KNOWLEDGE_BASE_MODEL_ARN`

6. **frontend/app/services/askService.ts**
   - Reads: `NEXT_PUBLIC_API_URL`

7. **frontend/app/services/authService.ts**
   - Reads: `NEXT_PUBLIC_API_URL`

8. **frontend/app/services/conversationService.ts**
   - Reads: `NEXT_PUBLIC_API_URL`

9. **frontend/app/services/tripService.ts**
   - Reads: `NEXT_PUBLIC_API_URL`

## Security Best Practices

### ✅ DO

- Keep `.env` files in `.gitignore`
- Use environment variables for all sensitive data
- Generate strong `SECRET_KEY`: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- Use different values for development/production
- Rotate credentials periodically
- Use minimal AWS IAM permissions

### ❌ DON'T

- Commit `.env` files to Git
- Hardcode secrets in code
- Share `.env` files publicly
- Use the same `SECRET_KEY` in dev and production
- Use admin AWS credentials

## Troubleshooting

### Backend Can't Find Environment Variables

**Problem:** `DATABASE_URL environment variable is not set`

**Solution:**
1. Ensure `backend/.env` exists
2. Check variable names match exactly
3. Verify no quotes around values
4. Restart backend server

### Frontend API Calls Fail

**Problem:** CORS errors or connection refused

**Solution:**
1. Check `NEXT_PUBLIC_API_URL` is set correctly
2. Ensure backend is running
3. Verify backend `FRONTEND_URL` matches frontend domain
4. Rebuild frontend after changing env vars

### Changes Not Taking Effect

**Backend:**
- Restart server after changing `.env`

**Frontend:**
- Stop dev server (Ctrl+C)
- Restart: `npm run dev`
- For production: rebuild and redeploy

## Generate Secure SECRET_KEY

### Python (Recommended)
```python
import secrets
print(secrets.token_urlsafe(32))
```

### Node.js
```javascript
console.log(require('crypto').randomBytes(32).toString('base64url'));
```

### Online (Use with caution)
- [randomkeygen.com](https://randomkeygen.com/)
- Use "Fort Knox Passwords" section

## Quick Reference

| Variable | Location | Example | Used By |
|----------|----------|---------|---------|
| `DATABASE_URL` | Backend | `postgresql://...` | Database connection |
| `AWS_ACCESS_KEY_ID` | Backend | `AKIA...` | AWS services |
| `AWS_SECRET_ACCESS_KEY` | Backend | `secret...` | AWS services |
| `AWS_REGION` | Backend | `ap-southeast-2` | AWS services |
| `MODEL_ID` | Backend | `amazon.nova-lite-v1:0` | Bedrock |
| `KNOWLEDGE_BASE_ID` | Backend | `EW7EM5BPON` | Bedrock KB |
| `KNOWLEDGE_BASE_MODEL_ARN` | Backend | `arn:aws:bedrock:...` | Bedrock KB |
| `FRONTEND_URL` | Backend | `http://localhost:3000` | CORS |
| `SECRET_KEY` | Backend | Random string | JWT auth |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:8000` | API calls |

## Files Reference

- `.env.example` - Backend template (root level)
- `frontend/.env.example` - Frontend template
- `backend/.env` - Backend config (not committed)
- `frontend/.env` - Frontend config (not committed)
- `.gitignore` - Excludes .env files
- `DEPLOYMENT.md` - Deployment guide
- `frontend/DEPLOYMENT.md` - Frontend deployment guide
