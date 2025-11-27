import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/utils/auth'
import { updateRow } from '@/lib/utils/sheetdb'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    const { data: certificate, error } = await (supabase as any)
      .from('certificates')
      .select(`
        *,
        events(event_name, event_code),
        certificate_metadata(field_name, field_value)
      `)
      .eq('id', id)
      .single()

    if (error || !certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    return NextResponse.json({ certificate })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch certificate' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    const {
      participant_name,
      school,
      certificate_type,
      date_issued,
      metadata
    } = body

    // Update main certificate fields
    const { data: certificate, error: updateError } = await (supabase as any)
      .from('certificates')
      .update({
        participant_name,
        school,
        certificate_type,
        date_issued
      })
      .eq('id', id)
      .select('certificate_id')
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Update metadata fields if provided
    if (metadata && typeof metadata === 'object') {
      // Delete existing metadata
      await (supabase as any)
        .from('certificate_metadata')
        .delete()
        .eq('certificate_id', id)

      // Insert new metadata
      const metadataEntries = Object.entries(metadata)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([field_name, field_value]) => ({
          certificate_id: id,
          field_name,
          field_value: String(field_value)
        }))

      if (metadataEntries.length > 0) {
        await (supabase as any)
          .from('certificate_metadata')
          .insert(metadataEntries)
      }
    }

    // Update sheet with new data
    if (certificate?.certificate_id) {
      try {
        // For secretariat, Committee column = department, Country column = designation
        const certType = metadata?.cert_type || ''
        const isSecretariat = certType.toLowerCase().includes('secretariat')
        
        await updateRow('Unique_ID', certificate.certificate_id, {
          Participant_Name: participant_name,
          institution: school, // lowercase in sheet
          Cert_Type: certType, // Category (delegate, secretariat, etc.)
          Award_Type: certificate_type, // The actual certificate name
          Committee: isSecretariat ? (metadata?.department || '') : (metadata?.committee || ''),
          Country: isSecretariat ? (metadata?.designation || '') : (metadata?.country || '')
        })
      } catch {
        // Sheet update failure is not critical
      }
    }

    return NextResponse.json({ success: true, message: 'Certificate updated successfully' })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update certificate' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Get certificate first
    const { data: certData } = await (supabase as any)
      .from('certificates')
      .select('certificate_id, participant_name')
      .eq('id', id)
      .single()
    
    const certificate = certData as { certificate_id: string; participant_name: string } | null

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Delete from Supabase
    const { error } = await (supabase as any)
      .from('certificates')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Update sheet to clear the certificate data
    try {
      await updateRow('Unique_ID', certificate.certificate_id, {
        Unique_ID: '',
        Verification_URL: '',
        Verified_Status: 'deleted'
      })
    } catch {
      // Sheet update failure is not critical
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete certificate' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Handle revoke action
    if (body.action === 'revoke') {
      const { data: certData, error } = await (supabase as any)
        .from('certificates')
        .update({
          status: 'revoked',
          revoked_at: new Date().toISOString(),
          revoked_by: user.id,
          revoked_reason: body.reason || 'Revoked by admin'
        })
        .eq('id', id)
        .select('certificate_id')
        .single()
      
      const certificate = certData as { certificate_id: string } | null

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Update sheet
      if (certificate) {
        try {
          await updateRow('Unique_ID', certificate.certificate_id, {
            Verified_Status: 'revoked'
          })
        } catch {
          // Sheet update failure is not critical
        }
      }

      return NextResponse.json({ success: true, status: 'revoked' })
    }

    // Handle restore action
    if (body.action === 'restore') {
      const { data: certData, error } = await (supabase as any)
        .from('certificates')
        .update({
          status: 'active',
          revoked_at: null,
          revoked_by: null,
          revoked_reason: null
        })
        .eq('id', id)
        .select('certificate_id')
        .single()
      
      const certificate = certData as { certificate_id: string } | null

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      // Update sheet
      if (certificate) {
        try {
          await updateRow('Unique_ID', certificate.certificate_id, {
            Verified_Status: 'active'
          })
        } catch {
          // Sheet update failure is not critical
        }
      }

      return NextResponse.json({ success: true, status: 'active' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to update certificate' },
      { status: 500 }
    )
  }
}
