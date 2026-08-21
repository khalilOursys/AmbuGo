// src/vehicles/vehicles.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  CreateVehicleDto,
  VehicleStaffScheduleDto,
} from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
} from './dto/create-schedule.dto';
import { VehicleStatus, ScheduleStatus, ShiftType } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createVehicleDto: CreateVehicleDto) {
    await this.getCompany(createVehicleDto.companyId);

    // Check if vehicle type exists
    if (createVehicleDto.vehicleTypeId) {
      await this.getVehicleType(createVehicleDto.vehicleTypeId);
    }

    // Check for duplicate registration
    const existing = await this.prisma.vehicle.findFirst({
      where: {
        registration: createVehicleDto.registration,
        isDeleted: false,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Vehicle with registration "${createVehicleDto.registration}" already exists.`,
      );
    }

    // Prepare data with relations
    const { equipment, staffSchedules, ...vehicleData } = createVehicleDto;

    return await this.prisma.$transaction(async (prisma) => {
      // Create vehicle
      const vehicle = await prisma.vehicle.create({
        data: {
          ...vehicleData,
          status: vehicleData.status || VehicleStatus.AVAILABLE,
        },
      });

      // Assign equipment if provided
      if (equipment && equipment.length > 0) {
        await this.assignEquipmentToVehicle(prisma, vehicle.id, equipment);
      }

      // Assign staff schedules if provided
      if (staffSchedules && staffSchedules.length > 0) {
        await this.assignStaffSchedulesToVehicle(
          prisma,
          vehicle.id,
          staffSchedules,
        );
      }

      // Return vehicle with relations (using prisma instance inside transaction)
      return await prisma.vehicle.findFirst({
        where: {
          id: vehicle.id,
          isDeleted: false,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
            },
          },
          vehicleType: true,
          staffSchedules: {
            where: {
              status: ScheduleStatus.ACTIVE,
            },
            include: {
              staff: {
                select: {
                  id: true,
                  matricule: true,
                  firstname: true,
                  lastname: true,
                  type: true,
                  email: true,
                  phone: true,
                },
              },
              shiftTemplate: {
                select: {
                  id: true,
                  name: true,
                  startTime: true,
                  endTime: true,
                },
              },
            },
            orderBy: {
              shiftStart: 'asc',
            },
          },
          equipment: {
            include: {
              equipment: {
                select: {
                  id: true,
                  code: true,
                  name: true,
                  description: true,
                  quantity: true,
                },
              },
            },
          },
          assignments: {
            where: {
              mission: {
                status: {
                  notIn: ['COMPLETED', 'CANCELLED'],
                },
              },
            },
            include: {
              mission: {
                select: {
                  id: true,
                  code: true,
                  status: true,
                  priority: true,
                  callDate: true,
                },
              },
              staffMembers: {
                include: {
                  staff: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                    },
                  },
                },
              },
            },
          },
          gpsPositions: {
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }

  async findAll(filterDto?: VehicleFilterDto) {
    const where = this.buildWhereClause(filterDto);
    const include = this.buildIncludeClause(filterDto);

    return await this.prisma.vehicle.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllWithPagination(filterDto: VehicleFilterDto) {
    const {
      page = 0,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const skip = page * limit;
    const where = this.buildWhereClause(filterDto);
    const include = this.buildIncludeClause(filterDto);

    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [vehicles, total] = await Promise.all([
      this.prisma.vehicle.findMany({
        where,
        skip,
        take: limit,
        include,
        orderBy,
      }),
      this.prisma.vehicle.count({ where }),
    ]);

    return {
      data: vehicles,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit) - 1,
        hasPreviousPage: page > 0,
      },
    };
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
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
        vehicleType: true,
        staffSchedules: {
          where: {
            status: ScheduleStatus.ACTIVE,
          },
          include: {
            staff: {
              select: {
                id: true,
                matricule: true,
                firstname: true,
                lastname: true,
                type: true,
                email: true,
                phone: true,
              },
            },
            shiftTemplate: {
              select: {
                id: true,
                name: true,
                startTime: true,
                endTime: true,
              },
            },
            assignmentStaff: {
              where: {
                assignment: {
                  mission: {
                    status: {
                      notIn: ['COMPLETED', 'CANCELLED'],
                    },
                  },
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
                  },
                },
              },
            },
          },
          orderBy: {
            shiftStart: 'asc',
          },
        },
        equipment: {
          include: {
            equipment: {
              select: {
                id: true,
                code: true,
                name: true,
                description: true,
                quantity: true,
              },
            },
          },
        },
        assignments: {
          where: {
            mission: {
              status: {
                notIn: ['COMPLETED', 'CANCELLED'],
              },
            },
          },
          include: {
            mission: {
              select: {
                id: true,
                code: true,
                status: true,
                priority: true,
                callDate: true,
              },
            },
            staffMembers: {
              include: {
                staff: {
                  select: {
                    id: true,
                    firstname: true,
                    lastname: true,
                  },
                },
              },
            },
          },
        },
        gpsPositions: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found.`);
    }

    return vehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto) {
    await this.findOne(id);

    // Check for duplicate registration
    if (updateVehicleDto.registration) {
      const existing = await this.prisma.vehicle.findFirst({
        where: {
          registration: updateVehicleDto.registration,
          isDeleted: false,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException(
          `Vehicle with registration "${updateVehicleDto.registration}" already exists.`,
        );
      }
    }

    // Check if vehicle type exists
    if (updateVehicleDto.vehicleTypeId) {
      await this.getVehicleType(updateVehicleDto.vehicleTypeId);
    }

    const { equipment, staffSchedules, ...vehicleData } = updateVehicleDto;

    return await this.prisma.$transaction(async (prisma) => {
      // Update vehicle
      const vehicle = await prisma.vehicle.update({
        where: { id },
        data: vehicleData,
      });

      // Update equipment if provided
      if (equipment !== undefined) {
        // Remove existing equipment
        await prisma.vehicleEquipment.deleteMany({
          where: { vehicleId: id },
        });

        // Add new equipment
        if (equipment.length > 0) {
          await this.assignEquipmentToVehicle(prisma, id, equipment);
        }
      }

      // Update staff schedules if provided
      if (staffSchedules !== undefined) {
        // Remove existing schedules
        await prisma.vehicleStaffSchedule.deleteMany({
          where: { vehicleId: id },
        });

        // Add new schedules
        if (staffSchedules.length > 0) {
          await this.assignStaffSchedulesToVehicle(prisma, id, staffSchedules);
        }
      }

      return await this.findOne(id);
    });
  }

  // ===== SCHEDULE MANAGEMENT =====

  async addSchedule(createScheduleDto: CreateScheduleDto) {
    const { vehicleId, staffId, shiftStart, shiftEnd, ...scheduleData } =
      createScheduleDto;

    // Verify vehicle exists
    await this.findOne(vehicleId);

    // Verify staff exists
    await this.getStaffMember(staffId);

    // Check for overlapping schedules
    const overlapping = await this.prisma.vehicleStaffSchedule.findFirst({
      where: {
        vehicleId,
        staffId,
        OR: [
          {
            AND: [
              { shiftStart: { lte: new Date(shiftEnd) } },
              { shiftEnd: { gte: new Date(shiftStart) } },
            ],
          },
        ],
        status: ScheduleStatus.ACTIVE,
      },
    });

    if (overlapping) {
      throw new ConflictException(
        'Staff member already has an overlapping schedule for this vehicle.',
      );
    }

    return await this.prisma.vehicleStaffSchedule.create({
      data: {
        vehicleId,
        staffId,
        shiftStart: new Date(shiftStart),
        shiftEnd: new Date(shiftEnd),
        ...scheduleData,
      },
      include: {
        staff: true,
        vehicle: true,
      },
    });
  }

  async updateSchedule(id: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.prisma.vehicleStaffSchedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${id} not found.`);
    }

    // If staff or times are changing, check for conflicts
    if (
      updateScheduleDto.staffId ||
      updateScheduleDto.shiftStart ||
      updateScheduleDto.shiftEnd
    ) {
      const staffId = updateScheduleDto.staffId || schedule.staffId;
      const shiftStart = updateScheduleDto.shiftStart
        ? new Date(updateScheduleDto.shiftStart)
        : schedule.shiftStart;
      const shiftEnd = updateScheduleDto.shiftEnd
        ? new Date(updateScheduleDto.shiftEnd)
        : schedule.shiftEnd;

      const conflicting = await this.prisma.vehicleStaffSchedule.findFirst({
        where: {
          vehicleId: schedule.vehicleId,
          staffId,
          NOT: { id },
          OR: [
            {
              AND: [
                { shiftStart: { lte: shiftEnd } },
                { shiftEnd: { gte: shiftStart } },
              ],
            },
          ],
          status: ScheduleStatus.ACTIVE,
        },
      });

      if (conflicting) {
        throw new ConflictException(
          'Staff member already has an overlapping schedule for this vehicle.',
        );
      }
    }

    return await this.prisma.vehicleStaffSchedule.update({
      where: { id },
      data: {
        ...updateScheduleDto,
        shiftStart: updateScheduleDto.shiftStart
          ? new Date(updateScheduleDto.shiftStart)
          : undefined,
        shiftEnd: updateScheduleDto.shiftEnd
          ? new Date(updateScheduleDto.shiftEnd)
          : undefined,
      },
      include: {
        staff: true,
        vehicle: true,
        shiftTemplate: true,
      },
    });
  }

  async findSchedulesForVehicle(vehicleId: string, date?: Date) {
    await this.findOne(vehicleId);

    const where: any = {
      vehicleId,
      status: ScheduleStatus.ACTIVE,
    };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.OR = [
        {
          AND: [
            { shiftStart: { lte: endOfDay } },
            { shiftEnd: { gte: startOfDay } },
          ],
        },
      ];
    }

    return await this.prisma.vehicleStaffSchedule.findMany({
      where,
      include: {
        staff: {
          select: {
            id: true,
            matricule: true,
            firstname: true,
            lastname: true,
            type: true,
            email: true,
            phone: true,
          },
        },
        shiftTemplate: true,
        assignmentStaff: {
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
              },
            },
          },
        },
      },
      orderBy: {
        shiftStart: 'asc',
      },
    });
  }

  async deleteSchedule(id: string) {
    const schedule = await this.prisma.vehicleStaffSchedule.findUnique({
      where: { id },
      include: {
        assignmentStaff: true,
      },
    });

    if (!schedule) {
      throw new NotFoundException(`Schedule with id ${id} not found.`);
    }

    // Check if schedule is being used in active assignments
    if (schedule.assignmentStaff.length > 0) {
      throw new BadRequestException(
        'Cannot delete schedule that is currently assigned to a mission.',
      );
    }

    return await this.prisma.vehicleStaffSchedule.delete({
      where: { id },
    });
  }

  async getStaffScheduleForDate(staffId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.prisma.vehicleStaffSchedule.findMany({
      where: {
        staffId,
        status: ScheduleStatus.ACTIVE,
        OR: [
          {
            AND: [
              { shiftStart: { lte: endOfDay } },
              { shiftEnd: { gte: startOfDay } },
            ],
          },
        ],
      },
      include: {
        vehicle: {
          select: {
            id: true,
            registration: true,
            brand: true,
            model: true,
          },
        },
        shiftTemplate: true,
      },
      orderBy: {
        shiftStart: 'asc',
      },
    });
  }

  // ===== STAFF AND EQUIPMENT MANAGEMENT =====

  async assignStaff(id: string, staffSchedules: VehicleStaffScheduleDto[]) {
    await this.findOne(id);

    return await this.prisma.$transaction(async (prisma) => {
      // Remove existing schedules
      await prisma.vehicleStaffSchedule.deleteMany({
        where: { vehicleId: id },
      });

      // Add new schedules
      if (staffSchedules.length > 0) {
        await this.assignStaffSchedulesToVehicle(prisma, id, staffSchedules);
      }

      return await this.findOne(id);
    });
  }

  async assignEquipment(
    id: string,
    equipment: { equipmentId: string; quantity: number }[],
  ) {
    await this.findOne(id);

    // Verify all equipment exist
    const equipmentIds = equipment.map((e) => e.equipmentId);
    const existingEquipment = await this.prisma.equipment.findMany({
      where: {
        id: { in: equipmentIds },
        isDeleted: false,
      },
    });

    if (existingEquipment.length !== equipmentIds.length) {
      throw new NotFoundException('One or more equipment items not found.');
    }

    return await this.prisma.$transaction(async (prisma) => {
      // Remove existing equipment
      await prisma.vehicleEquipment.deleteMany({
        where: { vehicleId: id },
      });

      // Add new equipment
      await this.assignEquipmentToVehicle(prisma, id, equipment);

      return await this.findOne(id);
    });
  }

  async removeStaffFromVehicle(id: string, staffId: string) {
    await this.findOne(id);

    const schedule = await this.prisma.vehicleStaffSchedule.findFirst({
      where: {
        vehicleId: id,
        staffId,
        status: ScheduleStatus.ACTIVE,
      },
    });

    if (!schedule) {
      throw new NotFoundException(
        `Staff member with id ${staffId} is not assigned to this vehicle.`,
      );
    }

    await this.prisma.vehicleStaffSchedule.delete({
      where: { id: schedule.id },
    });

    return await this.findOne(id);
  }

  async removeEquipmentFromVehicle(id: string, equipmentId: string) {
    await this.findOne(id);

    const vehicleEquipment = await this.prisma.vehicleEquipment.findUnique({
      where: {
        vehicleId_equipmentId: {
          vehicleId: id,
          equipmentId,
        },
      },
    });

    if (!vehicleEquipment) {
      throw new NotFoundException(
        `Equipment with id ${equipmentId} is not assigned to this vehicle.`,
      );
    }

    await this.prisma.vehicleEquipment.delete({
      where: {
        vehicleId_equipmentId: {
          vehicleId: id,
          equipmentId,
        },
      },
    });

    return await this.findOne(id);
  }

  // ===== SOFT DELETE AND RESTORE =====

  async softDelete(id: string) {
    await this.findOne(id);

    // Check if vehicle is assigned to active missions
    const activeAssignments = await this.prisma.missionAssignment.findFirst({
      where: {
        vehicleId: id,
        mission: {
          status: {
            notIn: ['COMPLETED', 'CANCELLED'],
          },
        },
      },
    });

    if (activeAssignments) {
      throw new BadRequestException(
        'Cannot delete vehicle that is assigned to an active mission.',
      );
    }

    return await this.prisma.vehicle.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Deleted vehicle with id ${id} not found.`);
    }

    return await this.prisma.vehicle.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(`Vehicle with id ${id} not found.`);
    }

    // Check if vehicle has active assignments
    const activeAssignments = await this.prisma.missionAssignment.findFirst({
      where: {
        vehicleId: id,
        mission: {
          status: {
            notIn: ['COMPLETED', 'CANCELLED'],
          },
        },
      },
    });

    if (activeAssignments) {
      throw new BadRequestException(
        'Cannot delete vehicle that is assigned to an active mission.',
      );
    }

    return await this.prisma.vehicle.delete({
      where: { id },
    });
  }

  // ===== ADDITIONAL QUERIES =====

  async findByCompany(companyId: string) {
    await this.getCompany(companyId);

    return await this.prisma.vehicle.findMany({
      where: {
        companyId,
        isDeleted: false,
      },
      include: {
        vehicleType: true,
        staffSchedules: {
          where: {
            status: ScheduleStatus.ACTIVE,
          },
          include: {
            staff: true,
          },
        },
      },
      orderBy: { registration: 'asc' },
    });
  }

  async findAvailable(companyId: string) {
    await this.getCompany(companyId);

    return await this.prisma.vehicle.findMany({
      where: {
        companyId,
        status: VehicleStatus.AVAILABLE,
        isDeleted: false,
      },
      include: {
        vehicleType: true,
        staffSchedules: {
          where: {
            status: ScheduleStatus.ACTIVE,
          },
          include: {
            staff: true,
          },
        },
      },
      orderBy: { registration: 'asc' },
    });
  }

  async updateStatus(id: string, status: string) {
    await this.findOne(id);

    if (!Object.values(VehicleStatus).includes(status as VehicleStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }

    return await this.prisma.vehicle.update({
      where: { id },
      data: { status: status as VehicleStatus },
    });
  }

  // ===== PRIVATE HELPER METHODS =====

  private buildWhereClause(filterDto?: VehicleFilterDto): any {
    if (!filterDto) return { isDeleted: false };

    const {
      companyId,
      registration,
      brand,
      model,
      status,
      level,
      vehicleTypeId,
      fromDate,
      toDate,
      isDeleted = false,
      scheduleDate,
      shiftType,
      scheduleStatus,
      staffId,
    } = filterDto;

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

    // Apply filters
    if (companyId) where.companyId = companyId;
    if (registration) {
      where.registration = { contains: registration, mode: 'insensitive' };
    }
    if (brand) where.brand = { contains: brand, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (status) where.status = status;
    if (level) where.level = level;
    if (vehicleTypeId) where.vehicleTypeId = vehicleTypeId;

    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    // Schedule-related filters
    if (scheduleDate || shiftType || scheduleStatus || staffId) {
      where.staffSchedules = {
        some: {},
      };

      if (scheduleDate) {
        const date = new Date(scheduleDate);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        where.staffSchedules.some.OR = [
          {
            AND: [
              { shiftStart: { lte: endOfDay } },
              { shiftEnd: { gte: startOfDay } },
            ],
          },
        ];
      }

      if (shiftType) {
        where.staffSchedules.some.shiftType = shiftType;
      }

      if (scheduleStatus) {
        where.staffSchedules.some.status = scheduleStatus;
      }

      if (staffId) {
        where.staffSchedules.some.staffId = staffId;
      }
    }

    return where;
  }

  private buildIncludeClause(filterDto?: VehicleFilterDto): any {
    const include: any = {
      vehicleType: true,
      company: {
        select: { id: true, name: true },
      },
    };

    if (filterDto?.includeStaffSchedules !== false) {
      include.staffSchedules = {
        where: {
          status: ScheduleStatus.ACTIVE,
        },
        include: {
          staff: {
            select: {
              id: true,
              matricule: true,
              firstname: true,
              lastname: true,
              type: true,
              email: true,
              phone: true,
            },
          },
          shiftTemplate: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
            },
          },
        },
        orderBy: {
          shiftStart: 'asc',
        },
      };
    }

    if (filterDto?.includeEquipment !== false) {
      include.equipment = {
        include: {
          equipment: {
            select: {
              id: true,
              code: true,
              name: true,
              description: true,
              quantity: true,
            },
          },
        },
      };
    }

    return include;
  }

  private async assignEquipmentToVehicle(
    prisma: any,
    vehicleId: string,
    equipment: { equipmentId: string; quantity: number }[],
  ) {
    if (!equipment || equipment.length === 0) return;

    const equipmentData = equipment.map((e) => ({
      vehicleId,
      equipmentId: e.equipmentId,
      quantity: e.quantity || 1,
      assignedAt: new Date(),
    }));

    await prisma.vehicleEquipment.createMany({
      data: equipmentData,
      skipDuplicates: true,
    });
  }

  private async assignStaffSchedulesToVehicle(
    prisma: any,
    vehicleId: string,
    schedules: VehicleStaffScheduleDto[],
  ) {
    if (!schedules || schedules.length === 0) return;

    const scheduleData = schedules.map((s) => ({
      vehicleId,
      staffId: s.staffId,
      shiftStart: new Date(s.shiftStart),
      shiftEnd: new Date(s.shiftEnd),
      shiftType: s.shiftType || ShiftType.CUSTOM,
      isRecurring: s.isRecurring || false,
      recurrenceRule: s.recurrenceRule || null,
      validFrom: s.validFrom ? new Date(s.validFrom) : new Date(),
      validUntil: s.validUntil ? new Date(s.validUntil) : null,
      status: s.status || ScheduleStatus.ACTIVE,
      isReserved: s.isReserved || false,
      shiftTemplateId: s.shiftTemplateId || null,
      notes: s.notes || null,
    }));

    await prisma.vehicleStaffSchedule.createMany({
      data: scheduleData,
      skipDuplicates: true,
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

  private async getVehicleType(vehicleTypeId: string) {
    const vehicleType = await this.prisma.vehicleType.findFirst({
      where: {
        id: vehicleTypeId,
        isDeleted: false,
      },
    });

    if (!vehicleType) {
      throw new NotFoundException(
        `Vehicle type with id ${vehicleTypeId} not found.`,
      );
    }

    return vehicleType;
  }

  private async getStaffMember(staffId: string) {
    const staff = await this.prisma.staffMember.findFirst({
      where: {
        id: staffId,
        isDeleted: false,
      },
    });

    if (!staff) {
      throw new NotFoundException(`Staff member with id ${staffId} not found.`);
    }

    return staff;
  }
}
