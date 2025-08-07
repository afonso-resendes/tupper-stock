import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  title: string;
  quantity: number;
  price: string;
  variantTitle?: string;
  image?: string;
}

interface Customer {
  id?: number; // Optional ID for existing customers
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  // Allow additional fields that Shopify might include
  [key: string]: any;
}

interface ShippingAddress {
  first_name: string;
  last_name: string;
  address1: string;
  address2?: string;
  city: string;
  country: string;
  zip: string;
  phone: string;
}

interface OrderConfirmationData {
  orderId: string;
  orderName: string;
  customer: Customer;
  items: OrderItem[];
  total: string;
  currency: string;
  shippingAddress?: ShippingAddress;
  deliveryOption: "pickup" | "delivery";
  pickupDetails?: {
    date: string;
    time: string;
  };
  note?: string;
  createdAt: string;
}

export async function sendOrderConfirmationEmail(
  orderData: OrderConfirmationData
) {
  try {
    const {
      orderId,
      orderName,
      customer,
      items,
      total,
      currency,
      shippingAddress,
      deliveryOption,
      pickupDetails,
      note,
      createdAt,
    } = orderData;

    // Validate customer email
    if (!customer || !customer.email || typeof customer.email !== "string") {
      throw new Error(
        `Invalid customer email: ${customer?.email}. Customer: ${JSON.stringify(customer)}`
      );
    }

    console.log("Sending email to:", customer.email);

    // Format the order date
    const orderDate = new Date(createdAt).toLocaleDateString("pt-PT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Generate items list HTML
    const itemsListHtml = items
      .map((item) => {
        console.log("Processing item:", item.title, "Image:", item.image);
        return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 0; vertical-align: top;">
          <table cellpadding="0" cellspacing="0" style="width: 100%;">
            <tr>
              <td style="width: 60px; padding-right: 16px; vertical-align: top;"><img src="${item.image || "https://via.placeholder.com/60x60/e5e7eb/6b7280?text=Produto"}" alt="${item.title}" style="width: 60px; height: 60px; border-radius: 8px; border: 1px solid #e5e7eb; display: block; max-width: 60px;"></td>
              <td style="vertical-align: top;">
                <div style="font-weight: 500; color: #374151; margin-bottom: 4px;">${item.title}</div>
                ${item.variantTitle ? `<div style="font-size: 14px; color: #6b7280; margin-bottom: 8px;">${item.variantTitle}</div>` : ""}
                <div style="font-size: 14px; color: #6b7280;">
                  <strong>Qtd:</strong> ${item.quantity} | <strong>Preço:</strong> ${item.price}€
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
      })
      .join("");

    // Generate delivery information HTML
    const deliveryInfoHtml =
      deliveryOption === "pickup"
        ? `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 16px;">
              <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">
                📦 Informações de Levantamento
              </h3>
              <p style="margin: 0; color: #6b7280;">
                <strong>Horário:</strong> Segunda a sexta, das 17:00 às 20:00, com marcação.
              </p>
            </td>
          </tr>
        </table>
      `
        : `
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin: 20px 0;">
          <tr>
            <td style="padding: 16px;">
              <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">
                🚚 Informações de Entrega
              </h3>
              <p style="margin: 0; color: #6b7280;">
                <strong>Tipo:</strong> Entrega ao Domicílio<br>
                ${
                  shippingAddress
                    ? `
                  <strong>Morada:</strong><br>
                  ${shippingAddress.first_name} ${shippingAddress.last_name}<br>
                  ${shippingAddress.address1} ${shippingAddress.address2 || ""}<br>
                  ${shippingAddress.zip} ${shippingAddress.city}<br>
                  ${shippingAddress.country}
                `
                    : ""
                }
              </p>
            </td>
          </tr>
        </table>
      `;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Confirmação de Encomenda - TupperStock</title>
        <style>
          @media only screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              margin: 0 !important;
              border-radius: 0 !important;
            }
            .mobile-padding {
              padding: 16px !important;
            }
            .mobile-text {
              font-size: 16px !important;
            }
            .mobile-title {
              font-size: 20px !important;
            }
            .mobile-table {
              display: block !important;
            }
            .mobile-table td {
              display: block !important;
              width: 100% !important;
              text-align: left !important;
              padding: 8px 0 !important;
            }
            .mobile-table td:first-child {
              border-bottom: 1px solid #e5e7eb !important;
              padding-bottom: 12px !important;
            }
            .mobile-table img {
              max-width: 60px !important;
              height: auto !important;
            }
            .mobile-table table {
              width: 100% !important;
            }
            .mobile-table table td {
              display: table-cell !important;
              width: auto !important;
              padding: 4px 8px !important;
            }
            .mobile-table table td:first-child {
              width: 60px !important;
              padding-right: 12px !important;
            }
          }
        </style>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; margin: 0; padding: 0; background-color: #f9fafb;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb;">
          <tr>
            <td align="center" style="padding: 20px;">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 100%;" class="email-container">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #ffffff; border-bottom: 2px solid #e5e7eb; padding: 32px 20px; text-align: center;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                                                  <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #374151;">TupperStock</h1>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px 20px;" class="mobile-padding">
                    
                    <!-- Success Message -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" style="margin: 0 auto 16px;">
                            <tr>
                              <td style="background-color: #10b981; width: 64px; height: 64px; border-radius: 50%; text-align: center; vertical-align: middle;">
                                <img src="https://cdn-icons-png.flaticon.com/512/190/190411.png" alt="Check" style="width: 32px; height: 32px; filter: brightness(0) invert(1);">
                              </td>
                            </tr>
                          </table>
                          <h2 style="margin: 0 0 8px 0; color: #374151; font-size: 24px; font-weight: 600;" class="mobile-title">
                            Encomenda Confirmada!
                          </h2>
                          <p style="margin: 0; color: #6b7280; font-size: 16px;" class="mobile-text">
                            Obrigado ${customer.first_name}!
                          </p>
                        </td>
                      </tr>
                    </table>

                    <!-- Order Details -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td style="padding: 24px;">
                          <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; font-weight: 600;">
                            Detalhes da Encomenda
                          </h3>
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td width="50%" style="vertical-align: top;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                                  Número da Encomenda
                                </p>
                                <p style="margin: 4px 0 0 0; color: #374151; font-weight: 600; font-size: 16px;">
                                  ${orderName}
                                </p>
                              </td>
                              <td width="50%" style="vertical-align: top;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">
                                  Data da Encomenda
                                </p>
                                <p style="margin: 4px 0 0 0; color: #374151; font-weight: 600; font-size: 16px;">
                                  ${orderDate}
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Items -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                      <tr>
                        <td>
                          <h3 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; font-weight: 600;">
                            Produtos Encomendados
                          </h3>
                          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;" class="mobile-table">
                            ${itemsListHtml}
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Total -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #e5e7eb; margin-bottom: 24px;">
                      <tr>
                        <td style="padding-top: 16px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="font-size: 18px; font-weight: 600; color: #374151;">
                                Total:
                              </td>
                              <td style="font-size: 24px; font-weight: 700; color: #000000; text-align: right;">
                                ${total}€
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    ${deliveryInfoHtml}

                    <!-- Terms and Contact Information -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; border-radius: 8px; margin-top: 32px;">
                      <tr>
                        <td style="padding: 20px;">
                          <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 16px; font-weight: 600;">
                            📋 Termos de Pagamento e Entrega
                          </h3>
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                            <strong>Pagamento:</strong> O pagamento é efetuado no ato da entrega.
                          </p>
                          <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 14px;">
                            <strong>Tempo de Entrega:</strong> A entrega demora até 10 dias úteis.
                          </p>
                          <p style="margin: 0; color: #6b7280; font-size: 14px;">
                            <strong>Prazo de Entrega:</strong> Caso a encomenda não seja entregue no prazo de 4 semanas devido à falta de comunicação por parte do cliente, o artigo será automaticamente devolvido ao stock. A partir desse momento, ficará disponível para qualquer outro interessado, não sendo garantida a disponibilidade do produto para o cliente que efetuou a encomenda inicialmente.
                          </p>
                          <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 1px solid #d1d5db; margin-top: 16px;">
                            <tr>
                              <td style="padding-top: 16px;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                                  <strong>Contacto:</strong> 917 391 005 | <strong>Email:</strong> contacto@tupperstock.com
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #374151; color: #d1d5db; padding: 24px 20px; text-align: center;">
                    <p style="margin: 0 0 8px 0; font-size: 14px;">
                      Obrigado por escolher a TupperStock!
                    </p>
                    <p style="margin: 0; font-size: 12px; opacity: 0.8;">
                      © 2024 TupperStock - Tupperware Stock Açores. Todos os direitos reservados.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const textContent = `
TupperStock - Confirmação de Encomenda

Olá ${customer.first_name},

A sua encomenda foi confirmada com sucesso!

Detalhes da Encomenda:
- Número: ${orderName}
- Data: ${orderDate}
- Total: ${total}€

Produtos Encomendados:
${items.map((item) => `- ${item.title} ${item.variantTitle ? `(${item.variantTitle})` : ""} - Qtd: ${item.quantity} - ${item.price}€`).join("\n")}

${
  deliveryOption === "pickup"
    ? `Tipo de Entrega: Levantamento Local${pickupDetails ? `\nData: ${pickupDetails.date}\nHora: ${pickupDetails.time}` : ""}`
    : `Tipo de Entrega: Entrega ao Domicílio${shippingAddress ? `\nMorada:\n${shippingAddress.first_name} ${shippingAddress.last_name}\n${shippingAddress.address1} ${shippingAddress.address2 || ""}\n${shippingAddress.zip} ${shippingAddress.city}\n${shippingAddress.country}` : ""}`
}

Obrigado pela sua compra!

TupperStock - Tupperware Stock Açores
`;

    const { data, error } = await resend.emails.send({
      from: "TupperStock <noreply@tupperstock.com>",
      to: [customer.email],
      subject: `Confirmação de Encomenda ${orderName} - TupperStock`,
      html: htmlContent,
      text: textContent,
    });

    if (error) {
      console.error("Error sending confirmation email:", error);
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }

    console.log("Order confirmation email sent successfully:", data);
    return { success: true, emailId: data?.id };
  } catch (error) {
    console.error("Error in sendOrderConfirmationEmail:", error);
    throw error;
  }
}
