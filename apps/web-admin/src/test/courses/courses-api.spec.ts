import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import { server } from '@/test/mocks/server';
import api from '@/lib/api';

describe('Admin Courses API', () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should fetch all courses', async () => {
    const { data } = await api.get('/admin/courses');

    const result = data.data ?? data;
    expect(result.courses).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('should fetch only published courses', async () => {
    const { data } = await api.get('/admin/courses', {
      params: { isPublished: true },
    });

    const result = data.data ?? data;
    expect(result.courses).toHaveLength(2);
    expect(result.courses.every((c: any) => c.isPublished)).toBe(true);
  });

  it('should fetch only draft courses', async () => {
    const { data } = await api.get('/admin/courses', {
      params: { isPublished: false },
    });

    const result = data.data ?? data;
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].title).toBe('Python for Data Science');
  });

  it('should search courses', async () => {
    const { data } = await api.get('/admin/courses', {
      params: { search: 'react' },
    });

    const result = data.data ?? data;
    expect(result.courses).toHaveLength(1);
    expect(result.courses[0].title).toBe('Advanced React Patterns');
  });

  it('should include instructor names', async () => {
    const { data } = await api.get('/admin/courses');

    const result = data.data ?? data;
    expect(result.courses[0].instructorName).toBe('Test Instructor');
  });

  it('should approve (publish) a course', async () => {
    const { data } = await api.patch('/admin/courses/3/approve');

    expect(data.success).toBe(true);
    expect(data.data.message).toBe('Course approved');
  });

  it('should suspend a course', async () => {
    const { data } = await api.patch('/admin/courses/1/suspend');

    expect(data.success).toBe(true);
    expect(data.data.message).toBe('Course suspended');
  });

  it('should reject a course', async () => {
    const { data } = await api.patch('/admin/courses/2/reject', {
      reason: 'Violates platform guidelines',
    });

    expect(data.success).toBe(true);
    expect(data.data.message).toBe('Course rejected');
  });

  it('should return 404 for non-existent course', async () => {
    await expect(
      api.patch('/admin/courses/999/approve'),
    ).rejects.toThrow();
  });
});
