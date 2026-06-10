// Smoke test — verify all mock factories produce valid domain objects

import {
  createUser,
  createCourse,
  createSection,
  createLecture,
  createEnrollment,
  createPayment,
  createCertificate,
  createAssignment,
  createSubmission,
  createMessage,
  createChannel,
  createNotification,
  createReview,
  createProgress,
  createLiveClass,
  createStudentProfile,
  createInstructorProfile,
  createAdminProfile,
  createEmailVerification,
  createPasswordReset,
  createUserAuthProvider,
  createAuditLog,
  createBetaInvite,
  createWaitlistEntry,
  createJob,
  createInstitutionAccount,
  createInstitutionEnrollment,
} from '../../src/test/factories';

describe('Mock Factories', () => {
  it('createUser produces a valid user with defaults', () => {
    const user = createUser();
    expect(user.email).toMatch(/^user\d+@edutech\.test$/);
    expect(user.role).toBe('student');
    expect(user.name).toMatch(/^Test User \d+$/);
    expect(user.isActive).toBe(true);
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it('createUser accepts overrides', () => {
    const user = createUser({ role: 'admin', name: 'Super Admin' });
    expect(user.role).toBe('admin');
    expect(user.name).toBe('Super Admin');
  });

  it('createCourse produces a valid course', () => {
    const course = createCourse({ instructorId: 42 });
    expect(course.instructorId).toBe(42);
    expect(course.pricingType).toBe('free');
    expect(course.isPublished).toBe(false);
  });

  it('createSection produces a valid section', () => {
    const section = createSection({ courseId: 1 });
    expect(section.courseId).toBe(1);
    expect(section.title).toMatch(/^Test Section \d+$/);
  });

  it('createLecture produces a valid lecture', () => {
    const lecture = createLecture();
    expect(lecture.type).toBe('video');
    expect(lecture.isPublished).toBe(false);
  });

  it('createEnrollment produces a valid enrollment', () => {
    const enrollment = createEnrollment({ studentId: 1, courseId: 2 });
    expect(enrollment.studentId).toBe(1);
    expect(enrollment.courseId).toBe(2);
    expect(enrollment.accessType).toBe('purchased');
  });

  it('createPayment produces a valid payment', () => {
    const payment = createPayment();
    expect(payment.status).toBe('pending');
    expect(payment.currency).toBe('INR');
    expect(payment.amount).toBe(10000);
  });

  it('createCertificate produces a valid certificate', () => {
    const cert = createCertificate();
    expect(cert.certificateUid).toMatch(/^CERT-\d+$/);
  });

  it('createAssignment produces a valid assignment', () => {
    const assignment = createAssignment();
    expect(assignment.type).toBe('short');
    expect(assignment.maxScore).toBe(100);
    expect(assignment.dueAt).toBeInstanceOf(Date);
  });

  it('createSubmission produces a valid submission', () => {
    const submission = createSubmission();
    expect(submission.score).toBeNull();
    expect(submission.feedback).toBeNull();
  });

  it('createMessage produces a valid message', () => {
    const message = createMessage();
    expect(message.isDeleted).toBe(false);
  });

  it('createChannel produces a valid channel', () => {
    const channel = createChannel();
    expect(channel.type).toBe('course');
  });

  it('createNotification produces a valid notification', () => {
    const notification = createNotification();
    expect(notification.type).toBe('info');
    expect(notification.isRead).toBe(false);
  });

  it('createReview produces a valid review', () => {
    const review = createReview();
    expect(review.rating).toBe(5);
    expect(review.moderationStatus).toBe('visible');
  });

  it('createProgress produces a valid progress record', () => {
    const progress = createProgress();
    expect(progress.watchedSeconds).toBe(0);
  });

  it('createLiveClass produces a valid live class', () => {
    const liveClass = createLiveClass();
    expect(liveClass.status).toBe('scheduled');
    expect(liveClass.durationMinutes).toBe(60);
  });

  it('createStudentProfile produces a valid profile', () => {
    const profile = createStudentProfile();
    expect(profile.skills).toEqual([]);
  });

  it('createInstructorProfile produces a valid profile', () => {
    const profile = createInstructorProfile();
    expect(profile.approvalStatus).toBe('pending');
    expect(profile.expertise).toContain('JavaScript');
  });

  it('createAdminProfile produces a valid profile', () => {
    const profile = createAdminProfile();
    expect(profile.department).toBe('Engineering');
    expect(profile.permissionsLevel).toBe('support');
  });

  it('createEmailVerification produces a valid record', () => {
    const ev = createEmailVerification();
    expect(ev.verified).toBe(false);
    expect(ev.expiresAt).toBeInstanceOf(Date);
  });

  it('createPasswordReset produces a valid record', () => {
    const pr = createPasswordReset();
    expect(pr.used).toBe(false);
  });

  it('createUserAuthProvider produces a valid record', () => {
    const provider = createUserAuthProvider();
    expect(provider.provider).toBe('google');
    expect(provider.providerId).toMatch(/^provider-\d+$/);
  });

  it('createAuditLog produces a valid record', () => {
    const log = createAuditLog();
    expect(log.action).toBe('create');
    expect(log.entityType).toBe('user');
  });

  it('createBetaInvite produces a valid record', () => {
    const invite = createBetaInvite();
    expect(invite.code).toMatch(/^INVITE-\d+$/);
    expect(invite.useCount).toBe(0);
  });

  it('createWaitlistEntry produces a valid record', () => {
    const entry = createWaitlistEntry();
    expect(entry.source).toBe('landing_page');
    expect(entry.unsubscribedAt).toBeNull();
  });

  it('createJob produces a valid record', () => {
    const job = createJob();
    expect(job.company).toBe('Test Company');
    expect(job.isActive).toBe(true);
  });

  it('createInstitutionAccount produces a valid record', () => {
    const account = createInstitutionAccount();
    expect(account.seatCount).toBe(100);
    expect(account.activeUntil).toBeInstanceOf(Date);
  });

  it('createInstitutionEnrollment produces a valid record', () => {
    const ie = createInstitutionEnrollment();
    expect(ie.enrolledAt).toBeInstanceOf(Date);
  });

  it('factories produce unique IDs per call', () => {
    const user1 = createUser();
    const user2 = createUser();
    expect(user1.id).not.toBe(user2.id);
  });
});
