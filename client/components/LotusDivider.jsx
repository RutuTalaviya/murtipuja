"use client";

export default function LotusDivider({ className = "" }) {
  return (
    <div className={`flex items-center justify-center gap-4 py-8 max-w-2xl mx-auto ${className}`}>
      <div className="flex-1 h-[1px] bg-black/10" />
      <span className="text-black/30 font-display text-sm tracking-widest select-none font-bold">⌖</span>
      <div className="flex-1 h-[1px] bg-black/10" />
    </div>
  );
}
