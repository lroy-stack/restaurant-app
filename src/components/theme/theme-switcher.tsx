'use client'

import React from 'react'
import { useTheme } from './theme-provider'
import {
  Waves,
  Trees,
  Sun,
  Moon,
  Candy,
  MapPin,
  Sparkles,
  Palette,
  Check
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const iconMap = {
  Waves,
  Trees,
  Sun,
  Moon,
  Candy,
  MapPin,
  Sparkles
}

const themeColors = {
  atlantic: {
    primary: 'oklch(0.4500 0.1500 200)',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    ring: 'ring-blue-500/20'
  },
  forest: {
    primary: 'oklch(0.5234 0.1347 144.1672)',
    gradient: 'from-green-600/20 to-emerald-600/20',
    ring: 'ring-green-600/20'
  },
  sunset: {
    primary: 'oklch(0.6 0.15 50)',
    gradient: 'from-orange-500/20 to-rose-500/20',
    ring: 'ring-orange-500/20'
  },
  obsidian: {
    primary: 'oklch(0.4 0.05 260)',
    gradient: 'from-slate-700/20 to-slate-900/20',
    ring: 'ring-slate-700/20'
  },
  chicle: {
    primary: 'oklch(0.7 0.15 330)',
    gradient: 'from-pink-500/20 to-purple-500/20',
    ring: 'ring-pink-500/20'
  },
  calpe: {
    primary: 'oklch(0.55 0.12 180)',
    gradient: 'from-teal-500/20 to-blue-400/20',
    ring: 'ring-teal-500/20'
  },
  galaxy: {
    primary: 'oklch(0.5 0.18 280)',
    gradient: 'from-purple-600/20 to-indigo-600/20',
    ring: 'ring-purple-600/20'
  }
}

const themeData = {
  atlantic: { name: 'Enigma', icon: 'Waves', mode: 'light' },
  forest: { name: 'Bosque', icon: 'Trees', mode: 'dark' },
  sunset: { name: 'Atardecer', icon: 'Sun', mode: 'light' },
  obsidian: { name: 'Obsidiana', icon: 'Moon', mode: 'dark' },
  chicle: { name: 'Chicle', icon: 'Candy', mode: 'dark' },
  calpe: { name: 'Calpe', icon: 'MapPin', mode: 'light' },
  galaxy: { name: 'Galaxy', icon: 'Sparkles', mode: 'light' }
} as const

interface ThemeSwitcherProps {
  className?: string
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const { theme, setTheme, mounted } = useTheme()

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  const currentThemeData = themeData[theme]
  const CurrentIcon = iconMap[currentThemeData.icon as keyof typeof iconMap]

  return (
    <>
      {/* Desktop Version - Left Side Vertical */}
      <div className={cn(
        'fixed left-6 top-1/2 transform -translate-y-1/2 z-50',
        'hidden lg:block',
        'transition-all duration-500',
        className
      )}>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'relative w-12 h-12 rounded-2xl',
              'backdrop-blur-2xl',
              'transition-all duration-300',
              'border border-border/40',
              'bg-card/80 hover:bg-card/90',
              'shadow-xl hover:shadow-2xl',
              'flex items-center justify-center',
              'group hover:scale-105 active:scale-95',
              'focus:outline-none focus:ring-2 focus:ring-primary/20'
            )}
            aria-label="Cambiar tema"
          >
            {/* Top shine effect */}
            <div className="absolute top-2 left-2 right-2 h-px opacity-20 bg-gradient-to-r from-transparent via-foreground/30 to-transparent" />

            {/* Icon with gradient background */}
            <div className={cn(
              'w-8 h-8 rounded-xl flex items-center justify-center',
              'bg-gradient-to-br',
              themeColors[theme].gradient,
              'transition-all duration-300'
            )}>
              <CurrentIcon className="w-4 h-4 text-foreground" strokeWidth={2} />
            </div>

            {/* Tooltip */}
            <div
              className="absolute left-full ml-3 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-popover/95 backdrop-blur-sm border border-border text-popover-foreground text-sm rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg pointer-events-none"
            >
              {currentThemeData.name}
              <div className="absolute -left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-popover/95 border-l border-t border-border rotate-45" />
            </div>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side="right"
          align="center"
          sideOffset={16}
          className={cn(
            'w-64 p-2',
            'bg-card/95 backdrop-blur-xl',
            'border border-border/50',
            'shadow-2xl',
            'rounded-2xl'
          )}
        >
          <DropdownMenuLabel className="px-3 py-2 text-sm font-semibold text-foreground flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tema Enigma
          </DropdownMenuLabel>
          <DropdownMenuSeparator className="my-2" />

          <div className="space-y-1">
            {Object.entries(themeData).map(([themeKey, data]) => {
              const Icon = iconMap[data.icon as keyof typeof iconMap]
              const isActive = theme === themeKey
              const colors = themeColors[themeKey as keyof typeof themeColors]

              return (
                <DropdownMenuItem
                  key={themeKey}
                  onClick={() => setTheme(themeKey as typeof theme)}
                  className={cn(
                    'px-3 py-2.5 rounded-xl cursor-pointer',
                    'transition-all duration-200',
                    'flex items-center gap-3',
                    'focus:outline-none',
                    isActive
                      ? 'bg-primary/15 text-foreground shadow-sm'
                      : 'hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                  )}
                >
                  {/* Theme preview circle */}
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    'bg-gradient-to-br',
                    colors.gradient,
                    'ring-2',
                    isActive ? 'ring-primary/30' : 'ring-border/30',
                    'transition-all duration-200',
                    'group-hover:scale-105'
                  )}>
                    <Icon className="w-4 h-4" strokeWidth={2} />
                  </div>

                  {/* Theme info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{data.name}</div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {data.mode === 'dark' ? 'Oscuro' : 'Claro'}
                    </div>
                  </div>

                  {/* Active indicator */}
                  {isActive && (
                    <Check className="w-4 h-4 text-primary" strokeWidth={3} />
                  )}
                </DropdownMenuItem>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>

      {/* Mobile/Tablet Version - Below Hamburger */}
      <div className={cn(
        'fixed right-6 top-[5.5rem] z-50',
        'lg:hidden',
        'transition-all duration-500',
        className
      )}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                'relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg',
                'backdrop-blur-2xl',
                'transition-all duration-300',
                'border border-border/40',
                'bg-card/80 hover:bg-card/90 active:bg-card',
                'shadow-xl hover:shadow-2xl',
                'flex items-center justify-center',
                'active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-primary/20',
                'touch-manipulation'
              )}
              aria-label="Cambiar tema"
            >
              {/* Icon with gradient background */}
              <div className={cn(
                'w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center',
                'bg-gradient-to-br',
                themeColors[theme].gradient,
                'transition-all duration-300'
              )}>
                <CurrentIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground" strokeWidth={2} />
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            side="bottom"
            align="end"
            sideOffset={8}
            className={cn(
              'w-72 sm:w-80 p-2',
              'bg-card/95 backdrop-blur-xl',
              'border border-border/50',
              'shadow-2xl',
              'rounded-2xl',
              'max-h-[70vh] overflow-y-auto'
            )}
          >
            <DropdownMenuLabel className="px-3 py-2.5 text-sm sm:text-base font-semibold text-foreground flex items-center gap-2">
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
              Tema Enigma
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-2" />

            <div className="space-y-1">
              {Object.entries(themeData).map(([themeKey, data]) => {
                const Icon = iconMap[data.icon as keyof typeof iconMap]
                const isActive = theme === themeKey
                const colors = themeColors[themeKey as keyof typeof themeColors]

                return (
                  <DropdownMenuItem
                    key={themeKey}
                    onClick={() => setTheme(themeKey as typeof theme)}
                    className={cn(
                      'px-3 py-3 sm:py-3.5 rounded-xl cursor-pointer',
                      'transition-all duration-200',
                      'flex items-center gap-3',
                      'focus:outline-none',
                      'touch-manipulation',
                      'min-h-[52px] sm:min-h-[56px]',
                      isActive
                        ? 'bg-primary/15 text-foreground shadow-sm'
                        : 'hover:bg-muted/50 active:bg-muted/70 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {/* Theme preview circle */}
                    <div className={cn(
                      'w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      'bg-gradient-to-br',
                      colors.gradient,
                      'ring-2',
                      isActive ? 'ring-primary/30' : 'ring-border/30',
                      'transition-all duration-200'
                    )}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                    </div>

                    {/* Theme info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm sm:text-base">{data.name}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground capitalize">
                        {data.mode === 'dark' ? 'Oscuro' : 'Claro'}
                      </div>
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" strokeWidth={3} />
                    )}
                  </DropdownMenuItem>
                )
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  )
}
