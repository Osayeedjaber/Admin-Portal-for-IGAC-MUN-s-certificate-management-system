import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/utils/auth'
import { getAllRows, batchUpdateRows } from '@/lib/utils/sheetdb'
import { generateVerificationUrl, getDefaultEventName } from '@/lib/utils/certificates'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Get all rows from sheet that have a Unique_ID
    const allRows = await getAllRows()
    const processedRows = allRows.filter(
      row => row.Unique_ID && row.Unique_ID.trim() !== ''
    )
    
    if (processedRows.length === 0) {
      return NextResponse.json({
        message: 'No certificates to sync',
        updated: 0
      })
    }

    const updates = []
    const eventCode = getDefaultEventName()

    for (const row of processedRows) {
      // Get certificate from Supabase
      const { data: certData } = await (supabase as any)
        .from('certificates')
        .select('*, events(*)')
        .eq('certificate_id', row.Unique_ID)
        .single()
      
      const certificate = certData as {
        certificate_id: string
        date_issued: string
        status: string
        events?: { event_code: string }
      } | null

      if (certificate) {
        const needsUpdate = 
          row.Verified_Status !== certificate.status ||
          row.Date_Issued !== certificate.date_issued ||
          row.Event_Name !== certificate.events?.event_code ||
          !row.Verification_URL

        if (needsUpdate) {
          updates.push({
            searchColumn: 'Unique_ID',
            searchValue: row.Unique_ID,
            data: {
              Verification_URL: generateVerificationUrl(certificate.certificate_id),
              Date_Issued: certificate.date_issued,
              Verified_Status: certificate.status,
              Event_Name: certificate.events?.event_code || eventCode
            }
          })
        }
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({
        message: 'All sheet data is up to date',
        updated: 0
      })
    }

    const result = await batchUpdateRows(updates)

    return NextResponse.json({
      message: `Sheet sync completed: ${result.success} updated, ${result.failed} failed`,
      updated: result.success,
      failed: result.failed
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to sync to sheet' },
      { status: 500 }
    )
  }
}
