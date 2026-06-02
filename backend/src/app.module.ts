import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [AuthModule, UsersModule, VehiclesModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
