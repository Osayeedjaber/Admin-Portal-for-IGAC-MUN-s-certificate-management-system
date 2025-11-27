import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/utils/auth";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const searchParams = request.nextUrl.searchParams;
    const format = searchParams.get('format') || 'csv';
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const event = searchParams.get('event');

    // Build query
    let query = (supabase as any).from('certificates').select('*');

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }
    if (type && type !== 'all') {
      query = query.eq('certificate_type', type);
    }
    if (event) {
      query = query.eq('event_name', event);
    }

    const { data: certificates, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    if (format === 'json') {
      return NextResponse.json(certificates, {
        headers: {
          'Content-Disposition': `attachment; filename="certificates-${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Type': 'application/json'
        }
      });
    }

    // CSV format
    const headers = [
      'certificate_id',
      'participant_name',
      'certificate_type',
      'event_name',
      'committee',
      'country',
      'award',
      'secretariat_role',
      'status',
      'verification_url',
      'created_at'
    ];

    const csvRows = [headers.join(',')];

    for (const cert of certificates || []) {
      const row = headers.map(header => {
        let value = cert[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string') {
          value = value.replace(/"/g, '""');
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value}"`;
          }
        }
        return value;
      });
      csvRows.push(row.join(','));
    }

    const csvContent = csvRows.join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Disposition': `attachment; filename="certificates-${new Date().toISOString().split('T')[0]}.csv"`,
        'Content-Type': 'text/csv'
      }
    });
  } catch (error: any) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
