import {
  ChatMessageSchema,
  TypingIndicatorSchema,
  JoinRoomSchema,
  LeaveRoomSchema,
  PresenceUpdateSchema,
  IncomingMessageSchema,
  validateMessage,
} from '../schemas/message.schema';

describe('Message Validation Schemas', () => {
  // ─── ChatMessageSchema ────────────────────────────────────────────────────

  describe('ChatMessageSchema', () => {
    it('should validate a valid chat message', () => {
      const result = ChatMessageSchema.safeParse({
        type: 'chat:message',
        payload: { roomId: 'course:1', content: 'Hello world!' },
      });
      expect(result.success).toBe(true);
    });

    it('should validate a chat message with replyTo', () => {
      const result = ChatMessageSchema.safeParse({
        type: 'chat:message',
        payload: { roomId: 'course:1', content: 'Reply', replyTo: 'msg_123' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject a message with empty content', () => {
      const result = ChatMessageSchema.safeParse({
        type: 'chat:message',
        payload: { roomId: 'course:1', content: '' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject a message that is too long (over 2000 chars)', () => {
      const result = ChatMessageSchema.safeParse({
        type: 'chat:message',
        payload: { roomId: 'course:1', content: 'a'.repeat(2001) },
      });
      expect(result.success).toBe(false);
    });

    it('should reject a message with missing roomId', () => {
      const result = ChatMessageSchema.safeParse({
        type: 'chat:message',
        payload: { content: 'Hello' },
      });
      expect(result.success).toBe(false);
    });

    it('should accept a message at exactly 2000 chars', () => {
      const result = ChatMessageSchema.safeParse({
        type: 'chat:message',
        payload: { roomId: 'course:1', content: 'a'.repeat(2000) },
      });
      expect(result.success).toBe(true);
    });
  });

  // ─── TypingIndicatorSchema ────────────────────────────────────────────────

  describe('TypingIndicatorSchema', () => {
    it('should validate a typing start indicator', () => {
      const result = TypingIndicatorSchema.safeParse({
        type: 'chat:typing',
        payload: { roomId: 'course:1', isTyping: true },
      });
      expect(result.success).toBe(true);
    });

    it('should validate a typing stop indicator', () => {
      const result = TypingIndicatorSchema.safeParse({
        type: 'chat:typing',
        payload: { roomId: 'course:1', isTyping: false },
      });
      expect(result.success).toBe(true);
    });

    it('should reject when isTyping is not a boolean', () => {
      const result = TypingIndicatorSchema.safeParse({
        type: 'chat:typing',
        payload: { roomId: 'course:1', isTyping: 'yes' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject when roomId is missing', () => {
      const result = TypingIndicatorSchema.safeParse({
        type: 'chat:typing',
        payload: { isTyping: true },
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── JoinRoomSchema ───────────────────────────────────────────────────────

  describe('JoinRoomSchema', () => {
    it('should validate a valid join course room', () => {
      const result = JoinRoomSchema.safeParse({
        type: 'room:join',
        payload: { room: 'course:42' },
      });
      expect(result.success).toBe(true);
    });

    it('should validate a valid join live room', () => {
      const result = JoinRoomSchema.safeParse({
        type: 'room:join',
        payload: { room: 'live:class-1' },
      });
      expect(result.success).toBe(true);
    });

    it('should validate a valid join general room', () => {
      const result = JoinRoomSchema.safeParse({
        type: 'room:join',
        payload: { room: 'general:announcements' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid room format (no colon)', () => {
      const result = JoinRoomSchema.safeParse({
        type: 'room:join',
        payload: { room: 'invalidroom' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject an invalid room format (bad prefix)', () => {
      const result = JoinRoomSchema.safeParse({
        type: 'room:join',
        payload: { room: 'badtype:42' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject when room is missing', () => {
      const result = JoinRoomSchema.safeParse({
        type: 'room:join',
        payload: {},
      });
      expect(result.success).toBe(false);
    });

    it('should reject when room is empty string', () => {
      const result = JoinRoomSchema.safeParse({
        type: 'room:join',
        payload: { room: '' },
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── LeaveRoomSchema ──────────────────────────────────────────────────────

  describe('LeaveRoomSchema', () => {
    it('should validate a valid leave room', () => {
      const result = LeaveRoomSchema.safeParse({
        type: 'room:leave',
        payload: { room: 'course:42' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid room format', () => {
      const result = LeaveRoomSchema.safeParse({
        type: 'room:leave',
        payload: { room: 'invalid' },
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── PresenceUpdateSchema ─────────────────────────────────────────────────

  describe('PresenceUpdateSchema', () => {
    it('should validate online status', () => {
      const result = PresenceUpdateSchema.safeParse({
        type: 'presence:update',
        payload: { status: 'online' },
      });
      expect(result.success).toBe(true);
    });

    it('should validate away status', () => {
      const result = PresenceUpdateSchema.safeParse({
        type: 'presence:update',
        payload: { status: 'away' },
      });
      expect(result.success).toBe(true);
    });

    it('should validate dnd status', () => {
      const result = PresenceUpdateSchema.safeParse({
        type: 'presence:update',
        payload: { status: 'dnd' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject an invalid status', () => {
      const result = PresenceUpdateSchema.safeParse({
        type: 'presence:update',
        payload: { status: 'invisible' },
      });
      expect(result.success).toBe(false);
    });

    it('should reject when status is missing', () => {
      const result = PresenceUpdateSchema.safeParse({
        type: 'presence:update',
        payload: {},
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── IncomingMessageSchema (discriminated union) ──────────────────────────

  describe('IncomingMessageSchema', () => {
    it('should validate a chat message through the union', () => {
      const result = IncomingMessageSchema.safeParse({
        type: 'chat:message',
        payload: { roomId: 'course:1', content: 'Hi' },
      });
      expect(result.success).toBe(true);
    });

    it('should validate a room join through the union', () => {
      const result = IncomingMessageSchema.safeParse({
        type: 'room:join',
        payload: { room: 'course:1' },
      });
      expect(result.success).toBe(true);
    });

    it('should reject a message with unknown type', () => {
      const result = IncomingMessageSchema.safeParse({
        type: 'unknown:event',
        payload: {},
      });
      expect(result.success).toBe(false);
    });
  });

  // ─── validateMessage helper ───────────────────────────────────────────────

  describe('validateMessage', () => {
    it('should return success with data for valid input', () => {
      const result = validateMessage(ChatMessageSchema, {
        type: 'chat:message',
        payload: { roomId: 'course:1', content: 'Hello' },
      });
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data!.payload.content).toBe('Hello');
    });

    it('should return errors for invalid input', () => {
      const result = validateMessage(ChatMessageSchema, {
        type: 'chat:message',
        payload: { roomId: 'course:1', content: '' },
      });
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });
});
