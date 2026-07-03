import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';

import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { RentModule } from './modules/rent/rent.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { RoomsModule } from './modules/rooms/rooms.module';
import { AgreementsModule } from './modules/agreements/agreements.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
// import { UploadsModule } from './modules/uploads/uploads.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    ThrottlerModule.forRoot([
      { ttl: 60000, limit: 100 }, // 100 requests/min default
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    UsersModule,
    PropertiesModule,
    TenantsModule,
    RentModule,
    ComplaintsModule,
    RoomsModule,
    AgreementsModule,
    NotificationsModule,
    UploadsModule,
    HealthModule,
  ],
})
export class AppModule {}
