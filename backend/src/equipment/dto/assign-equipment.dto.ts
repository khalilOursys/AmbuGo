// src/equipment/dto/assign-equipment.dto.ts
import { IsUUID, IsNumber, Min, IsOptional } from 'class-validator';

export class AssignEquipmentDto {
  @IsUUID()
  equipmentId: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsUUID()
  @IsOptional()
  missionId?: string;

  @IsNumber()
  @Min(1)
  @IsOptional()
  quantity?: number;
}
