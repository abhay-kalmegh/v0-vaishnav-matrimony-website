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
  },
  {
    names: "Meera & Shyam",
    sampraday: "Pushtimarg",
    image: "/images/couple-2.jpg",
    quote:
      "Our families were looking for a match within Pushtimarg tradition. This platform made it so easy to filter by Sampraday and connect with aligned families.",
    marriageDate: "Married January 2025",
  },
  {
    names: "Rukmini & Krishna Das",
    sampraday: "Gaudiya Vaishnav",
    image: "/images/couple-3.jpg",
    quote:
      "The spiritual compatibility score was remarkably accurate. We share the same Guru lineage and our daily practices aligned perfectly. It was truly Krishna's arrangement.",
    marriageDate: "Married November 2024",
  },
]

export function SuccessStories() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Success Stories
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            Sacred Unions Made on Our Platform
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Thousands of devotee couples have found their life partners through Vaishnav Vivaah.
            Here are some of their beautiful stories.
          </p>
        </div>

        {/* Stories Grid */}
        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {stories.map((story) => (
            <div
              key={story.names}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={story.image}
                  alt={`${story.names} - ${story.sampraday} devotees`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {story.sampraday}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-4 p-6">
                <Quote className="h-6 w-6 text-accent" />
                <p className="text-sm italic leading-relaxed text-muted-foreground">
                  {story.quote}
                </p>
                <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <p className="font-serif font-semibold text-foreground">
                      {story.names}
                    </p>
                    <p className="text-xs text-muted-foreground">{story.marriageDate}</p>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
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
  )
}
