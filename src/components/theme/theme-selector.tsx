'use client'

import { useTheme, themeConfig } from './theme-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Waves, Trees, Sun, Moon, Candy, MapPin, Sparkles } from 'lucide-react'

const iconMap = {
  Waves,
  Trees,
  Sun,
  Moon,
  Candy,
  MapPin,
  Sparkles
} as const

export function ThemeSelector() {
  const { theme, setTheme, mounted } = useTheme()

  // Don't render until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <div className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Cargando tema...</span>
      </Button>
    )
  }

  const currentTheme = themeConfig[theme]
  const CurrentIcon = iconMap[currentTheme.icon as keyof typeof iconMap]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <CurrentIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Cambiar tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(themeConfig).map(([themeKey, config]) => {
          const Icon = iconMap[config.icon as keyof typeof iconMap]
          return (
            <DropdownMenuItem
              key={themeKey}
              onClick={() => setTheme(themeKey as keyof typeof themeConfig)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {config.name}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}