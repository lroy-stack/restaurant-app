// Email-compatible color palette
// CRITICAL: Converted from OKLCH design tokens to RGB/HEX for email client compatibility
// These colors maintain brand consistency while ensuring email rendering

export const emailColors = {
  // Primary palette (ENIGMA TEAL - Manual de marca)
  primary: '#237584',        // Color principal real del manual Enigma
  primaryForeground: '#ffffff', // Blanco puro para contraste en teal
  primaryDarker: '#1a5a66',     // Teal más oscuro para gradiente

  // Text colors
  foreground: '#1e293b',        // oklch(0.13 0.028 200)
  mutedForeground: '#6b7280',   // oklch(0.45 0.025 200)

  // Background colors
  background: '#fafbfc',        // oklch(0.985 0.002 210)
  card: '#ffffff',              // oklch(1 0 0)
  muted: '#f6f7f8',            // oklch(0.96 0.005 210)

  // Secondary palette (ENIGMA SAGE - Manual de marca)
  secondary: '#f4f6f1',         // Sage muy claro para fondos
  secondaryBorder: '#9FB289',   // Color sage real del manual Enigma

  // Accent palette (ENIGMA ORANGE - Manual de marca)
  accent: '#CB5910',            // Color naranja real del manual Enigma
  accentLight: '#fef5f0',       // Naranja muy claro para fondos

  // Borders and dividers
  border: '#e2e4e6',            // oklch(0.88 0.01 210)

  // Success/positive
  success: '#10b981',
  successLight: '#d1fae5',

  // States
  white: '#ffffff',
  black: '#000000'
} as const

// Email-safe gradient functions - ENIGMA REAL COLORS
export const emailGradients = {
  primaryGradient: `linear-gradient(135deg, ${emailColors.primary} 0%, ${emailColors.primaryDarker} 100%)`,
  accentGradient: `linear-gradient(135deg, ${emailColors.accent} 0%, #a0480c 100%)`
} as const

// Common text styles for email templates
export const emailTextStyles = {
  h1: {
    color: emailColors.primary,
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '36px',
    margin: '0 0 32px',
    textAlign: 'center' as const,
    fontFamily: 'Benaya, Georgia, serif',
    letterSpacing: '-0.02em'
  },

  h2: {
    color: emailColors.foreground,
    fontSize: '22px',
    fontWeight: '600',
    lineHeight: '28px',
    margin: '0 0 20px',
    fontFamily: 'Playfair Display, Georgia, serif',
    letterSpacing: '-0.01em'
  },

  h3: {
    color: emailColors.foreground,
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
    margin: '0 0 16px',
    fontFamily: 'Playfair Display, Georgia, serif'
  },

  paragraph: {
    color: emailColors.foreground,
    fontSize: '16px',
    lineHeight: '26px',
    margin: '0 0 20px',
    fontFamily: 'Inter, system-ui, sans-serif'
  },

  mutedText: {
    color: emailColors.mutedForeground,
    fontSize: '14px',
    lineHeight: '20px',
    fontFamily: 'Inter, system-ui, sans-serif'
  }
} as const

// Common layout styles
export const emailLayoutStyles = {
  detailsBox: {
    backgroundColor: emailColors.muted,
    border: `2px solid ${emailColors.primary}`,
    borderRadius: '12px',
    padding: '32px',
    margin: '32px 0',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
  },

  preOrderBox: {
    backgroundColor: emailColors.secondary,
    border: `2px solid ${emailColors.secondaryBorder}`,
    borderRadius: '12px',
    padding: '28px',
    margin: '32px 0',
    boxShadow: '0 2px 12px rgba(130, 160, 130, 0.12)'
  },

  infoBox: {
    backgroundColor: emailColors.accentLight,
    border: `2px solid ${emailColors.accent}`,
    borderRadius: '12px',
    padding: '28px',
    margin: '32px 0',
    boxShadow: '0 2px 12px rgba(184, 150, 92, 0.12)'
  },

  buttonPrimary: {
    backgroundColor: emailColors.primary,
    borderRadius: '12px',
    color: emailColors.primaryForeground,
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    margin: '0 12px 12px',
    padding: '16px 32px',
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: '0.02em',
    boxShadow: '0 4px 16px rgba(68, 114, 184, 0.3)'
  },

  buttonSecondary: {
    backgroundColor: emailColors.white,
    border: `2px solid ${emailColors.primary}`,
    borderRadius: '12px',
    color: emailColors.primary,
    fontSize: '16px',
    fontWeight: '600',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    margin: '0 12px 12px',
    padding: '16px 32px',
    fontFamily: 'Inter, system-ui, sans-serif',
    letterSpacing: '0.02em',
    boxShadow: '0 2px 8px rgba(68, 114, 184, 0.2)'
  }
} as const