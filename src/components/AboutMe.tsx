import React from "react";
import Link from "next/link";

const AboutMe = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Photo on the left */}
          <div className="relative order-2 lg:order-1">
            <div className="transform hover:translate-y-[-8px] transition-transform duration-300">
              <img
                src="/about-me.jpg"
                alt="Sobre Mim"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* Text content on the right */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-gray-900 leading-tight">
              Sobre Mim
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Olá! O meu nome é Manuela Macêdo e sou representante da icónica
              marca Tupperware desde 2011. Decidi inscrever-me para ganhar um
              extra e também ter para ter oportunidade de comprar os artigos com
              desconto.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Foi das melhores decisões da minha vida, uma vez que já era
              apaixonada pela marca, e juntar a necessidade, a praticidade e,
              acima de tudo, a qualidade facilitou essa minha opção. Ao longo
              dos anos, fiz novas amizades, vivi experiências incríveis, visitei
              vários países e o mais importante… mudei a vida de várias pessoas
              através da oportunidade de negócio.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Estou dedicada à Tupperware desde 2018. Têm sido anos de muito
              trabalho, mas também de muitas conquistas. Criei uma equipa grande
              e vencedora, e juntos vendemos milhares de produtos Tupperware,
              levando a casa dos clientes o melhor produto do mundo.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Infelizmente, em 2025, a Tupperware anunciou o encerramento da sua
              atividade na Europa. Como resultado dessa situação, fiquei com
              muito material em stock, produtos novos, nunca usados que agora
              merecem um novo lar.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Criei esta loja online com a ajuda do meu filho para facilitar
              esse processo.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Espero que gostem e que encontrem aqui algo útil e especial para
              facilitar o vosso dia-a-dia, poupando tempo, trabalho e energia.
            </p>

            {/* CTA Button */}
            <div className="pt-4 sm:pt-6">
              <Link href="/todos">
                <button className="bg-black hover:bg-gray-800 text-white font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition duration-200 cursor-pointer text-sm sm:text-base">
                  Ver Produtos
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutMe;
