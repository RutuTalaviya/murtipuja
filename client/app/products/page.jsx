import ProductCatalogSection from "@/components/ProductCatalogSection";
import { fetchProducts, fetchCategories, fetchTags, fetchDeities } from "@/lib/serverApi";

export const metadata = {
  title: "Shop Divine Murtis | MurtiPuja",
  description: "Browse our full collection of precision 3D-printed spiritual idols.",
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const pageParams = { limit: 12, ...params };
  let data = { products: [], pagination: { total: 0, totalPages: 0, page: 1, limit: 12 } };
  let allCategories = [];
  let allTags = [];
  let allDeities = [];

  try {
    const [prodData, catData, tagData, deityData] = await Promise.all([
      fetchProducts(pageParams),
      fetchCategories().catch(() => []),
      fetchTags().catch(() => []),
      fetchDeities().catch(() => []),
    ]);
    data = prodData;
    allCategories = Array.isArray(catData) ? catData : [];
    allTags = Array.isArray(tagData) ? tagData : [];
    allDeities = Array.isArray(deityData) ? deityData : [];
  } catch (err) {
    console.error("Failed to load products page:", err);
  }

  const { products, pagination } = data;
  const totalProducts = Number(pagination.total) || 0;

  // Compute clean display title
  let categorySubtitle = "ACTIVE RELEASES";
  let pageTitle = "ALL SCULPTURES";

  const activeDeityParam = params.deity || params.series;
  const activeCategoryParam = params.category;
  const activeTagParam = params.tag || params.tags;

  if (activeCategoryParam && activeDeityParam) {
    categorySubtitle = `${activeCategoryParam.toUpperCase()} • ${activeDeityParam.toUpperCase()} SERIES`;
    pageTitle = `${activeDeityParam.toUpperCase()} IN ${activeCategoryParam.toUpperCase()}`;
  } else if (params.subCategory) {
    categorySubtitle = activeCategoryParam
      ? `${activeCategoryParam.toUpperCase()} SUBCATEGORY`
      : "MURTI TYPE COLLECTION";
    pageTitle = `${params.subCategory.toUpperCase()} COLLECTION`;
  } else if (activeDeityParam) {
    categorySubtitle = "SACRED DEITY SERIES";
    pageTitle = `${activeDeityParam.toUpperCase()} SACRED SERIES`;
  } else if (activeCategoryParam) {
    categorySubtitle = "COLLECTION";
    pageTitle = `${activeCategoryParam.toUpperCase()} IDOLS`;
  } else if (activeTagParam) {
    categorySubtitle = "CURATED SELECTION";
    pageTitle = `${activeTagParam.toUpperCase()} SPECIAL`;
  } else if (params.purpose === "pooja-room") {
    categorySubtitle = "SACRED ESSENTIALS";
    pageTitle = "POOJA ROOM COLLECTION";
  } else if (params.purpose === "home-decor") {
    categorySubtitle = "ARCHITECTURAL DEVOTION";
    pageTitle = "HOME DECOR IDOLS";
  } else if (params.onsale === "true") {
    categorySubtitle = "LIMITED OPPORTUNITY";
    pageTitle = "SPECIAL SALE DROPS";
  } else if (params.sort === "-createdAt") {
    categorySubtitle = "LATEST ARRIVALS";
    pageTitle = "NEWEST PRODUCTS FIRST";
  } else if (params.search) {
    categorySubtitle = "SEARCH RESULTS";
    pageTitle = `RESULTS FOR "${params.search.toUpperCase()}"`;
  }

  // Active filter tags for quick removal
  const activeTags = [];
  if (activeDeityParam) activeTags.push({ label: `Series: ${activeDeityParam}`, keys: ["deity", "series"] });
  if (activeCategoryParam) activeTags.push({ label: `Category: ${activeCategoryParam}`, key: "category" });
  if (params.subCategory) activeTags.push({ label: `Type: ${params.subCategory}`, key: "subCategory" });
  if (activeTagParam) activeTags.push({ label: `Tag: ${activeTagParam}`, keys: ["tag", "tags"] });
  if (params.purpose) {
    const purposeLabel = params.purpose === "pooja-room" ? "Pooja Essentials" : params.purpose === "home-decor" ? "Home Decor" : params.purpose;
    activeTags.push({ label: `Purpose: ${purposeLabel}`, key: "purpose" });
  }
  if (params.onsale === "true") activeTags.push({ label: "On Sale Only", key: "onsale" });
  if (params.sort && params.sort !== "random") {
    const sortLabels = {
      "-createdAt": "Newest First",
      "createdAt": "Oldest First",
      "basePrice": "Price: Low to High",
      "-basePrice": "Price: High to Low",
      "title": "A-Z",
    };
    activeTags.push({ label: `Sort: ${sortLabels[params.sort] || params.sort}`, key: "sort" });
  }
  if (params.minPrice || params.maxPrice) {
    activeTags.push({
      label: `Price: ₹${params.minPrice || "0"} - ₹${params.maxPrice || "Any"}`,
      keys: ["minPrice", "maxPrice"],
    });
  }
  if (params.search) activeTags.push({ label: `Search: "${params.search}"`, key: "search" });

  // Dynamic quick Deity Series & category tabs
  const mainCategories = allCategories.filter((c) => !c.parentCategory);

  let QUICK_PURPOSE_TABS = [];

  if (activeCategoryParam) {
    const currentMainCat = mainCategories.find(
      (c) => c.name.toLowerCase() === activeCategoryParam.toLowerCase() || c.slug.toLowerCase() === activeCategoryParam.toLowerCase()
    );

    const subCats = currentMainCat
      ? allCategories.filter(
          (c) => c.parentCategory && (c.parentCategory._id === currentMainCat._id || c.parentCategory === currentMainCat._id)
        )
      : [];

    QUICK_PURPOSE_TABS = [
      {
        label: `All ${activeCategoryParam}`,
        href: `/products?category=${encodeURIComponent(activeCategoryParam)}`,
        active: !params.subCategory && !params.deity,
      },
      ...subCats.map((sub) => ({
        label: sub.name,
        href: `/products?category=${encodeURIComponent(activeCategoryParam)}&subCategory=${encodeURIComponent(sub.name)}`,
        active:
          params.subCategory?.toLowerCase() === sub.name.toLowerCase() ||
          params.subCategory?.toLowerCase() === sub.slug.toLowerCase(),
      })),
      ...allDeities.slice(0, 4).map((d) => ({
        label: `${d} in ${activeCategoryParam}`,
        href: `/products?category=${encodeURIComponent(activeCategoryParam)}&deity=${encodeURIComponent(d)}`,
        active: activeDeityParam?.toLowerCase() === d.toLowerCase(),
      })),
      {
        label: "← All Products",
        href: "/products",
        active: false,
      },
    ];
  } else {
    // When viewing all products or filtered by series: show Deity Series quick tabs!
    QUICK_PURPOSE_TABS = [
      {
        label: "All Releases",
        href: "/products",
        active: !params.purpose && !params.onsale && !params.category && !params.deity && !params.series && !params.subCategory && !params.sort,
      },
      ...allDeities.map((deityName) => ({
        label: `${deityName} Series`,
        href: `/products?deity=${encodeURIComponent(deityName)}`,
        active: activeDeityParam?.toLowerCase() === deityName.toLowerCase(),
      })),
      {
        label: "Special Sale",
        href: "/products?onsale=true",
        active: params.onsale === "true",
      },
    ];
  }

  return (
    <ProductCatalogSection
      products={products}
      pagination={pagination}
      params={params}
      categorySubtitle={categorySubtitle}
      pageTitle={pageTitle}
      activeTags={activeTags}
      quickTabs={QUICK_PURPOSE_TABS}
      availableTags={allTags}
    />
  );
}
