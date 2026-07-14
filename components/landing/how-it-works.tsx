import { UserPlus, Search, Heart, MessageCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Create Your Profile",
    description:
      "Register with your personal, spiritual, and family details. Share your Sampraday, daily practices, and what you seek in a partner.",
    step: "01",
  },
  {
    icon: Search,
    title: "Discover Matches",
    description:
      "Our spiritual compatibility algorithm finds profiles aligned with your values, Sampraday, lifestyle discipline, and preferences.",
    step: "02",
  },
  {
    icon: Heart,
    title: "Express Interest",
    description:
      "Send interest to profiles you connect with. Both parties must accept before any contact is shared, ensuring mutual respect.",
    step: "03",
  },
  {
    icon: MessageCircle,
    title: "Connect & Meet",
    description:
      "Once matched, communicate through our secure platform. Arrange meetings with family involvement for a traditional approach.",
    step: "04",
  },
]

export function HowItWorks() {
  return (
    <section className="bg-background py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Simple Process
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold text-foreground md:text-4xl text-balance">
            Your Journey to a Sacred Union
          </h2>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            Finding your spiritually aligned life partner is simple, respectful, and secure.
          </p>
        </div>

        {/* Steps */}
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="group relative flex flex-col items-center text-center">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-[calc(50%+40px)] top-10 hidden h-[2px] w-[calc(100%-80px)] bg-border lg:block" />
              )}

              {/* Icon */}
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary transition-colors group-hover:bg-primary/10">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {step.step}
                </span>
              </div>

              <h3 className="mt-6 font-serif text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
