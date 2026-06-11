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
import { Roles } from '../../auth/decorators/auth.decorators';
import { AttachmentsService } from '../services/attachments.service';
import { CreateLessonAttachmentDto, ReorderAttachmentsDto } from '../dto/course.dto';

@ApiTags('Lesson Attachments')
@Controller('lectures/:lectureId/attachments')
@ApiBearerAuth()
@Roles('instructor', 'admin')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List attachments for a lecture' })
  @ApiResponse({ status: 200, description: 'Attachments list' })
  async listAttachments(@Param('lectureId', ParseIntPipe) lectureId: number) {
    const attachments = await this.attachmentsService.listAttachments(lectureId);
    return { success: true, data: attachments, error: null };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add an attachment to a lecture' })
  @ApiResponse({ status: 201, description: 'Attachment added' })
  async addAttachment(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() dto: CreateLessonAttachmentDto,
  ) {
    const attachment = await this.attachmentsService.addAttachment(lectureId, dto);
    return { success: true, data: attachment, error: null };
  }

  @Delete(':attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove an attachment' })
  @ApiResponse({ status: 200, description: 'Attachment removed' })
  @ApiParam({ name: 'attachmentId', description: 'Attachment ID' })
  async deleteAttachment(
    @Param('lectureId', ParseIntPipe) _lectureId: number,
    @Param('attachmentId', ParseIntPipe) attachmentId: number,
  ) {
    await this.attachmentsService.deleteAttachment(attachmentId);
    return { success: true, data: { message: 'Attachment removed.' }, error: null };
  }

  @Put('reorder')
  @ApiOperation({ summary: 'Reorder attachments for a lecture' })
  @ApiResponse({ status: 200, description: 'Attachments reordered' })
  async reorderAttachments(
    @Param('lectureId', ParseIntPipe) lectureId: number,
    @Body() dto: ReorderAttachmentsDto,
  ) {
    await this.attachmentsService.reorderAttachments(lectureId, dto.orderedIds);
    return { success: true, data: { message: 'Attachments reordered.' }, error: null };
  }
}
