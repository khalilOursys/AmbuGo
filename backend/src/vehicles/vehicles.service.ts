import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  // ---------------- CREATE ----------------
  async create(dto: CreateVehicleDto) {
    return this.prisma.vehicle.create({
      data: {
        licensePlate: dto.licensePlate,
        type: dto.type,

        sanitaryApprovalNo: dto.sanitaryApprovalNo ?? undefined,
        sanitaryExpiryDate: dto.sanitaryExpiryDate
          ? new Date(dto.sanitaryExpiryDate)
          : undefined,

        technicalControlDate: dto.technicalControlDate
          ? new Date(dto.technicalControlDate)
          : undefined,

        nextTechnicalControl: dto.nextTechnicalControl
          ? new Date(dto.nextTechnicalControl)
          : undefined,

        insurancePolicyNo: dto.insurancePolicyNo ?? undefined,
        insuranceCompany: dto.insuranceCompany ?? undefined,

        insuranceExpiryDate: dto.insuranceExpiryDate
          ? new Date(dto.insuranceExpiryDate)
          : undefined,

        medicalEquipment: dto.medicalEquipment ?? undefined,
        mileage: dto.mileage ?? undefined,
        maintenancePlan: dto.maintenancePlan ?? undefined,

        status: dto.status ?? VehicleStatus.AVAILABLE,
      },
    });
  }

  // ---------------- FIND ALL ----------------
  async findAll() {
    return this.prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  // ---------------- FIND ONE ----------------
  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found');
    }

    return vehicle;
  }

  // ---------------- UPDATE ----------------
  async update(id: string, dto: UpdateVehicleDto) {
    await this.findOne(id);

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...(dto.licensePlate && { licensePlate: dto.licensePlate }),
        ...(dto.type && { type: dto.type }),

        ...(dto.sanitaryApprovalNo !== undefined && {
          sanitaryApprovalNo: dto.sanitaryApprovalNo,
        }),

        ...(dto.sanitaryExpiryDate && {
          sanitaryExpiryDate: new Date(dto.sanitaryExpiryDate),
        }),

        ...(dto.technicalControlDate && {
          technicalControlDate: new Date(dto.technicalControlDate),
        }),

        ...(dto.nextTechnicalControl && {
          nextTechnicalControl: new Date(dto.nextTechnicalControl),
        }),

        ...(dto.insurancePolicyNo !== undefined && {
          insurancePolicyNo: dto.insurancePolicyNo,
        }),

        ...(dto.insuranceCompany !== undefined && {
          insuranceCompany: dto.insuranceCompany,
        }),

        ...(dto.insuranceExpiryDate && {
          insuranceExpiryDate: new Date(dto.insuranceExpiryDate),
        }),

        ...(dto.medicalEquipment !== undefined && {
          medicalEquipment: dto.medicalEquipment,
        }),

        ...(dto.mileage !== undefined && {
          mileage: dto.mileage,
        }),

        ...(dto.maintenancePlan !== undefined && {
          maintenancePlan: dto.maintenancePlan,
        }),

        ...(dto.status && {
          status: dto.status,
        }),
      },
    });
  }

  // ---------------- DELETE ----------------
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.vehicle.delete({
      where: { id },
    });
  }
}