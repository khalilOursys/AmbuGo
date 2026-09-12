import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsPhoneNumber,
} from 'class-validator';

export class CreatePatientDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
