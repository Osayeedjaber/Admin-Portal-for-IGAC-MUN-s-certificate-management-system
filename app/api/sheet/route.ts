import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/utils/auth'
import { getAllRows } from '@/lib/utils/sheetdb'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rows = await getAllRows()
    
    // Count stats
    const total = rows.length
    const processed = rows.filter(r => r.Unique_ID && r.Unique_ID.trim() !== '').length
    const pending = total - processed
    
    // Group by cert type
    const byType: Record<string, number> = {}
    for (const row of rows) {
      const type = row.Cert_Type || 'Unknown'
      byType[type] = (byType[type] || 0) + 1
    }

    return NextResponse.json({
      total,
      processed,
      pending,
      byType,
      rows
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sheet data' },
      { status: 500 }
    )
  }
}
