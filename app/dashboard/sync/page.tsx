"use client";

import { useEffect, useState } from "react";

interface SheetStats {
  total: number;
  processed: number;
  pending: number;
}

interface SyncError {
  row: number;
  participant_name: string;
  error: string;
}

interface SyncLog {
  type: 'import' | 'export';
  timestamp: Date;
  count: number;
  status: 'success' | 'error';
  message: string;
  errors?: SyncError[];
}

export default function SyncPage() {
  const [sheetStats, setSheetStats] = useState<SheetStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<'import' | 'export' | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string; errors?: SyncError[] } | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);

  useEffect(() => {
    fetchSheetStats();
  }, []);

  const fetchSheetStats = async () => {
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
      console.error('Failed to fetch sheet stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSyncFromSheet = async () => {
    setSyncing('import');
    setMessage(null);

    try {
      const res = await fetch('/api/sync/from-sheet', { method: 'POST' });
      const data = await res.json();

      // Build error message string
      let errorDetails = '';
      if (data.errors && data.errors.length > 0) {
        errorDetails = data.errors.map((e: any) => 
          `Row ${e.row} (${e.participant_name}): ${e.error}`
        ).join('\n');
      }

      if (res.ok) {
        const hasErrors = data.errors && data.errors.length > 0;
        // Always show errors if there are any, regardless of success count
        if (hasErrors) {
          setMessage({ 
            type: 'error', 
            text: `${data.message}\n\nError Details:\n${errorDetails}`,
            errors: data.errors 
          });
        } else {
          setMessage({ 
            type: 'success', 
            text: data.message 
          });
        }
        setSyncLogs([
          {
            type: 'import',
            timestamp: new Date(),
            count: data.processed || 0,
            status: hasErrors ? 'error' : 'success',
            message: data.message,
            errors: data.errors
          },
          ...syncLogs.slice(0, 9)
        ]);
        fetchSheetStats();
      } else {
        setMessage({ type: 'error', text: data.error });
        setSyncLogs([
          {
            type: 'import',
            timestamp: new Date(),
            count: 0,
            status: 'error',
            message: data.error
          },
          ...syncLogs.slice(0, 9)
        ]);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSyncing(null);
    }
  };

  const handleSyncToSheet = async () => {
    setSyncing('export');
    setMessage(null);

    try {
      const res = await fetch('/api/sync/to-sheet', { method: 'POST' });
      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setSyncLogs([
          {
            type: 'export',
            timestamp: new Date(),
            count: data.updated || 0,
            status: 'success',
            message: data.message
          },
          ...syncLogs.slice(0, 9)
        ]);
        fetchSheetStats();
      } else {
        setMessage({ type: 'error', text: data.error });
        setSyncLogs([
          {
            type: 'export',
            timestamp: new Date(),
            count: 0,
            status: 'error',
            message: data.error
          },
          ...syncLogs.slice(0, 9)
        ]);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSyncing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner"></div>
          <p className="text-[#faf4ea]/60">Loading sync center...</p>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Sync Center
        </h1>
        <p className="text-[#faf4ea]/60 mt-1">Synchronize data between Google Sheets and database</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl border ${
          message.type === 'success'
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
            : 'bg-red-500/10 border-red-500/30 text-red-300'
        }`}>
          <div className="flex items-center gap-3">
            {message.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className="whitespace-pre-wrap">{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto opacity-60 hover:opacity-100">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Show detailed errors */}
          {message.errors && message.errors.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-medium text-red-400">Error Details:</p>
              {message.errors.map((err, idx) => (
                <div key={idx} className="text-sm bg-red-500/10 rounded-lg p-3 border border-red-500/20">
                  <p className="font-medium">Row {err.row}: {err.participant_name}</p>
                  <p className="text-red-400/80 mt-1">{err.error}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Sheet Status */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-[#faf4ea] flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375" />
              </svg>
              Google Sheet Status
            </h2>
            <a
              href="https://docs.google.com/spreadsheets/d/18R7z8-JehtdrCgc7VYlRTgoGosvlch6YFL1bAUQbRHQ/edit#gid=0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#faf4ea]/60 hover:text-[#faf4ea] transition"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          </div>

          {sheetStats ? (
            <>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5">
                  <p className="text-3xl font-bold text-[#faf4ea]">{sheetStats.total}</p>
                  <p className="text-sm text-[#faf4ea]/60 mt-1">Total Rows</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20">
                  <p className="text-3xl font-bold text-[#ffeccd]">{sheetStats.processed}</p>
                  <p className="text-sm text-[#faf4ea]/60 mt-1">Processed</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20">
                  <p className="text-3xl font-bold text-[#ffeccd]">{sheetStats.pending}</p>
                  <p className="text-sm text-[#faf4ea]/60 mt-1">Pending</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-[#faf4ea]/60">Processing Progress</span>
                  <span className="text-[#faf4ea]">{sheetStats.total > 0 ? Math.round((sheetStats.processed / sheetStats.total) * 100) : 0}%</span>
                </div>
                <div className="h-3 bg-[#000b07] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] rounded-full transition-all duration-500"
                    style={{ width: `${sheetStats.total > 0 ? (sheetStats.processed / sheetStats.total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={fetchSheetStats}
                className="text-sm text-[#faf4ea]/60 hover:text-[#faf4ea] transition flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh Status
              </button>
            </>
          ) : (
            <div className="text-center py-8 text-[#faf4ea]/60">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p>Unable to connect to Google Sheet</p>
            </div>
          )}
        </div>

        {/* Sync Actions */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
            </svg>
            Sync Actions
          </h2>

          <div className="space-y-4">
            {/* Import from Sheet */}
            <div className="p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffeccd]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[#faf4ea] font-medium mb-1">Import from Sheet</h3>
                  <p className="text-sm text-[#faf4ea]/60 mb-3">
                    Process pending entries from Google Sheets, generate certificate IDs, and save to database.
                  </p>
                  <button
                    onClick={handleSyncFromSheet}
                    disabled={syncing !== null || (sheetStats?.pending || 0) === 0}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center gap-2"
                  >
                    {syncing === 'import' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        Import {sheetStats?.pending || 0} Entries
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Export to Sheet */}
            <div className="p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ffeccd]/20 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-[#faf4ea] font-medium mb-1">Update Sheet</h3>
                  <p className="text-sm text-[#faf4ea]/60 mb-3">
                    Push generated certificate IDs and verification URLs back to the Google Sheet.
                  </p>
                  <button
                    onClick={handleSyncToSheet}
                    disabled={syncing !== null}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center gap-2"
                  >
                    {syncing === 'export' ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Update Sheet
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sync Log */}
      <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
        <h2 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Recent Sync Activity
        </h2>

        {syncLogs.length > 0 ? (
          <div className="space-y-3">
            {syncLogs.map((log, index) => (
              <div
                key={index}
                className={`p-3 rounded-xl border ${
                  log.status === 'success'
                    ? 'bg-[#ffeccd]/5 border-[#ffeccd]/20'
                    : 'bg-red-500/5 border-red-500/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      log.type === 'import' ? 'bg-[#ffeccd]/20' : 'bg-[#ffeccd]/20'
                    }`}>
                      <svg className={`w-4 h-4 text-[#ffeccd]`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={log.type === 'import' ? 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' : 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[#faf4ea] text-sm font-medium">
                        {log.type === 'import' ? 'Imported' : 'Updated'} {log.count} entries
                      </p>
                      <p className="text-xs text-[#faf4ea]/50">
                        {log.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    log.status === 'success' ? 'bg-[#ffeccd]/20 text-[#ffeccd]' : 'bg-red-500/20 text-red-300'
                  }`}>
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-[#faf4ea]/60">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No sync activity yet</p>
            <p className="text-xs mt-1">Activity will appear here when you sync</p>
          </div>
        )}
      </div>
    </div>
  );
}
