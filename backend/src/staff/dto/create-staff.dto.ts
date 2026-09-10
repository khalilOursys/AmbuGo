// src/staff/dto/create-staff.dto.ts
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsEmail,
  IsPhoneNumber,
} from 'class-validator';
import { StaffType } from '@prisma/client';

export class CreateStaffDto {
  @IsUUID()
  companyId: string;

  @IsOptional()
  @IsString()
  matricule?: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsEnum(StaffType)
  type: StaffType;

  @IsOptional()
  @IsUUID()
  userId?: string;
}
