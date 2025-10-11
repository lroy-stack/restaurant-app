import { Metadata } from 'next'

export const getPageMetadata = (page: string): Metadata => {
  const baseUrl = 'https://www.enigmaconalma.com'

  const metadataMap: Record<string, Metadata> = {
    home: {
      title: 'Enigma Cocina Con Alma - Restaurante en el Casco Antiguo de Calpe',
      description: 'Cocina de autor en el corazón histórico de Calpe. Fusionamos tradición atlántica y mediterránea en un ambiente auténtico. Reserva tu mesa en Carrer Justicia 6A.',
      alternates: {
        canonical: baseUrl,
      },
      openGraph: {
        title: 'Enigma Cocina Con Alma - Restaurante en el Casco Antiguo de Calpe',
        description: 'Cocina de autor en el corazón histórico de Calpe. Fusionamos tradición atlántica y mediterránea en un ambiente auténtico.',
        url: baseUrl,
        images: [{
          url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
          width: 1200,
          height: 630,
          alt: 'Enigma Cocina Con Alma - Restaurante Calpe',
        }],
      },
    },
    historia: {
      title: 'Nuestra Historia - Tradición y Pasión en Calpe',
      description: 'Descubre la historia de Enigma, donde cada plato cuenta una tradición. Ubicados en el casco histórico de Calpe, ofrecemos una experiencia culinaria auténtica desde hace años.',
      alternates: {
        canonical: `${baseUrl}/historia`,
      },
      openGraph: {
        title: 'Nuestra Historia - Enigma Cocina Con Alma',
        description: 'Descubre la historia de Enigma en el casco antiguo de Calpe. Tradición, pasión y sabores únicos.',
        url: `${baseUrl}/historia`,
        images: [{
          url: 'https://ik.imagekit.io/insomnialz/_DSC0559.jpg?tr=w-1920,h-1080,c-at_max,f-auto,q-auto,pr-true',
          width: 1200,
          height: 630,
          alt: 'Historia de Enigma Restaurante Calpe',
        }],
      },
    },
    menu: {
      title: 'Nuestro Menú - Cocina Mediterránea de Autor',
      description: 'Explora nuestra carta de cocina atlántica-mediterránea. Ingredientes premium, platos de temporada y maridajes seleccionados en el casco antiguo de Calpe.',
      alternates: {
        canonical: `${baseUrl}/menu`,
      },
      openGraph: {
        title: 'Nuestro Menú - Enigma Cocina Con Alma',
        description: 'Cocina atlántica-mediterránea de autor. Ingredientes premium y platos de temporada.',
        url: `${baseUrl}/menu`,
        images: [{
          url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
          width: 1200,
          height: 630,
          alt: 'Menú Enigma Restaurante Calpe',
        }],
      },
    },
    reservas: {
      title: 'Reservar Mesa - Enigma Cocina Con Alma Calpe',
      description: 'Reserva tu mesa en Enigma. Casco antiguo de Calpe, ambiente histórico auténtico. Lun-Sáb 18:30-23:00. +34 672 79 60 06. Reserva online disponible.',
      alternates: {
        canonical: `${baseUrl}/reservas`,
      },
      openGraph: {
        title: 'Reservar Mesa - Enigma Cocina Con Alma',
        description: 'Reserva tu mesa en el casco antiguo de Calpe. Ambiente histórico y cocina de autor.',
        url: `${baseUrl}/reservas`,
        images: [{
          url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
          width: 1200,
          height: 630,
          alt: 'Reservar Mesa Enigma Calpe',
        }],
      },
    },
    contacto: {
      title: 'Contacto - Enigma Restaurante Calpe',
      description: 'Encuéntranos en Carrer Justicia 6A, casco antiguo de Calpe. Reservas: +34 672 79 60 06. Email: reservas@enigmaconalma.com. Horario: Lun-Sáb 18:30-23:00.',
      alternates: {
        canonical: `${baseUrl}/contacto`,
      },
      openGraph: {
        title: 'Contacto - Enigma Cocina Con Alma',
        description: 'Carrer Justicia 6A, Calpe. Tel: +34 672 79 60 06. Email: reservas@enigmaconalma.com',
        url: `${baseUrl}/contacto`,
        images: [{
          url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
          width: 1200,
          height: 630,
          alt: 'Contacto Enigma Calpe',
        }],
      },
    },
    galeria: {
      title: 'Galería - Ambiente y Platos de Enigma Calpe',
      description: 'Descubre nuestro ambiente histórico y nuestros platos de autor. Imágenes del restaurante en el casco antiguo de Calpe. Experiencia visual única.',
      alternates: {
        canonical: `${baseUrl}/galeria`,
      },
      openGraph: {
        title: 'Galería - Enigma Cocina Con Alma',
        description: 'Descubre el ambiente y platos de Enigma. Fotografías de nuestro restaurante en Calpe.',
        url: `${baseUrl}/galeria`,
        images: [{
          url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
          width: 1200,
          height: 630,
          alt: 'Galería Enigma Restaurante Calpe',
        }],
      },
    },
  }

  return metadataMap[page] || {}
}

// LocalBusiness JSON-LD Schema
export const getLocalBusinessSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Enigma Cocina Con Alma',
    image: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
    '@id': 'https://www.enigmaconalma.com',
    url: 'https://www.enigmaconalma.com',
    telephone: '+34672796006',
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Carrer Justicia 6A',
      addressLocality: 'Calpe',
      postalCode: '03710',
      addressRegion: 'Alicante',
      addressCountry: 'ES',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 38.6393,
      longitude: -0.0404,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '18:30',
        closes: '23:00',
      },
    ],
    servesCuisine: ['Mediterránea', 'Atlántica', 'Cocina de Autor'],
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '230',
    },
    description: 'Cocina de autor en el corazón histórico de Calpe. Fusionamos tradición atlántica y mediterránea en un ambiente auténtico.',
  }
}
