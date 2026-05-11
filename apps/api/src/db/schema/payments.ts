import { pgTable, serial, integer, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './users';
import { courses } from './courses';
import { paymentStatus } from './enums';

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  studentId: integer('student_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  courseId: integer('course_id').notNull().references(() => courses.id, { onDelete: 'restrict' }),
  razorpayOrderId: varchar('razorpay_order_id', { length: 255 }).notNull().unique(),
  razorpayPaymentId: varchar('razorpay_payment_id', { length: 255 }).unique(),
  amount: integer('amount').notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('INR'),
  status: paymentStatus('status').notNull().default('pending'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
