import { NextRequest, NextResponse } from "next/server";
import { storefrontClient } from "@/lib/shopify";

const COLLECTION_PRODUCTS_QUERY = `
  query getCollectionProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      handle
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          hasPreviousPage
          startCursor
          endCursor
        }
        edges {
          node {
            id
            title
            handle
            description
            productType
            tags
            totalInventory
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                  selectedOptions {
                    name
                    value
                  }
                  image {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
            options {
              id
              name
              values
            }
            vendor
          }
        }
      }
    }
  }
`;

export async function GET(
  request: NextRequest,
  { params }: { params: { handle: string } }
) {
  try {
    const { handle } = params;
    const { searchParams } = new URL(request.url);
    const first = parseInt(searchParams.get("first") || "20");
    const after = searchParams.get("after") || undefined;

    if (!handle) {
      return NextResponse.json(
        { error: "Collection handle is required" },
        { status: 400 }
      );
    }

    const variables: any = { handle, first };
    if (after) variables.after = after;

    const response = await storefrontClient.request(COLLECTION_PRODUCTS_QUERY, {
      variables,
    });

    if (!response.data?.collection) {
      return NextResponse.json(
        { error: "Collection not found" },
        { status: 404 }
      );
    }

    const collection = response.data.collection;
    const products = collection.products.edges || [];

    // Transform the data to match your existing product structure
    const transformedProducts = products.map(({ node: product }: any) => ({
      id: product.id,
      name: product.title,
      description: product.description,
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

    return NextResponse.json({
      products: transformedProducts,
      pageInfo: collection.products.pageInfo,
      totalCount: transformedProducts.length,
      collection: {
        id: collection.id,
        title: collection.title,
        handle: collection.handle,
      },
    });
  } catch (error) {
    console.error("Error fetching collection products:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch collection products",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
