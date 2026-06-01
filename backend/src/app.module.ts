import { AppController } from './app.controller';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Module } from '@nestjs/common';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AppController],
  providers: [PrismaService],
})
export class AppModule {}
