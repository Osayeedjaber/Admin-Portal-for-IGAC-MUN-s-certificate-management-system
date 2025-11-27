"use client";

import { useState } from "react";

export default function ExportPage() {
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv');
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    event: ''
  });

  const handleExport = async () => {
    setExporting(true);
    
    try {
      const params = new URLSearchParams();
      if (filters.status !== 'all') params.set('status', filters.status);
      if (filters.type !== 'all') params.set('type', filters.type);
      if (filters.event) params.set('event', filters.event);
      params.set('format', exportFormat);

      const res = await fetch(`/api/certificates/export?${params.toString()}`);
      
      if (!res.ok) throw new Error('Export failed');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificates-${new Date().toISOString().split('T')[0]}.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#faf4ea] flex items-center gap-3">
          <svg className="w-8 h-8 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Export Data
        </h1>
        <p className="text-[#faf4ea]/60 mt-1">Download certificate data in various formats</p>
      </div>

      <div className="max-w-2xl">
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-6">Export Options</h2>

          {/* Format Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#faf4ea]/60 mb-3">Export Format</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExportFormat('csv')}
                className={`p-4 rounded-xl border-2 transition ${
                  exportFormat === 'csv'
                    ? 'border-[#ffeccd] bg-[#ffeccd]/10'
                    : 'border-[#faf4ea]/10 bg-[#faf4ea]/5 hover:bg-[#faf4ea]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-8 h-8 ${exportFormat === 'csv' ? 'text-[#ffeccd]' : 'text-[#faf4ea]/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <div className="text-left">
                    <p className={`font-medium ${exportFormat === 'csv' ? 'text-[#faf4ea]' : 'text-[#faf4ea]/80'}`}>CSV</p>
                    <p className="text-xs text-[#faf4ea]/50">Spreadsheet compatible</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setExportFormat('json')}
                className={`p-4 rounded-xl border-2 transition ${
                  exportFormat === 'json'
                    ? 'border-[#ffeccd] bg-[#ffeccd]/10'
                    : 'border-[#faf4ea]/10 bg-[#faf4ea]/5 hover:bg-[#faf4ea]/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <svg className={`w-8 h-8 ${exportFormat === 'json' ? 'text-[#ffeccd]' : 'text-[#faf4ea]/60'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                  <div className="text-left">
                    <p className={`font-medium ${exportFormat === 'json' ? 'text-[#faf4ea]' : 'text-[#faf4ea]/80'}`}>JSON</p>
                    <p className="text-xs text-[#faf4ea]/50">For developers</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="revoked">Revoked Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">Certificate Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]"
              >
                <option value="all">All Types</option>
                <option value="Delegate">Delegate</option>
                <option value="Secretariat">Secretariat</option>
                <option value="Campus Ambassador">Campus Ambassador</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">Event (optional)</label>
              <input
                type="text"
                value={filters.event}
                onChange={(e) => setFilters({ ...filters, event: e.target.value })}
                placeholder="e.g., igacmun-session-3"
                className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] placeholder-[#faf4ea]/50 focus:outline-none focus:ring-2 focus:ring-[#ffeccd]"
              />
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {exporting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Preparing Download...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 p-4 rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-[#ffeccd] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-[#faf4ea]/60">
              <p className="text-[#ffeccd] font-medium mb-1">Export includes:</p>
              <ul className="space-y-0.5">
                <li>• Certificate ID & Verification URL</li>
                <li>• Participant name & certificate type</li>
                <li>• Event details, committee, country, award</li>
                <li>• Status & creation date</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
