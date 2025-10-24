# 📦 GitHub Setup Instructions

Follow these steps to push your Code Q Projects to GitHub.

---

## 🎯 Option 1: Create Repository via GitHub Website (Easiest)

### Step 1: Create the Repository

1. Go to **https://github.com/new**
2. Fill in the repository details:
   - **Repository name:** `code-q-projects` (or your preferred name)
   - **Description:** `Modern portfolio showcase platform with drag-and-drop, multi-image carousel, and Google Sheets integration`
   - **Visibility:** Choose Public or Private
   - **DO NOT** initialize with README, .gitignore, or license (we already have these)
3. Click **"Create repository"**

### Step 2: Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
# Add the remote repository
git remote add origin https://github.com/YOUR_USERNAME/code-q-projects.git

# Push your code
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

### Step 3: Verify

Go to `https://github.com/YOUR_USERNAME/code-q-projects` to see your code!

---

## 🎯 Option 2: Create Repository via GitHub CLI (Advanced)

If you have GitHub CLI installed:

```bash
# Create repository and push
gh repo create code-q-projects --public --source=. --remote=origin --push
```

Or for a private repository:

```bash
gh repo create code-q-projects --private --source=. --remote=origin --push
```

---

## ✅ Verification Checklist

After pushing, verify on GitHub:

- [ ] All files are visible
- [ ] README.md displays correctly
- [ ] Version badge shows v1.0.0
- [ ] Documentation files are present
- [ ] `.env.local` is NOT in the repository (check .gitignore)

---

## 🔒 Security Check

Make sure these are in `.gitignore` and NOT pushed:

- ✅ `.env.local` - Environment variables
- ✅ `.env` - Any environment files
- ✅ `node_modules/` - Dependencies
- ✅ `.next/` - Build files
- ✅ `.claude/` - AI assistant files

---

## 🌟 Next Steps

### Add Topics/Tags

On your GitHub repository page:
1. Click the ⚙️ gear icon next to "About"
2. Add topics: `nextjs`, `react`, `typescript`, `portfolio`, `tailwindcss`, `drag-and-drop`
3. Save changes

### Enable GitHub Pages (Optional)

If you want to deploy:
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` → `/` (root)
4. Save

Or better yet, deploy to Vercel (see below)

### Deploy to Vercel

1. Go to **https://vercel.com**
2. Click "New Project"
3. Import from GitHub
4. Select your repository
5. Add environment variables (if using Google Sheets):
   - `GOOGLE_SERVICE_ACCOUNT_KEY`
   - `GOOGLE_SHEET_ID`
6. Click "Deploy"
7. Your site will be live at `your-project.vercel.app`

---

## 📝 Update README

After pushing, update your README with actual URLs:

1. Edit `README.md` on GitHub
2. Update these lines:
   - Line 45: Replace `YOUR_USERNAME` with your GitHub username
   - Line 212-214: Add your actual social media links
   - Line 23: Add your deployed URL

---

## 🎉 You're Done!

Your project is now on GitHub! Share the URL:
```
https://github.com/YOUR_USERNAME/code-q-projects
```

---

## 🆘 Troubleshooting

### "remote origin already exists"

```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/code-q-projects.git
git push -u origin main
```

### "Updates were rejected because the remote contains work"

```bash
git pull origin main --rebase
git push -u origin main
```

### "Permission denied (publickey)"

You need to set up SSH keys or use HTTPS with a personal access token.

**Quick fix:** Use HTTPS URL instead:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/code-q-projects.git
```

---

## 📊 Current Status

✅ **Version:** 1.0.0
✅ **Committed:** All files committed
✅ **Ready to Push:** Yes
⏳ **On GitHub:** Not yet - follow steps above

---

**Next command to run:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/code-q-projects.git
git push -u origin main
```

**Don't forget to replace `YOUR_USERNAME`!**
