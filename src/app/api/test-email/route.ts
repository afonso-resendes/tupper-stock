import { NextRequest, NextResponse } from "next/server";
import { sendOrderConfirmationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, testType, customerStructure } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email address is required" },
        { status: 400 }
      );
    }

    // Test data for email confirmation
    const baseOrderData = {
      orderId: "12345",
      orderName: "#TEST-001",
      items: [
        {
          title: "Tupperware Premium Container",
          quantity: 2,
          price: "24.99",
          variantTitle: "1.5L - Azul",
          image:
            "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=120&h=120&fit=crop&crop=center",
        },
        {
          title: "Tupperware Fresh & Go Set",
          quantity: 1,
          price: "39.99",
          variantTitle: "Pack de 3",
          image:
            "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=120&h=120&fit=crop&crop=center",
        },
      ],
      total: testType === "pickup" ? "64.98" : "89.97",
      currency: "EUR",
      note: "Teste de confirmação de encomenda",
      createdAt: new Date().toISOString(),
    };

    let testOrderData;

    // Test different customer structures that might come from Shopify
    let customerData;
    if (customerStructure === "existing") {
      // This mimics an existing customer structure from Shopify
      customerData = {
        id: 12345,
        email: email,
        first_name: "João",
        last_name: "Silva",
        phone: "+351912345678",
        // ... other existing customer fields
      };
    } else if (customerStructure === "order") {
      // This mimics the customer structure in a new order
      customerData = {
        first_name: "João",
        last_name: "Silva",
        email: email,
        phone: "+351912345678",
      };
    } else {
      // Default structure
      customerData = {
        first_name: "João",
        last_name: "Silva",
        email: email,
        phone: "+351912345678",
      };
    }

    if (testType === "pickup") {
      testOrderData = {
        ...baseOrderData,
        customer: customerData,
        deliveryOption: "pickup" as const,
        pickupDetails: {
          date: "2024-12-25",
          time: "14:30",
        },
      };
    } else {
      testOrderData = {
        ...baseOrderData,
        customer: customerData,
        shippingAddress: {
          first_name: "João",
          last_name: "Silva",
          address1: "Rua das Flores, 123",
          address2: "2º Esquerdo",
          city: "Ponta Delgada",
          country: "Portugal",
          zip: "9500-445",
          phone: "+351912345678",
        },
        deliveryOption: "delivery" as const,
      };
    }

    console.log("Sending test email to:", email);

    const result = await sendOrderConfirmationEmail(testOrderData);

    return NextResponse.json({
      success: true,
      message: `Test ${testType || "delivery"} email sent successfully`,
      emailId: result.emailId,
      testType: testType || "delivery",
    });
  } catch (error) {
    console.error("Error sending test email:", error);
    return NextResponse.json(
      {
        error: "Failed to send test email",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Email test endpoint",
    usage: {
      delivery:
        "POST with { email: 'test@example.com' } to send a test delivery confirmation email",
      pickup:
        "POST with { email: 'test@example.com', testType: 'pickup' } to send a test pickup confirmation email",
      existingCustomer:
        "POST with { email: 'test@example.com', customerStructure: 'existing' } to test existing customer structure",
      orderCustomer:
        "POST with { email: 'test@example.com', customerStructure: 'order' } to test order customer structure",
    },
  });
}
