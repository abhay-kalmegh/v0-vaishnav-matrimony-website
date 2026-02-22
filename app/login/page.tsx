"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Phone, Mail, Shield } from "lucide-react"

export default function LoginPage() {
  const [loginMethod, setLoginMethod] = useState<"otp" | "email">("otp")
  const [otpSent, setOtpSent] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFFFFF' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 text-primary-foreground">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>
        </div>

        <div className="relative z-10 flex flex-col gap-6">
          <h1 className="font-serif text-4xl font-bold text-primary-foreground leading-tight">
            Welcome Back,<br />Devotee
          </h1>
          <p className="max-w-md text-lg text-primary-foreground/80 leading-relaxed">
            Continue your sacred journey of finding a spiritually aligned life partner on Vaishnav Vivaah.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-foreground/10">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-medium text-primary-foreground">100% Secure & Private</p>
              <p className="text-sm text-primary-foreground/60">Your data is encrypted and protected</p>
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-primary-foreground/40">
            Vaishnav Vivaah - Sacred Matrimony Platform
          </p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Back Link */}
          <Link
            href="/"
            className="mb-8 flex items-center gap-2 text-muted-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back to Home</span>
          </Link>

          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
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
              </svg>
            </div>
            <span className="font-serif text-xl font-bold text-foreground">Vaishnav Vivaah</span>
          </div>

          <h2 className="font-serif text-2xl font-bold text-foreground">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {"Don't have an account?"}{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register Free
            </Link>
          </p>

          {/* Login Method Toggle */}
          <div className="mt-8 flex rounded-lg border border-border bg-secondary p-1">
            <button
              onClick={() => { setLoginMethod("otp"); setOtpSent(false) }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                loginMethod === "otp"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Phone className="h-4 w-4" />
              OTP Login
            </button>
            <button
              onClick={() => { setLoginMethod("email"); setOtpSent(false) }}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md py-2.5 text-sm font-medium transition-all ${
                loginMethod === "email"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Mail className="h-4 w-4" />
              Email Login
            </button>
          </div>

          {/* Login Form */}
          <form className="mt-6 flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
            {loginMethod === "otp" ? (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="mobile" className="text-foreground">
                    Mobile Number
                  </Label>
                  <div className="flex gap-2">
                    <div className="flex h-10 items-center justify-center rounded-lg border border-input bg-secondary px-3 text-sm text-muted-foreground">
                      +91
                    </div>
                    <Input
                      id="mobile"
                      type="tel"
                      placeholder="Enter your mobile number"
                      className="flex-1"
                    />
                  </div>
                </div>

                {otpSent && (
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="otp" className="text-foreground">
                      Enter OTP
                    </Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      OTP sent to your mobile number.{" "}
                      <button className="text-primary hover:underline">Resend OTP</button>
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={() => setOtpSent(true)}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  {otpSent ? "Verify & Sign In" : "Send OTP"}
                </Button>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-foreground">
                    Email Address
                  </Label>
                  <Input id="email" type="email" placeholder="your@email.com" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-foreground">
                      Password
                    </Label>
                    <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="password" type="password" placeholder="Enter your password" />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  Sign In
                </Button>
              </>
            )}
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
