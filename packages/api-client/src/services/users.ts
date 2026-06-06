import { getApiClient } from '../index';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  grade?: string;
  institution?: string;
  studentProfile?: {
    mobile?: string;
    address?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
    affiliatedInstituteId?: number | null;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  institution?: string;
  grade?: string;
  email?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
}

export const usersService = {
  getProfile(): Promise<UserProfile> {
    return getApiClient().get<UserProfile>('/users/profile');
  },

  getMe(): Promise<UserProfile> {
    return getApiClient().get<UserProfile>('/auth/me');
  },

  updateProfile(data: UpdateUserProfileDto): Promise<UserProfile> {
    return getApiClient().patch<UserProfile>('/users/profile', data);
  },
};