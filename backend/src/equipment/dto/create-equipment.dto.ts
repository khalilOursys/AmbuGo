// src/equipment/dto/create-equipment.dto.ts
import { IsString, IsOptional, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateEquipmentDto {
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
  @IsOptional()
  quantity?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  purchasePrice?: number;
}
