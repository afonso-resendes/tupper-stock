"use client";
import React, { useState, useEffect, useRef } from "react";
import { useProducts } from "@/hooks/useShopify";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

interface SearchModuleProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModule = ({ isOpen, onClose }: SearchModuleProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { addToCart, loading: cartLoading } = useCart();

  // Fetch products for search
  const {
    data: searchData,
    loading: searchLoading,
    error: searchError,
  } = useProducts({
    first: 20,
    search: searchQuery.length > 2 ? searchQuery : "",
  });

  const formatPrice = (price: number) => {
    const formattedPrice = price.toFixed(2);
    return `${formattedPrice}€`;
  };

  // Filter out delivery product
  const filteredProducts = (searchData?.products || []).filter(
    (product: any) => product.id !== "gid://shopify/Product/15259729035648"
  );

  // Filter products based on search query
  const searchResults = filteredProducts.filter(
    (product: any) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Function to open cart sidebar
  const openCartSidebar = () => {
    window.dispatchEvent(new CustomEvent("openCartSidebar"));
  };

  const handleAddToCart = async (product: any) => {
    if (!product.availableForSale) {
      return;
    }

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

      openCartSidebar();
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  // Handle escape key to close search
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Focus the search input when opened
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`bg-white shadow-lg border border-gray-200 rounded-full transition-all duration-300 ease-out ${
          isOpen ? "translate-y-0 opacity-100" : "translate-y-[-20px] opacity-0"
        }`}
        style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: isOpen
            ? "translateX(-50%)"
            : "translateX(-50%) translateY(-20px)",
          width: "90vw",
          maxWidth: "400px",
        }}
      >
        <div className="px-4 py-4">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar produtos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim()) {
                  onClose();
                  window.location.href = `/todos?search=${encodeURIComponent(
                    searchQuery.trim()
                  )}`;
                }
              }}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-gray-900 placeholder-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModule;
