import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import * as bcrypt from 'bcryptjs';
import { randomBytes, createHash } from 'crypto';

import { PrismaService } from '../../common/prisma.service';
import { RegisterDto, LoginDto, RefreshDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { phone: dto.phone }] },
    });
    if (exists) throw new ConflictException('Email or phone already exists');

    const hashedPassword = await argon2.hash(dto.password);

    // Role mapping (your DB uses "guest" instead of "user")
    let role: any = dto.role || 'guest';
    if (role === 'user') role = 'guest';

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role,
      },
    });

    const tokens = await this.generateTokens(Number(user.id), user.email, user.role);
    await this.saveRefreshToken(Number(user.id), tokens.refresh_token);

    return {
      user: this.sanitize(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: dto.email
        ? { email: dto.email }
        : { phone: dto.phone },
    });

    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.isActive) throw new UnauthorizedException('Account inactive');

    // Verify password — supports both Laravel bcrypt ($2y$) and argon2
    let valid = false;
    try {
      if (user.password.startsWith('$argon2')) {
        valid = await argon2.verify(user.password, dto.password);
      } else if (user.password.startsWith('$2y$') || user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // Laravel bcrypt support
        const normalized = user.password.replace('$2y$', '$2b$');
        valid = await bcrypt.compare(dto.password, normalized);
      }
    } catch (e) {
      valid = false;
    }

    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.generateTokens(Number(user.id), user.email, user.role);
    await this.saveRefreshToken(Number(user.id), tokens.refresh_token);

    return {
      user: this.sanitize(user),
      ...tokens,
    };
  }

  async refresh(dto: RefreshDto) {
    // Hash incoming token to compare with stored hash
    const tokenHash = createHash('sha256').update(dto.refresh_token).digest('hex');

    // Find session with this token (we store hashed in sessions.payload)
    // For now, use simple lookup via cache or in-memory; or simpler: use JWT for refresh too
    try {
      const payload: any = this.jwt.verify(dto.refresh_token, {
        secret: this.config.get('JWT_REFRESH_SECRET'),
      });
      const user = await this.prisma.user.findUnique({ where: { id: BigInt(payload.sub) } });
      if (!user || !user.isActive) throw new UnauthorizedException();
      const tokens = await this.generateTokens(Number(user.id), user.email, user.role);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    // Token will expire naturally via JWT
    return { message: 'Logged out' };
  }

  async me(userId: number | bigint) {
    const user = await this.prisma.user.findUnique({
      where: { id: BigInt(userId) },
    });
    if (!user) throw new UnauthorizedException();
    return this.sanitize(user);
  }

  // ============== Helpers ==============

  private async generateTokens(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    const access_token = await this.jwt.signAsync(payload);
    const refresh_token = await this.jwt.signAsync(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });
    return { access_token, refresh_token };
  }

  private async saveRefreshToken(userId: number, token: string) {
    // We use JWT for refresh tokens now (stateless), no DB save needed
    return;
  }

  private sanitize(user: any) {
    const { password, remember_token, ...rest } = user;
    // Convert BigInt to number for JSON
    if (rest.id) rest.id = Number(rest.id);
    return rest;
  }
}
