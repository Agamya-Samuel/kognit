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
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/auth.decorators';
import { UserRole } from '../../../db/schema/enums';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { PlatformSettingsService } from '../services/platform-settings.service';
import { UpdatePlatformSettingsDto } from '../dto/update-platform-settings.dto';

@ApiTags('Platform Settings')
@Controller('platform-settings')
export class PlatformSettingsController {
  constructor(private readonly platformSettingsService: PlatformSettingsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get public platform settings' })
  @ApiResponse({ status: 200, description: 'Public platform settings retrieved successfully' })
  async getPublicSettings(): Promise<{ success: true; data: Record<string, string> }> {
    const settings = await this.platformSettingsService.getPublicSettings();
    return {
      success: true,
      data: settings,
    };
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all platform settings (admin only)' })
  @ApiResponse({ status: 200, description: 'All platform settings retrieved successfully' })
  async getAdminSettings(): Promise<{ success: true; data: Record<string, string> }> {
    const settings = await this.platformSettingsService.getAdminSettings();
    return {
      success: true,
      data: settings,
    };
  }

  @Patch('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Update platform settings (admin only)' })
  @ApiResponse({ status: 200, description: 'Platform settings updated successfully' })
  async updateAdminSettings(
    @Body() updatePlatformSettingsDto: UpdatePlatformSettingsDto,
    @CurrentUser() user: { sub: number; role: string },
  ): Promise<{ success: true; data: Record<string, string> }> {
    // Convert DTO to plain object, removing undefined values
    const updates = Object.fromEntries(
      Object.entries(updatePlatformSettingsDto).filter(([_, value]) => value !== undefined)
    );

    const updatedSettings = await this.platformSettingsService.updateAdminSettings(
      updates,
      user.sub.toString(),
    );

    return {
      success: true,
      data: updatedSettings,
    };
  }
}