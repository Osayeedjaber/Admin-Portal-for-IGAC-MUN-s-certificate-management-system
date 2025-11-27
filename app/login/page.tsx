"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || "Unable to sign in");
      }

      router.replace("/dashboard");
    } catch (err: any) {
      setError(err.message || "Unable to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#000b07] via-[#001c14] to-[#000b07] px-4 py-12 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ffeccd]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#faf4ea]/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-conic from-[#ffeccd]/5 via-transparent to-[#faf4ea]/5 rounded-full blur-2xl animate-slow-spin"></div>
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,244,234,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(250,244,234,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="w-full max-w-md relative">
        {/* Card Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/10 rounded-3xl blur-xl opacity-50"></div>
        
        <div className="relative rounded-3xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14]/90 to-[#000b07]/80 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="mb-8 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#ffeccd]/30 to-[#faf4ea]/20 rounded-2xl blur-lg opacity-50"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-[#000b07] border border-[#faf4ea]/20 shadow-lg shadow-[#ffeccd]/10 overflow-hidden">
                  <Image
                    src="/logo (2).png"
                    alt="IGAC Logo"
                    width={80}
                    height={80}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#ffeccd] mb-2">
                IGAC Certificate Admin
              </p>
              <h1 className="text-3xl font-bold text-[#faf4ea] bg-clip-text">
                Welcome Back
              </h1>
              <p className="text-sm text-[#faf4ea]/60 mt-2">
                Sign in to manage certificates and events
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#faf4ea]/80 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#faf4ea]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[#faf4ea]/10 bg-[#000b07]/50 px-4 py-3.5 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/20 transition"
                placeholder="admin@igac.info"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#faf4ea]/80 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#faf4ea]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Password
              </label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[#faf4ea]/10 bg-[#000b07]/50 px-4 py-3.5 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/20 transition"
                placeholder="••••••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-3">
                <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] px-4 py-4 font-semibold text-[#000b07] transition hover:from-[#faf4ea] hover:to-[#ffeccd] disabled:cursor-not-allowed disabled:opacity-50 shadow-lg shadow-[#ffeccd]/20 text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#000b07]/30 border-t-[#000b07]"></div>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Access Dashboard
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-[#faf4ea]/5 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-[#faf4ea]/50 text-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Secure admin-only access</span>
            </div>
            <p className="text-[#faf4ea]/60 text-sm">
              Need an account?{" "}
              <a href="/register" className="text-[#ffeccd] hover:text-[#faf4ea] font-medium transition">
                Register here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
