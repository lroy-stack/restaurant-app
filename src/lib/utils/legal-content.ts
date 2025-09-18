// lib/utils/legal-content.ts
// Legal Content Utilities - Server-side processing functions
// PRP Implementation: Content processing for legal pages

interface ContentSection {
  id?: string
  title: string
  level?: number
  content?: string
  subsections?: ContentSection[]
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

/**
 * Process legal content for Table of Contents generation
 * Server-side utility function for content structure processing
 */
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

export type { ContentSection }