---
name: Legacy Archival
colors:
  surface: '#fcf8ff'
  surface-dim: '#dbd6f8'
  surface-bright: '#fcf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f1ff'
  surface-container: '#f0ebff'
  surface-container-high: '#eae5ff'
  surface-container-highest: '#e4dfff'
  on-surface: '#1b1931'
  on-surface-variant: '#464554'
  inverse-surface: '#302d47'
  inverse-on-surface: '#f3eeff'
  outline: '#777586'
  outline-variant: '#c7c4d7'
  surface-tint: '#4d4ad5'
  primary: '#2110ae'
  on-primary: '#ffffff'
  primary-container: '#3b35c3'
  on-primary-container: '#b8b7ff'
  inverse-primary: '#c2c1ff'
  secondary: '#5453b0'
  on-secondary: '#ffffff'
  secondary-container: '#9d9cfe'
  on-secondary-container: '#302e8a'
  tertiary: '#3d361b'
  on-tertiary: '#ffffff'
  tertiary-container: '#544d30'
  on-tertiary-container: '#c9be99'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c2c1ff'
  on-primary-fixed: '#0c006a'
  on-primary-fixed-variant: '#342dbd'
  secondary-fixed: '#e2dfff'
  secondary-fixed-dim: '#c2c1ff'
  on-secondary-fixed: '#0c006a'
  on-secondary-fixed-variant: '#3c3a96'
  tertiary-fixed: '#eee2bc'
  tertiary-fixed-dim: '#d1c6a1'
  on-tertiary-fixed: '#211b04'
  on-tertiary-fixed-variant: '#4e472a'
  background: '#fcf8ff'
  on-background: '#1b1931'
  surface-variant: '#e4dfff'
  paper-cream: '#F4E8C1'
  midnight-indigo: '#0A0820'
  electric-indigo: '#3B35C3'
  ink-blue: '#1F1A7A'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 64px
    fontWeight: '700'
    lineHeight: 72px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Hanken Grotesk
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-lg:
    fontFamily: Hanken Grotesk
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-md:
    fontFamily: Hanken Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
  quote:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '400'
    lineHeight: 40px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  stack-sm: 16px
  stack-md: 32px
  stack-lg: 64px
---

## Brand & Style

This design system is built for storytelling and preserving legacies. It evokes the feeling of a curated archive—intimate, authoritative, and deeply personal. The personality is a blend of modern sophistication and nostalgic tactility, designed to make "Founder Stories" feel like a permanent record rather than a fleeting digital post.

The visual style is **Tactile Minimalism**. It utilizes a "file folder" metaphor, employing overlapping layers and paper-like surfaces to create a sense of physical history. This is achieved through subtle textural shifts, intentional use of negative space, and a high-contrast typographic hierarchy that feels both editorial and archival.

## Colors

The color palette is anchored by a deep, scholarly indigo paired with a warm, organic neutral. The primary color, **Electric Indigo**, serves as the interactive lead, while the **Midnight Indigo** provides structural depth.

**Paper Cream** is used for large-scale surfaces to mimic the look of aged vellum or archival folders, reducing the harshness of pure white and reinforcing the tactile narrative. Text should predominantly live in **Midnight Indigo** to maintain high legibility and an "ink on paper" feel.

## Typography

This design system uses a sharp contrast between **Playfair Display** and **Hanken Grotesk**. Playfair Display provides the editorial "voice" of the founder—it is high-contrast, elegant, and carries historical weight. Use it for narrative headings and block quotes.

Hanken Grotesk handles the functional aspects—body copy, captions, and metadata. It is a clean, neutral sans-serif that balances the ornate nature of the serif headlines. To emphasize the archival feel, labels are often presented in all-caps with generous letter spacing, mimicking document classification stamps.

## Layout & Spacing

The layout follows a **Fixed Grid** model for desktop, centered on a 12-column system to maintain focus and readability for long-form stories. On mobile, the system shifts to a single-column fluid layout with breathable margins.

Spacing is generous to evoke a premium, gallery-like experience. Vertical "stack" units are used to create distinct rhythmic breaks between story chapters. Elements should often be slightly offset or overlapped to reinforce the "file folder" aesthetic, breaking the rigid grid where photos or callouts appear as if they were tucked into a folder.

## Elevation & Depth

Depth is achieved through **Tonal Layers** rather than aggressive shadows. The `paper-cream` surface acts as the base layer, with containers using very subtle, low-opacity shadows (Midnight Indigo at 5-10% opacity) to suggest the thickness of physical cardstock.

When elements overlap (e.g., a photo over a text block), use a crisp 1px border in `Midnight Indigo` or a slightly darker shade of `Paper Cream` to define the edge, rather than a heavy blur. This creates a "stacked paper" effect that feels intentional and archival.

## Shapes

The shape language is **Soft (0.25rem)**. While the overall aesthetic is structured, the slight rounding of corners prevents the UI from feeling sharp or aggressive. 

Cards and photo containers should mimic the geometry of tabbed folders. This can be achieved by using asymmetrical corner radii (e.g., top-left and top-right rounded, bottom corners sharp) on specific container headers to create a physical "tab" look.

## Components

### Buttons
Primary buttons use the `electric-indigo` background with `white` or `paper-cream` text. They should have a subtle 1px inset border to give them a pressed-paper feel. Secondary buttons are outlined in `midnight-indigo` with a transparent background.

### Cards (Folder Style)
Cards are the primary container for founder stories. They should use the `paper-cream` background. To achieve the "file folder" look, the top edge should feature a "tab" (a smaller rectangular container offset to the left) containing metadata like a date or a category label.

### Photos & Media
Photos should not have significant rounding. They should appear as "taped" or "placed" on the page, occasionally featuring a thin white border (Polaroid style) and a very slight rotation (1-2 degrees) to enhance the archival, non-digital feeling.

### Inputs & Fields
Input fields are simplified, using only a bottom border in `midnight-indigo` to mimic the lines on a physical form or ledger. Labels sit above in the `label-md` typographic style.

### Narrative Chips
Used for tagging themes in a story (e.g., "Resilience," "Innovation"). These should be rectangular with the `rounded-sm` setting, using `midnight-indigo` text on a slightly darker cream background.