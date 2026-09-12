import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { CompaniesModule } from './companies/companies.module';
import { ServicesModule } from './services/services.module';
import { EquipmentModule } from './equipment/equipment.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { MissionModule } from './mission/mission.module';
import { StaffModule } from './staff/staff.module';
import { LocationModule } from './location/location.module';
import { PatientModule } from './patient/patient.module';

@Module({
  imports: [AuthModule, UsersModule, CompaniesModule, ServicesModule, EquipmentModule, VehiclesModule, MissionModule, StaffModule, LocationModule, PatientModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
