/*
 * @Author: yzy
 * @Date: 2025-08-19 21:45:37
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 10:27:15
 */
// src/app.module.ts
import { Module } from '@nestjs/common';

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
import { resolve } from 'path';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // 当 PM2 的 ecosystem.config.js 已经通过 env_file 注入了环境变量时，
      // 这里的 envFilePath 就可以移除。ConfigService 会直接从 process.env 读取。
      // 如果你希望ConfigService也有自己的加载逻辑作为备用，则可以保留它，
      // 但要确保路径是绝对的：envFilePath: resolve(process.cwd(), '.env'),
      // 为了简化和避免潜在冲突，这里推荐移除：
      envFilePath: resolve(process.cwd(), '.env'),
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
    // AuthModule,
    // PaymentsModule,
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
