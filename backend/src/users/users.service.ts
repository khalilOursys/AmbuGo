// src/users/users.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import * as bcrypt from 'bcryptjs';
import { UserRole, User } from '@prisma/client';
import { UpdateUserDto } from './dto/UpdateUserDto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== INITIALIZATION ====================

  async onModuleInit() {
    await this.ensureAdminUserExists();
  }

  private async ensureAdminUserExists() {
    const adminEmail = 'admin.admin@admin.com';
    const adminPassword = 'adminadmin';

    const usersCount = await this.prisma.user.count();

    if (usersCount === 0) {
      const adminUserDto: CreateUserDto = {
        email: adminEmail,
        password: adminPassword,
        firstName: 'Admin',
        lastName: 'Admin',
        role: UserRole.ADMIN,
        telephone: '',
        cin: '',
      };

      await this.create(adminUserDto);
    }
  }

  // ==================== CRUD OPERATIONS ====================

  async create(createUserDto: CreateUserDto) {
    // Check if user with same email exists
    const existing = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existing) {
      throw new ConflictException(
        `User with email "${createUserDto.email}" already exists.`,
      );
    }

    // Hash password if provided
    let password = undefined;
    if (createUserDto.password) {
      password = await bcrypt.hash(createUserDto.password, 10);
    }

    // Prepare data - remove password from spread if it exists
    const { password: _, ...userData } = createUserDto;

    return await this.prisma.user.create({
      data: {
        ...userData,
        ...(password && { password }),
      },
    });
  }

  async findAll() {
    return await this.prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== PAGINATION & FILTERING ====================

  async findAllWithPagination(filterDto: UserFilterDto) {
    const {
      page = 0,
      limit = 10,
      firstName,
      lastName,
      email,
      role,
      telephone,
      cin,
      companyId,
      isDeleted = false,
      fromDate,
      toDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = page * limit;

    // Build where clause
    const where: any = {};

    // Apply isDeleted filter
    if (isDeleted !== undefined) {
      where.isDeleted = isDeleted;
      if (isDeleted === true) {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }
    }

    // Apply other filters
    if (firstName) {
      where.firstName = { contains: firstName, mode: 'insensitive' };
    }

    if (lastName) {
      where.lastName = { contains: lastName, mode: 'insensitive' };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (role) {
      where.role = role;
    }

    if (telephone) {
      where.telephone = { contains: telephone, mode: 'insensitive' };
    }

    if (cin) {
      where.cin = { contains: cin, mode: 'insensitive' };
    }

    if (companyId) {
      where.companyId = companyId;
    }

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) {
        where.createdAt.gte = new Date(fromDate);
      }
      if (toDate) {
        where.createdAt.lte = new Date(toDate);
      }
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit) - 1,
        hasPreviousPage: page > 0,
      },
      filters: {
        ...(isDeleted !== undefined && { isDeleted }),
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(email && { email }),
        ...(role && { role }),
        ...(telephone && { telephone }),
        ...(cin && { cin }),
        ...(companyId && { companyId }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found.`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    // If password is being updated, hash it
    let data: any = { ...updateUserDto };
    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Check if email is being updated to an existing email
    if (updateUserDto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `User with email "${updateUserDto.email}" already exists.`,
        );
      }
    }

    // Remove undefined values
    Object.keys(data).forEach((key) => {
      if (data[key] === undefined) {
        delete data[key];
      }
    });

    return await this.prisma.user.update({
      where: { id },
      data,
    });
  }

  // ==================== SOFT DELETE & RESTORE ====================

  async softDelete(id: string) {
    await this.findOne(id);

    return await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`Deleted user with id ${id} not found.`);
    }

    return await this.prisma.user.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    // Check if user has any audit logs or notifications
    const auditLogsCount = await this.prisma.auditLog.count({
      where: { userId: id },
    });

    if (auditLogsCount > 0) {
      throw new BadRequestException(
        'Cannot delete user with existing audit logs. Use soft delete instead.',
      );
    }

    return await this.prisma.user.delete({
      where: { id },
    });
  }

  // ==================== USER MANAGEMENT ====================

  async updateRole(id: string, role: UserRole) {
    await this.findOne(id);

    return await this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    // If user has a password (not null), verify current password
    if (user.password) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password,
      );
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect.');
      }
    } else {
      // If user doesn't have a password (social login), they shouldn't change password this way
      throw new BadRequestException(
        'User does not have a password set. Please use password reset flow.',
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });
  }

  // ==================== COMPANY ASSIGNMENT ====================

  async assignCompany(id: string, companyId: string) {
    await this.findOne(id);

    // Check if company exists
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        isDeleted: false,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found.`);
    }

    return await this.prisma.user.update({
      where: { id },
      data: { companyId },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async removeCompany(id: string) {
    await this.findOne(id);

    return await this.prisma.user.update({
      where: { id },
      data: { companyId: null },
      include: {
        company: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // ==================== BULK OPERATIONS ====================

  async createBulk(createUserDtos: CreateUserDto[]) {
    const results: {
      successful: User[];
      failed: { email: string; error: string }[];
    } = {
      successful: [],
      failed: [],
    };

    for (const userDto of createUserDtos) {
      try {
        const user = await this.create(userDto);
        results.successful.push(user);
      } catch (error: any) {
        results.failed.push({
          email: userDto.email,
          error: error.message,
        });
      }
    }

    return results;
  }

  async deleteBulk(ids: string[]) {
    const results: {
      successful: User[];
      failed: { id: string; error: string }[];
    } = {
      successful: [],
      failed: [],
    };

    for (const id of ids) {
      try {
        const user = await this.remove(id);
        results.successful.push(user);
      } catch (error: any) {
        results.failed.push({
          id,
          error: error.message,
        });
      }
    }

    return results;
  }

  // ==================== HELPER METHODS ====================

  private async getUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found.`);
    }

    return user;
  }
}
