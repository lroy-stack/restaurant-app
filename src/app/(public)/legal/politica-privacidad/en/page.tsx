// app/(public)/legal/politica-privacidad/en/page.tsx
// Privacy Policy Page (English) - Database-driven GDPR Compliant
// PRP Implementation: Complete GDPR/AEPD 2025 Privacy Policy

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
    const content = await legalService.getActiveContent('privacy_policy', 'en')

    if (!content) {
      return {
        title: 'Privacy Policy - Enigma Cocina Con Alma',
        description: 'Privacy policy of Enigma Cocina Con Alma - Information about personal data processing according to GDPR and AEPD 2025.'
      }
    }

    return generateLegalPageMetadata(content, 'en')
  } catch (error) {
    console.error('Error generating metadata for privacy policy:', error)
    return {
      title: 'Privacy Policy - Enigma Cocina Con Alma',
      description: 'Privacy policy of Enigma Cocina Con Alma - Information about personal data processing according to GDPR and AEPD 2025.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function PrivacyPolicyPage() {
  try {
    const legalService = await createLegalContentService()
    // Fetch privacy policy content from database
    const content = await legalService.getActiveContent('privacy_policy', 'en')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'privacy_policy',
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
        <PrivacyPolicyContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading privacy policy page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface PrivacyPolicyContentProps {
  content: any
}

function PrivacyPolicyContent({ content }: PrivacyPolicyContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default privacy policy
  if (sections.length === 0) {
    return <DefaultPrivacyPolicyContent />
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
// DEFAULT CONTENT (GDPR COMPLIANT FALLBACK)
// ============================================

function DefaultPrivacyPolicyContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="general-information" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          General Information
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            In compliance with the General Data Protection Regulation (GDPR) and Organic Law 3/2018, of December 5, on the Protection of Personal Data and guarantee of digital rights (LOPDGDD), we inform you about the processing of your personal data.
          </p>
          <p>
            <strong>Data Controller:</strong><br />
            Enigma Cocina Con Alma<br />
            Carrer Justicia 6A, 03710 Calpe, Alicante, Spain<br />
            Email: reservas@enigmaconalma.com<br />
            Phone: +34 672 79 60 06
          </p>
        </div>
      </section>

      <section id="personal-data-collected" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Personal Data Collected
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We collect the following types of personal data:
          </p>
          <ul>
            <li><strong>Identification data:</strong> Name, surname, email, phone</li>
            <li><strong>Reservation data:</strong> Date, time, number of diners, dietary preferences</li>
            <li><strong>Technical data:</strong> IP address, browser type, device used</li>
            <li><strong>Cookie data:</strong> Cookie preferences, browsing analysis</li>
            <li><strong>Communication data:</strong> Inquiries, comments, reviews</li>
          </ul>
        </div>
      </section>

      <section id="processing-purposes" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Processing Purposes
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We process your personal data for the following purposes:
          </p>
          <ul>
            <li><strong>Reservation management:</strong> Process and confirm your table reservations</li>
            <li><strong>Customer service:</strong> Respond to inquiries and provide support</li>
            <li><strong>Commercial communications:</strong> Sending offers and promotions (with your consent)</li>
            <li><strong>Service improvement:</strong> Satisfaction analysis and experience enhancement</li>
            <li><strong>Legal compliance:</strong> Tax and food safety obligations</li>
            <li><strong>Security:</strong> Fraud prevention and system protection</li>
          </ul>
        </div>
      </section>

      <section id="legal-basis" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Legal Basis for Processing
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            The processing of your data is based on:
          </p>
          <ul>
            <li><strong>Consent (Art. 6.1.a GDPR):</strong> For commercial communications and non-essential cookies</li>
            <li><strong>Contract performance (Art. 6.1.b GDPR):</strong> To manage reservations and service provision</li>
            <li><strong>Legitimate interest (Art. 6.1.f GDPR):</strong> For service improvement and security</li>
            <li><strong>Legal obligation (Art. 6.1.c GDPR):</strong> For compliance with tax obligations</li>
          </ul>
        </div>
      </section>

      <section id="data-recipients" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Data Recipients
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Your data may be communicated to:
          </p>
          <ul>
            <li><strong>Technical service providers:</strong> Hosting, web maintenance, reservation systems</li>
            <li><strong>Public administrations:</strong> When legally required</li>
            <li><strong>Financial entities:</strong> For payment processing</li>
            <li><strong>Analytics services:</strong> Google Analytics (with anonymized data)</li>
          </ul>
          <p>
            All our providers comply with data protection guarantees and have signed data processing agreements.
          </p>
        </div>
      </section>

      <section id="international-transfers" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          International Transfers
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Some of our service providers may process data outside the European Economic Area. In these cases, we ensure that appropriate safeguards are implemented through:
          </p>
          <ul>
            <li>European Commission adequacy decisions</li>
            <li>Standard contractual clauses approved by the Commission</li>
            <li>Approved codes of conduct and certifications</li>
          </ul>
        </div>
      </section>

      <section id="data-retention" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Data Retention
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We retain your personal data for the following periods:
          </p>
          <ul>
            <li><strong>Reservation data:</strong> 5 years (tax obligations)</li>
            <li><strong>Cookie consents:</strong> Maximum 24 months (AEPD 2025)</li>
            <li><strong>Commercial communications:</strong> Until consent withdrawal</li>
            <li><strong>Contact data:</strong> Until deletion request</li>
            <li><strong>Security logs:</strong> 2 years</li>
          </ul>
        </div>
      </section>

      <section id="data-subject-rights" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Your Rights as Data Subject
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            You have the right to:
          </p>
          <ul>
            <li><strong>Access (Art. 15 GDPR):</strong> Obtain information about the processing of your data</li>
            <li><strong>Rectification (Art. 16 GDPR):</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure (Art. 17 GDPR):</strong> Request deletion of your data</li>
            <li><strong>Restriction (Art. 18 GDPR):</strong> Restrict processing in certain cases</li>
            <li><strong>Portability (Art. 20 GDPR):</strong> Receive your data in structured format</li>
            <li><strong>Object (Art. 21 GDPR):</strong> Object to processing for personal reasons</li>
            <li><strong>Withdraw consent:</strong> Withdraw consent at any time</li>
          </ul>
          <p>
            To exercise these rights, you can contact us at <strong>reservas@enigmaconalma.com</strong> or use our <a href="/en/legal/gdpr-rights" className="text-primary hover:underline">GDPR rights form</a>.
          </p>
        </div>
      </section>

      <section id="cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Cookie Policy
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We use cookies and similar technologies in accordance with AEPD 2025 guidelines. For detailed information about cookie usage, please see our <a href="/en/legal/cookie-policy" className="text-primary hover:underline">Cookie Policy</a>.
          </p>
          <p>
            You can manage your cookie preferences at any time through the consent banner or in your browser settings.
          </p>
        </div>
      </section>

      <section id="security-measures" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Security Measures
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against:
          </p>
          <ul>
            <li>Unauthorized access</li>
            <li>Accidental alteration, loss or destruction</li>
            <li>Unauthorized transfer, disclosure or access</li>
          </ul>
          <p>
            These measures include data encryption, access control, regular backups and staff training.
          </p>
        </div>
      </section>

      <section id="minors" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Protection of Minors
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Our services are not directed to minors under 14 years of age. We do not knowingly collect personal data from minors without verifiable parental or legal guardian consent.
          </p>
          <p>
            If you become aware that a minor has provided personal data, please contact us to proceed with its deletion.
          </p>
        </div>
      </section>

      <section id="supervisory-authority" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Supervisory Authority
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            You have the right to lodge a complaint with the Spanish Data Protection Agency (AEPD) if you consider that the processing of your data does not comply with regulations:
          </p>
          <p>
            <strong>Spanish Data Protection Agency</strong><br />
            C/ Jorge Juan, 6, 28001 Madrid<br />
            Phone: 901 100 099 / 912 663 517<br />
            Web: <a href="https://www.aepd.es" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aepd.es</a>
          </p>
        </div>
      </section>

      <section id="policy-modifications" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Policy Modifications
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            This privacy policy may be modified to adapt to regulatory changes or in our services. Modifications will be communicated through our website at least 30 days in advance.
          </p>
          <p>
            We recommend that you periodically review this policy to stay informed about how we protect your data.
          </p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contact
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            For any inquiries about this privacy policy or the processing of your personal data:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Phone:</strong> +34 672 79 60 06</li>
            <li><strong>Address:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, Spain</li>
            <li><strong>GDPR Form:</strong> <a href="/en/legal/gdpr-rights" className="text-primary hover:underline">Exercise rights</a></li>
          </ul>
        </div>
      </section>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export { DefaultPrivacyPolicyContent }