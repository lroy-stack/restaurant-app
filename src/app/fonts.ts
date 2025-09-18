import { Playfair_Display, Crimson_Text, Source_Serif_4, Inter } from "next/font/google";
import localFont from "next/font/local";

// Fuente local Benaya - Para títulos principales "Enigma"
export const benaya = localFont({
  src: "./fonts/benaya.ttf",
  variable: "--font-benaya",
  display: "swap",
});

// Fuentes Google - Sistema tipográfico completo
export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-playfair",
});

export const crimsonText = Crimson_Text({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-crimson",
});

export const sourceSerif4 = Source_Serif_4({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-source-serif",
});

export const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
});