/**
 * Responsive Utilities for Mobile-First Design
 *
 * Helpers to generate responsive classes for components
 * following mobile-first approach with progressive enhancement
 */

type DeviceSize = 'mobile' | 'tablet' | 'desktop'

interface ResponsiveClasses {
  padding: string
  gap: string
  text: string
  icon: string
  height: string
}

/**
 * Get compact classes for responsive components
 * Mobile-first approach: base = mobile, progressive enhancement for larger screens
 */
export function getCompactClasses(component: 'card' | 'button' | 'input' | 'text' | 'icon'): ResponsiveClasses {
  const classes: Record<string, ResponsiveClasses> = {
    card: {
      padding: 'p-3 md:p-4 lg:p-6',
      gap: 'gap-2 md:gap-3 lg:gap-4',
      text: 'text-sm md:text-base',
      icon: 'h-4 w-4 md:h-5 md:w-5',
      height: 'h-auto'
    },
    button: {
      padding: 'px-3 py-2 md:px-4 md:py-2.5',
      gap: 'gap-1.5 md:gap-2',
      text: 'text-xs md:text-sm',
      icon: 'h-3 w-3 md:h-4 md:w-4',
      height: 'h-9 md:h-10'
    },
    input: {
      padding: 'px-3 py-2 md:px-3 md:py-2',
      gap: 'gap-2',
      text: 'text-sm md:text-base',
      icon: 'h-4 w-4',
      height: 'h-9 md:h-10'
    },
    text: {
      padding: 'p-0',
      gap: 'gap-1 md:gap-1.5',
      text: 'text-sm md:text-base',
      icon: 'h-4 w-4 md:h-5 md:w-5',
      height: 'h-auto'
    },
    icon: {
      padding: 'p-0',
      gap: 'gap-0',
      text: '',
      icon: 'h-4 w-4 md:h-5 md:w-5 lg:h-6 lg:w-6',
      height: 'h-auto'
    }
  }

  return classes[component]
}

/**
 * Get spacing classes based on size
 */
export function getSpacing(size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string {
  const spacings = {
    xs: 'space-y-1 md:space-y-1.5',
    sm: 'space-y-2 md:space-y-3',
    md: 'space-y-3 md:space-y-4 lg:space-y-6',
    lg: 'space-y-4 md:space-y-6 lg:space-y-8',
    xl: 'space-y-6 md:space-y-8 lg:space-y-10'
  }

  return spacings[size]
}

/**
 * Get grid column classes for responsive grids
 */
export function getGridCols(config: {
  mobile?: number
  tablet?: number
  desktop?: number
}): string {
  const { mobile = 1, tablet = 2, desktop = 3 } = config

  return `grid-cols-${mobile} md:grid-cols-${tablet} lg:grid-cols-${desktop}`
}

/**
 * Get typography scale classes
 */
export function getTypography(variant: 'h1' | 'h2' | 'h3' | 'h4' | 'body' | 'small' | 'tiny'): string {
  const typography = {
    h1: 'text-2xl md:text-3xl lg:text-4xl font-bold',
    h2: 'text-xl md:text-2xl lg:text-3xl font-bold',
    h3: 'text-lg md:text-xl lg:text-2xl font-semibold',
    h4: 'text-base md:text-lg font-semibold',
    body: 'text-sm md:text-base',
    small: 'text-xs md:text-sm',
    tiny: 'text-[10px] md:text-xs'
  }

  return typography[variant]
}

/**
 * Get container padding for full-width sections
 */
export function getContainerPadding(): string {
  return 'px-4 md:px-6 lg:px-8'
}

/**
 * Get responsive border radius
 */
export function getBorderRadius(size: 'sm' | 'md' | 'lg'): string {
  const radii = {
    sm: 'rounded-md md:rounded-lg',
    md: 'rounded-lg md:rounded-xl',
    lg: 'rounded-xl md:rounded-2xl'
  }

  return radii[size]
}

/**
 * Utility to check if device is mobile based on window width
 * Use with client-side only (useEffect, event handlers)
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * Utility to check if device is tablet
 */
export function isTabletDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 768 && window.innerWidth < 1024
}

/**
 * Utility to check if device is desktop
 */
export function isDesktopDevice(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 1024
}

/**
 * Get current device size
 */
export function getDeviceSize(): DeviceSize {
  if (isMobileDevice()) return 'mobile'
  if (isTabletDevice()) return 'tablet'
  return 'desktop'
}

/**
 * Touch-friendly minimum sizes (WCAG 2.1 AA compliance)
 */
export const TOUCH_TARGET = {
  min: 'min-h-[44px] min-w-[44px]', // 44x44px minimum
  comfortable: 'min-h-[48px] min-w-[48px]' // 48x48px comfortable
} as const

/**
 * Responsive gap utilities
 */
export function getGap(size: 'xs' | 'sm' | 'md' | 'lg'): string {
  const gaps = {
    xs: 'gap-1 md:gap-1.5',
    sm: 'gap-2 md:gap-3',
    md: 'gap-3 md:gap-4 lg:gap-6',
    lg: 'gap-4 md:gap-6 lg:gap-8'
  }

  return gaps[size]
}

/**
 * Responsive max-width utilities for content
 */
export function getMaxWidth(size: 'sm' | 'md' | 'lg' | 'xl' | 'full'): string {
  const widths = {
    sm: 'max-w-sm md:max-w-md',
    md: 'max-w-md md:max-w-lg',
    lg: 'max-w-lg md:max-w-xl lg:max-w-2xl',
    xl: 'max-w-xl md:max-w-2xl lg:max-w-4xl',
    full: 'max-w-full'
  }

  return widths[size]
}
