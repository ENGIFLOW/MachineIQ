import Link from 'next/link'
import LessonsPage from '@/components/lessons/page'

export default function LessonsRoute() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 px-4 py-6">
        <LessonsPage />
      </main>
      <footer className="border-t border-ink/10 bg-white/70 mt-auto">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-ink sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} VietMastercam Training. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

