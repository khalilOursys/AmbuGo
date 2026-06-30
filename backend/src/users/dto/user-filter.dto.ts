// src/users/dto/user-filter.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsIn,
} from 'class-validator';
import { UserRole } from '@prisma/client';
import { Type } from 'class-transformer';
import { ToBoolean } from '../../common/boolean.transformer';

export class UserFilterDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  cin?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @ToBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'firstName', 'lastName', 'email', 'role'])
  sortBy?: string;

  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
