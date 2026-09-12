import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationDto } from './dto/filter-location.dto';

@Injectable()
export class LocationService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CRUD OPERATIONS ====================

  async create(createLocationDto: CreateLocationDto) {
    // Validate company if provided
    if (createLocationDto.companyId) {
      await this.getCompany(createLocationDto.companyId);
    }

    return await this.prisma.location.create({
      data: {
        name: createLocationDto.name,
        type: createLocationDto.type,
        phone: createLocationDto.phone,
        address: createLocationDto.address,
        latitude: createLocationDto.latitude,
        longitude: createLocationDto.longitude,
        website: createLocationDto.website,
        email: createLocationDto.email,
        notes: createLocationDto.notes,
        companyId: createLocationDto.companyId,
      },
      include: {
        company: true,
      },
    });
  }

  async findAll(companyId?: string) {
    return await this.prisma.location.findMany({
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

  async findAllWithPagination(filterDto: FilterLocationDto) {
    const {
      page = 1,
      limit = 10,
      companyId,
      type,
      search,
      name,
      address,
      phone,
      email,
      latitude,
      longitude,
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

    if (name) {
      where.name = { contains: name, mode: 'insensitive' };
    }

    if (address) {
      where.address = { contains: address, mode: 'insensitive' };
    }

    if (phone) {
      where.phone = { contains: phone, mode: 'insensitive' };
    }

    if (email) {
      where.email = { contains: email, mode: 'insensitive' };
    }

    if (latitude !== undefined && longitude !== undefined) {
      // Find locations within a small radius (approximately 1km)
      const radius = 0.01; // roughly 1km in degrees
      where.latitude = {
        gte: latitude - radius,
        lte: latitude + radius,
      };
      where.longitude = {
        gte: longitude - radius,
        lte: longitude + radius,
      };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [locations, total] = await Promise.all([
      this.prisma.location.findMany({
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
      this.prisma.location.count({ where }),
    ]);

    return {
      data: locations,
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
        ...(name && { name }),
        ...(address && { address }),
        ...(phone && { phone }),
        ...(email && { email }),
      },
    };
  }

  async findOne(id: string) {
    const location = await this.prisma.location.findFirst({
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

    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found.`);
    }

    return location;
  }

  async update(id: string, updateLocationDto: UpdateLocationDto) {
    await this.findOne(id);

    // Validate company if provided
    if (updateLocationDto.companyId) {
      await this.getCompany(updateLocationDto.companyId);
    }

    return await this.prisma.location.update({
      where: { id },
      data: {
        name: updateLocationDto.name,
        type: updateLocationDto.type,
        phone: updateLocationDto.phone,
        address: updateLocationDto.address,
        latitude: updateLocationDto.latitude,
        longitude: updateLocationDto.longitude,
        website: updateLocationDto.website,
        email: updateLocationDto.email,
        notes: updateLocationDto.notes,
        companyId: updateLocationDto.companyId,
      },
      include: {
        company: true,
      },
    });
  }

  // ==================== SOFT DELETE & RESTORE ====================

  async softDelete(id: string) {
    await this.findOne(id);

    // Check if location has active missions
    const activeMissions = await this.prisma.mission.count({
      where: {
        locationId: id,
        isDeleted: false,
        status: {
          notIn: ['COMPLETED', 'CANCELLED'],
        },
      },
    });

    if (activeMissions > 0) {
      throw new BadRequestException(
        'Cannot delete location with active missions.',
      );
    }

    return await this.prisma.location.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const location = await this.prisma.location.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!location) {
      throw new NotFoundException(`Deleted location with id ${id} not found.`);
    }

    return await this.prisma.location.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const location = await this.prisma.location.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with id ${id} not found.`);
    }

    // Check if location has missions
    const missionCount = await this.prisma.mission.count({
      where: {
        locationId: id,
        isDeleted: false,
      },
    });

    if (missionCount > 0) {
      throw new BadRequestException(
        'Cannot delete location with associated missions. Use soft delete instead.',
      );
    }

    return await this.prisma.location.delete({
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
