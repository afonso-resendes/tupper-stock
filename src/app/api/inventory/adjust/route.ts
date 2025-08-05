import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { variantId, quantity, action } = body; // action: 'increment' or 'decrement'

    if (!variantId || !quantity || !action) {
      return NextResponse.json(
        { error: "Missing required fields: variantId, quantity, action" },
        { status: 400 }
      );
    }

    const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

    if (!shopifyDomain || !accessToken) {
      return NextResponse.json(
        { error: "Shopify configuration missing" },
        { status: 500 }
      );
    }

    const cleanDomain = shopifyDomain.replace(".myshopify.com", "");

    // Get current inventory level
    const inventoryUrl = `https://${cleanDomain}.myshopify.com/admin/api/2025-01/variants/${variantId}.json`;
    const variantResponse = await fetch(inventoryUrl, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    if (!variantResponse.ok) {
      return NextResponse.json(
        { error: "Failed to get variant details" },
        { status: 404 }
      );
    }

    const variantData = await variantResponse.json();
    const currentInventory = variantData.variant.inventory_quantity || 0;
    const inventoryItemId = variantData.variant.inventory_item_id;

    let newInventory: number;
    if (action === "increment") {
      newInventory = currentInventory + quantity;
    } else if (action === "decrement") {
      newInventory = Math.max(0, currentInventory - quantity);
    } else {
      return NextResponse.json(
        { error: "Invalid action. Must be 'increment' or 'decrement'" },
        { status: 400 }
      );
    }

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

    if (!updateResponse.ok) {
      return NextResponse.json(
        { error: "Failed to update inventory" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      variantId,
      previousInventory: currentInventory,
      newInventory,
      action,
      quantity,
    });
  } catch (error) {
    console.error("Error adjusting inventory:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
