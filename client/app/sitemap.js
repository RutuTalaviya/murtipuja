import { fetchProducts, fetchCategories } from "@/lib/serverApi";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Regenerate sitemap every hour

export default async function sitemap() {
  const baseUrl = "https://murtipuja.com";

  // Static core routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/faqs`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/shipping-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/return-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/track-order`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // Dynamic Product routes
  let productRoutes = [];
  try {
    const prodData = await fetchProducts({ limit: 1000 });
    const products = prodData.products || [];
    productRoutes = products.map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }));
  } catch (err) {
    console.error("Failed to fetch products for sitemap:", err);
  }

  // Dynamic Category routes
  let categoryRoutes = [];
  try {
    const categories = await fetchCategories();
    categoryRoutes = (Array.isArray(categories) ? categories : []).map((cat) => ({
      url: `${baseUrl}/products?category=${encodeURIComponent(cat.slug || cat.name || cat)}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (err) {
    console.error("Failed to fetch categories for sitemap:", err);
  }

  return [...staticRoutes, ...productRoutes, ...categoryRoutes];
}
