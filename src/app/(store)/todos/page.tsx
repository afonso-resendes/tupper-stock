"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  useProducts,
  useCategories,
  useCollectionProducts,
} from "@/hooks/useShopify";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

// Component that uses useSearchParams
const ProductsPageContent = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const { addToCart, loading: cartLoading } = useCart();
  const { categories, loading: categoriesLoading } = useCategories();
  const searchParams = useSearchParams();

  // Get search query from URL params
  useEffect(() => {
    const search = searchParams.get("search");
    if (search) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  const formatPrice = (price: number) => {
    const formattedPrice = price.toFixed(2);
    return `${formattedPrice}€`;
  };

  // Function to open cart sidebar (we'll need to communicate with the navbar)
  const openCartSidebar = () => {
    // Dispatch a custom event to open the cart
    window.dispatchEvent(new CustomEvent("openCartSidebar"));
  };

  const sortOptions = [
    { id: "featured", name: "Em Destaque" },
    { id: "price-low", name: "Preço: Menor para Maior" },
    { id: "price-high", name: "Preço: Maior para Menor" },
    { id: "name", name: "Nome A-Z" },
    { id: "newest", name: "Mais Recentes" },
  ];

  // Find the selected category object
  const selectedCategoryObj = categories.find(
    (cat) => cat.title === selectedCategory
  );
  const isCollection = selectedCategoryObj?.handle;

  // Fetch products based on selection
  const {
    data: regularProducts,
    loading: regularLoading,
    error: regularError,
  } = useProducts({
    first: 50,
    category:
      !isCollection && selectedCategory !== "all"
        ? selectedCategory
        : undefined,
  });

  const {
    data: collectionProducts,
    loading: collectionLoading,
    error: collectionError,
  } = useCollectionProducts(isCollection ? selectedCategoryObj.handle! : "", {
    first: 50,
  });

  // Use appropriate data based on selection
  const data = isCollection ? collectionProducts : regularProducts;
  const loading = isCollection ? collectionLoading : regularLoading;
  const error = isCollection ? collectionError : regularError;

  const products = data?.products || [];

  // Filter out the delivery product
  const filteredProducts = products.filter(
    (product: any) => product.id !== "gid://shopify/Product/15259729035648"
  );

  // Filter products by search query
  const searchFilteredProducts = searchQuery
    ? filteredProducts.filter(
        (product: any) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredProducts;

  const sortedProducts = [...searchFilteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "name":
        return a.name.localeCompare(b.name);
      case "newest":
        return new Date(b.id).getTime() - new Date(a.id).getTime();
      default:
        return 0;
    }
  });

  const handleAddToCart = async (product: any) => {
    if (!product.availableForSale) {
      return;
    }

    // Get the first variant for now (you can add variant selection later)
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
      });

      // Auto-open the cart sidebar
      openCartSidebar();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">
            {searchQuery
              ? `Resultados para "${searchQuery}"`
              : "Todos os Produtos"}
          </h1>
          <p className="text-gray-600">
            {searchQuery
              ? `Encontrados ${sortedProducts.length} produtos para "${searchQuery}"`
              : "Descubra a nossa coleção completa de tupperware premium"}
          </p>
          {searchQuery && (
            <div className="mt-4">
              <button
                onClick={() => {
                  setSearchQuery("");
                  window.history.pushState({}, "", "/todos");
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                ← Voltar a todos os produtos
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4 sm:py-8">
        {/* Filters and Sort */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 space-y-4 md:space-y-0">
          {/* Categories */}
          <div className="w-full overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-2">
              {/* All Products button */}
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap ${
                  selectedCategory === "all"
                    ? "bg-black text-white shadow-md"
                    : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
                }`}
              >
                Todos os Produtos
              </button>

              {/* Dynamic categories */}
              {categoriesLoading
                ? // Loading skeleton for categories
                  Array.from({ length: 4 }).map((_, index) => (
                    <div
                      key={index}
                      className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse flex-shrink-0"
                    ></div>
                  ))
                : categories.map((category) => (
                    <button
                      key={category.title}
                      onClick={() => setSelectedCategory(category.title)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 whitespace-nowrap flex-shrink-0 ${
                        selectedCategory === category.title
                          ? "bg-black text-white shadow-md"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 hover:text-gray-900"
                      }`}
                    >
                      {category.title}
                    </button>
                  ))}
            </div>
          </div>

          {/* Sort */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <span className="text-sm font-medium text-gray-700">
              Ordenar por:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto px-4 py-3 sm:py-2 text-sm border-2 border-gray-300 bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black font-medium text-gray-700 hover:border-gray-400 transition-colors duration-200"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {loading ? (
            // Loading skeleton for products
            Array.from({ length: 8 }).map((_, index) => (
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
          ) : sortedProducts.length === 0 ? (
            // No products found
            <div className="col-span-full text-center py-12">
              <p className="text-gray-600">Nenhum produto encontrado.</p>
            </div>
          ) : (
            // Products grid
            sortedProducts.map((product) => (
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

                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 group-hover:text-gray-700 transition-colors line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3 flex-1">
                      {product.description}
                    </p>
                  </div>
                </Link>

                <div className="px-4 sm:px-6 pb-4 sm:pb-6 mt-auto space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
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
                    className={`w-full font-medium py-2.5 sm:py-2 px-3 sm:px-4 rounded-lg transition duration-200 cursor-pointer text-sm sm:text-base ${
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

        {/* Load More */}
        {data?.pageInfo.hasNextPage && (
          <div className="text-center mt-12">
            <button className="border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-4 px-8 rounded-lg transition duration-200">
              Carregar Mais Produtos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Main component wrapped in Suspense
const ProductsPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductsPageContent />
    </Suspense>
  );
};

export default ProductsPage;
