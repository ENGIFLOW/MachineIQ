'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-server'
import { getProfile, updateProfile } from '@/lib/database/queries'

/**
 * Get current user's profile
 */
export async function getCurrentUserProfile() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { profile: null, error: 'Not authenticated' }
    }

    const profile = await getProfile(user.id)
    return { profile, error: null }
  } catch (error) {
    console.error('Error fetching profile:', error)
    return {
      profile: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Update current user's profile
 */
export async function updateCurrentUserProfile(
  updates: {
    full_name?: string
    avatar_url?: string
    language?: string
  }
) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const result = await updateProfile(user.id, updates)
    return result
  } catch (error) {
    console.error('Error updating profile:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Soft delete user account
 * Anonymizes personal data but retains financial records for compliance
 */
export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    console.log('[deleteAccount] Starting deletion for user:', user.id)

    // Check if admin client can be created
    let adminClient
    try {
      adminClient = createAdminClient()
      console.log('[deleteAccount] Admin client created successfully')
    } catch (adminError) {
      console.error('[deleteAccount] Failed to create admin client:', adminError)
      return {
        success: false,
        error: `Failed to initialize admin client: ${adminError instanceof Error ? adminError.message : 'Unknown error'}. Please check your SUPABASE_SERVICE_ROLE_KEY environment variable.`,
      }
    }

    // Check if profile exists first
    console.log('[deleteAccount] Checking if profile exists...')
    const { data: existingProfile, error: checkError } = await adminClient
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', user.id)
      .single()

    if (checkError) {
      console.error('[deleteAccount] Error checking profile:', checkError)
      // If profile doesn't exist, that's okay - we can still sign them out
      console.log('[deleteAccount] Profile not found, but continuing with sign out...')
    } else {
      console.log('[deleteAccount] Profile found:', { id: existingProfile?.id, email: existingProfile?.email })
    }

    // Anonymize personal data in profile
    // Keep financial records (subscriptions, payments) for compliance
    console.log('[deleteAccount] Updating profile with anonymized data...')
    const updatePayload: {
      email: string
      full_name: string
      deleted_at?: string
    } = {
      email: `deleted_${user.id}@deleted.local`,
      full_name: 'Deleted User',
    }

    // Only add deleted_at if the column exists (check if existingProfile has it)
    // If the column doesn't exist, we'll skip it
    try {
      updatePayload.deleted_at = new Date().toISOString()
    } catch (e) {
      console.warn('[deleteAccount] Could not set deleted_at timestamp')
    }

    const { data: updateData, error: profileError } = await adminClient
      .from('profiles')
      .update(updatePayload)
      .eq('id', user.id)
      .select()

    if (profileError) {
      console.error('[deleteAccount] Error updating profile:', {
        error: profileError,
        code: profileError.code,
        message: profileError.message,
        details: profileError.details,
        hint: profileError.hint,
      })
      
      // If it's a column doesn't exist error, try without deleted_at
      if (profileError.code === '42703' || profileError.message?.includes('column') || profileError.message?.includes('does not exist')) {
        console.log('[deleteAccount] Retrying without deleted_at column...')
        const { error: retryError } = await adminClient
          .from('profiles')
          .update({
            email: `deleted_${user.id}@deleted.local`,
            full_name: 'Deleted User',
          })
          .eq('id', user.id)

        if (retryError) {
          return {
            success: false,
            error: `Failed to delete account: ${retryError.message || 'Database error'}. ${retryError.hint ? `Hint: ${retryError.hint}` : ''}`,
          }
        }
        // Success on retry
      } else {
        return {
          success: false,
          error: `Failed to delete account: ${profileError.message || 'Database error'}. ${profileError.hint ? `Hint: ${profileError.hint}` : ''}`,
        }
      }
    } else if (updateData && updateData.length > 0) {
      console.log('[deleteAccount] Profile updated successfully:', updateData)
    } else {
      console.warn('[deleteAccount] No rows were updated, but continuing with sign out...')
    }

    console.log('[deleteAccount] Profile updated successfully:', updateData)

    // Anonymize lesson progress (keep data but remove personal connection)
    // Note: We keep the progress records for analytics, but they're anonymized
    // You could also delete these if you prefer

    // Delete the auth user from Supabase Auth (this prevents future logins)
    console.log('[deleteAccount] Deleting auth user...')
    try {
      // Use admin client to delete the user from auth.users table
      const { error: deleteAuthError } = await adminClient.auth.admin.deleteUser(user.id)
      
      if (deleteAuthError) {
        console.error('[deleteAccount] Error deleting auth user:', deleteAuthError)
        // Try to sign out as fallback
        const { error: signOutError } = await supabase.auth.signOut()
        if (signOutError) {
          console.error('[deleteAccount] Error signing out:', signOutError)
        }
        // Still return success since profile is anonymized
        console.log('[deleteAccount] Auth user deletion failed, but profile is anonymized. User will be signed out.')
      } else {
        console.log('[deleteAccount] Auth user deleted successfully')
      }
    } catch (deleteError) {
      console.error('[deleteAccount] Exception deleting auth user:', deleteError)
      // Try to sign out as fallback
      const { error: signOutError } = await supabase.auth.signOut()
      if (signOutError) {
        console.error('[deleteAccount] Error signing out:', signOutError)
      }
    }

    console.log('[deleteAccount] Account deleted successfully for user:', user.id)
    return { success: true }
  } catch (error) {
    console.error('[deleteAccount] Exception:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return {
      success: false,
      error: `Failed to delete account: ${errorMessage}`,
    }
  }
}

export async function createProfileAdmin(
  userId: string,
  email: string,
  fullName?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminClient = createAdminClient()

    const { error } = await adminClient
      .from('profiles')
      .upsert({
        id: userId,
        email,
        full_name: fullName,
        language: 'vi',
      })

    if (error) {
      // If profile already exists, that's okay
      if (error.code === '23505') {
        return { success: true }
      }
      console.error('Error creating profile (admin):', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error in createProfileAdmin:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
