"use client";

import { useEffect, useState } from "react";

interface VerificationLog {
  id: string;
  certificate_id: string;
  participant_name: string;
  verified_at: string;
  ip_address?: string;
  user_agent?: string;
}

export default function LogsPage() {
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs/verifications');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => 
    log.certificate_id.toLowerCase().includes(filter.toLowerCase()) ||
    log.participant_name.toLowerCase().includes(filter.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-[#faf4ea]/60">Loading verification logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#faf4ea] flex items-center gap-3">
          <svg className="w-8 h-8 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          Verification Logs
        </h1>
        <p className="text-[#faf4ea]/60 mt-1">Track certificate verification requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-[#faf4ea]/10 bg-[#001c14] p-4">
          <p className="text-2xl font-bold text-[#faf4ea]">{logs.length}</p>
          <p className="text-sm text-[#faf4ea]/60">Total Verifications</p>
        </div>
        <div className="rounded-xl border border-[#faf4ea]/10 bg-[#001c14] p-4">
          <p className="text-2xl font-bold text-[#faf4ea]">
            {logs.filter(l => {
              const today = new Date().toDateString();
              return new Date(l.verified_at).toDateString() === today;
            }).length}
          </p>
          <p className="text-sm text-[#faf4ea]/60">Today</p>
        </div>
        <div className="rounded-xl border border-[#faf4ea]/10 bg-[#001c14] p-4">
          <p className="text-2xl font-bold text-[#faf4ea]">
            {new Set(logs.map(l => l.certificate_id)).size}
          </p>
          <p className="text-sm text-[#faf4ea]/60">Unique Certificates</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#faf4ea]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search by certificate ID or name..."
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#001c14] border border-[#faf4ea]/10 text-[#faf4ea] placeholder-[#faf4ea]/50 focus:outline-none focus:ring-2 focus:ring-[#ffeccd]"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] overflow-hidden">
        {filteredLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#faf4ea]/10 bg-[#faf4ea]/5">
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#faf4ea]/60 uppercase tracking-wider">Certificate ID</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#faf4ea]/60 uppercase tracking-wider">Participant</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#faf4ea]/60 uppercase tracking-wider">Verified At</th>
                  <th className="text-left py-4 px-6 text-xs font-medium text-[#faf4ea]/60 uppercase tracking-wider">Location</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#faf4ea]/5">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#faf4ea]/5 transition">
                    <td className="py-4 px-6">
                      <code className="text-sm text-[#ffeccd] bg-[#ffeccd]/10 px-2 py-0.5 rounded">{log.certificate_id}</code>
                    </td>
                    <td className="py-4 px-6 text-[#faf4ea]">{log.participant_name}</td>
                    <td className="py-4 px-6 text-[#faf4ea]/60 text-sm">
                      {new Date(log.verified_at).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-[#faf4ea]/50 text-sm">
                      {log.ip_address || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-[#faf4ea]/60">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            <p className="text-lg font-medium">No Verification Logs</p>
            <p className="text-sm mt-1">Logs will appear when certificates are verified</p>
          </div>
        )}
      </div>
    </div>
  );
}
