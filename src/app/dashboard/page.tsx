"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@root/lib/supabase";
import { FileText, Bookmark, CheckCircle, LogOut } from "lucide-react";
import type { User } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };
    checkUser();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9f8] pt-24">
        <div className="flex justify-center">
          <div className="w-10 h-10 border-[3px] border-[#2b5a3f]/20 border-t-[#2b5a3f] animate-spin rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) return null; // Fallback, shouldn't render as redirect happens

  // Display name can be from metadata or email name part
  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User";
  const capitalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);

  return (
    <div className="min-h-screen bg-[#f7f9f8] pt-12 pb-24 px-5">
      <div className="max-w-[760px] mx-auto">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-[32px] sm:text-[38px] font-bold text-gray-900 leading-tight mb-2">
            Welcome, {capitalizedName}
          </h1>
          <p className="text-[16px] text-gray-500">
            Here's everything you've saved with Saral
          </p>
        </div>

        {/* Empty States */}
        <div className="space-y-5 mb-16">
          
          {/* Recent Documents */}
          <div className="bg-white rounded-[20px] p-7 shadow-[0_1px_3px_rgba(31,42,36,0.05)] border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <FileText className="text-[#2b5a3f]" size={20} />
              <h2 className="text-[18px] font-semibold text-gray-900">Recent documents</h2>
            </div>
            <p className="text-[15px] text-gray-400 pl-8">
              Your simplified documents will appear here
            </p>
          </div>

          {/* Saved Schemes */}
          <div className="bg-white rounded-[20px] p-7 shadow-[0_1px_3px_rgba(31,42,36,0.05)] border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <Bookmark className="text-[#2b5a3f]" size={20} />
              <h2 className="text-[18px] font-semibold text-gray-900">Saved schemes</h2>
            </div>
            <p className="text-[15px] text-gray-400 pl-8">
              Schemes you save will appear here
            </p>
          </div>

          {/* Eligibility Matches */}
          <div className="bg-white rounded-[20px] p-7 shadow-[0_1px_3px_rgba(31,42,36,0.05)] border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-[#2b5a3f]" size={20} />
              <h2 className="text-[18px] font-semibold text-gray-900">Eligibility matches</h2>
            </div>
            <p className="text-[15px] text-gray-400 pl-8">
              Your eligibility matches will appear here
            </p>
          </div>

        </div>

        {/* Sign Out */}
        <div className="flex justify-center border-t border-gray-200 pt-8">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-[15px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
