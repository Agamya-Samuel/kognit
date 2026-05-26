import { getApiClient } from '../index';

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  role: string;
  avatarUrl?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserProfileDto {
  name?: string;
  institution?: string;
  grade?: string;
  email?: string;
}

export const usersService = {
  /**
   * Get current user profile
   * @returns User profile data
   */
  getProfile(): Promise<UserProfile> {
    return getApiClient().get<UserProfile>('/users/profile');
  },

  /**
   * Update current user profile
   * @param data - Profile data to update
   * @returns Updated user profile
   */
  updateProfile(data: UpdateUserProfileDto): Promise<UserProfile> {
    return getApiClient().patch<UserProfile>('/users/profile', data);
  },
};