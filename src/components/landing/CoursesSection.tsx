'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const courseTypes = [
  {
    name: 'Mill',
    description: 'Learn milling operations, tool selection, and G-code programming for vertical and horizontal mills.',
    href: '/lessons?filter=Mill',
  },
  {
    name: 'Lathe',
    description: 'Master turning operations, lathe setup, and programming techniques for precision parts.',
    href: '/lessons?filter=Lathe',
  },
  {
    name: '3D Milling',
    description: 'Advanced 3D milling operations, toolpath generation, and complex part machining.',
    href: '/lessons?filter=mill 3d',
  },
  {
    name: 'Multi-Axis',
    description: 'Explore 5-axis machining, simultaneous operations, and advanced multi-axis programming.',
    href: '/lessons?filter=multi-axis',
  },
]

export function CoursesSection() {
  return (
    <section className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-semibold text-ink">Our Courses</h2>
        <p className="text-muted-ink">
          Choose from our comprehensive range of CNC training courses
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {courseTypes.map((course) => (
          <Card key={course.name} className="p-6 space-y-4">
            <h3 className="text-xl font-semibold text-ink">{course.name}</h3>
            <p className="text-sm text-muted-ink">{course.description}</p>
            <Link href={course.href}>
              <Button variant="outline" className="w-full" size="sm">
                View Courses
              </Button>
            </Link>
          </Card>
        ))}
      </div>
    </section>
  )
}

