import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { QueryClientProvider } from "@/components/providers/query-client-provider";
import { EnigmaThemeProvider } from "@/components/theme/theme-provider";
import { PerformanceProvider, PerformanceDebugger } from "@/components/performance/performance-provider";
import { CartProvider } from "@/contexts/CartContext";
import { ScrollProvider } from "@/contexts/ScrollContext";
import { benaya, playfairDisplay, crimsonText, sourceSerif4, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Enigma Cocina Con Alma - Restaurante en el Casco Antiguo de Calpe",
    template: "%s | Enigma Calpe"
  },
  description: "Cocina mediterránea de autor en el corazón del casco antiguo de Calpe desde 2023. Ingredientes de proximidad, producto de temporada, técnicas tradicionales. Carrer Justicia 6A. Reserva online con pre-pedidos.",
  keywords: "restaurante Calpe, casco antiguo Calpe, cocina mediterránea de autor, restaurante 2023 Calpe, ingredientes de proximidad, producto temporada, pre-pedidos restaurante, reserva online Calpe, Carrer Justicia",
  authors: [{ name: "Enigma Cocina Con Alma" }],
  creator: "Enigma Cocina Con Alma",
  publisher: "Enigma Cocina Con Alma",
  metadataBase: new URL('https://www.enigmaconalma.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://www.enigmaconalma.com',
    siteName: 'Enigma Cocina Con Alma',
    title: 'Enigma Cocina Con Alma - Restaurante en el Casco Antiguo de Calpe',
    description: 'Cocina mediterránea de autor en el corazón del casco antiguo de Calpe desde 2023. Ingredientes de proximidad y producto de temporada.',
    images: [
      {
        url: 'https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421',
        width: 1200,
        height: 630,
        alt: 'Enigma Cocina Con Alma - Restaurante Calpe',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Enigma Cocina Con Alma - Restaurante en Calpe',
    description: 'Cocina mediterránea de autor en el casco antiguo de Calpe. Ingredientes de proximidad, producto de temporada.',
    images: ['https://ik.imagekit.io/insomnialz/enigma-dark.png?updatedAt=1754141731421'],
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
  verification: {
    google: 'verification_token',
  },
};

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
        <PerformanceProvider>
          <EnigmaThemeProvider>
            <QueryClientProvider>
              <SupabaseProvider>
                <ScrollProvider>
                  <CartProvider>
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
