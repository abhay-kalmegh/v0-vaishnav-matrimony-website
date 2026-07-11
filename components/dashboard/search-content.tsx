'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Heart,
  MapPin,
  Loader2,
  X,
  BookOpen,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import profilesAPI, { Profile } from '@/lib/api/profiles';
import interestsAPI from '@/lib/api/interests';

export function SearchContent() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sendingInterest, setSendingInterest] = useState<number | null>(null);

  // Filters
  const [ageMin, setAgeMin] = useState('20');
  const [ageMax, setAgeMax] = useState('35');
  const [sampradayFilter, setSampradayFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      const filters: any = {
        age_min: parseInt(ageMin) || undefined,
        age_max: parseInt(ageMax) || undefined,
        limit: 12,
        offset: 0,
      };

      if (sampradayFilter) filters.sampraday = parseInt(sampradayFilter);
      if (cityFilter) filters.city = cityFilter;

      const response = await profilesAPI.searchProfiles(filters);
      setProfiles(response.results || []);
    } catch (err) {
      console.error('[v0] Error fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInterest = async (userId: number) => {
    try {
      setSendingInterest(userId);
      await interestsAPI.sendInterest(userId);
      // Show success message
      alert('Interest sent successfully!');
    } catch (err) {
      console.error('[v0] Error sending interest:', err);
      alert('Failed to send interest');
    } finally {
      setSendingInterest(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Search Profiles</h2>
        <p className="text-sm text-muted-foreground">
          Find your spiritually aligned match with advanced filters
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or city..."
            className="pl-10"
            disabled={loading}
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-sm font-medium text-foreground">Age Min</label>
              <Input
                type="number"
                value={ageMin}
                onChange={(e) => setAgeMin(e.target.value)}
                placeholder="20"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Age Max</label>
              <Input
                type="number"
                value={ageMax}
                onChange={(e) => setAgeMax(e.target.value)}
                placeholder="35"
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Sampraday</label>
              <Select value={sampradayFilter} onValueChange={setSampradayFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All Sampradays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Sampradays</SelectItem>
                  <SelectItem value="1">ISKCON</SelectItem>
                  <SelectItem value="2">Pushtimarg</SelectItem>
                  <SelectItem value="3">Gaudiya Vaishnav</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">City</label>
              <Input
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                placeholder="City name"
                className="mt-1"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button onClick={fetchProfiles} disabled={loading} className="bg-primary hover:bg-primary/90">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                'Apply Filters'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAgeMin('20');
                setAgeMax('35');
                setSampradayFilter('');
                setCityFilter('');
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      )}

      {/* Profiles Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No profiles found matching your criteria</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-lg transition"
            >
              <div className="relative h-56 bg-muted overflow-hidden">
                {profile.photos?.length > 0 ? (
                  <Image
                    src={profile.photos[0].image}
                    alt={profile.user?.first_name || 'Profile'}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="p-4">
                <Link href={`/dashboard/profile/view?id=${profile.id}`}>
                  <h3 className="font-serif text-lg font-bold text-foreground hover:text-primary transition">
                    {profile.user?.first_name} {profile.user?.last_name}
                  </h3>
                </Link>

                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>{profile.age} • {profile.height}</p>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.city}, {profile.state}
                  </div>
                  <p className="text-primary font-medium">{profile.caste}</p>
                </div>

                <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{profile.bio}</p>

                <div className="mt-4 flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => handleSendInterest(profile.user)}
                    disabled={sendingInterest === profile.user}
                  >
                    {sendingInterest === profile.user ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Heart className="h-4 w-4 mr-1" />
                        Interest
                      </>
                    )}
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
