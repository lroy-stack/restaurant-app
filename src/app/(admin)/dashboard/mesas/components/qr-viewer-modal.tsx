'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { QRCodeSVG } from 'qrcode.react'
import { toast } from 'sonner'
import { 
  QrCode, 
  Download, 
  Copy, 
  Check,
  MapPin,
  Users,
  ExternalLink
} from 'lucide-react'

interface QRViewerModalProps {
  isOpen: boolean
  onClose: () => void
  table?: {
    id: string
    number: string
    capacity: number
    location: string
    qrCode?: string
    isActive: boolean
  }
}

// REAL Enigma zones with Spanish labels
const ENIGMA_ZONES = {
  'TERRACE_CAMPANARI': 'Terraza Campanari',
  'SALA_PRINCIPAL': 'Sala Principal', 
  'SALA_VIP': 'Sala VIP',
  'TERRACE_JUSTICIA': 'Terraza Justicia'
} as const

export function QRViewerModal({ isOpen, onClose, table }: QRViewerModalProps) {
  const [copiedState, setCopiedState] = useState('')

  if (!table) return null

  // Generate QR URL pointing to menu.enigmaconalma.com with UTM tracking
  const qrUrl = `https://menu.enigmaconalma.com?mesa=${table.number}&utm_source=qr&utm_medium=table&utm_campaign=restaurante&location=${table.location}`
  
  const locationLabel = ENIGMA_ZONES[table.location as keyof typeof ENIGMA_ZONES] || table.location

  // Copy to clipboard function
  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedState(type)
      toast.success(`${type} copiado al portapapeles`)
      setTimeout(() => setCopiedState(''), 2000)
    } catch (error) {
      toast.error('Error al copiar')
    }
  }

  // Download QR as SVG
  const downloadQRSVG = () => {
    try {
      // Create SVG element
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
      svg.setAttribute('width', '400')
      svg.setAttribute('height', '400')
      svg.setAttribute('viewBox', '0 0 400 400')
      
      // Create QR code container
      const qrContainer = document.querySelector('.qr-code-svg')
      if (!qrContainer) {
        toast.error('Error generando SVG')
        return
      }
      
      // Clone the QR SVG content
      const qrClone = qrContainer.cloneNode(true) as SVGElement
      qrClone.setAttribute('x', '50')
      qrClone.setAttribute('y', '50')
      qrClone.setAttribute('width', '300')
      qrClone.setAttribute('height', '300')
      
      // Add background
      const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
      background.setAttribute('width', '400')
      background.setAttribute('height', '400')
      background.setAttribute('fill', '#FFFFFF')
      
      // Add title
      const title = document.createElementNS('http://www.w3.org/2000/svg', 'text')
      title.setAttribute('x', '200')
      title.setAttribute('y', '30')
      title.setAttribute('text-anchor', 'middle')
      title.setAttribute('font-family', 'Arial, sans-serif')
      title.setAttribute('font-size', '18')
      title.setAttribute('fill', '#000000')
      title.textContent = `Mesa ${table.number} - ${locationLabel}`
      
      // Assemble SVG
      svg.appendChild(background)
      svg.appendChild(title)
      svg.appendChild(qrClone)
      
      // Create download
      const svgData = new XMLSerializer().serializeToString(svg)
      const blob = new Blob([svgData], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.download = `enigma-qr-mesa-${table.number}.svg`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success(`QR Mesa ${table.number} descargado como SVG`)
    } catch (error) {
      console.error('Error downloading SVG:', error)
      toast.error('Error al descargar SVG')
    }
  }

  // Download QR as PNG
  const downloadQRPNG = () => {
    try {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = 400
      canvas.height = 400

      // White background
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, 400, 400)

      // Get QR SVG and convert to canvas
      const qrSvg = document.querySelector('.qr-code-svg') as SVGElement
      if (!qrSvg) {
        toast.error('Error generando PNG')
        return
      }

      const svgData = new XMLSerializer().serializeToString(qrSvg)
      const img = new Image()
      
      img.onload = () => {
        // Draw title
        ctx.fillStyle = '#000000'
        ctx.font = '18px Arial'
        ctx.textAlign = 'center'
        ctx.fillText(`Mesa ${table.number} - ${locationLabel}`, 200, 30)
        
        // Draw QR code
        ctx.drawImage(img, 50, 50, 300, 300)
        
        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.download = `enigma-qr-mesa-${table.number}.png`
            link.href = url
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
            toast.success(`QR Mesa ${table.number} descargado como PNG`)
          }
        }, 'image/png')
      }
      
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      img.src = svgUrl
      
    } catch (error) {
      console.error('Error downloading PNG:', error)
      toast.error('Error al descargar PNG')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Código QR - Mesa {table.number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Table Info */}
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{locationLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{table.capacity} personas</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {table.isActive ? (
                <Badge variant="default">Activa</Badge>
              ) : (
                <Badge variant="secondary">Inactiva</Badge>
              )}
            </div>
          </div>

          {/* QR Code Display */}
          <div className="flex flex-col items-center space-y-4">
            <div className="p-6 bg-white rounded-lg border shadow-sm">
              <QRCodeSVG
                value={qrUrl}
                size={200}
                level="H"
                bgColor="#FFFFFF"
                fgColor="#000000"
                marginSize={2}
                className="qr-code-svg"
              />
            </div>
            
            {/* QR URL Display */}
            <div className="w-full p-3 bg-muted/50 rounded border">
              <div className="flex items-center justify-between gap-2">
                <code className="text-xs font-mono text-muted-foreground break-all">
                  {qrUrl}
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(qrUrl, 'URL')}
                >
                  {copiedState === 'URL' ? (
                    <Check className="h-3 w-3 text-green-600" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={downloadQRSVG}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar SVG
            </Button>
            
            <Button
              variant="outline"
              onClick={downloadQRPNG}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar PNG
            </Button>
          </div>

          {/* External Link */}
          <div className="pt-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-center gap-2"
              onClick={() => window.open(qrUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Abrir carta digital
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}