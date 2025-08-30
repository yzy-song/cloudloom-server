/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-30 09:58:23
 */
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CollaborationApplicationsModule } from './modules/collaboration-applications/collaboration-applications.module'; // 导入新模块
import { LoggerModule } from './utils/logger.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/core/entities/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNCHRONIZE') === 'true',
        migrationsRun: configService.get('NODE_ENV') !== 'development',
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PaymentsModule,
    ProductsModule,
    BookingsModule,
    NotificationsModule,
    CategoriesModule,
    CollaborationApplicationsModule, // 添加新模块
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
