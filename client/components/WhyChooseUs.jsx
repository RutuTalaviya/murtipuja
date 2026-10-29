"use client";

export default function WhyChooseUs({ brandName = "MurtiPuja" }) {
  const features = [
    {
      id: "finest-details",
      title: "FINEST DETAILS",
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-neutral-900 transition-transform duration-300 group-hover:scale-105"
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
          <path d="M47 38l12-10" strokeWidth="2.4" />
          <path d="M45 40l4-4" strokeWidth="2.8" />
          {/* Chisel Tip touching the sculpture */}
          <path d="M44 41l3-3" />
          {/* Sparks */}
          <path d="M40 37l-2-2" />
          <path d="M43 43l-1 2" />
          
          {/* Mallet / Hammer */}
          <path d="M57 26l7-6" strokeWidth="2.4" />
          <rect x="62" y="14" width="7" height="12" rx="1.5" transform="rotate(40 62 14)" strokeWidth="2" />
        </svg>
      ),
    },
    {
      id: "worldwide-shipping",
      title: "WORLDWIDE SHIPPING",
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-neutral-900 transition-transform duration-300 group-hover:scale-105"
        >
          {/* Globe behind truck */}
          <circle cx="34" cy="36" r="22" strokeWidth="2" />
          {/* Longitude and Latitude grid */}
          <ellipse cx="34" cy="36" rx="10" ry="22" strokeWidth="1.6" />
          <path d="M12 36h44" strokeWidth="1.6" />
          <path d="M16 25c5 3 11 5 18 5s13-2 18-5" strokeWidth="1.5" />
          <path d="M16 47c5-3 11-5 18-5s13 2 18 5" strokeWidth="1.5" />

          {/* Delivery Van / Truck in front */}
          <g transform="translate(10, 8)">
            {/* Cargo Box */}
            <rect x="20" y="24" width="28" height="20" rx="1" fill="white" strokeWidth="2" />
            {/* Cab Front */}
            <path d="M48 32h8l5 6v6h-13v-12z" fill="white" strokeWidth="2" />
            {/* Cab Window */}
            <path d="M49 34h6l3 4h-9v-4z" strokeWidth="1.5" />
            {/* Headlight */}
            <path d="M60 41h1" strokeWidth="2.2" />
            {/* Front Wheel */}
            <circle cx="53" cy="45" r="4.5" fill="white" strokeWidth="2" />
            <circle cx="53" cy="45" r="1.5" fill="currentColor" />
            {/* Rear Wheel */}
            <circle cx="28" cy="45" r="4.5" fill="white" strokeWidth="2" />
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
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-neutral-900 transition-transform duration-300 group-hover:scale-105"
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
            strokeWidth="1.5"
            fill="none"
          />
          {/* Right Star */}
          <path
            d="M56 16l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4-2.9-2.8 4-.6z"
            strokeWidth="1.5"
            fill="none"
          />

          {/* Quality Badge Oval / Circle */}
          <ellipse cx="40" cy="48" rx="26" ry="22" strokeWidth="2" />
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
      icon: (
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 text-neutral-900 transition-transform duration-300 group-hover:scale-105"
        >
          {/* 5-Star Speech Bubble at top */}
          <path
            d="M18 16h44c2.2 0 4 1.8 4 4v16c0 2.2-1.8 4-4 4H38l-6 6v-6h-14c-2.2 0-4-1.8-4-4V20c0-2.2 1.8-4 4-4z"
            strokeWidth="2"
            fill="white"
          />
          {/* 5 Small Stars inside speech bubble */}
          <g transform="translate(6, 4)">
            {[20, 27, 34, 41, 48].map((cx, i) => (
              <path
                key={i}
                d={`M${cx} 22l1 2 2.2.3-1.6 1.6.4 2.2-2-1-2 1 .4-2.2-1.6-1.6 2.2-.3z`}
                strokeWidth="1.2"
                fill="currentColor"
              />
            ))}
          </g>

          {/* Thumbs Up Hand */}
          <g transform="translate(4, 2)">
            {/* Phone/Device/Sleeve border */}
            <rect x="20" y="44" width="7" height="18" rx="1.5" strokeWidth="2" fill="white" />
            <line x1="22" y1="50" x2="25" y2="50" strokeWidth="1.8" />
            
            {/* Hand with Thumbs Up */}
            <path
              d="M27 48h4l6-12c1-2 3-3 5-2 2 1 2 3 1 5l-2 9h10c2.2 0 4 1.8 4 4 0 1-.3 1.8-.8 2.4.8.7 1.2 1.7 1 2.8-.2 1.4-1.2 2.5-2.5 2.7.5.8.5 1.8.1 2.7-.6 1.2-1.8 2-3.1 2H39c-4 0-8-3-12-6"
              strokeWidth="2"
              fill="white"
            />
          </g>
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full py-14 md:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <h2 className="text-center font-display text-base sm:text-lg md:text-xl font-normal text-neutral-800 mb-12 md:mb-16 tracking-wide">
          Why should you choose {brandName} ?
        </h2>

        {/* 4 Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-10 items-start">
          {features.map((item) => (
            <div
              key={item.id}
              className="flex flex-col items-center text-center group cursor-default"
            >
              {/* Icon Container */}
              <div className="mb-4 sm:mb-5 flex items-center justify-center transition-all duration-300">
                {item.icon}
              </div>

              {/* Title */}
              <h3 className="font-display text-xs sm:text-[13px] font-bold uppercase tracking-wider text-neutral-900 leading-snug">
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
