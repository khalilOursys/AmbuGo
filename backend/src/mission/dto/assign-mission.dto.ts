import {
  IsUUID,
  IsArray,
  IsOptional,
  IsEnum,
  IsString,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { StaffSourceType } from '@prisma/client';

export class AssignmentEquipmentDto {
  @IsUUID()
  equipmentId: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1;
}

export class AssignMissionDto {
  @IsUUID()
  vehicleId: string;

  @IsArray()
  @IsUUID('4', { each: true })
  staffIds: string[];

  @IsOptional()
  @IsEnum(StaffSourceType)
  sourceType?: StaffSourceType = StaffSourceType.MANUAL;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignmentEquipmentDto)
  equipment?: AssignmentEquipmentDto[];
}
