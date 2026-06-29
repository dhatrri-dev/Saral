"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Feather, Menu, X, LogOut, LayoutDashboard, UserCircle } from "lucide-react";
import { supabase } from "@root/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const isResult = pathname === "/result";
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsProfileOpen(false);
    router.push("/");
    router.refresh();
  };

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
            + Simplify another
          </button>
        )}
        
        {user ? (
          <div className="relative ml-2" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-9 h-9 rounded-full bg-[#1c3827] flex items-center justify-center text-white font-bold text-[14px] hover:opacity-90 transition-opacity"
            >
              {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
            </button>
            
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b border-gray-50">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.user_metadata?.full_name || "Account"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {user.email}
                  </p>
                </div>
                
                <div className="py-1">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <LayoutDashboard size={16} className="text-gray-400" />
                    Dashboard
                  </Link>
                </div>
                
                <div className="py-1 border-t border-gray-50">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-5 py-2 bg-white text-gray-700 text-[14px] font-medium rounded-full border border-gray-200 hover:bg-gray-50 transition-colors ml-2"
          >
            Sign in
          </Link>
        )}
        
        {/* Mobile menu toggle */}
        {!isResult && (
          <button 
            className="sm:hidden flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 ml-1"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}
      </div>

      {/* Mobile Menu Dropdown */}
      {!isResult && isMenuOpen && (
        <div className="absolute top-[64px] left-0 w-full bg-white border-b border-[#f0f0f0] shadow-sm sm:hidden flex flex-col px-6 py-4 gap-4 z-40 animate-in slide-in-from-top-2">
          <Link
            href="/"
            onClick={() => setIsMenuOpen(false)}
            className={`text-[16px] font-medium transition-colors ${
              pathname === "/" ? "text-[#2b5a3f]" : "text-gray-600"
            }`}
          >
            Simplifier
          </Link>
          <Link
            href="/matcher"
            onClick={() => setIsMenuOpen(false)}
            className={`text-[16px] font-medium transition-colors ${
              pathname === "/matcher" ? "text-[#2b5a3f]" : "text-gray-600"
            }`}
          >
            Eligibility matcher
          </Link>
          <Link
            href="/explorer"
            onClick={() => setIsMenuOpen(false)}
            className={`text-[16px] font-medium transition-colors ${
              pathname === "/explorer" ? "text-[#2b5a3f]" : "text-gray-600"
            }`}
          >
            Scheme explorer
          </Link>
        </div>
      )}
    </nav>
  );
}
