import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Module,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsEmail } from 'class-validator';

import { PrismaService } from '../../common/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

export class CreateTenantDto {
  @ApiProperty() @IsNumber() propertyId: number;
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() occupation?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() roomNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bedNumber?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() monthlyRent?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() securityDeposit?: number;
  @ApiProperty({ required: false }) @IsOptional() @IsString() moveInDate?: string;
}

@Injectable()
class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll(user: any, query: any) {
    const where: any = {};
    if (user.role === 'owner') where.ownerId = BigInt(user.id);
    if (query.status) where.status = query.status;
    if (query.kyc) where.kycStatus = query.kyc;
    if (query.q) {
      where.OR = [
        { name: { contains: query.q } },
        { phone: { contains: query.q } },
      ];
    }

    const page = +query.page || 1;
    const limit = Math.min(+query.limit || 20, 100);

    const [items, total] = await Promise.all([
      this.prisma.tenant.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.tenant.count({ where }),
    ]);

    return {
      items: this.serializeMany(items),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, user: any) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: BigInt(id) },
    });
    if (!tenant) throw new NotFoundException();
    if (user.role === 'owner' && tenant.ownerId !== BigInt(user.id)) {
      throw new ForbiddenException();
    }

    // Fetch related data separately (since no relations in schema)
    const [property, owner, documents, bills, complaints] = await Promise.all([
      this.prisma.property.findUnique({ where: { id: tenant.propertyId } }),
      this.prisma.user.findUnique({ where: { id: tenant.ownerId } }),
      this.prisma.tenantDocument.findMany({ where: { tenantId: tenant.id } }),
      this.prisma.rentBill.findMany({ where: { tenantId: tenant.id }, take: 10, orderBy: { createdAt: 'desc' } }),
      this.prisma.complaint.findMany({ where: { tenantId: tenant.id }, take: 10, orderBy: { createdAt: 'desc' } }),
    ]);

    return this.serialize({
      ...tenant,
      property,
      owner: owner ? { id: owner.id, name: owner.name } : null,
      documents,
      bills,
      complaints,
    });
  }

  async create(dto: CreateTenantDto, user: any) {
    const tenant = await this.prisma.tenant.create({
      data: {
        propertyId: BigInt(dto.propertyId),
        ownerId: BigInt(user.id),
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        occupation: dto.occupation,
        roomNumber: dto.roomNumber,
        bedNumber: dto.bedNumber,
        monthlyRent: dto.monthlyRent || 0,
        securityDeposit: dto.securityDeposit || 0,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : null,
      },
    });
    return this.serialize(tenant);
  }

  async update(id: string, dto: any, user: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: BigInt(id) } });
    if (!tenant) throw new NotFoundException();
    if (user.role === 'owner' && tenant.ownerId !== BigInt(user.id)) {
      throw new ForbiddenException();
    }
    const data: any = { ...dto };
    if (data.propertyId) data.propertyId = BigInt(data.propertyId);
    if (data.moveInDate) data.moveInDate = new Date(data.moveInDate);
    delete data.id;
    delete data.ownerId;

    const updated = await this.prisma.tenant.update({ where: { id: BigInt(id) }, data });
    return this.serialize(updated);
  }

  async approveKyc(id: string) {
    const t = await this.prisma.tenant.update({
      where: { id: BigInt(id) },
      data: { kycStatus: 'approved' },
    });
    return this.serialize(t);
  }

  async rejectKyc(id: string, remarks: string) {
    const t = await this.prisma.tenant.update({
      where: { id: BigInt(id) },
      data: { kycStatus: 'rejected', kycRemarks: remarks },
    });
    return this.serialize(t);
  }

  async remove(id: string, user: any) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: BigInt(id) } });
    if (!tenant) throw new NotFoundException();
    if (user.role === 'owner' && tenant.ownerId !== BigInt(user.id)) {
      throw new ForbiddenException();
    }
    await this.prisma.tenant.delete({ where: { id: BigInt(id) } });
    return { message: 'Deleted' };
  }

  private serialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return Number(obj);
    if (obj instanceof Date) return obj;
    if (Array.isArray(obj)) return obj.map((item) => this.serialize(item));
    if (typeof obj === 'object') {
      if (obj.constructor?.name === 'Decimal') return Number(obj);
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = this.serialize(obj[key]);
      }
      return result;
    }
    return obj;
  }

  private serializeMany(items: any[]): any[] {
    return items.map((i) => this.serialize(i));
  }
}

@ApiTags('Tenants')
@Controller('tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
class TenantsController {
  constructor(private service: TenantsService) {}

  @Get()
  @Roles('owner', 'admin')
  list(@CurrentUser() user: any, @Query() query: any) {
    return this.service.findAll(user, query);
  }

  @Get(':id')
  @Roles('owner', 'admin')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Post()
  @Roles('owner', 'admin')
  create(@Body() dto: CreateTenantDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Patch(':id')
  @Roles('owner', 'admin')
  update(
    @Param('id') id: string,
    @Body() dto: any,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Patch(':id/kyc/approve')
  @Roles('owner', 'admin')
  approveKyc(@Param('id') id: string) {
    return this.service.approveKyc(id);
  }

  @Patch(':id/kyc/reject')
  @Roles('owner', 'admin')
  rejectKyc(@Param('id') id: string, @Body('remarks') remarks: string) {
    return this.service.rejectKyc(id, remarks);
  }

  @Delete(':id')
  @Roles('owner', 'admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}

@Module({
  controllers: [TenantsController],
  providers: [TenantsService],
})
export class TenantsModule {}
