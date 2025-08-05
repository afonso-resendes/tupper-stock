import { NextRequest, NextResponse } from "next/server";
import { storefrontClient, PRODUCT_BY_HANDLE_QUERY } from "@/lib/shopify";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const { handle } = await params;
  try {
    if (!handle) {
      return NextResponse.json(
        { error: "Product handle is required" },
        { status: 400 }
      );
    }

    const response = await storefrontClient.request(PRODUCT_BY_HANDLE_QUERY, {
      variables: { handle },
    });

    if (!response.data?.product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const product = response.data.product;

    // Transform the data to match your existing product structure
    const transformedProduct = {
      id: product.id,
      name: product.title,
      description: product.descriptionHtml || product.description,
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      originalPrice: product.compareAtPriceRange?.minVariantPrice?.amount
        ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
        : parseFloat(product.priceRange.minVariantPrice.amount),
      category: product.productType || "storage",
      image: product.images.edges[0]?.node?.url || null,
      images: product.images.edges.map(({ node }: any) => node.url),
      handle: product.handle,
      availableForSale: product.availableForSale,
      variants: product.variants.edges.map(({ node: variant }: any) => ({
        id: variant.id,
        title: variant.title,
        price: parseFloat(variant.price.amount),
        availableForSale: variant.availableForSale,
        quantityAvailable: variant.quantityAvailable,
        selectedOptions: variant.selectedOptions,
        image: variant.image,
      })),
      options: product.options,
      tags: product.tags || [],
      vendor: product.vendor,
      productType: product.productType,
      totalInventory: product.totalInventory,
    };

    return NextResponse.json(transformedProduct);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
