import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { ServicesModule } from './services/services.module';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
  imports: [AuthModule, UsersModule, CompaniesModule, ServicesModule, EquipmentModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
