# 🔧 How to Setup Your Domain (Super Easy!)

## 📋 What You Need to Do

**Before using this extension, you need to tell it which website to work on.**

## ⚙️ Simple Steps

### Step 1: Find Your ERP Website Address
1. Go to your college ERP login page
2. Look at the address bar in your browser
3. Copy the website address (like `https://erp.yourcollege.edu`)

### Step 2: Edit the Config File  
1. **Right-click** on `manifest.json` → **Open with Notepad**
2. **Find this line**: `"https://your-erp-domain.com/*"`
3. **Replace `your-erp-domain.com`** with your actual ERP website

### Step 3: Examples to Help You

**If your ERP is**: `https://erp.college.edu`  
**Change it to**: `"https://erp.college.edu/*"`

**If your ERP is**: `https://portal.university.ac.in`  
**Change it to**: `"https://portal.university.ac.in/*"`

**Important**: Keep the `/*` at the end!

### Step 4: Save & Install
1. **Save** the file (Ctrl+S)
2. **Install** the extension in Chrome
3. **Go to your ERP** and it should work! 🎉

## ❓ Still Confused?

**Can't find the website address?** 
- Go to your ERP login page and copy everything before the first `/` after `.com` or `.edu`

**Example**: If you see `https://erp.college.edu/login/student` then use `https://erp.college.edu`

**Need help?** Email: csayaan221@gmail.com
