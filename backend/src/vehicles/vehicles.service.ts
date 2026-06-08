import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleStatus } from '@prisma/client';

@Injectable()
export class VehiclesService {
  constructor(private prisma: PrismaService) {}

  // ---------------- CREATE ----------------
 async create(createVehicleDto: CreateVehicleDto) {
  return this.prisma.vehicle.create({
    data: {
      licensePlate: createVehicleDto.licensePlate,
      type: createVehicleDto.type,

      brand: createVehicleDto.brand,
      model: createVehicleDto.model,

      sanitaryApprovalNo: createVehicleDto.sanitaryApprovalNo,
      sanitaryExpiryDate: createVehicleDto.sanitaryExpiryDate
        ? new Date(createVehicleDto.sanitaryExpiryDate)
        : null,

      technicalControlDate: createVehicleDto.technicalControlDate
        ? new Date(createVehicleDto.technicalControlDate)
        : null,

      nextTechnicalControl: createVehicleDto.nextTechnicalControl
        ? new Date(createVehicleDto.nextTechnicalControl)
        : null,

      insurancePolicyNo: createVehicleDto.insurancePolicyNo,
      insuranceCompany: createVehicleDto.insuranceCompany,
      insuranceExpiryDate: createVehicleDto.insuranceExpiryDate
        ? new Date(createVehicleDto.insuranceExpiryDate)
        : null,

      medicalEquipment: createVehicleDto.medicalEquipment,

      mileage: createVehicleDto.mileage ?? null,

      maintenancePlan: createVehicleDto.maintenancePlan,

      status: createVehicleDto.status ?? 'AVAILABLE',
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

  const data: any = {};

  if (dto.licensePlate !== undefined) {
    data.licensePlate = dto.licensePlate;
  }

  if (dto.type !== undefined) {
    data.type = dto.type;
  }

  if (dto.brand !== undefined) {
    data.brand = dto.brand;
  }

  if (dto.model !== undefined) {
    data.model = dto.model;
  }

  if (dto.sanitaryApprovalNo !== undefined) {
    data.sanitaryApprovalNo = dto.sanitaryApprovalNo;
  }

  if (dto.sanitaryExpiryDate !== undefined) {
    data.sanitaryExpiryDate = new Date(dto.sanitaryExpiryDate);
  }

  if (dto.technicalControlDate !== undefined) {
    data.technicalControlDate = new Date(dto.technicalControlDate);
  }

  if (dto.nextTechnicalControl !== undefined) {
    data.nextTechnicalControl = new Date(dto.nextTechnicalControl);
  }

  if (dto.insurancePolicyNo !== undefined) {
    data.insurancePolicyNo = dto.insurancePolicyNo;
  }

  if (dto.insuranceCompany !== undefined) {
    data.insuranceCompany = dto.insuranceCompany;
  }

  if (dto.insuranceExpiryDate !== undefined) {
    data.insuranceExpiryDate = new Date(dto.insuranceExpiryDate);
  }

  if (dto.medicalEquipment !== undefined) {
    data.medicalEquipment = dto.medicalEquipment;
  }

  if (dto.mileage !== undefined) {
    data.mileage = dto.mileage;
  }

  if (dto.maintenancePlan !== undefined) {
    data.maintenancePlan = dto.maintenancePlan;
  }

  if (dto.status !== undefined) {
    data.status = dto.status;
  }

  return this.prisma.vehicle.update({
    where: { id },
    data,
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