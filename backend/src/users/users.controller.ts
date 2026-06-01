// src/users/users.controller.ts
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseUUIDPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UserRole } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Add this new endpoint to get available roles
  @Get('roles')
  async getRoles() {
    // Return all enum values from Prisma
    return {
      roles: Object.values(UserRole),
    };
  }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
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

  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    return await this.usersService.remove(id);
  }
}
