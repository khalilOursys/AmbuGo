// src/equipment/equipment.controller.ts
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
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { AssignEquipmentDto } from './dto/assign-equipment.dto';
import { EquipmentFilterDto } from './dto/equipment-filter.dto';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  // ==================== CRUD ENDPOINTS ====================

  @Post()
  async create(@Body() createEquipmentDto: CreateEquipmentDto) {
    return await this.equipmentService.create(createEquipmentDto);
  }

  @Get()
  async findAll(@Query() filterDto: EquipmentFilterDto) {
    // If page and limit are provided, use pagination
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.equipmentService.findAllWithPagination(filterDto);
    }

    // Otherwise return all
    return await this.equipmentService.findAll();
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return await this.equipmentService.findByCompany(companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.equipmentService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return await this.equipmentService.update(id, updateEquipmentDto);
  }

  // ==================== SOFT DELETE & RESTORE ====================

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.equipmentService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.equipmentService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.equipmentService.remove(id);
  }

  // ==================== VEHICLE ASSIGNMENT ====================

  @Post('assign-vehicle')
  async assignToVehicle(@Body() assignDto: AssignEquipmentDto) {
    if (!assignDto.vehicleId) {
      throw new BadRequestException('vehicleId is required');
    }
    return await this.equipmentService.assignToVehicle(
      assignDto.vehicleId,
      assignDto.equipmentId,
      assignDto.quantity,
    );
  }

  @Delete('vehicle/:vehicleId/equipment/:equipmentId')
  async removeFromVehicle(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Param('equipmentId', ParseUUIDPipe) equipmentId: string,
  ) {
    return await this.equipmentService.removeFromVehicle(
      vehicleId,
      equipmentId,
    );
  }

  @Patch('vehicle/:vehicleId/equipment/:equipmentId/return')
  async returnVehicleEquipment(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Param('equipmentId', ParseUUIDPipe) equipmentId: string,
  ) {
    return await this.equipmentService.returnVehicleEquipment(
      vehicleId,
      equipmentId,
    );
  }

  @Get('vehicle/:vehicleId')
  async getVehicleEquipment(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
  ) {
    return await this.equipmentService.getVehicleEquipment(vehicleId);
  }

  // ==================== MISSION ASSIGNMENT ====================

  @Post('assign-mission')
  async assignToMission(@Body() assignDto: AssignEquipmentDto) {
    if (!assignDto.missionId) {
      throw new BadRequestException('missionId is required');
    }
    return await this.equipmentService.assignToMission(
      assignDto.missionId,
      assignDto.equipmentId,
      assignDto.quantity,
    );
  }

  @Delete('mission/:missionId/equipment/:equipmentId')
  async removeFromMission(
    @Param('missionId', ParseUUIDPipe) missionId: string,
    @Param('equipmentId', ParseUUIDPipe) equipmentId: string,
  ) {
    return await this.equipmentService.removeFromMission(
      missionId,
      equipmentId,
    );
  }

  @Patch('mission/:missionId/equipment/:equipmentId/return')
  async returnMissionEquipment(
    @Param('missionId', ParseUUIDPipe) missionId: string,
    @Param('equipmentId', ParseUUIDPipe) equipmentId: string,
  ) {
    return await this.equipmentService.returnMissionEquipment(
      missionId,
      equipmentId,
    );
  }

  @Get('mission/:missionId')
  async getMissionEquipment(
    @Param('missionId', ParseUUIDPipe) missionId: string,
  ) {
    return await this.equipmentService.getMissionEquipment(missionId);
  }
}
