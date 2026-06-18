import Image from "next/image"
import Link from "next/link"
import {
  Heart,
  MessageCircle,
  MapPin,
  GraduationCap,
  Briefcase,
  Star,
  Shield,
  BookOpen,
  Sparkles,
  ArrowLeft,
  Share2,
  Flag,
  CheckCircle,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const profile = {
  name: "Lakshmi Devi",
  age: 26,
  height: "5'4\"",
  weight: "55 kg",
  location: "Ahmedabad, Gujarat",
  maritalStatus: "Never Married",
  manglik: "No",
  bloodGroup: "B+",
  about:
    "A devoted follower of Shrinathji and Pushtimarg, I believe in living a life centered around Krishna consciousness. I perform daily seva, chant regularly, and seek a life partner who shares this same devotion and commitment to dharmic living.",
  image: "/images/couple-1.jpg",
  verified: true,
  // Education & Career
  education: "B.Tech, Computer Science",
  fieldOfStudy: "Computer Science & Engineering",
  occupation: "Software Engineer",
  company: "TCS",
  income: "10 - 20 Lakhs",
  workLocation: "Ahmedabad",
  // Family
  fatherName: "Shri Hariprasad Patel",
  fatherOccupation: "Business Owner",
  motherName: "Smt. Pushpa Devi",
  motherOccupation: "Homemaker",
  siblings: 1,
  familyType: "Joint Family",
  familySpiritual:
    "Our entire family follows Pushtimarg tradition. We have daily Thakorji seva at home and regularly visit Shrinathji temple at Nathdwara.",
  // Spiritual
  sampraday: "Pushtimarg",
  initiated: true,
  guru: "Shri Yadunathji Mahodayashri",
  temple: "Shrinathji Temple, Nathdwara",
  yearsOfDevtion: "Since Birth",
  chantsMala: true,
  malaRounds: "16 rounds daily",
  ekadashi: "Always",
  dailyPuja: true,
  readsScriptures: true,
  templeRegular: true,
  // Lifestyle
  vegetarian: true,
  onionGarlic: "No (Sattvic)",
  alcohol: "Never",
  prasadDiet: true,
  // Compatibility
  compatibilityScore: 94,
  spiritualScore: 96,
  lifestyleScore: 92,
  familyScore: 90,
}

const compatibilityBreakdown = [
  { label: "Spiritual Alignment", score: profile.spiritualScore, color: "bg-primary" },
  { label: "Lifestyle Match", score: profile.lifestyleScore, color: "bg-accent" },
  { label: "Family Background", score: profile.familyScore, color: "bg-maroon" },
]

export default function ProfileViewPage() {
  return (
    <div className="mx-auto max-w-5xl flex flex-col gap-6">
      {/* Back Link */}
      <Link
        href="/search"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Search
      </Link>

      {/* Profile Header */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="relative h-48 md:h-64 overflow-hidden">
          <Image
            src={profile.image}
            alt={profile.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />

          {/* Actions on image */}
          <div className="absolute top-4 right-4 flex gap-2">
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors" aria-label="Share profile">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-full bg-card/80 backdrop-blur-sm text-foreground hover:bg-card transition-colors" aria-label="Report profile">
              <Flag className="h-4 w-4" />
            </button>
          </div>

          {/* Profile info overlay */}
          <div className="absolute bottom-4 left-4 right-4 md:bottom-6 md:left-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="font-serif text-2xl font-bold text-card md:text-3xl">
                    {profile.name}, {profile.age}
                  </h1>
                  {profile.verified && (
                    <span className="flex items-center gap-1 rounded-full bg-card/90 px-2 py-0.5 text-xs font-medium text-primary">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-sm text-card/80">
                  <MapPin className="h-3.5 w-3.5" />
                  {profile.location}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Heart className="h-4 w-4" />
                  Send Interest
                </Button>
                <Button variant="outline" className="border-card/30 text-card hover:bg-card/10 gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Request Chat
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Actions */}
        <div className="flex gap-2 p-4 md:hidden border-b border-border">
          <Button className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Heart className="h-4 w-4" />
            Send Interest
          </Button>
          <Button variant="outline" className="flex-1 border-border text-foreground gap-2">
            <MessageCircle className="h-4 w-4" />
            Request Chat
          </Button>
        </div>

        {/* Compatibility Score */}
        <div className="p-6 border-b border-border bg-secondary/50">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="text-xl font-bold">{profile.compatibilityScore}%</span>
              </div>
              <div>
                <p className="font-serif font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Spiritual Compatibility Score
                </p>
                <p className="text-xs text-muted-foreground">Based on Sampraday, practices, and lifestyle</p>
              </div>
            </div>
            <div className="flex-1 grid gap-3 md:grid-cols-3">
              {compatibilityBreakdown.map((item) => (
                <div key={item.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="text-xs font-semibold text-foreground">{item.score}%</span>
                  </div>
                  <Progress value={item.score} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* About */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-3">About</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{profile.about}</p>
          </div>

          {/* Spiritual Profile */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Spiritual Profile
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Sampraday" value={profile.sampraday} />
              <InfoRow label="Initiated (Diksha)" value={profile.initiated ? "Yes" : "No"} />
              <InfoRow label="Guru" value={profile.guru} />
              <InfoRow label="Temple Association" value={profile.temple} />
              <InfoRow label="Years in Devotion" value={profile.yearsOfDevtion} />
              <InfoRow label="Chants Mala" value={profile.malaRounds} />
              <InfoRow label="Ekadashi Fasting" value={profile.ekadashi} />
              <InfoRow label="Daily Puja / Seva" value={profile.dailyPuja ? "Yes" : "No"} />
              <InfoRow label="Reads Scriptures" value={profile.readsScriptures ? "Yes" : "No"} />
              <InfoRow label="Regular Temple Visits" value={profile.templeRegular ? "Yes" : "No"} />
            </div>
          </div>

          {/* Lifestyle */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Lifestyle Discipline
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Vegetarian" value={profile.vegetarian ? "Yes, strictly" : "No"} />
              <InfoRow label="Onion / Garlic" value={profile.onionGarlic} />
              <InfoRow label="Alcohol / Smoking" value={profile.alcohol} />
              <InfoRow label="Prasad-only Diet" value={profile.prasadDiet ? "Yes" : "No"} />
            </div>
          </div>

          {/* Family */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Family Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow label="Father" value={`${profile.fatherName} (${profile.fatherOccupation})`} />
              <InfoRow label="Mother" value={`${profile.motherName} (${profile.motherOccupation})`} />
              <InfoRow label="Siblings" value={String(profile.siblings)} />
              <InfoRow label="Family Type" value={profile.familyType} />
            </div>
            <div className="mt-4 rounded-lg bg-secondary p-4">
              <p className="text-xs font-medium text-muted-foreground mb-1">Family Spiritual Background</p>
              <p className="text-sm leading-relaxed text-foreground">{profile.familySpiritual}</p>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Info */}
        <div className="flex flex-col gap-6">
          {/* Quick Details */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Quick Details</h2>
            <div className="flex flex-col gap-3">
              <QuickInfo icon={Clock} label="Age" value={`${profile.age} years`} />
              <QuickInfo icon={MapPin} label="Height" value={profile.height} />
              <QuickInfo icon={Shield} label="Marital Status" value={profile.maritalStatus} />
              <QuickInfo icon={Shield} label="Manglik" value={profile.manglik} />
              <QuickInfo icon={GraduationCap} label="Education" value={profile.education} />
              <QuickInfo icon={Briefcase} label="Occupation" value={profile.occupation} />
              <QuickInfo icon={Briefcase} label="Company" value={profile.company} />
              <QuickInfo icon={BookOpen} label="Income" value={profile.income} />
              <QuickInfo icon={MapPin} label="Work Location" value={profile.workLocation} />
            </div>
          </div>

          {/* Tags */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="font-serif text-lg font-semibold text-foreground mb-4">Highlights</h2>
            <div className="flex flex-wrap gap-2">
              {[
                profile.sampraday,
                "Initiated",
                "16 Rounds Daily",
                "Sattvic Diet",
                "Temple Regular",
                "Ekadashi Fasting",
                "Prasad-only",
                "Joint Family",
                "Verified",
              ].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}

function QuickInfo({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      <div className="flex-1 flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium text-foreground">{value}</span>
      </div>
    </div>
  )
}
