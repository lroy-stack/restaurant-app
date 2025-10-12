import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Menú - Restaurante Enigma Calpe | Cocina Mediterránea de Autor',
  description: 'Descubre nuestra carta de cocina mediterránea de autor en Calpe. Platos especiales, croquetas artesanales, pulpo, pescados frescos, carnes selectas y pasta casera. Pre-pedidos disponibles con tu reserva.',
  keywords: 'menú enigma calpe, carta restaurante calpe, cocina mediterránea, pulpo calpe, pescado fresco, vinos calpe, carta alérgenos, menú vegetariano, cocina de autor',
  openGraph: {
    title: 'Menú - Cocina Mediterránea de Autor | Enigma Calpe',
    description: 'Explora nuestra exquisita selección de platos mediterráneos: Especiales del chef, croquetas artesanales, pulpo, pescados frescos y más. Pre-pedidos disponibles.',
    url: 'https://enigmaconalma.com/menu',
    type: 'website',
    images: [
      {
        url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
        width: 1200,
        height: 630,
        alt: 'Menú Restaurante Enigma Calpe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Menú - Restaurante Enigma Calpe',
    description: 'Cocina mediterránea de autor con ingredientes de proximidad. Pre-pedidos disponibles con tu reserva.',
    images: ['https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421'],
  },
  alternates: {
    canonical: '/menu',
  },
}

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
