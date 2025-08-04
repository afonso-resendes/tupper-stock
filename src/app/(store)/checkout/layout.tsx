import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | TupperStock",
  description: "Finalize a sua compra de produtos Tupperware.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
