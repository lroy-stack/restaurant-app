'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from '@/lib/utils'
import {
  Wheat,
  Milk,
  Egg,
  Fish,
  Nut,
  Soup,
  Shell,
  AlertTriangle,
  Leaf,
  Heart,
  Waves,
  Droplets,
  Flower2,
  Sprout,
  Sparkles
} from 'lucide-react'

interface Allergen {
  id: string
  name: string
  nameEn?: string
  icon?: string
  description?: string
}

interface AllergenBadgesProps {
  allergens: Allergen[]
  variant?: 'default' | 'outline' | 'secondary' | 'destructive'
  size?: 'sm' | 'default' | 'lg'
  showNames?: boolean
  maxVisible?: number
  className?: string
  language?: 'es' | 'en'
}

// EU-14 allergen icon mapping - COMPLETE MAPPING
const getAllergenIcon = (allergenName: string) => {
  const name = allergenName.toLowerCase()

  // Gluten
  if (name.includes('gluten') || name.includes('trigo') || name.includes('wheat')) {
    return Wheat
  }

  // Lácteos (ARREGLADO: incluye 'lácteos' con 's')
  if (name.includes('lácteos') || name.includes('lacteo') || name.includes('leche') || name.includes('milk') || name.includes('dairy')) {
    return Milk
  }

  // Huevos
  if (name.includes('huevos') || name.includes('huevo') || name.includes('eggs') || name.includes('egg')) {
    return Egg
  }

  // Pescado
  if (name.includes('pescado') || name.includes('fish')) {
    return Fish
  }

  // Frutos secos / Tree nuts (todos los tipos)
  if (name.includes('frutos secos') || name.includes('frutos de cáscara') || name.includes('tree nuts') || name.includes('nuts') || name.includes('almendra') || name.includes('nuez')) {
    return Nut
  }

  // Cacahuetes (diferente de frutos secos)
  if (name.includes('cacahuetes') || name.includes('cacahuete') || name.includes('peanuts') || name.includes('peanut')) {
    return Nut // Usar mismo icono que frutos secos pero es técnicamente diferente
  }

  // Soja
  if (name.includes('soja') || name.includes('soy')) {
    return Soup
  }

  // Crustáceos
  if (name.includes('crustáceos') || name.includes('crustaceo') || name.includes('crustaceans') || name.includes('shellfish')) {
    return Shell
  }

  // Moluscos (NUEVO)
  if (name.includes('moluscos') || name.includes('molusco') || name.includes('molluscs') || name.includes('mollusc')) {
    return Waves
  }

  // Apio (NUEVO)
  if (name.includes('apio') || name.includes('celery')) {
    return Leaf
  }

  // Mostaza (NUEVO)
  if (name.includes('mostaza') || name.includes('mustard')) {
    return Flower2
  }

  // Sésamo (NUEVO)
  if (name.includes('sésamo') || name.includes('sesame')) {
    return Sparkles
  }

  // Sulfitos (NUEVO)
  if (name.includes('sulfitos') || name.includes('sulphites') || name.includes('sulfites')) {
    return Droplets
  }

  // Altramuces / Lupin (NUEVO)
  if (name.includes('altramuces') || name.includes('altramuz') || name.includes('lupin')) {
    return Sprout
  }

  // Default solo para casos no contemplados
  return AlertTriangle
}

// Simple allergen name tooltip for identification
const getAllergenName = (allergen: Allergen, language: 'es' | 'en'): string => {
  return language === 'en' && allergen.nameEn ? allergen.nameEn : allergen.name
}

// Dynamic allergen colors using OKLCH variations from Enigma design system
const getDynamicAllergenColor = (allergenId: string): string => {
  // Hash function for consistent color assignment
  let hash = 0
  for (let i = 0; i < allergenId.length; i++) {
    const char = allergenId.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }

  // ENIGMA OKLCH EXPANDED PALETTE - Rich variations
  const enigmaPalette = [
    // Atlantic Blue variations (hue 200)
    'bg-[oklch(0.9_0.05_200)] text-[oklch(0.3_0.15_200)] border-[oklch(0.85_0.08_200)] dark:bg-[oklch(0.25_0.1_200)] dark:text-[oklch(0.8_0.12_200)] dark:border-[oklch(0.35_0.12_200)]',
    'bg-[oklch(0.88_0.08_210)] text-[oklch(0.25_0.18_210)] border-[oklch(0.8_0.12_210)] dark:bg-[oklch(0.22_0.12_210)] dark:text-[oklch(0.85_0.15_210)] dark:border-[oklch(0.32_0.15_210)]',

    // Sage Green variations (hue 125)
    'bg-[oklch(0.92_0.06_125)] text-[oklch(0.28_0.12_125)] border-[oklch(0.87_0.08_125)] dark:bg-[oklch(0.24_0.08_125)] dark:text-[oklch(0.82_0.1_125)] dark:border-[oklch(0.34_0.1_125)]',
    'bg-[oklch(0.9_0.08_135)] text-[oklch(0.26_0.15_135)] border-[oklch(0.85_0.1_135)] dark:bg-[oklch(0.23_0.1_135)] dark:text-[oklch(0.8_0.12_135)] dark:border-[oklch(0.33_0.12_135)]',

    // Burnt Orange variations (hue 42)
    'bg-[oklch(0.91_0.1_42)] text-[oklch(0.3_0.16_42)] border-[oklch(0.86_0.12_42)] dark:bg-[oklch(0.26_0.12_42)] dark:text-[oklch(0.83_0.14_42)] dark:border-[oklch(0.36_0.14_42)]',
    'bg-[oklch(0.89_0.12_35)] text-[oklch(0.28_0.18_35)] border-[oklch(0.84_0.14_35)] dark:bg-[oklch(0.24_0.14_35)] dark:text-[oklch(0.81_0.16_35)] dark:border-[oklch(0.34_0.16_35)]',

    // Expanded warm tones
    'bg-[oklch(0.93_0.08_60)] text-[oklch(0.32_0.15_60)] border-[oklch(0.88_0.1_60)] dark:bg-[oklch(0.27_0.1_60)] dark:text-[oklch(0.84_0.12_60)] dark:border-[oklch(0.37_0.12_60)]',
    'bg-[oklch(0.91_0.1_80)] text-[oklch(0.29_0.18_80)] border-[oklch(0.86_0.12_80)] dark:bg-[oklch(0.25_0.12_80)] dark:text-[oklch(0.82_0.14_80)] dark:border-[oklch(0.35_0.14_80)]',

    // Cool tone variations
    'bg-[oklch(0.9_0.07_180)] text-[oklch(0.27_0.16_180)] border-[oklch(0.85_0.09_180)] dark:bg-[oklch(0.23_0.11_180)] dark:text-[oklch(0.83_0.13_180)] dark:border-[oklch(0.33_0.13_180)]',
    'bg-[oklch(0.88_0.09_220)] text-[oklch(0.25_0.17_220)] border-[oklch(0.83_0.11_220)] dark:bg-[oklch(0.21_0.13_220)] dark:text-[oklch(0.81_0.15_220)] dark:border-[oklch(0.31_0.15_220)]',

    // Purple/Violet spectrum
    'bg-[oklch(0.89_0.11_280)] text-[oklch(0.28_0.19_280)] border-[oklch(0.84_0.13_280)] dark:bg-[oklch(0.24_0.15_280)] dark:text-[oklch(0.82_0.17_280)] dark:border-[oklch(0.34_0.17_280)]',
    'bg-[oklch(0.91_0.09_300)] text-[oklch(0.3_0.16_300)] border-[oklch(0.86_0.11_300)] dark:bg-[oklch(0.26_0.13_300)] dark:text-[oklch(0.84_0.15_300)] dark:border-[oklch(0.36_0.15_300)]',

    // Additional earth tones
    'bg-[oklch(0.92_0.05_90)] text-[oklch(0.31_0.12_90)] border-[oklch(0.87_0.07_90)] dark:bg-[oklch(0.25_0.09_90)] dark:text-[oklch(0.85_0.11_90)] dark:border-[oklch(0.35_0.11_90)]',
    'bg-[oklch(0.9_0.06_110)] text-[oklch(0.29_0.14_110)] border-[oklch(0.85_0.08_110)] dark:bg-[oklch(0.24_0.1_110)] dark:text-[oklch(0.83_0.12_110)] dark:border-[oklch(0.34_0.12_110)]'
  ]

  const colorIndex = Math.abs(hash) % enigmaPalette.length
  return enigmaPalette[colorIndex]
}

export function AllergenBadges({
  allergens,
  variant = 'outline',
  size = 'sm',
  showNames = true,
  maxVisible = 5,
  className = '',
  language = 'es'
}: AllergenBadgesProps) {
  if (!allergens || allergens.length === 0) {
    return null
  }

  const visibleAllergens = allergens.slice(0, maxVisible)
  const hiddenCount = allergens.length - maxVisible

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {visibleAllergens.map((allergen) => {
        const IconComponent = getAllergenIcon(allergen.name)

        // For dynamic colors, bypass shadcn variant system
        const useDynamicColors = variant === 'default'

        if (useDynamicColors) {
          // Use Tooltip for proper hover behavior
          return (
            <Tooltip key={allergen.id}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md border font-semibold transition-colors cursor-default",
                    size === 'sm' ? 'px-1.5 py-0.5 text-xs' :
                    size === 'lg' ? 'px-3 py-1 text-sm' :
                    'px-2 py-0.5 text-xs',
                    getDynamicAllergenColor(allergen.id)
                  )}
                >
                  <IconComponent className={`${
                    size === 'sm' ? 'w-3 h-3' :
                    size === 'lg' ? 'w-4 h-4' :
                    'w-3 h-3'
                  } flex-shrink-0`} />
                  {showNames && (
                    <span className="truncate max-w-[80px]">
                      {language === 'en' && allergen.nameEn ? allergen.nameEn : allergen.name}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{getAllergenName(allergen, language)}</p>
              </TooltipContent>
            </Tooltip>
          )
        }

        return (
          <Tooltip key={allergen.id}>
            <TooltipTrigger asChild>
              <Badge
                variant={variant}
                className={cn(
                  "inline-flex items-center gap-1",
                  size === 'sm' ? 'px-1.5 py-0.5 text-xs' :
                  size === 'lg' ? 'px-3 py-1 text-sm' :
                  'px-2 py-0.5 text-xs'
                )}
              >
                <IconComponent className={`${
                  size === 'sm' ? 'w-3 h-3' :
                  size === 'lg' ? 'w-4 h-4' :
                  'w-3 h-3'
                } flex-shrink-0`} />
                {showNames && (
                  <span className="truncate max-w-[80px]">
                    {language === 'en' && allergen.nameEn ? allergen.nameEn : allergen.name}
                  </span>
                )}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getAllergenName(allergen, language)}</p>
            </TooltipContent>
          </Tooltip>
        )
      })}

      {hiddenCount > 0 && (
        <Badge
          variant="outline"
          className={`${
            size === 'sm' ? 'px-1.5 py-0.5 text-xs' :
            size === 'lg' ? 'px-3 py-1 text-sm' :
            'px-2 py-0.5 text-xs'
          }`}
          title={`${hiddenCount} alérgeno${hiddenCount > 1 ? 's' : ''} más`}
        >
          +{hiddenCount}
        </Badge>
      )}
    </div>
  )
}

// Dietary restriction badges (vegetarian, vegan, gluten-free)
interface DietaryBadgesProps {
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  size?: 'sm' | 'default' | 'lg'
  className?: string
  language?: 'es' | 'en'
}

export function DietaryBadges({
  isVegetarian,
  isVegan,
  isGlutenFree,
  size = 'sm',
  className = '',
  language = 'es'
}: DietaryBadgesProps) {
  const badges = []

  if (isVegan) {
    badges.push(
      <Tooltip key="vegan">
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1 rounded-md border font-semibold bg-[#9FB289]/10 text-[#9FB289] border-[#9FB289]/30 dark:bg-[#9FB289]/20 dark:text-[#9FB289] dark:border-[#9FB289]/40 cursor-default ${
              size === 'sm' ? 'px-1.5 py-0.5 text-xs' :
              size === 'lg' ? 'px-3 py-1 text-sm' :
              'px-2 py-0.5 text-xs'
            }`}
          >
            <Heart className={`${
              size === 'sm' ? 'w-3 h-3' :
              size === 'lg' ? 'w-4 h-4' :
              'w-3 h-3'
            } flex-shrink-0`} />
            {language === 'en' ? 'Vegan' : 'Vegano'}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{language === 'en' ? 'Vegan Product' : 'Producto Vegano'}</p>
        </TooltipContent>
      </Tooltip>
    )
  } else if (isVegetarian) {
    badges.push(
      <Tooltip key="vegetarian">
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1 rounded-md border font-semibold bg-[#9FB289]/10 text-[#9FB289] border-[#9FB289]/30 dark:bg-[#9FB289]/20 dark:text-[#9FB289] dark:border-[#9FB289]/40 cursor-default ${
              size === 'sm' ? 'px-1.5 py-0.5 text-xs' :
              size === 'lg' ? 'px-3 py-1 text-sm' :
              'px-2 py-0.5 text-xs'
            }`}
          >
            <Leaf className={`${
              size === 'sm' ? 'w-3 h-3' :
              size === 'lg' ? 'w-4 h-4' :
              'w-3 h-3'
            } flex-shrink-0`} />
            {language === 'en' ? 'Vegetarian' : 'Vegetariano'}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{language === 'en' ? 'Vegetarian Product' : 'Producto Vegetariano'}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  if (isGlutenFree) {
    badges.push(
      <Tooltip key="gluten-free">
        <TooltipTrigger asChild>
          <div
            className={`inline-flex items-center gap-1 rounded-md border font-semibold bg-[#237584]/10 text-[#237584] border-[#237584]/30 dark:bg-[#237584]/20 dark:text-[#237584] dark:border-[#237584]/40 cursor-default ${
              size === 'sm' ? 'px-1.5 py-0.5 text-xs' :
              size === 'lg' ? 'px-3 py-1 text-sm' :
              'px-2 py-0.5 text-xs'
            }`}
          >
            <Wheat className={`${
              size === 'sm' ? 'w-3 h-3' :
              size === 'lg' ? 'w-4 h-4' :
              'w-3 h-3'
            } flex-shrink-0 line-through`} />
            {language === 'en' ? 'Gluten Free' : 'Sin Gluten'}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{language === 'en' ? 'Gluten Free Product' : 'Producto Sin Gluten'}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  if (badges.length === 0) {
    return null
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {badges}
    </div>
  )
}

// Combined allergen and dietary information component
interface AllergenInfoProps extends AllergenBadgesProps, DietaryBadgesProps {
  layout?: 'inline' | 'stacked'
}

export function AllergenInfo({
  allergens,
  isVegetarian,
  isVegan,
  isGlutenFree,
  variant = 'outline',
  size = 'sm',
  showNames = true,
  maxVisible = 3,
  layout = 'inline',
  className = '',
  language = 'es'
}: AllergenInfoProps) {
  // ALWAYS filter out gluten allergen - we'll show "Sin Gluten" badge instead when isGlutenFree=true
  const filteredAllergens = allergens?.filter(allergen => {
    // Remove Gluten allergen - use dietary badge instead
    if (allergen.name === 'Gluten' || allergen.nameEn === 'Gluten') {
      return false
    }
    return true
  }) || []

  const hasAllergens = filteredAllergens && filteredAllergens.length > 0
  const hasDietaryInfo = isVegetarian || isVegan || isGlutenFree

  if (!hasAllergens && !hasDietaryInfo) {
    return null
  }

  if (layout === 'stacked') {
    return (
      <TooltipProvider>
        <div className={`space-y-2 ${className}`}>
          {hasDietaryInfo && (
            <DietaryBadges
              isVegetarian={isVegetarian}
              isVegan={isVegan}
              isGlutenFree={isGlutenFree}
              size={size}
              language={language}
            />
          )}
          {hasAllergens && (
            <AllergenBadges
              allergens={filteredAllergens}
              variant={variant}
              size={size}
              showNames={showNames}
              maxVisible={maxVisible}
              language={language}
            />
          )}
        </div>
      </TooltipProvider>
    )
  }

  return (
    <TooltipProvider>
      <div className={`flex flex-wrap gap-1 ${className}`}>
        <DietaryBadges
          isVegetarian={isVegetarian}
          isVegan={isVegan}
          isGlutenFree={isGlutenFree}
          size={size}
          language={language}
        />
        {hasAllergens && (
          <AllergenBadges
            allergens={filteredAllergens}
            variant={variant}
            size={size}
            showNames={showNames}
            maxVisible={maxVisible}
            language={language}
          />
        )}
      </div>
    </TooltipProvider>
  )
}