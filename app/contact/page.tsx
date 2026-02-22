"use client"

import { Navbar } from "@/components/landing/navbar"
import { Footer } from "@/components/landing/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    detail: "support@vaishnavvivaah.com",
    sub: "We respond within 24 hours",
  },
  {
    icon: Phone,
    title: "Call Us",
    detail: "+91 98765 43210",
    sub: "Mon - Sat, 10 AM to 7 PM IST",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    detail: "Vrindavan, Uttar Pradesh",
    sub: "India - 281121",
  },
  {
    icon: Clock,
    title: "Support Hours",
    detail: "Monday - Saturday",
    sub: "10:00 AM - 7:00 PM IST",
  },
]

export default function ContactPage() {
  return (
    <main>
      <Navbar />

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Get in Touch
            </span>
            <h1 className="mt-4 font-serif text-4xl font-bold text-foreground md:text-5xl text-balance">
              We Are Here to Help
            </h1>
            <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
              Have a question, feedback, or need assistance? Our devotee support team is ready to
              help you on your journey.
            </p>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-5">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-border bg-card p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-foreground mb-6">
                  Send Us a Message
                </h2>
                <form
                  onSubmit={(e) => e.preventDefault()}
                  className="flex flex-col gap-5"
                >
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Full Name</Label>
                      <Input placeholder="Enter your name" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Email Address</Label>
                      <Input type="email" placeholder="your@email.com" />
                    </div>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Phone Number</Label>
                      <Input type="tel" placeholder="+91 XXXXX XXXXX" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-foreground">Subject</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="technical">Technical Support</SelectItem>
                          <SelectItem value="profile">Profile Assistance</SelectItem>
                          <SelectItem value="report">Report an Issue</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label className="text-foreground">Message</Label>
                    <textarea
                      rows={5}
                      placeholder="Describe your question or concern..."
                      className="flex min-h-[120px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button
                    type="submit"
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Send Message
                  </Button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-4">
                {contactInfo.map((info) => (
                  <div
                    key={info.title}
                    className="flex items-start gap-4 rounded-xl border border-border bg-card p-5"
                  >
                    <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-secondary">
                      <info.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{info.title}</h3>
                      <p className="mt-0.5 text-sm text-foreground">{info.detail}</p>
                      <p className="text-xs text-muted-foreground">{info.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* FAQ Link */}
              <div className="mt-6 rounded-xl border border-primary/20 bg-secondary p-6 text-center">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  Frequently Asked Questions
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Find instant answers to common questions about our platform, registration,
                  verification, and matchmaking process.
                </p>
                <Button
                  variant="outline"
                  className="mt-4 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  Visit Help Center
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
