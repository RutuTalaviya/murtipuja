import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import LoginModal from "@/components/LoginModal";
import ShadedBackground from "@/components/ShadedBackground";

export const metadata = {
  metadataBase: new URL("https://murtipuja.com"),
  title: {
    default: "MurtiPuja — Handcrafted 0.1mm 3D-Printed Divine Sacred Idols",
    template: "%s | MurtiPuja",
  },
  description:
    "Discover handcrafted 0.1mm micro-precision 3D-printed Hindu idols of Shiva, Ganesha, Krishna, Ram Lalla, and Hanuman. Engineered in Surat with Vedic proportions & 100% insured delivery.",
  keywords: [
    "3d printed murti",
    "sacred hindu idols",
    "shiva murti 3d print",
    "ganesha idol buy online",
    "ram lalla idol",
    "krishna murti",
    "hanuman murti",
    "murtipuja surat",
    "luxury pooja room idols",
    "vedic sculptures india",
  ],
  authors: [{ name: "MurtiPuja Studio", url: "https://murtipuja.com" }],
  creator: "MurtiPuja",
  publisher: "MurtiPuja",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MurtiPuja — Handcrafted 0.1mm 3D-Printed Divine Sacred Idols",
    description:
      "Precision 3D-crafted devotional sculptures of Shiva, Ganesh, Krishna, Ram and Hanuman with artisan finishes.",
    url: "https://murtipuja.com",
    siteName: "MurtiPuja",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "MurtiPuja 24k Gold Sacred Insignia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MurtiPuja — Handcrafted 3D-Printed Sacred Idols",
    description: "0.1mm micro-precision 3D-sculpted divine Hindu idols engineered in Surat.",
    images: ["/icon.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "any" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon.png",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "MurtiPuja",
  alternateName: "MurtiLab Devotional Sculptures",
  url: "https://murtipuja.com",
  logo: "https://murtipuja.com/icon.png",
  description: "India's premier 0.1mm micro-precision 3D-sculpted sacred Hindu idols studio in Surat, Gujarat.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Ring Road, Textile & Diamond City",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    postalCode: "395007",
    addressCountry: "IN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+91-9664737035",
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "hi", "gu"],
    },
  ],
  sameAs: [
    "https://instagram.com/murtipuja",
    "https://facebook.com/murtipuja",
    "https://youtube.com/@murtipuja",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "MurtiPuja",
  url: "https://murtipuja.com",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://murtipuja.com/products?search={search_term_string}",
    },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className="font-body bg-ivory text-charcoal min-h-screen flex flex-col relative">
        <ShadedBackground />
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Navbar />
              <CartDrawer />
              <LoginModal />
              <div className="flex-1 bg-transparent">{children}</div>
              <Footer />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
