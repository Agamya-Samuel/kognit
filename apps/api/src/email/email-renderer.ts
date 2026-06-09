import { render } from '@react-email/render';
import React from 'react';
import { LiveClassReminder } from './templates/LiveClassReminder';
import { LiveClassCancelled } from './templates/LiveClassCancelled';
import { AssignmentGraded } from './templates/AssignmentGraded';
import { CertificateEarned } from './templates/CertificateEarned';
import { PaymentConfirmed } from './templates/PaymentConfirmed';
import { RefundProcessed } from './templates/RefundProcessed';
import { PasswordReset } from './templates/PasswordReset';
import { EmailVerification } from './templates/EmailVerification';
import { InstructorApproval } from './templates/InstructorApproval';
import { InstructorRejection } from './templates/InstructorRejection';
import { InstructorInvite } from './templates/InstructorInvite';
import { CourseModeration } from './templates/CourseModeration';

export const EmailTemplates = {
  LIVE_CLASS_REMINDER: 'live-class-reminder',
  LIVE_CLASS_CANCELLED: 'live-class-cancelled',
  ASSIGNMENT_GRADED: 'assignment-graded',
  CERTIFICATE_EARNED: 'certificate-earned',
  PAYMENT_CONFIRMED: 'payment-confirmed',
  REFUND_PROCESSED: 'refund-processed',
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
  INSTRUCTOR_APPROVAL: 'instructor-approval',
  INSTRUCTOR_REJECTION: 'instructor-rejection',
  INSTRUCTOR_INVITE: 'instructor-invite',
  COURSE_MODERATION: 'course-moderation',
} as const;

export type EmailTemplateName = (typeof EmailTemplates)[keyof typeof EmailTemplates];

function asTemplateComponent(
  component: React.ComponentType<unknown>,
): React.ComponentType<Record<string, unknown>> {
  return component as React.ComponentType<Record<string, unknown>>;
}

const templateMap: Record<
  EmailTemplateName,
  React.ComponentType<Record<string, unknown>>
> = {
  [EmailTemplates.LIVE_CLASS_REMINDER]: asTemplateComponent(LiveClassReminder),
  [EmailTemplates.LIVE_CLASS_CANCELLED]: asTemplateComponent(LiveClassCancelled),
  [EmailTemplates.ASSIGNMENT_GRADED]: asTemplateComponent(AssignmentGraded),
  [EmailTemplates.CERTIFICATE_EARNED]: asTemplateComponent(CertificateEarned),
  [EmailTemplates.PAYMENT_CONFIRMED]: asTemplateComponent(PaymentConfirmed),
  [EmailTemplates.REFUND_PROCESSED]: asTemplateComponent(RefundProcessed),
  [EmailTemplates.PASSWORD_RESET]: asTemplateComponent(PasswordReset),
  [EmailTemplates.EMAIL_VERIFICATION]: asTemplateComponent(EmailVerification),
  [EmailTemplates.INSTRUCTOR_APPROVAL]: asTemplateComponent(InstructorApproval),
  [EmailTemplates.INSTRUCTOR_REJECTION]: asTemplateComponent(InstructorRejection),
  [EmailTemplates.INSTRUCTOR_INVITE]: asTemplateComponent(InstructorInvite),
  [EmailTemplates.COURSE_MODERATION]: asTemplateComponent(CourseModeration),
};

export async function renderEmail(
  component: React.ReactElement,
): Promise<{ html: string; text: string }> {
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true }),
  ]);
  return { html, text };
}

export async function renderTemplate(
  templateName: string,
  data: Record<string, unknown>,
): Promise<{ html: string; text: string }> {
  const Component = templateMap[templateName as EmailTemplateName];
  if (!Component) {
    throw new Error(`Unknown email template: ${templateName}`);
  }
  const element = React.createElement(Component, data);
  return renderEmail(element);
}
