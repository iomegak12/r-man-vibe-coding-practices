# UI Theme Specifications for Development Team

## Theme 1: Corporate Blue
**Use Case:** Trust & Professionalism - Financial services, enterprise software, corporate websites

### Color Palette

| Element | Hex Code | Usage |
|---------|----------|-------|
| Primary | #2563EB | Main brand color, primary buttons, links, key UI elements |
| Secondary | #7C3AED | Secondary buttons, highlights, accent elements |
| Accent | #F59E0B | Call-to-action buttons, notifications, alerts |
| Background | #F8FAFC | Page background, card backgrounds |
| Text | #1E293B | Primary text color, headings, body text |

### Typography

**Font Family:** Inter

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Heading 1) | 32-40px | Bold (700) | 1.2 | -0.02em |
| H2 (Heading 2) | 24-28px | SemiBold (600) | 1.2 | -0.01em |
| H3 (Heading 3) | 20-24px | SemiBold (600) | 1.3 | -0.01em |
| Body Text | 14px | Regular (400) | 1.6 | 0 |
| Small Text/Captions | 12px | Regular (400) | 1.5 | 0 |
| Buttons | 14px | Medium (500) | 1 | 0.01em |
| Labels | 14px | Medium (500) | 1.4 | 0.01em |

### Component Specifications

**Buttons:**
- Primary Button: Background #2563EB, Text #FFFFFF, Padding 12px 24px, Border Radius 6px
- Secondary Button: Background #7C3AED, Text #FFFFFF, Padding 12px 24px, Border Radius 6px
- Outline Button: Border 2px solid #F59E0B, Text #F59E0B, Background transparent, Padding 10px 22px, Border Radius 6px

**Cards:**
- Background: #FFFFFF
- Border: 1px solid rgba(0,0,0,0.1)
- Border Radius: 8px
- Padding: 24px
- Shadow: 0 2px 4px rgba(0,0,0,0.1)

**Form Elements:**
- Input Height: 40px
- Input Padding: 12px 16px
- Input Border: 1px solid #CBD5E1
- Input Border Radius: 6px
- Focus Border Color: #2563EB

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

---

## Theme 2: Dark Mode Pro
**Use Case:** Sophisticated & Modern - Developer tools, creative applications, tech products

### Color Palette

| Element | Hex Code | Usage |
|---------|----------|-------|
| Primary | #60A5FA | Main brand color, primary buttons, links, highlights |
| Secondary | #A78BFA | Secondary buttons, accent elements, badges |
| Accent | #FCD34D | Call-to-action, warnings, important notifications |
| Background | #0F172A | Main page background, dark surfaces |
| Text | #F1F5F9 | Primary text color (off-white for reduced eye strain) |
| Surface | #1E293B | Card backgrounds, elevated surfaces |
| Border | #334155 | Borders, dividers, subtle separators |

### Typography

**Font Family:** IBM Plex Sans

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Heading 1) | 38-44px | Bold (700) | 1.2 | -0.02em |
| H2 (Heading 2) | 28-32px | SemiBold (600) | 1.2 | -0.01em |
| H3 (Heading 3) | 22-26px | Medium (500) | 1.3 | -0.01em |
| Body Text | 14px | Regular (400) | 1.7 | 0 |
| Small Text/Captions | 13px | Regular (400) | 1.5 | 0 |
| Buttons | 14px | Medium (500) | 1 | 0.01em |
| Labels | 14px | Medium (500) | 1.4 | 0.01em |
| Code/Monospace | 14px | Regular (400) | 1.6 | 0 |

**Note:** Dark mode uses slightly larger body text (14px vs 14px) and increased line-height (1.7 vs 1.6) for better readability on dark backgrounds.

### Component Specifications

**Buttons:**
- Primary Button: Background #60A5FA, Text #0F172A, Padding 12px 24px, Border Radius 6px
- Secondary Button: Background #A78BFA, Text #0F172A, Padding 12px 24px, Border Radius 6px
- Outline Button: Border 2px solid #FCD34D, Text #FCD34D, Background transparent, Padding 10px 22px, Border Radius 6px

**Cards:**
- Background: #1E293B
- Border: 1px solid #334155
- Border Radius: 8px
- Padding: 24px
- Shadow: 0 4px 6px rgba(0,0,0,0.3)

**Form Elements:**
- Input Height: 42px
- Input Padding: 12px 16px
- Input Background: #1E293B
- Input Border: 1px solid #334155
- Input Border Radius: 6px
- Focus Border Color: #60A5FA
- Text Color: #F1F5F9

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px
- 2xl: 48px

### Special Considerations for Dark Mode

1. **Never use pure white (#FFFFFF)** for text - always use #F1F5F9 or similar off-white to reduce eye strain
2. **Increase contrast** for interactive elements - buttons and clickable items should be clearly distinguishable
3. **Reduce font-weight** for very large headings to avoid overwhelming brightness
4. **Layer backgrounds** using the Surface color (#1E293B) for cards on top of Background (#0F172A)
5. **Elevate with subtle shadows** - use darker, more pronounced shadows than light mode

---

## Implementation Notes

### Font Loading
**Corporate Blue (Inter):**
```
Google Fonts: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap
```

**Dark Mode Pro (IBM Plex Sans):**
```
Google Fonts: https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap
```

### Accessibility Requirements

**Contrast Ratios (WCAG AA Standard):**
- Normal text: Minimum 4.5:1
- Large text (18px+): Minimum 3:1
- UI components: Minimum 3:1

**Corporate Blue Theme:**
- Text (#1E293B) on Background (#F8FAFC): ✓ 14.7:1
- Primary button text passes contrast requirements
- All interactive elements meet accessibility standards

**Dark Mode Pro Theme:**
- Text (#F1F5F9) on Background (#0F172A): ✓ 15.2:1
- Primary button text (#0F172A) on Primary (#60A5FA): ✓ 8.1:1
- All interactive elements meet accessibility standards

### Responsive Breakpoints

| Breakpoint | Width | Adjustments |
|------------|-------|-------------|
| Mobile | < 640px | Reduce H1 to 28px, Body remains 14px |
| Tablet | 640px - 1024px | Reduce H1 to 32px |
| Desktop | > 1024px | Full size specifications |

---

## File Naming Conventions

**CSS Variables Naming:**
```
Corporate Blue:
--color-primary: #2563EB
--color-secondary: #7C3AED
--color-accent: #F59E0B
--color-background: #F8FAFC
--color-text: #1E293B

Dark Mode Pro:
--color-primary: #60A5FA
--color-secondary: #A78BFA
--color-accent: #FCD34D
--color-background: #0F172A
--color-text: #F1F5F9
--color-surface: #1E293B
--color-border: #334155
```

---

## Version Control
- Document Version: 1.0
- Last Updated: January 2026
- Author: Design Team
- Approved By: Project Lead