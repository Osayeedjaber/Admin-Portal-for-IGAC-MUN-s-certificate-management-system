import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/utils/auth";

export async function GET() {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    // Get verification logs - this would typically be from a verification_logs table
    // For now, we'll return empty as this table might not exist
    const { data: logs, error } = await (supabase as any)
      .from('verification_logs')
      .select(`
        id,
        certificate_id,
        verified_at,
        ip_address,
        user_agent,
        certificates (
          participant_name
        )
      `)
      .order('verified_at', { ascending: false })
      .limit(100);

    if (error) {
      // Table might not exist
      return NextResponse.json({ logs: [] });
    }

    const formattedLogs = (logs || []).map((log: any) => ({
      id: log.id,
      certificate_id: log.certificate_id,
      participant_name: log.certificates?.participant_name || 'Unknown',
      verified_at: log.verified_at,
      ip_address: log.ip_address,
      user_agent: log.user_agent
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error: any) {
    console.error('Failed to fetch logs:', error);
    return NextResponse.json({ logs: [] });
  }
}
