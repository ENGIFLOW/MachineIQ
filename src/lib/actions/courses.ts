'use server'

import { getCourses, getModules, getLessons } from '@/lib/database/queries'
import { getAllLessonProgress } from '@/lib/database/queries'
import { createClient } from '@/lib/supabase/server'

/**
 * Get all courses with their modules and lessons
 */
export async function getCoursesWithContent() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get all courses
    const courses = await getCourses()
    console.log(`[Courses] Found ${courses.length} published courses`)

    if (courses.length === 0) {
      console.warn('[Courses] No published courses found. Check if courses are marked as is_published=true')
      return { courses: [], error: 'No courses found. Make sure courses are published in the database.' }
    }

    // Get user's lesson progress if logged in
    let userProgress: Record<string, { completed: boolean }> = {}
    if (user) {
      const progress = await getAllLessonProgress(user.id)
      progress.forEach((p) => {
        userProgress[p.lesson_id] = { completed: p.completed }
      })
      console.log(`[Courses] Loaded progress for ${Object.keys(userProgress).length} lessons`)
    }

    // For each course, get modules and lessons, organized by module
    const coursesWithContent = await Promise.all(
      courses.map(async (course) => {
        const modules = await getModules(course.id)
        console.log(`[Courses] Course "${course.title_en || course.title_vi}" has ${modules.length} modules`)

        // Get modules with their lessons
        const modulesWithLessons = await Promise.all(
          modules.map(async (module) => {
            const lessons = await getLessons(module.id)
            console.log(`[Courses] Module "${module.title_vi || module.title_en}" (ID: ${module.id}) has ${lessons.length} lessons`)
            if (lessons.length === 0) {
              console.warn(`[Courses] ⚠️  No lessons found for module ${module.id}. Check RLS policies or database.`)
            }

            // Map lessons to include completion status and formatted duration
            const lessonsWithStatus = lessons.map((lesson) => {
              const progress = userProgress[lesson.id]
              const durationMinutes = lesson.duration_seconds
                ? Math.round(lesson.duration_seconds / 60)
                : 0

              return {
                id: lesson.id,
                title: lesson.title_vi || lesson.title_en || 'Untitled',
                completed: progress?.completed || false,
                duration: durationMinutes > 0 ? `${durationMinutes} min` : '—',
                bunny_video_id: lesson.bunny_video_id,
                bunny_library_id: lesson.bunny_library_id,
                is_preview: lesson.is_preview,
                order_index: lesson.order_index || 0, // Preserve order for sorting
              }
            })

            // Sort lessons numerically by order_index, with fallback to title-based numerical sorting
            lessonsWithStatus.sort((a, b) => {
              // First, sort by order_index if available
              const orderA = a.order_index || 0
              const orderB = b.order_index || 0
              if (orderA !== orderB) {
                return orderA - orderB
              }
              
              // If order_index is the same or missing, extract numbers from title for numerical sorting
              const extractNumber = (str: string): number => {
                // Try to find lesson/part numbers first - prioritize "VIDEO" pattern
                // Match "VIDEO 8", "VIDEO 07", "VIDEO 08", etc. (with or without leading zeros)
                const videoMatch = str.match(/(?:video)[\s_-]+0*(\d+)/i)
                if (videoMatch && videoMatch[1]) {
                  return parseInt(videoMatch[1], 10)
                }
                
                // Try other patterns
                const patterns = [
                  /(?:part|lesson|l|p)[\s_-]*0*(\d+)/i,  // "Part 8", "Lesson 8", "L8", "P8"
                  /^0*(\d+)[\s_-]/,                      // "8 - Title", "07 - Title", "8_Title"
                  /[\s_-]0*(\d+)[\s_-]/,                 // "Title - 8 - More" or "Title_8_More"
                  /0*(\d+)$/,                            // "Title 8" or "Title 07" at the end
                  /0*(\d+)/                              // Any number as fallback (strips leading zeros)
                ]
                
                for (const pattern of patterns) {
                  const match = str.match(pattern)
                  if (match && match[1]) {
                    return parseInt(match[1], 10)  // parseInt automatically handles leading zeros
                  }
                }
                
                return 999999
              }
              
              const numA = extractNumber(a.title)
              const numB = extractNumber(b.title)
              if (numA !== numB) {
                return numA - numB
              }
              
              // Fallback to alphabetical
              return a.title.localeCompare(b.title)
            })

            return {
              id: module.id,
              title: module.title_vi || module.title_en || 'Untitled Module',
              order_index: module.order_index || 0,
              lessons: lessonsWithStatus,
            }
          })
        )

        // Sort modules by order_index, with custom ordering for specific module names
        modulesWithLessons.sort((a, b) => {
          // Custom ordering: "Lathe Basic" should come before "Lathe- C Axis"
          const titleA = a.title.toLowerCase()
          const titleB = b.title.toLowerCase()
          
          // Check if either is "Lathe Basic" or "Lathe- C Axis"
          const isLatheBasicA = titleA.includes('lathe') && titleA.includes('basic')
          const isLatheBasicB = titleB.includes('lathe') && titleB.includes('basic')
          const isLatheCAxisA = titleA.includes('lathe') && (titleA.includes('c axis') || titleA.includes('c-axis'))
          const isLatheCAxisB = titleB.includes('lathe') && (titleB.includes('c axis') || titleB.includes('c-axis'))
          
          // If A is Lathe Basic and B is Lathe C-Axis, A comes first
          if (isLatheBasicA && isLatheCAxisB) return -1
          // If B is Lathe Basic and A is Lathe C-Axis, B comes first
          if (isLatheBasicB && isLatheCAxisA) return 1
          
          // Otherwise, sort by order_index
          return (a.order_index || 0) - (b.order_index || 0)
        })
        
        // Ensure only the first lesson of the first module is marked as preview
        if (modulesWithLessons.length > 0 && modulesWithLessons[0].lessons.length > 0) {
          const firstLesson = modulesWithLessons[0].lessons[0]
          if (!firstLesson.is_preview) {
            firstLesson.is_preview = true
            console.log(`[Courses] Marked first lesson "${firstLesson.title}" as preview for course "${course.title_en || course.title_vi}"`)
          }
          // Ensure all other lessons are NOT preview
          for (const module of modulesWithLessons) {
            const startIndex = module === modulesWithLessons[0] ? 1 : 0
            for (let i = startIndex; i < module.lessons.length; i++) {
              if (module.lessons[i].is_preview) {
                module.lessons[i].is_preview = false
                console.log(`[Courses] Removed preview flag from lesson "${module.lessons[i].title}"`)
              }
            }
          }
        }

        // Map course type from title and module names to filter type
        const courseTitle = course.title_en || course.title_vi || ''
        let courseType: 'Mill' | 'Lathe' | 'Mill 3D' | 'Multi-Axis' = 'Mill'
        
        // Check course title
        const titleLower = courseTitle.toLowerCase()
        
        // Also check module names for categorization
        const allModuleNames = modulesWithLessons.map(m => 
          (m.title || '').toLowerCase()
        ).join(' ')
        
        const combinedText = `${titleLower} ${allModuleNames}`
        
        if (combinedText.includes('lathe')) {
          courseType = 'Lathe'
        } else if (combinedText.includes('3d') || combinedText.includes('3-d')) {
          courseType = 'Mill 3D'
        } else if (
          combinedText.includes('multi') || 
          combinedText.includes('5axis') || 
          combinedText.includes('5-axis') || 
          combinedText.includes('5 axis') ||
          combinedText.includes('five axis')
        ) {
          courseType = 'Multi-Axis'
        }

        return {
          id: course.id,
          title: courseTitle,
          type: courseType,
          modules: modulesWithLessons, // Modules with their lessons
          progress: 0, // Will be calculated on client side
        }
      })
    )

    console.log(`[Courses] Successfully loaded ${coursesWithContent.length} courses with content`)
    return { courses: coursesWithContent, error: null }
  } catch (error) {
    console.error('[Courses] Error fetching courses with content:', error)
    return {
      courses: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

