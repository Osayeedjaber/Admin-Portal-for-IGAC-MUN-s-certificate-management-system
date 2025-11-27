"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Certificate types - for validation logic only
const CERT_TYPES = [
  { value: 'delegate', label: 'Delegate', icon: '🎯', description: 'Committee & Country' },
  { value: 'executive board', label: 'Executive Board', icon: '⚖️', description: 'Committee & Position' },
  { value: 'secretariat', label: 'Secretariat', icon: '👔', description: 'Department & Designation' },
  { value: 'campus ambassador', label: 'Campus Ambassador', icon: '🎓', description: 'No extra fields' },
  { value: 'volunteer', label: 'Volunteer', icon: '🤝', description: 'Event volunteers' },
  { value: 'organizer', label: 'Organizer', icon: '📋', description: 'Event organizers' },
];

// Suggested award types
const SUGGESTED_AWARDS = [
  'Best Delegate',
  'Outstanding Delegate', 
  'Honourable Mention',
  'Verbal Commendation',
  'Best Executive Board',
  'Best Secretariat',
  'Outstanding Secretariat',
  'Certificate of Participation',
  'Certificate of Appreciation',
  'Certificate of Excellence',
];

// EB Positions
const EB_POSITIONS = [
  'Chairperson',
  'Vice Chairperson',
  'Rapporteur',
  'Director',
  'President',
  'Vice President',
  'Moderator',
];

// Custom Toggle Component
function Toggle({ enabled, onChange, label, description }: { 
  enabled: boolean; 
  onChange: () => void; 
  label: string;
  description?: string;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="flex items-center justify-between w-full p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 hover:bg-[#faf4ea]/10 transition group"
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition ${
          enabled ? 'bg-[#ffeccd]/30' : 'bg-[#faf4ea]/10'
        }`}>
          <svg className={`w-5 h-5 transition ${enabled ? 'text-[#ffeccd]' : 'text-[#faf4ea]/50'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625" />
          </svg>
        </div>
        <div className="text-left">
          <p className={`font-medium transition ${enabled ? 'text-[#faf4ea]' : 'text-[#faf4ea]/70'}`}>{label}</p>
          {description && <p className="text-xs text-[#faf4ea]/50">{description}</p>}
        </div>
      </div>
      <div className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        enabled 
          ? 'bg-gradient-to-r from-[#ffeccd] to-[#faf4ea]' 
          : 'bg-[#001c14] border border-[#faf4ea]/20'
      }`}>
        <div className={`absolute top-1 w-5 h-5 rounded-full shadow-md transition-all duration-300 ${
          enabled 
            ? 'left-8 bg-[#000b07]' 
            : 'left-1 bg-[#faf4ea]/60'
        }`}>
          {enabled && (
            <svg className="w-3 h-3 text-[#ffeccd] absolute top-1 left-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}

export default function CreateCertificatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ certificate_id: string; verification_url: string; participant_name: string } | null>(null);
  
  const [formData, setFormData] = useState({
    cert_type: 'delegate',
    participant_name: '',
    email: '',
    institution: '',
    award_type: '', // This is THE certificate name
    committee: '',
    country: '',
    position: '', // For EB: Chairperson, Vice Chair, Rapporteur, etc.
    department: '',
    designation: '',
    add_to_sheet: true
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate award_type is filled
    if (!formData.award_type.trim()) {
      setError('Certificate Name (Award Type) is required');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/certificates/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create certificate');
      }

      setSuccess({
        certificate_id: data.certificate.certificate_id,
        verification_url: data.certificate.verification_url,
        participant_name: formData.participant_name
      });

      // Reset form
      setFormData({
        cert_type: 'delegate',
        participant_name: '',
        email: '',
        institution: '',
        award_type: '',
        committee: '',
        country: '',
        position: '',
        department: '',
        designation: '',
        add_to_sheet: true
      });

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showCommitteeCountry = formData.cert_type === 'delegate';
  const showExecutiveBoard = formData.cert_type === 'executive board';
  const showSecretariat = formData.cert_type === 'secretariat';

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <Link
            href="/dashboard"
            className="p-2 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 text-[#faf4ea]/60 hover:text-[#faf4ea] hover:bg-[#faf4ea]/10 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-[#faf4ea] flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffeccd] to-[#faf4ea] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#000b07]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              Create Certificate
            </h1>
            <p className="text-[#faf4ea]/60 mt-1">Manually issue a new certificate</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Success Message */}
          {success && (
            <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#ffeccd]/20 to-[#faf4ea]/20 border border-[#ffeccd]/30 p-6 animate-fade-in">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#ffeccd]/30 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-[#faf4ea] mb-1">Certificate Created! 🎉</h3>
                  <p className="text-[#faf4ea]/80 mb-4">Certificate for <span className="text-[#ffeccd] font-medium">{success.participant_name}</span> has been issued.</p>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#000b07]/50">
                      <span className="text-[#faf4ea]/60 text-sm">ID:</span>
                      <code className="text-lg font-mono text-[#ffeccd] flex-1">{success.certificate_id}</code>
                      <button 
                        onClick={() => copyToClipboard(success.certificate_id)}
                        className="p-2 rounded-lg hover:bg-[#faf4ea]/10 text-[#faf4ea]/60 hover:text-[#faf4ea] transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#000b07]/50">
                      <span className="text-[#faf4ea]/60 text-sm">URL:</span>
                      <a 
                        href={success.verification_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#ffeccd] hover:text-[#faf4ea] text-sm flex-1 truncate"
                      >
                        {success.verification_url}
                      </a>
                      <button 
                        onClick={() => copyToClipboard(success.verification_url)}
                        className="p-2 rounded-lg hover:bg-[#faf4ea]/10 text-[#faf4ea]/60 hover:text-[#faf4ea] transition"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSuccess(null)}
                    className="mt-4 px-4 py-2 rounded-xl bg-[#faf4ea]/10 text-[#faf4ea] hover:bg-[#faf4ea]/20 transition text-sm font-medium"
                  >
                    Create Another Certificate →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-300">{error}</p>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14]/50 overflow-hidden">
            {/* Form Header */}
            <div className="p-6 border-b border-[#faf4ea]/10 bg-gradient-to-r from-[#ffeccd]/10 to-[#faf4ea]/10">
              <h2 className="text-lg font-semibold text-[#faf4ea]">Certificate Details</h2>
              <p className="text-sm text-[#faf4ea]/60 mt-1">Fill in the participant information below</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Certificate Name (Award Type) - THE MAIN FIELD */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#ffeccd]/10 to-[#faf4ea]/10 border border-[#ffeccd]/20">
                <label className="block text-sm font-semibold text-[#ffeccd] mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Certificate Name / Award *
                </label>
                <input
                  type="text"
                  name="award_type"
                  value={formData.award_type}
                  onChange={handleChange}
                  required
                  list="award-suggestions"
                  placeholder="e.g., Best Delegate, Certificate of Participation"
                  className="w-full px-4 py-3 rounded-xl border border-[#ffeccd]/30 bg-[#000b07]/50 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none text-lg"
                />
                <datalist id="award-suggestions">
                  {SUGGESTED_AWARDS.map(award => (
                    <option key={award} value={award} />
                  ))}
                </datalist>
                <p className="text-xs text-[#ffeccd]/60 mt-2">This is the main text that appears on the certificate</p>
              </div>

              {/* Cert Type - For validation only */}
              <div>
                <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">
                  Certificate Type <span className="text-[#faf4ea]/50">(determines required fields)</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {CERT_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, cert_type: type.value }))}
                      className={`p-3 rounded-xl border text-left transition ${
                        formData.cert_type === type.value
                          ? 'border-[#ffeccd] bg-[#ffeccd]/20 text-[#faf4ea]'
                          : 'border-[#faf4ea]/10 bg-[#faf4ea]/5 text-[#faf4ea]/80 hover:bg-[#faf4ea]/10'
                      }`}
                    >
                      <p className="font-medium text-sm">{type.label}</p>
                      <p className="text-xs opacity-60">{type.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-[#faf4ea]/10"></div>

              {/* Participant Name */}
              <div>
                <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Participant Name *</label>
                <input
                  type="text"
                  name="participant_name"
                  value={formData.participant_name}
                  onChange={handleChange}
                  required
                  placeholder="Full name as it appears on certificate"
                  className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#faf4ea]/5 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none"
                />
              </div>

              {/* Email & Institution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="participant@email.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#faf4ea]/5 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Institution</label>
                  <input
                    type="text"
                    name="institution"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="School or organization"
                    className="w-full px-4 py-3 rounded-xl border border-[#faf4ea]/10 bg-[#faf4ea]/5 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:ring-2 focus:ring-[#ffeccd]/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Committee & Country (for Delegates) */}
              {showCommitteeCountry && (
                <div className="p-4 rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20">
                  <p className="text-sm text-[#ffeccd] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Required for Delegate certificates
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Committee *</label>
                      <input
                        type="text"
                        name="committee"
                        value={formData.committee}
                        onChange={handleChange}
                        required={showCommitteeCountry}
                        placeholder="e.g., UNSC, UNHRC"
                        className="w-full px-4 py-3 rounded-xl border border-[#ffeccd]/30 bg-[#000b07]/50 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required={showCommitteeCountry}
                        placeholder="e.g., United States"
                        className="w-full px-4 py-3 rounded-xl border border-[#ffeccd]/30 bg-[#000b07]/50 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Committee & Position (for Executive Board) */}
              {showExecutiveBoard && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
                  <p className="text-sm text-amber-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z" />
                    </svg>
                    Executive Board Information
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Committee *</label>
                      <input
                        type="text"
                        name="committee"
                        value={formData.committee}
                        onChange={handleChange}
                        required={showExecutiveBoard}
                        placeholder="e.g., UNSC, UNGA, DISEC"
                        className="w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-[#000b07]/50 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-amber-400 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Position *</label>
                      <select
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        required={showExecutiveBoard}
                        className="w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-[#000b07]/50 text-[#faf4ea] focus:border-amber-400 focus:outline-none appearance-none cursor-pointer"
                      >
                        <option value="" className="bg-[#001c14]">Select position</option>
                        {EB_POSITIONS.map(pos => (
                          <option key={pos} value={pos} className="bg-[#001c14]">{pos}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Department & Designation (for Secretariat) */}
              {showSecretariat && (
                <div className="p-4 rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/20">
                  <p className="text-sm text-[#ffeccd] mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Secretariat Information
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Department</label>
                      <input
                        type="text"
                        name="department"
                        value={formData.department}
                        onChange={handleChange}
                        placeholder="e.g., Conference Management"
                        className="w-full px-4 py-3 rounded-xl border border-[#ffeccd]/30 bg-[#000b07]/50 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Designation</label>
                      <input
                        type="text"
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        placeholder="e.g., Under Secretary General"
                        className="w-full px-4 py-3 rounded-xl border border-[#ffeccd]/30 bg-[#000b07]/50 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:border-[#ffeccd] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Add to Sheet Toggle */}
              <Toggle
                enabled={formData.add_to_sheet}
                onChange={() => setFormData(prev => ({ ...prev, add_to_sheet: !prev.add_to_sheet }))}
                label="Sync to Google Sheet"
                description="Also add this certificate to the spreadsheet"
              />
            </div>

            {/* Submit */}
            <div className="p-6 border-t border-[#faf4ea]/10 bg-[#000b07]/50">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#ffeccd]/25"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#000b07]/30 border-t-[#000b07]"></div>
                    Creating Certificate...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Create Certificate
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tips */}
          <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14]/50 p-6">
            <h3 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
              </svg>
              Tips
            </h3>
            <ul className="space-y-3 text-sm text-[#faf4ea]/60">
              <li className="flex items-start gap-2">
                <span className="text-[#ffeccd] mt-0.5">•</span>
                <span><strong className="text-[#faf4ea]/80">Certificate Name</strong> is what appears on the actual certificate (e.g., "Best Delegate")</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ffeccd] mt-0.5">•</span>
                <span><strong className="text-[#faf4ea]/80">Certificate Type</strong> only determines which fields are required</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ffeccd] mt-0.5">•</span>
                <span>Delegates require committee and country fields</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ffeccd] mt-0.5">•</span>
                <span>A unique ID will be auto-generated</span>
              </li>
            </ul>
          </div>

          {/* Suggested Awards */}
          <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14]/50 p-6">
            <h3 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
              Quick Select
            </h3>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_AWARDS.slice(0, 6).map(award => (
                <button
                  key={award}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, award_type: award }))}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    formData.award_type === award
                      ? 'bg-[#ffeccd] text-[#000b07]'
                      : 'bg-[#faf4ea]/5 text-[#faf4ea]/80 hover:bg-[#faf4ea]/10 border border-[#faf4ea]/10'
                  }`}
                >
                  {award}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
