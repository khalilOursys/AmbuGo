// src/companies/dto/company-filter.dto.ts
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PricingType } from '@prisma/client';

export class CompanyFilterDto {
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
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(PricingType)
  pricingType?: PricingType;

  @IsOptional()
  @IsString()
  baseCurrency?: string;

  @IsOptional()
  @IsString()
  matriculeFiscale?: string;

  @IsOptional()
  @IsString()
  rib?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isDeleted?: boolean = false;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
