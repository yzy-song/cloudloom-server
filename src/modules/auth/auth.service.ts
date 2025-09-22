/*
 * @Author: yzy
 * @Date: 2025-08-23 03:56:23
 * @LastEditors: yzy
 * @LastEditTime: 2025-08-29 19:34:19
 */
import { Injectable, UnauthorizedException, ConflictException, Inject, Logger, ForbiddenException, NotFoundException } from '@nestjs/common';
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

import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../core/entities/role.entity';
import { UserRole } from '../../core/entities/user-role.entity';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private roleRepository: Repository<Role>,

    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,

    @Inject(CACHE_MANAGER) // ✅ 放在 cacheManager 前面
    private cacheManager: Cache,

    private jwtService: JwtService,
    private readonly configService: ConfigService
  ) {
    // 获取环境变量并立即打印它们
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

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

  // 1. 修改返回类型，让它和 login 方法一致
  async register(registerUserDto: RegisterUserDto): Promise<{ data: { accessToken: string; user: User }; message: string }> {
    const { username, email, password } = registerUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new ConflictException('Username or email already exists');
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepository.create({
      username,
      email,
      passwordHash: hashedPassword,
    });
    const savedUser = await this.usersRepository.save(newUser);

    const role = await this.roleRepository.findOne({ where: { name: 'customer' } });
    if (role) {
      await this.userRoleRepository.save({
        userId: savedUser.id,
        roleId: role.id,
      });
    }

    // 2. 为新创建的用户生成 accessToken
    const payload = { username: savedUser.username, sub: savedUser.id };
    const accessToken = this.jwtService.sign(payload);

    // 3. 移除返回对象中的 passwordHash
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...userToReturn } = savedUser;

    // 4. 返回和 login 接口一样的数据结构
    return {
      data: {
        accessToken,
        user: userToReturn as User,
      },
      message: 'Registration successful!',
    };
  }

  async login(loginUserDto: LoginUserDto): Promise<{ data: { accessToken: string; user: User }; message: string }> {
    try {
      const user = await this.validateUser(loginUserDto.identifier, loginUserDto.password);
      const payload = { username: user.username, sub: user.id };
      this.logger.log(`用户登录: ${user.username} (ID: ${user.username})`);
      return {
        data: {
          accessToken: this.jwtService.sign(payload),
          user: user,
        },
        message: 'Login successful!',
      };
    } catch (error) {
      // 直接抛出 validateUser 中的错误
      throw error;
    }
  }

  async validateUser(identifier: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({
      where: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      throw new NotFoundException('User not exist');
    }

    // 检查 passwordHash 是否存在且不为空
    if (!user.passwordHash) {
      // 如果 passwordHash 为空，说明是第三方注册用户
      throw new ForbiddenException('You seem to have registered via Google. Please use Google login method.');
    }

    // 正常进行密码比对
    const isPasswordMatching = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordMatching) {
      // 如果密码不匹配，则是真正的密码错误
      throw new UnauthorizedException('Incorrect password, please try again.');
    }

    // 验证成功，返回用户信息
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

  async oauthLogin(dto: OAuthLoginDto): Promise<{ data: { accessToken: string; user: User }; message: string }> {
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(dto.idToken);
    } catch (e) {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }

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
      });
      await this.usersRepository.save(user);
    }

    const payload = { username: user.username, sub: user.id };
    this.logger.log(`OAuth 用户登录: ${user.username} (ID: ${user.id})`);
    return {
      data: {
        accessToken: this.jwtService.sign(payload),
        user,
      },
      message: 'Login successful!',
    };
  }

  async getProfile(userId: string): Promise<{ data: User; message: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not exist');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, ...result } = user;
    return {
      data: result as User,
      message: 'Get user information successful!',
    };
  }
}
