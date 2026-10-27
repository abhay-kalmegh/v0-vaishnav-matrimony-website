import { describe, expect, it } from 'vitest';
import {
  accountPayload, ageFromDob, emptyForm, firstIncompleteStep, formFromSaved, heightToCm, profilePatch, roleFor, validateStep,
} from '../lib/registration';

const NOW = new Date('2026-10-21T12:00:00Z');
const filled = () => ({
  ...emptyForm(), profile_for: 'self', gender: 'male', first_name: 'Arjun', last_name: 'Das', date_of_birth: '1996-05-05',
  height: `5'6"`, marital_status: 'never-married', manglik_status: 'dont-know', about_me: 'A devotee who loves kirtan and seva.',
  email: 'a@b.com', state: 'Maharashtra', current_city: 'Nagpur', qualification: 'bachelors', occupation: 'private',
  income_range: '5-10', family_type: 'joint', siblings: '2', sampraday: '11111111-1111-1111-1111-111111111111',
});

describe('helpers', () => {
  it('heightToCm', () => {
    expect(heightToCm(`5'6"`)).toBe(168);
    expect(heightToCm(`5'0"`)).toBe(152);
    expect(heightToCm(`6'`)).toBe(183);
    expect(heightToCm('172')).toBe(172);
    expect(heightToCm('172 cm')).toBe(172);
    expect(heightToCm('tall')).toBeUndefined();
    expect(heightToCm('')).toBeUndefined();
  });
  it('ageFromDob handles birthdays and bad input', () => {
    expect(ageFromDob('2008-10-21', NOW)).toBe(18);
    expect(ageFromDob('2008-10-22', NOW)).toBe(17);
    expect(ageFromDob('nope', NOW)).toBeUndefined();
  });
  it('roleFor', () => {
    expect(roleFor('self', 'female')).toBe('bride');
    expect(roleFor('self', 'male')).toBe('groom');
    expect(roleFor('son', 'male')).toBe('parent');
  });
});

describe('validation', () => {
  it('step 1 requires the essentials', () => {
    const e = validateStep(1, emptyForm(), NOW);
    for (const k of ['profile_for', 'gender', 'first_name', 'date_of_birth', 'height', 'marital_status', 'about_me']) expect(e).toHaveProperty(k);
    expect(validateStep(1, filled(), NOW)).toEqual({});
  });
  it('rejects under-18, future and absurd birth dates', () => {
    for (const dob of ['2010-01-01', '2030-01-01', '1900-01-01']) {
      expect(validateStep(1, { ...filled(), date_of_birth: dob }, NOW)).toHaveProperty('date_of_birth');
    }
    expect(validateStep(1, { ...filled(), date_of_birth: '2008-10-21' }, NOW)).toEqual({});
  });
  it('about_me must be at least 20 characters', () => {
    expect(validateStep(1, { ...filled(), about_me: 'short' }, NOW)).toHaveProperty('about_me');
  });
  it('step 2/3/4 required fields and email format', () => {
    expect(validateStep(2, emptyForm())).toMatchObject({ state: expect.any(String), current_city: expect.any(String) });
    expect(validateStep(2, { ...filled(), email: 'nope' })).toHaveProperty('email');
    expect(validateStep(2, { ...filled(), email: '' })).toEqual({});
    expect(validateStep(3, emptyForm())).toHaveProperty('qualification');
    expect(validateStep(4, emptyForm())).toHaveProperty('family_type');
  });
  it('step 6 needs all three declarations and a sane age range', () => {
    expect(validateStep(6, filled())).toHaveProperty('declaration');
    expect(validateStep(6, { ...filled(), decl_values: true, decl_dignity: true, decl_truth: true })).toEqual({});
    expect(validateStep(6, { ...filled(), decl_values: true, decl_dignity: true, decl_truth: true, pref_age_min: '35', pref_age_max: '25' })).toHaveProperty('pref_age_min');
  });
});

describe('payloads (these shapes are also posted to the real API in backend/tests/test_onboarding.py)', () => {
  it('account payload', () => {
    expect(accountPayload(filled())).toEqual({ first_name: 'Arjun', last_name: 'Das', gender: 'male', role: 'groom', email: 'a@b.com' });
    expect(accountPayload({ ...filled(), email: '', last_name: '' })).toEqual({ first_name: 'Arjun', gender: 'male', role: 'groom' });
  });
  it('step 1', () => {
    expect(profilePatch(1, filled())).toEqual({
      date_of_birth: '1996-05-05', height_cm: 168, marital_status: 'never_married', manglik_status: 'dont_know', about_me: 'A devotee who loves kirtan and seva.',
    });
  });
  it('step 2', () => {
    expect(profilePatch(2, { ...filled(), country: 'india', permanent_address: '12 Temple Rd' })).toEqual({
      country: 'India', state: 'Maharashtra', current_city: 'Nagpur', permanent_address: '12 Temple Rd',
    });
  });
  it('step 3 maps labels and employment type', () => {
    expect(profilePatch(3, { ...filled(), company_name: 'Acme', field_of_study: 'CS' })).toEqual({
      education: { highest_qualification: "Bachelor's Degree", field_of_study: 'CS' },
      career: { occupation: 'Private Sector', employment_type: 'salaried', company_name: 'Acme', annual_income_range: '5 - 10 Lakhs' },
    });
  });
  it('step 4', () => {
    expect(profilePatch(4, { ...filled(), father_name: 'A' }).family).toEqual({ father_name: 'A', siblings_count: 2, family_type: 'joint' });
  });
  it('step 5 spiritual / practices / lifestyle', () => {
    const f = { ...filled(), initiated: 'yes', temple: 'ISKCON', years: '6-10', chants_mala: 'yes', mala_rounds: '16-plus', ekadashi: 'always', puja: 'sometimes',
      vegetarian: 'yes', onion_garlic: 'sometimes', alcohol_smoking: 'no', prasad: 'mostly' };
    expect(profilePatch(5, f)).toEqual({
      spiritual_profile: { sampraday: f.sampraday, is_initiated: true, temple_association: 'ISKCON', years_in_devotion: 8 },
      spiritual_practices: { chants_mala: true, mala_rounds_daily: 16, follows_ekadashi: true, performs_daily_puja: false },
      lifestyle: { is_vegetarian: true, onion_garlic: 'occasionally', alcohol: 'no', smoking: 'no', prasad_only_diet: true },
    });
  });
  it('step 5 "since birth" uses the member age and unanswered questions are not sent', () => {
    const p = profilePatch(5, { ...emptyForm(), date_of_birth: '1996-05-05', years: 'since-birth' });
    expect(p.spiritual_profile.years_in_devotion).toBeGreaterThan(20);
    expect(profilePatch(5, emptyForm())).toEqual({});
  });
  it('step 6 maps "same as mine" to my sampraday and open choices to nothing', () => {
    const f = { ...filled(), pref_sampraday: 'same', pref_age_min: '24', pref_age_max: '30', pref_height_min: `5'0"`, pref_location: 'Maharashtra' };
    expect(profilePatch(6, f).partner_preference).toMatchObject({ preferred_sampraday: f.sampraday, min_age: 24, max_age: 30, min_height_cm: 152, preferred_location: 'Maharashtra' });
    expect(profilePatch(6, { ...filled(), pref_sampraday: 'open' })).toEqual({});
    expect(profilePatch(6, { ...filled(), pref_sampraday: 'any-vaishnav' })).toEqual({});
  });
  it('never sends empty strings (they would blank saved data)', () => {
    for (let s = 1; s <= 6; s += 1) expect(JSON.stringify(profilePatch(s, emptyForm()))).not.toContain('""');
  });
});

describe('resume', () => {
  it('rebuilds the form from saved data and resumes at the first incomplete step', () => {
    const f = formFromSaved(
      { first_name: 'Arjun', last_name: 'Das', gender: 'male', email: 'a@b.com', role: 'groom' },
      { date_of_birth: '1996-05-05', height_cm: 168, marital_status: 'never_married', about_me: 'A devotee who loves kirtan and seva.', state: 'MH', current_city: 'Nagpur', profile_completion: 20 },
    );
    expect(f).toMatchObject({ first_name: 'Arjun', height: `5'6"`, marital_status: 'never-married', profile_for: 'self' });
    expect(firstIncompleteStep(f)).toBe(3); // steps 1-2 are done, education is next
  });
  it('a brand new account (placeholder name "User") starts at step 1', () => {
    const f = formFromSaved({ first_name: 'User', gender: '', role: 'groom' }, { marital_status: 'never_married', profile_completion: 0 });
    expect(f.first_name).toBe('');
    expect(firstIncompleteStep(f)).toBe(1);
  });
});
