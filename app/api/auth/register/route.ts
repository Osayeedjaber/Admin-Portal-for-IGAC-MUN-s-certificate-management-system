import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notifyNewRegistration } from '@/lib/utils/discord'

// Secret signup code - only people with this code can register
const SIGNUP_CODE = 'igac5889@'

export async function POST(request: NextRequest) {
  try {
    const { email, password, signupCode } = await request.json()
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate signup code
    if (!signupCode || signupCode !== SIGNUP_CODE) {
      return NextResponse.json(
        { error: 'Invalid signup code. Please contact a super admin for the correct code.' },
        { status: 403 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Check if user already exists in users table
    const { data: existingUser } = await (supabase as any)
      .from('users')
      .select('id, account_status')
      .eq('email', email)
      .single()

    if (existingUser) {
      if (existingUser.account_status === 'pending_approval') {
        return NextResponse.json(
          { error: 'An account with this email is already pending approval. Please wait for a super admin to approve it.' },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { error: 'An account with this email already exists. Please use the login page.' },
        { status: 400 }
      )
    }

    // Check if user exists in Supabase Auth but not in users table (orphaned auth account)
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = authUsers?.users?.find(u => u.email === email)
    
    if (existingAuthUser) {
      // Auth user exists but no users table entry - create the users table entry
      const { error: userError } = await (supabase as any)
        .from('users')
        .upsert({
          id: existingAuthUser.id,
          email: email,
          role: 'admin',
          account_status: 'pending_approval',
        }, { onConflict: 'id' })

      if (userError) {
        console.error('User insert error for existing auth user:', userError)
        return NextResponse.json(
          { error: 'An account with this email already exists. Please contact a super admin.' },
          { status: 400 }
        )
      }

      // Notify Discord about new registration
      try {
        await notifyNewRegistration(email, email.split('@')[0])
      } catch {
        // Discord notification failure is not critical
      }

      return NextResponse.json({
        success: true,
        message: 'Account linked successfully. Please wait for admin approval before logging in.',
      })
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin registrations
    })

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      )
    }

    // Create user record in users table with pending status
    // Role will be assigned by super_admin during approval
    // Using upsert to handle edge case where user exists in auth but not in users table
    const { error: userError } = await (supabase as any)
      .from('users')
      .upsert({
        id: authData.user.id,
        email: email,
        role: 'admin', // Default, super_admin can change during approval
        account_status: 'pending_approval', // Correct status value
      }, { onConflict: 'id' })

    if (userError) {
      console.error('User insert error:', userError)
      // Rollback: delete the auth user if DB insert fails
      await supabase.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: `Failed to create user profile: ${userError.message}` },
        { status: 500 }
      )
    }

    // Notify Discord about new registration
    try {
      await notifyNewRegistration(email, email.split('@')[0])
    } catch {
      // Discord notification failure is not critical
    }

    return NextResponse.json({
      success: true,
      message: 'Account created successfully. Please wait for admin approval before logging in.',
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to register' },
      { status: 500 }
    )
  }
}
