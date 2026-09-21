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
  title: "MurtiPuja — Handcrafted 3D-Printed Divine Idols",
  description:
    "Premium 3D-printed murtis of Shiva, Ganesh, Krishna and more — crafted with detail, delivered with care.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
