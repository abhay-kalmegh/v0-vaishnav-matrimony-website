"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Link from "next/link"
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
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react"
import { useAuth } from "@/lib/context/auth-context"
import authAPI from "@/lib/api/auth"
import profilesAPI from "@/lib/api/profiles"
import apiClient, { getErrorMessage, unwrapList } from "@/lib/api"
import {
  RegistrationForm,
  WIZARD_STEPS,
  accountPayload,
  emptyForm,
  firstIncompleteStep,
  formFromSaved,
  profilePatch,
  validateStep,
} from "@/lib/registration"

interface StepProps {
  form: RegistrationForm
  set: (key: keyof RegistrationForm, value: string | boolean) => void
  sampradays: { id: string; name: string }[]
  mobile: string
}

const steps = [
  { id: 1, title: "Personal Details", subtitle: "Basic information about you" },
  { id: 2, title: "Contact & Location", subtitle: "How to reach you" },
  { id: 3, title: "Education & Career", subtitle: "Your professional background" },
  { id: 4, title: "Family Details", subtitle: "About your family" },
  { id: 5, title: "Spiritual Profile", subtitle: "Your Vaishnav identity" },
  { id: 6, title: "Partner Preferences", subtitle: "What you seek in a partner" },
]

export default function RegisterPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading, login, sendOtp, refreshUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [form, setForm] = useState<RegistrationForm>(emptyForm())
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [sampradays, setSampradays] = useState<{ id: string; name: string }[]>([])
  const [resumed, setResumed] = useState(false)

  // phone verification (shown until the visitor has a signed-in session)
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [verifying, setVerifying] = useState(false)

  const set = (key: keyof RegistrationForm, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      if (!e[key as string]) return e
      const { [key as string]: _drop, ...rest } = e
      return rest
    })
  }

  useEffect(() => {
    if (cooldown <= 0) return
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [cooldown])

  // Signed-in visitors resume where they left off (also how the profile guard sends people here).
  useEffect(() => {
    if (isLoading || !isAuthenticated || resumed) return
    setResumed(true)
    // Opening /register with an account that is already complete (typed URL, old bookmark):
    // nothing to do here. Checked once, on arrival only - becoming complete *during* the
    // wizard (after step 4) must not eject the member before the optional steps 5-6.
    if (user?.profile_completed) {
      router.replace("/dashboard")
      return
    }
    ;(async () => {
      try {
        const profile = await profilesAPI.getMyProfile()
        const saved = formFromSaved(user, profile)
        setForm(saved)
        setCurrentStep(firstIncompleteStep(saved))
      } catch {
        /* start from step 1 */
      }
    })()
  }, [isLoading, isAuthenticated, resumed, user])

  useEffect(() => {
    if (!isAuthenticated) return
    apiClient
      .get("/spirituality/sampraday/")
      .then((r) => setSampradays(unwrapList(r.data)))
      .catch(() => setSampradays([]))
  }, [isAuthenticated])

  const handleSendOtp = async () => {
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setErrors({ phone: "Enter a valid 10-digit mobile number" })
      return
    }
    setErrors({})
    try {
      await sendOtp(phone)
      setOtpSent(true)
      setCooldown(60)
    } catch (e: any) {
      const wait = e?.response?.data?.retry_after
      if (wait) setCooldown(Number(wait))
    }
  }

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: "Enter the 6-digit OTP" })
      return
    }
    setVerifying(true)
    try {
      await login(phone, otp)
      setErrors({})
    } catch {
      /* the auth context already showed the server message */
    } finally {
      setVerifying(false)
    }
  }

  /** Saves one step (account + profile). Safe to repeat: the endpoints are idempotent. */
  const saveStep = async (step: number) => {
    await authAPI.register(accountPayload(form) as any)
    const patch = profilePatch(step, form)
    if (Object.keys(patch).length) await profilesAPI.completeProfileSetup(patch)
  }

  const handleNext = async () => {
    const found = validateStep(currentStep, form)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    try {
      await saveStep(currentStep)
      setCurrentStep((s) => Math.min(s + 1, WIZARD_STEPS))
      window.scrollTo?.({ top: 0 })
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not save this step. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    const found = validateStep(WIZARD_STEPS, form)
    setErrors(found)
    if (Object.keys(found).length) return
    setSaving(true)
    try {
      await saveStep(WIZARD_STEPS)
      await refreshUser()
      toast.success("Your profile is saved. Welcome to Vaishnav Vivaah!")
      router.push("/dashboard")
    } catch (e) {
      toast.error(getErrorMessage(e, "Could not finish registration. Please try again."))
    } finally {
      setSaving(false)
    }
  }

  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1))
  const mobile = user?.mobile_number ?? ""
  const errorList = Object.values(errors)

  if (!isLoading && !isAuthenticated) {
    return (
      <VerifyPhone
        phone={phone}
        otp={otp}
        otpSent={otpSent}
        cooldown={cooldown}
        verifying={verifying}
        error={errors.phone || errors.otp}
        onPhone={setPhone}
        onOtp={setOtp}
        onSend={handleSendOtp}
        onVerify={handleVerify}
      />
    )
  }
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-5 w-5 text-primary-foreground"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" />
                <path d="M12 8c-1.5 0-3 1-3 2.5S10.5 13 12 13s3-1 3-2.5S13.5 8 12 8z" />
                <path d="M12 13v5" />
              </svg>
            </div>
            <span className="font-serif text-lg font-bold text-foreground">Vaishnav Vivaah</span>
          </Link>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        {/* Step Indicators */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, i) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all ${
                      currentStep > step.id
                        ? "border-primary bg-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "border-primary bg-card text-primary"
                          : "border-border bg-card text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
                  </div>
                  <span className="mt-2 hidden text-xs font-medium text-muted-foreground md:block">
                    {step.title}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-0.5 w-8 transition-all md:w-16 lg:w-24 ${
                      currentStep > step.id ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Title */}
        <div className="mb-8">
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {steps[currentStep - 1].title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {steps[currentStep - 1].subtitle}
          </p>
        </div>

        {/* Form Content */}
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          {errorList.length > 0 && (
            <div role="alert" className="mb-6 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <p className="mb-1 font-medium">Please fix the following:</p>
              <ul className="list-disc pl-5">
                {errorList.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          )}
          {(() => {
            const p = { form, set, sampradays, mobile }
            return (
              <>
                {currentStep === 1 && <Step1PersonalDetails {...p} />}
                {currentStep === 2 && <Step2Contact {...p} />}
                {currentStep === 3 && <Step3Education {...p} />}
                {currentStep === 4 && <Step4Family {...p} />}
                {currentStep === 5 && <Step5Spiritual {...p} />}
                {currentStep === 6 && <Step6Preferences {...p} />}
              </>
            )
          })()}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 1 || saving}
            className="gap-2 border-border text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
          {currentStep < 6 ? (
            <Button
              onClick={handleNext}
              disabled={saving}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? "Saving..." : "Save & Continue"}
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={saving}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              {saving ? "Saving..." : "Complete Registration"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function VerifyPhone(props: {
  phone: string
  otp: string
  otpSent: boolean
  cooldown: number
  verifying: boolean
  error?: string
  onPhone: (v: string) => void
  onOtp: (v: string) => void
  onSend: () => void
  onVerify: () => void
}) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-lg font-bold text-foreground">Vaishnav Vivaah</Link>
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Already have an account? Sign In
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-md px-6 py-12">
        <h1 className="font-serif text-2xl font-bold text-foreground">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify your mobile number to begin. We will send a one-time password.
        </p>
        <div className="mt-8 flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="reg-phone" className="text-foreground">Mobile Number</Label>
            <div className="flex gap-2">
              <div className="flex h-10 items-center rounded-lg border border-input bg-secondary px-3 text-sm text-muted-foreground">+91</div>
              <Input
                id="reg-phone"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                autoComplete="tel-national"
                placeholder="10-digit mobile number"
                value={props.phone}
                onChange={(e) => props.onPhone(e.target.value.replace(/\D/g, ""))}
                disabled={props.otpSent}
                className="flex-1"
              />
            </div>
          </div>
          {props.otpSent && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="reg-otp" className="text-foreground">One-Time Password</Label>
              <Input
                id="reg-otp"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="6-digit OTP"
                value={props.otp}
                onChange={(e) => props.onOtp(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          )}
          {props.error && (
            <p role="alert" className="text-sm text-destructive">{props.error}</p>
          )}
          {!props.otpSent ? (
            <Button onClick={props.onSend} disabled={props.cooldown > 0} className="bg-primary text-primary-foreground hover:bg-primary/90">
              Send OTP
            </Button>
          ) : (
            <>
              <Button onClick={props.onVerify} disabled={props.verifying} className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {props.verifying && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify & Continue
              </Button>
              <button
                type="button"
                onClick={props.onSend}
                disabled={props.cooldown > 0}
                className="text-sm font-medium text-primary hover:underline disabled:text-muted-foreground disabled:no-underline"
              >
                {props.cooldown > 0 ? `Resend OTP in ${props.cooldown}s` : "Resend OTP"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1PersonalDetails({ form, set, sampradays, mobile }: StepProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profileFor" className="text-foreground">Profile Created For</Label>
        <Select value={form.profile_for || undefined} onValueChange={(v) => set("profile_for", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="self">Self</SelectItem>
            <SelectItem value="son">Son</SelectItem>
            <SelectItem value="daughter">Daughter</SelectItem>
            <SelectItem value="brother">Brother</SelectItem>
            <SelectItem value="sister">Sister</SelectItem>
            <SelectItem value="relative">Relative</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="gender" className="text-foreground">Gender</Label>
        <Select value={form.gender || undefined} onValueChange={(v) => set("gender", v)}>
          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male (Groom)</SelectItem>
            <SelectItem value="female">Female (Bride)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="firstName" className="text-foreground">First Name</Label>
        <Input value={form.first_name ?? ""} onChange={(e) => set("first_name", e.target.value)} id="firstName" placeholder="Enter first name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
        <Input value={form.last_name ?? ""} onChange={(e) => set("last_name", e.target.value)} id="lastName" placeholder="Enter last name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="dob" className="text-foreground">Date of Birth</Label>
        <Input value={form.date_of_birth ?? ""} onChange={(e) => set("date_of_birth", e.target.value)} id="dob" type="date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="height" className="text-foreground">Height</Label>
        <Select value={form.height || undefined} onValueChange={(v) => set("height", v)}>
          <SelectTrigger><SelectValue placeholder="Select height" /></SelectTrigger>
          <SelectContent>
            {["4'6\"", "4'7\"", "4'8\"", "4'9\"", "4'10\"", "4'11\"", "5'0\"", "5'1\"", "5'2\"", "5'3\"", "5'4\"", "5'5\"", "5'6\"", "5'7\"", "5'8\"", "5'9\"", "5'10\"", "5'11\"", "6'0\"", "6'1\"", "6'2\"", "6'3\"", "6'4\""].map((h) => (
              <SelectItem key={h} value={h}>{h}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="maritalStatus" className="text-foreground">Marital Status</Label>
        <Select value={form.marital_status || undefined} onValueChange={(v) => set("marital_status", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="never-married">Never Married</SelectItem>
            <SelectItem value="divorced">Divorced</SelectItem>
            <SelectItem value="widowed">Widowed</SelectItem>
            <SelectItem value="annulled">Annulled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="manglik" className="text-foreground">Manglik Status</Label>
        <Select value={form.manglik_status || undefined} onValueChange={(v) => set("manglik_status", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
            <SelectItem value="partial">Partial (Anshik)</SelectItem>
            <SelectItem value="dont-know">{"Don't Know"}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label htmlFor="about" className="text-foreground">About Yourself</Label>
        <textarea value={form.about_me ?? ""} onChange={(e) => set("about_me", e.target.value)}
          id="about"
          rows={3}
          placeholder="Tell us about yourself, your values, and what makes you unique..."
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}

function Step2Contact({ form, set, sampradays, mobile }: StepProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Mobile Number</Label>
        <div className="flex gap-2">
          <div className="flex h-10 items-center justify-center rounded-lg border border-input bg-secondary px-3 text-sm text-muted-foreground">+91</div>
          <Input type="tel" value={mobile} readOnly disabled aria-label="Verified mobile number" className="flex-1" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Email Address</Label>
        <Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} type="email" placeholder="your@email.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Country</Label>
        <Select value={form.country || undefined} onValueChange={(v) => set("country", v)}>
          <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="india">India</SelectItem>
            <SelectItem value="usa">United States</SelectItem>
            <SelectItem value="uk">United Kingdom</SelectItem>
            <SelectItem value="canada">Canada</SelectItem>
            <SelectItem value="australia">Australia</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">State</Label>
        <Input value={form.state ?? ""} onChange={(e) => set("state", e.target.value)} placeholder="Enter state" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Current City</Label>
        <Input value={form.current_city ?? ""} onChange={(e) => set("current_city", e.target.value)} placeholder="Enter current city" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Permanent Address</Label>
        <Input value={form.permanent_address ?? ""} onChange={(e) => set("permanent_address", e.target.value)} placeholder="Enter permanent address" />
      </div>
    </div>
  )
}

function Step3Education({ form, set, sampradays, mobile }: StepProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Highest Qualification</Label>
        <Select value={form.qualification || undefined} onValueChange={(v) => set("qualification", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="high-school">High School</SelectItem>
            <SelectItem value="diploma">Diploma</SelectItem>
            <SelectItem value="bachelors">{"Bachelor's Degree"}</SelectItem>
            <SelectItem value="masters">{"Master's Degree"}</SelectItem>
            <SelectItem value="phd">PhD / Doctorate</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Field of Study</Label>
        <Input value={form.field_of_study ?? ""} onChange={(e) => set("field_of_study", e.target.value)} placeholder="e.g. Computer Science, Medicine" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Occupation</Label>
        <Select value={form.occupation || undefined} onValueChange={(v) => set("occupation", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="private">Private Sector</SelectItem>
            <SelectItem value="government">Government</SelectItem>
            <SelectItem value="business">Business / Self-Employed</SelectItem>
            <SelectItem value="professional">Professional (Doctor, Lawyer)</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="homemaker">Homemaker</SelectItem>
            <SelectItem value="temple-service">Temple Service / Seva</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Company / Business Name</Label>
        <Input value={form.company_name ?? ""} onChange={(e) => set("company_name", e.target.value)} placeholder="Enter company name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Annual Income Range</Label>
        <Select value={form.income_range || undefined} onValueChange={(v) => set("income_range", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="below-3">Below 3 Lakhs</SelectItem>
            <SelectItem value="3-5">3 - 5 Lakhs</SelectItem>
            <SelectItem value="5-10">5 - 10 Lakhs</SelectItem>
            <SelectItem value="10-20">10 - 20 Lakhs</SelectItem>
            <SelectItem value="20-50">20 - 50 Lakhs</SelectItem>
            <SelectItem value="50-plus">50+ Lakhs</SelectItem>
            <SelectItem value="no-disclose">Prefer not to disclose</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Work Location</Label>
        <Input value={form.work_location ?? ""} onChange={(e) => set("work_location", e.target.value)} placeholder="Enter work city / location" />
      </div>
    </div>
  )
}

function Step4Family({ form, set, sampradays, mobile }: StepProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Father's Name"}</Label>
        <Input value={form.father_name ?? ""} onChange={(e) => set("father_name", e.target.value)} placeholder="Enter father's name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Father's Occupation"}</Label>
        <Input value={form.father_occupation ?? ""} onChange={(e) => set("father_occupation", e.target.value)} placeholder="Enter father's occupation" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Mother's Name"}</Label>
        <Input value={form.mother_name ?? ""} onChange={(e) => set("mother_name", e.target.value)} placeholder="Enter mother's name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Mother's Occupation"}</Label>
        <Input value={form.mother_occupation ?? ""} onChange={(e) => set("mother_occupation", e.target.value)} placeholder="Enter mother's occupation" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Number of Siblings</Label>
        <Select value={form.siblings || undefined} onValueChange={(v) => set("siblings", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <SelectItem key={n} value={String(n)}>{n === 0 ? "None" : n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Family Type</Label>
        <Select value={form.family_type || undefined} onValueChange={(v) => set("family_type", v)}>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="joint">Joint Family</SelectItem>
            <SelectItem value="nuclear">Nuclear Family</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label className="text-foreground">Family Spiritual Background</Label>
        <textarea value={form.family_spiritual_background ?? ""} onChange={(e) => set("family_spiritual_background", e.target.value)}
          rows={3}
          placeholder="Describe your family's spiritual practices, temple associations, and devotional lifestyle..."
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}

function Step5Spiritual({ form, set, sampradays, mobile }: StepProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Sampraday & Guru */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Spiritual Identity</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Which Sampraday do you belong to?</Label>
            <Select value={form.sampraday || undefined} onValueChange={(v) => set("sampraday", v)}>
              <SelectTrigger><SelectValue placeholder="Select Sampraday" /></SelectTrigger>
              <SelectContent>
                {sampradays.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Are you initiated (Diksha)?</Label>
            <Select value={form.initiated || undefined} onValueChange={(v) => set("initiated", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="in-process">In Process</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Temple / Organization</Label>
            <Input value={form.temple ?? ""} onChange={(e) => set("temple", e.target.value)} placeholder="Enter temple or spiritual organization" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Years of Association</Label>
            <Select value={form.years || undefined} onValueChange={(v) => set("years", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="0-2">0 - 2 years</SelectItem>
                <SelectItem value="3-5">3 - 5 years</SelectItem>
                <SelectItem value="6-10">6 - 10 years</SelectItem>
                <SelectItem value="10-plus">10+ years</SelectItem>
                <SelectItem value="since-birth">Since Birth</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Daily Practices */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Daily Spiritual Practices</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Do you chant mala daily?</Label>
            <Select value={form.chants_mala || undefined} onValueChange={(v) => set("chants_mala", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="sometimes">Sometimes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">How many rounds daily?</Label>
            <Select value={form.mala_rounds || undefined} onValueChange={(v) => set("mala_rounds", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1-4">1 - 4 rounds</SelectItem>
                <SelectItem value="4-8">4 - 8 rounds</SelectItem>
                <SelectItem value="8-16">8 - 16 rounds</SelectItem>
                <SelectItem value="16-plus">16+ rounds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Do you follow Ekadashi fasting?</Label>
            <Select value={form.ekadashi || undefined} onValueChange={(v) => set("ekadashi", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="always">Always</SelectItem>
                <SelectItem value="sometimes">Sometimes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Do you perform daily puja / seva?</Label>
            <Select value={form.puja || undefined} onValueChange={(v) => set("puja", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, daily</SelectItem>
                <SelectItem value="sometimes">Sometimes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Lifestyle */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Lifestyle Discipline</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Are you vegetarian?</Label>
            <Select value={form.vegetarian || undefined} onValueChange={(v) => set("vegetarian", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, strict vegetarian</SelectItem>
                <SelectItem value="vegan">Vegan</SelectItem>
                <SelectItem value="occasional">Occasional non-veg</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Onion / Garlic consumption?</Label>
            <Select value={form.onion_garlic || undefined} onValueChange={(v) => set("onion_garlic", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No (Sattvic diet)</SelectItem>
                <SelectItem value="sometimes">Sometimes</SelectItem>
                <SelectItem value="yes">Yes, regularly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Alcohol / Smoking?</Label>
            <Select value={form.alcohol_smoking || undefined} onValueChange={(v) => set("alcohol_smoking", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No, never</SelectItem>
                <SelectItem value="quit">Quit</SelectItem>
                <SelectItem value="occasionally">Occasionally</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Do you follow Prasad-only diet?</Label>
            <Select value={form.prasad || undefined} onValueChange={(v) => set("prasad", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, strictly</SelectItem>
                <SelectItem value="mostly">Mostly</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step6Preferences({ form, set, sampradays, mobile }: StepProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* Spiritual Preferences */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Spiritual Preferences</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Preferred Sampraday</Label>
            <Select value={form.pref_sampraday || undefined} onValueChange={(v) => set("pref_sampraday", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="same">Same as mine</SelectItem>
                <SelectItem value="any-vaishnav">Any Vaishnav Sampraday</SelectItem>
                {sampradays.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
                <SelectItem value="open">Open to all</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Minimum Spiritual Practice Level</Label>
            <Select value={form.pref_level || undefined} onValueChange={(v) => set("pref_level", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="very-strict">Very Strict Devotee</SelectItem>
                <SelectItem value="regular">Regular Practitioner</SelectItem>
                <SelectItem value="occasional">Occasional Practitioner</SelectItem>
                <SelectItem value="open">Open / No Preference</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Dietary Expectation</Label>
            <Select value={form.pref_diet || undefined} onValueChange={(v) => set("pref_diet", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="sattvic">Sattvic (No onion/garlic)</SelectItem>
                <SelectItem value="vegetarian">Vegetarian</SelectItem>
                <SelectItem value="flexible">Flexible</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Personal Preferences */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Personal Preferences</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Preferred Age Range</Label>
            <div className="flex items-center gap-2">
              <Input value={form.pref_age_min ?? ""} onChange={(e) => set("pref_age_min", e.target.value)} type="number" placeholder="Min" className="w-24" />
              <span className="text-muted-foreground">to</span>
              <Input value={form.pref_age_max ?? ""} onChange={(e) => set("pref_age_max", e.target.value)} type="number" placeholder="Max" className="w-24" />
              <span className="text-sm text-muted-foreground">years</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Preferred Height Range</Label>
            <div className="flex items-center gap-2">
              <Input value={form.pref_height_min ?? ""} onChange={(e) => set("pref_height_min", e.target.value)} placeholder="Min" className="w-24" />
              <span className="text-muted-foreground">to</span>
              <Input value={form.pref_height_max ?? ""} onChange={(e) => set("pref_height_max", e.target.value)} placeholder="Max" className="w-24" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Education Preference</Label>
            <Select value={form.pref_education || undefined} onValueChange={(v) => set("pref_education", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="bachelors">{"Bachelor's & above"}</SelectItem>
                <SelectItem value="masters">{"Master's & above"}</SelectItem>
                <SelectItem value="phd">PhD / Doctorate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Location Preference</Label>
            <Input value={form.pref_location ?? ""} onChange={(e) => set("pref_location", e.target.value)} placeholder="e.g. Gujarat, Maharashtra, Any" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Marital Status Preference</Label>
            <Select value={form.pref_marital || undefined} onValueChange={(v) => set("pref_marital", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="never-married">Never Married only</SelectItem>
                <SelectItem value="open">Open to all</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Declaration */}
      <div className="rounded-lg border border-primary/20 bg-secondary p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Declaration & Community Commitment</h3>
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <Checkbox id="values" checked={form.decl_values} onCheckedChange={(c) => set("decl_values", c === true)} />
            <label htmlFor="values" className="text-sm leading-relaxed text-foreground cursor-pointer">
              I follow Vaishnav values respectfully and will uphold the dignity of this platform.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="dignity" checked={form.decl_dignity} onCheckedChange={(c) => set("decl_dignity", c === true)} />
            <label htmlFor="dignity" className="text-sm leading-relaxed text-foreground cursor-pointer">
              I agree to maintain spiritual dignity and respectful communication on this platform.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="truth" checked={form.decl_truth} onCheckedChange={(c) => set("decl_truth", c === true)} />
            <label htmlFor="truth" className="text-sm leading-relaxed text-foreground cursor-pointer">
              I confirm that all information provided above is true and accurate to the best of my knowledge.
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
