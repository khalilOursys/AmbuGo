import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';

import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  create(@Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(dto);
  }

  @Get()
  findAll() {
    return this.vehiclesService.findAll();
  }

  @Get(':id')
async findOne(@Param('id') id: string) {
  return this.vehiclesService.findOne(id);
}

@Put(':id')
async update(@Param('id') id: string, @Body() dto: UpdateVehicleDto) {
  return this.vehiclesService.update(id, dto);
}

@Delete(':id')
async remove(@Param('id') id: string) {
  return this.vehiclesService.remove(id);
}
}