// src/companies/companies.service.ts - Simplified version
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyFilterDto } from './dto/company-filter.dto';

@Injectable()
export class CompaniesService {
  constructor(private readonly prisma: PrismaService) {}

  // No explicit return type - TypeScript infers it
  async create(createCompanyDto: CreateCompanyDto) {
    const existing = await this.prisma.company.findUnique({
      where: { name: createCompanyDto.name },
    });

    if (existing) {
      throw new ConflictException(
        `Company with name "${createCompanyDto.name}" already exists.`,
      );
    }

    return await this.prisma.company.create({
      data: createCompanyDto,
    });
  }

  async findAll() {
    return await this.prisma.company.findMany({
      where: { isDeleted: false },
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });
  }

  async findAllWithPagination(filterDto: CompanyFilterDto) {
    const {
      page = 0,
      limit = 10,
      name,
      email,
      phone,
      address,
      pricingType,
      baseCurrency,
      matriculeFiscale,
      rib,
      fromDate,
      toDate,
      isDeleted = false, // Default to false (show only non-deleted)
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = page * limit;

    // Build where clause
    const where: any = {};

    // Apply isDeleted filter
    if (isDeleted !== undefined) {
      where.isDeleted = isDeleted;
      // If showing deleted items, also check deletedAt
      if (isDeleted === true) {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }
    }

    // Apply other filters
    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' };
    }

    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    if (pricingType) {
      where.pricingType = pricingType;
    }

    if (baseCurrency) {
      where.baseCurrency = { contains: baseCurrency, mode: 'insensitive' };
    }

    if (matriculeFiscale) {
      where.matriculeFiscale = {
        contains: matriculeFiscale,
        mode: 'insensitive',
      };
    }

    if (rib) {
      where.rib = { contains: rib, mode: 'insensitive' };
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

    const [companies, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          address: true,
          latitude: true,
          longitude: true,
          radiusKm: true,
          pricingType: true,
          baseCurrency: true,
          rib: true,
          matriculeFiscale: true,
          email: true,
          phone: true,
          logoId: true,
          createdAt: true,
          updatedAt: true,
          isDeleted: true,
          deletedAt: true,
          _count: {
            select: {
              users: {
                where: { isDeleted: false },
              },
              vehicles: {
                where: { isDeleted: false },
              },
              equipment: {
                where: { isDeleted: false },
              },
              services: {
                where: { isDeleted: false },
              },
              staff: {
                where: { isDeleted: false },
              },
            },
          },
        },
        orderBy,
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      data: companies,
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
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(pricingType && { pricingType }),
        ...(baseCurrency && { baseCurrency }),
        ...(matriculeFiscale && { matriculeFiscale }),
        ...(rib && { rib }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      },
    };
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id, isDeleted: false },
      include: {
        users: true,
        services: true,
        equipment: true,
        vehicles: true,
        staff: true,
        customers: true,
        distanceRates: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found.`);
    }

    return company;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto) {
    await this.findOne(id);

    if (updateCompanyDto.name) {
      const existing = await this.prisma.company.findUnique({
        where: { name: updateCompanyDto.name },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Company with name "${updateCompanyDto.name}" already exists.`,
        );
      }
    }

    return await this.prisma.company.update({
      where: { id },
      data: updateCompanyDto,
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return await this.prisma.company.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }
  async restore(id: string) {
    const company = await this.prisma.company.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Deleted company with id ${id} not found.`);
    }

    return await this.prisma.company.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }
  async remove(id: string) {
    await this.findOne(id);

    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: true,
        vehicles: true,
      },
    });

    if (!company) {
      throw new NotFoundException(`Company with id ${id} not found.`);
    }

    if (company.users.length > 0 || company.vehicles.length > 0) {
      throw new BadRequestException(
        'Cannot delete company with existing users, vehicles, or missions. Use soft delete instead.',
      );
    }

    return await this.prisma.company.delete({
      where: { id },
    });
  }

  async getStats(id: string) {
    await this.findOne(id);

    const [
      totalVehicles,
      activeStaff,
      activeEquipment,
      totalMissions,
      activeMissions,
    ] = await this.prisma.$transaction([
      this.prisma.vehicle.count({ where: { companyId: id } }),
      this.prisma.staffMember.count({ where: { companyId: id } }),
      this.prisma.equipment.count({ where: { companyId: id } }),
      this.prisma.mission.count({ where: { customer: { companyId: id } } }),
      this.prisma.mission.count({
        where: {
          customer: { companyId: id },
          status: { in: ['EN_ROUTE', 'ON_SCENE', 'TRANSPORTING'] },
        },
      }),
    ]);

    return {
      totalVehicles,
      activeStaff,
      activeEquipment,
      totalMissions,
      activeMissions,
    };
  }
}
