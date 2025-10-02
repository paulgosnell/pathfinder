# GitHub Actions CI/CD Setup Guide

This guide will help you set up automated testing and deployment using GitHub Actions.

## 📋 Prerequisites

- GitHub repository for your project
- Vercel account (for deployment)
- Environment variables configured

## 🔧 Setup Instructions

### 1. GitHub Repository Secrets

Add the following secrets to your GitHub repository:

**Navigate to:** Repository → Settings → Secrets and variables → Actions → New repository secret

#### Required Secrets:

1. **OPENAI_API_KEY**
   - Your OpenAI API key for running tests
   - Used in build process validation
   - Get from: https://platform.openai.com/api-keys

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Your Supabase project URL
   - Public, but good to store as secret
   - Get from: Supabase Dashboard → Settings → API

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Your Supabase anonymous key
   - Public, but good to store as secret
   - Get from: Supabase Dashboard → Settings → API

4. **SUPABASE_SERVICE_ROLE_KEY**
   - Your Supabase service role key
   - **Keep this secret!** Never expose to client
   - Get from: Supabase Dashboard → Settings → API

#### Optional Secrets (for automated Vercel deployment):

5. **VERCEL_TOKEN**
   - Vercel authentication token
   - Get from: Vercel Dashboard → Settings → Tokens
   - Create a new token with full access

6. **VERCEL_ORG_ID**
   - Your Vercel organization/user ID
   - Get from: Vercel Dashboard → Settings → General
   - Or from `.vercel/project.json` after running `vercel link`

7. **VERCEL_PROJECT_ID**
   - Your specific project ID
   - Get from: Vercel project settings
   - Or from `.vercel/project.json` after running `vercel link`

### 2. Getting Vercel IDs

Run these commands locally:

```bash
cd adhd-support-agent

# Install Vercel CLI if not already installed
npm install -g vercel

# Link your project to Vercel
vercel link

# This creates .vercel/project.json with your IDs
cat .vercel/project.json
```

Copy the `orgId` and `projectId` from the output and add them as secrets.

### 3. Workflow File

The CI/CD workflow is already created at `.github/workflows/ci.yml`. It includes:

- ✅ Linting and type checking
- ✅ Running tests
- ✅ Building the application
- ✅ Security audits
- ✅ Automatic deployment to Vercel (on main branch)

### 4. Verify Setup

1. **Push to a feature branch:**
   ```bash
   git checkout -b test-ci
   git add .
   git commit -m "Test CI/CD pipeline"
   git push origin test-ci
   ```

2. **Create a Pull Request** on GitHub

3. **Check the Actions tab** in your GitHub repository
   - You should see workflows running
   - Lint, test, and build jobs should execute

4. **Merge to main branch:**
   - After PR approval, merge to main
   - Deploy job should trigger automatically
   - Check Vercel dashboard for deployment status

## 🎯 What the CI/CD Pipeline Does

### On Pull Requests:
1. **Linting** - Checks code quality with ESLint
2. **Type Checking** - Validates TypeScript types
3. **Testing** - Runs Jest test suite
4. **Building** - Ensures production build succeeds
5. **Security** - Audits dependencies for vulnerabilities

### On Push to Main:
- Everything above, **plus**:
- **Deployment** - Automatically deploys to Vercel production

## 🔍 Monitoring Workflows

### View Workflow Status:
1. Go to your repository on GitHub
2. Click the **"Actions"** tab
3. See all workflow runs and their status

### Debugging Failed Workflows:
1. Click on the failed workflow
2. Click on the failed job
3. Expand the failing step to see error details
4. Fix the issue and push again

## 📝 Workflow Configuration

The workflow file (`.github/workflows/ci.yml`) can be customized:

### Change Node.js Version:
```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '20'  # Change this
```

### Adjust Test Timeout:
```yaml
- name: Run tests
  run: npm test
  timeout-minutes: 10  # Add this line
```

### Skip Deployment on Specific Branches:
```yaml
if: github.ref == 'refs/heads/main' && github.event_name == 'push'
```

## 🚨 Troubleshooting

### "Secrets not found" Error:
- Verify secrets are added to repository settings
- Check secret names match exactly (case-sensitive)
- Ensure you're looking at the correct repository

### Build Fails with "Missing Environment Variables":
- Mock environment variables are set in the workflow
- If build still fails, check the error message
- You may need to adjust the mock values in `.github/workflows/ci.yml`

### Tests Fail in CI but Pass Locally:
- CI runs in a clean environment
- Check for dependencies on local state or files
- Ensure all required test fixtures are committed
- Verify environment variables are properly mocked

### Deployment Fails:
- Verify Vercel token is valid
- Check VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct
- Ensure Vercel project exists and is linked
- Review Vercel deployment logs

### Security Audit Warnings:
- The workflow continues even with audit warnings
- Review the audit report in the Actions tab
- Update vulnerable dependencies as needed
- Run `npm audit fix` locally and commit

## 🎨 Customization Options

### Add Slack/Discord Notifications:
```yaml
- name: Notify on success
  if: success()
  run: |
    curl -X POST YOUR_WEBHOOK_URL \
      -d '{"text": "✅ Deployment successful!"}'
```

### Add Code Coverage:
```yaml
- name: Run tests with coverage
  run: npm test -- --coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

### Add Preview Deployments:
Modify the deploy job to deploy PRs to Vercel preview:
```yaml
- name: Deploy to Preview
  if: github.event_name == 'pull_request'
  uses: amondnet/vercel-action@v25
  with:
    vercel-token: ${{ secrets.VERCEL_TOKEN }}
    vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
    vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## 📊 Status Badge

Add a status badge to your README.md:

```markdown
![CI/CD Pipeline](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/CD%20Pipeline/badge.svg)
```

Replace `YOUR_USERNAME` and `YOUR_REPO` with your actual values.

## ✅ Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Test locally first** - Run `npm run lint`, `npm test`, `npm run build` before pushing
3. **Review workflow logs** - Check Actions tab after each push
4. **Keep dependencies updated** - Run `npm audit` regularly
5. **Use branch protection** - Require passing tests before merge

## 🔗 Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [GitHub Secrets Guide](https://docs.github.com/en/actions/security-guides/encrypted-secrets)

---

**Last Updated:** September 30, 2025  
**Version:** 1.0.0

