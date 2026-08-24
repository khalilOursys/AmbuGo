import { PartialType } from '@nestjs/mapped-types';
import { CreateMissionDto, MissionEquipmentDto } from './create-mission.dto';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MissionStatus } from '@prisma/client';

export class UpdateMissionDto extends PartialType(CreateMissionDto) {
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MissionEquipmentDto)
  equipment?: MissionEquipmentDto[];
}
