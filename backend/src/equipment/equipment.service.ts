// src/equipment/equipment.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentFilterDto } from './dto/equipment-filter.dto';

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CRUD OPERATIONS ====================

  async create(createEquipmentDto: CreateEquipmentDto) {
    await this.getCompany(createEquipmentDto.companyId);

    if (createEquipmentDto.code) {
      const existing = await this.prisma.equipment.findFirst({
        where: {
          companyId: createEquipmentDto.companyId,
          code: createEquipmentDto.code,
          isDeleted: false,
        },
      });

      if (existing) {
        throw new ConflictException(
          `Equipment with code "${createEquipmentDto.code}" already exists in this company.`,
        );
      }
    }

    return await this.prisma.equipment.create({
      data: createEquipmentDto,
    });
  }

  async findAll(companyId?: string) {
    return await this.prisma.equipment.findMany({
      where: {
        ...(companyId && { companyId }),
        isDeleted: false,
      },
      include: {
        company: true,
        vehicleEquipment: {
          where: { returnedAt: null },
          include: {
            vehicle: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ==================== PAGINATION & FILTERING ====================

  async findAllWithPagination(filterDto: EquipmentFilterDto) {
    const {
      page = 0,
      limit = 10,
      companyId,
      code,
      name,
      description,
      minQuantity,
      maxQuantity,
      minPrice,
      maxPrice,
      isAssigned,
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

    if (minQuantity !== undefined || maxQuantity !== undefined) {
      where.quantity = {};
      if (minQuantity !== undefined) {
        where.quantity.gte = minQuantity;
      }
      if (maxQuantity !== undefined) {
        where.quantity.lte = maxQuantity;
      }
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.purchasePrice = {};
      if (minPrice !== undefined) {
        where.purchasePrice.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.purchasePrice.lte = maxPrice;
      }
    }

    if (isAssigned !== undefined) {
      if (isAssigned) {
        where.vehicleEquipment = {
          some: {
            returnedAt: null,
          },
        };
      } else {
        where.vehicleEquipment = {
          none: {
            returnedAt: null,
          },
        };
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

    const [equipment, total] = await Promise.all([
      this.prisma.equipment.findMany({
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
          vehicleEquipment: {
            where: { returnedAt: null },
            include: {
              vehicle: {
                where: { isDeleted: false },
                select: {
                  id: true,
                  registration: true,
                },
              },
            },
          },
          missionEquipment: {
            where: { returnedAt: null },
            include: {
              mission: {
                where: { isDeleted: false },
                select: {
                  id: true,
                  code: true,
                },
              },
            },
          },
        },
        orderBy,
      }),
      this.prisma.equipment.count({ where }),
    ]);

    return {
      data: equipment,
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
        ...(minQuantity !== undefined && { minQuantity }),
        ...(maxQuantity !== undefined && { maxQuantity }),
        ...(minPrice !== undefined && { minPrice }),
        ...(maxPrice !== undefined && { maxPrice }),
        ...(isAssigned !== undefined && { isAssigned }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      },
    };
  }
  async findOne(id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        company: true,
        vehicleEquipment: {
          where: { returnedAt: null },
          include: {
            vehicle: true,
          },
        },
        missionEquipment: {
          where: { returnedAt: null },
          include: {
            mission: true,
          },
        },
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with id ${id} not found.`);
    }

    return equipment;
  }

  async findByCompany(companyId: string) {
    await this.getCompany(companyId);

    return await this.prisma.equipment.findMany({
      where: {
        companyId,
        isDeleted: false,
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, updateEquipmentDto: UpdateEquipmentDto) {
    await this.findOne(id);

    if (updateEquipmentDto.code) {
      const existing = await this.prisma.equipment.findFirst({
        where: {
          companyId:
            updateEquipmentDto.companyId || (await this.findOne(id)).companyId,
          code: updateEquipmentDto.code,
          isDeleted: false,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Equipment with code "${updateEquipmentDto.code}" already exists.`,
        );
      }
    }

    return await this.prisma.equipment.update({
      where: { id },
      data: updateEquipmentDto,
    });
  }

  // ==================== SOFT DELETE & RESTORE ====================

  async softDelete(id: string) {
    await this.findOne(id);

    const vehicleUsage = await this.prisma.vehicleEquipment.count({
      where: {
        equipmentId: id,
        returnedAt: null,
      },
    });

    const missionUsage = await this.prisma.missionEquipment.count({
      where: {
        equipmentId: id,
        returnedAt: null,
      },
    });

    if (vehicleUsage > 0 || missionUsage > 0) {
      throw new BadRequestException(
        'Cannot delete equipment that is currently in use.',
      );
    }

    return await this.prisma.equipment.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Deleted equipment with id ${id} not found.`);
    }

    return await this.prisma.equipment.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const equipment = await this.prisma.equipment.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipment with id ${id} not found.`);
    }

    const vehicleUsage = await this.prisma.vehicleEquipment.count({
      where: { equipmentId: id, returnedAt: null },
    });

    const missionUsage = await this.prisma.missionEquipment.count({
      where: { equipmentId: id, returnedAt: null },
    });

    if (vehicleUsage > 0 || missionUsage > 0) {
      throw new BadRequestException(
        'Cannot delete equipment that is currently in use. Use soft delete instead.',
      );
    }

    return await this.prisma.equipment.delete({
      where: { id },
    });
  }

  // ==================== VEHICLE ASSIGNMENT ====================

  async assignToVehicle(
    vehicleId: string,
    equipmentId: string,
    quantity: number = 1,
  ) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        isDeleted: false,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${vehicleId} not found.`);
    }

    const equipment = await this.findOne(equipmentId);

    if (equipment.isDeleted) {
      throw new BadRequestException('Equipment is deleted.');
    }

    const existing = await this.prisma.vehicleEquipment.findUnique({
      where: {
        vehicleId_equipmentId: {
          vehicleId,
          equipmentId,
        },
      },
    });

    if (existing) {
      return await this.prisma.vehicleEquipment.update({
        where: {
          vehicleId_equipmentId: {
            vehicleId,
            equipmentId,
          },
        },
        data: {
          quantity: existing.quantity + quantity,
        },
      });
    }

    return await this.prisma.vehicleEquipment.create({
      data: {
        vehicleId,
        equipmentId,
        quantity,
      },
    });
  }

  async removeFromVehicle(vehicleId: string, equipmentId: string) {
    const assignment = await this.prisma.vehicleEquipment.findUnique({
      where: {
        vehicleId_equipmentId: {
          vehicleId,
          equipmentId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Equipment not assigned to this vehicle.');
    }

    return await this.prisma.vehicleEquipment.delete({
      where: {
        vehicleId_equipmentId: {
          vehicleId,
          equipmentId,
        },
      },
    });
  }

  async getVehicleEquipment(vehicleId: string) {
    return await this.prisma.vehicleEquipment.findMany({
      where: {
        vehicleId,
        returnedAt: null,
      },
      include: {
        equipment: true,
      },
    });
  }

  async returnVehicleEquipment(vehicleId: string, equipmentId: string) {
    const assignment = await this.prisma.vehicleEquipment.findUnique({
      where: {
        vehicleId_equipmentId: {
          vehicleId,
          equipmentId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Equipment not assigned to this vehicle.');
    }

    if (assignment.returnedAt) {
      throw new BadRequestException('Equipment already returned.');
    }

    return await this.prisma.vehicleEquipment.update({
      where: {
        vehicleId_equipmentId: {
          vehicleId,
          equipmentId,
        },
      },
      data: {
        returnedAt: new Date(),
      },
    });
  }

  // ==================== MISSION ASSIGNMENT ====================

  async assignToMission(
    missionId: string,
    equipmentId: string,
    quantity: number = 1,
  ) {
    const mission = await this.prisma.mission.findFirst({
      where: {
        id: missionId,
        isDeleted: false,
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission with id ${missionId} not found.`);
    }

    await this.findOne(equipmentId);

    const existing = await this.prisma.missionEquipment.findUnique({
      where: {
        missionId_equipmentId: {
          missionId,
          equipmentId,
        },
      },
    });

    if (existing) {
      return await this.prisma.missionEquipment.update({
        where: {
          missionId_equipmentId: {
            missionId,
            equipmentId,
          },
        },
        data: {
          quantity: existing.quantity + quantity,
        },
      });
    }

    return await this.prisma.missionEquipment.create({
      data: {
        missionId,
        equipmentId,
        quantity,
      },
    });
  }

  async removeFromMission(missionId: string, equipmentId: string) {
    const assignment = await this.prisma.missionEquipment.findUnique({
      where: {
        missionId_equipmentId: {
          missionId,
          equipmentId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Equipment not assigned to this mission.');
    }

    return await this.prisma.missionEquipment.delete({
      where: {
        missionId_equipmentId: {
          missionId,
          equipmentId,
        },
      },
    });
  }

  async getMissionEquipment(missionId: string) {
    return await this.prisma.missionEquipment.findMany({
      where: {
        missionId,
        returnedAt: null,
      },
      include: {
        equipment: true,
      },
    });
  }

  async returnMissionEquipment(missionId: string, equipmentId: string) {
    const assignment = await this.prisma.missionEquipment.findUnique({
      where: {
        missionId_equipmentId: {
          missionId,
          equipmentId,
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException('Equipment not assigned to this mission.');
    }

    if (assignment.returnedAt) {
      throw new BadRequestException('Equipment already returned.');
    }

    return await this.prisma.missionEquipment.update({
      where: {
        missionId_equipmentId: {
          missionId,
          equipmentId,
        },
      },
      data: {
        returnedAt: new Date(),
      },
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
