import { Global, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { PrismaService } from '../prisma.service';

@Global()
@Module({
  controllers: [PermissionsController],
  providers: [PermissionsService, PrismaService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
