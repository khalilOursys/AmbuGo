import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';
import { IsOptional, IsUUID } from 'class-validator';

export class UpdatePatientDto extends PartialType(CreatePatientDto) {
  @IsOptional()
  @IsUUID()
  companyId?: string;
}
