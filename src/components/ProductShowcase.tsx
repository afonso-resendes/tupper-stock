"use client";
import React from "react";
import { useCollectionProducts } from "@/hooks/useShopify";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

const ProductShowcase = () => {
  const { addToCart, loading: cartLoading } = useCart();

  // Fetch products from "Página inicial" collection
  const {
    data: collectionData,
    loading,
    error,
  } = useCollectionProducts("frontpage", {
    first: 4,
  });

  const formatPrice = (price: number) => {
    const formattedPrice = price.toFixed(2);
    return `${formattedPrice}€`;
  };

  const products = collectionData?.products || [];

  // Function to open cart sidebar
  const openCartSidebar = () => {
    window.dispatchEvent(new CustomEvent("openCartSidebar"));
  };

  const handleAddToCart = async (product: any) => {
    if (!product.availableForSale) {
      return;
    }

    // Get the first variant for now
    const variant = product.variants[0];
    if (!variant) {
      return;
    }

    try {
      await addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        variantId: variant.id,
        quantityAvailable: variant.quantityAvailable,
      });

      // Auto-open the cart sidebar
      openCartSidebar();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-4">
            Produtos em Destaque
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Descubra as nossas coleções de tupperware mais populares, concebidas
            para tornar o armazenamento de alimentos e preparação de refeições
            sem esforço e elegante.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {loading ? (
            // Loading skeleton for products
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="bg-white border border-gray-100 rounded-xl overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            // Error state
            <div className="col-span-full text-center py-12">
              <p className="text-red-600 mb-4">Erro ao carregar produtos</p>
              <p className="text-gray-600">{error}</p>
            </div>
          ) : products.length === 0 ? (
            // No products found
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Nenhum produto encontrado.</p>
            </div>
          ) : (
            // Products grid
            products.map((product: any) => (
              <div
                key={product.id}
                className="bg-white border border-gray-100 hover:border-gray-200 transition-colors duration-200 group rounded-xl overflow-hidden flex flex-col h-full"
              >
                <Link
                  href={`/produto/${product.handle}`}
                  className="block flex-1"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="w-16 h-16 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-base font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div
                      className="text-sm text-gray-600 mb-4 line-clamp-3 flex-1"
                      dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                  </div>
                </Link>

                <div className="px-6 pb-6 mt-auto space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {product.originalPrice &&
                      product.originalPrice > product.price ? (
                        <>
                          <span className="text-lg font-medium text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        </>
                      ) : (
                        <span className="text-lg font-medium text-gray-900">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          product.availableForSale
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-xs text-gray-500">
                        {product.availableForSale
                          ? product.totalInventory && product.totalInventory > 0
                            ? `${product.totalInventory} em stock`
                            : "Em stock"
                          : "Indisponível"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={!product.availableForSale || cartLoading}
                    className={`w-full font-medium py-2 px-4 rounded-lg transition duration-200 cursor-pointer ${
                      product.availableForSale && !cartLoading
                        ? "bg-black hover:bg-gray-800 text-white"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {cartLoading
                      ? "Adicionando..."
                      : product.availableForSale
                      ? "Adicionar"
                      : "Indisponível"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <Link href="/todos">
            <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition duration-200 cursor-pointer text-sm sm:text-base">
              Ver Todos os Produtos
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
