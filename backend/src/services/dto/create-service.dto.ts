// src/services/dto/create-service.dto.ts
import { IsString, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateServiceDto {
  @IsUUID()
  companyId: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Min(0)
  unitPrice: number;
}
