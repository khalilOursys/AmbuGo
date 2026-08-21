// src/vehicles/dto/update-vehicle.dto.ts
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
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  AmbulanceLevel,
  VehicleStatus,
  ShiftType,
  ScheduleStatus,
} from '@prisma/client';
import {
  VehicleEquipmentAssignmentDto,
  VehicleStaffScheduleDto,
} from './create-vehicle.dto';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  registration?: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsEnum(AmbulanceLevel)
  level?: AmbulanceLevel;

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
