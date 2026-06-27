// src/services/services.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServiceFilterDto } from './dto/service-filter.dto';

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createServiceDto: CreateServiceDto) {
    await this.getCompany(createServiceDto.companyId);

    if (createServiceDto.code) {
      const existing = await this.prisma.service.findFirst({
        where: {
          companyId: createServiceDto.companyId,
          code: createServiceDto.code,
          isDeleted: false,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Service with code "${createServiceDto.code}" already exists in this company.`,
        );
      }
    }

    return await this.prisma.service.create({
      data: createServiceDto,
    });
  }

  async findAll(companyId?: string) {
    return await this.prisma.service.findMany({
      where: {
        ...(companyId && { companyId }),
        isDeleted: false,
      },
      include: {
        company: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithPagination(filterDto: ServiceFilterDto) {
    const {
      page = 0,
      limit = 10,
      companyId,
      code,
      name,
      description,
      minPrice,
      maxPrice,
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
      if (isDeleted === true) {
        where.deletedAt = { not: null };
      } else {
        where.deletedAt = null;
      }
    }

    // Apply other filters
    if (companyId) {
      where.companyId = companyId;
    }

    if (code) {
      where.code = { contains: code, mode: 'insensitive' };
    }

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (description) {
      where.description = { contains: description, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.unitPrice = {};
      if (minPrice !== undefined) {
        where.unitPrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.unitPrice.lte = maxPrice;
      }
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

    const [services, total] = await Promise.all([
      this.prisma.service.findMany({
        where,
        skip,
        take: limit,
        include: {
          company: {
            where: { isDeleted: false },
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              invoiceLines: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.service.count({ where }),
    ]);

    return {
      data: services,
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
        ...(companyId && { companyId }),
        ...(code && { code }),
        ...(name && { name }),
        ...(description && { description }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      },
    };
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: true,
        invoiceLines: {
          include: {
            invoice: true,
          },
        },
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found.`);
    }

    return service;
  }

  async findByCompany(companyId: string) {
    await this.getCompany(companyId);

    return await this.prisma.service.findMany({
      where: {
        companyId,
        isDeleted: false,
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    await this.findOne(id);

    if (updateServiceDto.code) {
      const existing = await this.prisma.service.findFirst({
        where: {
          companyId:
            updateServiceDto.companyId || (await this.findOne(id)).companyId,
          code: updateServiceDto.code,
          isDeleted: false,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Service with code "${updateServiceDto.code}" already exists.`,
        );
      }
    }

    return await this.prisma.service.update({
      where: { id },
      data: updateServiceDto,
    });
  }

  async softDelete(id: string) {
    await this.findOne(id);

    return await this.prisma.service.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!service) {
      throw new NotFoundException(`Deleted service with id ${id} not found.`);
    }

    return await this.prisma.service.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const service = await this.prisma.service.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found.`);
    }

    const usage = await this.prisma.invoiceLine.count({
      where: { serviceId: id },
    });

    if (usage > 0) {
      throw new BadRequestException(
        'Cannot delete service that is used in invoices. Use soft delete instead.',
      );
    }

    return await this.prisma.service.delete({
      where: { id },
    });
  }

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
