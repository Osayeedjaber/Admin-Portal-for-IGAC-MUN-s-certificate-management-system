"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Certificate {
  id: string;
  certificate_id: string;
  participant_name: string;
  school: string;
  certificate_type: string;
  date_issued: string;
  status: 'active' | 'revoked';
  created_at: string;
  events?: { event_name: string; event_code: string } | null;
  certificate_metadata?: { field_name: string; field_value: string }[];
}

interface EditFormData {
  participant_name: string;
  school: string;
  certificate_type: string;
  cert_category: string;
  date_issued: string;
  committee?: string;
  country?: string;
  position?: string; // For EB: Chairperson, Vice Chair, Rapporteur, etc.
  department?: string;
  designation?: string;
}

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Edit Modal State
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [editForm, setEditForm] = useState<EditFormData>({
    participant_name: '',
    school: '',
    certificate_type: '',
    cert_category: '',
    date_issued: '',
  });
  const [saving, setSaving] = useState(false);
  const [editMessage, setEditMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchCertificates();
  }, [page, search, statusFilter, typeFilter]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter })
      });

      const res = await fetch(`/api/certificates?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id: string, certId: string) => {
    if (!confirm(`Are you sure you want to revoke certificate ${certId}?`)) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', reason: 'Revoked by admin' })
      });
      
      if (res.ok) {
        fetchCertificates();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleRestore = async (id: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/certificates/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' })
      });
      
      if (res.ok) {
        fetchCertificates();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, certId: string) => {
    if (!confirm(`Are you sure you want to permanently delete certificate ${certId}? This cannot be undone.`)) return;
    
    setActionLoading(id);
    try {
      const res = await fetch(`/api/certificates/${id}`, { method: 'DELETE' });
      
      if (res.ok) {
        fetchCertificates();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const getMetadataValue = (cert: Certificate, fieldName: string): string => {
    const meta = cert.certificate_metadata?.find(m => m.field_name === fieldName);
    return meta?.field_value || '';
  };

  const openEditModal = (cert: Certificate) => {
    setEditingCert(cert);
    const certCategory = getMetadataValue(cert, 'cert_type') || 'delegate';
    setEditForm({
      participant_name: cert.participant_name,
      school: cert.school,
      certificate_type: cert.certificate_type,
      cert_category: certCategory,
      date_issued: cert.date_issued,
      committee: getMetadataValue(cert, 'committee'),
      country: getMetadataValue(cert, 'country'),
      position: getMetadataValue(cert, 'position'),
      department: getMetadataValue(cert, 'department'),
      designation: getMetadataValue(cert, 'designation'),
    });
    setEditMessage(null);
  };

  const closeEditModal = () => {
    setEditingCert(null);
    setEditForm({
      participant_name: '',
      school: '',
      certificate_type: '',
      cert_category: 'delegate',
      date_issued: '',
    });
    setEditMessage(null);
  };

  const handleSaveEdit = async () => {
    if (!editingCert) return;
    
    setSaving(true);
    setEditMessage(null);
    
    try {
      const res = await fetch(`/api/certificates/${editingCert.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participant_name: editForm.participant_name,
          school: editForm.school,
          certificate_type: editForm.certificate_type,
          date_issued: editForm.date_issued,
          metadata: {
            cert_type: editForm.cert_category,
            committee: editForm.committee,
            country: editForm.country,
            position: editForm.position,
            department: editForm.department,
            designation: editForm.designation,
          }
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setEditMessage({ type: 'success', text: 'Certificate updated successfully!' });
        fetchCertificates();
        setTimeout(() => closeEditModal(), 1500);
      } else {
        setEditMessage({ type: 'error', text: data.error || 'Failed to update certificate' });
      }
    } catch (error: any) {
      setEditMessage({ type: 'error', text: error.message || 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header - Premium */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffeccd] to-[#faf4ea] flex items-center justify-center shadow-lg shadow-[#ffeccd]/25">
            <svg className="w-7 h-7 text-[#000b07]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v16.5c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9zm3.75 11.625a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#faf4ea]">All Certificates</h1>
            <p className="text-[#faf4ea]/60">Manage and view all issued certificates</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 text-[#faf4ea]/80 hover:bg-[#faf4ea]/10 hover:text-[#faf4ea] transition flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </Link>
          <Link
            href="/dashboard/create"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-medium hover:opacity-90 transition shadow-lg shadow-[#ffeccd]/25 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Certificate
          </Link>
        </div>
      </div>

      {/* Filters - Premium */}
      <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[250px] relative">
            <svg className="w-5 h-5 text-[#faf4ea]/50 absolute left-4 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name, ID, or institution..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] placeholder-[#faf4ea]/50 focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none min-w-[140px]"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="revoked">Revoked</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none min-w-[160px]"
          >
            <option value="">All Types</option>
            <option value="Delegate">Delegate</option>
            <option value="Secretariat">Secretariat</option>
            <option value="Campus Ambassador">Campus Ambassador</option>
          </select>
        </div>
      </div>

      {/* Table - Premium */}
      <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#ffeccd]/30 border-t-[#ffeccd] rounded-full animate-spin"></div>
              <p className="text-[#faf4ea]/60">Loading certificates...</p>
            </div>
          </div>
        ) : certificates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#faf4ea]/10 bg-gradient-to-r from-[#ffeccd]/5 to-[#faf4ea]/5">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Cert ID</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Participant</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Institution</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Category</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Certificate Name</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-[#faf4ea]/60 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#faf4ea]/5">
                {certificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-[#faf4ea]/5 transition group">
                    <td className="py-4 px-5">
                      <code className="text-sm text-[#ffeccd] bg-[#ffeccd]/10 px-3 py-1 rounded-lg border border-[#ffeccd]/20 font-mono">{cert.certificate_id}</code>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/20 flex items-center justify-center text-[#faf4ea] font-medium text-sm">
                          {cert.participant_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-[#faf4ea] font-medium">{cert.participant_name}</p>
                          <p className="text-xs text-[#faf4ea]/50">{getMetadataValue(cert, 'email') || '-'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-5 text-[#faf4ea]/80">{cert.school}</td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 rounded-lg bg-[#faf4ea]/10 text-[#faf4ea]/80 text-sm border border-[#faf4ea]/20 capitalize">{getMetadataValue(cert, 'cert_type') || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className="px-3 py-1 rounded-lg bg-[#ffeccd]/10 text-[#ffeccd] text-sm border border-[#ffeccd]/20">{cert.certificate_type}</span>
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        cert.status === 'active' 
                          ? 'bg-[#ffeccd]/20 text-[#ffeccd] border border-[#ffeccd]/30' 
                          : 'bg-red-500/20 text-red-300 border border-red-500/30'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cert.status === 'active' ? 'bg-[#ffeccd]' : 'bg-red-400'}`}></span>
                        {cert.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#faf4ea]/60 text-sm">{cert.date_issued}</td>
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(cert)}
                          className="p-2 rounded-lg bg-[#ffeccd]/10 text-[#ffeccd] hover:bg-[#ffeccd]/20 transition"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        {cert.status === 'active' ? (
                          <button
                            onClick={() => handleRevoke(cert.id, cert.certificate_id)}
                            disabled={actionLoading === cert.id}
                            className="p-2 rounded-lg bg-[#ffeccd]/10 text-[#ffeccd] hover:bg-[#ffeccd]/20 transition disabled:opacity-50"
                            title="Revoke"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestore(cert.id)}
                            disabled={actionLoading === cert.id}
                            className="p-2 rounded-lg bg-[#ffeccd]/10 text-[#ffeccd] hover:bg-[#ffeccd]/20 transition disabled:opacity-50"
                            title="Restore"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(cert.id, cert.certificate_id)}
                          disabled={actionLoading === cert.id}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition disabled:opacity-50"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                        <a
                          href={`${process.env.NEXT_PUBLIC_CERTIFICATE_PORTAL_URL || 'https://igacmun.vercel.app/certificate-portal'}/${cert.certificate_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg bg-[#ffeccd]/10 text-[#ffeccd] hover:bg-[#ffeccd]/20 transition"
                          title="View Certificate"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#001c14] to-[#000b07] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#faf4ea]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-[#faf4ea] mb-2">No certificates found</h3>
            <p className="text-[#faf4ea]/60 mb-4">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Pagination - Premium */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2.5 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 text-[#faf4ea] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#faf4ea]/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10">
            <span className="text-[#faf4ea] font-medium">{page}</span>
            <span className="text-[#faf4ea]/50">/</span>
            <span className="text-[#faf4ea]/60">{totalPages}</span>
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2.5 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 text-[#faf4ea] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#faf4ea]/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Edit Modal - Premium */}
      {editingCert && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000b07]/80 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && closeEditModal()}
        >
          <div 
            className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] shadow-2xl shadow-black/50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-[#faf4ea]/10 bg-gradient-to-r from-[#ffeccd]/10 to-[#faf4ea]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffeccd] to-[#faf4ea] flex items-center justify-center shadow-lg shadow-[#ffeccd]/25">
                    <svg className="w-6 h-6 text-[#000b07]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#faf4ea]">Edit Certificate</h2>
                    <p className="text-[#faf4ea]/60 text-sm flex items-center gap-2">
                      <span>ID:</span>
                      <code className="text-[#ffeccd] bg-[#ffeccd]/10 px-2 py-0.5 rounded">{editingCert.certificate_id}</code>
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeEditModal}
                  className="p-2 rounded-xl bg-[#faf4ea]/5 text-[#faf4ea]/60 hover:text-[#faf4ea] hover:bg-[#faf4ea]/10 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {editMessage && (
                <div className={`mb-5 p-4 rounded-xl text-sm flex items-center gap-3 ${
                  editMessage.type === 'success' 
                    ? 'bg-[#ffeccd]/10 border border-[#ffeccd]/30 text-[#ffeccd]' 
                    : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}>
                  {editMessage.type === 'success' ? (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {editMessage.text}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Participant Name *</label>
                  <input
                    type="text"
                    value={editForm.participant_name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, participant_name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Institution/School *</label>
                  <input
                    type="text"
                    value={editForm.school}
                    onChange={(e) => setEditForm(prev => ({ ...prev, school: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Category *</label>
                  <select
                    value={editForm.cert_category}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cert_category: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none"
                  >
                    <option value="delegate">Delegate</option>
                    <option value="secretariat">Secretariat</option>
                    <option value="campus ambassador">Campus Ambassador</option>
                    <option value="executive board">Executive Board</option>
                    <option value="volunteer">Volunteer</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Certificate Name / Award *</label>
                    <input
                      type="text"
                      value={editForm.certificate_type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, certificate_type: e.target.value }))}
                      placeholder="e.g. Best Delegate, Best Secretariat"
                      className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Date Issued *</label>
                    <input
                      type="date"
                      value={editForm.date_issued}
                      onChange={(e) => setEditForm(prev => ({ ...prev, date_issued: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Delegate specific fields */}
                {editForm.cert_category?.toLowerCase().includes('delegate') && (
                  <div className="p-4 rounded-xl bg-[#ffeccd]/5 border border-[#ffeccd]/20 space-y-4">
                    <p className="text-sm text-[#ffeccd] font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delegate Information
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#faf4ea]/60 mb-1">Committee</label>
                        <input
                          type="text"
                          value={editForm.committee || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, committee: e.target.value }))}
                          placeholder="e.g. UNSC"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ffeccd]/20 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#faf4ea]/60 mb-1">Country</label>
                        <input
                          type="text"
                          value={editForm.country || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, country: e.target.value }))}
                          placeholder="e.g. France"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ffeccd]/20 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Secretariat specific fields */}
                {editForm.cert_category?.toLowerCase().includes('secretariat') && (
                  <div className="p-4 rounded-xl bg-[#ffeccd]/5 border border-[#ffeccd]/20 space-y-4">
                    <p className="text-sm text-[#ffeccd] font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Secretariat Information
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#faf4ea]/60 mb-1">Department</label>
                        <input
                          type="text"
                          value={editForm.department || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                          placeholder="e.g. Conference Management"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ffeccd]/20 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#faf4ea]/60 mb-1">Designation</label>
                        <input
                          type="text"
                          value={editForm.designation || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                          placeholder="e.g. Under Secretary General"
                          className="w-full px-4 py-2.5 rounded-xl border border-[#ffeccd]/20 bg-[#000b07] text-[#faf4ea] focus:border-[#ffeccd] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Executive Board specific fields */}
                {editForm.cert_category?.toLowerCase().includes('executive board') && (
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-4">
                    <p className="text-sm text-amber-300 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
                      </svg>
                      Executive Board Information
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#faf4ea]/60 mb-1">Committee</label>
                        <input
                          type="text"
                          value={editForm.committee || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, committee: e.target.value }))}
                          placeholder="e.g. UNSC, DISEC"
                          className="w-full px-4 py-2.5 rounded-xl border border-amber-500/20 bg-[#000b07] text-[#faf4ea] focus:border-amber-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#faf4ea]/60 mb-1">Position</label>
                        <select
                          value={editForm.position || ''}
                          onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value }))}
                          className="w-full px-4 py-2.5 rounded-xl border border-amber-500/20 bg-[#000b07] text-[#faf4ea] focus:border-amber-400 focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="" className="bg-[#001c14]">Select position</option>
                          <option value="Chairperson" className="bg-[#001c14]">Chairperson</option>
                          <option value="Vice Chairperson" className="bg-[#001c14]">Vice Chairperson</option>
                          <option value="Rapporteur" className="bg-[#001c14]">Rapporteur</option>
                          <option value="Director" className="bg-[#001c14]">Director</option>
                          <option value="President" className="bg-[#001c14]">President</option>
                          <option value="Vice President" className="bg-[#001c14]">Vice President</option>
                          <option value="Moderator" className="bg-[#001c14]">Moderator</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-[#faf4ea]/10 bg-[#000b07]/50 flex gap-3">
              <button
                onClick={closeEditModal}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-[#faf4ea]/10 text-[#faf4ea] hover:bg-[#faf4ea]/5 transition disabled:opacity-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={saving || !editForm.participant_name || !editForm.school}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold disabled:opacity-50 hover:opacity-90 transition shadow-lg shadow-[#ffeccd]/25 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
