"use client"

import { useState } from "react"

const sampradays = [
  {
    name: "Pushtimarg",
    description:
      "Followers of Shri Vallabhacharya's path of grace, devoted to Shrinathji and the seva marg tradition.",
    icon: "🪷",
    profiles: "8,500+",
  },
  {
    name: "ISKCON",
    description:
      "International Society for Krishna Consciousness, following Srila Prabhupada's teachings worldwide.",
    icon: "🙏",
    profiles: "12,000+",
  },
  {
    name: "Gaudiya Vaishnav",
    description:
      "Followers of Sri Chaitanya Mahaprabhu, devoted to the divine love of Radha and Krishna.",
    icon: "📿",
    profiles: "6,200+",
  },
  {
    name: "Vallabh Sampraday",
    description:
      "Devotees of Shri Krishna through Shuddhadvaita philosophy, emphasizing love and devotion.",
    icon: "🪔",
    profiles: "5,800+",
  },
  {
    name: "Ramanandi",
    description:
      "Followers of Ramananda's tradition, devoted to Lord Rama and the path of bhakti.",
    icon: "🏛",
    profiles: "4,100+",
  },
  {
    name: "Other Traditions",
    description:
      "All other Krishna Bhakti followers and Vaishnav traditions are warmly welcome to join.",
    icon: "🙏",
    profiles: "9,400+",
  },
]

export function SampradaySection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our Community
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            Every Vaishnav Tradition, One Platform
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Whether you follow Pushtimarg, ISKCON, Gaudiya Vaishnav, or any other Krishna Bhakti
            tradition, find your perfect match within your spiritual community.
          </p>
        </div>

        {/* Sampraday Grid */}
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sampradays.map((s, i) => (
            <div
              key={s.name}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative flex flex-col gap-4 rounded-xl border p-6 transition-all duration-300 cursor-pointer ${
                hoveredIndex === i
                  ? "border-primary bg-card shadow-lg shadow-primary/5 -translate-y-1"
                  : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl" role="img" aria-label={s.name}>
                  {s.icon}
                </span>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                  {s.profiles} profiles
                </span>
              </div>
              <div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {s.name}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {s.description}
                </p>
              </div>
              <div className={`h-0.5 w-full rounded-full transition-all duration-300 ${
                hoveredIndex === i ? "bg-primary" : "bg-border"
              }`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
