"use client";
import Navbar from "@/components/Navbar";
import { CartProvider } from "@/contexts/CartContext";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Component to handle scroll to top on navigation
function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top when pathname changes
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <ScrollToTop />
      <Navbar />
      {children}
    </CartProvider>
  );
}
