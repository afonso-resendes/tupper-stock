import { NextRequest, NextResponse } from "next/server";
import { storefrontClient, PRODUCTS_QUERY } from "@/lib/shopify";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get("first") || "20");
    const after = searchParams.get("after") || undefined;
    const category = searchParams.get("category") || undefined;
    const search = searchParams.get("search") || undefined;
    const exclude = searchParams.get("exclude") || undefined;

    const variables: any = { first };
    if (after) variables.after = after;

    const response = await storefrontClient.request(PRODUCTS_QUERY, {
      variables,
    });

    if (!response.data) {
      throw new Error("No data received from Shopify");
    }

    if (!response.data.products) {
      throw new Error("No products data received from Shopify");
    }

    let products = response.data.products.edges || [];

    // Transform the data
    let transformedProducts = products.map(({ node: product }: any) => ({
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
    }));

    // Filter by category if specified
    if (category && category !== "all") {
      // Check if this is a collection name by trying to fetch collections
      try {
        const collectionsResponse = await fetch(
          `${request.nextUrl.origin}/api/collections`
        );
        if (collectionsResponse.ok) {
          const collectionsData = await collectionsResponse.json();
          const targetCollection = collectionsData.collections?.find(
            (col: any) => col.title === category
          );

          if (targetCollection) {
            // This is a collection, we need to filter products that belong to this collection
            // For now, we'll filter by product type, tags, or category that might match
            // In a full implementation, you'd need to fetch products by collection ID
            transformedProducts = transformedProducts.filter((product: any) => {
              return (
                product.productType === category ||
                product.tags.includes(category) ||
                product.category === category
              );
            });
          } else {
            // Regular category filtering
            transformedProducts = transformedProducts.filter((product: any) => {
              return (
                product.productType === category ||
                product.tags.includes(category) ||
                product.category === category
              );
            });
          }
        }
      } catch (error) {
        // Fallback to regular category filtering
        transformedProducts = transformedProducts.filter((product: any) => {
          return (
            product.productType === category ||
            product.tags.includes(category) ||
            product.category === category
          );
        });
      }
    }

    // Filter by search if specified
    if (search) {
      transformedProducts = transformedProducts.filter(
        (product: any) =>
          product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter out excluded product if specified
    if (exclude) {
      transformedProducts = transformedProducts.filter(
        (product: any) => product.id !== exclude
      );
    }

    // Filter out delivery product
    transformedProducts = transformedProducts.filter(
      (product: any) => product.id !== "gid://shopify/Product/15259729035648"
    );

    return NextResponse.json({
      products: transformedProducts,
      pageInfo: response.data.products.pageInfo,
      totalCount: transformedProducts.length,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
