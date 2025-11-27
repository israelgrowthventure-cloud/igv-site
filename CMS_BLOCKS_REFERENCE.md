# CMS Block Reference Guide

## 📦 Available Block Types

This document describes all block types available in the CMS and how to configure them.

---

## 1. Section Block

Container with background, padding, and alignment options.

**Type:** `section`

**Props:**
```javascript
{
  background: "gray-50" | "white" | "blue-50" | ...,  // Tailwind color
  padding: "8" | "16" | "20",                         // Tailwind spacing
  paddingX: "4" | "8",                                // Horizontal padding
  paddingY: "20",                                     // Vertical padding
  container: true | false,                            // Wrap in max-w-7xl container
  backgroundColor: "#f3f4f6",                         // Custom hex color
  minHeight: "100vh"                                  // CSS min-height
}
```

**Example:**
```json
{
  "id": "section-1",
  "type": "section",
  "props": {
    "background": "gray-50",
    "paddingY": "20",
    "container": true
  },
  "children": [...]
}
```

---

## 2. Columns Block

Multi-column responsive layout.

**Type:** `columns`

**Props:**
```javascript
{
  columns: 2 | 3 | 4,          // Number of columns
  gap: "4" | "8" | "12",       // Gap between columns (Tailwind)
  className: "additional-classes"
}
```

**Behavior:**
- 1 column: Always 1 column
- 2 columns: 1 on mobile, 2 on md+
- 3 columns: 1 on mobile, 3 on md+
- 4 columns: 1 on mobile, 2 on md, 4 on lg+

**Example:**
```json
{
  "id": "cols-1",
  "type": "columns",
  "props": {
    "columns": 3,
    "gap": "8"
  },
  "children": [
    { "type": "text", "props": { "content": "Column 1" } },
    { "type": "text", "props": { "content": "Column 2" } },
    { "type": "text", "props": { "content": "Column 3" } }
  ]
}
```

---

## 3. Heading Block

Text heading (h1-h6).

**Type:** `heading`

**Props:**
```javascript
{
  content: "Your heading text",
  level: 1 | 2 | 3 | 4 | 5 | 6,    // HTML heading level
  textAlign: "left" | "center" | "right",
  textColor: "gray-900" | "blue-600" | ...,
  marginBottom: "4" | "6" | "8",
  className: "additional-classes"
}
```

**Sizes (automatic based on level):**
- h1: `text-5xl md:text-6xl`
- h2: `text-4xl md:text-5xl`
- h3: `text-3xl md:text-4xl`
- h4: `text-2xl md:text-3xl`
- h5: `text-xl md:text-2xl`
- h6: `text-lg md:text-xl`

**Example:**
```json
{
  "id": "heading-1",
  "type": "heading",
  "props": {
    "content": "Welcome to IGV",
    "level": 1,
    "textAlign": "center",
    "marginBottom": "8"
  }
}
```

---

## 4. Text Block

Paragraph or rich text content.

**Type:** `text`

**Props:**
```javascript
{
  content: "Your paragraph text",
  size: "sm" | "base" | "lg" | "xl",
  shade: "600" | "700" | "800",      // Gray shade
  marginBottom: "4" | "6" | "8",
  html: true | false,                // Render as HTML
  className: "additional-classes"
}
```

**Example (plain text):**
```json
{
  "id": "text-1",
  "type": "text",
  "props": {
    "content": "This is a paragraph of text.",
    "size": "lg",
    "shade": "700",
    "marginBottom": "6"
  }
}
```

**Example (HTML):**
```json
{
  "id": "text-2",
  "type": "text",
  "props": {
    "content": "<strong>Bold text</strong> and <em>italic</em>",
    "html": true
  }
}
```

---

## 5. Image Block

Image with optional caption.

**Type:** `image`

**Props:**
```javascript
{
  src: "https://example.com/image.jpg",
  alt: "Image description",
  caption: "Image caption text",
  rounded: true | false,              // Rounded corners
  shadow: true | false,               // Drop shadow
  width: "full" | "1/2" | "auto",     // Tailwind width
  marginBottom: "6"
}
```

**Example:**
```json
{
  "id": "img-1",
  "type": "image",
  "props": {
    "src": "https://images.unsplash.com/photo-xxx",
    "alt": "Team collaboration",
    "caption": "Our team working together",
    "rounded": true,
    "shadow": true
  }
}
```

---

## 6. Button Block

Call-to-action button.

**Type:** `button`

**Props:**
```javascript
{
  content: "Button text",
  variant: "primary" | "secondary" | "outline",
  to: "/internal-path",              // Internal link (React Router)
  href: "https://external.com",      // External link
  target: "_blank" | "_self",        // Link target
  icon: "arrow" | null,              // Icon to display
  onClick: function,                 // Click handler (code only)
  className: "additional-classes"
}
```

**Variants:**
- `primary`: Blue background, white text
- `secondary`: Blue border, blue text
- `outline`: Gray border, gray text

**Example (internal link):**
```json
{
  "id": "btn-1",
  "type": "button",
  "props": {
    "content": "View Packs",
    "variant": "primary",
    "to": "/packs",
    "icon": "arrow"
  }
}
```

**Example (external link):**
```json
{
  "id": "btn-2",
  "type": "button",
  "props": {
    "content": "Visit Website",
    "variant": "secondary",
    "href": "https://example.com",
    "target": "_blank"
  }
}
```

---

## 7. Hero Block

Hero section with title, subtitle, image, and CTAs.

**Type:** `hero`

**Props:**
```javascript
{
  title: "Main heading",
  subtitle: "Subheading text",
  description: "Additional description",
  image: "https://example.com/hero.jpg",
  imageAlt: "Hero image description",
  background: "white" | "gray-50",
  paddingY: "20"
}
```

**Children:** Typically button blocks for CTAs

**Example:**
```json
{
  "id": "hero-1",
  "type": "hero",
  "props": {
    "title": "Israel Growth Venture",
    "subtitle": "Votre partenaire pour se développer en Israël",
    "description": "Expertise complète pour lancer et développer votre marque en Israël",
    "image": "https://images.unsplash.com/photo-xxx"
  },
  "children": [
    {
      "type": "button",
      "props": {
        "content": "Prendre rendez-vous",
        "to": "/appointment",
        "variant": "primary"
      }
    },
    {
      "type": "button",
      "props": {
        "content": "En savoir plus",
        "to": "/about",
        "variant": "secondary"
      }
    }
  ]
}
```

---

## 8. Pricing Block

Pricing card with title, price, features, and CTA.

**Type:** `pricing`

**Props:**
```javascript
{
  title: "Pack name",
  price: "7 000 ₪",
  description: "Pack description",
  badge: "Popular" | "Best value",   // Optional badge
  features: [                         // Array of features
    "Feature 1",
    "Feature 2",
    "Feature 3"
  ]
}
```

**Children:** Typically a button for purchase

**Example:**
```json
{
  "id": "pricing-1",
  "type": "pricing",
  "props": {
    "badge": "Popular",
    "title": "Pack Analyse",
    "price": "7 000 ₪",
    "description": "Diagnostic complet du potentiel de votre marque",
    "features": [
      "Étude de marché approfondie",
      "Analyse concurrentielle",
      "Recommandations stratégiques"
    ]
  },
  "children": [
    {
      "type": "button",
      "props": {
        "content": "Commander",
        "to": "/checkout/analyse",
        "variant": "primary"
      }
    }
  ]
}
```

---

## 9. Spacer Block

Vertical spacing (empty div with height).

**Type:** `spacer`

**Props:**
```javascript
{
  height: "4" | "8" | "12" | "16" | "20"  // Tailwind height
}
```

**Example:**
```json
{
  "id": "spacer-1",
  "type": "spacer",
  "props": {
    "height": "16"
  }
}
```

---

## 10. Divider Block

Horizontal line separator.

**Type:** `divider`

**Props:**
```javascript
{
  shade: "200" | "300" | "400",    // Gray shade
  marginY: "8" | "12" | "16"       // Vertical margin
}
```

**Example:**
```json
{
  "id": "divider-1",
  "type": "divider",
  "props": {
    "shade": "300",
    "marginY": "12"
  }
}
```

---

## 11. Grid Block

Generic container with grid layout.

**Type:** `grid`

**Props:**
```javascript
{
  className: "grid gap-8 md:grid-cols-2",  // Custom Tailwind classes
  gap: "4" | "8" | "12"
}
```

**Example:**
```json
{
  "id": "grid-1",
  "type": "grid",
  "props": {
    "className": "grid gap-6 md:grid-cols-3"
  },
  "children": [...]
}
```

---

## 12. Container Block

Generic wrapper (like div).

**Type:** `container`

**Props:**
```javascript
{
  className: "max-w-4xl mx-auto",   // Custom Tailwind classes
  maxWidth: "7xl" | "6xl" | "4xl",
  paddingX: "4" | "8"
}
```

**Example:**
```json
{
  "id": "container-1",
  "type": "container",
  "props": {
    "className": "max-w-5xl mx-auto px-4"
  },
  "children": [...]
}
```

---

## 🎨 Common Props

These props are available on most blocks:

### Styling Props
```javascript
{
  className: "custom-tailwind-classes",
  background: "gray-50",              // Tailwind background
  backgroundColor: "#f3f4f6",         // Custom hex color
  textColor: "gray-900",              // Tailwind text color
  color: "#1f2937",                   // Custom text color
  textAlign: "left" | "center" | "right"
}
```

### Spacing Props
```javascript
{
  padding: "8",                       // All sides
  paddingX: "4",                      // Horizontal
  paddingY: "20",                     // Vertical
  margin: "8",                        // All sides
  marginX: "auto",                    // Horizontal
  marginY: "12",                      // Vertical
  marginBottom: "6"                   // Bottom only
}
```

### Size Props
```javascript
{
  minHeight: "100vh",                 // CSS min-height
  maxWidth: "1200px",                 // CSS max-width
  width: "full" | "auto"              // Tailwind width
}
```

---

## 🔧 Advanced: Custom Blocks

To create custom block types, edit:
`frontend/src/components/cms/CmsPageRenderer.jsx`

Add a new case in the switch statement:

```javascript
case 'your-custom-block':
  return (
    <div
      key={id}
      className={buildClassName()}
      style={buildStyle()}
    >
      {/* Your custom JSX */}
      {props.customProp}
      {children.map(renderBlock)}
    </div>
  );
```

---

## 📋 Example: Complete Page Structure

```json
{
  "slug": "home",
  "title": "Homepage",
  "status": "published",
  "blocks": [
    {
      "id": "hero-section",
      "type": "hero",
      "props": {
        "title": "Israel Growth Venture",
        "subtitle": "Développez votre marque en Israël",
        "image": "https://images.unsplash.com/photo-xxx"
      },
      "children": [
        {
          "id": "hero-cta",
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
    },
    {
      "id": "spacer-1",
      "type": "spacer",
      "props": { "height": "20" },
      "children": []
    },
    {
      "id": "features-section",
      "type": "section",
      "props": {
        "background": "gray-50",
        "paddingY": "20"
      },
      "children": [
        {
          "id": "features-title",
          "type": "heading",
          "props": {
            "content": "Nos Services",
            "level": 2,
            "textAlign": "center",
            "marginBottom": "12"
          },
          "children": []
        },
        {
          "id": "features-grid",
          "type": "columns",
          "props": {
            "columns": 3,
            "gap": "8"
          },
          "children": [
            {
              "id": "feature-1",
              "type": "pricing",
              "props": {
                "title": "Pack Analyse",
                "price": "7 000 ₪",
                "features": ["Feature 1", "Feature 2"]
              },
              "children": []
            },
            {
              "id": "feature-2",
              "type": "pricing",
              "props": {
                "title": "Pack Succursales",
                "price": "55 000 ₪",
                "features": ["Feature 1", "Feature 2"]
              },
              "children": []
            },
            {
              "id": "feature-3",
              "type": "pricing",
              "props": {
                "title": "Pack Franchise",
                "price": "55 000 ₪",
                "features": ["Feature 1", "Feature 2"]
              },
              "children": []
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 🎯 Best Practices

1. **Use semantic block types** - Choose the most specific block type (e.g., `hero` instead of generic `section`)

2. **Nest blocks logically** - Place buttons inside hero blocks, text inside sections, etc.

3. **Leverage Tailwind classes** - Use standard Tailwind spacing/color values for consistency

4. **Test responsive behavior** - Preview on mobile, tablet, and desktop

5. **Keep it simple** - Don't over-nest blocks unnecessarily

6. **Use IDs wisely** - Give blocks meaningful IDs for debugging

---

**Last Updated:** November 27, 2025
