import { Controller, Get, Module } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma.service';

@ApiTags('Health')
@Controller('health')
class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    let dbOk = false;
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {}

    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      database: dbOk ? 'connected' : 'disconnected',
      environment: process.env.NODE_ENV,
    };
  }
}

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
