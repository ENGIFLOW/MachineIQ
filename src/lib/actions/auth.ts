'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Server action to check if a user exists in Supabase auth
 * Uses admin API to safely check without creating accounts
 */
export async function checkUserExists(email: string): Promise<{ exists: boolean; error?: string }> {
  try {
    if (!email || typeof email !== 'string') {
      return { exists: false, error: 'Valid email is required' }
    }

    // Normalize email (lowercase, trim)
    const normalizedEmail = email.toLowerCase().trim()

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      return { exists: false, error: 'Invalid email format' }
    }

    const adminClient = createAdminClient()
    
    // Use admin API to list users and check if email exists
    // We can optimize by limiting the page size and using pagination if needed
    // For now, we'll list users and filter client-side
    // Note: For large user bases, you might want to implement pagination
    const { data: users, error } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1000, // Adjust based on your needs
    })
    
    if (error) {
      console.error('Error listing users:', error)
      return { exists: false, error: 'Failed to check user existence' }
    }

    // Check if any user has this email (case-insensitive)
    const userExists = users?.users?.some((user) => 
      user.email?.toLowerCase().trim() === normalizedEmail
    ) ?? false

    return { exists: userExists }
  } catch (error) {
    console.error('Error in checkUserExists:', error)
    
    // If admin client fails (e.g., missing service role key), return error
    if (error instanceof Error && error.message.includes('Missing Supabase admin credentials')) {
      return { exists: false, error: 'Server configuration error. Please contact support.' }
    }
    
    return { exists: false, error: 'Failed to check user existence' }
  }
}
