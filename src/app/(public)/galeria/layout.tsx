import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Galería - Restaurante Enigma Calpe | Fotos y Ambiente',
  description: 'Explora la galería de fotos de Enigma Cocina Con Alma en Calpe. Descubre nuestros platos mediterráneos, ambiente del casco antiguo, decoración y experiencia gastronómica única.',
  keywords: 'fotos enigma calpe, galería restaurante calpe, imágenes platos, ambiente casco antiguo, decoración restaurante, experiencia gastronómica calpe',
  openGraph: {
    title: 'Galería - Enigma Cocina Con Alma | Calpe',
    description: 'Descubre visualmente nuestra cocina mediterránea de autor y el auténtico ambiente del casco antiguo de Calpe.',
    url: 'https://enigmaconalma.com/galeria',
    type: 'website',
    images: [
      {
        url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
        width: 1200,
        height: 630,
        alt: 'Galería Restaurante Enigma Calpe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Galería - Enigma Calpe',
    description: 'Fotos de nuestra cocina mediterránea y ambiente del casco antiguo.',
    images: ['https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421'],
  },
  alternates: {
    canonical: '/galeria',
  },
}

export default function GaleriaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
