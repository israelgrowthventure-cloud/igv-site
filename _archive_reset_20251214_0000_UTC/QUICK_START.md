# 🎯 CMS Integration - Quick Start Guide

## ⚡ What Just Happened?

Your IGV website is now **100% controlled by a visual CMS**. No more code changes for content updates!

---

## 📂 New File Structure

```
igv-website-complete/
├── CMS_INTEGRATION.md          ← Full architecture documentation
├── CMS_BLOCKS_REFERENCE.md     ← Block types reference
├── IMPLEMENTATION_SUMMARY.md   ← This implementation summary
│
└── frontend/
    ├── .env                     ← Updated with CMS API URL
    ├── .env.example             ← Template with CMS config
    │
    ├── src/
    │   ├── App.js               ← Modified: Universal CMS routing
    │   │
    │   ├── components/
    │   │   └── cms/
    │   │       └── CmsPageRenderer.jsx  ← NEW: Renders CMS blocks
    │   │
    │   ├── pages/
    │   │   ├── CmsPage.js       ← NEW: Universal page loader
    │   │   ├── Home.js          ⚠️ NO LONGER USED (kept for reference)
    │   │   ├── Packs.js         ⚠️ NO LONGER USED (kept for reference)
    │   │   └── ...              ⚠️ Other pages no longer used
    │   │
    │   ├── hooks/
    │   │   └── usePricing.js    ← NEW: Reusable pricing logic
    │   │
    │   └── utils/
    │       ├── cms/
    │       │   └── cmsApi.js    ← NEW: CMS API functions
    │       └── businessLogic.js ← NEW: Technical logic preservation
```

---

## 🚀 Deployment Checklist

### ✅ Step 1: Code (DONE)
- [x] CMS integration complete
- [x] All files committed
- [x] Pushed to GitHub
- [x] Build tested successfully

### ⚠️ Step 2: Environment Variable (CRITICAL - YOU MUST DO THIS)

1. Go to **[Render Dashboard](https://dashboard.render.com/)**
2. Select your **frontend service** (igv-website-complete)
3. Click **Environment** tab
4. Click **Add Environment Variable**
5. Enter:
   ```
   Key: REACT_APP_CMS_API_URL
   Value: https://igv-cms-backend.onrender.com/api
   ```
6. Click **Save Changes**
7. Render will automatically redeploy

**⚠️ WITHOUT THIS VARIABLE, YOUR SITE WILL SHOW "CMS NOT CONFIGURED" ERROR**

### ⚠️ Step 3: Create Pages in CMS (REQUIRED)

Go to your CMS admin interface and create these pages:

1. **Homepage** (slug: `home`)
   - Add hero block with title, subtitle, image
   - Add buttons for CTAs
   - Add sections for features/services

2. **Packs** (slug: `packs`)
   - Add pricing blocks for each pack
   - Add pack descriptions
   - Add order buttons

3. **About** (slug: `about`)
   - Add company information
   - Add team section

4. **Contact** (slug: `contact`)
   - Add contact form
   - Add contact details

**Until you create these pages, visitors will see "Page Not Found"**

---

## 🎨 How to Use the CMS

### Edit Existing Page
1. Open CMS admin
2. Select page from list
3. Modify blocks:
   - Change text
   - Upload images
   - Adjust colors/spacing
   - Reorder blocks (drag & drop)
4. Click **Publish**
5. ✅ Changes are **immediately live** (no deployment)

### Create New Page
1. Open CMS admin
2. Click **Create New Page**
3. Enter slug (e.g., `services`)
4. Add blocks:
   - Heading
   - Text
   - Image
   - Button
   - Pricing
   - etc.
5. Click **Publish**
6. ✅ Page is live at `https://israelgrowthventure.com/services`

---

## 📦 Available CMS Blocks

| Block | Purpose | Example Use |
|-------|---------|-------------|
| **section** | Container with styling | Wrap content areas |
| **columns** | 2-4 column layout | Feature grids |
| **heading** | h1-h6 titles | Page/section headers |
| **text** | Paragraphs | Body content |
| **image** | Images with captions | Hero images, photos |
| **button** | Call-to-action | Links, CTAs |
| **hero** | Hero section | Homepage hero |
| **pricing** | Pricing cards | Pack pricing |
| **spacer** | Vertical spacing | Layout spacing |
| **divider** | Horizontal line | Separators |

See **`CMS_BLOCKS_REFERENCE.md`** for complete details and examples.

---

## 🔧 Technical Features (Still in Code)

These technical features remain in the code and can be used by CMS blocks:

✅ **Pricing System**
```javascript
import { usePricing } from '../hooks/usePricing';
const { pricing } = usePricing('analyse');
// Display: pricing.display.total
```

✅ **Checkout**
```javascript
import { createCheckoutSession } from '../utils/businessLogic';
await createCheckoutSession({ packId, planType, zone, ... });
```

✅ **Geo-Detection**
```javascript
import { useGeo } from '../context/GeoContext';
const { zone, country_name } = useGeo();
```

✅ **Translations**
```javascript
import { useTranslation } from 'react-i18next';
const { t } = useTranslation();
```

---

## 🐛 Troubleshooting

### Issue: "CMS Not Configured" Error
**Cause:** `REACT_APP_CMS_API_URL` not set in Render  
**Fix:** Add environment variable (see Step 2 above)

### Issue: "Page Not Found" 
**Cause:** Page doesn't exist in CMS or not published  
**Fix:** Create page in CMS with correct slug and publish

### Issue: Site shows old content
**Cause:** Browser cache  
**Fix:** Hard refresh (Ctrl+Shift+R) or clear cache

### Issue: Changes not appearing
**Cause:** Page not published in CMS  
**Fix:** Ensure page status is "published" not "draft"

---

## 📞 Support Resources

- **Full Documentation:** `CMS_INTEGRATION.md`
- **Block Reference:** `CMS_BLOCKS_REFERENCE.md`
- **Implementation Details:** `IMPLEMENTATION_SUMMARY.md`
- **Code:** `frontend/src/components/cms/CmsPageRenderer.jsx`

---

## 🎉 Benefits You Now Have

1. ✅ **Zero-deployment updates** - Content changes are instant
2. ✅ **Designer independence** - No developer needed
3. ✅ **Faster iterations** - Test designs immediately
4. ✅ **Centralized control** - All content in one place
5. ✅ **Future-proof** - Easy to add pages
6. ✅ **Preserved logic** - Technical features still work

---

## 🚦 Current Status

- ✅ Code: **Complete**
- ✅ Build: **Successful** (147.65 kB gzipped)
- ✅ Git: **Committed & Pushed**
- ⚠️ Environment Variable: **YOU MUST SET THIS**
- ⚠️ CMS Pages: **YOU MUST CREATE THESE**
- ⏳ Deployment: **Ready after Steps 2 & 3**

---

## 🎯 Next Action: DO THIS NOW

1. Go to Render → Environment → Add `REACT_APP_CMS_API_URL`
2. Wait for automatic redeploy (~5 minutes)
3. Go to CMS admin → Create pages (home, packs, about, contact)
4. Visit your site → Verify pages load from CMS
5. ✅ Done!

---

**Implementation Date:** November 27, 2025  
**Status:** ✅ Code Complete - **⚠️ Awaiting Deployment Configuration**
