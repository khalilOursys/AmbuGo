// src/staff/dto/update-staff.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffDto } from './create-staff.dto';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { StaffType } from '@prisma/client';

export class UpdateStaffDto extends PartialType(CreateStaffDto) {
  @IsOptional()
  @IsEnum(StaffType)
  type?: StaffType;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
