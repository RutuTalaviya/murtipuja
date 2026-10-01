const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000";

/**
 * Using cache: "no-store" ensures that dynamic data (like products, categories,
 * banners, deities, finishes) is always fetched fresh from the server on every
 * page load/refresh, preventing stale cached data after admin edits.
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
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch product");
  return res.json();
}

export async function fetchCategories() {
  const res = await fetch(`${API_URL}/api/categories`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function fetchFinishes() {
  const res = await fetch(`${API_URL}/api/finishes`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch finishes");
  return res.json();
}

export async function fetchBanners(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_URL}/api/banners?${query}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch banners");
  return res.json();
}

export async function fetchVideos() {
  try {
    const res = await fetch(`${API_URL}/api/videos`, {
      cache: "no-store",
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
      cache: "no-store",
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
      cache: "no-store",
    });
    const fallback = ["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"];
    if (!res.ok) return fallback;
    const data = await res.json();
    const rawList = Array.isArray(data) ? data : fallback;
    
    // Deduplicate case-insensitively
    const map = new Map();
    rawList.forEach((item) => {
      if (typeof item === "string" && item.trim()) {
        const clean = item.trim();
        const lower = clean.toLowerCase();
        if (!map.has(lower)) {
          const proper = clean.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
          map.set(lower, proper);
        }
      }
    });
    return Array.from(map.values());
  } catch (err) {
    return ["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"];
  }
}

export async function fetchPurposes() {
  try {
    const res = await fetch(`${API_URL}/api/purposes`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}






