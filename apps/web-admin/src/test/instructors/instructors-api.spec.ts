import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/mocks/server';
import api from '@/lib/api';

describe('Admin Instructors API', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should fetch pending instructors', async () => {
    const result = await api.get('/admin/instructors', { status: 'pending' });

    expect(result.instructors).toHaveLength(2);
    expect(result.instructors[0].userName).toBe('Test Instructor');
    expect(result.instructors[0].approvalStatus).toBe('pending');
    expect(result.total).toBe(2);
  });

  it('should fetch instructors with pagination', async () => {
    const result = await api.get('/admin/instructors', { status: 'pending', page: 1, limit: 1 });

    expect(result.instructors).toHaveLength(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(1);
  });

  it('should return empty for approved instructors', async () => {
    const result = await api.get('/admin/instructors', { status: 'approved' });

    expect(result.instructors).toHaveLength(0);
    expect(result.total).toBe(0);
  });

  it('should approve an instructor', async () => {
    const result = await api.patch('/admin/instructors/1/approve');
    expect(result.message).toBe('Instructor approved');

    // Verify status changed
    const check = await api.get('/admin/instructors', { status: 'pending' });
    expect(check.instructors).toHaveLength(1);
  });

  it('should reject an instructor', async () => {
    const result = await api.patch('/admin/instructors/2/reject', {
      reason: 'Insufficient qualifications',
    });
    expect(result.message).toBe('Instructor rejected');
  });

  it('should return 404 for non-existent instructor', async () => {
    await expect(
      api.patch('/admin/instructors/999/approve'),
    ).rejects.toThrow();
  });
});
