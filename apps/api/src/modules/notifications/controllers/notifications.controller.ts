import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { NotificationsService } from '../services/notifications.service';
import type { Notification } from '../../../db/schema/notifications';
import type { PaginatedResult } from '../../../db/repositories/base.repository';
import { NotificationPreferencesDto } from '../dto/notification-preferences.dto';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getNotifications(
    @CurrentUser() user: { sub: number },
  ): Promise<{ success: true; data: PaginatedResult<Notification> }> {
    const notifications = await this.notificationsService.getNotifications(user.sub);
    return {
      success: true,
      data: notifications,
    };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Unread count retrieved successfully' })
  async getUnreadCount(
    @CurrentUser() user: { sub: number },
  ): Promise<{ success: true; data: { count: number } }> {
    const count = await this.notificationsService.getUnreadCount(user.sub);
    return {
      success: true,
      data: { count },
    };
  }

  @Patch(':id/read')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(
    @CurrentUser() user: { sub: number },
    @Param('id') id: string,
  ): Promise<{ success: true; data: Notification | null }> {
    const notificationId = parseInt(id, 10);
    const notification = await this.notificationsService.markAsRead(
      notificationId,
      user.sub,
    );
    return {
      success: true,
      data: notification,
    };
  }

  @Patch('read-all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(
    @CurrentUser() user: { sub: number },
  ): Promise<{ success: true; data: { count: number } }> {
    const count = await this.notificationsService.markAllAsRead(user.sub);
    return {
      success: true,
      data: { count },
    };
  }

  @Get('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved' })
  async getPreferences(
    @CurrentUser() user: { sub: number },
  ): Promise<{ success: true; data: NotificationPreferencesDto }> {
    const preferences = await this.notificationsService.getPreferences(user.sub);
    return {
      success: true,
      data: preferences,
    };
  }

  @Patch('preferences')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated' })
  async updatePreferences(
    @CurrentUser() user: { sub: number },
    @Body() preferences: NotificationPreferencesDto,
  ): Promise<{ success: true; data: NotificationPreferencesDto }> {
    const updatedPreferences = await this.notificationsService.updatePreferences(
      user.sub,
      preferences,
    );
    return {
      success: true,
      data: updatedPreferences,
    };
  }
}