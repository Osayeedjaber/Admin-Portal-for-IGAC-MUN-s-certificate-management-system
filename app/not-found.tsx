"use client";

import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#000b07] via-[#001c14] to-[#000b07] px-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#ffeccd]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-[#faf4ea]/5 rounded-full blur-3xl"></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(250,244,234,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(250,244,234,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>

      <div className="relative text-center max-w-lg mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#ffeccd]/30 to-[#faf4ea]/20 rounded-3xl blur-xl"></div>
            <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#001c14] to-[#000b07] border border-[#faf4ea]/10 flex items-center justify-center shadow-2xl overflow-hidden">
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

        {/* 404 Text */}
        <div className="mb-6">
          <h1 className="text-8xl font-bold bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] bg-clip-text text-transparent mb-4">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-[#faf4ea] mb-2">Page Not Found</h2>
          <p className="text-[#faf4ea]/60">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold hover:opacity-90 transition shadow-lg shadow-[#ffeccd]/20"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[#faf4ea]/20 text-[#faf4ea] font-medium hover:bg-[#faf4ea]/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Go Back
          </button>
        </div>

        {/* Footer */}
        <p className="mt-12 text-[#faf4ea]/40 text-sm">
          IGAC Certificate Admin Portal
        </p>
      </div>
    </div>
  );
}
