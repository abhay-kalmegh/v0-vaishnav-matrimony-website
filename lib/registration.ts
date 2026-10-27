/**
 * Registration / onboarding logic, kept free of React so it can be unit-tested.
 *
 * Flow:  1) verify phone by OTP (creates the account)
 *        2) POST /auth/register/   - account details (idempotent, safe to retry)
 *        3) PATCH /profile/me/     - one patch per wizard step (incremental saves)
 */

export const WIZARD_STEPS = 6;

export interface RegistrationForm {
  // step 1
  profile_for: string;
  gender: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  height: string; // 5'6"
  marital_status: string;
  manglik_status: string;
  about_me: string;
  // step 2
  email: string;
  country: string;
  state: string;
  current_city: string;
  permanent_address: string;
  // step 3
  qualification: string;
  field_of_study: string;
  occupation: string;
  company_name: string;
  income_range: string;
  work_location: string;
  // step 4
  father_name: string;
  father_occupation: string;
  mother_name: string;
  mother_occupation: string;
  siblings: string;
  family_type: string;
  family_spiritual_background: string;
  // step 5
  sampraday: string; // sampraday UUID
  initiated: string;
  temple: string;
  years: string;
  chants_mala: string;
  mala_rounds: string;
  ekadashi: string;
  puja: string;
  vegetarian: string;
  onion_garlic: string;
  alcohol_smoking: string;
  prasad: string;
  // step 6
  pref_sampraday: string;
  pref_level: string;
  pref_diet: string;
  pref_age_min: string;
  pref_age_max: string;
  pref_height_min: string;
  pref_height_max: string;
  pref_education: string;
  pref_location: string;
  pref_marital: string;
  decl_values: boolean;
  decl_dignity: boolean;
  decl_truth: boolean;
}

export const emptyForm = (): RegistrationForm => ({
  profile_for: '', gender: '', first_name: '', last_name: '', date_of_birth: '', height: '',
  marital_status: '', manglik_status: '', about_me: '',
  email: '', country: 'india', state: '', current_city: '', permanent_address: '',
  qualification: '', field_of_study: '', occupation: '', company_name: '', income_range: '', work_location: '',
  father_name: '', father_occupation: '', mother_name: '', mother_occupation: '', siblings: '', family_type: '',
  family_spiritual_background: '',
  sampraday: '', initiated: '', temple: '', years: '', chants_mala: '', mala_rounds: '', ekadashi: '', puja: '',
  vegetarian: '', onion_garlic: '', alcohol_smoking: '', prasad: '',
  pref_sampraday: '', pref_level: '', pref_diet: '', pref_age_min: '', pref_age_max: '', pref_height_min: '',
  pref_height_max: '', pref_education: '', pref_location: '', pref_marital: '',
  decl_values: false, decl_dignity: false, decl_truth: false,
});

/* ------------------------------------------------------------------ helpers */

/** 5'6" -> 168. Also accepts a plain number of centimetres ("172"). Returns undefined if unparseable. */
export function heightToCm(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const ft = value.match(/^\s*(\d)\s*['′]\s*(\d{1,2})?\s*["″]?\s*$/);
  if (ft) return Math.round(parseInt(ft[1], 10) * 30.48 + parseInt(ft[2] || '0', 10) * 2.54);
  const cm = value.match(/^\s*(\d{2,3})\s*(cm)?\s*$/i);
  if (cm) return parseInt(cm[1], 10);
  return undefined;
}

export function ageFromDob(dob: string, today = new Date()): number | undefined {
  const m = dob.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return undefined;
  const [y, mo, d] = [parseInt(m[1], 10), parseInt(m[2], 10), parseInt(m[3], 10)];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < mo || (today.getMonth() + 1 === mo && today.getDate() < d)) age -= 1;
  return age;
}

const LABELS = {
  qualification: {
    'high-school': 'High School', diploma: 'Diploma', bachelors: "Bachelor's Degree",
    masters: "Master's Degree", phd: 'PhD / Doctorate', other: 'Other',
  } as Record<string, string>,
  occupation: {
    private: 'Private Sector', government: 'Government', business: 'Business / Self-Employed',
    professional: 'Professional (Doctor, Lawyer)', student: 'Student', homemaker: 'Homemaker',
    'temple-service': 'Temple Service / Seva', other: 'Other',
  } as Record<string, string>,
  income: {
    'below-3': 'Below 3 Lakhs', '3-5': '3 - 5 Lakhs', '5-10': '5 - 10 Lakhs', '10-20': '10 - 20 Lakhs',
    '20-50': '20 - 50 Lakhs', '50-plus': '50+ Lakhs', 'no-disclose': 'Prefer not to disclose',
  } as Record<string, string>,
};

const EMPLOYMENT: Record<string, string> = {
  private: 'salaried', government: 'salaried', professional: 'salaried', business: 'business',
  student: 'student', homemaker: 'not_working', 'temple-service': 'not_working',
};

export function roleFor(profileFor: string, gender: string): 'bride' | 'groom' | 'parent' {
  if (profileFor && profileFor !== 'self') return 'parent';
  return gender === 'female' ? 'bride' : 'groom';
}

const yes = (v: string) => v === 'yes' || v === 'always';
const clean = <T extends Record<string, any>>(o: T): Partial<T> =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== '' && v !== null)) as Partial<T>;

/* ----------------------------------------------------------------- payloads */

/** Sent to POST /auth/register/ on every step (idempotent). */
export function accountPayload(f: RegistrationForm) {
  return clean({
    first_name: f.first_name.trim(),
    last_name: f.last_name.trim(),
    gender: f.gender,
    role: roleFor(f.profile_for, f.gender),
    email: f.email.trim() || undefined,
  });
}

/** The PATCH /profile/me/ body for a wizard step. `sampradayYears` lets "since birth" use the member's age. */
export function profilePatch(step: number, f: RegistrationForm): Record<string, any> {
  switch (step) {
    case 1:
      return clean({
        date_of_birth: f.date_of_birth,
        height_cm: heightToCm(f.height),
        marital_status: f.marital_status.replace(/-/g, '_'),
        manglik_status: f.manglik_status.replace(/-/g, '_'),
        about_me: f.about_me.trim(),
      });
    case 2:
      return clean({
        country: f.country ? f.country.charAt(0).toUpperCase() + f.country.slice(1) : undefined,
        state: f.state.trim(),
        current_city: f.current_city.trim(),
        permanent_address: f.permanent_address.trim(),
      });
    case 3:
      return {
        education: clean({
          highest_qualification: LABELS.qualification[f.qualification] ?? f.qualification,
          field_of_study: f.field_of_study.trim(),
        }),
        career: clean({
          occupation: LABELS.occupation[f.occupation] ?? f.occupation,
          employment_type: EMPLOYMENT[f.occupation],
          company_name: f.company_name.trim(),
          annual_income_range: LABELS.income[f.income_range] ?? f.income_range,
          work_location: f.work_location.trim(),
        }),
      };
    case 4:
      return {
        family: clean({
          father_name: f.father_name.trim(),
          father_occupation: f.father_occupation.trim(),
          mother_name: f.mother_name.trim(),
          mother_occupation: f.mother_occupation.trim(),
          siblings_count: f.siblings === '' ? undefined : parseInt(f.siblings, 10),
          family_type: f.family_type,
          family_spiritual_background: f.family_spiritual_background.trim(),
        }),
      };
    case 5: {
      const yearsMap: Record<string, number> = { '0-2': 1, '3-5': 4, '6-10': 8, '10-plus': 12 };
      const years = f.years === 'since-birth' ? ageFromDob(f.date_of_birth) : yearsMap[f.years];
      const roundsMap: Record<string, number> = { '1-4': 4, '4-8': 8, '8-16': 16, '16-plus': 16 };
      const spiritual_profile = clean({
        sampraday: f.sampraday && f.sampraday !== 'other' ? f.sampraday : undefined,
        is_initiated: f.initiated ? f.initiated === 'yes' : undefined,
        temple_association: f.temple.trim(),
        years_in_devotion: years,
      });
      const spiritual_practices = clean({
        chants_mala: f.chants_mala ? f.chants_mala === 'yes' : undefined,
        mala_rounds_daily: roundsMap[f.mala_rounds],
        follows_ekadashi: f.ekadashi ? yes(f.ekadashi) : undefined,
        performs_daily_puja: f.puja ? yes(f.puja) : undefined,
      });
      const consume = f.alcohol_smoking === 'occasionally' ? 'occasionally' : f.alcohol_smoking ? 'no' : undefined;
      const lifestyle = clean({
        is_vegetarian: f.vegetarian ? f.vegetarian === 'yes' || f.vegetarian === 'vegan' : undefined,
        onion_garlic: f.onion_garlic ? (f.onion_garlic === 'sometimes' ? 'occasionally' : f.onion_garlic) : undefined,
        alcohol: consume,
        smoking: consume,
        prasad_only_diet: f.prasad ? f.prasad === 'yes' || f.prasad === 'mostly' : undefined,
      });
      return {
        ...(Object.keys(spiritual_profile).length ? { spiritual_profile } : {}),
        ...(Object.keys(spiritual_practices).length ? { spiritual_practices } : {}),
        ...(Object.keys(lifestyle).length ? { lifestyle } : {}),
      };
    }
    case 6: {
      const preferred =
        f.pref_sampraday === 'same' ? f.sampraday : /^[0-9a-f-]{36}$/i.test(f.pref_sampraday) ? f.pref_sampraday : undefined;
      const partner_preference = clean({
        preferred_sampraday: preferred && preferred !== 'other' ? preferred : undefined,
        min_spiritual_level: f.pref_level,
        dietary_expectation: f.pref_diet,
        min_age: f.pref_age_min ? parseInt(f.pref_age_min, 10) : undefined,
        max_age: f.pref_age_max ? parseInt(f.pref_age_max, 10) : undefined,
        min_height_cm: heightToCm(f.pref_height_min),
        max_height_cm: heightToCm(f.pref_height_max),
        preferred_education: f.pref_education,
        preferred_location: f.pref_location.trim(),
        marital_status_preference: f.pref_marital,
      });
      return Object.keys(partner_preference).length ? { partner_preference } : {};
    }
    default:
      return {};
  }
}

/* --------------------------------------------------------------- validation */

export type StepErrors = Record<string, string>;

export function validateStep(step: number, f: RegistrationForm, today = new Date()): StepErrors {
  const e: StepErrors = {};
  const need = (key: keyof RegistrationForm, label: string) => {
    if (!String(f[key] ?? '').trim()) e[key] = `${label} is required`;
  };
  if (step === 1) {
    need('profile_for', 'Profile created for');
    need('gender', 'Gender');
    need('first_name', 'First name');
    need('date_of_birth', 'Date of birth');
    need('height', 'Height');
    need('marital_status', 'Marital status');
    if (f.date_of_birth) {
      const age = ageFromDob(f.date_of_birth, today);
      if (age === undefined) e.date_of_birth = 'Enter a valid date of birth';
      else if (age < 18) e.date_of_birth = 'You must be at least 18 years old';
      else if (age > 100) e.date_of_birth = 'Enter a valid date of birth';
    }
    if (f.about_me.trim().length < 20) e.about_me = 'Tell us a little about yourself (at least 20 characters)';
  }
  if (step === 2) {
    need('state', 'State');
    need('current_city', 'Current city');
    if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address';
  }
  if (step === 3) {
    need('qualification', 'Highest qualification');
    need('occupation', 'Occupation');
  }
  if (step === 4) need('family_type', 'Family type');
  if (step === 6) {
    if (!(f.decl_values && f.decl_dignity && f.decl_truth)) e.declaration = 'Please accept all three declarations to continue';
    const lo = parseInt(f.pref_age_min, 10);
    const hi = parseInt(f.pref_age_max, 10);
    if (lo && hi && lo > hi) e.pref_age_min = 'Minimum age cannot exceed maximum age';
  }
  return e;
}

/* ------------------------------------------------------------------- resume */

/** Rebuild form state from the saved account + profile so an interrupted onboarding can resume. */
export function formFromSaved(user: any, profile: any): RegistrationForm {
  const f = emptyForm();
  if (user) {
    f.first_name = user.first_name && user.first_name !== 'User' ? user.first_name : '';
    f.last_name = user.last_name ?? '';
    f.gender = user.gender ?? '';
    f.email = user.email ?? '';
    f.profile_for = user.role === 'parent' ? 'relative' : user.gender ? 'self' : '';
  }
  if (profile) {
    f.date_of_birth = profile.date_of_birth ?? '';
    f.marital_status = profile.profile_completion || profile.date_of_birth ? (profile.marital_status ?? '').replace(/_/g, '-') : '';
    f.manglik_status = (profile.manglik_status ?? '').replace(/_/g, '-');
    f.about_me = profile.about_me ?? '';
    f.state = profile.state ?? '';
    f.current_city = profile.current_city ?? '';
    f.permanent_address = profile.permanent_address ?? '';
    f.country = (profile.country ?? 'India').toLowerCase();
    f.father_name = profile.family?.father_name ?? '';
    f.family_type = profile.family?.family_type ?? '';
    f.sampraday = profile.spiritual_profile?.sampraday ?? '';
    if (profile.height_cm) {
      const inches = Math.round(profile.height_cm / 2.54);
      f.height = `${Math.floor(inches / 12)}'${inches % 12}"`;
    }
    const qual = Object.entries(LABELS.qualification).find(([, l]) => l === profile.education?.highest_qualification);
    f.qualification = qual?.[0] ?? '';
    const occ = Object.entries(LABELS.occupation).find(([, l]) => l === profile.career?.occupation);
    f.occupation = occ?.[0] ?? '';
  }
  return f;
}

/** First wizard step that still has an unfilled required item (used when resuming). */
export function firstIncompleteStep(f: RegistrationForm): number {
  for (let s = 1; s <= 4; s += 1) if (Object.keys(validateStep(s, f)).length) return s;
  return 5;
}
