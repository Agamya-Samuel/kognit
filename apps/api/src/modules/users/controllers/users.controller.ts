import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { UsersService } from '../services/users.service';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import type { User } from '../../../db/schema/users';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(
    @CurrentUser() user: { sub: number },
  ): Promise<Omit<User, 'passwordHash'>> {
    return this.usersService.getProfile(user.sub);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'User profile updated successfully' })
  async updateProfile(
    @CurrentUser() user: { sub: number },
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    return this.usersService.updateProfile(user.sub, updateUserProfileDto);
  }
}