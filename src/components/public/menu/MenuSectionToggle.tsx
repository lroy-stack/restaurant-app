'use client'

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface MenuSection {
  key: string
  label: string
  labelEn?: string
  count: number
}

interface MenuSectionToggleProps {
  sections: MenuSection[]
  activeSection: string
  onSectionChange: (section: string) => void
  language?: 'es' | 'en'
  className?: string
}

export function MenuSectionToggle({
  sections,
  activeSection,
  onSectionChange,
  language = 'es',
  className
}: MenuSectionToggleProps) {
  const getDisplayLabel = (section: MenuSection) => {
    return language === 'en' && section.labelEn ? section.labelEn : section.label
  }

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Tabs value={activeSection} onValueChange={onSectionChange}>
        <TabsList className="grid w-full grid-cols-3">
          {sections.map((section) => (
            <TabsTrigger key={section.key} value={section.key}>
              {getDisplayLabel(section)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </div>
  )
}

export default MenuSectionToggle