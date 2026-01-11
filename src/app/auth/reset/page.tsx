import { AuthLayout } from '@/components/auth/AuthLayout'
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; type?: string }>
}) {
  const params = await searchParams
  const code = params.code
  const type = params.type

  const supabase = await createClient()

  // If there's a code parameter (from password reset email), exchange it for a session
  if (code) {
    // Exchange code for session (works for both recovery and other types)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      // Invalid or expired code, redirect to forgot password page
      redirect('/auth/forgot?error=invalid_link')
    }

    if (!data?.user || !data?.session) {
      console.error('No user or session after code exchange:', { user: data?.user, session: data?.session })
      // No user data or session, redirect to forgot password page
      redirect('/auth/forgot?error=invalid_link')
    }

    // Check if account is deleted
    const { createAdminClient } = await import('@/lib/supabase/admin-server')
    const adminClient = createAdminClient()
    const { data: profile } = await adminClient
      .from('profiles')
      .select('id, deleted_at')
      .eq('id', data.user.id)
      .single()

    if (profile && profile.deleted_at) {
      // Account is deleted - sign out and redirect to sign in
      await supabase.auth.signOut()
      redirect('/auth/sign-in?error=account_deleted')
    }


   
  } else {
    // No code parameter - user came through callback route (which already exchanged the code)
    // or direct access - check if user has a valid session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If no session, redirect to forgot password page
    if (!session) {
      redirect('/auth/forgot?error=invalid_link')
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your new password below"
    >
      <ResetPasswordForm />
    </AuthLayout>
  )
}

