import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { CTASection } from "@/components/landing/cta-section"
import Image from "next/image"
import { Quote } from "lucide-react"

const stories = [
  {
    names: "Radha & Govind",
    sampraday: "ISKCON",
    image: "/images/couple-1.jpg",
    quote:
      "We both chanted 16 rounds daily and followed Ekadashi. Vaishnav Vivaah understood that these values were non-negotiable for us. We found each other within weeks.",
    marriageDate: "Married March 2025",
    longQuote:
      "When I first registered on Vaishnav Vivaah, I was skeptical about finding a devotee who matched my level of spiritual practice. But the compatibility algorithm perfectly identified Govind's profile. Our first conversation was about our favorite Bhagavatam verses! It truly felt like Krishna's arrangement.",
  },
  {
    names: "Meera & Shyam",
    sampraday: "Pushtimarg",
    image: "/images/couple-2.jpg",
    quote:
      "Our families were looking for a match within Pushtimarg tradition. This platform made it so easy to filter by Sampraday and connect with aligned families.",
    marriageDate: "Married January 2025",
    longQuote:
      "As a Pushtimarg family, finding a match who understood Shrinathji seva and our traditions was essential. The Sampraday filter helped us find Shyam's family, who shared the same dedication to Thakorji seva. Our families connected instantly over shared values.",
  },
  {
    names: "Rukmini & Krishna Das",
    sampraday: "Gaudiya Vaishnav",
    image: "/images/couple-3.jpg",
    quote:
      "The spiritual compatibility score was remarkably accurate. We share the same Guru lineage and our daily practices aligned perfectly. It was truly Krishna's arrangement.",
    marriageDate: "Married November 2024",
    longQuote:
      "We both follow Gaudiya Vaishnav tradition and were searching for someone who takes daily sadhana seriously. The platform showed us how compatible we were in spiritual practices, lifestyle discipline, and family values. Our marriage has been a beautiful journey of shared devotion.",
  },
]

export default function SuccessStoriesPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Success Stories
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
            Sacred Unions Made on Our Platform
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Thousands of devotee couples have found their life partners through Vaishnav Vivaah.
            Read their inspiring stories of faith, devotion, and divine matchmaking.
          </p>
        </div>
      </section>

      {/* Stories */}
      <section className="bg-secondary py-16 lg:py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="flex flex-col gap-12">
            {stories.map((story, i) => (
              <div
                key={story.names}
                className={`flex flex-col gap-8 rounded-xl border border-border bg-card p-6 md:p-10 lg:flex-row ${
                  i % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl lg:w-96 lg:flex-shrink-0">
                  <Image
                    src={story.image}
                    alt={`${story.names} - ${story.sampraday}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-3 left-3">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                      {story.sampraday}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col justify-center gap-4">
                  <Quote className="h-8 w-8 text-accent" />
                  <p className="font-serif text-lg italic leading-relaxed text-foreground">
                    {`"${story.longQuote}"`}
                  </p>
                  <div className="flex items-center gap-4 border-t border-border pt-4">
                    <div>
                      <p className="font-serif text-lg font-semibold text-foreground">
                        {story.names}
                      </p>
                      <p className="text-sm text-muted-foreground">{story.marriageDate}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <svg
                          key={j}
                          className="h-4 w-4 text-accent"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  )
}
