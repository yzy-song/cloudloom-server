/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-24 09:35:43
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
import { CategoriesModule } from './modules/categories/categories.module';
import { CollaborationApplicationsModule } from './modules/collaboration-applications/collaboration-applications.module'; // 导入新模块
import { User } from './core/entities/user.entity';
import { Booking } from './core/entities/booking.entity';
import { Product } from './core/entities/product.entity';
import { Category } from './core/entities/category.entity';
import { CollaborationApplication } from './core/entities/collaboration-application.entity'; // 导入新实体
// import { UserFavorite } from './core/entities/user-favorite.entity';
// import { RentalPeriod } from './core/entities/rental-period.entity';
// import { ProductRentalPeriod } from './core/entities/product-rental-period.entity';
import { LoggerModule } from './utils/logger.module';
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
        synchronize: configService.get('NODE_ENV') === 'development', // 生产环境必须禁用
        migrationsRun: configService.get('NODE_ENV') !== 'development',
      }),
      inject: [ConfigService],
    }),
    LoggerModule,
    AuthModule,
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
