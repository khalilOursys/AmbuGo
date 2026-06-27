// src/companies/dto/create-company.dto.ts
import {
  IsString,
  IsOptional,
  IsNumber,
  IsEmail,
  IsEnum,
  Min,
  IsUUID,
} from 'class-validator';
import { PricingType } from '@prisma/client';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  radiusKm?: number;

  @IsEnum(PricingType)
  @IsOptional()
  pricingType?: PricingType;

  @IsString()
  @IsOptional()
  baseCurrency?: string;

  @IsString()
  @IsOptional()
  rib?: string;

  @IsString()
  @IsOptional()
  matriculeFiscale?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsUUID()
  @IsOptional()
  logoId?: string;
}
