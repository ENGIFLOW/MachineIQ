'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

type CourseType = 'all' | 'Mill' | 'Lathe' | 'mill 3d' | 'multi-axis'

interface Course {
  id: string
  title: string
  description: string
  duration: string
  type: CourseType
  progress: number
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Mill Operations',
    description: 'Learn the fundamentals of milling operations and basic G-code commands.',
    duration: '45 min',
    type: 'Mill',
    progress: 0,
  },
  {
    id: '2',
    title: 'Advanced Mill Techniques',
    description: 'Master advanced milling techniques for complex parts.',
    duration: '60 min',
    type: 'Mill',
    progress: 0,
  },
  {
    id: '3',
    title: 'Lathe Fundamentals',
    description: 'Explore turning operations and lathe programming basics.',
    duration: '50 min',
    type: 'Lathe',
    progress: 0,
  },
  {
    id: '4',
    title: '3D Milling Basics',
    description: 'Learn 3D milling operations and toolpath generation.',
    duration: '75 min',
    type: 'mill 3d',
    progress: 0,
  },
  {
    id: '5',
    title: 'Multi-Axis Machining',
    description: 'Master 5-axis operations and complex multi-axis programming.',
    duration: '90 min',
    type: 'multi-axis',
    progress: 0,
  },
  {
    id: '6',
    title: 'Advanced Multi-Axis Strategies',
    description: 'Explore advanced strategies for complex multi-axis parts.',
    duration: '100 min',
    type: 'multi-axis',
    progress: 0,
  },
]

const filters: CourseType[] = ['all', 'Mill', 'Lathe', 'mill 3d', 'multi-axis']

export default function LessonsPage() {
  const [activeFilter, setActiveFilter] = useState<CourseType>('all')

  const filteredCourses =
    activeFilter === 'all'
      ? mockCourses
      : mockCourses.filter((course) => course.type === activeFilter)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">Courses</h1>
        <p className="text-muted-ink">
          Browse available courses and track your learning progress
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveFilter(filter)}
          >
            {filter === 'all' ? 'All' : filter}
          </Button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCourses.map((course) => (
          <Card key={course.id} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge">{course.type}</span>
                <span className="text-xs text-muted-ink">{course.duration}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink">{course.title}</h3>
              <p className="text-sm text-muted-ink">{course.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-ink">
                <span>Progress</span>
                <span>{course.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-[hsl(var(--spark))]"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>
            <Button className="w-full" size="sm">
              {course.progress > 0 ? 'Continue' : 'Start Course'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
