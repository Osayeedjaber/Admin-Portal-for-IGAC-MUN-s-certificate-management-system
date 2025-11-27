"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // Fetch pending count for sidebar badge
    fetch('/api/sheet')
      .then(res => res.json())
      .then(data => {
        if (data.pending) {
          setPendingCount(data.pending);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar pendingCount={pendingCount} onLogout={handleLogout} />
      <main className="pl-64 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
