"use client";
import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const ThankYouContent = () => {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState<string>("");
  const { clearCart } = useCart();

  useEffect(() => {
    // Get order number from URL params
    const orderNum = searchParams.get("order");
    if (orderNum) {
      setOrderNumber(orderNum);
    }

    // Clear cart when thank you page loads
    clearCart();
  }, [searchParams]); // Removed clearCart from dependencies

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8 text-center">
          {/* Success Icon */}
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Obrigado pela sua encomenda!
          </h1>

          <p className="text-base sm:text-lg text-gray-600 mb-6">
            A sua encomenda foi recebida com sucesso.
          </p>

          {/* Order Number */}
          {orderNumber && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 sm:mb-8">
              <p className="text-sm text-gray-600 mb-2">Número da Encomenda:</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900">
                {orderNumber}
              </p>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 text-left">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Próximos Passos:
            </h2>
            <div className="space-y-2 sm:space-y-3 text-sm text-gray-700">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Confirmação:</strong> Receberá um email de confirmação
                  em breve.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Pagamento:</strong> O pagamento será efetuado no ato
                  da entrega.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-600 rounded-full mt-2 flex-shrink-0"></div>
                <p>
                  <strong>Entrega:</strong> Entraremos em contacto para agendar
                  a entrega.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Precisa de ajuda?
            </h2>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">
              Se tiver alguma questão sobre a sua encomenda, não hesite em
              contactar-nos.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-3">
                <p>📞 Telefone: +351 917 391 005</p>
                <div className="hidden sm:flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigator.clipboard
                        .writeText("+351917391005")
                        .then(() => {
                          // Optional: Show a brief success message
                          const button =
                            document.activeElement as HTMLButtonElement;
                          const originalHTML = button.innerHTML;
                          button.innerHTML = `
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        `;
                          button.classList.add("text-green-600");
                          setTimeout(() => {
                            button.innerHTML = originalHTML;
                            button.classList.remove("text-green-600");
                          }, 2000);
                        })
                        .catch((err) => {
                          console.error("Failed to copy phone number: ", err);
                        });
                    }}
                    className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    title="Copiar número de telefone"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                  <a
                    href="tel:+351917391005"
                    className="p-1 text-gray-600 hover:text-gray-800 transition-colors duration-200"
                    title="Ligar diretamente"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link
              href="/"
              className="bg-black text-white px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-sm sm:text-base text-center"
            >
              Voltar à Página Inicial
            </Link>
            <Link
              href="/todos"
              className="bg-white text-black border-2 border-black px-4 sm:px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 font-medium text-sm sm:text-base text-center"
            >
              Continuar a Comprar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const ThankYouPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-6">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-pulse">
                <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-6"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ThankYouContent />
    </Suspense>
  );
};

export default ThankYouPage;
