import { Injectable, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { UsersRepository } from '../../../db/repositories/users.repository';
import { StudentProfilesRepository } from '../../../db/repositories/student-profiles.repository';
import { User } from '../../../db/schema/users';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly studentProfilesRepository: StudentProfilesRepository,
  ) {}

  async getProfile(userId: number): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }
    return user;
  }

  async updateProfile(
    userId: number,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<User> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new InternalServerErrorException('User not found');
    }

    // Check name locking for students who have completed onboarding
    if (
      user.role === 'student' &&
      user.onboardingCompleted &&
      updateUserProfileDto.name !== undefined &&
      updateUserProfileDto.name !== user.name
    ) {
      throw new ForbiddenException(
        'Name cannot be changed after onboarding. Contact an administrator.',
      );
    }

    // Extract student profile fields from DTO
    const {
      mobile,
      address,
      city,
      state,
      pinCode,
      country,
      affiliatedInstituteId,
      ...userUpdateData
    } = updateUserProfileDto;

    // Update user record if there are user-level fields to update
    if (Object.keys(userUpdateData).length > 0) {
      await this.usersRepository.update(userId, userUpdateData);
    }

    // Handle student profile fields
    if (user.role === 'student') {
      const existingProfile = await this.studentProfilesRepository.findByUserId(userId);

      if (existingProfile) {
        // Update existing student profile
        await this.studentProfilesRepository.update(existingProfile.id, {
          mobile,
          address,
          city,
          state,
          pinCode,
          country,
          affiliatedInstituteId,
        });
      } else {
        // Create new student profile (first time onboarding)
        await this.studentProfilesRepository.create({
          userId,
          mobile,
          address,
          city,
          state,
          pinCode,
          country,
          affiliatedInstituteId,
        });

        // Mark onboarding as completed if this is the first time setting profile data
        // (Only mark if explicit onboarding completion is indicated)
        if (mobile || address || city || state || pinCode || country) {
          await this.usersRepository.update(userId, { onboardingCompleted: true });
        }
      }
    }

    const updatedUser = await this.usersRepository.findById(userId);
    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after update');
    }
    return updatedUser;
  }
}