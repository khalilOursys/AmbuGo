import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { VehicleType, VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  licensePlate: string;

  @IsEnum(VehicleType)
  type: VehicleType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  sanitaryApprovalNo?: string;

  @IsOptional()
  @IsDateString()
  sanitaryExpiryDate?: string;

  @IsOptional()
  @IsDateString()
  technicalControlDate?: string;

  @IsOptional()
  @IsDateString()
  nextTechnicalControl?: string;

  @IsOptional()
  @IsString()
  insurancePolicyNo?: string;

  @IsOptional()
  @IsString()
  insuranceCompany?: string;

  @IsOptional()
  @IsDateString()
  insuranceExpiryDate?: string;

  @IsOptional()
  @IsString()
  medicalEquipment?: string;

  @IsOptional()
  @IsNumber()
  mileage?: number;

  @IsOptional()
  @IsString()
  maintenancePlan?: string;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;
}