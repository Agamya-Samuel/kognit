import { relations } from 'drizzle-orm';
import { users } from './users';
import { instructorProfiles } from './instructor-profiles';
import { studentProfiles } from './student-profiles';
import { adminProfiles } from './admin-profiles';
import { courses } from './courses';
import { sections } from './sections';
import { lectures } from './lectures';
import { liveClasses } from './live-classes';
import { enrollments } from './enrollments';
import { progress } from './progress';
import { certificates } from './certificates';
import { assignments } from './assignments';
import { submissions } from './submissions';
import { payments } from './payments';
import { channels } from './channels';
import { messages } from './messages';
import { notifications } from './notifications';
import { auditLogs } from './audit-logs';
import { passwordResets } from './password-resets';
import { emailVerifications } from './email-verifications';
import { userAuthProviders } from './user-auth-providers';
import { betaInvites } from './beta-invites';
import { waitlist } from './waitlist';
import { reviews } from './reviews';
import { jobs } from './jobs';
import { institutionAccounts } from './institution-accounts';
import { institutionEnrollments } from './institution-enrollments';

// User relations
export const usersRelations = relations(users, ({ many, one }) => ({
  instructorProfile: one(instructorProfiles, {
    fields: [users.id],
    references: [instructorProfiles.userId],
  }),
  studentProfile: one(studentProfiles, {
    fields: [users.id],
    references: [studentProfiles.userId],
  }),
  adminProfile: one(adminProfiles, {
    fields: [users.id],
    references: [adminProfiles.userId],
  }),
  courses: many(courses),
  enrollments: many(enrollments),
  progress: many(progress),
  certificates: many(certificates),
  submissions: many(submissions),
  payments: many(payments),
  messages: many(messages),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
  passwordResets: many(passwordResets),
  emailVerifications: many(emailVerifications),
  userAuthProviders: many(userAuthProviders),
  betaInvitesInvited: many(betaInvites, { relationName: 'invitedBy' }),
  betaInvitesUsed: many(betaInvites, { relationName: 'usedBy' }),
  reviews: many(reviews),
  jobs: many(jobs),
  institutionEnrollments: many(institutionEnrollments),
  liveClasses: many(liveClasses),
}));

// Profile relations
export const instructorProfilesRelations = relations(instructorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [instructorProfiles.userId],
    references: [users.id],
  }),
}));

export const studentProfilesRelations = relations(studentProfiles, ({ one }) => ({
  user: one(users, {
    fields: [studentProfiles.userId],
    references: [users.id],
  }),
}));

export const adminProfilesRelations = relations(adminProfiles, ({ one }) => ({
  user: one(users, {
    fields: [adminProfiles.userId],
    references: [users.id],
  }),
}));

// Course relations
export const coursesRelations = relations(courses, ({ one, many }) => ({
  instructor: one(users, {
    fields: [courses.instructorId],
    references: [users.id],
  }),
  sections: many(sections),
  enrollments: many(enrollments),
  certificates: many(certificates),
  payments: many(payments),
  reviews: many(reviews),
  jobs: many(jobs),
  channels: many(channels),
}));

// Section relations
export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  lectures: many(lectures),
}));

// Lecture relations
export const lecturesRelations = relations(lectures, ({ one, many }) => ({
  section: one(sections, {
    fields: [lectures.sectionId],
    references: [sections.id],
  }),
  assignments: many(assignments),
  progress: many(progress),
  liveClass: one(liveClasses, {
    fields: [lectures.id],
    references: [liveClasses.lectureId],
  }),
}));

// Live class relations
export const liveClassesRelations = relations(liveClasses, ({ one }) => ({
  lecture: one(lectures, {
    fields: [liveClasses.lectureId],
    references: [lectures.id],
  }),
  instructor: one(users, {
    fields: [liveClasses.instructorId],
    references: [users.id],
  }),
}));

// Enrollment relations
export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  student: one(users, {
    fields: [enrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
  payment: one(payments, {
    fields: [enrollments.paymentId],
    references: [payments.id],
  }),
}));

// Progress relations
export const progressRelations = relations(progress, ({ one }) => ({
  student: one(users, {
    fields: [progress.studentId],
    references: [users.id],
  }),
  lecture: one(lectures, {
    fields: [progress.lectureId],
    references: [lectures.id],
  }),
}));

// Certificate relations
export const certificatesRelations = relations(certificates, ({ one }) => ({
  student: one(users, {
    fields: [certificates.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [certificates.courseId],
    references: [courses.id],
  }),
}));

// Assignment relations
export const assignmentsRelations = relations(assignments, ({ one, many }) => ({
  lecture: one(lectures, {
    fields: [assignments.lectureId],
    references: [lectures.id],
  }),
  submissions: many(submissions),
}));

// Submission relations
export const submissionsRelations = relations(submissions, ({ one }) => ({
  assignment: one(assignments, {
    fields: [submissions.assignmentId],
    references: [assignments.id],
  }),
  student: one(users, {
    fields: [submissions.studentId],
    references: [users.id],
  }),
}));

// Payment relations
export const paymentsRelations = relations(payments, ({ one, many }) => ({
  student: one(users, {
    fields: [payments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [payments.courseId],
    references: [courses.id],
  }),
  enrollments: many(enrollments),
}));

// Channel relations
export const channelsRelations = relations(channels, ({ one, many }) => ({
  course: one(courses, {
    fields: [channels.courseId],
    references: [courses.id],
  }),
  messages: many(messages),
}));

// Message relations
export const messagesRelations = relations(messages, ({ one }) => ({
  channel: one(channels, {
    fields: [messages.channelId],
    references: [channels.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Notification relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

// Audit log relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));

// Password reset relations
export const passwordResetsRelations = relations(passwordResets, ({ one }) => ({
  user: one(users, {
    fields: [passwordResets.userId],
    references: [users.id],
  }),
}));

// Email verification relations
export const emailVerificationsRelations = relations(emailVerifications, ({ one }) => ({
  user: one(users, {
    fields: [emailVerifications.userId],
    references: [users.id],
  }),
}));

// User auth provider relations
export const userAuthProvidersRelations = relations(userAuthProviders, ({ one }) => ({
  user: one(users, {
    fields: [userAuthProviders.userId],
    references: [users.id],
  }),
}));

// Beta invite relations
export const betaInvitesRelations = relations(betaInvites, ({ one }) => ({
  invitedByUser: one(users, {
    fields: [betaInvites.invitedBy],
    references: [users.id],
    relationName: 'invitedBy',
  }),
  usedByUser: one(users, {
    fields: [betaInvites.usedBy],
    references: [users.id],
    relationName: 'usedBy',
  }),
}));

// Review relations
export const reviewsRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [reviews.courseId],
    references: [courses.id],
  }),
  moderatedBy: one(users, {
    fields: [reviews.moderatedBy],
    references: [users.id],
  }),
}));

// Job relations
export const jobsRelations = relations(jobs, ({ one }) => ({
  postedByUser: one(users, {
    fields: [jobs.postedBy],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [jobs.courseId],
    references: [courses.id],
  }),
}));

// Institution account relations
export const institutionAccountsRelations = relations(institutionAccounts, ({ many }) => ({
  enrollments: many(institutionEnrollments),
}));

// Institution enrollment relations
export const institutionEnrollmentsRelations = relations(institutionEnrollments, ({ one }) => ({
  institutionAccount: one(institutionAccounts, {
    fields: [institutionEnrollments.institutionAccountId],
    references: [institutionAccounts.id],
  }),
  student: one(users, {
    fields: [institutionEnrollments.studentId],
    references: [users.id],
  }),
  course: one(courses, {
    fields: [institutionEnrollments.courseId],
    references: [courses.id],
  }),
}));
