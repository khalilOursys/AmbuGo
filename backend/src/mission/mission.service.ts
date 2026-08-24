// src/mission/mission.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { FilterMissionDto } from './dto/filter-mission.dto';
import { AssignMissionDto } from './dto/assign-mission.dto';
import { ChangeStatusDto } from './dto/change-status.dto';
import { StaffSourceType } from '@prisma/client';

@Injectable()
export class MissionService {
  constructor(private readonly prisma: PrismaService) {}

  // ==================== CRUD OPERATIONS ====================

  async create(createMissionDto: CreateMissionDto) {
    // Validate related entities exist
    if (createMissionDto.customerId) {
      await this.getCustomer(createMissionDto.customerId);
    }

    if (createMissionDto.patientId) {
      await this.getPatient(createMissionDto.patientId);
    }

    if (createMissionDto.locationId) {
      await this.getLocation(createMissionDto.locationId);
    }

    if (createMissionDto.contractId) {
      await this.getContract(createMissionDto.contractId);
    }

    // Generate mission code
    const code = await this.generateMissionCode();

    // Handle equipment if provided
    const equipmentData = createMissionDto.equipment?.map((item) => ({
      equipmentId: item.equipmentId,
      quantity: item.quantity || 1,
    }));

    return await this.prisma.mission.create({
      data: {
        code,
        priority: createMissionDto.priority,
        status: 'CREATED',
        reason: createMissionDto.reason,
        pickupAddress: createMissionDto.pickupAddress,
        destination: createMissionDto.destination,
        latitude: createMissionDto.latitude,
        longitude: createMissionDto.longitude,
        callDate: createMissionDto.callDate
          ? new Date(createMissionDto.callDate)
          : new Date(),
        customerId: createMissionDto.customerId,
        contractId: createMissionDto.contractId,
        patientId: createMissionDto.patientId,
        locationId: createMissionDto.locationId,
        notes: createMissionDto.notes,
        equipment: equipmentData
          ? {
              create: equipmentData,
            }
          : undefined,
      },
      include: {
        customer: true,
        patient: true,
        location: true,
        contract: true,
        assignments: {
          include: {
            vehicle: true,
            staffMembers: {
              include: {
                staff: true,
              },
            },
          },
        },
        equipment: {
          where: { returnedAt: null },
          include: {
            equipment: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
        invoice: true,
      },
    });
  }

  async findAll(companyId?: string) {
    return await this.prisma.mission.findMany({
      where: {
        ...(companyId && { customer: { companyId } }),
        isDeleted: false,
      },
      include: {
        customer: true,
        patient: true,
        location: true,
        contract: true,
        assignments: {
          include: {
            vehicle: true,
            staffMembers: {
              include: {
                staff: true,
              },
            },
          },
        },
        equipment: {
          where: { returnedAt: null },
          include: {
            equipment: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        invoice: true,
      },
      orderBy: { callDate: 'desc' },
    });
  }

  // ==================== PAGINATION & FILTERING ====================

  async findAllWithPagination(filterDto: FilterMissionDto) {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      customerId,
      patientId,
      locationId,
      vehicleId,
      staffId,
      equipmentId,
      search,
      fromDate,
      toDate,
      sortBy = 'callDate',
      sortOrder = 'desc',
    } = filterDto;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isDeleted: false,
      deletedAt: null,
    };

    // Apply filters
    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (locationId) {
      where.locationId = locationId;
    }

    if (vehicleId) {
      where.assignments = {
        some: {
          vehicleId,
          isComplete: false,
        },
      };
    }

    if (staffId) {
      where.assignments = {
        some: {
          staffMembers: {
            some: {
              staffId,
            },
          },
        },
      };
    }

    if (equipmentId) {
      where.equipment = {
        some: {
          equipmentId,
          returnedAt: null,
        },
      };
    }

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { reason: { contains: search, mode: 'insensitive' } },
        { pickupAddress: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (fromDate || toDate) {
      where.callDate = {};
      if (fromDate) {
        where.callDate.gte = new Date(fromDate);
      }
      if (toDate) {
        where.callDate.lte = new Date(toDate);
      }
    }

    // Build order by
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    const [missions, total] = await Promise.all([
      this.prisma.mission.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          patient: {
            select: {
              id: true,
              firstname: true,
              lastname: true,
              phone: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              type: true,
              address: true,
            },
          },
          contract: {
            select: {
              id: true,
              reference: true,
              title: true,
            },
          },
          assignments: {
            where: { isComplete: false },
            include: {
              vehicle: {
                select: {
                  id: true,
                  registration: true,
                  brand: true,
                  model: true,
                },
              },
              staffMembers: {
                where: { checkedIn: true },
                include: {
                  staff: {
                    select: {
                      id: true,
                      firstname: true,
                      lastname: true,
                      type: true,
                    },
                  },
                },
              },
            },
          },
          equipment: {
            where: { returnedAt: null },
            include: {
              equipment: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                },
              },
            },
          },
          invoice: {
            select: {
              id: true,
              invoiceNumber: true,
              status: true,
              total: true,
            },
          },
        },
        orderBy,
      }),
      this.prisma.mission.count({ where }),
    ]);

    return {
      data: missions,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
      filters: {
        ...(status && { status }),
        ...(priority && { priority }),
        ...(customerId && { customerId }),
        ...(patientId && { patientId }),
        ...(locationId && { locationId }),
        ...(vehicleId && { vehicleId }),
        ...(staffId && { staffId }),
        ...(equipmentId && { equipmentId }),
        ...(search && { search }),
        ...(fromDate && { fromDate }),
        ...(toDate && { toDate }),
      },
    };
  }

  async findOne(id: string) {
    const mission = await this.prisma.mission.findFirst({
      where: {
        id,
        isDeleted: false,
      },
      include: {
        customer: true,
        patient: true,
        location: true,
        contract: true,
        assignments: {
          include: {
            vehicle: true,
            staffMembers: {
              include: {
                staff: true,
                schedule: true,
              },
            },
          },
        },
        equipment: {
          where: { returnedAt: null },
          include: {
            equipment: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
        documents: {
          include: {
            document: true,
          },
        },
        invoice: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found.`);
    }

    return mission;
  }

  async findByCode(code: string) {
    const mission = await this.prisma.mission.findFirst({
      where: {
        code,
        isDeleted: false,
      },
      include: {
        customer: true,
        patient: true,
        location: true,
        contract: true,
        assignments: {
          include: {
            vehicle: true,
            staffMembers: {
              include: {
                staff: true,
              },
            },
          },
        },
        equipment: {
          where: { returnedAt: null },
          include: {
            equipment: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
        invoice: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission with code ${code} not found.`);
    }

    return mission;
  }

  async update(id: string, updateMissionDto: UpdateMissionDto) {
    const mission = await this.findOne(id);

    // Validate related entities if provided
    if (updateMissionDto.customerId) {
      await this.getCustomer(updateMissionDto.customerId);
    }

    if (updateMissionDto.patientId) {
      await this.getPatient(updateMissionDto.patientId);
    }

    if (updateMissionDto.locationId) {
      await this.getLocation(updateMissionDto.locationId);
    }

    if (updateMissionDto.contractId) {
      await this.getContract(updateMissionDto.contractId);
    }

    // Prepare update data
    const updateData: any = {
      priority: updateMissionDto.priority,
      reason: updateMissionDto.reason,
      pickupAddress: updateMissionDto.pickupAddress,
      destination: updateMissionDto.destination,
      latitude: updateMissionDto.latitude,
      longitude: updateMissionDto.longitude,
      callDate: updateMissionDto.callDate
        ? new Date(updateMissionDto.callDate)
        : undefined,
      customerId: updateMissionDto.customerId,
      contractId: updateMissionDto.contractId,
      patientId: updateMissionDto.patientId,
      locationId: updateMissionDto.locationId,
      notes: updateMissionDto.notes,
    };

    // Handle status if provided
    if (updateMissionDto.status) {
      updateData.status = updateMissionDto.status;
      // Update timestamps based on status
      const now = new Date();
      switch (updateMissionDto.status) {
        case 'DISPATCHED':
          if (!mission.dispatchedAt) updateData.dispatchedAt = now;
          break;
        case 'ON_SCENE':
          if (!mission.arrivedSceneAt) updateData.arrivedSceneAt = now;
          break;
        case 'TRANSPORTING':
          if (!mission.transportedAt) updateData.transportedAt = now;
          break;
        case 'COMPLETED':
          if (!mission.completedAt) updateData.completedAt = now;
          break;
      }
    }

    // Handle equipment if provided
    if (updateMissionDto.equipment) {
      // Remove existing equipment assignments
      await this.prisma.missionEquipment.deleteMany({
        where: { missionId: id },
      });

      // Create new equipment assignments
      updateData.equipment = {
        create: updateMissionDto.equipment.map((item) => ({
          equipmentId: item.equipmentId,
          quantity: item.quantity || 1,
        })),
      };
    }

    return await this.prisma.mission.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        patient: true,
        location: true,
        contract: true,
        assignments: {
          include: {
            vehicle: true,
            staffMembers: {
              include: {
                staff: true,
              },
            },
          },
        },
        equipment: {
          where: { returnedAt: null },
          include: {
            equipment: true,
          },
        },
        events: {
          orderBy: { createdAt: 'desc' },
        },
        invoice: true,
      },
    });
  }

  // ==================== SOFT DELETE & RESTORE ====================

  async softDelete(id: string) {
    await this.findOne(id);

    // Check if mission has active assignments
    const activeAssignments = await this.prisma.missionAssignment.count({
      where: {
        missionId: id,
        isComplete: false,
      },
    });

    if (activeAssignments > 0) {
      throw new BadRequestException(
        'Cannot delete mission with active assignments.',
      );
    }

    return await this.prisma.mission.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async restore(id: string) {
    const mission = await this.prisma.mission.findFirst({
      where: {
        id,
        isDeleted: true,
      },
    });

    if (!mission) {
      throw new NotFoundException(`Deleted mission with id ${id} not found.`);
    }

    return await this.prisma.mission.update({
      where: { id },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });
  }

  async remove(id: string) {
    const mission = await this.prisma.mission.findFirst({
      where: {
        id,
        isDeleted: false,
      },
    });

    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found.`);
    }

    // Check if mission has active assignments
    const activeAssignments = await this.prisma.missionAssignment.count({
      where: {
        missionId: id,
        isComplete: false,
      },
    });

    if (activeAssignments > 0) {
      throw new BadRequestException(
        'Cannot delete mission with active assignments. Use soft delete instead.',
      );
    }

    return await this.prisma.mission.delete({
      where: { id },
    });
  }

  // ==================== MISSION ASSIGNMENT ====================

  async assignMission(assignMissionDto: AssignMissionDto, missionId: string) {
    const mission = await this.findOne(missionId);

    // Validate vehicle exists
    const vehicle = await this.prisma.vehicle.findFirst({
      where: {
        id: assignMissionDto.vehicleId,
        isDeleted: false,
      },
    });

    if (!vehicle) {
      throw new NotFoundException(
        `Vehicle with id ${assignMissionDto.vehicleId} not found.`,
      );
    }

    // Check if vehicle is already assigned to this mission
    const existingAssignment = await this.prisma.missionAssignment.findFirst({
      where: {
        missionId,
        vehicleId: assignMissionDto.vehicleId,
        isComplete: false,
      },
    });

    if (existingAssignment) {
      throw new ConflictException(
        'This vehicle is already assigned to the mission.',
      );
    }

    // Validate all staff members exist
    if (assignMissionDto.staffIds && assignMissionDto.staffIds.length > 0) {
      const staffMembers = await this.prisma.staffMember.findMany({
        where: {
          id: { in: assignMissionDto.staffIds },
          isDeleted: false,
        },
      });

      if (staffMembers.length !== assignMissionDto.staffIds.length) {
        throw new NotFoundException('One or more staff members not found.');
      }
    }

    // Create the assignment with staff and equipment
    return await this.prisma.$transaction(async (prisma) => {
      // Create mission assignment
      const assignment = await prisma.missionAssignment.create({
        data: {
          missionId,
          vehicleId: assignMissionDto.vehicleId,
          isDefault: true,
        },
      });

      // Assign staff members
      if (assignMissionDto.staffIds && assignMissionDto.staffIds.length > 0) {
        await prisma.assignmentStaff.createMany({
          data: assignMissionDto.staffIds.map((staffId) => ({
            assignmentId: assignment.id,
            staffId,
            sourceType: assignMissionDto.sourceType || StaffSourceType.MANUAL,
            notes: assignMissionDto.notes,
          })),
        });
      }

      // Assign equipment
      if (assignMissionDto.equipment && assignMissionDto.equipment.length > 0) {
        await prisma.missionEquipment.createMany({
          data: assignMissionDto.equipment.map((item) => ({
            missionId,
            equipmentId: item.equipmentId,
            quantity: item.quantity || 1,
          })),
        });
      }

      // Update mission status to ASSIGNED if it was CREATED
      const missionStatus = await prisma.mission.findUnique({
        where: { id: missionId },
        select: { status: true },
      });

      if (missionStatus?.status === 'CREATED') {
        await prisma.mission.update({
          where: { id: missionId },
          data: { status: 'ASSIGNED' },
        });
      }

      // Return the complete assignment
      return await prisma.missionAssignment.findUnique({
        where: { id: assignment.id },
        include: {
          vehicle: true,
          staffMembers: {
            include: {
              staff: true,
            },
          },
        },
      });
    });
  }

  async unassignVehicle(missionId: string, vehicleId: string) {
    const assignment = await this.prisma.missionAssignment.findFirst({
      where: {
        missionId,
        vehicleId,
        isComplete: false,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Vehicle not assigned to this mission.');
    }

    // Check if there are staff members assigned
    const staffCount = await this.prisma.assignmentStaff.count({
      where: {
        assignmentId: assignment.id,
      },
    });

    if (staffCount > 0) {
      throw new BadRequestException(
        'Cannot unassign vehicle with staff members assigned. Remove staff first.',
      );
    }

    return await this.prisma.missionAssignment.delete({
      where: { id: assignment.id },
    });
  }

  async completeAssignment(missionId: string, vehicleId: string) {
    const assignment = await this.prisma.missionAssignment.findFirst({
      where: {
        missionId,
        vehicleId,
        isComplete: false,
      },
    });

    if (!assignment) {
      throw new NotFoundException('Vehicle not assigned to this mission.');
    }

    return await this.prisma.missionAssignment.update({
      where: { id: assignment.id },
      data: {
        isComplete: true,
      },
    });
  }

  // ==================== STATUS MANAGEMENT ====================

  async changeStatus(id: string, changeStatusDto: ChangeStatusDto) {
    const mission = await this.findOne(id);

    // Prepare update data
    const updateData: any = {
      status: changeStatusDto.status,
      notes: changeStatusDto.notes || mission.notes,
    };

    // Update timestamps based on status
    const now = new Date();
    switch (changeStatusDto.status) {
      case 'DISPATCHED':
        if (!mission.dispatchedAt) updateData.dispatchedAt = now;
        break;
      case 'ON_SCENE':
        if (!mission.arrivedSceneAt) updateData.arrivedSceneAt = now;
        break;
      case 'TRANSPORTING':
        if (!mission.transportedAt) updateData.transportedAt = now;
        break;
      case 'COMPLETED':
        if (!mission.completedAt) updateData.completedAt = now;
        break;
    }

    // Update mission
    const updatedMission = await this.prisma.mission.update({
      where: { id },
      data: updateData,
    });

    // Add event
    await this.prisma.missionEvent.create({
      data: {
        missionId: id,
        status: changeStatusDto.status,
        description:
          changeStatusDto.notes ||
          `Status changed to ${changeStatusDto.status}`,
        latitude: changeStatusDto.latitude,
        longitude: changeStatusDto.longitude,
      },
    });

    return updatedMission;
  }

  // ==================== EQUIPMENT MANAGEMENT ====================

  async getMissionEquipment(missionId: string) {
    await this.findOne(missionId);

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

  // ==================== STAFF MANAGEMENT ====================

  async getMissionStaff(missionId: string) {
    await this.findOne(missionId);

    return await this.prisma.assignmentStaff.findMany({
      where: {
        assignment: {
          missionId,
          isComplete: false,
        },
      },
      include: {
        staff: true,
        assignment: {
          include: {
            vehicle: true,
          },
        },
      },
    });
  }

  // ==================== MISSION EVENTS ====================

  async getMissionEvents(missionId: string) {
    await this.findOne(missionId);

    return await this.prisma.missionEvent.findMany({
      where: {
        missionId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ==================== HELPER METHODS ====================

  private async generateMissionCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const prefix = `M${year}${month}${day}`;

    // Find the last mission with this prefix
    const lastMission = await this.prisma.mission.findFirst({
      where: {
        code: {
          startsWith: prefix,
        },
      },
      orderBy: {
        code: 'desc',
      },
    });

    let sequence = 1;
    if (lastMission) {
      const lastSequence = parseInt(lastMission.code.slice(-4));
      if (!isNaN(lastSequence)) {
        sequence = lastSequence + 1;
      }
    }

    return `${prefix}${String(sequence).padStart(4, '0')}`;
  }

  private async getCustomer(customerId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id: customerId,
        isDeleted: false,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with id ${customerId} not found.`);
    }

    return customer;
  }

  private async getPatient(patientId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: {
        id: patientId,
        isDeleted: false,
      },
    });

    if (!patient) {
      throw new NotFoundException(`Patient with id ${patientId} not found.`);
    }

    return patient;
  }

  private async getLocation(locationId: string) {
    const location = await this.prisma.location.findFirst({
      where: {
        id: locationId,
        isDeleted: false,
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with id ${locationId} not found.`);
    }

    return location;
  }

  private async getContract(contractId: string) {
    const contract = await this.prisma.contract.findFirst({
      where: {
        id: contractId,
        isDeleted: false,
      },
    });

    if (!contract) {
      throw new NotFoundException(`Contract with id ${contractId} not found.`);
    }

    return contract;
  }
}
