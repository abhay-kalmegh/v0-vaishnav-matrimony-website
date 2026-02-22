"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Success Stories", href: "/success-stories" },
  { label: "Events", href: "#events" },
  { label: "Contact", href: "/contact" },
]

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-6 w-6 text-primary-foreground"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" />
              <path d="M12 8c-1.5 0-3 1-3 2.5S10.5 13 12 13s3-1 3-2.5S13.5 8 12 8z" />
              <path d="M12 13v5" />
              <path d="M9 16c0 1 1.5 2 3 2s3-1 3-2" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold tracking-tight text-foreground leading-tight">
              Vaishnav Vivaah
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Sacred Matrimony
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop CTAs */}
        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-foreground">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Register Free
            </Button>
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden text-foreground"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="border-t border-border bg-background px-6 py-4 lg:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full text-foreground">
                  Log In
                </Button>
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)}>
                <Button size="sm" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Register Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
