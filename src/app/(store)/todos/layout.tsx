import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Todos os Produtos | TupperStock - Tupperware Stock Premium",
  description:
    "Descubra toda a nossa coleção de produtos Tupperware em stock. Recipientes premium para armazenamento de alimentos. Entrega em Portugal e Açores.",
  keywords: [
    "tupper stock",
    "tupperware stock",
    "produtos tupperware",
    "recipientes armazenamento",
    "tupperware portugal",
    "stock tupperware",
    "recipientes premium",
    "armazenamento alimentos",
    "catalogo tupperware",
    "comprar tupperware",
  ],
  openGraph: {
    title: "Todos os Produtos | TupperStock - Tupperware Stock Premium",
    description:
      "Descubra toda a nossa coleção de produtos Tupperware em stock. Recipientes premium para armazenamento de alimentos.",
    url: "https://tupperstock.com/todos",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "TupperStock - Catálogo de Produtos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Todos os Produtos | TupperStock",
    description:
      "Descubra toda a nossa coleção de produtos Tupperware em stock.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "/todos",
  },
};

export default function TodosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
