/**
 * Database query functions for Supabase
 * These functions provide type-safe database access
 */

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-server'
import type {
  Profile,
  Course,
  Module,
  Lesson,
  Subscription,
  SubscriptionPayment,
  LessonProgress,
  Resource,
  VideoView,
  SubscriptionStatus,
} from './types'

// ============================================
// PROFILE QUERIES
// ============================================

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'language'>>
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)

  if (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// COURSE QUERIES
// ============================================

/**
 * Get all published courses
 */
export async function getCourses(): Promise<Course[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_published', true)
    .order('order_index', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return []
  }

  return data || []
}

/**
 * Get course by slug
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Error fetching course:', error)
    return null
  }

  return data
}

/**
 * Get course by ID
 */
export async function getCourseById(courseId: string): Promise<Course | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .eq('is_published', true)
    .single()

  if (error) {
    console.error('Error fetching course:', error)
    return null
  }

  return data
}

// ============================================
// MODULE QUERIES
// ============================================

/**
 * Get modules for a course
 * Uses admin client to bypass RLS for server-side queries
 */
export async function getModules(courseId: string): Promise<Module[]> {
  try {
    // Use admin client directly for server-side queries to bypass RLS
    const { createAdminClient } = await import('@/lib/supabase/admin-server')
    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (clientError) {
      console.error('[getModules] Failed to create admin client:', clientError)
      // Fallback to regular client
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('order_index', { ascending: true })
      
      if (error) {
        console.error('[getModules] Error with regular client:', error)
        return []
      }
      return data || []
    }

    const { data, error } = await adminClient
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[getModules] Error fetching modules:', error)
      console.error('[getModules] Course ID:', courseId)
      console.error('[getModules] Error code:', error.code)
      console.error('[getModules] Error message:', error.message)
      return []
    }

    console.log(`[getModules] Found ${data?.length || 0} modules for course ${courseId}`)
    return data || []
  } catch (error) {
    console.error('[getModules] Exception:', error)
    return []
  }
}

// ============================================
// LESSON QUERIES
// ============================================

/**
 * Get lessons for a module
 * Uses admin client to bypass RLS for server-side queries
 * This allows us to fetch all lessons and filter by preview/subscription on the client
 */
export async function getLessons(moduleId: string): Promise<Lesson[]> {
  try {
    // Use admin client directly for server-side queries to bypass RLS
    // We'll filter by preview/subscription on the client side
    let adminClient
    try {
      adminClient = createAdminClient()
    } catch (clientError) {
      console.error('[getLessons] Failed to create admin client:', clientError)
      // Fallback to regular client
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('order_index', { ascending: true })
      
      if (error) {
        console.error('[getLessons] Error with regular client:', error)
        return []
      }
      return data || []
    }

    const { data, error } = await adminClient
      .from('lessons')
      .select('*')
      .eq('module_id', moduleId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('[getLessons] Error fetching lessons:', error)
      console.error('[getLessons] Module ID:', moduleId)
      console.error('[getLessons] Error code:', error.code)
      console.error('[getLessons] Error message:', error.message)
      return []
    }

    console.log(`[getLessons] Found ${data?.length || 0} lessons for module ${moduleId}`)
    if (data && data.length > 0) {
      console.log(`[getLessons] Sample lesson IDs:`, data.slice(0, 3).map(l => l.id))
      console.log(`[getLessons] Sample lesson titles:`, data.slice(0, 3).map(l => l.title_vi || l.title_en))
    } else {
      console.warn(`[getLessons] ⚠️  No lessons found for module ${moduleId}. Checking if module exists...`)
      // Verify module exists and check total lessons in DB
      const { data: moduleCheck } = await adminClient
        .from('modules')
        .select('id, title_vi, title_en')
        .eq('id', moduleId)
        .single()
      console.log(`[getLessons] Module check:`, moduleCheck ? `Found module "${moduleCheck.title_vi || moduleCheck.title_en}"` : 'Module not found')
      
      // Check total lessons count for this module
      const { count } = await adminClient
        .from('lessons')
        .select('*', { count: 'exact', head: true })
        .eq('module_id', moduleId)
      console.log(`[getLessons] Total lessons in DB for module ${moduleId}:`, count)
    }
    return data || []
  } catch (err) {
    console.error('[getLessons] Exception:', err)
    if (err instanceof Error) {
      console.error('[getLessons] Exception message:', err.message)
      console.error('[getLessons] Exception stack:', err.stack)
    }
    return []
  }
}

/**
 * Get lesson by ID
 */
export async function getLessonById(lessonId: string): Promise<Lesson | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single()

  if (error) {
    console.error('Error fetching lesson:', error)
    return null
  }

  return data
}

// ============================================
// SUBSCRIPTION QUERIES
// ============================================

/**
 * Check if user has active subscription
 * Compares profile user_id to subscription user_id
 * Only returns true if status is 'active' (excludes 'past_due', 'cancelled', 'paused')
 * 
 * @param userId - The profile user_id (from public.profiles.id) to check
 * @returns true if an active subscription exists where subscription.user_id = profile.user_id
 */
export async function hasActiveSubscription(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    
    // First, verify the profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('[hasActiveSubscription] Error checking profile:', profileError)
      return false
    }

    if (!profile) {
      console.warn('[hasActiveSubscription] Profile not found for user_id:', userId)
      return false
    }

    console.log('[hasActiveSubscription] Checking subscription for profile user_id:', profile.id)
    
    // Try RPC function first (if it exists)
    // This compares profile.user_id to subscription.user_id
    const { data: rpcData, error: rpcError } = await supabase.rpc('has_active_subscription', {
      user_uuid: profile.id, // Use profile.id to ensure we're comparing profile user_id
    })

    if (!rpcError && rpcData === true) {
      console.log('[hasActiveSubscription] Active subscription found via RPC for profile user_id:', profile.id)
      return true
    }

    // Fallback: Direct query to subscriptions table
    // Compare profile.user_id to subscription.user_id
    // Only check for 'active' status (exclude 'past_due', 'cancelled', 'paused')
    // First, get subscription without period check to see what we have
    const { data: subscriptionData, error: subError } = await supabase
      .from('subscriptions')
      .select('id, user_id, status, current_period_start, current_period_end, created_at')
      .eq('user_id', profile.id) // Compare subscription.user_id to profile.user_id
      .eq('status', 'active')
      .maybeSingle()

    if (subError) {
      // If RPC also failed, log both errors
      if (rpcError) {
        console.error('[hasActiveSubscription] RPC error:', rpcError)
      }
      console.error('[hasActiveSubscription] Direct query error:', subError)
      return false
    }

    if (subscriptionData) {
      // Check if the period dates are valid (not epoch dates)
      const periodEnd = new Date(subscriptionData.current_period_end)
      const epochDate = new Date('1970-01-01T00:00:00.000Z')
      const isValidPeriodEnd = periodEnd.getTime() > epochDate.getTime() + 1000 // At least 1 second after epoch
      
      // Calculate effective period end:
      // - If current_period_end is valid, use it
      // - Otherwise, use created_at + 1 month as the end date
      let effectivePeriodEnd: Date
      if (isValidPeriodEnd) {
        effectivePeriodEnd = periodEnd
      } else {
        // Use created_at as start, add 1 month for end
        const createdAt = new Date(subscriptionData.created_at)
        effectivePeriodEnd = new Date(createdAt)
        effectivePeriodEnd.setMonth(effectivePeriodEnd.getMonth() + 1)
      }

      // Check if subscription period hasn't expired
      const now = new Date()
      const isNotExpired = effectivePeriodEnd > now

      console.log('[hasActiveSubscription] Subscription found:', {
        subscriptionId: subscriptionData.id,
        subscriptionUserId: subscriptionData.user_id,
        profileUserId: profile.id,
        match: subscriptionData.user_id === profile.id,
        status: subscriptionData.status,
        currentPeriodStart: subscriptionData.current_period_start,
        currentPeriodEnd: subscriptionData.current_period_end,
        createdAt: subscriptionData.created_at,
        isValidPeriodEnd: isValidPeriodEnd,
        effectivePeriodEnd: effectivePeriodEnd.toISOString(),
        isNotExpired: isNotExpired,
        now: now.toISOString(),
      })

      // Verify the user_id matches
      if (subscriptionData.user_id !== profile.id) {
        console.error('[hasActiveSubscription] User ID mismatch:', {
          subscriptionUserId: subscriptionData.user_id,
          profileUserId: profile.id,
        })
        return false
      }

      // Return true if subscription is active and period hasn't expired
      if (isNotExpired) {
        return true
      } else {
        console.warn('[hasActiveSubscription] Subscription found but period has expired:', {
          subscriptionId: subscriptionData.id,
          effectivePeriodEnd: effectivePeriodEnd.toISOString(),
          now: now.toISOString(),
        })
        return false
      }
    }

    // No active subscription found
    console.log('[hasActiveSubscription] No active subscription found for profile user_id:', profile.id)
    return false
  } catch (error) {
    console.error('[hasActiveSubscription] Exception:', error)
    return false
  }
}

/**
 * Get subscription status for user
 */
export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_subscription_status', {
    user_uuid: userId,
  })

  if (error) {
    console.error('Error fetching subscription status:', error)
    return null
  }

  return data?.[0] || null
}

/**
 * Get user's subscription
 * Compares profile user_id to subscription user_id
 * 
 * @param userId - The profile user_id (from public.profiles.id)
 * @returns Subscription where subscription.user_id = profile.user_id
 */
export async function getUserSubscription(
  userId: string
): Promise<Subscription | null> {
  try {
    const supabase = await createClient()
    
    // First, verify the profile exists
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) {
      console.error('[getUserSubscription] Error checking profile:', profileError)
      return null
    }

    if (!profile) {
      console.warn('[getUserSubscription] Profile not found for user_id:', userId)
      return null
    }

    // Query subscription comparing profile.user_id to subscription.user_id
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile.id) // Compare subscription.user_id to profile.user_id
      .eq('status', 'active')
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No subscription found
        console.log('[getUserSubscription] No active subscription found for profile user_id:', profile.id)
        return null
      }
      console.error('[getUserSubscription] Error fetching subscription:', error)
      return null
    }

    // Verify the user_id matches
    if (data && data.user_id !== profile.id) {
      console.error('[getUserSubscription] User ID mismatch:', {
        subscriptionUserId: data.user_id,
        profileUserId: profile.id,
      })
      return null
    }

    console.log('[getUserSubscription] Found subscription:', {
      subscriptionId: data?.id,
      subscriptionUserId: data?.user_id,
      profileUserId: profile.id,
      match: data?.user_id === profile.id,
    })

    return data
  } catch (error) {
    console.error('[getUserSubscription] Exception:', error)
    return null
  }
}

/**
 * Get subscription payments for user
 */
export async function getSubscriptionPayments(
  userId: string
): Promise<SubscriptionPayment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('subscription_payments')
    .select('*')
    .eq('user_id', userId)
    .order('paid_at', { ascending: false })

  if (error) {
    console.error('Error fetching payments:', error)
    return []
  }

  return data || []
}

/**
 * Get subscription by Stripe customer ID
 * Useful for webhooks and syncing when we have the Stripe customer ID
 */
export async function getSubscriptionByStripeCustomerId(
  stripeCustomerId: string
): Promise<Subscription | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_subscription_by_stripe_customer_id', {
      stripe_cust_id: stripeCustomerId,
    })

    if (error) {
      console.error('[getSubscriptionByStripeCustomerId] Error:', error)
      return null
    }

    // Return the most recent subscription (first in the array)
    return (data && data.length > 0) ? (data[0] as Subscription) : null
  } catch (error) {
    console.error('[getSubscriptionByStripeCustomerId] Exception:', error)
    return null
  }
}

/**
 * Get subscription by Stripe subscription ID
 * Useful for webhooks when we receive a Stripe subscription ID
 */
export async function getSubscriptionByStripeSubscriptionId(
  stripeSubscriptionId: string
): Promise<Subscription | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_subscription_by_stripe_subscription_id', {
      stripe_sub_id: stripeSubscriptionId,
    })

    if (error) {
      console.error('[getSubscriptionByStripeSubscriptionId] Error:', error)
      return null
    }

    return (data && data.length > 0) ? (data[0] as Subscription) : null
  } catch (error) {
    console.error('[getSubscriptionByStripeSubscriptionId] Exception:', error)
    return null
  }
}

/**
 * Get user ID by Stripe customer ID
 * Useful for finding which Supabase user owns a Stripe customer
 */
export async function getUserIdByStripeCustomerId(
  stripeCustomerId: string
): Promise<string | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('get_user_id_by_stripe_customer_id', {
      stripe_cust_id: stripeCustomerId,
    })

    if (error) {
      console.error('[getUserIdByStripeCustomerId] Error:', error)
      return null
    }

    return data || null
  } catch (error) {
    console.error('[getUserIdByStripeCustomerId] Exception:', error)
    return null
  }
}

// ============================================
// LESSON PROGRESS QUERIES
// ============================================

/**
 * Get lesson progress for user
 */
export async function getLessonProgress(
  userId: string,
  lessonId: string
): Promise<LessonProgress | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No progress found
      return null
    }
    console.error('Error fetching lesson progress:', error)
    return null
  }

  return data
}

/**
 * Get all lesson progress for user
 */
export async function getAllLessonProgress(
  userId: string
): Promise<LessonProgress[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('lesson_progress')
    .select('*')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching lesson progress:', error)
    return []
  }

  return data || []
}

/**
 * Update or create lesson progress
 */
export async function upsertLessonProgress(
  userId: string,
  lessonId: string,
  progress: {
    progress_seconds?: number
    completed?: boolean
  }
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('lesson_progress')
    .upsert({
      user_id: userId,
      lesson_id: lessonId,
      progress_seconds: progress.progress_seconds ?? 0,
      completed: progress.completed ?? false,
      last_watched_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Error updating lesson progress:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

// ============================================
// RESOURCE QUERIES
// ============================================

/**
 * Get resources for a lesson
 */
export async function getLessonResources(lessonId: string): Promise<Resource[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching resources:', error)
    return []
  }

  return data || []
}

// ============================================
// VIDEO VIEWS QUERIES
// ============================================

/**
 * Record a video view
 */
export async function recordVideoView(
  userId: string,
  lessonId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase.from('video_views').insert({
    user_id: userId,
    lesson_id: lessonId,
    viewed_at: new Date().toISOString(),
  })

  if (error) {
    console.error('Error recording video view:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

