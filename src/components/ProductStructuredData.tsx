import React from "react";

interface ProductStructuredDataProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string | null;
    availableForSale: boolean;
    totalInventory?: number;
  };
}

const ProductStructuredData: React.FC<ProductStructuredDataProps> = ({
  product,
}) => {
  const structuredData: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image || undefined,
    brand: {
      "@type": "Brand",
      name: "Tupperware",
    },
    offers: {
      "@type": "Offer",
      url: `https://tupperstock.com/produto/${product.id}`,
      priceCurrency: "EUR",
      price: product.price,
      availability: product.availableForSale
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "TupperStock",
        url: "https://tupperstock.com",
      },
      priceValidUntil: new Date(
        Date.now() + 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
    },
    condition: "https://schema.org/NewCondition",
  };

  if (product.originalPrice && product.originalPrice > product.price) {
    structuredData.offers.priceSpecification = {
      "@type": "PriceSpecification",
      price: product.price,
      priceCurrency: "EUR",
      valueAddedTaxIncluded: true,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
};

export default ProductStructuredData;
