// auth.controller.ts
import {
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { SignUpDto } from './dto/sign-up.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signUp(@Body() signUpDto: SignUpDto) {
    try {
      return await this.authService.signUp(signUpDto);
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  // NEW — used by the frontend on app load
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.usersService.findOne(req.user.userId);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      companyId: user.companyId ?? null,
      companyName: user.company?.name ?? null,
    };
  }
}
