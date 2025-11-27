import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { Database } from '@/types/database'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyLogin } from '@/lib/utils/discord'

type UserData = Database['public']['Tables']['users']['Row']

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const pendingCookies: {
      name: string
      value: string
      options: Parameters<NextResponse['cookies']['set']>[2]
    }[] = []

    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              pendingCookies.push({ name, value, options })
            })
          },
        },
      }
    )

    const { email, password } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      await notifyLogin(email, false)
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      )
    }
    
    // Check if user account is approved and is admin
    const adminSupabase = createAdminClient()

    const { data: userData, error: userError } = await adminSupabase
      .from('users')
      .select('account_status, role')
      .eq('id', data.user.id)
      .single() as { data: Pick<UserData, 'account_status' | 'role'> | null, error: any }

    if (userError || !userData) {
      await supabase.auth.signOut()
      return NextResponse.json(
        { error: 'User account not found. Please contact a super admin.' },
        { status: 403 }
      )
    }
    
    if (userData.account_status !== 'approved') {
      await supabase.auth.signOut()
      const statusMessage = userData.account_status === 'pending_approval' 
        ? 'Your account is pending approval. Please wait for a super admin to approve your account.'
        : 'Your account has been rejected. Please contact a super admin.'
      return NextResponse.json(
        { error: statusMessage },
        { status: 403 }
      )
    }

    // All roles (super_admin, admin, mod) can access the portal
    // Role-based restrictions are handled in the UI
    
    // Notify Discord of successful login
    await notifyLogin(data.user.email || email, true)

    const response = NextResponse.json({
      user: {
        id: data.user.id,
        email: data.user.email,
        role: userData.role,
        account_status: userData.account_status
      }
    })

    pendingCookies.forEach(({ name, value, options }) => {
      response.cookies.set(name, value, options)
    })

    response.cookies.set('igac-role', userData.role, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    response.cookies.set('igac-status', userData.account_status, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to login' },
      { status: 500 }
    )
  }
}
