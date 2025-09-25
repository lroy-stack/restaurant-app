'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type EnigmaTheme = 'atlantic' | 'forest' | 'sunset' | 'obsidian'

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: EnigmaTheme
  storageKey?: string
}

type ThemeProviderState = {
  theme: EnigmaTheme
  setTheme: (theme: EnigmaTheme) => void
  mounted: boolean
}

const initialState: ThemeProviderState = {
  theme: 'atlantic',
  setTheme: () => null,
  mounted: false,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function EnigmaThemeProvider({
  children,
  defaultTheme = 'atlantic',
  storageKey = 'enigma-ui-theme',
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<EnigmaTheme>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage after mount
  useEffect(() => {
    setMounted(true)
    const storedTheme = localStorage?.getItem(storageKey) as EnigmaTheme
    if (storedTheme) {
      setTheme(storedTheme)
    }
  }, [storageKey])

  // Apply theme classes to DOM
  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement

    // Remove all theme classes
    root.classList.remove('theme-atlantic', 'theme-forest', 'theme-sunset', 'theme-obsidian', 'dark')

    // Apply the selected theme
    if (theme === 'atlantic') {
      // Atlantic is the default, no class needed
    } else if (theme === 'obsidian') {
      root.classList.add('theme-obsidian', 'dark')
    } else {
      root.classList.add(`theme-${theme}`)
    }
  }, [theme, mounted])

  const value = {
    theme,
    mounted,
    setTheme: (newTheme: EnigmaTheme) => {
      if (mounted) {
        localStorage?.setItem(storageKey, newTheme)
      }
      setTheme(newTheme)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error('useTheme must be used within a EnigmaThemeProvider')

  return context
}

// Theme configurations for display
export const themeConfig = {
  atlantic: {
    name: 'Atlántico',
    icon: 'Waves'
  },
  forest: {
    name: 'Bosque',
    icon: 'Trees'
  },
  sunset: {
    name: 'Atardecer',
    icon: 'Sun'
  },
  obsidian: {
    name: 'Obsidiana',
    icon: 'Moon'
  }
} as const