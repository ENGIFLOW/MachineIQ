'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin-server'
import { hasActiveSubscription } from '@/lib/database/queries'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Check if user has an active subscription
 * Compares the authenticated user's profile user_id to the subscription user_id
 */
export async function checkSubscription(): Promise<{ hasSubscription: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { hasSubscription: false }
    }

    // Get the user's profile to ensure we're using the correct user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('[checkSubscription] Profile not found for user:', user.id, profileError)
      return { hasSubscription: false, error: 'Profile not found' }
    }

    // Verify profile user_id matches auth user_id
    const profileUserId = profile.id
    if (profileUserId !== user.id) {
      console.error('[checkSubscription] Profile user_id mismatch:', {
        authUserId: user.id,
        profileUserId: profileUserId,
      })
      return { hasSubscription: false, error: 'User ID mismatch' }
    }

    console.log('[checkSubscription] Checking subscription for profile user_id:', profileUserId)

    // Check subscription status from database
    // This compares profile.user_id to subscription.user_id
    const isActive = await hasActiveSubscription(profileUserId)

    return { hasSubscription: isActive }
  } catch (error) {
    console.error('Error checking subscription:', error)
    return { hasSubscription: false, error: 'Failed to check subscription' }
  }
}

/**
 * Sync subscription status from Stripe to Supabase
 * Called when user logs in or creates account to ensure subscription is up-to-date
 * 
 * Handles cases where:
 * - User paid with the same email (finds by email)
 * - User paid with different email but through our checkout (finds by user_id in metadata)
 * - User paid directly on Stripe with different email before account creation (won't find - requires manual linking)
 */
export async function syncSubscriptionFromStripe(userId: string, userEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[syncSubscriptionFromStripe] Starting sync for user:', userId, userEmail)
    
    const supabase = createAdminClient()

    // Strategy 1: Find Stripe customer by email
    let customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    })

    let customer = customers.data.length > 0 ? customers.data[0] : null

    // Strategy 2: If not found by email, search by user_id in metadata
    // This handles cases where user paid with a different email
    if (!customer) {
      console.log('[syncSubscriptionFromStripe] No customer found by email, searching by user_id in metadata...')
      
      // Search through customers to find one with matching user_id
      // Note: Stripe doesn't support filtering by metadata directly, so we need to search
      const allCustomers = await stripe.customers.list({
        limit: 100, // Adjust if you have more customers
      })

      customer = allCustomers.data.find(
        (c) => c.metadata?.user_id === userId
      ) || null

      if (customer) {
        console.log('[syncSubscriptionFromStripe] Found customer by user_id metadata:', customer.id, 'email:', customer.email)
      } else {
        console.log('[syncSubscriptionFromStripe] No Stripe customer found by email or user_id')
        return { success: true } // Not an error - user just doesn't have a subscription yet
      }
    } else {
      console.log('[syncSubscriptionFromStripe] Found customer by email:', customer.id)
    }
    
    // Update customer metadata if user_id is missing or different
    if (customer.metadata?.user_id !== userId) {
      await stripe.customers.update(customer.id, {
        metadata: {
          user_id: userId,
          ...customer.metadata, // Preserve other metadata
        },
      })
      console.log('[syncSubscriptionFromStripe] Updated customer metadata with user_id')
    }

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all', // Get all statuses to sync properly
      limit: 100,
    })

    if (subscriptions.data.length === 0) {
      console.log('[syncSubscriptionFromStripe] No subscriptions found for customer:', customer.id)
      return { success: true } // Not an error - user just doesn't have a subscription
    }

    // Sync each subscription (usually just one, but handle multiple)
    for (const subscription of subscriptions.data) {
      const periodStart = (subscription as any).current_period_start || 0
      const periodEnd = (subscription as any).current_period_end || 0
      
      // Map Stripe status to our database status
      let status: 'active' | 'cancelled' | 'past_due' | 'paused' = 'active'
      if (subscription.status === 'active') {
        status = 'active'
      } else if (subscription.status === 'canceled') {
        status = 'cancelled'
      } else if (subscription.status === 'past_due') {
        status = 'past_due'
      } else {
        status = 'paused'
      }

      // Check if subscription already exists
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', subscription.id)
        .maybeSingle()

      const subscriptionData = {
        user_id: userId,
        stripe_customer_id: customer.id,
        stripe_subscription_id: subscription.id,
        status,
        current_period_start: new Date(periodStart * 1000).toISOString(),
        current_period_end: new Date(periodEnd * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end || false,
      }

      let result
      if (existingSub) {
        // Update existing subscription
        console.log('[syncSubscriptionFromStripe] Updating existing subscription:', subscription.id)
        result = await supabase
          .from('subscriptions')
          .update(subscriptionData)
          .eq('stripe_subscription_id', subscription.id)
      } else {
        // Insert new subscription
        console.log('[syncSubscriptionFromStripe] Creating new subscription:', subscription.id)
        result = await supabase
          .from('subscriptions')
          .insert(subscriptionData)
      }

      if (result.error) {
        console.error('[syncSubscriptionFromStripe] Error syncing subscription:', {
          error: result.error,
          subscriptionId: subscription.id,
          userId,
        })
        return { success: false, error: `Failed to sync subscription: ${result.error.message}` }
      } else {
        console.log('[syncSubscriptionFromStripe] ✅ Successfully synced subscription:', {
          subscriptionId: subscription.id,
          userId,
          status,
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[syncSubscriptionFromStripe] Exception:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error syncing subscription' 
    }
  }
}

