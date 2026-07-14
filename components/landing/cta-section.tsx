import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="bg-secondary py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-2xl bg-foreground p-10 md:p-16">
          {/* Decorative pattern */}
          <div className="pointer-events-none absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Ccircle cx='20' cy='20' r='4'/%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative flex flex-col items-center gap-8 text-center">
            <h2 className="font-serif text-3xl font-bold text-background md:text-4xl lg:text-5xl text-balance">
              Begin Your Sacred Journey Today
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-background/70">
              Join thousands of Krishna devotee families who have found spiritually aligned life
              partners through Vaishnav Vivaah. Registration is free and takes just minutes.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 px-10"
                >
                  Register as Bride / Groom
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/register?role=parent">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-background/20 text-background hover:bg-background/10 gap-2"
                >
                  Register as Parent / Guardian
                </Button>
              </Link>
            </div>
            <p className="text-xs text-background/50">
              Free registration. No credit card required. Your privacy is our priority.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
