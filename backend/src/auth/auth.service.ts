// server/src/auth/auth.service.ts
import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma.service';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    if (
      user &&
      user.password &&
      (await bcryptjs.compare(password, user.password))
    ) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.name,
      },
    };
  }

  async signUp(signUpDto: SignUpDto) {
    const { company: companyData, manager: managerData } = signUpDto;

    // Check if email already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: managerData.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Check if company name already exists
    const existingCompany = await this.prisma.company.findUnique({
      where: { name: companyData.name },
    });

    if (existingCompany) {
      throw new ConflictException('Company name already taken');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(managerData.password, 10);

    try {
      // Create company and manager in a transaction
      const result = await this.prisma.$transaction(async (tx) => {
        // Create company
        const company = await tx.company.create({
          data: {
            name: companyData.name,
            address: companyData.address,
            latitude: companyData.latitude,
            longitude: companyData.longitude,
            radiusKm: companyData.radiusKm || 10,
            pricingType: companyData.pricingType || 'FIXED',
            baseCurrency: companyData.baseCurrency || 'TND',
            rib: companyData.rib,
            matriculeFiscale: companyData.matriculeFiscale,
            email: companyData.email,
            phone: companyData.phone,
          },
        });

        // Create manager user
        const manager = await tx.user.create({
          data: {
            email: managerData.email,
            password: hashedPassword,
            firstName: managerData.firstName,
            lastName: managerData.lastName,
            telephone: managerData.telephone,
            cin: managerData.cin,
            role: 'MANAGER',
            companyId: company.id,
          },
          include: {
            company: true,
          },
        });

        return { company, manager };
      });

      // Generate JWT token
      const payload = {
        sub: result.manager.id,
        email: result.manager.email,
        role: result.manager.role,
        companyId: result.manager.companyId,
      };

      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: result.manager.id,
          email: result.manager.email,
          firstName: result.manager.firstName,
          lastName: result.manager.lastName,
          role: result.manager.role,
          companyId: result.manager.companyId,
          companyName: result.manager.company?.name,
        },
        company: {
          id: result.company.id,
          name: result.company.name,
          address: result.company.address,
          email: result.company.email,
          phone: result.company.phone,
        },
      };
    } catch (error: any) {
      throw new BadRequestException(
        'Failed to create company and user: ' + error.message,
      );
    }
  }

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        company: true,
      },
    });
  }
}
