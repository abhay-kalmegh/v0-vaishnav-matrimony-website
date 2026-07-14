"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

const testimonials = [
  {
    name: "Rajesh Sharma",
    role: "Father of the Bride",
    location: "Ahmedabad, Gujarat",
    text: "As a parent, finding a match within our Pushtimarg tradition was my top priority. Vaishnav Vivaah made it effortless. The Sampraday filter and spiritual compatibility scoring helped us find the perfect family for our daughter.",
    rating: 5,
  },
  {
    name: "Priya Devi Dasi",
    role: "ISKCON Devotee",
    location: "Vrindavan, UP",
    text: "I had tried other matrimony sites but none understood the importance of spiritual practices in a match. Here, I could specify my chanting rounds, Ekadashi fasting habits, and guru lineage. My match was perfect in every way.",
    rating: 5,
  },
  {
    name: "Mohan Das",
    role: "Groom",
    location: "Mumbai, Maharashtra",
    text: "The verification process gave us confidence that profiles were genuine. The chat approval system ensured respectful communication. I found my wife within 3 months of joining. Truly Krishna's mercy.",
    rating: 5,
  },
  {
    name: "Sunita Ben Patel",
    role: "Mother of the Groom",
    location: "Surat, Gujarat",
    text: "I managed my son's profile as a parent. The platform was very easy to use and the parent-managed profile feature was exactly what traditional families like ours needed. Highly recommended.",
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prev = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  const testimonial = testimonials[currentIndex]

  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Testimonials
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            Voices from Our Community
          </h2>
        </div>

        {/* Testimonial Card */}
        <div className="mx-auto mt-14 max-w-3xl">
          <div className="relative rounded-xl border border-border bg-card p-8 md:p-12">
            {/* Quote mark */}
            <div className="absolute -top-4 left-8 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151C7.547 6.068 5.983 8.789 5.983 11H10v10H0z" />
              </svg>
            </div>

            <div className="flex flex-col gap-6">
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-accent text-accent" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-serif text-lg italic leading-relaxed text-foreground md:text-xl">
                {`"${testimonial.text}"`}
              </p>

              {/* Author */}
              <div className="flex items-center justify-between border-t border-border pt-6">
                <div>
                  <p className="font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} &middot; {testimonial.location}
                  </p>
                </div>

                {/* Nav Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prev}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
                    aria-label="Previous testimonial"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
                    aria-label="Next testimonial"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Dots */}
          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "w-8 bg-primary" : "w-2 bg-border"
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
