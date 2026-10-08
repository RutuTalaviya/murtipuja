import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { fetchProducts, fetchCategories, fetchBanners, fetchVideos, fetchDeities } from "@/lib/serverApi";
import { formatImageUrl } from "@/lib/api";
import HomeCategoryShowcase from "@/components/HomeCategoryShowcase";
import HomeDeitySeriesShowcase from "@/components/HomeDeitySeriesShowcase";
import ScrollReveal from "@/components/ScrollReveal";
import HeroBanner from "@/components/HeroBanner";
import VideoReelsCarousel from "@/components/VideoReelsCarousel";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  let allProducts = [];
  let categories = [];
  let banners = [];
  let videos = [];
  let deities = [];

  try {
    const [productsData, categoriesData, bannersData, videosData, deitiesData] = await Promise.allSettled([
      fetchProducts({ limit: 100 }),
      fetchCategories(),
      fetchBanners(),
      fetchVideos(),
      fetchDeities(),
    ]);

    if (productsData.status === "fulfilled") {
      allProducts = productsData.value?.products || [];
    }
    if (categoriesData.status === "fulfilled") {
      categories = categoriesData.value || [];
    }
    if (bannersData.status === "fulfilled") {
      banners = bannersData.value?.data || bannersData.value || [];
    }
    if (videosData.status === "fulfilled") {
      videos = videosData.value?.data || videosData.value || [];
    }
    if (deitiesData.status === "fulfilled") {
      deities = deitiesData.value || [];
    }
  } catch (err) {
    console.error("Failed to load homepage data:", err);
  }

  const heroBanners = banners.filter((b) => !b.position || b.position === "hero");
  const middleBanners = banners.filter((b) => b.position === "middle");
  const footerBanners = banners.filter((b) => b.position === "footer");

  return (
    <main className="min-h-screen bg-white overflow-x-hidden font-display w-full">
      
      {/* 1. Dynamic Full-Screen Hero Campaign Section */}
      <HeroBanner banners={heroBanners} />


      {/* 2. Full-Width Animated Marquee Ticker Tape */}
      <div className="w-full bg-gold text-black py-3.5 border-b border-stone-200 overflow-hidden font-extrabold text-xs uppercase tracking-widest select-none">
        <div className="animate-marquee whitespace-nowrap flex gap-8 items-center">
          <span>⚡ DROP 01 LIVE</span>
          <span>·</span>
          <span>0.1MM MICRO-PRECISION 3D PRINTING</span>
          <span>·</span>
          <span>100% PREPAID SECURE GATEWAY</span>
          <span>·</span>
          <span>INSURED ALL-INDIA TRANSIT</span>
          <span>·</span>
          <span>DISPATCHED IN 48 HOURS</span>
          <span>·</span>
          <span>LIMITED LAB EDITIONS</span>
          <span>·</span>
          <span>CRAFTED IN INDIA</span>
          <span>·</span>
          <span>⚡ DROP 01 LIVE</span>
          <span>·</span>
          <span>0.1MM MICRO-PRECISION 3D PRINTING</span>
          <span>·</span>
          <span>100% PREPAID SECURE GATEWAY</span>
          <span>·</span>
          <span>INSURED ALL-INDIA TRANSIT</span>
          <span>·</span>
          <span>DISPATCHED IN 48 HOURS</span>
          <span>·</span>
          <span>LIMITED LAB EDITIONS</span>
          <span>·</span>
        </div>
      </div>

      {/* 3. Series & Category-Wise 4 Products Showcase Sections */}
      <HomeCategoryShowcase categories={categories} products={allProducts} deities={deities} />

      {/* 4. Dynamic Campaign Spotlight Banner */}
      {(() => {
        // Priority: 1. Featured product with image, 2. Shiva product, 3. First product with image
        const featuredProduct =
          allProducts.find((p) => p.isFeatured && p.images?.[0]?.url) ||
          allProducts.find((p) => p.deity && p.deity.toLowerCase() === "shiva" && p.images?.[0]?.url) ||
          allProducts.find((p) => p.images?.[0]?.url) ||
          allProducts[0];

        const spotlightImage = featuredProduct?.images?.[0]?.url || "/images/shiva.png";
        const spotlightTitle = featuredProduct?.title || "The Obsidian Shiva";
        const spotlightDescription =
          featuredProduct?.description ||
          "Cast with a high-density sandstone core and post-cured in matte obsidian black. Sculpted to microscopic detail capturing the sacred crescent moon, trishul, and meditative posture with unmatched spiritual presence.";
        const spotlightLink = featuredProduct?.slug
          ? `/products/${featuredProduct.slug}`
          : "/products";
        const deityName = featuredProduct?.deity || "Shiva";

        return (
          <section className="w-full bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden border-b border-stone-300">
            {/* Left Content Half */}
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 lg:p-14 xl:p-16 flex flex-col justify-center space-y-4 sm:space-y-6 bg-white">
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-950 border border-amber-200 px-3.5 py-1 text-xs font-extrabold tracking-widest uppercase shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span>Highlight Release</span>
                </div>
                <span className="text-xs text-stone-500 uppercase tracking-widest font-extrabold">
                  {featuredProduct?.deity ? `${featuredProduct.deity.toUpperCase()} SERIES` : "Drop 01 · Signature Series"}
                </span>
              </div>

              <div className="space-y-2">
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight text-neutral-900 leading-[1.08] max-w-2xl line-clamp-3">
                  {spotlightTitle}
                </h2>
                <p className="text-amber-800 text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                  {featuredProduct?.deity ? `Lord ${featuredProduct.deity}` : "Sacred Murti"} · Micro-Precision Sacred 3D Sculpture
                </p>
              </div>

              <p className="text-stone-600 text-xs sm:text-sm md:text-base leading-relaxed font-normal max-w-xl line-clamp-4">
                {spotlightDescription}
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href={spotlightLink}
                  className="group inline-flex items-center gap-2.5 bg-neutral-900 hover:bg-neutral-800 text-white px-7 py-3.5 font-extrabold text-xs tracking-widest uppercase transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  <span>Explore {deityName} Series</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-neutral-800 hover:text-black px-5 py-3.5 font-bold text-xs tracking-widest uppercase transition-colors hover:bg-stone-100 border border-stone-300"
                >
                  <span>View All Finishes</span>
                </Link>
              </div>

            </div>

            {/* Right Visual Half - Clean Image Panel */}
            <div className="lg:col-span-5 relative bg-gradient-to-br from-[#faf7f2] via-[#f4eee4] to-[#ebe1d1] min-h-[340px] sm:min-h-[380px] lg:min-h-[460px] flex items-center justify-center p-6 sm:p-10 lg:p-12 overflow-hidden select-none border-t lg:border-t-0 lg:border-l border-stone-300">
              
              {/* Ambient Radial Glow */}
              <div className="absolute w-72 h-72 rounded-full bg-amber-300/30 blur-3xl pointer-events-none" />
              
              {/* Faint Sacred Om Watermark */}
              <span className="absolute text-[160px] sm:text-[200px] lg:text-[240px] font-serif select-none text-stone-900/[0.04] pointer-events-none">
                🕉️
              </span>

              {/* Clean Product Visual Model */}
              <div className="relative z-10 group/img flex items-center justify-center w-full max-h-[320px] sm:max-h-[360px] lg:max-h-[400px]">
                <ImageWithSkeleton
                  src={spotlightImage}
                  alt={spotlightTitle}
                  width={440}
                  height={440}
                  priority
                  className="w-auto h-auto max-w-[85%] max-h-[280px] sm:max-h-[330px] lg:max-h-[380px] object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.22)] transition-transform duration-700 group-hover/img:scale-105"
                />
              </div>

            </div>
          </section>
        );
      })()}

      {/* Dynamic Middle Promotional Campaign Banners */}
      {middleBanners.length > 0 && (
        <section className="w-full space-y-6">
          {middleBanners.map((mb, idx) => (
            <div
              key={mb._id || idx}
              className="relative w-full bg-neutral-950 overflow-hidden text-white border-y border-stone-800"
            >
              {mb.imageUrl && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={formatImageUrl(mb.imageUrl)}
                    alt={mb.title}
                    className="w-full h-full object-cover object-center opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/40" />
                </div>
              )}
              <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-14 sm:py-18 lg:py-20 flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-2xl space-y-3 sm:space-y-4">
                  {mb.badge && (
                    <span className="inline-block bg-gold text-black text-[10px] font-black uppercase px-3 py-1 tracking-widest shadow">
                      {mb.badge}
                    </span>
                  )}
                  {mb.tagline && (
                    <p className="text-xs text-gold font-extrabold uppercase tracking-widest">
                      {mb.tagline}
                    </p>
                  )}
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight font-display text-white">
                    {mb.title}
                  </h2>
                  {mb.subtitle && (
                    <p className="text-neutral-300 text-xs sm:text-sm md:text-base font-normal max-w-xl leading-relaxed">
                      {mb.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  {mb.ctaText && (
                    <Link
                      href={mb.ctaLink || "/products"}
                      className="inline-flex items-center gap-2 bg-gold hover:bg-amber-400 text-black px-7 py-3.5 font-black text-xs uppercase tracking-widest transition-all shadow-lg hover:scale-105"
                    >
                      <span>{mb.ctaText}</span>
                      <span>→</span>
                    </Link>
                  )}
                  {mb.secondaryCtaText && (
                    <Link
                      href={mb.secondaryCtaLink || "/products"}
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3.5 font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      <span>{mb.secondaryCtaText}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 5. Full-Width 3-Column Dynamic Deity Series Grid */}
      <HomeDeitySeriesShowcase products={allProducts} deities={deities} categories={categories} />

      {/* 6. Dynamic Video Reels Carousel with Left / Right Scroll */}
      <VideoReelsCarousel videos={videos} />

      {/* Dynamic Pre-Footer Campaign Banners */}
      {footerBanners.length > 0 && (
        <section className="w-full space-y-6">
          {footerBanners.map((fb, idx) => (
            <div
              key={fb._id || idx}
              className="relative w-full bg-gradient-to-r from-amber-950 via-stone-900 to-amber-900 overflow-hidden text-white border-y border-stone-800"
            >
              {fb.imageUrl && (
                <div className="absolute inset-0 z-0">
                  <img
                    src={formatImageUrl(fb.imageUrl)}
                    alt={fb.title}
                    className="w-full h-full object-cover object-center opacity-30"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
                </div>
              )}
              <div className="relative z-10 max-w-5xl mx-auto px-6 sm:px-10 py-16 sm:py-20 text-center space-y-4">
                {fb.badge && (
                  <span className="inline-block bg-white text-black text-[10px] font-black uppercase px-3 py-1 tracking-widest shadow">
                    {fb.badge}
                  </span>
                )}
                {fb.tagline && (
                  <p className="text-xs text-gold font-extrabold uppercase tracking-widest">
                    {fb.tagline}
                  </p>
                )}
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tight font-display text-white max-w-3xl mx-auto">
                  {fb.title}
                </h2>
                {fb.subtitle && (
                  <p className="text-neutral-200 text-xs sm:text-sm md:text-base font-normal max-w-2xl mx-auto leading-relaxed">
                    {fb.subtitle}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
                  {fb.ctaText && (
                    <Link
                      href={fb.ctaLink || "/products"}
                      className="inline-flex items-center gap-2 bg-gold hover:bg-amber-400 text-black px-8 py-3.5 font-black text-xs uppercase tracking-widest transition-all shadow-xl hover:scale-105"
                    >
                      <span>{fb.ctaText}</span>
                      <span>→</span>
                    </Link>
                  )}
                  {fb.secondaryCtaText && (
                    <Link
                      href={fb.secondaryCtaLink || "/products"}
                      className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-6 py-3.5 font-bold text-xs uppercase tracking-widest transition-all"
                    >
                      <span>{fb.secondaryCtaText}</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 7. Full-Width "THE DESIGN LAB" Specifications Section */}
      <section id="design-lab" className="w-full bg-[#fdfcfb] py-20 md:py-28 px-6 md:px-16 lg:px-24 text-center border-b border-stone-200">
        <div className="w-full max-w-6xl mx-auto space-y-10">
          <div className="w-16 h-16 rounded-2xl border border-stone-200 bg-white shadow-md mx-auto flex items-center justify-center text-amber-800 font-bold text-2xl">
            ⌖
          </div>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            <p className="text-xs font-extrabold text-amber-800 uppercase tracking-widest">Engineering Divinity</p>
            <h2 className="font-display text-4xl md:text-6xl text-neutral-900 font-extrabold uppercase tracking-tight">THE DESIGN LAB</h2>
            <p className="text-stone-600 text-sm md:text-base leading-relaxed font-normal">
              Traditional idols are often cast in molds that lose the micro-details of ancient temple carvings. At MurtiLab, we combine digital sculpting, micro-precision 3D printing technology, and manual artisan post-finishing to create spiritual idols that are highly detailed and visually premium.
            </p>
          </div>
          
          <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 pt-6">
            <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2 transition-all hover:shadow-lg hover:-translate-y-1">
              <p className="text-3xl sm:text-5xl font-extrabold text-neutral-900">0.1 MM</p>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Printing Precision</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2 transition-all hover:shadow-lg hover:-translate-y-1">
              <p className="text-3xl sm:text-5xl font-extrabold text-neutral-900">48 HRS</p>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Dispatch Speed</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2 transition-all hover:shadow-lg hover:-translate-y-1">
              <p className="text-3xl sm:text-5xl font-extrabold text-neutral-900">100%</p>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Insured Box</p>
            </div>
            <div className="p-8 rounded-3xl bg-white border border-stone-200/80 shadow-sm space-y-2 transition-all hover:shadow-lg hover:-translate-y-1">
              <p className="text-3xl sm:text-5xl font-extrabold text-neutral-900">PREPAID</p>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Secured Gateways</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Full-Width Trust Strip */}
      <section className="w-full bg-white py-10 px-6 sm:px-12 md:px-16 border-b border-stone-200">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-stone-200">
          <div className="pt-4 md:pt-0">
            <p className="text-neutral-900 text-base sm:text-lg font-extrabold uppercase tracking-wider">🔬 0.1 MM LAYER</p>
            <p className="text-[11px] text-stone-500 uppercase tracking-widest font-bold mt-1">Surgical 3D Precision</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-neutral-900 text-base sm:text-lg font-extrabold uppercase tracking-wider">⚡ 48-HR DISPATCH</p>
            <p className="text-[11px] text-stone-500 uppercase tracking-widest font-bold mt-1">Priority Logistics</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-neutral-900 text-base sm:text-lg font-extrabold uppercase tracking-wider">📦 INSURED TRANSIT</p>
            <p className="text-[11px] text-stone-500 uppercase tracking-widest font-bold mt-1">Zero Breakage Guarantee</p>
          </div>
          <div className="pt-4 md:pt-0">
            <p className="text-neutral-900 text-base sm:text-lg font-extrabold uppercase tracking-wider">🛡️ 7-DAY RETURN</p>
            <p className="text-[11px] text-stone-500 uppercase tracking-widest font-bold mt-1">Hassle-Free Replacements</p>
          </div>
        </div>
      </section>

    </main>
  );
}
