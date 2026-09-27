import ProductCatalogSection from "@/components/ProductCatalogSection";
import { fetchProducts, fetchCategories, fetchTags } from "@/lib/serverApi";

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

  try {
    const [prodData, catData, tagData] = await Promise.all([
      fetchProducts(pageParams),
      fetchCategories().catch(() => []),
      fetchTags().catch(() => []),
    ]);
    data = prodData;
    allCategories = Array.isArray(catData) ? catData : [];
    allTags = Array.isArray(tagData) ? tagData : [];
  } catch (err) {
    console.error("Failed to load products page:", err);
  }

  const { products, pagination } = data;
  const totalProducts = Number(pagination.total) || 0;

  // Compute clean display title
  let categorySubtitle = "ACTIVE RELEASES";
  let pageTitle = "ALL SCULPTURES";

  const activeCategoryParam = params.category || params.deity;
  const activeTagParam = params.tag || params.tags;

  if (params.subCategory) {
    categorySubtitle = activeCategoryParam ? `${activeCategoryParam.toUpperCase()} SUBCATEGORY` : "MURTI TYPE COLLECTION";
    pageTitle = `${params.subCategory.toUpperCase()} COLLECTION`;
  } else if (activeTagParam) {
    categorySubtitle = "CURATED SELECTION";
    pageTitle = `${activeTagParam.toUpperCase()} SPECIAL`;
  } else if (params.purpose === "pooja-room") {
    categorySubtitle = "SACRED ESSENTIALS";
    pageTitle = "POOJA ROOM COLLECTION";
  } else if (params.purpose === "home-decor") {
    categorySubtitle = "ARCHITECTURAL DEVOTION";
    pageTitle = "HOME DECOR IDOLS";
  } else if (activeCategoryParam) {
    categorySubtitle = "IDOL SERIES";
    pageTitle = `${activeCategoryParam.toUpperCase()} SACRED SERIES`;
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
  if (activeCategoryParam) activeTags.push({ label: `Idol Series: ${activeCategoryParam}`, keys: ["category", "deity"] });
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

  // Dynamic quick purpose & category tabs from backend
  const selectedCat = (params.category || params.deity || "").toLowerCase();
  const mainCategories = allCategories.filter((c) => !c.parentCategory);

  const currentMainCat = mainCategories.find(
    (c) => c.name.toLowerCase() === selectedCat || c.slug.toLowerCase() === selectedCat
  );

  let QUICK_PURPOSE_TABS = [];

  if (currentMainCat) {
    // When a category is selected: show its dynamic subcategories created in admin
    const deitySubCats = allCategories.filter(
      (c) => c.parentCategory && (c.parentCategory._id === currentMainCat._id || c.parentCategory === currentMainCat._id)
    );

    QUICK_PURPOSE_TABS = [
      {
        label: `All ${currentMainCat.name}`,
        href: `/products?category=${encodeURIComponent(currentMainCat.slug || currentMainCat.name)}`,
        active: !params.subCategory,
      },
      ...deitySubCats.map((sub) => ({
        label: sub.name,
        href: `/products?category=${encodeURIComponent(currentMainCat.slug || currentMainCat.name)}&subCategory=${encodeURIComponent(sub.name)}`,
        active:
          params.subCategory?.toLowerCase() === sub.name.toLowerCase() ||
          params.subCategory?.toLowerCase() === sub.slug.toLowerCase(),
      })),
      {
        label: "← All Categories",
        href: "/products",
        active: false,
      },
    ];
  } else {
    // When viewing all products: show dynamic series for each main category in DB
    QUICK_PURPOSE_TABS = [
      {
        label: "All Releases",
        href: "/products",
        active: !params.purpose && !params.onsale && !params.category && !params.deity && !params.subCategory && !params.sort,
      },
      {
        label: "Newest First",
        href: "/products?sort=-createdAt",
        active: params.sort === "-createdAt" && !params.purpose && !params.onsale && !params.category && !params.deity && !params.subCategory,
      },
      ...mainCategories.map((cat) => ({
        label: `${cat.name} Series`,
        href: `/products?category=${encodeURIComponent(cat.slug || cat.name)}`,
        active:
          params.category?.toLowerCase() === cat.slug?.toLowerCase() ||
          params.category?.toLowerCase() === cat.name?.toLowerCase() ||
          params.deity?.toLowerCase() === cat.name?.toLowerCase(),
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
