// components/legal/LegalPageLayout/PrintButton.tsx
// Print Button Component for Legal Documents
// PRP Implementation: PDF export functionality for legal compliance

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Printer,
  Download,
  FileText,
  Loader2
} from 'lucide-react'
import type {
  LegalContent,
  Language
} from '@/types/legal'

// ============================================
// COMPONENT INTERFACES
// ============================================

interface PrintButtonProps {
  content: LegalContent
  language: Language
  variant?: 'print' | 'download' | 'both'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

// ============================================
// MAIN COMPONENT
// ============================================

export function PrintButton({
  content,
  language,
  variant = 'both',
  size = 'sm',
  className
}: PrintButtonProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)
  const [isPrinting, setIsPrinting] = useState(false)

  // Handle browser print
  const handlePrint = async () => {
    try {
      setIsPrinting(true)

      // Add print-specific styles
      const printStyles = `
        @media print {
          .no-print, nav, header, footer, aside, .print-hidden {
            display: none !important;
          }

          body {
            font-size: 12pt;
            line-height: 1.5;
            color: black;
            background: white;
          }

          .print-content {
            max-width: none;
            margin: 0;
            padding: 20pt;
          }

          h1 { font-size: 18pt; margin-bottom: 10pt; }
          h2 { font-size: 16pt; margin-bottom: 8pt; }
          h3 { font-size: 14pt; margin-bottom: 6pt; }

          p { margin-bottom: 8pt; }

          .page-break {
            page-break-before: always;
          }

          .legal-header {
            border-bottom: 2pt solid black;
            padding-bottom: 10pt;
            margin-bottom: 20pt;
          }

          .legal-footer {
            border-top: 1pt solid black;
            padding-top: 10pt;
            margin-top: 20pt;
            font-size: 10pt;
            text-align: center;
          }
        }
      `

      // Create style element
      const styleElement = document.createElement('style')
      styleElement.textContent = printStyles
      document.head.appendChild(styleElement)

      // Trigger print
      window.print()

      // Clean up styles after a delay
      setTimeout(() => {
        document.head.removeChild(styleElement)
      }, 1000)

    } catch (error) {
      console.error('Error printing document:', error)
    } finally {
      setIsPrinting(false)
    }
  }

  // Handle PDF generation (future implementation)
  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true)

      // For now, we'll use browser print functionality
      // In the future, this could generate a proper PDF using libraries like jsPDF

      // Create a print-optimized version
      const printContent = generatePrintableContent(content, language)

      // Open print dialog with optimized content
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(printContent)
        printWindow.document.close()

        // Wait for content to load, then print
        printWindow.onload = () => {
          printWindow.print()
          // Close window after printing (optional)
          setTimeout(() => {
            printWindow.close()
          }, 1000)
        }
      }

    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

  // Render based on variant
  if (variant === 'print') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(className)}
        onClick={handlePrint}
        disabled={isPrinting}
      >
        {isPrinting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {language === 'es' ? 'Imprimir' : 'Print'}
      </Button>
    )
  }

  if (variant === 'download') {
    return (
      <Button
        variant="outline"
        size={size}
        className={cn(className)}
        onClick={handleGeneratePDF}
        disabled={isGeneratingPDF}
      >
        {isGeneratingPDF ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {language === 'es' ? 'Descargar PDF' : 'Download PDF'}
      </Button>
    )
  }

  // Both options
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Button
        variant="outline"
        size={size}
        onClick={handlePrint}
        disabled={isPrinting}
        className="w-full"
      >
        {isPrinting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Printer className="h-4 w-4 mr-2" />
        )}
        {language === 'es' ? 'Imprimir' : 'Print'}
      </Button>

      <Button
        variant="outline"
        size={size}
        onClick={handleGeneratePDF}
        disabled={isGeneratingPDF}
        className="w-full"
      >
        {isGeneratingPDF ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        {language === 'es' ? 'PDF' : 'PDF'}
      </Button>
    </div>
  )
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function generatePrintableContent(content: LegalContent, language: Language): string {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return language === 'es'
      ? date.toLocaleDateString('es-ES', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
  }

  const sections = content.content?.sections || []
  const sectionsHtml = sections.map((section: any, index: number) => {
    return `
      <div class="section">
        <h2>${section.title || `${language === 'es' ? 'Sección' : 'Section'} ${index + 1}`}</h2>
        <div class="section-content">
          ${section.content || ''}
        </div>
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${content.title} - Enigma Cocina Con Alma</title>
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.6;
          color: black;
          background: white;
          margin: 0;
          padding: 20pt;
          max-width: 8.5in;
        }

        .legal-header {
          border-bottom: 2pt solid black;
          padding-bottom: 15pt;
          margin-bottom: 25pt;
          text-align: center;
        }

        .legal-header h1 {
          font-size: 18pt;
          font-weight: bold;
          margin: 0 0 10pt 0;
        }

        .legal-header .metadata {
          font-size: 10pt;
          color: #666;
          margin: 5pt 0;
        }

        .section {
          margin-bottom: 20pt;
          page-break-inside: avoid;
        }

        .section h2 {
          font-size: 14pt;
          font-weight: bold;
          margin: 15pt 0 8pt 0;
          color: #333;
        }

        .section h3 {
          font-size: 12pt;
          font-weight: bold;
          margin: 12pt 0 6pt 0;
          color: #555;
        }

        .section-content {
          margin-left: 0;
        }

        .section-content p {
          margin: 8pt 0;
          text-align: justify;
        }

        .section-content ul, .section-content ol {
          margin: 8pt 0 8pt 20pt;
        }

        .section-content li {
          margin: 4pt 0;
        }

        .legal-footer {
          border-top: 1pt solid black;
          padding-top: 15pt;
          margin-top: 30pt;
          font-size: 10pt;
          text-align: center;
          color: #666;
        }

        .page-break {
          page-break-before: always;
        }

        @media print {
          body {
            margin: 0;
            padding: 20pt;
          }

          .no-print {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      <div class="legal-document">
        <header class="legal-header">
          <h1>${content.title}</h1>
          <div class="metadata">
            <div><strong>${language === 'es' ? 'Versión:' : 'Version:'}</strong> ${content.version}</div>
            <div><strong>${language === 'es' ? 'Fecha efectiva:' : 'Effective date:'}</strong> ${formatDate(content.effective_date)}</div>
            <div><strong>${language === 'es' ? 'Última actualización:' : 'Last updated:'}</strong> ${formatDate(content.updated_at)}</div>
          </div>
          <div class="company-info">
            <strong>Enigma Cocina Con Alma</strong><br>
            Carrer Justicia 6A, 03710 Calpe, Alicante<br>
            ${language === 'es' ? 'España' : 'Spain'}
          </div>
        </header>

        <main class="legal-content">
          ${sectionsHtml}
        </main>

        <footer class="legal-footer">
          <div>
            © ${new Date().getFullYear()} Enigma Cocina Con Alma
          </div>
          <div>
            ${language === 'es'
              ? `Documento versión ${content.version} efectivo desde ${formatDate(content.effective_date)}`
              : `Document version ${content.version} effective from ${formatDate(content.effective_date)}`
            }
          </div>
          <div>
            ${language === 'es'
              ? 'Documento generado el ' + new Date().toLocaleDateString('es-ES')
              : 'Document generated on ' + new Date().toLocaleDateString('en-US')
            }
          </div>
        </footer>
      </div>
    </body>
    </html>
  `
}

export default PrintButton