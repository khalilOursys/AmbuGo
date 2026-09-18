import { Module } from '@nestjs/common';
import { MissionService } from './mission.service';
import { MissionController } from './mission.controller';
import { PrismaService } from '../prisma.service';
import { RoutingService } from '../common/services/routing.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [MissionController],
  providers: [MissionService, RoutingService, PrismaService],
  exports: [MissionService],
})
export class MissionModule {}
