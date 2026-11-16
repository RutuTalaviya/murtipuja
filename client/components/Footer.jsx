"use client";

import Link from "next/link";

const SOCIALS = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/murtipuja_official?cplk=MTlpbGRsdGg0cnRpcQ==",
    svg: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/profile.php?id=61596081839933",
    svg: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
      </svg>
    ),
  },
  {
    name: "WhatsApp",
    href: "https://wa.me/917990138678?text=Hi%20MurtiPuja%20Support,%20I%20have%20an%20inquiry.",
    svg: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.031 0C5.394 0 .016 5.378.016 12.016c0 2.122.554 4.19 1.609 6.015L0 24l6.164-1.616A11.96 11.96 0 0012.031 24c6.637 0 12.016-5.378 12.016-12.016 0-6.638-5.379-12.016-12.016-12.016zm0 22.029c-1.802 0-3.568-.484-5.116-1.401l-.367-.218-3.799.996 1.014-3.702-.239-.38a9.997 9.997 0 01-1.532-5.308c0-5.534 4.505-10.038 10.039-10.038 5.534 0 10.039 4.504 10.039 10.038 0 5.535-4.505 10.04-10.039 10.04zm5.503-7.514c-.302-.152-1.787-.882-2.064-.983-.277-.101-.479-.152-.68.152-.202.303-.781.983-.958 1.185-.176.202-.353.227-.655.076s-1.274-.47-2.426-1.498c-.897-.799-1.502-1.787-1.678-2.09-.176-.303-.019-.467.133-.618.136-.135.302-.353.454-.53.151-.177.202-.303.302-.505.101-.202.051-.379-.025-.53s-.68-1.641-.933-2.247c-.246-.59-.496-.51-.68-.519l-.58-.01c-.202 0-.53.076-.807.379-.277.303-1.059 1.035-1.059 2.524s1.084 2.928 1.236 3.13c.151.202 2.134 3.259 5.17 4.571.722.312 1.286.499 1.726.638.725.23 1.385.198 1.906.12.58-.087 1.787-.731 2.039-1.438.252-.707.252-1.313.176-1.439-.075-.126-.277-.202-.579-.354z" />
      </svg>
    ),
  },
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
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-full border border-white/10 hover:border-gold hover:text-gold flex items-center justify-center text-white/50 transition-all hover:scale-105"
                  aria-label={social.name}
                  title={social.name}
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
              <li><Link href="/bulk-inquiry" className="hover:text-gold transition-colors">Custom & Bulk Orders</Link></li>
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
                  className="hover:text-gold transition-colors text-gold inline-flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Chat on WhatsApp
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
