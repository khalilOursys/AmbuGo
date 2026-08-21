// src/vehicles/vehicles.controller.ts
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
  DefaultValuePipe,
  ParseBoolPipe,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { VehicleFilterDto } from './dto/vehicle-filter.dto';
import {
  CreateScheduleDto,
  UpdateScheduleDto,
} from './dto/create-schedule.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  // ===== VEHICLE CRUD =====

  @Post()
  async create(@Body() createVehicleDto: CreateVehicleDto) {
    return await this.vehiclesService.create(createVehicleDto);
  }

  @Get()
  async findAll(@Query() filterDto: VehicleFilterDto) {
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.vehiclesService.findAllWithPagination(filterDto);
    }
    return await this.vehiclesService.findAll(filterDto);
  }

  @Get('company/:companyId')
  async findByCompany(@Param('companyId', ParseUUIDPipe) companyId: string) {
    return await this.vehiclesService.findByCompany(companyId);
  }

  @Get('available')
  async findAvailable(@Query('companyId', ParseUUIDPipe) companyId: string) {
    return await this.vehiclesService.findAvailable(companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.vehiclesService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
  ) {
    return await this.vehiclesService.update(id, updateVehicleDto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('status') status: string,
  ) {
    return await this.vehiclesService.updateStatus(id, status);
  }

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.vehiclesService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.vehiclesService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.vehiclesService.remove(id);
  }

  // ===== SCHEDULE MANAGEMENT =====

  @Post('schedules')
  async addSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    return await this.vehiclesService.addSchedule(createScheduleDto);
  }

  @Get(':vehicleId/schedules')
  async getSchedulesForVehicle(
    @Param('vehicleId', ParseUUIDPipe) vehicleId: string,
    @Query('date') date?: string,
  ) {
    // Convert date string to Date object if provided
    let dateObj: Date | undefined;

    if (date) {
      dateObj = new Date(date);
      // Validate date if provided
      if (isNaN(dateObj.getTime())) {
        throw new BadRequestException(
          `Invalid date format: ${date}. Please use ISO 8601 format (YYYY-MM-DD)`,
        );
      }
    }

    return await this.vehiclesService.findSchedulesForVehicle(
      vehicleId,
      dateObj,
    );
  }

  @Put('schedules/:id')
  async updateSchedule(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return await this.vehiclesService.updateSchedule(id, updateScheduleDto);
  }

  @Delete('schedules/:id')
  async deleteSchedule(@Param('id', ParseUUIDPipe) id: string) {
    return await this.vehiclesService.deleteSchedule(id);
  }

  // ===== STAFF AND EQUIPMENT ASSIGNMENT =====

  @Post(':id/assign-staff')
  async assignStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('staffSchedules') staffSchedules: any[],
  ) {
    return await this.vehiclesService.assignStaff(id, staffSchedules);
  }

  @Post(':id/assign-equipment')
  async assignEquipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('equipment') equipment: { equipmentId: string; quantity: number }[],
  ) {
    return await this.vehiclesService.assignEquipment(id, equipment);
  }

  @Delete(':id/staff/:staffId')
  async removeStaff(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('staffId', ParseUUIDPipe) staffId: string,
  ) {
    return await this.vehiclesService.removeStaffFromVehicle(id, staffId);
  }

  @Delete(':id/equipment/:equipmentId')
  async removeEquipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('equipmentId', ParseUUIDPipe) equipmentId: string,
  ) {
    return await this.vehiclesService.removeEquipmentFromVehicle(
      id,
      equipmentId,
    );
  }
}
