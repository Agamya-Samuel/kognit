import { Test, TestingModule } from '@nestjs/testing';
import { CoursesController } from '../courses.controller';
import { CoursesService } from '../courses.service';
import type { JwtPayload } from '../../auth/strategies';

// ─── Test Suite ─────────────────────────────────────────────────────────

describe('CoursesController', () => {
  let controller: CoursesController;
  let coursesService: Record<string, jest.Mock>;

  beforeEach(async () => {
    coursesService = {
      listCourses: jest.fn(),
      getCourseById: jest.fn(),
      getCourseWithCurriculum: jest.fn(),
      createCourse: jest.fn(),
      updateCourse: jest.fn(),
      deleteCourse: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoursesController],
      providers: [{ provide: CoursesService, useValue: coursesService }],
    }).compile();

    controller = module.get<CoursesController>(CoursesController);
  });

  // ─── Public: Browse Courses ─────────────────────────────────────────

  describe('listCourses', () => {
    it('should call coursesService.listCourses with default isPublished=true', async () => {
      const mockResult = { courses: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrev: false };
      coursesService.listCourses.mockResolvedValue(mockResult);

      const result = await controller.listCourses({
        page: 1,
        limit: 20,
        domain: 'Programming',
        search: 'test',
      });

      expect(coursesService.listCourses).toHaveBeenCalledWith({
        page: 1,
        limit: 20,
        domain: 'Programming',
        isPublished: true,
        search: 'test',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should respect isPublished query param', async () => {
      coursesService.listCourses.mockResolvedValue({ courses: [], total: 0, page: 1, limit: 20, hasNext: false, hasPrev: false });

      await controller.listCourses({ isPublished: false });

      expect(coursesService.listCourses).toHaveBeenCalledWith(
        expect.objectContaining({ isPublished: false }),
      );
    });
  });

  describe('getCourse', () => {
    it('should call coursesService.getCourseById with id and user', async () => {
      const mockCourse = { id: 1, title: 'Test Course' };
      coursesService.getCourseById.mockResolvedValue(mockCourse);
      const user: JwtPayload = { sub: 1, email: 'test@test.com', role: 'instructor' };

      const result = await controller.getCourse(1, user);

      expect(coursesService.getCourseById).toHaveBeenCalledWith(1, 1, 'instructor');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });

    it('should call coursesService.getCourseById with id only when no user', async () => {
      const mockCourse = { id: 1, title: 'Test Course' };
      coursesService.getCourseById.mockResolvedValue(mockCourse);

      const result = await controller.getCourse(1);

      expect(coursesService.getCourseById).toHaveBeenCalledWith(1, undefined, undefined);
      expect(result.success).toBe(true);
    });
  });

  describe('getCourseCurriculum', () => {
    it('should call coursesService.getCourseWithCurriculum', async () => {
      const mockCourse = { id: 1, title: 'Test', sections: [] };
      coursesService.getCourseWithCurriculum.mockResolvedValue(mockCourse);

      const result = await controller.getCourseCurriculum(1);

      expect(coursesService.getCourseWithCurriculum).toHaveBeenCalledWith(1, undefined, undefined, false);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });
  });

  // ─── Instructor/Admin: Create & Manage ────────────────────────

  describe('createCourse', () => {
    it('should call coursesService.createCourse with user data', async () => {
      const mockCourse = { id: 1, title: 'New Course' };
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      coursesService.createCourse.mockResolvedValue(mockCourse);

      const result = await controller.createCourse(user, {
        title: 'New Course',
        domain: 'Programming',
        pricingType: 'free',
      });

      expect(coursesService.createCourse).toHaveBeenCalledWith(10, 'instructor', expect.objectContaining({
        title: 'New Course',
        domain: 'Programming',
        pricingType: 'free',
      }));
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });
  });

  describe('updateCourse', () => {
    it('should call coursesService.updateCourse with id and user data', async () => {
      const mockCourse = { id: 1, title: 'Updated Course' };
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      coursesService.updateCourse.mockResolvedValue(mockCourse);

      const result = await controller.updateCourse(1, user, {
        title: 'Updated Course',
      });

      expect(coursesService.updateCourse).toHaveBeenCalledWith(1, 10, 'instructor', {
        title: 'Updated Course',
      });
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockCourse);
    });

    it('should allow admin to update any course', async () => {
      const mockCourse = { id: 1, title: 'Admin Updated' };
      const user: JwtPayload = { sub: 99, email: 'admin@test.com', role: 'admin' };
      coursesService.updateCourse.mockResolvedValue(mockCourse);

      const result = await controller.updateCourse(1, user, { title: 'Admin Updated' });

      expect(coursesService.updateCourse).toHaveBeenCalledWith(1, 99, 'admin', { title: 'Admin Updated' });
    });
  });

  describe('deleteCourse', () => {
    it('should call coursesService.deleteCourse with id and user', async () => {
      const user: JwtPayload = { sub: 10, email: 'instructor@test.com', role: 'instructor' };
      coursesService.deleteCourse.mockResolvedValue(undefined);

      const result = await controller.deleteCourse(1, user);

      expect(coursesService.deleteCourse).toHaveBeenCalledWith(1, 10, 'instructor');
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ message: 'Course deleted successfully.' });
    });

    it('should allow admin to delete any course', async () => {
      const user: JwtPayload = { sub: 99, email: 'admin@test.com', role: 'admin' };
      coursesService.deleteCourse.mockResolvedValue(undefined);

      await controller.deleteCourse(1, user);

      expect(coursesService.deleteCourse).toHaveBeenCalledWith(1, 99, 'admin');
    });
  });
});
