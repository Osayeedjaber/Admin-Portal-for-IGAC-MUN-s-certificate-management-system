"use client";

import { useState } from "react";

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

export default function ImportPage() {
  const [jsonInput, setJsonInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => {
        setJsonInput(e.target?.result as string);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleImport = async () => {
    setImporting(true);
    setError(null);
    setResult(null);

    try {
      let data;
      try {
        data = JSON.parse(jsonInput);
      } catch {
        throw new Error("Invalid JSON format");
      }

      if (!Array.isArray(data)) {
        data = [data];
      }

      const res = await fetch('/api/certificates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificates: data })
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || 'Import failed');
      }

      setResult(responseData);
      setJsonInput("");
      setFile(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const sampleJson = `[
  {
    "participant_name": "John Doe",
    "certificate_type": "Delegate",
    "event_name": "igacmun-session-3",
    "committee": "UNGA",
    "country": "India",
    "award": "Best Delegate"
  },
  {
    "participant_name": "Jane Smith",
    "certificate_type": "Secretariat",
    "event_name": "igacmun-session-3",
    "secretariat_role": "Director General"
  }
]`;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#faf4ea] flex items-center gap-3">
          <svg className="w-8 h-8 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Bulk Import
        </h1>
        <p className="text-[#faf4ea]/60 mt-1">Import multiple certificates from JSON</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Import Form */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-4">Import Data</h2>

          {/* File Upload */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">
              Upload JSON File
            </label>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-3 p-6 border-2 border-dashed border-[#faf4ea]/10 rounded-xl hover:border-[#ffeccd]/50 transition">
                <svg className="w-8 h-8 text-[#faf4ea]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                <div>
                  <p className="text-[#faf4ea] font-medium">
                    {file ? file.name : "Drop JSON file or click to browse"}
                  </p>
                  <p className="text-xs text-[#faf4ea]/50">JSON files only</p>
                </div>
              </div>
            </div>
          </div>

          {/* JSON Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">
              Or Paste JSON
            </label>
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder={`Paste JSON array here...\n\n${sampleJson.slice(0, 100)}...`}
              rows={12}
              className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] placeholder-[#faf4ea]/50 focus:outline-none focus:ring-2 focus:ring-[#ffeccd] font-mono text-sm"
            />
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={importing || !jsonInput.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            {importing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Importing...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Import Certificates
              </>
            )}
          </button>

          {/* Result */}
          {result && (
            <div className="mt-6 p-4 rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20">
              <div className="flex items-center gap-2 text-[#ffeccd] font-medium mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Import Complete
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#faf4ea]/60">Success:</span>
                  <span className="text-[#faf4ea] ml-2">{result.success}</span>
                </div>
                <div>
                  <span className="text-[#faf4ea]/60">Failed:</span>
                  <span className="text-red-400 ml-2">{result.failed}</span>
                </div>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-3 text-xs text-red-400">
                  <p className="font-medium mb-1">Errors:</p>
                  {result.errors.slice(0, 3).map((err, i) => (
                    <p key={i}>• {err}</p>
                  ))}
                  {result.errors.length > 3 && (
                    <p>...and {result.errors.length - 3} more</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
          <h2 className="text-lg font-semibold text-[#faf4ea] mb-4">JSON Format</h2>
          
          <div className="mb-6">
            <p className="text-[#faf4ea]/60 text-sm mb-4">
              Each certificate object should include the following fields:
            </p>
            
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-[#faf4ea]/5 border border-[#faf4ea]/5">
                <p className="text-[#faf4ea] font-medium">Required Fields</p>
                <ul className="text-sm text-[#faf4ea]/60 mt-2 space-y-1">
                  <li>• <code className="text-[#ffeccd]">participant_name</code> - Full name</li>
                  <li>• <code className="text-[#ffeccd]">certificate_type</code> - Delegate, Secretariat, or Campus Ambassador</li>
                  <li>• <code className="text-[#ffeccd]">event_name</code> - Event identifier</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-[#faf4ea]/5 border border-[#faf4ea]/5">
                <p className="text-[#faf4ea] font-medium">Delegate Certificates</p>
                <ul className="text-sm text-[#faf4ea]/60 mt-2 space-y-1">
                  <li>• <code className="text-[#ffeccd]">committee</code> - Committee name (e.g., UNGA)</li>
                  <li>• <code className="text-[#ffeccd]">country</code> - Country represented</li>
                  <li>• <code className="text-[#ffeccd]">award</code> - Optional award</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-[#faf4ea]/5 border border-[#faf4ea]/5">
                <p className="text-[#faf4ea] font-medium">Secretariat Certificates</p>
                <ul className="text-sm text-[#faf4ea]/60 mt-2 space-y-1">
                  <li>• <code className="text-[#ffeccd]">secretariat_role</code> - Role/Position</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm font-medium text-[#faf4ea]/60 mb-2">Sample JSON:</p>
            <pre className="p-4 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-xs text-[#faf4ea]/80 overflow-x-auto">
              {sampleJson}
            </pre>
          </div>

          <button
            onClick={() => setJsonInput(sampleJson)}
            className="text-[#ffeccd] text-sm hover:text-[#faf4ea] transition flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Use Sample Data
          </button>
        </div>
      </div>
    </div>
  );
}
