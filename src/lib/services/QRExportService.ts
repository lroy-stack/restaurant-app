import QRCodeStyling from 'qr-code-styling'

export interface QRTemplate {
  id: string
  name: string
  dotsColor: string
  backgroundColor: string
  cornerSquareColor: string
  dotsStyle?: 'rounded' | 'dots' | 'classy' | 'classy-rounded' | 'square'
  cornerSquareStyle?: 'dot' | 'square' | 'extra-rounded'
  logoUrl?: string
}

export const QR_TEMPLATES: QRTemplate[] = [
  {
    id: 'enigma-primary',
    name: 'Azul Atlántico',
    dotsColor: '#237584',
    backgroundColor: '#ffffff',
    cornerSquareColor: '#237584',
    dotsStyle: 'rounded',
    cornerSquareStyle: 'extra-rounded'
  },
  {
    id: 'enigma-logo',
    name: 'Con Logo Enigma',
    dotsColor: '#237584',
    backgroundColor: '#ffffff',
    cornerSquareColor: '#237584',
    dotsStyle: 'classy-rounded',
    cornerSquareStyle: 'extra-rounded',
    logoUrl: '/enigma-logo-circle.svg'
  },
  {
    id: 'high-contrast',
    name: 'Alto Contraste',
    dotsColor: '#000000',
    backgroundColor: '#ffffff',
    cornerSquareColor: '#000000',
    dotsStyle: 'square',
    cornerSquareStyle: 'square'
  }
]

export class QRExportService {
  /**
   * Genera QR code como base64 data URL para usar en PDF/imagen
   */
  static async generateQRDataURL(
    content: string,
    template: QRTemplate = QR_TEMPLATES[0],
    size: number = 300
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const qrConfig: any = {
          width: size,
          height: size,
          data: content,
          dotsOptions: {
            color: template.dotsColor,
            type: template.dotsStyle || 'rounded'
          },
          backgroundOptions: {
            color: template.backgroundColor
          },
          cornersSquareOptions: {
            color: template.cornerSquareColor,
            type: template.cornerSquareStyle || 'extra-rounded'
          },
          cornersDotOptions: {
            color: template.cornerSquareColor
          }
        }

        // Add logo if template has one
        if (template.logoUrl) {
          qrConfig.image = template.logoUrl
          qrConfig.imageOptions = {
            crossOrigin: 'anonymous',
            margin: 10,
            imageSize: 0.3
          }
        }

        const qrCode = new QRCodeStyling(qrConfig)

        // Create temporary container
        const container = document.createElement('div')
        container.style.position = 'absolute'
        container.style.left = '-9999px'
        document.body.appendChild(container)

        // Render QR to canvas
        qrCode.append(container)

        // Wait for render
        setTimeout(() => {
          const canvas = container.querySelector('canvas')
          if (!canvas) {
            document.body.removeChild(container)
            reject(new Error('Failed to generate QR canvas'))
            return
          }

          const dataURL = canvas.toDataURL('image/png')
          document.body.removeChild(container)
          resolve(dataURL)
        }, 100)

      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Batch generation para múltiples QR codes
   */
  static async generateBatch(
    items: Array<{ content: string; label?: string }>,
    template: QRTemplate = QR_TEMPLATES[0],
    size: number = 300
  ): Promise<Array<{ dataURL: string; label?: string; content: string }>> {
    const results = await Promise.all(
      items.map(async (item) => ({
        dataURL: await this.generateQRDataURL(item.content, template, size),
        label: item.label,
        content: item.content
      }))
    )
    return results
  }
}
