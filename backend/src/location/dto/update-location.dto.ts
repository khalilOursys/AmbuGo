import { PartialType } from '@nestjs/mapped-types';
import { CreateLocationDto } from './create-location.dto';
import { IsOptional, IsEnum, IsUUID } from 'class-validator';
import { LocationType } from '@prisma/client';

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @IsOptional()
  @IsEnum(LocationType)
  type?: LocationType;

  @IsOptional()
  @IsUUID()
  companyId?: string;
}
