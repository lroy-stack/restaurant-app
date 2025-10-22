import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { QueryClientProvider } from "@/components/providers/query-client-provider";
import { EnigmaThemeProvider } from "@/components/theme/theme-provider";
import { PerformanceProvider, PerformanceDebugger } from "@/components/performance/performance-provider";
import { CartProvider } from "@/contexts/CartContext";
import { ScrollProvider } from "@/contexts/ScrollContext";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { ScrollToTop } from "@/components/layout/ScrollToTop";
import { benaya, playfairDisplay, crimsonText, sourceSerif4, inter } from "./fonts";
import { getRestaurant } from "@/lib/data/restaurant";
import "./globals.css";

/**
 * Dynamic Metadata - 100% from DB
 * NO fallbacks, NO hardcode
 */
export async function generateMetadata(): Promise<Metadata> {
  const restaurant = await getRestaurant()

  if (!restaurant) {
    throw new Error('⚠️ DATABASE NOT CONNECTED - Configure restaurants table in Supabase')
  }

  return {
    title: {
      default: `${restaurant.name} - Restaurante en el Casco Antiguo de Calpe`,
      template: `%s | ${restaurant.name}`
    },
    description: restaurant.description,
    keywords: `restaurante Calpe, ${restaurant.name}, casco antiguo Calpe, cocina mediterránea, ${restaurant.address}`,
    authors: [{ name: restaurant.name }],
    creator: restaurant.name,
    publisher: restaurant.name,
    metadataBase: new URL('https://www.enigmaconalma.com'),
    alternates: {
      canonical: '/',
    },
    openGraph: {
      type: 'website',
      locale: 'es_ES',
      url: 'https://www.enigmaconalma.com',
      siteName: restaurant.name,
      title: `${restaurant.name} - Restaurante en el Casco Antiguo de Calpe`,
      description: restaurant.description,
      images: restaurant.default_hero_image_url ? [
        {
          url: restaurant.default_hero_image_url,
          width: 1200,
          height: 630,
          alt: `${restaurant.name} - Restaurante Calpe`,
        },
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${restaurant.name} - Restaurante en Calpe`,
      description: restaurant.description,
      images: restaurant.default_hero_image_url ? [restaurant.default_hero_image_url] : [],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5, // Permite zoom accesible pero previene auto-zoom en inputs
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      className={`${benaya.variable} ${playfairDisplay.variable} ${crimsonText.variable} ${sourceSerif4.variable} ${inter.variable}`}
    >
      <body className="font-sans antialiased min-h-screen bg-background">
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <PerformanceProvider>
          <EnigmaThemeProvider>
            <QueryClientProvider>
              <SupabaseProvider>
                <ScrollProvider>
                  <CartProvider>
                    <ScrollToTop />
                    {children}
                    <PerformanceDebugger />
                  </CartProvider>
                </ScrollProvider>
              </SupabaseProvider>
            </QueryClientProvider>
          </EnigmaThemeProvider>
        </PerformanceProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            },
          }}
        />
      </body>
    </html>
  );
}
// Deploy trigger 1760802278
