'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type CourseType = 'all' | 'Mill' | 'Lathe' | 'mill 3d' | 'multi-axis'

interface Lesson {
  id: string
  title: string
  completed: boolean
  duration: string
}

interface Module {
  id: string
  title: string
  lessons: Lesson[]
}

interface Course {
  id: string
  title: string
  type: CourseType
  modules: Module[]
  progress: number
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Mill Operations Course',
    type: 'Mill',
    progress: 15,
    modules: [
      {
        id: 'm1',
        title: 'Module 1 - Getting Started',
        lessons: [
          { id: 'l1', title: 'Helpful Resources', completed: true, duration: '5 min' },
          { id: 'l2', title: 'Lesson 1 - Introduction to Milling', completed: true, duration: '10 min' },
          { id: 'l3', title: 'Lesson 2 - Mill Setup and Safety', completed: false, duration: '12 min' },
          { id: 'l4', title: 'Lesson 3 - Basic G-Code Commands', completed: false, duration: '8 min' },
          { id: 'l5', title: 'Lesson 4 - Tool Selection and Setup', completed: false, duration: '15 min' },
          { id: 'l6', title: 'Lesson 5 - Workholding Methods', completed: false, duration: '10 min' },
          { id: 'l7', title: 'Lesson 6 - Speeds and Feeds', completed: false, duration: '12 min' },
          { id: 'l8', title: 'Lesson 7 - Toolpath Strategies', completed: false, duration: '9 min' },
          { id: 'l9', title: 'Lesson 8 - Common Milling Challenges', completed: false, duration: '11 min' },
          { id: 'l10', title: 'Lesson 9 - Advanced Milling Techniques', completed: false, duration: '14 min' },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Lathe Fundamentals Course',
    type: 'Lathe',
    progress: 0,
    modules: [
      {
        id: 'm1',
        title: 'Module 1 - Basics',
        lessons: [
          { id: 'l1', title: 'Introduction to Lathe', completed: false, duration: '10 min' },
          { id: 'l2', title: 'Lathe Operations', completed: false, duration: '15 min' },
        ],
      },
    ],
  },
  {
    id: '3',
    title: '3D Milling Course',
    type: 'mill 3d',
    progress: 0,
    modules: [
      {
        id: 'm1',
        title: 'Module 1 - 3D Basics',
        lessons: [
          { id: 'l1', title: '3D Milling Introduction', completed: false, duration: '12 min' },
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Multi-Axis Machining Course',
    type: 'multi-axis',
    progress: 0,
    modules: [
      {
        id: 'm1',
        title: 'Module 1 - Multi-Axis Fundamentals',
        lessons: [
          { id: 'l1', title: 'Multi-Axis Introduction', completed: false, duration: '15 min' },
        ],
      },
    ],
  },
]

const filters: CourseType[] = ['all', 'Mill', 'Lathe', 'mill 3d', 'multi-axis']

export default function LessonsPage() {
  const [activeFilter, setActiveFilter] = useState<CourseType>('all')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(mockCourses[0])
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(
    mockCourses[0]?.modules[0]?.lessons[1] || null
  )
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['m1']))

  const filteredCourses =
    activeFilter === 'all'
      ? mockCourses
      : mockCourses.filter((course) => course.type === activeFilter)

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  const handleLessonClick = (course: Course, lesson: Lesson) => {
    setSelectedCourse(course)
    setSelectedLesson(lesson)
  }

  const currentCourse = selectedCourse || filteredCourses[0]
  const overallProgress = currentCourse?.progress || 0

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
                onClick={() => {
                  setActiveFilter(filter)
                  const firstCourse = filteredCourses.find((c) => c.type === filter) || filteredCourses[0]
                  if (firstCourse) {
                    setSelectedCourse(firstCourse)
                    setSelectedLesson(firstCourse.modules[0]?.lessons[0] || null)
                  }
                }}
                className="text-xs"
              >
                {filter === 'all' ? 'All' : filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Course Title */}
        <div className="p-4 border-b border-ink/10">
          <h2 className="font-semibold text-ink">{currentCourse?.title}</h2>
        </div>

        {/* Modules and Lessons */}
        <div className="flex-1 overflow-y-auto">
          {currentCourse?.modules.map((module) => {
            const isExpanded = expandedModules.has(module.id)
            return (
              <div key={module.id} className="border-b border-ink/10">
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-surface/50 transition-colors"
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
                {isExpanded && (
                  <div className="bg-surface/30">
                    {module.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        onClick={() => handleLessonClick(currentCourse, lesson)}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          selectedLesson?.id === lesson.id
                            ? 'bg-[hsl(var(--spark))]/10 text-ink font-medium'
                            : 'text-muted-ink hover:bg-surface/50 hover:text-ink'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{lesson.title}</span>
                          {lesson.completed && (
                            <svg
                              className="w-4 h-4 text-[hsl(var(--spark))]"
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

            {/* Video Player */}
            <div className="flex-1 p-6">
              <div className="w-full h-full bg-surface-strong rounded-lg overflow-hidden relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/90 flex items-center justify-center shadow-lg cursor-pointer hover:bg-white transition-colors">
                      <svg
                        className="w-8 h-8 text-ink ml-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                    <p className="text-muted-ink text-sm">Video Player</p>
                  </div>
                </div>
                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-3 flex items-center justify-between text-white text-sm">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    <span>1.2x</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>3 min 26 sec</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" />
                    </svg>
                    <span>4 min</span>
                  </div>
                </div>
              </div>
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
