'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { checkSubscription } from '@/lib/actions/subscription'
import { getCoursesWithContent } from '@/lib/actions/courses'
import { createClient } from '@/lib/supabase/client'

type CourseType = 'all' | 'Mill' | 'Lathe' | 'Mill 3D' | 'Multi-Axis'

interface Lesson {
  id: string
  title: string
  completed: boolean
  duration: string
  bunny_video_id?: string
  bunny_library_id?: string
  is_preview?: boolean
  order_index?: number
}

interface Module {
  id: string
  title: string
  order_index: number
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  type: CourseType
  modules: Module[] // Modules with their lessons
  progress: number
}

// Mock courses removed - now fetching from database

const filters: CourseType[] = ['all', 'Mill', 'Lathe', 'Mill 3D', 'Multi-Axis']

// Helper function to format filter labels
const formatFilterLabel = (filter: CourseType): string => {
  if (filter === 'all') return 'All'
  return filter
}

export default function LessonsPage() {
  const [activeFilter, setActiveFilter] = useState<CourseType>('all')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [hasSubscription, setHasSubscription] = useState<boolean>(false)
  const [checkingSubscription, setCheckingSubscription] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)

  // Fetch courses from database
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      console.log('[LessonsPage] Fetching courses...')
      
      try {
        const { courses: fetchedCourses, error } = await getCoursesWithContent()
        
        if (error) {
          console.error('[LessonsPage] Error fetching courses:', error)
          setLoading(false)
          return
        }

        console.log('[LessonsPage] Fetched courses:', fetchedCourses.length)
        console.log('[LessonsPage] Courses data:', JSON.stringify(fetchedCourses, null, 2))
        
        setCourses(fetchedCourses)
        
        // Set initial selected course
        if (fetchedCourses.length > 0) {
          setSelectedCourse(fetchedCourses[0])
          const firstModule = fetchedCourses[0].modules?.[0]
          if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
            setSelectedLesson(firstModule.lessons[0] || null)
            setExpandedModules(new Set([firstModule.id]))
          }
        } else {
          console.warn('[LessonsPage] No courses found')
        }
      } catch (err) {
        console.error('[LessonsPage] Exception fetching courses:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    const checkSub = async () => {
      setCheckingSubscription(true)
      const result = await checkSubscription()
      console.log('[LessonsPage] Subscription check result:', result)
      setHasSubscription(result.hasSubscription)
      setCheckingSubscription(false)
    }
    
    // Check subscription on mount
    checkSub()
    
    // Re-check subscription when user changes (sign in/out)
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User just signed in - subscription should have been synced in auth callback
        // But check again to ensure it's up-to-date
        console.log('[LessonsPage] User signed in, re-checking subscription...')
        await checkSub()
      } else if (event === 'SIGNED_OUT') {
        // User signed out - clear subscription
        setHasSubscription(false)
      } else {
        // Other auth state changes - just re-check
        await checkSub()
      }
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Filter courses based on active filter
  const filteredCourses =
    activeFilter === 'all'
      ? courses
      : courses.filter((course) => course.type === activeFilter)

  // Update selected course when filter changes
  useEffect(() => {
    if (filteredCourses.length > 0) {
      // If current selected course is not in filtered list, select first filtered course
      const isCurrentCourseInFilter = filteredCourses.some(
        (course) => course.id === selectedCourse?.id
      )
      if (!isCurrentCourseInFilter) {
        const newCourse = filteredCourses[0]
        setSelectedCourse(newCourse)
        const firstModule = newCourse.modules?.[0]
        if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
          setSelectedLesson(firstModule.lessons[0] || null)
          setExpandedModules(new Set([firstModule.id]))
        }
      }
    }
  }, [activeFilter, filteredCourses, selectedCourse?.id])


  const handleLessonClick = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course)
    setSelectedLesson(lesson)
  }

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleFilterChange = (filter: CourseType) => {
    setActiveFilter(filter)
    // Find first course matching the filter
    const matchingCourse =
      filter === 'all'
        ? courses[0]
        : courses.find((course) => course.type === filter)
    
    if (matchingCourse) {
      setSelectedCourse(matchingCourse)
      const firstModule = matchingCourse.modules?.[0]
      if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
        setSelectedLesson(firstModule.lessons[0] || null)
        setExpandedModules(new Set([firstModule.id]))
      }
    }
  }

  const currentCourse = selectedCourse || filteredCourses[0] || null

  // Calculate progress based on completed lessons
  const calculateProgress = (course: Course | null): number => {
    if (!course || !course.modules) return 0
    
    const allLessons = course.modules.flatMap((module) => module.lessons)
    const totalLessons = allLessons.length
    if (totalLessons === 0) return 0
    
    const completedLessons = allLessons.filter((lesson) => lesson.completed).length
    return Math.round((completedLessons / totalLessons) * 100)
  }

  const overallProgress = calculateProgress(currentCourse)

  return (
    <div className="flex h-[calc(100vh-14rem)] gap-6">
      {/* Left Sidebar */}
      <div className="w-80 flex-shrink-0 border-r border-ink/10 flex flex-col">
        {/* Progress Bar */}
        <div className="p-4 border-b border-ink/10">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-ink">Progress</span>
              <span className="font-medium text-ink">{overallProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-surface-strong overflow-hidden">
              <div
                className="h-full rounded-full bg-[hsl(var(--spark))] transition-all"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-ink/10">
          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(filter)}
                className="text-xs capitalize"
              >
                {formatFilterLabel(filter)}
              </Button>
            ))}
          </div>
        </div>

        {/* Course List (when "All" is selected) or Course Title */}
        {activeFilter === 'all' ? (
          <div className="flex-1 overflow-y-auto">
            {filteredCourses.length > 0 ? (
              filteredCourses.map((course) => {
                const isSelected = selectedCourse?.id === course.id
                return (
                  <div key={course.id} className="border-b border-ink/10 last:border-b-0">
                    <button
                      onClick={() => {
                        setSelectedCourse(course)
                        const firstModule = course.modules?.[0]
                        if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
                          setSelectedLesson(firstModule.lessons[0] || null)
                          setExpandedModules(new Set([firstModule.id]))
                        }
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        isSelected
                          ? 'bg-[hsl(var(--spark))]/10 border-l-4 border-[hsl(var(--spark))]'
                          : 'hover:bg-surface/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-sm text-ink">{course.title}</h3>
                        <span className="text-xs px-2 py-1 rounded bg-surface-strong text-muted-ink">
                          {course.type}
                        </span>
                      </div>
                      <p className="text-xs text-muted-ink mt-1">
                        {course.modules?.reduce((acc, mod) => acc + (mod.lessons?.length || 0), 0) || 0} lessons
                      </p>
                    </button>
                    {isSelected && course.modules && course.modules.length > 0 && (
                      <div className="bg-surface/30">
                        {[...course.modules]
                          .sort((a, b) => {
                            // Custom ordering: "Lathe Basic" should come before "Lathe- C Axis"
                            const titleA = a.title.toLowerCase()
                            const titleB = b.title.toLowerCase()
                            
                            const isLatheBasicA = titleA.includes('lathe') && titleA.includes('basic')
                            const isLatheBasicB = titleB.includes('lathe') && titleB.includes('basic')
                            const isLatheCAxisA = titleA.includes('lathe') && (titleA.includes('c axis') || titleA.includes('c-axis'))
                            const isLatheCAxisB = titleB.includes('lathe') && (titleB.includes('c axis') || titleB.includes('c-axis'))
                            
                            if (isLatheBasicA && isLatheCAxisB) return -1
                            if (isLatheBasicB && isLatheCAxisA) return 1
                            
                            return (a.order_index || 0) - (b.order_index || 0)
                          })
                          .map((module) => {
                          const isExpanded = expandedModules.has(module.id)
                          // Sort lessons numerically
                          const sortedLessons = [...(module.lessons || [])].sort((a, b) => {
                            const orderA = a.order_index || 0
                            const orderB = b.order_index || 0
                            if (orderA !== orderB) return orderA - orderB
                            
                            // Extract numbers from title for numerical sorting
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
                            if (numA !== numB) return numA - numB
                            
                            return a.title.localeCompare(b.title)
                          })
                          
                          return (
                            <div key={module.id} className="border-t border-ink/10">
                              <button
                                onClick={() => toggleModule(module.id)}
                                className="w-full px-4 py-2 flex items-center justify-between hover:bg-surface/50 transition-colors text-sm"
                              >
                                <span className="font-medium text-muted-ink">{module.title}</span>
                                <svg
                                  className={`w-4 h-4 text-muted-ink transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                              </button>
                              {isExpanded && (
                                <div className="bg-surface/50">
                                  {sortedLessons.map((lesson) => (
                                    <button
                                      key={lesson.id}
                                      onClick={() => handleLessonClick(course, lesson)}
                                      className={`w-full px-4 py-2 text-left text-xs transition-colors ${
                                        selectedLesson?.id === lesson.id
                                          ? 'bg-[hsl(var(--spark))]/10 text-ink font-medium'
                                          : 'text-muted-ink hover:bg-surface/50 hover:text-ink'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="truncate">{lesson.title}</span>
                                        {lesson.is_preview && (
                                          <span className="px-2 py-0.5 text-xs font-medium bg-[hsl(var(--spark))]/20 text-[hsl(var(--spark))] rounded flex-shrink-0">
                                            Preview
                                          </span>
                                        )}
                                        {lesson.completed && (
                                          <svg
                                            className="w-3 h-3 text-[hsl(var(--spark))] flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path
                                              fillRule="evenodd"
                                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                              clipRule="evenodd"
                                            />
                                          </svg>
                                        )}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-4 text-sm text-muted-ink text-center">No courses available</div>
            )}
          </div>
        ) : (
          <>
            {/* Course Title */}
            <div className="p-4 border-b border-ink/10">
              <h2 className="font-semibold text-ink">{currentCourse?.title || 'No courses available'}</h2>
            </div>

            {/* Modules and Lessons */}
            <div className="flex-1 overflow-y-auto">
              {currentCourse ? (
                currentCourse.modules && currentCourse.modules.length > 0 ? (
                  [...currentCourse.modules]
                    .sort((a, b) => {
                      // Custom ordering: "Lathe Basic" should come before "Lathe- C Axis"
                      const titleA = a.title.toLowerCase()
                      const titleB = b.title.toLowerCase()
                      
                      const isLatheBasicA = titleA.includes('lathe') && titleA.includes('basic')
                      const isLatheBasicB = titleB.includes('lathe') && titleB.includes('basic')
                      const isLatheCAxisA = titleA.includes('lathe') && (titleA.includes('c axis') || titleA.includes('c-axis'))
                      const isLatheCAxisB = titleB.includes('lathe') && (titleB.includes('c axis') || titleB.includes('c-axis'))
                      
                      if (isLatheBasicA && isLatheCAxisB) return -1
                      if (isLatheBasicB && isLatheCAxisA) return 1
                      
                      return (a.order_index || 0) - (b.order_index || 0)
                    })
                    .map((module) => {
                const isExpanded = expandedModules.has(module.id)
                return (
                  <div key={module.id} className="border-b border-ink/10 last:border-b-0">
                    <div className="px-4 py-3 flex items-center justify-between gap-2">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="flex-1 flex items-center justify-between hover:bg-surface/50 transition-colors rounded px-2 py-1 -mx-2 -my-1"
                      >
                        <span className="font-medium text-sm text-ink">{module.title}</span>
                        <svg
                          className={`w-4 h-4 text-muted-ink transition-transform ${
                            isExpanded ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <Link
                        href={`/modules/${module.id}/resources`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-muted-ink hover:text-ink hover:bg-surface/50 rounded transition-colors"
                        title="View resources"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        Resources
                      </Link>
                    </div>
                    {isExpanded && (
                      <div className="bg-surface/30">
                        {[...(module.lessons || [])]
                          .sort((a, b) => {
                            const orderA = a.order_index || 0
                            const orderB = b.order_index || 0
                            if (orderA !== orderB) return orderA - orderB
                            
                            // Extract numbers from title for numerical sorting
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
                            if (numA !== numB) return numA - numB
                            
                            return a.title.localeCompare(b.title)
                          })
                          .map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleLessonClick(currentCourse, lesson)}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                              selectedLesson?.id === lesson.id
                                ? 'bg-[hsl(var(--spark))]/10 text-ink font-medium'
                                : 'text-muted-ink hover:bg-surface/50 hover:text-ink'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-sm truncate">{lesson.title}</span>
                                {lesson.is_preview && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-[hsl(var(--spark))]/20 text-[hsl(var(--spark))] rounded flex-shrink-0">
                                    Preview
                                  </span>
                                )}
                              </div>
                              {lesson.completed && (
                                <svg
                                  className="w-4 h-4 text-[hsl(var(--spark))] flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <div className="p-4 text-sm text-muted-ink text-center">
                No modules available for this course
              </div>
            )
          ) : (
            <div className="p-4 text-sm text-muted-ink text-center">
              No courses available for this filter
            </div>
          )}
            </div>
          </>
        )}
      </div>

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedLesson ? (
          <>
            {/* Lesson Header */}
            <div className="flex items-center justify-between p-6 border-b border-ink/10">
              <h1 className="text-2xl font-semibold text-ink">{selectedLesson.title}</h1>
              {selectedLesson.completed && (
                <div className="w-8 h-8 rounded-full bg-[hsl(var(--spark))] flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Video Player or Locked State */}
            <div className="flex-1 p-6">
              {(() => {
                // Access Control Logic:
                // - Users with active subscriptions (hasSubscription === true) have access to ALL courses and lessons
                // - Users without subscriptions can only access preview lessons (is_preview === true)
                // - Lock lesson if:
                //   1. Subscription check is complete (!checkingSubscription)
                //   2. User does NOT have an active subscription (!hasSubscription)
                //      - hasSubscription is true only if status is 'active' (excludes 'past_due', 'cancelled', 'paused')
                //   3. Lesson is NOT a preview (is_preview !== true)
                const isLocked = !checkingSubscription && !hasSubscription && selectedLesson.is_preview !== true
                console.log('[LessonsPage] Access check:', {
                  checkingSubscription,
                  hasSubscription,
                  isPreview: selectedLesson.is_preview,
                  isLocked,
                  accessGranted: !isLocked
                })
                return isLocked
              })() ? (
                // Locked State - No Subscription (unless preview)
                <div className="w-full h-full bg-surface-strong rounded-lg overflow-hidden relative flex items-center justify-center">
                  <div className="text-center space-y-6 p-8">
                    <div className="w-20 h-20 mx-auto rounded-full bg-[hsl(var(--spark))]/10 flex items-center justify-center">
                      <svg
                        className="w-10 h-10 text-[hsl(var(--spark))]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-ink">This lesson is locked</h3>
                      <p className="text-muted-ink">
                        Subscribe to unlock access to all courses and lessons
                      </p>
                    </div>
                    <Link href="/payment">
                      <Button className="btn-primary" size="lg">
                        See Pricing
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                // Video Player - Has Subscription or Preview
                <div className="w-full h-full bg-surface-strong rounded-lg overflow-hidden relative">
                  {selectedLesson.bunny_video_id && selectedLesson.bunny_library_id ? (
                    <iframe
                      src={`https://iframe.mediadelivery.net/embed/${selectedLesson.bunny_library_id}/${selectedLesson.bunny_video_id}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`}
                      className="w-full h-full border-0"
                      allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                      allowFullScreen={true}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <svg
                            className="w-8 h-8 text-ink ml-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                          </svg>
                        </div>
                        <p className="text-muted-ink text-sm">Video not available</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-ink">
            Select a lesson to begin
          </div>
        )}
      </div>
    </div>
  )
}
