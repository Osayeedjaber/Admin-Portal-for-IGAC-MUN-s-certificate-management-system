import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/utils/auth";
import { notifyEventCreated, notifyError } from "@/lib/utils/discord";

// GET - List all events
export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Get events with certificate counts
    const { data: events, error } = await (supabase as any)
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Events fetch error:', error);
      // If events table doesn't exist, return empty
      return NextResponse.json({ events: [] });
    }

    // Get certificate counts for each event
    const eventsWithCounts = await Promise.all(
      (events || []).map(async (event: any) => {
        const { count } = await (supabase as any)
          .from('certificates')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', event.id);
        
        return {
          ...event,
          certificate_count: count || 0
        };
      })
    );

    return NextResponse.json({ events: eventsWithCounts });
  } catch (error: any) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new event
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();

    const { event_code, event_name, year, month, session, event_type } = body;

    if (!event_code || !event_name) {
      return NextResponse.json(
        { error: 'Event code and name are required' },
        { status: 400 }
      );
    }

    const currentDate = new Date();
    const { data: event, error } = await (supabase as any)
      .from('events')
      .insert({
        event_code: event_code.toLowerCase().replace(/\s+/g, '-'),
        event_name,
        year: year || currentDate.getFullYear(),
        month: month || currentDate.getMonth() + 1,
        session: session || 1,
        event_type: event_type || 'mun',
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Notify Discord
    await notifyEventCreated(
      event.event_code,
      event.event_name
    );

    return NextResponse.json({ event });
  } catch (error: any) {
    console.error('Failed to create event:', error);
    await notifyError('Event Creation Failed', error.message || 'Unknown error');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
