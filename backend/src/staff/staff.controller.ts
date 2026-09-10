// src/staff/staff.controller.ts
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
import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { FilterStaffDto } from './dto/filter-staff.dto';

@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  // ==================== CRUD ENDPOINTS ====================

  @Post()
  async create(@Body() createStaffDto: CreateStaffDto) {
    return await this.staffService.create(createStaffDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterStaffDto) {
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.staffService.findAllWithPagination(filterDto);
    }
    return await this.staffService.findAll(filterDto.companyId);
  }

  @Get('company/:companyId')
  async findAllByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() filterDto: FilterStaffDto,
  ) {
    filterDto.companyId = companyId;
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.staffService.findAllWithPagination(filterDto);
    }
    return await this.staffService.findAll(companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.staffService.findOne(id);
  }

  @Get('matricule/:matricule')
  async findByMatricule(@Param('matricule') matricule: string) {
    return await this.staffService.findByMatricule(matricule);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStaffDto: UpdateStaffDto,
  ) {
    return await this.staffService.update(id, updateStaffDto);
  }

  // ==================== SOFT DELETE & RESTORE ====================

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.staffService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.staffService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.staffService.remove(id);
  }
}
