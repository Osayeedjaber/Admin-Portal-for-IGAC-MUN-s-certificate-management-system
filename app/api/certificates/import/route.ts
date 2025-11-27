import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/utils/auth";
import { generateCertificateId, generateVerificationUrl } from "@/lib/utils/certificates";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const body = await request.json();

    const { certificates } = body;

    if (!Array.isArray(certificates) || certificates.length === 0) {
      return NextResponse.json(
        { error: 'Certificates array is required' },
        { status: 400 }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const cert of certificates) {
      try {
        // Validate required fields
        if (!cert.participant_name || !cert.certificate_type) {
          results.failed++;
          results.errors.push(`Missing required fields for ${cert.participant_name || 'unknown'}`);
          continue;
        }

        // Generate ID
        const certificateId = generateCertificateId();
        const verificationUrl = generateVerificationUrl(certificateId);

        // Prepare certificate data
        const certificateData: any = {
          certificate_id: certificateId,
          participant_name: cert.participant_name,
          certificate_type: cert.certificate_type,
          event_name: cert.event_name || process.env.DEFAULT_EVENT_NAME || 'igacmun-session-3',
          verification_url: verificationUrl,
          status: 'active',
          verification_count: 0
        };

        // Add type-specific fields
        if (cert.certificate_type === 'Delegate') {
          certificateData.committee = cert.committee || null;
          certificateData.country = cert.country || null;
          certificateData.award = cert.award || null;
        } else if (cert.certificate_type === 'Secretariat') {
          certificateData.secretariat_role = cert.secretariat_role || null;
        }

        // Insert to database
        const { error } = await (supabase as any)
          .from('certificates')
          .insert(certificateData);

        if (error) {
          throw error;
        }

        results.success++;
      } catch (err: any) {
        results.failed++;
        results.errors.push(`Failed to import ${cert.participant_name}: ${err.message}`);
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Import failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
