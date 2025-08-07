"use client";
import React, { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

type DeliveryOption = "pickup" | "delivery";

const CheckoutPage = () => {
  const { cart, clearCart, isInitialized } = useCart();
  const router = useRouter();

  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | null>(
    null
  );
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Form states for pickup
  const [pickupForm, setPickupForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Form states for delivery
  const [deliveryForm, setDeliveryForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    city: "",
    postalCode: "",
  });

  const deliveryLocations = ["Ponta Delgada", "Lagoa", "Ribeira Grande"];

  // Function to get postal code prefix based on location
  const getPostalCodePrefix = (location: string) => {
    switch (location) {
      case "Ponta Delgada":
        return "9500";
      case "Ribeira Grande":
        return "9600";
      case "Lagoa":
        return "9560";
      default:
        return "";
    }
  };

  const handlePickupFormChange = (field: string, value: string) => {
    setPickupForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeliveryFormChange = (field: string, value: string) => {
    setDeliveryForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Prepare order data
      const orderData = {
        items: cart.items,
        deliveryOption,
        pickupForm: deliveryOption === "pickup" ? pickupForm : null,
        deliveryForm: deliveryOption === "delivery" ? deliveryForm : null,
        selectedLocation:
          deliveryOption === "delivery" ? selectedLocation : null,
        totalPrice: cart.totalPrice,
      };

      // Call Shopify API to create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order");
      }

      if (result.success) {
        // Redirect to thank you page with order number first
        const redirectUrl = `/thankyou?order=${result.order.name}`;
        router.push(redirectUrl);

        // Clear the cart after a short delay to ensure redirect happens
        setTimeout(() => {
          clearCart();
        }, 1000);
      } else {
        throw new Error("Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setError(error instanceof Error ? error.message : "Erro ao criar pedido");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading state while cart is being initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <h1 className="text-2xl font-medium text-gray-900 mb-4">
              A carregar...
            </h1>
            <p className="text-gray-600">
              A carregar o seu carrinho de compras.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show empty cart message only if cart is initialized and actually empty
  if (isInitialized && cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-gray-900 mb-4">
              Carrinho Vazio
            </h1>
            <p className="text-gray-600 mb-8">
              O seu carrinho está vazio. Adicione produtos para continuar.
            </p>
            <Link
              href="/todos"
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              Continuar a Comprar
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12">
          {/* Order Summary */}
          <div className="lg:order-2">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8">
                <h2 className="text-xl sm:text-2xl font-medium text-gray-900 mb-6 sm:mb-8">
                  Resumo do Pedido
                </h2>

                {/* Cart Items */}
                <div className="space-y-6 mb-8">
                  {cart.items.map((item) => (
                    <div
                      key={item.variantId}
                      className="flex items-center space-x-4"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <svg
                            className="w-10 h-10 text-gray-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Quantidade: {item.quantity}
                        </p>
                      </div>
                      <div className="text-base font-medium text-gray-900">
                        {(item.price * item.quantity).toFixed(2)}€
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-gray-900">
                        Subtotal:
                      </span>
                      <span className="text-lg font-medium text-gray-900">
                        {cart.totalPrice.toFixed(2)}€
                      </span>
                    </div>

                    {deliveryOption === "delivery" && (
                      <div className="flex justify-between items-center">
                        <span className="text-base text-gray-700">
                          Taxa de Entrega:
                        </span>
                        <span className="text-base font-medium text-gray-900">
                          5,00€
                        </span>
                      </div>
                    )}

                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-medium text-gray-900">
                          Total:
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          {deliveryOption === "delivery"
                            ? (cart.totalPrice + 5).toFixed(2)
                            : cart.totalPrice.toFixed(2)}
                          €
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:order-1">
            <div className="bg-white rounded-xl shadow-sm p-8">
              <h2 className="text-2xl font-medium text-gray-900 mb-8">
                Opções de Entrega
              </h2>

              {/* Delivery Options */}
              <div className="space-y-4 mb-10">
                <button
                  onClick={() => setDeliveryOption("pickup")}
                  className={`w-full p-6 border-2 rounded-lg text-left transition-colors duration-200 ${
                    deliveryOption === "pickup"
                      ? "border-black bg-black text-white"
                      : "border-gray-400 bg-white text-gray-900 hover:border-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    <div>
                      <h3 className="text-lg font-medium">
                        Levantamento Local
                      </h3>
                      <p className="text-sm opacity-80 mt-1">
                        Levante no nosso posto
                      </p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setDeliveryOption("delivery")}
                  className={`w-full p-6 border-2 rounded-lg text-left transition-colors duration-200 ${
                    deliveryOption === "delivery"
                      ? "border-black bg-black text-white"
                      : "border-gray-400 bg-white text-gray-900 hover:border-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <svg
                      className="w-8 h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <div>
                      <h3 className="text-lg font-medium">
                        Entrega ao Domicílio
                      </h3>
                      <p className="text-sm opacity-80 mt-1">
                        Entrega na sua casa • Taxa de 5,00€
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Pickup Form */}
              {deliveryOption === "pickup" && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-6">
                      Levantamento Local
                    </h3>
                    <div className="bg-gray-50 p-4 sm:p-6 rounded-lg mb-8">
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-gray-700">
                          <strong>Endereço:</strong>
                          <br />
                          Rua Agostinho Cymbron 3, Fajã de Baixo
                          <br />
                          9500-445 Ponta Delgada
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Nome Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={pickupForm.name}
                        onChange={(e) =>
                          handlePickupFormChange("name", e.target.value)
                        }
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                        placeholder="Digite o seu nome completo"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={pickupForm.email}
                        onChange={(e) =>
                          handlePickupFormChange("email", e.target.value)
                        }
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                        placeholder="Digite o seu email"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-medium text-gray-700 mb-3">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        required
                        value={pickupForm.phone}
                        onChange={(e) =>
                          handlePickupFormChange("phone", e.target.value)
                        }
                        className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                        placeholder="Digite o seu telefone"
                      />
                    </div>
                    {/* Pickup Hours Disclaimer */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
                      <h4 className="text-base font-medium text-gray-900 mb-2">
                        Horário de Levantamento
                      </h4>
                      <p className="text-sm text-gray-700">
                        <strong>
                          Segunda a sexta, das 17:00 às 20:00, com marcação.
                        </strong>
                      </p>
                      <p className="text-sm text-gray-700 mt-2">
                        Pode entrar em contacto connosco, caso contrário iremos
                        entrar em contacto consigo.
                      </p>
                      <div className="flex items-center space-x-2 mt-3 pt-3 border-t border-gray-200">
                        <svg
                          className="w-4 h-4 text-gray-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900">
                          917 391 005
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                      <p className="text-red-800 text-sm">
                        <strong>Erro:</strong> {error}
                      </p>
                    </div>
                  )}

                  {/* Payment and Delivery Terms Notice */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                    <h4 className="text-base font-medium text-gray-900 mb-3">
                      Termos de Pagamento e Entrega
                    </h4>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p>
                        <strong>Pagamento:</strong> O pagamento é efetuado no
                        ato da entrega.
                      </p>
                      <p>
                        <strong>Levantamento:</strong> O produto estará
                        disponível para levantamento na data e hora
                        selecionadas.
                      </p>
                      <p>
                        <strong>Prazo de Entrega:</strong> Caso faça encomenda e
                        esta não for entregue num prazo de 2 semanas por falta
                        de comunicação do cliente, o artigo será devolvido ao
                        stock, ficando o produto disponível para qualquer outra
                        pessoa, não garantindo que o produto continue disponível
                        para a primeira pessoa que encomendou.
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-black text-white py-4 px-4 sm:px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-base sm:text-lg mt-8 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center min-h-[56px]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                        <span className="text-sm sm:text-base">
                          A processar encomenda...
                        </span>
                      </>
                    ) : (
                      <span className="text-sm sm:text-base">
                        Finalizar Pedido
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Delivery Form */}
              {deliveryOption === "delivery" && (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div>
                    <h3 className="text-xl font-medium text-gray-900 mb-6">
                      Entrega ao Domicílio
                    </h3>

                    {/* Location Selection */}
                    <div className="mb-8">
                      <label className="block text-base font-medium text-gray-700 mb-4">
                        Selecione a sua localização:
                      </label>
                      <div className="space-y-3">
                        {deliveryLocations.map((location) => (
                          <button
                            key={location}
                            type="button"
                            onClick={() => setSelectedLocation(location)}
                            className={`w-full p-4 border-2 rounded-lg text-left transition-colors duration-200 text-base ${
                              selectedLocation === location
                                ? "border-black bg-black text-white"
                                : "border-gray-300 hover:border-gray-400 text-gray-900"
                            }`}
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Note */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
                      <p className="text-base text-yellow-800">
                        <strong>Nota:</strong> Só fazemos entrega nestas
                        localidades. Se não vive numa destas áreas, por favor
                        escolha "Levantamento Local".
                      </p>
                    </div>

                    {/* Delivery Form Fields */}
                    {selectedLocation && (
                      <div className="space-y-6 mb-8">
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-3">
                            Nome Completo
                          </label>
                          <input
                            type="text"
                            required
                            value={deliveryForm.name}
                            onChange={(e) =>
                              handleDeliveryFormChange("name", e.target.value)
                            }
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                            placeholder="Digite o seu nome completo"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-3">
                            Email
                          </label>
                          <input
                            type="email"
                            required
                            value={deliveryForm.email}
                            onChange={(e) =>
                              handleDeliveryFormChange("email", e.target.value)
                            }
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                            placeholder="Digite o seu email"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-3">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            required
                            value={deliveryForm.phone}
                            onChange={(e) =>
                              handleDeliveryFormChange("phone", e.target.value)
                            }
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                            placeholder="Digite o seu telefone"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-3">
                            Cidade
                          </label>
                          <input
                            type="text"
                            value={selectedLocation}
                            disabled
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg bg-gray-50 text-gray-700 text-base"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-3">
                            Código Postal
                          </label>
                          <div className="flex">
                            <div className="flex-shrink-0 px-4 py-4 border-2 border-r-0 border-gray-300 rounded-l-lg bg-gray-50 text-gray-700 text-base font-medium">
                              {getPostalCodePrefix(selectedLocation)}-
                            </div>
                            <input
                              type="text"
                              required
                              value={deliveryForm.postalCode}
                              onChange={(e) =>
                                handleDeliveryFormChange(
                                  "postalCode",
                                  e.target.value
                                )
                              }
                              className="flex-1 px-4 py-4 border-2 border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                              placeholder="000"
                              maxLength={3}
                              pattern="[0-9]{3}"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-3">
                            Nome da Rua
                          </label>
                          <input
                            type="text"
                            required
                            value={deliveryForm.street}
                            onChange={(e) =>
                              handleDeliveryFormChange("street", e.target.value)
                            }
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                            placeholder="Rua"
                          />
                        </div>
                        <div>
                          <label className="block text-base font-medium text-gray-700 mb-3">
                            Número da Porta
                          </label>
                          <input
                            type="text"
                            required
                            value={deliveryForm.number}
                            onChange={(e) =>
                              handleDeliveryFormChange("number", e.target.value)
                            }
                            className="w-full px-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-base text-gray-900 placeholder-gray-500"
                            placeholder="Número"
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800 text-sm">
                          <strong>Erro:</strong> {error}
                        </p>
                      </div>
                    )}

                    {/* Payment and Delivery Terms Notice */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
                      <h4 className="text-base font-medium text-gray-900 mb-3">
                        Termos de Pagamento e Entrega
                      </h4>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>
                          <strong>Pagamento:</strong> O pagamento é efetuado no
                          ato da entrega.
                        </p>
                        <p>
                          <strong>Tempo de Entrega:</strong> A entrega demora
                          até 10 dias úteis.
                        </p>
                        <p>
                          <strong>Prazo de Entrega:</strong> Caso a encomenda
                          não seja entregue no prazo de 4 semanas devido à falta
                          de comunicação por parte do cliente, o artigo será
                          automaticamente devolvido ao stock. A partir desse
                          momento, ficará disponível para qualquer outro
                          interessado, não sendo garantida a disponibilidade do
                          produto para o cliente que efetuou a encomenda
                          inicialmente
                        </p>
                      </div>
                    </div>

                    {selectedLocation && (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black text-white py-4 px-4 sm:px-6 rounded-lg hover:bg-gray-800 transition-colors duration-200 font-medium text-base sm:text-lg mt-8 disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center min-h-[56px]"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 sm:mr-3"></div>
                            <span className="text-sm sm:text-base">
                              A processar encomenda...
                            </span>
                          </>
                        ) : (
                          <span className="text-sm sm:text-base">
                            Finalizar Pedido
                          </span>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
