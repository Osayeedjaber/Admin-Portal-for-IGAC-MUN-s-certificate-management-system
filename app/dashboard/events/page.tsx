"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Event {
  id: string;
  event_code: string;
  event_name: string;
  year: number;
  month: number;
  session: number;
  event_type: string;
  created_at: string;
  certificate_count?: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ 
    event_code: '', 
    event_name: '', 
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    session: 1,
    event_type: 'mun'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch events');
      }
      
      setEvents(data.events || []);
    } catch (err: any) {
      console.error('Failed to fetch events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!newEvent.event_code || !newEvent.event_name) return;

    setSaving(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newEvent)
      });

      if (res.ok) {
        setShowModal(false);
        setNewEvent({ 
          event_code: '', 
          event_name: '', 
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          session: 1,
          event_type: 'mun'
        });
        fetchEvents();
      }
    } catch (error) {
      console.error('Failed to create event:', error);
    } finally {
      setSaving(false);
    }
  };

  const getMonthName = (month: number) => {
    return new Date(2000, month - 1).toLocaleString('en-US', { month: 'short' });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-[#ffeccd]/20 border-t-[#ffeccd] rounded-full animate-spin"></div>
          <p className="text-[#faf4ea]/60">Loading events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/10 flex items-center justify-center shadow-lg shadow-[#ffeccd]/10 border border-[#ffeccd]/20">
            <svg className="w-7 h-7 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#faf4ea]">Events</h1>
            <p className="text-[#faf4ea]/60 mt-1">Manage MUN events and sessions</p>
          </div>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold hover:shadow-lg hover:shadow-[#ffeccd]/25 transition-all hover:scale-[1.02] flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Event
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Events Grid */}
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-6 hover:border-[#ffeccd]/30 transition group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/10 flex items-center justify-center border border-[#ffeccd]/20 group-hover:scale-110 transition">
                  <svg className="w-6 h-6 text-[#ffeccd]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <span className="px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-medium border border-emerald-500/30">
                  {event.certificate_count || 0} certificates
                </span>
              </div>

              <h3 className="text-lg font-semibold text-[#faf4ea] mb-1 group-hover:text-[#ffeccd] transition">{event.event_name}</h3>
              <p className="text-sm text-[#faf4ea]/60 mb-4">
                <code className="text-[#ffeccd] bg-[#ffeccd]/10 px-2 py-0.5 rounded border border-[#ffeccd]/20">{event.event_code}</code>
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#faf4ea]/50">
                  {getMonthName(event.month)} {event.year} • Session {event.session}
                </span>
                <span className="px-2 py-1 rounded bg-[#faf4ea]/10 text-[#faf4ea]/70 text-xs capitalize border border-[#faf4ea]/10">
                  {event.event_type}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-12 text-center">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-[#ffeccd]/20 to-[#faf4ea]/10 flex items-center justify-center mb-4 border border-[#ffeccd]/20">
            <svg className="w-10 h-10 text-[#ffeccd]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-[#faf4ea] mb-2">No Events Yet</h3>
          <p className="text-[#faf4ea]/60 mb-6">Create your first event to start issuing certificates</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold hover:shadow-lg hover:shadow-[#ffeccd]/25 transition"
          >
            Create Event
          </button>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="rounded-2xl border border-[#faf4ea]/10 bg-gradient-to-br from-[#001c14] to-[#000b07] p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-[#faf4ea] mb-6">Create New Event</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">
                  Event Code (ID)
                </label>
                <input
                  type="text"
                  value={newEvent.event_code}
                  onChange={(e) => setNewEvent({ ...newEvent, event_code: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  placeholder="e.g., igacmun-session-4"
                  className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/50 focus:border-[#ffeccd]/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">
                  Event Name
                </label>
                <input
                  type="text"
                  value={newEvent.event_name}
                  onChange={(e) => setNewEvent({ ...newEvent, event_name: e.target.value })}
                  placeholder="e.g., IGAC MUN Session 4"
                  className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] placeholder-[#faf4ea]/40 focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/50 focus:border-[#ffeccd]/50"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Year</label>
                  <input
                    type="number"
                    value={newEvent.year}
                    onChange={(e) => setNewEvent({ ...newEvent, year: parseInt(e.target.value) || new Date().getFullYear() })}
                    className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/50 focus:border-[#ffeccd]/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Month</label>
                  <select
                    value={newEvent.month}
                    onChange={(e) => setNewEvent({ ...newEvent, month: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/50 focus:border-[#ffeccd]/50"
                  >
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                      <option key={m} value={m}>{getMonthName(m)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Session</label>
                  <input
                    type="number"
                    value={newEvent.session}
                    onChange={(e) => setNewEvent({ ...newEvent, session: parseInt(e.target.value) || 1 })}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/50 focus:border-[#ffeccd]/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#faf4ea]/80 mb-2">Event Type</label>
                <select
                  value={newEvent.event_type}
                  onChange={(e) => setNewEvent({ ...newEvent, event_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[#000b07] border border-[#faf4ea]/20 text-[#faf4ea] focus:outline-none focus:ring-2 focus:ring-[#ffeccd]/50 focus:border-[#ffeccd]/50"
                >
                  <option value="mun">MUN</option>
                  <option value="workshop">Workshop</option>
                  <option value="conference">Conference</option>
                  <option value="training">Training</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 rounded-xl border border-[#faf4ea]/20 text-[#faf4ea] hover:bg-[#faf4ea]/5 transition font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={saving || !newEvent.event_code || !newEvent.event_name}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#ffeccd] to-[#faf4ea] text-[#000b07] font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-[#ffeccd]/25 transition flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#000b07]/30 border-t-[#000b07] rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
