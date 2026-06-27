// src/companies/companies.controller.ts
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
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { CompanyFilterDto } from './dto/company-filter.dto';

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    return await this.companiesService.create(createCompanyDto);
  }

  @Get()
  async findAll(@Query() filterDto: CompanyFilterDto) {
    // If page and limit are provided, use pagination
    if (filterDto.page !== undefined && filterDto.limit !== undefined) {
      return await this.companiesService.findAllWithPagination(filterDto);
    }

    // Otherwise return all
    return await this.companiesService.findAll();
  }
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return await this.companiesService.findOne(id);
  }

  @Get(':id/stats')
  async getStats(@Param('id', ParseUUIDPipe) id: string) {
    return await this.companiesService.getStats(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    return await this.companiesService.update(id, updateCompanyDto);
  }

  @Patch(':id/soft-delete')
  async softDelete(@Param('id', ParseUUIDPipe) id: string) {
    return await this.companiesService.softDelete(id);
  }

  @Patch(':id/restore')
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    return await this.companiesService.restore(id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.companiesService.remove(id);
  }
}
