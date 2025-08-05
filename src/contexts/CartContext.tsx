"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  variantId: string;
  quantityAvailable?: number;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

interface CartContextType {
  cart: Cart;
  loading: boolean;
  isInitialized: boolean;
  addToCart: (product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    variantId: string;
    quantityAvailable?: number;
  }) => Promise<void>;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeFromCart: (variantId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("shopify-cart");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error("Error loading cart from localStorage:", error);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("shopify-cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = async (product: {
    id: string;
    name: string;
    price: number;
    image: string | null;
    variantId: string;
    quantityAvailable?: number;
  }) => {
    setLoading(true);
    try {
      setCart((prevCart) => {
        const existingItem = prevCart.items.find(
          (item) => item.variantId === product.variantId
        );

        // Check if we can add more of this item
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const availableStock = product.quantityAvailable || 0;

        // Allow adding to cart even if out of stock, but limit to available stock
        if (availableStock > 0 && currentQuantity >= availableStock) {
          // Cannot add more - stock limit reached
          return prevCart;
        }

        if (existingItem) {
          // Update quantity if item already exists
          const updatedItems = prevCart.items.map((item) =>
            item.variantId === product.variantId
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  quantityAvailable:
                    product.quantityAvailable || item.quantityAvailable,
                }
              : item
          );
          return {
            items: updatedItems,
            totalItems: prevCart.totalItems + 1,
            totalPrice: prevCart.totalPrice + product.price,
          };
        } else {
          // Add new item
          const newItem: CartItem = {
            ...product,
            quantity: 1,
          };
          return {
            items: [...prevCart.items, newItem],
            totalItems: prevCart.totalItems + 1,
            totalPrice: prevCart.totalPrice + product.price,
          };
        }
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    setCart((prevCart) => {
      const item = prevCart.items.find((item) => item.variantId === variantId);
      if (!item) return prevCart;

      if (quantity === 0) {
        // Remove item
        return {
          items: prevCart.items.filter((item) => item.variantId !== variantId),
          totalItems: prevCart.totalItems - item.quantity,
          totalPrice: prevCart.totalPrice - item.price * item.quantity,
        };
      } else {
        // Check stock limit - only apply if availableStock > 0
        const availableStock = item.quantityAvailable || 0;
        let actualQuantity = quantity;

        if (availableStock > 0) {
          actualQuantity = Math.min(quantity, availableStock);
        }

        // Update quantity
        const updatedItems = prevCart.items.map((item) => {
          if (item.variantId === variantId) {
            const quantityDiff = actualQuantity - item.quantity;
            return { ...item, quantity: actualQuantity };
          }
          return item;
        });

        const quantityDiff = actualQuantity - item.quantity;

        return {
          items: updatedItems,
          totalItems: prevCart.totalItems + quantityDiff,
          totalPrice: prevCart.totalPrice + item.price * quantityDiff,
        };
      }
    });
  };

  const removeFromCart = (variantId: string) => {
    updateQuantity(variantId, 0);
  };

  const clearCart = () => {
    setCart({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        isInitialized,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
