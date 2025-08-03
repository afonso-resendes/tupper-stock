"use client";
import React, { useState, useEffect } from "react";
import CartSidebar from "./CartSidebar";
import SearchModule from "./SearchModule";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";

const Navbar = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { cart, updateQuantity, removeFromCart } = useCart();

  // Listen for custom event to open cart sidebar
  useEffect(() => {
    const handleOpenCart = () => {
      setIsCartOpen(true);
    };

    window.addEventListener("openCartSidebar", handleOpenCart);

    return () => {
      window.removeEventListener("openCartSidebar", handleOpenCart);
    };
  }, []);

  const handleUpdateQuantity = (variantId: string, quantity: number) => {
    updateQuantity(variantId, quantity);
  };

  const handleRemoveItem = (variantId: string) => {
    removeFromCart(variantId);
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <span className="text-xl font-medium text-gray-900">
                TupperStock
              </span>
            </Link>

            {/* Right side - Search, Cart */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 transition-colors duration-200 cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {/* Shopping Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative flex items-center justify-center w-10 h-10 text-gray-600 hover:text-gray-900 transition-colors duration-200 group cursor-pointer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                {cart.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center group-hover:bg-gray-800 transition-colors duration-200">
                    {cart.totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart.items}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        totalPrice={cart.totalPrice}
      />

      {/* Search Module */}
      <SearchModule
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
};

export default Navbar;
