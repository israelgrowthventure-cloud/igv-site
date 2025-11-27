# CMS Integration - Complete Documentation

## 🎯 CRITICAL ARCHITECTURE CHANGE

**This website is now 100% controlled by a visual CMS.**

ALL pages (homepage, packs, about, contact, etc.) are now dynamic and come from the CMS backend.  
The only exception is `/admin` routes which remain for administrative purposes.

---

## 📋 What Changed

### Before (Hardcoded Pages)
- Every page was a React component with hardcoded HTML/JSX
- To change content, you had to edit code and redeploy
- Designers couldn't change layouts without developer help

### After (CMS-Controlled)
- Every page is a collection of "blocks" defined in the CMS
- To change content, edit in the CMS admin interface (no code deployment)
- Designers have full control over layout, content, and styling
- New pages can be added without touching code

---

## 🏗️ Architecture Overview

```
User visits /{path}
      ↓
CmsPage component
      ↓
Fetch from: ${REACT_APP_CMS_API_URL}/pages/{slug}
      ↓
Receives blocks array: [{ type, props, children }]
      ↓
CmsPageRenderer renders blocks into React components
      ↓
Final HTML displayed to user
```

---

## 📁 New Files Created

### 1. **frontend/src/components/cms/CmsPageRenderer.jsx**
Universal component that renders CMS blocks into HTML.

**Supported block types:**
- `section`: Container with background, padding, alignment
- `columns`: Multi-column layout (2-4 columns)
- `heading`: Text heading (h1-h6)
- `text`: Paragraph or rich text
- `image`: Image with optional caption
- `button`: Call-to-action button (internal link or external)
- `hero`: Hero section with title, subtitle, image
- `pricing`: Pricing card with features list
- `spacer`: Vertical spacing
- `divider`: Horizontal line
- `grid`: Generic container
- `container`: Generic wrapper

**Each block can have:**
- `id`: Unique identifier
- `type`: Block type (see above)
- `props`: Configuration object (colors, spacing, content, etc.)
- `children`: Nested blocks array

### 2. **frontend/src/pages/CmsPage.js**
Universal page loader that:
- Reads current URL path
- Converts to slug (e.g., "/" → "home", "/packs" → "packs")
- Fetches page from CMS API
- Renders page using CmsPageRenderer
- Shows appropriate error messages if page not found or CMS not configured

### 3. **frontend/src/utils/cms/cmsApi.js**
API utility functions for CMS communication:
- `fetchPageBySlug(slug)`: Fetch page content
- `fetchAllPages()`: List all published pages
- `pathToSlug(path)`: Convert URL path to CMS slug
- `isCmsConfigured()`: Check if CMS is set up
- `getCmsErrorMessage(code)`: User-friendly error messages

### 4. **frontend/src/hooks/usePricing.js**
Reusable hook for fetching zone-based pricing.  
Preserves pricing calculation logic for CMS-rendered components.

### 5. **frontend/src/utils/businessLogic.js**
Technical business logic utilities:
- Pack definitions and defaults
- Payment plan types
- Stripe checkout session creation
- Form validation
- Contact form and appointment booking
- Price formatting for different languages

---

## 🔧 Modified Files

### **frontend/src/App.js**
Changed routing from individual page components to universal CMS routing:

```javascript
// OLD:
<Route path="/" element={<Home />} />
<Route path="/packs" element={<Packs />} />
<Route path="/about" element={<About />} />
// ... etc

// NEW:
<Route path="*" element={<CmsPage />} />
```

Only `/admin`, `/editor`, and `/simple-admin` routes remain separate.

### **frontend/.env**
Added CMS API configuration:

```env
REACT_APP_CMS_API_URL=https://igv-cms-backend.onrender.com/api
```

### **frontend/.env.example**
Updated with CMS configuration instructions.

---

## 🚀 Deployment Instructions

### Render Environment Variables

**CRITICAL:** You must add this environment variable to your Render frontend service:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select your frontend service (igv-website-complete)
3. Navigate to **Environment** tab
4. Add environment variable:
   - **Key:** `REACT_APP_CMS_API_URL`
   - **Value:** `https://igv-cms-backend.onrender.com/api`
5. Click **Save**
6. Render will automatically redeploy

**Without this variable, the website will show "CMS Not Configured" error.**

---

## 🎨 How to Use the CMS

### To Edit Existing Pages

1. Go to CMS admin interface (separate application)
2. Select the page you want to edit (e.g., "home", "packs")
3. Modify blocks:
   - Change text content
   - Add/remove images
   - Adjust colors, spacing, alignment
   - Reorder blocks via drag-and-drop
4. Click **Publish**
5. Changes are **immediately live** on the website (no deployment needed)

### To Create New Pages

1. Go to CMS admin interface
2. Click **Create New Page**
3. Enter slug (e.g., "services", "team", "careers")
4. Add blocks:
   - Heading, text, images, buttons
   - Hero sections, pricing cards
   - Custom layouts with columns
5. Set status to **Published**
6. Page is now accessible at `https://israelgrowthventure.com/{slug}`

**No code changes or deployments required!**

---

## 🧩 CMS API Format

### Endpoint
```
GET ${REACT_APP_CMS_API_URL}/pages/{slug}
```

### Response Structure
```json
{
  "slug": "home",
  "title": "Homepage",
  "status": "published",
  "blocks": [
    {
      "id": "block-uuid-1",
      "type": "hero",
      "props": {
        "title": "Israel Growth Venture",
        "subtitle": "Votre partenaire pour se développer en Israël",
        "image": "https://example.com/hero.jpg",
        "background": "gray-50"
      },
      "children": [
        {
          "id": "block-uuid-2",
          "type": "button",
          "props": {
            "content": "Prendre rendez-vous",
            "to": "/appointment",
            "variant": "primary",
            "icon": "arrow"
          },
          "children": []
        }
      ]
    }
  ],
  "metadata": {
    "seo_title": "IGV - Développez votre marque en Israël",
    "seo_description": "..."
  }
}
```

---

## 🔌 Technical Logic Preservation

### What Stays in Code

Even though pages are CMS-controlled, **technical business logic** remains in code:

#### Preserved Logic:
- ✅ Pricing calculations (zone-based, multi-currency)
- ✅ IP geo-detection
- ✅ Stripe payment processing (1x, 3x, 12x plans)
- ✅ Form validation
- ✅ Contact form and appointment booking
- ✅ API calls to backend

#### Delegated to CMS:
- ❌ Visual layout (sections, columns, spacing)
- ❌ Content (text, images, headings)
- ❌ Styling (colors, backgrounds, alignment)
- ❌ Button placement and labels

### How to Use Technical Logic in CMS

Import and use the preserved utilities:

```javascript
import { usePricing } from '../hooks/usePricing';
import { createCheckoutSession, PLAN_TYPES } from '../utils/businessLogic';

// In a CMS-rendered component:
const { pricing, isLoading } = usePricing('analyse');

// Display pricing from CMS block:
<div>Price: {pricing?.display.total}</div>

// Trigger checkout:
await createCheckoutSession({
  packId: 'analyse',
  planType: PLAN_TYPES.ONE_SHOT,
  zone: 'IL',
  // ... customer info
});
```

---

## 🛠️ Extending Block Types

To add new block types to CmsPageRenderer:

1. Open `frontend/src/components/cms/CmsPageRenderer.jsx`
2. Add a new case in the `renderBlock()` switch statement:

```javascript
case 'your-new-block-type':
  return (
    <div
      key={id}
      className={buildClassName()}
      style={buildStyle()}
    >
      {props.yourContent}
      {children.map(renderBlock)}
    </div>
  );
```

3. Document the new block type in the CMS admin interface
4. Rebuild and redeploy

---

## 🐛 Troubleshooting

### "CMS Not Configured" Error

**Cause:** `REACT_APP_CMS_API_URL` environment variable is missing.

**Solution:**
1. Add the variable in Render Dashboard → Environment
2. Set value to: `https://igv-cms-backend.onrender.com/api`
3. Redeploy

### "Page Not Found" Error

**Cause:** The requested slug doesn't exist in the CMS or is not published.

**Solution:**
1. Go to CMS admin
2. Create page with the desired slug
3. Set status to "Published"
4. Page is immediately available

### "Unable to Connect to CMS" Error

**Cause:** Network issue or CMS backend is down.

**Solution:**
1. Check if CMS backend is running
2. Verify `REACT_APP_CMS_API_URL` is correct
3. Check network connectivity

---

## 📊 Testing the Integration

### Local Testing

1. Set CMS API URL to local CMS:
   ```env
   REACT_APP_CMS_API_URL=http://localhost:5000/api
   ```

2. Start frontend:
   ```bash
   cd frontend
   npm start
   ```

3. Visit `http://localhost:3000` (should fetch "home" page from CMS)

### Production Testing

1. Deploy with proper environment variable
2. Visit `https://israelgrowthventure.com`
3. Test all routes:
   - `/` (home)
   - `/packs`
   - `/about`
   - `/contact`
4. Verify content comes from CMS
5. Edit page in CMS admin and verify changes appear immediately

---

## 📝 Summary

### What You Can Do in CMS (No Code Needed)
- ✅ Change all page content and layouts
- ✅ Add/remove/reorder blocks
- ✅ Create new pages
- ✅ Modify colors, spacing, alignment
- ✅ Update images and text
- ✅ Publish/unpublish pages

### What Requires Code Changes
- ❌ Adding new block types to renderer
- ❌ Modifying business logic (pricing, checkout)
- ❌ Changing API endpoints
- ❌ Adding new technical features

---

## 🎉 Benefits

1. **Zero-deployment content updates** - Edit in CMS, changes are instant
2. **Designer independence** - No developer needed for layout changes
3. **Faster iterations** - Test designs without code deployments
4. **Centralized control** - All content in one place
5. **Version history** - CMS tracks all changes
6. **Multi-language ready** - Can serve different content per language

---

## 📞 Support

For questions about:
- **CMS usage**: Refer to CMS admin documentation
- **Code integration**: Contact development team
- **Deployment**: Check Render dashboard logs
- **API issues**: Check backend logs at `https://igv-backend.onrender.com`

---

**Last Updated:** November 27, 2025  
**Version:** 1.0.0
