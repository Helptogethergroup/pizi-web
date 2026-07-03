import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Atul Sharma' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'atul@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '9758285929' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'StrongPass@123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    enum: ['admin', 'owner', 'telecaller', 'field_executive', 'seo_manager', 'guest'],
    required: false,
    default: 'guest',
  })
  @IsOptional()
  @IsEnum(['admin', 'owner', 'telecaller', 'field_executive', 'seo_manager', 'guest', 'user'])
  role?: 'admin' | 'owner' | 'telecaller' | 'field_executive' | 'seo_manager' | 'guest' | 'user';
}

export class LoginDto {
  @ApiProperty({ example: 'admin@pgfind.in', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.phone)
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '9758285929', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.email)
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RefreshDto {
  @ApiProperty()
  @IsString()
  refresh_token: string;
}
