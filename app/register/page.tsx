"use client"

import { useState } from "react"
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
import { ArrowLeft, ArrowRight, Check } from "lucide-react"

const steps = [
  { id: 1, title: "Personal Details", subtitle: "Basic information about you" },
  { id: 2, title: "Contact & Location", subtitle: "How to reach you" },
  { id: 3, title: "Education & Career", subtitle: "Your professional background" },
  { id: 4, title: "Family Details", subtitle: "About your family" },
  { id: 5, title: "Spiritual Profile", subtitle: "Your Vaishnav identity" },
  { id: 6, title: "Partner Preferences", subtitle: "What you seek in a partner" },
]

export default function RegisterPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, 6))
  const goPrev = () => setCurrentStep((s) => Math.max(s - 1, 1))

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
          {currentStep === 1 && <Step1PersonalDetails />}
          {currentStep === 2 && <Step2Contact />}
          {currentStep === 3 && <Step3Education />}
          {currentStep === 4 && <Step4Family />}
          {currentStep === 5 && <Step5Spiritual />}
          {currentStep === 6 && <Step6Preferences />}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 1}
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
              onClick={goNext}
              className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
              <Check className="h-4 w-4" />
              Submit Registration
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

function Step1PersonalDetails() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="profileFor" className="text-foreground">Profile Created For</Label>
        <Select>
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
        <Select>
          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male (Groom)</SelectItem>
            <SelectItem value="female">Female (Bride)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="firstName" className="text-foreground">First Name</Label>
        <Input id="firstName" placeholder="Enter first name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
        <Input id="lastName" placeholder="Enter last name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="dob" className="text-foreground">Date of Birth</Label>
        <Input id="dob" type="date" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="height" className="text-foreground">Height</Label>
        <Select>
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
        <Select>
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
        <Select>
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
        <textarea
          id="about"
          rows={3}
          placeholder="Tell us about yourself, your values, and what makes you unique..."
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}

function Step2Contact() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Mobile Number</Label>
        <div className="flex gap-2">
          <div className="flex h-10 items-center justify-center rounded-lg border border-input bg-secondary px-3 text-sm text-muted-foreground">+91</div>
          <Input type="tel" placeholder="Enter mobile number" className="flex-1" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Email Address</Label>
        <Input type="email" placeholder="your@email.com" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Country</Label>
        <Select>
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
        <Input placeholder="Enter state" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Current City</Label>
        <Input placeholder="Enter current city" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Permanent Address</Label>
        <Input placeholder="Enter permanent address" />
      </div>
    </div>
  )
}

function Step3Education() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Highest Qualification</Label>
        <Select>
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
        <Input placeholder="e.g. Computer Science, Medicine" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Occupation</Label>
        <Select>
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
        <Input placeholder="Enter company name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Annual Income Range</Label>
        <Select>
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
        <Input placeholder="Enter work city / location" />
      </div>
    </div>
  )
}

function Step4Family() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Father's Name"}</Label>
        <Input placeholder="Enter father's name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Father's Occupation"}</Label>
        <Input placeholder="Enter father's occupation" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Mother's Name"}</Label>
        <Input placeholder="Enter mother's name" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">{"Mother's Occupation"}</Label>
        <Input placeholder="Enter mother's occupation" />
      </div>
      <div className="flex flex-col gap-2">
        <Label className="text-foreground">Number of Siblings</Label>
        <Select>
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
        <Select>
          <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="joint">Joint Family</SelectItem>
            <SelectItem value="nuclear">Nuclear Family</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2">
        <Label className="text-foreground">Family Spiritual Background</Label>
        <textarea
          rows={3}
          placeholder="Describe your family's spiritual practices, temple associations, and devotional lifestyle..."
          className="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
    </div>
  )
}

function Step5Spiritual() {
  return (
    <div className="flex flex-col gap-8">
      {/* Sampraday & Guru */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Spiritual Identity</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Which Sampraday do you belong to?</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select Sampraday" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pushtimarg">Pushtimarg</SelectItem>
                <SelectItem value="iskcon">ISKCON</SelectItem>
                <SelectItem value="gaudiya">Gaudiya Vaishnav</SelectItem>
                <SelectItem value="vallabh">Vallabh Sampraday</SelectItem>
                <SelectItem value="ramanandi">Ramanandi</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Are you initiated (Diksha)?</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="in-process">In Process</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Guru Name</Label>
            <Input placeholder="Enter your Guru's name" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Temple / Organization</Label>
            <Input placeholder="Enter temple or spiritual organization" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Years of Association</Label>
            <Select>
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
            <Select>
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
            <Select>
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
            <Select>
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
            <Select>
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
            <Select>
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
            <Select>
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
            <Select>
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
            <Select>
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

function Step6Preferences() {
  return (
    <div className="flex flex-col gap-8">
      {/* Spiritual Preferences */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Spiritual Preferences</h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Preferred Sampraday</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="same">Same as mine</SelectItem>
                <SelectItem value="any-vaishnav">Any Vaishnav Sampraday</SelectItem>
                <SelectItem value="pushtimarg">Pushtimarg only</SelectItem>
                <SelectItem value="iskcon">ISKCON only</SelectItem>
                <SelectItem value="gaudiya">Gaudiya Vaishnav only</SelectItem>
                <SelectItem value="open">Open to all</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Minimum Spiritual Practice Level</Label>
            <Select>
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
            <Select>
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
              <Input type="number" placeholder="Min" className="w-24" />
              <span className="text-muted-foreground">to</span>
              <Input type="number" placeholder="Max" className="w-24" />
              <span className="text-sm text-muted-foreground">years</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Preferred Height Range</Label>
            <div className="flex items-center gap-2">
              <Input placeholder="Min" className="w-24" />
              <span className="text-muted-foreground">to</span>
              <Input placeholder="Max" className="w-24" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Education Preference</Label>
            <Select>
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
            <Input placeholder="e.g. Gujarat, Maharashtra, Any" />
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-foreground">Marital Status Preference</Label>
            <Select>
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
            <Checkbox id="values" />
            <label htmlFor="values" className="text-sm leading-relaxed text-foreground cursor-pointer">
              I follow Vaishnav values respectfully and will uphold the dignity of this platform.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="dignity" />
            <label htmlFor="dignity" className="text-sm leading-relaxed text-foreground cursor-pointer">
              I agree to maintain spiritual dignity and respectful communication on this platform.
            </label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="truth" />
            <label htmlFor="truth" className="text-sm leading-relaxed text-foreground cursor-pointer">
              I confirm that all information provided above is true and accurate to the best of my knowledge.
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}
