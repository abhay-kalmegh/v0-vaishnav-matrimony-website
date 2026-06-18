import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Heart, Users, Shield } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      {/* Subtle decorative pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C4582B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-16 lg:pb-28 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Content */}
          <div className="flex flex-col gap-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-secondary px-4 py-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="text-xs font-medium text-secondary-foreground">
                Trusted by 10,000+ Krishna Devotee Families
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <h1 className="font-serif text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl lg:text-6xl text-balance">
                Find Your Spiritually{" "}
                <span className="text-primary">Aligned</span>{" "}
                Life Partner
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                A sacred matrimony platform exclusively for Vaishnav Sampraday followers.
                Connect with devotees who share your love for Shree Krishna and Radha Rani.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-8">
                  Begin Your Journey
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="border-border text-foreground hover:bg-secondary gap-2">
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Heart className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">5,000+</p>
                  <p className="text-xs text-muted-foreground">Matches Made</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">50,000+</p>
                  <p className="text-xs text-muted-foreground">Active Profiles</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                  <Shield className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground">Verified Profiles</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-2xl shadow-primary/10">
              <Image
                src="/images/hero-temple.jpg"
                alt="Sacred temple representing Vaishnav spiritual traditions"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/30 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="rounded-xl bg-card/90 backdrop-blur-sm p-4 border border-border">
                  <p className="font-serif text-sm italic text-card-foreground leading-relaxed">
                    {'"Where there is Krishna, there is dharma. Where there is dharma, there is victory."'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {"- Bhagavad Gita"}
                  </p>
                </div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-accent/10 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  )
}
