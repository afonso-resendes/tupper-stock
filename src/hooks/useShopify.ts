import { useState, useEffect } from "react";

// Types for the transformed data
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  image: string | null;
  images?: string[];
  handle: string;
  availableForSale: boolean;
  variants: Array<{
    id: string;
    title: string;
    price: number;
    availableForSale: boolean;
    quantityAvailable: number;
    selectedOptions?: Array<{
      name: string;
      value: string;
    }>;
    image?: {
      id: string;
      url: string;
      altText: string;
      width: number;
      height: number;
    } | null;
  }>;
  tags: string[];
  options?: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  vendor?: string;
  productType?: string;
  totalInventory?: number;
  collections?: Array<{
    id: string;
    handle: string;
    title: string;
  }>;
  metafields?: Array<{
    id: string;
    namespace: string;
    key: string;
    value: string;
    type: string;
    description?: string;
  }>;
}

export interface ProductsResponse {
  products: Product[];
  pageInfo: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor: string;
    endCursor: string;
  };
  totalCount: number;
}

// Hook for fetching products
export function useProducts(
  options: {
    first?: number;
    after?: string;
    category?: string;
    search?: string;
  } = {}
) {
  const [data, setData] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.first) params.append("first", options.first.toString());
        if (options.after) params.append("after", options.after);
        if (options.category) params.append("category", options.category);
        if (options.search) params.append("search", options.search);

        const response = await fetch(`/api/products?${params.toString()}`);

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [options.first, options.after, options.category, options.search]);

  return { data, loading, error };
}

// Hook for fetching a single product
export function useProduct(handle: string) {
  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!handle) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/products/${handle}`);

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [handle]);

  return { data, loading, error };
}

// Hook for fetching categories from product types, tags, and collections
export function useCategories() {
  const [categories, setCategories] = useState<
    Array<{ title: string; handle?: string }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const categorySet = new Set<string>();
        const collectionMap = new Map<string, string>();

        // Try to fetch collections first
        try {
          const collectionsResponse = await fetch("/api/collections");
          if (collectionsResponse.ok) {
            const collectionsData = await collectionsResponse.json();
            if (collectionsData.collections) {
              collectionsData.collections.forEach((collection: any) => {
                // Filter out "Página Inicial" collection (case insensitive)
                if (
                  collection.title.toLowerCase() !== "página inicial" &&
                  collection.title.toLowerCase() !== "pagina inicial"
                ) {
                  categorySet.add(collection.title);
                  collectionMap.set(collection.title, collection.handle);
                }
              });
              console.log("Collections found:", collectionsData.collections);
            }
          }
        } catch (collectionsError) {
          console.log(
            "Collections not available, using product-based categories"
          );
        }

        // Fetch all products to extract additional categories
        const response = await fetch("/api/products?first=250");

        if (!response.ok) {
          throw new Error("Failed to fetch products for categories");
        }

        const result = await response.json();
        const products = result.products || [];

        console.log("Products for categories:", products); // Debug log

        // Extract unique categories from product types, tags, and collections
        products.forEach((product: Product) => {
          // Add product type as category (filter out página inicial)
          if (
            product.productType &&
            product.productType.toLowerCase() !== "página inicial" &&
            product.productType.toLowerCase() !== "pagina inicial"
          ) {
            categorySet.add(product.productType);
          }

          // Add tags as categories (filter out página inicial)
          if (product.tags && product.tags.length > 0) {
            product.tags.forEach((tag) => {
              if (
                tag.toLowerCase() !== "página inicial" &&
                tag.toLowerCase() !== "pagina inicial"
              ) {
                categorySet.add(tag);
              }
            });
          }

          // Add category field if it exists (filter out página inicial)
          if (
            product.category &&
            product.category !== "storage" &&
            product.category.toLowerCase() !== "página inicial" &&
            product.category.toLowerCase() !== "pagina inicial"
          ) {
            categorySet.add(product.category);
          }
        });

        console.log("Extracted categories:", Array.from(categorySet)); // Debug log

        // Convert to array and sort, preserving collection handles
        const categoryArray = Array.from(categorySet)
          .sort()
          .map((title) => ({
            title,
            handle: collectionMap.get(title),
          }));
        setCategories(categoryArray);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}

// Hook for fetching products by collection
export function useCollectionProducts(
  collectionHandle: string,
  options: {
    first?: number;
    after?: string;
  } = {}
) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollectionProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (options.first) params.append("first", options.first.toString());
        if (options.after) params.append("after", options.after);

        const response = await fetch(
          `/api/collections/${collectionHandle}/products?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch collection products");
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (collectionHandle) {
      fetchCollectionProducts();
    }
  }, [collectionHandle, options.first, options.after]);

  return { data, loading, error };
}

export const useRelatedProducts = (
  productId: string,
  limit: number = 4,
  collections?: Array<{ id: string; handle: string; title: string }>
) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.append("productId", productId);
        params.append("limit", limit.toString());

        if (collections && collections.length > 0) {
          params.append("collections", JSON.stringify(collections));
        }

        const response = await fetch(
          `/api/products/related?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch related products");
        }

        const result = await response.json();
        setData(result || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, limit, collections]);

  return { data, loading, error };
};
