"use client";

import Link from "next/link";

const SOCIALS = [
  {
    name: "Facebook", href: "#", svg: (
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    )
  },
  {
    name: "X", href: "#", svg: (
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  {
    name: "Pinterest", href: "#", svg: (
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.41 7.61 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.966 1.406-5.966s-.359-.72-.359-1.781c0-1.663.967-2.907 2.17-2.907 1.02 0 1.513.769 1.513 1.687 0 1.029-.653 2.561-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.007-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.211-.174.256-.402.15-1.498-.698-2.435-2.895-2.435-4.654 0-3.791 2.752-7.271 7.942-7.271 4.164 0 7.397 2.966 7.397 6.932 0 4.136-2.607 7.464-6.22 7.464-1.213 0-2.354-.63-2.744-1.37l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.62 0 12-5.38 12-12s-5.38-12-12-12z" />
      </svg>
    )
  },
  {
    name: "Instagram", href: "#", svg: (
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    )
  },
  {
    name: "LinkedIn", href: "#", svg: (
      <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
      </svg>
    )
  }
];

export default function Footer() {
  return (
    <footer className="bg-black text-white/80 border-t-2 border-black pt-16 pb-8 px-6 md:px-12 relative overflow-hidden font-display w-full">
      <div className="w-full z-10 relative">
        {/* 4-Column Grid with Only Real & Working Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 pb-16 border-b border-white/10">

          {/* Column 1: Brand Info */}
          <div className="space-y-5 text-center md:text-left flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="MURTIPUJA"
                className="h-8 md:h-9 w-auto object-contain filter invert mix-blend-screen transition-opacity hover:opacity-80"
              />
            </Link>
            <p className="text-xs text-white/60 leading-relaxed font-semibold">
              Precision 3D-printed spiritual objects. Handcrafted and consecrated in India.
            </p>

            {/* Outlined Social circles */}
            <div className="flex gap-2.5 pt-2">
              {SOCIALS.map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-8 h-8 rounded-full border border-white/10 hover:border-gold hover:text-gold flex items-center justify-center text-white/50 transition-all hover:scale-105"
                  aria-label={social.name}
                >
                  {social.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: SHOP COLLECTIONS */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-[11px] font-bold tracking-widest text-white uppercase">
              Collections
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-semibold uppercase tracking-wider">
              <li><Link href="/products" className="hover:text-gold transition-colors">All Sculptures</Link></li>
              <li><Link href="/products?purpose=pooja-room" className="hover:text-gold transition-colors">Pooja Essentials</Link></li>
              <li><Link href="/contact" className="hover:text-gold transition-colors">Custom & Bulk Orders</Link></li>
            </ul>
          </div>

          {/* Column 3: CUSTOMER CARE */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-[11px] font-bold tracking-widest text-white uppercase">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-semibold uppercase tracking-wider">
              <li><Link href="/contact" className="hover:text-gold transition-colors">Contact Us</Link></li>
              <li><Link href="/track-order" className="hover:text-gold transition-colors">Track Order</Link></li>
              <li><Link href="/return-and-exchange" className="hover:text-gold transition-colors">Return & Exchange</Link></li>
              <li><Link href="/track-return" className="hover:text-gold transition-colors">Track Return Status</Link></li>
            </ul>
          </div>

          {/* Column 4: POLICIES & STUDIO */}
          <div className="space-y-4 text-center md:text-left">
            <h4 className="text-[11px] font-bold tracking-widest text-white uppercase">
              Policies & Help
            </h4>
            <ul className="space-y-2.5 text-xs text-white/60 font-semibold uppercase tracking-wider">
              <li><Link href="/about" className="hover:text-gold transition-colors">About Us</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-gold transition-colors">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-gold transition-colors">Return Policy</Link></li>
              <li><Link href="/faqs" className="hover:text-gold transition-colors">FAQs</Link></li>
              <li>
                <a
                  href="https://wa.me/917990138678?text=Hi%20MurtiPuja%20Support,%20I%20have%20an%20inquiry."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors text-gold"
                >
                  WhatsApp: +91 79901 38678
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 text-[11px] text-white/40 font-semibold gap-4 uppercase tracking-wider">
          <div>
            © {new Date().getFullYear()} MurtiPuja. All rights reserved.
          </div>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href="/terms" className="hover:text-gold transition-colors">Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" className="hover:text-gold transition-colors">Terms of Service</Link>
            <span>·</span>
            <Link href="/refund-policy" className="hover:text-gold transition-colors">Return Policy</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
