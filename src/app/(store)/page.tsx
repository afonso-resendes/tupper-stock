import { Metadata } from "next";
import Hero from "../../components/Hero";
import Features from "../../components/Features";
import ProductShowcase from "../../components/ProductShowcase";
import AboutMe from "../../components/AboutMe";
import Testimonials from "../../components/Testimonials";
import JoinUs from "../../components/JoinUs";
import Footer from "../../components/Footer";

export const metadata: Metadata = {
  title: "TupperStock - Tupperware Stock Açores | Comprar Online",
  description:
    "TupperStock - Loja online especializada em stock de Tupperware premium. Recipientes de armazenamento de alimentos de alta qualidade, frescos por mais tempo. Entrega em Portugal e Açores.",
  keywords: [
    "tupper stock",
    "tupperware stock",
    "tupperware",
    "recipientes armazenamento",
    "tupperware portugal",
    "stock tupperware",
    "recipientes premium",
    "conservação alimentos",
    "organização cozinha",
    "tupperware online",
    "recipientes plástico",
    "armazenamento alimentos",
    "tupperware açores",
    "loja tupperware",
    "tupper stock portugal",
  ],
  openGraph: {
    title: "TupperStock - Tupperware Stock Açores | Comprar Online",
    description:
      "TupperStock - Loja online especializada em stock de Tupperware premium. Recipientes de armazenamento de alimentos de alta qualidade, frescos por mais tempo.",
    url: "https://tupperstock.com",
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
