"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'mod';
  account_status: 'pending_approval' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
}

const DEFAULT_CERTIFICATE_TYPES = [
  'delegate',
  'secretariat',
  'executive board',
  'campus ambassador',
  'volunteer',
  'organizer'
];

const DEFAULT_AWARD_TYPES = [
  'Best Delegate',
  'Outstanding Delegate',
  'Honourable Mention',
  'Verbal Commendation',
  'Best Secretariat',
  'Best Executive Board',
  'Certificate of Participation',
  'Certificate of Appreciation'
];

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    defaultEvent: 'igacmun-session-3-2025',
    sheetDbUrl: 'https://sheetdb.io/api/v1/9e3k2u4nlvm0s',
    portalUrl: 'https://igacmun.vercel.app/certificate-portal',
    autoSync: false,
    syncInterval: 5
  });
  
  const [certificateTypes, setCertificateTypes] = useState<string[]>(DEFAULT_CERTIFICATE_TYPES);
  const [awardTypes, setAwardTypes] = useState<string[]>(DEFAULT_AWARD_TYPES);
  const [newCertType, setNewCertType] = useState('');
  const [newAwardType, setNewAwardType] = useState('');
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'types' | 'users' | 'danger'>('general');
  
  // User management state
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (parsed.settings) setSettings(parsed.settings);
        if (parsed.certificateTypes) setCertificateTypes(parsed.certificateTypes);
        if (parsed.awardTypes) setAwardTypes(parsed.awardTypes);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    }
    
    // Check current user role
    checkCurrentUserRole();
  }, []);

  const checkCurrentUserRole = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setCurrentUserRole(data.user?.role || null);
      }
    } catch (e) {
      console.error('Failed to check user role:', e);
    }
  };

  const fetchUsers = async () => {
    setLoadingUsers(true);
    setUserError(null);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }
      setUsers(data.users || []);
    } catch (e: any) {
      setUserError(e.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch users when switching to users tab
  useEffect(() => {
    if (activeTab === 'users' && currentUserRole === 'super_admin') {
      fetchUsers();
    }
  }, [activeTab, currentUserRole]);

  const handleUserAction = async (userId: string, action: 'approve' | 'reject', role?: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update user');
      }
      fetchUsers(); // Refresh list
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`/api/users?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete user');
      }
      fetchUsers(); // Refresh list
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'change_role', role: newRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to change role');
      }
      fetchUsers(); // Refresh list
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Save to localStorage
    localStorage.setItem('adminSettings', JSON.stringify({
      settings,
      certificateTypes,
      awardTypes
    }));
    
    await new Promise(resolve => setTimeout(resolve, 500));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const addCertificateType = () => {
    if (newCertType.trim() && !certificateTypes.includes(newCertType.toLowerCase().trim())) {
      setCertificateTypes([...certificateTypes, newCertType.toLowerCase().trim()]);
      setNewCertType('');
    }
  };

  const removeCertificateType = (type: string) => {
    setCertificateTypes(certificateTypes.filter(t => t !== type));
  };

  const addAwardType = () => {
    if (newAwardType.trim() && !awardTypes.includes(newAwardType.trim())) {
      setAwardTypes([...awardTypes, newAwardType.trim()]);
      setNewAwardType('');
    }
  };

  const removeAwardType = (type: string) => {
    setAwardTypes(awardTypes.filter(t => t !== type));
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      setCertificateTypes(DEFAULT_CERTIFICATE_TYPES);
      setAwardTypes(DEFAULT_AWARD_TYPES);
      setSettings({
        defaultEvent: 'igacmun-session-3-2025',
        sheetDbUrl: 'https://sheetdb.io/api/v1/9e3k2u4nlvm0s',
        portalUrl: 'https://igacmun.vercel.app/certificate-portal',
        autoSync: false,
        syncInterval: 5
      });
      localStorage.removeItem('adminSettings');
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#faf4ea] flex items-center gap-3">
          <svg className="w-8 h-8 text-[#faf4ea]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </h1>
        <p className="text-[#faf4ea]/60 mt-1">Configure your admin portal preferences</p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="mb-6 p-4 rounded-xl bg-[#ffeccd]/10 border border-[#ffeccd]/30 text-[#ffeccd] flex items-center gap-3 animate-fade-in">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Settings saved successfully!
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'general' 
              ? 'bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07]' 
              : 'bg-[#faf4ea]/5 text-[#faf4ea]/60 hover:text-[#faf4ea] hover:bg-[#faf4ea]/10'
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab('types')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'types' 
              ? 'bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07]' 
              : 'bg-[#faf4ea]/5 text-[#faf4ea]/60 hover:text-[#faf4ea] hover:bg-[#faf4ea]/10'
          }`}
        >
          Certificate & Award Types
        </button>
        {currentUserRole === 'super_admin' && (
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              activeTab === 'users' 
                ? 'bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07]' 
                : 'bg-[#faf4ea]/5 text-[#faf4ea]/60 hover:text-[#faf4ea] hover:bg-[#faf4ea]/10'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            User Management
            {users.filter(u => u.account_status === 'pending_approval').length > 0 && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                {users.filter(u => u.account_status === 'pending_approval').length}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveTab('danger')}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            activeTab === 'danger' 
              ? 'bg-red-500 text-white' 
              : 'bg-[#faf4ea]/5 text-[#faf4ea]/60 hover:text-[#faf4ea] hover:bg-[#faf4ea]/10'
          }`}
        >
          Danger Zone
        </button>
      </div>

      <div className="max-w-3xl space-y-6">
        {/* General Tab */}
        {activeTab === 'general' && (
          <>
            {/* Event Settings */}
            <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
              <h2 className="text-lg font-semibold text-[#faf4ea] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Event Settings
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">Default Event Code</label>
                  <input
                    type="text"
                    value={settings.defaultEvent}
                    onChange={(e) => setSettings({ ...settings, defaultEvent: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]"
                    placeholder="e.g., igacmun-session-3-2025"
                  />
                  <p className="text-xs text-[#faf4ea]/50 mt-1">This event will be used when syncing from Google Sheets</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">Certificate Portal URL</label>
                  <input
                    type="url"
                    value={settings.portalUrl}
                    onChange={(e) => setSettings({ ...settings, portalUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]"
                  />
                  <p className="text-xs text-[#faf4ea]/50 mt-1">Base URL for certificate verification links</p>
                </div>
              </div>
            </div>

            {/* SheetDB Settings */}
            <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
              <h2 className="text-lg font-semibold text-[#faf4ea] mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375" />
                </svg>
                Google Sheets Integration
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">SheetDB API URL</label>
                  <input
                    type="url"
                    value={settings.sheetDbUrl}
                    onChange={(e) => setSettings({ ...settings, sheetDbUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd] font-mono text-sm"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/5">
                  <div>
                    <p className="text-[#faf4ea] font-medium">Auto-Sync</p>
                    <p className="text-xs text-[#faf4ea]/60">Automatically sync from sheet periodically</p>
                  </div>
                  <button
                    onClick={() => setSettings({ ...settings, autoSync: !settings.autoSync })}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      settings.autoSync ? 'bg-[#ffeccd]' : 'bg-[#faf4ea]/20'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-[#000b07] absolute top-0.5 transition-transform ${
                      settings.autoSync ? 'translate-x-6' : 'translate-x-0.5'
                    }`}></div>
                  </button>
                </div>

                {settings.autoSync && (
                  <div>
                    <label className="block text-sm font-medium text-[#faf4ea]/60 mb-2">Sync Interval (minutes)</label>
                    <select
                      value={settings.syncInterval}
                      onChange={(e) => setSettings({ ...settings, syncInterval: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]"
                    >
                      <option value={1}>Every 1 minute</option>
                      <option value={5}>Every 5 minutes</option>
                      <option value={15}>Every 15 minutes</option>
                      <option value={30}>Every 30 minutes</option>
                      <option value={60}>Every hour</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Types Tab */}
        {activeTab === 'types' && (
          <>
            {/* Certificate Types */}
            <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
              <h2 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Certificate Types
              </h2>
              <p className="text-sm text-[#faf4ea]/60 mb-4">These are the roles/types used in your MUN certificates (e.g., delegate, secretariat)</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {certificateTypes.map((type) => (
                  <span 
                    key={type} 
                    className="px-3 py-1.5 rounded-lg bg-[#ffeccd]/20 text-[#ffeccd] text-sm flex items-center gap-2 group"
                  >
                    {type}
                    <button 
                      onClick={() => removeCertificateType(type)}
                      className="opacity-50 hover:opacity-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCertType}
                  onChange={(e) => setNewCertType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addCertificateType()}
                  placeholder="Add new type..."
                  className="flex-1 px-4 py-2 rounded-lg bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd] text-sm"
                />
                <button
                  onClick={addCertificateType}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] hover:opacity-90 transition text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Award Types */}
            <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
              <h2 className="text-lg font-semibold text-[#faf4ea] mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 002.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 012.916.52 6.003 6.003 0 01-5.395 4.972m0 0a6.726 6.726 0 01-2.749 1.35m0 0a6.772 6.772 0 01-3.044 0" />
                </svg>
                Award Types
              </h2>
              <p className="text-sm text-[#faf4ea]/60 mb-4">Awards that can be given to participants (e.g., Best Delegate, Best Secretariat)</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {awardTypes.map((type) => (
                  <span 
                    key={type} 
                    className="px-3 py-1.5 rounded-lg bg-[#ffeccd]/20 text-[#ffeccd] text-sm flex items-center gap-2 group"
                  >
                    {type}
                    <button 
                      onClick={() => removeAwardType(type)}
                      className="opacity-50 hover:opacity-100 transition"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAwardType}
                  onChange={(e) => setNewAwardType(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addAwardType()}
                  placeholder="Add new award..."
                  className="flex-1 px-4 py-2 rounded-lg bg-[#000b07] border border-[#faf4ea]/10 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd] text-sm"
                />
                <button
                  onClick={addAwardType}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] hover:opacity-90 transition text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          </>
        )}

        {/* Users Tab - Super Admin Only */}
        {activeTab === 'users' && currentUserRole === 'super_admin' && (
          <div className="rounded-2xl border border-[#faf4ea]/10 bg-[#001c14] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-[#faf4ea] flex items-center gap-2">
                <svg className="w-5 h-5 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                User Management
              </h2>
              <button
                onClick={fetchUsers}
                className="px-3 py-1.5 rounded-lg bg-[#faf4ea]/10 text-[#faf4ea] hover:bg-[#faf4ea]/20 transition text-sm flex items-center gap-2"
              >
                <svg className={`w-4 h-4 ${loadingUsers ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {userError && (
              <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {userError}
              </div>
            )}

            {loadingUsers ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-8 h-8 border-2 border-[#ffeccd]/30 border-t-[#ffeccd] rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Pending Users */}
                {users.filter(u => u.account_status === 'pending_approval').length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-[#ffeccd] mb-3 flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                        {users.filter(u => u.account_status === 'pending_approval').length} Pending
                      </span>
                      Awaiting Approval
                    </h3>
                    <div className="space-y-2">
                      {users.filter(u => u.account_status === 'pending_approval').map(user => (
                        <div key={user.id} className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-[#faf4ea] font-medium truncate">{user.email}</p>
                            <p className="text-xs text-[#faf4ea]/50">
                              Registered {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              defaultValue="admin"
                              className="px-3 py-1.5 rounded-lg bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] text-sm"
                              id={`role-${user.id}`}
                            >
                              <option value="admin">Admin</option>
                              <option value="mod">Moderator</option>
                            </select>
                            <button
                              onClick={() => {
                                const select = document.getElementById(`role-${user.id}`) as HTMLSelectElement;
                                handleUserAction(user.id, 'approve', select?.value || 'admin');
                              }}
                              className="px-3 py-1.5 rounded-lg bg-green-500 text-white hover:bg-green-400 transition text-sm font-medium"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleUserAction(user.id, 'reject')}
                              className="px-3 py-1.5 rounded-lg bg-red-500 text-white hover:bg-red-400 transition text-sm font-medium"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Approved Users */}
                <div>
                  <h3 className="text-sm font-semibold text-[#faf4ea]/70 mb-3">Active Users</h3>
                  <div className="space-y-2">
                    {users.filter(u => u.account_status === 'approved').map(user => (
                      <div key={user.id} className="p-4 rounded-xl bg-[#faf4ea]/5 border border-[#faf4ea]/10 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-[#faf4ea] font-medium truncate">{user.email}</p>
                            <span className={`px-2 py-0.5 rounded-full text-xs ${
                              user.role === 'super_admin' 
                                ? 'bg-purple-500/20 text-purple-400' 
                                : user.role === 'admin' 
                                  ? 'bg-[#ffeccd]/20 text-[#ffeccd]' 
                                  : 'bg-blue-500/20 text-blue-400'
                            }`}>
                              {user.role === 'super_admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Moderator'}
                            </span>
                          </div>
                          <p className="text-xs text-[#faf4ea]/50">
                            Approved {user.approved_at ? new Date(user.approved_at).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        {user.role !== 'super_admin' && (
                          <div className="flex items-center gap-2">
                            <select
                              value={user.role}
                              onChange={(e) => handleChangeRole(user.id, e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] text-sm"
                            >
                              <option value="admin">Admin</option>
                              <option value="mod">Moderator</option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                              title="Delete user"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rejected Users */}
                {users.filter(u => u.account_status === 'rejected').length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-red-400/70 mb-3">Rejected Users</h3>
                    <div className="space-y-2">
                      {users.filter(u => u.account_status === 'rejected').map(user => (
                        <div key={user.id} className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <p className="text-[#faf4ea]/60 font-medium truncate">{user.email}</p>
                            <p className="text-xs text-[#faf4ea]/40">
                              Registered {new Date(user.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleUserAction(user.id, 'approve', 'admin')}
                              className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition"
                            >
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {users.length === 0 && (
                  <div className="text-center py-12 text-[#faf4ea]/50">
                    <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Danger Zone Tab */}
        {activeTab === 'danger' && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
            <h2 className="text-lg font-semibold text-red-400 mb-6 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              Danger Zone
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div>
                  <p className="text-[#faf4ea] font-medium">Reset All Settings</p>
                  <p className="text-xs text-[#faf4ea]/60">Reset certificate types, award types, and all settings to defaults</p>
                </div>
                <button 
                  onClick={resetToDefaults}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-400 transition text-sm font-medium"
                >
                  Reset to Defaults
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                <div>
                  <p className="text-[#faf4ea] font-medium">Clear Browser Cache</p>
                  <p className="text-xs text-[#faf4ea]/60">Clear all locally stored settings</p>
                </div>
                <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="px-4 py-2 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 transition text-sm"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold disabled:opacity-50 hover:opacity-90 transition flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Save Settings
            </>
          )}
        </button>
      </div>
    </div>
  );
}
