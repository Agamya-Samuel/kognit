import { pgTable, serial, integer, text, timestamp, varchar, jsonb, index } from 'drizzle-orm/pg-core';
import type { InferSelectModel } from 'drizzle-orm';
import { users } from './users';

export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  actorId: integer('actor_id').notNull().references(() => users.id, { onDelete: 'restrict' }),
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: integer('entity_id'),
  metadata: jsonb('metadata').$type<Record<string, any>>().notNull().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => [
  index('audit_logs_actor_id_idx').on(table.actorId),
  index('audit_logs_entity_idx').on(table.entityType, table.entityId),
  index('audit_logs_action_idx').on(table.action),
  index('audit_logs_created_at_idx').on(table.createdAt),
]);

export type AuditLog = InferSelectModel<typeof auditLogs>;
