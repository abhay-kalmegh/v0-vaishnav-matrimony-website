import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Heart, Shield, Users, BookOpen, Star, Globe } from "lucide-react"

const values = [
  {
    icon: Heart,
    title: "Devotion First",
    description:
      "We believe that a marriage rooted in Krishna consciousness creates the strongest bond. Every feature we build prioritizes spiritual alignment.",
  },
  {
    icon: Shield,
    title: "Trust & Safety",
    description:
      "Every profile is verified by our team. We maintain the highest standards of authenticity and privacy to protect our community.",
  },
  {
    icon: Users,
    title: "Family Involvement",
    description:
      "We honor traditional family involvement in matchmaking. Parents and guardians can create and manage profiles, reflecting dharmic values.",
  },
  {
    icon: BookOpen,
    title: "Cultural Sensitivity",
    description:
      "Our platform understands the nuances of Vaishnav traditions, from Sampraday-specific practices to dietary preferences and guru lineage.",
  },
  {
    icon: Star,
    title: "Spiritual Compatibility",
    description:
      "Beyond basic matching, we evaluate spiritual practices, devotion level, and lifestyle discipline to ensure meaningful connections.",
  },
  {
    icon: Globe,
    title: "Global Community",
    description:
      "Serving devotees across 12+ countries, we connect the worldwide Vaishnav community while respecting regional traditions and customs.",
  },
]

const team = [
  { name: "Govind Das", role: "Founder & CEO", desc: "ISKCON devotee for 15+ years, passionate about connecting spiritual families." },
  { name: "Radha Devi", role: "Head of Community", desc: "Pushtimarg follower, ensures cultural sensitivity in every interaction." },
  { name: "Krishna Mohan", role: "CTO", desc: "Building technology that serves the devotee community with love and care." },
]

export default function AboutPage() {
  return (
    <main>
      <Navbar />

      {/* Hero */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            About Us
          </span>
          <h1 className="mt-4 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
            A Sacred Mission to Unite Devotee Hearts
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Vaishnav Vivaah was born from a simple yet profound realization: devotees deserve a
            matrimony platform that truly understands their spiritual values, practices, and the
            sacredness of marriage in Krishna consciousness.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="rounded-xl border border-border bg-card p-8 md:p-12">
            <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
              Our Story
            </h2>
            <div className="mt-6 flex flex-col gap-4 text-muted-foreground leading-relaxed">
              <p>
                Founded in 2023, Vaishnav Vivaah emerged when our founder, a devoted Krishna bhakta,
                experienced firsthand the challenge of finding a life partner who shared the same
                depth of spiritual practice and commitment to dharmic living.
              </p>
              <p>
                Mainstream matrimony platforms simply could not capture the essence of what makes a
                Vaishnav marriage sacred - the shared devotion to Shree Krishna, the alignment of
                daily spiritual practices, and the importance of Sampraday and Guru lineage.
              </p>
              <p>
                Today, we serve over 50,000 devotee families across 12 countries, with more than
                5,000 successful marriages - each one a testimony to the power of spiritual
                compatibility in creating lasting, loving unions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Our Values
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
              Built on Dharmic Principles
            </h2>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {value.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-secondary py-20 lg:py-28">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Our Team
            </span>
            <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl">
              Devotees Serving Devotees
            </h2>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-border bg-card p-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <h3 className="mt-4 font-serif text-lg font-semibold text-foreground">
                  {member.name}
                </h3>
                <p className="text-sm font-medium text-primary">{member.role}</p>
                <p className="mt-2 text-sm text-muted-foreground">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
