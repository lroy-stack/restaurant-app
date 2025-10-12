import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuestra Historia - Restaurante Enigma Calpe | Fundado 2023',
  description: 'Conoce la historia de Enigma Cocina Con Alma, fundado en 2023 en el corazón del casco antiguo de Calpe. Tradición mediterránea, ingredientes de proximidad y pasión culinaria. Rating Google 4.8/5.',
  keywords: 'historia enigma calpe, restaurante 2023 calpe, casco antiguo calpe, tradición mediterránea, cocina con alma, chef enigma, restaurante nuevo calpe',
  openGraph: {
    title: 'Nuestra Historia - Enigma Cocina Con Alma | Calpe desde 2023',
    description: 'Descubre cómo nació Enigma en 2023 en el corazón histórico de Calpe. Tradición, pasión y cocina mediterránea de autor.',
    url: 'https://enigmaconalma.com/historia',
    type: 'website',
    images: [
      {
        url: 'https://ik.imagekit.io/insomnialz/_DSC0559.jpg?tr=w-1200,h-630,c-at_max,f-auto,q-auto',
        width: 1200,
        height: 630,
        alt: 'Historia Restaurante Enigma Calpe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nuestra Historia - Enigma Calpe',
    description: 'Fundado en 2023 en el casco antiguo de Calpe. Tradición mediterránea y pasión culinaria.',
    images: ['https://ik.imagekit.io/insomnialz/_DSC0559.jpg?tr=w-1200,h-630,c-at_max,f-auto,q-auto'],
  },
  alternates: {
    canonical: '/historia',
  },
}

export default function HistoriaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
