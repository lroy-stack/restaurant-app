import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Acceso Administrativo - Enigma Cocina Con Alma',
  description: 'Panel de autenticación para personal autorizado',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
  other: {
    'X-Robots-Tag': 'noindex, nofollow, nosnippet, noarchive'
  },
}

export default function AlmaEnigmaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}