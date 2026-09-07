# Deployment Checklist

## Before Deploying

- [ ] Review all environment variables in `.env.example`
- [ ] Generate a secure `SECRET_KEY` for JWT tokens
- [ ] Verify AWS Bedrock credentials and permissions
- [ ] Test database connection locally
- [ ] Run migrations locally: `cd backend && python migrate.py`
- [ ] Test application locally: `bash start.sh`
- [ ] Commit all changes to Git
- [ ] Push to GitHub/GitLab

## Environment Variables to Set

Copy these from your `.env` file to your deployment platform:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `AWS_ACCESS_KEY_ID` - AWS credentials
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS credentials
- [ ] `AWS_REGION` - e.g., `ap-southeast-2`
- [ ] `MODEL_ID` - e.g., `amazon.nova-lite-v1:0`
- [ ] `KNOWLEDGE_BASE_ID` - Your AWS KB ID
- [ ] `KNOWLEDGE_BASE_MODEL_ARN` - Full ARN of the model
- [ ] `FRONTEND_URL` - Your frontend URL (for CORS)
- [ ] `SECRET_KEY` - Secure random string for JWT

## Deployment Steps (Railway Example)

1. [ ] Push code to GitHub
2. [ ] Go to railway.app
3. [ ] Create new project from GitHub repo
4. [ ] Add all environment variables
5. [ ] Railway auto-deploys using `railway.toml`
6. [ ] Check deployment logs for errors
7. [ ] Test health endpoint: `https://your-app.railway.app/health`
8. [ ] Test authentication: Register and login
9. [ ] Test AWS Bedrock: Ask a question
10. [ ] Update frontend `API_BASE_URL` to deployed backend URL

## Post-Deployment Verification

- [ ] Health check returns 200 OK
- [ ] Database migrations completed successfully
- [ ] User registration works
- [ ] User login works
- [ ] JWT authentication works
- [ ] Trip creation works
- [ ] AWS Bedrock /ask endpoint works
- [ ] Conversation save/load works
- [ ] CORS headers allow frontend access

## Common Issues & Fixes

### "No such file or directory"
- Ensure `start.sh` exists at project root
- Check file permissions: `chmod +x start.sh` (if deploying from Unix)
- Verify platform supports bash scripts

### Database connection fails
- Check `DATABASE_URL` format
- Verify database allows external connections
- Confirm SSL mode is correct (`sslmode=require` for Neon)

### AWS Bedrock errors
- Verify IAM permissions include Bedrock access
- Check Knowledge Base ID is correct
- Ensure region matches KB location

### CORS errors
- Update `FRONTEND_URL` to match deployed frontend
- For multiple origins, use comma-separated: `https://app.com,https://www.app.com`

### Migrations not running
- Check logs for migration errors
- Verify `migrate.py` is being executed
- Ensure database user has CREATE TABLE permissions

## Rollback Plan

If deployment fails:

1. Check logs on platform dashboard
2. Verify environment variables are set correctly
3. Test locally with same environment variables
4. If needed, rollback to previous deployment
5. Fix issues and redeploy

## Security Reminders

- [ ] `.env` file is in `.gitignore`
- [ ] No secrets committed to Git
- [ ] `SECRET_KEY` is strong and unique
- [ ] AWS credentials have minimal required permissions
- [ ] Database password is strong
- [ ] HTTPS is enabled (automatic on most platforms)

## Monitoring

After deployment, monitor:
- Application logs for errors
- Database connection health
- API response times
- AWS Bedrock usage and costs
- Error rates

## Next Steps

- [ ] Deploy frontend to Vercel/Netlify
- [ ] Update frontend API URL
- [ ] Test full application flow
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts (optional)
- [ ] Set up CI/CD pipeline (optional)
