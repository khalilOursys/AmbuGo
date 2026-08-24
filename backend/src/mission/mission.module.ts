import { Module } from '@nestjs/common';
import { MissionService } from './mission.service';
import { MissionController } from './mission.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [MissionController],
  providers: [MissionService, PrismaService],
  exports: [MissionService],
})
export class MissionModule {}
