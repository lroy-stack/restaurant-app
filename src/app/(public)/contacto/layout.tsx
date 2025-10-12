import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto - Restaurante Enigma Calpe | +34 672 79 60 06',
  description: 'Contacta con Enigma Cocina Con Alma en Calpe. Teléfono: +34 672 79 60 06 | Email: reservas@enigmaconalma.com | Dirección: Carrer Justicia 6A, 03710 Calpe, Alicante. Horario: Mar-Sáb 13:00-16:00 y 18:30-23:00.',
  keywords: 'contacto enigma calpe, teléfono restaurante calpe, email enigma, dirección enigma calpe, carrer justicia calpe, horario restaurante calpe',
  openGraph: {
    title: 'Contacto - Enigma Cocina Con Alma | Calpe',
    description: 'Reservas e información: +34 672 79 60 06 | reservas@enigmaconalma.com | Carrer Justicia 6A, casco antiguo de Calpe.',
    url: 'https://enigmaconalma.com/contacto',
    type: 'website',
    images: [
      {
        url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
        width: 1200,
        height: 630,
        alt: 'Contacto Restaurante Enigma Calpe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto - Enigma Calpe',
    description: '📞 +34 672 79 60 06 | 📧 reservas@enigmaconalma.com | 📍 Carrer Justicia 6A, Calpe',
    images: ['https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421'],
  },
  alternates: {
    canonical: '/contacto',
  },
}

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
