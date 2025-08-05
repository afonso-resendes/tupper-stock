import { NextRequest, NextResponse } from "next/server";
import { adminClient } from "@/lib/shopify";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received order data:", JSON.stringify(body, null, 2));

    const {
      items,
      deliveryOption,
      pickupForm,
      deliveryForm,
      selectedLocation,
      totalPrice,
    } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in order" }, { status: 400 });
    }

    if (!deliveryOption) {
      return NextResponse.json(
        { error: "Delivery option not selected" },
        { status: 400 }
      );
    }

    // Get Shopify configuration
    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      console.error("Missing Shopify configuration:", {
        shopifyDomain,
        accessToken: accessToken ? "present" : "missing",
      });
      return NextResponse.json(
        { error: "Shopify configuration missing" },
        { status: 500 }
      );
    }

    const cleanDomain = shopifyDomain.replace(".myshopify.com", "");

    // Helper function to extract numeric ID from GraphQL ID
    const extractNumericId = (graphqlId: string) => {
      // Extract the numeric part from GraphQL ID like "gid://shopify/ProductVariant/56327039746432"
      const match = graphqlId.match(/\/(\d+)$/);
      return match ? match[1] : graphqlId;
    };

    // Helper function to get postal code prefix based on location
    const getPostalCodePrefix = (location: string) => {
      switch (location) {
        case "Ponta Delgada":
          return "9500";
        case "Ribeira Grande":
          return "9600";
        case "Lagoa":
          return "9560";
        default:
          return "9500";
      }
    };

    // Prepare line items for Shopify
    let lineItems = items.map((item: any) => ({
      variant_id: extractNumericId(item.variantId),
      quantity: item.quantity,
    }));

    console.log("Prepared line items:", JSON.stringify(lineItems, null, 2));

    // Validate inventory before creating order
    console.log("Validating inventory levels...");

    for (const lineItem of lineItems) {
      // Skip delivery fee product (it's not a real inventory item)
      if (lineItem.variant_id === "15259729035648") {
        continue;
      }

      const variantId = lineItem.variant_id;
      const requestedQuantity = lineItem.quantity;

      // Get current inventory level
      const inventoryUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/variants/${variantId}.json`;
      const variantResponse = await fetch(inventoryUrl, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (variantResponse.ok) {
        const variantData = await variantResponse.json();
        const currentInventory = variantData.variant.inventory_quantity || 0;

        if (currentInventory < requestedQuantity) {
          console.error(
            `Insufficient inventory for variant ${variantId}: requested ${requestedQuantity}, available ${currentInventory}`
          );
          return NextResponse.json(
            {
              error: `Produto "${variantData.variant.title}" não tem stock suficiente. Disponível: ${currentInventory}, Solicitado: ${requestedQuantity}`,
              variantId,
              requestedQuantity,
              availableQuantity: currentInventory,
            },
            { status: 400 }
          );
        }
      } else {
        console.error(`Failed to get inventory for variant ${variantId}`);
        return NextResponse.json(
          { error: "Erro ao verificar stock do produto" },
          { status: 500 }
        );
      }
    }

    console.log("Inventory validation passed");

    // Calculate total - delivery fee will be added as a product, so we use the original total
    const finalTotal = totalPrice;

    console.log("Pricing:", { finalTotal });

    // Prepare customer information
    const customerInfo =
      deliveryOption === "pickup" ? pickupForm : deliveryForm;

    // Create order data for Shopify
    const orderData = {
      order: {
        line_items: lineItems,
        total_price: finalTotal.toString(),
        currency: "EUR",
        financial_status: "pending", // or "paid" if you have payment processing
        fulfillment_status: "unfulfilled",
        customer: {
          first_name: customerInfo.name.split(" ")[0] || customerInfo.name,
          last_name: customerInfo.name.split(" ").slice(1).join(" ") || "",
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        shipping_address:
          deliveryOption === "delivery"
            ? {
                first_name:
                  customerInfo.name.split(" ")[0] || customerInfo.name,
                last_name:
                  customerInfo.name.split(" ").slice(1).join(" ") || "",
                address1: customerInfo.street,
                address2: customerInfo.number,
                city: selectedLocation,
                country: "Portugal",
                phone: customerInfo.phone,
              }
            : null,
        note: `Tipo de entrega: ${
          deliveryOption === "pickup"
            ? "Levantamento Local"
            : "Entrega ao Domicílio"
        }
${
  deliveryOption === "pickup"
    ? `Data: ${pickupForm.date} | Hora: ${pickupForm.time}`
    : `Cidade: ${selectedLocation}`
}
${deliveryOption === "delivery" ? `Taxa de entrega: 5,00€` : ""}`,
        tags: [deliveryOption === "pickup" ? "pickup" : "delivery"],
      },
    };

    console.log("Order data for Shopify:", JSON.stringify(orderData, null, 2));

    // Test the Shopify client connection first
    try {
      console.log("Testing Shopify client connection...");
      const testResponse = await adminClient.request(
        `query {
          shop {
            name
            id
          }
        }`
      );
      console.log(
        "Shopify connection test response:",
        JSON.stringify(testResponse, null, 2)
      );
    } catch (testError) {
      console.error("Shopify connection test failed:", testError);
    }

    // Create order using Shopify REST API instead of GraphQL
    console.log("Attempting to create order using REST API...");

    const restApiUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/orders.json`;

    // Add delivery fee product if delivery option is selected
    if (deliveryOption === "delivery") {
      // Delivery fee product ID: 15259729035648
      const deliveryFeeProductId = "15259729035648";

      try {
        // Get the product variants to find the correct variant ID
        const productVariantsUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/products/${deliveryFeeProductId}/variants.json`;

        const variantsResponse = await fetch(productVariantsUrl, {
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });

        if (variantsResponse.ok) {
          const variantsData = await variantsResponse.json();
          if (variantsData.variants && variantsData.variants.length > 0) {
            // Use the first variant (assuming it's the main delivery fee variant)
            const deliveryFeeVariant = variantsData.variants[0];
            lineItems.push({
              variant_id: deliveryFeeVariant.id,
              quantity: 1,
            });
            console.log(
              "Added delivery fee product to line items:",
              deliveryFeeVariant.id
            );
          } else {
            console.warn("No variants found for delivery fee product");
          }
        } else {
          console.warn("Failed to fetch delivery fee product variants");
        }
      } catch (error) {
        console.error("Error fetching delivery fee product variants:", error);
      }
    }

    // Helper function to format phone number
    const formatPhoneNumber = (phone: string) => {
      // Remove any non-digit characters
      const digits = phone.replace(/\D/g, "");

      // If it starts with 9 (Portuguese mobile), add +351
      if (digits.startsWith("9") && digits.length === 9) {
        return `+351${digits}`;
      }

      // If it already has country code, return as is
      if (digits.startsWith("351") && digits.length === 12) {
        return `+${digits}`;
      }

      // Default: assume it's a Portuguese number and add +351
      return `+351${digits}`;
    };

    const restOrderData = {
      order: {
        line_items: lineItems,
        total_price: finalTotal.toString(),
        currency: "EUR",
        financial_status: "pending",
        fulfillment_status: "unfulfilled",
        customer: {
          first_name: customerInfo.name.split(" ")[0] || customerInfo.name,
          last_name: customerInfo.name.split(" ").slice(1).join(" ") || "",
          email: customerInfo.email,
          phone: formatPhoneNumber(customerInfo.phone),
        },
        shipping_address:
          deliveryOption === "delivery"
            ? {
                first_name:
                  customerInfo.name.split(" ")[0] || customerInfo.name,
                last_name:
                  customerInfo.name.split(" ").slice(1).join(" ") || "",
                address1: customerInfo.street,
                address2: customerInfo.number,
                city: selectedLocation,
                region: "Açores",
                state: "Açores",
                province: "Açores",
                province_code: "PT-20",
                country: "Portugal",
                country_code: "PT",
                zip: customerInfo.postalCode
                  ? `${getPostalCodePrefix(selectedLocation)}-${
                      customerInfo.postalCode
                    }`
                  : "9500-445",
                phone: formatPhoneNumber(customerInfo.phone),
              }
            : {
                // Default shipping address for pickup orders (required by Shopify)
                first_name:
                  customerInfo.name.split(" ")[0] || customerInfo.name,
                last_name:
                  customerInfo.name.split(" ").slice(1).join(" ") || "",
                address1: "Rua das Flores, 123",
                address2: "",
                city: "Ponta Delgada",
                region: "Açores",
                state: "Açores",
                province: "Açores",
                province_code: "PT-20",
                country: "Portugal",
                country_code: "PT",
                zip: "9500-445",
                phone: formatPhoneNumber(customerInfo.phone),
              },
        note: `Tipo de entrega: ${
          deliveryOption === "pickup"
            ? "Levantamento Local"
            : "Entrega ao Domicílio"
        }`,
        tags: [deliveryOption === "pickup" ? "pickup" : "delivery"],
      },
    };

    console.log("REST API order data:", JSON.stringify(restOrderData, null, 2));
    console.log("REST API URL:", restApiUrl);

    // First, try to find existing customer by email
    const customerSearchUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/customers/search.json?query=email:${encodeURIComponent(
      customerInfo.email
    )}`;

    console.log("Searching for existing customer by email...");
    const customerSearchResponse = await fetch(customerSearchUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    let existingCustomer = null;
    if (customerSearchResponse.ok) {
      const searchData = await customerSearchResponse.json();
      if (searchData.customers && searchData.customers.length > 0) {
        existingCustomer = searchData.customers[0];
        console.log("Found existing customer by email:", existingCustomer.id);
      }
    }

    // If not found by email, try searching by phone number (local format first)
    if (!existingCustomer) {
      // Try local phone format first (e.g., "912775081")
      const localPhoneSearchUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/customers/search.json?query=phone:${encodeURIComponent(
        customerInfo.phone
      )}`;

      console.log("Searching for existing customer by local phone...");
      const localPhoneSearchResponse = await fetch(localPhoneSearchUrl, {
        method: "GET",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      if (localPhoneSearchResponse.ok) {
        const localPhoneSearchData = await localPhoneSearchResponse.json();
        if (
          localPhoneSearchData.customers &&
          localPhoneSearchData.customers.length > 0
        ) {
          existingCustomer = localPhoneSearchData.customers[0];
          console.log(
            "Found existing customer by local phone:",
            existingCustomer.id
          );
        }
      }
    }

    // If still not found, try searching by international phone format
    if (!existingCustomer) {
      const internationalPhoneSearchUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/customers/search.json?query=phone:${encodeURIComponent(
        formatPhoneNumber(customerInfo.phone)
      )}`;

      console.log("Searching for existing customer by international phone...");
      const internationalPhoneSearchResponse = await fetch(
        internationalPhoneSearchUrl,
        {
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        }
      );

      if (internationalPhoneSearchResponse.ok) {
        const internationalPhoneSearchData =
          await internationalPhoneSearchResponse.json();
        if (
          internationalPhoneSearchData.customers &&
          internationalPhoneSearchData.customers.length > 0
        ) {
          existingCustomer = internationalPhoneSearchData.customers[0];
          console.log(
            "Found existing customer by international phone:",
            existingCustomer.id
          );
        }
      }
    }

    // If customer exists, use their ID instead of creating new customer data
    if (existingCustomer) {
      // Remove customer data and use customer_id instead
      (restOrderData.order as any).customer_id = existingCustomer.id;
      delete (restOrderData.order as any).customer;
      console.log("Using existing customer ID:", existingCustomer.id);
    } else {
      console.log("Creating new customer");
    }

    // Ensure customer object is completely removed if using existing customer
    if (existingCustomer) {
      delete (restOrderData.order as any).customer;
      console.log(
        "Final order data (existing customer):",
        JSON.stringify(restOrderData, null, 2)
      );
    } else {
      console.log(
        "Final order data (new customer):",
        JSON.stringify(restOrderData, null, 2)
      );
    }

    const restResponse = await fetch(restApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": accessToken,
      },
      body: JSON.stringify(restOrderData),
    });

    console.log("REST API response status:", restResponse.status);
    console.log(
      "REST API response headers:",
      Object.fromEntries(restResponse.headers.entries())
    );

    const restResponseData = await restResponse.json();
    console.log(
      "REST API response data:",
      JSON.stringify(restResponseData, null, 2)
    );

    if (!restResponse.ok) {
      console.error("REST API error:", restResponseData);

      // Handle phone number conflict specifically
      if (
        restResponseData.errors &&
        ((restResponseData.errors.customer &&
          restResponseData.errors.customer.some(
            (error: string) =>
              error.includes("phone") && error.includes("already been taken")
          )) ||
          (restResponseData.errors["customer.phone_number"] &&
            restResponseData.errors["customer.phone_number"].some(
              (error: string) => error.includes("already been taken")
            )))
      ) {
        return NextResponse.json(
          {
            error:
              "Este número de telefone já está associado a outro cliente. Por favor, use um número diferente ou contacte-nos para assistência.",
            details: "Phone number already exists",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create order via REST API",
          details: restResponseData,
        },
        { status: restResponse.status }
      );
    }

    const order = restResponseData.order;

    // If we used an existing customer, fetch their details to include in response
    let customerDetails = order.customer;
    if (existingCustomer && !order.customer) {
      customerDetails = existingCustomer;
    }

    // Decrement inventory for all items in the order
    try {
      console.log("Decrementing inventory for order items...");

      for (const lineItem of lineItems) {
        // Skip delivery fee product (it's not a real inventory item)
        if (lineItem.variant_id === "15259729035648") {
          continue;
        }

        const variantId = lineItem.variant_id;
        const quantity = lineItem.quantity;

        console.log(`Decrementing ${quantity} from variant ${variantId}`);

        // Get current inventory level
        const inventoryUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/variants/${variantId}.json`;
        const variantResponse = await fetch(inventoryUrl, {
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
        });

        if (variantResponse.ok) {
          const variantData = await variantResponse.json();
          const currentInventory = variantData.variant.inventory_quantity || 0;
          const inventoryItemId = variantData.variant.inventory_item_id;
          const newInventory = Math.max(0, currentInventory - quantity);

          console.log(
            `Variant ${variantId}: ${currentInventory} -> ${newInventory}`
          );

          // Update inventory level using inventory levels API
          const updateInventoryUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/inventory_levels/set.json`;
          const updateResponse = await fetch(updateInventoryUrl, {
            method: "POST",
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              location_id: 108441469312, // Your store location ID
              inventory_item_id: inventoryItemId,
              available: newInventory,
            }),
          });

          if (updateResponse.ok) {
            console.log(
              `Successfully updated inventory for variant ${variantId}`
            );
          } else {
            console.error(
              `Failed to update inventory for variant ${variantId}:`,
              await updateResponse.text()
            );
          }
        } else {
          console.error(
            `Failed to get variant ${variantId} details:`,
            await variantResponse.text()
          );
        }
      }
    } catch (inventoryError) {
      console.error("Error updating inventory:", inventoryError);
      // Don't fail the order creation if inventory update fails
      // The order is already created successfully
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        name: order.name,
        total: order.total_price,
        currency: order.currency,
        customer: customerDetails,
        shippingAddress: order.shipping_address,
        note: order.note,
        tags: order.tags,
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
