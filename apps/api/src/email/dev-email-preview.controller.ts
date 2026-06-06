import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../modules/auth/decorators/auth.decorators';
import { EmailTemplates, renderTemplate } from './email-renderer';
import { LiveClassReminder, LiveClassReminderProps } from './templates/LiveClassReminder';
import { LiveClassCancelled, LiveClassCancelledProps } from './templates/LiveClassCancelled';
import { AssignmentGraded, AssignmentGradedProps } from './templates/AssignmentGraded';
import { CertificateEarned, CertificateEarnedProps } from './templates/CertificateEarned';
import { PaymentConfirmed, PaymentConfirmedProps } from './templates/PaymentConfirmed';
import { RefundProcessed, RefundProcessedProps } from './templates/RefundProcessed';
import { PasswordReset, PasswordResetProps } from './templates/PasswordReset';
import { EmailVerification, EmailVerificationProps } from './templates/EmailVerification';
import { InstructorApproval, InstructorApprovalProps } from './templates/InstructorApproval';
import { InstructorRejection, InstructorRejectionProps } from './templates/InstructorRejection';
import { CourseModeration, CourseModerationProps } from './templates/CourseModeration';

const mockData: Record<string, Record<string, unknown>> = {
  [EmailTemplates.LIVE_CLASS_REMINDER]: {
    userName: 'Aarav Sharma',
    className: 'Understanding React Server Components',
    scheduledDate: '15th June 2026',
    scheduledTime: '7:00 PM',
    courseName: 'Advanced React Patterns',
    joinUrl: 'https://edutech.in/live/join/abc123',
    timeLabel: 'Today',
  } satisfies LiveClassReminderProps,

  [EmailTemplates.LIVE_CLASS_CANCELLED]: {
    userName: 'Priya Patel',
    className: 'Introduction to TypeScript Generics',
    scheduledDate: '16th June 2026',
    courseName: 'Full Stack TypeScript Mastery',
    cancellationReason: 'The instructor is unwell. A makeup class will be scheduled soon.',
  } satisfies LiveClassCancelledProps,

  [EmailTemplates.ASSIGNMENT_GRADED]: {
    userName: 'Rahul Krishnan',
    assignmentName: 'Build a REST API with NestJS',
    courseName: 'Backend Development with Node.js',
    grade: '87',
    maxGrade: '100',
    feedback: 'Excellent implementation of CRUD endpoints. Consider adding input validation using class-validator for production readiness. The error handling pattern was well-structured.',
    viewUrl: 'https://edutech.in/assignments/submission/view/sub789',
  } satisfies AssignmentGradedProps,

  [EmailTemplates.CERTIFICATE_EARNED]: {
    userName: 'Ananya Iyer',
    courseName: 'Data Structures and Algorithms',
    certificateUrl: 'https://edutech.in/certificates/download/cert456',
    completionDate: '5th June 2026',
  } satisfies CertificateEarnedProps,

  [EmailTemplates.PAYMENT_CONFIRMED]: {
    userName: 'Vikram Reddy',
    courseName: 'Machine Learning Fundamentals',
    amount: '₹4,999',
    transactionId: 'TXN_EDU_20260605_VR789',
    paymentDate: '5th June 2026, 3:42 PM IST',
    invoiceUrl: 'https://edutech.in/invoices/INV-2026-0042',
  } satisfies PaymentConfirmedProps,

  [EmailTemplates.REFUND_PROCESSED]: {
    userName: 'Meera Nair',
    courseName: 'Cloud Computing with AWS',
    refundAmount: '₹2,499',
    transactionId: 'TXN_REFUND_20260604_MN321',
    refundDate: '4th June 2026',
    originalAmount: '₹4,999',
  } satisfies RefundProcessedProps,

  [EmailTemplates.PASSWORD_RESET]: {
    userName: 'Karthik Menon',
    resetUrl: 'https://edutech.in/auth/reset-password?token=reset_token_xyz',
    expiryMinutes: 30,
  } satisfies PasswordResetProps,

  [EmailTemplates.EMAIL_VERIFICATION]: {
    userName: 'Diya Gupta',
    verificationUrl: 'https://edutech.in/auth/verify-email?token=verify_token_abc',
    expiryMinutes: 24,
  } satisfies EmailVerificationProps,

  [EmailTemplates.INSTRUCTOR_APPROVAL]: {
    userName: 'Dr. Suresh Kumar',
    approvalDate: '6th June 2026',
    dashboardUrl: 'https://edutech.in/instructor/dashboard',
  } satisfies InstructorApprovalProps,

  [EmailTemplates.INSTRUCTOR_REJECTION]: {
    userName: 'Nikhil Joshi',
    rejectionReason: 'We were unable to verify the teaching credentials provided. Please resubmit with updated certificates or a portfolio of your previous teaching experience.',
    supportUrl: 'https://edutech.in/support',
  } satisfies InstructorRejectionProps,

  [EmailTemplates.COURSE_MODERATION]: {
    userName: 'Dr. Suresh Kumar',
    courseName: 'Advanced System Design for Scale',
    action: 'approved',
    dashboardUrl: 'https://edutech.in/instructor/dashboard',
  } satisfies CourseModerationProps,
};

@ApiTags('dev')
@Public()
@Controller('dev/email-preview')
export class DevEmailPreviewController {
  private guardDev() {
    if (process.env.NODE_ENV !== 'development') {
      throw new NotFoundException();
    }
  }

  @Get()
  async listTemplates(@Res() res: Response) {
    this.guardDev();

    const entries = Object.values(EmailTemplates);
    const links = entries
      .map(
        (name) =>
          `<li style="margin-bottom: 8px;"><a href="/dev/email-preview/${name}" style="color: #4F46E5; text-decoration: none; font-size: 16px;">${name}</a></li>`,
      )
      .join('\n');

    const html = `<!DOCTYPE html>
<html>
<head><title>Email Templates Preview</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 16px; color: #1e293b;">
  <h1 style="font-size: 24px; margin-bottom: 8px;">Email Templates</h1>
  <p style="color: #64748b; margin-bottom: 24px;">Select a template to preview:</p>
  <ul style="list-style: none; padding: 0;">${links}</ul>
</body>
</html>`;

    res.set('Content-Type', 'text/html');
    res.send(html);
  }

  @Get(':templateName')
  async previewTemplate(
    @Param('templateName') templateName: string,
    @Res() res: Response,
  ) {
    this.guardDev();

    const data = mockData[templateName];
    if (!data) {
      const html = `<!DOCTYPE html>
<html>
<head><title>Template Not Found</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; padding: 0 16px; color: #1e293b;">
  <h1 style="font-size: 24px; margin-bottom: 8px;">Template Not Found</h1>
  <p style="color: #64748b;">
    The template <strong>${templateName}</strong> was not found.
    <a href="/dev/email-preview" style="color: #4F46E5;">View all templates</a>
  </p>
</body>
</html>`;
      res.status(404).set('Content-Type', 'text/html').send(html);
      return;
    }

    const { html } = await renderTemplate(templateName, data);
    res.set('Content-Type', 'text/html');
    res.send(html);
  }
}
