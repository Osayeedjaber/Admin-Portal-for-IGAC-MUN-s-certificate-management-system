import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/utils/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get all stats in parallel
    const [
      { count: totalCertificates },
      { count: activeCertificates },
      { count: revokedCertificates },
      { data: verificationData },
      { data: recentCerts },
      { data: certsByType },
      { data: events }
    ] = await Promise.all([
      supabase.from('certificates').select('id', { count: 'exact', head: true }),
      supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('certificates').select('id', { count: 'exact', head: true }).eq('status', 'revoked'),
      supabase.from('certificates').select('verification_count'),
      supabase.from('certificates')
        .select('certificate_id, participant_name, certificate_type, created_at, status')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('certificates')
        .select('certificate_type'),
      supabase.from('events').select('*').order('created_at', { ascending: false })
    ])

    // Calculate total verifications
    const totalVerifications = (verificationData || []).reduce(
      (sum: number, entry: any) => sum + (entry.verification_count || 0),
      0
    )

    // Group certificates by type
    const typeBreakdown: Record<string, number> = {}
    if (certsByType) {
      for (const cert of certsByType) {
        const type = (cert as any).certificate_type || 'Unknown'
        typeBreakdown[type] = (typeBreakdown[type] || 0) + 1
      }
    }

    return NextResponse.json({
      stats: {
        totalCertificates: totalCertificates || 0,
        activeCertificates: activeCertificates || 0,
        revokedCertificates: revokedCertificates || 0,
        totalVerifications,
        totalEvents: events?.length || 0
      },
      typeBreakdown,
      recentCertificates: recentCerts || [],
      events: events || []
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
