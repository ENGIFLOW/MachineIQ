/**
 * Database types for Supabase tables
 * Matches your actual database schema
 */

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  language: string // default 'vi'
  deleted_at?: string | null // Soft delete timestamp
  created_at: string
}

export interface Course {
  id: string
  slug: string
  title_vi: string
  title_en?: string
  description_vi?: string
  description_en?: string
  thumbnail_url?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  is_published: boolean
  order_index?: number
  created_at: string
}

export interface Module {
  id: string
  course_id: string
  title_vi: string
  title_en?: string
  description_vi?: string
  order_index: number
  created_at: string
}

export interface Lesson {
  id: string
  module_id: string
  title_vi: string
  title_en?: string
  description_vi?: string
  description_en?: string
  bunny_video_id: string
  bunny_library_id: string
  duration_seconds?: number
  is_preview: boolean
  order_index: number
  created_at: string
}

export interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'cancelled' | 'past_due' | 'paused'
  stripe_subscription_id?: string
  stripe_customer_id?: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface SubscriptionPayment {
  id: string
  subscription_id: string
  user_id: string
  amount_paid: number
  currency: string
  stripe_payment_intent_id?: string
  stripe_invoice_id?: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  billing_period_start: string
  billing_period_end: string
  paid_at?: string
  created_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  progress_seconds: number
  completed: boolean
  last_watched_at: string
}

export interface Resource {
  id: string
  lesson_id: string
  title_vi: string
  title_en?: string
  file_url: string
  file_type?: string
  file_size_kb?: number
  created_at: string
}

export interface VideoView {
  id: string
  user_id: string
  lesson_id: string
  viewed_at: string
}

// Helper function return types
export interface SubscriptionStatus {
  is_active: boolean
  status: string
  current_period_end: string
  cancel_at_period_end: boolean
}

