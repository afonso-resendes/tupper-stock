"use client";
import React, { useState } from "react";
import { useProduct, useRelatedProducts } from "@/hooks/useShopify";
import { useCart } from "@/contexts/CartContext";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProductStructuredData from "@/components/ProductStructuredData";
import BreadcrumbStructuredData from "@/components/BreadcrumbStructuredData";

const ProductPage = () => {
  const params = useParams();
  const handle = params.handle as string;
  const { data: product, loading, error } = useProduct(handle);
  const { addToCart, loading: cartLoading } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch related products
  const { data: relatedProducts, loading: relatedLoading } = useRelatedProducts(
    product?.id || "",
    4
  );

  // Debug: Log inventory data
  React.useEffect(() => {
    if (relatedProducts && relatedProducts.length > 0) {
      console.log(
        "Related products inventory:",
        relatedProducts.map((p) => ({
          name: p.name,
          availableForSale: p.availableForSale,
          totalInventory: p.totalInventory,
          type: typeof p.totalInventory,
        }))
      );
    }
  }, [relatedProducts]);

  // Function to open cart sidebar
  const openCartSidebar = () => {
    window.dispatchEvent(new CustomEvent("openCartSidebar"));
  };

  // Set default variant when product loads
  React.useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  // Set default image when product loads
  React.useEffect(() => {
    if (product && product.images && product.images.length > 0) {
      setSelectedImage(0);
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || !selectedVariant || !product.availableForSale) return;

    try {
      // Add the selected quantity to cart
      for (let i = 0; i < quantity; i++) {
        await addToCart({
          id: product.id,
          name: product.name,
          price: selectedVariant.price,
          image:
            (product.images && product.images[selectedImage]) || product.image,
          variantId: selectedVariant.id,
          quantityAvailable: selectedVariant.quantityAvailable,
        });
      }

      // Auto-open the cart sidebar
      openCartSidebar();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
              {/* Image skeleton */}
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
                <div className="flex space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-16 h-16 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Content skeleton */}
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">
              Produto não encontrado
            </h1>
            <p className="text-gray-600 mb-8">
              O produto que procura não existe ou foi removido.
            </p>
            <Link
              href="/todos"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Voltar aos Produtos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get all available images
  const allImages =
    product.images && product.images.length > 0
      ? product.images
      : product.image
      ? [product.image]
      : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {product && (
        <>
          <ProductStructuredData product={product} />
          <BreadcrumbStructuredData
            items={[
              { name: "Início", url: "/" },
              { name: "Produtos", url: "/todos" },
              { name: product.name, url: `/produto/${handle}` },
            ]}
          />
        </>
      )}
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-gray-900 transition-colors">
              Início
            </Link>
            <span>/</span>
            <Link
              href="/todos"
              className="hover:text-gray-900 transition-colors"
            >
              Produtos
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
            {/* Product Image Gallery */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4">
                {/* Main Image */}
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden">
                  {allImages.length > 0 ? (
                    <img
                      src={allImages[selectedImage]}
                      alt={`${product.name} - Imagem ${selectedImage + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-24 h-24 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Image Thumbnails */}
                {allImages.length > 1 && (
                  <div className="flex space-x-2 overflow-x-auto pb-2">
                    {allImages.map((image: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors duration-200 relative ${
                          selectedImage === index
                            ? "border-black"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${product.name} - Miniatura ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4 sm:space-y-6">
                {/* Product Title */}
                <h1 className="text-2xl sm:text-3xl font-light text-gray-900">
                  {product.name}
                </h1>

                {/* Price */}
                <div className="flex items-center space-x-3">
                  <span className="text-xl sm:text-2xl font-medium text-gray-900">
                    {selectedVariant?.price?.toFixed(2) ||
                      product.price.toFixed(2)}
                    €
                  </span>
                  {product.originalPrice &&
                    product.originalPrice > product.price && (
                      <span className="text-base sm:text-lg text-gray-400 line-through">
                        {product.originalPrice.toFixed(2)}€
                      </span>
                    )}
                </div>

                {/* Availability */}
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      product.availableForSale ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span
                    className={`text-sm font-medium ${
                      product.availableForSale
                        ? "text-gray-900"
                        : "text-red-600"
                    }`}
                  >
                    {product.availableForSale
                      ? product.totalInventory && product.totalInventory > 0
                        ? `${product.totalInventory} em stock`
                        : "Em stock"
                      : "Indisponível"}
                  </span>
                </div>

                {/* Description */}
                {product.description && (
                  <div className="prose prose-sm text-gray-600">
                    <div
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                )}

                {/* Variants */}
                {product.variants && product.variants.length > 1 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Variantes
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.map((variant: any) => (
                        <button
                          key={variant.id}
                          onClick={() => setSelectedVariant(variant)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg border-2 transition-colors duration-200 ${
                            selectedVariant?.id === variant.id
                              ? "border-black bg-black text-white"
                              : "border-gray-300 text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          {variant.title}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-900">
                    Quantidade
                  </h3>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded-lg hover:bg-gray-100 hover:border-gray-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span className="w-12 text-center text-lg font-semibold text-gray-900">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 flex items-center justify-center border-2 border-gray-400 rounded-lg hover:bg-gray-100 hover:border-gray-600 transition-colors duration-200"
                      >
                        <svg
                          className="w-5 h-5 text-gray-700"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAddToCart}
                  disabled={!product.availableForSale || cartLoading}
                  className={`w-full py-4 px-6 text-lg font-medium rounded-lg transition-colors duration-200 ${
                    product.availableForSale && !cartLoading
                      ? "bg-black hover:bg-gray-800 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {cartLoading
                    ? "Adicionando..."
                    : product.availableForSale
                    ? "Adicionar ao Carrinho"
                    : "Indisponível"}
                </button>

                {/* Product Info */}
                <div className="border-t border-gray-200 pt-6 space-y-4">
                  {product.productType && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tipo:</span>
                      <span className="text-gray-900">
                        {product.productType}
                      </span>
                    </div>
                  )}
                  {product.tags && product.tags.length > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tags:</span>
                      <span className="text-gray-900">
                        {product.tags.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* You May Also Like Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-2">
              Também pode gostar
            </h2>
            <p className="text-gray-600">
              Descubra outros produtos que podem interessar-lhe
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relatedProduct: any) => (
              <div
                key={relatedProduct.id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col h-full"
              >
                <Link href={`/produto/${relatedProduct.handle}`}>
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {relatedProduct.image ? (
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4 flex flex-col h-full">
                  <div className="flex-grow">
                    <Link href={`/produto/${relatedProduct.handle}`}>
                      <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-gray-700 transition-colors line-clamp-2 min-h-[2.5rem]">
                        {relatedProduct.name}
                      </h3>
                    </Link>
                    <div
                      className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1"
                      dangerouslySetInnerHTML={{
                        __html: relatedProduct.description,
                      }}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {relatedProduct.originalPrice &&
                        relatedProduct.originalPrice > relatedProduct.price ? (
                          <>
                            <span className="text-lg font-medium text-gray-900">
                              {relatedProduct.price.toFixed(2)}€
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {relatedProduct.originalPrice.toFixed(2)}€
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-medium text-gray-900">
                            {relatedProduct.price.toFixed(2)}€
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            relatedProduct.availableForSale
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        ></div>
                        <span className="text-xs text-gray-500">
                          {relatedProduct.availableForSale
                            ? relatedProduct.totalInventory &&
                              relatedProduct.totalInventory > 0
                              ? `${relatedProduct.totalInventory} em stock`
                              : "Em stock"
                            : "Indisponível"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        addToCart({
                          id: relatedProduct.id,
                          name: relatedProduct.name,
                          price: relatedProduct.price,
                          image: relatedProduct.image,
                          variantId: relatedProduct.variants?.[0]?.id,
                          quantityAvailable:
                            relatedProduct.variants?.[0]?.quantityAvailable,
                        });
                        openCartSidebar();
                      }}
                      disabled={!relatedProduct.availableForSale}
                      className={`w-full py-2 px-4 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        relatedProduct.availableForSale
                          ? "bg-black hover:bg-gray-800 text-white"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {relatedProduct.availableForSale
                        ? "Adicionar"
                        : "Indisponível"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;
