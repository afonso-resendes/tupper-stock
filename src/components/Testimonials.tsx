import React from "react";

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      name: "Maria Silva",
      role: "Chef Doméstica",
      rating: 5,
      content:
        "Estes recipientes de tupperware transformaram completamente a minha rotina de preparação de refeições. As vedações herméticas mantêm os meus alimentos frescos durante dias, e o design empilhável poupa tanto espaço na minha cozinha!",
      avatar: "MS",
    },
    {
      id: 2,
      name: "João Santos",
      role: "Pai Trabalhador",
      rating: 5,
      content:
        "Como pai ocupado, preciso de soluções de armazenamento de alimentos fiáveis. Estes recipientes são seguros para microondas, lava-louças e incrivelmente duráveis. Sobreviveram a inúmeras viagens para a escola e trabalho.",
      avatar: "JS",
    },
    {
      id: 3,
      name: "Ana Costa",
      role: "Entusiasta de Fitness",
      rating: 5,
      content:
        "Perfeito para a minha preparação de refeições! Os recipientes de controlo de porções ajudam-me a manter-me no caminho certo com os meus objetivos nutricionais. A qualidade é excecional e ficam ótimos no meu frigorífico.",
      avatar: "AC",
    },
    {
      id: 4,
      name: "Pedro Oliveira",
      role: "Chef Profissional",
      rating: 5,
      content:
        "Uso estes recipientes tanto em casa como no meu negócio de catering. A qualidade profissional e vedação fiável tornam-nos perfeitos para transportar alimentos com segurança. Altamente recomendado!",
      avatar: "PO",
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? "text-gray-900" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-24 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-light text-gray-900 mb-4">
            O que Dizem os Nossos Clientes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Junte-se a milhares de clientes satisfeitos que transformaram a sua
            experiência de armazenamento de alimentos com a nossa coleção
            premium de tupperware.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-white p-8 rounded-xl hover:shadow-sm transition-shadow duration-200"
            >
              <div className="flex items-center mb-4">
                {renderStars(testimonial.rating)}
              </div>

              <blockquote className="text-gray-700 mb-6 leading-relaxed text-sm">
                "{testimonial.content}"
              </blockquote>

              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-medium mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-medium text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
