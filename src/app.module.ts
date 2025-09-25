/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-09-04 16:40:00
 */
// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './filters/all-exceptions.filter';

import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static'; // <-- 1. 导入 ServeStaticModule
import { join } from 'path'; // <-- 2. 导入 Node.js 的 path 模块
import { ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProductsModule } from './modules/products/products.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AuthModule } from './modules/auth/auth.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { CollaborationApplicationsModule } from './modules/collaboration-applications/collaboration-applications.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SurveyModule } from './modules/survey/survey.module';
import { UserFavoritesModule } from './modules/user-favorites/user-favorites.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { PhotosModule } from './modules/photos/photos.module';
import { AppLogger } from './utils/logger';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // 3. 在这里添加 ServeStaticModule 的配置
    ServeStaticModule.forRoot({
      // rootPath 指向的是你希望作为静态资源服务的文件夹
      // join(__dirname, '..', 'public') 会解析为项目根目录下的 'public' 文件夹
      rootPath: join(__dirname, '..', 'public'),
      // serveRoot 是 URL 的前缀。设置为 '/' 意味着 public 文件夹的根目录
      // 直接对应于应用的根 URL。例如，public/uploads/image.jpg
      // 可以通过 http://localhost:3000/uploads/image.jpg 访问。
      serveRoot: '/',
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
    AuthModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    PaymentsModule,
    ProductsModule,
    BookingsModule,
    NotificationsModule,
    CategoriesModule,
    CollaborationApplicationsModule,
    SurveyModule,
    UserFavoritesModule,
    UploadsModule,
    PhotosModule,
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: parseInt(configService.get('RATE_LIMIT_WINDOW') || '900'), // 每个IP15分钟内最多500次请求，单位：秒
            limit: parseInt(configService.get('RATE_LIMIT_MAX') || '500'),
          },
        ],
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    AppLogger,
  ],
})
export class AppModule {}
