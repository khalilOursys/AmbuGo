import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { GrantPermissionDto } from './dto/grant-permission.dto';
import { ReplacePermissionsDto } from './dto/replace-permissions.dto';

@Controller()
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  // ==================== CATALOG ====================
  @Get('permissions')
  async getCatalog() {
    return await this.permissionsService.getCatalog();
  }

  // ==================== USER PERMISSIONS ====================
  @Get('users/:id/permissions')
  async getUserPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return await this.permissionsService.getUserPermissions(id);
  }

  @Post('users/:id/permissions')
  async grant(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: GrantPermissionDto,
  ) {
    // TODO: replace `undefined` with req.user.id once auth guard is wired
    return await this.permissionsService.grantPermission(id, dto.permissionId);
  }

  @Delete('users/:id/permissions/:permissionId')
  async revoke(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('permissionId', ParseUUIDPipe) permissionId: string,
  ) {
    return await this.permissionsService.revokePermission(id, permissionId);
  }

  @Put('users/:id/permissions')
  async replace(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplacePermissionsDto,
  ) {
    return await this.permissionsService.replaceUserPermissions(
      id,
      dto.permissionIds,
    );
  }

  @Post('users/:id/permissions/from-role')
  async grantFromRole(@Param('id', ParseUUIDPipe) id: string) {
    return await this.permissionsService.grantRolePermissionsToUser(id);
  }
}
