import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchProductBySlug, fetchProducts, fetchFinishes } from "@/lib/serverApi";
import { formatImageUrl } from "@/lib/api";
import AddToCartPanel from "@/components/AddToCartPanel";
import ProductCard from "@/components/ProductCard";
import ImageGallery from "@/components/ImageGallery";
import AddComboButton from "@/components/AddComboButton";
import RelatedDropsCarousel from "@/components/RelatedDropsCarousel";
import ProductAccordion from "@/components/ProductAccordion";
import ProductVideoShowcase from "@/components/ProductVideoShowcase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) return { title: "Product Not Found | MurtiPuja" };

  try {
    const product = await fetchProductBySlug(slug);
    if (!product) return { title: "Product Not Found | MurtiPuja" };

    const image = product.images?.[0];

    return {
      title: `${product.title} | MurtiPuja`,
      description: product.description?.slice(0, 155),
      openGraph: {
        title: product.title,
        description: product.description?.slice(0, 155),
        images: image?.url ? [image.url] : [],
      },
    };
  } catch (err) {
    return { title: "Product Details | MurtiPuja" };
  }
}

export default async function ProductDetailPage({ params }) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug;
  if (!slug) notFound();

  let product = null;
  try {
    product = await fetchProductBySlug(slug);
  } catch (err) {
    console.error("Failed to load product:", err);
  }

  if (!product) notFound();

  let finishes = [];
  try {
    finishes = await fetchFinishes();
  } catch (err) {
    console.error("Failed to load finishes:", err);
  }

  // Fetch related products dynamically (strictly matching the same category / deity only)
  let relatedProducts = [];
  try {
    const primaryCat = Array.isArray(product.category) && product.category.length > 0 ? product.category[0] : product.category;
    const catQuery = primaryCat?.name || primaryCat?.slug || product.deity || "";

    // Fetch products filtered by category/deity
    const relatedData = await fetchProducts({
      category: catQuery,
      limit: 15,
    });

    const currentDeityLower = (product.deity || primaryCat?.name || "").toLowerCase().trim();
    const catId = primaryCat?._id ? primaryCat._id.toString() : "";
    const catNameLower = (primaryCat?.name || "").toLowerCase().trim();
    const catSlugLower = (primaryCat?.slug || "").toLowerCase().trim();

    const allList = (relatedData.products || []).filter(
      (p) => p._id.toString() !== product._id.toString()
    );

    // Strictly filter to ensure ONLY products belonging to the same category / deity / subcategory
    relatedProducts = allList.filter((p) => {
      // 1. Check deity match
      const pDeityLower = (p.deity || "").toLowerCase().trim();
      if (
        pDeityLower &&
        currentDeityLower &&
        (pDeityLower === currentDeityLower ||
          pDeityLower.includes(currentDeityLower) ||
          currentDeityLower.includes(pDeityLower))
      ) {
        return true;
      }

      // 2. Check main category match
      const pCats = Array.isArray(p.category) ? p.category : p.category ? [p.category] : [];
      const pCatMatch = pCats.some((c) => {
        const id = c?._id ? c._id.toString() : c?.toString?.();
        const name = (c?.name || typeof c === "string" ? c?.name || c : "").toLowerCase().trim();
        const slug = (c?.slug || "").toLowerCase().trim();
        return (
          (catId && id === catId) ||
          (catNameLower && name === catNameLower) ||
          (catSlugLower && slug === catSlugLower) ||
          (currentDeityLower && (name.includes(currentDeityLower) || slug.includes(currentDeityLower)))
        );
      });
      if (pCatMatch) return true;

      // 3. Check subcategory match
      const pSubCats = Array.isArray(p.subCategory) ? p.subCategory : p.subCategory ? [p.subCategory] : [];
      const pSubMatch = pSubCats.some((sub) => {
        const id = sub?._id ? sub._id.toString() : sub?.toString?.();
        const name = (sub?.name || typeof sub === "string" ? sub?.name || sub : "").toLowerCase().trim();
        const parentId = sub?.parentCategory?._id ? sub.parentCategory._id.toString() : sub?.parentCategory?.toString?.();
        return (
          (catId && (id === catId || parentId === catId)) ||
          (currentDeityLower && name.includes(currentDeityLower))
        );
      });
      if (pSubMatch) return true;

      return false;
    }).slice(0, 10);
  } catch (err) {
    console.error("Failed to load related products:", err);
  }

  const image = product.images?.[0];

  // Basic schema.org Product structured data for SEO (Section 10 of the spec)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: image?.url,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "INR",
      lowPrice: Math.min(...product.variants.map((v) => v.discountPrice || v.price)),
      highPrice: Math.max(...product.variants.map((v) => v.discountPrice || v.price)),
      availability: product.variants.some((v) => v.stock > 0)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  };

  // Variant-specific images for initial load (only matching initial variant / finish)
  const initialVariant = product.variants?.[0];
  const seenUrls = new Set();
  const initialGalleryImages = [];

  const addImg = (img, fallbackAlt) => {
    if (!img) return;
    const rawUrl = typeof img === "object" ? img?.url : img;
    if (rawUrl && typeof rawUrl === "string" && !seenUrls.has(rawUrl.trim())) {
      seenUrls.add(rawUrl.trim());
      initialGalleryImages.push({
        url: rawUrl.trim(),
        alt: (typeof img === "object" ? img?.alt : fallbackAlt) || fallbackAlt || product.title,
      });
    }
  };

  // 1. Add current variant images
  if (Array.isArray(initialVariant?.images) && initialVariant.images.length > 0) {
    initialVariant.images.forEach((img) => addImg(img, `${product.title} - ${initialVariant.finish || ""}`));
  }
  if (initialVariant?.image) {
    addImg(initialVariant.image, `${product.title} - ${initialVariant.finish || ""}`);
  }

  // 2. If no images on this exact variant, check other variants with the same finish/color
  if (initialGalleryImages.length === 0 && initialVariant?.finish && Array.isArray(product.variants)) {
    const sameFinishVariants = product.variants.filter(
      (v) => (v.finish || "").toLowerCase().trim() === (initialVariant.finish || "").toLowerCase().trim()
    );
    sameFinishVariants.forEach((v) => {
      if (Array.isArray(v.images)) v.images.forEach((img) => addImg(img, `${product.title} - ${v.finish || ""}`));
      if (v.image) addImg(v.image, `${product.title} - ${v.finish || ""}`);
    });
  }

  // 3. Fallback to product level images only if this variant has no images
  if (initialGalleryImages.length === 0 && Array.isArray(product.images)) {
    product.images.forEach((img) => addImg(img, product.title));
  }

  // Skip the first 2 images (primary cover and hover preview images) if 3 or more exist, else show available
  const finalGalleryImages = initialGalleryImages.length > 2 ? initialGalleryImages.slice(2) : initialGalleryImages;

  return (
    <main className="min-h-screen bg-white px-2 sm:px-4 md:px-6 lg:px-8 py-6 md:py-8 font-display w-full">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="w-full space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-start">
          {/* Left: Product Image & Vertical Gallery (Variant-Specific) */}
          <div className="lg:col-span-7 xl:col-span-7 w-full flex justify-center lg:justify-start lg:pl-2 xl:pl-4">
            <ImageGallery images={finalGalleryImages} title={product.title} />
          </div>

          {/* Right: Product Details & Add to Cart Panel */}
          <div className="lg:col-span-5 xl:col-span-5 sticky top-24 space-y-6">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {product.category && product.category.length > 0 ? (
                  <Link
                    href={`/products?category=${encodeURIComponent(product.category[0].slug || product.category[0].name || product.category[0])}`}
                    className="text-[10.5px] uppercase tracking-widest text-amber-800 font-extrabold hover:underline"
                  >
                    {product.category[0].name || product.category[0]} Series
                  </Link>
                ) : product.deity ? (
                  <Link
                    href={`/products?category=${encodeURIComponent(product.deity)}`}
                    className="text-[10.5px] uppercase tracking-widest text-amber-800 font-extrabold hover:underline"
                  >
                    {product.deity} Series
                  </Link>
                ) : null}
                {product.subCategory && product.subCategory.map((sub, idx) => {
                  const name = typeof sub === "object" ? sub.name : sub;
                  return (
                    <Link
                      key={idx}
                      href={`/products?subCategory=${encodeURIComponent(name)}`}
                      className="text-[9.5px] font-extrabold bg-blue-50 hover:bg-black hover:text-white text-blue-900 border border-blue-200 px-2 py-0.5 rounded-none uppercase transition-colors"
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl font-extrabold uppercase tracking-wide text-black mb-4">{product.title}</h1>
            </div>

            <AddToCartPanel product={product} finishes={finishes} />

            {/* Combo Offers Section */}
            {product.comboOffers && product.comboOffers.length > 0 && (
              <div className="mt-8 pt-6 border-t-2 border-neutral-100">
                <h3 className="font-display text-sm text-black font-extrabold uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <span>🎁</span> Available Combo Offers
                </h3>
                <div className="space-y-4">
                  {product.comboOffers.map((combo) => {
                    const otherProducts = combo.products.filter(
                      (p) => p._id.toString() !== product._id.toString()
                    );
                    if (otherProducts.length === 0) return null;

                    return (
                      <div
                        key={combo._id}
                        className="bg-neutral-50 border-2 border-black rounded-none p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
                      >
                        <div className="flex justify-between items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">✨</span>
                            <h4 className="text-xs font-extrabold text-black font-display uppercase tracking-wider">
                              {combo.title}
                            </h4>
                          </div>
                          <span className="bg-gold text-black text-[10px] font-extrabold px-3 py-1 border border-black rounded-none uppercase tracking-widest">
                            Save {combo.discountType === "percentage" ? `${combo.discountValue}%` : `₹${combo.discountValue}`}
                          </span>
                        </div>

                        {combo.description && (
                          <p className="text-[11px] text-neutral-500 font-semibold leading-relaxed -mt-2">
                            {combo.description}
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row items-center gap-3 py-1">
                          {/* Current product card */}
                          <div className="flex items-center gap-2 bg-white p-2 border-2 border-black rounded-none w-full sm:flex-1 min-w-0">
                            <div className="relative w-12 h-12 rounded-none bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200">
                              {product.images?.[0]?.url && (
                                <img
                                  src={formatImageUrl(product.images[0].url)}
                                  alt={product.title}
                                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                />
                              )}
                            </div>
                            <div className="text-left min-w-0 font-display">
                              <p className="text-[10px] font-extrabold text-black uppercase tracking-wider">This Item</p>
                              <p className="text-[10px] text-neutral-500 font-semibold truncate">{product.title}</p>
                            </div>
                          </div>

                          {/* Separator badge */}
                          <div className="w-7 h-7 rounded-none border-2 border-black bg-gold text-black flex items-center justify-center font-extrabold text-xs flex-shrink-0">
                            +
                          </div>

                          {/* Other product card */}
                          {otherProducts.map((op) => (
                            <div key={op._id} className="flex items-center gap-2 bg-white p-2 border-2 border-black rounded-none w-full sm:flex-1 min-w-0">
                              <div className="relative w-12 h-12 rounded-none bg-neutral-100 overflow-hidden flex-shrink-0 border border-neutral-200">
                                {op.images?.[0]?.url && (
                                  <img
                                    src={formatImageUrl(op.images[0].url)}
                                    alt={op.title}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                                  />
                                )}
                              </div>
                              <div className="text-left min-w-0 font-display">
                                <p className="text-[10px] font-extrabold text-black uppercase tracking-wider">Add Product</p>
                                <p className="text-[10px] text-neutral-500 font-semibold truncate" title={op.title}>{op.title}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          <AddComboButton combo={combo} product={product} />
                          <p className="text-[9px] text-center text-neutral-400 font-bold uppercase tracking-wider">
                            💡 Bundle includes default variant configurations for each murti
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Interactive Accordion: Product Details, Materials & Care, Shipping & Returns */}
            <ProductAccordion product={product} />
          </div>
        </div>

        {/* Dynamic Sacred 3D & Showcase Videos Section with Left/Right Arrow Carousel */}
        {product.videos && product.videos.length > 0 && (
          <ProductVideoShowcase videos={product.videos} productTitle={product.title} />
        )}

        {/* Dynamic Related Products Carousel in 1 Row with Zero Gap and Scroll Controls */}
        {relatedProducts.length > 0 && (
          <RelatedDropsCarousel products={relatedProducts} currentDeity={product.deity} />
        )}
      </div>
    </main>
  );
}
