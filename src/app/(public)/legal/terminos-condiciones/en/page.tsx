// app/(public)/legal/terminos-condiciones/en/page.tsx
// Terms and Conditions Page (English) - Database-driven Legal Terms
// PRP Implementation: Complete Service Terms and Reservation Conditions

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
    const content = await legalService.getActiveContent('terms_conditions', 'en')

    if (!content) {
      return {
        title: 'Terms and Conditions - Enigma Cocina Con Alma',
        description: 'Terms and conditions of use for Enigma Cocina Con Alma services - Reservation and service conditions at our restaurant in Calpe.'
      }
    }

    return generateLegalPageMetadata(content, 'en')
  } catch (error) {
    console.error('Error generating metadata for terms and conditions:', error)
    return {
      title: 'Terms and Conditions - Enigma Cocina Con Alma',
      description: 'Terms and conditions of use for Enigma Cocina Con Alma services - Reservation and service conditions at our restaurant in Calpe.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function TermsConditionsPage() {
  try {
    const legalService = await createLegalContentService()

    // Fetch terms and conditions content from database
    const content = await legalService.getActiveContent('terms_conditions', 'en')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'terms_conditions',
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
        <TermsConditionsContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading terms and conditions page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface TermsConditionsContentProps {
  content: any
}

function TermsConditionsContent({ content }: TermsConditionsContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default terms and conditions
  if (sections.length === 0) {
    return <DefaultTermsConditionsContent />
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

function DefaultTermsConditionsContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="purpose-scope" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Purpose and Scope
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            These terms and conditions regulate the use of services offered by Enigma Cocina Con Alma, including:
          </p>
          <ul>
            <li>Restaurant and hospitality services</li>
            <li>Online reservation system</li>
            <li>Additional services (events, catering, etc.)</li>
            <li>Use of website and digital platforms</li>
          </ul>
          <p>
            Access to and use of our services implies full acceptance of these terms and conditions.
          </p>
        </div>
      </section>

      <section id="reservation-conditions" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Reservation Conditions
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Reservation Process</h3>
          <p>
            Reservations can be made through:
          </p>
          <ul>
            <li>Our online reservation system</li>
            <li>Phone: +34 672 79 60 06</li>
            <li>Email: reservas@enigmaconalma.com</li>
            <li>In person at the restaurant</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Reservation Confirmation</h3>
          <p>
            Reservations are not considered confirmed until receiving confirmation from the restaurant. We reserve the right to reject reservations for availability, capacity or extraordinary circumstances.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Cancellation Policy</h3>
          <ul>
            <li><strong>Free cancellation:</strong> Up to 24 hours before the reservation</li>
            <li><strong>Late cancellation:</strong> Less than 24 hours may incur penalty</li>
            <li><strong>No-show:</strong> 100% of estimated service amount</li>
            <li><strong>Large groups:</strong> Special conditions (consult)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Modifications</h3>
          <p>
            Reservation modifications are subject to availability and must be requested at least 4 hours in advance. We do not guarantee availability for last-minute changes.
          </p>
        </div>
      </section>

      <section id="schedule-policy" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Schedule Policy
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Service Hours</h3>
          <ul>
            <li><strong>Tuesday to Sunday:</strong> 18:00 - 24:00</li>
            <li><strong>Monday:</strong> Closed</li>
            <li><strong>Holidays:</strong> Check availability</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Punctuality</h3>
          <p>
            We request punctuality for reservations. Tables are held for 15 minutes. After this time, the table may be reassigned without notice.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Table Time</h3>
          <p>
            The estimated table occupancy time is 2 hours. If you need more time, please communicate in advance to verify availability.
          </p>
        </div>
      </section>

      <section id="service-conditions" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Service Conditions
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Menu and Prices</h3>
          <ul>
            <li>Prices are subject to change without notice</li>
            <li>Displayed prices include VAT</li>
            <li>Menu may vary according to product availability</li>
            <li>We inform about allergens according to current regulations</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Allergies and Intolerances</h3>
          <p>
            It is the customer's responsibility to inform about allergies, intolerances or dietary restrictions at the time of reservation or at the start of service. We will do our best to adapt our dishes, but we cannot guarantee the total absence of allergens.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Dress Code</h3>
          <p>
            We recommend smart-casual attire. We reserve the right of admission for reasons of image or behavior.
          </p>
        </div>
      </section>

      <section id="payments-billing" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Payments and Billing
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Payment Methods</h3>
          <p>We accept the following payment methods:</p>
          <ul>
            <li>Cash</li>
            <li>Credit and debit cards (Visa, Mastercard, American Express)</li>
            <li>Contactless payments</li>
            <li>Bank transfer (for large groups)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Billing</h3>
          <p>
            Invoices are issued at the end of service. For invoices with business data, it is necessary to provide them before the start of service.
          </p>

          <h3 className="enigma-subsection-title mb-2 mt-4">Tips</h3>
          <p>
            Tips are voluntary and not included in prices. We appreciate any expression of satisfaction with our service.
          </p>
        </div>
      </section>

      <section id="behavior-rules" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Behavior Rules
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            To ensure a pleasant experience for all our customers, we request:
          </p>
          <ul>
            <li>Maintain a moderate conversation volume</li>
            <li>Respect staff and other diners</li>
            <li>No smoking inside the establishment</li>
            <li>Keep mobile devices on silent mode</li>
            <li>Follow staff instructions at all times</li>
          </ul>
          <p>
            We reserve the right of admission and permanence. In case of inappropriate behavior, we may request leaving the establishment.
          </p>
        </div>
      </section>

      <section id="events-groups" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Events and Large Groups
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Group Reservations</h3>
          <p>
            For groups of more than 8 people, we apply special conditions:
          </p>
          <ul>
            <li>Reservation at least 48 hours in advance</li>
            <li>Possible request for deposit or prepayment</li>
            <li>Pre-selected menu according to availability</li>
            <li>Single billing for the entire group</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Private Events</h3>
          <p>
            We offer services for private events with specific conditions that will be negotiated case by case. Check availability and special conditions.
          </p>
        </div>
      </section>

      <section id="liability" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Limitation of Liability
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Enigma Cocina Con Alma is not responsible for:
          </p>
          <ul>
            <li>Loss or damage of personal belongings</li>
            <li>Allergic reactions not previously communicated</li>
            <li>Cancellations due to force majeure</li>
            <li>Menu changes due to product availability</li>
            <li>Pre-existing health problems</li>
          </ul>
          <p>
            We recommend customers take out appropriate insurance for their personal belongings.
          </p>
        </div>
      </section>

      <section id="data-protection" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Data Protection
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            The processing of your personal data is governed by our <a href="/en/legal/privacy-policy" className="text-primary hover:underline">Privacy Policy</a>, which complies with GDPR and Spanish data protection regulations.
          </p>
          <p>
            By using our services, you accept the processing of your data as described in that policy.
          </p>
        </div>
      </section>

      <section id="force-majeure" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Force Majeure
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We are not responsible for non-compliance with our obligations due to force majeure circumstances, including:
          </p>
          <ul>
            <li>Natural disasters</li>
            <li>Health emergencies</li>
            <li>Power or water supply cuts</li>
            <li>Strikes or labor conflicts</li>
            <li>Government provisions</li>
            <li>Any other circumstances beyond our control</li>
          </ul>
          <p>
            In these cases, we will try to reschedule your reservation or proceed with the corresponding refund.
          </p>
        </div>
      </section>

      <section id="terms-modification" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Terms Modification
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We reserve the right to modify these terms and conditions at any time. Modifications will take effect from their publication on our website.
          </p>
          <p>
            We recommend that you periodically review these terms to stay informed of any changes.
          </p>
        </div>
      </section>

      <section id="legislation-jurisdiction" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Applicable Legislation and Jurisdiction
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            These terms and conditions are governed by Spanish legislation. For the resolution of any controversy, the parties submit to the courts and tribunals of Alicante, with express waiver of any other jurisdiction that may correspond to them.
          </p>
        </div>
      </section>

      <section id="contact" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contact
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            For any inquiries about these terms and conditions:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Phone:</strong> +34 672 79 60 06</li>
            <li><strong>Address:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, Spain</li>
            <li><strong>Service hours:</strong> Tuesday to Sunday, 18:00 - 24:00</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

// Only default export and generateMetadata are valid for Next.js pages