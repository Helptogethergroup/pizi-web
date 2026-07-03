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
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';

import { PrismaService } from '../../common/prisma.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

// ============ DTOs ============
export class CreatePropertyDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsNumber() cityId: number;
  @ApiProperty() @IsNumber() localityId: number;
  @ApiProperty() @IsString() addressLine: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() pincode?: string;
  @ApiProperty({ required: false, enum: ['pg', 'hostel', 'coliving', 'flatmate'] })
  @IsOptional() @IsEnum(['pg', 'hostel', 'coliving', 'flatmate'])
  propertyType?: any;
  @ApiProperty({ required: false, enum: ['male', 'female', 'unisex'] })
  @IsOptional() @IsEnum(['male', 'female', 'unisex'])
  gender?: any;
  @ApiProperty() @IsNumber() rent_min: number;
  @ApiProperty() @IsNumber() rent_max: number;
  @ApiProperty({ required: false }) @IsOptional() @IsNumber() securityDeposit?: number;
}

export class UpdatePropertyDto extends CreatePropertyDto {}

export class ListPropertiesDto {
  @IsOptional() @IsString() q?: string;
  @IsOptional() cityId?: any;
  @IsOptional() localityId?: any;
  @IsOptional() isVerified?: any;
  @IsOptional() isFeatured?: any;
  @IsOptional() page?: any;
  @IsOptional() limit?: any;
}

// ============ Service ============
@Injectable()
class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(q: ListPropertiesDto) {
    const page = +q.page || 1;
    const limit = Math.min(+q.limit || 20, 100);
    const skip = (page - 1) * limit;

    const where: any = { is_active: true };
    if (q.q) where.name = { contains: q.q };
    if (q.cityId) where.cityId = BigInt(+q.cityId);
    if (q.localityId) where.localityId = BigInt(+q.localityId);
    if (q.isVerified !== undefined) where.isVerified = q.isVerified === 'true' || q.isVerified === true;
    if (q.isFeatured !== undefined) where.isFeatured = q.isFeatured === 'true' || q.isFeatured === true;

    const [items, total] = await Promise.all([
      this.prisma.property.findMany({
        where,
        skip,
        take: limit,
        include: {
          city: true,
          locality: true,
          images: { orderBy: { display_order: 'asc' }, take: 5 },
          owner: { select: { id: true, name: true, phone: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
      }),
      this.prisma.property.count({ where }),
    ]);

    return {
      items: this.serializeMany(items),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    };
  }

  async findOne(idOrSlug: string) {
    let where: any;
    if (isNaN(+idOrSlug)) {
      where = { slug: idOrSlug };
    } else {
      where = { id: BigInt(idOrSlug) };
    }
    const property = await this.prisma.property.findUnique({
      where,
      include: {
        city: true,
        locality: true,
        owner: { select: { id: true, name: true, phone: true, email: true } },
        images: { orderBy: { display_order: 'asc' } },
        amenities: { include: { amenity: true } },
      },
    });
    if (!property) throw new NotFoundException('Property not found');
    return this.serialize(property);
  }

  async create(dto: CreatePropertyDto, ownerId: bigint) {
    const created = await this.prisma.property.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        cityId: BigInt(dto.cityId),
        localityId: BigInt(dto.localityId),
        addressLine: dto.addressLine,
        pincode: dto.pincode,
        propertyType: dto.propertyType || 'pg',
        gender: dto.gender || 'unisex',
        rent_min: dto.rent_min,
        rent_max: dto.rent_max,
        securityDeposit: dto.securityDeposit || 0,
        ownerId: ownerId,
      },
    });
    return this.serialize(created);
  }

  async update(id: string, dto: UpdatePropertyDto, user: any) {
    const property = await this.prisma.property.findUnique({ where: { id: BigInt(id) } });
    if (!property) throw new NotFoundException();
    if (property.ownerId !== BigInt(user.id) && user.role !== 'admin') {
      throw new NotFoundException();
    }
    const updated = await this.prisma.property.update({
      where: { id: BigInt(id) },
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        cityId: dto.cityId ? BigInt(dto.cityId) : undefined,
        localityId: dto.localityId ? BigInt(dto.localityId) : undefined,
        addressLine: dto.addressLine,
        pincode: dto.pincode,
        propertyType: dto.propertyType,
        gender: dto.gender,
        rent_min: dto.rent_min,
        rent_max: dto.rent_max,
        securityDeposit: dto.securityDeposit,
      },
    });
    return this.serialize(updated);
  }

  async remove(id: string, user: any) {
    const property = await this.prisma.property.findUnique({ where: { id: BigInt(id) } });
    if (!property) throw new NotFoundException();
    if (property.ownerId !== BigInt(user.id) && user.role !== 'admin') {
      throw new NotFoundException();
    }
    await this.prisma.property.delete({ where: { id: BigInt(id) } });
    return { message: 'Deleted' };
  }

  // Serialize BigInt and Decimal for JSON
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

// ============ Controller ============
@ApiTags('Properties')
@Controller('properties')
class PropertiesController {
  constructor(private service: PropertiesService) {}

  @Get()
  list(@Query() query: ListPropertiesDto) {
    return this.service.findAll(query);
  }

  @Get(':idOrSlug')
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.service.findOne(idOrSlug);
  }

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  create(@Body() dto: CreatePropertyDto, @CurrentUser() user: any) {
    return this.service.create(dto, BigInt(user.id));
  }

  @Patch(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('owner', 'admin')
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}

@Module({
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
