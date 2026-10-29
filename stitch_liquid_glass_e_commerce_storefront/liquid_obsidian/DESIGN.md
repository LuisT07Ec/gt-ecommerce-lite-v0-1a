---
name: Liquid Obsidian
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#e4beb4'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#ab8980'
  outline-variant: '#5b4039'
  surface-tint: '#ffb5a0'
  primary: '#ffb5a0'
  on-primary: '#5f1500'
  primary-container: '#ff5722'
  on-primary-container: '#541200'
  inverse-primary: '#b02f00'
  secondary: '#ffb692'
  on-secondary: '#562000'
  secondary-container: '#fd6c00'
  on-secondary-container: '#562000'
  tertiary: '#3de273'
  on-tertiary: '#003915'
  tertiary-container: '#00a74c'
  on-tertiary-container: '#003211'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#862200'
  secondary-fixed: '#ffdbcb'
  secondary-fixed-dim: '#ffb692'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#7a3000'
  tertiary-fixed: '#66ff8e'
  tertiary-fixed-dim: '#3de273'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005322'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  margin: 1.25rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system expresses a nocturnal, high-end e-commerce experience rooted in tactile futuristic luxury. It merges the deep, light-swallowing darkness of volcanic obsidian stone with the fluid refraction of liquid glassmorphism. Designed primarily for mobile-first commerce, the aesthetic positions the product catalogue as precious artifacts displayed within an ultra-modern, refractive gallery.

### Core Visual Principles
- **Luminous Density:** Surfaces do not merely float; they possess refractive thickness and specular perimeter highlights. Deep obsidian tones establish immense contrast, making vibrant commerce accents feel intensely illuminated.
- **Controlled Refraction:** Translucent surfaces filter background content softly without causing cognitive noise, creating context preservation during deep browsing sessions.
- **Electric Precision:** High-chroma citrus and neon tones are deployed with surgical restraint, reserved exclusively for decisive conversion moments, stock triggers, and active wayfinding.
- **Atmospheric Depth:** Visual layers are differentiated through variable optical density and light-catching edge borders rather than blunt drop shadows.

## Colors

The palette is tuned specifically for deep dark mode displays (OLED/AMOLED), preserving battery efficiency while maximizing chromatic punch.

### Palette Architecture
- **Canvas & Obsidian Base:** 
  - Canvas Deep: `#090A0F` (primary viewport background)
  - Surface Glass Base: `#0D0E15` (recessed planes, drawer foundations)
  - Elevated Glass Trench: `#141622` (navigational structures, floating sheets)
- **Fluid Accents:**
  - `primary_color_hex` (`#FF5722`) delivers dominant conversion power across major CTAs, checkout triggers, and high-priority states.
  - `secondary_color_hex` (`#FF6D00`) provides a high-energy directional complement for gradient finishes, active indicator glows, and promotional badge fills.
  - `tertiary_color_hex` (`#25D366`) is dedicated exclusively to instant communication, direct commerce concierge hooks, and verified WhatsApp order pathways.
- **Glass Matrix & Borders:**
  - Specular Highlights: `rgba(255, 255, 255, 0.12)` to `rgba(255, 255, 255, 0.18)` on top-facing edges.
  - Glass Fills: `rgba(255, 255, 255, 0.04)` for resting cards; `rgba(255, 255, 255, 0.08)` for elevated or focused states.
- **Typography & Icons:**
  - High Emphasis: Pure White (`#FFFFFF`)
  - Medium Emphasis / Secondary: Cool Slate Gray (`#94A3B8`)
  - Low Emphasis / Captions & Inactive Icons: Deep Slate (`#64748B`)

## Typography

The typographic strategy balances geometric precision with micro-legibility at small viewport sizes.

- **Plus Jakarta Sans** delivers rhythmic authority across headlines, product names, price tags, and hero banners. Its geometric architecture creates an approachable yet sophisticated digital storefront tone.
- **Inter** commands all narrative copy, product specifications, micro-labels, and operational metrics. Its neutral, engineered character ensures legibility against semi-translucent glass backdrops and dark backgrounds.
- **Price Treatment Rule:** Currency symbols are rendered in Medium weight (`label-md` or `label-lg`), while numerical monetary values use Semi-Bold or Bold `Plus Jakarta Sans` tracking at `-0.02em` for high visual cohesion.

## Layout & Spacing

The system operates on an 8-point structural grid supported by a 4-point baseline sub-grid for compact mobile elements.

### Fluid Layout Engine
- **Mobile Handheld (320px – 480px):** Single-column structural flows with 2-column asynchronous product cascades. Outer margins remain pinned to `margin-sm` (`1rem`) to maximize usable horizontal screen real estate.
- **Tablet / Large Mobile Foldables (481px – 768px):** Expands to 4-column structured product grids with standard `gutter` (`1rem`) and `margin` (`1.25rem`).
- **Vertical Hierarchy:** Use `space-xs` and `space-sm` for intra-component relationships (e.g., price label to rating chip). Use `space-md` between distinct components within a card, and `space-xl` to segment primary collection modules.

## Elevation & Depth

Visual hierarchy does not use opaque drop shadows. Depth is communicated through variable optical refraction, multi-layered translucency, and edge light reflections.

### Surface Elevation Levels
- **Ground Floor (L0 - Background):** Pure opaque obsidian `#090A0F`. No filters, no borders.
- **Liquid Glass Tier 1 (L1 - Catalog Cards, Banners):**
  - Background: `rgba(255, 255, 255, 0.04)`
  - Filter: `backdrop-blur(16px)`
  - Stroke: 1px continuous hairline `rgba(255, 255, 255, 0.10)`
  - Edge Lighting: Inset 0 1px 0 0 `rgba(255, 255, 255, 0.08)` simulating top-down specular reflection.
- **Liquid Glass Tier 2 (L2 - Modals, Quick-Buy Sheets, Dropdowns):**
  - Background: `rgba(20, 22, 34, 0.72)` blended over `rgba(255, 255, 255, 0.06)`
  - Filter: `backdrop-blur(24px)`
  - Stroke: 1px continuous hairline `rgba(255, 255, 255, 0.15)`
  - Shadow: `0 20px 40px -15px rgba(0, 0, 0, 0.7)`
- **Floating Horizon (L3 - Fixed Navigation Bars, Sticky Actions):**
  - Background: `rgba(13, 14, 21, 0.82)`
  - Filter: `backdrop-blur(20px)`
  - Stroke: 1px top border `rgba(255, 255, 255, 0.12)`
  - Accent Luminescence: Active triggers project an ambient radial glow: `0 0 20px rgba(255, 87, 34, 0.35)`.

## Shapes

The shape vocabulary utilizes flowing, continuous curves that evoke sculpted glass and polished stone.

- Standard cards, content panels, and bottom sheets adopt a pronounced curvature (`1rem` base, scaling to `1.5rem` for large feature cards and modal sheets).
- Form inputs, interactive pills, and primary action buttons maintain smooth, rounded contours that integrate naturally with touch gestures.
- Filter chips, status tags, and WhatsApp indicators utilize fully rounded organic pills to establish immediate visual differentiation from structural commerce cards.

## Components

### Buttons
- **Primary Action (CTA):** Solid gradient fill transitioning from `#FF5722` to `#FF6D00` (135-degree axis). High-contrast white typography (`label-lg`), with subtle ambient inner light reflection along the top rim. Active tap state introduces an electric orange shadow bloom (`0 0 24px rgba(255, 87, 34, 0.5)`).
- **Secondary Glass Button:** Translucent base `rgba(255, 255, 255, 0.06)`, `backdrop-blur(12px)`, wrapped in a 1px `rgba(255, 255, 255, 0.12)` border. Text in `#FFFFFF`.
- **WhatsApp Concierge Button:** Vibrant emerald `#25D366` surface or glass capsule with a `#25D366` glowing edge icon. Signals rapid real-time customer care and instant checkout.

### Cards
- **Product Commerce Card:**
  - Surface: `rounded-2xl` glass substrate with `rgba(255, 255, 255, 0.04)` fill and `backdrop-blur(16px)`.
  - Border: 1px perimeter `rgba(255, 255, 255, 0.10)`.
  - Media container: Inset neutral obsidian pocket (`#090A0F`) with smooth image containment.
  - Floating Quick-Add: Circular glass button positioned at the bottom right with an orange plus icon, highlighting on hover/touch.

### Chips & Badges
- **Status/Discount Badges:** Compact glass pills with glowing solid orange or neon green text. Background tinted at 15% opacity of the parent accent color with a matching hairline border.
- **Filter Chips:** Inactive chips feature `rgba(255, 255, 255, 0.05)` with `#94A3B8` labels. Active chips switch to pure white text, a distinct `rgba(255, 255, 255, 0.15)` glass fill, and an orange underline dot.

### Form Inputs
- Fields use an obsidian inset fill (`#0D0E15`) with a 1px glass border `rgba(255, 255, 255, 0.10)`.
- Placeholder text in `#64748B`.
- Focused state: Border brightens to `#FF5722` with a subtle orange specular corona (`0 0 0 3px rgba(255, 87, 34, 0.15)`).

### Elevated Mobile Navigation Bar
- Floats detached above the bottom viewport edge with horizontal margin padding.
- Composition: Obsidian glass (`rgba(13, 14, 21, 0.85)`), `backdrop-blur(24px)`, rounded-full or `rounded-2xl` capsule enclosure, 1px perimeter highlight (`rgba(255, 255, 255, 0.12)`).
- Active item indicator: Pure white icon seated directly above an ambient localized neon orange radial flare.