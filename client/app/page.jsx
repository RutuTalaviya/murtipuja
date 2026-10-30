import Link from "next/link";
import { fetchProducts, fetchCategories, fetchBanners, fetchVideos, fetchDeities } from "@/lib/serverApi";
import { formatImageUrl } from "@/lib/api";
import HomeCategoryShowcase from "@/components/HomeCategoryShowcase";
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

      {/* Full-Width "THE DESIGN LAB" Specifications Section */}
      <section id="design-lab" className="w-full bg-[#fdfcfb] py-10 md:py-14 px-6 md:px-16 lg:px-24 text-center border-b border-stone-200">
        <div className="w-full max-w-3xl mx-auto space-y-3">
          <p className="text-xs font-extrabold text-amber-800 uppercase tracking-widest">Engineering Divinity</p>
          <h2 className="font-display text-3xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-tight">THE DESIGN LAB</h2>
          <p className="text-stone-600 text-sm md:text-base leading-relaxed font-normal">
            Traditional idols are often cast in molds that lose the micro-details of ancient temple carvings. At MurtiLab, we combine digital sculpting, micro-precision 3D printing technology, and manual artisan post-finishing to create spiritual idols that are highly detailed and visually premium.
          </p>
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
