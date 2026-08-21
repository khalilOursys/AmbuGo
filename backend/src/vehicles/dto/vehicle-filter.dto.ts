// src/vehicles/dto/vehicle-filter.dto.ts
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsInt,
  Min,
  IsDateString,
  IsBoolean,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ToBoolean } from '../../common/boolean.transformer';
import {
  VehicleStatus,
  AmbulanceLevel,
  ShiftType,
  ScheduleStatus,
} from '@prisma/client';

export class VehicleFilterDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page?: number = 0;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;

  @IsOptional()
  @IsUUID()
  companyId?: string;

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
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsEnum(AmbulanceLevel)
  level?: AmbulanceLevel;

  @IsOptional()
  @IsUUID()
  vehicleTypeId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @ToBoolean()
  isDeleted?: boolean = false;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsBoolean()
  includeStaffSchedules?: boolean = true;

  @IsOptional()
  @IsBoolean()
  includeEquipment?: boolean = true;

  @IsOptional()
  @IsDateString()
  scheduleDate?: string;

  @IsOptional()
  @IsEnum(ShiftType)
  shiftType?: ShiftType;

  @IsOptional()
  @IsEnum(ScheduleStatus)
  scheduleStatus?: ScheduleStatus;

  @IsOptional()
  @IsUUID()
  staffId?: string;
}
