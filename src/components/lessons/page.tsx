import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const mockLessons = [
  {
    id: '1',
    title: 'Introduction to G-Code',
    description: 'Learn the fundamentals of CNC programming with G-code commands.',
    duration: '45 min',
    difficulty: 'Beginner',
    progress: 0,
  },
  {
    id: '2',
    title: 'Toolpath Optimization',
    description: 'Master techniques for creating efficient toolpaths that reduce cycle time.',
    duration: '60 min',
    difficulty: 'Intermediate',
    progress: 0,
  },
  {
    id: '3',
    title: '5-Axis Machining Basics',
    description: 'Explore advanced multi-axis operations and programming strategies.',
    duration: '90 min',
    difficulty: 'Advanced',
    progress: 0,
  },
]

export default function LessonsPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-ink">Lessons</h1>
        <p className="text-muted-ink">
          Browse available courses and track your learning progress
        </p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Button variant="outline" size="sm">
          All
        </Button>
        <Button variant="outline" size="sm">
          Beginner
        </Button>
        <Button variant="outline" size="sm">
          Intermediate
        </Button>
        <Button variant="outline" size="sm">
          Advanced
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockLessons.map((lesson) => (
          <Card key={lesson.id} className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="badge">{lesson.difficulty}</span>
                <span className="text-xs text-muted-ink">{lesson.duration}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink">{lesson.title}</h3>
              <p className="text-sm text-muted-ink">{lesson.description}</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-ink">
                <span>Progress</span>
                <span>{lesson.progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-surface-strong">
                <div
                  className="h-full rounded-full bg-[hsl(var(--spark))]"
                  style={{ width: `${lesson.progress}%` }}
                />
              </div>
            </div>
            <Button className="w-full" size="sm">
              {lesson.progress > 0 ? 'Continue' : 'Start Lesson'}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}

