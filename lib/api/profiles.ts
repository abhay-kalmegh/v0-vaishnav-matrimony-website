import apiClient, { unwrapList } from '../api';

export interface Profile {
  id: string;
  user: any;
  about_me: string;
  age: number;
  height_cm: number;
  marital_status: string;
  current_city: string;
  state: string;
  photos: any[];
  is_approved: boolean;
  created_at: string;
  updated_at: string;
  education?: any;
  career?: any;
  family?: any;
  lifestyle?: any;
  // UI-friendly aliases added by adaptProfile()
  bio?: string;
  height?: number;
  weight?: number;
  city?: string;
  location?: string;
  manglik?: string;
  caste?: string;
  is_verified?: boolean;
  [key: string]: any;
}

export interface ProfileUpdate {
  about_me?: string;
  height_cm?: number;
  weight_kg?: number;
  marital_status?: string;
  current_city?: string;
  state?: string;
  country?: string;
  // aliases the profile editor uses
  bio?: string;
  height?: number | string;
  weight?: number | string;
}

/**
 * Map the Django serializer shape onto the names the screens read
 * (bio/height/city/education.degree/career.company ...). Original fields are kept.
 */
export function adaptProfile(p: any): Profile {
  if (!p) return p;
  const photos = p.photos ?? (p.primary_photo ? [p.primary_photo] : []);
  return {
    ...p,
    photos,
    bio: p.about_me ?? '',
    height: p.height_cm,
    weight: p.weight_kg,
    city: p.current_city,
    location: [p.current_city, p.state].filter(Boolean).join(', '),
    manglik: p.manglik_status,
    is_verified: p.user?.is_verified ?? false,
    education: p.education
      ? { ...p.education, degree: p.education.highest_qualification }
      : p.education,
    career: p.career
      ? {
          ...p.career,
          company: p.career.company_name,
          income_range: p.career.annual_income_range,
        }
      : p.career,
  };
}

const num = (v: any) => (v === '' || v === undefined || v === null || isNaN(Number(v)) ? undefined : Number(v));
const strip = (o: Record<string, any>) =>
  Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined && v !== ''));

const profilesAPI = {
  getMyProfile: async () => {
    const response = await apiClient.get('/profile/me/');
    return adaptProfile(response.data);
  },

  updateProfile: async (data: ProfileUpdate) => {
    const { bio, height, weight, ...rest } = data;
    const payload = strip({
      ...rest,
      about_me: rest.about_me ?? bio,
      height_cm: rest.height_cm ?? num(height),
      weight_kg: rest.weight_kg ?? num(weight),
    });
    const response = await apiClient.patch('/profile/me/', payload);
    return adaptProfile(response.data);
  },

  updateEducation: async (data: { degree?: string; field_of_study?: string; institution_name?: string }) => {
    const education = strip({
      highest_qualification: data.degree,
      field_of_study: data.field_of_study,
      institution_name: data.institution_name,
    });
    const response = await apiClient.patch('/profile/me/', { education });
    return adaptProfile(response.data);
  },

  updateCareer: async (data: { occupation?: string; company?: string; income_range?: string }) => {
    const career = strip({
      occupation: data.occupation,
      company_name: data.company,
      annual_income_range: data.income_range,
    });
    const response = await apiClient.patch('/profile/me/', { career });
    return adaptProfile(response.data);
  },

  getProfile: async (id: string) => {
    const response = await apiClient.get(`/profile/${id}/`);
    return adaptProfile(response.data);
  },

  searchProfiles: async (filters: {
    min_age?: number;
    max_age?: number;
    age_min?: number; // alias used by the search screen
    age_max?: number;
    gender?: string;
    sampraday?: string | number;
    city?: string;
    limit?: number;
    offset?: number;
  }) => {
    const { age_min, age_max, city, limit, offset, ...rest } = filters;
    const params = strip({
      ...rest,
      min_age: rest.min_age ?? age_min,
      max_age: rest.max_age ?? age_max,
      current_city__icontains: city,
      // Backend uses page-number pagination (page size 20), not limit/offset.
      page: limit && offset ? Math.floor(offset / limit) + 1 : undefined,
    });
    const response = await apiClient.get('/profile/search/', { params });
    return {
      count: response.data.count ?? 0,
      results: unwrapList(response.data).map(adaptProfile),
    };
  },

  uploadPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('photo', file);
    const response = await apiClient.post(`/profile/photos/`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePhoto: async (photoId: string) => {
    await apiClient.delete(`/profile/photos/`, { data: { photo_id: photoId } });
  },

  completeProfileSetup: async (data: any) => {
    const response = await apiClient.patch('/profile/me/', data);
    return adaptProfile(response.data);
  },
};

export default profilesAPI;
