"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Feather } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isResult = pathname === "/result";

  return (
    <nav className="h-[64px] px-8 bg-white border-b border-[#f0f0f0] flex items-center justify-between sticky top-0 z-50">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 no-underline">
        <div className="w-8 h-8 rounded-full bg-[#2b5a3f] flex items-center justify-center shadow-sm">
          <Feather color="white" size={14} strokeWidth={2.5} />
        </div>
        <span className="text-[16px] font-bold text-gray-900 tracking-tight">Saral</span>
      </Link>

      {/* Center Links - Absolutely centered */}
      {!isResult && (
        <div className="absolute left-1/2 -translate-x-1/2 hidden sm:flex items-center gap-8 h-full">
          <Link
            href="/"
            className={`h-full flex items-center text-[14px] font-medium border-b-2 transition-colors ${
              pathname === "/"
                ? "text-[#2b5a3f] border-[#2b5a3f]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Simplifier
          </Link>
          <Link
            href="/matcher"
            className={`h-full flex items-center text-[14px] font-medium border-b-2 transition-colors ${
              pathname === "/matcher"
                ? "text-[#2b5a3f] border-[#2b5a3f]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Eligibility matcher
          </Link>
          <Link
            href="/explorer"
            className={`h-full flex items-center text-[14px] font-medium border-b-2 transition-colors ${
              pathname === "/explorer"
                ? "text-[#2b5a3f] border-[#2b5a3f]"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            Scheme explorer
          </Link>
        </div>
      )}

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {isResult && (
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-white text-gray-700 text-[14px] font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            ☐ Simplify another
          </button>
        )}
      </div>
    </nav>
  );
}
