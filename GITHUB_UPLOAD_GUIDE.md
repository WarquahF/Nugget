# GitHub Upload & Environment Setup Guide

## ✅ What's Been Prepared

All sensitive credentials have been moved to environment variables:

### 1. **Credentials Removed**
- ❌ Email username/password removed from `electron/main.js`
- ❌ SDK keys removed from source code
- ✅ Replaced with `process.env` variables

### 2. **Environment Files Created**
- `.env.example` - Frontend environment variables template
- `jarvis-app/.env - Copy.example` - Backend environment variables template  
- `.gitignore` - Prevents `.env` and sensitive files from being committed

### 3. **Files to Never Commit** (already in .gitignore)
```
.env
.env.local
.env.*.local
node_modules/
build/
dist/
*.gguf  (LLM models)
```

---

## 📋 Steps to Upload to GitHub

### Step 1: Create a GitHub Repository
1. Go to https://github.com/new
2. Create a new repository (name it `JARVIS` or similar)
3. **Do NOT add README, .gitignore, or license** (we have our own)
4. Copy the repository URL (e.g., `https://github.com/YourUsername/JARVIS.git`)

### Step 2: Configure Git (Run these commands in PowerShell)
```powershell
cd "c:\Users\Avengers\Desktop\J.A.R.V.I.S"

# Configure git (use your GitHub email/username)
git config --global user.name "Your Name"
git config --global user.email "your_email@github.com"

# Initialize repository
git init

# Add all files (respects .gitignore automatically)
git add .

# Create initial commit
git commit -m "Initial J.A.R.V.I.S project commit - credentials secured in env variables"

# Add GitHub remote
git remote add origin https://github.com/YourUsername/JARVIS.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

### Step 3: Set Up Environment Variables

**For Frontend Development:**
1. Copy `front-end/.env.example` → `front-end/.env.local`
2. Fill in your actual values:
   ```
   REACT_APP_EMAIL_USER=your_gmail@gmail.com
   REACT_APP_EMAIL_PASS=your_gmail_app_password
   REACT_APP_ZOOM_SDK_KEY=your_zoom_sdk_key
   REACT_APP_ELEVENLABS_API_KEY=your_elevenlabs_key
   ```

**For Backend:**
1. Copy `jarvis-app/.env - Copy.example` → `jarvis-app/.env.local`
2. Fill in your actual values:
   ```
   ZOOM_SDK_KEY=your_zoom_sdk_key
   ZOOM_PASSWORD=your_zoom_password
   ELEVENLABS_API_KEY=your_elevenlabs_key
   EMAIL_USER=your_gmail@gmail.com
   EMAIL_PASS=your_gmail_app_password
   ```

### Step 4: Verify Nothing Sensitive is Committed
```powershell
git log --oneline
git show --name-status  # Review what was committed
```

---

## 🔐 Security Checklist

Before pushing to GitHub:

- [ ] `.env` files are in `.gitignore`
- [ ] No hardcoded API keys in source files
- [ ] `electron/main.js` uses `process.env` for email credentials
- [ ] `.gitignore` includes:
  - `node_modules/`
  - `build/`, `dist/`
  - `*.gguf` (large model files)
  - `.env` and `.env.*`

---

## 📝 How to Get Your API Keys

1. **Gmail App Password** (for Nodemailer):
   - https://myaccount.google.com/apppasswords
   - Generate app password for "Mail"

2. **Zoom SDK Keys**:
   - https://marketplace.zoom.us
   - Create app → get SDK Key & Password

3. **ElevenLabs API Key**:
   - https://elevenlabs.io/sign-up
   - Get API key from account settings

4. **LLM Models**:
   - Download `llama3.gguf` and place in `front-end/models/`
   - Update path in `.env.local` if needed

---

## 🚀 Running After GitHub Setup

```powershell
# Frontend (web dev server)
cd front-end
npm install
npm start

# Electron desktop app
npm run electron-dev

# Build for production
npm run build && npm run electron-pack
```

---

## ⚠️ Important Notes

- **Never commit `.env` files** - they contain secrets
- **Use `.env.example`** as documentation for required variables
- Each developer has their own `.env.local` with personal API keys
- The `.gitignore` is already configured to prevent accidents

---

## ✅ Status Summary

**Completed:**
- ✅ Removed hardcoded credentials from code
- ✅ Created `.env.example` files
- ✅ Updated `electron/main.js` to use `process.env`
- ✅ Added comprehensive `.gitignore`
- ✅ Front-end app is building and running successfully
- ✅ All import/export issues resolved

**Ready for GitHub:**
- ✅ Security: All secrets moved to environment variables
- ✅ Clean repository: `.gitignore` prevents sensitive files
- ✅ Documentation: `.env.example` guides setup

