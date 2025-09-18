// app/(public)/legal/derechos-gdpr/en/page.tsx
// GDPR Rights Page (English) - Database-driven GDPR Rights Management
// PRP Implementation: Complete GDPR Rights Request System

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
    const content = await legalService.getActiveContent('gdpr_rights', 'en')

    if (!content) {
      return {
        title: 'GDPR Rights - Enigma Cocina Con Alma',
        description: 'Exercise your GDPR rights at Enigma Cocina Con Alma - Access, rectification, erasure, portability and other data protection rights.'
      }
    }

    return generateLegalPageMetadata(content, 'en')
  } catch (error) {
    console.error('Error generating metadata for GDPR rights:', error)
    return {
      title: 'GDPR Rights - Enigma Cocina Con Alma',
      description: 'Exercise your GDPR rights at Enigma Cocina Con Alma - Access, rectification, erasure, portability and other data protection rights.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function GdprRightsPage() {
  try {
    const legalService = await createLegalContentService()

    // Fetch GDPR rights content from database
    const content = await legalService.getActiveContent('gdpr_rights', 'en')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'gdpr_rights',
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
        <GdprRightsContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading GDPR rights page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface GdprRightsContentProps {
  content: any
}

function GdprRightsContent({ content }: GdprRightsContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default GDPR rights
  if (sections.length === 0) {
    return <DefaultGdprRightsContent />
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

function DefaultGdprRightsContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="introduction" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Your Data Protection Rights
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Under the General Data Protection Regulation (GDPR) and Spanish data protection laws, you have several rights regarding your personal data. This page explains these rights and how to exercise them at Enigma Cocina Con Alma.
          </p>
          <p>
            We are committed to protecting your privacy and ensuring you have full control over your personal information. All requests are processed within the legal timeframes and according to GDPR requirements.
          </p>
        </div>
      </section>

      <section id="right-to-access" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Right to Access (Article 15 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            You have the right to obtain confirmation whether we process your personal data and, if so, to access that data along with specific information about the processing.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">What information can you request?</h3>
          <ul>
            <li>Categories of personal data we process</li>
            <li>Purposes of processing</li>
            <li>Recipients or categories of recipients</li>
            <li>Retention period or criteria</li>
            <li>Your other GDPR rights</li>
            <li>Source of data if not collected from you</li>
            <li>Existence of automated decision-making</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">How to exercise this right</h3>
          <p>
            Submit a request using our GDPR form below or contact us directly. We will provide the information in a commonly used electronic format within 30 days.
          </p>
        </div>
      </section>

      <section id="right-to-rectification" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Right to Rectification (Article 16 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            You have the right to have inaccurate personal data corrected and incomplete personal data completed.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">When can you use this right?</h3>
          <ul>
            <li>When your personal data is inaccurate</li>
            <li>When your personal data is incomplete</li>
            <li>When you need to update your information</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">What we will do</h3>
          <p>
            We will correct or complete your data without undue delay and inform any third parties to whom we have disclosed the data about the rectification, unless this proves impossible or involves disproportionate effort.
          </p>
        </div>
      </section>

      <section id="right-to-erasure" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Right to Erasure "Right to be Forgotten" (Article 17 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            You have the right to have your personal data erased under certain circumstances.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">When can you request erasure?</h3>
          <ul>
            <li>The data is no longer necessary for the original purpose</li>
            <li>You withdraw consent and no other legal ground exists</li>
            <li>You object to processing and no overriding legitimate interests exist</li>
            <li>Your data has been unlawfully processed</li>
            <li>Erasure is required for compliance with legal obligations</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Limitations</h3>
          <p>
            This right does not apply when processing is necessary for:
          </p>
          <ul>
            <li>Compliance with legal obligations</li>
            <li>Establishment, exercise or defense of legal claims</li>
            <li>Public health or archiving in the public interest</li>
          </ul>
        </div>
      </section>

      <section id="right-to-restriction" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Right to Restriction of Processing (Article 18 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            You have the right to restrict the processing of your personal data under certain circumstances. Restriction means we can store the data but not use it for other purposes.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">When can you request restriction?</h3>
          <ul>
            <li>You contest the accuracy of the data (during verification period)</li>
            <li>Processing is unlawful but you oppose erasure</li>
            <li>We no longer need the data but you need it for legal claims</li>
            <li>You object to processing (pending verification of overriding grounds)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">What we will do</h3>
          <p>
            We will only process restricted data with your consent or for legal claims, protection of rights, or important public interests. We will inform you before lifting any restriction.
          </p>
        </div>
      </section>

      <section id="right-to-portability" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Right to Data Portability (Article 20 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            You have the right to receive your personal data in a structured, commonly used, and machine-readable format and to transmit it to another controller.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">When does this apply?</h3>
          <ul>
            <li>Processing is based on consent or contract</li>
            <li>Processing is carried out by automated means</li>
            <li>It doesn't adversely affect the rights and freedoms of others</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">What data can be ported?</h3>
          <ul>
            <li>Reservation data and preferences</li>
            <li>Account information</li>
            <li>Communication preferences</li>
            <li>Order history</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Format</h3>
          <p>
            We will provide data in JSON or CSV format, commonly used and machine-readable formats that can be easily imported into other systems.
          </p>
        </div>
      </section>

      <section id="right-to-object" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Right to Object (Article 21 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            You have the right to object to processing of your personal data under certain circumstances.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">When can you object?</h3>
          <ul>
            <li><strong>General objection:</strong> Processing based on legitimate interests or public task</li>
            <li><strong>Direct marketing:</strong> Absolute right to object (we must stop immediately)</li>
            <li><strong>Profiling:</strong> Related to direct marketing</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">What we will do</h3>
          <p>
            For general objections, we will stop processing unless we demonstrate compelling legitimate grounds that override your interests. For direct marketing objections, we will stop immediately.
          </p>
        </div>
      </section>

      <section id="automated-decision-making" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Rights Related to Automated Decision-Making (Article 22 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            You have the right not to be subject to decisions based solely on automated processing, including profiling, which produce legal effects or significantly affect you.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Our practices</h3>
          <p>
            We do not currently use automated decision-making that would significantly affect you. If we implement such systems in the future, we will:
          </p>
          <ul>
            <li>Inform you about the automated decision-making</li>
            <li>Provide meaningful information about the logic involved</li>
            <li>Offer the right to human intervention</li>
            <li>Allow you to contest the decision</li>
          </ul>
        </div>
      </section>

      <section id="right-to-withdraw-consent" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Right to Withdraw Consent (Article 7 GDPR)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">What is it?</h3>
          <p>
            When processing is based on consent, you have the right to withdraw that consent at any time.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">How to withdraw consent</h3>
          <ul>
            <li><strong>Cookie consent:</strong> Use the cookie preferences center</li>
            <li><strong>Marketing communications:</strong> Unsubscribe links in emails</li>
            <li><strong>Account consent:</strong> Update your account preferences</li>
            <li><strong>General consent:</strong> Contact us directly</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Effect of withdrawal</h3>
          <p>
            Withdrawal of consent does not affect the lawfulness of processing before withdrawal. We may continue processing based on other legal grounds if applicable.
          </p>
        </div>
      </section>

      <section id="how-to-exercise-rights" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          How to Exercise Your Rights
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">GDPR Rights Request Form</h3>
          <p>
            Use our secure online form to submit your GDPR rights request:
          </p>
          <div className="bg-card border border-border rounded-lg p-6 my-4">
            <p className="text-center text-muted-foreground mb-4">
              Submit your GDPR rights request using our secure form
            </p>
            <div className="text-center">
              <a
                href="/api/gdpr/request-form"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                GDPR Rights Request Form
              </a>
            </div>
          </div>

          <h3 className="enigma-subsection-title mb-2 mt-4">Alternative Contact Methods</h3>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Phone:</strong> +34 672 79 60 06</li>
            <li><strong>Postal mail:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, Spain</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Information Required</h3>
          <p>
            To process your request efficiently, please provide:
          </p>
          <ul>
            <li>Full name and contact information</li>
            <li>Specific right you want to exercise</li>
            <li>Clear description of your request</li>
            <li>Proof of identity (for security purposes)</li>
            <li>Any relevant account or reservation information</li>
          </ul>
        </div>
      </section>

      <section id="response-timeframes" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Response Timeframes and Process
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Standard Timeframes</h3>
          <ul>
            <li><strong>Initial response:</strong> Within 72 hours of receipt</li>
            <li><strong>Full response:</strong> Within 30 days of receipt</li>
            <li><strong>Extension:</strong> Up to 60 days for complex requests (with notification)</li>
            <li><strong>Direct marketing objection:</strong> Immediate cessation</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Process Steps</h3>
          <ol>
            <li><strong>Request receipt:</strong> Automatic confirmation and reference number</li>
            <li><strong>Identity verification:</strong> Security checks to protect your data</li>
            <li><strong>Request review:</strong> Assessment of request and applicable rights</li>
            <li><strong>Data gathering:</strong> Collection of relevant information</li>
            <li><strong>Response preparation:</strong> Compilation of response in appropriate format</li>
            <li><strong>Delivery:</strong> Secure transmission of response</li>
          </ol>

          <h3 className="enigma-subsection-title mb-2 mt-4">Fees</h3>
          <p>
            We do not charge fees for most GDPR rights requests. However, we may charge a reasonable administrative fee or refuse to act if requests are:
          </p>
          <ul>
            <li>Manifestly unfounded or excessive</li>
            <li>Repetitive in nature</li>
            <li>Clearly frivolous</li>
          </ul>
        </div>
      </section>

      <section id="complaint-procedures" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Complaint Procedures
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">If You're Not Satisfied</h3>
          <p>
            If you're not satisfied with our response to your GDPR rights request, you have the following options:
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Internal Review</h3>
          <ul>
            <li>Request an internal review of our decision</li>
            <li>Provide additional information or clarification</li>
            <li>Escalate to our Data Protection Officer (if appointed)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Supervisory Authority</h3>
          <p>
            You have the right to lodge a complaint with the Spanish Data Protection Agency:
          </p>
          <ul>
            <li><strong>Agency:</strong> Agencia Española de Protección de Datos (AEPD)</li>
            <li><strong>Address:</strong> C/ Jorge Juan, 6, 28001 Madrid</li>
            <li><strong>Phone:</strong> 901 100 099 / 912 663 517</li>
            <li><strong>Website:</strong> <a href="https://www.aepd.es" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">www.aepd.es</a></li>
            <li><strong>Online form:</strong> Available on AEPD website</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Judicial Remedy</h3>
          <p>
            You also have the right to an effective judicial remedy if you believe your data protection rights have been violated.
          </p>
        </div>
      </section>

      <section id="contact-dpo" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contact Information
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Data Controller</h3>
          <p>
            <strong>Enigma Cocina Con Alma</strong><br />
            Carrer Justicia 6A<br />
            03710 Calpe, Alicante, Spain<br />
            Email: reservas@enigmaconalma.com<br />
            Phone: +34 672 79 60 06
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">GDPR Requests</h3>
          <ul>
            <li><strong>Online form:</strong> <a href="/api/gdpr/request-form" className="text-primary hover:underline">GDPR Rights Request Form</a></li>
            <li><strong>Email:</strong> reservas@enigmaconalma.com (Subject: "GDPR Rights Request")</li>
            <li><strong>Phone:</strong> +34 672 79 60 06</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Quick Links</h3>
          <ul>
            <li><a href="/en/legal/privacy-policy" className="text-primary hover:underline">Privacy Policy</a></li>
            <li><a href="/en/legal/cookie-policy" className="text-primary hover:underline">Cookie Policy</a></li>
            <li><a href="/legal/cookie-preferences" className="text-primary hover:underline">Cookie Preferences</a></li>
            <li><a href="/en/legal/terms-conditions" className="text-primary hover:underline">Terms and Conditions</a></li>
          </ul>
        </div>
      </section>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export { DefaultGdprRightsContent }