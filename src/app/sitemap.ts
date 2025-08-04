import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://tupperstock.com";

  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/todos`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
  ];

  // Fetch products for dynamic sitemap
  try {
    const response = await fetch(`${baseUrl}/api/products?first=100`);
    if (response.ok) {
      const data = await response.json();
      const productPages =
        data.products?.map((product: any) => ({
          url: `${baseUrl}/produto/${product.handle}`,
          lastModified: new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })) || [];

      return [...staticPages, ...productPages];
    }
  } catch (error) {
    console.error("Error fetching products for sitemap:", error);
  }

  return staticPages;
}
