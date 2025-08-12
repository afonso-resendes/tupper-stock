"use client";

import React from "react";

const JoinUs = () => {
  const handleCall = () => {
    window.location.href = "tel:917391005";
  };

  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Text content on the left */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light text-gray-900 leading-tight">
              Também queres juntar-te à Tupperware?
            </h2>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Felizmente, a Tupperware anunciou que irá retomar a sua atividade
              em breve!
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Se gostavas de fazer parte deste mundo e gerar uma renda extra,
              entra em contacto comigo.
            </p>
            <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Vamos nesta aventura juntos!
            </p>

            {/* Contact info and CTA */}
            <div className="space-y-4 pt-4 sm:pt-6">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-gray-400 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span className="text-base sm:text-lg text-gray-700 font-medium">
                  917 391 005
                </span>
              </div>

              <button
                onClick={handleCall}
                className="bg-black hover:bg-gray-800 text-white font-medium py-3 sm:py-4 px-6 sm:px-8 rounded-lg transition duration-200 cursor-pointer text-sm sm:text-base"
              >
                Entrar em contacto
              </button>
            </div>
          </div>

          {/* Image on the right */}
          <div className="relative order-1 lg:order-2">
            <div className="transform hover:translate-y-[-8px] transition-transform duration-300">
              <img
                src="/join-us.jpg"
                alt="Juntar-se à Tupperware"
                className="w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUs;
