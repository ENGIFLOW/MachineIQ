# Database Integration Guide

This guide explains how to use the Supabase database in your Next.js application.

## Setup

1. **Environment Variables**: Make sure you have these in your `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. **Database Schema**: Your SQL schema has been set up with:
   - `profiles` - User profiles
   - `courses` - Course catalog
   - `modules` - Course modules
   - `lessons` - Video lessons
   - `subscriptions` - User subscriptions
   - `subscription_payments` - Payment history
   - `lesson_progress` - User progress tracking
   - `resources` - Downloadable resources
   - `video_views` - Analytics

## Usage Examples

### Server Actions (Recommended)

```typescript
'use server'

import { getCourses, hasActiveSubscription } from '@/lib/database/queries'
import { createClient } from '@/lib/supabase/server'

export async function getCoursesAction() {
  const courses = await getCourses()
  return courses
}

export async function checkUserSubscription() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  return await hasActiveSubscription(user.id)
}
```

### Server Components

```typescript
import { getCourses } from '@/lib/database/queries'

export default async function CoursesPage() {
  const courses = await getCourses()
  
  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.title_vi}</div>
      ))}
    </div>
  )
}
```

### Client Components (with Server Actions)

```typescript
'use client'

import { useState, useEffect } from 'react'
import { getCoursesAction } from '@/app/actions/courses'

export function CoursesList() {
  const [courses, setCourses] = useState([])
  
  useEffect(() => {
    getCoursesAction().then(setCourses)
  }, [])
  
  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.title_vi}</div>
      ))}
    </div>
  )
}
```

## Available Query Functions

### Profiles
- `getProfile(userId)` - Get user profile
- `updateProfile(userId, updates)` - Update profile

### Courses
- `getCourses()` - Get all published courses
- `getCourseBySlug(slug)` - Get course by slug
- `getCourseById(courseId)` - Get course by ID

### Modules
- `getModules(courseId)` - Get modules for a course

### Lessons
- `getLessons(moduleId)` - Get lessons for a module
- `getLessonById(lessonId)` - Get lesson by ID

### Subscriptions
- `hasActiveSubscription(userId)` - Check if user has active subscription
- `getSubscriptionStatus(userId)` - Get subscription status
- `getUserSubscription(userId)` - Get user's subscription
- `getSubscriptionPayments(userId)` - Get payment history

### Lesson Progress
- `getLessonProgress(userId, lessonId)` - Get progress for a lesson
- `getAllLessonProgress(userId)` - Get all progress
- `upsertLessonProgress(userId, lessonId, progress)` - Update progress

### Resources
- `getLessonResources(lessonId)` - Get resources for a lesson

### Video Views
- `recordVideoView(userId, lessonId)` - Record a view

## Row Level Security (RLS)

Your database has RLS enabled. Users can only:
- View their own profile and subscription
- View published courses
- Access preview lessons or lessons if they have an active subscription
- View and update their own lesson progress

## Helper Functions

Your database includes two helper functions:

1. `has_active_subscription(user_uuid)` - Returns boolean
2. `get_subscription_status(user_uuid)` - Returns subscription details

These are called via `supabase.rpc()` in the query functions.

## Language Support

Your schema supports bilingual content (Vietnamese/English). Use:
- `title_vi` / `title_en` for titles
- `description_vi` / `description_en` for descriptions

You can determine which language to use based on the user's `language` field in their profile.

## Next Steps

1. Update your lessons page to fetch courses from the database
2. Implement progress tracking when users watch videos
3. Connect subscription status to video unlocking
4. Add analytics tracking for video views

