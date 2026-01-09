import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Debug endpoint to check what's in the database
 * Uses service role key to bypass RLS
 * Access at /api/debug/courses
 */
export async function GET() {
  try {
    // Use service role key to bypass RLS for debugging
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get all courses (including unpublished for debugging)
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('*')
      .order('order_index', { ascending: true })

    if (coursesError) {
      return NextResponse.json(
        { error: `Failed to fetch courses: ${coursesError.message}` },
        { status: 500 }
      )
    }

    const coursesWithDetails = await Promise.all(
      (courses || []).map(async (course) => {
        // Get modules
        const { data: modules, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('course_id', course.id)
          .order('order_index', { ascending: true })

        if (modulesError) {
          console.error(`Error fetching modules for course ${course.id}:`, modulesError)
        }

        const modulesWithLessons = await Promise.all(
          (modules || []).map(async (module) => {
            // Get lessons using service role key
            const { data: lessons, error: lessonsError } = await supabase
              .from('lessons')
              .select('*')
              .eq('module_id', module.id)
              .order('order_index', { ascending: true })

            if (lessonsError) {
              console.error(`Error fetching lessons for module ${module.id}:`, lessonsError)
              return {
                ...module,
                lessonsCount: 0,
                lessons: [],
                error: lessonsError.message,
              }
            }

            return {
              ...module,
              lessonsCount: lessons?.length || 0,
              lessons: (lessons || []).map((l) => ({
                id: l.id,
                title: l.title_vi || l.title_en,
                bunny_video_id: l.bunny_video_id,
                bunny_library_id: l.bunny_library_id,
                is_preview: l.is_preview,
                order_index: l.order_index,
              })),
            }
          })
        )

        return {
          ...course,
          modulesCount: modules?.length || 0,
          modules: modulesWithLessons,
        }
      })
    )

    // Also get total lesson count directly
    const { count: totalLessons } = await supabase
      .from('lessons')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      totalCourses: courses?.length || 0,
      totalLessons: totalLessons || 0,
      courses: coursesWithDetails,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

