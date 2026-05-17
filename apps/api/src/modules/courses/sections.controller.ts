import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiParam } from '@nestjs/swagger';
import { SectionsService } from './sections.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/auth.decorators';
import { Roles } from '../auth/decorators/auth.decorators';
import type { JwtPayload } from '../auth/strategies';
import { CreateSectionDto, UpdateSectionDto, ReorderSectionsDto } from './dto/section.dto';

@ApiTags('Sections')
@Controller('api/v1/courses/:courseId/sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Public()
  @Get()
  @ApiResponse({ status: 200, description: 'Section list retrieved' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiOperation({ summary: 'List sections for a course' })
  async listSections(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    const sections = await this.sectionsService.getSectionsByCourse(
      courseId,
      user?.sub,
      user?.role,
    );

    return {
      success: true,
      data: sections,
      error: null,
    };
  }

  @Public()
  @Get(':sectionId')
  @ApiResponse({ status: 200, description: 'Section details' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiOperation({ summary: 'Get a section by ID' })
  async getSection(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    const section = await this.sectionsService.getSectionById(
      sectionId,
      user?.sub,
      user?.role,
    );

    return {
      success: true,
      data: section,
      error: null,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 201, description: 'Section created' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiOperation({ summary: 'Create a section in a course (owner/admin only)' })
  async createSection(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateSectionDto,
  ) {
    const section = await this.sectionsService.createSection(
      courseId,
      user.sub,
      user.role,
      dto,
    );

    return {
      success: true,
      data: section,
      error: null,
    };
  }

  @Put(':sectionId')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Section updated' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiOperation({ summary: 'Update a section (owner/admin only)' })
  async updateSection(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateSectionDto,
  ) {
    const section = await this.sectionsService.updateSection(
      sectionId,
      user.sub,
      user.role,
      dto,
    );

    return {
      success: true,
      data: section,
      error: null,
    };
  }

  @Put('reorder')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Sections reordered' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiOperation({ summary: 'Reorder sections within a course' })
  async reorderSections(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReorderSectionsDto,
  ) {
    const sections = await this.sectionsService.reorderSections(
      courseId,
      user.sub,
      user.role,
      dto.sectionIds,
    );

    return {
      success: true,
      data: sections,
      error: null,
    };
  }

  @Delete(':sectionId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiResponse({ status: 200, description: 'Section deleted' })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiParam({ name: 'sectionId', description: 'Section ID' })
  @ApiOperation({ summary: 'Delete a section (owner/admin only)' })
  async deleteSection(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.sectionsService.deleteSection(sectionId, user.sub, user.role);

    return {
      success: true,
      data: { message: 'Section deleted successfully.' },
      error: null,
    };
  }
}
