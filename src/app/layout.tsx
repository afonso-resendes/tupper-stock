import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TupperStock - Tupperware Premium Açores | Armazenamento de Alimentos",
  description:
    "TupperStock - Loja online de Tupperware nos Açores. Recipientes premium para armazenamento de alimentos, frescos por mais tempo. Entrega ao domicílio e levantamento local. Qualidade garantida.",
  keywords: [
    "Tupperware",
    "Açores",
    "armazenamento alimentos",
    "recipientes plástico",
    "tupperware açores",
    "loja tupperware",
    "recipientes premium",
    "conservação alimentos",
    "organização cozinha",
    "tupperware online",
  ],
  authors: [{ name: "TupperStock" }],
  creator: "TupperStock",
  publisher: "TupperStock",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tupperstock.pt"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TupperStock - Tupperware Premium Açores",
    description:
      "Loja online de Tupperware nos Açores. Recipientes premium para armazenamento de alimentos, frescos por mais tempo.",
    url: "https://tupperstock.pt",
    siteName: "TupperStock",
    locale: "pt_PT",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TupperStock - Tupperware Premium Açores",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TupperStock - Tupperware Premium Açores",
    description:
      "Loja online de Tupperware nos Açores. Recipientes premium para armazenamento de alimentos.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
