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
} from '@nestjs/common';
import { LocationService } from './location.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { FilterLocationDto } from './dto/filter-location.dto';

@Controller('locations')
export class LocationController {
  constructor(private readonly locationService: LocationService) {}

  // ==================== CRUD ENDPOINTS ====================

  @Post()
  async create(@Body() createLocationDto: CreateLocationDto) {
    return await this.locationService.create(createLocationDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterLocationDto) {
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.locationService.findAllWithPagination(filterDto);
    }
    return await this.locationService.findAll(filterDto.companyId);
  }

  @Get('company/:companyId')
  async findAllByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() filterDto: FilterLocationDto,
  ) {
    filterDto.companyId = companyId;
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.locationService.findAllWithPagination(filterDto);
    }
    return await this.locationService.findAll(companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.locationService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLocationDto: UpdateLocationDto,
  ) {
    return await this.locationService.update(id, updateLocationDto);
  }

  // ==================== SOFT DELETE & RESTORE ====================

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.locationService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.locationService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.locationService.remove(id);
  }
}
