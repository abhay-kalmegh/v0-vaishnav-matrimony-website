import { Navbar } from "@/components/landing/navbar"
import { HeroSection } from "@/components/landing/hero-section"
import { StatsSection } from "@/components/landing/stats-section"
import { SampradaySection } from "@/components/landing/sampraday-section"
import { HowItWorks } from "@/components/landing/how-it-works"
import { FeaturesSection } from "@/components/landing/features-section"
import { SuccessStories } from "@/components/landing/success-stories"
import { TestimonialsSection } from "@/components/landing/testimonials-section"
import { EventsSection } from "@/components/landing/events-section"
import { CTASection } from "@/components/landing/cta-section"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <StatsSection />
      <SampradaySection />
      <HowItWorks />
      <FeaturesSection />
      <SuccessStories />
      <TestimonialsSection />
      <EventsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
