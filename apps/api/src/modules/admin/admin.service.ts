import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository } from '../../db/repositories/users.repository';
import type { User } from '../../db/schema';

export interface AdminListUsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  search?: string;
}

@Injectable()
export class AdminService {
  constructor(private readonly usersRepo: UsersRepository) {}

  async listUsers(query: AdminListUsersQuery) {
    const limit = Math.min(query.limit ?? 20, 100);
    const offset = ((query.page ?? 1) - 1) * limit;

    const result = await this.usersRepo.findMany({
      limit,
      offset,
      role: query.role,
    });

    return {
      users: result.data.map(this.sanitizeUser),
      total: result.total,
      page: query.page ?? 1,
      limit,
    };
  }

  async getUser(id: number) {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async updateUserRole(id: number, role: string) {
    const user = await this.usersRepo.update(id, { role: role as User['role'] });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitizeUser(user);
  }

  async toggleUserActive(id: number) {
    const user = await this.usersRepo.findById(id);
    if (!user) throw new NotFoundException('User not found');
    const updated = await this.usersRepo.update(id, { isActive: !user.isActive });
    return this.sanitizeUser(updated!);
  }

  async deleteUser(id: number) {
    const deleted = await this.usersRepo.softDelete(id);
    if (!deleted) throw new NotFoundException('User not found');
    return { message: 'User deleted' };
  }

  private sanitizeUser(user: User) {
    const { passwordHash, deletedAt, ...safe } = user;
    return safe;
  }
}
