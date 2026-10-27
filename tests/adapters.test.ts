import MockAdapter from 'axios-mock-adapter';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it } from 'vitest';
import apiClient from '../lib/api';
import eventsAPI from '../lib/api/events';
import interestsAPI from '../lib/api/interests';
import matchesAPI from '../lib/api/matches';
import messagingAPI from '../lib/api/messaging';
import profilesAPI, { adaptProfile } from '../lib/api/profiles';

let mock: MockAdapter;
beforeEach(async () => {
  mock = new MockAdapter(apiClient);
  localStorage.clear();
  await Preferences.clear();
});
const page = (results: any[]) => ({ count: results.length, next: null, previous: null, results });
const bodyOf = (call: any) => JSON.parse(call.data);

describe('profiles', () => {
  const backend = {
    id: 'p1', about_me: 'Hello', height_cm: 170, weight_kg: 65, current_city: 'Nagpur', state: 'MH', manglik_status: 'no',
    user: { first_name: 'A', is_verified: true }, primary_photo: 'http://x/p.png',
    education: { highest_qualification: 'B.Tech' }, career: { company_name: 'Acme', annual_income_range: '5-10', occupation: 'Eng' },
  };

  it('adaptProfile exposes the names the screens read and keeps the originals', () => {
    const p = adaptProfile(backend);
    expect([p.bio, p.height, p.weight, p.city, p.location, p.manglik, p.is_verified]).toEqual(['Hello', 170, 65, 'Nagpur', 'Nagpur, MH', 'no', true]);
    expect(p.education.degree).toBe('B.Tech');
    expect(p.career.company).toBe('Acme');
    expect(p.career.income_range).toBe('5-10');
    expect(p.about_me).toBe('Hello');
    expect(p.photos).toEqual(['http://x/p.png']);
    expect(adaptProfile(null)).toBeNull();
  });

  it('updateProfile maps UI names to backend names and drops empty values', async () => {
    mock.onPatch('/profile/me/').reply((c) => [200, { id: 'p1', ...bodyOf(c) }]);
    await profilesAPI.updateProfile({ bio: 'Hi', height: '175', weight: '' } as any);
    expect(bodyOf(mock.history.patch[0])).toEqual({ about_me: 'Hi', height_cm: 175 });
  });

  it('updateEducation / updateCareer send nested sections', async () => {
    mock.onPatch('/profile/me/').reply(200, { id: 'p1' });
    await profilesAPI.updateEducation({ degree: 'MBA' });
    await profilesAPI.updateCareer({ occupation: 'Doctor', company: 'City Hospital', income_range: '10-20' });
    expect(bodyOf(mock.history.patch[0])).toEqual({ education: { highest_qualification: 'MBA' } });
    expect(bodyOf(mock.history.patch[1])).toEqual({ career: { occupation: 'Doctor', company_name: 'City Hospital', annual_income_range: '10-20' } });
  });

  it('searchProfiles maps age_min/age_max/city, converts offset to a page, and unwraps pages', async () => {
    mock.onGet('/profile/search/').reply(200, { ...page([backend]), count: 41 });
    const r = await profilesAPI.searchProfiles({ gender: 'female', age_min: 22, age_max: 30, city: 'Pune', limit: 20, offset: 20 });
    expect(mock.history.get[0].params).toEqual({ gender: 'female', min_age: 22, max_age: 30, current_city__icontains: 'Pune', page: 2 });
    expect(r.count).toBe(41);
    expect(r.results[0].bio).toBe('Hello');
  });

  it('searchProfiles sends no page for the first page and no empty params', async () => {
    mock.onGet('/profile/search/').reply(200, page([]));
    await profilesAPI.searchProfiles({ gender: '', city: '', limit: 20, offset: 0 });
    expect(mock.history.get[0].params).toEqual({});
  });

  it('deletePhoto sends the id in the JSON body the API expects', async () => {
    mock.onDelete('/profile/photos/').reply(204);
    await profilesAPI.deletePhoto('abc');
    expect(bodyOf(mock.history.delete[0])).toEqual({ photo_id: 'abc' });
  });
});

describe('interests & shortlist', () => {
  const sender = { id: 's', user: { first_name: 'Arjun' } };
  const receiver = { id: 'r', user: { first_name: 'Radha' } };
  const interest = (status = 'pending') => ({ id: 'i1', status, sender_profile: sender, receiver_profile: receiver, sent_at: '2026-01-01T00:00:00Z' });

  it('sent interests show the receiver; received show the sender; created_at is mapped', async () => {
    mock.onGet('/interests/sent/').reply(200, page([interest()]));
    mock.onGet('/interests/received/').reply(200, page([interest()]));
    const sent = await interestsAPI.getSentInterests();
    const recv = await interestsAPI.getReceivedInterests();
    expect(sent[0].to_profile_data.user.first_name).toBe('Radha');
    expect(recv[0].to_profile_data.user.first_name).toBe('Arjun');
    expect(sent[0].created_at).toBe('2026-01-01T00:00:00Z');
  });

  it('getReceivedInterests(status) filters', async () => {
    mock.onGet('/interests/received/').reply(200, page([interest('pending'), { ...interest('accepted'), id: 'i2' }]));
    expect((await interestsAPI.getReceivedInterests('accepted')).map((i) => i.id)).toEqual(['i2']);
  });

  it('request payloads match the serializers', async () => {
    mock.onPost().reply(201, { id: 'x' });
    await interestsAPI.sendInterest('r', 'hi');
    await interestsAPI.respondToInterest('i1', 'accepted');
    await interestsAPI.addToShortlist('r');
    expect(bodyOf(mock.history.post[0])).toEqual({ receiver_id: 'r', message: 'hi' });
    expect(bodyOf(mock.history.post[1])).toEqual({ interest_id: 'i1', action: 'accepted' });
    expect(bodyOf(mock.history.post[2])).toEqual({ shortlisted_profile: 'r' });
  });

  it('getShortlist exposes the profile object under shortlisted_profile', async () => {
    mock.onGet('/interests/shortlist/').reply(200, page([{ id: 'sl1', shortlisted_profile: 'r', shortlisted: receiver }]));
    const [row] = await interestsAPI.getShortlist();
    expect(row.shortlisted_profile.user.first_name).toBe('Radha');
    expect(row.shortlisted_profile_id).toBe('r');
  });
});

describe('matches & events', () => {
  it('getSuggestions maps matched_profile to profile/profile_data', async () => {
    mock.onGet('/matches/').reply(200, page([{ id: 'm1', matched_profile: { id: 'p9', about_me: 'x' }, compatibility_score: 82.4, generated_at: 't' }]));
    const { results } = await matchesAPI.getSuggestions();
    expect(results[0].profile).toBe('p9');
    expect(results[0].profile_data.bio).toBe('x');
    const cards = await matchesAPI.getMatchSuggestions();
    expect(cards[0]).toMatchObject({ id: 'p9', compatibility: 82 });
  });

  it('events: aliases and my-registrations derive from is_registered', async () => {
    mock.onGet('/events/').reply(200, page([
      { id: 'e1', title: 'A', event_date: 'D1', registration_count: 3, max_participants: 10, is_registered: true },
      { id: 'e2', title: 'B', event_date: 'D2', registration_count: 0, max_participants: 0, is_registered: false },
    ]));
    const all = await eventsAPI.listEvents();
    expect(all[0]).toMatchObject({ start_date: 'D1', attendees: 3, capacity: 10 });
    expect((await eventsAPI.getMyEventRegistrations()).map((e) => e.id)).toEqual(['e1']);
    mock.onPost('/events/e1/register/').reply(201, {});
    await eventsAPI.registerEvent('e1');
    expect(mock.history.post[0].url).toBe('/events/e1/register/');
  });
});

describe('messaging & account switching', () => {
  const setToken = async (t: string) => {
    await Preferences.set({ key: 'access_token', value: t });
    localStorage.setItem('access_token', t);
  };
  const profileByToken = (map: Record<string, string>) =>
    mock.onGet('/profile/me/').reply((cfg) => [200, { id: map[String(cfg.headers?.Authorization).replace('Bearer ', '')] }]);
  const msgs = [
    { id: 'm2', sender: 'PB', text: 'Jai', sent_at: '2026-01-01T10:05:00Z', is_read: false },
    { id: 'm1', sender: 'PA', text: 'Hare Krishna', sent_at: '2026-01-01T10:00:00Z', is_read: true },
  ];

  it('maps fields, orders oldest-first, and sends {text}', async () => {
    await setToken('tokA');
    profileByToken({ tokA: 'PA' });
    mock.onGet('/messages/c1/').reply(200, page(msgs));
    mock.onPost('/messages/c1/send/').reply(201, { id: 'm3', sender: 'PA', text: 'hi', sent_at: 't' });
    const { messages } = await messagingAPI.getConversation('c1');
    expect(messages.map((m) => m.content)).toEqual(['Hare Krishna', 'Jai']);
    const sent = await messagingAPI.sendMessage('c1', 'hi');
    expect(bodyOf(mock.history.post[0])).toEqual({ text: 'hi' });
    expect(sent.is_mine).toBe(true);
  });

  it('after switching accounts, "mine" is re-derived (no stale profile id)', async () => {
    profileByToken({ tokA: 'PA', tokB: 'PB' });
    mock.onGet('/messages/c1/').reply(200, page(msgs));
    await setToken('tokA');
    const asA = (await messagingAPI.getMessages('c1')).map((m) => [m.id, m.is_mine]);
    await setToken('tokB'); // logout + login as someone else
    const asB = (await messagingAPI.getMessages('c1')).map((m) => [m.id, m.is_mine]);
    expect(asA).toEqual([['m1', true], ['m2', false]]);
    expect(asB).toEqual([['m1', false], ['m2', true]]);
  });

  it('conversation list maps other_profile and a string last_message', async () => {
    await setToken('tokA');
    mock.onGet('/messages/').reply(200, page([{ id: 'c1', other_profile: { user: { first_name: 'Radha' } }, last_message: { text: 'Jai', sent_at: '2026-01-01T10:05:00Z' } }]));
    const [c] = await messagingAPI.getConversations();
    expect([c.other_user.first_name, c.last_message]).toEqual(['Radha', 'Jai']);
  });
});
