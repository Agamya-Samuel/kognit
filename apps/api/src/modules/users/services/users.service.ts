import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UsersRepository } from '../../db/repositories/users.repository';
import { User } from '../../db/schema/users';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

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
    await this.usersRepository.update(userId, updateUserProfileDto);
    const updatedUser = await this.usersRepository.findById(userId);
    if (!updatedUser) {
      throw new InternalServerErrorException('User not found after update');
    }
    return updatedUser;
  }
}