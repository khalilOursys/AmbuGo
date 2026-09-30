import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class DistanceRateDto {
  @IsOptional() @IsString() id?: string;
  @IsOptional() @IsString() label?: string;
  @IsNumber() @Min(0) minKm: number;
  @IsNumber() @Min(0) maxKm: number;
  @IsNumber() @Min(0) price: number;
}
