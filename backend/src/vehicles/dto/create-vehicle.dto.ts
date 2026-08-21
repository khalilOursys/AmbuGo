// src/vehicles/dto/create-vehicle.dto.ts
import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsNumber,
  Min,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsDateString,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AmbulanceLevel,
  VehicleStatus,
  ShiftType,
  ScheduleStatus,
} from '@prisma/client';

export class VehicleEquipmentAssignmentDto {
  @IsUUID()
  equipmentId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}

export class VehicleStaffScheduleDto {
  @IsUUID()
  staffId: string;

  @IsDateString()
  shiftStart: string;

  @IsDateString()
  shiftEnd: string;

  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  recurrenceRule?: string;

  @IsOptional()
  @IsDateString()
  validFrom?: string;

  @IsOptional()
  @IsDateString()
  validUntil?: string;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  status?: ScheduleStatus;

  @IsOptional()
  @IsBoolean()
  isReserved?: boolean;

  @IsOptional()
  @IsUUID()
  shiftTemplateId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateVehicleDto {
  @IsUUID()
  companyId: string;

  @IsString()
  registration: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsEnum(AmbulanceLevel)
  level: AmbulanceLevel;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsUUID()
  vehicleTypeId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleEquipmentAssignmentDto)
  equipment?: VehicleEquipmentAssignmentDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VehicleStaffScheduleDto)
  staffSchedules?: VehicleStaffScheduleDto[];
}
