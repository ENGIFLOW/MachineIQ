import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, userEmail, priceId } = body

    // Verify Price ID is provided
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer with user_id in metadata
    let customerId: string | undefined
    
    // Try to find existing customer
    const customers = await stripe.customers.list({
      email: userEmail || user.email,
      limit: 1,
    })

    if (customers.data.length > 0) {
      customerId = customers.data[0].id
      // Update customer metadata if needed
      if (customers.data[0].metadata?.user_id !== user.id) {
        await stripe.customers.update(customerId, {
          metadata: {
            user_id: user.id,
          },
        })
      }
    } else {
      // Create new customer with user_id in metadata
      const customer = await stripe.customers.create({
        email: userEmail || user.email,
        metadata: {
          user_id: user.id,
        },
      })
      customerId = customer.id
    }

    // Always use production domain for Stripe checkout redirects
    // Checkout success/cancel URLs should point to production, not localhost
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vietmastercamtraining.com'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${siteUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment`,
      metadata: {
        userId: userId || user.id,
      },
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorDetails = error instanceof Error ? error.stack : String(error)
    console.error('Error details:', errorDetails)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: errorMessage 
      },
      { status: 500 }
    )
  }
}

