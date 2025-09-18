// components/legal/LegalPageLayout/TableOfContents.tsx
// Table of Contents Component for Legal Documents
// PRP Implementation: Navigation for long legal documents

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown } from 'lucide-react'
import type { Language } from '@/types/legal'

// ============================================
// COMPONENT INTERFACES
// ============================================

interface TableOfContentsProps {
  sections: ContentSection[]
  language: Language
  className?: string
}

interface ContentSection {
  id?: string
  title: string
  level?: number
  content?: string
  subsections?: ContentSection[]
}

interface TOCItem {
  id: string
  title: string
  level: number
  children: TOCItem[]
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TableOfContents({
  sections,
  language,
  className
}: TableOfContentsProps) {
  const [activeSection, setActiveSection] = useState<string>('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  // Convert sections to TOC items with proper IDs
  const tocItems = convertSectionsToTOC(sections)

  // Handle scroll spy to highlight active section
  useEffect(() => {
    const handleScroll = () => {
      const sectionElements = tocItems.map(item => ({
        id: item.id,
        element: document.getElementById(item.id)
      })).filter(item => item.element)

      let currentActiveSection = ''
      const scrollPosition = window.scrollY + 100 // Offset for header

      for (const { id, element } of sectionElements) {
        if (element && element.offsetTop <= scrollPosition) {
          currentActiveSection = id
        }
      }

      setActiveSection(currentActiveSection)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // Initial check

    return () => window.removeEventListener('scroll', handleScroll)
  }, [tocItems])

  // Handle section expansion toggle
  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80 // Account for fixed header
      const elementPosition = element.offsetTop - headerOffset

      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  if (tocItems.length === 0) {
    return (
      <div className={cn("text-center text-muted-foreground text-sm py-4", className)}>
        {language === 'es'
          ? 'No hay secciones disponibles'
          : 'No sections available'
        }
      </div>
    )
  }

  return (
    <div className={cn("w-full max-h-[400px] overflow-y-auto", className)}>
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <TOCItemComponent
            key={item.id}
            item={item}
            activeSection={activeSection}
            expandedSections={expandedSections}
            onToggle={toggleSection}
            onNavigate={scrollToSection}
            language={language}
          />
        ))}
      </nav>
    </div>
  )
}

// ============================================
// TOC ITEM COMPONENT
// ============================================

interface TOCItemComponentProps {
  item: TOCItem
  activeSection: string
  expandedSections: Set<string>
  onToggle: (sectionId: string) => void
  onNavigate: (sectionId: string) => void
  language: Language
}

function TOCItemComponent({
  item,
  activeSection,
  expandedSections,
  onToggle,
  onNavigate,
  language
}: TOCItemComponentProps) {
  const isActive = activeSection === item.id
  const isExpanded = expandedSections.has(item.id)
  const hasChildren = item.children.length > 0

  return (
    <div>
      <div className="flex items-center">
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 mr-1"
            onClick={() => onToggle(item.id)}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "!justify-start !items-start h-auto py-2 pl-0 pr-2 !text-left font-normal text-xs w-full",
            isActive && "bg-primary/10 text-primary font-medium",
            !hasChildren && "ml-7"
          )}
          onClick={() => onNavigate(item.id)}
        >
          <span className="block text-left w-full whitespace-normal leading-relaxed">{item.title}</span>
        </Button>
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-2 border-l border-border pl-1 mt-1">
          {item.children.map((child) => (
            <TOCItemComponent
              key={child.id}
              item={child}
              activeSection={activeSection}
              expandedSections={expandedSections}
              onToggle={onToggle}
              onNavigate={onNavigate}
              language={language}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function convertSectionsToTOC(sections: ContentSection[]): TOCItem[] {
  return sections.map((section, index) => {
    // Generate ID from title if not provided
    const id = section.id || generateSectionId(section.title, index)

    const tocItem: TOCItem = {
      id,
      title: section.title,
      level: section.level || 1,
      children: []
    }

    // Recursively process subsections
    if (section.subsections && section.subsections.length > 0) {
      tocItem.children = convertSectionsToTOC(section.subsections)
    }

    return tocItem
  })
}

function generateSectionId(title: string, index: number): string {
  // Create a URL-friendly ID from the title
  const baseId = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()

  return `section-${index}-${baseId}`
}

// ============================================
// CONTENT PROCESSING HELPERS
// ============================================

export function processContentForTOC(content: any): ContentSection[] {
  if (!content || !content.sections) {
    return []
  }

  return content.sections.map((section: any, index: number) => ({
    id: section.id || generateSectionId(section.title || `Section ${index + 1}`, index),
    title: section.title || `Section ${index + 1}`,
    level: section.level || 1,
    content: section.content,
    subsections: section.subsections || []
  }))
}

export default TableOfContents