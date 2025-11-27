import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/utils/auth'
import { getAllRows, batchUpdateRows } from '@/lib/utils/sheetdb'
import { 
  generateCertificateId, 
  generateVerificationUrl, 
  getTodayDate, 
  getDefaultEventName,
  validateCertificateFields,
  requiresCommitteeAndCountry,
  requiresDepartmentAndDesignation,
  isCampusAmbassador
} from '@/lib/utils/certificates'
import { notifySyncComplete, notifySyncErrors, notifyError } from '@/lib/utils/discord'
import { SheetDBRow } from '@/types/database'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    
    // Get all rows from sheet
    const allRows = await getAllRows()
    
    // Filter rows that need processing (no Unique_ID or empty)
    const unprocessedRows = allRows.filter(
      row => !row.Unique_ID || row.Unique_ID.trim() === ''
    )
    
    if (unprocessedRows.length === 0) {
      return NextResponse.json({
        message: 'No new certificates to process',
        processed: 0,
        errors: []
      })
    }

    // Get the default event
    const eventCode = getDefaultEventName()
    const { data: eventData, error: eventError } = await supabase
      .from('events')
      .select('id, event_code, year')
      .eq('event_code', eventCode)
      .single()

    if (eventError || !eventData) {
      return NextResponse.json(
        { error: `Event "${eventCode}" not found in database. Please create it first.` },
        { status: 404 }
      )
    }
    
    const event = eventData as { id: string; event_code: string; year: number }

    const results = {
      success: [] as any[],
      errors: [] as any[],
      sheetUpdates: [] as any[]
    }

    // Process each unprocessed row
    for (let i = 0; i < unprocessedRows.length; i++) {
      const row = unprocessedRows[i]
      
      try {
        // Log row data for debugging
        console.log('Processing row:', JSON.stringify(row))
        
        // Validate required fields
        const validation = validateCertificateFields(row.Cert_Type || '', {
          participant_name: row.Participant_Name,
          email: row.Email,
          institution: row.Institution,
          award_type: row.Award_Type,
          committee: row.Committee,
          country: row.Country
        })

        if (!validation.valid) {
          results.errors.push({
            row: i + 1,
            participant_name: row.Participant_Name || 'Unknown',
            error: `Missing required fields: ${validation.missingFields.join(', ')}`
          })
          continue
        }

        // Generate unique ID (check for duplicates)
        let certificateId = generateCertificateId()
        let retries = 0
        while (retries < 10) {
          const { data: existing } = await supabase
            .from('certificates')
            .select('certificate_id')
            .eq('certificate_id', certificateId)
            .single()
          
          if (!existing) break
          certificateId = generateCertificateId()
          retries++
        }

        const verificationUrl = generateVerificationUrl(certificateId)
        const dateIssued = getTodayDate()

        // Award_Type IS the certificate name - it's required and goes directly to DB
        const certificateDisplayName = row.Award_Type?.trim() || ''
        
        if (!certificateDisplayName) {
          results.errors.push({
            row: i + 1,
            participant_name: row.Participant_Name || 'Unknown',
            error: 'Award_Type is required - this is the certificate name'
          })
          continue
        }

        // Insert into Supabase
        const { data: certificateData, error: certError } = await (supabase as any)
          .from('certificates')
          .insert({
            certificate_id: certificateId,
            event_id: event.id,
            certificate_type: certificateDisplayName,
            participant_name: row.Participant_Name,
            school: (row as any).institution || row.Institution || '',
            date_issued: dateIssued,
            qr_code_data: verificationUrl,
            created_by: user.id
          })
          .select()
          .single()
        
        const certificate = certificateData as { id: string } | null

        if (certError || !certificate) {
          results.errors.push({
            row: i + 1,
            participant_name: row.Participant_Name,
            error: certError?.message || 'Failed to insert'
          })
          continue
        }

        // Insert metadata
        const metadataEntries: any[] = []
        
        // Always store email
        if (row.Email) {
          metadataEntries.push({
            certificate_id: certificate.id,
            field_name: 'email',
            field_value: row.Email,
            field_type: 'text'
          })
        }
        
        // Store the cert type category (delegate, secretariat, etc.)
        if (row.Cert_Type) {
          metadataEntries.push({
            certificate_id: certificate.id,
            field_name: 'cert_type',
            field_value: row.Cert_Type,
            field_type: 'text'
          })
        }
        
        // For Delegates: Committee and Country
        if (requiresCommitteeAndCountry(row.Cert_Type)) {
          if (row.Committee) {
            metadataEntries.push({
              certificate_id: certificate.id,
              field_name: 'committee',
              field_value: row.Committee,
              field_type: 'text'
            })
          }
          if (row.Country) {
            metadataEntries.push({
              certificate_id: certificate.id,
              field_name: 'country',
              field_value: row.Country,
              field_type: 'text'
            })
          }
        }
        
        // For Secretariat: Committee = Department, Country = Designation
        if (requiresDepartmentAndDesignation(row.Cert_Type)) {
          if (row.Committee) {
            metadataEntries.push({
              certificate_id: certificate.id,
              field_name: 'department',
              field_value: row.Committee,
              field_type: 'text'
            })
          }
          if (row.Country) {
            metadataEntries.push({
              certificate_id: certificate.id,
              field_name: 'designation',
              field_value: row.Country,
              field_type: 'text'
            })
          }
        }
        
        // Campus Ambassador: No committee/country/department/designation needed

        if (metadataEntries.length > 0) {
          await (supabase as any).from('certificate_metadata').insert(metadataEntries)
        }

        // Prepare sheet update
        results.sheetUpdates.push({
          searchColumn: 'Participant_Name',
          searchValue: row.Participant_Name,
          data: {
            Unique_ID: certificateId,
            Verification_URL: verificationUrl,
            Date_Issued: dateIssued,
            Verified_Status: 'active',
            Event_Name: eventCode
          }
        })

        results.success.push({
          row: i + 1,
          certificate_id: certificateId,
          participant_name: row.Participant_Name,
          verification_url: verificationUrl
        })

      } catch (error: any) {
        results.errors.push({
          row: i + 1,
          participant_name: row.Participant_Name || 'Unknown',
          error: error.message
        })
      }
    }

    // Batch update the sheet with generated data
    if (results.sheetUpdates.length > 0) {
      const updateResult = await batchUpdateRows(results.sheetUpdates)
      
      // Send Discord notifications
      await notifySyncComplete(
        results.success.length,
        results.errors.length,
        results.success.map((s: any) => ({ participant_name: s.participant_name, certificate_id: s.certificate_id }))
      )
      if (results.errors.length > 0) {
        await notifySyncErrors(results.errors)
      }
      
      return NextResponse.json({
        message: `Sync completed: ${results.success.length} processed, ${results.errors.length} errors`,
        processed: results.success.length,
        sheetUpdated: updateResult.success,
        sheetUpdateFailed: updateResult.failed,
        success: results.success,
        errors: results.errors
      })
    }

    // Send Discord notifications
    await notifySyncComplete(
      results.success.length,
      results.errors.length,
      results.success.map((s: any) => ({ participant_name: s.participant_name, certificate_id: s.certificate_id }))
    )
    if (results.errors.length > 0) {
      await notifySyncErrors(results.errors)
    }

    return NextResponse.json({
      message: `Sync completed: ${results.success.length} processed, ${results.errors.length} errors`,
      processed: results.success.length,
      success: results.success,
      errors: results.errors
    })

  } catch (error: any) {
    await notifyError('Sync Failed', error.message || 'Unknown error')
    return NextResponse.json(
      { error: error.message || 'Failed to sync from sheet' },
      { status: 500 }
    )
  }
}
