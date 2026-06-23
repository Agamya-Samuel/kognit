import type {
  User,
  Course,
  Section,
  Lecture,
  Enrollment,
  Payment,
  Certificate,
  Assignment,
  Submission,
  Message,
  Channel,
  Notification,
  Review,
  Progress,
  LiveClass,
  StudentProfile,
  InstructorProfile,
  AdminProfile,
  EmailVerification,
  PasswordReset,
  UserAuthProvider,
  AuditLog,
  BetaInvite,
  WaitlistEntry,
  Job,
  InstitutionAccount,
  InstitutionEnrollment,
} from '../../db/schema';

// ─── Counter for unique IDs ────────────────────────────────────────────────────

let counter = 0;

function nextId(): number {
  return ++counter;
}

function nextDate(base?: Date, offsetMs?: number): Date {
  return new Date((base?.getTime() ?? Date.now()) + (offsetMs ?? 0));
}

// ─── User ──────────────────────────────────────────────────────────────────────

export function createUser(overrides: Partial<User> = {}): User {
  const id = nextId();
  return {
    id,
    email: `user${id}@edutech.test`,
    passwordHash: '$2b$12$hashedpassword',
    role: 'student',
    name: `Test User ${id}`,
    avatarUrl: null,
    isVerified: false,
    isActive: true,
    approvalStatus: 'approved',
    onboardingCompleted: false,
    deletedAt: null,
    createdAt: nextDate(),
    updatedAt: nextDate(),
    ...overrides,
  };
}

// ─── Course ────────────────────────────────────────────────────────────────────

export function createCourse(overrides: Partial<Course> = {}): Course {
  const id = nextId();
  return {
    id,
    instructorId: overrides.instructorId ?? nextId(),
    title: `Test Course ${id}`,
    description: 'A test course description',
    thumbnailUrl: null,
    domain: 'Programming',
    pricingType: 'free',
    priceInr: 0,
    courseStructure: 'normal',
    status: 'draft',
    revisionNotes: null,
    deletedAt: null,
    createdAt: nextDate(),
    updatedAt: nextDate(),
    ...overrides,
  };
}

// ─── Section ───────────────────────────────────────────────────────────────────

export function createSection(overrides: Partial<Section> = {}): Section {
  const id = nextId();
  return {
    id,
    courseId: overrides.courseId ?? nextId(),
    title: `Test Section ${id}`,
    description: null,
    orderIndex: 0,
    deletedAt: null,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Lecture ───────────────────────────────────────────────────────────────────

export function createLecture(overrides: Partial<Lecture> = {}): Lecture {
  const id = nextId();
  return {
    id,
    sectionId: overrides.sectionId ?? nextId(),
    title: `Test Lecture ${id}`,
    description: 'A test lecture description',
    orderIndex: 0,
    type: 'video',
    uploadId: null,
    videoUrl: null,
    externalVideoUrl: null,
    muxAssetId: null,
    muxPlaybackId: null,
    durationSeconds: 0,
    isFreePreview: false,
    isPublished: false,
    deletedAt: null,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Enrollment ────────────────────────────────────────────────────────────────

export function createEnrollment(overrides: Partial<Enrollment> = {}): Enrollment {
  const id = nextId();
  return {
    id,
    studentId: overrides.studentId ?? nextId(),
    courseId: overrides.courseId ?? nextId(),
    enrolledAt: nextDate(),
    paymentId: null,
    accessType: 'purchased',
    ...overrides,
  };
}

// ─── Payment ───────────────────────────────────────────────────────────────────

export function createPayment(overrides: Partial<Payment> = {}): Payment {
  const id = nextId();
  return {
    id,
    studentId: overrides.studentId ?? nextId(),
    courseId: overrides.courseId ?? nextId(),
    razorpayOrderId: `order_${id}`,
    razorpayPaymentId: null,
    amount: 10000,
    currency: 'INR',
    status: 'pending',
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Certificate ───────────────────────────────────────────────────────────────

export function createCertificate(
  overrides: Partial<Certificate> = {},
): Certificate {
  const id = nextId();
  return {
    id,
    studentId: overrides.studentId ?? nextId(),
    courseId: overrides.courseId ?? nextId(),
    certificateUid: `CERT-${id}`,
    issuedAt: nextDate(),
    pdfUrl: null,
    ...overrides,
  };
}

// ─── Assignment ────────────────────────────────────────────────────────────────

export function createAssignment(
  overrides: Partial<Assignment> = {},
): Assignment {
  const id = nextId();
  return {
    id,
    lectureId: overrides.lectureId ?? nextId(),
    title: `Test Assignment ${id}`,
    description: 'A test assignment description',
    type: 'short',
    maxScore: 100,
    dueAt: nextDate(new Date(), 7 * 24 * 60 * 60 * 1000), // 7 days from now
    lateWindowHours: null,
    latePenaltyPercent: 0,
    deletedAt: null,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Submission ────────────────────────────────────────────────────────────────

export function createSubmission(overrides: Partial<Submission> = {}): Submission {
  const id = nextId();
  return {
    id,
    assignmentId: overrides.assignmentId ?? nextId(),
    studentId: overrides.studentId ?? nextId(),
    content: 'Test submission content',
    score: null,
    feedback: null,
    gradedAt: null,
    submittedAt: nextDate(),
    ...overrides,
  };
}

// ─── Message ───────────────────────────────────────────────────────────────────

export function createMessage(overrides: Partial<Message> = {}): Message {
  const id = nextId();
  return {
    id,
    channelId: overrides.channelId ?? nextId(),
    senderId: overrides.senderId ?? nextId(),
    content: `Test message ${id}`,
    replyToId: null,
    isEdited: false,
    isDeleted: false,
    moderationStatus: 'visible',
    createdAt: nextDate(),
    updatedAt: nextDate(),
  };
}

// ─── Channel ───────────────────────────────────────────────────────────────────

export function createChannel(overrides: Partial<Channel> = {}): Channel {
  const id = nextId();
  return {
    id,
    courseId: null,
    type: 'course',
    name: `Test Channel ${id}`,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Notification ──────────────────────────────────────────────────────────────

export function createNotification(
  overrides: Partial<Notification> = {},
): Notification {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    type: 'info',
    title: `Test Notification ${id}`,
    body: 'Test notification body',
    isRead: false,
    deliveredVia: 'in_app',
    emailSentAt: null,
    jobId: null,
    smsSentAt: null,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Review ────────────────────────────────────────────────────────────────────

export function createReview(overrides: Partial<Review> = {}): Review {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    courseId: overrides.courseId ?? nextId(),
    rating: 5,
    comment: 'Great course!',
    moderationStatus: 'visible',
    flaggedAt: null,
    moderatedBy: null,
    moderatedAt: null,
    deletedAt: null,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Progress ──────────────────────────────────────────────────────────────────

export function createProgress(overrides: Partial<Progress> = {}): Progress {
  const id = nextId();
  return {
    id,
    studentId: overrides.studentId ?? nextId(),
    lectureId: overrides.lectureId ?? nextId(),
    watchedSeconds: 0,
    isCompleted: false,
    lastWatchedAt: nextDate(),
    ...overrides,
  };
}

// ─── LiveClass ─────────────────────────────────────────────────────────────────

export function createLiveClass(overrides: Partial<LiveClass> = {}): LiveClass {
  const id = nextId();
  return {
    id,
    courseId: overrides.courseId ?? nextId(),
    instructorId: overrides.instructorId ?? nextId(),
    recurringScheduleId: null,
    sessionType: 'one_time',
    title: `Test Live Class ${id}`,
    description: null,
    scheduledAt: nextDate(new Date(), 24 * 60 * 60 * 1000), // Tomorrow
    durationMinutes: 60,
    meetingLink: null,
    livekitRoomName: `room-${id}`,
    recordingUrl: null,
    recordingStatus: 'none',
    recordingMuxAssetId: null,
    recordingMuxPlaybackId: null,
    recordingS3Key: null,
    recordingError: null,
    recordingAvailable: true,
    status: 'scheduled',
    createdAt: nextDate(),
    updatedAt: nextDate(),
    ...overrides,
  };
}

// ─── StudentProfile ────────────────────────────────────────────────────────────

export function createStudentProfile(
  overrides: Partial<StudentProfile> = {},
): StudentProfile {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    resumeUrl: null,
    skills: [],
    placementStatus: null,
    mobile: null,
    address: null,
    city: null,
    state: null,
    pinCode: null,
    country: null,
    affiliatedInstituteId: null,
    createdAt: nextDate(),
    ...overrides,
  } as StudentProfile;
}

// ─── InstructorProfile ─────────────────────────────────────────────────────────

export function createInstructorProfile(
  overrides: Partial<InstructorProfile> = {},
): InstructorProfile {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    bio: 'Test instructor bio',
    expertise: ['JavaScript', 'TypeScript'],
    socialLinks: [],
    approvalStatus: 'pending',
    razorpaySellerAccountId: null,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── AdminProfile ──────────────────────────────────────────────────────────────

export function createAdminProfile(
  overrides: Partial<AdminProfile> = {},
): AdminProfile {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    department: 'Engineering',
    permissionsLevel: 'support',
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── EmailVerification ─────────────────────────────────────────────────────────

export function createEmailVerification(
  overrides: Partial<EmailVerification> = {},
): EmailVerification {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    tokenHash: 'hash',
    purpose: 'email_verify',
    expiresAt: nextDate(new Date(), 24 * 60 * 60 * 1000), // 24 hours
    verified: false,
    createdAt: nextDate(),
    ...overrides,
  } as EmailVerification;
}

// ─── PasswordReset ─────────────────────────────────────────────────────────────

export function createPasswordReset(
  overrides: Partial<PasswordReset> = {},
): PasswordReset {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    tokenHash: 'hash',
    expiresAt: nextDate(new Date(), 60 * 60 * 1000), // 1 hour
    used: false,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── UserAuthProvider ──────────────────────────────────────────────────────────

export function createUserAuthProvider(
  overrides: Partial<UserAuthProvider> = {},
): UserAuthProvider {
  const id = nextId();
  return {
    id,
    userId: overrides.userId ?? nextId(),
    provider: 'google',
    providerId: `provider-${id}`,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── AuditLog ──────────────────────────────────────────────────────────────────

export function createAuditLog(overrides: Partial<AuditLog> = {}): AuditLog {
  const id = nextId();
  return {
    id,
    actorId: overrides.actorId ?? nextId(),
    action: 'create',
    entityType: 'user',
    entityId: null,
    metadata: {},
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── BetaInvite ────────────────────────────────────────────────────────────────

export function createBetaInvite(overrides: Partial<BetaInvite> = {}): BetaInvite {
  const id = nextId();
  return {
    id,
    code: `INVITE-${id}`,
    email: `invite${id}@edutech.test`,
    invitedBy: overrides.invitedBy ?? nextId(),
    usedBy: null,
    expiresAt: nextDate(new Date(), 7 * 24 * 60 * 60 * 1000),
    maxUses: 1,
    useCount: 0,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── WaitlistEntry ─────────────────────────────────────────────────────────────

export function createWaitlistEntry(
  overrides: Partial<WaitlistEntry> = {},
): WaitlistEntry {
  const id = nextId();
  return {
    id,
    email: `waitlist${id}@edutech.test`,
    unsubscribedAt: null,
    unsubscribeToken: `token-${id}`,
    source: 'landing_page',
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── Job ───────────────────────────────────────────────────────────────────────

export function createJob(overrides: Partial<Job> = {}): Job {
  const id = nextId();
  return {
    id,
    title: `Test Job ${id}`,
    company: 'Test Company',
    description: 'A test job description',
    domain: 'Engineering',
    location: 'Remote',
    url: null,
    postedBy: overrides.postedBy ?? nextId(),
    courseId: null,
    isActive: true,
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── InstitutionAccount ────────────────────────────────────────────────────────

export function createInstitutionAccount(
  overrides: Partial<InstitutionAccount> = {},
): InstitutionAccount {
  const id = nextId();
  return {
    id,
    institutionName: `Test Institution ${id}`,
    contactEmail: `admin@institution${id}.test`,
    razorpayCustomerId: null,
    seatCount: 100,
    activeUntil: nextDate(new Date(), 365 * 24 * 60 * 60 * 1000), // 1 year
    createdAt: nextDate(),
    ...overrides,
  };
}

// ─── InstitutionEnrollment ─────────────────────────────────────────────────────

export function createInstitutionEnrollment(
  overrides: Partial<InstitutionEnrollment> = {},
): InstitutionEnrollment {
  const id = nextId();
  return {
    id,
    institutionAccountId: overrides.institutionAccountId ?? nextId(),
    studentId: overrides.studentId ?? nextId(),
    courseId: overrides.courseId ?? nextId(),
    enrolledAt: nextDate(),
    ...overrides,
  };
}

