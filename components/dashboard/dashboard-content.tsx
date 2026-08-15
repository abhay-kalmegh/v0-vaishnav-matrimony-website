'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  MessageCircle,
  Eye,
  Star,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/context/auth-context';
import matchesAPI, { MatchSuggestion } from '@/lib/api/matches';

export function DashboardContent() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await matchesAPI.getSuggestions(3);
        setMatches(response.results || []);
      } catch (err) {
        console.error('[v0] Error fetching matches:', err);
        setError('Failed to load match suggestions');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMatches();
    }
  }, [user]);

  const quickStats = [
    { icon: Eye, label: 'Profile Views', value: '142', change: '+12 this week', color: 'text-primary' },
    { icon: Heart, label: 'Interests Received', value: '28', change: '+5 new', color: 'text-primary' },
    { icon: Star, label: 'Match Score', value: '87%', change: 'Excellent', color: 'text-accent' },
    { icon: MessageCircle, label: 'Active Chats', value: '6', change: '2 unread', color: 'text-primary' },
  ];

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-8">
      {/* Welcome */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground">
            Hare Krishna, {user?.first_name || 'Friend'}!
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

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
                  <div className="mt-2 flex items-baseline gap-2">
                    <p className="font-serif text-3xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <p className="mt-2 text-xs text-primary">{stat.change}</p>
                </div>
                <div className={`rounded-full bg-primary/10 p-3 ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Suggested Matches */}
      <div>
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-serif text-2xl font-bold text-foreground">Suggested Matches</h3>
          <Link href="/dashboard/suggestions">
            <Button variant="outline" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        ) : matches.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <p className="text-muted-foreground">No matches available yet. Complete your profile to get suggestions!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => {
              const profileData = match.profile_data;
              return (
                <Link
                  key={match.id}
                  href={`/dashboard/profile/${match.profile}`}
                >
                  <div className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition cursor-pointer">
                    <div className="relative h-48 bg-muted">
                      {profileData?.photos?.length > 0 ? (
                        <Image
                          src={profileData.photos[0].photo}
                          alt={profileData.user?.first_name}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                          <User className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 rounded-full bg-primary text-primary-foreground px-3 py-1 text-sm font-bold">
                        {Math.round(match.compatibility_score)}%
                      </div>
                    </div>

                    <div className="p-4">
                      <h4 className="font-serif text-lg font-bold text-foreground">
                        {profileData.user?.first_name} {profileData.user?.last_name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {profileData.age} • {profileData.city}
                      </p>
                      <p className="mt-2 text-sm text-primary font-medium">{profileData.sampraday?.name}</p>
                      <p className="mt-2 text-xs text-muted-foreground line-clamp-2">
                        {profileData.bio}
                      </p>

                      <div className="mt-4 flex gap-2">
                        <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90" variant="default">
                          <Heart className="h-4 w-4 mr-1" />
                          Interest
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <MessageCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function User({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="currentColor"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  );
}
