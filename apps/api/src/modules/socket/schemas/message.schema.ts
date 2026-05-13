import { z } from 'zod';

// ─── Base Message Schema ───────────────────────────────────────────────────

export const BaseMessageSchema = z.object({
  type: z.string().min(1).max(50),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type BaseMessage = z.infer<typeof BaseMessageSchema>;

// ─── Chat Message Schema ───────────────────────────────────────────────────

export const ChatMessageSchema = z.object({
  type: z.literal('chat:message'),
  payload: z.object({
    roomId: z.string().min(1).max(100),
    content: z
      .string()
      .min(1, 'Message content cannot be empty')
      .max(2000, 'Message too long (max 2000 characters)'),
    replyTo: z.string().optional(), // ID of the message being replied to
  }),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ─── Typing Indicator Schema ───────────────────────────────────────────────

export const TypingIndicatorSchema = z.object({
  type: z.literal('chat:typing'),
  payload: z.object({
    roomId: z.string().min(1).max(100),
    isTyping: z.boolean(),
  }),
});

export type TypingIndicator = z.infer<typeof TypingIndicatorSchema>;

// ─── Room Join / Leave Schemas ─────────────────────────────────────────────

export const JoinRoomSchema = z.object({
  type: z.literal('room:join'),
  payload: z.object({
    room: z
      .string()
      .min(1)
      .max(100)
      .regex(/^(course|live|general):.+$/, 'Invalid room format. Expected type:id'),
  }),
});

export type JoinRoom = z.infer<typeof JoinRoomSchema>;

export const LeaveRoomSchema = z.object({
  type: z.literal('room:leave'),
  payload: z.object({
    room: z
      .string()
      .min(1)
      .max(100)
      .regex(/^(course|live|general):.+$/, 'Invalid room format. Expected type:id'),
  }),
});

export type LeaveRoom = z.infer<typeof LeaveRoomSchema>;

// ─── Presence Schema ───────────────────────────────────────────────────────

export const PresenceUpdateSchema = z.object({
  type: z.literal('presence:update'),
  payload: z.object({
    status: z.enum(['online', 'away', 'dnd']),
  }),
});

export type PresenceUpdate = z.infer<typeof PresenceUpdateSchema>;

// ─── Combined validation: all incoming message types ───────────────────────

export const IncomingMessageSchema = z.discriminatedUnion('type', [
  ChatMessageSchema,
  TypingIndicatorSchema,
  JoinRoomSchema,
  LeaveRoomSchema,
  PresenceUpdateSchema,
]);

export type IncomingMessage = z.infer<typeof IncomingMessageSchema>;

// ─── Validation helper ─────────────────────────────────────────────────────

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

export function validateMessage<T>(schema: z.ZodSchema<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));

  return { success: false, errors };
}
