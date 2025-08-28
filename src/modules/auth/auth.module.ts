/*
 * @Author: yzy
 * @Date: 2025-08-23 03:55:58
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 12:59:36
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 引入 ConfigModule 和 ConfigService
// ✅ 导入 CacheModule
import { CacheModule } from '@nestjs/cache-manager';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../../core/entities/user.entity';
import { JwtStrategy } from './jwt.strategy';
@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule,
    // ✅ 确保这里是正确的异步配置
    JwtModule.registerAsync({
      imports: [ConfigModule], // ✅ 确保这里导入了 ConfigModule
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService], // ✅ 确保这里注入了 ConfigService
    }),
    // 你也可以将 ConfigModule 设为全局，但这在这里不是必须的
    ConfigModule,
    // ✅ 在这里添加 CacheModule
    CacheModule.register({
      ttl: 120 * 60 * 1000, // 缓存2小时，你可以根据需要调整
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
