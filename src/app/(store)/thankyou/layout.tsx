import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Obrigado pela sua encomenda | TupperStock",
  description: "A sua encomenda foi recebida com sucesso.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ThankYouLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
