"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SheetDBRow } from "@/types/database";

export default function SheetDataPage() {
  const [rows, setRows] = useState<SheetDBRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, processed: 0, pending: 0 });

  useEffect(() => {
    fetchSheetData();
  }, []);

  const fetchSheetData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sheet');
      if (res.ok) {
        const data = await res.json();
        setRows(data.rows || []);
        setStats({
          total: data.total,
          processed: data.processed,
          pending: data.pending
        });
      }
    } catch (error) {
      console.error('Failed to fetch sheet data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#faf4ea]">Google Sheet Data</h1>
          <p className="text-[#faf4ea]/60">View all data from the connected Google Sheet</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-[#001c14] border border-[#faf4ea]/10 text-[#faf4ea] hover:bg-[#faf4ea]/10 transition"
          >
            ← Back
          </Link>
          <button
            onClick={fetchSheetData}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] hover:opacity-90 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 p-4 text-center">
          <p className="text-2xl font-bold text-[#faf4ea]">{stats.total}</p>
          <p className="text-sm text-[#faf4ea]/60">Total Rows</p>
        </div>
        <div className="rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20 p-4 text-center">
          <p className="text-2xl font-bold text-[#ffeccd]">{stats.processed}</p>
          <p className="text-sm text-[#faf4ea]/60">Processed</p>
        </div>
        <div className="rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20 p-4 text-center">
          <p className="text-2xl font-bold text-[#ffeccd]">{stats.pending}</p>
          <p className="text-sm text-[#faf4ea]/60">Pending</p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#faf4ea]/10 bg-[#faf4ea]/5">
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Status</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Type</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Unique ID</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Name</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Email</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Institution</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Award</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Committee</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Country</th>
                  <th className="text-left py-3 px-3 text-xs font-medium text-[#faf4ea]/60">Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => {
                  const isProcessed = row.Unique_ID && row.Unique_ID.trim() !== '';
                  return (
                    <tr key={idx} className={`border-b border-[#faf4ea]/5 ${isProcessed ? '' : 'bg-[#ffeccd]/5'}`}>
                      <td className="py-2 px-3">
                        {isProcessed ? (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#ffeccd]/20 text-[#ffeccd]">Done</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-xs bg-[#ffeccd]/20 text-[#ffeccd]">Pending</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[#faf4ea]/80">{row.Cert_Type}</td>
                      <td className="py-2 px-3">
                        {row.Unique_ID ? (
                          <code className="text-[#ffeccd]">{row.Unique_ID}</code>
                        ) : (
                          <span className="text-[#faf4ea]/50">-</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-[#faf4ea]">{row.Participant_Name}</td>
                      <td className="py-2 px-3 text-[#faf4ea]/60">{row.Email}</td>
                      <td className="py-2 px-3 text-[#faf4ea]/80">{row.Institution}</td>
                      <td className="py-2 px-3 text-[#faf4ea]/80">{row.Award_Type}</td>
                      <td className="py-2 px-3 text-[#faf4ea]/60">{row.Committee || '-'}</td>
                      <td className="py-2 px-3 text-[#faf4ea]/60">{row.Country || '-'}</td>
                      <td className="py-2 px-3 text-[#faf4ea]/60">{row.Date_Issued || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-[#faf4ea]/60">
            No data in sheet
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center gap-6 text-sm text-[#faf4ea]/60">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#ffeccd]/20 text-[#ffeccd]">Done</span>
          <span>Already synced to database</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full text-xs bg-[#ffeccd]/20 text-[#ffeccd]">Pending</span>
          <span>Needs to be synced</span>
        </div>
      </div>
    </div>
  );
}
