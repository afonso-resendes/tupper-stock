import { Metadata } from "next";

type Props = {
  params: Promise<{ handle: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params;

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "https://tupperstock.com"
      }/api/products/${handle}`
    );
    if (response.ok) {
      const product = await response.json();

      // Format price for display
      const formattedPrice = product.price
        ? `${product.price.toFixed(2)} €`
        : "";
      const availabilityText = product.availableForSale
        ? product.totalInventory && product.totalInventory > 0
          ? `Disponível para entrega (${product.totalInventory} em stock)`
          : "Disponível para entrega"
        : "Indisponível";

      // Create rich description with price and availability
      const richDescription = product.description
        ? `${product.description.substring(
            0,
            120
          )}... ${formattedPrice} - ${availabilityText}. Compre agora em TupperStock.`
        : `${product.name} - ${formattedPrice} - ${availabilityText}. Stock premium de Tupperware com entrega em Portugal.`;

      return {
        title: `${product.name} - ${formattedPrice} | TupperStock`,
        description: richDescription,
        keywords: [
          "tupper stock",
          "tupperware stock",
          product.name.toLowerCase(),
          "recipientes armazenamento",
          "tupperware portugal",
          "stock tupperware",
          "recipientes premium",
          "armazenamento alimentos",
          "comprar tupperware",
          "tupperware online",
        ],
        openGraph: {
          title: `${product.name} - ${formattedPrice}`,
          description: richDescription,
          url: `https://tupperstock.com/produto/${handle}`,
          type: "website",
          images: product.image
            ? [
                {
                  url: product.image,
                  width: 800,
                  height: 800,
                  alt: product.name,
                },
              ]
            : undefined,
        },
        twitter: {
          card: "summary_large_image",
          title: `${product.name} - ${formattedPrice}`,
          description: richDescription,
          images: product.image ? [product.image] : undefined,
        },
        alternates: {
          canonical: `/produto/${handle}`,
        },
        other: {
          "product:price:amount": product.price?.toString() || "",
          "product:price:currency": "EUR",
          "product:availability": product.availableForSale
            ? "in stock"
            : "out of stock",
          "product:condition": "new",
        },
      };
    }
  } catch (error) {
    console.error("Error generating product metadata:", error);
  }

  // Fallback metadata
  return {
    title: "Produto | TupperStock - Tupperware Stock Premium",
    description:
      "Compre produtos Tupperware em TupperStock. Stock premium com entrega em Portugal.",
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
