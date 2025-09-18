import type { Metadata } from "next";
import { Toaster } from "sonner";
import { SupabaseProvider } from "@/components/providers/supabase-provider";
import { EnigmaThemeProvider } from "@/components/theme/theme-provider";
import { CartProvider } from "@/contexts/CartContext";
import { benaya, playfairDisplay, crimsonText, sourceSerif4, inter } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Panel de Administración - Enigma Cocina Con Alma",
    template: "%s | Admin Panel"
  },
  description: "Panel de gestión interno del restaurante Enigma Cocina Con Alma. Acceso privado para personal autorizado.",
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
        <EnigmaThemeProvider>
          <SupabaseProvider>
            <CartProvider>
              {children}
            </CartProvider>
          </SupabaseProvider>
        </EnigmaThemeProvider>
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
