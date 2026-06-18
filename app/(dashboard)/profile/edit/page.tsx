"use client"

import { useState } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Camera, Save, User, BookOpen, Briefcase, Heart, Shield } from "lucide-react"

export default function ProfileEditPage() {
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 1500)
  }

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">Edit Profile</h2>
          <p className="text-sm text-muted-foreground">
            Update your details to improve match accuracy
          </p>
        </div>
        <Button
          onClick={handleSave}
          className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
          disabled={saving}
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Photo Upload */}
      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Profile Photos</h3>
        <div className="flex flex-wrap gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="group relative flex h-28 w-28 cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary transition-colors hover:border-primary/30"
            >
              <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="absolute bottom-1 text-[10px] text-muted-foreground">
                {i === 1 ? "Primary" : `Photo ${i}`}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Upload up to 4 photos. First photo will be your profile picture. Max 5MB each.
        </p>
      </div>

      {/* Tabbed Edit Form */}
      <Tabs defaultValue="personal">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal" className="gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-1.5 text-xs">
            <Briefcase className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Career</span>
          </TabsTrigger>
          <TabsTrigger value="spiritual" className="gap-1.5 text-xs">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Spiritual</span>
          </TabsTrigger>
          <TabsTrigger value="family" className="gap-1.5 text-xs">
            <Heart className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Family</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personal" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">First Name</Label>
                <Input defaultValue="Rajesh" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Last Name</Label>
                <Input defaultValue="Das" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Date of Birth</Label>
                <Input type="date" defaultValue="1997-03-15" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Height</Label>
                <Select defaultValue={'5\'10"'}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['5\'6"', '5\'7"', '5\'8"', '5\'9"', '5\'10"', '5\'11"', '6\'0"'].map((h) => (
                      <SelectItem key={h} value={h}>{h}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Marital Status</Label>
                <Select defaultValue="never-married">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never-married">Never Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Current City</Label>
                <Input defaultValue="Mumbai" />
              </div>
              <div className="flex flex-col gap-2 md:col-span-2">
                <Label className="text-foreground">About Yourself</Label>
                <textarea
                  rows={4}
                  defaultValue="A devoted Krishna bhakta working as a software engineer. I chant 16 rounds daily and seek a partner who shares the same spiritual values."
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="education" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Highest Qualification</Label>
                <Select defaultValue="bachelors">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high-school">High School</SelectItem>
                    <SelectItem value="diploma">Diploma</SelectItem>
                    <SelectItem value="bachelors">{"Bachelor's Degree"}</SelectItem>
                    <SelectItem value="masters">{"Master's Degree"}</SelectItem>
                    <SelectItem value="phd">PhD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Field of Study</Label>
                <Input defaultValue="Computer Science" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Occupation</Label>
                <Input defaultValue="Software Engineer" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Company</Label>
                <Input defaultValue="Tech Solutions Pvt. Ltd." />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Annual Income</Label>
                <Select defaultValue="10-20">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="below-3">Below 3 Lakhs</SelectItem>
                    <SelectItem value="3-5">3 - 5 Lakhs</SelectItem>
                    <SelectItem value="5-10">5 - 10 Lakhs</SelectItem>
                    <SelectItem value="10-20">10 - 20 Lakhs</SelectItem>
                    <SelectItem value="20-50">20 - 50 Lakhs</SelectItem>
                    <SelectItem value="50-plus">50+ Lakhs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Work Location</Label>
                <Input defaultValue="Mumbai" />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="spiritual" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Sampraday</Label>
                <Select defaultValue="iskcon">
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Label className="text-foreground">Initiated (Diksha)</Label>
                <Select defaultValue="yes">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                    <SelectItem value="in-process">In Process</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Guru Name</Label>
                <Input defaultValue="H.H. Radhanath Swami" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Temple Association</Label>
                <Input defaultValue="ISKCON Chowpatty, Mumbai" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Daily Mala Rounds</Label>
                <Select defaultValue="16-plus">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-4">1 - 4 rounds</SelectItem>
                    <SelectItem value="4-8">4 - 8 rounds</SelectItem>
                    <SelectItem value="8-16">8 - 16 rounds</SelectItem>
                    <SelectItem value="16-plus">16+ rounds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Ekadashi Fasting</Label>
                <Select defaultValue="always">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="always">Always</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Vegetarian</Label>
                <Select defaultValue="yes">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes, strict vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Onion / Garlic</Label>
                <Select defaultValue="no">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">No (Sattvic diet)</SelectItem>
                    <SelectItem value="sometimes">Sometimes</SelectItem>
                    <SelectItem value="yes">Yes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="family" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">{"Father's Name"}</Label>
                <Input defaultValue="Shri Hariprasad Das" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">{"Father's Occupation"}</Label>
                <Input defaultValue="Business Owner" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">{"Mother's Name"}</Label>
                <Input defaultValue="Smt. Radha Devi" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">{"Mother's Occupation"}</Label>
                <Input defaultValue="Homemaker" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Siblings</Label>
                <Select defaultValue="1">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>{n === 0 ? "None" : n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Family Type</Label>
                <Select defaultValue="joint">
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                  defaultValue="Our family has been following ISKCON teachings for over 20 years. We have daily mangal aarti and tulsi puja at home."
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="mt-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Preferred Sampraday</Label>
                <Select defaultValue="same">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="same">Same as mine</SelectItem>
                    <SelectItem value="any-vaishnav">Any Vaishnav</SelectItem>
                    <SelectItem value="open">Open to all</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Preferred Age Range</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" defaultValue="22" className="w-20" />
                  <span className="text-muted-foreground text-xs">to</span>
                  <Input type="number" defaultValue="28" className="w-20" />
                  <span className="text-xs text-muted-foreground">years</span>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Education Preference</Label>
                <Select defaultValue="bachelors">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="bachelors">{"Bachelor's & above"}</SelectItem>
                    <SelectItem value="masters">{"Master's & above"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Location Preference</Label>
                <Input defaultValue="Mumbai, Gujarat" />
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Dietary Expectation</Label>
                <Select defaultValue="sattvic">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sattvic">Sattvic (No onion/garlic)</SelectItem>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label className="text-foreground">Marital Status Preference</Label>
                <Select defaultValue="never-married">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never-married">Never Married only</SelectItem>
                    <SelectItem value="open">Open to all</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
