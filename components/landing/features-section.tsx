import {
  Sparkles,
  ShieldCheck,
  Filter,
  BookOpen,
  Bell,
  Lock,
} from "lucide-react"

const features = [
  {
    icon: Sparkles,
    title: "Spiritual Compatibility Score",
    description:
      "Our unique algorithm matches you based on Sampraday alignment, daily practices, lifestyle discipline, and spiritual values.",
  },
  {
    icon: Filter,
    title: "Guru & Sampraday Filtering",
    description:
      "Search by specific Sampraday, Guru lineage, temple association, and devotion level to find the most compatible match.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Profiles Only",
    description:
      "Every profile undergoes admin moderation and optional document verification to maintain community trust and safety.",
  },
  {
    icon: BookOpen,
    title: "Horoscope & Kundli Matching",
    description:
      "Upload your horoscope for optional Kundli matching compatibility alongside spiritual alignment scores.",
  },
  {
    icon: Bell,
    title: "Parent-Managed Profiles",
    description:
      "Parents and guardians can create and manage profiles on behalf of their children, honoring traditional family involvement.",
  },
  {
    icon: Lock,
    title: "Privacy & Photo Control",
    description:
      "Full control over who sees your photos and personal details. Accept or reject chat requests before sharing any information.",
  },
]

export function FeaturesSection() {
  return (
    <section className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Platform Features
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            Built for Devotees, By Devotees
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Every feature is designed with spiritual sensitivity, cultural respect, and the unique
            needs of the Vaishnav community in mind.
          </p>
        </div>

        {/* Features Grid */}
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary transition-colors group-hover:bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
