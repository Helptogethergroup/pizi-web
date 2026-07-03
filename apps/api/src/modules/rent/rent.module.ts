import { Module, Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PrismaService } from '../../common/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Rent')
@Controller('rent')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
class RentController {
  constructor(private prisma: PrismaService) {}

  @Get()
  list(@CurrentUser() user: any) {
    return { message: 'Rent module — implement endpoints here', userId: user.id };
  }
}

@Module({
  controllers: [RentController],
})
export class RentModule {}
