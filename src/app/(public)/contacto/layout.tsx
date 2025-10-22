import type { Metadata } from 'next'
import { getRestaurant } from '@/lib/data/restaurant'

export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant()

  if (!restaurant) {
    throw new Error('⚠️ Configure restaurants table in database')
  }

  return {
    title: restaurant.meta_contacto_title,
    description: restaurant.meta_contacto_description,
    openGraph: {
      title: restaurant.meta_contacto_title,
      description: restaurant.meta_contacto_description,
      url: '/contacto',
      type: 'website',
      images: restaurant.default_hero_image_url ? [
        {
          url: restaurant.default_hero_image_url,
          width: 1200,
          height: 630,
          alt: `Contacto ${restaurant.name}`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: restaurant.meta_contacto_title,
      description: restaurant.meta_contacto_description,
      images: restaurant.default_hero_image_url ? [restaurant.default_hero_image_url] : [],
    },
    alternates: {
      canonical: '/contacto',
    },
  }
}

export default function ContactoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
