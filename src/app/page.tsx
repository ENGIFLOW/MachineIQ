import { LandingFooter } from '@/components/landing/LandingFooter'
import { HeroSection } from '@/components/landing/HeroSection'
import { CoursesSection } from '@/components/landing/CoursesSection'
import { PricingSection } from '@/components/landing/PricingSection'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 mx-auto max-w-6xl w-full px-4 py-12 sm:py-16">
        <div className="space-y-24">
          <HeroSection />
          <CoursesSection />
          <PricingSection />
        </div>
      </main>
      <LandingFooter />
    </div>
  )
}
