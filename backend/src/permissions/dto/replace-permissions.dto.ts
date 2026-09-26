import { IsArray, IsUUID } from 'class-validator';

export class ReplacePermissionsDto {
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
