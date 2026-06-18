import Link from "next/link"
import Image from "next/image"
import {
  Heart,
  MessageCircle,
  Eye,
  Star,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle,
  TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

const quickStats = [
  { icon: Eye, label: "Profile Views", value: "142", change: "+12 this week", color: "text-primary" },
  { icon: Heart, label: "Interests Received", value: "28", change: "+5 new", color: "text-primary" },
  { icon: Star, label: "Match Score", value: "87%", change: "Excellent", color: "text-accent" },
  { icon: MessageCircle, label: "Active Chats", value: "6", change: "2 unread", color: "text-primary" },
]

const suggestedMatches = [
  {
    name: "Lakshmi Devi",
    age: 26,
    location: "Ahmedabad, Gujarat",
    sampraday: "Pushtimarg",
    compatibility: 94,
    image: "/images/couple-1.jpg",
    practices: "16 rounds daily, Ekadashi fasting",
  },
  {
    name: "Radha Sharma",
    age: 24,
    location: "Vrindavan, UP",
    sampraday: "ISKCON",
    compatibility: 91,
    image: "/images/couple-2.jpg",
    practices: "12 rounds daily, Temple seva",
  },
  {
    name: "Meera Patel",
    age: 27,
    location: "Mumbai, Maharashtra",
    sampraday: "Gaudiya Vaishnav",
    compatibility: 88,
    image: "/images/couple-3.jpg",
    practices: "8 rounds daily, Prasad-only diet",
  },
]

const recentActivity = [
  { type: "interest", text: "Meera Patel sent you an interest", time: "2 hours ago" },
  { type: "view", text: "Radha Sharma viewed your profile", time: "5 hours ago" },
  { type: "match", text: "New match suggestion: Lakshmi Devi (94% compatible)", time: "1 day ago" },
  { type: "message", text: "You have a new message from Priya Das", time: "1 day ago" },
  { type: "interest", text: "Your interest was accepted by Rukmini Ji", time: "2 days ago" },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-8">
      {/* Welcome */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Hare Krishna, Rajesh!
          </h2>
          <p className="text-sm text-muted-foreground">
            {"Here's what's happening with your profile today."}
          </p>
        </div>
        <Link href="/search">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Sparkles className="h-4 w-4" />
            Find Matches
          </Button>
        </Link>
      </div>

      {/* Profile Completion */}
      <div className="rounded-xl border border-primary/20 bg-secondary p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Profile Completion: 78%</p>
              <p className="text-xs text-muted-foreground">Complete your spiritual details to get better matches</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-1 md:max-w-md md:ml-4">
            <Progress value={78} className="h-2 flex-1" />
            <Link href="/profile/edit">
              <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-xs">
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {quickStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.change}</span>
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Suggested Matches & Activity */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Suggested Matches */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-semibold text-foreground">Top Match Suggestions</h3>
            <Link href="/suggestions" className="flex items-center gap-1 text-sm text-primary hover:underline">
              View All <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {suggestedMatches.map((match) => (
              <div
                key={match.name}
                className="group overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={match.image}
                    alt={match.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                  <div className="absolute top-2 right-2">
                    <span className="flex items-center gap-1 rounded-full bg-card/90 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-primary">
                      <Sparkles className="h-3 w-3" />
                      {match.compatibility}%
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="font-serif font-semibold text-card">{match.name}</p>
                    <p className="text-xs text-card/80">
                      {match.age} yrs - {match.location}
                    </p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground">
                      {match.sampraday}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{match.practices}</p>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 text-xs h-8">
                      <Heart className="mr-1 h-3 w-3" />
                      Interest
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 border-border text-foreground text-xs h-8">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="font-serif text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="rounded-xl border border-border bg-card">
            <div className="flex flex-col divide-y divide-border">
              {recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-4">
                  <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                    activity.type === "interest" ? "bg-primary/10" :
                    activity.type === "match" ? "bg-accent/20" :
                    activity.type === "message" ? "bg-secondary" : "bg-muted"
                  }`}>
                    {activity.type === "interest" && <Heart className="h-4 w-4 text-primary" />}
                    {activity.type === "view" && <Eye className="h-4 w-4 text-muted-foreground" />}
                    {activity.type === "match" && <CheckCircle className="h-4 w-4 text-accent" />}
                    {activity.type === "message" && <MessageCircle className="h-4 w-4 text-secondary-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{activity.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
