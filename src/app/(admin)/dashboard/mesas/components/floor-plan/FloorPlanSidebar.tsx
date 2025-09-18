'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  ChevronDown,
  ChevronRight,
  Utensils,
  Coffee,
  DoorOpen,
  TreePine,
  Sofa,
  Monitor,
  Lightbulb,
  ShoppingCart,
  Users,
  MapPin,
  Plus,
  Move
} from 'lucide-react'
import { ElementType } from './utils/elementTypes'

// Element categories for organization
const ELEMENT_CATEGORIES = {
  tables: {
    label: 'Mesas y Asientos',
    icon: Utensils,
    elements: [
      { type: ElementType.TABLE, label: 'Mesa', icon: Utensils },
      { type: ElementType.CHAIR, label: 'Silla', icon: Users },
      { type: ElementType.BOOTH, label: 'Booth', icon: Sofa },
      { type: ElementType.BAR_STOOL, label: 'Taburete', icon: Coffee }
    ]
  },
  architecture: {
    label: 'Arquitectura',
    icon: DoorOpen,
    elements: [
      { type: ElementType.DOOR, label: 'Puerta', icon: DoorOpen },
      { type: ElementType.WALL, label: 'Pared', icon: MapPin },
      { type: ElementType.WINDOW, label: 'Ventana', icon: Monitor },
      { type: ElementType.COLUMN, label: 'Columna', icon: MapPin }
    ]
  },
  furniture: {
    label: 'Mobiliario',
    icon: Sofa,
    elements: [
      { type: ElementType.BAR, label: 'Barra', icon: Coffee },
      { type: ElementType.COUNTER, label: 'Mostrador', icon: ShoppingCart },
      { type: ElementType.SHELF, label: 'Estante', icon: MapPin },
      { type: ElementType.CABINET, label: 'Gabinete', icon: MapPin }
    ]
  },
  decoration: {
    label: 'Decoración',
    icon: TreePine,
    elements: [
      { type: ElementType.PLANT, label: 'Planta', icon: TreePine },
      { type: ElementType.ARTWORK, label: 'Arte', icon: MapPin },
      { type: ElementType.LIGHTING, label: 'Iluminación', icon: Lightbulb },
      { type: ElementType.MIRROR, label: 'Espejo', icon: Monitor }
    ]
  },
  zones: {
    label: 'Zonas y Marcadores',
    icon: MapPin,
    elements: [
      { type: ElementType.KITCHEN_AREA, label: 'Área Cocina', icon: Utensils },
      { type: ElementType.WAITING_AREA, label: 'Área Espera', icon: Users },
      { type: ElementType.ENTRANCE, label: 'Entrada', icon: DoorOpen },
      { type: ElementType.EXIT, label: 'Salida', icon: DoorOpen }
    ]
  }
} as const

interface DraggableElementProps {
  type: ElementType
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const DraggableElement = React.memo<DraggableElementProps>(({ type, label, icon: Icon }) => {
  const handleDragStart = React.useCallback((event: React.DragEvent) => {
    // Set the element type in the drag data
    event.dataTransfer.setData('application/reactflow-element', type)
    event.dataTransfer.setData('text/plain', label)
    event.dataTransfer.effectAllowed = 'copy'
  }, [type, label])

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="
        flex items-center gap-2 p-1.5 border border-border rounded-sm
        cursor-grab active:cursor-grabbing
        hover:bg-accent hover:border-accent-foreground/20
        transition-all duration-200
        select-none
      "
      title={`Arrastra para añadir: ${label}`}
    >
      <Icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
      <span className="text-xs font-medium truncate">{label}</span>
      <Plus className="w-2 h-2 text-muted-foreground ml-auto flex-shrink-0" />
    </div>
  )
})

DraggableElement.displayName = 'DraggableElement'

interface ElementCategoryProps {
  category: keyof typeof ELEMENT_CATEGORIES
  isOpen: boolean
  onToggle: () => void
}

const ElementCategory = React.memo<ElementCategoryProps>(({ category, isOpen, onToggle }) => {
  const { label, icon: CategoryIcon, elements } = ELEMENT_CATEGORIES[category]

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start h-auto p-2 hover:bg-accent"
        >
          <div className="flex items-center gap-2 w-full">
            <CategoryIcon className="w-3 h-3" />
            <span className="font-medium text-xs">{label}</span>
            <Badge variant="secondary" className="ml-auto text-xs px-1">
              {elements.length}
            </Badge>
            {isOpen ? (
              <ChevronDown className="w-3 h-3 ml-1" />
            ) : (
              <ChevronRight className="w-3 h-3 ml-1" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-1 px-2 pb-1">
        {elements.map((element) => (
          <DraggableElement
            key={element.type}
            type={element.type}
            label={element.label}
            icon={element.icon}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
})

ElementCategory.displayName = 'ElementCategory'

export const FloorPlanSidebar = React.memo(() => {
  // Track which categories are open
  const [openCategories, setOpenCategories] = useState<Set<string>>(
    new Set(['tables']) // Start with tables category open
  )

  const toggleCategory = React.useCallback((category: string) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }, [])

  return (
    <Card className="w-72 h-full max-h-[700px] overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Paleta
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Arrastra al plano
        </p>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto space-y-1 p-2">
        {Object.keys(ELEMENT_CATEGORIES).map((category, index) => (
          <React.Fragment key={category}>
            <ElementCategory
              category={category as keyof typeof ELEMENT_CATEGORIES}
              isOpen={openCategories.has(category)}
              onToggle={() => toggleCategory(category)}
            />
            {index < Object.keys(ELEMENT_CATEGORIES).length - 1 && (
              <Separator className="my-1" />
            )}
          </React.Fragment>
        ))}
      </CardContent>

      {/* Compact Usage Instructions */}
      <div className="px-2 pb-2 border-t">
        <div className="bg-muted/30 rounded p-2 text-xs text-muted-foreground mt-2">
          <div className="flex items-center gap-1">
            <Move className="w-3 h-3" />
            <span>Arrastra para añadir</span>
          </div>
        </div>
      </div>
    </Card>
  )
})

FloorPlanSidebar.displayName = 'FloorPlanSidebar'