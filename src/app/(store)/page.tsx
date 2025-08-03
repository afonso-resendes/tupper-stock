import { Metadata } from "next";
import Hero from "../../components/Hero";
import Features from "../../components/Features";
import ProductShowcase from "../../components/ProductShowcase";
import AboutMe from "../../components/AboutMe";
import Testimonials from "../../components/Testimonials";
import JoinUs from "../../components/JoinUs";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "TupperStock - Tupperware Premium Açores | Armazenamento de Alimentos",
  description:
    "TupperStock - Loja online de Tupperware nos Açores. Recipientes premium para armazenamento de alimentos, frescos por mais tempo. Entrega ao domicílio e levantamento local.",
  keywords: [
    "Tupperware Açores",
    "loja tupperware online",
    "recipientes armazenamento",
    "tupperware premium",
    "conservação alimentos",
    "organização cozinha açores",
  ],
  openGraph: {
    title: "TupperStock - Tupperware Premium Açores",
    description:
      "Loja online de Tupperware nos Açores. Recipientes premium para armazenamento de alimentos.",
    url: "https://tupperstock.pt",
    siteName: "TupperStock",
    locale: "pt_PT",
    type: "website",
  },
};

const Home = () => {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <AboutMe />
      <JoinUs />
      <Footer />
    </main>
  );
};

export default Home;
