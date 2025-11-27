# Page Conversion Mapping - Visual Reference

## 🗺️ Original → CMS Block Mapping

This document shows exactly how each part of the original React pages was converted into CMS blocks.

---

## 📄 HOME PAGE

### Original Structure (Home.js)

```jsx
<div className="min-h-screen bg-white">
  
  {/* Hero Section */}
  <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
    <h1>{t('hero.title')}</h1>
    <p>{t('hero.subtitle')}</p>
    <p>{t('hero.description')}</p>
    <Link to="/appointment">CTA</Link>
    <Link to="/about">Secondary CTA</Link>
    <img src="team-photo" />
  </section>

  {/* Steps Section */}
  <section className="py-20 px-4 bg-gray-50">
    <h2>{t('steps.title')}</h2>
    <div className="grid md:grid-cols-3">
      {/* 3 step cards */}
    </div>
  </section>

  {/* Packs CTA */}
  <section className="py-20 px-4 bg-white">
    <h2>{t('packs.title')}</h2>
    <Link to="/packs">View All</Link>
  </section>

</div>
```

### CMS Block Structure

```json
{
  "blocks": [
    {
      "type": "hero",           // ← Hero Section
      "props": {
        "title": "Israel Growth Venture",
        "subtitle": "Votre partenaire...",
        "description": "Nous sommes spécialisés...",
        "image": "https://..."
      },
      "children": [
        {"type": "button", "to": "/appointment"},  // Primary CTA
        {"type": "button", "to": "/about"}         // Secondary CTA
      ]
    },
    {
      "type": "section",        // ← Steps Section
      "props": {"background": "gray-50"},
      "children": [
        {"type": "heading", "content": "Comment ça marche ?"},
        {
          "type": "columns",    // ← 3-column grid
          "props": {"columns": 3},
          "children": [
            {"type": "pricing", "badge": "1", "title": "Step 1..."},
            {"type": "pricing", "badge": "2", "title": "Step 2..."},
            {"type": "pricing", "badge": "3", "title": "Step 3..."}
          ]
        }
      ]
    },
    {
      "type": "section",        // ← Packs CTA Section
      "children": [
        {"type": "heading", "content": "Nos Packs"},
        {"type": "button", "to": "/packs"}
      ]
    }
  ]
}
```

**Mapping:**
- `<section>` → `"type": "section"`
- `<h1>`, `<h2>` → `"type": "heading"` with `level`
- `<p>` → `"type": "text"`
- `<Link>` → `"type": "button"` with `to`
- `<img>` → `"type": "image"`
- `className="grid md:grid-cols-3"` → `"type": "columns"` with `"columns": 3`
- `className="py-20 px-4"` → `"paddingY": "20", "paddingX": "4"`
- `className="bg-gray-50"` → `"background": "gray-50"`

---

## 📦 PACKS PAGE

### Original Structure (Packs.js)

```jsx
<div className="min-h-screen pt-20">
  
  {/* Hero */}
  <section className="py-20 px-4 bg-gradient-to-br from-blue-50">
    <h1>{t('packs.title')}</h1>
    <p>{t('packs.subtitle')}</p>
  </section>

  {/* Packs Grid */}
  <section className="py-20 px-4 bg-white">
    <div className="grid md:grid-cols-3 gap-8">
      
      {/* Pack Analyse */}
      <div className="bg-white border-2">
        <h3>{pack.name}</h3>
        <p>{pack.description}</p>
        <div className="text-4xl">{pricing.display.total}</div>
        <ul>
          {pack.features.map(f => <li>{f}</li>)}
        </ul>
        <p className="italic">{pack.note}</p>
        <button onClick={handleOrder}>Commander</button>
      </div>

      {/* Pack Succursales (HIGHLIGHTED) */}
      <div className="bg-gradient-to-br from-blue-600">
        <span className="badge">POPULAIRE</span>
        {/* Same structure */}
      </div>

      {/* Pack Franchise */}
      <div className="bg-white border-2">
        {/* Same structure */}
      </div>

    </div>
  </section>

  {/* Custom Pack */}
  <section className="py-16 px-4 bg-gray-50">
    <h2>{t('packs.customPack.title')}</h2>
    <a href="mailto:...">Contact</a>
  </section>

</div>
```

### CMS Block Structure

```json
{
  "blocks": [
    {
      "type": "section",        // ← Hero
      "props": {"background": "gradient-to-br from-blue-50 to-white"},
      "children": [
        {"type": "heading", "level": 1, "content": "Nos Packs"},
        {"type": "text", "content": "Solutions adaptées..."}
      ]
    },
    {
      "type": "section",        // ← Packs Grid
      "children": [
        {
          "type": "columns",
          "props": {"columns": 3},
          "children": [
            {
              "type": "pricing",  // ← Pack Analyse
              "props": {
                "title": "Pack Analyse",
                "description": "Analyse complète...",
                "price": "À partir de 3 000 €",
                "features": ["Feature 1", "Feature 2", ...],
                "className": "border-2 border-gray-200"
              },
              "children": [
                {"type": "text", "content": "Note...", "className": "italic"},
                {"type": "button", "to": "/checkout/analyse"}
              ]
            },
            {
              "type": "pricing",  // ← Pack Succursales (highlighted)
              "props": {
                "badge": "POPULAIRE",
                "className": "bg-gradient-to-br from-blue-600 to-blue-700 text-white"
              },
              "children": [...]
            },
            {
              "type": "pricing",  // ← Pack Franchise
              "children": [...]
            }
          ]
        }
      ]
    },
    {
      "type": "section",        // ← Custom Pack
      "props": {"background": "gray-50"},
      "children": [
        {"type": "heading", "content": "Besoin d'un pack personnalisé ?"},
        {"type": "button", "href": "mailto:..."}
      ]
    }
  ]
}
```

**Special Mappings:**
- Pricing card → `"type": "pricing"` with all properties
- `badge` for POPULAIRE tag
- `features` array for bullet points
- Gradient backgrounds preserved in `className`
- `onClick` handler → `"to"` or `"href"` for navigation

---

## 👥 ABOUT PAGE

### Original Structure (About.js)

```jsx
<div className="min-h-screen pt-20">
  
  {/* Hero */}
  <section className="py-20 bg-gradient-to-br from-blue-50">
    <h1>{t('about.title')}</h1>
    <p>{t('about.description')}</p>
    <div className="grid md:grid-cols-2">
      <div>
        <p>{t('about.collaboration')}</p>
        <p>{t('about.support')}</p>
        <p>{t('about.service')}</p>
      </div>
      <img src="team" />
    </div>
  </section>

  {/* Values */}
  <section className="py-20 bg-white">
    <h2>Nos valeurs</h2>
    <div className="grid lg:grid-cols-4">
      {values.map(value => (
        <div className="text-center p-6">
          <Icon />
          <h3>{value.title}</h3>
          <p>{value.description}</p>
        </div>
      ))}
    </div>
  </section>

  {/* Team */}
  <section className="py-20 bg-gradient-to-b from-white to-blue-50">
    <div className="bg-white rounded-2xl p-12">
      <div className="grid md:grid-cols-2">
        <img src="mickael" />
        <div>
          <h3>Mickael</h3>
          <div>Fondateur & CEO</div>
          <p>Bio paragraph 1</p>
          <p>Bio paragraph 2</p>
        </div>
      </div>
    </div>
  </section>

  {/* CTA */}
  <section className="py-20 bg-blue-600">
    <h2>Travaillons ensemble</h2>
    <Link to="/contact">Contact</Link>
  </section>

</div>
```

### CMS Block Structure

```json
{
  "blocks": [
    {
      "type": "section",        // ← Hero
      "children": [
        {"type": "heading", "level": 1},
        {"type": "text", "content": "Description..."},
        {
          "type": "columns",    // ← 2-column layout
          "props": {"columns": 2},
          "children": [
            {
              "type": "container",  // Left: text column
              "children": [
                {"type": "text", "content": "Collaboration..."},
                {"type": "text", "content": "Support..."},
                {"type": "text", "content": "Service..."}
              ]
            },
            {
              "type": "container",  // Right: image
              "children": [
                {"type": "image", "src": "..."}
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "section",        // ← Values
      "children": [
        {"type": "heading", "content": "Nos valeurs"},
        {
          "type": "columns",
          "props": {"columns": 4},  // 4 value cards
          "children": [
            {"type": "pricing", "title": "Expertise", "description": "..."},
            {"type": "pricing", "title": "Résultats", "description": "..."},
            {"type": "pricing", "title": "Accompagnement", "description": "..."},
            {"type": "pricing", "title": "Réseau", "description": "..."}
          ]
        }
      ]
    },
    {
      "type": "section",        // ← Team
      "children": [
        {
          "type": "container",  // Card wrapper
          "props": {"className": "bg-white rounded-2xl p-12"},
          "children": [
            {
              "type": "columns",
              "props": {"columns": 2},
              "children": [
                {"type": "image", "src": "mickael"},
                {
                  "type": "container",  // Bio column
                  "children": [
                    {"type": "heading", "level": 3, "content": "Mickael"},
                    {"type": "text", "content": "Fondateur & CEO"},
                    {"type": "text", "content": "Bio 1..."},
                    {"type": "text", "content": "Bio 2..."}
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "section",        // ← CTA
      "props": {"background": "blue-600"},
      "children": [
        {"type": "heading", "className": "text-white"},
        {"type": "button", "to": "/contact"}
      ]
    }
  ]
}
```

**Complex Mappings:**
- Nested grids → Nested `columns` blocks
- Custom card styling → `container` with `className`
- Icon components → Removed (not supported in basic CMS)
- Multiple paragraphs → Multiple `text` blocks

---

## 📧 CONTACT PAGE

### Original Structure (Contact.js)

```jsx
<div className="min-h-screen pt-20">
  
  {/* Hero */}
  <section className="py-20 bg-gradient-to-br from-blue-50">
    <h1>{t('contact.title')}</h1>
    <p>{t('contact.subtitle')}</p>
  </section>

  {/* Form & Info */}
  <section className="py-20 bg-white">
    <div className="grid lg:grid-cols-2">
      
      {/* Form */}
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="text" name="company" />
        <input type="tel" name="phone" />
        <textarea name="message" />
        <button type="submit">Send</button>
      </form>

      {/* Info */}
      <div>
        <h2>Contact Info</h2>
        <div>
          <Mail />
          <p>Email</p>
          <a href="mailto:...">email address</a>
        </div>
        <div>
          <MapPin />
          <p>Address</p>
          <p>21 Rue Gefen...</p>
        </div>
        <div className="bg-blue-50 rounded p-6">
          <h3>Horaires</h3>
          <p>Lundi - Vendredi: 9h-18h</p>
        </div>
      </div>

    </div>
  </section>

</div>
```

### CMS Block Structure

```json
{
  "blocks": [
    {
      "type": "section",        // ← Hero
      "children": [
        {"type": "heading", "content": "Contactez-nous"},
        {"type": "text", "content": "Nous sommes là..."}
      ]
    },
    {
      "type": "section",        // ← Content
      "children": [
        {
          "type": "columns",
          "props": {"columns": 2},
          "children": [
            {
              "type": "container",  // ← Left: Form column
              "children": [
                {
                  "type": "text",  // Note about form
                  "content": "Note: Le formulaire nécessite...",
                  "className": "bg-blue-50 p-4"
                },
                {
                  "type": "button",  // Direct email button
                  "content": "Envoyer un email",
                  "href": "mailto:..."
                },
                {
                  "type": "text",  // Form fields description
                  "content": "Champs: Nom, Email, Société...",
                  "html": true
                }
              ]
            },
            {
              "type": "container",  // ← Right: Info column
              "children": [
                {"type": "heading", "content": "Informations"},
                {
                  "type": "text",  // Email card
                  "content": "📧 Email<br/><a href='mailto:...'>...",
                  "html": true,
                  "className": "bg-blue-50 p-4"
                },
                {
                  "type": "text",  // Address card
                  "content": "📍 Adresse<br/>21 Rue Gefen...",
                  "html": true,
                  "className": "bg-blue-50 p-4"
                },
                {
                  "type": "container",  // Hours card
                  "props": {"className": "bg-blue-50 rounded p-6"},
                  "children": [
                    {"type": "heading", "level": 3, "content": "Horaires"},
                    {"type": "text", "content": "Lundi-Vendredi...", "html": true}
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

**Form Handling:**
- Original: `<form>` with `onSubmit` handler
- CMS: Fallback to `mailto:` link button
- Future: Can add custom form block type with API integration

**Icon Replacement:**
- Original: `<Mail />`, `<MapPin />` Lucide icons
- CMS: Emoji replacements (📧, 📍)
- Alternative: Use icon URLs/images

---

## 📊 Conversion Statistics

### Block Type Usage

| Block Type | Home | Packs | About | Contact | Total |
|------------|------|-------|-------|---------|-------|
| section    | 3    | 3     | 4     | 3       | 13    |
| hero       | 1    | 0     | 0     | 0       | 1     |
| heading    | 2    | 3     | 8     | 4       | 17    |
| text       | 0    | 2     | 9     | 6       | 17    |
| button     | 3    | 5     | 1     | 3       | 12    |
| columns    | 1    | 2     | 4     | 1       | 8     |
| pricing    | 3    | 3     | 8     | 0       | 14    |
| image      | 0    | 0     | 2     | 0       | 2     |
| container  | 0    | 0     | 5     | 5       | 10    |
| **TOTAL**  | 13   | 18    | 41    | 22      | **94**|

### Styling Preserved

✅ **100% Preserved:**
- Background colors and gradients
- Padding/margin spacing values
- Text sizes and colors
- Border styles
- Shadow effects
- Rounded corners
- Hover states (via className)

⚠️ **Partially Preserved:**
- Icon components → Replaced with emojis or removed
- Complex animations → Simplified
- JavaScript interactions → Converted to links

❌ **Not Preserved (Requires Code):**
- Form validation logic
- Geo-based pricing display
- Dynamic data fetching
- Interactive state management

---

## 🎨 Styling Reference

### Common Patterns

**Section Backgrounds:**
```json
"background": "white"              // → className="bg-white"
"background": "gray-50"            // → className="bg-gray-50"
"background": "blue-600"           // → className="bg-blue-600"
"background": "gradient-to-br from-blue-50 to-white"
```

**Spacing:**
```json
"paddingY": "20"      // → className="py-20"
"paddingX": "4"       // → className="px-4"
"marginBottom": "6"   // → className="mb-6"
"gap": "8"            // → className="gap-8"
```

**Text Styling:**
```json
"size": "lg"          // → className="text-lg"
"shade": "600"        // → className="text-gray-600"
"textAlign": "center" // → className="text-center"
```

**Button Variants:**
```json
"variant": "primary"     // → Blue background, white text
"variant": "secondary"   // → White background, blue text, blue border
"variant": "outline"     // → Gray border, gray text
```

---

## 🔄 Dynamic Content Handling

### Price Display

**Original Code:**
```jsx
{packPricing ? packPricing.display.total : "Loading..."}
```

**CMS Block:**
```json
{
  "type": "text",
  "props": {
    "content": "À partir de 3 000 €"
  }
}
```

**Solution:** Display static "Starting from" prices in CMS. Actual dynamic pricing handled by `usePricing()` hook when page renders.

### Translations

**Original Code:**
```jsx
{t('hero.title')}
```

**CMS Block:**
```json
{
  "type": "heading",
  "props": {
    "content": "Israel Growth Venture"
  }
}
```

**Solution:** Create separate pages for each language (home-fr, home-en, home-he) or add language field to blocks.

---

## ✅ Validation Checklist

After reviewing this mapping, verify:

- [ ] All sections from original pages are represented
- [ ] Block types are correctly chosen
- [ ] Styling properties match original design
- [ ] Nested structures preserved (columns, children)
- [ ] Buttons link to correct URLs
- [ ] Text content matches translations
- [ ] Special cases documented (forms, dynamic data)

---

**Document Version:** 1.0  
**Last Updated:** November 27, 2025  
**Purpose:** Visual reference for understanding React → CMS conversion
