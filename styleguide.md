# Pigeon Design Style Guide

This style guide documents the visual identity, typography, color system, and UI component standards for project Pigeon. It is inspired by the **Facebook Web Design System**—focusing on clarity, content-first hierarchy, card-based layouts, and clean interactive states for both light and dark modes.

---

## 1. Color Palette

Pigeon uses a color token system based on CSS custom properties. Colors dynamically adapt based on the active theme class (`.light` or `.dark`) on the `<html>` or `<body>` element.

### Core Brand Colors (Shared)
| Token | Value | Description |
| :--- | :--- | :--- |
| `--brand-primary` | `#1877F2` | Facebook Blue / Accent actions |
| `--brand-success` | `#42B72A` | Confirmations / Online indicator |
| `--brand-danger`  | `#F02849` | Notifications / Alerts |
| `--brand-warning` | `#F5C33B` | Attention / Warning status |

### Light Mode Theme Tokens (`html.light` or prefers light)
| Token | Value | CSS Usage / Semantic Meaning |
| :--- | :--- | :--- |
| `--bg-primary` | `#F0F2F5` | Main application background (cool gray) |
| `--bg-secondary` | `#FFFFFF` | Card, container, and dialog backgrounds |
| `--text-primary` | `#050505` | Titles, body text, and dark headers |
| `--text-secondary` | `#65676B` | Meta labels, timestamps, and secondary info |
| `--border-divider` | `#CED0D4` | Borders, separators, and outline strokes |
| `--hover-overlay` | `rgba(0, 0, 0, 0.05)` | Subtle backdrop highlight on hover |
| `--scrollbar-thumb` | `#BCC0C4` | Scrollbar thumb color |
| `--input-bg` | `#F0F2F5` | Form input backgrounds |

### Dark Mode Theme Tokens (`html.dark` or prefers dark)
| Token | Value | CSS Usage / Semantic Meaning | 
| :--- | :--- | :--- |
| `--bg-primary` | `#18191A` | Main application background (dark gray) |
| `--bg-secondary` | `#242526` | Card, container, and dialog backgrounds |
| `--text-primary` | `#E4E6EB` | Titles, body text, and light headers |
| `--text-secondary` | `#B0B3B8` | Meta labels, timestamps, and secondary info |
| `--border-divider` | `#3E4042` | Borders, separators, and outline strokes |
| `--hover-overlay` | `rgba(255, 255, 255, 0.1)` | Subtle backdrop highlight on hover |
| `--scrollbar-thumb` | `#4E4F50` | Scrollbar thumb color |
| `--input-bg` | `#3A3B3C` | Form input backgrounds |

---

## 2. Typography

Pigeon utilizes a system font stack for maximum rendering performance, native OS feel, and premium legibility.

### Font Family
```css
font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
```

### Type Hierarchy
- **Header 1 (`<h1>`)**: `24px` | Bold (`700`) | Line height `1.2`
- **Header 2 (`<h2>`)**: `20px` | Semi-Bold (`600`) | Line height `1.2`
- **Header 3 (`<h3>`)**: `17px` | Semi-Bold (`600`) | Line height `1.3`
- **Body Text (`p`, `span`)**: `15px` | Normal (`400`) | Line height `1.4`
- **Meta / Caption Text (`small`)**: `13px` | Normal (`400`) | Line height `1.4`

---

## 3. UI Layout & Elevation

Pigeon layouts are card-centered and highly structured.

- **Main Container**: Maximized at `1250px` width, centered, with standard `16px` padding.
- **Borders & Dividers**: `1px solid var(--border-divider)`
- **Border Radius**:
  - Cards, modals, search bars, inputs: `8px`
  - Small action items (buttons): `6px`
  - Pill badges & User Profile Avatars: `9999px` (circular)
- **Shadows**:
  - Light Mode Cards: `box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.05);`
  - Dark Mode Cards: `box-shadow: none;` (flat outline via `--border-divider`)

---

## 4. Components

### A. Buttons

```html
<!-- Primary Button -->
<button class="btn btn-primary">Publish</button>

<!-- Secondary Button -->
<button class="btn btn-secondary">Cancel</button>
```

#### Styling Specs
- **Primary**: Background `var(--brand-primary)`, Text `#FFFFFF`. Hover transitions to slightly darker blue (`#1565C0`) or opacity scales.
- **Secondary**: Background `var(--input-bg)`, Text `var(--text-primary)`. Hover scales background with `var(--hover-overlay)`.

### B. Cards

Cards serve as the building block of the Pigeon feed.

```html
<div class="card">
  <div class="card-header">
    <div class="avatar">P</div>
    <div class="card-meta">
      <h3>Pigeon Team</h3>
      <span>Just now</span>
    </div>
  </div>
  <div class="card-body">
    <p>This is a standard card post conforming to the Pigeon style guide.</p>
  </div>
</div>
```

---

## 5. Theme Toggling (Light / Dark Mode)

### Toggle Behavior
1. Check `localStorage.getItem('theme')`.
2. If set to `dark`, apply `class="dark"` to `<html>` and update browser `color-scheme` to `dark`.
3. If set to `light`, apply `class="light"` to `<html>` and update browser `color-scheme` to `light`.
4. If not set, match system preferences via `window.matchMedia('(prefers-color-scheme: dark)')` and listen for runtime updates.
5. Provide a quick toggle header button containing dynamic icons:
   - **Moon Icon** 🌙 displayed when in light mode.
   - **Sun Icon** ☀️ displayed when in dark mode.
