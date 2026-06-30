// src/users/users.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRole } from '@prisma/client';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateUserDto } from './dto/UpdateUserDto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ==================== UTILITY ENDPOINTS ====================

  @Get('roles')
  async getRoles() {
    return {
      roles: Object.values(UserRole),
    };
  }

  // ==================== CRUD ENDPOINTS ====================

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll(@Query() filterDto: UserFilterDto) {
    // If page and limit are provided, use pagination
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.usersService.findAllWithPagination(filterDto);
    }

    // Otherwise return all
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  // ==================== SOFT DELETE & RESTORE ====================

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.remove(id);
  }

  // ==================== USER MANAGEMENT ====================

  @Patch(':id/role')
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('role') role: UserRole,
  ) {
    if (!role) {
      throw new BadRequestException('Role is required');
    }
    if (!Object.values(UserRole).includes(role)) {
      throw new BadRequestException(
        `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`,
      );
    }
    return await this.usersService.updateRole(id, role);
  }

  @Patch(':id/change-password')
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
  ) {
    if (!currentPassword || !newPassword) {
      throw new BadRequestException(
        'Current password and new password are required',
      );
    }
    return await this.usersService.changePassword(
      id,
      currentPassword,
      newPassword,
    );
  }

  // ==================== COMPANY ASSIGNMENT ====================

  @Patch(':id/assign-company')
  async assignCompany(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('companyId') companyId: string,
  ) {
    if (!companyId) {
      throw new BadRequestException('companyId is required');
    }
    return await this.usersService.assignCompany(id, companyId);
  }

  @Patch(':id/remove-company')
  async removeCompany(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.removeCompany(id);
  }

  // ==================== BULK OPERATIONS ====================

  @Post('bulk')
  async createBulk(@Body() createUserDtos: CreateUserDto[]) {
    if (!Array.isArray(createUserDtos) || createUserDtos.length === 0) {
      throw new BadRequestException('Array of users is required');
    }
    return await this.usersService.createBulk(createUserDtos);
  }

  @Delete('bulk')
  async deleteBulk(@Body('ids') ids: string[]) {
    if (!Array.isArray(ids) || ids.length === 0) {
      throw new BadRequestException('Array of user IDs is required');
    }
    return await this.usersService.deleteBulk(ids);
  }
}
