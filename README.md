# 🚀 ERP CAPTCHA Solver Pro v3.0

A high-performance Chrome extension that automatically solves ERP CAPTCHAs with **near-100% accuracy**, now powered by the modern Tesseract.js v5 engine.

*Created by **Ayaan** - Making student life easier! 🎓*

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![Version](https://img.shields.io/badge/Version-3.0-brightgreen.svg)

## ⚠️ **Read This First**
This tool is for **educational purposes only**. Use only on your own college account and always respect your college's computer usage policies. See the full [DISCLAIMER.md](DISCLAIMER.md) for more information.

---

## ⚡ What's New in v3.0?

This is a complete overhaul of the extension's core logic, moving from the legacy Tesseract.js v2 to the modern **Tesseract.js v5 engine**. This update introduces:

- 🎯 **Dramatically Increased Accuracy:** A multi-stage image processing pipeline (Thresholding, Dilation, and Median Filtering) cleans the CAPTCHA image before analysis, resolving common OCR errors and pushing accuracy to near-100%.
- ⚙️ **Modern Performance:** Utilizes WebAssembly for a significant speed boost over the previous version.
- 🔒 **Enhanced Stability:** The new engine and processing logic are more robust and reliable.
- ✨ **Improved UI:** Features a clean, non-intrusive toast notification system for status updates.

## 🚀 Easy Setup (3 Steps!)

### Step 1: Configure Your College Domain
1.  **Open the `manifest.json` file** (e.g., with Notepad or VS Code).
2.  **Find the `host_permissions` section**.
3.  **Replace `"https://uuerp.uudoon.in/*"` with your ERP website's domain**. Examples:
    ```json
    "host_permissions": [
      "[https://erp.yourcollege.edu/](https://erp.yourcollege.edu/)*"
    ]
    ```
    or
    ```json
    "host_permissions": [
      "[https://portal.university.ac.in/](https://portal.university.ac.in/)*"
    ]
    ```
4.  **Do the same for the `matches` section** inside `content_scripts`.
5.  **Save the file**.

### Step 2: Install the Extension
1.  Open Chrome and navigate to `chrome://extensions/`.
2.  Turn on **"Developer mode"** (top-right corner).
3.  Click **"Load unpacked"** and select the folder containing these files.
4.  Done! ✅

### Step 3: Use It
1.  Go to your ERP login page.
2.  You'll see an "Extension ready!" notification.
3.  CAPTCHAs will now solve automatically with higher accuracy! 🎉

## 🛠️ Need Help?

**Extension not working?**
-   Double-check that the domain in `manifest.json` (in both `host_permissions` and `content_scripts`) exactly matches your ERP website's address.
-   Make sure you are on the correct login page.
-   Refresh the page or reload the extension from the `chrome://extensions` page.

**Questions?** Open an issue on GitHub or email: [csayaan221@gmail.com](mailto:csayaan221@gmail.com)

## 📄 Legal Stuff

-   ✅ **Educational use only** - do not misuse this tool.
-   ✅ **Use on your own account only**.
-   ✅ **Respect your college's policies**.
-   ✅ **Open source** - check the code yourself!

---

*Made with ❤️ by a fellow student.*