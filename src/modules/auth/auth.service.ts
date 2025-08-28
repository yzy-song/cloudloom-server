/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:23
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-28 02:38:35
 */
import { Injectable, UnauthorizedException, ConflictException, Inject } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../core/entities/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { OAuthLoginDto } from './dto/oauth-login.dto';
import * as bcrypt from 'bcryptjs';
import { type Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

import { AppLogger } from '../../utils/logger';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,

    private jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly logger: AppLogger
  ) {
    this.logger.setContext(AuthService.name);

    // 获取环境变量并立即打印它们
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

    this.logger.log(`[DEBUG] process.env.FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID}`);
    this.logger.log(`[DEBUG] process.env.FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL}`);

    this.logger.log(`[Firebase Init] Project ID: ${projectId}`);
    this.logger.log(`[Firebase Init] Client Email: ${clientEmail}`);
    // 私钥可能很长，只打印开头一部分，避免日志过长或暴露过多敏感信息
    this.logger.log(`[Firebase Init] Private Key (first 50 chars): ${privateKey ? privateKey.substring(0, 50) + '...' : 'N/A'}`);

    if (!privateKey || !clientEmail || !projectId) {
      this.logger.error('Firebase Admin SDK: Missing or invalid environment variables for initialization!');
      // 抛出错误以停止应用，直到问题解决
      throw new Error('Firebase Admin SDK: Missing or invalid credentials (privateKey, clientEmail, projectId)');
    }

    // 用 ConfigService 初始化 firebase-admin
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          clientEmail: clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'), // 确保处理私钥中的换行符
        }),
      });
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { username, email, password } = registerUserDto;

    // 检查用户名或邮箱是否已存在
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 密码加密
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      username,
      email,
      passwordHash: hashedPassword,
    });

    return this.usersRepository.save(newUser);
  }

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; user: User }> {
    try {
      const user = await this.validateUser(loginUserDto.identifier, loginUserDto.password);
      const payload = { username: user.username, sub: user.id };
      this.logger.log(`用户登录: ${user.username} (ID: ${user.username})`);
      return {
        accessToken: this.jwtService.sign(payload),
        user: user, // 返回用户信息
      };
    } catch (error) {
      // 直接抛出 validateUser 中的错误
      throw error;
    }
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    let user: User | null = null;
    // 一次性查询用户（根据用户名或邮箱）
    user = await this.usersRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });

    // 如果用户不存在
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    // 用户存在但密码错误
    if (!(await bcrypt.compare(password, user.passwordHash))) {
      throw new UnauthorizedException('密码错误');
    }

    // 验证成功，返回用户信息（不包含密码）
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async addToBlacklist(token: string): Promise<void> {
    try {
      const decoded = this.jwtService.decode(token) as { exp: number };
      if (decoded && decoded.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await this.cacheManager.set(`blacklist:${token}`, '1', ttl * 1000);
        }
      }
    } catch (error) {
      throw new Error('Token 解析失败');
    }
  }

  async oauthLogin(dto: OAuthLoginDto): Promise<{ accessToken: string; user: User }> {
    this.logger.log(`开始 Firebase OAuth 登录: ${dto.idToken}`);
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(dto.idToken);
    } catch (e) {
      throw new UnauthorizedException('无效的 firebase token');
    }

    this.logger.log(`Firebase Token 验证成功: ${JSON.stringify(decoded)}`);

    // decoded.uid, decoded.email, decoded.name, decoded.picture
    let user = await this.usersRepository.findOne({
      where: [{ email: decoded.email }, { username: decoded.uid }],
    });

    if (!user) {
      // 自动注册
      user = this.usersRepository.create({
        username: decoded.uid,
        email: decoded.email,
        nickName: decoded.name,
        avatarUrl: decoded.picture,
        passwordHash: '', // 第三方登录用户不需要密码
        role: 'customer',
      });
      await this.usersRepository.save(user);
    }

    const payload = { username: user.username, sub: user.id };
    return {
      accessToken: this.jwtService.sign(payload),
      user,
    };
  }
}
