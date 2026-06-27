"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@root/lib/supabase";
import { AlertCircle, Feather, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) {
          setError(signUpError.message || "Failed to create account.");
        } else {
          setSuccess("Account created successfully! You can now sign in.");
          setIsSignUp(false);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          setError("Incorrect email or password.");
        } else {
          router.push("/dashboard");
          router.refresh(); // Ensure layout updates
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3.5 text-[15px] text-gray-800 bg-white border border-[#e0e5e2] rounded-[12px] outline-none focus:border-[#2b5a3f] focus:ring-2 focus:ring-[#2b5a3f]/10 transition-all placeholder:text-gray-400";
  const labelBase =
    "block text-[13px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-[#f7f9f8] flex flex-col items-center justify-center p-5">
      <div className="w-full max-w-[420px]">
        <div className="bg-white rounded-[24px] p-8 sm:p-10 shadow-[0_1px_4px_rgba(31,42,36,0.07),0_1px_2px_rgba(31,42,36,0.05)] text-center relative overflow-hidden">
          
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full bg-[#e8f2ec] flex items-center justify-center">
              <Feather className="text-[#2b5a3f]" size={20} strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-[26px] font-bold text-gray-900 mb-2">
            {isSignUp ? "Create an account" : "Welcome back"}
          </h1>
          <p className="text-[15px] text-gray-500 mb-8">
            {isSignUp
              ? "Sign up to save your documents and schemes"
              : "Sign in to save your documents and schemes"}
          </p>

          <form onSubmit={handleSubmit} className="text-left">
            <div className="mb-5">
              <label htmlFor="email" className={labelBase}>Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@email.com"
                required
                className={inputBase}
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className={labelBase}>Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className={`${inputBase} pr-12`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-[#d64c4c] text-[13px] font-medium mb-5">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            
            {success && (
              <div className="flex items-center gap-2 text-[#2b5a3f] text-[13px] font-medium mb-5 bg-[#e8f2ec] p-3 rounded-xl">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#2b5a3f] text-white text-[16px] font-semibold rounded-[14px] hover:bg-[#224732] transition-colors disabled:opacity-80 flex justify-center items-center h-[56px]"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                isSignUp ? "Create account" : "Sign in"
              )}
            </button>
          </form>

          <div className="mt-6 text-[14px] text-gray-500">
            {isSignUp ? "Already have an account? " : "Don't have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setSuccess(null);
              }}
              className="font-semibold text-[#2b5a3f] hover:underline"
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-100">
             <Link href="/" className="text-[14px] text-gray-400 hover:text-gray-600 font-medium transition-colors">
               Continue without signing in
             </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
