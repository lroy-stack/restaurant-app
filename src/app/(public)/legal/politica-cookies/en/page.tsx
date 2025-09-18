// app/(public)/legal/politica-cookies/en/page.tsx
// Cookie Policy Page (English) - Database-driven AEPD 2025 Compliant
// PRP Implementation: Complete Cookie Policy with AEPD 2025 Guidelines

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
    const content = await legalService.getActiveContent('cookie_policy', 'en')

    if (!content) {
      return {
        title: 'Cookie Policy - Enigma Cocina Con Alma',
        description: 'Cookie policy of Enigma Cocina Con Alma - Information about cookie usage according to AEPD 2025 guidelines and GDPR compliance.'
      }
    }

    return generateLegalPageMetadata(content, 'en')
  } catch (error) {
    console.error('Error generating metadata for cookie policy:', error)
    return {
      title: 'Cookie Policy - Enigma Cocina Con Alma',
      description: 'Cookie policy of Enigma Cocina Con Alma - Information about cookie usage according to AEPD 2025 guidelines and GDPR compliance.'
    }
  }
}

// ============================================
// PAGE COMPONENT
// ============================================

export default async function CookiePolicyPage() {
  try {
    const legalService = await createLegalContentService()
    // Fetch cookie policy content from database
    const content = await legalService.getActiveContent('cookie_policy', 'en')

    if (!content) {
      notFound()
    }

    // Track page view for compliance audit
    await legalService.trackContentView(
      'cookie_policy',
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
        <CookiePolicyContent content={content} />
      </LegalPageLayout>
    )
  } catch (error) {
    console.error('Error loading cookie policy page:', error)
    notFound()
  }
}

// ============================================
// CONTENT COMPONENT
// ============================================

interface CookiePolicyContentProps {
  content: any
}

function CookiePolicyContent({ content }: CookiePolicyContentProps) {
  const sections = content.content?.sections || []

  // If no dynamic content, show default cookie policy
  if (sections.length === 0) {
    return <DefaultCookiePolicyContent />
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
// DEFAULT CONTENT (AEPD 2025 COMPLIANT FALLBACK)
// ============================================

function DefaultCookiePolicyContent() {
  return (
    <div className="legal-content space-y-6">
      <section id="what-are-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          What are Cookies?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            Cookies are small text files that are downloaded to your computer/mobile device when you visit a website. They allow the website to recognize your device and store some information about your preferences or past actions.
          </p>
          <p>
            This Cookie Policy explains how Enigma Cocina Con Alma uses cookies and similar technologies to recognize you when you visit our website at <strong>enigmaconalma.com</strong>. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
          </p>
        </div>
      </section>

      <section id="why-we-use-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Why Do We Use Cookies?
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We use cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our website.
          </p>
          <p>
            In accordance with AEPD 2025 guidelines, we ensure that:
          </p>
          <ul>
            <li>Essential cookies are used without requiring consent</li>
            <li>Non-essential cookies require explicit consent</li>
            <li>Consent buttons have equal prominence</li>
            <li>Consent is recorded with timestamp and method</li>
            <li>Consent duration does not exceed 24 months</li>
          </ul>
        </div>
      </section>

      <section id="types-of-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Types of Cookies We Use
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Essential Cookies</h3>
          <p>
            These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as making reservations or managing your account.
          </p>
          <ul>
            <li><strong>Session management:</strong> Authentication and user session</li>
            <li><strong>Security:</strong> CSRF protection and fraud prevention</li>
            <li><strong>Functionality:</strong> Language preference and basic functionality</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Analytics Cookies</h3>
          <p>
            These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our site. They help us to know which pages are the most and least popular and see how visitors move around the site.
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> Website usage statistics (anonymized)</li>
            <li><strong>Performance monitoring:</strong> Page load times and errors</li>
            <li><strong>User behavior:</strong> Navigation patterns (aggregated data)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Functionality Cookies</h3>
          <p>
            These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages.
          </p>
          <ul>
            <li><strong>Preferences:</strong> Theme, language, and display settings</li>
            <li><strong>Reservation system:</strong> Booking form data persistence</li>
            <li><strong>Customer service:</strong> Live chat and support features</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Marketing Cookies</h3>
          <p>
            These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites.
          </p>
          <ul>
            <li><strong>Social media:</strong> Social sharing and integration</li>
            <li><strong>Advertising:</strong> Targeted advertising (when consented)</li>
            <li><strong>Retargeting:</strong> Personalized marketing campaigns</li>
          </ul>
        </div>
      </section>

      <section id="cookie-categories" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Cookie Categories and Duration
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">By Origin</h3>
          <ul>
            <li><strong>First-party cookies:</strong> Set directly by enigmaconalma.com</li>
            <li><strong>Third-party cookies:</strong> Set by external services (Google, etc.)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">By Duration</h3>
          <ul>
            <li><strong>Session cookies:</strong> Deleted when you close your browser</li>
            <li><strong>Persistent cookies:</strong> Remain for a specified period (max 24 months)</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">By Purpose</h3>
          <ul>
            <li><strong>Technical cookies:</strong> Essential for website operation</li>
            <li><strong>Personalization cookies:</strong> Remember your preferences</li>
            <li><strong>Analytics cookies:</strong> Help us improve our website</li>
            <li><strong>Advertising cookies:</strong> Show relevant advertisements</li>
          </ul>
        </div>
      </section>

      <section id="specific-cookies" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Specific Cookies Used
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <div className="overflow-x-auto">
            <table className="min-w-full border border-border">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-2 text-left">Cookie Name</th>
                  <th className="px-4 py-2 text-left">Purpose</th>
                  <th className="px-4 py-2 text-left">Duration</th>
                  <th className="px-4 py-2 text-left">Category</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">sb-access-token</td>
                  <td className="px-4 py-2">User authentication</td>
                  <td className="px-4 py-2">1 hour</td>
                  <td className="px-4 py-2">Essential</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">sb-refresh-token</td>
                  <td className="px-4 py-2">Session refresh</td>
                  <td className="px-4 py-2">30 days</td>
                  <td className="px-4 py-2">Essential</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">enigma-lang</td>
                  <td className="px-4 py-2">Language preference</td>
                  <td className="px-4 py-2">1 year</td>
                  <td className="px-4 py-2">Functionality</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">enigma-theme</td>
                  <td className="px-4 py-2">Dark/light mode preference</td>
                  <td className="px-4 py-2">1 year</td>
                  <td className="px-4 py-2">Functionality</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">_ga</td>
                  <td className="px-4 py-2">Google Analytics (anonymized)</td>
                  <td className="px-4 py-2">24 months</td>
                  <td className="px-4 py-2">Analytics</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-2">enigma-consent</td>
                  <td className="px-4 py-2">Cookie consent preferences</td>
                  <td className="px-4 py-2">24 months</td>
                  <td className="px-4 py-2">Essential</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="consent-management" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Consent Management (AEPD 2025)
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            In compliance with AEPD 2025 guidelines, we implement the following consent management practices:
          </p>

          <h3 className="enigma-subsection-title mb-2">Consent Requirements</h3>
          <ul>
            <li><strong>Explicit consent:</strong> Required for non-essential cookies</li>
            <li><strong>Equal prominence:</strong> Accept and reject buttons have equal visual weight</li>
            <li><strong>Granular control:</strong> Category-specific consent options</li>
            <li><strong>Easy withdrawal:</strong> Consent can be withdrawn at any time</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Consent Duration</h3>
          <ul>
            <li>Maximum consent duration: 24 months</li>
            <li>Automatic re-consent request after expiration</li>
            <li>Option to review consent at any time</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Consent Recording</h3>
          <p>
            We maintain records of your consent including:
          </p>
          <ul>
            <li>Timestamp of consent</li>
            <li>Method of consent (banner, preferences panel)</li>
            <li>Categories consented to</li>
            <li>IP address (for security purposes)</li>
            <li>Browser and device information</li>
          </ul>
        </div>
      </section>

      <section id="your-choices" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Your Cookie Choices and Rights
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <h3 className="enigma-subsection-title mb-2">Manage Consent</h3>
          <p>
            You can manage your cookie preferences at any time by:
          </p>
          <ul>
            <li>Clicking the "Cookie Settings" link in our website footer</li>
            <li>Using the cookie preference center</li>
            <li>Contacting us directly at reservas@enigmaconalma.com</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Browser Settings</h3>
          <p>
            Most web browsers allow you to control cookies through their settings preferences. However, limiting cookies may impact your experience of our website.
          </p>
          <ul>
            <li><strong>Chrome:</strong> Settings → Privacy and security → Cookies</li>
            <li><strong>Firefox:</strong> Preferences → Privacy & Security → Cookies</li>
            <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
            <li><strong>Edge:</strong> Settings → Site permissions → Cookies</li>
          </ul>

          <h3 className="enigma-subsection-title mb-2 mt-4">Third-Party Opt-Out</h3>
          <p>
            For third-party cookies, you can opt out directly with the providers:
          </p>
          <ul>
            <li><strong>Google Analytics:</strong> <a href="https://tools.google.com/dlpage/gaoptout" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">Google Analytics Opt-out</a></li>
            <li><strong>Digital Advertising Alliance:</strong> <a href="http://optout.aboutads.info/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">DAA Opt-out</a></li>
          </ul>
        </div>
      </section>

      <section id="updates-to-policy" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Updates to This Cookie Policy
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons.
          </p>
          <p>
            We will notify you of any material changes by:
          </p>
          <ul>
            <li>Posting the updated policy on our website</li>
            <li>Updating the "last updated" date at the top of this policy</li>
            <li>Requesting renewed consent when required by law</li>
            <li>Sending email notification for significant changes (if you have provided email)</li>
          </ul>
          <p>
            Please check this page periodically for updates.
          </p>
        </div>
      </section>

      <section id="contact-information" className="scroll-mt-20">
        <h2 className="enigma-section-title mb-4">
          Contact Information
        </h2>
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed">
          <p>
            If you have any questions about our use of cookies or this Cookie Policy, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> reservas@enigmaconalma.com</li>
            <li><strong>Phone:</strong> +34 672 79 60 06</li>
            <li><strong>Address:</strong> Carrer Justicia 6A, 03710 Calpe, Alicante, Spain</li>
            <li><strong>Cookie Settings:</strong> <a href="/legal/cookie-preferences" className="text-primary hover:underline">Manage Preferences</a></li>
          </ul>
          <p>
            For GDPR-related requests, please use our <a href="/en/legal/gdpr-rights" className="text-primary hover:underline">GDPR Rights Form</a>.
          </p>
        </div>
      </section>
    </div>
  )
}

// ============================================
// EXPORTS
// ============================================

export { DefaultCookiePolicyContent }