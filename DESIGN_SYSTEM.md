# KarasuEmlak v4 Design System

## Core Design Philosophy

**Keywords**: Güven, Sadelik, Yerel Uzmanlık, Netlik, Yormayan Profesyonellik

**Avoid**: Gambling/casino vibes, neon/abartı/hype, aşırı animasyon, karmaşık dashboard hissi

**The UI should feel**: "Devlet sitesi kadar net, özel sektör kadar modern."

---

## Brand Identity

### Tone
- Serious
- Calm
- Confident
- Local expert

### Typography
- **Primary**: Inter (body, UI)
- **Secondary** (optional): Plus Jakarta Sans (headings)
- **Rules**: Max 2 font families, no decorative fonts, generous line-height (readability > style)

### Color System

#### Primary: Trust Blue / Deep Teal
- **Base**: `#0B5D7A` (Deep Teal - Güven ve profesyonellik)
- **Dark**: `#084A5F` (Darker for hover states)
- **Light**: `#0E6F8A` (Lighter for backgrounds)
- **Subtle**: `#E6F2F5` (Very light for backgrounds)

#### Secondary: Soft Gray Scale
- **50**: `#FAFAFA` (Backgrounds)
- **100**: `#F5F5F5` (Subtle backgrounds)
- **200**: `#E5E5E5` (Borders)
- **300**: `#D4D4D4` (Disabled states)
- **400**: `#A3A3A3` (Placeholder text)
- **500**: `#737373` (Muted text)
- **600**: `#525252` (Body text)
- **700**: `#404040` (Headings)
- **800**: `#262626` (Dark mode text)
- **900**: `#171717` (Dark mode headings)

#### Accent: Very Limited (CTA only)
- **Base**: `#0B5D7A` (Same as primary - trust consistency)
- **Hover**: `#084A5F` (Darker for interaction feedback)

**Rules**: 
- No more than 1 accent color at a time
- Buttons must look clickable
- Links must look like links (no hidden affordances)

---

## Layout Principles

### Global
- **Max content width**: 1200px (desktop), 1280px (large screens)
- **Plenty of white space**: Minimum 24px between sections
- **Predictable spacing**: 4/8/16/24/32/48/64px system

### Header
- Simple, clean
- Logo left
- Search visible (not hidden)
- Navigation shallow (max 2 levels)
- Sticky on scroll

### Footer
- Informational, not marketing
- Trust signals (experience, local focus)
- Legal pages clearly accessible
- Contact info prominent

---

## Component System Rules

### Buttons
- **Primary**: Solid, calm color (Trust Blue)
- **Secondary**: Outline with Trust Blue border
- **Never more than 2 button styles on a screen**
- Minimum click target: 44x44px
- Clear hover states

### Cards
- Flat or very subtle shadow (`0 1px 3px rgba(0,0,0,0.1)`)
- No "floating casino card" look
- Consistent padding (16px/24px)
- Clear hierarchy

### Forms
- Clear labels (not placeholder-only)
- Error messages human-readable
- Focus states visible
- Accessible (keyboard navigable)

### Tables / Lists
- Prefer lists over tables for mobile
- Sticky headers when long
- Clear borders/separators

---

## Homepage UX Strategy

**Homepage must answer in 5 seconds:**
1. Neredeyim?
2. Ne yapabilirim?
3. Bana güvenebilir miyim?

### Sections (in order)
1. **Hero**: Search + value proposition (no marketing fluff)
2. **Featured listings**: Real properties, not fake
3. **Karasu & Kocaali local hubs**: Quick access
4. **Guides / Calculators**: Helpful tools
5. **Trust signals**: Experience, local focus, testimonials

### No
- Auto sliders
- Video backgrounds
- Loud CTAs
- Popups on first visit

---

## Listing Experience

### Priorities (in order)
1. Photos (high quality, clear)
2. Price (prominent, clear)
3. Location (map + address)
4. Core features (rooms, size, etc.)
5. Contact options (always visible but not aggressive)

### Rules
- No hidden info
- No "dark patterns"
- Contact CTA always visible but not aggressive
- Maps: Useful, not dominant (never block scrolling)

---

## SEO & UX Coexistence

- Headings follow semantic order (H1 → H2 → H3)
- Content readable for humans first
- Long content broken into scannable blocks
- FAQ visually separated but not ugly

---

## Accessibility (Mandatory)

- **Color contrast**: AA+ (WCAG 2.1 Level AA minimum)
- **Focus states**: Visible (2px solid outline)
- **Click targets**: Minimum 44x44px
- **Keyboard navigable**: All interactive elements
- **Screen reader friendly**: Proper ARIA labels

---

## Design Tokens

### Spacing Scale (8px base)
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px
- `2xl`: 48px
- `3xl`: 64px

### Typography Scale
- **Display**: 48px (3rem) / Line-height: 1.1 / Weight: 700
- **H1**: 32px (2rem) / Line-height: 1.2 / Weight: 600
- **H2**: 24px (1.5rem) / Line-height: 1.3 / Weight: 600
- **H3**: 20px (1.25rem) / Line-height: 1.4 / Weight: 600
- **Body**: 16px (1rem) / Line-height: 1.6 / Weight: 400
- **Small**: 14px (0.875rem) / Line-height: 1.5 / Weight: 400
- **Caption**: 12px (0.75rem) / Line-height: 1.4 / Weight: 400

### Border Radius
- `sm`: 4px (small elements)
- `md`: 8px (buttons, inputs)
- `lg`: 12px (cards)
- `xl`: 16px (large cards)
- `full`: 9999px (pills, avatars)

### Shadows
- `sm`: `0 1px 2px rgba(0,0,0,0.05)`
- `md`: `0 1px 3px rgba(0,0,0,0.1)`
- `lg`: `0 4px 6px rgba(0,0,0,0.1)`
- `xl`: `0 10px 15px rgba(0,0,0,0.1)`

---

## Implementation

- **Tailwind CSS**: Design tokens via CSS variables
- **Shared Components**: `packages/ui` for consistency
- **No inline styling**: Use Tailwind classes or component variants
- **Document decisions**: Brief comments in code

---

## Process Rules

1. Build system first, pages later
2. No page-specific hacks
3. If a component breaks consistency, refactor it
4. Document decisions briefly
5. Trust > Style (always)

