import { NextRequest, NextResponse } from 'next/server'
import { createProfileAdmin } from '@/lib/actions/profile'

/**
 * API route to create a profile
 * Used when email confirmation is disabled and user is signed in immediately
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, fullName } = body

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await createProfileAdmin(userId, email, fullName)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in create-profile route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

