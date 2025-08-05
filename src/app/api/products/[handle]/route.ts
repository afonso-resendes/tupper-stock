import { NextRequest, NextResponse } from "next/server";
import {
  storefrontClient,
  adminClient,
  PRODUCT_BY_HANDLE_QUERY,
} from "@/lib/shopify";

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

    // Get metafields from Storefront API
    let metafields =
      product.metafields?.edges?.map(({ node }: any) => ({
        id: node.id,
        namespace: node.namespace,
        key: node.key,
        value: node.value,
        type: node.type,
        description: node.description,
      })) || [];

    // If no metafields from Storefront API, try Admin API
    if (metafields.length === 0) {
      try {
        const adminResponse = await adminClient.request(
          `
          query getProductMetafields($handle: String!) {
            product(handle: $handle) {
              id
              metafields(first: 10) {
                edges {
                  node {
                    id
                    namespace
                    key
                    value
                    type
                    description
                  }
                }
              }
            }
          }
        `,
          {
            variables: { handle },
          }
        );

        if (adminResponse.data?.product?.metafields?.edges) {
          metafields = adminResponse.data.product.metafields.edges.map(
            ({ node }: any) => ({
              id: node.id,
              namespace: node.namespace,
              key: node.key,
              value: node.value,
              type: node.type,
              description: node.description,
            })
          );
        }
      } catch (adminError) {
        console.log("Admin API metafields not available:", adminError);
      }
    }

    // If still no metafields, try REST API
    if (metafields.length === 0) {
      try {
        const shopifyDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
        const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

        if (shopifyDomain && accessToken) {
          const cleanDomain = shopifyDomain.replace(/^https?:\/\//, "");
          const restUrl = `https://${cleanDomain}/admin/api/2024-01/products.json?handle=${handle}`;

          const restResponse = await fetch(restUrl, {
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            },
          });

          if (restResponse.ok) {
            const restData = await restResponse.json();
            if (restData.products && restData.products.length > 0) {
              const productId = restData.products[0].id;

              // Now fetch metafields for this product
              const metafieldsUrl = `https://${cleanDomain}/admin/api/2024-01/products/${productId}/metafields.json`;
              const metafieldsResponse = await fetch(metafieldsUrl, {
                headers: {
                  "X-Shopify-Access-Token": accessToken,
                  "Content-Type": "application/json",
                },
              });

              if (metafieldsResponse.ok) {
                const metafieldsData = await metafieldsResponse.json();
                if (metafieldsData.metafields) {
                  // Process metafields and resolve metaobject references
                  const processedMetafields = [];

                  for (const mf of metafieldsData.metafields) {
                    let displayValue = mf.value;

                    // If it's a metaobject reference, fetch the actual values
                    if (
                      mf.type === "list.metaobject_reference" ||
                      mf.type === "metaobject_reference"
                    ) {
                      try {
                        // Parse the metaobject references
                        const metaobjectRefs = JSON.parse(mf.value);
                        const metaobjectValues = [];

                        for (const ref of metaobjectRefs) {
                          // Extract the metaobject ID from the GID
                          const metaobjectId = ref.split("/").pop();

                          // Fetch the metaobject data using GraphQL Admin API
                          const metaobjectQuery = `
                              query getMetaobject($id: ID!) {
                                metaobject(id: $id) {
                                  id
                                  type
                                  fields {
                                    key
                                    value
                                    type
                                  }
                                }
                              }
                            `;

                          try {
                            const metaobjectResponse =
                              await adminClient.request(metaobjectQuery, {
                                variables: { id: ref },
                              });

                            if (metaobjectResponse.data?.metaobject) {
                              const metaobject =
                                metaobjectResponse.data.metaobject;
                              console.log(
                                `Metaobject ${metaobjectId} data:`,
                                JSON.stringify(metaobject, null, 2)
                              );

                              if (
                                metaobject.fields &&
                                metaobject.fields.length > 0
                              ) {
                                // Look for the 'title' or 'name' field, or use the first available field
                                const titleField = metaobject.fields.find(
                                  (field: any) =>
                                    field.key === "title" ||
                                    field.key === "name" ||
                                    field.key === "value"
                                );

                                if (titleField && titleField.value) {
                                  metaobjectValues.push(titleField.value);
                                } else if (
                                  metaobject.fields[0] &&
                                  metaobject.fields[0].value
                                ) {
                                  // Fallback to first field
                                  metaobjectValues.push(
                                    metaobject.fields[0].value
                                  );
                                }
                              }
                            }
                          } catch (graphqlError) {
                            console.log(
                              `GraphQL Metaobject API error for ${metaobjectId}:`,
                              graphqlError
                            );
                          }
                        }

                        displayValue = metaobjectValues.join(", ");
                      } catch (parseError) {
                        console.log(
                          "Error parsing metaobject references:",
                          parseError
                        );
                        displayValue = mf.value;
                      }
                    }

                    processedMetafields.push({
                      id: mf.id,
                      namespace: mf.namespace,
                      key: mf.key,
                      value: displayValue,
                      type: mf.type,
                      description: mf.description,
                    });
                  }

                  metafields = processedMetafields;
                }
              }
            }
          }
        }
      } catch (restError) {
        console.log("REST API metafields not available:", restError);
      }
    }

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
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      collections:
        product.collections?.edges?.map(({ node }: any) => ({
          id: node.id,
          handle: node.handle,
          title: node.title,
        })) || [],
      metafields: metafields,
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
