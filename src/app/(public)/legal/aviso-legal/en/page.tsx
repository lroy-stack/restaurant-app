// app/(public)/legal/aviso-legal/en/page.tsx
// Legal Notice Page (English) - Database-driven Dynamic Content
// PRP Implementation: GDPR/AEPD 2025 Compliant Legal Notice

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LegalPageLayout, generateLegalPageMetadata } from '@/components/legal/LegalPageLayout'
import { createLegalContentService } from '@/lib/services/legal/legalContentService'
import { processContentForTOC } from '@/lib/utils/legal-content'

// ============================================
// METADATA GENERATION
// ============================================

export async function generateMetadata(): Promise<Metadata> {
  try {
    const legalService = await createLegalContentService()
    const content = await legalService.getActiveContent('legal_notice', 'en')

    if (!content) {
      return {
        title: 'Legal Notice - Enigma Cocina Con Alma',
        description: 'Legal notice of Enigma Cocina Con Alma - Legal information and identification data of the restaurant in Calpe.'
      }
    }

    return generateLegalPageMetadata(content, 'en')
  } catch (error) {
    console.error('Error generating metadata for legal notice:', error)
    return {
      title: 'Legal Notice - Enigma Cocina Con Alma',
      description: 'Legal notice of Enigma Cocina Con Alma - Legal information and identification data of the restaurant in Calpe.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function LegalNoticePage() {
  try {
    const legalService = await createLegalContentService()

    // Fetch legal content from database
    const content = await legalService.getActiveContent('legal_notice', 'en')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'legal_notice',
      'en',
      '127.0.0.1', // Server-side, would need middleware for real IP
      'Next.js SSR'
    )

    // Process content sections for TOC
    const sections = processContentForTOC(content.content)

    return (
      <LegalPageLayout
        content={content}
        language="en"
        showTableOfContents={sections.length > 0}
        showVersionSelector={true}
        showPrintButton={true}
        backUrl="/en"
      >
        <LegalNoticeContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading legal notice page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface LegalNoticeContentProps {
  content: any
}

function LegalNoticeContent({ content }: LegalNoticeContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default legal notice
  if (sections.length === 0) {
    return <DefaultLegalNoticeContent />
  }

  return (
    <div className="legal-content space-y-6">
      {sections.map((section: any, index: number) => (
        <section
          key={section.id || `section-${index}`}
          id={section.id || `section-${index}`}
          className="scroll-mt-20"
        >
          <h2 className="enigma-section-title mb-4">
            {section.title}
          </h2>

          <div
            className="prose prose-sm max-w-none text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: section.content || section.text || ''
            }}
          />

          {/* Render subsections if they exist */}
          {section.subsections && section.subsections.length > 0 && (
            <div className="mt-4 ml-4 space-y-4">
              {section.subsections.map((subsection: any, subIndex: number) => (
                <div
                  key={subsection.id || `subsection-${index}-${subIndex}`}
                  id={subsection.id || `subsection-${index}-${subIndex}`}
                  className="scroll-mt-20"
                >
                  <h3 className="enigma-subsection-title mb-2">
                    {subsection.title}
                  </h3>
                  <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: subsection.content || subsection.text || ''
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  )
}

// ============================================
// DEFAULT CONTENT (FALLBACK)
// ============================================

function DefaultLegalNoticeContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="identification-data" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Identification Data
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            In compliance with Law 34/2002, of July 11, on Information Society Services and Electronic Commerce, the following data is provided:
          </p>
          <ul>
            <li><strong>Company name:</strong> Enigma Cocina Con Alma</li>
            <li><strong>Registered address:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, Spain</li>
            <li><strong>Phone:</strong> +34 672 79 60 06</li>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Website:</strong> enigmaconalma.com</li>
          </ul>
        </div>
      </section>

      <section id="purpose-conditions" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Purpose and Conditions of Use
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            This website aims to provide information about the services offered by Enigma Cocina Con Alma, as well as to enable online reservations.
          </p>
          <p>
            Access to and use of this website grants the user status and implies full acceptance of all conditions included in this Legal Notice.
          </p>
        </div>
      </section>

      <section id="responsibilities" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Responsibilities
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            The user undertakes to make appropriate use of the contents and services offered through the website and not to use them for:
          </p>
          <ul>
            <li>Engaging in illicit, illegal activities or those contrary to good faith and public order</li>
            <li>Disseminating content or propaganda of a racist, xenophobic, illegal-pornographic nature or promoting terrorism</li>
            <li>Causing damage to the physical and logical systems of the establishment, its suppliers or third parties</li>
            <li>Introducing or disseminating computer viruses or any other physical or logical systems that may cause damage</li>
          </ul>
        </div>
      </section>

      <section id="intellectual-property" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Intellectual and Industrial Property
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Enigma Cocina Con Alma owns all intellectual and industrial property rights to its website, as well as the elements contained therein (including, but not limited to, images, sound, audio, video, software or texts; trademarks or logos, color combinations, structure and design, selection of materials used, computer programs necessary for its operation, access and use, etc.).
          </p>
          <p>
            All rights reserved. By virtue of the provisions of articles 8 and 32.1, second paragraph, of the Intellectual Property Law, the reproduction, distribution and public communication, including its modality of making available, of all or part of the contents of this website, for commercial purposes, in any support and by any technical means, without the authorization of Enigma Cocina Con Alma, are expressly prohibited.
          </p>
        </div>
      </section>

      <section id="applicable-law" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Applicable Law and Jurisdiction
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            These conditions are governed by Spanish legislation. For the resolution of any controversy that may arise from access to or use of the website, Enigma Cocina Con Alma and the user submit to the courts and tribunals of the user's domicile.
          </p>
          <p>
            In the event that the user has their domicile outside of Spain, Enigma Cocina Con Alma and the user submit, with express waiver of any other jurisdiction, to the courts and tribunals of Alicante (Spain).
          </p>
        </div>
      </section>

      <section id="legal-contact" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contact for Legal Matters
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            For any questions regarding this legal notice, you can contact us through:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Phone:</strong> +34 672 79 60 06</li>
            <li><strong>Postal address:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, Spain</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

