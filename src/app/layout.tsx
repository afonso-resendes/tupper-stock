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
  title: "TupperStock - Tupperware Stock Premium",
  description:
    "TupperStock - Loja online especializada em stock de Tupperware premium. Recipientes de armazenamento de alimentos de alta qualidade, frescos por mais tempo. Entrega em Portugal e Açores.",
  keywords: [
    "tupper stock",
    "tupperware stock",
    "tupperware",
    "recipientes armazenamento",
    "tupperware portugal",
    "stock tupperware",
    "recipientes premium",
    "conservação alimentos",
    "organização cozinha",
    "tupperware online",
    "recipientes plástico",
    "armazenamento alimentos",
    "tupperware açores",
    "loja tupperware",
    "tupper stock portugal",
  ],
  authors: [{ name: "TupperStock" }],
  creator: "TupperStock",
  publisher: "TupperStock",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tupperstock.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title:
      "TupperStock - Tupperware Stock Premium | Recipientes de Armazenamento",
    description:
      "TupperStock - Loja online especializada em stock de Tupperware premium. Recipientes de armazenamento de alimentos de alta qualidade, frescos por mais tempo.",
    url: "https://tupperstock.com",
    siteName: "TupperStock",
    locale: "pt_PT",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TupperStock - Tupperware Stock Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TupperStock - Tupperware Stock Premium",
    description:
      "Loja online especializada em stock de Tupperware premium. Recipientes de armazenamento de alimentos de alta qualidade.",
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
    google: "KsCZN0FyLMkYxtTiB_eIIcbKyVEejJKiVWzDiohYOGk",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "TupperStock",
    url: "https://tupperstock.com",
    logo: "https://tupperstock.com/logo.png",
    description:
      "Loja online especializada em stock de Tupperware premium. Recipientes de armazenamento de alimentos de alta qualidade.",
    address: {
      "@type": "PostalAddress",
      addressCountry: "PT",
      addressRegion: "Açores",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+351-917-391-005",
      contactType: "customer service",
    },
    sameAs: [
      "https://www.facebook.com/tupperstock",
      "https://www.instagram.com/tupperstock",
    ],
  };

  return (
    <html lang="pt">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
