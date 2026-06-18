const stats = [
  { value: "50,000+", label: "Registered Profiles" },
  { value: "5,000+", label: "Successful Marriages" },
  { value: "6", label: "Sampraday Communities" },
  { value: "12", label: "Countries Served" },
]

export function StatsSection() {
  return (
    <section className="bg-primary py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-serif text-3xl font-bold text-primary-foreground md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm text-primary-foreground/80">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
