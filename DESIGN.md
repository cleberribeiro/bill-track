---
name: BillTrack
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#3c4a42'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#6c7a71'
  outline-variant: '#bbcabf'
  surface-tint: '#006c49'
  primary: '#006c49'
  on-primary: '#ffffff'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#4edea3'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fd'
  on-secondary-container: '#57657b'
  tertiary: '#a43a3a'
  on-tertiary: '#ffffff'
  tertiary-container: '#fc7c78'
  on-tertiary-container: '#711419'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#d5e3fd'
  secondary-fixed-dim: '#b9c7e0'
  on-secondary-fixed: '#0d1c2f'
  on-secondary-fixed-variant: '#3a485c'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3af'
  on-tertiary-fixed: '#410005'
  on-tertiary-fixed-variant: '#842225'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  h1:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  mono-data:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  list-item-gap: 0px
  row-height-sm: 40px
  row-height-md: 56px
  gutter: 16px
---

## Brand & Style
The design system is rooted in functional minimalism, drawing inspiration from spreadsheet efficiency and the clarity of a physical checklist. The goal is to reduce the cognitive load of financial management through a "data-first" approach. By stripping away decorative elements, the system evokes a sense of control, honesty, and precision.

The target audience consists of individuals who find traditional banking apps overly cluttered and prefer a direct, utilitarian interface to track obligations. The aesthetic is "spreadsheet-simple"—relying on alignment, clean lines, and purposeful color cues rather than depth or gradients to communicate hierarchy.

## Colors
The palette is restricted and optimized for light mode to ensure maximum focus on financial status while providing a clean, professional workspace. 
- **Surface Light:** The primary background color is a clean, bright neutral (#F8FAFC) to maintain a "digital ledger" feel.
- **Success Green (#10B981):** A high-contrast accent used exclusively for "Paid" states, completed tasks, and positive balances.
- **Slate Gray (#334155):** Used for structural borders and secondary text. It provides a crisp, mechanical feel that provides structure against the bright background.
- **Text Primary:** Deep charcoal/black for maximum legibility and clarity against light surfaces.

## Typography
The design system utilizes **Inter** for its neutral, systematic, and utilitarian qualities. The typographic scale is compact to allow for high information density. 

A "mono-data" style is used for currency and dates to ensure vertical alignment when looking down a list, mimicking a ledger. Labels are occasionally set in uppercase with slight letter spacing to differentiate headers from user data without increasing font size.

## Layout & Spacing
This design system uses a strict **fixed-grid** philosophy for desktop/tablet and a single-column fluid stack for mobile. Layouts are strictly list-based. 

Instead of cards with margins, this system uses a "row-and-rule" approach where items are separated by 1px slate borders, similar to a spreadsheet. Vertical rhythm is built on 4px increments. Information density is prioritized; generous padding is avoided in favor of clean alignment and hairline separators.

## Elevation & Depth
There is no use of shadows, blurs, or Z-axis depth in this design system. Hierarchical distinction is achieved through **tonal layers** and subtle shifts in surface brightness.

Surfaces stay flat. To indicate interaction or "lifting," an element may receive a slightly darker background fill or a more pronounced border, but it never casts a shadow. This reinforces the "checklist" and "spreadsheet" metaphor.

## Shapes
To provide a more modern, approachable feel while maintaining the professional aesthetic, the design system utilizes **soft corners (4px)**. This subtle rounding softens the rigid lines of the ledger without sacrificing the structural, "engineered" quality of the interface. All buttons, input fields, and containers must have 4px border-radius to ensure visual harmony.

## Components
- **Buttons:** Rectangular with a 4px border-radius. The primary action button uses a Success Green background. Ghost buttons use 1px borders and no fill.
- **Lists:** The core component. Each row is 56px high, separated by a 1px slate border. Rows should have a subtle hover state using a slightly darker neutral fill.
- **Checkboxes:** Square with a 2px radius. When checked, the entire box fills with Success Green, and the associated list item text may optionally take on a strikethrough or a lower opacity.
- **Input Fields:** Simple 1px borders with a 4px radius. Focus states are indicated by a weight increase of the border to 2px Slate Gray rather than a color change.
- **Chips/Badges:** Used for "Overdue" (Red) or "Upcoming" (Slate). They are flat, slightly rounded, and use small-caps typography.
- **Data Tables:** Headers are sticky, using a subtly darker neutral fill to distinguish them from the data rows. No vertical lines; use horizontal lines only to guide the eye across.