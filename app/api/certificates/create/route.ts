import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/utils/auth'
import { addRow } from '@/lib/utils/sheetdb'
import { 
  generateCertificateId, 
  generateVerificationUrl, 
  getTodayDate, 
  getDefaultEventName,
  validateCertificateFields,
  requiresCommitteeAndCountry,
  requiresDepartmentAndDesignation,
  requiresCommitteeAndPosition
} from '@/lib/utils/certificates'
import { notifyCertificateCreated, notifyError } from '@/lib/utils/discord'

export async function POST(request: NextRequest) {
  let participantName = 'Unknown';
  
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      cert_type,
      participant_name,
      email,
      institution,
      award_type,
      committee,
      country,
      position, // For Executive Board: Chairperson, Vice Chair, Rapporteur, etc.
      department,
      designation,
      add_to_sheet
    } = body
    
    participantName = participant_name || 'Unknown';

    // Validate
    const validation = validateCertificateFields(cert_type, {
      participant_name,
      email,
      institution,
      award_type,
      committee,
      country
    })

    if (!validation.valid) {
      return NextResponse.json(
        { error: `Missing required fields: ${validation.missingFields.join(', ')}` },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const eventCode = getDefaultEventName()

    // Get event
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, event_code, year')
      .eq('event_code', eventCode)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: `Event "${eventCode}" not found` },
        { status: 404 }
      )
    }

    // Generate unique ID
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

    // Insert certificate - award_type IS the certificate name that shows on the certificate
    const certificateDisplayName = award_type?.trim() || cert_type
    
    const { data: certificate, error: certError } = await (supabase as any)
      .from('certificates')
      .insert({
        certificate_id: certificateId,
        event_id: (event as any).id,
        certificate_type: certificateDisplayName, // This is the AWARD NAME, not category
        participant_name,
        school: institution,
        date_issued: dateIssued,
        qr_code_data: verificationUrl,
        created_by: user.id
      })
      .select()
      .single()

    if (certError) {
      return NextResponse.json({ error: certError.message }, { status: 500 })
    }

    // Insert metadata
    const metadataEntries = []
    
    // Always store the category (cert_type)
    if (cert_type) {
      metadataEntries.push({
        certificate_id: certificate.id,
        field_name: 'cert_type',
        field_value: cert_type,
        field_type: 'text'
      })
    }
    
    if (email) {
      metadataEntries.push({
        certificate_id: certificate.id,
        field_name: 'email',
        field_value: email,
        field_type: 'text'
      })
    }
    
    // For Delegates: Committee and Country
    if (requiresCommitteeAndCountry(cert_type)) {
      if (committee) {
        metadataEntries.push({
          certificate_id: certificate.id,
          field_name: 'committee',
          field_value: committee,
          field_type: 'text'
        })
      }
      if (country) {
        metadataEntries.push({
          certificate_id: certificate.id,
          field_name: 'country',
          field_value: country,
          field_type: 'text'
        })
      }
    }
    
    // For Secretariat: Department and Designation
    if (requiresDepartmentAndDesignation(cert_type)) {
      if (department) {
        metadataEntries.push({
          certificate_id: certificate.id,
          field_name: 'department',
          field_value: department,
          field_type: 'text'
        })
      }
      if (designation) {
        metadataEntries.push({
          certificate_id: certificate.id,
          field_name: 'designation',
          field_value: designation,
          field_type: 'text'
        })
      }
    }
    
    // For Executive Board: Committee and Position
    if (requiresCommitteeAndPosition(cert_type)) {
      if (committee) {
        metadataEntries.push({
          certificate_id: certificate.id,
          field_name: 'committee',
          field_value: committee,
          field_type: 'text'
        })
      }
      if (position) {
        metadataEntries.push({
          certificate_id: certificate.id,
          field_name: 'position',
          field_value: position,
          field_type: 'text'
        })
      }
    }

    if (metadataEntries.length > 0) {
      await (supabase as any).from('certificate_metadata').insert(metadataEntries)
    }

    // Optionally add to sheet
    if (add_to_sheet) {
      try {
        // Default: use committee and country for delegates
        let sheetCommittee = committee || ''
        let sheetCountry = country || ''
        
        // For secretariat: Committee = department, Country = designation
        if (requiresDepartmentAndDesignation(cert_type)) {
          sheetCommittee = department || ''
          sheetCountry = designation || ''
        }
        
        // For Executive Board: Committee = committee, Country = position
        if (requiresCommitteeAndPosition(cert_type)) {
          sheetCommittee = committee || ''
          sheetCountry = position || ''
        }
        
        await addRow({
          Cert_Type: cert_type,
          Unique_ID: certificateId,
          Participant_Name: participant_name,
          Email: email || '',
          institution: institution, // lowercase in sheet
          Verification_URL: verificationUrl,
          Award_Type: award_type || cert_type, // The certificate name
          Committee: sheetCommittee,
          Country: sheetCountry,
          Date_Issued: dateIssued,
          Verified_Status: 'active',
          Event_Name: eventCode
        })
      } catch {
        // Sheet add failure is not critical
      }
    }

    // Notify Discord
    await notifyCertificateCreated(
      certificateId,
      participant_name,
      cert_type,
      user.email || 'Unknown'
    )

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        certificate_id: certificateId,
        participant_name,
        verification_url: verificationUrl
      }
    })

  } catch (error: any) {
    await notifyError('Certificate Creation Failed', error.message || 'Unknown error', {
      participant_name: participantName
    })
    return NextResponse.json(
      { error: error.message || 'Failed to create certificate' },
      { status: 500 }
    )
  }
}
