import { z } from 'zod';

export const DashboardMetricsSchema = z.object({
  totalStudents: z.number().int().min(0),
  activeCourses: z.number().int().min(0),
  totalRevenue: z.number().int().min(0),
  upcomingClasses: z.number().int().min(0),
  recentActivity: z.array(z.object({
    id: z.number().int(),
    type: z.enum(['enrollment', 'completion', 'review', 'assignment_submission', 'live_class']),
    title: z.string(),
    time: z.string(),
  })),
});

export const InstructorStudentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  courseId: z.number().int(),
  courseTitle: z.string(),
  enrolledAt: z.string().datetime(),
  progressPercentage: z.number().int().min(0).max(100),
});

export const InstructorStudentsResponseSchema = z.object({
  students: z.array(InstructorStudentSchema),
  total: z.number().int().min(0),
});