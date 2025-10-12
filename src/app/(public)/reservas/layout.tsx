import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reservas Online - Restaurante Enigma Calpe | Mesa Garantizada',
  description: 'Reserva tu mesa online en Enigma Cocina Con Alma, Calpe. Sistema de pre-pedidos disponible. Gestión por email. Disponibilidad en tiempo real 24/7. Ubicado en Carrer Justicia 6A, casco antiguo.',
  keywords: 'reservar mesa enigma calpe, reservas online calpe, restaurante casco antiguo calpe, pre-pedidos restaurante, reserva con antelación, mesa garantizada calpe',
  openGraph: {
    title: 'Reserva Tu Mesa - Enigma Cocina Con Alma | Calpe',
    description: 'Reserva online con pre-pedidos disponibles. Mesa garantizada en el corazón del casco antiguo de Calpe. Gestión por email y disponibilidad 24/7.',
    url: 'https://enigmaconalma.com/reservas',
    type: 'website',
    images: [
      {
        url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
        width: 1200,
        height: 630,
        alt: 'Reservas Restaurante Enigma Calpe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Reservas Online - Enigma Calpe',
    description: 'Sistema de reservas online con pre-pedidos. Mesa garantizada en el casco antiguo.',
    images: ['https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421'],
  },
  alternates: {
    canonical: '/reservas',
  },
}

export default function ReservasLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
