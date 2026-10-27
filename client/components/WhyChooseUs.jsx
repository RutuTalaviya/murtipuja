"use client";

export default function WhyChooseUs({ brandName = "MurtiPuja" }) {
  const features = [
    {
      id: "finest-details",
      title: "FINEST DETAILS",
      subtitle: "Micro-sculpted artisan craftsmanship",
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-16 h-16 sm:w-20 sm:h-20 text-neutral-800 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Classical Sculptor Bust with Chisel and Mallet */}
          {/* Head & Hair of Statue */}
          <path d="M30 18c-3-3-8-2-10 1-2 3-1 7 1 9" />
          <path d="M21 28c-3 1-5 4-4 8 1 3 3 5 6 5" />
          <path d="M23 41c-2 2-3 5-2 8 1 3 4 5 7 5" />
          {/* Facial Profile */}
          <path d="M30 18c4-1 9 1 11 5 2 3 2 6 0 9l4 4c1 1 0 3-1 3h-4c-1 3-3 5-6 6" />
          {/* Eye & Brow */}
          <path d="M28 25c1 1 3 1 4 0" />
          <path d="M29 28h2" />
          {/* Nose & Mouth */}
          <path d="M34 32h-3c-1 0-2 1-2 2s1 2 2 2h2" />
          {/* Neck & Muscular Torso */}
          <path d="M26 54v6c0 4-4 8-8 10h34c-4-2-8-6-8-10v-6" />
          {/* Chest lines */}
          <path d="M29 64c3 3 8 3 11 0" />
          <path d="M35 60v10" />
          {/* Base Pedestal */}
          <path d="M15 70h38v4H15z" />
          
          {/* Sculpting Chisel */}
          <path d="M47 38l12-10" strokeWidth="2.5" />
          <path d="M45 40l4-4" strokeWidth="3" />
          {/* Chisel Tip touching the sculpture */}
          <path d="M44 41l3-3" />
          {/* Spark / impact details */}
          <path d="M40 37l-2-2" />
          <path d="M43 43l-1 2" />
          
          {/* Mallet / Hammer */}
          <path d="M57 26l7-6" strokeWidth="2.5" />
          <rect x="62" y="14" width="7" height="12" rx="1.5" transform="rotate(40 62 14)" strokeWidth="2.2" />
        </svg>
      ),
    },
    {
      id: "worldwide-shipping",
      title: "WORLDWIDE SHIPPING",
      subtitle: "Express air transit & safe packaging",
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-16 h-16 sm:w-20 sm:h-20 text-neutral-800 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Globe behind truck */}
          <circle cx="34" cy="36" r="22" strokeWidth="2.2" />
          {/* Longitude and Latitude grid */}
          <ellipse cx="34" cy="36" rx="10" ry="22" strokeWidth="1.8" />
          <path d="M12 36h44" strokeWidth="1.8" />
          <path d="M16 25c5 3 11 5 18 5s13-2 18-5" strokeWidth="1.6" />
          <path d="M16 47c5-3 11-5 18-5s13 2 18 5" strokeWidth="1.6" />

          {/* Delivery Van / Truck in front */}
          <g transform="translate(10, 8)">
            {/* Cargo Box */}
            <rect x="20" y="24" width="28" height="20" rx="1" fill="#FAF9F6" strokeWidth="2.2" />
            {/* Cab Front */}
            <path d="M48 32h8l5 6v6h-13v-12z" fill="#FAF9F6" strokeWidth="2.2" />
            {/* Cab Window */}
            <path d="M49 34h6l3 4h-9v-4z" strokeWidth="1.6" />
            {/* Headlight */}
            <path d="M60 41h1" strokeWidth="2.5" />
            {/* Front Wheel */}
            <circle cx="53" cy="45" r="4.5" fill="#FAF9F6" strokeWidth="2.2" />
            <circle cx="53" cy="45" r="1.5" fill="currentColor" />
            {/* Rear Wheel */}
            <circle cx="28" cy="45" r="4.5" fill="#FAF9F6" strokeWidth="2.2" />
            <circle cx="28" cy="45" r="1.5" fill="currentColor" />
            {/* Road lines / speed motion */}
            <path d="M10 50h45" strokeWidth="2" strokeDasharray="3 3" />
          </g>
        </svg>
      ),
    },
    {
      id: "realistic-finish",
      title: "REALISTIC FINISH",
      subtitle: "Authentic bronze, marble & gold patina",
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-16 h-16 sm:w-20 sm:h-20 text-neutral-800 transition-transform duration-300 group-hover:scale-105"
        >
          {/* 3 Stars at the top */}
          {/* Center Star */}
          <path
            d="M40 12l2.2 4.5 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5-3.6-3.5 5-.7z"
            strokeWidth="1.8"
            fill="none"
          />
          {/* Left Star */}
          <path
            d="M24 16l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"
            strokeWidth="1.6"
            fill="none"
          />
          {/* Right Star */}
          <path
            d="M56 16l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"
            strokeWidth="1.6"
            fill="none"
          />

          {/* Quality Badge Oval / Circle */}
          <ellipse cx="40" cy="48" rx="26" ry="22" strokeWidth="2.2" />
          <ellipse cx="40" cy="48" rx="22" ry="18" strokeWidth="1.2" strokeDasharray="2 3" />

          {/* "HIGH QUALITY" inside badge */}
          <text
            x="40"
            y="44"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="900"
            letterSpacing="0.1em"
            fill="currentColor"
            stroke="none"
            className="font-display"
          >
            HIGH
          </text>
          <text
            x="40"
            y="54"
            textAnchor="middle"
            fontSize="7.5"
            fontWeight="900"
            letterSpacing="0.1em"
            fill="currentColor"
            stroke="none"
            className="font-display"
          >
            QUALITY
          </text>
        </svg>
      ),
    },
    {
      id: "happy-customers",
      title: "ONE LAKH+ HAPPY CUSTOMERS",
      subtitle: "Revered in 10,000+ homes & mandirs",
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-16 h-16 sm:w-20 sm:h-20 text-neutral-800 transition-transform duration-300 group-hover:scale-105"
        >
          {/* 5-Star Speech Bubble at top */}
          <path
            d="M18 16h44c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H38l-6 6v-6h-14c-2.2 0-4-1.8-4-4V20c0-2.2 1.8-4 4-4z"
            strokeWidth="2.2"
            fill="#FAF9F6"
          />
          {/* 5 Small Stars inside speech bubble */}
          <g transform="translate(6, 4)">
            {[20, 27, 34, 41, 48].map((cx, i) => (
              <path
                key={i}
                d={`M${cx} 22l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z`}
                strokeWidth="1.3"
                fill="currentColor"
              />
            ))}
          </g>

          {/* Thumbs Up Hand */}
          <g transform="translate(4, 2)">
            {/* Cuff / Sleeve */}
            <rect x="20" y="44" width="7" height="18" rx="1.5" strokeWidth="2.2" fill="#FAF9F6" />
            <line x1="22" y1="50" x2="25" y2="50" strokeWidth="2" />
            
            {/* Hand with Thumbs Up */}
            <path
              d="M27 48h4l6-12c1-2 3-3 5-2 2 1 2 3 1 5l-2 9h10c2.2 0 4 1.8 4 4 0 1-.3 1.8-.8 2.4.8.7 1.2 1.7 1 2.8-.2 1.4-1.2 2.5-2.5 2.7.5.8.5 1.8.1 2.7-.6 1.2-1.8 2-3.1 2H39c-4 0-8-3-12-6"
              strokeWidth="2.2"
              fill="#FAF9F6"
            />
          </g>
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full py-12 md:py-16 bg-[#FAF9F6] border-y border-stone-200/80 my-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="text-center font-display text-lg sm:text-xl md:text-2xl font-bold tracking-wide text-neutral-900 mb-10 md:mb-14">
          Why should you choose {brandName} ?
        </h2>

        {/* 4 Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-8 items-start">
          {features.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center group cursor-default"
            >
              {/* Icon Container */}
              <div className="mb-4 sm:mb-5 flex items-center justify-center p-2 rounded-full transition-all duration-300">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="font-display text-xs sm:text-[13px] font-extrabold uppercase tracking-widest text-neutral-800 leading-snug group-hover:text-black transition-colors">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
