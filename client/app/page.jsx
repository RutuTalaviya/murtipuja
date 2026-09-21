import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { fetchProducts, fetchCategories, fetchBanners, fetchVideos } from "@/lib/serverApi";
import HomeCategoryShowcase from "@/components/HomeCategoryShowcase";
import ScrollReveal from "@/components/ScrollReveal";
import HeroBanner from "@/components/HeroBanner";
import VideoReelsCarousel from "@/components/VideoReelsCarousel";

const DEITY_IMAGES = {
  shiva: "/images/shiva.png",
  ganesh: "/images/ganesh.png",
  krishna: "/images/krishna.jpg",
  hanuman: "/images/hanuman.jpg",
  durga: "/images/durga.jpg",
  saraswati: "/images/saraswati.jpg",
};

const DEITY_SUBTITLES = {
  shiva: "Drop 01 · Meditative Power",
  ganesh: "Drop 02 · Auspicious Beginnings",
  krishna: "Drop 03 · Divine Devotion",
  hanuman: "Drop 04 · Strength & Protection",
  durga: "Drop 05 · Sacred Mahashakti",
  saraswati: "Drop 06 · Wisdom & Purity",
};

const DEFAULT_DEITY_CATEGORIES = [
  { _id: "deity-shiva", name: "Shiva", slug: "shiva" },
  { _id: "deity-ganesh", name: "Ganesh", slug: "ganesh" },
  { _id: "deity-krishna", name: "Krishna", slug: "krishna" },
];

export default async function HomePage() {
  let allProducts = [];
  let categories = [];
  let banners = [];
  let videos = [];

  try {
    const [productsData, categoriesData, bannersData, videosData] = await Promise.allSettled([
      fetchProducts({ limit: 100 }),
      fetchCategories(),
      fetchBanners({ position: "hero" }),
      fetchVideos()
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
  } catch (err) {
    console.error("Failed to load homepage data:", err);
  }

  return (
    <main className="min-h-screen bg-white overflow-x-hidden font-display w-full">
      
      {/* 1. Dynamic Full-Screen Hero Campaign Section */}
      <HeroBanner banners={banners} />


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

      {/* 3. Category-Wise 4 Random Products Sections + Mixed Paginated View More */}
      <HomeCategoryShowcase categories={categories} products={allProducts} />

      {/* 4. Full-Screen Edge-to-Edge Campaign Spotlight - DYNAMIC SPOTLIGHT */}
      {(() => {
        const shivaProduct = allProducts.find(
          (p) => p.deity && p.deity.toLowerCase() === "shiva"
        );
        const spotlightImage = shivaProduct?.images?.[0]?.url || "/images/shiva.png";
        const spotlightTitle = shivaProduct?.title || "The Obsidian Shiva";
        const spotlightDescription =
          shivaProduct?.description ||
          "Cast with a high-density sandstone core and post-cured in matte obsidian black. Sculpted to microscopic detail capturing the sacred crescent moon, trishul, and meditative posture with unmatched spiritual presence.";
        const spotlightLink = shivaProduct?.slug
          ? `/products/${shivaProduct.slug}`
          : "/products?category=shiva";

        return (
          <section className="w-full min-h-[80vh] lg:min-h-[85vh] bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden border-b border-stone-200">
            {/* Left Content Half */}
            <div className="lg:col-span-7 p-8 sm:p-12 md:p-16 lg:p-20 xl:p-24 flex flex-col justify-center space-y-6 sm:space-y-8 bg-white">
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center gap-2 bg-amber-50 text-amber-950 border border-amber-200 px-4 py-1.5 text-xs font-extrabold tracking-widest uppercase shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>Highlight Release</span>
                </div>
                <span className="text-xs text-stone-500 uppercase tracking-widest font-extrabold">
                  {shivaProduct?.deity ? `${shivaProduct.deity.toUpperCase()} SERIES` : "Drop 01 · Signature Series"}
                </span>
              </div>

              <div className="space-y-2.5">
                <h2 className="font-display text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-extrabold uppercase tracking-tight text-neutral-900 leading-[0.95]">
                  {spotlightTitle}
                </h2>
                <p className="text-amber-800 text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-wider">
                  {shivaProduct?.deity ? `Lord ${shivaProduct.deity}` : "Lord Shiva"} · Micro-Precision Sacred 3D Sculpture
                </p>
              </div>

              <p className="text-stone-600 text-sm sm:text-base md:text-lg leading-relaxed font-normal max-w-2xl">
                {spotlightDescription}
              </p>

              {/* Action CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-4">
                <Link
                  href={spotlightLink}
                  className="group inline-flex items-center gap-3 bg-neutral-900 hover:bg-neutral-800 text-white px-9 py-4 font-extrabold text-xs tracking-widest uppercase transition-all duration-300 shadow-lg hover:shadow-2xl hover:-translate-y-0.5"
                >
                  <span>Explore {shivaProduct?.deity || "Shiva"} Series</span>
                  <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                </Link>

                <Link
                  href="/products"
                  className="inline-flex items-center gap-2 text-neutral-700 hover:text-black px-6 py-4 font-bold text-xs tracking-widest uppercase transition-colors hover:bg-stone-100 border border-stone-200"
                >
                  <span>View All Finishes</span>
                </Link>
              </div>

            </div>

            {/* Right Visual Half - Clean Image Panel without Floating Boxes */}
            <div className="lg:col-span-5 relative bg-gradient-to-br from-[#faf7f2] via-[#f4eee4] to-[#ebe1d1] min-h-[450px] lg:min-h-full flex items-center justify-center p-8 sm:p-14 lg:p-16 overflow-hidden select-none">
              
              {/* Ambient Radial Glow */}
              <div className="absolute w-96 h-96 rounded-full bg-amber-300/30 blur-3xl pointer-events-none" />
              
              {/* Faint Sacred Om Watermark */}
              <span className="absolute text-[220px] lg:text-[280px] font-serif select-none text-stone-900/[0.04] pointer-events-none">
                🕉️
              </span>

              {/* Clean Product Visual Model (Handled dynamically from Backend) */}
              <div className="relative z-10 group/img flex items-center justify-center w-full">
                <ImageWithSkeleton
                  src={spotlightImage}
                  alt={spotlightTitle}
                  width={520}
                  height={520}
                  priority
                  className="w-full max-w-[340px] sm:max-w-[420px] lg:max-w-[460px] xl:max-w-[500px] h-auto object-contain drop-shadow-[0_30px_45px_rgba(0,0,0,0.22)] transition-transform duration-700 group-hover/img:scale-105"
                />
              </div>

            </div>
          </section>
        );
      })()}

      {/* 5. Full-Width 3-Column Deity Series Grid */}
      <section className="w-full bg-white border-b border-stone-200">
        <div className="w-full px-6 sm:px-12 md:px-16 lg:px-20 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 bg-white">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-800 font-extrabold mb-1">
              Sacred Collections
            </p>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight">
              Shop by Deity Series
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-extrabold text-neutral-700 hover:text-amber-800 uppercase tracking-widest transition-colors flex items-center gap-1.5"
          >
            <span>Explore All Series</span>
            <span>→</span>
          </Link>
        </div>

        <div className="w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 bg-stone-100">
          {(categories.length > 0 ? categories : DEFAULT_DEITY_CATEGORIES).slice(0, 3).map((cat) => {
            const slug = (cat.slug || cat.name || "").toLowerCase();
            const imageSrc = DEITY_IMAGES[slug] || "/images/shiva.png";
            const subtitle = DEITY_SUBTITLES[slug] || `${cat.name} Series · Limited Drop`;
            const label = cat.name === "Ganesh" ? "GANESH SERIES" : `${cat.name.toUpperCase()} SERIES`;

            return (
              <Link
                key={cat._id}
                href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                className="group relative h-[440px] sm:h-[480px] lg:h-[520px] overflow-hidden flex flex-col justify-between p-7 sm:p-9 bg-gradient-to-b from-white via-[#faf8f5] to-[#f4eee4] hover:from-[#fdf8f0] hover:to-[#ede2cf] transition-all duration-500"
              >
                {/* Ambient Halo Glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Top Badge & Indicator */}
                <div className="flex justify-between items-center z-10">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/90 text-[11px] font-extrabold uppercase tracking-widest text-neutral-800 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    <span>{subtitle}</span>
                  </span>
                  <span className="w-8 h-8 rounded-full bg-white/80 border border-stone-200/80 flex items-center justify-center text-stone-500 text-xs font-bold group-hover:rotate-90 group-hover:text-amber-800 group-hover:bg-white transition-all duration-500 shadow-sm">
                    ⌖
                  </span>
                </div>

                {/* Center High-Resolution Idol Image */}
                <div className="relative my-auto flex items-center justify-center py-4 z-0">
                  <ImageWithSkeleton
                    src={imageSrc}
                    alt={cat.name}
                    width={280}
                    height={280}
                    className="w-44 sm:w-52 lg:w-56 h-44 sm:h-52 lg:h-56 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.16)] transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                  />
                </div>

                {/* Bottom Card Information */}
                <div className="space-y-2 z-10 bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-stone-200/80 shadow-sm group-hover:border-amber-300/80 group-hover:bg-white/95 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight uppercase group-hover:text-amber-900 transition-colors">
                        {label}
                      </h3>
                      <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">
                        Micro-Precision 3D Sculptures
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white group-hover:bg-amber-600 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shadow-sm flex-shrink-0">
                      →
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Dynamic Video Reels Carousel with Left / Right Scroll */}
      <VideoReelsCarousel videos={videos} />

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
