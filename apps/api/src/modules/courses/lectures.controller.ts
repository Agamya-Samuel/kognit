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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LecturesService } from './lectures.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/auth.decorators';
import { Roles } from '../auth/decorators/auth.decorators';
import type { JwtPayload } from '../auth/strategies';
import { CreateLectureDto, UpdateLectureDto, ReorderLecturesDto } from './dto/lecture.dto';

@ApiTags('Lectures')
@Controller('api/v1/sections/:sectionId/lectures')
export class LecturesController {
  constructor(private readonly lecturesService: LecturesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List lectures for a section (respects free preview rules)' })
  async listLectures(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    const lectures = await this.lecturesService.getLecturesBySection(
      sectionId,
      user?.sub,
      user?.role,
      false,
    );

    return {
      success: true,
      data: lectures,
      error: null,
    };
  }

  @Public()
  @Get(':lectureId')
  @ApiOperation({ summary: 'Get a lecture by ID (respects free preview rules)' })
  async getLecture(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @CurrentUser() user?: JwtPayload,
  ) {
    const lecture = await this.lecturesService.getLectureById(
      lectureId,
      user?.sub,
      user?.role,
      false,
    );

    return {
      success: true,
      data: lecture,
      error: null,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Create a lecture in a section (owner/admin only)' })
  async createLecture(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateLectureDto,
  ) {
    const lecture = await this.lecturesService.createLecture(
      sectionId,
      user.sub,
      user.role,
      dto,
    );

    return {
      success: true,
      data: lecture,
      error: null,
    };
  }

  @Put(':lectureId')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Update a lecture (owner/admin only)' })
  async updateLecture(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLectureDto,
  ) {
    const lecture = await this.lecturesService.updateLecture(
      lectureId,
      user.sub,
      user.role,
      dto,
    );

    return {
      success: true,
      data: lecture,
      error: null,
    };
  }

  @Put('reorder')
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Reorder lectures within a section' })
  async reorderLectures(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ReorderLecturesDto,
  ) {
    const lectures = await this.lecturesService.reorderLectures(
      sectionId,
      user.sub,
      user.role,
      dto.lectureIds,
    );

    return {
      success: true,
      data: lectures,
      error: null,
    };
  }

  @Delete(':lectureId')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @Roles('instructor', 'admin')
  @ApiOperation({ summary: 'Delete a lecture (owner/admin only)' })
  async deleteLecture(
    @Param('sectionId', ParseIntPipe) sectionId: number,
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @CurrentUser() user: JwtPayload,
  ) {
    await this.lecturesService.deleteLecture(lectureId, user.sub, user.role);

    return {
      success: true,
      data: { message: 'Lecture deleted successfully.' },
      error: null,
    };
  }
}
