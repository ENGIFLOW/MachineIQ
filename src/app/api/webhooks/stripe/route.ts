import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Handle the event
  switch (event.type) {
    case 'customer.subscription.created': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      console.log('[Webhook] customer.subscription.created:', {
        subscriptionId: subscription.id,
        customerId,
        status: subscription.status,
      })

      if (!customerId) {
        console.error('[Webhook] Missing customerId in customer.subscription.created')
        break
      }

      // Get customer to find user_id from metadata
      const customer = await stripe.customers.retrieve(customerId)
      
      if (typeof customer === 'object' && !customer.deleted) {
        const userId = customer.metadata?.user_id

        if (!userId) {
          console.error('[Webhook] No user_id found in customer metadata for subscription.created')
          break
        }

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
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status,
          current_period_start: new Date(periodStart * 1000).toISOString(),
          current_period_end: new Date(periodEnd * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        }

        let result
        if (existingSub) {
          // Update existing subscription
          console.log('[Webhook] Updating existing subscription (from created event):', subscription.id)
          result = await supabase
            .from('subscriptions')
            .update(subscriptionData)
            .eq('stripe_subscription_id', subscription.id)
        } else {
          // Insert new subscription
          console.log('[Webhook] Creating new subscription (from created event):', subscription.id)
          result = await supabase
            .from('subscriptions')
            .insert(subscriptionData)
        }

        if (result.error) {
          console.error('[Webhook] Error saving subscription (created event):', {
            error: result.error,
            subscriptionId: subscription.id,
            userId,
          })
        } else {
          console.log('[Webhook] ✅ Subscription successfully saved (created event):', {
            subscriptionId: subscription.id,
            userId,
            status,
          })
        }
      }
      break
    }
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      const subscriptionId = session.subscription as string

      console.log('[Webhook] checkout.session.completed:', {
        customerId,
        subscriptionId,
        sessionId: session.id,
      })

      if (!customerId || !subscriptionId) {
        console.error('[Webhook] Missing customerId or subscriptionId in checkout.session.completed')
        break
      }

      // Get customer to find user_id from metadata
      const customer = await stripe.customers.retrieve(customerId)
      
      if (typeof customer === 'object' && !customer.deleted) {
        const userId = customer.metadata?.user_id

        if (!userId) {
          console.error('[Webhook] No user_id found in customer metadata:', {
            customerId,
            metadata: customer.metadata,
          })
          break
        }

        console.log('[Webhook] Found user_id:', userId)

        // Get subscription details from Stripe
        const subscription = await stripe.subscriptions.retrieve(subscriptionId) as Stripe.Subscription
        
        if (subscription) {
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
            .eq('stripe_subscription_id', subscriptionId)
            .maybeSingle()

          const subscriptionData = {
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status,
            current_period_start: new Date(periodStart * 1000).toISOString(),
            current_period_end: new Date(periodEnd * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end || false,
          }

          let result
          if (existingSub) {
            // Update existing subscription
            console.log('[Webhook] Updating existing subscription:', subscriptionId)
            result = await supabase
              .from('subscriptions')
              .update(subscriptionData)
              .eq('stripe_subscription_id', subscriptionId)
          } else {
            // Insert new subscription
            console.log('[Webhook] Creating new subscription:', subscriptionId)
            result = await supabase
              .from('subscriptions')
              .insert(subscriptionData)
          }

          if (result.error) {
            console.error('[Webhook] Error saving subscription to Supabase:', {
              error: result.error,
              subscriptionId,
              userId,
              status,
            })
          } else {
            console.log('[Webhook] ✅ Subscription successfully saved to Supabase:', {
              subscriptionId,
              userId,
              status,
              periodStart: subscriptionData.current_period_start,
              periodEnd: subscriptionData.current_period_end,
            })
          }
        } else {
          console.error('[Webhook] Could not retrieve subscription from Stripe:', subscriptionId)
        }
      } else {
        console.error('[Webhook] Customer not found or deleted:', customerId)
      }
      break
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Get customer to find user_id
      const customer = await stripe.customers.retrieve(customerId)
      
      if (typeof customer === 'object' && !customer.deleted) {
        const userId = customer.metadata?.user_id

        if (userId) {
          const sub = subscription as Stripe.Subscription
          // Update subscription in database
          const status = sub.status === 'active' 
            ? 'active' 
            : sub.status === 'canceled' 
            ? 'cancelled' 
            : sub.status === 'past_due'
            ? 'past_due'
            : 'paused'

          const periodStart = (sub as any).current_period_start || 0
          const periodEnd = (sub as any).current_period_end || 0

          const { error } = await supabase
            .from('subscriptions')
            .update({
              status,
              current_period_start: new Date(periodStart * 1000).toISOString(),
              current_period_end: new Date(periodEnd * 1000).toISOString(),
              cancel_at_period_end: sub.cancel_at_period_end || false,
            })
            .eq('stripe_subscription_id', sub.id)

          if (error) {
            console.error('Error updating subscription:', error)
          } else {
            console.log('Subscription updated:', subscription.id)
          }
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      // Get customer to find user_id
      const customer = await stripe.customers.retrieve(customerId)
      
      if (typeof customer === 'object' && !customer.deleted) {
        const userId = customer.metadata?.user_id

        if (userId) {
          // Cancel subscription in database
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'cancelled',
            })
            .eq('stripe_subscription_id', subscription.id)

          if (error) {
            console.error('Error cancelling subscription:', error)
          } else {
            console.log('Subscription cancelled:', subscription.id)
          }
        }
      }
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = typeof invoice.customer === 'string' ? invoice.customer : (invoice.customer as Stripe.Customer)?.id
      const subscriptionId = (invoice as any).subscription 
        ? (typeof (invoice as any).subscription === 'string' 
            ? (invoice as any).subscription 
            : (invoice as any).subscription?.id)
        : null

      if (subscriptionId && customerId) {
        // Get customer to find user_id
        const customer = await stripe.customers.retrieve(customerId)
        
        if (typeof customer === 'object' && !customer.deleted) {
          const userId = customer.metadata?.user_id

          if (userId) {
            // Get subscription to find subscription_id in our DB
            const { data: subscription } = await supabase
              .from('subscriptions')
              .select('id')
              .eq('stripe_subscription_id', subscriptionId)
              .single()

            if (subscription) {
              // Insert payment record
              const paymentIntentId = (invoice as any).payment_intent
                ? (typeof (invoice as any).payment_intent === 'string' 
                    ? (invoice as any).payment_intent 
                    : (invoice as any).payment_intent?.id)
                : null
              
              const paidAt = invoice.status_transitions?.paid_at 
                ? new Date(invoice.status_transitions.paid_at * 1000).toISOString()
                : new Date().toISOString()

              const { error } = await supabase
                .from('subscription_payments')
                .insert({
                  subscription_id: subscription.id,
                  user_id: userId,
                  amount_paid: (invoice.amount_paid || 0) / 100, // Convert from cents
                  currency: invoice.currency || 'usd',
                  stripe_payment_intent_id: paymentIntentId,
                  stripe_invoice_id: invoice.id,
                  status: 'succeeded',
                  billing_period_start: new Date(invoice.period_start * 1000).toISOString(),
                  billing_period_end: new Date(invoice.period_end * 1000).toISOString(),
                  paid_at: paidAt,
                })

              if (error) {
                console.error('Error inserting payment:', error)
              } else {
                console.log('Payment recorded:', invoice.id)
              }
            }
          }
        }
      }
      break
    }
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return NextResponse.json({ received: true })
}

