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
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { FilterPatientDto } from './dto/filter-patient.dto';

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  // ==================== CRUD ENDPOINTS ====================

  @Post()
  async create(@Body() createPatientDto: CreatePatientDto) {
    return await this.patientService.create(createPatientDto);
  }

  @Get()
  async findAll(@Query() filterDto: FilterPatientDto) {
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.patientService.findAllWithPagination(filterDto);
    }
    return await this.patientService.findAll(filterDto.companyId);
  }

  @Get('company/:companyId')
  async findAllByCompany(
    @Param('companyId', ParseUUIDPipe) companyId: string,
    @Query() filterDto: FilterPatientDto,
  ) {
    filterDto.companyId = companyId;
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.patientService.findAllWithPagination(filterDto);
    }
    return await this.patientService.findAll(companyId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.patientService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePatientDto: UpdatePatientDto,
  ) {
    return await this.patientService.update(id, updatePatientDto);
  }

  // ==================== SOFT DELETE & RESTORE ====================

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.patientService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.patientService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.patientService.remove(id);
  }
}
