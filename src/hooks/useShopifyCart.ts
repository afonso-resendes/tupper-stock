import { useState, useEffect } from "react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string | null;
  variantId: string;
}

interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export function useShopifyCart() {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [loading, setLoading] = useState(false);

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
  }) => {
    setLoading(true);
    try {
      setCart((prevCart) => {
        const existingItem = prevCart.items.find(
          (item) => item.variantId === product.variantId
        );

        if (existingItem) {
          // Update quantity if item already exists
          const updatedItems = prevCart.items.map((item) =>
            item.variantId === product.variantId
              ? { ...item, quantity: item.quantity + 1 }
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
      if (quantity === 0) {
        // Remove item
        const itemToRemove = prevCart.items.find(
          (item) => item.variantId === variantId
        );
        if (!itemToRemove) return prevCart;

        return {
          items: prevCart.items.filter((item) => item.variantId !== variantId),
          totalItems: prevCart.totalItems - itemToRemove.quantity,
          totalPrice:
            prevCart.totalPrice - itemToRemove.price * itemToRemove.quantity,
        };
      } else {
        // Update quantity
        const updatedItems = prevCart.items.map((item) => {
          if (item.variantId === variantId) {
            const quantityDiff = quantity - item.quantity;
            return { ...item, quantity };
          }
          return item;
        });

        const item = prevCart.items.find(
          (item) => item.variantId === variantId
        );
        if (!item) return prevCart;

        const quantityDiff = quantity - item.quantity;

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

  return {
    cart,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  };
}
