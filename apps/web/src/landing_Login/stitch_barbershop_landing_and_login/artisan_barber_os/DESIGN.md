---
name: Artisan Barber OS
colors:
  surface: '#fdf9f0'
  surface-dim: '#dddad1'
  surface-bright: '#fdf9f0'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3ea'
  surface-container: '#f1eee5'
  surface-container-high: '#ece8df'
  surface-container-highest: '#e6e2d9'
  on-surface: '#1c1c16'
  on-surface-variant: '#50443e'
  inverse-surface: '#31302b'
  inverse-on-surface: '#f4f0e7'
  outline: '#83746d'
  outline-variant: '#d5c3bb'
  surface-tint: '#7c5641'
  primary: '#412311'
  on-primary: '#ffffff'
  primary-container: '#5a3825'
  on-primary-container: '#d2a289'
  inverse-primary: '#eebca2'
  secondary: '#944928'
  on-secondary: '#ffffff'
  secondary-container: '#fe9e76'
  on-secondary-container: '#773314'
  tertiary: '#00311e'
  on-tertiary: '#ffffff'
  tertiary-container: '#014a2f'
  on-tertiary-container: '#7bb996'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbca'
  primary-fixed-dim: '#eebca2'
  on-primary-fixed: '#2f1405'
  on-primary-fixed-variant: '#623e2b'
  secondary-fixed: '#ffdbce'
  secondary-fixed-dim: '#ffb598'
  on-secondary-fixed: '#370e00'
  on-secondary-fixed-variant: '#763213'
  tertiary-fixed: '#b0f1cb'
  tertiary-fixed-dim: '#95d4b0'
  on-tertiary-fixed: '#002112'
  on-tertiary-fixed-variant: '#0d5135'
  background: '#fdf9f0'
  on-background: '#1c1c16'
  surface-variant: '#e6e2d9'
typography:
  headline-xl:
    fontFamily: Vollkorn
    fontSize: 38px
    fontWeight: '700'
    lineHeight: 46px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Vollkorn
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Vollkorn
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Vollkorn
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Vollkorn
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Vollkorn
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  numeric-stat:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style
This design system embodies the warmth, tactile sophistication, and grounded heritage of an upscale modern barbershop and grooming studio atelier. Crafted for studio managers, artisan grooming professionals, and discerning clientele, the aesthetic fuses traditional editorial grooming craftsmanship with modern digital ergonomics. 

The mood is understated luxury: rich leather tones, warm paper stock, natural clay, and deep roast espresso. The design movement marries **Warm Editorial Minimalism** with **Tactile Heritage Modernism**. Interfaces prioritize clean informational hierarchy, organic warmth over sterile cold technology, generous breathing room, crisp micro-borders, and tactile interactions that feel tailored and deliberate.

## Colors
The palette is built around natural, organic materials found in artisan grooming studios: seasoned wood, honed stone, terracotta tile, botanical pomades, and warm parchment paper.

- **Canvas & Backgrounds**: The base canvas is anchored by Warm Linen (`#F6F2E9`) and Light Cream (`#FBF8F2`), avoiding harsh stark whites in favor of high-comfort, low-fatigue natural parchment.
- **Primary Action (Rich Espresso - `#5A3825`)**: A deep roasted brown used for dominant call-to-actions, active navigation states, primary buttons, and hero focal points.
- **Secondary (Terracotta - `#C26D49`)**: Warm baked clay providing expressive visual accents, secondary tags, interactive link highlights, and creative emphasis.
- **Tertiary & Semantic Success (Sage Leaf - `#3E7B5C` / Tint `#EAF2EC`)**: Muted botanical green used for confirmed appointments, positive performance metrics, and active availability.
- **Neutral & Surface Hierarchy**:
  - `surface-base`: `#F6F2E9` (app workspace canvas background)
  - `surface-card`: `#FFFFFF` (elevated cards and modules)
  - `surface-subtle`: `#EDE8DC` (inactive badges, muted hover states, sidebar containers)
  - `border-subtle`: `#E4DDD0` (delicate hairline dividers and card boundaries)
  - `text-primary`: `#231B15` (deep umber charcoal for maximum readability with warmth)
  - `text-secondary`: `#6B5E55` (stone grey-brown for secondary metrics, labels, and timestamps)
  - `text-tertiary`: `#9D9185` (subtle captions and inactive indicators)

## Typography
The typographic architecture relies on a pairing of classic editorial authority and ergonomic operational clarity.

- **Display & Headings (`Vollkorn`)**: Used for personal greetings, section titles, and key studio performance categories. Vollkorn carries robust serifs with warm, organic curves reminiscent of traditional apothecary labels and bespoke barber salon identity.
- **Body, UI & Navigation (`Plus Jakarta Sans`)**: Applied across data tables, schedules, labels, counters, and body copy. Its humanist geometry ensures clean scannability, legibility in dense operational views, and friendly modernity.
- **Hierarchy Rules**: 
  - Main titles (e.g., "Buenos días, Mariana.") pair a heavyweight editorial serif with a colored terminal accent period in espresso or terracotta.
  - Section subheaders and navigation tags employ uppercase small labels with tracked letter-spacing (`label-sm` with `0.04em`) to establish crisp visual divisions without competing with primary headings.

## Layout & Spacing
The layout leverages a disciplined, fluid 12-column grid system designed to support complex scheduling dashboards, studio operations, and financial overviews.

- **Shell Architecture**: Desktop layouts feature an integrated persistent lateral rail (`240px` to `260px` width) for studio switching and workspace navigation, paired with an expansive, comfortably padded workspace canvas (`margin: 2rem`).
- **Data Card Arrays**: Metric scorecards default to a 4-column balanced row on desktop (`span 3`), collapsing gracefully to 2x2 grids on tablet and a single fluid stack on mobile.
- **Split Detail Zones**: Operational schedules and charts balance across an asymmetric `7:5` or `8:4` desktop distribution, providing primary focus to active client queues and secondary focus to studio performance charts.
- **Breakpoints**:
  - `Mobile` (< 768px): Single column, floating action trigger, drawer-based sidebar navigation, compact gutter (`0.75rem`).
  - `Tablet` (768px - 1024px): 8-column layout, collateral panels fold into tabbed views.
  - `Desktop` (> 1024px): 12-column layout with fixed navigation rail and responsive multi-card operational layouts.

## Elevation & Depth
Elevation is achieved through warm tonal layering and soft, hairline structural borders rather than high-contrast dropshadows.

- **Surface Tiers**:
  - **Level 0 (Canvas)**: Background tint in warm stone-linen (`#F6F2E9`).
  - **Level 1 (Card & Module Layer)**: Pure warm white (`#FFFFFF`) cards resting directly on the canvas, bounded by a continuous hairline outline (`1px solid #E4DDD0`).
  - **Level 2 (Active States & Flyouts)**: Dropdown menus, popovers, and interactive tooltips maintain the white surface with an ambient, clay-tinted soft shadow: `0 8px 24px -4px rgba(74, 46, 27, 0.08), 0 2px 6px -1px rgba(74, 46, 27, 0.04)`.
  - **Level 3 (Modal Dialogues & Booking Drawers)**: High-level overlays with backdrop blur (`backdrop-filter: blur(4px)`) over a translucent warm veil (`rgba(35, 27, 21, 0.25)`).

## Shapes
The shape philosophy balances structured utility with approachable artisan curves.

- **Cards & Data Modules**: Defined by rounded corners (`0.75rem` to `1rem` / `rounded-lg`) offering an inviting, furniture-like crafted feel that frames content cleanly.
- **Pills & Badges**: Status chips (Confirmed, Pending, In Queue), avatar rings, and counter pills utilize full pill geometry (`9999px` / `rounded-full`) to differentiate temporal metadata from structural cards.
- **Primary Buttons & Interactive Tiles**: Softened rectangles (`0.5rem` to `0.75rem`) that communicate decisive tactile clickability.

## Components

### Buttons
- **Primary Action**: Solid espresso (`#5A3825`), white text (`#FFFFFF`), `0.625rem 1.25rem` padding, subtle hover shift to darker roast (`#43291B`). Features a leading tactile icon (such as a warm gold or crisp white `+` for "Nueva reserva").
- **Secondary Action**: Bordered button in warm linen outline (`1px solid #D8CFC0`), text in primary espresso (`#5A3825`), background transparent or soft cream on hover (`#F1ECE0`).
- **Icon / Utility Buttons**: Soft square or circular controls with subtle borders (`#E4DDD0`) and light warm fill (`#FFFFFF` or `#F9F6F0`) for notifications, search triggers, and date pagination.

### Status Chips & Pills
- **Confirmed / Success**: Soft botanical sage background (`#EAF2EC`), deep forest green text (`#2A5940`), font weight semi-bold (`label-sm`).
- **Pending / Waiting**: Muted warm stone background (`#EFECE4`), warm taupe-charcoal text (`#5E564E`).
- **In-Chair / Active**: Light terracotta tint (`#FDF1EB`), burnt terracotta text (`#A64D29`).

### Navigation Sidebar
- Lateral workspace bar framed in clean linen tone (`#F6F2E9`).
- **Active Navigation Item**: Solid espresso background (`#5A3825`), crisp white typography, pill or soft-rounded perimeter, accompanied by active count badges in terracotta or neutral tones.
- **Inactive Item**: Neutral grey-brown (`#6B5E55`) text with transparent background; shifts to `#EDE7DC` on hover.

### Cards & Metric Containers
- Surface: `#FFFFFF`. Border: `1px solid #E4DDD0`.
- Metric layout: Upper label in muted stone grey (`text-secondary`), optional categorical circular icon badge, primary stat set in bold geometric numerals (`numeric-stat`), accompanied by inline trend badges (green for growth, terracotta for decline).

### Lists & Appointment Tables
- Alternating or partitioned appointment rows bordered with light sand hairlines (`#EFE9DD`).
- Includes time stamp (`label-md` in stone grey), circular initials avatar (warm neutral fill `#E8E2D5` with dark espresso initials), client name in bold sans-serif, subtext service detail in body-sm, and right-aligned pill status.

### Form Inputs & Selectors
- Background: `#FFFFFF` or subtle `#FAF8F3`.
- Border: `1px solid #D9D1C2`, focusing to `2px solid #5A3825` without cold blue halos.
- Studio Switcher dropdown: Framed in an enclosed pill container with location pulse indicator dot (sage green for open studio).