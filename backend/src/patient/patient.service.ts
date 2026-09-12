import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FilterPatientDto } from './dto/filter-patient.dto';

@Injectable()
export class PatientService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CRUD OPERATIONS ====================

  async create(createPatientDto: CreatePatientDto) {
    // Validate company if provided
    if (createPatientDto.companyId) {
      await this.getCompany(createPatientDto.companyId);
    }

    return await this.prisma.patient.create({
      data: {
        firstname: createPatientDto.firstname,
        lastname: createPatientDto.lastname,
        birthDate: createPatientDto.birthDate
          ? new Date(createPatientDto.birthDate)
          : null,
        phone: createPatientDto.phone,
        gender: createPatientDto.gender,
        address: createPatientDto.address,
        notes: createPatientDto.notes,
        companyId: createPatientDto.companyId,
      },
      include: {
        company: true,
      },
    });
  }

  async findAll(companyId?: string) {
    return await this.prisma.patient.findMany({
      where: {
        ...(companyId && { companyId }),
        isDeleted: false,
      },
      include: {
        company: true,
        _count: {
          select: {
            missions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== PAGINATION & FILTERING ====================

  async findAllWithPagination(filterDto: FilterPatientDto) {
    const {
      page = 1,
      limit = 10,
      companyId,
      search,
      firstname,
      lastname,
      phone,
      gender,
      address,
      birthDateFrom,
      birthDateTo,
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

    if (firstname) {
      where.firstname = { contains: firstname, mode: 'insensitive' };
    }

    if (lastname) {
      where.lastname = { contains: lastname, mode: 'insensitive' };
    }

    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' };
    }

    if (gender) {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    if (birthDateFrom || birthDateTo) {
      where.birthDate = {};
      if (birthDateFrom) {
        where.birthDate.gte = new Date(birthDateFrom);
      }
      if (birthDateTo) {
        where.birthDate.lte = new Date(birthDateTo);
      }
    }

    if (search) {
      where.OR = [
        { firstname: { contains: search, mode: 'insensitive' } },
        { lastname: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [patients, total] = await Promise.all([
      this.prisma.patient.findMany({
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
          _count: {
            select: {
              missions: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.patient.count({ where }),
    ]);

    return {
      data: patients,
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
        ...(search && { search }),
        ...(firstname && { firstname }),
        ...(lastname && { lastname }),
        ...(phone && { phone }),
        ...(gender && { gender }),
        ...(address && { address }),
        ...(birthDateFrom && { birthDateFrom }),
        ...(birthDateTo && { birthDateTo }),
      },
    };
  }

  async findOne(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: true,
        missions: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            code: true,
            status: true,
            priority: true,
            callDate: true,
            reason: true,
          },
          orderBy: { callDate: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            missions: true,
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found.`);
    }

    return patient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    await this.findOne(id);

    // Validate company if provided
    if (updatePatientDto.companyId) {
      await this.getCompany(updatePatientDto.companyId);
    }

    return await this.prisma.patient.update({
      where: { id },
      data: {
        firstname: updatePatientDto.firstname,
        lastname: updatePatientDto.lastname,
        birthDate: updatePatientDto.birthDate
          ? new Date(updatePatientDto.birthDate)
          : undefined,
        phone: updatePatientDto.phone,
        gender: updatePatientDto.gender,
        address: updatePatientDto.address,
        notes: updatePatientDto.notes,
        companyId: updatePatientDto.companyId,
      },
      include: {
        company: true,
      },
    });
  }

  // ==================== SOFT DELETE & RESTORE ====================

  async softDelete(id: string) {
    await this.findOne(id);

    // Check if patient has active missions
    const activeMissions = await this.prisma.mission.count({
      where: {
        patientId: id,
        isDeleted: false,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    if (activeMissions > 0) {
      throw new BadRequestException(
        'Cannot delete patient with active missions.',
      );
    }

    return await this.prisma.patient.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Deleted patient with id ${id} not found.`);
    }

    return await this.prisma.patient.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id ${id} not found.`);
    }

    // Check if patient has missions
    const missionCount = await this.prisma.mission.count({
      where: {
        patientId: id,
        isDeleted: false,
      },
    });

    if (missionCount > 0) {
      throw new BadRequestException(
        'Cannot delete patient with associated missions. Use soft delete instead.',
      );
    }

    return await this.prisma.patient.delete({
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
}
