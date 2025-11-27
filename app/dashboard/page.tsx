"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

interface Stats {
  totalCertificates: number;
  activeCertificates: number;
  revokedCertificates: number;
  totalVerifications: number;
  totalEvents: number;
}

interface SheetStats {
  total: number;
  processed: number;
  pending: number;
}

interface TypeBreakdown {
  [key: string]: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sheetStats, setSheetStats] = useState<SheetStats | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown>({});
  const [recentCerts, setRecentCerts] = useState<any[]>([]);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Lazy load - only when user clicks
  const fetchStats = useCallback(async () => {
    if (loadingStats) return;
    setLoadingStats(true);
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setTypeBreakdown(data.typeBreakdown || {});
        setRecentCerts(data.recentCertificates || []);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [loadingStats]);

  const fetchSheetStats = useCallback(async () => {
    if (loadingSheet) return;
    setLoadingSheet(true);
    try {
      const res = await fetch('/api/sheet');
      if (res.ok) {
        const data = await res.json();
        setSheetStats({
          total: data.total,
          processed: data.processed,
          pending: data.pending
        });
      }
    } catch (error) {
      console.error('Failed to fetch sheet:', error);
    } finally {
      setLoadingSheet(false);
    }
  }, [loadingSheet]);

  const handleSyncFromSheet = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch('/api/sync/from-sheet', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setSyncMessage({ type: 'success', text: data.message });
        // Refresh both after sync
        fetchStats();
        fetchSheetStats();
      } else {
        setSyncMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setSyncMessage({ type: 'error', text: error.message });
    } finally {
      setSyncing(false);
    }
  };

  const handleSyncToSheet = async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const res = await fetch('/api/sync/to-sheet', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setSyncMessage({ type: 'success', text: data.message });
        fetchSheetStats();
      } else {
        setSyncMessage({ type: 'error', text: data.error });
      }
    } catch (error: any) {
      setSyncMessage({ type: 'error', text: error.message });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Premium Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffeccd] to-[#faf4ea] flex items-center justify-center shadow-lg shadow-[#ffeccd]/20">
              <svg className="w-7 h-7 text-[#000b07]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-[#faf4ea] to-[#ffeccd] bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-[#faf4ea]/60 mt-0.5">IGACMUN Certificate Management System</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10">
              <div className="w-2 h-2 rounded-full bg-[#ffeccd] animate-pulse"></div>
              <span className="text-sm text-[#faf4ea]/80">System Online</span>
            </div>
            <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffeccd]/20 to-[#faf4ea]/20 border border-[#ffeccd]/30 text-[#ffeccd] text-sm font-medium">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      {/* Sync Message */}
      {syncMessage && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-fade-in ${
          syncMessage.type === 'success' 
            ? 'bg-[#ffeccd]/10 border-[#ffeccd]/30 text-[#ffeccd]' 
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          {syncMessage.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span>{syncMessage.text}</span>
          <button 
            onClick={() => setSyncMessage(null)}
            className="ml-auto text-current opacity-60 hover:opacity-100"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Stats Grid - with load button */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#faf4ea] flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
            Database Statistics
          </h2>
          <button
            onClick={fetchStats}
            disabled={loadingStats}
            className="px-4 py-2 text-sm rounded-xl bg-gradient-to-r from-[#ffeccd]/20 to-[#faf4ea]/20 border border-[#ffeccd]/30 text-[#ffeccd] hover:from-[#ffeccd]/30 hover:to-[#faf4ea]/30 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loadingStats ? (
              <>
                <div className="w-4 h-4 border-2 border-[#ffeccd]/30 border-t-[#ffeccd] rounded-full animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {stats ? 'Refresh' : 'Load Stats'}
              </>
            )}
          </button>
        </div>
        
        {stats ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Certificates"
              value={stats.totalCertificates}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
              color="cream"
            />
            <StatCard
              title="Active"
              value={stats.activeCertificates}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
              color="cream"
            />
            <StatCard
              title="Revoked"
              value={stats.revokedCertificates}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              }
              color="red"
            />
            <StatCard
              title="Verifications"
              value={stats.totalVerifications}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              color="cream"
            />
            <StatCard
              title="Events"
              value={stats.totalEvents}
              icon={
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              }
              color="cream"
            />
          </div>
        ) : (
          <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14]/80 to-[#000b07]/50 p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/20 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#faf4ea] mb-2">Load Statistics</h3>
            <p className="text-[#faf4ea]/60 text-sm">Click the button above to fetch your database statistics</p>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Sheet Sync Card - Premium */}
        <div className="lg:col-span-2 rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14]/90 to-[#000b07]/50 overflow-hidden">
          <div className="p-6 border-b border-[#faf4ea]/5 bg-gradient-to-r from-[#ffeccd]/10 to-[#faf4ea]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffeccd] to-[#faf4ea] flex items-center justify-center shadow-lg shadow-[#ffeccd]/20">
                  <svg className="w-6 h-6 text-[#000b07]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-[#faf4ea]">Google Sheet Sync</h2>
                  <p className="text-sm text-[#faf4ea]/60">Import certificates from your spreadsheet</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchSheetStats}
                  disabled={loadingSheet}
                  className="px-4 py-2 text-sm rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 text-[#faf4ea]/80 hover:bg-[#faf4ea]/10 hover:text-[#faf4ea] transition disabled:opacity-50 flex items-center gap-2"
                >
                  {loadingSheet ? (
                    <div className="w-4 h-4 border-2 border-[#faf4ea]/20 border-t-[#faf4ea] rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  )}
                  {sheetStats ? 'Refresh' : 'Load'}
                </button>
                <a
                  href="https://docs.google.com/spreadsheets/d/18R7z8-JehtdrCgc7VYlRTgoGosvlch6YFL1bAUQbRHQ/edit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-[#faf4ea]/5 border border-[#faf4ea]/10 text-[#faf4ea]/60 hover:text-[#faf4ea] hover:bg-[#faf4ea]/10 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          <div className="p-6">
            {sheetStats ? (
              <>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-5 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5 hover:bg-[#faf4ea]/10 transition">
                    <p className="text-4xl font-bold text-[#faf4ea]">{sheetStats.total}</p>
                    <p className="text-sm text-[#faf4ea]/60 mt-1">Total Rows</p>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-gradient-to-br from-[#ffeccd]/20 to-[#ffeccd]/5 border border-[#ffeccd]/20">
                    <p className="text-4xl font-bold text-[#ffeccd]">{sheetStats.processed}</p>
                    <p className="text-sm text-[#faf4ea]/60 mt-1">Processed</p>
                  </div>
                  <div className="text-center p-5 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/20">
                    <p className="text-4xl font-bold text-amber-400">{sheetStats.pending}</p>
                    <p className="text-sm text-[#faf4ea]/60 mt-1">Pending</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleSyncFromSheet}
                    disabled={syncing || sheetStats.pending === 0}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-[#faf4ea] hover:to-[#ffeccd] transition shadow-lg shadow-[#ffeccd]/20"
                  >
                    {syncing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-[#000b07]/30 border-t-[#000b07] rounded-full animate-spin"></div>
                        Syncing...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import {sheetStats.pending} New {sheetStats.pending === 1 ? 'Entry' : 'Entries'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleSyncToSheet}
                    disabled={syncing}
                    className="px-6 py-4 rounded-xl bg-[#001c14] border border-[#faf4ea]/10 text-[#faf4ea] hover:bg-[#faf4ea]/10 transition disabled:opacity-50 flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/20 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-[#faf4ea] mb-2">Connect Sheet</h3>
                <p className="text-[#faf4ea]/60 text-sm">Click "Load" to fetch your Google Sheet data</p>
              </div>
            )}
          </div>
        </div>

        {/* Certificate Types */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14]/50 p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
            By Type
          </h2>
          
          {Object.keys(typeBreakdown).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(typeBreakdown).map(([type, count]) => {
                const total = stats?.totalCertificates || 1;
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={type}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-[#faf4ea]/80">{type}</span>
                      <span className="text-[#faf4ea]/60">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-[#000b07] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-[#faf4ea]/60 text-center py-8">No data yet</p>
          )}
        </div>
      </div>

      {/* Quick Actions + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Premium */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14]/90 to-[#000b07]/50 overflow-hidden">
          <div className="p-5 border-b border-[#faf4ea]/5 bg-gradient-to-r from-[#ffeccd]/10 to-[#faf4ea]/10">
            <h2 className="text-lg font-semibold text-[#faf4ea] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
              Quick Actions
            </h2>
          </div>
          
          <div className="p-4 space-y-2">
            <Link href="/dashboard/create" className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#ffeccd]/10 to-[#ffeccd]/5 border border-[#ffeccd]/20 hover:from-[#ffeccd]/20 hover:to-[#ffeccd]/10 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffeccd] to-[#faf4ea] flex items-center justify-center shadow-lg shadow-[#ffeccd]/20 group-hover:scale-110 transition">
                <svg className="w-5 h-5 text-[#000b07]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div>
                <p className="text-[#faf4ea] font-semibold">New Certificate</p>
                <p className="text-xs text-[#faf4ea]/60">Create manually</p>
              </div>
              <svg className="w-5 h-5 text-[#ffeccd] ml-auto opacity-0 group-hover:opacity-100 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
            
            <Link href="/dashboard/certificates" className="flex items-center gap-3 p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5 hover:bg-[#faf4ea]/10 hover:border-[#faf4ea]/10 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/20 flex items-center justify-center group-hover:from-[#ffeccd]/30 group-hover:to-[#faf4ea]/30 transition">
                <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[#faf4ea] font-medium">View All</p>
                <p className="text-xs text-[#faf4ea]/60">Manage certificates</p>
              </div>
            </Link>
            
            <Link href="/dashboard/events" className="flex items-center gap-3 p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5 hover:bg-[#faf4ea]/10 hover:border-[#faf4ea]/10 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/20 flex items-center justify-center group-hover:from-[#ffeccd]/30 group-hover:to-[#faf4ea]/30 transition">
                <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <div>
                <p className="text-[#faf4ea] font-medium">Events</p>
                <p className="text-xs text-[#faf4ea]/60">Manage events</p>
              </div>
            </Link>
            
            <Link href="/dashboard/settings" className="flex items-center gap-3 p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5 hover:bg-[#faf4ea]/10 hover:border-[#faf4ea]/10 transition group">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#faf4ea]/20 to-[#faf4ea]/10 flex items-center justify-center group-hover:from-[#faf4ea]/30 group-hover:to-[#faf4ea]/20 transition">
                <svg className="w-5 h-5 text-[#faf4ea]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-[#faf4ea] font-medium">Settings</p>
                <p className="text-xs text-[#faf4ea]/60">Configure system</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Certificates - Premium */}
        <div className="lg:col-span-2 rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14]/90 to-[#000b07]/50 overflow-hidden">
          <div className="p-5 border-b border-[#faf4ea]/5 bg-gradient-to-r from-[#ffeccd]/10 to-[#faf4ea]/10 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#faf4ea] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Recent Certificates
            </h2>
            <Link href="/dashboard/certificates" className="px-4 py-2 text-sm rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 text-[#ffeccd] hover:bg-[#faf4ea]/10 hover:text-[#faf4ea] transition flex items-center gap-1.5 group">
              View all
              <svg className="w-4 h-4 group-hover:translate-x-0.5 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          {recentCerts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-[#faf4ea]/50 uppercase tracking-wider bg-[#faf4ea]/2">
                    <th className="px-5 py-4 font-semibold">ID</th>
                    <th className="px-5 py-4 font-semibold">Name</th>
                    <th className="px-5 py-4 font-semibold">Type</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#faf4ea]/5">
                  {recentCerts.slice(0, 5).map((cert: any, index: number) => (
                    <tr key={cert.certificate_id} className="group hover:bg-[#faf4ea]/5 transition">
                      <td className="px-5 py-4">
                        <code className="text-sm text-[#ffeccd] bg-gradient-to-r from-[#ffeccd]/10 to-[#ffeccd]/5 px-3 py-1 rounded-lg border border-[#ffeccd]/20 font-mono">{cert.certificate_id}</code>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#ffeccd]/30 to-[#faf4ea]/30 flex items-center justify-center text-[#faf4ea] font-medium text-sm">
                            {cert.participant_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span className="text-[#faf4ea] font-medium">{cert.participant_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-3 py-1 rounded-lg bg-[#ffeccd]/10 text-[#ffeccd] text-sm border border-[#ffeccd]/20">{cert.certificate_type}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                          cert.status === 'active' 
                            ? 'bg-gradient-to-r from-[#ffeccd]/20 to-[#ffeccd]/10 text-[#ffeccd] border border-[#ffeccd]/30' 
                            : 'bg-gradient-to-r from-red-500/20 to-red-500/10 text-red-300 border border-red-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cert.status === 'active' ? 'bg-[#ffeccd]' : 'bg-red-400'}`}></span>
                          {cert.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-[#faf4ea]/60 text-sm">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-[#faf4ea]/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {new Date(cert.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 px-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/20 flex items-center justify-center">
                <svg className="w-10 h-10 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-[#faf4ea] mb-2">No certificates yet</h3>
              <p className="text-[#faf4ea]/60 mb-4">Start by creating your first certificate</p>
              <Link href="/dashboard/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-medium hover:from-[#faf4ea] hover:to-[#ffeccd] transition shadow-lg shadow-[#ffeccd]/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Create your first certificate
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  color: 'cream' | 'red'
}) {
  const colorClasses = {
    cream: 'from-[#ffeccd]/20 to-[#faf4ea]/5 border-[#ffeccd]/30 text-[#ffeccd] shadow-[#ffeccd]/10',
    red: 'from-red-500/20 to-red-500/5 border-red-500/30 text-red-400 shadow-red-500/10'
  };

  return (
    <div className={`rounded-2xl border bg-gradient-to-br ${colorClasses[color]} p-5 shadow-lg hover:scale-[1.02] transition-transform cursor-default`}>
      <div className="flex items-center justify-between mb-3">
        <span className={colorClasses[color].split(' ').pop()}>{icon}</span>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorClasses[color].replace('border-', 'from-').replace('/30', '/30 to-transparent')} opacity-50`}></div>
      </div>
      <p className="text-3xl font-bold text-[#faf4ea]">{value.toLocaleString()}</p>
      <p className="text-sm text-[#faf4ea]/60 mt-1">{title}</p>
    </div>
  );
}
