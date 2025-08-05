import { NextRequest, NextResponse } from "next/server";
import { storefrontClient } from "@/lib/shopify";

// GraphQL query to get products by collection
const COLLECTION_PRODUCTS_QUERY = `
  query getCollectionProducts($handle: String!, $first: Int!, $after: String) {
    collection(handle: $handle) {
      id
      title
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            handle
            description
            descriptionHtml
            vendor
            productType
            tags
            totalInventory
            availableForSale
            createdAt
            updatedAt
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  id
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
                  sku
                  availableForSale
                  quantityAvailable
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
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
          }
        }
      }
    }
  }
`;

// GraphQL query to get all products (fallback)
const ALL_PRODUCTS_QUERY = `
  query getAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      edges {
        node {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          tags
          totalInventory
          availableForSale
          createdAt
          updatedAt
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                id
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
                sku
                availableForSale
                quantityAvailable
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
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
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    const limit = parseInt(searchParams.get("limit") || "4");
    const collections = searchParams.get("collections");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    console.log("Related products request:", {
      productId,
      limit,
      collections: collections ? JSON.parse(collections) : null,
    });

    let relatedProducts: any[] = [];
    const seenProductIds = new Set<string>();

    // If we have collection information, try to get products from the same collection first
    if (collections) {
      try {
        const collectionHandles = JSON.parse(collections);
        console.log("Processing collections:", collectionHandles);

        // Try each collection until we get enough products
        for (const collection of collectionHandles) {
          if (relatedProducts.length >= limit) break;

          console.log(
            `Fetching products from collection: ${collection.handle} (${collection.title})`
          );

          try {
            const response = await storefrontClient.request(
              COLLECTION_PRODUCTS_QUERY,
              {
                variables: {
                  handle: collection.handle,
                  first: limit * 2, // Get more to account for filtering
                },
              }
            );

            if (response.data?.collection) {
              console.log(`Collection found: ${collection.handle}`);

              if (response.data.collection.products?.edges) {
                const allCollectionProducts =
                  response.data.collection.products.edges.map(
                    ({ node }: any) => node
                  );
                console.log(
                  `Found ${allCollectionProducts.length} products in collection ${collection.handle}`
                );

                const collectionProducts = allCollectionProducts
                  .filter((product: any) => {
                    // Exclude current product and already seen products
                    return (
                      product.id !== productId &&
                      !seenProductIds.has(product.id)
                    );
                  })
                  .slice(0, limit - relatedProducts.length);

                console.log(
                  `Adding ${collectionProducts.length} products from collection ${collection.handle}`
                );

                // Add products and track their IDs
                for (const product of collectionProducts) {
                  if (relatedProducts.length >= limit) break;
                  if (!seenProductIds.has(product.id)) {
                    relatedProducts.push(product);
                    seenProductIds.add(product.id);
                  }
                }
              } else {
                console.log(
                  `No products found in collection ${collection.handle}`
                );
              }
            } else {
              console.log(`Collection ${collection.handle} not found`);
            }
          } catch (error) {
            console.error(
              `Error fetching collection ${collection.handle}:`,
              error instanceof Error ? error.message : error
            );
          }
        }
      } catch (error) {
        console.error("Error processing collections:", error);
      }
    }

    // If we don't have enough products from collections, fill with random products
    if (relatedProducts.length < limit) {
      try {
        const response = await storefrontClient.request(ALL_PRODUCTS_QUERY, {
          variables: {
            first: limit * 3, // Get more to account for filtering
          },
        });

        if (response.data?.products?.edges) {
          const allProducts = response.data.products.edges
            .map(({ node }: any) => node)
            .filter((product: any) => {
              // Exclude current product and already seen products
              return (
                product.id !== productId && !seenProductIds.has(product.id)
              );
            })
            .slice(0, limit - relatedProducts.length);

          // Add products and track their IDs
          for (const product of allProducts) {
            if (relatedProducts.length >= limit) break;
            if (!seenProductIds.has(product.id)) {
              relatedProducts.push(product);
              seenProductIds.add(product.id);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching all products:", error);
      }
    }

    // Transform the products to match your existing structure
    const transformedProducts = relatedProducts.map((product) => ({
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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));

    console.log(
      "Final related products:",
      transformedProducts.map((p) => ({ id: p.id, name: p.name }))
    );

    return NextResponse.json(transformedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Failed to fetch related products" },
      { status: 500 }
    );
  }
}
