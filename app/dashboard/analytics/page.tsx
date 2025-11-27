"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalCertificates: number;
  activeCertificates: number;
  revokedCertificates: number;
  totalVerifications: number;
  totalEvents: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

interface TypeBreakdown {
  [key: string]: number;
}

export default function AnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [typeBreakdown, setTypeBreakdown] = useState<TypeBreakdown>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setTypeBreakdown(data.typeBreakdown || {});
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 border-[#ffeccd]/20 border-t-[#ffeccd] rounded-full animate-spin"></div>
          <p className="text-[#faf4ea]/60">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalCerts = stats?.totalCertificates || 0;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/10 flex items-center justify-center shadow-lg shadow-[#ffeccd]/10 border border-[#ffeccd]/20">
            <svg className="w-7 h-7 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#faf4ea]">Analytics</h1>
            <p className="text-[#faf4ea]/60 mt-1">Detailed statistics and insights about your certificates</p>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#ffeccd]/20 to-[#ffeccd]/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#ffeccd]/20 flex items-center justify-center border border-[#ffeccd]/20">
              <svg className="w-6 h-6 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#faf4ea]/60">Total Certificates</p>
              <p className="text-3xl font-bold text-[#faf4ea]">{stats?.totalCertificates || 0}</p>
            </div>
          </div>
          <div className="text-xs text-[#faf4ea]/50">All time issued certificates</div>
        </div>

        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#faf4ea]/60">Active</p>
              <p className="text-3xl font-bold text-[#faf4ea]">{stats?.activeCertificates || 0}</p>
            </div>
          </div>
          <div className="text-xs text-emerald-400">
            {totalCerts > 0 ? `${Math.round((stats?.activeCertificates || 0) / totalCerts * 100)}%` : '0%'} of total
          </div>
        </div>

        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-red-500/20 to-red-500/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-500/30">
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#faf4ea]/60">Revoked</p>
              <p className="text-3xl font-bold text-[#faf4ea]">{stats?.revokedCertificates || 0}</p>
            </div>
          </div>
          <div className="text-xs text-red-400">
            {totalCerts > 0 ? `${Math.round((stats?.revokedCertificates || 0) / totalCerts * 100)}%` : '0%'} of total
          </div>
        </div>

        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/5 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#ffeccd]/20 flex items-center justify-center border border-[#ffeccd]/20">
              <svg className="w-6 h-6 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-[#faf4ea]/60">Verifications</p>
              <p className="text-3xl font-bold text-[#faf4ea]">{stats?.totalVerifications || 0}</p>
            </div>
          </div>
          <div className="text-xs text-[#ffeccd]">Total verification requests</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Certificate Type Distribution */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
            </svg>
            Certificate Distribution
          </h2>

          {Object.keys(typeBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(typeBreakdown).map(([type, count], index) => {
                const percentage = totalCerts > 0 ? Math.round((count / totalCerts) * 100) : 0;
                return (
                  <div key={type} className="group">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-[#faf4ea] font-medium">{type}</span>
                      <span className="text-[#faf4ea]/60 group-hover:text-[#faf4ea] transition">
                        {count} <span className="text-xs">({percentage}%)</span>
                      </span>
                    </div>
                    <div className="h-3 bg-[#000b07] rounded-full overflow-hidden border border-[#faf4ea]/10">
                      <div
                        className="h-full bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] rounded-full transition-all duration-700"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-[#faf4ea]/50">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
              </svg>
              <p>No certificate data available yet</p>
            </div>
          )}
        </div>

        {/* Status Overview */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Status Overview
          </h2>

          <div className="space-y-6">
            {/* Visual Representation */}
            <div className="relative h-48 flex items-end justify-center gap-6">
              {/* Active Bar */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-emerald-400 font-medium">
                  {stats?.activeCertificates || 0}
                </div>
                <div
                  className="w-16 bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${totalCerts > 0 ? ((stats?.activeCertificates || 0) / totalCerts) * 150 : 20}px`,
                    minHeight: '20px'
                  }}
                ></div>
                <div className="text-xs text-[#faf4ea]/60">Active</div>
              </div>

              {/* Revoked Bar */}
              <div className="flex flex-col items-center gap-2">
                <div className="text-xs text-red-400 font-medium">
                  {stats?.revokedCertificates || 0}
                </div>
                <div
                  className="w-16 bg-gradient-to-t from-red-600 to-red-400 rounded-t-lg transition-all duration-700"
                  style={{
                    height: `${totalCerts > 0 ? ((stats?.revokedCertificates || 0) / totalCerts) * 150 : 20}px`,
                    minHeight: '20px'
                  }}
                ></div>
                <div className="text-xs text-[#faf4ea]/60">Revoked</div>
              </div>
            </div>

            {/* Percentage Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-2xl font-bold text-emerald-400">
                  {totalCerts > 0 ? Math.round((stats?.activeCertificates || 0) / totalCerts * 100) : 0}%
                </p>
                <p className="text-xs text-[#faf4ea]/60 mt-1">Active Rate</p>
              </div>
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-2xl font-bold text-red-400">
                  {totalCerts > 0 ? Math.round((stats?.revokedCertificates || 0) / totalCerts * 100) : 0}%
                </p>
                <p className="text-xs text-[#faf4ea]/60 mt-1">Revoked Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events & Verification Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Events
          </h2>
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-[#faf4ea]">{stats?.totalEvents || 0}</p>
            <p className="text-[#faf4ea]/60 mt-2">Total Events</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" />
            </svg>
            Avg per Event
          </h2>
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-[#faf4ea]">
              {(stats?.totalEvents && stats.totalEvents > 0) 
                ? Math.round(totalCerts / stats.totalEvents) 
                : 0}
            </p>
            <p className="text-[#faf4ea]/60 mt-2">Certificates per Event</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            </svg>
            Verification Rate
          </h2>
          <div className="text-center py-6">
            <p className="text-5xl font-bold text-[#faf4ea]">
              {totalCerts > 0 
                ? ((stats?.totalVerifications || 0) / totalCerts).toFixed(1) 
                : '0.0'}
            </p>
            <p className="text-[#faf4ea]/60 mt-2">Verifications per Certificate</p>
          </div>
        </div>
      </div>
    </div>
  );
}
