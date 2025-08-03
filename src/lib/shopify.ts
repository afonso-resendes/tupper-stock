import { createStorefrontApiClient } from "@shopify/storefront-api-client";
import { createAdminApiClient } from "@shopify/admin-api-client";

// Storefront API Client (for customer-facing operations)
export const storefrontClient = createStorefrontApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  apiVersion: process.env.SHOPIFY_STOREFRONT_API_VERSION || "2025-01",
  publicAccessToken: process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN!,
});

// Admin API Client (for server-side operations)
export const adminClient = createAdminApiClient({
  storeDomain: process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN!,
  apiVersion: process.env.SHOPIFY_API_VERSION || "2025-01",
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN!,
});

// Simplified products query for limited scopes
export const PRODUCTS_QUERY = `
  query getProducts($first: Int!, $after: String) {
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
          descriptionHtml
          vendor
          productType
          tags
          totalInventory
          availableForSale
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

export const PRODUCT_BY_HANDLE_QUERY = `
  query getProductByHandle($handle: String!) {
    product(handle: $handle) {
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
`;

// Types for Shopify data
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  descriptionHtml: string;
  vendor: string;
  productType: string;
  tags: string[];
  totalInventory: number;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  compareAtPriceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
    maxVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
  images: {
    edges: Array<{
      node: {
        id: string;
        url: string;
        altText: string;
        width: number;
        height: number;
      };
    }>;
  };
  variants: {
    edges: Array<{
      node: {
        id: string;
        title: string;
        sku: string;
        availableForSale: boolean;
        quantityAvailable: number;
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice: {
          amount: string;
          currencyCode: string;
        } | null;
        selectedOptions: Array<{
          name: string;
          value: string;
        }>;
        image: {
          id: string;
          url: string;
          altText: string;
          width: number;
          height: number;
        } | null;
      };
    }>;
  };
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
}
