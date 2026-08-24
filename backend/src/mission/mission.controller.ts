// src/mission/mission.controller.ts
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
import { MissionService } from './mission.service';
import { CreateMissionDto } from './dto/create-mission.dto';
import { UpdateMissionDto } from './dto/update-mission.dto';
import { FilterMissionDto } from './dto/filter-mission.dto';
import { AssignMissionDto } from './dto/assign-mission.dto';
import { ChangeStatusDto } from './dto/change-status.dto';

@Controller('mission')
export class MissionController {
  constructor(private readonly missionService: MissionService) {}

  // ==================== CRUD ENDPOINTS ====================

  @Post()
  async create(@Body() createMissionDto: CreateMissionDto) {
    return await this.missionService.create(createMissionDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterMissionDto) {
    // If page and limit are provided, use pagination
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.missionService.findAllWithPagination(filterDto);
    }

    // Otherwise return all
    return await this.missionService.findAll();
  }

  @Get('code/:code')
  async findByCode(@Param('code') code: string) {
    return await this.missionService.findByCode(code);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.missionService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMissionDto: UpdateMissionDto,
  ) {
    return await this.missionService.update(id, updateMissionDto);
  }

  // ==================== SOFT DELETE & RESTORE ====================

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.missionService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.missionService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.missionService.remove(id);
  }

  // ==================== MISSION ASSIGNMENT ====================

  @Post(':id/assign')
  async assignMission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignMissionDto: AssignMissionDto,
  ) {
    return await this.missionService.assignMission(assignMissionDto, id);
  }

  @Delete(':missionId/vehicle/:vehicleId')
  async unassignVehicle(
    @Param('missionId', ParseUUIDPipe) missionId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return await this.missionService.unassignVehicle(missionId, vehicleId);
  }

  @Patch(':missionId/vehicle/:vehicleId/complete')
  async completeAssignment(
    @Param('missionId', ParseUUIDPipe) missionId: string,
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return await this.missionService.completeAssignment(missionId, vehicleId);
  }

  // ==================== STATUS MANAGEMENT ====================

  @Patch(':id/status')
  async changeStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changeStatusDto: ChangeStatusDto,
  ) {
    return await this.missionService.changeStatus(id, changeStatusDto);
  }

  // ==================== EQUIPMENT MANAGEMENT ====================

  @Get(':missionId/equipment')
  async getMissionEquipment(
    @Param('missionId', ParseUUIDPipe) missionId: string,
  ) {
    return await this.missionService.getMissionEquipment(missionId);
  }

  // ==================== STAFF MANAGEMENT ====================

  @Get(':missionId/staff')
  async getMissionStaff(@Param('missionId', ParseUUIDPipe) missionId: string) {
    return await this.missionService.getMissionStaff(missionId);
  }

  // ==================== MISSION EVENTS ====================

  @Get(':missionId/events')
  async getMissionEvents(@Param('missionId', ParseUUIDPipe) missionId: string) {
    return await this.missionService.getMissionEvents(missionId);
  }
}
