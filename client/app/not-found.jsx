import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-[70vh] bg-white flex flex-col items-center justify-center p-6 text-center font-display w-full">
      <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 mb-2">404 Error</span>
      <h1 className="text-4xl sm:text-5xl font-extrabold text-black uppercase tracking-wider mb-4">
        Murti Not Found
      </h1>
      <p className="text-neutral-500 font-semibold text-xs sm:text-sm max-w-md mb-8">
        The drop or page you are looking for might have moved, expired, or does not exist in the active catalog.
      </p>
      <Link
        href="/products"
        className="bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-widest px-8 py-3.5 border-2 border-black transition-all"
      >
        Explore All Drops
      </Link>
    </main>
  );
}
