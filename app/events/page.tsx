import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { EventsSection } from "@/components/landing/events-section"
import { CTASection } from "@/components/landing/cta-section"

export default function EventsPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Community Events
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
            Satsang, Meet-Ups & Spiritual Gatherings
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Connect with devotee families in person through our organized community events,
            satsangs, and meet-ups across India and worldwide.
          </p>
        </div>
      </section>

      <EventsSection />
      <CTASection />
      <Footer />
    </main>
  )
}
