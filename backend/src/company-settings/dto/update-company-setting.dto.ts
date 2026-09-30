import {
  IsEmail,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DistanceRateDto } from './distance-rate.dto';
import { CompanyStatus, PricingType } from '@prisma/client';

export class UpdateCompanySettingsDto {
  @IsOptional() @IsString() id?: string; // 👈 ADD THIS

  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() legalName?: string;

  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() fax?: string;
  @IsOptional() @IsString() website?: string;

  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() postalCode?: string;
  @IsOptional() @IsString() country?: string;

  @IsOptional() @IsString() taxNumber?: string;
  @IsOptional() @IsString() rib?: string;
  @IsOptional() @IsString() iban?: string;
  @IsOptional() @IsString() bankName?: string;
  @IsOptional() @IsNumber() vatRate?: number;

  @IsOptional() @IsString() currency?: string;
  @IsOptional() @IsNumber() defaultPaymentTerms?: number;
  @IsOptional() @IsString() invoicePrefix?: string;
  @IsOptional() @IsEnum(PricingType) pricingType?: PricingType;

  @IsOptional() @IsEnum(CompanyStatus) status?: CompanyStatus;
  @IsOptional() @IsString() timezone?: string;
  @IsOptional() @IsString() locale?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistanceRateDto)
  distanceRates?: DistanceRateDto[];
}
