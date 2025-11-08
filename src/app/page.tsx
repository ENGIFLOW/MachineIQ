import { LandingFooter } from '@/components/landing/LandingFooter'
import { HeroSection } from '@/components/landing/HeroSection'
import { PillarsSection } from '@/components/landing/PillarsSection'
import { SparksSection } from '@/components/landing/SparksSection'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 sm:py-16">
        <div className="space-y-24">
          <HeroSection />
          <PillarsSection />
          <SparksSection />
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}

