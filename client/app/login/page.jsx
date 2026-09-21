"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { openLoginModal } = useAuth();

  useEffect(() => {
    openLoginModal();
    router.replace(redirectUrl === "/login" ? "/" : redirectUrl);
  }, [openLoginModal, redirectUrl, router]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center p-8 font-display">
      <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">
        Opening Login...
      </p>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center font-display">
          <div className="text-neutral-400 font-bold text-xs uppercase tracking-widest">Loading...</div>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
