import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// next/font fontları build sırasında indirip self-host eder; prototipteki
// Google Fonts @import'u gibi çalışma anında dış isteğe ihtiyaç duymaz.
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Fitness Takip",
  description: "Egzersiz ve beslenme takibi",
};

export const viewport: Viewport = {
  themeColor: "#17181B",
  width: "device-width",
  initialScale: 1,
  // Mobilde input'a odaklanınca sayfanın zoom yapmasını engeller
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      className={`${bebas.variable} ${inter.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
