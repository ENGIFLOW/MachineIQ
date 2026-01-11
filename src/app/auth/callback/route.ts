import { createClient } from '@/lib/supabase/server'
import { createProfileAdmin } from '@/lib/actions/profile'
import { syncSubscriptionFromStripe } from '@/lib/actions/subscription'
import { createAdminClient } from '@/lib/supabase/admin-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/lessons'
  const type = requestUrl.searchParams.get('type') // 'recovery' for password reset

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if account is deleted
      const adminClient = createAdminClient()
      const { data: profile, error: profileCheckError } = await adminClient
        .from('profiles')
        .select('id, deleted_at')
        .eq('id', data.user.id)
        .single()

      if (profile && profile.deleted_at) {
        // Account is deleted - sign out and redirect to sign in with error
        await supabase.auth.signOut()
        return NextResponse.redirect(
          new URL('/auth/sign-in?error=account_deleted', requestUrl.origin)
        )
      }

      // If this is a password reset flow, add a flag to the redirect URL
      if (type === 'recovery' || next.includes('/auth/reset')) {
        const redirectUrl = new URL(next, requestUrl.origin)
        redirectUrl.searchParams.set('from', 'reset')
        return NextResponse.redirect(redirectUrl)
      }

      // Ensure profile exists (in case trigger didn't fire)
      const { error: profileError } = await createProfileAdmin(
        data.user.id,
        data.user.email || '',
        data.user.user_metadata?.full_name
      )
      
      if (profileError) {
        console.error('Error creating profile:', profileError)
        // Continue anyway - profile might already exist
      }

      // Sync subscription status from Stripe
      if (data.user.email) {
        const { error: syncError } = await syncSubscriptionFromStripe(
          data.user.id,
          data.user.email
        )
        
        if (syncError) {
          console.error('Error syncing subscription:', syncError)
          // Continue anyway - subscription sync is not critical for login
        } else {
          console.log('✅ Subscription synced successfully for user:', data.user.id)
        }
      }
      
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(new URL('/auth/sign-in?error=auth_callback_error', requestUrl.origin))
}

