// src/staff/staff.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FilterStaffDto } from './dto/filter-staff.dto';

@Injectable()
export class StaffService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CRUD OPERATIONS ====================

  async create(createStaffDto: CreateStaffDto) {
    // Validate company exists
    await this.getCompany(createStaffDto.companyId);

    // Validate user if provided
    if (createStaffDto.userId) {
      await this.getUser(createStaffDto.userId);
    }

    // Check if matricule is unique if provided
    if (createStaffDto.matricule) {
      const existing = await this.prisma.staffMember.findFirst({
        where: {
          matricule: createStaffDto.matricule,
          isDeleted: false,
        },
      });
      if (existing) {
        throw new ConflictException('Matricule already exists');
      }
    }

    return await this.prisma.staffMember.create({
      data: {
        matricule: createStaffDto.matricule,
        firstname: createStaffDto.firstname,
        lastname: createStaffDto.lastname,
        phone: createStaffDto.phone,
        email: createStaffDto.email,
        type: createStaffDto.type,
        userId: createStaffDto.userId,
        companyId: createStaffDto.companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            telephone: true,
          },
        },
        company: true,
      },
    });
  }

  async findAll(companyId?: string) {
    return await this.prisma.staffMember.findMany({
      where: {
        ...(companyId && { companyId }),
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            telephone: true,
          },
        },
        company: true,
        assignmentStaff: {
          where: {
            assignment: {
              isComplete: false,
            },
          },
          include: {
            assignment: {
              include: {
                mission: {
                  select: {
                    id: true,
                    code: true,
                    status: true,
                  },
                },
                vehicle: {
                  select: {
                    id: true,
                    registration: true,
                  },
                },
              },
            },
          },
        },
        vehicleSchedules: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== PAGINATION & FILTERING ====================

  async findAllWithPagination(filterDto: FilterStaffDto) {
    const {
      page = 1,
      limit = 10,
      companyId,
      type,
      search,
      firstname,
      lastname,
      email,
      phone,
      matricule,
      userId,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDeleted: false,
      deletedAt: null,
    };

    if (companyId) {
      where.companyId = companyId;
    }

    if (type) {
      where.type = type;
    }

    if (userId) {
      where.userId = userId;
    }

    if (matricule) {
      where.matricule = { contains: matricule, mode: 'insensitive' };
    }

    if (firstname) {
      where.firstname = { contains: firstname, mode: 'insensitive' };
    }

    if (lastname) {
      where.lastname = { contains: lastname, mode: 'insensitive' };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' };
    }

    if (search) {
      where.OR = [
        { firstname: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { matricule: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [staff, total] = await Promise.all([
      this.prisma.staffMember.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              telephone: true,
            },
          },
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          assignmentStaff: {
            where: {
              assignment: {
                isComplete: false,
              },
            },
            include: {
              assignment: {
                include: {
                  mission: {
                    select: {
                      id: true,
                      code: true,
                      status: true,
                    },
                  },
                  vehicle: {
                    select: {
                      id: true,
                      registration: true,
                    },
                  },
                },
              },
            },
          },
          vehicleSchedules: {
            where: {
              status: 'ACTIVE',
            },
            include: {
              vehicle: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.staffMember.count({ where }),
    ]);

    return {
      data: staff,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      filters: {
        ...(companyId && { companyId }),
        ...(type && { type }),
        ...(search && { search }),
        ...(firstname && { firstname }),
        ...(lastname && { lastname }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(matricule && { matricule }),
        ...(userId && { userId }),
      },
    };
  }

  async findOne(id: string) {
    const staff = await this.prisma.staffMember.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            telephone: true,
            role: true,
          },
        },
        company: true,
        assignmentStaff: {
          include: {
            assignment: {
              include: {
                mission: true,
                vehicle: true,
              },
            },
            schedule: true,
          },
        },
        vehicleSchedules: {
          include: {
            vehicle: true,
            shiftTemplate: true,
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with id ${id} not found.`);
    }

    return staff;
  }

  async findByMatricule(matricule: string) {
    const staff = await this.prisma.staffMember.findFirst({
      where: {
        matricule,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            telephone: true,
          },
        },
        company: true,
        assignmentStaff: {
          include: {
            assignment: {
              include: {
                mission: true,
                vehicle: true,
              },
            },
          },
        },
        vehicleSchedules: {
          where: {
            status: 'ACTIVE',
          },
          include: {
            vehicle: true,
          },
        },
      },
    });

    if (!staff) {
      throw new NotFoundException(
        `Staff member with matricule ${matricule} not found.`,
      );
    }

    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    await this.findOne(id);

    // Validate company if provided
    if (updateStaffDto.companyId) {
      await this.getCompany(updateStaffDto.companyId);
    }

    // Validate user if provided
    if (updateStaffDto.userId) {
      await this.getUser(updateStaffDto.userId);
    }

    // Check if matricule is unique if provided
    if (updateStaffDto.matricule) {
      const existing = await this.prisma.staffMember.findFirst({
        where: {
          matricule: updateStaffDto.matricule,
          id: { not: id },
          isDeleted: false,
        },
      });
      if (existing) {
        throw new ConflictException('Matricule already exists');
      }
    }

    return await this.prisma.staffMember.update({
      where: { id },
      data: {
        matricule: updateStaffDto.matricule,
        firstname: updateStaffDto.firstname,
        lastname: updateStaffDto.lastname,
        phone: updateStaffDto.phone,
        email: updateStaffDto.email,
        type: updateStaffDto.type,
        userId: updateStaffDto.userId,
        companyId: updateStaffDto.companyId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            telephone: true,
          },
        },
        company: true,
      },
    });
  }

  // ==================== SOFT DELETE & RESTORE ====================

  async softDelete(id: string) {
    await this.findOne(id);

    // Check if staff has active assignments
    const activeAssignments = await this.prisma.assignmentStaff.count({
      where: {
        staffId: id,
        assignment: {
          isComplete: false,
        },
      },
    });

    if (activeAssignments > 0) {
      throw new BadRequestException(
        'Cannot delete staff member with active assignments.',
      );
    }

    return await this.prisma.staffMember.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const staff = await this.prisma.staffMember.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!staff) {
      throw new NotFoundException(
        `Deleted staff member with id ${id} not found.`,
      );
    }

    return await this.prisma.staffMember.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const staff = await this.prisma.staffMember.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with id ${id} not found.`);
    }

    // Check if staff has active assignments
    const activeAssignments = await this.prisma.assignmentStaff.count({
      where: {
        staffId: id,
        assignment: {
          isComplete: false,
        },
      },
    });

    if (activeAssignments > 0) {
      throw new BadRequestException(
        'Cannot delete staff member with active assignments. Use soft delete instead.',
      );
    }

    return await this.prisma.staffMember.delete({
      where: { id },
    });
  }

  // ==================== HELPER METHODS ====================

  private async getCompany(companyId: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id: companyId,
        isDeleted: false,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${companyId} not found.`);
    }

    return company;
  }

  private async getUser(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        isDeleted: false,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found.`);
    }

    return user;
  }
}
