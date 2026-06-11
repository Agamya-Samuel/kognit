import {
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { LessonAttachmentsRepository } from '../../../db/repositories/lesson-attachments.repository';
import { LecturesRepository } from '../../../db/repositories/lectures.repository';
import type { LessonAttachment } from '../../../db/schema';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    private readonly attachmentsRepo: LessonAttachmentsRepository,
    private readonly lecturesRepo: LecturesRepository,
  ) {}

  async listAttachments(lectureId: number): Promise<LessonAttachment[]> {
    await this.assertLectureExists(lectureId);
    return this.attachmentsRepo.findByLectureId(lectureId);
  }

  async addAttachment(
    lectureId: number,
    data: {
      fileName: string;
      fileUrl: string;
      contentType?: string;
      fileSize?: number;
    },
  ): Promise<LessonAttachment> {
    await this.assertLectureExists(lectureId);

    // Get current max orderIndex
    const existing = await this.attachmentsRepo.findByLectureId(lectureId);
    const maxOrder = existing.reduce((max, a) => Math.max(max, a.orderIndex), -1);

    const attachment = await this.attachmentsRepo.create({
      lectureId,
      fileName: data.fileName,
      fileUrl: data.fileUrl,
      contentType: data.contentType ?? null,
      fileSize: data.fileSize ?? null,
      orderIndex: maxOrder + 1,
    });

    this.logger.log(`Attachment added: ${attachment.id} to lecture ${lectureId}`);
    return attachment;
  }

  async deleteAttachment(attachmentId: number): Promise<void> {
    const attachment = await this.attachmentsRepo.findById(attachmentId);
    if (!attachment) {
      throw new NotFoundException('Attachment not found.');
    }

    await this.attachmentsRepo.delete(attachmentId);
    this.logger.log(`Attachment deleted: ${attachmentId}`);
  }

  async reorderAttachments(lectureId: number, orderedIds: number[]): Promise<void> {
    await this.assertLectureExists(lectureId);
    await this.attachmentsRepo.reorder(lectureId, orderedIds);
    this.logger.log(`Attachments reordered for lecture ${lectureId}`);
  }

  private async assertLectureExists(lectureId: number) {
    const lecture = await this.lecturesRepo.findById(lectureId);
    if (!lecture) {
      throw new NotFoundException('Lecture not found.');
    }
    return lecture;
  }
}
