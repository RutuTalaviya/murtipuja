const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * These use Next.js's extended `fetch` with `next: { revalidate }` so the
 * page is statically generated and then revalidated in the background —
 * this is the ISR pattern described in the spec (Section 6/9): fast,
 * SEO-friendly pages that still stay reasonably fresh.
 */

export async function fetchProducts(searchParams = {}) {
  const params = new URLSearchParams(searchParams).toString();
  const res = await fetch(`${API_URL}/api/products?${params}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function fetchProductBySlug(slug) {
  const res = await fetch(`${API_URL}/api/products/${slug}`, {
    next: { revalidate: 300 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/api/categories`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchFinishes() {
  const res = await fetch(`${API_URL}/api/finishes`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error("Failed to fetch finishes");
  return res.json();
}

export async function fetchBanners(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/banners?${query}`, {
    next: { revalidate: 60 }, // revalidate every 60s
  });
  if (!res.ok) throw new Error("Failed to fetch banners");
  return res.json();
}

export async function fetchVideos() {
  try {
    const res = await fetch(`${API_URL}/api/videos`, {
      next: { revalidate: 60 }, // revalidate every 60s
    });
    if (!res.ok) return { success: true, data: [] };
    return res.json();
  } catch (err) {
    console.error("fetchVideos error:", err);
    return { success: true, data: [] };
  }
}

export async function fetchTags() {
  try {
    const res = await fetch(`${API_URL}/api/tags`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchDeities() {
  try {
    const res = await fetch(`${API_URL}/api/products/deities`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return ["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"];
    const data = await res.json();
    return Array.isArray(data) ? data : ["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"];
  } catch (err) {
    return ["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"];
  }
}




