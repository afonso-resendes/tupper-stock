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

      return {
        title: `${product.name} | TupperStock - Tupperware Stock Premium`,
        description: product.description
          ? `${product.description.substring(
              0,
              160
            )}... Compre agora em TupperStock. Stock premium de Tupperware.`
          : `Compre ${product.name} em TupperStock. Stock premium de Tupperware com entrega em Portugal.`,
        keywords: [
          "tupper stock",
          "tupperware stock",
          product.name.toLowerCase(),
          "recipientes armazenamento",
          "tupperware portugal",
          "stock tupperware",
          "recipientes premium",
          "armazenamento alimentos",
        ],
        openGraph: {
          title: `${product.name} | TupperStock`,
          description: product.description
            ? `${product.description.substring(
                0,
                160
              )}... Compre agora em TupperStock.`
            : `Compre ${product.name} em TupperStock. Stock premium de Tupperware.`,
          url: `https://tupperstock.com/produto/${handle}`,
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
          title: `${product.name} | TupperStock`,
          description: product.description
            ? `${product.description.substring(
                0,
                160
              )}... Compre agora em TupperStock.`
            : `Compre ${product.name} em TupperStock. Stock premium de Tupperware.`,
          images: product.image ? [product.image] : undefined,
        },
        alternates: {
          canonical: `/produto/${handle}`,
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
