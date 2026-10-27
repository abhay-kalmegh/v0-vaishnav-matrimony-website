'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import interestsAPI, { Interest } from '@/lib/api/interests';

type TabType = 'received' | 'sent' | 'accepted';

export function InterestsContent() {
  const [activeTab, setActiveTab] = useState<TabType>('received');
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchInterests();
  }, [activeTab]);

  const fetchInterests = async () => {
    try {
      setLoading(true);
      let data;
      if (activeTab === 'received') {
        data = await interestsAPI.getReceivedInterests();
      } else if (activeTab === 'sent') {
        data = await interestsAPI.getSentInterests();
      } else {
        data = await interestsAPI.getReceivedInterests('accepted');
      }
      setInterests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[v0] Error fetching interests:', err);
      setInterests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (interestId: string, status: 'accepted' | 'rejected') => {
    try {
      setRespondingTo(interestId);
      await interestsAPI.respondToInterest(interestId, status);
      // Remove from list
      setInterests(interests.filter((i) => i.id !== interestId));
    } catch (err) {
      console.error('[v0] Error responding to interest:', err);
      alert('Failed to respond to interest');
    } finally {
      setRespondingTo(null);
    }
  };

  return (
    <div className="mx-auto max-w-4xl flex flex-col gap-6">
      <div>
        <h2 className="font-serif text-2xl font-bold text-foreground">Interests & Connections</h2>
        <p className="text-sm text-muted-foreground">Manage your interests and connections</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        {(['received', 'sent', 'accepted'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'text-primary border-b-2 border-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'received' && 'Received'}
            {tab === 'sent' && 'Sent'}
            {tab === 'accepted' && 'Accepted'}
          </button>
        ))}
      </div>

      {/* Interests List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : interests.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">
            {activeTab === 'received' && 'No interests received yet'}
            {activeTab === 'sent' && 'No interests sent yet'}
            {activeTab === 'accepted' && 'No accepted interests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interests.map((interest) => (
            <div
              key={interest.id}
              className="rounded-lg border border-border bg-card p-6 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {interest.to_profile_data?.user?.first_name} {interest.to_profile_data?.user?.last_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {interest.to_profile_data?.age} • {interest.to_profile_data?.city}
                  </p>
                  <p className="text-xs text-primary mt-2">
                    {activeTab === 'received' && 'Sent you an interest'}
                    {activeTab === 'sent' && 'You sent an interest'}
                    {activeTab === 'accepted' && 'Accepted your interest'}
                  </p>
                </div>

                <div className="flex gap-2">
                  {activeTab === 'received' && (
                    <>
                      <Button
                        size="sm"
                        className="bg-primary hover:bg-primary/90"
                        onClick={() => handleRespond(interest.id, 'accepted')}
                        disabled={respondingTo === interest.id}
                      >
                        {respondingTo === interest.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRespond(interest.id, 'rejected')}
                        disabled={respondingTo === interest.id}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  {(activeTab === 'sent' || activeTab === 'accepted') && (
                    <Link href={`/profile/view?id=${interest.to_profile_data?.id}`}>
                      <Button size="sm" variant="outline">
                        View Profile
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
